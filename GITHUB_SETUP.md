# 🚀 GitHub Repository Setup Guide

## Quick Setup (5 minutes)

### 1. Create GitHub Repository

1. Go to: https://github.com/new
2. **Repository name:** `log-investigation-framework` (or your choice)
3. **Description:** AI-Assisted Log Investigation Framework with Google Gemini
4. **Visibility:** Public or Private (your choice)
5. ✅ **DO NOT** check "Add a README file"
6. ✅ **DO NOT** add .gitignore or license (already have them)
7. Click **"Create repository"**

### 2. Push Your Code

After creating the repository, run these commands:

```bash
cd /home/honours/SC

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/log-investigation-framework.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

**Example:**
```bash
# If your username is "johndoe"
git remote add origin https://github.com/johndoe/log-investigation-framework.git
git branch -M main
git push -u origin main
```

### 3. Verify Upload

1. Refresh your GitHub repository page
2. You should see all files including:
   - ✅ README.md (project overview)
   - ✅ backend/ folder
   - ✅ frontend/ folder
   - ✅ COMPLETE_GUIDE.md
   - ✅ GEMINI_SETUP.md

---

## Alternative: Use SSH (More Secure)

### 1. Check if you have SSH key

```bash
ls -la ~/.ssh/id_*.pub
```

If you see a file, you already have a key. Skip to step 3.

### 2. Generate SSH key (if needed)

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts to use defaults
```

### 3. Copy your SSH key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the entire output (starts with `ssh-ed25519`)

### 4. Add to GitHub

1. Go to: https://github.com/settings/ssh/new
2. **Title:** "My Computer" (or any name)
3. **Key:** Paste the SSH key you copied
4. Click **"Add SSH key"**

### 5. Push with SSH

```bash
cd /home/honours/SC

# Add GitHub remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/log-investigation-framework.git

# Push code
git branch -M main
git push -u origin main
```

---

## 📋 Current Repository Status

Your local repository is ready:

- ✅ Git initialized
- ✅ .gitignore configured
- ✅ Initial commit created
- ✅ All files committed
- 🔄 **Waiting for:** GitHub remote URL

**Commit Message:**
```
Initial commit: AI-Assisted Log Investigation Framework with Google Gemini integration
```

**Files Included:**
- Frontend (React + TypeScript)
- Backend (Node.js + Express)
- Documentation (README, guides)
- Configuration (.gitignore, .env.example)
- **NOT Included:** node_modules, .env, logs, build artifacts

---

## 🔐 Important: Protect Your API Key

Your Google Gemini API key is in `backend/.env` but **NOT** in git (thanks to .gitignore).

When others clone your repo, they need to:

1. Copy `backend/.env.example` to `backend/.env`
2. Add their own API key
3. Never commit `.env` to git

---

## 🎯 Quick Commands Reference

```bash
# Check remote URL
git remote -v

# View commit history
git log --oneline

# Check repository status
git status

# Push future changes
git add .
git commit -m "Your commit message"
git push
```

---

## 📊 What Happens After Push?

After `git push`, your GitHub repository will show:

1. **Professional README** with badges and quick start guide
2. **Complete documentation** for setup and deployment
3. **Production-ready code** with all features
4. **Clean structure** with frontend + backend

GitHub will automatically:
- ✅ Detect it's a Node.js project
- ✅ Show README on main page
- ✅ Parse markdown formatting
- ✅ Display folder structure

---

## 🚀 Next Steps After Push

1. **Add Repository Topics:**
   - Go to your repo on GitHub
   - Click ⚙️ settings icon next to "About"
   - Add topics: `forensics`, `cybersecurity`, `ai`, `gemini`, `react`, `nodejs`, `typescript`

2. **Create Release (Optional):**
   - Go to "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Title: "Initial Release"

3. **Enable GitHub Pages (Optional):**
   - Build frontend: `cd frontend && npm run build`
   - Deploy `build/` folder to GitHub Pages

4. **Add Collaboration (Optional):**
   - Settings → Manage access → Invite collaborators

---

## 🐛 Troubleshooting

### Authentication Failed

**If using HTTPS:**
```bash
# GitHub now requires Personal Access Token (not password)
# Generate token at: https://github.com/settings/tokens/new
# Use token as password when prompted
```

**Better: Switch to SSH** (see SSH section above)

### Repository Already Exists

```bash
# Remove old remote
git remote remove origin

# Add new remote with correct URL
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
```

### Push Rejected

```bash
# If you accidentally initialized with README on GitHub
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## ✨ Your Repository URL Format

- **HTTPS:** `https://github.com/YOUR_USERNAME/REPO_NAME.git`
- **SSH:** `git@github.com:YOUR_USERNAME/REPO_NAME.git`

**Example:**
- User: `cybersec-researcher`
- Repo: `forensic-ai-platform`
- HTTPS: `https://github.com/cybersec-researcher/forensic-ai-platform.git`
- SSH: `git@github.com:cybersec-researcher/forensic-ai-platform.git`

---

## 📞 Need Help?

If you're stuck, share:
1. Your GitHub username
2. Repository name you created
3. Error message (if any)

I'll provide the exact commands to run!

---

**Status:** ✅ Local repository ready for push  
**Next:** Create GitHub repo → Add remote → Push code
