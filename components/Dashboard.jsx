'use client';
import { useState, useEffect, useCallback } from 'react';

/* ── Theme ─────────────────────────────────────────────────────────────────── */
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
  'Ghana':'🇬🇭','Kenya':'🇰🇪','Nigeria':'🇳🇬','Egypt':'🇪🇬','Mexico':'🇲🇽',
  'Saudi Arabia':'🇸🇦','UAE':'🇦🇪','Thailand':'🇹🇭','Indonesia':'🇮🇩',
  'South Korea':'🇰🇷','Malaysia':'🇲🇾','Vietnam':'🇻🇳','Russia':'🇷🇺',
  'Turkey':'🇹🇷','Argentina':'🇦🇷','Colombia':'🇨🇴','Chile':'🇨🇱',
};



const STATUS_CONFIG = {
  draft:       { color:'#6B7280', bg:'#F3F4F6', label:'Draft',       icon:'○' },
  in_progress: { color:'#1E40AF', bg:'#DBEAFE', label:'In Progress', icon:'◔' },
  submitted:   { color:'#92400E', bg:'#FEF3C7', label:'Submitted',   icon:'◑' },
  approved:    { color:'#166534', bg:'#DCFCE7', label:'Approved',    icon:'●' },
  on_hold:     { color:'#991B1B', bg:'#FEE2E2', label:'On Hold',     icon:'◯' },
};

/* ── Sub-components ────────────────────────────────────────────────────────── */

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10,
      background:cfg.bg, color:cfg.color, letterSpacing:'0.04em' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, gradient, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background:gradient, borderRadius:10, padding:'18px 20px',
        cursor:onClick?'pointer':'default', color:'#fff',
        transition:'all .18s', position:'relative', overflow:'hidden',
        boxShadow:'0 2px 8px rgba(0,0,0,0.15)', minHeight:110,
        display:'flex', flexDirection:'column', justifyContent:'space-between' }}
      onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)';
        e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'; }}
      onMouseOut={e => { e.currentTarget.style.transform='translateY(0)';
        e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'; }}>
      <div style={{ position:'absolute', right:12, top:10, fontSize:48,
        opacity:0.15, pointerEvents:'none' }}>{icon}</div>
      <div>
        <div style={{ fontSize:32, fontWeight:800, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:13, fontWeight:600, marginTop:4, opacity:0.9 }}>{label}</div>
      </div>
      {sub && (
        <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.2)',
          fontSize:11, opacity:0.8, display:'flex', alignItems:'center', gap:4 }}>
          {sub} {onClick && <span style={{ marginLeft:'auto' }}>→</span>}
        </div>
      )}
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

/* ── World Map SVG ─────────────────────────────────────────────────────────── */
function WorldMap({ countries }) {
  /*
   * Dot-matrix world map — each 1 in the grid = land pixel.
   * 45 cols × 23 rows, Mercator-ish projection.
   * Much cleaner than polygon-based SVG outlines.
   */
  const MAP_GRID = [
    //        NA                  EU       Asia
    "000000000000000000000000000000000000000000000",  // 0 - Arctic
    "000000011111100000000000001111111111111111000",  // 1
    "000001111111110000000000011111111111111111100",  // 2
    "000011111111111000000001111111111111111111110",  // 3
    "000111111111111100000011111111111111111111110",  // 4
    "000011111111111100000011111111111111111111100",  // 5
    "000001111111111000000011111011111111111111100",  // 6
    "000000111111110000000001111011111111111111000",  // 7
    "000000011111100000000001110011111111111110000",  // 8
    "000000001111000000000001100001111111110000000",  // 9
    "000000000110000000001111100001111111100000000",  // 10 - Equator area
    "000000000100000000001111100000111111100000000",  // 11
    "000000001100000000001111100000011111100000000",  // 12
    "000000011100000000001111100000001111000000000",  // 13
    "000000011110000000000111100000000111000000000",  // 14
    "000000111110000000000111000000000010000011100",  // 15 - Australia
    "000000111110000000000011000000000000000111110",  // 16
    "000000111100000000000011000000000000000111110",  // 17
    "000000011100000000000001000000000000000011100",  // 18
    "000000001100000000000000000000000000000001000",  // 19
    "000000000100000000000000000000000000000000000",  // 20
    "000000000000000000000000000000000000000000000",  // 21
    "000000000000000000000000000000000000000000000",  // 22
  ];

  const DOT_SIZE = 5;
  const GAP = 10;
  const W = 45 * GAP;
  const H = 23 * GAP;

  /* Country positions in grid coordinates (col, row) */
  const GRID_COORDS = {
    'United States':[8,5], 'Canada':[9,3], 'Mexico':[6,9],
    'Brazil':[11,14], 'Argentina':[10,17], 'Colombia':[9,11], 'Chile':[9,18],
    'United Kingdom':[21,3], 'Europe':[24,4], 'France':[22,5],
    'Germany':[24,4], 'Italy':[24,6], 'Spain':[22,6],
    'India':[31,9], 'China':[34,5], 'Japan':[38,5],
    'South Korea':[37,6], 'Thailand':[33,9], 'Indonesia':[35,11],
    'Vietnam':[34,8], 'Malaysia':[33,11], 'Philippines':[36,9],
    'Singapore':[33,11], 'Australia':[38,16],
    'Saudi Arabia':[28,8], 'UAE':[29,8], 'Turkey':[27,5],
    'South Africa':[26,17], 'Nigeria':[23,10], 'Ghana':[22,10],
    'Kenya':[28,11], 'Egypt':[27,8], 'Russia':[32,2],
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'100%' }}
      xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={W} height={H} fill="#F0F6FC" rx="6"/>

      {/* Land dots */}
      {MAP_GRID.map((row, ry) =>
        row.split('').map((cell, cx) => {
          if (cell !== '1') return null;
          return (
            <circle key={`${cx}-${ry}`} cx={cx*GAP + GAP/2} cy={ry*GAP + GAP/2}
              r={DOT_SIZE/2} fill="#C8DCC8" opacity="0.7"/>
          );
        })
      )}

      {/* Country markers */}
      {countries.map(([country, count]) => {
        const gc = GRID_COORDS[country];
        if (!gc) return null;
        const cx = gc[0] * GAP + GAP/2;
        const cy = gc[1] * GAP + GAP/2;
        const r = Math.min(6 + count * 2, 16);
        return (
          <g key={country}>
            {/* Pulse animation */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C41E2A" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" from={r} to={r+12} dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
            </circle>
            {/* Marker dot */}
            <circle cx={cx} cy={cy} r={r} fill="#C41E2A" stroke="#fff" strokeWidth="2" opacity="0.9"/>
            {/* Count label */}
            <text x={cx} y={cy+4} textAnchor="middle" fontSize="11"
              fill="#fff" fontWeight="800" fontFamily="sans-serif">{count}</text>
            {/* Country name tooltip */}
            <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="7"
              fill="#1A3D6B" fontWeight="600" fontFamily="sans-serif">{country}</text>
          </g>
        );
      })}

      {/* Empty state */}
      {countries.length === 0 && (
        <text x={W/2} y={H/2} textAnchor="middle" fontSize="14" fill="#9CA3AF"
          fontFamily="sans-serif">
          Add dossiers to see market coverage
        </text>
      )}
    </svg>
  );
}

/* ── Donut Chart ───────────────────────────────────────────────────────────── */
function StatusDonut({ data, total }) {
  const statusColors = {
    draft:'#9CA3AF', in_progress:'#3B82F6',
    submitted:'#F59E0B', approved:'#16A34A', on_hold:'#EF4444',
  };
  const statusLabels = {
    draft:'Draft', in_progress:'In Progress',
    submitted:'Submitted', approved:'Approved', on_hold:'On Hold',
  };

  if (total === 0) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        height:'100%', color:T.muted, fontSize:12, flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:32 }}>📊</div>
        <div>No dossier data yet</div>
      </div>
    );
  }

  let cumulative = 0;
  const segments = Object.entries(data).filter(([,v]) => v > 0).map(([status, count]) => {
    const pct = (count / total) * 100;
    const offset = cumulative;
    cumulative += pct;
    return { status, count, pct, offset, color: statusColors[status] || '#9CA3AF' };
  });

  const radius = 38;
  const circ = 2 * Math.PI * radius;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:24, height:'100%', padding:'0 12px' }}>
      <svg viewBox="0 0 100 100" style={{ width:140, height:140, flexShrink:0 }}>
        {segments.map((seg, i) => (
          <circle key={i} cx="50" cy="50" r={radius} fill="none"
            stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${(seg.pct / 100) * circ} ${circ}`}
            strokeDashoffset={-(seg.offset / 100) * circ}
            transform="rotate(-90 50 50)"
            style={{ transition:'all .4s ease' }}/>
        ))}
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800"
          fill={T.navy} fontFamily="sans-serif">{total}</text>
        <text x="50" y="58" textAnchor="middle" fontSize="7" fill={T.muted}
          fontFamily="sans-serif">DOSSIERS</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:6, flex:1 }}>
        {segments.map(seg => (
          <div key={seg.status} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:seg.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:T.text, flex:1 }}>{statusLabels[seg.status]||seg.status}</span>
            <span style={{ fontSize:12, fontWeight:700, color:T.text, fontFamily:'monospace' }}>{seg.count}</span>
            <span style={{ fontSize:10, color:T.muted, width:36, textAlign:'right' }}>{Math.round(seg.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */

export default function Dashboard({ onNavigate }) {
  const [summary, setSummary]     = useState(null);
  const [dossiers, setDossiers]   = useState([]);
  const [activity, setActivity]   = useState([]);
  const [loading, setLoading]     = useState(true);

  const api = useCallback(async (path) => {
    try { const res = await fetch(path); return res.json(); }
    catch { return {}; }
  }, []);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const { data: projects } = await api('/api/projects?user_id=user_default&type=projects');
      const allProjects = projects || [];
      const { data: allDossiers } = await api('/api/dashboard?type=dossiers');
      const dossiersData = allDossiers || [];
      const { data: recentDocs } = await api('/api/dashboard?type=activity');
      const docsData = recentDocs || [];

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
        onHold:         byStatus.on_hold || 0,
        uploadedNodes, totalNodes,
        docsReviewed:   docsData.filter(d => d.review_status === 'done').length,
        byStatus,
      });

      setDossiers(dossiersData.slice(0, 20));
      setActivity(docsData.slice(0, 30).map(d => ({
        id: d.id, type: d.review_status === 'done' ? 'review' : 'upload',
        text: `${d.filename} — ${d.section || 'uploaded'}`, time: d.uploaded_at,
        score: d.review_score, section: d.section, country: d.country,
      })));
    } catch {
      setSummary({ totalProjects:0, totalDossiers:0, inProgress:0,
        submitted:0, approved:0, draft:0, onHold:0, uploadedNodes:0,
        totalNodes:0, docsReviewed:0, byStatus:{} });
      setDossiers([]); setActivity([]);
    }
    setLoading(false);
  }

  /* ── Derived data ──────────────────────────────────────────────────────── */
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

  const byCountry = dossiers.reduce((acc, d) => {
    acc[d.country] = (acc[d.country]||0) + 1; return acc;
  }, {});
  const countryList = Object.entries(byCountry)
    .sort((a,b) => b[1]-a[1]).slice(0, 8);

  const maxAuth = authorityList.length > 0 ? authorityList[0][1].count : 1;
  const maxCountry = countryList.length > 0 ? countryList[0][1] : 1;

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

  /* ── Loading ───────────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:16, color:T.muted, height:'100%' }}>
      <div style={{ width:36, height:36, border:`3px solid ${T.border}`,
        borderTop:`3px solid ${T.navy}`, borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }}/>
      <div style={{ fontSize:13 }}>Loading dashboard…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const hasData = summary?.totalDossiers > 0 || summary?.totalProjects > 0;

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ height:'100%', overflowY:'auto', background:T.bg, padding:'20px 24px',
      fontFamily:"'Segoe UI', Arial, sans-serif" }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:20, gap:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.navy }}>Regulatory Dashboard</h1>
          <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <button onClick={loadDashboard}
          style={{ padding:'6px 14px', background:T.white, border:`1px solid ${T.border}`,
            borderRadius:6, fontSize:11, color:T.muted, cursor:'pointer', fontFamily:'inherit' }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── EMPTY / WELCOME STATE ────────────────────────────────────────── */}
      {!hasData && (
        <div style={{ background:T.white, borderRadius:12, padding:'48px 32px',
          textAlign:'center', border:`1px solid ${T.border}`, marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h2 style={{ margin:0, color:T.navy, fontSize:20, marginBottom:8 }}>Welcome to RAISA</h2>
          <p style={{ color:T.muted, fontSize:14, lineHeight:1.7, maxWidth:480, margin:'0 auto 24px' }}>
            Your regulatory affairs intelligence system is ready. Start by creating a project
            in the Project Manager, then add products and dossiers for each target market.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { tab:'projects', label:'📁 Open Project Manager', primary:true },
              { tab:'checklist', label:'✓ Browse Checklists' },
              { tab:'india', label:'🇮🇳 India Regulatory' },
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

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 1 — STAT CARDS (AdminLTE colored gradient style)
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20 }}>
        <StatCard icon="📁" label="Active Projects" value={summary?.totalProjects||0}
          gradient="linear-gradient(135deg, #17A2B8, #138496)"
          onClick={() => onNavigate?.('projects')} sub="More info"/>
        <StatCard icon="📦" label="Total Dossiers" value={summary?.totalDossiers||0}
          gradient="linear-gradient(135deg, #28A745, #1E7E34)" sub="Across all markets"/>
        <StatCard icon="⏳" label="In Progress" value={summary?.inProgress||0}
          gradient="linear-gradient(135deg, #FFC107, #D39E00)" sub="Active submissions"/>
        <StatCard icon="✓" label="Approved" value={summary?.approved||0}
          gradient="linear-gradient(135deg, #DC3545, #BD2130)" sub="Marketing authorisations"/>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 2 — QUICK ACTIONS (7 buttons)
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
        padding:'16px 20px', marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:T.navy, marginBottom:14 }}>⚡ Quick Actions</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:10 }}>
          {[
            { icon:'📁', label:'New Project',      tab:'projects' },
            { icon:'📦', label:'Add Dossier',       tab:'projects' },
            { icon:'✓',  label:'CTD Checklist',     tab:'checklist' },
            { icon:'📋', label:'AI Review',          tab:'review' },
            { icon:'🇮🇳', label:'India Regulatory', tab:'india' },
            { icon:'⬇',  label:'Export eCTD',        tab:'projects' },
            { icon:'📤', label:'Upload Docs',        tab:'projects' },
          ].map(a => (
            <div key={a.label} onClick={() => onNavigate?.(a.tab)}
              style={{ padding:'14px 8px', background:'#F8FAFD', borderRadius:8,
                border:`1px solid ${T.border}`, cursor:'pointer', textAlign:'center',
                transition:'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.background=T.light;
                e.currentTarget.style.borderColor=T.mid;
                e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.background='#F8FAFD';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.transform='translateY(0)'; }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{a.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:T.navy, lineHeight:1.3 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 3 — DOSSIER STATUS CHART + WORLD MAP
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>📊 Dossier Status</span>
          </div>
          <div style={{ padding:16, minHeight:180 }}>
            <StatusDonut data={summary?.byStatus || {}} total={summary?.totalDossiers || 0}/>
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>🌍 Market Coverage</span>
            <span style={{ fontSize:11, color:T.muted, marginLeft:'auto' }}>
              {countryList.length} {countryList.length===1?'market':'markets'}
            </span>
          </div>
          <div style={{ padding:12, minHeight:180 }}>
            <WorldMap countries={countryList}/>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 4 — BY AUTHORITY + BY COUNTRY
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>🏛 By Regulatory Authority</span>
          </div>
          <div style={{ padding:'12px 18px' }}>
            {authorityList.length === 0 ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:T.muted, fontSize:12 }}>No data yet</div>
            ) : authorityList.map(([auth, data]) => {
              const pct = Math.round((data.count / maxAuth) * 100);
              return (
                <div key={auth} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{auth}</span>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {data.approved > 0 && <span style={{ fontSize:10, color:T.green, fontWeight:600 }}>{data.approved} ✓</span>}
                      {data.submitted > 0 && <span style={{ fontSize:10, color:'#7C3AED', fontWeight:600 }}>{data.submitted} ✉</span>}
                      <span style={{ fontSize:11, color:T.muted, fontFamily:'monospace' }}>{data.count}</span>
                    </div>
                  </div>
                  <MiniProgress pct={pct} color={T.mid}/>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>🌍 By Country / Market</span>
          </div>
          <div style={{ padding:'12px 18px' }}>
            {countryList.length === 0 ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:T.muted, fontSize:12 }}>No data yet</div>
            ) : countryList.map(([country, count]) => {
              const flag = REGION_FLAGS[country] || '🌐';
              const pct = Math.round((count / maxCountry) * 100);
              return (
                <div key={country} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{flag} {country}</span>
                    <span style={{ fontSize:11, color:T.muted, fontFamily:'monospace' }}>{count} dossier{count!==1?'s':''}</span>
                  </div>
                  <MiniProgress pct={pct} color={T.navy}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 5 — DOSSIER PIPELINE + RECENT ACTIVITY
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:16 }}>
        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`,
            display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy, flex:1 }}>📦 Dossier Pipeline</span>
            <span style={{ fontSize:11, color:T.muted }}>{dossiers.length} dossiers</span>
            <button onClick={() => onNavigate?.('projects')}
              style={{ fontSize:11, color:T.mid, background:T.light, border:'none',
                borderRadius:5, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit' }}>Open →</button>
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
                        style={{ borderBottom:'1px solid #F3F4F6', cursor:'pointer' }}
                        onMouseOver={e => e.currentTarget.style.background='#F8FAFD'}
                        onMouseOut={e => e.currentTarget.style.background='transparent'}
                        onClick={() => onNavigate?.('projects')}>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontWeight:600, color:T.text }}>{d.product_name || 'Unknown Product'}</div>
                          {d.submission_type && <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{d.submission_type}</div>}
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
                            padding:'2px 7px', borderRadius:4, fontWeight:600 }}>{d.dossier_format||'CTD'}</span>
                        </td>
                        <td style={{ padding:'10px 14px' }}><StatusPill status={d.status}/></td>
                        <td style={{ padding:'10px 14px', width:120 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <MiniProgress pct={pct} color={pct===100?'#16A34A':pct>50?T.navy:'#D97706'}/>
                            <span style={{ fontSize:10, color:T.muted, minWidth:28, fontFamily:'monospace' }}>{pct}%</span>
                          </div>
                          <div style={{ fontSize:9, color:T.dim, marginTop:2 }}>{d.node_counts?.uploaded||0}/{d.node_counts?.total||0} docs</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
          display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontWeight:700, fontSize:14, color:T.navy }}>⚡ Recent Activity</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', maxHeight:350 }}>
            {activity.length === 0 ? (
              <div style={{ padding:'30px 16px', textAlign:'center', color:T.muted }}>
                <div style={{ fontSize:24, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:12 }}>No activity yet</div>
                <div style={{ fontSize:11, marginTop:4, lineHeight:1.6 }}>Upload documents to dossiers to see activity here</div>
              </div>
            ) : activity.map((a, i) => (
              <div key={i} style={{ padding:'10px 16px', borderBottom:'1px solid #F3F4F6',
                display:'flex', gap:10, alignItems:'flex-start' }}>
                <ActivityDot type={a.type}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:T.text, lineHeight:1.4,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.text}</div>
                  <div style={{ display:'flex', gap:6, marginTop:3, alignItems:'center' }}>
                    {a.country && <span style={{ fontSize:9, color:T.muted }}>{REGION_FLAGS[a.country]||'🌐'} {a.country}</span>}
                    {a.score != null && (
                      <span style={{ fontSize:9, padding:'1px 5px', borderRadius:3,
                        background:a.score>=80?T.greenBg:a.score>=60?T.amberBg:T.redBg,
                        color:a.score>=80?T.green:a.score>=60?T.amber:T.red, fontWeight:600 }}>{a.score}/100</span>
                    )}
                    <span style={{ fontSize:9, color:T.dim, marginLeft:'auto' }}>{timeAgo(a.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
         SECTION 6 — SYSTEM STATUS BAR
         ═════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding:'10px 18px', background:'#F8FAFD',
        borderRadius:8, border:`1px solid ${T.border}`, display:'flex',
        alignItems:'center', gap:16, fontSize:11, color:T.muted, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#16A34A', display:'inline-block' }}/>
          RAISA v2.0 — Connected
        </span>
        <span>ICH M4Q(R1) · eCTD v3.2.2 + v4.0 · NDCT Rules 2019</span>
        <span style={{ marginLeft:'auto' }}>{summary?.totalDossiers||0} dossiers · {summary?.totalNodes||0} sections tracked</span>
      </div>
    </div>
  );
}
