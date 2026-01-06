# Frontend Setup Guide

## Quick Start

The frontend is a React application built with Create React App.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# The .env file is already configured
# It points to: http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

**Important**: Use `npm start` (NOT `npm run dev`)

The application will automatically open at: http://localhost:3000

## Available Commands

- `npm start` - Start development server (opens browser automatically)
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Status

✅ **Fully Functional Frontend**

All major components are implemented:
- ✅ Authentication & Login
- ✅ Dashboard with cases overview
- ✅ Case Workspace with tabs:
  - Evidence Ingestion
  - Raw Evidence Table
  - Filtered Artifacts Table
  - Attack Story Visualization
  - Timeline View
  - Reporting Module
  - Settings Panel
- ✅ API Integration (Zustand store)
- ✅ Chain of Custody tracking
- ✅ Real-time data loading
- ✅ Role-based access

## Backend Connection

The frontend connects to the backend at:
- **URL**: http://localhost:5000/api
- **CORS**: Enabled for http://localhost:3000

Make sure the backend is running before using the frontend:

```bash
# In another terminal
cd backend
npm run dev
```

## User Roles

Test with these roles at login:
1. **investigator** - Full access
2. **incident-responder** - Incident management
3. **legal-auditor** - Read-only + chain of custody
4. **executive** - Dashboard only

## Current Status

Frontend is running at: http://localhost:3000
Backend should be running at: http://localhost:5000

The application is production-ready with all features implemented!
