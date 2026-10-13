# VIBE Client (Frontend Web Application)

[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Supported-FF6B00.svg)](https://web.dev/progressive-web-apps/)

**VIBE Client** is the progressive, interactive single-page web application for the VIBE Platform (Verified Internship & Mentorship System). Built with React 19, Vite, Tailwind CSS, Framer Motion, and Lucide Icons, it delivers a modern glassmorphic interface tailored for Students, Faculty Mentors, and Industry Experts.

---

## Key Features

- **Student Dashboard**: Browse verified task challenges (Task Mania), submit solutions, track mentorship requests, and view generated Virtual Resumes.
- **Faculty Mentor Portal**: Review incoming mentorship requests from students, approve or reject requests, and track student progress.
- **Industry Portal**: Create and manage industry task challenges, evaluate student solution submissions, and hire verified talent.
- **Multi-Step Signup & Role Switcher**: Interactive 4-step stepper with instant email OTP verification and role selection.
- **Community Feed**: Expressive social feed with post creation, comment threads, attachment previews, and interactive vibe upvoting.
- **Progressive Web App (PWA)**: Built-in service worker caching, offline capability, and installable app manifest.
- **Vite Proxy & API Layer**: Integrated Axios client with automatic Bearer token injection and Vite dev server proxying to backend (`/api/v1` -> `http://localhost:8000`).

---

## Frontend Component & Module Architecture

```mermaid
graph TD
    App["App.jsx (Main Router & Layout)"]
    
    subgraph ServicesUtils["Core Services & Auth Layer"]
        APIClient["services/api.js (Axios Instance)"]
        AuthUtil["utils/auth.js (Auth Session & LocalStorage)"]
    end
    
    subgraph Pages["Top Level Page Views"]
        Landing["Landing / Hero Page"]
        Login["Login.jsx (Role Tiles & Reset Modal)"]
        Signup["StudentSignup.jsx (4-Step Stepper)"]
        StudentDash["StudentDashboard.jsx"]
        FacultyDash["FacultyDashboard.jsx"]
        IndustryDash["IndustryDashboard.jsx"]
    end
    
    subgraph StudentComponents["Student Dashboard Components"]
        TaskManiaView["taskmania/TaskManiaView.jsx"]
        ProfileView["student/ProfileView.jsx"]
        MyRequestsView["student/MyMentorRequestsView.jsx"]
        MentorModal["taskmania/MentorRequestModal.jsx"]
    end
    
    subgraph FacultyComponents["Faculty Portal Components"]
        FacultyRequests["faculty/MentorRequestsView.jsx"]
        FacultyProfile["faculty/ProfileView.jsx"]
    end
    
    subgraph IndustryComponents["Industry Portal Components"]
        IndustryLayout["industry/Layout.jsx"]
        IndustryCommunity["industry/Community.jsx"]
    end
    
    subgraph SharedComponents["Shared & Social Components"]
        PostCard["posts/PostCard.jsx"]
        CreatePostModal["posts/CreatePostModal.jsx"]
        GlassCard["GlassCard.jsx (Glassmorphism)"]
        Button["Button.jsx"]
    end

    App --> Pages
    Pages --> ServicesUtils
    
    StudentDash --> StudentComponents
    FacultyDash --> FacultyComponents
    IndustryDash --> IndustryComponents
    
    StudentComponents --> SharedComponents
    FacultyComponents --> SharedComponents
    IndustryComponents --> SharedComponents
    
    APIClient -->|Proxied via Vite| BackendServer[("Backend Server (Port 8000)")]
```

---

## Multi-Role Navigation & User Journey Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Faculty / Industry
    participant UI as React UI (VIBE Client)
    participant Auth as Auth Manager (auth.js)
    participant API as Axios Service (api.js)
    participant Server as Express Backend

    User->>UI: Select Role Tile (Student / Faculty / Industry)
    User->>UI: Enter Email & Password
    UI->>Auth: auth.login(email, password)
    Auth->>API: POST /api/v1/users/login
    API->>Server: HTTP POST /users/login
    Server-->>API: 200 OK + JWT Tokens & User Object
    API-->>Auth: Response Payload
    Auth->>Auth: Save Token & User in LocalStorage
    Auth-->>UI: Success
    
    alt Role is Student
        UI->>UI: Navigate /dashboard/student
        UI->>API: GET /api/v1/tasks & GET /api/v1/submissions/me
        Server-->>UI: Return Tasks & Student Submissions
    else Role is Faculty
        UI->>UI: Navigate /dashboard/faculty
        UI->>API: GET /api/v1/mentor-requests/faculty-requests
        Server-->>UI: Return Student Mentorship Requests
    else Role is Industry
        UI->>UI: Navigate /dashboard/industry
        UI->>API: GET /api/v1/tasks/myTasks
        Server-->>UI: Return Posted Challenges & Submissions
    end
```

---

## Directory Structure

```
vibe-client/
├── public/                 # Favicons, PWA icons, static assets
├── src/
│   ├── components/         # Modular UI components
│   │   ├── faculty/        # Faculty portal views
│   │   ├── industry/       # Industry portal views
│   │   ├── posts/          # Community post & comment modals
│   │   ├── shared/         # Common layout wrappers
│   │   ├── student/        # Student dashboard views
│   │   ├── taskmania/      # Task challenge & submission views
│   │   ├── Button.jsx      # Reusable button component
│   │   └── GlassCard.jsx   # Glassmorphic UI wrapper
│   ├── pages/              # Primary route pages
│   │   ├── FacultyDashboard.jsx
│   │   ├── IndustryDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── StudentSignup.jsx
│   ├── services/
│   │   └── api.js          # Axios client with interceptors & proxy config
│   ├── utils/
│   │   └── auth.js         # Authentication state & session manager
│   ├── App.jsx             # React router declaration
│   ├── index.jsx           # React DOM root render
│   └── types.js            # JSDoc type definitions
├── index.html              # HTML5 entry point
├── vite.config.js          # Vite config, dev proxy & PWA plugin settings
├── package.json
└── README.md
```

---

## Environment Configuration

You can optionally configure environment variables in `.env` or `.env.local` inside `vibe-client`:

```env
# Optional explicit API Base URL (Defaults to relative /api/v1 via Vite proxy)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Optional Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

### Vite Dev Proxy Setup
The client uses Vite's built-in development proxy configured in `vite.config.js`:
```js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run at **`http://localhost:3000`**.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## License

Distributed under the **ISC License**.
