'use client';
import React, { useState, useEffect, useCallback } from 'react';

const T = {
  bg: '#F0F0F0', white: '#FFFFFF', border: '#D4D4D4',
  accent: '#2B579A', accentSoft: '#EBF0F9',
  text: '#1E1E1E', muted: '#5D5D5D', dim: '#A8A8A8',
  green: '#107C10', greenSoft: '#E6F4E6',
  orange: '#D83B01', orangeSoft: '#FFF0EB',
  red: '#C50F1F', redSoft: '#FDE8E8',
  purple: '#6264A7', purpleSoft: '#F0F0F9',
};

const STATUS_CONFIG = {
  missing:  { color: T.dim,    bg: '#F5F5F5',    label: 'Missing',   icon: '○' },
  uploaded: { color: T.accent, bg: T.accentSoft,  label: 'Uploaded',  icon: '↑' },
  reviewing:{ color: T.orange, bg: T.orangeSoft,  label: 'Reviewing', icon: '⟳' },
  reviewed: { color: T.green,  bg: T.greenSoft,   label: 'Reviewed',  icon: '✓' },
  issues:   { color: T.red,    bg: T.redSoft,     label: 'Issues',    icon: '!' },
  approved: { color: T.green,  bg: T.greenSoft,   label: 'Approved',  icon: '✓✓' },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Btn({ onClick, children, variant = 'primary', size = 'md', disabled, style = {} }) {
  const base = { border: 'none', borderRadius: '5px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Segoe UI,sans-serif', fontWeight: 500, transition: 'opacity .15s',
    opacity: disabled ? .5 : 1, display: 'inline-flex', alignItems: 'center', gap: '5px' };
  const sizes = { sm: { padding: '4px 10px', fontSize: '12px' }, md: { padding: '7px 14px', fontSize: '13px' }, lg: { padding: '10px 20px', fontSize: '14px' } };
  const variants = {
    primary:  { background: T.accent, color: '#fff' },
    ghost:    { background: 'transparent', color: T.accent, border: `1px solid ${T.accent}` },
    danger:   { background: T.red, color: '#fff' },
    subtle:   { background: T.bg, color: T.muted, border: `1px solid ${T.border}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: '100px',
      fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? T.green : score >= 60 ? T.orange : T.red;
  return (
    <span style={{ background: color + '18', color, padding: '2px 8px', borderRadius: '100px',
      fontSize: '11px', fontWeight: 700 }}>
      {score}/100
    </span>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: T.white, borderRadius: '12px', width: '100%', maxWidth: width,
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px',
            cursor: 'pointer', color: T.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.muted,
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${T.border}`, borderRadius: '6px',
        fontSize: '13px', outline: 'none', fontFamily: 'Segoe UI,sans-serif', boxSizing: 'border-box',
        color: T.text, background: T.white }} />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${T.border}`, borderRadius: '6px',
        fontSize: '13px', outline: 'none', fontFamily: 'Segoe UI,sans-serif', background: T.white,
        color: T.text, boxSizing: 'border-box' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Main ProjectManager Component ─────────────────────────────────────────────

// ── CASCADING COUNTRY → AUTHORITY → SUBMISSION DATA ───────────────────────
const COUNTRY_DATA = {
  // ── ASIA ──────────────────────────────────────────────────────────────────
  'India':          { authority:'CDSCO', format:'CTD', submissions:['NDA','ANDA','Fixed Dose Combination','Import Licence','Manufacturing Licence','Variation'] },
  'Philippines':    { authority:'FDA-PH', format:'ACTD', submissions:['NDA','ANDA','Variation','Line Extension','Renewal'] },
  'Indonesia':      { authority:'BPOM', format:'ACTD', submissions:['New Registration','Variation Major','Variation Minor','Renewal'] },
  'Malaysia':       { authority:'NPRA', format:'ACTD', submissions:['New Application','Variation','Renewal','Notification'] },
  'Thailand':       { authority:'FDA Thailand', format:'ACTD', submissions:['New Registration','Variation','Renewal'] },
  'Vietnam':        { authority:'DAV', format:'ACTD', submissions:['New Registration','Variation','Renewal'] },
  'Singapore':      { authority:'HSA', format:'CTD', submissions:['NDA (Full)','NDA (Abridged)','NDA (Verification)','Variation','Renewal'] },
  'Myanmar':        { authority:'FDA Myanmar', format:'ACTD', submissions:['New Registration','Variation','Renewal'] },
  'Cambodia':       { authority:'MAPH', format:'ACTD', submissions:['New Registration','Variation','Renewal'] },
  'Bangladesh':     { authority:'DGDA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Pakistan':       { authority:'DRAP', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Sri Lanka':      { authority:'NMRA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Nepal':          { authority:'DDA', format:'CTD', submissions:['New Registration','Renewal'] },
  'China':          { authority:'NMPA', format:'CTD', submissions:['NDA','ANDA','Imported Drug Registration','Variation'] },
  'Japan':          { authority:'PMDA', format:'CTD', submissions:['NDA','ANDA','Partial Change','Minor Change','Notification'] },
  'South Korea':    { authority:'MFDS', format:'CTD', submissions:['New Drug Application','Generic Drug Application','Variation','Renewal'] },
  'Taiwan':         { authority:'TFDA', format:'CTD', submissions:['New Drug Application','Generic Application','Variation'] },
  'Hong Kong':      { authority:'DHAHK', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  // ── MIDDLE EAST / GCC ─────────────────────────────────────────────────────
  'Saudi Arabia':   { authority:'SFDA', format:'CTD', submissions:['Product Licence','Variation Major','Variation Minor','Renewal'] },
  'UAE':            { authority:'MOH UAE', format:'CTD', submissions:['New Registration','Variation','Renewal','Drug Approval'] },
  'Kuwait':         { authority:'MOH Kuwait', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Qatar':          { authority:'MOPH Qatar', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Bahrain':        { authority:'NHRA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Oman':           { authority:'MOH Oman', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Jordan':         { authority:'JFDA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Egypt':          { authority:'EDAEH', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Iran':           { authority:'IFDA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  // ── EUROPE ────────────────────────────────────────────────────────────────
  'European Union': { authority:'EMA', format:'CTD', submissions:['MAA (Centralised)','MAA (Decentralised)','MAA (MRP)','Type IA Variation','Type IB Variation','Type II Variation','Line Extension'] },
  'United Kingdom': { authority:'MHRA', format:'CTD', submissions:['MAA','Variation Major','Variation Minor','Notification','Renewal'] },
  'Germany':        { authority:'BfArM', format:'CTD', submissions:['MAA (National)','Variation','Renewal'] },
  'France':         { authority:'ANSM', format:'CTD', submissions:['MAA (National)','Variation','Renewal'] },
  'Switzerland':    { authority:'Swissmedic', format:'CTD', submissions:['Marketing Authorisation','Variation','Renewal'] },
  'Turkey':         { authority:'TITCK', format:'CTD', submissions:['New Registration','Variation Major','Variation Minor','Renewal'] },
  'Russia':         { authority:'Roszdravnadzor', format:'CTD', submissions:['State Registration','Variation','Renewal'] },
  'Ukraine':        { authority:'SMESM', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  // ── NORTH AMERICA ─────────────────────────────────────────────────────────
  'United States':  { authority:'US FDA', format:'CTD', submissions:['NDA (505(b)(1))','NDA (505(b)(2))','ANDA','BLA','IND','Supplement (Prior Approval)','CBE-30','CBE-0','Annual Report'] },
  'Canada':         { authority:'Health Canada', format:'CTD', submissions:['NDS','ANDS','Supplement','Notifiable Change','Annual Notification'] },
  'Mexico':         { authority:'COFEPRIS', format:'CTD', submissions:['New Registration','Bioequivalent','Variation','Renewal'] },
  // ── LATIN AMERICA ─────────────────────────────────────────────────────────
  'Brazil':         { authority:'ANVISA', format:'CTD', submissions:['New Drug Registration','Generic','Similar','Variation','Renewal'] },
  'Argentina':      { authority:'ANMAT', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Colombia':       { authority:'INVIMA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Peru':           { authority:'DIGEMID', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Chile':          { authority:'ISP', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Venezuela':      { authority:'INHRR', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  // ── AFRICA ────────────────────────────────────────────────────────────────
  'South Africa':   { authority:'SAHPRA', format:'CTD', submissions:['New Chemical Entity','Generic','Variation','Renewal'] },
  'Nigeria':        { authority:'NAFDAC', format:'CTD', submissions:['New Registration','Renewal','Variation'] },
  'Kenya':          { authority:'PPB', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Ghana':          { authority:'FDA Ghana', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Tanzania':       { authority:'TMDA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Uganda':         { authority:'NDA Uganda', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Ethiopia':       { authority:'EFDA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Zimbabwe':       { authority:'MCAZ', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Zambia':         { authority:'ZAMRA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Botswana':       { authority:'BOMRA', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Namibia':        { authority:'NMRC', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Morocco':        { authority:'DMPP', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Algeria':        { authority:'ANPP', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  'Tunisia':        { authority:'DPHM', format:'CTD', submissions:['New Registration','Variation','Renewal'] },
  // ── OCEANIA ───────────────────────────────────────────────────────────────
  'Australia':      { authority:'TGA', format:'CTD', submissions:['ARTG Registration','Category 1','Category 3','Variation (Category A)','Variation (Category B)','Renewal'] },
  'New Zealand':    { authority:'Medsafe', format:'CTD', submissions:['New Medicine','Consent Variation','Renewal'] },
  // ── SUPRANATIONAL ─────────────────────────────────────────────────────────
  'WHO Prequalification': { authority:'WHO PQ', format:'CTD', submissions:['WHO PQ Submission','Variation','Annual Report'] },
  'ZAZIBONA (SADC)':      { authority:'ZAZIBONA', format:'CTD', submissions:['Joint Review Application','Variation'] },
};

const COUNTRIES_LIST = Object.keys(COUNTRY_DATA).sort();

function DossierForm({ form, setForm, products, onSubmit }) {
  const countryInfo = form.country ? COUNTRY_DATA[form.country] : null;

  const handleCountry = (country) => {
    const info = COUNTRY_DATA[country] || {};
    setForm(f => ({
      ...f,
      country,
      authority: info.authority || '',
      dossier_format: info.format || 'CTD',
      submission_type: info.submissions?.[0] || '',
    }));
  };

  const selectStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB',
    borderRadius: '6px', fontSize: '13px', background: '#fff',
    color: '#1E1E1E', outline: 'none', cursor: 'pointer',
  };

  const fieldStyle = { marginBottom: '14px' };
  const labelStyle = { fontSize: '11px', fontWeight: '600', color: '#6B7280',
    letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '5px' };

  return (
    <div>
      {/* Product */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Product</label>
        <select style={selectStyle} value={form.product_id || ''} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
          <option value="">— Select product —</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Country */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Country / Region</label>
        <select style={selectStyle} value={form.country || ''} onChange={e => handleCountry(e.target.value)}>
          <option value="">— Select country —</option>
          {COUNTRIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Authority — auto-filled, but editable */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Regulatory Authority</label>
        <select style={selectStyle} value={form.authority || ''} onChange={e => setForm(f => ({ ...f, authority: e.target.value }))}>
          {form.authority
            ? <option value={form.authority}>{form.authority}</option>
            : <option value="">— Select country first —</option>
          }
        </select>
      </div>

      {/* Submission Type — cascades from country */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Submission Type</label>
        <select style={selectStyle} value={form.submission_type || ''} onChange={e => setForm(f => ({ ...f, submission_type: e.target.value }))}>
          {countryInfo
            ? countryInfo.submissions.map(s => <option key={s} value={s}>{s}</option>)
            : <option value="">— Select country first —</option>
          }
        </select>
      </div>

      {/* Dossier Format — auto-set from country */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Dossier Format</label>
        <select style={selectStyle} value={form.dossier_format || 'CTD'} onChange={e => setForm(f => ({ ...f, dossier_format: e.target.value }))}>
          <option value="CTD">ICH CTD</option>
          <option value="ACTD">ASEAN ACTD</option>
        </select>
      </div>

      {/* ICH M4Q Version */}
      <div style={fieldStyle}>
        <label style={labelStyle}>ICH M4Q Version</label>
        <select style={selectStyle} value={form.m4q_version || 'R1'} onChange={e => setForm(f => ({ ...f, m4q_version: e.target.value }))}>
          <option value="R1">M4Q(R1) — Current</option>
          <option value="R2">M4Q(R2) — 2027 Draft</option>
        </select>
      </div>

      <button
        onClick={onSubmit}
        style={{ width: '100%', padding: '11px', background: '#1A3D6B', color: '#fff',
          border: 'none', borderRadius: '7px', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', marginTop: '4px' }}>
        Create Dossier
      </button>
    </div>
  );
}

export default function ProjectManager({ userId = 'user_default' }) {
  const [view, setView] = useState('projects'); // projects | dossier
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [activeDossier, setActiveDossier] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [gapReport, setGapReport] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'project' | 'client' | 'product' | 'dossier' | 'review'
  const [form, setForm] = useState({});
  const [uploadingNode, setUploadingNode] = useState(null);
  const [reviewDoc, setReviewDoc] = useState(null);

  // ── API helpers ───────────────────────────────────────────────────────────
  const api = useCallback(async (path, method = 'GET', body = null, isForm = false) => {
    const opts = { method, headers: {} };
    if (body && !isForm) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    if (body && isForm) opts.body = body;
    const res = await fetch(path, opts);
    return res.json();
  }, []);

  // ── Load projects ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data } = await api(`/api/projects?user_id=${userId}&type=projects`);
    setProjects(data || []);
    setLoading(false);
  }

  async function loadProjectData(project) {
    setSelectedProject(project);
    const [cRes, pRes] = await Promise.all([
      api(`/api/projects?type=clients&parent_id=${project.id}`),
      api(`/api/projects?type=products&parent_id=${project.id}`),
    ]);
    setClients(cRes.data || []);
    setProducts(pRes.data || []);
    const allDossiers = [];
    for (const product of pRes.data || []) {
      const { data } = await api(`/api/projects?type=dossiers&parent_id=${product.id}`);
      if (data) allDossiers.push(...data.map(d => ({ ...d, product_name: product.name })));
    }
    setDossiers(allDossiers);
  }

  async function loadDossier(dossier) {
    setActiveDossier(dossier);
    setView('dossier');
    setLoading(true);
    const { data, gap_report } = await api(`/api/dossiers?dossier_id=${dossier.id}`);
    setNodes(data || []);
    setGapReport(gap_report);
    // Auto-expand first module
    const modules = [...new Set((data || []).map(n => n.module))];
    if (modules[0]) setExpandedModules({ [modules[0]]: true });
    setLoading(false);
  }

  // ── Create handlers ───────────────────────────────────────────────────────
  async function createItem() {
    const { data } = await api('/api/projects', 'POST', { type: modal, user_id: userId, ...form });
    setModal(null); setForm({});
    if (modal === 'project') await loadProjects();
    if (selectedProject) await loadProjectData(selectedProject);
  }

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleUpload(node, file) {
    setUploadingNode(node.id);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('node_id', node.id);
    fd.append('dossier_id', activeDossier.id);
    fd.append('section', node.section);
    fd.append('doc_type', node.title);
    await api('/api/documents', 'POST', fd, true);
    await loadDossier(activeDossier);
    setUploadingNode(null);
  }

  async function deleteDoc(docId) {
    await api(`/api/documents?id=${docId}`, 'DELETE');
    await loadDossier(activeDossier);
  }

  // ── Grouped nodes by module ───────────────────────────────────────────────
  const nodesByModule = nodes.reduce((acc, node) => {
    if (!acc[node.module]) acc[node.module] = [];
    acc[node.module].push(node);
    return acc;
  }, {});

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg,
      fontFamily: 'Segoe UI,sans-serif', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ background: T.accent, color: '#fff', padding: '0 20px', height: '44px',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '.5px' }}>RAISA</span>
        <span style={{ opacity: .5, fontSize: '12px' }}>|</span>
        <span style={{ fontSize: '12px', opacity: .8 }}>Project Manager</span>
        {view === 'dossier' && (
          <>
            <span style={{ opacity: .5 }}>›</span>
            <span style={{ fontSize: '12px', opacity: .8 }}>{selectedProject?.name}</span>
            <span style={{ opacity: .5 }}>›</span>
            <span style={{ fontSize: '12px' }}>{activeDossier?.product_name} — {activeDossier?.country}</span>
            <button onClick={() => { setView('projects'); setActiveDossier(null); }}
              style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', border: 'none',
                color: '#fff', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              ← Back
            </button>
          </>
        )}
      </div>

      {view === 'projects' ? (
        // ── PROJECTS VIEW ──────────────────────────────────────────────────
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* Projects header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: T.text }}>
                {selectedProject ? `${selectedProject.name}` : 'My Projects'}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedProject && (
                  <Btn variant="subtle" size="sm" onClick={() => { setSelectedProject(null); setDossiers([]); }}>← All Projects</Btn>
                )}
                <Btn size="sm" onClick={() => { setModal(selectedProject ? 'dossier' : 'project'); setForm({}); }}>
                  + {selectedProject ? 'New Dossier' : 'New Project'}
                </Btn>
              </div>
            </div>

            {!selectedProject ? (
              // ── Project cards ──
              loading ? <div style={{ color: T.muted, padding: '40px', textAlign: 'center' }}>Loading...</div> :
              projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: T.muted }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No projects yet</div>
                  <Btn onClick={() => { setModal('project'); setForm({}); }}>Create your first project</Btn>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
                  {projects.map(p => (
                    <div key={p.id} onClick={() => loadProjectData(p)}
                      style={{ background: T.white, borderRadius: '10px', padding: '20px',
                        border: `1px solid ${T.border}`, cursor: 'pointer', transition: 'all .18s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = T.accent}
                      onMouseOut={e => e.currentTarget.style.borderColor = T.border}>
                      <div style={{ fontSize: '28px', marginBottom: '10px' }}>📁</div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: T.muted }}>{p.description || 'No description'}</div>
                      <div style={{ marginTop: '12px', fontSize: '11px', color: T.dim }}>
                        Created {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // ── Inside a project ──
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Left: Clients + Products */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: T.white, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Clients</span>
                      <Btn size="sm" onClick={() => { setModal('clients'); setForm({ project_id: selectedProject.id }); }}>+ Add</Btn>
                    </div>
                    {clients.length === 0 ? (
                      <div style={{ padding: '20px', color: T.muted, fontSize: '13px', textAlign: 'center' }}>No clients yet</div>
                    ) : clients.map(c => (
                      <div key={c.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${T.bg}` }}>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: T.muted }}>{c.email || c.contact || '—'}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: T.white, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Products</span>
                      <Btn size="sm" onClick={() => { setModal('products'); setForm({ project_id: selectedProject.id }); }}>+ Add</Btn>
                    </div>
                    {products.length === 0 ? (
                      <div style={{ padding: '20px', color: T.muted, fontSize: '13px', textAlign: 'center' }}>No products yet</div>
                    ) : products.map(p => (
                      <div key={p.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${T.bg}` }}>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: T.muted }}>{p.dosage_form} · {p.category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Dossiers */}
                <div style={{ background: T.white, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Dossiers</span>
                    <Btn size="sm" onClick={() => { setModal('dossiers'); setForm({ project_id: selectedProject.id }); }}>+ New Dossier</Btn>
                  </div>
                  {dossiers.length === 0 ? (
                    <div style={{ padding: '40px', color: T.muted, fontSize: '13px', textAlign: 'center' }}>
                      No dossiers yet. Create a dossier to start assembling your submission.
                    </div>
                  ) : dossiers.map(d => (
                    <div key={d.id} onClick={() => loadDossier(d)}
                      style={{ padding: '14px 16px', borderBottom: `1px solid ${T.bg}`, cursor: 'pointer', transition: 'background .15s' }}
                      onMouseOver={e => e.currentTarget.style.background = T.accentSoft}
                      onMouseOut={e => e.currentTarget.style.background = T.white}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{d.product_name} — {d.country}</div>
                          <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>
                            {d.authority} · {d.submission_type} · {d.dossier_format} {d.m4q_version}
                          </div>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ── DOSSIER VIEW ───────────────────────────────────────────────────
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>

          {/* Left: Module tree with nodes */}
          <div style={{ overflow: 'auto', borderRight: `1px solid ${T.border}` }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: T.muted }}>Loading dossier...</div>
            ) : Object.entries(nodesByModule).map(([module, moduleNodes]) => (
              <div key={module}>
                {/* Module header */}
                <div onClick={() => setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }))}
                  style={{ padding: '10px 16px', background: T.bg, borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', position: 'sticky', top: 0 }}>
                  <span style={{ fontSize: '11px' }}>{expandedModules[module] ? '▼' : '▶'}</span>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: T.accent }}>{module}</span>
                  <span style={{ fontSize: '11px', color: T.muted, marginLeft: 'auto' }}>
                    {moduleNodes.filter(n => n.status !== 'missing').length}/{moduleNodes.length}
                  </span>
                </div>

                {/* Nodes */}
                {expandedModules[module] && moduleNodes.map(node => (
                  <NodeRow key={node.id} node={node}
                    uploading={uploadingNode === node.id}
                    onUpload={file => handleUpload(node, file)}
                    onViewReview={doc => { setReviewDoc(doc); setModal('review'); }}
                    onDelete={deleteDoc} />
                ))}
              </div>
            ))}
          </div>

          {/* Right: Gap report panel */}
          <div style={{ overflow: 'auto', padding: '16px', background: T.white }}>
            {gapReport && <GapReportPanel report={gapReport} dossier={activeDossier} />}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {modal === 'project' && (
        <Modal title="New Project" onClose={() => setModal(null)}>
          <Field label="Project Name"><Input value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Q1 2026 ASEAN Submissions" /></Field>
          <Field label="Description"><Input value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Optional description" /></Field>
          <Btn onClick={createItem} style={{ width: '100%', justifyContent: 'center' }}>Create Project</Btn>
        </Modal>
      )}

      {modal === 'clients' && (
        <Modal title="Add Client" onClose={() => setModal(null)}>
          <Field label="Company / Client Name"><Input value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Cipla Ltd" /></Field>
          <Field label="Contact Person"><Input value={form.contact || ''} onChange={v => setForm(f => ({ ...f, contact: v }))} placeholder="Name" /></Field>
          <Field label="Email"><Input value={form.email || ''} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="contact@company.com" /></Field>
          <Btn onClick={createItem} style={{ width: '100%', justifyContent: 'center' }}>Add Client</Btn>
        </Modal>
      )}

      {modal === 'products' && (
        <Modal title="Add Product" onClose={() => setModal(null)}>
          <Field label="Product Name"><Input value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Amlodipine Tablets" /></Field>
          <Field label="INN / Generic Name"><Input value={form.inn || ''} onChange={v => setForm(f => ({ ...f, inn: v }))} placeholder="e.g. Amlodipine Besylate" /></Field>
          <Field label="Dosage Form">
            <Select value={form.dosage_form || ''} onChange={v => setForm(f => ({ ...f, dosage_form: v }))}
              options={[
                {value:'',label:'— Select dosage form —'},
                {value:'Film-coated Tablet',label:'Film-coated Tablet'},
                {value:'Uncoated Tablet',label:'Uncoated Tablet'},
                {value:'Modified Release Tablet',label:'Modified Release Tablet (MR/ER/SR)'},
                {value:'Hard Capsule',label:'Hard Gelatin Capsule'},
                {value:'Soft Gelatin Capsule',label:'Soft Gelatin Capsule'},
                {value:'Modified Release Capsule',label:'Modified Release Capsule'},
                {value:'Oral Solution',label:'Oral Solution / Syrup'},
                {value:'Oral Suspension',label:'Oral Suspension'},
                {value:'Oral Drops',label:'Oral Drops'},
                {value:'Effervescent Tablet',label:'Effervescent Tablet'},
                {value:'Dispersible Tablet',label:'Dispersible Tablet'},
                {value:'Sublingual Tablet',label:'Sublingual Tablet / Buccal'},
                {value:'Powder for Oral Solution',label:'Powder for Oral Solution'},
                {value:'Granules',label:'Granules'},
                {value:'Injection Solution',label:'Solution for Injection'},
                {value:'Injection Suspension',label:'Suspension for Injection'},
                {value:'Lyophilised Powder',label:'Lyophilised Powder for Injection'},
                {value:'Concentrate for Infusion',label:'Concentrate for Infusion'},
                {value:'Prefilled Syringe',label:'Prefilled Syringe'},
                {value:'Cream',label:'Cream'},
                {value:'Ointment',label:'Ointment'},
                {value:'Gel',label:'Gel'},
                {value:'Lotion',label:'Lotion'},
                {value:'Patch',label:'Transdermal Patch'},
                {value:'Eye Drops',label:'Eye Drops'},
                {value:'Ear Drops',label:'Ear Drops'},
                {value:'Nasal Spray',label:'Nasal Spray'},
                {value:'Inhaler MDI',label:'Metered Dose Inhaler (MDI)'},
                {value:'Inhaler DPI',label:'Dry Powder Inhaler (DPI)'},
                {value:'Suppository',label:'Suppository'},
                {value:'Pessary',label:'Pessary'},
                {value:'Dental Gel',label:'Dental Gel / Paste'},
              ]} />
          </Field>
          <Field label="Strength"><Input value={form.strength || ''} onChange={v => setForm(f => ({ ...f, strength: v }))} placeholder="e.g. 5mg, 10mg" /></Field>
          <Field label="Category">
            <Select value={form.category || 'FDF'} onChange={v => setForm(f => ({ ...f, category: v }))}
              options={[{value:'FDF',label:'Finished Dosage Form'},{value:'API',label:'API / Drug Substance'},{value:'Biological',label:'Biological / Biosimilar'},{value:'ATMP',label:'ATMP'}]} />
          </Field>
          <Field label="Client">
            <Select value={form.client_id || ''} onChange={v => setForm(f => ({ ...f, client_id: v }))}
              options={[{value:'',label:'— Select client —'}, ...clients.map(c => ({value:c.id,label:c.name}))]} />
          </Field>
          <Btn onClick={createItem} style={{ width: '100%', justifyContent: 'center' }}>Add Product</Btn>
        </Modal>
      )}

      {modal === 'dossiers' && (
        <Modal title="New Dossier" onClose={() => setModal(null)}>
          <DossierForm form={form} setForm={setForm} products={products} onSubmit={createItem} />
        </Modal>
      )}

      {modal === 'review' && reviewDoc && (
        <Modal title="AI Review Report" onClose={() => { setModal(null); setReviewDoc(null); }} width={640}>
          <ReviewPanel doc={reviewDoc} />
        </Modal>
      )}
    </div>
  );
}

// ── Node Row Component ─────────────────────────────────────────────────────────
function NodeRow({ node, uploading, onUpload, onViewReview, onDelete }) {
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasDocuments = node.documents && node.documents.length > 0;
  const latestDoc = hasDocuments ? node.documents[node.documents.length - 1] : null;

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  return (
    <div style={{ borderBottom: `1px solid ${T.bg}` }}>
      <div style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        background: dragOver ? T.accentSoft : T.white, transition: 'background .15s' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}>

        {/* Section code */}
        <span style={{ fontFamily: 'Consolas,monospace', fontSize: '11px', color: T.accent,
          minWidth: '80px', flexShrink: 0 }}>{node.section}</span>

        {/* Title */}
        <span style={{ fontSize: '12px', color: T.text, flex: 1 }}>{node.title}</span>

        {/* Status */}
        <StatusBadge status={uploading ? 'reviewing' : node.status} />

        {/* Score if reviewed */}
        {latestDoc?.review_score && <ScoreBadge score={latestDoc.review_score} />}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Upload button */}
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept=".pdf,.docx,.doc,.xlsx,.xls" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px',
              background: uploading ? T.bg : T.accent + '18', color: T.accent,
              padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
              {uploading ? '⟳ Reviewing...' : '↑ Upload'}
            </span>
          </label>

          {/* View review */}
          {latestDoc?.review_status === 'done' && (
            <Btn size="sm" variant="subtle" onClick={() => onViewReview(latestDoc)}>Report</Btn>
          )}

          {/* Expand documents */}
          {hasDocuments && (
            <button onClick={() => setExpanded(!expanded)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: T.muted }}>
              {expanded ? '▲' : `▼ ${node.documents.length}`}
            </button>
          )}
        </div>
      </div>

      {/* Expanded documents list */}
      {expanded && hasDocuments && (
        <div style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
          {node.documents.map(doc => (
            <div key={doc.id} style={{ padding: '7px 16px 7px 96px', display: 'flex', alignItems: 'center',
              gap: '10px', borderBottom: `1px solid ${T.white}` }}>
              <span style={{ fontSize: '11px', flex: 1, color: T.text }}>📄 {doc.filename}</span>
              {doc.review_score && <ScoreBadge score={doc.review_score} />}
              <span style={{ fontSize: '10px', color: T.dim }}>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
              {doc.review_status === 'done' && (
                <Btn size="sm" variant="subtle" onClick={() => onViewReview(doc)}>Report</Btn>
              )}
              <Btn size="sm" variant="danger" onClick={() => onDelete(doc.id)}>×</Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gap Report Panel ───────────────────────────────────────────────────────────
function GapReportPanel({ report, dossier }) {
  const pct = report.completeness;
  const barColor = pct >= 80 ? T.green : pct >= 50 ? T.orange : T.red;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>Dossier Gap Report</div>

      {/* Dossier info */}
      <div style={{ background: T.accentSoft, borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '13px', color: T.accent, marginBottom: '4px' }}>
          {dossier.country} — {dossier.authority}
        </div>
        <div style={{ fontSize: '11px', color: T.muted }}>
          {dossier.submission_type} · {dossier.dossier_format} · M4Q({dossier.m4q_version})
        </div>
      </div>

      {/* Completeness */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: T.muted }}>Completeness</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', background: T.border, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '4px', transition: 'width .5s' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: 'Total Nodes', value: report.total, color: T.text },
          { label: 'Uploaded', value: report.uploaded, color: T.accent },
          { label: 'Reviewed ✓', value: report.reviewed, color: T.green },
          { label: 'Issues ⚠', value: report.issues, color: T.orange },
          { label: 'Missing', value: report.missing, color: T.red },
          { label: 'Avg Score', value: report.avg_score ? `${report.avg_score}/100` : '—', color: T.purple },
        ].map(s => (
          <div key={s.label} style={{ background: T.bg, borderRadius: '7px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: T.dim, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Missing nodes list */}
      {report.missing > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: T.red, marginBottom: '8px' }}>
            Missing Documents ({report.missing})
          </div>
          <div style={{ fontSize: '11px', color: T.muted, lineHeight: 1.8 }}>
            Upload documents to the nodes marked Missing to complete your dossier.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Review Panel ──────────────────────────────────────────────────────────────
function ReviewPanel({ doc }) {
  const r = doc.review_json || {};
  const score = doc.review_score || 0;
  const scoreColor = score >= 80 ? T.green : score >= 60 ? T.orange : T.red;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%',
          background: scoreColor + '15', border: `3px solid ${scoreColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '20px', color: scoreColor, flexShrink: 0 }}>
          {score}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{doc.filename}</div>
          <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>
            {r.verdict === 'PASS' ? '✅ PASS' : r.verdict === 'FAIL' ? '❌ FAIL' : '⚠️ REVIEW REQUIRED'}
          </div>
        </div>
      </div>

      {/* Summary */}
      {r.summary && (
        <div style={{ background: T.bg, borderRadius: '8px', padding: '12px', fontSize: '13px', lineHeight: 1.6 }}>
          {r.summary}
        </div>
      )}

      {/* Issues */}
      {r.issues && r.issues.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Issues Found</div>
          {r.issues.map((issue, i) => {
            const c = issue.severity === 'critical' ? T.red : issue.severity === 'major' ? T.orange : T.muted;
            return (
              <div key={i} style={{ background: c + '10', border: `1px solid ${c}30`,
                borderRadius: '7px', padding: '10px 12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ background: c, color: '#fff', padding: '1px 7px', borderRadius: '4px',
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{issue.severity}</span>
                  <span style={{ fontSize: '12px', color: T.muted }}>{issue.section}</span>
                </div>
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>{issue.description}</div>
                <div style={{ fontSize: '12px', color: T.muted }}>→ {issue.recommendation}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strengths */}
      {r.strengths && r.strengths.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Strengths</div>
          {r.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: '13px', color: T.green, marginBottom: '5px' }}>✓ {s}</div>
          ))}
        </div>
      )}

      {/* ICH References */}
      {r.ichrefs && r.ichrefs.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: T.muted }}>ICH References</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {r.ichrefs.map((ref, i) => (
              <span key={i} style={{ background: T.purpleSoft, color: T.purple,
                padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{ref}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
