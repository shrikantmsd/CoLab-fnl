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
        <label style={labelStyle}>{['DMF','ASMF','CEP','API_CTD'].includes(form.dossier_format)?'API / DMF Type':'Submission Type'}</label>
        <select style={selectStyle} value={form.submission_type || ''} onChange={e => setForm(f => ({ ...f, submission_type: e.target.value }))}>
          {['DMF','ASMF','CEP','API_CTD'].includes(form.dossier_format) ? (<>
            <option value="DMF-II">DMF Type II — Drug Substance (API)</option>
            <option value="DMF-III">DMF Type III — Packaging Material</option>
            <option value="DMF-IV">DMF Type IV — Excipient</option>
            <option value="CEP">CEP — EDQM Certificate of Suitability</option>
            <option value="ASMF">ASMF — Active Substance Master File (EU)</option>
            <option value="API-SA">API Standalone CTD Dossier (Module 3.2.S)</option>
          </>) : countryInfo
            ? countryInfo.submissions.map(s => <option key={s} value={s}>{s}</option>)
            : <option value="">— Select country first —</option>
          }
        </select>
      </div>

      {/* Dossier Format — auto-set from country */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Dossier Format</label>
        <select style={selectStyle} value={form.dossier_format || 'CTD'} onChange={e => setForm(f => ({ ...f, dossier_format: e.target.value }))}>
          <optgroup label="Finished Product">
            <option value="CTD">ICH CTD</option>
            <option value="ACTD">ASEAN ACTD</option>
            <option value="NeeS">NeeS (Non-eCTD Electronic Submission)</option>
          </optgroup>
          <optgroup label="Drug Substance / API">
            <option value="DMF">DMF — Drug Master File</option>
            <option value="ASMF">ASMF — Active Substance Master File (EU)</option>
            <option value="CEP">CEP — Certificate of Suitability (EDQM)</option>
            <option value="API_CTD">API Dossier — Standalone CTD (Module 3.2.S)</option>
          </optgroup>
          <optgroup label="Other">
            <option value="IND">IND / IMPD — Investigational Product</option>
            <option value="Paper">Paper / CTD Paper Dossier</option>
          </optgroup>
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
        onClick={() => {
          if (!form.product_id) { alert('Please select a product first.'); return; }
          if (!form.country)    { alert('Please select a country.'); return; }
          onSubmit();
        }}
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
  const [exporting, setExporting] = useState(false);
  const [exportingV4, setExportingV4] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);   // { url, filename, node }
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sequences, setSequences] = useState([]);
  const [activeSeq, setActiveSeq] = useState(null); // current sequence object
  const [seqModal, setSeqModal] = useState(false);   // new sequence modal
  const [dossierSearch, setDossierSearch] = useState('');
  const [treeWidth, setTreeWidth]       = useState(250);  // resizable panel 1
  const [previewWidth, setPreviewWidth] = useState(null); // flex:1 by default
  const [gapWidth, setGapWidth]         = useState(300);  // resizable panel 3 (fixed)
  const [seqForm, setSeqForm] = useState({});
  const [reviewDoc, setReviewDoc] = useState(null);
  const [dossierError, setDossierError] = useState(null);
  const [showGapModal, setShowGapModal] = useState(false);

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
    setDossierError(null);
    try {
      // Load sequences first
      let seqs = [];
      try {
        seqs = await loadSequences(dossier.id);
      } catch(e) {
        console.error('loadSequences error:', e);
        setSequences([]);
      }
      const latestSeq = seqs.length > 0 ? seqs[seqs.length - 1].sequence_number : '0000';
      // Load nodes for latest sequence
      const result = await api(`/api/dossiers?dossier_id=${dossier.id}&sequence=${latestSeq}`);
      if (result?.error) {
        setDossierError(result.error);
        setNodes([]);
        setGapReport(null);
      } else {
        // ── CRITICAL: Sanitize every node — Supabase can return documents as null ──
        const nodeData = (result?.data || []).map(n => ({
          ...n,
          documents: Array.isArray(n.documents) ? n.documents : [],
          module: n.module || 'unknown',
          section: n.section || '',
          title: n.title || '',
          status: n.status || 'missing',
        }));
        setNodes(nodeData);
        setGapReport(result?.gap_report || null);
        const modules = [...new Set(nodeData.map(n => n.module))];
        if (modules[0]) setExpandedModules({ [modules[0]]: true });
      }
    } catch(err) {
      console.error('loadDossier error:', err);
      setDossierError(err.message || 'Failed to load dossier');
      setNodes([]);
      setGapReport(null);
    }
    setLoading(false);
  }



  // ── PDF Preview ────────────────────────────────────────────────────────────
  async function openPreview(doc, node) {
    if (!doc) {
      // No document yet — show upload prompt in preview pane
      setPreviewDoc({ filename: null, node, url: null, noDoc: true });
      return;
    }
    setPreviewLoading(true);
    setPreviewDoc({ filename: doc.filename, node, url: null });
    try {
      const res = await fetch(`/api/preview?file_path=${encodeURIComponent(doc.file_path)}`);
      const { url } = await res.json();
      setPreviewDoc({ filename: doc.filename, node, url });
    } catch(e) {
      setPreviewDoc({ filename: doc.filename, node, url: null, error: 'Could not load preview' });
    } finally {
      setPreviewLoading(false);
    }
  }

  // ── Sequence management ───────────────────────────────────────────────────
  async function loadSequences(dossierId) {
    const { data } = await api(`/api/sequences?dossier_id=${dossierId}`);
    const seqs = (data || []).sort((a,b) => a.sequence_number.localeCompare(b.sequence_number));
    setSequences(seqs);
    // Default to latest sequence
    if (seqs.length > 0) setActiveSeq(seqs[seqs.length - 1]);
    return seqs;
  }

  async function createSequence() {
    if (!activeDossier) return;
    const lastSeq = sequences.length > 0
      ? sequences[sequences.length - 1].sequence_number
      : '0000';
    const nextNum = String(parseInt(lastSeq) + 1).padStart(4, '0');

    const { data } = await api('/api/sequences', 'POST', {
      dossier_id: activeDossier.id,
      sequence_number: nextNum,
      label: seqForm.label || `Sequence ${nextNum}`,
      description: seqForm.description || '',
      relates_to: seqForm.relates_to || null,
      relationship_type: seqForm.relationship_type || 'SUCC',
      status: 'draft',
    });

    if (data) {
      // Clone all nodes from previous sequence with operation = 'unchanged'
      // Clone from the "relates-to" sequence (or last sequence if not specified)
      const cloneFrom = seqForm.relates_to || lastSeq;
      await api('/api/sequences/clone', 'POST', {
        dossier_id: activeDossier.id,
        from_sequence: cloneFrom,
        to_sequence: nextNum,
      });

      setSeqModal(false);
      setSeqForm({});
      await loadSequences(activeDossier.id);
      await loadDossierNodes(activeDossier.id, nextNum);
    }
  }

  async function deleteSequence(seqNum) {
    if (seqNum === '0000') { alert('SEQ 0000 (Initial Submission) cannot be deleted.'); return; }
    if (!confirm(`Delete SEQ ${seqNum}? All nodes and documents in this sequence will be removed. This cannot be undone.`)) return;
    await api('/api/sequences', 'DELETE', { dossier_id: activeDossier.id, sequence_number: seqNum });
    const fallback = sequences.find(s => s.sequence_number !== seqNum);
    await loadSequences(activeDossier.id);
    if (activeSeq?.sequence_number === seqNum) {
      const fb = fallback || null;
      setActiveSeq(fb);
      if (fb) await loadDossierNodes(activeDossier.id, fb.sequence_number);
      else setNodes([]);
    }
  }

  async function loadDossierNodes(dossierId, seqNum) {
    setLoading(true);
    try {
      const result = await api(
        `/api/dossiers?dossier_id=${dossierId}&sequence=${seqNum || '0000'}`
      );
      // ── Sanitize — same as loadDossier ──
      const nodeData = (result?.data || []).map(n => ({
        ...n,
        documents: Array.isArray(n.documents) ? n.documents : [],
        module: n.module || 'unknown',
        section: n.section || '',
        title: n.title || '',
        status: n.status || 'missing',
      }));
      setNodes(nodeData);
      setGapReport(result?.gap_report || null);
      const modules = [...new Set(nodeData.map(n => n.module))];
      if (modules[0]) setExpandedModules({ [modules[0]]: true });
    } catch(err) {
      console.error('loadDossierNodes error:', err);
      setNodes([]);
      setGapReport(null);
    }
    setLoading(false);
  }

  // ── Create handlers ───────────────────────────────────────────────────────
  async function createItem() {
    const { data } = await api('/api/projects', 'POST', { type: modal, user_id: userId, ...form });
    setModal(null); setForm({});
    if (modal === 'project') await loadProjects();
    if (modal === 'clients' && data)  setClients(prev => [...prev, data]);
    if (modal === 'products' && data) setProducts(prev => [...prev, data]);
    if (modal === 'dossiers' || modal === 'dossier') { if(data) setDossiers(prev => [...prev, data]); }
    if (selectedProject) await loadProjectData(selectedProject);
  }

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleUpload(node, file) {
    if (!activeDossier?.id) return;
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
    if (activeDossier) await loadDossier(activeDossier);
  }

  // ── Grouped nodes by module ───────────────────────────────────────────────
  const nodesByModule = (nodes || []).reduce((acc, node) => {
    const mod = node?.module || 'unknown';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(node);
    return acc;
  }, {});


  // ── eCTD Export ───────────────────────────────────────────────────────────
  async function exportEctd() {
    if (!activeDossier) return;

    const uploadedNodes = nodes.filter(n => n.status !== 'missing');
    const total = nodes.length;
    const uploaded = uploadedNodes.length;

    if (uploaded === 0) {
      alert('No documents uploaded yet.\n\nPlease upload at least one PDF to a section before exporting.');
      return;
    }

    const confirmed = window.confirm(
      `Export eCTD Package\n\n` +
      `Dossier  : ${activeDossier.product_name} — ${activeDossier.country}\n` +
      `Authority: ${activeDossier.authority}\n` +
      `Uploaded : ${uploaded} of ${total} sections\n\n` +
      `${uploaded < total ? `⚠ ${total - uploaded} sections still missing — export will include available documents only.\n\n` : '✓ All sections uploaded — ready for submission.\n\n'}` +
      `Click OK to download the eCTD ZIP package.`
    );

    if (!confirmed) return;

    try {
      setExporting(true);

      const seqNum = activeSeq?.sequence_number || '0000';
      const res = await fetch(`/api/export?dossier_id=${activeDossier.id}&sequence=${seqNum}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const product = (activeDossier.product_name || 'product').replace(/\s+/g, '-').toLowerCase();
      const authority = (activeDossier.authority || 'auth').replace(/\s+/g, '-').toUpperCase();
      a.href = url;
      a.download = `${authority}-${product}-seq${seqNum}.zip`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  
  // ── eCTD v4.0 Export ──────────────────────────────────────────────────────
  async function exportEctdV4() {
    if (!activeDossier) return;
    const uploaded = nodes.filter(n => n.status !== 'missing' && n.operation !== 'unchanged').length;
    if (uploaded === 0) {
      alert('No documents uploaded for this sequence.\nUpload at least one PDF before exporting v4.0.');
      return;
    }
    const confirmed = window.confirm(
      `Export eCTD v4.0 Package\n\n` +
      `Dossier   : ${activeDossier.product_name} — ${activeDossier.country}\n` +
      `Authority : ${activeDossier.authority}\n` +
      `Sequence  : ${activeSeq?.sequence_number || '0000'}\n` +
      `Standard  : ICH eCTD v4.0 / M8 IG v1.6 (May 2024)\n` +
      `CV        : ICH CV Package v6 (Feb 2025)\n\n` +
      `⚠ Module 1 must be prepared per Regional M1 IG\n\n` +
      `OK to download v4.0 ZIP package.`
    );
    if (!confirmed) return;
    try {
      setExportingV4(true);
      const seqNum = activeSeq?.sequence_number || '0000';
      const res = await fetch(`/api/export-v4?dossier_id=${activeDossier.id}&sequence=${seqNum}`);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Export failed'); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const product = (activeDossier.product_name || 'product').replace(/\s+/g,'-').toLowerCase();
      const auth = (activeDossier.authority || 'auth').replace(/\s+/g,'-').toUpperCase();
      a.href = url; a.download = `${auth}-${product}-v4-seq${seqNum}.zip`; a.click();
      URL.revokeObjectURL(url);
    } catch(err) { alert('v4.0 Export failed: ' + err.message); }
    finally { setExportingV4(false); }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg,
      fontFamily: 'Segoe UI,sans-serif', overflow: 'hidden' }}>



      {view === 'projects' ? (
        // ── EXPLORER-STYLE PROJECTS VIEW ────────────────────────────────────
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── LEFT PANE: Project tree (like Explorer sidebar) ── */}
          <div style={{ width: 260, flexShrink: 0, background: '#FAFBFC', borderRight: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>Projects</span>
              <button onClick={() => { setModal('project'); setForm({}); }}
                style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 5,
                  padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                + New
              </button>
            </div>

            {/* Project list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 30, textAlign: 'center', color: T.muted, fontSize: 12 }}>Loading...</div>
              ) : projects.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: T.muted, fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                  No projects yet
                </div>
              ) : projects.map(p => (
                <div key={p.id}
                  onClick={() => loadProjectData(p)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    background: selectedProject?.id === p.id ? '#E3EDFA' : 'transparent',
                    borderLeft: selectedProject?.id === p.id ? `3px solid ${T.accent}` : '3px solid transparent',
                    borderBottom: '1px solid #F0F0F0',
                    transition: 'all .12s',
                  }}
                  onMouseOver={e => { if (selectedProject?.id !== p.id) e.currentTarget.style.background = '#F0F4FA'; }}
                  onMouseOut={e => { if (selectedProject?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📁</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>
                        {p.description || 'No description'}
                      </div>
                    </div>
                    {/* Delete */}
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm(`Delete "${p.name}"?`)) return;
                      await api(`/api/projects?type=projects&id=${p.id}`, 'DELETE');
                      setProjects(prev => prev.filter(x => x.id !== p.id));
                      if (selectedProject?.id === p.id) { setSelectedProject(null); setDossiers([]); }
                    }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC',
                        fontSize: 13, padding: '2px 4px', borderRadius: 3, flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color='#E53935'; }}
                      onMouseLeave={e => { e.currentTarget.style.color='#CCC'; }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANE: Contents of selected project ── */}
          <div style={{ flex: 1, overflow: 'auto', background: T.bg }}>

            {!selectedProject ? (
              // No project selected — welcome
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', flexDirection: 'column', gap: 12, color: T.muted }}>
                <div style={{ fontSize: 48 }}>📁</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Select a project</div>
                <div style={{ fontSize: 13 }}>Choose a project from the left panel, or create a new one</div>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                {/* Project header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>📁</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{selectedProject.name}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{selectedProject.description || ''} · Created {new Date(selectedProject.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Clients + Products row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  {/* Clients */}
                  <div style={{ background: T.white, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: T.text }}>👥 Clients</span>
                      <button onClick={() => { setModal('clients'); setForm({ project_id: selectedProject.id }); }}
                        style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 4,
                          padding: '3px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>
                    {clients.length === 0 ? (
                      <div style={{ padding: 16, color: T.muted, fontSize: 12, textAlign: 'center' }}>No clients</div>
                    ) : clients.map(c => (
                      <div key={c.id} style={{ padding: '8px 14px', borderBottom: '1px solid #F5F5F5', fontSize: 12 }}>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: T.muted }}>{c.email || c.contact || '—'}</div>
                      </div>
                    ))}
                  </div>
                  {/* Products */}
                  <div style={{ background: T.white, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: T.text }}>💊 Products</span>
                      <button onClick={() => { setModal('products'); setForm({ project_id: selectedProject.id }); }}
                        style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 4,
                          padding: '3px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>
                    {products.length === 0 ? (
                      <div style={{ padding: 16, color: T.muted, fontSize: 12, textAlign: 'center' }}>No products</div>
                    ) : products.map(p => (
                      <div key={p.id} style={{ padding: '8px 14px', borderBottom: '1px solid #F5F5F5', fontSize: 12 }}>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: T.muted }}>{[p.inn, p.dosage_form, p.strength, p.category].filter(Boolean).join(' · ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dossiers section */}
                <div style={{ background: T.white, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: T.text }}>📦 Dossiers</span>
                    <button onClick={() => { setModal('dossiers'); setForm({ project_id: selectedProject.id }); }}
                      style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 4,
                        padding: '3px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>+ New Dossier</button>
                  </div>
                  {/* Search */}
                  <div style={{ padding: '6px 10px', borderBottom: `1px solid #F0F0F0` }}>
                    <input placeholder="🔍 Search dossiers..." value={dossierSearch}
                      onChange={e => setDossierSearch(e.target.value.toLowerCase())}
                      style={{ width: '100%', padding: '5px 8px', border: `1px solid ${T.border}`,
                        borderRadius: 4, fontSize: 11, boxSizing: 'border-box', fontFamily: 'inherit' }}/>
                  </div>
                  {/* Dossier list as Explorer-style rows */}
                  {(() => {
                    const filtered = dossierSearch
                      ? dossiers.filter(d =>
                          (d.product_name||'').toLowerCase().includes(dossierSearch) ||
                          (d.country||'').toLowerCase().includes(dossierSearch) ||
                          (d.submission_type||'').toLowerCase().includes(dossierSearch))
                      : dossiers;
                    return filtered.length === 0 ? (
                      <div style={{ padding: 30, color: T.muted, fontSize: 13, textAlign: 'center' }}>
                        {dossierSearch ? `No dossiers match "${dossierSearch}"` : 'No dossiers yet'}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, padding: 14 }}>
                        {filtered.map(d => (
                          <div key={d.id} onClick={() => loadDossier(d)}
                            style={{ background: '#FAFBFC', borderRadius: 8, padding: 14,
                              border: `1px solid ${T.border}`, cursor: 'pointer',
                              transition: 'all .15s' }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = T.accent;
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = T.border;
                              e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <span style={{ fontSize: 24 }}>📦</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.text,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {d.product_name || 'Product'}</div>
                                <div style={{ fontSize: 10, color: T.muted }}>{d.country}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 10, color: T.muted, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ background: '#EBF0F9', color: T.accent, padding: '1px 6px',
                                borderRadius: 3, fontWeight: 600 }}>{d.authority}</span>
                              <span>{d.submission_type}</span>
                              <span>{d.dossier_format}</span>
                            </div>
                            <div style={{ marginTop: 8 }}><StatusBadge status={d.status}/></div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ── DOSSIER VIEW ───────────────────────────────────────────────────
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Dossier action bar */}
          <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>

            {/* Top row — back + dossier info + export */}
            <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => { setView('projects'); setActiveDossier(null); setNodes([]); setSequences([]); setActiveSeq(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.accent, fontSize: '13px', fontWeight: 500, padding: '4px 0' }}>
                ← Back
              </button>
              <div style={{ width: 1, height: 20, background: T.border }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>
                  {activeDossier?.product_name} — {activeDossier?.country}
                </span>
                <span style={{ fontSize: '12px', color: T.muted, marginLeft: '10px' }}>
                  {activeDossier?.authority} · {activeDossier?.submission_type} · {activeDossier?.dossier_format}
                </span>
              </div>
              <button onClick={exportEctd} disabled={exporting}
                style={{ background: exporting ? '#888' : T.accent, color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '7px 16px', fontSize: '13px', fontWeight: 600, cursor: exporting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px' }}>
                {exporting ? '⏳ Packaging...' : '⬇ v3.2.2'}
              </button>
            <button onClick={exportEctdV4} disabled={exportingV4}
              style={{ background: exportingV4 ? '#888' : '#1a6b3c', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                cursor: exportingV4 ? 'wait' : 'pointer' }}>
              {exportingV4 ? '⏳ Building...' : '⬇ v4.0 XML'}
            </button>
            <button onClick={() => setShowGapModal(true)}
              style={{ background: '#0891B2', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer' }}>
              📊 Gap Report
            </button>
            </div>

            {/* Sequence tabs row */}
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '4px',
              borderTop: `1px solid ${T.border}`, background: T.bg }}>
              <span style={{ fontSize: '11px', color: T.muted, marginRight: '4px', fontWeight: 600 }}>SEQUENCES:</span>
              {sequences.map(seq => (
                <button key={seq.id}
                  onClick={async () => { setActiveSeq(seq); await loadDossierNodes(activeDossier.id, seq.sequence_number); }}
                  style={{
                    padding: '5px 14px', border: 'none', cursor: 'pointer', fontSize: '12px',
                    fontWeight: activeSeq?.id === seq.id ? 700 : 400,
                    background: activeSeq?.id === seq.id ? T.accent : 'transparent',
                    color: activeSeq?.id === seq.id ? '#fff' : T.muted,
                    borderRadius: '4px 4px 0 0', transition: 'all .15s',
                  }}>
                  SEQ {seq.sequence_number}
                  <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.75 }}>
                    {seq.sequence_number === '0000' ? '(Initial)' : seq.label || ''}
                  {seq.sequence_number !== '0000' && (
                    <button onClick={e=>{e.stopPropagation();deleteSequence(seq.sequence_number);}}
                      style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',
                        color:'#EF4444',borderRadius:3,padding:'0 5px',fontSize:9,cursor:'pointer',marginLeft:4}}>✕</button>
                  )}
                  </span>
                </button>
              ))}
              <button onClick={() => { setSeqModal(true); setSeqForm({ relates_to: '0000', relationship_type: 'SUCC' }); }}
                style={{ padding: '5px 12px', border: `1px dashed ${T.accent}`, borderRadius: '4px',
                  background: 'transparent', color: T.accent, fontSize: '11px',
                  cursor: 'pointer', marginLeft: '4px', fontWeight: 600 }}>
                + New Sequence
              </button>
              {activeSeq && activeSeq.sequence_number !== '0000' && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: T.muted, fontStyle: 'italic' }}>
                  {activeSeq.description || 'Upload only changed/new documents for this sequence'}
                </span>
              )}
            </div>
          </div>

          {/* ── 3-PANEL LAYOUT: Tree | PDF Preview | Gap Report ── */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* ── PANEL 1: Lorenz docuBridge Folder Tree ── */}
            <div style={{ width: treeWidth, flexShrink: 0, overflow: 'auto', borderRight: `1px solid ${T.border}`,
              background: '#FAFBFC', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>

              {/* Header */}
              <div style={{ background: '#3D5A8A', color: '#fff', padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'sticky', top: 0, zIndex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>Current Outline</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, background: 'rgba(0,0,0,0.25)',
                  padding: '1px 8px', borderRadius: 2, fontWeight: 800 }}>
                  SEQ {(activeSeq?.sequence_number || '0000').padStart(4,'0')}
                </span>
              </div>

              {/* Progress bar */}
              {nodes.length > 0 && (() => {
                const uploaded = nodes.filter(n => n.status !== 'missing').length;
                const pct = Math.round((uploaded / nodes.length) * 100);
                return (
                  <div style={{ background: '#EEF1F7', borderBottom: '1px solid #D8DBE2',
                    padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ flex: 1, height: 4, background: '#D0D0D0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', height: '100%',
                        background: pct === 100 ? '#22C55E' : '#2B579A', transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                      color: pct === 100 ? '#22C55E' : '#2B579A', minWidth: 28 }}>{pct}%</span>
                    <span style={{ fontSize: 9, color: '#888' }}>{uploaded}/{nodes.length}</span>
                  </div>
                );
              })()}

              {/* Tree content */}
              <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading dossier...</div>
              ) : (() => {
                try {
                const CTD_MOD = {
                  '1':'Administrative Information','2':'CTD Summaries',
                  '3':'Quality','4':'Nonclinical Study Reports','5':'Clinical Study Reports',
                };
                const CTD_SEC = {
                  '3.2.S':'Drug Substance','3.2.P':'Drug Product','3.2.A':'Appendices','3.2.R':'Regional Information',
                  '3.2.S.1':'General Information','3.2.S.2':'Manufacture','3.2.S.3':'Characterisation',
                  '3.2.S.4':'Control of Drug Substance','3.2.S.5':'Reference Standards',
                  '3.2.S.6':'Container Closure System','3.2.S.7':'Stability',
                  '3.2.P.1':'Description & Composition','3.2.P.2':'Pharmaceutical Development',
                  '3.2.P.3':'Manufacture','3.2.P.4':'Control of Excipients','3.2.P.5':'Control of Drug Product',
                  '3.2.P.6':'Reference Standards','3.2.P.7':'Container Closure System','3.2.P.8':'Stability',
                };
                const SEC_LABELS = {
                  '2.3':'Quality Overall Summary','2.4':'Nonclinical Overview','2.5':'Clinical Overview',
                  '2.6':'Nonclinical Written Summaries','2.7':'Clinical Summary',
                  '4.2':'Study Reports','5.2':'Tabular Listing','5.3':'Clinical Study Reports',
                };

                /* ── Folder row ── */
                const FR = ({ label, depth, isOpen, onClick, count }) => (
                  <div onClick={onClick}
                    style={{ display:'flex', alignItems:'center', height:24, cursor:'pointer',
                      paddingLeft: depth * 18 + 6, fontSize: depth === 0 ? 12 : 11, color:'#1E1E1E' }}
                    onMouseOver={e => e.currentTarget.style.background='#E8F0FE'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    {depth > 0 && <span style={{ color:'#C0C0C0', fontSize:10, marginRight:2, fontFamily:'monospace' }}>├─</span>}
                    <span style={{ fontSize:14, marginRight:4 }}>{isOpen ? '📂' : '📁'}</span>
                    <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      fontWeight: depth <= 1 ? 600 : 400 }}>{label}</span>
                    {count != null && <span style={{ fontSize:9, color:'#888', marginLeft:4, marginRight:6 }}>{count}</span>}
                  </div>
                );

                /* ── Doc file row ── */
                const DR = ({ doc, node, depth }) => (
                  <div onClick={() => openPreview(doc, node)}
                    style={{ display:'flex', alignItems:'center', height:22, cursor:'pointer',
                      paddingLeft: (depth+1) * 18 + 6, fontSize:11, color:'#444',
                      background: previewDoc?.node?.id === node.id ? '#D0E4FF' : 'transparent' }}
                    onMouseOver={e => { if (previewDoc?.node?.id !== node.id) e.currentTarget.style.background='#F0F4FA'; }}
                    onMouseOut={e => { if (previewDoc?.node?.id !== node.id) e.currentTarget.style.background='transparent'; }}>
                    <span style={{ color:'#C0C0C0', fontSize:10, marginRight:2, fontFamily:'monospace' }}>└─</span>
                    <span style={{ fontSize:12, marginRight:4 }}>📄</span>
                    <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.filename}</span>
                    {doc.review_score != null && (
                      <span style={{ fontSize:9, padding:'1px 4px', borderRadius:2, marginLeft:4,
                        background: doc.review_score >= 80 ? '#DCFCE7' : doc.review_score >= 60 ? '#FEF3C7' : '#FEE2E2',
                        color: doc.review_score >= 80 ? '#166534' : doc.review_score >= 60 ? '#92400E' : '#991B1B',
                        fontWeight:700 }}>{doc.review_score}</span>
                    )}
                  </div>
                );

                /* ── Upload prompt ── */
                const UR = ({ node, depth }) => (
                  <label style={{ display:'flex', alignItems:'center', height:22, cursor:'pointer',
                    paddingLeft: (depth+1) * 18 + 6, fontSize:11, color:'#2B579A' }}
                    onMouseOver={e => e.currentTarget.style.background='#F0F4FA'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }}
                      onChange={e => { if (e.target.files[0]) { handleUpload(node, e.target.files[0]); e.target.value=''; } }}/>
                    <span style={{ color:'#C0C0C0', fontSize:10, marginRight:2, fontFamily:'monospace' }}>└─</span>
                    <span style={{ fontSize:11, marginRight:4 }}>➕</span>
                    <span>click to upload</span>
                  </label>
                );

                const modules = Object.keys(nodesByModule).sort();
                const getLabel = (sec) => CTD_SEC[sec] || SEC_LABELS[sec] || '';

                return (
                  <div>
                    {/* Root */}
                    <div style={{ display:'flex', alignItems:'center', height:26, paddingLeft:6,
                      fontSize:12, fontWeight:700, color:'#1A3D6B', background:'#E8EDF4',
                      borderBottom:'1px solid #D0D8E8' }}>
                      <span style={{ fontSize:14, marginRight:4 }}>📂</span>
                      {(activeSeq?.sequence_number || '0000').padStart(4,'0')} of {activeDossier?.product_name || 'Product'}
                    </div>

                    {modules.map(mod => {
                      const mk = 'mod-' + mod;
                      const mn = nodesByModule[mod] || [];
                      const mo = expandedModules[mk] !== false;
                      const mu = mn.filter(n => n.status !== 'missing').length;

                      const getTop = (s) => {
                        const p = (s||'').split('.');
                        if (p.length <= 2) return s;
                        if (mod.includes('3')) return p.slice(0,3).join('.');
                        return p.slice(0,2).join('.');
                      };
                      const tops = [...new Set(mn.map(n => getTop(n.section)))].sort((a,b) => {
                        const k = s => (s||'').split('.').map(x => isNaN(x)?x:x.padStart(4,'0')).join('.');
                        return k(a).localeCompare(k(b));
                      });

                      return (
                        <div key={mod}>
                          <FR label={`${mod} ${CTD_MOD[mod]||''}`} depth={0} isOpen={mo}
                            onClick={() => setExpandedModules(p => ({...p,[mk]:!mo}))}
                            count={`${mu}/${mn.length}`}/>

                          {mo && tops.map(ts => {
                            const gn = mn.filter(n => getTop(n.section) === ts);
                            const isGrp = gn.length > 1 || gn[0]?.section !== ts;
                            const gk = 'grp-' + ts;
                            const go = expandedModules[gk] !== false;

                            if (isGrp) {
                              const gu = gn.filter(n => n.status !== 'missing').length;
                              return (
                                <div key={ts}>
                                  <FR label={`${ts} — ${getLabel(ts)||ts}`} depth={1} isOpen={go}
                                    onClick={() => setExpandedModules(p => ({...p,[gk]:!go}))}
                                    count={`${gu}/${gn.length}`}/>
                                  {go && gn.map(node => {
                                    const nk = 'node-' + node.id;
                                    const no = expandedModules[nk] || false;
                                    const docs = node.documents || [];
                                    const nl = getLabel(node.section)
                                      ? `${node.section} — ${getLabel(node.section)}`
                                      : node.title ? `${node.section} — ${node.title}` : node.section;
                                    return (
                                      <div key={node.id}>
                                        <FR label={nl} depth={2} isOpen={no}
                                          onClick={() => {
                                            setExpandedModules(p => ({...p,[nk]:!no}));
                                            if (!no) {
                                              if (docs.length > 0) openPreview(docs[0], node);
                                              else setPreviewDoc({ node, url:null, filename:null, noDoc:true });
                                            }
                                          }}/>
                                        {no && (docs.length > 0
                                          ? docs.map(d => <DR key={d.id} doc={d} node={node} depth={2}/>)
                                          : <UR node={node} depth={2}/>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            } else {
                              const node = gn[0];
                              const nk = 'node-' + node.id;
                              const no = expandedModules[nk] || false;
                              const docs = node.documents || [];
                              const nl = getLabel(node.section)
                                ? `${node.section} — ${getLabel(node.section)}`
                                : node.title ? `${node.section} — ${node.title}` : node.section;
                              return (
                                <div key={ts}>
                                  <FR label={nl} depth={1} isOpen={no}
                                    onClick={() => {
                                      setExpandedModules(p => ({...p,[nk]:!no}));
                                      if (!no) {
                                        if (docs.length > 0) openPreview(docs[0], node);
                                        else setPreviewDoc({ node, url:null, filename:null, noDoc:true });
                                      }
                                    }}/>
                                  {no && (docs.length > 0
                                    ? docs.map(d => <DR key={d.id} doc={d} node={node} depth={1}/>)
                                    : <UR node={node} depth={1}/>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
                } catch(treeErr) {
                  console.error('Tree render error:', treeErr);
                  return (
                    <div style={{ padding:30, textAlign:'center', color:'#C50F1F' }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>⚠️</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>Tree rendering error</div>
                      <div style={{ fontSize:11, color:'#5D5D5D', marginTop:4 }}>{String(treeErr?.message || treeErr)}</div>
                    </div>
                  );
                }
              })()}
              </div>
            </div>

            {/* Drag handle — between tree and preview */}
            <div
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startW = treeWidth;
                const onMove = mv => setTreeWidth(Math.max(180, Math.min(600, startW + mv.clientX - startX)));
                const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              style={{ width: 5, flexShrink: 0, cursor: 'col-resize', background: 'transparent',
                borderRight: '1px solid #D1D5DB', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, width: 5, height: 40,
                transform: 'translateY(-50%)', background: '#CBD5E1', borderRadius: 2,
                opacity: 0.6 }}/>
            </div>

            {/* ── PANEL 2: PDF Preview (full remaining space) ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#E8E8E8', overflow: 'hidden' }}>

              {/* Preview toolbar */}
              <div style={{ background: T.accent, padding: '6px 14px', display: 'flex',
                alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, flex: 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {previewDoc ? previewDoc.filename : 'Select a document to preview'}
                </span>
                {previewDoc?.url && (
                  <a href={previewDoc.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
                      padding: '2px 8px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px' }}>
                    ↗ Open
                  </a>
                )}
                {/* Node actions inline */}
                {previewDoc?.node && (
                  <>
                    <label style={{ cursor: 'pointer' }}>
                      <input type="file" accept=".pdf,.docx,.doc" style={{ display: 'none' }}
                        onChange={async e => {
                          if (e.target.files[0]) {
                            await handleUpload(previewDoc.node, e.target.files[0]);
                            await loadDossierNodes(activeDossier?.id, activeSeq?.sequence_number || '0000');
                          }
                        }} />
                      <span style={{ fontSize: '11px', color: '#fff', padding: '3px 10px',
                        background: 'rgba(255,255,255,0.2)', borderRadius: 4, cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.3)' }}>
                        {uploadingNode === previewDoc.node.id ? '⟳...' : '↑ Upload'}
                      </span>
                    </label>
                    {previewDoc.node.documents?.[0]?.review_status === 'done' && (
                      <button onClick={() => { setReviewDoc(previewDoc.node.documents[0]); setModal('review'); }}
                        style={{ fontSize: '11px', color: '#fff', padding: '3px 10px',
                          background: 'rgba(255,255,255,0.2)', borderRadius: 4, cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.3)' }}>
                        📊 Review
                      </button>
                    )}
                    {previewDoc.node.documents?.[0] && (
                      <button onClick={async () => {
                        if (!window.confirm('Delete this document?')) return;
                        await deleteDoc(previewDoc.node.documents[0].id);
                        setPreviewDoc(null);
                      }}
                        style={{ fontSize: '11px', color: '#FCA5A5', padding: '3px 10px',
                          background: 'rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer',
                          border: '1px solid rgba(252,165,165,0.3)' }}>
                        🗑
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Preview area — takes full space */}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px' }}>
                {!previewDoc ? (
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Select a document to preview</div>
                    <div style={{ fontSize: '13px', lineHeight: 1.6 }}>Click any folder in the tree, then click an uploaded document to preview it here</div>
                  </div>
                ) : previewLoading ? (
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div style={{ fontSize: '13px' }}>Loading preview...</div>
                  </div>
                ) : previewDoc.noDoc ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      {previewDoc.node?.title || 'Document'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: 20, lineHeight: 1.6 }}>
                      Section {previewDoc.node?.section}<br/>No document uploaded yet
                    </div>
                    <label style={{ cursor: 'pointer' }}>
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.files[0]) handleUpload(previewDoc.node, e.target.files[0]);
                          e.target.value = '';
                        }}/>
                      <span style={{ padding: '12px 32px', background: '#1A3D6B', color: '#fff',
                        borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        display: 'inline-block' }}>
                        ↑ Upload Document
                      </span>
                    </label>
                  </div>
                ) : previewDoc.error ? (
                  <div style={{ textAlign: 'center', color: '#EF4444', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                    <div style={{ fontSize: '13px' }}>{previewDoc.error}</div>
                  </div>
                ) : previewDoc.url ? (
                  <iframe
                    src={previewDoc.url + '#toolbar=1&navpanes=0&scrollbar=1&view=FitH'}
                    style={{ width: '100%', height: '100%', border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', background: '#fff',
                      minHeight: '700px' }}
                    title={previewDoc.filename}
                  />
                ) : null}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Gap Report Modal */}
      {showGapModal && gapReport && (
        <Modal title="📊 Dossier Gap Report" onClose={() => setShowGapModal(false)} width={520}>
          <GapReportPanel report={gapReport} dossier={activeDossier} />
        </Modal>
      )}
      {modal === 'project' && (
        <Modal title="New Project" onClose={() => setModal(null)}>
          <Field label="Project Name"><Input value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Q1 2026 ASEAN Submissions" /></Field>
          <Field label="Description"><Input value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Optional description" /></Field>
          <Btn onClick={createItem} style={{ width: '100%', justifyContent: 'center' }}>Create Project</Btn>
        </Modal>
      )}

      {modal === 'clients' && (
        <Modal title="Add Client" onClose={() => setModal(null)}>
          <Field label="Company / Client Name"><Input value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. ABC Pharma" /></Field>
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

      {/* ── New Sequence Modal — relates-to aware ── */}
      {seqModal && (() => {
        const nextNum = sequences.length > 0
          ? String(parseInt(sequences[sequences.length-1].sequence_number) + 1).padStart(4,'0')
          : '0001';
        const relSeq = sequences.find(s => s.sequence_number === seqForm.relates_to);
        const RELATIONSHIP_TYPES = [
          { code:'SUCC', label:'SUCC — Successor',    desc:'This sequence succeeds / continues the referenced sequence' },
          { code:'RPLC', label:'RPLC — Replaces',     desc:'This sequence fully replaces the referenced sequence (e.g. complete resubmission)' },
        ];
        const SEQ_LABELS = [
          { value:'Response to Query (RTQ)',  desc:'Authority raised queries; you are responding' },
          { value:'Amendment',               desc:'Voluntary change to submitted information' },
          { value:'Supplemental Submission', desc:'New data submitted post-approval' },
          { value:'Post-Approval Change',    desc:'Change to approved product/process' },
          { value:'Safety Update',           desc:'New safety data or label safety update' },
          { value:'Labelling Update',        desc:'Label / Package Insert change only' },
          { value:'CMC Update',              desc:'Module 3 chemistry / manufacturing change' },
          { value:'Stability Update',        desc:'Updated stability data' },
          { value:'Annual Report',           desc:'Annual periodic update' },
        ];
        return (
        <Modal title={`Create Sequence ${nextNum}`} onClose={() => { setSeqModal(false); setSeqForm({}); }}>

          {/* Concept explainer */}
          <div style={{ padding:'10px 12px', background:'#F0F9FF', borderRadius:7,
            border:'1px solid #BAE6FD', marginBottom:16, fontSize:12, color:'#0369A1', lineHeight:1.6 }}>
            <strong>eCTD Sequence Relationships (ICH M8)</strong><br/>
            Each new sequence must declare which prior sequence it <em>relates to</em>.
            This populates the <code>relatesTo</code> element in the eCTD backbone XML and tells the
            authority's reviewer which prior version to compare against.
          </div>

          {/* STEP 1 — Relates-to sequence */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:700, color:'#1A3D6B',
              letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
              Step 1 — Relates to which prior sequence?
            </label>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {sequences.map(s => {
                const selected = seqForm.relates_to === s.sequence_number;
                return (
                  <div key={s.sequence_number}
                    onClick={() => setSeqForm(f => ({ ...f, relates_to: s.sequence_number }))}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                      borderRadius:7, cursor:'pointer',
                      border:`2px solid ${selected?'#1A3D6B':'#E5E7EB'}`,
                      background: selected?'#EEF4FF':'#FAFAFA',
                      transition:'all .12s' }}>
                    {/* SEQ badge */}
                    <div style={{ background:selected?'#1A3D6B':'#6B7280', color:'#fff',
                      borderRadius:4, padding:'3px 10px', fontFamily:'monospace',
                      fontSize:13, fontWeight:800, flexShrink:0 }}>
                      SEQ {s.sequence_number}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600,
                        color:selected?'#1A3D6B':'#374151' }}>
                        {s.sequence_number === '0000' ? 'Initial Submission' : s.label}
                      </div>
                      {s.description && (
                        <div style={{ fontSize:10, color:'#6B7280', marginTop:1,
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {s.description}
                        </div>
                      )}
                      <div style={{ fontSize:9, color:'#9CA3AF', marginTop:2 }}>
                        {s.sequence_number === '0000'
                          ? 'Original / first submission — SEQ 0000'
                          : `Sequence ${s.sequence_number}${s.relates_to ? ` → relates to SEQ ${s.relates_to}` : ''}`}
                      </div>
                    </div>
                    {selected && (
                      <span style={{ color:'#1A3D6B', fontSize:16, flexShrink:0 }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
            {!seqForm.relates_to && (
              <div style={{ fontSize:11, color:'#EF4444', marginTop:6 }}>
                ⚠ Select a prior sequence to relate this submission to.
              </div>
            )}
          </div>

          {/* STEP 2 — Relationship type */}
          {seqForm.relates_to && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'#1A3D6B',
                letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                Step 2 — Relationship type (eCTD typeCode)
              </label>
              <div style={{ display:'flex', gap:8 }}>
                {RELATIONSHIP_TYPES.map(rt => {
                  const sel = (seqForm.relationship_type||'SUCC') === rt.code;
                  return (
                    <div key={rt.code}
                      onClick={() => setSeqForm(f=>({ ...f, relationship_type:rt.code }))}
                      style={{ flex:1, padding:'10px 12px', borderRadius:7, cursor:'pointer',
                        border:`2px solid ${sel?'#1A3D6B':'#E5E7EB'}`,
                        background:sel?'#EEF4FF':'#FAFAFA' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:sel?'#1A3D6B':'#374151', marginBottom:3 }}>
                        {rt.code}
                      </div>
                      <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.4 }}>{rt.desc}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:8, padding:'7px 10px', background:'#F8FAFD',
                borderRadius:5, border:'1px solid #E5E7EB', fontSize:11, color:'#4B5563', fontFamily:'monospace' }}>
                {`<relatesTo typeCode="${seqForm.relationship_type||'SUCC'}">
  <sequenceNumber value="${parseInt(seqForm.relates_to)||0}"/>
</relatesTo>`}
              </div>
            </div>
          )}

          {/* STEP 3 — Submission type */}
          {seqForm.relates_to && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'#1A3D6B',
                letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                Step 3 — Submission type
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {SEQ_LABELS.map(sl => {
                  const sel = seqForm.label === sl.value;
                  return (
                    <div key={sl.value}
                      onClick={() => setSeqForm(f=>({ ...f, label:sl.value }))}
                      style={{ padding:'8px 10px', borderRadius:6, cursor:'pointer',
                        border:`2px solid ${sel?'#1A3D6B':'#E5E7EB'}`,
                        background:sel?'#EEF4FF':'#FAFAFA' }}>
                      <div style={{ fontSize:11, fontWeight:600, color:sel?'#1A3D6B':'#374151' }}>{sl.value}</div>
                      <div style={{ fontSize:9, color:'#6B7280', marginTop:2, lineHeight:1.3 }}>{sl.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Description */}
          {seqForm.relates_to && seqForm.label && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'#1A3D6B',
                letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                Step 4 — Description (optional but recommended)
              </label>
              <textarea value={seqForm.description||''}
                onChange={e => setSeqForm(f=>({ ...f, description:e.target.value }))}
                placeholder={`e.g. ${seqForm.label} — Response to ${relSeq?.label||'SEQ '+seqForm.relates_to} queries on Module 3 stability (3.2.P.8.3)`}
                rows={2}
                style={{ width:'100%', padding:'9px 10px', border:'1px solid #D1D5DB',
                  borderRadius:6, fontSize:12, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}
              />
            </div>
          )}

          {/* Summary / carry-forward info */}
          {seqForm.relates_to && (
            <div style={{ padding:'10px 12px', background:'#F0FFF4', borderRadius:7,
              border:'1px solid #A7F3D0', fontSize:12, color:'#065F46', marginBottom:16, lineHeight:1.7 }}>
              ✓ All {nodes.length} sections from SEQ {seqForm.relates_to} carried forward as <strong>unchanged</strong><br/>
              ✓ Set individual nodes to <strong>Replace / New / Delete / Append</strong> as needed<br/>
              ✓ eCTD XML will include <code>relatesTo typeCode="{seqForm.relationship_type||'SUCC'}"</code> → SEQ {seqForm.relates_to}
            </div>
          )}

          <button onClick={createSequence}
            disabled={!seqForm.relates_to || !seqForm.label}
            style={{ width:'100%', padding:'11px',
              background: (!seqForm.relates_to||!seqForm.label)?'#9CA3AF':'#1A3D6B',
              color:'#fff', border:'none', borderRadius:7, fontSize:14, fontWeight:600,
              cursor: (!seqForm.relates_to||!seqForm.label)?'not-allowed':'pointer' }}>
            {seqForm.relates_to && seqForm.label
              ? `Create SEQ ${nextNum} — ${seqForm.label} (relates to SEQ ${seqForm.relates_to})`
              : `Complete Steps 1–3 above to create SEQ ${nextNum}`}
          </button>
        </Modal>
        );
      })()}

      {modal === 'review' && reviewDoc && (
        <Modal title="AI Review Report" onClose={() => { setModal(null); setReviewDoc(null); }} width={640}>
          <ReviewPanel doc={reviewDoc} />
        </Modal>
      )}
    </div>
  );
}

// ── DossierNodeRow — docuBridge-style leaf node with upload ─────────────────────
function DossierNodeRow({ node, latestDoc, isSelected, isLast, depth, seqBadge,
  LINE, isNewSeq, onSelect, onUpload, uploading, onOperationChange, ctdLabel }) {

  const hasDoc = !!latestDoc;
  const indentPx = depth * 16;

  // Operation badge colour
  const opColors = {
    replace:   { bg: '#FEF3C7', color: '#92400E', text: '↺ Replace' },
    new:       { bg: '#DCFCE7', color: '#166534', text: '+ New' },
    delete:    { bg: '#FEE2E2', color: '#991B1B', text: '✕ Delete' },
    append:    { bg: '#DCFCE7', color: '#166534', text: '+ Append' },
    unchanged: { bg: '#F3F4F6', color: '#9CA3AF', text: '= Unchanged' },
  };
  const opStyle = opColors[node.operation] || opColors.unchanged;

  // Status dot colour
  const dotColor = {
    missing:   '#D1D5DB',
    uploaded:  '#3B82F6',
    reviewed:  '#22C55E',
    issues:    '#EF4444',
    unchanged: '#9CA3AF',
  }[node.status] || '#D1D5DB';

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', height: 26,
        cursor: 'pointer',
        background: isSelected ? '#D0E4FF' : 'transparent',
        borderLeft: isSelected ? '3px solid #2B579A' : '3px solid transparent',
      }}
      onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#EEF4FF'; }}
      onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>

      {/* Tree lines */}
      <div style={{ width: indentPx + 20, flexShrink: 0, display: 'flex', alignItems: 'stretch', height: '100%' }}>
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 1, background: LINE, height: '100%' }}/>
          </div>
        ))}
        <div style={{ width: 20, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: '50%', width: 1, background: LINE }}/>
          {!isLast && <div style={{ position: 'absolute', left: 0, top: '50%', bottom: 0, width: 1, background: LINE }}/>}
          <div style={{ position: 'absolute', left: 0, top: '50%', width: 12, height: 1, background: LINE }}/>
        </div>
      </div>

      {/* Document icon — orange if uploaded, grey if not */}
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0, margin: '0 4px' }}>
        <rect x="1" y="0.5" width="10" height="13" rx="1.5"
          fill={hasDoc ? '#FFF4E6' : '#FAFAFA'}
          stroke={hasDoc ? '#E07800' : '#C0CADC'} strokeWidth={hasDoc ? '1.2' : '0.9'}/>
        <line x1="3" y1="4" x2="9" y2="4" stroke={hasDoc ? '#E07800' : '#D0D8E8'} strokeWidth="0.9"/>
        <line x1="3" y1="6.5" x2="9" y2="6.5" stroke={hasDoc ? '#E07800' : '#D0D8E8'} strokeWidth="0.9"/>
        <line x1="3" y1="9" x2="7" y2="9" stroke={hasDoc ? '#E07800' : '#D0D8E8'} strokeWidth="0.9"/>
      </svg>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Sequence badge */}
        {hasDoc && (
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#2B579A',
            background: '#EEF3FB', border: '1px solid #BFD3EF', borderRadius: 2,
            padding: '0 4px', flexShrink: 0, lineHeight: '16px', whiteSpace: 'nowrap' }}>
            [{seqBadge}]
          </span>
        )}
        {/* Filename or section title */}
        <span style={{
          fontSize: 11, flex: 1, minWidth: 0,
          color: isSelected ? '#1A3D6B' : hasDoc ? '#1F2937' : '#6B7280',
          fontWeight: hasDoc ? 500 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>
          {ctdLabel || (node.title ? `${node.section} — ${node.title}` : node.section)}
        </span>
      </div>

      {/* Operation selector for new sequences */}
      {isNewSeq && node.operation && node.operation !== 'new' && (
        <select
          value={node.operation}
          onChange={e => { e.stopPropagation(); onOperationChange(e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={{ fontSize: 9, padding: '1px 2px', border: '1px solid #D1D5DB',
            borderRadius: 2, cursor: 'pointer', marginRight: 3, flexShrink: 0,
            background: opStyle.bg, color: opStyle.color, maxWidth: 80 }}>
          <option value="unchanged">= Unchanged</option>
          <option value="replace">↺ Replace</option>
          <option value="new">+ New</option>
          <option value="delete">✕ Delete</option>
          <option value="append">+ Append</option>
        </select>
      )}

      {/* Status dot */}
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, margin: '0 4px' }}
        title={node.status}/>

      {/* Upload button */}
      <label style={{ cursor: 'pointer', flexShrink: 0, marginRight: 4 }}
        onClick={e => e.stopPropagation()}>
        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = ''; } }}/>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 2, lineHeight: '16px', display: 'inline-block',
          background: uploading ? '#F3F4F6' : hasDoc ? '#DCFCE7' : '#EEF3FB',
          border: `1px solid ${uploading ? '#D1D5DB' : hasDoc ? '#86EFAC' : '#BFD3EF'}`,
          color: uploading ? '#9CA3AF' : hasDoc ? '#166534' : '#2B579A',
          fontWeight: 600,
        }}>
          {uploading ? '⟳' : hasDoc ? '✓' : '↑'}
        </span>
      </label>
    </div>
  );
}

// ── Node Row Component ─────────────────────────────────────────────────────────
function NodeRow({ node, uploading, isNewSequence, onUpload, onOperationChange, onViewReview, onDelete }) {
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

        {/* Operation badge for non-initial sequences */}
        {node.operation && node.operation !== 'new' && (
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px',
            letterSpacing: '0.05em', flexShrink: 0,
            background: node.operation === 'replace' ? '#FEF3C7' :
                        node.operation === 'delete'  ? '#FEE2E2' :
                        node.operation === 'unchanged' ? '#F3F4F6' : '#DCFCE7',
            color: node.operation === 'replace' ? '#92400E' :
                   node.operation === 'delete'  ? '#991B1B' :
                   node.operation === 'unchanged' ? '#9CA3AF' : '#166534',
          }}>
            {node.operation === 'unchanged' ? '=' : node.operation.toUpperCase()}
          </span>
        )}
        {/* Status */}
        <StatusBadge status={uploading ? 'reviewing' : node.status} />

        {/* Score if reviewed */}
        {latestDoc?.review_score && <ScoreBadge score={latestDoc.review_score} />}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Operation selector for non-initial sequences */}
          {isNewSequence && (
            <select value={node.operation || 'unchanged'}
              onChange={e => onOperationChange && onOperationChange(node.id, e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ fontSize: '10px', padding: '2px 4px', border: '1px solid #D1D5DB',
                borderRadius: '3px', cursor: 'pointer',
                background: node.operation === 'replace' ? '#FEF3C7' :
                            node.operation === 'delete'  ? '#FEE2E2' :
                            node.operation === 'new'     ? '#DCFCE7' : '#F3F4F6' }}>
              <option value="unchanged">= Unchanged</option>
              <option value="replace">↺ Replace</option>
              <option value="new">+ New</option>
              <option value="delete">✕ Delete</option>
              <option value="append">+ Append</option>
            </select>
          )}
          {/* Upload button — hide for unchanged nodes in a new sequence */}
          {(!isNewSequence || node.operation !== 'unchanged') && (
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".pdf,.docx,.doc,.xlsx,.xls" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: uploading ? T.bg : T.accent + '18', color: T.accent,
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                {uploading ? '⟳ Reviewing...' : '↑ Upload'}
              </span>
            </label>
          )}

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
