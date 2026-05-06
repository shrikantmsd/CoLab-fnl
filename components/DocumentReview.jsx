'use client';
import { useState, useEffect, useCallback } from 'react';

const T = {
  navy:'#1A3D6B', accent:'#2B579A', white:'#FFFFFF', bg:'#F5F6F8',
  text:'#1E1E1E', muted:'#6B7280', dim:'#9CA3AF', border:'#E0E0E0',
  red:'#C50F1F', green:'#0E8A3E', teal:'#0891B2',
};

/* ── Company Master Data fields ── */
const CMD_FIELDS = [
  { key:'company_name', label:'Registered Company Name', type:'text', placeholder:'e.g. ABC Pharma Pvt. Ltd.' },
  { key:'ho_address', label:'Head Office Address', type:'textarea', placeholder:'Registered office address...' },
  { key:'mfg_address', label:'Manufacturing Site Address', type:'textarea', placeholder:'Manufacturing site address...' },
  { key:'rd_address', label:'R&D Centre Address', type:'textarea', placeholder:'R&D centre address...' },
  { key:'mfg_licence', label:'Manufacturing Licence No.', type:'text', placeholder:'e.g. MFG/MH/2024/001234' },
  { key:'sop_of_sops', label:'SOP of SOPs (Master SOP Reference)', type:'textarea', placeholder:'Describe the master document defining how the company writes SOPs...' },
  { key:'batch_numbering', label:'Batch Numbering Convention', type:'text', placeholder:'e.g. YY-PRODCODE-NNN or MMYY/PROD/BATCH' },
  { key:'doc_numbering', label:'Document Numbering / Coding System', type:'text', placeholder:'e.g. QA-SOP-001, PROD-MFR-001' },
  { key:'qms_framework', label:'QMS Framework', type:'select', options:['ICH Q10','In-house','Hybrid','ISO 9001','Other'] },
  { key:'approver_matrix', label:'Approver Matrix', type:'textarea', placeholder:'Who signs MFR, BMR, COA, stability protocols...' },
  { key:'smf_reference', label:'Site Master File Reference', type:'text', placeholder:'SMF document ID or version...' },
  { key:'api_vendors', label:'Approved API Vendors & DMF Numbers', type:'textarea', placeholder:'Vendor 1 — DMF-XXXXX\nVendor 2 — DMF-YYYYY' },
  { key:'report_templates', label:'Standard Report Templates (PVP, PVR, PDR, AMV)', type:'textarea', placeholder:'Describe internally used formats...' },
];

/* ── StatusBadge ── */
function StatusBadge({ status }) {
  const cfg = {
    queued:   { bg:'#FEF3C7', color:'#92400E', label:'Queued' },
    reviewing:{ bg:'#DBEAFE', color:'#1E40AF', label:'Reviewing...' },
    reviewed: { bg:'#DCFCE7', color:'#166534', label:'Reviewed' },
    issues:   { bg:'#FEE2E2', color:'#991B1B', label:'Issues Found' },
    missing:  { bg:'#F3F4F6', color:'#6B7280', label:'Not Uploaded' },
    draft:    { bg:'#F3F4F6', color:'#6B7280', label:'Draft' },
  };
  const c = cfg[status] || cfg.missing;
  return <span style={{ fontSize:9, padding:'2px 7px', borderRadius:3, fontWeight:700,
    background:c.bg, color:c.color }}>{c.label}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DocumentReview({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [activeDossier, setActiveDossier] = useState(null);

  // Company Master Data (per client, stored in localStorage)
  const [companyData, setCompanyData] = useState({});
  const [editingClient, setEditingClient] = useState(null);
  const [cmdForm, setCmdForm] = useState({});

  // Review queue
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  // View mode: 'browse' | 'company' | 'review'
  const [viewMode, setViewMode] = useState('browse');

  // Sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const api = useCallback(async (path) => {
    try {
      const res = await fetch(path);
      return await res.json();
    } catch(e) { console.error('API error:', e); return {}; }
  }, []);

  // Load projects on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api('/api/projects?user_id=user_default&type=projects');
      setProjects(data || []);
      // Load saved company data
      try {
        const saved = JSON.parse(localStorage.getItem('raisa_company_data') || '{}');
        setCompanyData(saved);
      } catch {}
      // Load review queue
      try {
        const saved = JSON.parse(localStorage.getItem('raisa_review_queue') || '[]');
        setReviewQueue(saved);
      } catch {}
      setLoading(false);
    })();
  }, [api]);

  // Load project contents
  async function loadProject(project) {
    setSelectedProject(project);
    setActiveDossier(null);
    setNodes([]);
    setSelectedDoc(null);
    setViewMode('browse');
    const [cRes, pRes, dRes] = await Promise.all([
      api(`/api/projects?project_id=${project.id}&type=clients`),
      api(`/api/projects?project_id=${project.id}&type=products`),
      api(`/api/projects?project_id=${project.id}&type=dossiers`),
    ]);
    setClients(cRes.data || []);
    setProducts(pRes.data || []);
    setDossiers(dRes.data || []);
  }

  // Load dossier nodes
  async function loadDossierNodes(dossier) {
    setActiveDossier(dossier);
    setSelectedDoc(null);
    const result = await api(`/api/dossiers?dossier_id=${dossier.id}&sequence=0000`);
    const nodeData = (result?.data || []).map(n => ({
      ...n,
      documents: Array.isArray(n.documents) ? n.documents : [],
    }));
    setNodes(nodeData);
  }

  // Add document to review queue
  function addToQueue(doc, node, dossier) {
    const entry = {
      id: doc.id,
      filename: doc.filename,
      section: node?.section || '',
      title: node?.title || '',
      dossier_id: dossier?.id,
      product_name: dossier?.product_name || '',
      country: dossier?.country || '',
      status: 'queued',
      added_at: new Date().toISOString(),
    };
    setReviewQueue(prev => {
      const next = prev.filter(q => q.id !== doc.id);
      next.push(entry);
      try { localStorage.setItem('raisa_review_queue', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Remove from queue
  function removeFromQueue(docId) {
    setReviewQueue(prev => {
      const next = prev.filter(q => q.id !== docId);
      try { localStorage.setItem('raisa_review_queue', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Save company data
  function saveCompanyData(clientId, data) {
    setCompanyData(prev => {
      const next = { ...prev, [clientId]: data };
      try { localStorage.setItem('raisa_company_data', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Run AI review (stub for now)
  async function runReview(queueItem) {
    setReviewing(true);
    setViewMode('review');
    setSelectedDoc(queueItem);

    // Find company data for context
    const clientData = Object.values(companyData)[0] || {};

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content:
            `You are a regulatory affairs document reviewer. Review this document for ICH CTD compliance.

Document: ${queueItem.filename}
Section: ${queueItem.section} — ${queueItem.title}
Product: ${queueItem.product_name}
Market: ${queueItem.country}

Company context (for SOP compliance check):
${clientData.company_name ? `Company: ${clientData.company_name}` : 'Company: Not provided'}
${clientData.batch_numbering ? `Batch numbering: ${clientData.batch_numbering}` : ''}
${clientData.doc_numbering ? `Doc numbering: ${clientData.doc_numbering}` : ''}
${clientData.qms_framework ? `QMS: ${clientData.qms_framework}` : ''}

Provide your review as JSON with this structure:
{
  "ich_score": number (0-100),
  "sop_score": number (0-100),
  "critical_issues": number,
  "major_issues": number,
  "minor_issues": number,
  "ich_findings": ["finding1", "finding2"],
  "sop_findings": ["finding1", "finding2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "brief summary"
}

Return ONLY the JSON, no markdown, no backticks.` }],
          max_tokens: 2000,
          system: 'You are a pharmaceutical regulatory affairs expert. Return only valid JSON.',
        }),
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text || data?.text || '';
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        setReviewResult(parsed);
        // Update queue status
        setReviewQueue(prev => {
          const next = prev.map(q => q.id === queueItem.id ? { ...q, status: 'reviewed' } : q);
          try { localStorage.setItem('raisa_review_queue', JSON.stringify(next)); } catch {}
          return next;
        });
      } catch {
        setReviewResult({
          ich_score: 0, sop_score: 0, critical_issues: 0, major_issues: 0, minor_issues: 0,
          ich_findings: ['AI review returned non-JSON response. Please ensure ANTHROPIC_API_KEY is set in Vercel.'],
          sop_findings: [], recommendations: [],
          summary: text || 'Review failed — check API key configuration.',
        });
      }
    } catch(err) {
      setReviewResult({
        ich_score: 0, sop_score: 0, critical_issues: 0, major_issues: 0, minor_issues: 0,
        ich_findings: [`Error: ${err.message}`],
        sop_findings: [], recommendations: [],
        summary: 'Review request failed.',
      });
    }
    setReviewing(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', fontFamily:"'Segoe UI', Tahoma, sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ background:T.navy, display:'flex', alignItems:'center', padding:'0 16px',
        height:44, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff', padding:'5px 14px', borderRadius:5, fontSize:12, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit', marginRight:16 }}>
          ← Back
        </button>
        <span style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:2 }}>RAISA</span>
        <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginLeft:6 }}>by CoLAB</span>
        <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)', marginLeft:16 }}>
          │ Document Review & Gap Analysis
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', padding:'4px 10px',
            background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
            Queue: {reviewQueue.length} docs · Reviewed: {reviewQueue.filter(q => q.status === 'reviewed').length}
          </span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ══════════ LEFT SIDEBAR ══════════ */}
        <div style={{ width:sidebarWidth, flexShrink:0, background:'#FAFBFC',
          borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* ── Review Queue ── */}
          <div style={{ borderBottom:`1px solid ${T.border}` }}>
            <div style={{ padding:'8px 12px', background:'#2B579A', color:'#fff',
              fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
              <span>📋</span> Review Queue
              <span style={{ marginLeft:'auto', fontSize:9, background:'rgba(255,255,255,0.2)',
                padding:'1px 6px', borderRadius:3 }}>{reviewQueue.length}</span>
            </div>
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {reviewQueue.length === 0 ? (
                <div style={{ padding:'12px', color:T.muted, fontSize:10, textAlign:'center' }}>
                  No documents in queue.<br/>Browse projects below to add documents.
                </div>
              ) : reviewQueue.map(q => (
                <div key={q.id}
                  onClick={() => { setSelectedDoc(q); setViewMode('review'); setReviewResult(null); }}
                  style={{ padding:'6px 12px', borderBottom:'1px solid #F0F0F0', cursor:'pointer',
                    background: selectedDoc?.id === q.id ? '#DBEAFE' : 'transparent',
                    display:'flex', alignItems:'center', gap:6 }}
                  onMouseOver={e => { if(selectedDoc?.id !== q.id) e.currentTarget.style.background='#F0F4FA'; }}
                  onMouseOut={e => { if(selectedDoc?.id !== q.id) e.currentTarget.style.background='transparent'; }}>
                  <span style={{ fontSize:11 }}>📄</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {q.section} — {q.title || q.filename}
                    </div>
                    <div style={{ fontSize:9, color:T.muted }}>{q.product_name} · {q.country}</div>
                  </div>
                  <StatusBadge status={q.status}/>
                  <button onClick={e => { e.stopPropagation(); removeFromQueue(q.id); }}
                    style={{ background:'none', border:'none', color:'#CCC', fontSize:10, cursor:'pointer', padding:2 }}
                    onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color='#CCC'}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Projects Tree ── */}
          <div style={{ flex:1, overflow:'auto' }}>
            <div style={{ padding:'8px 12px', background:'#E8EDF4', color:T.navy,
              fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6,
              position:'sticky', top:0, zIndex:1 }}>
              <span>📁</span> Projects & Dossiers
            </div>
            {loading ? (
              <div style={{ padding:20, textAlign:'center', color:T.muted, fontSize:11 }}>Loading...</div>
            ) : projects.length === 0 ? (
              <div style={{ padding:20, textAlign:'center', color:T.muted, fontSize:11 }}>
                No projects. Create projects in Project Manager first.
              </div>
            ) : projects.map(p => {
              const isOpen = selectedProject?.id === p.id;
              return (
                <div key={p.id}>
                  <div onClick={() => isOpen ? setSelectedProject(null) : loadProject(p)}
                    style={{ padding:'6px 12px', cursor:'pointer', fontSize:11,
                      display:'flex', alignItems:'center', gap:6,
                      background: isOpen ? '#E3EDFA' : 'transparent',
                      borderLeft: isOpen ? `3px solid ${T.accent}` : '3px solid transparent' }}
                    onMouseOver={e => { if(!isOpen) e.currentTarget.style.background='#F0F4FA'; }}
                    onMouseOut={e => { if(!isOpen) e.currentTarget.style.background='transparent'; }}>
                    <span style={{ fontSize:12 }}>{isOpen ? '📂' : '📁'}</span>
                    <span style={{ fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.name}
                    </span>
                  </div>

                  {isOpen && dossiers.map(d => {
                    const isDossierOpen = activeDossier?.id === d.id;
                    return (
                      <div key={d.id}>
                        <div onClick={() => isDossierOpen ? setActiveDossier(null) : loadDossierNodes(d)}
                          style={{ padding:'5px 12px 5px 28px', cursor:'pointer', fontSize:10,
                            display:'flex', alignItems:'center', gap:6,
                            background: isDossierOpen ? '#DBEAFE' : 'transparent' }}
                          onMouseOver={e => { if(!isDossierOpen) e.currentTarget.style.background='#F0F4FA'; }}
                          onMouseOut={e => { if(!isDossierOpen) e.currentTarget.style.background='transparent'; }}>
                          <span>📦</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {d.product_name} — {d.country}
                            </div>
                            <div style={{ fontSize:9, color:T.muted }}>{d.authority} · {d.submission_type}</div>
                          </div>
                        </div>

                        {isDossierOpen && nodes.filter(n => (n.documents || []).length > 0).map(n => {
                          const doc = n.documents[0];
                          return (
                            <div key={n.id}
                              onClick={() => { setSelectedDoc({ ...doc, section: n.section, title: n.title,
                                product_name: d.product_name, country: d.country, dossier_id: d.id });
                                setViewMode('review'); setReviewResult(null); }}
                              style={{ padding:'4px 12px 4px 44px', cursor:'pointer', fontSize:10,
                                display:'flex', alignItems:'center', gap:4,
                                background: selectedDoc?.id === doc.id ? '#DBEAFE' : 'transparent' }}
                              onMouseOver={e => { if(selectedDoc?.id !== doc.id) e.currentTarget.style.background='#F0F4FA'; }}
                              onMouseOut={e => { if(selectedDoc?.id !== doc.id) e.currentTarget.style.background='transparent'; }}>
                              <span style={{ fontSize:10 }}>📄</span>
                              <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {n.section} — {n.title || doc.filename}
                              </span>
                              <button onClick={e => { e.stopPropagation(); addToQueue(doc, n, d); }}
                                style={{ background:'#EEF3FB', border:`1px solid #BFD3EF`, borderRadius:3,
                                  padding:'1px 6px', fontSize:9, color:T.accent, cursor:'pointer', fontWeight:600, flexShrink:0 }}>
                                + Queue
                              </button>
                            </div>
                          );
                        })}

                        {isDossierOpen && nodes.filter(n => (n.documents || []).length > 0).length === 0 && (
                          <div style={{ padding:'8px 44px', fontSize:9, color:T.muted, fontStyle:'italic' }}>
                            No uploaded documents in this dossier
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Company Setup ── */}
          <div style={{ borderTop:`1px solid ${T.border}` }}>
            <div style={{ padding:'8px 12px', background:'#F0F4F8', color:T.navy,
              fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
              <span>🏢</span> Company Master Data
            </div>
            {clients.length === 0 ? (
              <div style={{ padding:'8px 12px', color:T.muted, fontSize:10 }}>
                Select a project above to see clients
              </div>
            ) : clients.map(c => (
              <div key={c.id}
                onClick={() => {
                  setEditingClient(c);
                  setCmdForm(companyData[c.id] || { company_name: c.name });
                  setViewMode('company');
                }}
                style={{ padding:'6px 12px', cursor:'pointer', fontSize:10,
                  display:'flex', alignItems:'center', gap:6,
                  background: editingClient?.id === c.id && viewMode === 'company' ? '#DBEAFE' : 'transparent' }}
                onMouseOver={e => e.currentTarget.style.background='#F0F4FA'}
                onMouseOut={e => e.currentTarget.style.background =
                  (editingClient?.id === c.id && viewMode === 'company') ? '#DBEAFE' : 'transparent'}>
                <span>🏢</span>
                <span style={{ flex:1, fontWeight:500 }}>{c.name}</span>
                <span style={{ fontSize:9, color: companyData[c.id] ? T.green : T.muted }}>
                  {companyData[c.id] ? '✓ Setup' : 'Edit'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Drag handle ── */}
        <div onMouseDown={e => {
          e.preventDefault();
          const sx = e.clientX, sw = sidebarWidth;
          const mm = mv => setSidebarWidth(Math.max(220, Math.min(450, sw + mv.clientX - sx)));
          const mu = () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
          window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
        }}
        style={{ width:5, flexShrink:0, cursor:'col-resize', background:'#E5E7EB', position:'relative' }}>
          <div style={{ position:'absolute', top:'50%', left:0, width:5, height:40,
            transform:'translateY(-50%)', background:'#9CA3AF', borderRadius:2, opacity:0.5 }}/>
        </div>

        {/* ══════════ MAIN AREA ══════════ */}
        <div style={{ flex:1, overflow:'auto', background:T.bg }}>

          {/* ── BROWSE MODE (empty state) ── */}
          {viewMode === 'browse' && !selectedDoc && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              height:'100%', flexDirection:'column', gap:16, color:T.muted }}>
              <div style={{ fontSize:64 }}>📋</div>
              <div style={{ fontSize:20, fontWeight:700, color:T.text }}>Document Review & Gap Analysis</div>
              <div style={{ fontSize:14, maxWidth:500, textAlign:'center', lineHeight:1.7 }}>
                Browse projects in the sidebar to find uploaded documents. Add them to the Review Queue,
                then run AI-powered gap analysis against ICH guidelines and your company SOPs.
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:'16px 20px', textAlign:'center', width:160 }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>🔍</div>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text }}>Layer 1</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:4 }}>ICH / Regulatory Compliance</div>
                </div>
                <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:'16px 20px', textAlign:'center', width:160 }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>🏢</div>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text }}>Layer 2</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:4 }}>Company SOP Compliance</div>
                </div>
              </div>
            </div>
          )}

          {/* ── COMPANY MASTER DATA MODE ── */}
          {viewMode === 'company' && editingClient && (
            <div style={{ maxWidth:720, margin:'0 auto', padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <span style={{ fontSize:32 }}>🏢</span>
                <div>
                  <div style={{ fontSize:18, fontWeight:700, color:T.text }}>Company Master Data</div>
                  <div style={{ fontSize:12, color:T.muted }}>{editingClient.name} — Setup company reference information for Layer 2 gap analysis</div>
                </div>
              </div>

              <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
                padding:20 }}>
                {CMD_FIELDS.map(f => (
                  <div key={f.key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:10, fontWeight:700, color:T.muted,
                      textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>
                      {f.label}
                    </label>
                    {f.type === 'select' ? (
                      <select value={cmdForm[f.key] || ''}
                        onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`,
                          borderRadius:5, fontSize:12, fontFamily:'inherit', background:'#fff' }}>
                        <option value="">Select...</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={cmdForm[f.key] || ''} placeholder={f.placeholder}
                        onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                        rows={3}
                        style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`,
                          borderRadius:5, fontSize:12, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}/>
                    ) : (
                      <input value={cmdForm[f.key] || ''} placeholder={f.placeholder}
                        onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`,
                          borderRadius:5, fontSize:12, fontFamily:'inherit', boxSizing:'border-box' }}/>
                    )}
                  </div>
                ))}

                <button onClick={() => {
                  saveCompanyData(editingClient.id, cmdForm);
                  setViewMode('browse');
                }}
                style={{ padding:'10px 24px', background:T.navy, color:'#fff', border:'none',
                  borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  💾 Save Company Data
                </button>
                <button onClick={() => setViewMode('browse')}
                  style={{ padding:'10px 24px', background:T.white, color:T.text,
                    border:`1px solid ${T.border}`, borderRadius:6, fontSize:13,
                    cursor:'pointer', fontFamily:'inherit', marginLeft:8 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── REVIEW MODE ── */}
          {viewMode === 'review' && selectedDoc && (
            <div style={{ padding:20, maxWidth:900, margin:'0 auto' }}>

              {/* Document header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <span style={{ fontSize:28 }}>📄</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:T.text }}>
                    {selectedDoc.section} — {selectedDoc.title || selectedDoc.filename}
                  </div>
                  <div style={{ fontSize:12, color:T.muted }}>
                    {selectedDoc.product_name} · {selectedDoc.country} · {selectedDoc.filename}
                  </div>
                </div>
                <button onClick={() => runReview(selectedDoc)} disabled={reviewing}
                  style={{ padding:'10px 20px', background: reviewing ? '#9CA3AF' : T.navy,
                    color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600,
                    cursor: reviewing ? 'wait' : 'pointer', fontFamily:'inherit' }}>
                  {reviewing ? '⏳ Reviewing...' : '🔍 Run AI Review'}
                </button>
              </div>

              {/* Review Results */}
              {reviewing && (
                <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
                  padding:40, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text }}>Running dual-layer gap analysis...</div>
                  <div style={{ fontSize:12, color:T.muted, marginTop:8, lineHeight:1.6 }}>
                    Layer 1: Checking ICH / regulatory compliance<br/>
                    Layer 2: Cross-referencing against company SOPs and master data
                  </div>
                </div>
              )}

              {!reviewing && reviewResult && (
                <div>
                  {/* Score cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                    {[
                      { label:'ICH Score', value:`${reviewResult.ich_score}/100`,
                        color: reviewResult.ich_score >= 80 ? T.green : reviewResult.ich_score >= 60 ? '#D97706' : T.red },
                      { label:'SOP Score', value:`${reviewResult.sop_score}/100`,
                        color: reviewResult.sop_score >= 80 ? T.green : reviewResult.sop_score >= 60 ? '#D97706' : T.red },
                      { label:'Critical', value: reviewResult.critical_issues, color: reviewResult.critical_issues > 0 ? T.red : T.green },
                      { label:'Major', value: reviewResult.major_issues, color: reviewResult.major_issues > 0 ? '#D97706' : T.green },
                      { label:'Minor', value: reviewResult.minor_issues, color: T.muted },
                    ].map(c => (
                      <div key={c.label} style={{ background:T.white, borderRadius:8, border:`1px solid ${T.border}`,
                        padding:'12px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:T.muted, textTransform:'uppercase',
                          letterSpacing:'0.06em', marginBottom:4 }}>{c.label}</div>
                        <div style={{ fontSize:22, fontWeight:800, color:c.color }}>{c.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {reviewResult.summary && (
                    <div style={{ background:'#F0F4F8', borderRadius:8, padding:'12px 16px',
                      fontSize:12, lineHeight:1.7, color:T.text, marginBottom:16,
                      border:`1px solid ${T.border}` }}>
                      <strong>Summary:</strong> {reviewResult.summary}
                    </div>
                  )}

                  {/* Findings */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {/* ICH Findings */}
                    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
                      <div style={{ padding:'10px 14px', background:'#EEF3FB', borderBottom:`1px solid ${T.border}`,
                        fontSize:12, fontWeight:700, color:T.accent }}>
                        🔍 Layer 1 — ICH / Regulatory Findings
                      </div>
                      <div style={{ padding:14 }}>
                        {(reviewResult.ich_findings || []).length === 0 ? (
                          <div style={{ color:T.green, fontSize:12 }}>✓ No ICH compliance issues found</div>
                        ) : reviewResult.ich_findings.map((f, i) => (
                          <div key={i} style={{ fontSize:11, color:T.text, padding:'6px 0',
                            borderBottom: i < reviewResult.ich_findings.length-1 ? '1px solid #F0F0F0' : 'none',
                            lineHeight:1.6 }}>
                            <span style={{ color:T.red, fontWeight:700, marginRight:6 }}>●</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SOP Findings */}
                    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`, overflow:'hidden' }}>
                      <div style={{ padding:'10px 14px', background:'#FEF3C7', borderBottom:`1px solid ${T.border}`,
                        fontSize:12, fontWeight:700, color:'#92400E' }}>
                        🏢 Layer 2 — Company SOP Findings
                      </div>
                      <div style={{ padding:14 }}>
                        {(reviewResult.sop_findings || []).length === 0 ? (
                          <div style={{ color:T.green, fontSize:12 }}>✓ No SOP compliance issues found</div>
                        ) : reviewResult.sop_findings.map((f, i) => (
                          <div key={i} style={{ fontSize:11, color:T.text, padding:'6px 0',
                            borderBottom: i < reviewResult.sop_findings.length-1 ? '1px solid #F0F0F0' : 'none',
                            lineHeight:1.6 }}>
                            <span style={{ color:'#D97706', fontWeight:700, marginRight:6 }}>●</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {(reviewResult.recommendations || []).length > 0 && (
                    <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
                      overflow:'hidden', marginTop:16 }}>
                      <div style={{ padding:'10px 14px', background:'#DCFCE7', borderBottom:`1px solid ${T.border}`,
                        fontSize:12, fontWeight:700, color:T.green }}>
                        💡 Recommendations
                      </div>
                      <div style={{ padding:14 }}>
                        {reviewResult.recommendations.map((r, i) => (
                          <div key={i} style={{ fontSize:11, color:T.text, padding:'6px 0',
                            borderBottom: i < reviewResult.recommendations.length-1 ? '1px solid #F0F0F0' : 'none',
                            lineHeight:1.6 }}>
                            <span style={{ color:T.green, fontWeight:700, marginRight:6 }}>→</span>{r}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!reviewing && !reviewResult && (
                <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
                  padding:40, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:8 }}>Ready for Review</div>
                  <div style={{ fontSize:12, color:T.muted, lineHeight:1.7, maxWidth:400, margin:'0 auto' }}>
                    Click "Run AI Review" above to perform dual-layer gap analysis on this document
                    against ICH guidelines and your company SOPs.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
