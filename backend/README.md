# Forensics Investigation Backend API

Node.js/Express backend serving demo data and API endpoints for the AI-Assisted Log Investigation Framework.

## Features

- ✅ RESTful API with TypeScript
- ✅ Mock authentication
- ✅ Case management endpoints
- ✅ Evidence filtering and analysis
- ✅ Attack story generation
- ✅ Chain of custody tracking
- ✅ System statistics
- ✅ Notes and decision logging

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case

### Evidence
- `GET /api/evidence/raw?caseId=X` - Get raw evidence
- `GET /api/evidence/filtered?caseId=X&threshold=0.7` - Get filtered artifacts
- `PATCH /api/evidence/:id/false-positive` - Mark as false positive
- `PATCH /api/evidence/:id/exclude-story` - Exclude from story

### Data
- `GET /api/data/story/:caseId` - Get attack story
- `GET /api/data/files?caseId=X` - Get evidence files
- `GET /api/data/chain-of-custody?evidenceId=X` - Get chain of custody
- `GET /api/data/system-stats` - Get system statistics
- `GET /api/data/notes?caseId=X` - Get investigator notes
- `POST /api/data/notes` - Add note
- `GET /api/data/decisions?caseId=X` - Get decision log
- `POST /api/data/decisions` - Add decision

### Health
- `GET /api/health` - Server health check

## Installation

```bash
npm install
```

## Running

Development mode with hot reload:
```bash
npm run dev
```

Production build and run:
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file:
```
PORT=5000
NODE_ENV=development
```

## Demo Users

All passwords are `demo123`:
- `investigator@company.com`
- `responder@company.com`
- `auditor@company.com`
- `executive@company.com`

## Tech Stack

- Node.js
- Express.js
- TypeScript
- CORS enabled
- Dotenv for config
