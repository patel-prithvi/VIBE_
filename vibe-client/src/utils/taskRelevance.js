/**
 * Client-side Task Relevance & Recommendation Utilities
 * 
 * Provides skill normalization, explainable relevance scoring,
 * and deterministic continuous-feed task sorting for VIBE TaskMania.
 */

export const SKILL_ALIASES = {
  // Languages
  "js": "javascript",
  "javascript": "javascript",
  "ts": "typescript",
  "typescript": "typescript",
  "py": "python",
  "python": "python",
  "java": "java",
  "c++": "cpp",
  "cpp": "cpp",
  "c#": "csharp",
  "csharp": "csharp",
  "rb": "ruby",
  "ruby": "ruby",
  "php": "php",
  "golang": "go",
  "go": "go",
  "rust": "rust",
  "swift": "swift",
  "kotlin": "kotlin",
  "dart": "dart",

  // Frontend
  "react": "react",
  "react.js": "react",
  "reactjs": "react",
  "react native": "react native",
  "vue": "vue",
  "vue.js": "vue",
  "vuejs": "vue",
  "angular": "angular",
  "angular.js": "angular",
  "angularjs": "angular",
  "next": "nextjs",
  "next.js": "nextjs",
  "nextjs": "nextjs",
  "nuxt": "nuxtjs",
  "nuxt.js": "nuxtjs",
  "svelte": "svelte",
  "html": "html",
  "html5": "html",
  "css": "css",
  "css3": "css",
  "tailwind": "tailwindcss",
  "tailwindcss": "tailwindcss",
  "tailwind css": "tailwindcss",
  "bootstrap": "bootstrap",
  "sass": "sass",
  "scss": "sass",

  // Backend
  "node": "nodejs",
  "node.js": "nodejs",
  "nodejs": "nodejs",
  "express": "express",
  "express.js": "express",
  "expressjs": "express",
  "nest": "nestjs",
  "nest.js": "nestjs",
  "nestjs": "nestjs",
  "django": "django",
  "flask": "flask",
  "fastapi": "fastapi",
  "fast api": "fastapi",
  "spring": "spring boot",
  "spring boot": "spring boot",
  "springboot": "spring boot",
  "asp.net": "asp.net",
  "laravel": "laravel",

  // Databases & Storage
  "mongo": "mongodb",
  "mongodb": "mongodb",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "psql": "postgresql",
  "sql": "sql",
  "mysql": "mysql",
  "sqlite": "sqlite",
  "redis": "redis",
  "dynamodb": "dynamodb",
  "cassandra": "cassandra",

  // APIs & Architecture
  "rest": "rest api",
  "rest api": "rest api",
  "rest apis": "rest api",
  "restful": "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",
  "graphql": "graphql",
  "grpc": "grpc",
  "websocket": "websockets",
  "websockets": "websockets",
  "microservices": "microservices",

  // Data, AI & ML
  "data analysis": "data analysis",
  "pandas": "pandas",
  "numpy": "numpy",
  "scikit-learn": "scikit-learn",
  "scikit learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "pytorch": "pytorch",
  "tensorflow": "tensorflow",
  "keras": "keras",
  "ml": "machine learning",
  "machine learning": "machine learning",
  "ai": "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  "nlp": "nlp",
  "natural language processing": "nlp",
  "llm": "llms",
  "llms": "llms",
  "large language models": "llms",
  "embedding": "embeddings",
  "embeddings": "embeddings",
  "rag": "rag",

  // DevOps & Tools
  "docker": "docker",
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",
  "aws": "aws",
  "azure": "azure",
  "gcp": "gcp",
  "git": "git",
  "github": "github",
  "ci/cd": "ci/cd",
  "linux": "linux",
};

export const COMPOSITE_STACKS = {
  "mern": ["mongodb", "express", "react", "nodejs"],
  "mean": ["mongodb", "express", "angular", "nodejs"],
  "mevn": ["mongodb", "express", "vue", "nodejs"],
  "lamp": ["linux", "apache", "mysql", "php"],
};

/**
 * Normalizes a raw skill string.
 */
export const normalizeSkill = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  const lower = raw.toLowerCase().trim();
  if (SKILL_ALIASES[lower]) return SKILL_ALIASES[lower];

  const cleaned = lower.replace(/[\._\-]/g, " ").replace(/\s+/g, " ").trim();
  return SKILL_ALIASES[cleaned] || cleaned;
};

/**
 * Normalizes and extracts task deadline timestamp in milliseconds.
 * If date-only string or stored as midnight UTC, preserves full day until 23:59:59.999.
 */
export const getTaskDeadlineTs = (task) => {
  if (!task) return Infinity;
  const rawDate = task.lastDateToSubmit || task.deadlineRaw || task.deadline;
  if (!rawDate) return Infinity;

  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return Infinity;

  const isMidnight =
    (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) ||
    (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0);

  if (isMidnight) {
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime();
  }

  return d.getTime();
};

/**
 * Checks whether a task's deadline has passed.
 */
export const isTaskExpired = (task) => {
  const ts = getTaskDeadlineTs(task);
  if (ts === Infinity) return false;
  return Date.now() > ts;
};

/**
 * Deterministically sorts a task list in a single continuous feed:
 * 1. Active tasks appear first, expired tasks appear last.
 * 2. Strong matches (score DESC)
 * 3. Partial matches (score DESC)
 * 4. All remaining eligible tasks (zero score)
 * 
 * Ties resolved by:
 * - Matched skills count DESC
 * - Upcoming active deadline (sooner active deadline first)
 * - Deterministic Task ID comparison
 */
export const sortTasksByRelevance = (taskList) => {
  if (!Array.isArray(taskList)) return [];

  return [...taskList].sort((a, b) => {
    // 0. Active, non-expired tasks must always appear before expired tasks
    const isAExpired = isTaskExpired(a);
    const isBExpired = isTaskExpired(b);
    if (!isAExpired && isBExpired) return -1;
    if (isAExpired && !isBExpired) return 1;

    const scoreA = typeof a.matchScore === "number" ? a.matchScore : 0;
    const scoreB = typeof b.matchScore === "number" ? b.matchScore : 0;

    // 1. Primary: Match score DESC
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 2. Secondary: Matched skill count DESC
    const countA = Array.isArray(a.matchedSkills) ? a.matchedSkills.length : 0;
    const countB = Array.isArray(b.matchedSkills) ? b.matchedSkills.length : 0;
    if (countB !== countA) {
      return countB - countA;
    }

    // 3. Upcoming deadline for tasks
    const tsA = getTaskDeadlineTs(a);
    const tsB = getTaskDeadlineTs(b);

    if (tsA !== tsB) {
      return tsA - tsB; // Sooner deadline ranks higher
    }

    // 4. Stable ID tie-breaker
    const idA = String(a.id || a._id || "");
    const idB = String(b.id || b._id || "");
    return idA.localeCompare(idB);
  });
};

/**
 * Combines student's manually saved order with skill-based recommendation:
 * Strict rule:
 * 1. Active, non-expired tasks appear first.
 * 2. Expired tasks appear after all active tasks.
 * 3. Within each group, student's saved manual order is strictly preserved.
 * 4. Any unranked tasks are sorted by skill relevance and placed seamlessly after.
 */
export const orderTasksWithFallback = (taskList, manualOrderIds = []) => {
  if (!Array.isArray(taskList)) return [];

  // Partition into active and expired groups
  const activeTasks = taskList.filter((t) => !isTaskExpired(t));
  const expiredTasks = taskList.filter((t) => isTaskExpired(t));

  const sortGroup = (group) => {
    if (!Array.isArray(group) || group.length === 0) return [];
    if (!Array.isArray(manualOrderIds) || manualOrderIds.length === 0) {
      return sortTasksByRelevance(group);
    }

    const orderMap = new Map();
    manualOrderIds.forEach((id, idx) => {
      orderMap.set(String(id), idx);
    });

    const explicitlyOrdered = [];
    const unranked = [];

    group.forEach((task) => {
      const taskId = String(task.id || task._id);
      if (orderMap.has(taskId)) {
        explicitlyOrdered.push(task);
      } else {
        unranked.push(task);
      }
    });

    explicitlyOrdered.sort((a, b) => {
      const idA = String(a.id || a._id);
      const idB = String(b.id || b._id);
      return orderMap.get(idA) - orderMap.get(idB);
    });

    const sortedUnranked = sortTasksByRelevance(unranked);
    return [...explicitlyOrdered, ...sortedUnranked];
  };

  const orderedActive = sortGroup(activeTasks);
  const orderedExpired = sortGroup(expiredTasks);

  return [...orderedActive, ...orderedExpired];
};

export default {
  normalizeSkill,
  getTaskDeadlineTs,
  isTaskExpired,
  sortTasksByRelevance,
  orderTasksWithFallback,
};
