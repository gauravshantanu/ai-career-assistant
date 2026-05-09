import { useState } from "react";
import Head from "next/head";

const TOOLS = [
  { id: "resume",    icon: "description",  label: "Resume Review",     desc: "Upload your resume and get AI-powered feedback, score, and improvements." },
  { id: "interview", icon: "forum",        label: "Mock Interview",    desc: "Practice real interview questions with live AI feedback." },
  { id: "cover",     icon: "mail",         label: "Cover Letter",      desc: "Generate a polished, human-sounding cover letter instantly." },
  { id: "linkedin",  icon: "share",        label: "LinkedIn Post",     desc: "Turn your achievements into viral LinkedIn posts." },
  { id: "decoder",   icon: "analytics",    label: "Job Decoder",       desc: "Understand what any job posting really wants." },
  { id: "apply",     icon: "touch_app",    label: "Apply One-Click",   desc: "Get a full application package in one go." },
  { id: "jobs",      icon: "search",       label: "Job Finder",        desc: "AI matches your profile to jobs on top portals." },
  { id: "career",    icon: "map",          label: "Career Path",       desc: "Get a detailed roadmap from where you are to where you want to be." },
  { id: "salary",    icon: "payments",     label: "Salary Coach",      desc: "Know your worth, negotiate confidently, write counter offers." },
  { id: "history",   icon: "history",      label: "My History",        desc: "All your generated content saved in one place." },
];

const LANGS = ["English","Hindi","Tamil","Telugu","Bengali","Marathi","Kannada","Malayalam","Gujarati","Urdu","Spanish","French"];

export default function Home() {
  const [active, setActive] = useState("resume");
  const [lang, setLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  // Interview state
  const [intHistory, setIntHistory] = useState([]);
  const [intStarted, setIntStarted] = useState(false);
  const [intRole, setIntRole] = useState("");
  const [intLevel, setIntLevel] = useState("Mid (2-5 yrs)");
  const [intType, setIntType] = useState("General / behavioral");
  const [intAns, setIntAns] = useState("");

  // Salary tab
  const [salTab, setSalTab] = useState(0);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function callAI(tool, data) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, data, lang }),
      });
      const json = await res.json();
      if (json.error) { showToast(json.error, "error"); return null; }
      setHistory(h => [{ tool, time: new Date().toLocaleString(), output: json.result, summary: data.summary || tool }, ...h].slice(0, 50));
      showToast("✓ Done!", "success");
      return json.result;
    } catch (e) {
      showToast(e.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  const tool = TOOLS.find(t => t.id === active);

  return (
    <>
      <Head>
        <title>CareerAI — {tool?.label}</title>
      </Head>

      <style suppressHydrationWarning>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:Inter,-apple-system,sans-serif;background:#f5f5f7;color:#1d1d1f;-webkit-font-smoothing:antialiased;}
        :root{--primary:#0071e3;--primary-dark:#0077ed;--surf:#f5f5f7;--card:#fff;--border:rgba(193,198,214,0.3);--muted:#6e6e73;--sidebar:256px;--nav:52px;}
        nav{position:fixed;top:0;left:0;right:0;height:var(--nav);z-index:999;background:rgba(249,249,255,0.88);backdrop-filter:blur(20px);border-bottom:0.5px solid rgba(193,198,214,0.4);display:flex;align-items:center;justify-content:space-between;padding:0 24px;}
        .brand{font-size:20px;font-weight:700;color:#1d1d1f;letter-spacing:-0.02em;}
        .brand span{color:var(--primary);}
        .nav-right{display:flex;align-items:center;gap:10px;}
        .lang-sel{border:1px solid rgba(193,198,214,0.5);border-radius:8px;padding:5px 10px;font-size:13px;background:var(--card);font-family:Inter,sans-serif;cursor:pointer;}
        aside{position:fixed;left:0;top:var(--nav);bottom:0;width:var(--sidebar);background:#f2f3fd;border-right:0.5px solid rgba(193,198,214,0.4);overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:2px;}
        .sidebar-hd{padding:8px 4px 14px;}
        .sidebar-title{font-size:18px;font-weight:700;color:var(--primary);letter-spacing:-0.01em;}
        .sidebar-sub{font-size:12px;color:var(--muted);margin-top:2px;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#414753;font-size:13px;font-weight:500;cursor:pointer;transition:background .15s,color .15s;border:none;background:transparent;width:100%;text-align:left;}
        .nav-item:hover{background:#e0e2ec;color:#1d1d1f;}
        .nav-item.active{background:#e0dfe4;color:#626267;font-weight:700;}
        .nav-item .ms{font-size:20px;flex-shrink:0;}
        main{margin-left:var(--sidebar);padding-top:var(--nav);}
        .content{max-width:1100px;padding:40px 48px 80px;}
        .page-title{font-size:40px;font-weight:700;color:#1d1d1f;letter-spacing:-0.022em;line-height:1.1;margin-bottom:8px;}
        .page-sub{font-size:16px;color:var(--muted);margin-bottom:28px;line-height:1.5;}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
        .card{background:var(--card);border-radius:16px;border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.04);padding:24px;margin-bottom:16px;}
        .card-title{font-size:18px;font-weight:600;color:#1d1d1f;margin-bottom:16px;letter-spacing:-0.01em;}
        label{display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px;letter-spacing:0.01em;}
        input,textarea,select{width:100%;background:var(--card);border:1px solid rgba(193,198,214,0.6);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:14px;color:#1d1d1f;outline:none;transition:border .15s,box-shadow .15s;}
        input:focus,textarea:focus,select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(0,113,227,0.12);}
        textarea{resize:vertical;line-height:1.5;}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23717785' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;}
        .form-group{margin-bottom:14px;}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:8px;font-family:Inter,sans-serif;font-size:15px;font-weight:600;cursor:pointer;border:none;transition:all .15s;letter-spacing:-0.01em;}
        .btn-primary{background:var(--primary);color:#fff;width:100%;}
        .btn-primary:hover{background:var(--primary-dark);}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
        .btn-secondary{background:#e0dfe4;color:#626267;font-size:13px;padding:6px 14px;}
        .btn-secondary:hover{background:#d1d0d5;}
        .output{background:var(--card);border-radius:16px;border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.04);padding:24px;margin-top:16px;}
        .output-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:12px;}
        .output-text{font-size:14px;line-height:1.7;white-space:pre-wrap;color:#1d1d1f;}
        .action-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid rgba(193,198,214,0.4);}
        .bubble-ai{background:var(--card);border:0.5px solid rgba(193,198,214,0.5);border-radius:12px 12px 12px 4px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:14px 18px;max-width:84%;font-size:14px;line-height:1.6;margin-bottom:8px;}
        .bubble-user{background:var(--primary);color:#fff;border-radius:12px 12px 4px 12px;padding:14px 18px;max-width:84%;margin-left:auto;font-size:14px;line-height:1.6;margin-bottom:8px;}
        .chat-wrap{max-height:420px;overflow-y:auto;margin:16px 0;display:flex;flex-direction:column;}
        .tabs{display:flex;background:#ecedf7;border-radius:8px;padding:4px;gap:2px;margin-bottom:20px;}
        .tab-btn{flex:1;padding:8px;border:none;border-radius:6px;background:transparent;color:var(--muted);font-family:Inter,sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;}
        .tab-btn.active{background:var(--primary);color:#fff;font-weight:600;}
        .apply-link{display:inline-flex;align-items:center;background:#e0dfe4;color:#626267;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;margin:4px 3px;transition:all .15s;}
        .apply-link:hover{background:#d1d0d5;color:#1d1d1f;}
        .upload-zone{border:2px dashed rgba(193,198,214,0.6);border-radius:12px;padding:28px;text-align:center;cursor:pointer;background:rgba(242,243,253,0.5);transition:border-color .15s;margin-bottom:12px;}
        .upload-zone:hover{border-color:var(--primary);}
        .empty{text-align:center;padding:64px 32px;color:var(--muted);}
        .hist-item{background:var(--card);border-radius:12px;border:1px solid var(--border);margin-bottom:10px;overflow:hidden;}
        .hist-head{padding:14px 20px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:500;}
        .hist-head:hover{background:#f5f5f7;}
        .hist-body{padding:20px;border-top:1px solid var(--border);}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .toast{position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;animation:slideIn .25s ease;max-width:360px;}
        .toast-success{background:#0059b5;color:#fff;}
        .toast-error{background:#ba1a1a;color:#fff;}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        .q-label{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.05em;display:block;margin-bottom:6px;}
        @media(max-width:768px){aside{display:none;}main{margin-left:0;}.grid2,.grid3{grid-template-columns:1fr;}.content{padding:20px;}}
      `}</style>

      {/* Loading overlay */}
      {loading && (
        <div style={{position:"fixed",inset:0,background:"rgba(255,255,255,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
          <div style={{width:40,height:40,border:"3px solid #e0e2ec",borderTopColor:"#0071e3",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          <p style={{fontSize:15,color:"#6e6e73",fontWeight:500}}>Generating with AI...</p>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Nav */}
      <nav>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="brand">Career<span>AI</span></span>
        </div>
        <div className="nav-right">
          <select className="lang-sel" value={lang} onChange={e=>setLang(e.target.value)}>
            {LANGS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
      </nav>

      {/* Sidebar */}
      <aside>
        <div className="sidebar-hd">
          <div className="sidebar-title">Career Suite</div>
          <div className="sidebar-sub">AI-Powered Tools</div>
        </div>
        {TOOLS.map(t=>(
          <button key={t.id} className={`nav-item${active===t.id?" active":""}`} onClick={()=>setActive(t.id)}>
            <span className="material-symbols-outlined ms">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main>
        <div className="content">
          {active !== "history" && <>
            <h1 className="page-title">{tool?.label}</h1>
            <p className="page-sub">{tool?.desc}</p>
          </>}

          {/* ── RESUME ── */}
          {active==="resume" && <ResumeTab callAI={callAI} showToast={showToast}/>}

          {/* ── INTERVIEW ── */}
          {active==="interview" && (
            <div style={{maxWidth:680}}>
              {!intStarted ? (
                <div className="card">
                  <div className="card-title">Setup Interview</div>
                  <div className="grid3">
                    <div className="form-group"><label>Job Role</label><input value={intRole} onChange={e=>setIntRole(e.target.value)} placeholder="e.g. Data Analyst"/></div>
                    <div className="form-group"><label>Experience Level</label>
                      <select value={intLevel} onChange={e=>setIntLevel(e.target.value)}>
                        <option>Entry (0-2 yrs)</option><option>Mid (2-5 yrs)</option><option>Senior (5+ yrs)</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Interview Type</label>
                      <select value={intType} onChange={e=>setIntType(e.target.value)}>
                        <option>General / behavioral</option><option>Technical</option><option>Case study</option><option>HR round</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary" disabled={loading} onClick={async()=>{
                    if(!intRole){showToast("Enter a job role","error");return;}
                    const res=await callAI("interview",{answer:"Start the interview.",history:[],role:intRole,level:intLevel,type:intType,summary:`${intRole} interview`});
                    if(res){setIntHistory([{role:"assistant",content:res}]);setIntStarted(true);}
                  }}>
                    {loading?<span className="spinner"/>:<span className="material-symbols-outlined" style={{fontSize:18}}>play_arrow</span>}
                    Start Interview
                  </button>
                </div>
              ) : (
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <span style={{fontWeight:600,fontSize:15}}>Live Interview — {intRole}</span>
                    <button className="btn btn-secondary" onClick={()=>{setIntStarted(false);setIntHistory([]);setIntRole("");}}>Reset</button>
                  </div>
                  <div className="chat-wrap">
                    {intHistory.map((m,i)=>(
                      <div key={i}>
                        {m.role==="assistant" && <div className="bubble-ai"><span className="q-label">Q{Math.ceil((i+1)/2)}</span>{m.content}</div>}
                        {m.role==="user" && m.content!=="Start the interview." && <div className="bubble-user">{m.content}</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <input value={intAns} onChange={e=>setIntAns(e.target.value)} placeholder="Type your answer..." style={{flex:1}}
                      onKeyDown={async e=>{
                        if(e.key==="Enter"&&!loading&&intAns.trim()){
                          const ans=intAns;setIntAns("");
                          const newHist=[...intHistory,{role:"user",content:ans}];
                          setIntHistory(newHist);
                          const res=await callAI("interview",{answer:ans,history:newHist.slice(0,-1),role:intRole,level:intLevel,type:intType,summary:`${intRole} interview`});
                          if(res)setIntHistory(h=>[...h,{role:"assistant",content:res}]);
                        }
                      }}/>
                    <button className="btn btn-primary" style={{width:"auto",padding:"10px 20px"}} disabled={loading} onClick={async()=>{
                      if(!intAns.trim()||loading)return;
                      const ans=intAns;setIntAns("");
                      const newHist=[...intHistory,{role:"user",content:ans}];
                      setIntHistory(newHist);
                      const res=await callAI("interview",{answer:ans,history:newHist.slice(0,-1),role:intRole,level:intLevel,type:intType,summary:`${intRole} interview`});
                      if(res)setIntHistory(h=>[...h,{role:"assistant",content:res}]);
                    }}>Send ↗</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COVER LETTER ── */}
          {active==="cover" && <CoverTab callAI={callAI} loading={loading}/>}

          {/* ── LINKEDIN ── */}
          {active==="linkedin" && <LinkedInTab callAI={callAI} loading={loading}/>}

          {/* ── JOB DECODER ── */}
          {active==="decoder" && <DecoderTab callAI={callAI} loading={loading}/>}

          {/* ── APPLY ── */}
          {active==="apply" && <ApplyTab callAI={callAI} loading={loading} showToast={showToast}/>}

          {/* ── JOB FINDER ── */}
          {active==="jobs" && <JobsTab callAI={callAI} loading={loading}/>}

          {/* ── CAREER PATH ── */}
          {active==="career" && <CareerTab callAI={callAI} loading={loading}/>}

          {/* ── SALARY ── */}
          {active==="salary" && (
            <div>
              <div className="tabs">
                {["💰 Know Your Worth","🗣 Negotiation Script","📧 Counter Offer Email"].map((t,i)=>(
                  <button key={i} className={`tab-btn${salTab===i?" active":""}`} onClick={()=>setSalTab(i)}>{t}</button>
                ))}
              </div>
              {salTab===0 && <SalaryWorthTab callAI={callAI} loading={loading}/>}
              {salTab===1 && <SalaryScriptTab callAI={callAI} loading={loading}/>}
              {salTab===2 && <SalaryEmailTab callAI={callAI} loading={loading}/>}
            </div>
          )}

          {/* ── HISTORY ── */}
          {active==="history" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div><h1 className="page-title">My History</h1><p className="page-sub">{history.length} saved items</p></div>
                {history.length>0 && <button className="btn btn-secondary" onClick={()=>setHistory([])}>🗑 Clear All</button>}
              </div>
              {history.length===0 ? (
                <div className="empty">
                  <span className="material-symbols-outlined" style={{fontSize:52,color:"#c1c6d6",display:"block",marginBottom:16}}>history</span>
                  <p style={{fontWeight:600,fontSize:18,color:"#1d1d1f",marginBottom:8}}>No history yet</p>
                  <p>Use any tool and your results will be saved here.</p>
                </div>
              ) : history.map((h,i)=>(
                <HistItem key={i} item={h}/>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── Output component ──
function Output({result, title="Result"}) {
  const [open, setOpen] = useState(true);
  if(!result) return null;
  const encoded = encodeURIComponent(result.slice(0,1500));
  const gdoc = `https://docs.google.com/document/create?title=${encodeURIComponent(title)}`;
  return (
    <div className="output">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span className="output-label">AI Result</span>
        <button className="btn btn-secondary" onClick={()=>navigator.clipboard.writeText(result)}>⎘ Copy</button>
      </div>
      <div className="output-text">{result}</div>
      <div className="action-bar">
        <a className="apply-link" href={gdoc} target="_blank" rel="noreferrer">📄 Google Docs</a>
        <button className="btn btn-secondary" onClick={()=>{
          const b=new Blob([result],{type:"text/plain"});
          const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`${title}.txt`;a.click();
        }}>⬇ .txt</button>
      </div>
    </div>
  );
}

// ── History item ──
function HistItem({item}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hist-item">
      <div className="hist-head" onClick={()=>setOpen(o=>!o)}>
        <span>{item.tool} · {item.time} — {item.summary?.slice(0,60)}...</span>
        <span className="material-symbols-outlined" style={{fontSize:18,color:"#717785"}}>expand_more</span>
      </div>
      {open && <div className="hist-body"><div className="output-text">{item.output}</div></div>}
    </div>
  );
}

// ── Resume Tab ──
function ResumeTab({callAI, showToast}) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Your Resume</div>
          <div className="upload-zone" onClick={()=>document.getElementById("res-file").click()}>
            <span className="material-symbols-outlined" style={{fontSize:36,color:"#0071e3",display:"block",marginBottom:8}}>upload_file</span>
            <p style={{fontWeight:600,fontSize:14}}>Drop your resume here</p>
            <p style={{fontSize:12,color:"#6e6e73",marginTop:4}}>PDF, DOCX up to 10MB</p>
            <input type="file" id="res-file" accept=".pdf,.docx,.txt" style={{display:"none"}} onChange={e=>{
              const f=e.target.files[0];if(!f)return;
              const r=new FileReader();r.onload=ev=>setResume(ev.target.result.slice(0,8000));r.readAsText(f);
            }}/>
          </div>
          <div className="form-group"><label>Or paste resume text</label><textarea rows={6} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste resume text here..."/></div>
        </div>
        <div className="card">
          <div className="card-title">Job Description</div>
          <div className="form-group"><textarea rows={10} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the job posting here..."/></div>
          <button className="btn btn-primary" disabled={loading} onClick={async()=>{
            if(!resume||!jd){showToast("Add resume and job description","error");return;}
            setLoading(true);
            const r=await callAI("resume",{resume,jd,summary:"Resume reviewed"});
            if(r)setResult(r);setLoading(false);
          }}>
            {loading?<span className="spinner"/>:<span className="material-symbols-outlined" style={{fontSize:18}}>auto_fix_high</span>}
            Analyze Resume
          </button>
        </div>
      </div>
      <Output result={result} title="Resume Review"/>
    </div>
  );
}

// ── Cover Letter Tab ──
function CoverTab({callAI, loading}) {
  const [jd,setJd]=useState("");const [name,setName]=useState("");const [email,setEmail]=useState("");
  const [company,setCompany]=useState("");const [about,setAbout]=useState("");const [tone,setTone]=useState("Professional & formal");
  const [result,setResult]=useState("");
  return (
    <div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Job Details</div>
          <div className="form-group"><label>Job Description</label><textarea rows={7} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste job posting..."/></div>
          <div className="form-group"><label>Company Name</label><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google"/></div>
          <div className="form-group"><label>Tone</label>
            <select value={tone} onChange={e=>setTone(e.target.value)}>
              <option>Professional & formal</option><option>Friendly & conversational</option><option>Confident & bold</option><option>Humble & enthusiastic</option>
            </select>
          </div>
        </div>
        <div className="card">
          <div className="card-title">About You</div>
          <div className="form-group"><label>Full Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
          <div className="form-group"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
          <div className="form-group"><label>Skills & Experience</label><textarea rows={5} value={about} onChange={e=>setAbout(e.target.value)} placeholder="Your key skills and experience..."/></div>
          <button className="btn btn-primary" disabled={loading} onClick={async()=>{
            const r=await callAI("cover",{jd,name,email,company,about,tone,summary:"Cover letter"});
            if(r)setResult(r);
          }}>
            {loading?<span className="spinner"/>:"✨"} Generate Cover Letter
          </button>
        </div>
      </div>
      {result && <Output result={result} title="Cover Letter"/>}
    </div>
  );
}

// ── LinkedIn Tab ──
function LinkedInTab({callAI, loading}) {
  const [topic,setTopic]=useState("");const [ptype,setPtype]=useState("Career milestone");const [style,setStyle]=useState("Storytelling");
  const [result,setResult]=useState("");
  return (
    <div style={{maxWidth:680}}>
      <div className="card">
        <div className="card-title">Create LinkedIn Post</div>
        <div className="grid2">
          <div className="form-group"><label>Post Type</label>
            <select value={ptype} onChange={e=>setPtype(e.target.value)}>
              <option>Career milestone</option><option>New job announcement</option><option>Lesson learned</option><option>Project showcase</option><option>Thought leadership</option>
            </select>
          </div>
          <div className="form-group"><label>Writing Style</label>
            <select value={style} onChange={e=>setStyle(e.target.value)}>
              <option>Storytelling</option><option>Professional</option><option>Casual & relatable</option><option>Inspirational</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>What's it about?</label><textarea rows={5} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Describe your achievement or thought..."/></div>
        <button className="btn btn-primary" disabled={loading} onClick={async()=>{
          const r=await callAI("linkedin",{topic,ptype,style,summary:"LinkedIn post"});
          if(r)setResult(r);
        }}>
          {loading?<span className="spinner"/>:"✨"} Generate Post
        </button>
      </div>
      {result && (
        <div className="output">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span className="output-label">AI Result</span>
            <button className="btn btn-secondary" onClick={()=>navigator.clipboard.writeText(result)}>⎘ Copy</button>
          </div>
          <div className="output-text">{result}</div>
          <div className="action-bar">
            <a className="apply-link" href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(result.slice(0,700))}`} target="_blank" rel="noreferrer">🔗 Share on LinkedIn</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Decoder Tab ──
function DecoderTab({callAI, loading}) {
  const [jd,setJd]=useState("");const [result,setResult]=useState("");
  return (
    <div style={{maxWidth:780}}>
      <div className="card">
        <div className="card-title">Paste Job Posting</div>
        <div className="form-group"><textarea rows={10} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the full job description here..."/></div>
        <button className="btn btn-primary" disabled={loading} onClick={async()=>{
          const r=await callAI("decoder",{jd,summary:"Job decoded"});if(r)setResult(r);
        }}>
          {loading?<span className="spinner"/>:"🔍"} Decode This Job
        </button>
      </div>
      <Output result={result} title="Job Analysis"/>
    </div>
  );
}

// ── Apply Tab ──
function ApplyTab({callAI, loading, showToast}) {
  const [jd,setJd]=useState("");const [resume,setResume]=useState("");const [name,setName]=useState("");
  const [email,setEmail]=useState("");const [url,setUrl]=useState("");const [hr,setHr]=useState("");
  const [pkg,setPkg]=useState(null);
  return (
    <div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Job Details</div>
          <div className="form-group"><label>Job Description</label><textarea rows={8} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste job posting..."/></div>
          <div className="form-group"><label>Job URL (optional)</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/></div>
          <div className="form-group"><label>HR Email (optional)</label><input value={hr} onChange={e=>setHr(e.target.value)} placeholder="hr@company.com"/></div>
        </div>
        <div className="card">
          <div className="card-title">Your Details</div>
          <div className="form-group"><label>Resume / Key Info</label><textarea rows={6} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste resume..."/></div>
          <div className="form-group"><label>Full Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
          <div className="form-group"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
          <button className="btn btn-primary" disabled={loading} onClick={async()=>{
            if(!jd||!resume){showToast("Fill in job description and resume","error");return;}
            const r=await callAI("apply",{jd,resume,name,email,url,hr,summary:"Application package"});
            if(r){try{setPkg(JSON.parse(r));}catch{showToast("Parse error","error");}}
          }}>
            {loading?<span className="spinner"/>:"🚀"} Generate Package
          </button>
        </div>
      </div>
      {pkg && (
        <div>
          <div className="card"><div className="card-title">✉️ Cover Letter</div><div className="output-text">{pkg.cover}</div></div>
          <div className="card"><div className="card-title">📧 Application Email</div><div className="output-text">{pkg.email}</div></div>
          <div className="card"><div className="card-title">💡 Key Talking Points</div><div className="output-text">{pkg.points}</div></div>
          <div className="card"><div className="card-title">Quick Apply</div>
            <div>
              {url && <a className="apply-link" href={url} target="_blank" rel="noreferrer">🔗 Company Site</a>}
              {hr && <a className="apply-link" href={`https://mail.google.com/mail/?view=cm&to=${hr}&su=${encodeURIComponent("Job Application – "+name)}&body=${encodeURIComponent(pkg.email?.slice(0,1000)||"")}`} target="_blank" rel="noreferrer">✉️ Gmail</a>}
              <a className="apply-link" href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jd.slice(0,50))}`} target="_blank" rel="noreferrer">💼 LinkedIn</a>
              <a className="apply-link" href="https://www.naukri.com" target="_blank" rel="noreferrer">🇮🇳 Naukri</a>
              <a className="apply-link" href="https://www.shine.com" target="_blank" rel="noreferrer">✨ Shine</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Jobs Tab ──
function JobsTab({callAI, loading}) {
  const [resume,setResume]=useState("");const [role,setRole]=useState("");const [loc,setLoc]=useState("");
  const [exp,setExp]=useState("Mid (3-6 yrs)");const [result,setResult]=useState("");
  const roleQ=encodeURIComponent(role||"software engineer");const locQ=encodeURIComponent(loc||"India");
  return (
    <div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Your Resume</div>
          <div className="form-group"><textarea rows={8} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your resume text..."/></div>
        </div>
        <div className="card">
          <div className="card-title">Preferences</div>
          <div className="form-group"><label>Job Role</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/></div>
          <div className="form-group"><label>Location</label><input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="e.g. Bangalore, Remote"/></div>
          <div className="form-group"><label>Experience</label>
            <select value={exp} onChange={e=>setExp(e.target.value)}>
              <option>Fresher (0-1 yr)</option><option>Junior (1-3 yrs)</option><option>Mid (3-6 yrs)</option><option>Senior (6+ yrs)</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={loading} onClick={async()=>{
            const r=await callAI("jobs",{resume,role,location:loc,exp,summary:"Job search"});if(r)setResult(r);
          }}>
            {loading?<span className="spinner"/>:"🔎"} Find Matching Jobs
          </button>
        </div>
      </div>
      {result && <>
        <Output result={result} title="Job Analysis"/>
        <div className="card" style={{marginTop:0}}>
          <div className="card-title">Search on Job Portals</div>
          <div>
            <a className="apply-link" href={`https://www.naukri.com/jobs-in-india?k=${roleQ}&l=${locQ}`} target="_blank" rel="noreferrer">🇮🇳 Naukri</a>
            <a className="apply-link" href={`https://www.linkedin.com/jobs/search/?keywords=${roleQ}&location=${locQ}`} target="_blank" rel="noreferrer">💼 LinkedIn</a>
            <a className="apply-link" href={`https://www.indeed.com/jobs?q=${roleQ}&l=${locQ}`} target="_blank" rel="noreferrer">🔍 Indeed</a>
            <a className="apply-link" href={`https://www.shine.com/job-search/${roleQ}-jobs`} target="_blank" rel="noreferrer">✨ Shine</a>
            <a className="apply-link" href={`https://internshala.com/jobs/${roleQ}-jobs`} target="_blank" rel="noreferrer">🎓 Internshala</a>
            <a className="apply-link" href={`https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${roleQ}`} target="_blank" rel="noreferrer">🏢 Glassdoor</a>
            <a className="apply-link" href={`https://wellfound.com/jobs?query=${roleQ}`} target="_blank" rel="noreferrer">🚀 Wellfound</a>
          </div>
        </div>
      </>}
    </div>
  );
}

// ── Career Tab ──
function CareerTab({callAI, loading}) {
  const [role,setRole]=useState("");const [exp,setExp]=useState("");const [skills,setSkills]=useState("");
  const [goal,setGoal]=useState("");const [industry,setIndustry]=useState("Technology");const [timeline,setTimeline]=useState("2 years");
  const [result,setResult]=useState("");
  return (
    <div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Where You Are Now</div>
          <div className="form-group"><label>Current Job Role</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Junior Software Engineer"/></div>
          <div className="form-group"><label>Years of Experience</label><input value={exp} onChange={e=>setExp(e.target.value)} placeholder="e.g. 2 years"/></div>
          <div className="form-group"><label>Your Skills</label><textarea rows={4} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. Python, React, SQL..."/></div>
        </div>
        <div className="card">
          <div className="card-title">Where You Want to Go</div>
          <div className="form-group"><label>Dream Job / Goal</label><input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. CTO, Data Scientist"/></div>
          <div className="form-group"><label>Industry</label>
            <select value={industry} onChange={e=>setIndustry(e.target.value)}>
              <option>Technology</option><option>Finance</option><option>Marketing</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Consulting</option>
            </select>
          </div>
          <div className="form-group"><label>Timeline</label>
            <select value={timeline} onChange={e=>setTimeline(e.target.value)}>
              <option>6 months</option><option>1 year</option><option>2 years</option><option>3-5 years</option><option>5+ years</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={loading} onClick={async()=>{
            const r=await callAI("career",{role,exp,skills,goal,industry,timeline,summary:`Career path for ${role}`});if(r)setResult(r);
          }}>
            {loading?<span className="spinner"/>:"📈"} Show My Career Path
          </button>
        </div>
      </div>
      <Output result={result} title="Career Path Roadmap"/>
    </div>
  );
}

// ── Salary Tabs ──
function SalaryWorthTab({callAI, loading}) {
  const [role,setRole]=useState("");const [exp,setExp]=useState("");const [city,setCity]=useState("");
  const [skills,setSkills]=useState("");const [company,setCompany]=useState("");const [result,setResult]=useState("");
  return (
    <div className="grid2">
      <div className="card">
        <div className="form-group"><label>Job Role</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Data Analyst"/></div>
        <div className="form-group"><label>Years of Experience</label><input value={exp} onChange={e=>setExp(e.target.value)} placeholder="e.g. 4 years"/></div>
        <div className="form-group"><label>City</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Bangalore"/></div>
      </div>
      <div className="card">
        <div className="form-group"><label>Your Key Skills</label><textarea rows={3} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. Python, ML, SQL..."/></div>
        <div className="form-group"><label>Company (optional)</label><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Infosys"/></div>
        <button className="btn btn-primary" disabled={loading} onClick={async()=>{
          const r=await callAI("salary_worth",{role,exp,city,skills,company,summary:`Salary for ${role}`});if(r)setResult(r);
        }}>
          {loading?<span className="spinner"/>:"💰"} Check My Market Value
        </button>
        <Output result={result} title="Salary Analysis"/>
      </div>
    </div>
  );
}

function SalaryScriptTab({callAI, loading}) {
  const [offer,setOffer]=useState("");const [want,setWant]=useState("");const [role,setRole]=useState("");
  const [exp,setExp]=useState("");const [ach,setAch]=useState("");const [result,setResult]=useState("");
  return (
    <div className="grid2">
      <div className="card">
        <div className="form-group"><label>Offer Received (LPA)</label><input value={offer} onChange={e=>setOffer(e.target.value)} placeholder="e.g. 8 LPA"/></div>
        <div className="form-group"><label>What You Want (LPA)</label><input value={want} onChange={e=>setWant(e.target.value)} placeholder="e.g. 12 LPA"/></div>
        <div className="form-group"><label>Job Role</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Product Manager"/></div>
      </div>
      <div className="card">
        <div className="form-group"><label>Experience</label><input value={exp} onChange={e=>setExp(e.target.value)} placeholder="e.g. 5 years"/></div>
        <div className="form-group"><label>Your Achievements</label><textarea rows={4} value={ach} onChange={e=>setAch(e.target.value)} placeholder="e.g. Led team of 10..."/></div>
        <button className="btn btn-primary" disabled={loading} onClick={async()=>{
          const r=await callAI("salary_script",{offer,expect:want,role,exp,achievements:ach,summary:"Negotiation script"});if(r)setResult(r);
        }}>
          {loading?<span className="spinner"/>:"🗣"} Write My Script
        </button>
        <Output result={result} title="Negotiation Script"/>
      </div>
    </div>
  );
}

function SalaryEmailTab({callAI, loading}) {
  const [name,setName]=useState("");const [offer,setOffer]=useState("");const [want,setWant]=useState("");
  const [role,setRole]=useState("");const [company,setCompany]=useState("");const [why,setWhy]=useState("");
  const [result,setResult]=useState("");
  return (
    <div className="grid2">
      <div className="card">
        <div className="form-group"><label>Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></div>
        <div className="form-group"><label>Offer Received (LPA)</label><input value={offer} onChange={e=>setOffer(e.target.value)} placeholder="e.g. 8 LPA"/></div>
        <div className="form-group"><label>Counter Offer (LPA)</label><input value={want} onChange={e=>setWant(e.target.value)} placeholder="e.g. 12 LPA"/></div>
      </div>
      <div className="card">
        <div className="form-group"><label>Role</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Engineer"/></div>
        <div className="form-group"><label>Company</label><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Infosys"/></div>
        <div className="form-group"><label>Why You Deserve More</label><textarea rows={3} value={why} onChange={e=>setWhy(e.target.value)} placeholder="5 yrs experience, led major projects..."/></div>
        <button className="btn btn-primary" disabled={loading} onClick={async()=>{
          const r=await callAI("salary_email",{name,offer,counter:want,role,company,reason:why,summary:"Counter offer email"});if(r)setResult(r);
        }}>
          {loading?<span className="spinner"/>:"📧"} Write Counter Offer Email
        </button>
        <Output result={result} title="Counter Offer Email"/>
      </div>
    </div>
  );
}
