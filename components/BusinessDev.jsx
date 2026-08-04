'use client';
import { useState, useEffect, useCallback } from 'react';

const T = {
  navy:'#1A3D6B', accent:'#2B579A', white:'#FFFFFF', bg:'#F5F6F8',
  text:'#1E1E1E', muted:'#6B7280', dim:'#9CA3AF', border:'#E0E0E0',
  red:'#C50F1F', green:'#0E8A3E', teal:'#0891B2', amber:'#D97706',
};

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached(type) {
  try {
    const raw = localStorage.getItem(`raisa_bizdev_${type}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch { return null; }
}
function setCached(type, data) {
  try { localStorage.setItem(`raisa_bizdev_${type}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function fetchIntel(type, force = false) {
  if (!force) {
    const cached = getCached(type);
    if (cached) return { data: cached, cached: true };
  }
  const res = await fetch('/api/business-intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  const json = await res.json();
  const data = json.data || [];
  setCached(type, data);
  return { data, cached: false };
}

const TAB_CONFIG = [
  { id:'tenders', label:'📢 Tenders', color:T.teal },
  { id:'patent-cliff', label:'⏰ Patent Cliff', color:T.amber },
  { id:'para-iv', label:'⚖️ Para IV', color:T.red },
  { id:'news', label:'📰 Industry News', color:T.accent },
];

export default function BusinessDev({ onBack }) {
  const [activeTab, setActiveTab] = useState('tenders');
  const [data, setData] = useState({ tenders:[], 'patent-cliff':[], 'para-iv':[], news:[] });
  const [loading, setLoading] = useState({});
  const [fetchedAt, setFetchedAt] = useState({});
  const [search, setSearch] = useState('');

  const load = useCallback(async (type, force = false) => {
    setLoading(p => ({ ...p, [type]: true }));
    try {
      const { data: result, cached } = await fetchIntel(type, force);
      setData(p => ({ ...p, [type]: result }));
      setFetchedAt(p => ({ ...p, [type]: cached ? 'cached' : new Date().toLocaleTimeString() }));
    } catch(e) { console.error(e); }
    setLoading(p => ({ ...p, [type]: false }));
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const items = (data[activeTab] || []).filter(item => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return JSON.stringify(item).toLowerCase().includes(s);
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', fontFamily:"'Segoe UI', Tahoma, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:T.navy, display:'flex', alignItems:'center', padding:'0 16px', height:44, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff', padding:'5px 14px', borderRadius:5, fontSize:12, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit', marginRight:16 }}>
          ← Back
        </button>
        <span style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:2 }}>RAISA</span>
        <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginLeft:6 }}>by CoLAB</span>
        <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)', marginLeft:16 }}>
          │ Business Development Intelligence
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Filter results..."
            style={{ padding:'5px 10px', borderRadius:5, border:'1px solid rgba(255,255,255,0.2)',
              background:'rgba(255,255,255,0.1)', color:'#fff', fontSize:11, width:180, fontFamily:'inherit' }}/>
          <button onClick={() => load(activeTab, true)} disabled={loading[activeTab]}
            style={{ padding:'5px 14px', background:'rgba(255,255,255,0.15)',
              border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:5,
              fontSize:11, fontWeight:600, cursor: loading[activeTab] ? 'wait' : 'pointer' }}>
            {loading[activeTab] ? '⟳ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ background:'#F0F4F8', borderBottom:`1px solid ${T.border}`, display:'flex', flexShrink:0 }}>
        {TAB_CONFIG.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding:'10px 20px', background: activeTab===t.id ? T.white : 'transparent',
              border:'none', borderBottom: activeTab===t.id ? `3px solid ${t.color}` : '3px solid transparent',
              fontSize:13, fontWeight: activeTab===t.id ? 700 : 500,
              color: activeTab===t.id ? T.text : T.muted, cursor:'pointer', fontFamily:'inherit' }}>
            {t.label}
            {data[t.id]?.length > 0 && (
              <span style={{ marginLeft:6, fontSize:10, background: activeTab===t.id ? t.color : '#D1D5DB',
                color:'#fff', padding:'1px 6px', borderRadius:10 }}>{data[t.id].length}</span>
            )}
          </button>
        ))}
        {fetchedAt[activeTab] && (
          <span style={{ marginLeft:'auto', alignSelf:'center', fontSize:10, color:T.dim, paddingRight:16 }}>
            {fetchedAt[activeTab] === 'cached' ? '📦 Cached results' : `✓ Updated ${fetchedAt[activeTab]}`}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:'auto', background:T.bg, padding:20 }}>
        {loading[activeTab] && !data[activeTab]?.length ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
            flexDirection:'column', gap:12, color:T.muted }}>
            <div style={{ fontSize:32 }}>⏳</div>
            <div style={{ fontSize:14 }}>Searching live sources for {TAB_CONFIG.find(t=>t.id===activeTab)?.label}...</div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
            flexDirection:'column', gap:12, color:T.muted }}>
            <div style={{ fontSize:48 }}>🔍</div>
            <div style={{ fontSize:14 }}>No results found. Try refreshing.</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
            {activeTab === 'tenders' && items.map((t, i) => <TenderCard key={i} t={t}/>)}
            {activeTab === 'patent-cliff' && items.map((t, i) => <PatentCard key={i} t={t}/>)}
            {activeTab === 'para-iv' && items.map((t, i) => <ParaIVCard key={i} t={t}/>)}
            {activeTab === 'news' && items.map((t, i) => <NewsCard key={i} t={t}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function TenderCard({ t }) {
  const urgent = t.daysLeft != null && t.daysLeft <= 15;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${urgent ? T.red : T.teal}`, padding:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:6, lineHeight:1.4 }}>{t.title}</div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>{t.authority} · {t.country}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        <span style={{ fontSize:10, background:'#EBF0F9', color:T.accent, padding:'2px 8px', borderRadius:4, fontWeight:600 }}>{t.product}</span>
        {t.category && <span style={{ fontSize:10, background:'#F3F4F6', color:T.muted, padding:'2px 8px', borderRadius:4 }}>{t.category}</span>}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid #F0F0F0` }}>
        <span style={{ fontSize:13, fontWeight:700, color:T.green }}>{t.value}</span>
        <span style={{ fontSize:11, fontWeight:600, color: urgent ? T.red : T.muted }}>
          {urgent ? '🔴' : '⏰'} {t.daysLeft != null ? `${t.daysLeft}d left` : t.deadline}
        </span>
      </div>
    </div>
  );
}

function PatentCard({ t }) {
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${T.amber}`, padding:16 }}>
      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>💊 {t.brand}</div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{t.molecule}</div>
      <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Originator:</strong> {t.originator}</div>
      <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Market:</strong> {t.market}</div>
      <div style={{ fontSize:11, color:T.text, marginBottom:10 }}><strong>Area:</strong> {t.therapeuticArea}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid #F0F0F0` }}>
        <span style={{ fontSize:12, fontWeight:700, color:T.green }}>{t.annualSales}</span>
        <span style={{ fontSize:11, fontWeight:700, color:T.amber }}>⏰ {t.expiryDate}</span>
      </div>
    </div>
  );
}

function ParaIVCard({ t }) {
  const colorMap = { red:T.red, green:T.green, amber:T.amber };
  const c = colorMap[t.statusColor] || T.muted;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${c}`, padding:16 }}>
      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>💊 {t.brand}</div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{t.molecule}</div>
      <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Originator:</strong> {t.originator}</div>
      <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Challengers:</strong> {t.challengers}</div>
      {t.ftfStatus && <div style={{ fontSize:11, color:T.text, marginBottom:8 }}><strong>FTF:</strong> {t.ftfStatus}</div>}
      <div style={{ marginTop:8, padding:'6px 10px', background: c+'18', borderRadius:6 }}>
        <span style={{ fontSize:11, fontWeight:600, color:c }}>{t.status}</span>
      </div>
    </div>
  );
}

function NewsCard({ t }) {
  const catColors = { BREAKING:T.red, APPROVAL:T.green, REGULATORY:T.accent, MERGER:T.amber, RECALL:T.red };
  const catIcons = { BREAKING:'🔴', APPROVAL:'🟢', REGULATORY:'📋', MERGER:'💰', RECALL:'⚠️' };
  const c = catColors[t.category] || T.muted;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, padding:16 }}>
      <span style={{ fontSize:9, fontWeight:800, color:c, background:c+'18', padding:'2px 8px',
        borderRadius:4, letterSpacing:'0.05em' }}>
        {catIcons[t.category] || '📰'} {t.category}
      </span>
      <div style={{ fontSize:13, fontWeight:600, color:T.text, marginTop:10, marginBottom:8, lineHeight:1.5 }}>{t.headline}</div>
      <div style={{ fontSize:10, color:T.muted }}>{t.source} · {t.timeAgo}</div>
    </div>
  );
}
