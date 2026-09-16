'use client';
import { useState, useEffect, useCallback } from 'react';

const T = {
  navy:'#1A3D6B', accent:'#2B579A', white:'#FFFFFF', bg:'#F5F6F8',
  text:'#1E1E1E', muted:'#6B7280', dim:'#9CA3AF', border:'#E0E0E0',
  red:'#C50F1F', green:'#0E8A3E', teal:'#0891B2', amber:'#D97706', purple:'#7C3AED',
};

const TAB_CONFIG = [
  { id:'tenders', label:'📢 Tenders', color:T.teal },
  { id:'patent-cliff', label:'⏰ Patent Cliff', color:T.amber },
  { id:'para-iv', label:'⚖️ Para IV', color:T.red },
  { id:'news', label:'📰 Industry News', color:T.accent },
  { id:'guidelines', label:'📘 Guidelines', color:T.purple },
];

// Field definitions for the "+ Add Manually" form, per category.
const FORM_FIELDS = {
  tenders: [
    { key:'title', label:'Tender Title', required:true },
    { key:'authority', label:'Issuing Authority', required:true },
    { key:'country', label:'Country / Region' },
    { key:'product', label:'Product Category' },
    { key:'value', label:'Estimated Value (e.g. $2.3M)' },
    { key:'deadline', label:'Deadline (e.g. 15 Oct 2026)' },
    { key:'category', label:'Therapeutic Category' },
    { key:'url', label:'Source URL' },
  ],
  'patent-cliff': [
    { key:'brand', label:'Brand Name', required:true },
    { key:'molecule', label:'Molecule / INN', required:true },
    { key:'originator', label:'Originator Company' },
    { key:'market', label:'Primary Market (e.g. US/EU)' },
    { key:'expiryDate', label:'Patent Expiry (date or year)' },
    { key:'annualSales', label:'Annual Sales (e.g. $1.2B)' },
    { key:'therapeuticArea', label:'Therapeutic Area' },
  ],
  'para-iv': [
    { key:'brand', label:'Brand Name', required:true },
    { key:'molecule', label:'Molecule / INN', required:true },
    { key:'originator', label:'Originator Company' },
    { key:'challengers', label:'Challengers' },
    { key:'status', label:'Litigation Status', required:true },
    { key:'statusColor', label:'Status Colour', type:'select', options:['red','amber','green'] },
    { key:'ftfStatus', label:'First-to-File Status' },
  ],
  news: [
    { key:'category', label:'Category', type:'select', options:['BREAKING','APPROVAL','REGULATORY','MERGER','RECALL'], required:true },
    { key:'headline', label:'Headline', required:true },
    { key:'source', label:'Source (publication/agency)' },
    { key:'timeAgo', label:'When (e.g. "3 days ago", "Today")' },
    { key:'url', label:'Source URL' },
  ],
  guidelines: [
    { key:'title', label:'Guideline / Notification Title', required:true },
    { key:'authority', label:'Issuing Authority (e.g. ICH, FDA, WHO)', required:true },
    { key:'region', label:'Applicable Region' },
    { key:'effectiveDate', label:'Effective Date' },
    { key:'summary', label:'What Changed (one sentence)' },
    { key:'url', label:'Source URL' },
  ],
};

function formatAgo(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

async function fetchCategory(category) {
  const res = await fetch(`/api/business-intel/data?category=${category}`);
  return res.json();
}

export default function BusinessDev({ onBack }) {
  const [activeTab, setActiveTab] = useState('tenders');
  const [data, setData] = useState({ tenders:[], 'patent-cliff':[], 'para-iv':[], news:[], guidelines:[] });
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState({});
  const [updating, setUpdating] = useState({});
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (category) => {
    setLoading(p => ({ ...p, [category]: true }));
    try {
      const json = await fetchCategory(category);
      setData(p => ({ ...p, [category]: json.items || [] }));
      setMeta(p => ({ ...p, [category]: { lastAiUpdate: json.lastAiUpdate, lastManualUpdate: json.lastManualUpdate } }));
    } catch(e) {
      console.error(e);
      setData(p => ({ ...p, [category]: [] }));
    }
    setLoading(p => ({ ...p, [category]: false }));
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  // Admin-triggered AI search — the only action on this whole screen that
  // spends Anthropic tokens. Confirms first since it's a deliberate spend.
  async function runUpdate(category) {
    if (!window.confirm(`Run a live AI + web search for ${TAB_CONFIG.find(t=>t.id===category)?.label}?\n\nThis uses your Anthropic API credits (a few cents). Regular page views never do this — only this button does.`)) return;
    setUpdating(p => ({ ...p, [category]: true }));
    try {
      const res = await fetch('/api/business-intel/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const json = await res.json();
      const result = json.results?.[category];
      if (result && !result.success) {
        alert(`Search failed: ${result.error}${result.errorDetail ? '\n\n' + result.errorDetail : ''}`);
      }
      await load(category);
    } catch(e) {
      alert('Update failed: ' + e.message);
    }
    setUpdating(p => ({ ...p, [category]: false }));
  }

  async function submitManual() {
    const fields = FORM_FIELDS[activeTab];
    const missing = fields.filter(f => f.required && !formValues[f.key]?.trim());
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      const cleaned = {};
      fields.forEach(f => { if (formValues[f.key]?.trim()) cleaned[f.key] = formValues[f.key].trim(); });
      const res = await fetch('/api/business-intel/manual', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeTab, data: cleaned }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
      setFormValues({});
      setShowAddForm(false);
      await load(activeTab);
    } catch(e) {
      alert('Could not save: ' + e.message);
    }
    setSaving(false);
  }

  async function deleteItem(id) {
    if (!window.confirm('Remove this item?')) return;
    try {
      await fetch(`/api/business-intel/manual?id=${id}`, { method: 'DELETE' });
      await load(activeTab);
    } catch(e) {
      alert('Could not delete: ' + e.message);
    }
  }

  const rawItems = data[activeTab] || [];
  const items = rawItems.filter(item => {
    if (!search.trim()) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const activeMeta = meta[activeTab] || {};
  const freshest = [activeMeta.lastAiUpdate, activeMeta.lastManualUpdate].filter(Boolean).sort().pop();

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
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ background:'#F0F4F8', borderBottom:`1px solid ${T.border}`, display:'flex', flexShrink:0 }}>
        {TAB_CONFIG.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setShowAddForm(false); }}
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
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, paddingRight:16 }}>
          {freshest && (
            <span style={{ fontSize:10, color:T.dim }}>Updated {formatAgo(freshest)}</span>
          )}
          <button onClick={() => setShowAddForm(s => !s)}
            style={{ padding:'6px 14px', background: showAddForm ? '#EDE9FE' : T.purple,
              color: showAddForm ? T.purple : '#fff', border:`1px solid ${T.purple}`, borderRadius:5,
              fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {showAddForm ? '✕ Cancel' : '✍️ Add Manually'}
          </button>
          <button onClick={() => runUpdate(activeTab)} disabled={updating[activeTab]}
            style={{ padding:'6px 14px', background: updating[activeTab] ? '#9CA3AF' : T.navy,
              color:'#fff', border:'none', borderRadius:5, fontSize:11, fontWeight:600,
              cursor: updating[activeTab] ? 'wait' : 'pointer', fontFamily:'inherit' }}>
            {updating[activeTab] ? '⟳ Searching...' : '🔄 Update Now (AI)'}
          </button>
        </div>
      </div>

      {/* Manual add form */}
      {showAddForm && (
        <div style={{ background:'#F8F4FF', borderBottom:`1px solid ${T.border}`, padding:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.purple, marginBottom:10 }}>
            ✍️ Add to {TAB_CONFIG.find(t=>t.id===activeTab)?.label} manually — no AI, no cost
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:10, marginBottom:12 }}>
            {FORM_FIELDS[activeTab].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:10, fontWeight:600, color:T.muted, display:'block', marginBottom:3 }}>
                  {f.label}{f.required && ' *'}
                </label>
                {f.type === 'select' ? (
                  <select value={formValues[f.key] || ''}
                    onChange={e => setFormValues(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width:'100%', padding:'6px 8px', border:`1px solid ${T.border}`,
                      borderRadius:4, fontSize:12, fontFamily:'inherit', background:'#fff', boxSizing:'border-box' }}>
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={formValues[f.key] || ''}
                    onChange={e => setFormValues(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width:'100%', padding:'6px 8px', border:`1px solid ${T.border}`,
                      borderRadius:4, fontSize:12, fontFamily:'inherit', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
          </div>
          <button onClick={submitManual} disabled={saving}
            style={{ padding:'7px 20px', background: saving ? '#9CA3AF' : T.purple, color:'#fff',
              border:'none', borderRadius:5, fontSize:12, fontWeight:600,
              cursor: saving ? 'wait' : 'pointer', fontFamily:'inherit' }}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex:1, overflow:'auto', background:T.bg, padding:20 }}>
        {loading[activeTab] ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
            flexDirection:'column', gap:12, color:T.muted }}>
            <div style={{ fontSize:32 }}>⏳</div>
            <div style={{ fontSize:14 }}>Loading...</div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
            flexDirection:'column', gap:14, color:T.muted }}>
            <div style={{ fontSize:48 }}>📭</div>
            <div style={{ fontSize:14, fontWeight:600 }}>
              {search.trim() ? 'No results match your filter' : 'Nothing here yet'}
            </div>
            {!search.trim() && (
              <div style={{ fontSize:12, textAlign:'center', maxWidth:360, lineHeight:1.6 }}>
                Click <strong>🔄 Update Now</strong> to run a live AI search, or
                <strong> ✍️ Add Manually</strong> to enter something you've found yourself.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
            {activeTab === 'tenders' && items.map(t => <TenderCard key={t.id} t={t} onDelete={deleteItem}/>)}
            {activeTab === 'patent-cliff' && items.map(t => <PatentCard key={t.id} t={t} onDelete={deleteItem}/>)}
            {activeTab === 'para-iv' && items.map(t => <ParaIVCard key={t.id} t={t} onDelete={deleteItem}/>)}
            {activeTab === 'news' && items.map(t => <NewsCard key={t.id} t={t} onDelete={deleteItem}/>)}
            {activeTab === 'guidelines' && items.map(t => <GuidelineCard key={t.id} t={t} onDelete={deleteItem}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceBadge({ source }) {
  const isManual = source === 'manual';
  return (
    <span style={{ fontSize:8, fontWeight:700, color: isManual ? T.purple : T.teal,
      background: isManual ? '#F5F0FF' : '#E6F7F9', padding:'2px 6px', borderRadius:3 }}>
      {isManual ? '✍️ MANUAL' : '🤖 AI'}
    </span>
  );
}

function DeleteButton({ onClick }) {
  return (
    <button onClick={onClick} title="Remove this item"
      style={{ background:'none', border:'none', color:'#CCC', fontSize:13, cursor:'pointer', padding:2, lineHeight:1 }}
      onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
      onMouseLeave={e => e.currentTarget.style.color='#CCC'}>
      🗑
    </button>
  );
}

function TenderCard({ t, onDelete }) {
  const urgent = t.daysLeft != null && t.daysLeft <= 15;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${urgent ? T.red : T.teal}`, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:6, lineHeight:1.4 }}>{t.title}</div>
        <DeleteButton onClick={() => onDelete(t.id)}/>
      </div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>{t.authority} · {t.country}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        {t.product && <span style={{ fontSize:10, background:'#EBF0F9', color:T.accent, padding:'2px 8px', borderRadius:4, fontWeight:600 }}>{t.product}</span>}
        {t.category && <span style={{ fontSize:10, background:'#F3F4F6', color:T.muted, padding:'2px 8px', borderRadius:4 }}>{t.category}</span>}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid #F0F0F0` }}>
        <span style={{ fontSize:13, fontWeight:700, color:T.green }}>{t.value || '—'}</span>
        <span style={{ fontSize:11, fontWeight:600, color: urgent ? T.red : T.muted }}>
          {urgent ? '🔴' : '⏰'} {t.daysLeft != null ? `${t.daysLeft}d left` : (t.deadline || '—')}
        </span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
        {t.postedAgo && <div style={{ fontSize:9, color:T.dim }}>Posted {t.postedAgo}</div>}
        <SourceBadge source={t._origin}/>
      </div>
    </div>
  );
}

function PatentCard({ t, onDelete }) {
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${T.amber}`, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text }}>💊 {t.brand}</div>
        <DeleteButton onClick={() => onDelete(t.id)}/>
      </div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{t.molecule}</div>
      {t.originator && <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Originator:</strong> {t.originator}</div>}
      {t.market && <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Market:</strong> {t.market}</div>}
      {t.therapeuticArea && <div style={{ fontSize:11, color:T.text, marginBottom:10 }}><strong>Area:</strong> {t.therapeuticArea}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid #F0F0F0` }}>
        <span style={{ fontSize:12, fontWeight:700, color:T.green }}>{t.annualSales || '—'}</span>
        <span style={{ fontSize:11, fontWeight:700, color:T.amber }}>⏰ {t.expiryDate || '—'}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
        {t.dataAsOf && <div style={{ fontSize:9, color:T.dim }}>{t.dataAsOf}</div>}
        <SourceBadge source={t._origin}/>
      </div>
    </div>
  );
}

function ParaIVCard({ t, onDelete }) {
  const colorMap = { red:T.red, green:T.green, amber:T.amber };
  const c = colorMap[t.statusColor] || T.muted;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${c}`, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text }}>💊 {t.brand}</div>
        <DeleteButton onClick={() => onDelete(t.id)}/>
      </div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{t.molecule}</div>
      {t.originator && <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Originator:</strong> {t.originator}</div>}
      {t.challengers && <div style={{ fontSize:11, color:T.text, marginBottom:4 }}><strong>Challengers:</strong> {t.challengers}</div>}
      {t.ftfStatus && <div style={{ fontSize:11, color:T.text, marginBottom:8 }}><strong>FTF:</strong> {t.ftfStatus}</div>}
      {t.status && (
        <div style={{ marginTop:8, padding:'6px 10px', background: c+'18', borderRadius:6 }}>
          <span style={{ fontSize:11, fontWeight:600, color:c }}>{t.status}</span>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
        {t.dataAsOf && <div style={{ fontSize:9, color:T.dim }}>{t.dataAsOf}</div>}
        <SourceBadge source={t._origin}/>
      </div>
    </div>
  );
}

function NewsCard({ t, onDelete }) {
  const catColors = { BREAKING:T.red, APPROVAL:T.green, REGULATORY:T.accent, MERGER:T.amber, RECALL:T.red };
  const catIcons = { BREAKING:'🔴', APPROVAL:'🟢', REGULATORY:'📋', MERGER:'💰', RECALL:'⚠️' };
  const c = catColors[t.category] || T.muted;
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <span style={{ fontSize:9, fontWeight:800, color:c, background:c+'18', padding:'2px 8px',
          borderRadius:4, letterSpacing:'0.05em' }}>
          {catIcons[t.category] || '📰'} {t.category}
        </span>
        <DeleteButton onClick={() => onDelete(t.id)}/>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:T.text, marginTop:10, marginBottom:8, lineHeight:1.5 }}>{t.headline}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:10, color:T.muted }}>{t.source}{t.source && t.timeAgo ? ' · ' : ''}{t.timeAgo}</div>
        <SourceBadge source={t._origin}/>
      </div>
    </div>
  );
}

function GuidelineCard({ t, onDelete }) {
  return (
    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
      borderLeft:`4px solid ${T.purple}`, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <span style={{ fontSize:9, fontWeight:800, color:T.purple, background:T.purple+'18', padding:'2px 8px',
          borderRadius:4, letterSpacing:'0.05em' }}>📘 {t.authority}</span>
        <DeleteButton onClick={() => onDelete(t.id)}/>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:T.text, marginTop:10, marginBottom:6, lineHeight:1.5 }}>{t.title}</div>
      {t.summary && <div style={{ fontSize:11, color:T.muted, marginBottom:10, lineHeight:1.5 }}>{t.summary}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid #F0F0F0` }}>
        <span style={{ fontSize:10, color:T.muted }}>{t.region}{t.region && t.effectiveDate ? ' · ' : ''}{t.effectiveDate}</span>
        <SourceBadge source={t._origin}/>
      </div>
      {t.dataAsOf && <div style={{ fontSize:9, color:T.dim, marginTop:6 }}>{t.dataAsOf}</div>}
    </div>
  );
}
