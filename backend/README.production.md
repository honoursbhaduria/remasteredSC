# Production Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

Copy the `.env.example` file to `.env` and configure your API keys:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

**Minimum configuration for development:**
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Required for production:**
- Set `NODE_ENV=production`
- Generate strong `JWT_SECRET` (min 32 characters)
- Configure `CORS_ORIGIN` to your frontend URL
- Set `DATABASE_URL` for persistent storage
- Enable rate limiting: `RATE_LIMIT_ENABLED=true`

### 3. Optional Integrations

Enable features by adding API keys to your `.env` file:

#### AI/ML Analysis
```env
# OpenAI for GPT-4 analysis
OPENAI_API_KEY=sk-...
FEATURE_AI_ANALYSIS=true

# Or use Claude
ANTHROPIC_API_KEY=sk-ant-...

# Or use Google Gemini Flash 2.5
GOOGLE_AI_API_KEY=...
```

#### Threat Intelligence
```env
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
SHODAN_API_KEY=...
FEATURE_THREAT_INTELLIGENCE=true
```

#### Cloud Storage
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=forensics-evidence
FEATURE_CLOUD_STORAGE=true
```

#### Notifications
```env
SLACK_WEBHOOK_URL=...
SENDGRID_API_KEY=...
FEATURE_NOTIFICATIONS=true
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔧 Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 🏗️ Architecture

### Middleware Stack
1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Morgan** - HTTP request logging
4. **Express Rate Limit** - API rate limiting
5. **Compression** - Gzip compression
6. **JWT Authentication** - Token-based auth
7. **Error Handler** - Centralized error handling

### Directory Structure
```
src/
├── config/         # Configuration loader
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Data models and types
├── routes/         # API route definitions
├── utils/          # Utility functions
└── server.ts       # Express app setup
```

## 🔒 Security Features

- **Helmet.js**: Sets secure HTTP headers
- **CORS**: Configurable origin restrictions
- **JWT**: Token-based authentication with expiration
- **Rate Limiting**: Prevents abuse (100 req/15min per IP)
- **Input Validation**: Express-validator on all inputs
- **File Upload Limits**: Max 100MB per file
- **Password Hashing**: bcrypt with salt rounds
- **Secure Cookies**: httpOnly, secure, sameSite

## 📊 Logging

Logs are written to:
- `./logs/combined.log` - All logs
- `./logs/error.log` - Error logs only
- Console (development only)

Configure logging level:
```env
LOG_LEVEL=info  # debug, info, warn, error
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Human-readable error message"
}
```

Status codes:
- `400` - Bad request / validation error
- `401` - Unauthorized / invalid token
- `403` - Forbidden / insufficient permissions
- `404` - Resource not found
- `429` - Too many requests (rate limit)
- `500` - Internal server error

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Cases
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Evidence
- `GET /api/evidence/:caseId/raw` - Get raw evidence
- `GET /api/evidence/:caseId/filtered` - Get filtered artifacts
- `POST /api/evidence/upload` - Upload evidence file

### Data
- `GET /api/data/:caseId/story` - Get attack story
- `GET /api/data/:caseId/files` - List evidence files
- `GET /api/data/:caseId/custody` - Get chain of custody
- `GET /api/data/stats` - Get system statistics

## 🧪 Testing

Test credentials (development only):
```
Admin:
  username: admin
  password: admin123

Analyst:
  username: analyst
  password: analyst123

Investigator:
  username: investigator
  password: investigator123

Auditor:
  username: auditor
  password: auditor123
```

## 🌐 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
```

### Environment Variables in Production

**Never commit `.env` to version control!**

Use your hosting platform's environment variable manager:
- Heroku: `heroku config:set KEY=value`
- AWS: Parameter Store or Secrets Manager
- Azure: Key Vault
- Vercel/Netlify: Environment variables UI

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "v1",
  "uptime": 3600
}
```

### Logs
Monitor logs in real-time:
```bash
tail -f logs/combined.log
```

### Metrics
Enable monitoring services in `.env`:
```env
SENTRY_DSN=...
NEW_RELIC_LICENSE_KEY=...
DATADOG_API_KEY=...
```

## 🔄 Updates

To update dependencies:
```bash
npm outdated
npm update
npm audit fix
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### JWT token invalid
- Check `JWT_SECRET` matches between deployments
- Verify token hasn't expired (`JWT_EXPIRES_IN`)
- Clear browser cookies/localStorage

### CORS errors
- Set `CORS_ORIGIN` in `.env` to your frontend URL
- Include credentials: `credentials: true` in frontend fetch

### Rate limit errors
- Adjust limits in `.env`:
  ```env
  RATE_LIMIT_MAX_REQUESTS=200
  RATE_LIMIT_WINDOW_MS=900000
  ```
- Or disable: `RATE_LIMIT_ENABLED=false`

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues and questions:
- Check documentation: `/api` endpoint
- View logs: `./logs/`
- Enable debug logging: `LOG_LEVEL=debug`
