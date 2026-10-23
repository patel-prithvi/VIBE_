import SkillVerificationTask from "../models/SkillVerificationTask.js";
import SkillVerificationAttempt from "../models/SkillVerificationAttempt.js";
import SkillVerificationReview from "../models/SkillVerificationReview.js";
import MentorWorkload from "../models/MentorWorkload.js";
import { User } from "../models/Users.js";
import Profile from "../models/Profile.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Ensure mentor workload record exists
const getOrCreateMentorWorkload = async (mentorId) => {
  let workload = await MentorWorkload.findOne({ mentorId });
  if (!workload) {
    workload = await MentorWorkload.create({
      mentorId,
      activePendingReviews: 0,
      totalCompletedReviews: 0,
      isAvailable: true,
    });
  }
  return workload;
};

// Helper: Select an active task for student avoiding previously attempted tasks
const selectTaskForStudent = async (studentId, skillName, difficulty) => {
  // Normalize skill name search (case-insensitive regex)
  const regex = new RegExp(`^${skillName.trim()}$`, "i");

  // 1. Find all past attempts for this student and skill
  const pastAttempts = await SkillVerificationAttempt.find({
    studentId,
    skillName: { $regex: regex },
  }).select("taskId");

  const attemptedTaskIds = pastAttempts.map((a) => a.taskId);

  // 2. Query available tasks matching skill & difficulty excluding past tasks
  let eligibleTasks = await SkillVerificationTask.find({
    skillName: { $regex: regex },
    difficulty,
    isActive: true,
    _id: { $nin: attemptedTaskIds },
  });

  // 3. Fallback: If student has attempted all tasks, select from all active tasks in that pool
  if (eligibleTasks.length === 0) {
    eligibleTasks = await SkillVerificationTask.find({
      skillName: { $regex: regex },
      difficulty,
      isActive: true,
    });
  }

  // 4. Fallback: If no task matches exact skill name, find general category task
  if (eligibleTasks.length === 0) {
    eligibleTasks = await SkillVerificationTask.find({
      difficulty,
      isActive: true,
    });
  }

  if (eligibleTasks.length === 0) {
    throw new ApiError(404, `No active tasks found in the task bank for ${skillName} (${difficulty})`);
  }

  // Pick one randomly
  const randomIndex = Math.floor(Math.random() * eligibleTasks.length);
  return eligibleTasks[randomIndex];
};

// Helper: General Balanced Distribution Mentor Assignment
const assignMentorToSubmission = async (attemptId, studentId, skillName) => {
  // 1. Find all eligible mentors (accountType faculty or industry expert, excluding student)
  const mentors = await User.find({
    accountType: { $in: ["faculty", "industry expert"] },
    _id: { $ne: studentId },
  }).select("_id name email accountType");

  if (!mentors || mentors.length === 0) {
    console.warn("⚠️ No eligible mentors found in system for auto-assignment.");
    return null;
  }

  // 2. Retrieve or initialize workload for each mentor
  const mentorWorkloads = await Promise.all(
    mentors.map(async (m) => {
      const workload = await getOrCreateMentorWorkload(m._id);
      return {
        mentor: m,
        workload,
        load: workload.activePendingReviews || 0,
        isAvailable: workload.isAvailable !== false,
      };
    })
  );

  // Filter available mentors
  const availableMentors = mentorWorkloads.filter((m) => m.isAvailable);
  const candidates = availableMentors.length > 0 ? availableMentors : mentorWorkloads;

  // 3. Find minimum active review count
  let minLoad = Infinity;
  for (const item of candidates) {
    if (item.load < minLoad) {
      minLoad = item.load;
    }
  }

  // 4. Gather all mentors tied for minimum load (balanced distribution pool)
  const minLoadPool = candidates.filter((item) => item.load === minLoad);

  // 5. Randomly select from the min-load pool
  const chosenIndex = Math.floor(Math.random() * minLoadPool.length);
  const selectedMentor = minLoadPool[chosenIndex];

  // 6. Atomically increment mentor's active workload
  await MentorWorkload.findOneAndUpdate(
    { mentorId: selectedMentor.mentor._id },
    {
      $inc: { activePendingReviews: 1 },
      $set: { lastAssignedAt: new Date() },
    },
    { upsert: true }
  );

  // 7. Update attempt with mentor assignment and 72-hour SLA deadline
  const reviewDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  await SkillVerificationAttempt.findByIdAndUpdate(attemptId, {
    assignedMentorId: selectedMentor.mentor._id,
    assignedAt: new Date(),
    reviewDeadline,
    status: "under_review",
  });

  // 8. Double-blind notification to assigned mentor (DO NOT disclose student name)
  await Notification.create({
    recipient: selectedMentor.mentor._id,
    sender: null, // Double blind
    type: "submission_received",
    title: "New Skill Verification Assignment",
    message: `You have been assigned an anonymous candidate submission for ${skillName} to review.`,
    link: "/dashboard/faculty?tab=skill-verifications",
    meta: { attemptId },
  });

  return selectedMentor.mentor._id;
};

// ==========================================
// 1. Request Skill Verification (Assign Task)
// ==========================================
export const requestSkillTask = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { skillName, difficulty = "Intermediate" } = req.body;

  if (!skillName || !skillName.trim()) {
    throw new ApiError(400, "Skill name is required");
  }

  const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
  const selectedDifficulty = validDifficulties.includes(difficulty) ? difficulty : "Intermediate";

  // Check if student already has an active verification attempt for this skill
  const activeAttempt = await SkillVerificationAttempt.findOne({
    studentId,
    skillName: { $regex: new RegExp(`^${skillName.trim()}$`, "i") },
    status: { $in: ["assigned", "submitted", "under_review"] },
  }).populate("taskId");

  if (activeAttempt) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          attemptId: activeAttempt._id,
          skillName: activeAttempt.skillName,
          difficulty: activeAttempt.difficulty,
          status: activeAttempt.status,
          task: activeAttempt.taskId,
          expiresAt: activeAttempt.expiresAt,
          submissionData: activeAttempt.submissionData,
        },
        "Active verification task already in progress for this skill"
      )
    );
  }

  // Select task avoiding repetition
  const task = await selectTaskForStudent(studentId, skillName, selectedDifficulty);

  // Expiration: 7 days to complete task
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const attempt = await SkillVerificationAttempt.create({
    studentId,
    skillName: skillName.trim(),
    difficulty: selectedDifficulty,
    taskId: task._id,
    status: "assigned",
    expiresAt,
  });

  // Ensure skill is registered in student's Profile with verified: false
  if (req.user.Profile) {
    const profile = await Profile.findById(req.user.Profile);
    if (profile) {
      const existingSkill = profile.skills.find(
        (s) => s.name.toLowerCase() === skillName.trim().toLowerCase()
      );
      if (!existingSkill) {
        profile.skills.push({
          name: skillName.trim(),
          category: task.category || "Technical",
          level: selectedDifficulty,
          score: 0,
          verified: false,
        });
        await profile.save();
      }
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        attemptId: attempt._id,
        skillName: attempt.skillName,
        difficulty: attempt.difficulty,
        status: attempt.status,
        task: {
          _id: task._id,
          title: task.title,
          problemStatement: task.problemStatement,
          requirements: task.requirements,
          starterRepositoryUrl: task.starterRepositoryUrl,
          rubric: task.rubric,
          estimatedTimeHours: task.estimatedTimeHours,
        },
        expiresAt: attempt.expiresAt,
      },
      "Skill verification task assigned successfully"
    )
  );
});

// ==========================================
// 2. Submit Task Deliverable
// ==========================================
export const submitSkillTask = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { attemptId } = req.params;
  const { repoUrl, liveDemoUrl, notes } = req.body;

  if (!repoUrl || !repoUrl.trim()) {
    throw new ApiError(400, "Repository URL (GitHub/GitLab) is required for verification");
  }

  // Verification check: valid URL
  try {
    const parsed = new URL(repoUrl.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error();
    }
  } catch {
    throw new ApiError(400, "Please provide a valid HTTPS repository URL");
  }

  if (liveDemoUrl && liveDemoUrl.trim()) {
    try {
      const parsed = new URL(liveDemoUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      throw new ApiError(400, "Please provide a valid HTTPS live demo URL");
    }
  }

  const attempt = await SkillVerificationAttempt.findOne({
    _id: attemptId,
    studentId,
  }).populate("taskId");

  if (!attempt) {
    throw new ApiError(404, "Verification attempt not found or unauthorized");
  }

  if (attempt.status !== "assigned") {
    throw new ApiError(400, `Task cannot be submitted because it is currently '${attempt.status}'`);
  }

  // Save submission data
  attempt.submissionData = {
    repoUrl: repoUrl.trim(),
    liveDemoUrl: liveDemoUrl ? liveDemoUrl.trim() : "",
    notes: notes ? notes.trim() : "",
    submittedAt: new Date(),
  };
  attempt.status = "submitted";
  await attempt.save();

  // Assign to mentor via General Balanced Distribution
  const assignedMentorId = await assignMentorToSubmission(
    attempt._id,
    studentId,
    attempt.skillName
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        skillName: attempt.skillName,
        status: assignedMentorId ? "under_review" : "submitted",
        submittedAt: attempt.submissionData.submittedAt,
        message: "Deliverable submitted. Routed for double-blind mentor evaluation.",
      },
      "Deliverable submitted successfully"
    )
  );
});

// ==========================================
// 3. Get Student Active Verification Tasks
// ==========================================
export const getStudentActiveTasks = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const attempts = await SkillVerificationAttempt.find({
    studentId,
  })
    .populate("taskId")
    .populate("reviewResult")
    .sort({ createdAt: -1 });

  // DOUBLE BLIND: Do not leak mentor identity in response
  const sanitizedAttempts = attempts.map((a) => ({
    attemptId: a._id,
    skillName: a.skillName,
    difficulty: a.difficulty,
    status: a.status,
    task: a.taskId,
    submissionData: a.submissionData,
    assignedAt: a.assignedAt,
    reviewDeadline: a.reviewDeadline,
    expiresAt: a.expiresAt,
    review: a.reviewResult
      ? {
          score: a.reviewResult.score,
          decision: a.reviewResult.decision,
          pros: a.reviewResult.pros,
          cons: a.reviewResult.cons,
          feedbackComments: a.reviewResult.feedbackComments,
          reviewedAt: a.reviewResult.reviewedAt,
          reviewerRole: "Verified Faculty Mentor", // Double blind placeholder
        }
      : null,
  }));

  return res.status(200).json(
    new ApiResponse(200, sanitizedAttempts, "Student verification tasks retrieved successfully")
  );
});

// ==========================================
// 4. Mentor: Get Assigned Review Queue (Double Blind)
// ==========================================
export const getMentorReviewQueue = asyncHandler(async (req, res) => {
  const mentorId = req.user._id;

  if (!["faculty", "industry expert"].includes(req.user.accountType)) {
    throw new ApiError(403, "Access restricted to faculty and industry mentors");
  }

  const pendingAttempts = await SkillVerificationAttempt.find({
    assignedMentorId: mentorId,
    status: "under_review",
  })
    .populate("taskId")
    .sort({ assignedAt: 1 });

  // DOUBLE BLIND ENFORCEMENT:
  // Do NOT return student name, email, avatar, or student ID!
  // Return an anonymous candidate code: e.g. "Candidate #A49F"
  const sanitizedQueue = pendingAttempts.map((attempt) => ({
    attemptId: attempt._id,
    candidateCode: `Candidate #${attempt._id.toString().slice(-4).toUpperCase()}`,
    skillName: attempt.skillName,
    difficulty: attempt.difficulty,
    task: {
      title: attempt.taskId?.title,
      problemStatement: attempt.taskId?.problemStatement,
      requirements: attempt.taskId?.requirements || [],
      rubric: attempt.taskId?.rubric || [],
      starterRepositoryUrl: attempt.taskId?.starterRepositoryUrl,
    },
    submissionData: attempt.submissionData,
    assignedAt: attempt.assignedAt,
    reviewDeadline: attempt.reviewDeadline,
  }));

  const workload = await getOrCreateMentorWorkload(mentorId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPending: sanitizedQueue.length,
        activeWorkload: workload.activePendingReviews,
        queue: sanitizedQueue,
      },
      "Mentor review queue retrieved successfully (Double Blind)"
    )
  );
});

// ==========================================
// 5. Mentor: Evaluate Task (Pass Mark >= 70%)
// ==========================================
export const evaluateSkillTask = asyncHandler(async (req, res) => {
  const mentorId = req.user._id;
  const { attemptId } = req.params;
  const { score, pros = [], cons = [], feedbackComments = "" } = req.body;

  if (score === undefined || score === null || isNaN(score)) {
    throw new ApiError(400, "A numerical score (0 to 100) is required");
  }

  const numericScore = Math.min(100, Math.max(0, Number(score)));

  // PASSING 70 PERCENT RULE:
  // Score >= 70 is APPROVED. Score < 70 is REJECTED.
  const decision = numericScore >= 70 ? "approved" : "rejected";

  const attempt = await SkillVerificationAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, "Verification attempt not found");
  }

  // Security Verification check: Only assigned mentor can evaluate
  if (attempt.assignedMentorId?.toString() !== mentorId.toString()) {
    throw new ApiError(403, "Unauthorized: You are not the assigned mentor for this submission");
  }

  if (attempt.status !== "under_review") {
    throw new ApiError(400, `This attempt has already been evaluated or is in '${attempt.status}' state`);
  }

  // Format pros and cons as sanitized string arrays
  const formattedPros = Array.isArray(pros)
    ? pros.filter((p) => typeof p === "string" && p.trim().length > 0).map((p) => p.trim())
    : [];

  const formattedCons = Array.isArray(cons)
    ? cons.filter((c) => typeof c === "string" && c.trim().length > 0).map((c) => c.trim())
    : [];

  // Create review record
  const review = await SkillVerificationReview.create({
    attemptId: attempt._id,
    mentorId,
    decision,
    score: numericScore,
    pros: formattedPros,
    cons: formattedCons,
    feedbackComments: feedbackComments ? feedbackComments.trim() : "",
    reviewedAt: new Date(),
  });

  // Update attempt status
  attempt.status = decision;
  attempt.reviewResult = review._id;
  await attempt.save();

  // Atomically decrement mentor's active workload
  await MentorWorkload.findOneAndUpdate(
    { mentorId },
    {
      $inc: {
        activePendingReviews: -1,
        totalCompletedReviews: 1,
      },
    }
  );

  // If approved: Update student's Profile with verified: true and score
  const student = await User.findById(attempt.studentId).populate("Profile");
  if (student && student.Profile) {
    const profile = await Profile.findById(student.Profile);
    if (profile && Array.isArray(profile.skills)) {
      const skillIdx = profile.skills.findIndex(
        (s) => s.name.toLowerCase() === attempt.skillName.toLowerCase()
      );

      if (skillIdx !== -1) {
        if (decision === "approved") {
          profile.skills[skillIdx].verified = true;
          profile.skills[skillIdx].score = numericScore;
          profile.skills[skillIdx].level = attempt.difficulty;
        }
      } else if (decision === "approved") {
        profile.skills.push({
          name: attempt.skillName,
          category: "Technical",
          level: attempt.difficulty,
          score: numericScore,
          verified: true,
        });
      }
      await profile.save();
    }
  }

  // Send double-blind notification to student
  const outcomeText =
    decision === "approved"
      ? `Congratulations! Your submission for "${attempt.skillName}" was evaluated with a passing score of ${numericScore}%! The skill is now verified on your Virtual CV.`
      : `Your submission for "${attempt.skillName}" received a score of ${numericScore}%. You need at least 70% to verify. Check your mentor's feedback to practice and retry.`;

  await Notification.create({
    recipient: attempt.studentId,
    sender: null, // Double blind
    type: "submission_reviewed",
    title: decision === "approved" ? "Skill Verified! 🎉" : "Skill Submission Feedback",
    message: outcomeText,
    link: "/dashboard/student?view=cv",
    meta: {
      attemptId: attempt._id,
      skillName: attempt.skillName,
      decision,
      score: numericScore,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        decision,
        score: numericScore,
        passingThreshold: 70,
        isApproved: decision === "approved",
      },
      `Review recorded successfully. Outcome: ${decision.toUpperCase()} (${numericScore}%)`
    )
  );
});
