# Forensic Investigation Platform - Frontend

A modern React-based frontend for AI-assisted digital forensics investigation.

## 🎯 Features

- **Authentication**: Role-based access control (Investigator, Incident Responder, Legal/Auditor, Executive)
- **Dashboard**: Overview of all investigation cases with real-time system statistics
- **Evidence Management**: Upload, parse, and manage digital evidence with automatic hashing
- **Evidence Analysis**: View raw and AI-filtered evidence artifacts with confidence scoring
- **Attack Story Generation**: AI-powered narrative reconstruction of attack sequences
- **Timeline Visualization**: Temporal visualization of security events
- **Reporting**: Generate executive, technical, and legal reports
- **Chain of Custody**: Automated tracking with cryptographic verification
- **Settings**: Configurable confidence thresholds and system preferences

## 🛠️ Tech Stack

- React 19 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Lucide React for icons
- date-fns for date formatting
- Recharts for data visualization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5000`

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

3. **Start the development server:**
```bash
npm start
```

The application will open at http://localhost:3000

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Login and authentication
│   │   ├── case-workspace/  # Case evidence ingestion
│   │   ├── evidence/    # Evidence table and drawers
│   │   ├── reporting/   # Report generation
│   │   ├── settings/    # System settings
│   │   ├── story/       # Attack story visualization
│   │   └── timeline/    # Timeline visualization
│   ├── pages/           # Page-level components
│   ├── services/        # API client
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   └── App.tsx          # Main app
├── .env                 # Environment variables
└── package.json
```

## �� User Roles

- **Investigator**: Full access to all features
- **Incident Responder**: Active incident management
- **Legal / Auditor**: Read-only with chain of custody
- **Executive**: Dashboard and summary reports

## 📝 Available Scripts

- `npm start` - Run development server
- `npm build` - Build production bundle
- `npm test` - Run tests

## 🔌 API Integration

The frontend connects to the backend at `REACT_APP_API_URL` (default: http://localhost:5000/api)

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/cases/*` - Case management
- `/api/evidence/*` - Evidence operations
- `/api/data/*` - Data retrieval
- `/api/ml/*` - AI/ML operations

## 🐛 Troubleshooting

### API Connection Issues
1. Verify backend is running
2. Check `.env` file
3. Ensure CORS is configured

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

Academic research project for digital forensics investigation.
# remasteredSC
