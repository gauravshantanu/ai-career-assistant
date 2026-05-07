# 💼 AI Career Assistant

A full-featured AI-powered career app built with Streamlit + Claude.

## Features
- 📄 Resume Builder & Reviewer
- 🎤 Mock Interview Coach (live chat)
- ✉️ Cover Letter Generator
- 💼 LinkedIn Post Writer
- 🔍 Job Description Decoder
- 🚀 Apply in One Click (full package + email + links)
- 🌍 12 Languages (Hindi, Tamil, Telugu, Bengali, Marathi + more)
- ⬇️ Download outputs as .docx or .txt
- 📄 Open in Google Docs
- ✉️ Send directly via Gmail

---

## ⚡ Quick Setup (5 minutes)

### Step 1 — Install Python
Download from https://python.org (3.10 or higher)

### Step 2 — Install dependencies
Open terminal / command prompt in this folder and run:
```
pip install -r requirements.txt
```

### Step 3 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up (free)
3. Go to "API Keys" → Create a key
4. Copy the key (starts with sk-ant-...)

### Step 4 — Run the app
```
streamlit run app.py
```

The app opens automatically in your browser at http://localhost:8501

### Step 5 — Enter your API key
Paste your API key in the sidebar and start using all features!

---

## 🌐 Share with others (free hosting)

### Option A — Streamlit Cloud (easiest, free)
1. Push this folder to GitHub
2. Go to https://share.streamlit.io
3. Connect your GitHub repo
4. Deploy — you get a public URL like https://yourapp.streamlit.app
5. Users enter their own API key

### Option B — Run on your laptop + share locally
```
streamlit run app.py --server.address 0.0.0.0
```
Anyone on your WiFi network can access it at http://YOUR_IP:8501

---

## 💡 Tips
- The app works best with a stable internet connection
- All outputs can be downloaded as .docx (Word) or .txt
- Use "Apply in One Click" to get a complete application package in one go
- Switch languages anytime from the sidebar

---

## 🛠 Tech Stack
- **Frontend**: Streamlit
- **AI**: Claude (claude-sonnet-4-20250514) via Anthropic API
- **File export**: python-docx
- **Language**: Python 3.10+
