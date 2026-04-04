'use client';
import { useState, useEffect, useCallback } from 'react';

const T = {
  navy:  '#1A3D6B', mid:  '#2B579A', light: '#EEF4FF',
  text:  '#1F2937', muted:'#6B7280', dim:  '#9CA3AF',
  bg:    '#F0F4F8', white:'#FFFFFF', border:'#E5E7EB',
  green: '#166534', greenBg:'#DCFCE7', greenBorder:'#86EFAC',
  amber: '#92400E', amberBg:'#FEF3C7', amberBorder:'#FCD34D',
  red:   '#991B1B', redBg:  '#FEE2E2', redBorder:  '#FCA5A5',
  blue:  '#1E40AF', blueBg: '#DBEAFE', blueBorder: '#93C5FD',
};

const REGION_FLAGS = {
  'United States':'🇺🇸','Europe':'🇪🇺','India':'🇮🇳','Japan':'🇯🇵',
  'Canada':'🇨🇦','Australia':'🇦🇺','United Kingdom':'🇬🇧','China':'🇨🇳',
  'Brazil':'🇧🇷','South Africa':'🇿🇦','Philippines':'🇵🇭','Singapore':'🇸🇬',
};

const STATUS_CONFIG = {
  draft:       { color:'#6B7280', bg:'#F3F4F6', label:'Draft',       icon:'○' },
  in_progress: { color:'#1E40AF', bg:'#DBEAFE', label:'In Progress', icon:'◔' },
  submitted:   { color:'#92400E', bg:'#FEF3C7', label:'Submitted',   icon:'◑' },
  approved:    { color:'#166534', bg:'#DCFCE7', label:'Approved',    icon:'●' },
  on_hold:     { color:'#991B1B', bg:'#FEE2E2', label:'On Hold',     icon:'◯' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10,
      background:cfg.bg, color:cfg.color, letterSpacing:'0.04em' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background:T.white, borderRadius:10, padding:'16px 20px',
        border:`1px solid ${T.border}`, cursor:onClick?'pointer':'default',
        borderLeft:`4px solid ${color||T.navy}`, transition:'all .15s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseOver={e => onClick && (e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.10)')}
      onMouseOut={e => onClick && (e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)')}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ fontSize:24, lineHeight:1 }}>{icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:26, fontWeight:800, color:color||T.navy, lineHeight:1 }}>
            {value}
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:T.text, marginTop:4 }}>{label}</div>
          {sub && <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function MiniProgress({ pct, color }) {
  return (
    <div style={{ width:'100%', height:5, background:'#E5E7EB', borderRadius:3, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height:'100%', background:color||T.navy, borderRadius:3,
        transition:'width .4s ease' }}/>
    </div>
  );
}

function ActivityDot({ type }) {
  const colors = { upload:'#2563EB', review:'#16A34A', submit:'#D97706',
                   create:'#7C3AED', approve:'#059669', query:'#DC2626' };
  return <div style={{ width:8, height:8, borderRadius:'50%',
    background:colors[type]||T.mid, flexShrink:0, marginTop:4 }}/>;
}

export default function Dashboard({ onNavigate }) {
  const [summary, setSummary]   = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const api = useCallback(async (path) => {
    try {
      const res = await fetch(path);
      return res.json();
    } catch { return {}; }
  }, []);

  useEffect(() => { loadDashboard(); }, [timeRange]);

  async function loadDashboard() {
    setLoading(true);
    try {
      // Fetch all dossiers (via projects → products → dossiers chain)
      const { data: projects } = await api('/api/projects?user_id=user_default&type=projects');
      const allProjects = projects || [];

      // Fetch dossiers for summary
      const { data: allDossiers } = await api('/api/dashboard?type=dossiers');
      const dossiersData = allDossiers || [];

      // Fetch documents for activity
      const { data: recentDocs } = await api('/api/dashboard?type=activity');
      const docsData = recentDocs || [];

      // Build summary stats
      const byStatus = dossiersData.reduce((acc, d) => {
        acc[d.status] = (acc[d.status]||0) + 1; return acc;
      }, {});

      const uploadedNodes = dossiersData.reduce((n, d) =>
        n + (d.node_counts?.uploaded || 0), 0);
      const totalNodes = dossiersData.reduce((n, d) =>
        n + (d.node_counts?.total || 0), 0);

      setSummary({
        totalProjects:  allProjects.length,
        totalDossiers:  dossiersData.length,
        inProgress:     byStatus.in_progress || 0,
        submitted:      byStatus.submitted || 0,
        approved:       byStatus.approved || 0,
        draft:          byStatus.draft || 0,
        uploadedNodes,
        totalNodes,
        docsReviewed:   docsData.filter(d => d.review_status === 'done').length,
      });

      setDossiers(dossiersData.slice(0, 20));
      setActivity(docsData.slice(0, 30).map(d => ({
        id:    d.id,
        type:  d.review_status === 'done' ? 'review' : 'upload',
        text:  `${d.filename} — ${d.section || 'uploaded'}`,
        time:  d.uploaded_at,
        score: d.review_score,
        section: d.section,
        country: d.country,
      })));
    } catch (err) {
      // If API not available, show placeholder state
      setSummary({ totalProjects:0, totalDossiers:0, inProgress:0,
        submitted:0, approved:0, draft:0, uploadedNodes:0, totalNodes:0, docsReviewed:0 });
      setDossiers([]);
      setActivity([]);
    }
    setLoading(false);
  }

  // Authority breakdown from dossiers
  const byAuthority = dossiers.reduce((acc, d) => {
    const key = d.authority || 'Other';
    if (!acc[key]) acc[key] = { count:0, submitted:0, approved:0 };
    acc[key].count++;
    if (d.status === 'submitted') acc[key].submitted++;
    if (d.status === 'approved') acc[key].approved++;
    return acc;
  }, {});

  const authorityList = Object.entries(byAuthority)
    .sort((a,b) => b[1].count - a[1].count).slice(0, 8);

  // Country breakdown
  const byCountry = dossiers.reduce((acc, d) => {
    acc[d.country] = (acc[d.country]||0) + 1; return acc;
  }, {});
  const countryList = Object.entries(byCountry)
    .sort((a,b) => b[1]-a[1]).slice(0, 8);

  // Overall completion %
  const overallPct = summary?.totalNodes > 0
    ? Math.round((summary.uploadedNodes / summary.totalNodes) * 100) : 0;

  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff/60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  }

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:16, color:T.muted }}>
      <div style={{ width:36, height:36, border:`3px solid ${T.border}`,
        borderTop:`3px solid ${T.navy}`, borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }}/>
      <div style={{ fontSize:13 }}>Loading dashboard…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const hasData = summary?.totalDossiers > 0 || summary?.totalProjects > 0;

  return (
    <div style={{ height:'100%', overflowY:'auto', background:T.bg, padding:'20px 24px',
      fontFamily:"'Segoe UI', Arial, sans-serif" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:20, gap:16 }}>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>
            Regulatory Dashboard
          </h1>
          <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[
            { id:'dashboard', label:'📊 Dashboard',        icon:'📊' },
            { id:'projects',  label:'📁 Project Manager',  icon:'📁' },
            { id:'checklist', label:'✓ Checklist',         icon:'✓'  },
            { id:'india',     label:'🇮🇳 India Reg',       icon:'🇮🇳' },
          ].map(b => (
            <button key={b.id} onClick={() => onNavigate && onNavigate(b.id)}
              style={{ padding:'6px 14px', background:b.id==='dashboard'?T.navy:T.white,
                color:b.id==='dashboard'?'#fff':T.mid, border:`1px solid ${T.border}`,
                borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer',
                fontFamily:'inherit' }}>
              {b.label}
            </button>
          ))}
        </div>
        <button onClick={loadDashboard}
          style={{ padding:'6px 14px', background:T.white, border:`1px solid ${T.border}`,
            borderRadius:6, fontSize:11, color:T.muted, cursor:'pointer', fontFamily:'inherit' }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── EMPTY STATE ─────────────────────────────────────────────────────── */}
      {!hasData && (
        <div style={{ background:T.white, borderRadius:12, padding:'48px 32px',
          textAlign:'center', border:`1px solid ${T.border}`, marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h2 style={{ margin:0, color:T.navy, fontSize:20, marginBottom:8 }}>
            Welcome to RAISA
          </h2>
          <p style={{ color:T.muted, fontSize:14, lineHeight:1.7, maxWidth:480, margin:'0 auto 24px' }}>
            Your regulatory affairs intelligence system is ready. Start by creating a project in the Project Manager, then add products and dossiers for each target market.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { tab:'projects', label:'📁 Open Project Manager', primary:true },
              { tab:'checklist', label:'✓ Browse Checklists', primary:false },
              { tab:'india', label:'🇮🇳 India Regulatory', primary:false },
            ].map(b => (
              <button key={b.tab} onClick={() => onNavigate?.(b.tab)}
                style={{ padding:'10px 20px', background:b.primary?T.navy:T.white,
                  color:b.primary?'#fff':T.navy, border:`1px solid ${b.primary?T.navy:T.border}`,
                  borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',
        gap:12, marginBottom:20 }}>
        <StatCard icon="📁" label="Active Projects" value={summary?.totalProjects||0}
          color={T.navy} onClick={() => onNavigate?.('projects')}
          sub="Click to open Project Manager"/>
        <StatCard icon="📦" label="Total Dossiers" value={summary?.totalDossiers||0}
          color="#2563EB" sub={`Across all markets`}/>
        <StatCard icon="◔" label="In Progress" value={summary?.inProgress||0}
          color="#D97706" sub="Active submissions"/>
        <StatCard icon="✉" label="Submitted" value={summary?.submitted||0}
          color="#7C3AED" sub="Awaiting authority review"/>
        <StatCard icon="✓" label="Approved" value={summary?.approved||0}
          color="#16A34A" sub="Marketing authorisations"/>
        <StatCard icon="📄" label="Docs Reviewed (AI)" value={summary?.docsReviewed||0}
          color="#0891B2" sub="AI quality checks done"/>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:16 }}>

        {/* LEFT — Dossier table */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
          overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`,
            display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy, flex:1 }}>
              📦 Dossier Pipeline
            </span>
            <span style={{ fontSize:11, color:T.muted }}>
              {dossiers.length} dossiers
            </span>
            <button onClick={() => onNavigate?.('projects')}
              style={{ fontSize:11, color:T.mid, background:T.light, border:'none',
                borderRadius:5, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit' }}>
              Open →
            </button>
          </div>

          {dossiers.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📦</div>
              <div style={{ fontSize:13 }}>No dossiers yet</div>
              <div style={{ fontSize:11, marginTop:4 }}>Create a project and add dossiers in the Project Manager</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:'#F8FAFD' }}>
                    {['Product','Country / Authority','Format','Status','Progress'].map(h => (
                      <th key={h} style={{ padding:'8px 14px', textAlign:'left',
                        fontWeight:700, fontSize:10, color:T.muted, textTransform:'uppercase',
                        letterSpacing:'0.06em', borderBottom:`1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d, i) => {
                    const pct = d.node_counts?.total > 0
                      ? Math.round((d.node_counts.uploaded||0)/d.node_counts.total*100) : 0;
                    const flag = REGION_FLAGS[d.country] || '🌐';
                    return (
                      <tr key={d.id||i}
                        style={{ borderBottom:`1px solid #F3F4F6`, cursor:'pointer' }}
                        onMouseOver={e => e.currentTarget.style.background='#F8FAFD'}
                        onMouseOut={e => e.currentTarget.style.background='transparent'}
                        onClick={() => onNavigate?.('projects')}>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontWeight:600, color:T.text }}>
                            {d.product_name || 'Unknown Product'}
                          </div>
                          {d.submission_type && (
                            <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>
                              {d.submission_type}
                            </div>
                          )}
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ fontSize:14 }}>{flag}</span>
                            <div>
                              <div style={{ fontWeight:500, color:T.text }}>{d.country}</div>
                              <div style={{ fontSize:10, color:T.muted }}>{d.authority}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <span style={{ fontSize:10, background:T.light, color:T.mid,
                            padding:'2px 7px', borderRadius:4, fontWeight:600 }}>
                            {d.dossier_format || 'CTD'}
                          </span>
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <StatusPill status={d.status}/>
                        </td>
                        <td style={{ padding:'10px 14px', width:120 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <MiniProgress pct={pct}
                              color={pct===100?'#16A34A':pct>50?T.navy:'#D97706'}/>
                            <span style={{ fontSize:10, color:T.muted, minWidth:28,
                              fontFamily:'monospace' }}>{pct}%</span>
                          </div>
                          <div style={{ fontSize:9, color:T.dim, marginTop:2 }}>
                            {d.node_counts?.uploaded||0}/{d.node_counts?.total||0} docs
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT — Activity feed */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
          display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>⚡ Recent Activity</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {activity.length === 0 ? (
              <div style={{ padding:'30px 16px', textAlign:'center', color:T.muted }}>
                <div style={{ fontSize:24, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:12 }}>No activity yet</div>
                <div style={{ fontSize:11, marginTop:4, lineHeight:1.6 }}>
                  Upload documents to dossiers to see activity here
                </div>
              </div>
            ) : activity.map((a, i) => (
              <div key={i} style={{ padding:'10px 16px', borderBottom:`1px solid #F3F4F6`,
                display:'flex', gap:10, alignItems:'flex-start' }}>
                <ActivityDot type={a.type}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:T.text, lineHeight:1.4,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {a.text}
                  </div>
                  <div style={{ display:'flex', gap:6, marginTop:3, alignItems:'center' }}>
                    {a.country && (
                      <span style={{ fontSize:9, color:T.muted }}>
                        {REGION_FLAGS[a.country]||'🌐'} {a.country}
                      </span>
                    )}
                    {a.score != null && (
                      <span style={{ fontSize:9, padding:'1px 5px', borderRadius:3,
                        background: a.score>=80?T.greenBg:a.score>=60?T.amberBg:T.redBg,
                        color: a.score>=80?T.green:a.score>=60?T.amber:T.red,
                        fontWeight:600 }}>
                        {a.score}/100
                      </span>
                    )}
                    <span style={{ fontSize:9, color:T.dim, marginLeft:'auto' }}>
                      {timeAgo(a.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRID — Authority + Country breakdown ─────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Authority breakdown */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
          overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>🏛 By Regulatory Authority</span>
          </div>
          <div style={{ padding:'12px 18px' }}>
            {authorityList.length === 0 ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:T.muted, fontSize:12 }}>
                No data yet
              </div>
            ) : authorityList.map(([auth, data]) => {
              const pct = summary?.totalDossiers > 0
                ? Math.round((data.count/summary.totalDossiers)*100) : 0;
              return (
                <div key={auth} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:4, alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{auth}</span>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {data.approved > 0 && (
                        <span style={{ fontSize:10, color:T.green, fontWeight:600 }}>
                          {data.approved} approved
                        </span>
                      )}
                      {data.submitted > 0 && (
                        <span style={{ fontSize:10, color:'#7C3AED', fontWeight:600 }}>
                          {data.submitted} submitted
                        </span>
                      )}
                      <span style={{ fontSize:11, color:T.muted, fontFamily:'monospace' }}>
                        {data.count}
                      </span>
                    </div>
                  </div>
                  <MiniProgress pct={pct} color={T.mid}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country breakdown */}
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
          overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>🌍 By Country / Market</span>
          </div>
          <div style={{ padding:'12px 18px' }}>
            {countryList.length === 0 ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:T.muted, fontSize:12 }}>
                No data yet
              </div>
            ) : countryList.map(([country, count]) => {
              const flag = REGION_FLAGS[country] || '🌐';
              const pct = summary?.totalDossiers > 0
                ? Math.round((count/summary.totalDossiers)*100) : 0;
              return (
                <div key={country} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:4, alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.text }}>
                      {flag} {country}
                    </span>
                    <span style={{ fontSize:11, color:T.muted, fontFamily:'monospace' }}>
                      {count} dossier{count!==1?'s':''}
                    </span>
                  </div>
                  <MiniProgress pct={pct} color={T.navy}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────────── */}
      <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
        padding:'16px 20px' }}>
        <div style={{ fontWeight:700, fontSize:14, color:T.navy, marginBottom:14 }}>
          ⚡ Quick Actions
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { icon:'📁', label:'New Project',       tab:'projects',  desc:'Create a new regulatory project' },
            { icon:'📦', label:'Add Dossier',       tab:'projects',  desc:'Add a dossier to an existing project' },
            { icon:'✓',  label:'CTD Checklist',     tab:'checklist', desc:'Browse ICH CTD requirements' },
            { icon:'📋', label:'AI Document Review',tab:'review',    desc:'Review documents with AI' },
            { icon:'🇮🇳', label:'India Regulatory', tab:'india',     desc:'CDSCO/State FDA applications' },
          ].map(a => (
            <div key={a.label} onClick={() => onNavigate?.(a.tab)}
              style={{ padding:'12px 16px', background:'#F8FAFD', borderRadius:8,
                border:`1px solid ${T.border}`, cursor:'pointer', minWidth:160,
                transition:'all .15s', flex:1 }}
              onMouseOver={e => { e.currentTarget.style.background=T.light;
                e.currentTarget.style.borderColor=T.mid; }}
              onMouseOut={e => { e.currentTarget.style.background='#F8FAFD';
                e.currentTarget.style.borderColor=T.border; }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{a.icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:T.navy, marginBottom:3 }}>
                {a.label}
              </div>
              <div style={{ fontSize:10, color:T.muted, lineHeight:1.4 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SYSTEM STATUS ────────────────────────────────────────────────────── */}
      <div style={{ marginTop:16, padding:'10px 18px', background:'#F8FAFD',
        borderRadius:8, border:`1px solid ${T.border}`, display:'flex',
        alignItems:'center', gap:16, fontSize:11, color:T.muted }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#16A34A',
            display:'inline-block' }}/>
          RAISA v2.0 — Connected
        </span>
        <span>ICH M4Q(R1) · eCTD v3.2.2 + v4.0 · NDCT Rules 2019</span>
        <span style={{ marginLeft:'auto' }}>
          {summary?.totalDossiers||0} dossiers · {summary?.totalNodes||0} sections tracked
        </span>
      </div>
    </div>
  );
}
