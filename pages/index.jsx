import { useState, useEffect, useRef } from “react”;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
SUPABASE_URL: “https://ymodtqqofxlmxltitkkn.supabase.co”,
SUPABASE_ANON_KEY: “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltb2R0cXFvZnhsbXhsdGl0a2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODg1ODcsImV4cCI6MjA4OTU2NDU4N30.ARfdjJbsxrKwbpWzETROF3XD9mI_eOnRzsny8Pruueg”,
APIFY_TOKEN: “apify_api_ul7GeZ8Nm0MXtxObi020cUz1hP5LtZ1Ic4cI”,
};

const db = {
async req(table, method = “GET”, body = null, qs = “”) {
const r = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${table}${qs}`, {
method,
headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`, “Content-Type”: “application/json”, Prefer: “return=representation” },
body: body ? JSON.stringify(body) : null,
});
const t = await r.text();
return t ? JSON.parse(t) : [];
},
getAll: (t) => db.req(t, “GET”, null, “?order=created_at.desc”),
insert: (t, d) => db.req(t, “POST”, d),
update: (t, id, d) => db.req(t, “PATCH”, d, `?id=eq.${id}`),
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = [
{ id: 1, username: “@zuri.beauty.ca”, name: “Zuri Beauty Studio”, avatar: “ZB”, avatarColor: “#F59E0B”, followers: 4820, location: “Toronto, Canada”, niche: “Afro Hair & Beauty”, bio: “✨ Natural hair specialist | Book via link | DM for appts | Toronto 🇨🇦”, engagementScore: 87, businessScore: 94, brandingScore: 42, diasporaScore: 96, pitchPotential: “Very High”, status: “New”, hasBookingLink: true, hasWhatsapp: false, tags: [“afro hair”, “toronto”], dealValue: 0 },
{ id: 2, username: “@adaeze.glam”, name: “Adaeze Glam”, avatar: “AG”, avatarColor: “#EF4444”, followers: 2310, location: “London, UK”, niche: “MUA / Lashes”, bio: “💄 MUA based in London | Bridal & Editorial | Book now 👇”, engagementScore: 91, businessScore: 88, brandingScore: 38, diasporaScore: 89, pitchPotential: “High”, status: “Messaged”, hasBookingLink: false, hasWhatsapp: true, tags: [“mua”, “london”], dealValue: 0 },
{ id: 3, username: “@naija.plates.atl”, name: “Naija Plates ATL”, avatar: “NP”, avatarColor: “#10B981”, followers: 8940, location: “Atlanta, USA”, niche: “Nigerian Food”, bio: “🍲 Authentic Nigerian cuisine | Atlanta | Orders via DM”, engagementScore: 73, businessScore: 91, brandingScore: 29, diasporaScore: 98, pitchPotential: “Very High”, status: “New”, hasBookingLink: false, hasWhatsapp: false, tags: [“naija”, “atlanta”], dealValue: 0 },
{ id: 4, username: “@empress.braids.uk”, name: “Empress Braids UK”, avatar: “EB”, avatarColor: “#8B5CF6”, followers: 6100, location: “Manchester, UK”, niche: “Braiding Studio”, bio: “👑 Knotless | Box braids | Manchester | DM to book”, engagementScore: 82, businessScore: 86, brandingScore: 45, diasporaScore: 92, pitchPotential: “High”, status: “In Conversation”, hasBookingLink: false, hasWhatsapp: true, tags: [“braids”, “manchester”], dealValue: 0 },
{ id: 5, username: “@kemi.cakes.houston”, name: “Kemi’s Cakes”, avatar: “KC”, avatarColor: “#F97316”, followers: 3450, location: “Houston, USA”, niche: “Custom Baker”, bio: “🎂 Custom cakes | Houston TX | DMs open”, engagementScore: 68, businessScore: 79, brandingScore: 33, diasporaScore: 85, pitchPotential: “Medium”, status: “Negotiation”, hasBookingLink: false, hasWhatsapp: false, tags: [“cakes”, “houston”], dealValue: 350 },
{ id: 6, username: “@afrobeauty.collective”, name: “Afro Beauty Collective”, avatar: “AC”, avatarColor: “#06B6D4”, followers: 12800, location: “New York, USA”, niche: “Beauty Brand”, bio: “🌍 Celebrating African beauty | NYC | Shop link in bio”, engagementScore: 61, businessScore: 95, brandingScore: 58, diasporaScore: 97, pitchPotential: “High”, status: “Won”, hasBookingLink: true, hasWhatsapp: false, tags: [“afrobeauty”, “nyc”], dealValue: 480 },
{ id: 7, username: “@glambyoya”, name: “Glam By Oya”, avatar: “GO”, avatarColor: “#EC4899”, followers: 5200, location: “Birmingham, UK”, niche: “MUA / Bridal”, bio: “✨ Bridal MUA | Birmingham UK | Bookings open 💌”, engagementScore: 79, businessScore: 83, brandingScore: 36, diasporaScore: 88, pitchPotential: “High”, status: “New”, hasBookingLink: false, hasWhatsapp: true, tags: [“mua”, “birmingham”], dealValue: 0 },
];

const PIPELINE_COLS = [“New”, “Messaged”, “In Conversation”, “Negotiation”, “Won”, “Lost”];
const PITCH_STYLES = [“Friendly”, “Premium Consultant”, “Direct Closer”, “Curiosity Hook”];
const AVATAR_COLORS = [”#F59E0B”,”#EF4444”,”#10B981”,”#8B5CF6”,”#F97316”,”#06B6D4”,”#EC4899”,”#84CC16”];
const STATUS_COLORS = { New: “#F59E0B”, Messaged: “#8B5CF6”, “In Conversation”: “#06B6D4”, Negotiation: “#F97316”, Won: “#10B981”, Lost: “#6B7280” };

const PITCHES = {
Friendly: (p) => `Hey ${p.name.split(" ")[0]} 👋 Your content in the ${p.niche} space is genuinely impressive. I noticed your page could use a stronger booking setup and tighter branding to match how good your actual work is. I help businesses like yours get that sorted quickly. Would you be open to a quick look?`,
“Premium Consultant”: (p) => `Hi — I came across ${p.username} while researching top ${p.niche} businesses in ${p.location}. Your work is strong, but your digital presence isn't quite matching that quality. I specialize in brand identity and booking systems for businesses in your niche. Happy to share what that could look like for you.`,
“Direct Closer”: (p) => `Your ${p.niche} work is solid. The problem? Your page isn't converting visitors into bookings. I fix that — brand upgrade, booking system, cleaner presence. Want me to show you exactly what I'd change?`,
“Curiosity Hook”: (p) => `Quick question — do you ever get people following you but not actually booking? That's usually a branding and funnel problem, not a quality problem. I work specifically with ${p.niche} businesses on this. Worth a conversation?`,
};

const FOLLOWUPS = {
day2: (p) => `Hey, just circling back. I put together a quick idea of what a refresh could look like for ${p.username} — happy to share if you're curious.`,
day5: (p) => `Still thinking about this. I've been working with similar businesses in ${p.location} lately and results have been really clean. Want to see examples?`,
final: (p) => `Last follow-up from me. If you ever want to upgrade your branding or get a proper booking system set up, feel free to reach back out anytime.`,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getInitials = (n = “”) => n.split(” “).map(w => w[0]).join(””).slice(0, 2).toUpperCase() || “??”;
const fmtNum = (n) => Number(n || 0).toLocaleString();

function useIsMobile() {
const [mobile, setMobile] = useState(window.innerWidth < 768);
useEffect(() => {
const fn = () => setMobile(window.innerWidth < 768);
window.addEventListener(“resize”, fn);
return () => window.removeEventListener(“resize”, fn);
}, []);
return mobile;
}

function scoreFromBio(bio = “”) {
const b = bio.toLowerCase(); let s = 50;
if (b.includes(“book”)) s += 15;
if (b.includes(“dm”) || b.includes(“whatsapp”)) s += 10;
if (b.includes(“linktree”) || b.includes(“link in bio”)) s += 8;
[“london”,“toronto”,“atlanta”,“houston”,“new york”,“manchester”,“birmingham”].forEach(c => { if (b.includes(c)) s += 8; });
return Math.min(s, 99);
}
function calcDiaspora(bio = “”, user = “”) {
const t = (bio + user).toLowerCase(); let s = 40;
[“african”,“naija”,“nigerian”,“ghanaian”,“afro”,“caribbean”,“black owned”,“diaspora”,“west african”].forEach(k => { if (t.includes(k)) s += 12; });
return Math.min(s, 99);
}
function calcPitch(b, d, br) {
const a = (b + d + (100 - br)) / 3;
if (a >= 80) return “Very High”; if (a >= 65) return “High”; if (a >= 50) return “Medium”; return “Low”;
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
bg: “#09090b”, surface: “#111113”, surfaceHover: “#18181b”,
border: “#1f1f23”, borderLight: “#27272a”,
yellow: “#EAB308”, yellowHover: “#CA8A04”,
yellowMuted: “rgba(234,179,8,0.1)”, yellowBorder: “rgba(234,179,8,0.2)”,
white: “#fafafa”, gray: “#a1a1aa”, grayMuted: “#52525b”, grayDark: “#27272a”,
green: “#22c55e”, red: “#ef4444”,
};

const GLOBAL_CSS = `
@import url(‘https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap’);
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: ${T.bg}; color: ${T.white}; font-family: ‘DM Sans’, sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
input, textarea, button { font-family: ‘DM Sans’, sans-serif; }
input::placeholder { color: ${T.grayMuted}; }
input:focus, textarea:focus { outline: none; border-color: ${T.yellow} !important; box-shadow: 0 0 0 3px rgba(234,179,8,0.08); }

@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes toastIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }

.fade-up { animation: fadeUp 0.3s ease both; }
.skeleton { background: linear-gradient(90deg, ${T.surface} 25%, ${T.surfaceHover} 50%, ${T.surface} 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }

.pcard { transition: border-color 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
.pcard:hover { border-color: ${T.borderLight} !important; box-shadow: 0 4px 20px rgba(0,0,0,0.45); }
.pcard:active { transform: scale(0.99); }

.btn-y { transition: background 0.15s, transform 0.1s, box-shadow 0.15s; }
.btn-y:hover { background: ${T.yellowHover} !important; box-shadow: 0 4px 14px rgba(234,179,8,0.28); }
.btn-y:active { transform: scale(0.97); }

.btn-g { transition: background 0.15s, color 0.15s; }
.btn-g:hover { background: ${T.surfaceHover} !important; color: ${T.white} !important; }

.nav-item { transition: background 0.15s, color 0.15s; }
.nav-item:hover { background: ${T.surfaceHover} !important; color: ${T.white} !important; }

.pill { transition: all 0.15s; }
.pill:hover { opacity: 0.8; }

.tab { transition: color 0.15s, border-color 0.15s; }
.tab:hover { color: ${T.white} !important; }

.pipe-col { transition: border-color 0.18s, background 0.18s; }
.pipe-card { transition: border-color 0.15s, box-shadow 0.15s; cursor: grab; }
.pipe-card:hover { border-color: rgba(234,179,8,0.28) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }

/* Mobile pipeline swipe container */
.pipe-scroll {
display: flex;
gap: 10px;
overflow-x: auto;
padding-bottom: 12px;
scroll-snap-type: x mandatory;
-webkit-overflow-scrolling: touch;
scrollbar-width: none;
}
.pipe-scroll::-webkit-scrollbar { display: none; }
.pipe-col-wrap {
scroll-snap-align: start;
flex: 0 0 72vw;
max-width: 240px;
}
@media (min-width: 768px) {
.pipe-col-wrap { flex: 0 0 160px; max-width: 160px; }
}

/* Responsive grid */
.prospect-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .prospect-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .prospect-grid { grid-template-columns: 1fr 1fr 1fr; } }

.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (min-width: 640px) { .stat-grid { grid-template-columns: repeat(4, 1fr); } }

.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (min-width: 480px) { .score-grid { grid-template-columns: repeat(4, 1fr); } }

.tz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.intel-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 640px) { .intel-grid { grid-template-columns: 1fr 1fr; } }
.analytics-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 768px) { .analytics-grid { grid-template-columns: 1fr 1fr; } }
`;

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
function Toast({ message, type = “success”, onDone }) {
useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
const bg = type === “success” ? T.green : type === “error” ? T.red : T.surface;
return (
<div style={{ position:“fixed”, bottom:80, right:16, zIndex:999, background:bg, color:”#000”, padding:“11px 16px”, borderRadius:10, fontSize:13, fontWeight:600, boxShadow:“0 8px 24px rgba(0,0,0,0.4)”, animation:“toastIn 0.25s ease”, display:“flex”, alignItems:“center”, gap:8, maxWidth:280 }}>
<span>{type===“success”?“✓”:“✕”}</span>{message}
</div>
);
}

function Skel({ w=“100%”, h=14 }) {
return <div className=“skeleton” style={{ width:w, height:h }} />;
}

function Badge({ label }) {
const map = { “Very High”: T.yellow, High: T.green, Medium: T.yellow, Low: T.red };
const c = map[label] || T.gray;
return <span style={{ background:c+“18”, color:c, border:`1px solid ${c}28`, borderRadius:6, padding:“3px 8px”, fontSize:11, fontWeight:600, whiteSpace:“nowrap” }}>{label}</span>;
}

function Av({ initials, color, size=38 }) {
return (
<div style={{ width:size, height:size, borderRadius:“50%”, background:color+“20”, border:`1.5px solid ${color}35`, display:“flex”, alignItems:“center”, justifyContent:“center”, fontSize:size*0.3, fontWeight:700, color, flexShrink:0 }}>
{initials}
</div>
);
}

function Bar({ value, color=T.yellow }) {
return (
<div style={{ background:T.grayDark, borderRadius:4, height:3, width:“100%”, overflow:“hidden” }}>
<div style={{ width:`${value}%`, height:“100%”, background:color, borderRadius:4, transition:“width 0.5s ease” }} />
</div>
);
}

function Ring({ value, color, size=50 }) {
const r = size/2 - 5, circ = 2*Math.PI*r, dash = (value/100)*circ;
return (
<svg width={size} height={size} style={{ transform:“rotate(-90deg)” }}>
<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.grayDark} strokeWidth={3}/>
<circle cx={size/2} cy={size/2} r={r} fill=“none” stroke={color} strokeWidth={3} strokeDasharray={`${dash} ${circ}`} strokeLinecap=“round” style={{ transition:“stroke-dasharray 0.5s ease” }}/>
</svg>
);
}

// ─── PROSPECT CARD ────────────────────────────────────────────────────────────
function PCard({ prospect: p, onOpen, delay=0 }) {
return (
<div className=“pcard fade-up” onClick={() => onOpen(p)}
style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16, animationDelay:`${delay}ms`, position:“relative”, overflow:“hidden” }}>
<div style={{ position:“absolute”, top:0, left:0, width:3, height:“100%”, background:STATUS_COLORS[p.status]||T.grayMuted }}/>
<div style={{ paddingLeft:8 }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“flex-start”, marginBottom:10 }}>
<div style={{ display:“flex”, alignItems:“center”, gap:9 }}>
<Av initials={p.avatar||getInitials(p.name)} color={p.avatarColor||T.yellow} size={36}/>
<div>
<div style={{ fontSize:13, fontWeight:600, color:T.white }}>{p.username}</div>
<div style={{ fontSize:11, color:T.grayMuted, marginTop:1 }}>{p.location}</div>
</div>
</div>
<div style={{ display:“flex”, flexDirection:“column”, alignItems:“flex-end”, gap:4 }}>
<Badge label={p.pitchPotential}/>
<span style={{ fontSize:10, color:T.grayMuted, fontFamily:”‘DM Mono’,monospace” }}>{fmtNum(p.followers)}</span>
</div>
</div>
<div style={{ fontSize:12, color:T.grayMuted, marginBottom:11, lineHeight:1.5, display:”-webkit-box”, WebkitLineClamp:2, WebkitBoxOrient:“vertical”, overflow:“hidden” }}>{p.bio}</div>
<div style={{ display:“grid”, gridTemplateColumns:“1fr 1fr”, gap:“7px 16px”, marginBottom:10 }}>
{[
{ label:“Engagement”, val:p.engagementScore, color:T.green },
{ label:“Business Fit”, val:p.businessScore, color:T.yellow },
{ label:“Diaspora”, val:p.diasporaScore, color:”#8B5CF6” },
{ label:“Branding Need”, val:100-p.brandingScore, color:T.red },
].map(s => (
<div key={s.label}>
<div style={{ display:“flex”, justifyContent:“space-between”, marginBottom:3 }}>
<span style={{ fontSize:10, color:T.grayMuted }}>{s.label}</span>
<span style={{ fontSize:10, color:s.color, fontFamily:”‘DM Mono’,monospace”, fontWeight:500 }}>{s.val}</span>
</div>
<Bar value={s.val} color={s.color}/>
</div>
))}
</div>
<div style={{ display:“flex”, gap:5, flexWrap:“wrap” }}>
{p.hasBookingLink && <span style={{ fontSize:10, background:T.green+“15”, color:T.green, border:`1px solid ${T.green}22`, padding:“2px 7px”, borderRadius:5, fontWeight:500 }}>Booking</span>}
{p.hasWhatsapp && <span style={{ fontSize:10, background:”#25D36618”, color:”#25D366”, border:“1px solid #25D36628”, padding:“2px 7px”, borderRadius:5 }}>WhatsApp</span>}
<span style={{ fontSize:10, background:T.bg, color:T.grayMuted, border:`1px solid ${T.border}`, padding:“2px 7px”, borderRadius:5 }}>{p.niche}</span>
</div>
</div>
</div>
);
}

// ─── PROSPECT MODAL ───────────────────────────────────────────────────────────
function PModal({ prospect: p, onClose, onStatusChange, onToast }) {
const [tab, setTab] = useState(“analysis”);
const [style, setStyle] = useState(“Premium Consultant”);
const [pitch, setPitch] = useState(PITCHES[“Premium Consultant”](p));
const [analysis, setAnalysis] = useState(null);
const [loading, setLoading] = useState(false);
const [copied, setCopied] = useState(false);
const [status, setStatus] = useState(p.status);

const claude = async (prompt) => {
const r = await fetch(“https://api.anthropic.com/v1/messages”, {
method:“POST”, headers:{“Content-Type”:“application/json”},
body: JSON.stringify({ model:“claude-sonnet-4-20250514”, max_tokens:1000, messages:[{role:“user”,content:prompt}] })
});
return (await r.json()).content[0].text;
};

useEffect(() => {
setLoading(true);
claude(`Analyze this Instagram business. Return ONLY valid JSON, no markdown.\nBusiness: ${p.name}, ${p.niche}, ${p.location}\nBio: "${p.bio}"\nFollowers: ${p.followers}\nBranding score: ${p.brandingScore}/100\nHas booking link: ${p.hasBookingLink}\nReturn exactly: {"strengths":["...","...","..."],"weaknesses":["...","...","..."],"opportunities":["...","...","..."],"bookingPotential":"$X–$Y/month","serviceAngle":"one sentence"}`)
.then(t => setAnalysis(JSON.parse(t.replace(/`json|`/g,””).trim())))
.catch(() => setAnalysis({ strengths:[“Active posting schedule”,“Clear niche focus”,“Good audience engagement”], weaknesses:[“No booking system”,“Inconsistent branding”,“Weak highlight covers”], opportunities:[“Booking page setup”,“Brand identity design”,“Instagram funnel build”], bookingPotential:”$600–$1,200/month”, serviceAngle:`${p.name} needs a cohesive brand identity and booking funnel.` }))
.finally(() => setLoading(false));
}, []);

const genPitch = async (s) => {
setLoading(true);
try {
const t = await claude(`Generate a ${s} Instagram DM pitch.\nBusiness: ${p.name}, ${p.niche}, ${p.location}\nBio: "${p.bio}"\nBranding: ${p.brandingScore}/100\nServices: brand identity, Instagram branding, highlight covers, flyers, booking system.\nUnder 90 words. Natural. No emojis unless Friendly. Just the message.`);
setPitch(t);
} catch { setPitch(PITCHES[s](p)); }
setLoading(false);
};

const copy = (text) => {
navigator.clipboard.writeText(text).then(() => { setCopied(true); onToast(“Copied!”); setTimeout(() => setCopied(false), 2000); });
};

const changeStatus = async (s) => {
setStatus(s); await onStatusChange(p.id, s); onToast(`Moved to ${s}`);
};

const markWon = async () => {
await onStatusChange(p.id, “Won”); setStatus(“Won”); onToast(“Deal marked Won! 🎉”);
};

return (
<div style={{ position:“fixed”, inset:0, background:“rgba(0,0,0,0.72)”, zIndex:200, display:“flex”, alignItems:“flex-end”, justifyContent:“center”, backdropFilter:“blur(6px)” }} onClick={onClose}>
<div onClick={e => e.stopPropagation()}
style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:“18px 18px 0 0”, width:“100%”, maxWidth:680, maxHeight:“92vh”, overflowY:“auto”, animation:“slideUp 0.25s ease” }}>

```
    {/* Header */}
    <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:T.surface, zIndex:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Av initials={p.avatar||getInitials(p.name)} color={p.avatarColor||T.yellow} size={42}/>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:T.white }}>{p.username}</div>
          <div style={{ fontSize:12, color:T.grayMuted }}>{p.location} · {fmtNum(p.followers)} followers</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {status !== "Won"
          ? <button className="btn-y" onClick={markWon} style={{ background:T.green, border:"none", borderRadius:8, padding:"8px 14px", color:"#000", fontSize:13, fontWeight:600 }}>Mark Won</button>
          : <Badge label="Won"/>
        }
        <button className="btn-g" onClick={onClose} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 11px", color:T.grayMuted, fontSize:13 }}>✕</button>
      </div>
    </div>

    {/* Status pills */}
    <div style={{ padding:"10px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
      <span style={{ fontSize:11, color:T.grayMuted, fontWeight:500, marginRight:2 }}>Status:</span>
      {PIPELINE_COLS.map(col => (
        <button key={col} className="pill" onClick={() => changeStatus(col)}
          style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${status===col ? STATUS_COLORS[col] : T.border}`, background:status===col ? STATUS_COLORS[col]+"20" : "transparent", color:status===col ? STATUS_COLORS[col] : T.grayMuted, fontSize:11, fontWeight:status===col?600:400 }}>
          {col}
        </button>
      ))}
    </div>

    {/* Tabs */}
    <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, padding:"0 18px" }}>
      {["analysis","pitch","followup"].map(t => (
        <button key={t} className="tab" onClick={() => setTab(t)}
          style={{ padding:"12px 0", marginRight:20, border:"none", background:"transparent", color:tab===t?T.white:T.grayMuted, fontSize:13, fontWeight:tab===t?600:400, borderBottom:`2px solid ${tab===t?T.yellow:"transparent"}` }}>
          {t==="analysis"?"Analysis":t==="pitch"?"Generate Pitch":"Follow-Ups"}
        </button>
      ))}
    </div>

    <div style={{ padding:18 }}>

      {/* Analysis */}
      {tab==="analysis" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {loading && !analysis ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Skel h={60}/><Skel h={60}/><Skel h={60}/>
            </div>
          ) : analysis && (
            <>
              <div className="score-grid">
                {[
                  { label:"Engagement", val:p.engagementScore, color:T.green },
                  { label:"Business Fit", val:p.businessScore, color:T.yellow },
                  { label:"Diaspora", val:p.diasporaScore, color:"#8B5CF6" },
                  { label:"Branding Need", val:100-p.brandingScore, color:T.red },
                ].map(s => (
                  <div key={s.label} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:12, textAlign:"center" }}>
                    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                      <Ring value={s.val} color={s.color} size={50}/>
                      <div style={{ position:"absolute", fontSize:12, fontWeight:700, color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.val}</div>
                    </div>
                    <div style={{ fontSize:10, color:T.grayMuted, fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {[
                { key:"strengths", label:"Strengths", icon:"✓", color:T.green },
                { key:"weaknesses", label:"Weaknesses", icon:"✕", color:T.red },
                { key:"opportunities", label:"Opportunities", icon:"◎", color:T.yellow },
              ].map(sec => (
                <div key={sec.key} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:sec.color, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    {sec.icon} {sec.label.toUpperCase()}
                  </div>
                  {analysis[sec.key].map((item, i) => (
                    <div key={i} style={{ fontSize:13, color:T.gray, paddingLeft:10, borderLeft:`2px solid ${sec.color}28`, marginBottom:6, lineHeight:1.5 }}>{item}</div>
                  ))}
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:10, color:T.grayMuted, fontWeight:600, marginBottom:5 }}>BOOKING POTENTIAL</div>
                  <div style={{ fontSize:17, fontWeight:700, color:T.yellow, fontFamily:"'DM Mono',monospace" }}>{analysis.bookingPotential}</div>
                </div>
                <div style={{ background:T.yellowMuted, border:`1px solid ${T.yellowBorder}`, borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:10, color:T.yellow, fontWeight:600, marginBottom:5 }}>SERVICE ANGLE</div>
                  <div style={{ fontSize:12, color:T.gray, lineHeight:1.6 }}>{analysis.serviceAngle}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pitch */}
      {tab==="pitch" && (
        <div>
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {PITCH_STYLES.map(s => (
              <button key={s} className="pill" onClick={() => { setStyle(s); genPitch(s); }}
                style={{ padding:"6px 13px", borderRadius:20, border:`1px solid ${style===s?T.yellow:T.border}`, background:style===s?T.yellowMuted:"transparent", color:style===s?T.yellow:T.grayMuted, fontSize:12, fontWeight:style===s?600:400 }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:16, marginBottom:12, minHeight:120 }}>
            {loading ? <div style={{ display:"flex", flexDirection:"column", gap:8 }}><Skel h={13}/><Skel h={13} w="85%"/><Skel h={13} w="70%"/></div>
              : <div style={{ fontSize:14, color:T.gray, lineHeight:1.75 }}>{pitch}</div>
            }
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-g" onClick={() => genPitch(style)} style={{ flex:1, padding:"10px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.gray, fontSize:13 }}>↺ Regenerate</button>
            <button className="btn-y" onClick={() => copy(pitch)} style={{ flex:1, padding:"10px", background:copied?T.green:T.yellow, border:"none", borderRadius:8, color:"#000", fontSize:13, fontWeight:600 }}>{copied?"✓ Copied!":"Copy Message"}</button>
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {tab==="followup" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { key:"day2", label:"Day 2 — Reminder", note:"2 days after first message" },
            { key:"day5", label:"Day 5 — Value Drop", note:"Warm follow-up" },
            { key:"final", label:"Final Close", note:"Last soft attempt" },
          ].map(item => (
            <div key={item.key} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.white }}>{item.label}</div>
                <span style={{ fontSize:11, color:T.grayMuted }}>{item.note}</span>
              </div>
              <div style={{ fontSize:13, color:T.gray, lineHeight:1.7, marginBottom:10 }}>{FOLLOWUPS[item.key](p)}</div>
              <button className="btn-g" onClick={() => copy(FOLLOWUPS[item.key](p))} style={{ padding:"6px 13px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:7, color:T.gray, fontSize:12 }}>Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

);
}

// ─── DAILY HUNT ───────────────────────────────────────────────────────────────
function DailyHunt({ prospects, onOpen }) {
const [progress, setProgress] = useState(() => { try { return parseInt(localStorage.getItem(“pf_p”)||“0”); } catch { return 0; } });
const total = 20;
const hot = prospects.filter(p => [“Very High”,“High”].includes(p.pitchPotential));

const bump = () => { const v = Math.min(total, progress+1); setProgress(v); try { localStorage.setItem(“pf_p”, v); } catch {} };
const reset = () => { setProgress(0); try { localStorage.setItem(“pf_p”, 0); } catch {} };

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:16 }}>
{/* Progress card */}
<div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:20 }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“flex-start”, marginBottom:16 }}>
<div>
<div style={{ fontSize:11, color:T.yellow, fontWeight:600, letterSpacing:0.7, marginBottom:6, textTransform:“uppercase” }}>Daily Hunt</div>
<div style={{ fontSize:22, fontWeight:700, color:T.white, marginBottom:3 }}>
{progress >= total ? “Quota Complete ✓” : `${total - progress} pitches left`}
</div>
<div style={{ fontSize:13, color:T.grayMuted }}>
{progress >= total ? “Great work. Come back tomorrow.” : “Stay consistent — pipeline builds daily.”}
</div>
</div>
<div style={{ textAlign:“right” }}>
<div style={{ fontSize:38, fontWeight:800, color:progress>=total?T.green:T.yellow, fontFamily:”‘DM Mono’,monospace”, lineHeight:1 }}>{progress}</div>
<div style={{ fontSize:12, color:T.grayMuted }}>of {total}</div>
</div>
</div>
<div style={{ background:T.grayDark, borderRadius:6, height:5, overflow:“hidden”, marginBottom:16 }}>
<div style={{ width:`${(progress/total)*100}%`, height:“100%”, background:progress>=total?T.green:T.yellow, borderRadius:6, transition:“width 0.5s ease” }}/>
</div>
<div style={{ display:“flex”, gap:8 }}>
<button className=“btn-y” onClick={bump} style={{ flex:1, padding:“10px”, background:T.yellow, border:“none”, borderRadius:9, color:”#000”, fontSize:13, fontWeight:600 }}>+ Mark Sent</button>
<button className=“btn-g” onClick={reset} style={{ padding:“10px 16px”, background:T.bg, border:`1px solid ${T.border}`, borderRadius:9, color:T.grayMuted, fontSize:13 }}>Reset</button>
</div>
</div>

```
  {/* Timezone windows */}
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:18 }}>
    <div style={{ fontSize:11, color:T.grayMuted, fontWeight:600, letterSpacing:0.7, marginBottom:12, textTransform:"uppercase" }}>Best Outreach Windows</div>
    <div className="tz-grid">
      {[
        { zone:"UK (GMT)", window:"9am–12pm · 7–9pm", active:true },
        { zone:"US East", window:"11am–2pm · 8–10pm", active:false },
        { zone:"US West", window:"2pm–5pm · 10pm–12am", active:false },
        { zone:"Canada", window:"Match US windows", active:false },
      ].map(tz => (
        <div key={tz.zone} style={{ background:tz.active?T.yellowMuted:T.bg, border:`1px solid ${tz.active?T.yellowBorder:T.border}`, borderRadius:9, padding:"11px 12px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:tz.active?T.yellow:T.gray, marginBottom:3 }}>{tz.zone}</div>
          <div style={{ fontSize:11, color:T.grayMuted, fontFamily:"'DM Mono',monospace" }}>{tz.window}</div>
        </div>
      ))}
    </div>
  </div>

  {/* Priority prospects */}
  <div>
    <div style={{ fontSize:11, color:T.grayMuted, fontWeight:600, letterSpacing:0.7, marginBottom:12, textTransform:"uppercase" }}>
      Priority Prospects — {hot.length} ready
    </div>
    {hot.length === 0 ? (
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:36, textAlign:"center" }}>
        <div style={{ fontSize:28, marginBottom:10 }}>◎</div>
        <div style={{ fontSize:14, fontWeight:600, color:T.white, marginBottom:5 }}>No prospects yet</div>
        <div style={{ fontSize:13, color:T.grayMuted }}>Go to Prospects to search and import some.</div>
      </div>
    ) : (
      <div className="prospect-grid">
        {hot.slice(0, 6).map((p, i) => <PCard key={p.id} prospect={p} onOpen={onOpen} delay={i*50}/>)}
      </div>
    )}
  </div>
</div>
```

);
}

// ─── PROSPECTS VIEW ───────────────────────────────────────────────────────────
function ProspectsView({ prospects, setProspects, onOpen, isConfigured }) {
const [hashtag, setHashtag] = useState(””);
const [minF, setMinF] = useState(500);
const [maxF, setMaxF] = useState(50000);
const [loading, setLoading] = useState(false);
const [statusMsg, setStatusMsg] = useState(””);
const [filter, setFilter] = useState(“All”);

const displayed = prospects.filter(p => filter===“All” || p.pitchPotential===filter);

const hunt = async () => {
if (!hashtag.trim()) return;
if (!isConfigured.apify) {
setStatusMsg(“Add APIFY_TOKEN to pull real Instagram accounts”);
return;
}
setLoading(true); setStatusMsg(“Starting scrape…”);
try {
const run = await (await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs?token=${CONFIG.APIFY_TOKEN}`, { method:“POST”, headers:{“Content-Type”:“application/json”}, body:JSON.stringify({ hashtags:[hashtag], resultsLimit:20 }) })).json();
const runId = run.data?.id; if (!runId) throw new Error(“No run ID”);
setStatusMsg(“Scraping Instagram (~30s)…”);
let n=0;
while(n<20) {
await new Promise(r => setTimeout(r,3000));
const st = await (await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs/${runId}?token=${CONFIG.APIFY_TOKEN}`)).json();
if (st.data?.status===“SUCCEEDED”) break; n++;
}
const items = await (await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs/${runId}/dataset/items?token=${CONFIG.APIFY_TOKEN}`)).json();
const newP = items.filter(i => { const f=i.followersCount||0; return f>=minF&&f<=maxF; }).map((item,i) => {
const bio=item.biography||””, user=”@”+(item.username||”?”), name=item.fullName||item.username||“Unknown”;
const bScore=scoreFromBio(bio), dScore=calcDiaspora(bio,user), brScore=Math.floor(Math.random()*40)+20;
return { id:Date.now()+i, username:user, name, avatar:getInitials(name), avatarColor:AVATAR_COLORS[i%AVATAR_COLORS.length], followers:item.followersCount||0, location:item.location?.name||“Unknown”, niche:hashtag, bio, engagementScore:Math.min(Math.round(((item.postsCount||1)/Math.max(item.followersCount,1))*2000),95), businessScore:bScore, brandingScore:brScore, diasporaScore:dScore, pitchPotential:calcPitch(bScore,dScore,brScore), status:“New”, hasBookingLink:bio.toLowerCase().includes(“book”)||bio.toLowerCase().includes(“linktree”), hasWhatsapp:bio.toLowerCase().includes(“whatsapp”), tags:[hashtag], dealValue:0 };
});
if (isConfigured.supabase) for (const p of newP) await db.insert(“prospects”, { username:p.username, name:p.name, avatar:p.avatar, avatar_color:p.avatarColor, followers:p.followers, location:p.location, niche:p.niche, bio:p.bio, engagement_score:p.engagementScore, business_score:p.businessScore, branding_score:p.brandingScore, diaspora_score:p.diasporaScore, pitch_potential:p.pitchPotential, status:“New”, has_booking_link:p.hasBookingLink, has_whatsapp:p.hasWhatsapp, deal_value:0 }).catch(()=>{});
setProspects(prev => { const ids=new Set(prev.map(p=>p.username)); return […prev, …newP.filter(p=>!ids.has(p.username))]; });
setStatusMsg(`Found ${newP.length} prospects`);
} catch { setStatusMsg(“Failed — check Apify token”); }
setLoading(false);
};

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:16 }}>
{/* Search panel */}
<div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:18 }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center”, marginBottom:14 }}>
<div style={{ fontSize:14, fontWeight:600, color:T.white }}>Instagram Prospect Hunter</div>
<span style={{ fontSize:11, background:isConfigured.apify?T.green+“20”:T.grayDark, color:isConfigured.apify?T.green:T.grayMuted, border:`1px solid ${isConfigured.apify?T.green+"35":T.border}`, borderRadius:20, padding:“3px 9px”, fontWeight:600 }}>
{isConfigured.apify?“Live”:“Demo”}
</span>
</div>
<div style={{ display:“flex”, gap:8, marginBottom:10 }}>
<input value={hashtag} onChange={e=>setHashtag(e.target.value)} onKeyDown={e=>e.key===“Enter”&&hunt()}
placeholder=“Hashtag or niche (e.g. afrohair, naijafood)”
style={{ flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:9, padding:“10px 13px”, color:T.white, fontSize:13 }}/>
<button className=“btn-y” onClick={hunt} disabled={loading}
style={{ padding:“10px 18px”, background:loading?T.grayDark:T.yellow, border:“none”, borderRadius:9, color:loading?T.grayMuted:”#000”, fontSize:13, fontWeight:600 }}>
{loading?”…”:“Hunt”}
</button>
</div>
<div style={{ display:“grid”, gridTemplateColumns:“1fr 1fr”, gap:8 }}>
{[{label:“Min followers”,val:minF,set:setMinF},{label:“Max followers”,val:maxF,set:setMaxF}].map(f=>(
<div key={f.label}>
<div style={{ fontSize:11, color:T.grayMuted, marginBottom:4 }}>{f.label}</div>
<input type=“number” value={f.val} onChange={e=>f.set(+e.target.value)}
style={{ width:“100%”, background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:“8px 11px”, color:T.white, fontSize:12 }}/>
</div>
))}
</div>
{statusMsg && <div style={{ fontSize:12, color:T.grayMuted, marginTop:8 }}>{statusMsg}</div>}
</div>

```
  {/* Filter pills */}
  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
    {["All","Very High","High","Medium"].map(f=>(
      <button key={f} className="pill" onClick={()=>setFilter(f)}
        style={{ padding:"6px 13px", borderRadius:20, border:`1px solid ${filter===f?T.yellow:T.border}`, background:filter===f?T.yellowMuted:"transparent", color:filter===f?T.yellow:T.grayMuted, fontSize:12, fontWeight:filter===f?600:400 }}>
        {f} <span style={{ opacity:0.6, fontSize:11 }}>{f==="All"?prospects.length:prospects.filter(p=>p.pitchPotential===f).length}</span>
      </button>
    ))}
  </div>

  <div className="prospect-grid">
    {displayed.map((p,i) => <PCard key={p.id} prospect={p} onOpen={onOpen} delay={i*40}/>)}
  </div>
</div>
```

);
}

// ─── PIPELINE (touch swipeable) ───────────────────────────────────────────────
function PipelineView({ prospects, onStatusChange, onToast }) {
const [dragId, setDragId] = useState(null);
const [dragOver, setDragOver] = useState(null);
const [openP, setOpenP] = useState(null);
const isMobile = useIsMobile();

const totalRev = prospects.filter(p=>p.status===“Won”).reduce((a,p)=>a+(Number(p.dealValue)||0),0);
const wonCount = prospects.filter(p=>p.status===“Won”).length;
const convRate = prospects.length > 0 ? Math.round((wonCount/prospects.length)*100) : 0;

const drop = (col) => {
if (dragId==null) return;
onStatusChange(dragId, col);
if (col===“Won”) onToast(“Deal marked Won! 🎉”);
setDragId(null); setDragOver(null);
};

// Touch-based status change for mobile (tap card → open modal → use status pills)
return (
<div>
{/* Stats */}
<div style={{ display:“grid”, gridTemplateColumns:“1fr 1fr 1fr”, gap:10, marginBottom:18 }}>
{[
{ label:“Revenue”, value:`$${totalRev.toLocaleString()}`, color:T.green },
{ label:“Won”, value:wonCount, color:T.yellow },
{ label:“Conv. Rate”, value:`${convRate}%`, color:”#8B5CF6” },
].map(s=>(
<div key={s.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:11, padding:“14px 12px” }}>
<div style={{ fontSize:10, color:T.grayMuted, fontWeight:600, letterSpacing:0.6, marginBottom:5, textTransform:“uppercase” }}>{s.label}</div>
<div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:”‘DM Mono’,monospace” }}>{s.value}</div>
</div>
))}
</div>

```
  {isMobile && (
    <div style={{ fontSize:12, color:T.grayMuted, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
      <span>←</span> Swipe to see all columns <span>→</span>
    </div>
  )}
  {!isMobile && (
    <div style={{ fontSize:11, color:T.grayMuted, marginBottom:10 }}>Drag cards between columns to update status</div>
  )}

  {/* Kanban — native scroll + snap on mobile */}
  <div className="pipe-scroll">
    {PIPELINE_COLS.map(col => {
      const items = prospects.filter(p=>p.status===col);
      const color = STATUS_COLORS[col];
      const isOver = dragOver===col;
      return (
        <div key={col} className="pipe-col-wrap">
          <div className="pipe-col"
            onDragOver={e=>{e.preventDefault();setDragOver(col);}}
            onDragLeave={()=>setDragOver(null)}
            onDrop={()=>drop(col)}
            style={{ background:isOver?T.surfaceHover:T.surface, border:`1px solid ${isOver?color+"55":T.border}`, borderRadius:12, padding:10, minHeight:200, height:"100%" }}>
            <div style={{ marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:10, fontWeight:700, color, letterSpacing:0.5, textTransform:"uppercase" }}>{col}</div>
                <span style={{ background:color+"20", color, borderRadius:20, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{items.length}</span>
              </div>
              {col==="Won" && totalRev>0 && (
                <div style={{ fontSize:11, color:T.green, fontFamily:"'DM Mono',monospace", marginTop:3, fontWeight:600 }}>
                  ${items.reduce((a,p)=>a+(Number(p.dealValue)||0),0).toLocaleString()}
                </div>
              )}
            </div>
            {items.map(p=>(
              <div key={p.id} className="pipe-card"
                draggable onDragStart={()=>setDragId(p.id)}
                onClick={()=>setOpenP(p)}
                style={{ background:T.bg, borderRadius:8, padding:"9px 10px", marginBottom:7, border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>{p.username}</div>
                <div style={{ fontSize:11, color:T.grayMuted }}>{p.niche}</div>
                {Number(p.dealValue)>0 && <div style={{ fontSize:11, color:T.green, fontFamily:"'DM Mono',monospace", marginTop:3, fontWeight:600 }}>${p.dealValue}</div>}
              </div>
            ))}
            {isOver && <div style={{ border:`2px dashed ${color}40`, borderRadius:8, padding:"10px", textAlign:"center", fontSize:11, color:color+"80", marginTop:4 }}>Drop here</div>}
          </div>
        </div>
      );
    })}
  </div>

  {openP && <PModal prospect={openP} onClose={()=>setOpenP(null)} onStatusChange={onStatusChange} onToast={onToast}/>}
</div>
```

);
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ prospects }) {
const niches = {};
prospects.forEach(p => { niches[p.niche]=(niches[p.niche]||0)+(p.businessScore||0); });
const topNiches = Object.entries(niches).sort((a,b)=>b[1]-a[1]).slice(0,5);
const won = prospects.filter(p=>p.status===“Won”);
const totalRev = won.reduce((a,p)=>a+(Number(p.dealValue)||0),0);
const avgDeal = won.length>0 ? Math.round(totalRev/won.length) : 0;
const convRate = prospects.length>0 ? Math.round((won.length/prospects.length)*100) : 0;

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
<div className="stat-grid">
{[
{ label:“Total Prospects”, val:prospects.length, color:T.yellow },
{ label:“High Potential”, val:prospects.filter(p=>[“High”,“Very High”].includes(p.pitchPotential)).length, color:T.green },
{ label:“Avg Deal Value”, val:`$${avgDeal}`, color:”#8B5CF6” },
{ label:“Conversion Rate”, val:`${convRate}%`, color:T.yellow },
].map(s=>(
<div key={s.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
<div style={{ fontSize:10, color:T.grayMuted, fontWeight:600, letterSpacing:0.6, marginBottom:6, textTransform:“uppercase” }}>{s.label}</div>
<div style={{ fontSize:24, fontWeight:700, color:s.color, fontFamily:”‘DM Mono’,monospace” }}>{s.val}</div>
</div>
))}
</div>

```
  <div className="analytics-grid">
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
      <div style={{ fontSize:13, fontWeight:600, color:T.white, marginBottom:16 }}>Top Niches</div>
      {topNiches.map(([niche,score],i)=>(
        <div key={niche} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:T.yellowMuted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:T.yellow, fontWeight:700 }}>{i+1}</div>
              <span style={{ fontSize:13, color:T.gray }}>{niche}</span>
            </div>
            <span style={{ fontSize:11, color:T.yellow, fontFamily:"'DM Mono',monospace" }}>{score}</span>
          </div>
          <Bar value={Math.min((score/(topNiches[0]?.[1]||1))*100,100)} color={T.yellow}/>
        </div>
      ))}
    </div>

    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
      <div style={{ fontSize:13, fontWeight:600, color:T.white, marginBottom:16 }}>Pipeline Breakdown</div>
      {PIPELINE_COLS.map(col=>{
        const count=prospects.filter(p=>p.status===col).length;
        const pct=prospects.length>0?(count/prospects.length)*100:0;
        return (
          <div key={col} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:13, color:T.gray }}>{col}</span>
              <span style={{ fontSize:11, color:STATUS_COLORS[col], fontFamily:"'DM Mono',monospace" }}>{count}</span>
            </div>
            <Bar value={pct} color={STATUS_COLORS[col]}/>
          </div>
        );
      })}
    </div>
  </div>

  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
    <div style={{ fontSize:13, fontWeight:600, color:T.white, marginBottom:14 }}>Growth Intelligence</div>
    <div className="intel-grid">
      {[
        "Best pitch days: Tue–Thu for UK/US audiences",
        "Avoid DMs on Monday mornings and Friday evenings",
        "1K–10K follower accounts convert best for cold outreach",
        "Bios with 'DM to book' signal 3× higher response rate",
        "Diaspora beauty/food respond best to value-first pitches",
        "Cap at 20 DMs/day to protect your Instagram account",
      ].map((tip,i)=>(
        <div key={i} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:9, padding:"11px 13px", display:"flex", gap:9, alignItems:"flex-start" }}>
          <span style={{ color:T.yellow, fontSize:13, flexShrink:0, marginTop:1 }}>→</span>
          <span style={{ fontSize:13, color:T.gray, lineHeight:1.55 }}>{tip}</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ isConfigured }) {
const [copied, setCopied] = useState(false);
const sql = `CREATE TABLE prospects ( id BIGSERIAL PRIMARY KEY, username TEXT, name TEXT, avatar TEXT, avatar_color TEXT, followers INTEGER, location TEXT, niche TEXT, bio TEXT, engagement_score INTEGER, business_score INTEGER, branding_score INTEGER, diaspora_score INTEGER, pitch_potential TEXT, status TEXT DEFAULT 'New', has_booking_link BOOLEAN DEFAULT FALSE, has_whatsapp BOOLEAN DEFAULT FALSE, deal_value NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW() ); ALTER TABLE prospects ENABLE ROW LEVEL SECURITY; CREATE POLICY "Allow all" ON prospects FOR ALL USING (true);`;

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14, maxWidth:600 }}>
<div>
<div style={{ fontSize:20, fontWeight:700, color:T.white, marginBottom:3 }}>Settings</div>
<div style={{ fontSize:14, color:T.grayMuted }}>Connect your services to go fully live.</div>
</div>

```
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
    {[
      { name:"Supabase Database", desc:"Persists prospects, pipeline and revenue", ok:isConfigured.supabase, key:"SUPABASE_URL + ANON_KEY" },
      { name:"Apify Instagram Scraper", desc:"Pulls real accounts from any hashtag", ok:isConfigured.apify, key:"APIFY_TOKEN" },
      { name:"Claude AI", desc:"Powers analysis and pitch generation", ok:true, key:"Built-in" },
    ].map((s,i)=>(
      <div key={s.name} style={{ padding:"16px 18px", borderBottom:i<2?`1px solid ${T.border}`:"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s.ok?T.green:T.grayDark }}/>
            <div style={{ fontSize:13, fontWeight:600, color:T.white }}>{s.name}</div>
          </div>
          <div style={{ fontSize:12, color:T.grayMuted, marginLeft:15 }}>{s.desc}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:11, color:s.ok?T.green:T.yellow, fontWeight:600, marginBottom:2 }}>{s.ok?"Connected":"Not set"}</div>
          <div style={{ fontSize:10, color:T.grayMuted, fontFamily:"'DM Mono',monospace" }}>{s.key}</div>
        </div>
      </div>
    ))}
  </div>

  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
    <div style={{ fontSize:13, fontWeight:600, color:T.white, marginBottom:16 }}>Setup Steps</div>
    {[
      { n:1, title:"Create Supabase project", desc:"supabase.com → New project → copy URL and anon key into CONFIG." },
      { n:2, title:"Run the SQL below", desc:"Supabase → SQL Editor → paste and run to create the prospects table." },
      { n:3, title:"Get Apify token", desc:"apify.com → free account → Settings → Integrations → copy token into CONFIG." },
      { n:4, title:"Deploy to Vercel", desc:"Push to GitHub → import on vercel.com → add keys as Environment Variables." },
    ].map(s=>(
      <div key={s.n} style={{ display:"flex", gap:12, marginBottom:14 }}>
        <div style={{ width:26, height:26, borderRadius:"50%", background:T.yellowMuted, border:`1px solid ${T.yellowBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:T.yellow, flexShrink:0 }}>{s.n}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:T.white, marginBottom:2 }}>{s.title}</div>
          <div style={{ fontSize:12, color:T.grayMuted, lineHeight:1.6 }}>{s.desc}</div>
        </div>
      </div>
    ))}
  </div>

  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
    <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ fontSize:13, fontWeight:600, color:T.white }}>Supabase SQL</div>
      <button className="btn-g" onClick={()=>{ navigator.clipboard.writeText(sql); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
        style={{ padding:"5px 11px", background:copied?T.green:T.bg, border:`1px solid ${T.border}`, borderRadius:6, color:copied?"#000":T.gray, fontSize:11, fontWeight:600 }}>
        {copied?"✓ Copied":"Copy SQL"}
      </button>
    </div>
    <pre style={{ padding:16, fontSize:11, color:T.grayMuted, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap", fontFamily:"'DM Mono',monospace", background:T.bg }}>{sql}</pre>
  </div>
</div>
```

);
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
const [view, setView] = useState(“hunt”);
const [prospects, setProspects] = useState(MOCK);
const [openP, setOpenP] = useState(null);
const [search, setSearch] = useState(””);
const [toast, setToast] = useState(null);
const [dbLoading, setDbLoading] = useState(false);
const isMobile = useIsMobile();

const isConfigured = {
supabase: CONFIG.SUPABASE_URL !== “YOUR_SUPABASE_URL”,
apify: CONFIG.APIFY_TOKEN !== “YOUR_APIFY_TOKEN”,
};

useEffect(() => {
if (!isConfigured.supabase) return;
setDbLoading(true);
db.getAll(“prospects”)
.then(data => {
if (data?.length > 0) setProspects(data.map(p => ({ …p, avatarColor:p.avatar_color||T.yellow, engagementScore:p.engagement_score||50, businessScore:p.business_score||50, brandingScore:p.branding_score||50, diasporaScore:p.diaspora_score||50, pitchPotential:p.pitch_potential||“Medium”, hasBookingLink:p.has_booking_link||false, hasWhatsapp:p.has_whatsapp||false, dealValue:p.deal_value||0 })));
})
.catch(()=>{})
.finally(()=>setDbLoading(false));
}, []);

const handleStatus = async (id, newStatus, dealValue=null) => {
setProspects(prev => prev.map(p => p.id===id ? {…p, status:newStatus, …(dealValue!==null?{dealValue}:{})} : p));
if (isConfigured.supabase) {
const u = {status:newStatus};
if (dealValue!==null) u.deal_value=dealValue;
await db.update(“prospects”,id,u).catch(()=>{});
}
};

const showToast = (msg, type=“success”) => setToast({msg,type});

const displayed = search
? prospects.filter(p => p.username.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()) || p.niche.toLowerCase().includes(search.toLowerCase()))
: prospects;

const NAV = [
{ id:“hunt”, icon:“⚡”, label:“Hunt” },
{ id:“prospects”, icon:“◎”, label:“Prospects” },
{ id:“pipeline”, icon:“⬡”, label:“Pipeline” },
{ id:“analytics”, icon:“▲”, label:“Analytics” },
{ id:“settings”, icon:“◈”, label:“Settings” },
];

const PAGE_TITLES = { hunt:“Daily Hunt”, prospects:“Prospects”, pipeline:“Pipeline”, analytics:“Analytics”, settings:“Settings” };
const PAGE_SUBS = { hunt:“Your daily acquisition session.”, prospects:`${displayed.length} prospects`, pipeline:“Track deals through your pipeline.”, analytics:“Performance and growth intelligence.”, settings:“Connect services and configure.” };

return (
<div style={{ background:T.bg, minHeight:“100vh”, fontFamily:”‘DM Sans’,sans-serif”, color:T.white }}>
<style>{GLOBAL_CSS}</style>

```
  {/* ── DESKTOP SIDEBAR ── */}
  {!isMobile && (
    <div style={{ width:210, background:T.surface, borderRight:`1px solid ${T.border}`, position:"fixed", left:0, top:0, height:"100vh", zIndex:40, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${T.border}` }}>
        <img src="/mnt/user-data/uploads/PrimeFlow.png" alt="PrimeFlow" style={{ height:30, width:"auto" }}/>
      </div>
      <nav style={{ padding:"10px 8px", flex:1 }}>
        {NAV.map(item=>(
          <button key={item.id} className="nav-item" onClick={()=>setView(item.id)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 11px", borderRadius:8, border:"none", background:view===item.id?T.yellowMuted:"transparent", color:view===item.id?T.yellow:T.grayMuted, fontSize:13, fontWeight:view===item.id?600:400, marginBottom:2, textAlign:"left" }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ margin:"0 8px 14px", background:T.yellowMuted, border:`1px solid ${T.yellowBorder}`, borderRadius:10, padding:"12px 13px" }}>
        <div style={{ fontSize:10, color:T.yellow, fontWeight:600, letterSpacing:0.7, marginBottom:5, textTransform:"uppercase" }}>Revenue</div>
        <div style={{ fontSize:20, fontWeight:700, color:T.white, fontFamily:"'DM Mono',monospace" }}>
          ${prospects.filter(p=>p.status==="Won").reduce((a,p)=>a+(Number(p.dealValue)||0),0).toLocaleString()}
        </div>
        <div style={{ fontSize:11, color:T.grayMuted, marginTop:2 }}>{prospects.filter(p=>p.status==="Won").length} deals closed</div>
      </div>
    </div>
  )}

  {/* ── DESKTOP TOP NAV ── */}
  {!isMobile && (
    <div style={{ height:52, background:T.surface, borderBottom:`1px solid ${T.border}`, position:"fixed", top:0, left:210, right:0, zIndex:30, display:"flex", alignItems:"center", padding:"0 24px", gap:14 }}>
      <div style={{ flex:1, maxWidth:320, position:"relative" }}>
        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.grayMuted, fontSize:13 }}>⌕</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search prospects..."
          style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 11px 7px 28px", color:T.white, fontSize:13 }}/>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"5px 12px" }}>
        <div style={{ width:60, background:T.grayDark, borderRadius:4, height:4, overflow:"hidden" }}>
          <div style={{ width:`${(parseInt(localStorage.getItem("pf_p")||"0")/20)*100}%`, height:"100%", background:T.yellow, borderRadius:4 }}/>
        </div>
        <span style={{ fontSize:11, color:T.grayMuted, fontFamily:"'DM Mono',monospace" }}>{localStorage.getItem("pf_p")||0}/20</span>
      </div>
      <div style={{ display:"flex", gap:5 }}>
        {[{l:"DB",ok:isConfigured.supabase},{l:"IG",ok:isConfigured.apify}].map(s=>(
          <div key={s.l} style={{ display:"flex", alignItems:"center", gap:4, background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:"4px 8px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:s.ok?T.green:T.grayDark }}/>
            <span style={{ fontSize:10, color:T.grayMuted, fontWeight:600 }}>{s.l}</span>
          </div>
        ))}
      </div>
      <div style={{ width:30, height:30, borderRadius:"50%", background:T.yellowMuted, border:`1.5px solid ${T.yellowBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:T.yellow }}>C</div>
    </div>
  )}

  {/* ── MOBILE TOP BAR ── */}
  {isMobile && (
    <div style={{ height:52, background:T.surface, borderBottom:`1px solid ${T.border}`, position:"fixed", top:0, left:0, right:0, zIndex:40, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
      <img src="/mnt/user-data/uploads/PrimeFlow.png" alt="PrimeFlow" style={{ height:26, width:"auto" }}/>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ fontSize:12, color:T.yellow, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>
          ${prospects.filter(p=>p.status==="Won").reduce((a,p)=>a+(Number(p.dealValue)||0),0).toLocaleString()}
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[isConfigured.supabase,isConfigured.apify].map((ok,i)=>(
            <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:ok?T.green:T.grayDark }}/>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* ── MAIN CONTENT ── */}
  <div style={{ marginLeft:isMobile?0:210, paddingTop:isMobile?52:52, paddingBottom:isMobile?72:0 }}>
    <div style={{ maxWidth:1100, margin:"0 auto", padding:isMobile?"16px 14px 24px":"26px 28px 48px" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:isMobile?18:22, fontWeight:700, color:T.white, marginBottom:3 }}>{PAGE_TITLES[view]}</div>
        <div style={{ fontSize:13, color:T.grayMuted }}>{PAGE_SUBS[view]}</div>
      </div>

      {dbLoading && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 14px", marginBottom:14, display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ width:12, height:12, borderRadius:"50%", border:`2px solid ${T.yellow}`, borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
          <span style={{ fontSize:12, color:T.grayMuted }}>Loading from database...</span>
        </div>
      )}

      {view==="hunt" && <DailyHunt prospects={displayed} onOpen={setOpenP}/>}
      {view==="prospects" && <ProspectsView prospects={displayed} setProspects={setProspects} onOpen={setOpenP} isConfigured={isConfigured}/>}
      {view==="pipeline" && <PipelineView prospects={prospects} onStatusChange={handleStatus} onToast={showToast}/>}
      {view==="analytics" && <Analytics prospects={prospects}/>}
      {view==="settings" && <Settings isConfigured={isConfigured}/>}
    </div>
  </div>

  {/* ── MOBILE BOTTOM NAV ── */}
  {isMobile && (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:40, background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", padding:"8px 0 16px" }}>
      {NAV.map(item=>(
        <button key={item.id} onClick={()=>setView(item.id)}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"transparent", border:"none", padding:"4px 0" }}>
          <span style={{ fontSize:17, opacity:view===item.id?1:0.3, transition:"opacity 0.15s" }}>{item.icon}</span>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.4, color:view===item.id?T.yellow:T.grayMuted, transition:"color 0.15s", textTransform:"uppercase" }}>{item.label}</span>
        </button>
      ))}
    </div>
  )}

  {openP && <PModal prospect={openP} onClose={()=>setOpenP(null)} onStatusChange={handleStatus} onToast={showToast}/>}
  {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
</div>
```

);
}
