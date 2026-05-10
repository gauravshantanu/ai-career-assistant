import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

/* ─── constants ─────────────────────────────────────────── */
const TOOLS = [
  { id:"resume",    icon:"description",    label:"Resume Review",    desc:"AI feedback, match score & improved bullets.",     badge:"Popular", badgeType:"cyan"   },
  { id:"interview", icon:"psychology",     label:"Mock Interview",   desc:"Live AI interview practice with scoring.",          badge:"Hot",     badgeType:"gold"   },
  { id:"cover",     icon:"mail_outline",   label:"Cover Letter",     desc:"Polished, human-sounding cover letters.",           badge:"",        badgeType:""       },
  { id:"linkedin",  icon:"share",          label:"LinkedIn Post",    desc:"Turn your wins into viral LinkedIn content.",       badge:"",        badgeType:""       },
  { id:"decoder",   icon:"analytics",      label:"Job Decoder",      desc:"Understand what any job posting really wants.",     badge:"New",     badgeType:"purple" },
  { id:"apply",     icon:"touch_app",      label:"One-Click Apply",  desc:"Full application package in one shot.",             badge:"",        badgeType:""       },
  { id:"jobs",      icon:"travel_explore", label:"Job Finder",       desc:"AI matches your profile to top openings.",          badge:"✦ Featured", badgeType:"cyan"   },
  { id:"career",    icon:"map",            label:"Career Path",      desc:"Detailed roadmap from where you are to your goal.", badge:"",        badgeType:""       },
  { id:"salary",    icon:"payments",       label:"Salary Coach",     desc:"Know your worth, negotiate with real data.",        badge:"",        badgeType:""       },
];

const LANGS = ["English","Hindi","Tamil","Telugu","Bengali","Marathi","Kannada","Malayalam","Gujarati","Urdu","Spanish","French"];

/* ─── helpers ───────────────────────────────────────────── */
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escJs(s){ return String(s||"").replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$/g,"\\$"); }

/* ─── sub-components ─────────────────────────────────────── */

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="orb" style={{width:420,height:420,background:"rgba(0,218,243,0.07)",top:"-8%",left:"-6%"}}/>
      <div className="orb orb-2" style={{width:360,height:360,background:"rgba(79,49,156,0.1)",bottom:"-8%",right:"-6%"}}/>
      <div className="orb orb-3" style={{width:260,height:260,background:"rgba(0,218,243,0.04)",top:"40%",right:"8%"}}/>
      <div className="particle-grid" style={{position:"absolute",inset:0,opacity:0.6}}/>
    </div>
  );
}

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_,i)=>(
        <div key={i} className="particle" style={{
          left: `${Math.random()*100}%`,
          "--dur": `${10+Math.random()*14}s`,
          "--delay": `${Math.random()*10}s`,
          width: Math.random()>0.7?"3px":"2px",
          height: Math.random()>0.7?"3px":"2px",
        }}/>
      ))}
    </div>
  );
}

function Toast({msg, type, onDone}) {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return ()=>clearTimeout(t); },[onDone]);
  return (
    <div className={`toast toast-${type}`}>
      <span className="ms" style={{fontSize:16}}>{type==="success"?"check_circle":"error"}</span>
      {msg}
    </div>
  );
}

function LoadingOverlay({show}) {
  if(!show) return null;
  return (
    <div id="loading-overlay">
      <div className="glass card text-center" style={{minWidth:0,padding:"32px 28px"}}>
        <div className="loader-ring" style={{margin:"0 auto 16px"}}/>
        <p className="font-mono" style={{fontSize:13,color:"var(--cyan)",marginBottom:4}}>AI Processing…</p>
        <p style={{fontSize:12,color:"var(--muted)"}}>Generating your result</p>
      </div>
    </div>
  );
}

function Output({result, title, extraActions}) {
  if(!result) return null;
  return (
    <div className="glass card animate-slideup" style={{marginTop:20}}>
      <div className="output-header">
        <div className="output-label">{title}</div>
        <div style={{display:"flex",gap:8}}>
          {extraActions}
          <button className="btn-icon" onClick={()=>navigator.clipboard.writeText(result)} title="Copy">
            <span className="ms" style={{fontSize:18}}>content_copy</span>
          </button>
          <button className="btn-icon" onClick={()=>{
            const b=new Blob([result],{type:"text/plain"});
            const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=title.replace(/\s+/g,"_")+".txt";a.click();
          }} title="Download">
            <span className="ms" style={{fontSize:18}}>download</span>
          </button>
        </div>
      </div>
      <div className="output-box">{result}</div>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────── */
function Sidebar({active, onNav, user, onLogout}) {
  const items = [
    {id:"home",      icon:"home",            label:"Home"},
    {id:"resume",    icon:"description",     label:"Resume Review"},
    {id:"interview", icon:"psychology",      label:"Mock Interview"},
    {id:"cover",     icon:"mail_outline",    label:"Cover Letter"},
    {id:"linkedin",  icon:"share",           label:"LinkedIn Post"},
    {id:"decoder",   icon:"analytics",       label:"Job Decoder"},
    {id:"apply",     icon:"touch_app",       label:"One-Click Apply"},
    {id:"jobs",      icon:"travel_explore",  label:"Job Finder"},
    {id:"career",    icon:"map",             label:"Career Path"},
    {id:"salary",    icon:"payments",        label:"Salary Coach"},
    {id:"history",   icon:"history",         label:"My History"},
  ];
  return (
    <aside id="sidebar" className="glass-dark" style={{padding:"28px 18px",display:"flex",flexDirection:"column"}}>
      {/* Brand */}
      <div style={{marginBottom:28,padding:"0 6px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div className="glow" style={{width:32,height:32,borderRadius:8,background:"var(--cyan)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span className="ms" style={{fontSize:18,color:"#001f24"}}>rocket_launch</span>
          </div>
          <h1 className="font-display glow-text" style={{fontSize:22,fontWeight:800,color:"var(--cyan)",letterSpacing:"-0.02em"}}>CareerAI</h1>
        </div>
        <p className="font-mono" style={{fontSize:10,color:"rgba(186,201,204,0.5)",letterSpacing:"0.1em",paddingLeft:42}}>AI CAREER ENGINE</p>
      </div>

      {/* Nav items */}
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
        <p className="ai-label" style={{padding:"0 6px",marginBottom:6}}>Navigation</p>
        {items.map(it=>(
          <a key={it.id} className={`nav-link${active===it.id?" active":""}`} onClick={()=>onNav(it.id)}>
            <span className="ms">{it.icon}</span>
            {it.label}
          </a>
        ))}
      </nav>

      {/* User section */}
      <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(59,73,76,0.4)"}}>
        <div
          className="hover-lift"
          onClick={()=>onNav("profile")}
          style={{display:"flex",alignItems:"center",gap:12,padding:"10px 10px",borderRadius:12,cursor:"pointer",marginBottom:6,transition:"background 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(36,43,45,0.8)"}
          onMouseLeave={e=>e.currentTarget.style.background=""}
        >
          <div className="avatar-ring" style={{width:38,height:38}}>
            <div className="avatar-inner" style={{width:32,height:32,fontSize:15,fontWeight:700,color:"var(--cyan)",fontFamily:"Syne"}}>
              {(user.name||"A").charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:600,color:"var(--on)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name||"User"}</p>
            <span className="badge badge-gold" style={{fontSize:9,padding:"1px 7px"}}>PRO</span>
          </div>
          <span className="ms" style={{fontSize:16,color:"var(--muted)"}}>chevron_right</span>
        </div>
        <a className="nav-link" onClick={()=>onNav("profile")}>
          <span className="ms">account_circle</span> Profile
        </a>
        <a className="nav-link" onClick={onLogout} style={{color:"rgba(255,107,107,0.75)"}}>
          <span className="ms">logout</span> Sign Out
        </a>
      </div>
    </aside>
  );
}

/* ─── Bottom Nav ─────────────────────────────────────────── */
function BottomNav({active, onNav}) {
  const items=[
    {id:"home",      icon:"home",           label:"Home"},
    {id:"jobs",      icon:"travel_explore", label:"Jobs"},
    {id:"resume",    icon:"description",    label:"Resume"},
    {id:"interview", icon:"psychology",     label:"Interview"},
    {id:"profile",   icon:"account_circle", label:"Profile"},
  ];
  return (
    <div id="bottom-nav" className="glass-dark" style={{borderTop:"1px solid rgba(59,73,76,0.25)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"6px 4px 8px"}}>
      {items.map(it=>(
        <button key={it.id} onClick={()=>onNav(it.id)}
          style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"6px 12px",borderRadius:10,border:"none",background:"none",cursor:"pointer",
            color: active===it.id ? "var(--cyan)" : "var(--muted)",
            background: active===it.id ? "rgba(0,218,243,0.08)" : "transparent",
            transition:"all 0.2s",
          }}>
          <span className="ms" style={{fontSize:22}}>{it.icon}</span>
          <span className="font-mono" style={{fontSize:9,letterSpacing:"0.05em"}}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── TopBar ─────────────────────────────────────────────── */
function TopBar({onMenuClick, sidebarOpen, user, onNav}) {
  return (
    <header className="glass-dark" style={{
      borderBottom:"1px solid rgba(59,73,76,0.22)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 14px", height:"var(--topbar-h)",
    }}>
      {/* Left: hamburger + brand */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button
          onClick={onMenuClick}
          style={{
            width:38, height:38, borderRadius:9,
            background: sidebarOpen ? "rgba(0,218,243,0.15)" : "rgba(0,218,243,0.08)",
            border:"1px solid rgba(0,218,243,0.25)",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:4, cursor:"pointer",
            transition:"all 0.2s", flexShrink:0,
            WebkitTapHighlightColor:"transparent",
          }}
          aria-label="Toggle menu"
        >
          <span style={{
            display:"block", width:16, height:2,
            background:"var(--cyan)", borderRadius:2,
            transition:"all 0.25s",
            transform: sidebarOpen ? "rotate(45deg) translate(4px,4px)" : "none",
          }}/>
          <span style={{
            display:"block", width:16, height:2,
            background:"var(--cyan)", borderRadius:2,
            transition:"all 0.25s",
            opacity: sidebarOpen ? 0 : 1,
            transform: sidebarOpen ? "translateX(-8px)" : "none",
          }}/>
          <span style={{
            display:"block", width:16, height:2,
            background:"var(--cyan)", borderRadius:2,
            transition:"all 0.25s",
            transform: sidebarOpen ? "rotate(-45deg) translate(4px,-4px)" : "none",
          }}/>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:26,height:26,borderRadius:7,background:"var(--cyan)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 10px rgba(0,218,243,0.5)"}}>
            <span className="ms" style={{fontSize:14,color:"#001f24"}}>rocket_launch</span>
          </div>
          <span className="font-display glow-text" style={{fontSize:17,fontWeight:800,color:"var(--cyan)",letterSpacing:"-0.02em"}}>CareerAI</span>
        </div>
      </div>
      {/* Right: notif + avatar */}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{position:"relative"}}>
          <button className="btn-icon" style={{padding:7, WebkitTapHighlightColor:"transparent"}}>
            <span className="ms" style={{fontSize:20}}>notifications</span>
          </button>
          <div className="notif-dot" style={{position:"absolute",top:4,right:4,width:6,height:6}}/>
        </div>
        <div className="avatar-ring" style={{width:32,height:32,cursor:"pointer"}} onClick={()=>onNav("profile")}>
          <div className="avatar-inner" style={{width:26,height:26,fontSize:12,fontWeight:700,color:"var(--cyan)",fontFamily:"Syne"}}>
            {(user.name||"A").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Login ──────────────────────────────────────────────── */
function LoginScreen({onLogin}) {
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function submit() {
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onLogin({name:"Alex Chen",email:"alex@careerai.io"}); }, 1100);
  }

  return (
    <div id="screen-login">
      <Orbs/>
      <Particles/>
      <div className="animate-slideup" style={{position:"relative",zIndex:10,width:"100%",maxWidth:460,padding:"0 20px"}}>
        {/* Brand */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="glow-lg" style={{
            width:56,height:56,borderRadius:14,background:"var(--cyan)",
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            marginBottom:18,animation:"floatOrb 5s ease-in-out infinite",
          }}>
            <span className="ms" style={{fontSize:30,color:"#001f24"}}>rocket_launch</span>
          </div>
          <h1 className="font-display glow-text" style={{fontSize:38,fontWeight:800,color:"var(--cyan)",letterSpacing:"-0.025em",display:"block",marginBottom:6}}>CareerAI</h1>
          <p className="font-mono" style={{fontSize:11,color:"rgba(186,201,204,0.55)",letterSpacing:"0.12em",textTransform:"uppercase"}}>AI Career Engine · v2.0</p>
        </div>

        {/* Card */}
        <div className="glass glow" style={{borderRadius:28,padding:"36px 32px"}}>
          {view==="login" ? (
            <>
              <h2 className="font-display" style={{fontSize:22,fontWeight:700,marginBottom:4}}>Welcome Back</h2>
              <p style={{fontSize:13,color:"var(--muted)",marginBottom:28}}>Access your professional future.</p>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div>
                  <label className="ai-label">Email Address</label>
                  <input className="ai-input" type="email" defaultValue="demo@careerai.io" placeholder="you@example.com"/>
                </div>
                <div style={{position:"relative"}}>
                  <label className="ai-label">Password</label>
                  <input className="ai-input" type={showPass?"text":"password"} defaultValue="demo1234" placeholder="••••••••"/>
                  <button onClick={()=>setShowPass(v=>!v)} style={{position:"absolute",right:12,bottom:11,background:"none",border:"none",cursor:"pointer",color:"var(--muted)"}}>
                    <span className="ms" style={{fontSize:18}}>{showPass?"visibility_off":"visibility"}</span>
                  </button>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"var(--muted)"}}>
                    <input type="checkbox" defaultChecked style={{accentColor:"var(--cyan)"}}/>
                    Remember me
                  </label>
                  <a href="#" style={{fontSize:12,color:"var(--cyan)",textDecoration:"none",fontFamily:"JetBrains Mono"}}>Forgot password?</a>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading}>
                  {loading ? <span className="spinner"/> : <span className="ms" style={{fontSize:18}}>login</span>}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </div>

              <div style={{display:"flex",alignItems:"center",gap:12,margin:"22px 0"}}>
                <div style={{flex:1,height:1,background:"rgba(59,73,76,0.4)"}}/>
                <span className="font-mono" style={{fontSize:11,color:"var(--muted)"}}>OR</span>
                <div style={{flex:1,height:1,background:"rgba(59,73,76,0.4)"}}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                <button className="btn btn-ghost" onClick={submit} style={{justifyContent:"center",padding:"10px 16px"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button className="btn btn-ghost" onClick={submit} style={{justifyContent:"center",padding:"10px 16px"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </button>
              </div>
              <p style={{textAlign:"center",fontSize:13,color:"var(--muted)"}}>
                No account?{" "}
                <a href="#" onClick={e=>{e.preventDefault();setView("signup");}} style={{color:"var(--cyan)",textDecoration:"none",fontWeight:600}}>Create one</a>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display" style={{fontSize:22,fontWeight:700,marginBottom:4}}>Create Account</h2>
              <p style={{fontSize:13,color:"var(--muted)",marginBottom:24}}>Start your AI-powered career journey.</p>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div className="grid-2" style={{gap:12}}>
                  <div><label className="ai-label">First Name</label><input className="ai-input" placeholder="Alex"/></div>
                  <div><label className="ai-label">Last Name</label><input className="ai-input" placeholder="Chen"/></div>
                </div>
                <div><label className="ai-label">Email</label><input className="ai-input" type="email" placeholder="you@example.com"/></div>
                <div><label className="ai-label">Password</label><input className="ai-input" type="password" placeholder="Min 8 characters"/></div>
                <div>
                  <label className="ai-label">I am a…</label>
                  <select className="ai-input">
                    <option>Fresh Graduate</option><option>Working Professional</option><option>Career Switcher</option><option>Freelancer</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading}>
                  {loading ? <span className="spinner"/> : <span className="ms">person_add</span>}
                  {loading ? "Creating…" : "Create Account"}
                </button>
              </div>
              <p style={{textAlign:"center",fontSize:13,color:"var(--muted)",marginTop:18}}>
                Already have an account?{" "}
                <a href="#" onClick={e=>{e.preventDefault();setView("login");}} style={{color:"var(--cyan)",textDecoration:"none",fontWeight:600}}>Sign In</a>
              </p>
            </>
          )}
        </div>
        <p className="font-mono" style={{textAlign:"center",fontSize:10,color:"rgba(186,201,204,0.3)",marginTop:16,letterSpacing:"0.05em"}}>
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}

/* ─── HOME ───────────────────────────────────────────────── */
function HomePage({onNav}) {
  return (
    <div>
      {/* Hero */}
      <div className="animate-slideup delay-1" style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div className="notif-dot"/>
          <span className="font-mono" style={{fontSize:11,color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase"}}>AI Status: Online</span>
        </div>
        <h1 className="font-display" style={{fontSize:"clamp(32px,6vw,58px)",fontWeight:800,letterSpacing:"-0.025em",lineHeight:1.05,marginBottom:14}}>
          Your Career,<br/>
          <span className="glow-text" style={{color:"var(--cyan)"}}>Supercharged</span>
        </h1>
        <p style={{fontSize:16,color:"var(--muted)",maxWidth:520,lineHeight:1.7,marginBottom:22}}>
          The AI engine that turns your potential into opportunity. From resume to dream job — all in one platform.
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
          <button className="btn btn-primary btn-lg" onClick={()=>onNav("resume")}>
            <span className="ms">auto_fix_high</span> Get Started
          </button>
          <button className="btn btn-ghost btn-lg" onClick={()=>onNav("career")}>
            <span className="ms">map</span> My Career Path
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats animate-slideup delay-2" style={{marginBottom:32}}>
        {[
          {val:"94%",label:"Match Rate",   color:"var(--cyan)"},
          {val:"2.4x",label:"More Interviews",color:"var(--purple)"},
          {val:"50K+",label:"Jobs Matched",color:"var(--gold)"},
        ].map((s,i)=>(
          <div key={i} className="glass glass-subtle hover-lift" style={{borderRadius:14,padding:"20px 14px",textAlign:"center"}}>
            <div className="font-display" style={{fontSize:"clamp(24px,5vw,32px)",fontWeight:800,color:s.color,marginBottom:4}}>{s.val}</div>
            <div className="font-mono" style={{fontSize:11,color:"var(--muted)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Job Finder Feature Highlight ── */}
      <div className="animate-slideup delay-3" style={{marginBottom:32}}>
        <div onClick={()=>onNav("jobs")} style={{
          position:"relative", overflow:"hidden", borderRadius:20, cursor:"pointer",
          padding:"clamp(16px,4vw,28px) clamp(16px,4vw,32px)",
          background:"linear-gradient(135deg, rgba(0,218,243,0.12) 0%, rgba(79,49,156,0.18) 50%, rgba(0,218,243,0.08) 100%)",
          border:"1px solid rgba(0,218,243,0.35)",
          boxShadow:"0 0 40px rgba(0,218,243,0.15)",
          transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 0 60px rgba(0,218,243,0.3)";e.currentTarget.style.borderColor="rgba(0,218,243,0.7)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 40px rgba(0,218,243,0.15)";e.currentTarget.style.borderColor="rgba(0,218,243,0.35)";}}>

          {/* Animated scan line */}
          <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(0,218,243,0.6),transparent)",animation:"scanDown 3s linear infinite",pointerEvents:"none"}}/>

          {/* Background glow orb */}
          <div style={{position:"absolute",right:-40,top:-40,width:220,height:220,borderRadius:"50%",background:"rgba(0,218,243,0.06)",filter:"blur(40px)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",left:"30%",bottom:-30,width:160,height:160,borderRadius:"50%",background:"rgba(79,49,156,0.1)",filter:"blur(40px)",pointerEvents:"none"}}/>

          <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
            {/* Left */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{
                  width:48,height:48,borderRadius:14,
                  background:"linear-gradient(135deg,var(--cyan),rgba(0,218,243,0.5))",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:"0 0 20px rgba(0,218,243,0.5)",
                  animation:"floatOrb 4s ease-in-out infinite",
                  flexShrink:0,
                }}>
                  <span className="ms" style={{fontSize:26,color:"#001f24"}}>travel_explore</span>
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="font-display" style={{fontSize:20,fontWeight:800,color:"var(--on)",letterSpacing:"-0.02em"}}>Job Finder</span>
                    <span className="badge badge-cyan" style={{animation:"pulseDot 2s ease-in-out infinite"}}>✦ Featured</span>
                  </div>
                  <p className="font-mono" style={{fontSize:10,color:"rgba(0,218,243,0.7)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>AI-Powered · Real-Time</p>
                </div>
              </div>
              <p style={{fontSize:15,color:"var(--muted)",lineHeight:1.65,marginBottom:16,maxWidth:460}}>
                Upload your resume and let AI match you to the <strong style={{color:"var(--on)"}}>perfect roles</strong> across Naukri, LinkedIn, Indeed, Glassdoor and more — all in one click.
              </p>
              {/* Feature pills */}
              <div className="jf-pills" style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["🇮🇳 Naukri","💼 LinkedIn","🔍 Indeed","✨ Shine","🎓 Internshala","🚀 Wellfound"].map(p=>(
                  <span key={p} style={{
                    fontSize:12,padding:"4px 12px",borderRadius:100,
                    background:"rgba(0,218,243,0.08)",
                    border:"1px solid rgba(0,218,243,0.2)",
                    color:"var(--muted)",fontWeight:500,
                  }}>{p}</span>
                ))}
              </div>
            </div>

            {/* Right CTA */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,flexShrink:0}}>
              {/* Animated ring stat */}
              <div style={{position:"relative",width:96,height:96}}>
                <svg width="96" height="96" viewBox="0 0 96 96" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(0,218,243,0.1)" strokeWidth="6"/>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--cyan)" strokeWidth="6"
                    strokeLinecap="round"
                    style={{strokeDasharray:"251.2",strokeDashoffset:"62.8",transition:"stroke-dashoffset 1.5s ease"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <span className="font-display" style={{fontSize:22,fontWeight:800,color:"var(--cyan)",lineHeight:1}}>50K+</span>
                  <span className="font-mono" style={{fontSize:9,color:"var(--muted)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Jobs</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{
                padding:"12px 28px",fontSize:14,borderRadius:12,
                boxShadow:"0 0 24px rgba(0,218,243,0.4)",
                display:"flex",alignItems:"center",gap:8,
              }}>
                <span className="ms" style={{fontSize:18}}>travel_explore</span>
                Find My Jobs
                <span className="ms" style={{fontSize:16}}>arrow_forward</span>
              </button>
              <p className="font-mono" style={{fontSize:10,color:"rgba(186,201,204,0.45)",letterSpacing:"0.06em"}}>FREE · No signup needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="animate-slideup delay-3">
        <div className="section-head">
          <h2 className="section-title">AI Tools Suite</h2>
          <span className="badge badge-cyan">10 Tools</span>
        </div>
        <div className="grid-tools">
          {TOOLS.map((t,i)=>(
            <div key={t.id} className="tool-card glass animate-slideup" style={{border:"1px solid rgba(0,229,255,0.12)",animationDelay:`${0.05+i*0.04}s`,opacity:0}} onClick={()=>onNav(t.id)}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                <div style={{width:42,height:42,borderRadius:10,background:"rgba(0,218,243,0.1)",border:"1px solid rgba(0,218,243,0.2)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 12px rgba(0,218,243,0.15)"}}>
                  <span className="ms" style={{color:"var(--cyan)"}}>{t.icon}</span>
                </div>
                {t.badge && <span className={`badge badge-${t.badgeType}`}>{t.badge}</span>}
              </div>
              <h3 className="font-display" style={{fontSize:14,fontWeight:700,marginBottom:6,color:"var(--on)"}}>{t.label}</h3>
              <p style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.55}}>{t.desc}</p>
              <div style={{marginTop:14,display:"flex",alignItems:"center",gap:4,color:"var(--cyan)",opacity:0.65,fontSize:12,fontFamily:"JetBrains Mono"}}>
                Open <span className="ms" style={{fontSize:14}}>arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── RESUME ─────────────────────────────────────────────── */
function ResumePage({callAI, loading}) {
  const [resume, setResume] = useState("");
  const [jd, setJd]         = useState("");
  const [result, setResult] = useState("");

  async function run() {
    if(!resume||!jd) return;
    const r = await callAI("resume",{resume,jd,summary:"Resume reviewed"});
    if(r) setResult(r);
  }

  return (
    <div className="animate-slideup">
      <PageHeader title="Resume Review" desc="Upload your resume and get AI-powered feedback, match score, and improvements."/>
      <div className="grid-2">
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>description</span><h3 className="section-title" style={{fontSize:15}}>Your Resume</h3></div>
          <div className="upload-zone" style={{marginBottom:14}} onClick={()=>document.getElementById("res-file").click()}>
            <span className="ms" style={{animation:"floatOrb 4s ease-in-out infinite"}}>upload_file</span>
            <p style={{fontWeight:600,fontSize:14,marginBottom:4}}>Drop or click to upload</p>
            <p style={{fontSize:12,color:"var(--muted)"}}>PDF, DOCX, TXT up to 10MB</p>
            <input id="res-file" type="file" accept=".pdf,.docx,.txt" style={{display:"none"}} onChange={e=>{
              const f=e.target.files[0]; if(!f) return;
              const r=new FileReader(); r.onload=ev=>setResume(ev.target.result.slice(0,8000)); r.readAsText(f);
            }}/>
          </div>
          <div>
            <label className="ai-label">Or paste resume text</label>
            <textarea className="ai-input" rows={6} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your resume content here…"/>
          </div>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>work</span><h3 className="section-title" style={{fontSize:15}}>Job Description</h3></div>
          <div><label className="ai-label">Paste the full job posting</label>
            <textarea className="ai-input" rows={9} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the job description here…"/>
          </div>
          <button className="btn btn-primary btn-full" style={{marginTop:16,padding:"13px"}} onClick={run} disabled={loading||!resume||!jd}>
            {loading?<span className="spinner"/>:<span className="ms">auto_fix_high</span>} Analyze Resume
          </button>
        </div>
      </div>
      <Output result={result} title="Resume Analysis"/>
    </div>
  );
}

/* ─── INTERVIEW ──────────────────────────────────────────── */
function InterviewPage({callAI, loading}) {
  const [started, setStarted]   = useState(false);
  const [role, setRole]         = useState("");
  const [level, setLevel]       = useState("Mid (2-5 yrs)");
  const [type, setType]         = useState("General / Behavioral");
  const [msgs, setMsgs]         = useState([]);
  const [answer, setAnswer]     = useState("");
  const chatRef = useRef(null);

  async function start() {
    if(!role) return;
    const r = await callAI("interview",{answer:"Start the interview.",history:[],role,level,type,summary:`${role} interview`});
    if(r){ setMsgs([{role:"assistant",content:r}]); setStarted(true); }
  }
  async function send() {
    if(!answer.trim()||loading) return;
    const ans = answer; setAnswer("");
    const newMsgs = [...msgs,{role:"user",content:ans}];
    setMsgs(newMsgs);
    const r = await callAI("interview",{answer:ans,history:newMsgs.slice(0,-1),role,level,type,summary:`${role} interview`});
    if(r) setMsgs(m=>[...m,{role:"assistant",content:r}]);
  }
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[msgs]);

  return (
    <div className="animate-slideup" style={{maxWidth:700}}>
      <PageHeader title="Mock Interview" desc="Practice with live AI — get real-time feedback and a final performance score."/>
      {!started ? (
        <div className="glass card border-pulse">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>settings</span><h3 className="section-title" style={{fontSize:15}}>Setup Your Interview</h3></div>
          <div className="grid-3" style={{marginBottom:20}}>
            <div><label className="ai-label">Job Role</label><input className="ai-input" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Data Analyst"/></div>
            <div>
              <label className="ai-label">Experience Level</label>
              <select className="ai-input" value={level} onChange={e=>setLevel(e.target.value)}>
                <option>Entry (0-2 yrs)</option><option>Mid (2-5 yrs)</option><option>Senior (5+ yrs)</option>
              </select>
            </div>
            <div>
              <label className="ai-label">Interview Type</label>
              <select className="ai-input" value={type} onChange={e=>setType(e.target.value)}>
                <option>General / Behavioral</option><option>Technical</option><option>Case Study</option><option>HR Round</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-full" style={{padding:13}} onClick={start} disabled={loading||!role}>
            {loading?<span className="spinner"/>:<span className="ms">play_arrow</span>} Start Interview
          </button>
        </div>
      ) : (
        <div className="glass card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span className="font-display" style={{fontWeight:700,fontSize:15}}>{role}</span>
              <span className="badge badge-cyan">{type}</span>
              <span className="badge badge-purple">{level}</span>
            </div>
            <button className="btn btn-subtle btn-sm" onClick={()=>{setStarted(false);setMsgs([]);setRole("");}}>
              <span className="ms" style={{fontSize:16}}>refresh</span> Reset
            </button>
          </div>
          <div className="chat-wrap" ref={chatRef}>
            {msgs.map((m,i)=>(
              <div key={i}>
                {m.role==="assistant" && (
                  <div className="bubble-ai">
                    <span className="font-mono" style={{fontSize:10,color:"rgba(0,218,243,0.65)",display:"block",marginBottom:6}}>
                      Q{Math.ceil((i+1)/2)} · AI INTERVIEWER
                    </span>
                    {m.content}
                  </div>
                )}
                {m.role==="user" && m.content!=="Start the interview." && (
                  <div className="bubble-user">{m.content}</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="bubble-ai" style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"pulseDot 0.6s ease infinite"}}/>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"pulseDot 0.6s 0.2s ease infinite"}}/>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"pulseDot 0.6s 0.4s ease infinite"}}/>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <input className="ai-input" style={{flex:1}} value={answer} onChange={e=>setAnswer(e.target.value)}
              placeholder="Type your answer…"
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
            />
            <button className="btn btn-primary" style={{padding:"10px 18px"}} onClick={send} disabled={loading||!answer.trim()}>
              <span className="ms">send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── COVER LETTER ───────────────────────────────────────── */
function CoverPage({callAI, loading}) {
  const [jd,setJd]=useState(""); const [name,setName]=useState("");
  const [email,setEmail]=useState(""); const [company,setCompany]=useState("");
  const [about,setAbout]=useState(""); const [tone,setTone]=useState("Professional & formal");
  const [result,setResult]=useState("");
  async function run(){ const r=await callAI("cover",{jd,name,email,company,about,tone,summary:"Cover letter"}); if(r) setResult(r); }
  return (
    <div className="animate-slideup">
      <PageHeader title="Cover Letter" desc="Generate a polished, human-sounding cover letter instantly."/>
      <div className="grid-2">
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>work</span><h3 className="section-title" style={{fontSize:15}}>Job Details</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Job Description</label><textarea className="ai-input" rows={7} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the full job posting…"/></div>
            <div><label className="ai-label">Company Name</label><input className="ai-input" value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google, Amazon…"/></div>
            <div>
              <label className="ai-label">Tone</label>
              <select className="ai-input" value={tone} onChange={e=>setTone(e.target.value)}>
                <option>Professional & formal</option><option>Friendly & conversational</option><option>Confident & bold</option><option>Humble & enthusiastic</option>
              </select>
            </div>
          </div>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>person</span><h3 className="section-title" style={{fontSize:15}}>About You</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Full Name</label><input className="ai-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
            <div><label className="ai-label">Email Address</label><input className="ai-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
            <div><label className="ai-label">Skills & Experience</label><textarea className="ai-input" rows={5} value={about} onChange={e=>setAbout(e.target.value)} placeholder="Your key skills, years of experience, achievements…"/></div>
            <button className="btn btn-primary btn-full" style={{padding:13}} onClick={run} disabled={loading}>
              {loading?<span className="spinner"/>:"✨"} Generate Cover Letter
            </button>
          </div>
        </div>
      </div>
      <Output result={result} title="Cover Letter"/>
    </div>
  );
}

/* ─── LINKEDIN ───────────────────────────────────────────── */
function LinkedInPage({callAI, loading}) {
  const [topic,setTopic]=useState(""); const [ptype,setPtype]=useState("Career milestone");
  const [style,setStyle]=useState("Storytelling"); const [result,setResult]=useState("");
  async function run(){ const r=await callAI("linkedin",{topic,ptype,style,summary:"LinkedIn post"}); if(r) setResult(r); }
  return (
    <div className="animate-slideup" style={{maxWidth:680}}>
      <PageHeader title="LinkedIn Post" desc="Turn your achievements into viral LinkedIn content."/>
      <div className="glass card">
        <div className="grid-2" style={{marginBottom:16}}>
          <div>
            <label className="ai-label">Post Type</label>
            <select className="ai-input" value={ptype} onChange={e=>setPtype(e.target.value)}>
              <option>Career milestone</option><option>New job announcement</option><option>Lesson learned</option><option>Project showcase</option><option>Thought leadership</option>
            </select>
          </div>
          <div>
            <label className="ai-label">Writing Style</label>
            <select className="ai-input" value={style} onChange={e=>setStyle(e.target.value)}>
              <option>Storytelling</option><option>Professional</option><option>Casual & relatable</option><option>Inspirational</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label className="ai-label">What&apos;s it about?</label>
          <textarea className="ai-input" rows={5} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Describe your achievement, lesson, or thought…"/>
        </div>
        <button className="btn btn-primary btn-full" style={{padding:13}} onClick={run} disabled={loading}>
          {loading?<span className="spinner"/>:"✨"} Generate Post
        </button>
      </div>
      {result && (
        <div className="glass card animate-slideup" style={{marginTop:20}}>
          <div className="output-header">
            <div className="output-label">LinkedIn Post</div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-icon" onClick={()=>navigator.clipboard.writeText(result)}><span className="ms" style={{fontSize:18}}>content_copy</span></button>
              <a href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(result.slice(0,700))}`}
                target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <span className="ms" style={{fontSize:16}}>share</span> Share on LinkedIn
              </a>
            </div>
          </div>
          <div className="output-box">{result}</div>
        </div>
      )}
    </div>
  );
}

/* ─── JOB DECODER ────────────────────────────────────────── */
function DecoderPage({callAI, loading}) {
  const [jd,setJd]=useState(""); const [result,setResult]=useState("");
  async function run(){ const r=await callAI("decoder",{jd,summary:"Job decoded"}); if(r) setResult(r); }
  return (
    <div className="animate-slideup" style={{maxWidth:760}}>
      <PageHeader title="Job Decoder" desc="Understand what any job posting really wants — decoded by AI."/>
      <div className="glass card">
        <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>analytics</span><h3 className="section-title" style={{fontSize:15}}>Paste Job Posting</h3></div>
        <textarea className="ai-input" rows={10} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the full job description here…"/>
        <button className="btn btn-primary btn-full" style={{marginTop:16,padding:13}} onClick={run} disabled={loading||!jd}>
          {loading?<span className="spinner"/>:"🔍"} Decode This Job
        </button>
      </div>
      <Output result={result} title="Job Decoder Analysis"/>
    </div>
  );
}

/* ─── ONE-CLICK APPLY ────────────────────────────────────── */
function ApplyPage({callAI, loading, showToast}) {
  const [jd,setJd]=useState(""); const [resume,setResume]=useState("");
  const [name,setName]=useState(""); const [email,setEmail]=useState("");
  const [url,setUrl]=useState(""); const [hr,setHr]=useState("");
  const [pkg,setPkg]=useState(null);

  async function run() {
    if(!jd||!resume) return showToast("Fill in job description and resume","error");
    const r=await callAI("apply",{jd,resume,name,email,url,hr,summary:"Application package"});
    if(r){ try{ setPkg(JSON.parse(r)); }catch{ showToast("Parse error","error"); } }
  }
  return (
    <div className="animate-slideup">
      <PageHeader title="One-Click Apply" desc="Get a complete application package — cover letter, email, and talking points."/>
      <div className="grid-2">
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>work</span><h3 className="section-title" style={{fontSize:15}}>Job Details</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Job Description</label><textarea className="ai-input" rows={7} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the job posting…"/></div>
            <div><label className="ai-label">Job URL (optional)</label><input className="ai-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…"/></div>
            <div><label className="ai-label">HR Email (optional)</label><input className="ai-input" type="email" value={hr} onChange={e=>setHr(e.target.value)} placeholder="hr@company.com"/></div>
          </div>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>person</span><h3 className="section-title" style={{fontSize:15}}>Your Details</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Resume / Key Info</label><textarea className="ai-input" rows={5} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your resume highlights…"/></div>
            <div><label className="ai-label">Full Name</label><input className="ai-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></div>
            <div><label className="ai-label">Email</label><input className="ai-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
            <button className="btn btn-primary btn-full" style={{padding:13}} onClick={run} disabled={loading}>
              {loading?<span className="spinner"/>:"🚀"} Generate Package
            </button>
          </div>
        </div>
      </div>
      {pkg && (
        <div className="animate-slideup" style={{marginTop:20,display:"flex",flexDirection:"column",gap:16}}>
          {[["✉️ Cover Letter",pkg.cover],["📧 Application Email",pkg.email],["💡 Key Talking Points",pkg.points]].map(([t,c])=>(
            <div key={t} className="glass card">
              <div className="output-label" style={{marginBottom:12}}>{t}</div>
              <div className="output-box">{c||""}</div>
            </div>
          ))}
          <div className="glass card">
            <h4 className="font-display" style={{fontWeight:700,fontSize:14,marginBottom:12}}>Quick Apply</h4>
            <div style={{display:"flex",flexWrap:"wrap"}}>
              {url && <a className="quick-link" href={url} target="_blank" rel="noreferrer">🔗 Company Site</a>}
              {hr  && <a className="quick-link" href={`https://mail.google.com/mail/?view=cm&to=${hr}&su=${encodeURIComponent("Job Application – "+name)}&body=${encodeURIComponent((pkg.email||"").slice(0,1000))}`} target="_blank" rel="noreferrer">✉️ Gmail</a>}
              <a className="quick-link" href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jd.slice(0,50))}`} target="_blank" rel="noreferrer">💼 LinkedIn</a>
              <a className="quick-link" href="https://www.naukri.com" target="_blank" rel="noreferrer">🇮🇳 Naukri</a>
              <a className="quick-link" href="https://www.shine.com" target="_blank" rel="noreferrer">✨ Shine</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── JOB FINDER ─────────────────────────────────────────── */
function JobsPage({callAI, loading}) {
  const [resume,setResume]=useState(""); const [role,setRole]=useState("");
  const [loc,setLoc]=useState(""); const [exp,setExp]=useState("Mid (3-6 yrs)");
  const [result,setResult]=useState("");
  const rQ=encodeURIComponent(role||"software engineer"); const lQ=encodeURIComponent(loc||"India");
  async function run(){ const r=await callAI("jobs",{resume,role,location:loc,exp,summary:"Job search"}); if(r) setResult(r); }
  return (
    <div className="animate-slideup">
      <PageHeader title="Job Finder" desc="AI maps your profile to matching roles and guides you to the best job portals."/>
      <div className="grid-2">
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>description</span><h3 className="section-title" style={{fontSize:15}}>Your Resume</h3></div>
          <textarea className="ai-input" rows={9} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your resume or key skills…"/>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>tune</span><h3 className="section-title" style={{fontSize:15}}>Preferences</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Target Role</label><input className="ai-input" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/></div>
            <div><label className="ai-label">Location</label><input className="ai-input" value={loc} onChange={e=>setLoc(e.target.value)} placeholder="e.g. Bangalore, Remote"/></div>
            <div>
              <label className="ai-label">Experience Level</label>
              <select className="ai-input" value={exp} onChange={e=>setExp(e.target.value)}>
                <option>Fresher (0-1 yr)</option><option>Junior (1-3 yrs)</option><option>Mid (3-6 yrs)</option><option>Senior (6+ yrs)</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" style={{padding:13}} onClick={run} disabled={loading}>
              {loading?<span className="spinner"/>:"🔎"} Find Matching Jobs
            </button>
          </div>
        </div>
      </div>
      {result && <>
        <Output result={result} title="Job Match Analysis"/>
        <div className="glass card animate-slideup" style={{marginTop:16}}>
          <h4 className="font-display" style={{fontWeight:700,fontSize:14,marginBottom:12}}>Search on Job Portals</h4>
          <div style={{display:"flex",flexWrap:"wrap"}}>
            {[
              [`🇮🇳 Naukri`,`https://www.naukri.com/jobs-in-india?k=${rQ}&l=${lQ}`],
              [`💼 LinkedIn`,`https://www.linkedin.com/jobs/search/?keywords=${rQ}&location=${lQ}`],
              [`🔍 Indeed`,`https://www.indeed.com/jobs?q=${rQ}&l=${lQ}`],
              [`✨ Shine`,`https://www.shine.com/job-search/${rQ}-jobs`],
              [`🎓 Internshala`,`https://internshala.com/jobs/${rQ}-jobs`],
              [`🏢 Glassdoor`,`https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${rQ}`],
              [`🚀 Wellfound`,`https://wellfound.com/jobs?query=${rQ}`],
            ].map(([l,h])=><a key={l} className="quick-link" href={h} target="_blank" rel="noreferrer">{l}</a>)}
          </div>
        </div>
      </>}
    </div>
  );
}

/* ─── CAREER PATH ────────────────────────────────────────── */
function CareerPage({callAI, loading}) {
  const [role,setRole]=useState(""); const [exp,setExp]=useState("");
  const [skills,setSkills]=useState(""); const [goal,setGoal]=useState("");
  const [industry,setIndustry]=useState("Technology"); const [timeline,setTimeline]=useState("2 years");
  const [result,setResult]=useState("");
  async function run(){ const r=await callAI("career",{role,exp,skills,goal,industry,timeline,summary:`Career path`}); if(r) setResult(r); }
  return (
    <div className="animate-slideup">
      <PageHeader title="Career Path" desc="Get a detailed roadmap from where you are to where you want to be."/>
      <div className="grid-2">
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>person</span><h3 className="section-title" style={{fontSize:15}}>Where You Are Now</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Current Role</label><input className="ai-input" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Junior Software Engineer"/></div>
            <div><label className="ai-label">Years of Experience</label><input className="ai-input" value={exp} onChange={e=>setExp(e.target.value)} placeholder="e.g. 2 years"/></div>
            <div><label className="ai-label">Your Skills</label><textarea className="ai-input" rows={4} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. Python, React, SQL…"/></div>
          </div>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>flag</span><h3 className="section-title" style={{fontSize:15}}>Where You Want to Go</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Dream Job / Goal</label><input className="ai-input" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. CTO, Data Scientist, Indie Founder"/></div>
            <div>
              <label className="ai-label">Industry</label>
              <select className="ai-input" value={industry} onChange={e=>setIndustry(e.target.value)}>
                <option>Technology</option><option>Finance</option><option>Marketing</option><option>Healthcare</option><option>Education</option><option>E-commerce</option><option>Consulting</option>
              </select>
            </div>
            <div>
              <label className="ai-label">Timeline</label>
              <select className="ai-input" value={timeline} onChange={e=>setTimeline(e.target.value)}>
                <option>6 months</option><option>1 year</option><option>2 years</option><option>3-5 years</option><option>5+ years</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" style={{padding:13}} onClick={run} disabled={loading}>
              {loading?<span className="spinner"/>:"📈"} Show My Roadmap
            </button>
          </div>
        </div>
      </div>
      <Output result={result} title="Career Path Roadmap"/>
    </div>
  );
}

/* ─── SALARY COACH ───────────────────────────────────────── */
function SalaryPage({callAI, loading}) {
  const [tab, setTab] = useState(0);
  // Worth
  const [swRole,setSwRole]=useState(""); const [swExp,setSwExp]=useState("");
  const [swCity,setSwCity]=useState(""); const [swSkills,setSwSkills]=useState("");
  const [swCompany,setSwCompany]=useState(""); const [swResult,setSwResult]=useState("");
  // Script
  const [ssOffer,setSsOffer]=useState(""); const [ssWant,setSsWant]=useState("");
  const [ssRole,setSsRole]=useState(""); const [ssExp,setSsExp]=useState("");
  const [ssAch,setSsAch]=useState(""); const [ssResult,setSsResult]=useState("");
  // Email
  const [seName,setSeName]=useState(""); const [seOffer,setSeOffer]=useState("");
  const [seCounter,setSeCounter]=useState(""); const [seRole,setSeRole]=useState("");
  const [seCompany,setSeCompany]=useState(""); const [seWhy,setSeWhy]=useState("");
  const [seResult,setSeResult]=useState("");

  return (
    <div className="animate-slideup">
      <PageHeader title="Salary Coach" desc="Know your worth, negotiate confidently, write counter offers."/>
      <div className="tabs-bar" style={{marginBottom:22}}>
        {["💰 Know Your Worth","🗣 Negotiation Script","📧 Counter Offer Email"].map((t,i)=>(
          <button key={i} className={`tab-btn${tab===i?" active":""}`} onClick={()=>setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Worth */}
      <div className={`sal-tab${tab===0?" active":""}`}>
        <div className="grid-2">
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Job Role</label><input className="ai-input" value={swRole} onChange={e=>setSwRole(e.target.value)} placeholder="e.g. Senior Data Analyst"/></div>
              <div><label className="ai-label">Years of Experience</label><input className="ai-input" value={swExp} onChange={e=>setSwExp(e.target.value)} placeholder="e.g. 4 years"/></div>
              <div><label className="ai-label">City</label><input className="ai-input" value={swCity} onChange={e=>setSwCity(e.target.value)} placeholder="e.g. Bangalore, Mumbai"/></div>
            </div>
          </div>
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Key Skills</label><textarea className="ai-input" rows={3} value={swSkills} onChange={e=>setSwSkills(e.target.value)} placeholder="e.g. Python, ML, SQL…"/></div>
              <div><label className="ai-label">Company (optional)</label><input className="ai-input" value={swCompany} onChange={e=>setSwCompany(e.target.value)} placeholder="e.g. Infosys, TCS"/></div>
              <button className="btn btn-primary btn-full" style={{padding:13}} onClick={async()=>{ const r=await callAI("salary_worth",{role:swRole,exp:swExp,city:swCity,skills:swSkills,company:swCompany,summary:"Salary analysis"}); if(r) setSwResult(r); }} disabled={loading}>
                {loading?<span className="spinner"/>:"💰"} Check Market Value
              </button>
            </div>
          </div>
        </div>
        <Output result={swResult} title="Salary Analysis"/>
      </div>

      {/* Script */}
      <div className={`sal-tab${tab===1?" active":""}`}>
        <div className="grid-2">
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Offer Received (LPA)</label><input className="ai-input" value={ssOffer} onChange={e=>setSsOffer(e.target.value)} placeholder="e.g. 8 LPA"/></div>
              <div><label className="ai-label">What You Want (LPA)</label><input className="ai-input" value={ssWant} onChange={e=>setSsWant(e.target.value)} placeholder="e.g. 12 LPA"/></div>
              <div><label className="ai-label">Job Role</label><input className="ai-input" value={ssRole} onChange={e=>setSsRole(e.target.value)} placeholder="e.g. Product Manager"/></div>
            </div>
          </div>
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Experience</label><input className="ai-input" value={ssExp} onChange={e=>setSsExp(e.target.value)} placeholder="e.g. 5 years"/></div>
              <div><label className="ai-label">Your Achievements</label><textarea className="ai-input" rows={4} value={ssAch} onChange={e=>setSsAch(e.target.value)} placeholder="e.g. Led team of 10, delivered projects ahead of schedule…"/></div>
              <button className="btn btn-primary btn-full" style={{padding:13}} onClick={async()=>{ const r=await callAI("salary_script",{offer:ssOffer,expect:ssWant,role:ssRole,exp:ssExp,achievements:ssAch,summary:"Negotiation script"}); if(r) setSsResult(r); }} disabled={loading}>
                {loading?<span className="spinner"/>:"🗣"} Write My Script
              </button>
            </div>
          </div>
        </div>
        <Output result={ssResult} title="Negotiation Script"/>
      </div>

      {/* Email */}
      <div className={`sal-tab${tab===2?" active":""}`}>
        <div className="grid-2">
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Your Name</label><input className="ai-input" value={seName} onChange={e=>setSeName(e.target.value)} placeholder="Your full name"/></div>
              <div><label className="ai-label">Offer Received (LPA)</label><input className="ai-input" value={seOffer} onChange={e=>setSeOffer(e.target.value)} placeholder="e.g. 8 LPA"/></div>
              <div><label className="ai-label">Counter Offer (LPA)</label><input className="ai-input" value={seCounter} onChange={e=>setSeCounter(e.target.value)} placeholder="e.g. 12 LPA"/></div>
            </div>
          </div>
          <div className="glass card">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="ai-label">Role</label><input className="ai-input" value={seRole} onChange={e=>setSeRole(e.target.value)} placeholder="e.g. Senior Engineer"/></div>
              <div><label className="ai-label">Company</label><input className="ai-input" value={seCompany} onChange={e=>setSeCompany(e.target.value)} placeholder="e.g. Infosys"/></div>
              <div><label className="ai-label">Why You Deserve More</label><textarea className="ai-input" rows={3} value={seWhy} onChange={e=>setSeWhy(e.target.value)} placeholder="5 yrs experience, led major projects…"/></div>
              <button className="btn btn-primary btn-full" style={{padding:13}} onClick={async()=>{ const r=await callAI("salary_email",{name:seName,offer:seOffer,counter:seCounter,role:seRole,company:seCompany,reason:seWhy,summary:"Counter offer email"}); if(r) setSeResult(r); }} disabled={loading}>
                {loading?<span className="spinner"/>:"📧"} Write Counter Offer
              </button>
            </div>
          </div>
        </div>
        <Output result={seResult} title="Counter Offer Email"/>
      </div>
    </div>
  );
}

/* ─── HISTORY ────────────────────────────────────────────── */
function HistoryPage({history, onClear}) {
  const [open, setOpen] = useState({});
  if(history.length===0) return (
    <div className="animate-slideup">
      <PageHeader title="My History" desc="0 saved results"/>
      <div style={{textAlign:"center",padding:"80px 20px"}}>
        <span className="ms" style={{fontSize:52,color:"rgba(59,73,76,0.6)",display:"block",marginBottom:16}}>history</span>
        <p className="font-display" style={{fontSize:18,fontWeight:700,color:"rgba(220,228,229,0.35)",marginBottom:8}}>No history yet</p>
        <p style={{fontSize:13,color:"var(--muted)"}}>Use any tool and your AI results will be saved here.</p>
      </div>
    </div>
  );
  return (
    <div className="animate-slideup">
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <h1 className="font-display" style={{fontSize:"clamp(28px,5vw,42px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:4}}>My History</h1>
          <p style={{fontSize:13,color:"var(--muted)"}}>{history.length} saved results</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          <span className="ms" style={{fontSize:16}}>delete_sweep</span> Clear All
        </button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {history.map((h,i)=>(
          <div key={i} className="glass animate-slideup" style={{border:"1px solid rgba(59,73,76,0.4)",borderRadius:14,animationDelay:`${i*0.03}s`,opacity:0,overflow:"hidden"}}>
            <div className="hist-head" onClick={()=>setOpen(o=>({...o,[i]:!o[i]}))}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
                <span className="badge badge-cyan" style={{flexShrink:0}}>{h.tool}</span>
                <span style={{fontSize:13,color:"var(--on)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.summary?.slice(0,55)}…</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                <span className="font-mono" style={{fontSize:11,color:"var(--muted)",display:"none"}}>{h.time}</span>
                <span className="ms" style={{fontSize:18,color:"var(--muted)",transition:"transform 0.2s",transform:open[i]?"rotate(180deg)":""}}>expand_more</span>
              </div>
            </div>
            {open[i] && (
              <div style={{padding:"18px 20px",borderTop:"1px solid rgba(59,73,76,0.35)",animation:"slideUp 0.3s ease"}}>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                  <button className="btn-icon" onClick={()=>navigator.clipboard.writeText(h.output)}><span className="ms" style={{fontSize:18}}>content_copy</span></button>
                </div>
                <div className="output-box">{h.output}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PROFILE ────────────────────────────────────────────── */
function ProfilePage({user, onSave, lang, onLangChange, onLogout}) {
  const [first,setFirst]=useState(user.name?.split(" ")[0]||"Alex");
  const [last,setLast]=useState(user.name?.split(" ").slice(1).join(" ")||"Chen");
  const [email,setEmail]=useState(user.email||"alex@careerai.io");
  const [phone,setPhone]=useState("");
  const [loc,setLoc]=useState(""); const [role,setRole]=useState("");
  const [company,setCompany]=useState(""); const [exp,setExp]=useState("");
  const [industry,setIndustry]=useState("Technology");
  const [skills,setSkills]=useState("React, Python, SQL, Docker");
  const [goal,setGoal]=useState("");

  const completionPct = [first,last,email,phone,loc,role,company,exp,skills,goal].filter(Boolean).length * 10;
  const circ = 2*Math.PI*30;
  const offset = circ - (completionPct/100)*circ;

  function save() { onSave({name:`${first} ${last}`.trim(), email}); }

  return (
    <div className="animate-slideup">
      <h1 className="font-display" style={{fontSize:"clamp(28px,5vw,42px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:28}}>My Profile</h1>

      {/* Header card */}
      <div className="glass card border-pulse" style={{borderRadius:22,marginBottom:18}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:20}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div className="avatar-ring" style={{width:72,height:72}}>
              <div className="avatar-inner" style={{width:66,height:66,fontSize:28,fontWeight:800,color:"var(--cyan)",fontFamily:"Syne"}}>
                {first.charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:"var(--cyan)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 10px rgba(0,218,243,0.5)",cursor:"pointer"}}>
              <span className="ms" style={{fontSize:13,color:"#001f24"}}>edit</span>
            </div>
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,marginBottom:6}}>
              <h2 className="font-display" style={{fontSize:22,fontWeight:700}}>{first} {last}</h2>
              <span className="badge badge-gold">PRO PLAN</span>
              <span className="badge badge-cyan">AI Score: 87</span>
            </div>
            <p style={{fontSize:13,color:"var(--muted)",marginBottom:10}}>{email}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {(skills||"").split(",").filter(Boolean).slice(0,5).map(s=>(
                <span key={s} className="badge badge-purple">{s.trim()}</span>
              ))}
            </div>
          </div>
          {/* Completion ring */}
          <div className="ring-container" style={{width:72,height:72,flexShrink:0}}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{transform:"rotate(-90deg)"}}>
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(59,73,76,0.5)" strokeWidth="5"/>
              <circle cx="36" cy="36" r="30" fill="none" stroke="var(--cyan)" strokeWidth="5" strokeLinecap="round"
                style={{strokeDasharray:circ,strokeDashoffset:offset,transition:"stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)"}}/>
            </svg>
            <div className="ring-text">
              <span className="font-display" style={{fontSize:14,fontWeight:700,color:"var(--cyan)"}}>{completionPct}%</span>
              <span className="font-mono" style={{fontSize:9,color:"var(--muted)",display:"block"}}>done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="grid-2" style={{marginBottom:16}}>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>badge</span><h3 className="section-title" style={{fontSize:15}}>Personal Info</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="grid-2" style={{gap:12}}>
              <div><label className="ai-label">First Name</label><input className="ai-input" value={first} onChange={e=>setFirst(e.target.value)}/></div>
              <div><label className="ai-label">Last Name</label><input className="ai-input" value={last} onChange={e=>setLast(e.target.value)}/></div>
            </div>
            <div><label className="ai-label">Email</label><input className="ai-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div><label className="ai-label">Phone</label><input className="ai-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"/></div>
            <div><label className="ai-label">Location</label><input className="ai-input" value={loc} onChange={e=>setLoc(e.target.value)} placeholder="e.g. Bangalore, India"/></div>
          </div>
        </div>
        <div className="glass card">
          <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>work</span><h3 className="section-title" style={{fontSize:15}}>Career Profile</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label className="ai-label">Current Role</label><input className="ai-input" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/></div>
            <div><label className="ai-label">Company</label><input className="ai-input" value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google, Startup…"/></div>
            <div><label className="ai-label">Years of Experience</label><input className="ai-input" value={exp} onChange={e=>setExp(e.target.value)} placeholder="e.g. 3 years"/></div>
            <div>
              <label className="ai-label">Industry</label>
              <select className="ai-input" value={industry} onChange={e=>setIndustry(e.target.value)}>
                <option>Technology</option><option>Finance</option><option>Marketing</option><option>Healthcare</option><option>Education</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="glass card" style={{marginBottom:16}}>
        <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>psychology</span><h3 className="section-title" style={{fontSize:15}}>Skills & Goals</h3></div>
        <div className="grid-2">
          <div><label className="ai-label">Skills (comma separated)</label><textarea className="ai-input" rows={3} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Python, SQL, AWS…"/></div>
          <div><label className="ai-label">Career Goal</label><textarea className="ai-input" rows={3} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. Become a CTO, launch my startup…"/></div>
        </div>
      </div>

      {/* Language */}
      <div className="glass card" style={{marginBottom:20}}>
        <div className="section-head"><span className="ms" style={{color:"var(--cyan)"}}>language</span><h3 className="section-title" style={{fontSize:15}}>Language Preference</h3></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {LANGS.map(l=>(
            <button key={l} className={`btn ${lang===l?"btn-primary":"btn-subtle"} btn-sm`} onClick={()=>onLangChange(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
        <button className="btn btn-primary btn-lg" onClick={save}>
          <span className="ms">save</span> Save Profile
        </button>
        <button className="btn btn-subtle btn-lg" onClick={onLogout}>
          <span className="ms">logout</span> Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─── PageHeader ─────────────────────────────────────────── */
function PageHeader({title, desc}) {
  return (
    <div style={{marginBottom:24}}>
      <h1 className="font-display" style={{fontSize:"clamp(26px,5vw,42px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:6}}>{title}</h1>
      <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.6}}>{desc}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════════════════════ */
export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [user, setUser]           = useState({name:"Alex Chen",email:"alex@careerai.io"});
  const [page, setPage]           = useState("home");
  const [sidebarOpen, setSidebar] = useState(false);
  const [lang, setLang]           = useState("English");
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [history, setHistory]     = useState([]);

  /* Load history from localStorage on mount */
  useEffect(()=>{
    try{ const h=JSON.parse(localStorage.getItem("careerai-history")||"[]"); setHistory(h); }catch{}
    const li = localStorage.getItem("careerai-loggedin");
    if(li) { try{ setUser(JSON.parse(li)); setLoggedIn(true); }catch{ setLoggedIn(true); } }
  },[]);

  /* Layout manager — CSS handles all visual rules, JS only toggles .open class */
  useEffect(()=>{
    if(typeof window==="undefined") return;
    const sidebar = document.getElementById("sidebar");
    if(!sidebar) return;
    if(window.innerWidth < 768){
      // Mobile: toggle .open class, CSS does the rest
      if(sidebarOpen){ sidebar.classList.add("open"); }
      else { sidebar.classList.remove("open"); }
    } else {
      // Desktop: always open, no class needed (CSS handles via media query)
      sidebar.classList.remove("open");
    }
  },[sidebarOpen, loggedIn]);

  const showToast = useCallback((msg,type="success")=>{ setToast({msg,type}); },[]);

  /* callAI — unchanged logic, all 12 tools preserved */
  const callAI = useCallback(async(tool, data)=>{
    setLoading(true);
    try{
      const res=await fetch("/api/ai",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tool,data,lang}),
      });
      const json=await res.json();
      if(json.error){ showToast(json.error,"error"); return null; }
      const entry={tool,time:new Date().toLocaleString(),output:json.result,summary:data.summary||tool};
      setHistory(h=>{
        const nh=[entry,...h].slice(0,50);
        localStorage.setItem("careerai-history",JSON.stringify(nh));
        return nh;
      });
      showToast("✓ Done!","success");
      return json.result;
    }catch(e){
      showToast(e.message||"AI call failed","error");
      return null;
    }finally{
      setLoading(false);
    }
  },[lang,showToast]);

  function navigate(p){
    setPage(p);
    setSidebar(false);
    if(typeof window!=="undefined") window.scrollTo({top:0,behavior:"smooth"});
  }

  function handleLogin(u){ setUser(u); setLoggedIn(true); localStorage.setItem("careerai-loggedin",JSON.stringify(u)); }
  function handleLogout(){ setLoggedIn(false); localStorage.removeItem("careerai-loggedin"); setPage("home"); }

  /* Desktop topbar hidden; mobile topbar shown */
  const isMobile = typeof window!=="undefined" && window.innerWidth < 768;

  if(!loggedIn) return (
    <>
      <Head><title>CareerAI — AI Career Engine</title></Head>
      <Orbs/><Particles/>
      <LoginScreen onLogin={handleLogin}/>
    </>
  );

  return (
    <>
      <Head>
        <title>CareerAI — {TOOLS.find(t=>t.id===page)?.label||"Home"}</title>
      </Head>

      <Orbs/><Particles/>
      <LoadingOverlay show={loading}/>

      {/* Sidebar overlay (mobile) */}
      <div id="sidebar-overlay" className={sidebarOpen?"active":""} onClick={()=>setSidebar(false)}/>

      {/* Sidebar */}
      <Sidebar active={page} onNav={navigate} user={user} onLogout={handleLogout}/>

      {/* Mobile TopBar */}
      <div id="topbar-wrap">
        <TopBar onMenuClick={()=>{setSidebar(v=>!v);}} sidebarOpen={sidebarOpen} user={user} onNav={navigate}/>
      </div>

      {/* Main */}
      <main id="main-content" style={{minHeight:"100vh",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(16px,4vw,40px) clamp(16px,4vw,40px)"}}>
          {page==="home"      && <HomePage onNav={navigate}/>}
          {page==="resume"    && <ResumePage callAI={callAI} loading={loading}/>}
          {page==="interview" && <InterviewPage callAI={callAI} loading={loading}/>}
          {page==="cover"     && <CoverPage callAI={callAI} loading={loading}/>}
          {page==="linkedin"  && <LinkedInPage callAI={callAI} loading={loading}/>}
          {page==="decoder"   && <DecoderPage callAI={callAI} loading={loading}/>}
          {page==="apply"     && <ApplyPage callAI={callAI} loading={loading} showToast={showToast}/>}
          {page==="jobs"      && <JobsPage callAI={callAI} loading={loading}/>}
          {page==="career"    && <CareerPage callAI={callAI} loading={loading}/>}
          {page==="salary"    && <SalaryPage callAI={callAI} loading={loading}/>}
          {page==="history"   && <HistoryPage history={history} onClear={()=>{ setHistory([]); localStorage.removeItem("careerai-history"); showToast("History cleared"); }}/>}
          {page==="profile"   && <ProfilePage user={user} onSave={(u)=>{ setUser(u); localStorage.setItem("careerai-loggedin",JSON.stringify(u)); showToast("Profile saved!"); }} lang={lang} onLangChange={l=>{ setLang(l); showToast(`Language set to ${l}`); }} onLogout={handleLogout}/>}
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav active={page} onNav={navigate}/>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </>
  );
}