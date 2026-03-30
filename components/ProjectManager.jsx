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
  const [seqForm, setSeqForm] = useState({});
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
    // Load sequences first
    const seqs = await loadSequences(dossier.id);
    const latestSeq = seqs.length > 0 ? seqs[seqs.length - 1].sequence_number : '0000';
    // Load nodes for latest sequence
    const { data, gap_report } = await api(`/api/dossiers?dossier_id=${dossier.id}&sequence=${latestSeq}`);
    setNodes(data || []);
    setGapReport(gap_report);
    const modules = [...new Set((data || []).map(n => n.module))];
    if (modules[0]) setExpandedModules({ [modules[0]]: true });
    setLoading(false);
  }



  // ── PDF Preview ────────────────────────────────────────────────────────────
  async function openPreview(doc, node) {
    if (!doc) return;
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
      status: 'draft',
    });

    if (data) {
      // Clone all nodes from previous sequence with operation = 'unchanged'
      await api('/api/sequences/clone', 'POST', {
        dossier_id: activeDossier.id,
        from_sequence: lastSeq,
        to_sequence: nextNum,
      });

      setSeqModal(false);
      setSeqForm({});
      await loadSequences(activeDossier.id);
      await loadDossierNodes(activeDossier.id, nextNum);
    }
  }

  async function loadDossierNodes(dossierId, seqNum) {
    setLoading(true);
    const { data, gap_report } = await api(
      `/api/dossiers?dossier_id=${dossierId}&sequence=${seqNum || '0000'}`
    );
    setNodes(data || []);
    setGapReport(gap_report);
    const modules = [...new Set((data || []).map(n => n.module))];
    if (modules[0]) setExpandedModules({ [modules[0]]: true });
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
                <Btn size="sm" onClick={() => { setModal(selectedProject ? 'dossiers' : 'project'); setForm({}); }}>
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
                    <div key={p.id}
                      style={{ background: T.white, borderRadius: '10px', padding: '20px',
                        border: `1px solid ${T.border}`, transition: 'all .18s', position: 'relative' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = T.accent}
                      onMouseOut={e => e.currentTarget.style.borderColor = T.border}>
                      {/* Delete button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
                          await api(`/api/projects?type=projects&id=${p.id}`, 'DELETE');
                          setProjects(prev => prev.filter(x => x.id !== p.id));
                        }}
                        style={{ position: 'absolute', top: '10px', right: '10px',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#CCC', fontSize: '16px', padding: '2px 6px', borderRadius: '4px',
                          lineHeight: 1 }}
                        onMouseEnter={e => { e.currentTarget.style.color='#E53935'; e.currentTarget.style.background='#FFF0F0'; }}
                        onMouseLeave={e => { e.currentTarget.style.color='#CCC'; e.currentTarget.style.background='transparent'; }}
                        title="Delete project">
                        ✕
                      </button>
                      {/* Card content — click to open */}
                      <div onClick={() => loadProjectData(p)} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '28px', marginBottom: '10px' }}>📁</div>
                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: T.muted }}>{p.description || 'No description'}</div>
                        <div style={{ marginTop: '12px', fontSize: '11px', color: T.dim }}>
                          Created {new Date(p.created_at).toLocaleDateString()}
                        </div>
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
                  </span>
                </button>
              ))}
              <button onClick={() => { setSeqModal(true); setSeqForm({}); }}
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
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 300px', overflow: 'hidden' }}>

            {/* ── PANEL 1: Module tree ── */}
            <div style={{ overflow: 'auto', borderRight: `1px solid ${T.border}`, background: T.bg }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: T.muted }}>Loading...</div>
              ) : Object.entries(nodesByModule).map(([module, moduleNodes]) => (
                <div key={module}>
                  <div onClick={() => setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }))}
                    style={{ padding: '9px 14px', background: T.accent + '18', borderBottom: `1px solid ${T.border}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', position: 'sticky', top: 0,
                      borderLeft: `3px solid ${T.accent}` }}>
                    <span style={{ fontSize: '10px', color: T.accent }}>{expandedModules[module] ? '▼' : '▶'}</span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: T.accent }}>{module}</span>
                    <span style={{ fontSize: '10px', color: T.muted, marginLeft: 'auto' }}>
                      {moduleNodes.filter(n => n.status !== 'missing').length}/{moduleNodes.length}
                    </span>
                  </div>

                  {expandedModules[module] && moduleNodes.map(node => {
                    const latestDoc = node.documents?.[0];
                    const isSelected = previewDoc?.node?.id === node.id;
                    return (
                      <div key={node.id}
                        onClick={() => latestDoc && openPreview(latestDoc, node)}
                        style={{
                          padding: '7px 14px 7px 10px',
                          borderBottom: `1px solid ${T.bg}`,
                          background: isSelected ? T.accent + '15' : T.white,
                          borderLeft: isSelected ? `3px solid ${T.accent}` : '3px solid transparent',
                          cursor: latestDoc ? 'pointer' : 'default',
                          transition: 'all .12s',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = T.accentSoft; }}
                        onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = T.white; }}>
                        {/* File icon */}
                        <span style={{ fontSize: '13px', flexShrink: 0 }}>
                          {latestDoc ? '📄' : '📋'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', color: T.text, fontWeight: isSelected ? 600 : 400,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {node.section} {node.title}
                          </div>
                          {latestDoc && (
                            <div style={{ fontSize: '10px', color: T.muted, marginTop: '1px',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {latestDoc.filename}
                            </div>
                          )}
                        </div>
                        {/* Status dot */}
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                          background: node.status === 'missing'   ? '#D1D5DB' :
                                      node.status === 'uploaded'  ? '#3B82F6' :
                                      node.status === 'reviewed'  ? '#22C55E' :
                                      node.status === 'issues'    ? '#EF4444' :
                                      node.status === 'unchanged' ? '#9CA3AF' : '#D1D5DB',
                        }} title={node.status} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── PANEL 2: PDF Preview ── */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#E8E8E8', overflow: 'hidden',
              borderRight: `1px solid ${T.border}` }}>

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
              </div>

              {/* Preview area */}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px' }}>
                {!previewDoc ? (
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>No document selected</div>
                    <div style={{ fontSize: '12px' }}>Click any uploaded document in the tree to preview</div>
                  </div>
                ) : previewLoading ? (
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div style={{ fontSize: '13px' }}>Loading preview...</div>
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
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', background: '#fff',
                      minHeight: '600px' }}
                    title={previewDoc.filename}
                  />
                ) : null}
              </div>
            </div>

            {/* ── PANEL 3: Node actions + Gap report ── */}
            <div style={{ overflow: 'auto', background: T.white, display: 'flex', flexDirection: 'column' }}>

              {/* Node actions — shown when a node is selected */}
              {previewDoc?.node && (() => {
                const node = previewDoc.node;
                const latestDoc = node.documents?.[0];
                return (
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: T.accent,
                      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {node.section} — {node.title}
                    </div>

                    {/* Upload button */}
                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      <input type="file" accept=".pdf,.docx,.doc" style={{ display: 'none' }}
                        onChange={async e => {
                          if (e.target.files[0]) {
                            await handleUpload(node, e.target.files[0]);
                            // Refresh nodes and reopen preview
                            await loadDossierNodes(activeDossier.id, activeSeq?.sequence_number || '0000');
                          }
                        }} />
                      <span style={{ display: 'block', textAlign: 'center', padding: '8px',
                        background: T.accent, color: '#fff', borderRadius: '6px',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        {uploadingNode === node.id ? '⟳ Uploading...' : '↑ Upload Document'}
                      </span>
                    </label>

                    {/* Review report button */}
                    {latestDoc?.review_status === 'done' && (
                      <button onClick={() => { setReviewDoc(latestDoc); setModal('review'); }}
                        style={{ width: '100%', padding: '7px', background: '#F0F9FF',
                          color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: '6px',
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '6px' }}>
                        📊 View AI Review Report
                      </button>
                    )}

                    {/* Delete document */}
                    {latestDoc && (
                      <button onClick={async () => {
                        if (!window.confirm('Delete this document?')) return;
                        await deleteDoc(latestDoc.id);
                        setPreviewDoc(null);
                      }}
                        style={{ width: '100%', padding: '7px', background: '#FFF0F0',
                          color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px',
                          fontSize: '12px', cursor: 'pointer' }}>
                        🗑 Delete Document
                      </button>
                    )}

                    {/* Operation selector for sequences */}
                    {activeSeq && activeSeq.sequence_number !== '0000' && (
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 600, color: T.muted,
                          textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                          Operation
                        </label>
                        <select value={node.operation || 'unchanged'}
                          onChange={async e => {
                            await api('/api/dossiers/operation', 'POST', { node_id: node.id, operation: e.target.value });
                            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, operation: e.target.value } : n));
                            setPreviewDoc(prev => ({ ...prev, node: { ...node, operation: e.target.value } }));
                          }}
                          style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB',
                            borderRadius: '5px', fontSize: '12px', background: '#fff' }}>
                          <option value="unchanged">= Unchanged</option>
                          <option value="replace">↺ Replace</option>
                          <option value="new">+ New</option>
                          <option value="delete">✕ Delete</option>
                          <option value="append">+ Append</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Gap report */}
              <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                {gapReport && <GapReportPanel report={gapReport} dossier={activeDossier} />}
              </div>
            </div>

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

      {/* ── New Sequence Modal ── */}
      {seqModal && (
        <Modal title="Create New Sequence" onClose={() => setSeqModal(false)}>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#FFF8E1',
            borderRadius: '8px', border: '1px solid #FFE082', fontSize: '13px', color: '#5D4037' }}>
            <strong>What is a new sequence?</strong><br/>
            A new sequence is created when the regulatory authority sends queries on your submitted dossier.
            You upload only the changed or new documents — unchanged documents carry forward automatically.
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280',
              letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Sequence Label
            </label>
            <select
              value={seqForm.label || ''}
              onChange={e => setSeqForm(f => ({ ...f, label: e.target.value }))}
              style={{ width: '100%', padding: '9px 10px', border: '1px solid #D1D5DB',
                borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
              <option value="">— Select type —</option>
              <option value="Response to Query (RTQ)">Response to Query (RTQ)</option>
              <option value="Amendment">Amendment</option>
              <option value="Supplemental Submission">Supplemental Submission</option>
              <option value="Post-Approval Change">Post-Approval Change</option>
              <option value="Safety Update">Safety Update</option>
              <option value="Labelling Update">Labelling Update</option>
              <option value="CMC Update">CMC Update (Module 3)</option>
              <option value="Stability Update">Stability Update</option>
              <option value="Annual Report">Annual Report</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280',
              letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Description (optional)
            </label>
            <textarea
              value={seqForm.description || ''}
              onChange={e => setSeqForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Response to FDA queries on Module 3 stability data — replacing 3.2.P.8.3"
              rows={3}
              style={{ width: '100%', padding: '9px 10px', border: '1px solid #D1D5DB',
                borderRadius: '6px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ padding: '10px', background: '#F0F9FF', borderRadius: '6px',
            fontSize: '12px', color: '#0369A1', marginBottom: '16px' }}>
            ✓ All {nodes.length} sections will be carried forward as "unchanged"<br/>
            ✓ You only upload documents that have changed<br/>
            ✓ Export will include only the changed documents + updated index.xml
          </div>
          <button onClick={createSequence}
            style={{ width: '100%', padding: '11px', background: '#1A3D6B', color: '#fff',
              border: 'none', borderRadius: '7px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Create Sequence {sequences.length > 0
              ? String(parseInt(sequences[sequences.length-1].sequence_number) + 1).padStart(4,'0')
              : '0001'}
          </button>
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
