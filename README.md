# Online Course Management System - Frontend

A modern, full-featured Learning Management System (LMS) built with React, TailwindCSS, and Vite.

## Features

### Multi-Role Support
- **Admin**: Manage students, teachers, courses, departments, and device requests
- **Teacher**: Create and manage courses, track student progress, issue certificates
- **Student**: Access courses, watch videos, track progress, earn certificates

### Core Features
- 🔐 JWT Authentication with session management
- 📚 Course creation and management
- 🎥 Secure video streaming with progress tracking
- 💬 Comment system for topics and videos
- 📊 Progress tracking and analytics
- 🏆 Certificate generation
- 🌓 Dark/Light theme support
- 📱 Fully responsive design
- ♿ Accessible (WCAG 2.1 AA)

## Technology Stack

- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS + Custom CSS
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Video Player**: React Player / Video.js

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Online Course Management
```

4. Start development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/                    # API service layer
├── components/             # Reusable components
│   ├── common/            # Shared UI components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   ├── video/             # Video player components
│   ├── course/            # Course-related components
│   └── charts/            # Data visualization
├── pages/                 # Page components
│   ├── auth/              # Login, Register
│   ├── admin/             # Admin portal
│   ├── teacher/           # Teacher portal
│   ├── student/           # Student portal
│   └── public/            # Public pages
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── utils/                 # Utility functions
├── routes/                # Route configuration
├── assets/                # Static assets
├── App.jsx                # Root component
└── main.jsx               # Entry point
```

## Development Status

### ✅ Completed
- [x] Project initialization and configuration
- [x] TailwindCSS setup with custom theme
- [x] Folder structure
- [x] API service layer with Axios
- [x] Zustand stores (Auth, Theme, Course)
- [x] Utility functions (formatters, validators, constants)
- [x] Custom CSS styles and animations

### 🚧 In Progress
- [ ] React Router configuration
- [ ] Common UI components
- [ ] Layout components (Navbar, Sidebar, Footer)
- [ ] Authentication pages
- [ ] Protected routes

### 📋 To Do
- [ ] Admin Dashboard and management pages
- [ ] Teacher Portal
- [ ] Student Portal with video player
- [ ] Comment system
- [ ] Progress tracking UI
- [ ] Certificate display
- [ ] Responsive design polish
- [ ] Testing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |
| `VITE_APP_NAME` | Application name | `Online Course Management` |

## API Integration

The application integrates with the FastAPI backend documented in `API_DOCUMENTATION.md`. All API endpoints are configured in `src/utils/constants.js` and wrapped in service functions in `src/api/`.

### API Features
- Automatic token injection
- Request/response interceptors
- Error handling
- Device name tracking
- Retry logic

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please check the API documentation or create an issue in the repository.
