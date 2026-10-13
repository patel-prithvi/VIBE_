# Student Dashboard Backend Integration Guide

## Overview
This document outlines the backend integration requirements and API specifications for the Student Dashboard. It covers all necessary endpoints, data models, authentication, and real-time features needed to support the full functionality of the student experience.

## Authentication & Authorization

### JWT Token Structure
```javascript
{
  "user": {
    "id": "student_123",
    "email": "student@university.edu",
    "role": "student",
    "name": "Parth Patel",
    "avatar": "https://cdn.example.com/avatars/student_123.jpg",
    "university": "IIT Mumbai",
    "course": "Computer Science",
    "year": 3,
    "verified": true
  },
  "permissions": ["read:posts", "write:posts", "apply:tasks", "manage:profile"],
  "exp": 1640995200,
  "iat": 1640908800
}
```

### Protected Routes
- All dashboard endpoints require valid JWT token
- Role-based access control for student-specific features
- Session management with refresh token mechanism

## API Endpoints

### 1. User Profile Management

#### Get Student Profile
```http
GET /api/v1/students/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "student_123",
    "name": "Parth Patel",
    "email": "student@university.edu",
    "avatar": "https://cdn.example.com/avatars/student_123.jpg",
    "university": "IIT Mumbai",
    "course": "Computer Science",
    "year": 3,
    "bio": "Passionate about web development and AI",
    "skills": ["React", "Node.js", "Python", "Machine Learning"],
    "interests": ["Web Development", "AI/ML", "Open Source"],
    "social_links": {
      "github": "https://github.com/parthpatel",
      "linkedin": "https://linkedin.com/in/parthpatel",
      "portfolio": "https://parthpatel.dev"
    },
    "achievements": [
      {
        "title": "Hackathon Winner",
        "description": "Won first place in university hackathon",
        "date": "2024-03-15",
        "certificate_url": "https://certificates.example.com/hack2024.pdf"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### Update Student Profile
```http
PUT /api/v1/students/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Parth Patel",
  "bio": "Updated bio description",
  "skills": ["React", "Node.js", "Python", "Machine Learning", "Docker"],
  "interests": ["Web Development", "AI/ML", "Open Source", "DevOps"],
  "social_links": {
    "github": "https://github.com/parthpatel",
    "linkedin": "https://linkedin.com/in/parthpatel",
    "portfolio": "https://parthpatel.dev"
  }
}
```

### 2. Community Posts System

#### Get Community Posts
```http
GET /api/v1/posts?page=1&limit=10&category=all&sort=recent
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 10, max: 50)
- `category`: Filter by category (all, doubt-sharing, knowledge-base, inspiration)
- `sort`: Sort order (recent, popular, trending)
- `author_role`: Filter by author role (student, faculty, industry)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_456",
        "title": "How to optimize React re-renders?",
        "content": "I'm working on a dashboard with multiple components...",
        "category": "doubt-sharing",
        "author": {
          "id": "student_789",
          "name": "Riya Sharma",
          "role": "student",
          "avatar": "https://cdn.example.com/avatars/student_789.jpg",
          "university": "NIT Delhi"
        },
        "created_at": "2024-01-20T08:30:00Z",
        "updated_at": "2024-01-20T08:30:00Z",
        "stats": {
          "vibe_count": 24,
          "comment_count": 8,
          "view_count": 156
        },
        "user_interactions": {
          "has_vibed": false,
          "has_commented": false,
          "has_bookmarked": true
        },
        "tags": ["react", "performance", "optimization"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_posts": 47,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Create New Post
```http
POST /api/v1/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My journey learning TypeScript",
  "content": "After 3 months of using TypeScript in my projects...",
  "category": "knowledge-base",
  "tags": ["typescript", "javascript", "learning"],
  "attachments": [
    {
      "type": "image",
      "url": "https://cdn.example.com/uploads/screenshot.png",
      "caption": "TypeScript configuration example"
    }
  ]
}
```

#### Get Post Comments
```http
GET /api/v1/posts/{post_id}/comments?page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "content": "Great question! useMemo is perfect for expensive calculations...",
        "author": {
          "id": "faculty_456",
          "name": "Dr. Anjali Sharma",
          "role": "faculty",
          "avatar": "https://cdn.example.com/avatars/faculty_456.jpg",
          "department": "Computer Science"
        },
        "created_at": "2024-01-20T09:15:00Z",
        "stats": {
          "like_count": 5,
          "reply_count": 2
        },
        "user_interactions": {
          "has_liked": true
        },
        "replies": [
          {
            "id": "reply_789",
            "content": "Thanks for the explanation!",
            "author": {
              "id": "student_123",
              "name": "Parth Patel",
              "role": "student"
            },
            "created_at": "2024-01-20T09:30:00Z"
          }
        ]
      }
    ]
  }
}
```

#### Add Comment to Post
```http
POST /api/v1/posts/{post_id}/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "This is really helpful! Thanks for sharing.",
  "parent_comment_id": null // For replies, include parent comment ID
}
```

#### Toggle Post Vibe (Like)
```http
POST /api/v1/posts/{post_id}/vibe
Authorization: Bearer <jwt_token>
```

### 3. TaskMania System

#### Get Available Tasks
```http
GET /api/v1/tasks?page=1&limit=12&category=all&type=all&payment=all&sort=recent
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `category`: Filter by category (development, design, research, marketing)
- `type`: Filter by work type (remote, hybrid, onsite)
- `payment`: Filter by payment (paid, unpaid, stipend)
- `skills`: Filter by required skills (comma-separated)
- `company`: Filter by company name
- `deadline`: Filter by deadline (upcoming, this-week, this-month)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_789",
        "title": "Build a Real-Time Analytics Dashboard",
        "description": "Create a responsive analytics dashboard...",
        "category": "development",
        "company": {
          "id": "company_123",
          "name": "DataSphere Analytics",
          "logo": "https://cdn.example.com/logos/datasphere.png",
          "industry": "Technology"
        },
        "role": "Frontend Developer Intern",
        "location": "Remote",
        "type": "remote",
        "payment": "paid",
        "compensation": {
          "amount": 15000,
          "currency": "INR",
          "type": "fixed"
        },
        "skills_required": ["React", "TypeScript", "Charts.js", "WebSocket"],
        "perks": ["Certificate", "Mentorship", "Potential Full-time Offer"],
        "deadline": "2025-02-15T23:59:59Z",
        "duration": "4-6 weeks",
        "difficulty": "intermediate",
        "applicants_count": 24,
        "max_applicants": 50,
        "status": "active",
        "created_at": "2025-01-10T10:00:00Z",
        "instructions": {
          "overview": "Create a responsive analytics dashboard...",
          "requirements": [
            "Set up a React project with TypeScript",
            "Design the dashboard layout with responsive components",
            "Implement real-time data fetching using WebSocket"
          ],
          "deliverables": [
            "Complete source code on GitHub",
            "Live demo deployment",
            "Documentation and README"
          ],
          "evaluation_criteria": [
            "Code quality and architecture",
            "UI/UX design and responsiveness",
            "Performance optimization"
          ]
        },
        "user_status": {
          "has_applied": false,
          "application_status": null,
          "is_bookmarked": true
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 8,
      "total_tasks": 94,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Apply for Task
```http
POST /api/v1/tasks/{task_id}/apply
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
cover_letter: "I am excited to apply for this position..."
resume: <file_upload>
portfolio_links: ["https://github.com/user/project", "https://portfolio.dev"]
expected_timeline: "4 weeks"
additional_info: "I have experience with similar projects..."
```

#### Get My Applications
```http
GET /api/v1/students/applications?status=all&page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "application_456",
        "task": {
          "id": "task_789",
          "title": "Build a Real-Time Analytics Dashboard",
          "company": {
            "name": "DataSphere Analytics",
            "logo": "https://cdn.example.com/logos/datasphere.png"
          }
        },
        "status": "pending", // pending, approved, rejected, withdrawn
        "applied_at": "2025-01-14T15:30:00Z",
        "cover_letter": "I am excited to apply...",
        "resume_url": "https://cdn.example.com/resumes/student_123_resume.pdf",
        "portfolio_links": ["https://github.com/user/project"],
        "feedback": null, // Available when status is approved/rejected
        "submission": null // Available when task is completed
      }
    ]
  }
}
```

#### Submit Task Solution
```http
POST /api/v1/applications/{application_id}/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "project_title": "Real-Time Analytics Dashboard Pro",
  "description": "I built a comprehensive analytics dashboard...",
  "github_url": "https://github.com/user/analytics-dashboard",
  "demo_url": "https://analytics-dashboard.vercel.app",
  "video_demo_url": "https://youtube.com/watch?v=demo123",
  "additional_files": [
    {
      "name": "Documentation.pdf",
      "url": "https://drive.google.com/file/d/doc123"
    }
  ],
  "technologies_used": ["React", "TypeScript", "WebSocket", "Chart.js"],
  "challenges_faced": "The main challenge was implementing real-time updates...",
  "learning_outcomes": "I learned about WebSocket implementation and performance optimization..."
}
```

### 4. Virtual CV System

#### Get Student CV
```http
GET /api/v1/students/cv
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cv_123",
    "student_id": "student_123",
    "template": "modern",
    "visibility": "public", // public, private, unlisted
    "sections": {
      "personal_info": {
        "name": "Parth Patel",
        "email": "parth@example.com",
        "phone": "+91-9876543210",
        "location": "Mumbai, India",
        "portfolio": "https://parthpatel.dev",
        "linkedin": "https://linkedin.com/in/parthpatel",
        "github": "https://github.com/parthpatel"
      },
      "summary": "Passionate computer science student with expertise in web development...",
      "education": [
        {
          "institution": "IIT Mumbai",
          "degree": "Bachelor of Technology",
          "field": "Computer Science",
          "start_date": "2022-07-01",
          "end_date": "2026-05-31",
          "gpa": "8.5/10",
          "relevant_coursework": ["Data Structures", "Algorithms", "Web Development"]
        }
      ],
      "experience": [
        {
          "title": "Frontend Developer Intern",
          "company": "TechCorp",
          "location": "Remote",
          "start_date": "2024-06-01",
          "end_date": "2024-08-31",
          "description": "Developed responsive web applications using React...",
          "achievements": [
            "Improved page load time by 40%",
            "Implemented new UI components"
          ]
        }
      ],
      "projects": [
        {
          "title": "E-commerce Platform",
          "description": "Full-stack e-commerce application with React and Node.js",
          "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
          "github_url": "https://github.com/user/ecommerce",
          "demo_url": "https://ecommerce-demo.vercel.app",
          "start_date": "2024-03-01",
          "end_date": "2024-05-31"
        }
      ],
      "skills": {
        "technical": [
          {
            "category": "Programming Languages",
            "items": ["JavaScript", "Python", "Java", "TypeScript"]
          },
          {
            "category": "Frameworks & Libraries",
            "items": ["React", "Node.js", "Express", "Django"]
          }
        ],
        "soft": ["Leadership", "Communication", "Problem Solving", "Team Work"]
      },
      "achievements": [
        {
          "title": "Hackathon Winner",
          "organization": "IIT Mumbai",
          "date": "2024-03-15",
          "description": "Won first place in annual hackathon"
        }
      ],
      "certifications": [
        {
          "name": "AWS Cloud Practitioner",
          "issuer": "Amazon Web Services",
          "date": "2024-02-20",
          "credential_id": "AWS-123456",
          "url": "https://aws.amazon.com/verification/123456"
        }
      ]
    },
    "stats": {
      "views": 245,
      "downloads": 12,
      "shares": 5
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### Update CV
```http
PUT /api/v1/students/cv
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Generate CV PDF
```http
POST /api/v1/students/cv/generate-pdf
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "template": "modern", // modern, classic, minimal
  "sections": ["personal_info", "summary", "education", "experience", "projects", "skills"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdf_url": "https://cdn.example.com/cv/student_123_cv.pdf",
    "expires_at": "2024-01-27T10:30:00Z"
  }
}
```

## Real-time Features

### WebSocket Events

#### Connection Setup
```javascript
const socket = io('wss://api.vibe.edu/ws', {
  auth: {
    token: jwt_token
  },
  query: {
    role: 'student',
    user_id: 'student_123'
  }
});
```

#### Event Subscriptions
```javascript
// New post notifications
socket.on('new_post', (data) => {
  // Handle new post in community feed
});

// Comment notifications
socket.on('post_comment', (data) => {
  // Handle new comment on user's post
});

// Task application updates
socket.on('application_status_update', (data) => {
  // Handle application approval/rejection
});

// New task notifications
socket.on('new_task', (data) => {
  // Handle new task matching user's skills
});

// Mentorship request updates
socket.on('mentorship_update', (data) => {
  // Handle mentorship request responses
});
```

## File Upload System

### Upload Endpoints

#### Profile Avatar Upload
```http
POST /api/v1/upload/avatar
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### Resume Upload
```http
POST /api/v1/upload/resume
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### Project Files Upload
```http
POST /api/v1/upload/project-files
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### File Constraints
- Maximum file size: 10MB for documents, 5MB for images
- Supported formats: PDF, DOC, DOCX for resumes; JPG, PNG, GIF for images
- Virus scanning and validation required
- CDN integration for fast delivery

## Notification System

### Get Notifications
```http
GET /api/v1/notifications?page=1&limit=20&type=all&read=all
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "application_approved",
        "title": "Application Approved!",
        "message": "Your application for 'Analytics Dashboard' has been approved.",
        "data": {
          "task_id": "task_789",
          "application_id": "application_456"
        },
        "read": false,
        "created_at": "2024-01-20T10:30:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### Mark Notifications as Read
```http
PUT /api/v1/notifications/mark-read
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notification_ids": ["notif_123", "notif_124"] // or "all" for all notifications
}
```

## Analytics and Tracking

### Student Activity Tracking
```http
POST /api/v1/analytics/track
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "post_viewed",
  "data": {
    "post_id": "post_456",
    "time_spent": 45, // seconds
    "source": "community_feed"
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Get Student Analytics
```http
GET /api/v1/students/analytics?period=30d
Authorization: Bearer <jwt_token>
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `DUPLICATE_APPLICATION`: Already applied for this task

## Rate Limiting

### Limits by Endpoint Type
- Authentication: 5 requests per minute
- Profile updates: 10 requests per hour
- Post creation: 5 posts per hour
- File uploads: 20 uploads per hour
- General API: 1000 requests per hour

## Database Schema Considerations

### Key Tables
- `students`: Student profile information
- `posts`: Community posts
- `comments`: Post comments and replies
- `tasks`: Available tasks from industry
- `applications`: Student task applications
- `cvs`: Student CV data
- `notifications`: User notifications
- `analytics_events`: User activity tracking

### Indexing Strategy
- Index on frequently queried fields (user_id, created_at, status)
- Composite indexes for complex queries
- Full-text search indexes for posts and tasks
- Geospatial indexes for location-based features

## Caching Strategy

### Redis Caching
- User sessions and JWT tokens
- Frequently accessed posts and tasks
- User profile data
- Notification counts
- Analytics data

### CDN Integration
- Static assets (images, documents)
- Generated CV PDFs
- Profile avatars
- Task attachments

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper input validation
- Regular security audits and penetration testing

### Privacy Controls
- User consent for data collection
- GDPR compliance for EU users
- Data retention policies
- Right to data deletion

## Monitoring and Logging

### Key Metrics to Track
- API response times
- Error rates by endpoint
- User engagement metrics
- File upload success rates
- Database query performance

### Logging Requirements
- All API requests and responses
- Authentication events
- File upload activities
- Error occurrences
- User activity patterns