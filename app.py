import streamlit as st
from groq import Groq
import json
import io
import os
from datetime import datetime
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import urllib.parse

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Career Assistant",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

    html, body, [class*="css"] { font-family: 'DM Sans', sans-serif; }
    h1, h2, h3 { font-family: 'DM Serif Display', serif; }

    .main { background: #fafaf8; }
    .block-container { padding-top: 2rem; max-width: 900px; }

    .hero-badge {
        display: inline-block;
        background: #1a1a2e;
        color: #e8d5b7;
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }
    .hero-title {
        font-family: 'DM Serif Display', serif;
        font-size: 2.4rem;
        color: #1a1a2e;
        line-height: 1.2;
        margin-bottom: 0.3rem;
    }
    .hero-sub {
        color: #6b6b7b;
        font-size: 1rem;
        margin-bottom: 2rem;
    }

    .feature-card {
        background: white;
        border: 1px solid #e8e8e0;
        border-radius: 12px;
        padding: 1.2rem 1.4rem;
        margin-bottom: 1rem;
    }

    .stTextArea textarea {
        border-radius: 10px !important;
        border: 1px solid #ddd !important;
        font-family: 'DM Sans', sans-serif !important;
        font-size: 14px !important;
    }
    .stTextInput input {
        border-radius: 10px !important;
        font-family: 'DM Sans', sans-serif !important;
    }
    .stSelectbox > div > div {
        border-radius: 10px !important;
    }

    .stButton > button {
        border-radius: 10px !important;
        font-family: 'DM Sans', sans-serif !important;
        font-weight: 500 !important;
        border: 1.5px solid #1a1a2e !important;
        background: #1a1a2e !important;
        color: white !important;
        padding: 0.5rem 1.5rem !important;
        transition: all 0.2s !important;
    }
    .stButton > button:hover {
        background: #2d2d4e !important;
        transform: translateY(-1px);
    }

    .output-section {
        background: #f5f4f0;
        border-left: 4px solid #1a1a2e;
        border-radius: 0 10px 10px 0;
        padding: 1.2rem 1.4rem;
        margin-top: 1rem;
        font-size: 15px;
        line-height: 1.8;
        white-space: pre-wrap;
        color: #1a1a2e;
    }

    .lang-pill {
        display: inline-block;
        background: #e8d5b7;
        color: #1a1a2e;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        margin: 2px;
    }

    .chat-user {
        background: #1a1a2e;
        color: white;
        border-radius: 18px 18px 4px 18px;
        padding: 10px 16px;
        margin: 6px 0 6px 20%;
        font-size: 14px;
        line-height: 1.6;
    }
    .chat-ai {
        background: white;
        border: 1px solid #e8e8e0;
        color: #1a1a2e;
        border-radius: 18px 18px 18px 4px;
        padding: 10px 16px;
        margin: 6px 20% 6px 0;
        font-size: 14px;
        line-height: 1.6;
    }

    .apply-box {
        background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        margin-top: 1rem;
    }
    .apply-box h4 { color: #e8d5b7; margin-bottom: 0.5rem; }
    .apply-link {
        display: inline-block;
        background: #e8d5b7;
        color: #1a1a2e;
        padding: 8px 20px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        margin: 6px 4px;
        font-size: 14px;
    }

    .sidebar .sidebar-content { background: #1a1a2e; }
    section[data-testid="stSidebar"] { background: #1a1a2e; }
    section[data-testid="stSidebar"] * { color: #e8d5b7 !important; }
    section[data-testid="stSidebar"] .stSelectbox > div > div { background: #2d2d4e !important; border-color: #3d3d5e !important; }
    section[data-testid="stSidebar"] .stTextInput input { background: #2d2d4e !important; border-color: #3d3d5e !important; }
    section[data-testid="stSidebar"] h1,h2,h3 { color: #e8d5b7 !important; }
</style>
""", unsafe_allow_html=True)

# ── Language config ───────────────────────────────────────────────────────────
LANGUAGES = {
    "English": "English",
    "हिन्दी (Hindi)": "Hindi",
    "தமிழ் (Tamil)": "Tamil",
    "తెలుగు (Telugu)": "Telugu",
    "বাংলা (Bengali)": "Bengali",
    "मराठी (Marathi)": "Marathi",
    "ಕನ್ನಡ (Kannada)": "Kannada",
    "മലയാളം (Malayalam)": "Malayalam",
    "ગુજરાતી (Gujarati)": "Gujarati",
    "اردو (Urdu)": "Urdu",
    "Español": "Spanish",
    "Français": "French",
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_client():
    key = st.session_state.get("api_key", "") or st.session_state.get("api_key_input", "")
    if not key:
        st.error("⚠️ Please enter your Groq API key in the sidebar.")
        st.stop()
    return Groq(api_key=key)

def call_claude(system, user, history=None, stream=True):
    client = get_client()
    messages = [{"role": "system", "content": system}] + (history or []) + [{"role": "user", "content": user}]
    with st.spinner("✨ Generating..."):
        result = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            messages=messages,
        )
    return result.choices[0].message.content

def save_to_docx(title, content, filename):
    doc = Document()
    # Title
    heading = doc.add_heading(title, 0)
    heading.runs[0].font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
    # Date
    date_para = doc.add_paragraph(f"Generated on {datetime.now().strftime('%d %B %Y')}")
    date_para.runs[0].font.size = Pt(10)
    date_para.runs[0].font.color.rgb = RGBColor(0x6b, 0x6b, 0x7b)
    doc.add_paragraph()
    # Content
    for line in content.split('\n'):
        if line.strip():
            p = doc.add_paragraph(line)
            p.runs[0].font.size = Pt(11) if p.runs else None
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf

def get_gdocs_url(content, title):
    encoded = urllib.parse.quote(content[:2000])
    return f"https://docs.google.com/document/create?title={urllib.parse.quote(title)}"

def get_gmail_url(subject, body):
    return f"https://mail.google.com/mail/?view=cm&su={urllib.parse.quote(subject)}&body={urllib.parse.quote(body[:1500])}"

def get_linkedin_share_url(text):
    return f"https://www.linkedin.com/feed/?shareActive=true&text={urllib.parse.quote(text[:700])}"

def lang_instruction(lang_name):
    if lang_name == "English":
        return ""
    return f"\n\nIMPORTANT: Write your ENTIRE response in {lang_name}. Do not use English unless quoting a proper noun."

def output_actions(key, content, title, show_gmail=False, gmail_subject="", show_linkedin=False):
    """Show download + open actions below any output."""
    st.markdown("---")
    cols = st.columns([1, 1, 1, 1])

    # Download as .docx
    with cols[0]:
        docx_buf = save_to_docx(title, content, key)
        st.download_button(
            "⬇️ Download .docx",
            data=docx_buf,
            file_name=f"{key}_{datetime.now().strftime('%Y%m%d')}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            key=f"dl_{key}"
        )

    # Download as .txt
    with cols[1]:
        st.download_button(
            "⬇️ Download .txt",
            data=content.encode(),
            file_name=f"{key}_{datetime.now().strftime('%Y%m%d')}.txt",
            mime="text/plain",
            key=f"dltxt_{key}"
        )

    # Open in Google Docs
    with cols[2]:
        gdocs_url = get_gdocs_url(content, title)
        st.markdown(f'<a href="{gdocs_url}" target="_blank" style="display:inline-block;background:#1a1a2e;color:white;padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">📄 Open Google Docs</a>', unsafe_allow_html=True)

    # Gmail / LinkedIn share
    with cols[3]:
        if show_gmail:
            gmail_url = get_gmail_url(gmail_subject, content)
            st.markdown(f'<a href="{gmail_url}" target="_blank" style="display:inline-block;background:#1a1a2e;color:white;padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">✉️ Send via Gmail</a>', unsafe_allow_html=True)
        elif show_linkedin:
            li_url = get_linkedin_share_url(content)
            st.markdown(f'<a href="{li_url}" target="_blank" style="display:inline-block;background:#1a1a2e;color:white;padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">🔗 Post to LinkedIn</a>', unsafe_allow_html=True)

# ── Persist API key ──────────────────────────────────────────────────────────
KEY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".groq_key")

def load_saved_key():
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "r") as f:
            return f.read().strip()
    return ""

def save_key(key):
    with open(KEY_FILE, "w") as f:
        f.write(key)

if "api_key" not in st.session_state:
    st.session_state["api_key"] = st.secrets.get("GROQ_API_KEY", load_saved_key())

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 💼 Career Assistant")
    st.markdown("---")

    api_key = st.text_input("Groq API Key (free)", type="password", placeholder="gsk_...",
                            value=st.session_state["api_key"], key="api_key_input")
    if api_key:
        st.session_state["api_key"] = api_key
        save_key(api_key)
        st.success("✅ Key saved permanently")

    st.markdown("---")
    st.markdown("### 🌍 Language")
    selected_lang_label = st.selectbox("Output language", list(LANGUAGES.keys()), index=0)
    selected_lang = LANGUAGES[selected_lang_label]

    st.markdown("---")
    st.markdown("### 🗂 Tools")
    tool = st.radio("", [
        "📄 Resume Review",
        "🎤 Mock Interview",
        "✉️ Cover Letter",
        "💼 LinkedIn Post",
        "🔍 Job Decoder",
        "🚀 Apply in One Click",
    ], label_visibility="collapsed")

    st.markdown("---")
    st.markdown('<span style="font-size:11px;opacity:0.6;">Built with Claude · Streamlit</span>', unsafe_allow_html=True)

# ── Hero ──────────────────────────────────────────────────────────────────────
st.markdown('<div class="hero-badge">AI-Powered · 12 Languages · All-in-one</div>', unsafe_allow_html=True)
st.markdown('<h1 class="hero-title">AI Career Assistant</h1>', unsafe_allow_html=True)
st.markdown('<p class="hero-sub">Your personal job search toolkit — powered by Claude AI</p>', unsafe_allow_html=True)

# Show active language pills
lang_pills = " ".join([f'<span class="lang-pill">{l.split("(")[0].strip()}</span>' for l in list(LANGUAGES.keys())[:6]])
st.markdown(f"Supports: {lang_pills} <span class='lang-pill'>+6 more</span>", unsafe_allow_html=True)
st.markdown("---")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Resume Review
# ─────────────────────────────────────────────────────────────────────────────
if tool == "📄 Resume Review":
    st.markdown("## 📄 Resume Builder & Reviewer")
    st.caption("Paste your resume and job description. Get a score, improved bullet points, and skill gap analysis.")

    col1, col2 = st.columns(2)
    with col1:
        resume_text = st.text_area("Your resume", height=250, placeholder="Paste your current resume here...")
    with col2:
        resume_jd = st.text_area("Job description", height=250, placeholder="Paste the job posting here...")

    if st.button("✨ Review & Improve My Resume"):
        if not resume_text or not resume_jd:
            st.warning("Please fill in both fields.")
        else:
            lang_note = lang_instruction(selected_lang)
            result = call_claude(
                f"You are an expert resume coach and recruiter. Review the resume against the job description. Structure your response as:\n1. MATCH SCORE (/10) with one sentence explanation\n2. TOP 3 IMPROVED BULLET POINTS (rewrite to match the role)\n3. SKILL GAPS (2-3 specific gaps with suggestions)\n4. QUICK WINS (2 formatting/structure tips)\nBe specific, honest, and actionable.{lang_note}",
                f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{resume_jd}"
            )
            st.session_state["resume_result"] = result

    if "resume_result" in st.session_state:
        st.markdown('<div class="output-section">' + st.session_state["resume_result"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)
        output_actions("resume_review", st.session_state["resume_result"], "Resume Review",
                      show_gmail=True, gmail_subject="My Reviewed Resume")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Mock Interview
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🎤 Mock Interview":
    st.markdown("## 🎤 Mock Interview Coach")
    st.caption("Practice real interview questions with AI feedback after every answer.")

    if "interview_history" not in st.session_state:
        st.session_state.interview_history = []
        st.session_state.interview_started = False
        st.session_state.interview_role = ""

    col1, col2, col3 = st.columns(3)
    with col1:
        role = st.text_input("Job role", placeholder="e.g. Data Analyst, HR Manager")
    with col2:
        level = st.selectbox("Experience level", ["Entry level (0–2 yrs)", "Mid level (2–5 yrs)", "Senior (5+ yrs)"])
    with col3:
        interview_type = st.selectbox("Interview type", ["General / behavioral", "Technical", "Case study", "HR round"])

    col_a, col_b = st.columns([1, 3])
    with col_a:
        if st.button("▶️ Start Interview"):
            if not role:
                st.warning("Please enter a job role.")
            else:
                st.session_state.interview_history = []
                st.session_state.interview_started = True
                st.session_state.interview_role = role
                lang_note = lang_instruction(selected_lang)
                system = f"You are a senior interviewer for a {level} {role} position. Conduct a {interview_type} interview. Ask ONE question at a time. After each answer give 1-2 sentences of honest feedback, then ask the next question. After 5 questions, give an overall score and summary. Be realistic and professional.{lang_note}"
                first_q = call_claude(system, "Start the interview with a warm greeting and your first question.")
                st.session_state.interview_history = [
                    {"role": "user", "content": "Start the interview."},
                    {"role": "assistant", "content": first_q}
                ]
                st.session_state.interview_system = system
    with col_b:
        if st.session_state.interview_started and st.button("🔄 Reset Interview"):
            st.session_state.interview_history = []
            st.session_state.interview_started = False

    if st.session_state.interview_started and st.session_state.interview_history:
        st.markdown("### Interview")
        for msg in st.session_state.interview_history:
            if msg["role"] == "assistant":
                st.markdown(f'<div class="chat-ai">🤖 {msg["content"].replace(chr(10), "<br>")}</div>', unsafe_allow_html=True)
            elif msg["role"] == "user" and msg["content"] != "Start the interview.":
                st.markdown(f'<div class="chat-user">👤 {msg["content"]}</div>', unsafe_allow_html=True)

        answer = st.text_input("Your answer", placeholder="Type your answer and press Enter...", key="interview_answer")
        if st.button("Send Answer ↗") and answer:
            st.session_state.interview_history.append({"role": "user", "content": answer})
            response = call_claude(
                st.session_state.interview_system,
                answer,
                history=st.session_state.interview_history[:-1]
            )
            st.session_state.interview_history.append({"role": "assistant", "content": response})
            st.rerun()

        if len(st.session_state.interview_history) > 4:
            full_transcript = "\n\n".join([
                f"{'Interviewer' if m['role']=='assistant' else 'Candidate'}: {m['content']}"
                for m in st.session_state.interview_history
                if m['content'] != "Start the interview."
            ])
            output_actions("mock_interview", full_transcript, "Mock Interview Transcript")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Cover Letter
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "✉️ Cover Letter":
    st.markdown("## ✉️ Cover Letter Generator")
    st.caption("Paste the job description and your key details. Get a personalized, human-sounding cover letter.")

    col1, col2 = st.columns(2)
    with col1:
        cover_jd = st.text_area("Job description", height=200, placeholder="Paste the job posting here...")
        cover_name = st.text_input("Your full name")
        cover_email = st.text_input("Your email (for the letter header)")
    with col2:
        cover_about = st.text_area("About you", height=200, placeholder="Your skills, achievements, experience in bullet points...")
        cover_tone = st.selectbox("Tone", ["Professional & formal", "Friendly & conversational", "Confident & bold", "Humble & enthusiastic"])
        cover_company = st.text_input("Company name (optional)")

    if st.button("✨ Generate Cover Letter"):
        if not cover_jd or not cover_about:
            st.warning("Please fill in the job description and your details.")
        else:
            lang_note = lang_instruction(selected_lang)
            result = call_claude(
                f"You are an expert cover letter writer. Write a compelling, {cover_tone.lower()} cover letter. 3-4 paragraphs. Do NOT start with 'I am writing to express my interest'. Make it feel human, specific, and tailored. End with a confident call to action.{lang_note}",
                f"Candidate: {cover_name or 'the applicant'}\nEmail: {cover_email}\nCompany: {cover_company or 'the company'}\n\nJob:\n{cover_jd}\n\nAbout candidate:\n{cover_about}"
            )
            st.session_state["cover_result"] = result

    if "cover_result" in st.session_state:
        st.markdown('<div class="output-section">' + st.session_state["cover_result"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)
        subject = f"Application – {cover_company or 'Job Application'} – {cover_name or ''}"
        output_actions("cover_letter", st.session_state["cover_result"], "Cover Letter",
                      show_gmail=True, gmail_subject=subject)

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: LinkedIn Post
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "💼 LinkedIn Post":
    st.markdown("## 💼 LinkedIn Post Writer")
    st.caption("Describe your achievement in rough words — get a polished post that sounds like you.")

    linkedin_input = st.text_area("What do you want to post about?", height=150, placeholder="e.g. Got promoted to senior engineer after 2 years. Learned a lot about leadership and handling pressure. Want to share lessons...")
    col1, col2 = st.columns(2)
    with col1:
        post_type = st.selectbox("Post type", ["Career milestone / promotion", "New job announcement", "Lesson learned", "Project achievement", "Thought leadership"])
    with col2:
        post_style = st.selectbox("Writing style", ["Storytelling & personal", "Professional & concise", "Inspiring & motivational", "Humble & grateful"])

    if st.button("✨ Write My LinkedIn Post"):
        if not linkedin_input:
            st.warning("Please describe what you want to post about.")
        else:
            lang_note = lang_instruction(selected_lang)
            result = call_claude(
                f"You are an expert LinkedIn content writer. Write a {post_style.lower()} post about a {post_type.lower()}. Hook the reader in line 1. Short paragraphs. Feel authentic. 150-250 words. 3-5 hashtags at end. Never start with 'Thrilled', 'Humbled', or 'Excited to announce'.{lang_note}",
                linkedin_input
            )
            st.session_state["linkedin_result"] = result

    if "linkedin_result" in st.session_state:
        st.markdown('<div class="output-section">' + st.session_state["linkedin_result"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)
        output_actions("linkedin_post", st.session_state["linkedin_result"], "LinkedIn Post",
                      show_linkedin=True)

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Job Decoder
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🔍 Job Decoder":
    st.markdown("## 🔍 Job Description Decoder")
    st.caption("Paste any job posting. Understand what they really want, spot red flags, and know exactly how to apply.")

    decoder_jd = st.text_area("Paste the full job description", height=300, placeholder="Paste any job posting here...")

    if st.button("🔍 Decode This Job Posting"):
        if not decoder_jd:
            st.warning("Please paste a job description.")
        else:
            lang_note = lang_instruction(selected_lang)
            result = call_claude(
                f"You are a career expert who decodes job postings. Analyze and provide:\n1. WHAT THEY REALLY WANT (translate corporate speak to plain language)\n2. MUST-HAVE vs NICE-TO-HAVE skills\n3. RED FLAGS (max 3, or say 'None spotted')\n4. WHAT TO HIGHLIGHT in your application\n5. SALARY RANGE ESTIMATE (based on role/seniority, mention if Indian market or global)\n6. 3 SMART INTERVIEW QUESTIONS to ask them\nBe direct and honest.{lang_note}",
                f"Job description:\n{decoder_jd}"
            )
            st.session_state["decoder_result"] = result

    if "decoder_result" in st.session_state:
        st.markdown('<div class="output-section">' + st.session_state["decoder_result"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)
        output_actions("job_decoder", st.session_state["decoder_result"], "Job Posting Analysis")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Apply in One Click
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🚀 Apply in One Click":
    st.markdown("## 🚀 Apply in One Click")
    st.caption("Paste the job posting + your details. Get a complete application package — cover letter, email, and direct apply links — in one go.")

    col1, col2 = st.columns(2)
    with col1:
        apply_jd = st.text_area("Job description", height=220, placeholder="Paste the full job posting here...")
        apply_url = st.text_input("Job application URL (if available)", placeholder="https://careers.company.com/job/123")
        apply_company_email = st.text_input("HR email (if known)", placeholder="hr@company.com")
    with col2:
        apply_resume = st.text_area("Your resume / key details", height=220, placeholder="Paste your resume or key experience here...")
        apply_name = st.text_input("Your full name")
        apply_email = st.text_input("Your email")

    if st.button("🚀 Generate Complete Application Package"):
        if not apply_jd or not apply_resume:
            st.warning("Please fill in the job description and your details.")
        else:
            lang_note = lang_instruction(selected_lang)

            with st.spinner("Generating your full application package..."):
                # Cover letter
                cover = call_claude(
                    f"Write a compelling 3-paragraph cover letter. Do not start with 'I am writing to'. Be specific and human.{lang_note}",
                    f"Candidate: {apply_name}\nEmail: {apply_email}\nJob:\n{apply_jd}\nResume:\n{apply_resume}"
                )
                # Email
                email_body = call_claude(
                    f"Write a short, professional job application email (not the cover letter — just the email body to send WITH the cover letter attached). 3-4 sentences max. Confident and direct.{lang_note}",
                    f"Candidate: {apply_name}\nEmail: {apply_email}\nJob posting:\n{apply_jd[:500]}"
                )
                # Key talking points
                talking_pts = call_claude(
                    f"Give 5 bullet points: the strongest things this candidate should emphasize in their application for this role. Be specific.{lang_note}",
                    f"Job:\n{apply_jd}\nCandidate:\n{apply_resume}"
                )

            st.session_state["apply_cover"] = cover
            st.session_state["apply_email"] = email_body
            st.session_state["apply_points"] = talking_pts
            st.session_state["apply_jd_text"] = apply_jd
            st.session_state["apply_name"] = apply_name
            st.session_state["apply_url"] = apply_url
            st.session_state["apply_company_email"] = apply_company_email

    if "apply_cover" in st.session_state:
        st.markdown("### 📦 Your Application Package")

        with st.expander("✉️ Cover Letter", expanded=True):
            st.markdown('<div class="output-section">' + st.session_state["apply_cover"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)
            docx_buf = save_to_docx("Cover Letter", st.session_state["apply_cover"], "cover_letter")
            st.download_button("⬇️ Download Cover Letter (.docx)", data=docx_buf, file_name="cover_letter.docx",
                             mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", key="dl_cover_apply")

        with st.expander("📧 Application Email", expanded=True):
            st.markdown('<div class="output-section">' + st.session_state["apply_email"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)

        with st.expander("💡 Key Talking Points", expanded=True):
            st.markdown('<div class="output-section">' + st.session_state["apply_points"].replace('\n', '<br>') + '</div>', unsafe_allow_html=True)

        # Apply links
        st.markdown("### 🚀 Apply Now")
        st.markdown('<div class="apply-box"><h4>Quick Apply Links</h4>', unsafe_allow_html=True)

        links_html = ""
        if st.session_state.get("apply_url"):
            links_html += f'<a class="apply-link" href="{st.session_state["apply_url"]}" target="_blank">🔗 Apply on Company Site</a>'

        if st.session_state.get("apply_company_email"):
            subject = urllib.parse.quote(f"Application for role – {st.session_state.get('apply_name','')}")
            body = urllib.parse.quote(st.session_state["apply_email"][:1000])
            gmail_url = f"https://mail.google.com/mail/?view=cm&to={st.session_state['apply_company_email']}&su={subject}&body={body}"
            links_html += f'<a class="apply-link" href="{gmail_url}" target="_blank">✉️ Send Email via Gmail</a>'

        jd_keywords = urllib.parse.quote(st.session_state.get("apply_jd_text", "")[:50])
        links_html += f'<a class="apply-link" href="https://www.linkedin.com/jobs/search/?keywords={jd_keywords}" target="_blank">💼 Find on LinkedIn</a>'
        links_html += f'<a class="apply-link" href="https://www.naukri.com/jobs-in-india" target="_blank">🇮🇳 Search on Naukri</a>'
        links_html += f'<a class="apply-link" href="https://www.shine.com" target="_blank">✨ Search on Shine</a>'

        st.markdown(links_html + '</div>', unsafe_allow_html=True)
