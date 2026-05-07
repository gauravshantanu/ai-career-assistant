import streamlit as st
from groq import Groq
import io
import os
from datetime import datetime
from docx import Document
from docx.shared import Pt, RGBColor
import urllib.parse

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(page_title="AI Career Assistant", page_icon="💼", layout="wide", initial_sidebar_state="collapsed")

# ── CSS ───────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
:root {
    --bg:#0a0a0f; --bg2:#111118; --card:#16161f;
    --gold:#c9a84c; --gold-l:#e8c97e; --gold-d:rgba(201,168,76,0.15);
    --text:#f0ede8; --muted:#9990a0;
    --border:rgba(201,168,76,0.2); --subtle:rgba(255,255,255,0.06);
}
html,body,[class*="css"]{font-family:'Inter',sans-serif!important;background:var(--bg)!important;color:var(--text)!important;}
.main,.block-container,[data-testid="stAppViewContainer"]{background:var(--bg)!important;}
.block-container{padding:0 2rem 2rem!important;max-width:1000px!important;}
#MainMenu,footer,header{visibility:hidden;}
[data-testid="stDecoration"],[data-testid="collapsedControl"]{display:none!important;}
section[data-testid="stSidebar"]{display:none!important;}

/* Navbar */
.navbar{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.5rem;background:rgba(17,17,24,.97);border-bottom:1px solid var(--subtle);margin:0 -2rem 0;gap:8px;flex-wrap:wrap;backdrop-filter:blur(20px);}
.nb-brand{font-family:'Playfair Display',serif;color:var(--gold);font-size:1.1rem;font-weight:700;white-space:nowrap;}
.nb-tools{display:flex;gap:6px;flex-wrap:wrap;}
.nb-btn{background:rgba(255,255,255,.04);color:var(--muted);border:1px solid var(--subtle);border-radius:8px;padding:7px 14px;font-size:13px;font-weight:500;white-space:nowrap;}
.nb-btn.on{background:var(--gold-d);color:var(--gold);border-color:rgba(201,168,76,.5);font-weight:600;}

/* Hero */
.hero{text-align:center;padding:2.5rem 1rem 1rem;}
.hero-badge{display:inline-block;background:var(--gold-d);color:var(--gold);border:1px solid var(--border);padding:5px 16px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin-bottom:1rem;}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;background:linear-gradient(135deg,#f0ede8 0%,var(--gold-l) 50%,#f0ede8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;margin-bottom:.5rem;}
.hero p{color:var(--muted);font-size:1rem;font-weight:300;margin-bottom:1.2rem;}
.hero-line{width:60px;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:0 auto 1.5rem;}

/* Admin box */
.admin-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1.4rem 1.6rem;margin:1rem 0 1.5rem;box-shadow:0 20px 60px rgba(0,0,0,.5);}
.admin-title{font-family:'Playfair Display',serif;color:var(--gold);font-size:1rem;font-weight:700;margin-bottom:1rem;}

/* Tool header */
.tool-header{display:flex;align-items:center;gap:12px;margin-bottom:.3rem;}
.tool-icon{width:38px;height:38px;background:var(--gold-d);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;}
.tool-title{font-family:'Playfair Display',serif!important;font-size:1.55rem!important;font-weight:700!important;color:var(--text)!important;}

/* Inputs */
.stTextArea textarea{background:var(--card)!important;border:1px solid var(--subtle)!important;border-radius:12px!important;color:var(--text)!important;font-family:'Inter',sans-serif!important;font-size:14px!important;}
.stTextArea textarea:focus{border-color:var(--gold)!important;box-shadow:0 0 0 2px var(--gold-d)!important;}
.stTextInput input{background:var(--card)!important;border:1px solid var(--subtle)!important;border-radius:10px!important;color:var(--text)!important;font-family:'Inter',sans-serif!important;}
.stTextInput input:focus{border-color:var(--gold)!important;box-shadow:0 0 0 2px var(--gold-d)!important;}
.stSelectbox>div>div{background:var(--card)!important;border:1px solid var(--subtle)!important;border-radius:10px!important;color:var(--text)!important;}
label{color:var(--muted)!important;font-size:12px!important;font-weight:500!important;letter-spacing:.05em!important;text-transform:uppercase!important;}

/* Gold action buttons */
.stButton>button{background:linear-gradient(135deg,var(--gold) 0%,#a87d30 100%)!important;color:#0a0a0f!important;border:none!important;border-radius:10px!important;font-family:'Inter',sans-serif!important;font-weight:600!important;font-size:14px!important;padding:.65rem 1.8rem!important;transition:all .25s!important;box-shadow:0 4px 20px rgba(201,168,76,.25)!important;}
.stButton>button:hover{transform:translateY(-2px)!important;box-shadow:0 8px 30px rgba(201,168,76,.4)!important;}
.stButton>button:active{transform:translateY(0)!important;}

/* Download buttons */
.stDownloadButton>button{background:var(--card)!important;color:var(--gold)!important;border:1px solid var(--border)!important;border-radius:8px!important;font-size:12px!important;font-weight:500!important;padding:.4rem 1rem!important;box-shadow:none!important;}
.stDownloadButton>button:hover{background:var(--gold-d)!important;transform:translateY(-1px)!important;}

/* Output */
.output-section{background:var(--card);border:1px solid var(--subtle);border-left:3px solid var(--gold);border-radius:0 14px 14px 0;padding:1.4rem 1.6rem;margin-top:1.2rem;font-size:15px;line-height:1.85;white-space:pre-wrap;color:var(--text);box-shadow:0 4px 30px rgba(0,0,0,.3);}

/* Chat */
.chat-ai{background:var(--card);border:1px solid var(--subtle);color:var(--text);border-radius:18px 18px 18px 4px;padding:12px 18px;margin:8px 15% 8px 0;font-size:14px;line-height:1.7;}
.chat-user{background:linear-gradient(135deg,var(--gold) 0%,#a87d30 100%);color:#0a0a0f;border-radius:18px 18px 4px 18px;padding:12px 18px;margin:8px 0 8px 15%;font-size:14px;line-height:1.7;font-weight:500;}

/* Apply */
.apply-box{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.6rem;margin-top:1.2rem;}
.apply-box h4{color:var(--gold)!important;font-family:'Playfair Display',serif!important;margin-bottom:1rem!important;}
.apply-link{display:inline-block;background:var(--gold-d);color:var(--gold);border:1px solid var(--border);padding:8px 18px;border-radius:8px;font-weight:600;text-decoration:none;margin:5px 4px;font-size:13px;transition:all .2s;}
.apply-link:hover{background:var(--gold);color:#0a0a0f;}

/* Misc */
hr{border-color:var(--subtle)!important;}
.stSuccess{background:rgba(201,168,76,.1)!important;border-color:var(--gold)!important;}
.stError{background:rgba(220,50,50,.1)!important;}
.stSpinner>div{border-top-color:var(--gold)!important;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
.lang-pill{display:inline-block;background:var(--card);color:var(--gold);border:1px solid var(--border);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;margin:3px;}
.streamlit-expanderHeader{background:var(--card)!important;color:var(--text)!important;}
</style>
""", unsafe_allow_html=True)

# ── Constants ─────────────────────────────────────────────────────────────────
LANGUAGES = {
    "English":"English","हिन्दी (Hindi)":"Hindi","தமிழ் (Tamil)":"Tamil",
    "తెలుగు (Telugu)":"Telugu","বাংলা (Bengali)":"Bengali","मराठी (Marathi)":"Marathi",
    "ಕನ್ನಡ (Kannada)":"Kannada","മലയാളം (Malayalam)":"Malayalam",
    "ગુજરાતી (Gujarati)":"Gujarati","اردو (Urdu)":"Urdu","Español":"Spanish","Français":"French",
}
TOOL_KEYS   = ["📄 Resume Review","🎤 Mock Interview","✉️ Cover Letter","💼 LinkedIn Post","🔍 Job Decoder","🚀 Apply in One Click"]
TOOL_LABELS = ["📄 Resume","🎤 Interview","✉️ Cover","💼 LinkedIn","🔍 Decoder","🚀 Apply"]
KEY_FILE       = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".groq_key")
ADMIN_PASSWORD = "admin@career2024"

# ── Session defaults ──────────────────────────────────────────────────────────
def _d(k,v):
    if k not in st.session_state: st.session_state[k]=v

def load_key():
    return open(KEY_FILE).read().strip() if os.path.exists(KEY_FILE) else ""

def save_key(k):
    open(KEY_FILE,"w").write(k)

_d("api_key", load_key())
_d("admin_logged_in", False)
_d("show_admin", False)
_d("active_tool", "📄 Resume Review")
_d("selected_lang", "English")
_d("interview_history", [])
_d("interview_started", False)

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_client():
    k = st.session_state.get("api_key","")
    if not k:
        st.error("⚠️ No API key. Click ⚙️ top-right → Admin → enter Groq key.")
        st.stop()
    return Groq(api_key=k)

def call_ai(system, user, history=None):
    msgs = [{"role":"system","content":system}]+(history or [])+[{"role":"user","content":user}]
    with st.spinner("✨ Generating..."):
        r = get_client().chat.completions.create(model="llama-3.3-70b-versatile", max_tokens=1500, messages=msgs)
    return r.choices[0].message.content

def ln():
    l = st.session_state["selected_lang"]
    return "" if l=="English" else f"\n\nIMPORTANT: Write ENTIRE response in {l}."

def mk_docx(title, text):
    doc = Document()
    h = doc.add_heading(title,0); h.runs[0].font.color.rgb=RGBColor(0x1a,0x1a,0x2e)
    p = doc.add_paragraph(f"Generated {datetime.now().strftime('%d %B %Y')}"); p.runs[0].font.size=Pt(10)
    doc.add_paragraph()
    for line in text.split("\n"):
        if line.strip(): doc.add_paragraph(line)
    buf=io.BytesIO(); doc.save(buf); buf.seek(0); return buf

def abar(key, text, title, gmail="", linkedin=False):
    st.markdown("---")
    c1,c2,c3,c4 = st.columns(4)
    with c1: st.download_button("⬇️ .docx", mk_docx(title,text), f"{key}.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document",key=f"d1_{key}")
    with c2: st.download_button("⬇️ .txt", text.encode(), f"{key}.txt","text/plain",key=f"d2_{key}")
    with c3:
        gdoc=f"https://docs.google.com/document/create?title={urllib.parse.quote(title)}"
        st.markdown(f'<a href="{gdoc}" target="_blank" style="display:inline-block;background:rgba(201,168,76,.12);color:#c9a84c;border:1px solid rgba(201,168,76,.3);padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">📄 Google Docs</a>',unsafe_allow_html=True)
    with c4:
        if gmail:
            gu=f"https://mail.google.com/mail/?view=cm&su={urllib.parse.quote(gmail)}&body={urllib.parse.quote(text[:1500])}"
            st.markdown(f'<a href="{gu}" target="_blank" style="display:inline-block;background:rgba(201,168,76,.12);color:#c9a84c;border:1px solid rgba(201,168,76,.3);padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">✉️ Gmail</a>',unsafe_allow_html=True)
        elif linkedin:
            lu=f"https://www.linkedin.com/feed/?shareActive=true&text={urllib.parse.quote(text[:700])}"
            st.markdown(f'<a href="{lu}" target="_blank" style="display:inline-block;background:rgba(201,168,76,.12);color:#c9a84c;border:1px solid rgba(201,168,76,.3);padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500;">🔗 LinkedIn</a>',unsafe_allow_html=True)

# ── Navbar (HTML display) ─────────────────────────────────────────────────────
active = st.session_state["active_tool"]
btns = "".join([f'<span class="nb-btn {"on" if active==TOOL_KEYS[i] else ""}">{TOOL_LABELS[i]}</span>' for i in range(len(TOOL_KEYS))])
st.markdown(f'<div class="navbar"><div class="nb-brand">💼 Career AI</div><div class="nb-tools">{btns}</div><span style="font-size:18px;cursor:pointer;opacity:.5;">⚙️</span></div>', unsafe_allow_html=True)

# Streamlit clickable buttons (invisible but functional)
st.markdown("""<style>
div[data-testid="stHorizontalBlock"]:nth-of-type(1) .stButton>button{
    opacity:0!important;height:1px!important;min-height:0!important;padding:0!important;
    margin:0!important;border:none!important;box-shadow:none!important;font-size:1px!important;
    position:absolute!important;width:1px!important;overflow:hidden!important;
}
div[data-testid="stHorizontalBlock"]:nth-of-type(1){height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;}
</style>""", unsafe_allow_html=True)

nb = st.columns(len(TOOL_KEYS)+1)
for i,lbl in enumerate(TOOL_LABELS):
    with nb[i]:
        if st.button(lbl, key=f"nb_{i}"):
            st.session_state["active_tool"] = TOOL_KEYS[i]
            st.rerun()
with nb[len(TOOL_KEYS)]:
    if st.button("⚙", key="nb_admin"):
        st.session_state["show_admin"] = not st.session_state["show_admin"]
        st.rerun()

tool = st.session_state["active_tool"]

# ── Hero ──────────────────────────────────────────────────────────────────────
pills = " ".join([f'<span class="lang-pill">{l.split("(")[0].strip()}</span>' for l in list(LANGUAGES.keys())[:6]])
st.markdown(f"""
<div class="hero">
<div class="hero-badge">✦ AI-Powered &nbsp;·&nbsp; 12 Languages &nbsp;·&nbsp; All-in-one</div>
<h1>AI Career Assistant</h1>
<p>Your personal job search toolkit — powered by cutting-edge AI</p>
<div class="hero-line"></div>
<div>Supports: {pills} <span class="lang-pill">+6 more</span></div>
</div>
""", unsafe_allow_html=True)

# ── Admin Panel ───────────────────────────────────────────────────────────────
if st.session_state["show_admin"]:
    st.markdown('<div class="admin-box"><div class="admin-title">⚙️ Admin Panel</div>', unsafe_allow_html=True)
    if not st.session_state["admin_logged_in"]:
        c1,c2 = st.columns([4,1])
        with c1: pw = st.text_input("Password", type="password", placeholder="Admin password", key="adm_pw")
        with c2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("Login", key="adm_login"):
                if pw == ADMIN_PASSWORD:
                    st.session_state["admin_logged_in"] = True; st.rerun()
                else: st.error("Wrong password")
    else:
        st.success("✅ Admin logged in")
        c1,c2,c3 = st.columns([4,1,1])
        with c1: nk = st.text_input("Groq API Key", type="password", value=st.session_state["api_key"], placeholder="gsk_...", key="adm_key")
        with c2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("💾 Save", key="adm_save"):
                if nk: st.session_state["api_key"]=nk; save_key(nk); st.success("Saved!")
        with c3:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("Logout", key="adm_out"):
                st.session_state["admin_logged_in"]=False; st.rerun()
        st.markdown("---")
        c1,c2 = st.columns([1,3])
        with c1: st.markdown('<p style="color:#9990a0;font-size:12px;padding-top:8px;">🌍 Language</p>', unsafe_allow_html=True)
        with c2:
            lc = st.selectbox("Lang", list(LANGUAGES.keys()), key="adm_lang")
            st.session_state["selected_lang"] = LANGUAGES[lc]
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("---")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Resume Review
# ─────────────────────────────────────────────────────────────────────────────
if tool == "📄 Resume Review":
    st.markdown('<div class="tool-header"><div class="tool-icon">📄</div><div class="tool-title">Resume Builder</div></div>', unsafe_allow_html=True)
    st.caption("Upload or paste your resume and job description. Get a score, improved bullet points, and skill gap analysis.")
    c1,c2 = st.columns(2)
    with c1:
        st.markdown("**Your Resume**")
        up = st.file_uploader("Upload PDF or Word", type=["pdf","docx"], key="res_up")
        rtxt = ""
        if up:
            if up.type == "application/pdf":
                try:
                    import pdfplumber
                    with pdfplumber.open(up) as pdf: rtxt="\n".join([p.extract_text() or "" for p in pdf.pages])
                    st.success(f"✅ {up.name}")
                except ImportError: st.warning("pdfplumber not installed")
            else:
                try:
                    from docx import Document as D2
                    rtxt="\n".join([p.text for p in D2(up).paragraphs if p.text.strip()])
                    st.success(f"✅ {up.name}")
                except Exception as e: st.error(str(e))
        paste = st.text_area("Or paste resume text", height=180, placeholder="Paste resume here...")
        if not rtxt and paste: rtxt=paste
        if rtxt: st.markdown(f'<div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:6px 12px;font-size:12px;color:#c9a84c;">✓ Resume ready — {len(rtxt)} chars</div>', unsafe_allow_html=True)
    with c2:
        jd = st.text_area("Job description", height=300, placeholder="Paste job posting here...")
    if st.button("✨ Review & Improve My Resume"):
        if not rtxt or not jd: st.warning("Add your resume and job description.")
        else:
            r = call_ai(f"Expert resume coach. Review resume vs job.\n1. MATCH SCORE (/10)\n2. TOP 3 IMPROVED BULLET POINTS\n3. SKILL GAPS (2-3)\n4. QUICK WINS (2 tips)\nBe specific.{ln()}", f"RESUME:\n{rtxt}\n\nJOB:\n{jd}")
            st.session_state["res_r"] = r
    if "res_r" in st.session_state:
        st.markdown('<div class="output-section">'+st.session_state["res_r"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        abar("resume", st.session_state["res_r"], "Resume Review", gmail="My Reviewed Resume")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Mock Interview
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🎤 Mock Interview":
    st.markdown('<div class="tool-header"><div class="tool-icon">🎤</div><div class="tool-title">Mock Interview</div></div>', unsafe_allow_html=True)
    st.caption("Practice real interview questions with AI feedback after every answer.")
    c1,c2,c3 = st.columns(3)
    with c1: role = st.text_input("Job role", placeholder="e.g. Data Analyst")
    with c2: lvl  = st.selectbox("Experience", ["Entry (0–2 yrs)","Mid (2–5 yrs)","Senior (5+ yrs)"])
    with c3: ityp = st.selectbox("Type", ["General / behavioral","Technical","Case study","HR round"])
    ca,cb = st.columns([1,3])
    with ca:
        if st.button("▶️ Start Interview"):
            if not role: st.warning("Enter a job role.")
            else:
                sys = f"Senior interviewer for {lvl} {role}, {ityp} interview. Ask ONE question at a time. Give 1-2 sentence feedback then next question. After 5 questions give overall score.{ln()}"
                q = call_ai(sys, "Start the interview.")
                st.session_state.update({"interview_history":[{"role":"user","content":"Start."},{"role":"assistant","content":q}],"interview_started":True,"interview_system":sys})
                st.rerun()
    with cb:
        if st.session_state["interview_started"] and st.button("🔄 Reset"):
            st.session_state.update({"interview_history":[],"interview_started":False}); st.rerun()
    if st.session_state["interview_started"] and st.session_state["interview_history"]:
        for m in st.session_state["interview_history"]:
            if m["role"]=="assistant": st.markdown(f'<div class="chat-ai">🤖 {m["content"].replace(chr(10),"<br>")}</div>', unsafe_allow_html=True)
            elif m["content"]!="Start.": st.markdown(f'<div class="chat-user">👤 {m["content"]}</div>', unsafe_allow_html=True)
        ans = st.text_input("Your answer", placeholder="Type your answer...", key="int_ans")
        if st.button("Send ↗") and ans:
            st.session_state["interview_history"].append({"role":"user","content":ans})
            r = call_ai(st.session_state["interview_system"], ans, history=st.session_state["interview_history"][:-1])
            st.session_state["interview_history"].append({"role":"assistant","content":r}); st.rerun()
        if len(st.session_state["interview_history"])>4:
            tr="\n\n".join([f"{'Interviewer' if m['role']=='assistant' else 'Candidate'}: {m['content']}" for m in st.session_state["interview_history"] if m["content"]!="Start."])
            abar("interview", tr, "Mock Interview Transcript")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Cover Letter
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "✉️ Cover Letter":
    st.markdown('<div class="tool-header"><div class="tool-icon">✉️</div><div class="tool-title">Cover Letter</div></div>', unsafe_allow_html=True)
    st.caption("Paste the job description and your details. Get a polished, human-sounding cover letter.")
    c1,c2 = st.columns(2)
    with c1:
        cjd=st.text_area("Job description", height=200, placeholder="Paste job posting...")
        cn=st.text_input("Your full name"); ce=st.text_input("Your email")
    with c2:
        ca2=st.text_area("About you", height=200, placeholder="Skills, achievements, experience...")
        ct=st.selectbox("Tone",["Professional & formal","Friendly & conversational","Confident & bold","Humble & enthusiastic"])
        cc=st.text_input("Company name (optional)")
    if st.button("✨ Generate Cover Letter"):
        if not cjd or not ca2: st.warning("Fill in job description and your details.")
        else:
            r=call_ai(f"Write a compelling {ct.lower()} cover letter. 3-4 paragraphs. Never start with 'I am writing to'. Be human and specific.{ln()}", f"Candidate:{cn}\nEmail:{ce}\nCompany:{cc or 'the company'}\nJob:\n{cjd}\nAbout:\n{ca2}")
            st.session_state["cov_r"]=r
    if "cov_r" in st.session_state:
        st.markdown('<div class="output-section">'+st.session_state["cov_r"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        abar("cover", st.session_state["cov_r"], "Cover Letter", gmail=f"Application – {cc or 'Job'} – {cn}")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: LinkedIn Post
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "💼 LinkedIn Post":
    st.markdown('<div class="tool-header"><div class="tool-icon">💼</div><div class="tool-title">LinkedIn Post</div></div>', unsafe_allow_html=True)
    st.caption("Describe your achievement in rough words — get a polished post that sounds like you.")
    li=st.text_area("What do you want to post about?", height=150, placeholder="e.g. Just got promoted...")
    c1,c2=st.columns(2)
    with c1: pt=st.selectbox("Post type",["Career milestone","New job","Lesson learned","Project achievement","Thought leadership"])
    with c2: ps=st.selectbox("Style",["Storytelling & personal","Professional & concise","Inspiring","Humble & grateful"])
    if st.button("✨ Write LinkedIn Post"):
        if not li: st.warning("Describe what you want to post about.")
        else:
            r=call_ai(f"Write a {ps.lower()} LinkedIn post about {pt.lower()}. Hook in line 1. Short paragraphs. 150-250 words. 3-5 hashtags. Never start with 'Thrilled','Humbled','Excited to announce'.{ln()}", li)
            st.session_state["li_r"]=r
    if "li_r" in st.session_state:
        st.markdown('<div class="output-section">'+st.session_state["li_r"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        abar("linkedin", st.session_state["li_r"], "LinkedIn Post", linkedin=True)

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Job Decoder
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🔍 Job Decoder":
    st.markdown('<div class="tool-header"><div class="tool-icon">🔍</div><div class="tool-title">Job Decoder</div></div>', unsafe_allow_html=True)
    st.caption("Paste any job posting. Understand what they really want, spot red flags, and know how to apply.")
    djd=st.text_area("Paste the full job description", height=300, placeholder="Paste job posting here...")
    if st.button("🔍 Decode This Job"):
        if not djd: st.warning("Paste a job description first.")
        else:
            r=call_ai(f"Decode this job posting:\n1. WHAT THEY REALLY WANT\n2. MUST-HAVE vs NICE-TO-HAVE\n3. RED FLAGS (max 3)\n4. WHAT TO HIGHLIGHT\n5. SALARY ESTIMATE\n6. 3 SMART QUESTIONS to ask{ln()}", f"Job:\n{djd}")
            st.session_state["dec_r"]=r
    if "dec_r" in st.session_state:
        st.markdown('<div class="output-section">'+st.session_state["dec_r"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        abar("decoder", st.session_state["dec_r"], "Job Analysis")

# ─────────────────────────────────────────────────────────────────────────────
# TOOL: Apply in One Click
# ─────────────────────────────────────────────────────────────────────────────
elif tool == "🚀 Apply in One Click":
    st.markdown('<div class="tool-header"><div class="tool-icon">🚀</div><div class="tool-title">Apply in One Click</div></div>', unsafe_allow_html=True)
    st.caption("Get a complete application package — cover letter, email, and talking points — in one go.")
    c1,c2=st.columns(2)
    with c1:
        ajd=st.text_area("Job description", height=220, placeholder="Paste job posting...")
        aurl=st.text_input("Job URL (optional)"); ahr=st.text_input("HR email (optional)")
    with c2:
        ares=st.text_area("Your resume / key details", height=220, placeholder="Paste resume or key experience...")
        an=st.text_input("Your full name"); ae=st.text_input("Your email")
    if st.button("🚀 Generate Application Package"):
        if not ajd or not ares: st.warning("Fill in job description and your details.")
        else:
            with st.spinner("Building your complete package..."):
                cov=call_ai(f"Write a 3-paragraph cover letter. Never start with 'I am writing to'. Be specific.{ln()}", f"Candidate:{an}\nJob:\n{ajd}\nResume:\n{ares}")
                em=call_ai(f"Write a short job application email body (3-4 sentences) to send with cover letter attached.{ln()}", f"Candidate:{an}\nJob:\n{ajd[:500]}")
                pts=call_ai(f"Give 5 bullet points: strongest things this candidate should emphasise.{ln()}", f"Job:\n{ajd}\nCandidate:\n{ares}")
            st.session_state.update({"ap_cov":cov,"ap_em":em,"ap_pts":pts,"ap_jd":ajd,"ap_url":aurl,"ap_hr":ahr,"ap_name":an})
    if "ap_cov" in st.session_state:
        with st.expander("✉️ Cover Letter", expanded=True):
            st.markdown('<div class="output-section">'+st.session_state["ap_cov"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
            st.download_button("⬇️ Download .docx", mk_docx("Cover Letter",st.session_state["ap_cov"]), "cover_letter.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document",key="dl_apcov")
        with st.expander("📧 Application Email", expanded=True):
            st.markdown('<div class="output-section">'+st.session_state["ap_em"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        with st.expander("💡 Key Talking Points", expanded=True):
            st.markdown('<div class="output-section">'+st.session_state["ap_pts"].replace('\n','<br>')+'</div>', unsafe_allow_html=True)
        st.markdown("### 🚀 Apply Now")
        st.markdown('<div class="apply-box"><h4>Quick Apply Links</h4>', unsafe_allow_html=True)
        lk=""
        if st.session_state.get("ap_url"): lk+=f'<a class="apply-link" href="{st.session_state["ap_url"]}" target="_blank">🔗 Company Site</a>'
        if st.session_state.get("ap_hr"):
            su=urllib.parse.quote(f"Job Application – {st.session_state.get('ap_name','')}"); bd=urllib.parse.quote(st.session_state["ap_em"][:1000])
            lk+=f'<a class="apply-link" href="https://mail.google.com/mail/?view=cm&to={st.session_state["ap_hr"]}&su={su}&body={bd}" target="_blank">✉️ Gmail</a>'
        kw=urllib.parse.quote(st.session_state.get("ap_jd","")[:50])
        lk+=f'<a class="apply-link" href="https://www.linkedin.com/jobs/search/?keywords={kw}" target="_blank">💼 LinkedIn</a>'
        lk+='<a class="apply-link" href="https://www.naukri.com" target="_blank">🇮🇳 Naukri</a>'
        lk+='<a class="apply-link" href="https://www.shine.com" target="_blank">✨ Shine</a>'
        st.markdown(lk+"</div>", unsafe_allow_html=True)
