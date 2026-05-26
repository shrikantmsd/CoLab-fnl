'use client';
import { useState, useEffect, useCallback } from 'react';

const T = {
  navy:'#1A3D6B', accent:'#2B579A', white:'#FFFFFF', bg:'#F5F6F8',
  text:'#1E1E1E', muted:'#6B7280', dim:'#9CA3AF', border:'#E0E0E0',
  red:'#C50F1F', green:'#0E8A3E', teal:'#0891B2',
};

/* ── Company Master Data — Sections & Fields ── */
const CMD_SECTIONS = [
  { id:'identity', title:'A. Company Identity', icon:'🏢', fields:[
    { key:'company_name', label:'Registered Legal Name', type:'text', placeholder:'e.g. ABC Pharma Pvt. Ltd.' },
    { key:'cin', label:'Registration No. (CIN / LLPIN)', type:'text', placeholder:'e.g. U24230MH2020PTC123456' },
    { key:'date_of_incorporation', label:'Date of Incorporation', type:'text', placeholder:'e.g. 15-Mar-2020' },
    { key:'entity_type', label:'Type of Entity', type:'select', options:['Pvt. Ltd.','Public Ltd.','LLP','Partnership','Proprietorship','Other'] },
    { key:'pan', label:'PAN', type:'text', placeholder:'e.g. AABCA1234Z' },
    { key:'gst', label:'GST Number', type:'text', placeholder:'e.g. 27AABCA1234Z1ZP' },
    { key:'duns', label:'DUNS Number (for US filings)', type:'text', placeholder:'e.g. 12-345-6789' },
  ]},
  { id:'addresses', title:'B. Addresses', icon:'📍', fields:[
    { key:'ho_address', label:'Registered / Head Office', type:'textarea', placeholder:'Full address with PIN code...' },
    { key:'mfg_site_1', label:'Manufacturing Site 1', type:'textarea', placeholder:'Site name, address, GPS coordinates...' },
    { key:'mfg_site_2', label:'Manufacturing Site 2 (if any)', type:'textarea', placeholder:'Additional manufacturing site...' },
    { key:'rd_lab', label:'R&D / QC Laboratory', type:'textarea', placeholder:'R&D and QC lab address...' },
    { key:'warehouse', label:'Warehouse / Distribution Centre', type:'textarea', placeholder:'Warehouse address (if separate)...' },
    { key:'corporate_office', label:'Corporate Office (if different)', type:'textarea', placeholder:'Corporate office address...' },
  ]},
  { id:'licences', title:'C. Licences & Permits', icon:'📜', fields:[
    { key:'mfg_licence', label:'Manufacturing Licence (Form 25/28)', type:'text', placeholder:'e.g. MFG/MH/2024/001234' },
    { key:'drug_licence', label:'Drug Licence (Form 20-B / 21-B)', type:'text', placeholder:'e.g. DL/MH/2024/005678' },
    { key:'who_gmp', label:'WHO-GMP Certificate No. & Validity', type:'text', placeholder:'e.g. WHO-GMP/2024/1234 valid till 31-Dec-2026' },
    { key:'eu_gmp', label:'EU GMP / US FDA Establishment', type:'text', placeholder:'EU MIA number or US FEI number...' },
    { key:'copp', label:'COPP Certificate Details', type:'text', placeholder:'COPP ref, issuing CDSCO office, validity...' },
    { key:'state_fda', label:'State FDA Approvals', type:'text', placeholder:'State licence details...' },
    { key:'controlled_substance', label:'Controlled Substance Licence (if any)', type:'text', placeholder:'Narcotic/psychotropic licence...' },
    { key:'pollution_noc', label:'Pollution Control Board NOC', type:'text', placeholder:'PCB consent order number...' },
  ]},
  { id:'personnel', title:'D. Key Personnel', icon:'👤', fields:[
    { key:'md_ceo', label:'Managing Director / CEO', type:'text', placeholder:'Name, qualification' },
    { key:'head_qa', label:'Head of Quality Assurance', type:'text', placeholder:'Name, qualification, experience' },
    { key:'head_production', label:'Head of Production', type:'text', placeholder:'Name, qualification' },
    { key:'head_qc', label:'Head of Quality Control', type:'text', placeholder:'Name, qualification' },
    { key:'qualified_person', label:'Qualified Person (EU) / Authorized Signatory', type:'text', placeholder:'Name, licence number' },
    { key:'head_ra', label:'Head of Regulatory Affairs', type:'text', placeholder:'Name, qualification' },
    { key:'qppv', label:'QPPV / Pharmacovigilance Contact', type:'text', placeholder:'Name, email, phone' },
    { key:'head_engineering', label:'Head of Engineering / Maintenance', type:'text', placeholder:'Name, qualification' },
  ]},
  { id:'site', title:'E. Site Details', icon:'🏭', fields:[
    { key:'total_area', label:'Total Area (sq ft / sq m)', type:'text', placeholder:'e.g. 50,000 sq ft / 4,645 sq m' },
    { key:'production_capacity', label:'Production Capacity', type:'textarea', placeholder:'Tablets: 10M/day\nCapsules: 5M/day\nLiquids: 20,000 L/day' },
    { key:'cleanroom_class', label:'Clean Room Classifications', type:'text', placeholder:'e.g. Class C (manufacturing), Class A/B (aseptic)' },
    { key:'hvac_system', label:'HVAC System Type', type:'text', placeholder:'e.g. AHU with HEPA, differential pressure cascade' },
    { key:'water_system', label:'Water System', type:'select', options:['Purified Water (PW)','Water for Injection (WFI)','Both PW & WFI','RO + EDI','Other'] },
    { key:'equipment_list', label:'Key Manufacturing Equipment', type:'textarea', placeholder:'Fluid Bed Dryer (FBD) — Retsch\nCompression — Cadmach\nCoating — GANSONS...' },
  ]},
  { id:'quality', title:'F. Quality Certifications & Regulatory History', icon:'✅', fields:[
    { key:'certifications', label:'Quality Certifications', type:'textarea', placeholder:'ISO 9001:2015 — valid till...\nISO 14001:2015 — valid till...\nOHSAS 18001...' },
    { key:'schedule_m', label:'Schedule M Compliance', type:'select', options:['Fully Compliant (Revised Schedule M Jan 2026)','Partially Compliant','Under Implementation','Not Applicable'] },
    { key:'inspection_history', label:'Regulatory Inspection History', type:'textarea', placeholder:'US FDA inspection: MM/YYYY — outcome\nWHO pre-qualification: MM/YYYY — outcome\n483 observations (if any)...' },
    { key:'registered_products', label:'Products Already Registered (count by market)', type:'textarea', placeholder:'India: 45 products\nUS: 3 ANDAs approved\nEU: 2 MAs\nAfrica: 12 registrations' },
    { key:'recall_history', label:'Recall History', type:'textarea', placeholder:'None / List any previous recalls with dates and reasons...' },
  ]},
  { id:'sop', title:'G. SOP of SOPs (Master SOP)', icon:'📋', fields:[
    { key:'sop_doc_number', label:'SOP of SOPs Document Number', type:'text', placeholder:'e.g. QA-SOP-001' },
    { key:'sop_version', label:'Current Version & Effective Date', type:'text', placeholder:'e.g. Version 05, Effective 01-Jan-2025' },
    { key:'sop_template', label:'SOP Document Structure / Template', type:'textarea',
      placeholder:'Header: Company Logo | Doc No. | Title | Effective Date | Version | Page X of Y | Dept | Supersedes\nFooter: Prepared By | Reviewed By | Approved By (Name, Designation, Signature, Date)\nBody: 1. Purpose | 2. Scope | 3. Responsibility | 4. Definitions | 5. Procedure | 6. References | 7. Annexures | 8. Revision History' },
    { key:'doc_numbering', label:'Document Numbering Convention', type:'textarea',
      placeholder:'Format: DEPT-TYPE-NNN-VV\nExample: QA-SOP-001-01 = QA dept, SOP type, number 001, version 01\n\nDepartment codes: QA, QC, PROD, WH, ENG, RA, PV, HR\nDocument types: SOP, MFR, BMR, BPR, STP, WI, FRM, POL, LOG' },
    { key:'sop_writing_rules', label:'Writing Guidelines', type:'textarea',
      placeholder:'Language: English\nTense: Imperative (\"Weigh the material\" not \"Material should be weighed\")\nFont: Arial 11pt, Margins: 1 inch all sides\nNumbering: 1.0, 1.1, 1.1.1\nCross-referencing: \"Refer to QA-SOP-015\"' },
    { key:'sop_lifecycle', label:'SOP Lifecycle Management', type:'textarea',
      placeholder:'Initiation: SOP Request Form by dept head\nDraft Review: Author (SME) → Dept Head → QA\nApproval: QA Head + Plant Head / Site Director\nEffective Date: 15 days after approval (training period)\nDistribution: Controlled copy (stamped), Master in QA\nPeriodic Review: Every 2 years or on change control\nRetention: Superseded copies retained 5 years\nDestruction: Destruction log maintained' },
    { key:'sop_version_control', label:'Version Control Rules', type:'textarea',
      placeholder:'Version 00 = Draft\nVersion 01 = First approved\nVersion 02+ = Revisions\nMinor changes: Addendum\nMajor changes: New version\nAll changes via Change Control Form' },
    { key:'sop_training', label:'Training Requirements', type:'textarea',
      placeholder:'All affected personnel must read & sign before SOP effective date\nTraining effectiveness: Quiz / practical assessment\nRe-training on every revision\nTraining records maintained by QA/HR' },
    { key:'sop_deviation', label:'Deviation Handling', type:'textarea',
      placeholder:'Any deviation documented via Deviation Report (QA-FRM-010)\nPlanned vs Unplanned deviations\nCritical/Major/Minor classification\nCAPA linkage mandatory for Major/Critical' },
  ]},
  { id:'batch', title:'H. Batch & Document Numbering', icon:'🔢', fields:[
    { key:'batch_numbering', label:'Batch Numbering Convention', type:'textarea',
      placeholder:'Format: MMYY/PROD/NNN\nExample: 0125/PARA/001 = Jan 2025, Paracetamol, Batch 001\n\nOR: YY-PRODCODE-NNN\nExample: 25-PCT-001 = 2025, Paracetamol, Batch 001\n\nPilot batches: P-MMYY/PROD/NNN\nExhibit batches: E-MMYY/PROD/NNN\nStability batches: S-MMYY/PROD/NNN' },
    { key:'ar_numbering', label:'Analytical Report (AR) Numbering', type:'text', placeholder:'e.g. AR/QC/MMYY/NNN' },
    { key:'coa_numbering', label:'COA Numbering', type:'text', placeholder:'e.g. COA/PROD/MMYY/NNN' },
    { key:'stability_protocol_num', label:'Stability Protocol Numbering', type:'text', placeholder:'e.g. SP/PROD/YY/NNN' },
    { key:'change_control_num', label:'Change Control Numbering', type:'text', placeholder:'e.g. CC/DEPT/YY/NNN' },
    { key:'deviation_num', label:'Deviation Report Numbering', type:'text', placeholder:'e.g. DEV/DEPT/YY/NNN' },
    { key:'capa_num', label:'CAPA Numbering', type:'text', placeholder:'e.g. CAPA/YY/NNN' },
  ]},
  { id:'approver', title:'I. Approver Matrix', icon:'✍️', fields:[
    { key:'approver_mfr', label:'MFR / BMR Approver(s)', type:'textarea', placeholder:'Prepared: Production Officer\nReviewed: Production Manager\nApproved: Head QA + Head Production' },
    { key:'approver_coa', label:'COA / AR Approver(s)', type:'textarea', placeholder:'Tested: QC Analyst\nReviewed: QC Manager\nApproved: Head QC' },
    { key:'approver_stability', label:'Stability Protocol & Report Approver(s)', type:'textarea', placeholder:'Prepared: QC/Stability Officer\nReviewed: QC Manager + RA\nApproved: Head QA' },
    { key:'approver_sop', label:'SOP Approver(s)', type:'textarea', placeholder:'Prepared: Dept SME\nReviewed: Dept Head + QA\nApproved: Head QA + Site Director' },
    { key:'approver_artwork', label:'Artwork / Label Approver(s)', type:'textarea', placeholder:'Prepared: RA\nReviewed: QA + Marketing\nApproved: Head RA + Head QA' },
    { key:'approver_validation', label:'Validation Protocol & Report Approver(s)', type:'textarea', placeholder:'Prepared: Validation Officer\nReviewed: Dept Head\nApproved: Head QA' },
  ]},
  { id:'vendors', title:'J. Approved Vendors & APIs', icon:'🏪', fields:[
    { key:'api_vendors', label:'Approved API Vendors', type:'textarea',
      placeholder:'Vendor 1: [Name], [Country], DMF No. [XXXXX], Products: [API list]\nVendor 2: [Name], [Country], DMF No. [YYYYY], Products: [API list]' },
    { key:'excipient_vendors', label:'Approved Excipient Vendors', type:'textarea', placeholder:'Vendor, Grade, Products supplied...' },
    { key:'packaging_vendors', label:'Approved Packaging Material Vendors', type:'textarea', placeholder:'Primary pack: [vendor]\nSecondary pack: [vendor]\nLabel printer: [vendor]' },
    { key:'contract_labs', label:'Contract Laboratories', type:'textarea', placeholder:'Lab name, NABL accreditation, tests outsourced...' },
  ]},
  { id:'templates', title:'K. Standard Report Templates', icon:'📊', fields:[
    { key:'pvp_template', label:'PVP (Pharmacovigilance Plan) Format', type:'textarea', placeholder:'Describe your standard PVP template structure...' },
    { key:'pvr_template', label:'PVR (Pharmacovigilance Report) Format', type:'textarea', placeholder:'Describe your standard PVR template structure...' },
    { key:'pdr_template', label:'PDR (Periodic Development Report) Format', type:'textarea', placeholder:'Describe your standard PDR template structure...' },
    { key:'amv_template', label:'AMV (Artwork Master Validation) Format', type:'textarea', placeholder:'Describe your standard artwork validation template...' },
    { key:'smf_template', label:'Site Master File Structure', type:'textarea',
      placeholder:'1. General Information\n2. Personnel\n3. Premises & Equipment\n4. Documentation\n5. Production\n6. Quality Control\n7. Contract Manufacture & Analysis\n8. Distribution, Complaints, Product Defects & Recalls\n9. Self-Inspection' },
  ]},
  { id:'qms', title:'L. Quality Management System', icon:'⚙️', fields:[
    { key:'qms_framework', label:'QMS Framework', type:'select', options:['ICH Q10','In-house QMS','Hybrid (ICH Q10 + In-house)','ISO 9001 + GMP','PIC/S','Other'] },
    { key:'qms_description', label:'QMS Description', type:'textarea', placeholder:'Describe your quality management system — process approach, risk management methodology (ICH Q9), knowledge management (ICH Q10), continual improvement mechanism...' },
    { key:'risk_management', label:'Risk Management Approach', type:'textarea', placeholder:'FMEA / HACCP / FTA — describe methodology used for risk assessment...' },
    { key:'annual_review', label:'Annual Product Quality Review (APQR) Practice', type:'textarea', placeholder:'Frequency, template used, review committee, action tracking...' },
  ]},
];

// Flatten for backward compatibility
const CMD_FIELDS = CMD_SECTIONS.flatMap(s => s.fields);

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

  // Company Master Data (standalone, stored in localStorage by company name)
  const [companyData, setCompanyData] = useState({});
  const [companyList, setCompanyList] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [cmdForm, setCmdForm] = useState({});
  const [addCompanyName, setAddCompanyName] = useState('');

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
        setCompanyList(Object.keys(saved));
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
  function saveCompanyData(companyId, data) {
    setCompanyData(prev => {
      const next = { ...prev, [companyId]: data };
      try { localStorage.setItem('raisa_company_data', JSON.stringify(next)); } catch {}
      // Update company list
      setCompanyList(Object.keys(next));
      return next;
    });
  }

  // Delete company
  function deleteCompany(companyId) {
    setCompanyData(prev => {
      const next = { ...prev };
      delete next[companyId];
      try { localStorage.setItem('raisa_company_data', JSON.stringify(next)); } catch {}
      setCompanyList(Object.keys(next));
      return next;
    });
    if (editingClient?.id === companyId) { setEditingClient(null); setViewMode('browse'); }
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
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <label style={{ cursor:'pointer' }}>
            <input type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }}
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const entry = {
                  id: 'standalone-' + Date.now(),
                  filename: file.name,
                  section: 'Standalone',
                  title: file.name.replace(/\.[^/.]+$/, ''),
                  product_name: 'Standalone Review',
                  country: '—',
                  status: 'queued',
                  added_at: new Date().toISOString(),
                };
                setReviewQueue(prev => {
                  const next = [...prev, entry];
                  try { localStorage.setItem('raisa_review_queue', JSON.stringify(next)); } catch {}
                  return next;
                });
                setSelectedDoc(entry);
                setViewMode('review');
                e.target.value = '';
              }}/>
            <span style={{ padding:'5px 14px', background:'rgba(255,255,255,0.15)',
              border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:5,
              fontSize:11, fontWeight:600, cursor:'pointer' }}>
              ↑ Upload for Review
            </span>
          </label>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', padding:'4px 10px',
            background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
            Queue: {reviewQueue.length} · Reviewed: {reviewQueue.filter(q => q.status === 'reviewed').length}
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
                No projects found. Create projects in<br/>Project Manager first.
              </div>
            ) : projects.map(p => {
              const isOpen = selectedProject?.id === p.id;
              return (
                <div key={p.id}>
                  <div onClick={() => isOpen ? setSelectedProject(null) : loadProject(p)}
                    style={{ padding:'7px 12px', cursor:'pointer', fontSize:11,
                      display:'flex', alignItems:'center', gap:6,
                      background: isOpen ? '#E3EDFA' : 'transparent',
                      borderLeft: isOpen ? `3px solid ${T.accent}` : '3px solid transparent',
                      borderBottom:'1px solid #F0F0F0' }}
                    onMouseOver={e => { if(!isOpen) e.currentTarget.style.background='#F0F4FA'; }}
                    onMouseOut={e => { if(!isOpen) e.currentTarget.style.background= isOpen?'#E3EDFA':'transparent'; }}>
                    <span style={{ fontSize:9, color:T.muted, width:12, textAlign:'center', flexShrink:0 }}>
                      {isOpen ? '▼' : '▶'}
                    </span>
                    <span style={{ fontSize:13 }}>{isOpen ? '📂' : '📁'}</span>
                    <span style={{ fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize:8, color:T.muted }}>click to expand</span>
                  </div>

                  {isOpen && dossiers.length === 0 && (
                    <div style={{ padding:'10px 12px 10px 36px', fontSize:10, color:T.muted, fontStyle:'italic' }}>
                      No dossiers in this project
                    </div>
                  )}

                  {isOpen && dossiers.map(d => {
                    const isDossierOpen = activeDossier?.id === d.id;
                    const uploadedCount = isDossierOpen ? nodes.filter(n => (n.documents||[]).length > 0).length : 0;
                    return (
                      <div key={d.id}>
                        <div onClick={() => isDossierOpen ? setActiveDossier(null) : loadDossierNodes(d)}
                          style={{ padding:'6px 12px 6px 28px', cursor:'pointer', fontSize:10,
                            display:'flex', alignItems:'center', gap:6,
                            background: isDossierOpen ? '#DBEAFE' : 'transparent',
                            borderBottom:'1px solid #F5F5F5' }}
                          onMouseOver={e => { if(!isDossierOpen) e.currentTarget.style.background='#F0F4FA'; }}
                          onMouseOut={e => { if(!isDossierOpen) e.currentTarget.style.background= isDossierOpen?'#DBEAFE':'transparent'; }}>
                          <span style={{ fontSize:8, color:T.muted, width:10, textAlign:'center' }}>
                            {isDossierOpen ? '▼' : '▶'}
                          </span>
                          <span>📦</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {d.product_name} — {d.country}
                            </div>
                            <div style={{ fontSize:9, color:T.muted }}>{d.authority} · {d.submission_type}</div>
                          </div>
                        </div>

                        {isDossierOpen && (() => {
                          const docsWithFiles = nodes.filter(n => (n.documents||[]).length > 0);
                          if (docsWithFiles.length === 0) return (
                            <div style={{ padding:'10px 44px', fontSize:10, color:'#D97706',
                              background:'#FFFBEB', borderBottom:'1px solid #FEF3C7' }}>
                              ⚠️ No documents uploaded in this dossier.<br/>
                              <span style={{ fontSize:9, color:T.muted }}>
                                Go to Project Manager → open this dossier → upload documents first.
                              </span>
                            </div>
                          );
                          return (
                            <>
                              {/* Queue All button */}
                              <div style={{ padding:'4px 44px', borderBottom:'1px solid #F0F0F0' }}>
                                <button onClick={() => docsWithFiles.forEach(n => addToQueue(n.documents[0], n, d))}
                                  style={{ fontSize:9, padding:'3px 10px', background:'#DCFCE7',
                                    border:'1px solid #86EFAC', borderRadius:3, color:T.green,
                                    cursor:'pointer', fontWeight:600 }}>
                                  + Queue All ({docsWithFiles.length} docs)
                                </button>
                              </div>
                              {docsWithFiles.map(n => {
                                const doc = n.documents[0];
                                const inQueue = reviewQueue.some(q => q.id === doc.id);
                                return (
                                  <div key={n.id}
                                    onClick={() => { setSelectedDoc({ ...doc, section: n.section, title: n.title,
                                      product_name: d.product_name, country: d.country, dossier_id: d.id });
                                      setViewMode('review'); setReviewResult(null); }}
                                    style={{ padding:'5px 12px 5px 44px', cursor:'pointer', fontSize:10,
                                      display:'flex', alignItems:'center', gap:5,
                                      background: selectedDoc?.id === doc.id ? '#DBEAFE' : 'transparent',
                                      borderBottom:'1px solid #F8F8F8' }}
                                    onMouseOver={e => { if(selectedDoc?.id !== doc.id) e.currentTarget.style.background='#F0F4FA'; }}
                                    onMouseOut={e => { if(selectedDoc?.id !== doc.id) e.currentTarget.style.background='transparent'; }}>
                                    <span style={{ fontSize:10 }}>📄</span>
                                    <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                      {n.section} — {n.title || doc.filename}
                                    </span>
                                    {inQueue ? (
                                      <span style={{ fontSize:8, padding:'2px 5px', background:'#DCFCE7',
                                        color:T.green, borderRadius:2, fontWeight:700 }}>✓ Queued</span>
                                    ) : (
                                      <button onClick={e => { e.stopPropagation(); addToQueue(doc, n, d); }}
                                        style={{ background:'#EEF3FB', border:'1px solid #BFD3EF', borderRadius:3,
                                          padding:'2px 8px', fontSize:9, color:T.accent, cursor:'pointer',
                                          fontWeight:600, flexShrink:0 }}>
                                        + Queue
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Company Master Data (standalone) ── */}
          <div style={{ borderTop:`1px solid ${T.border}` }}>
            <div style={{ padding:'8px 12px', background:'#F0F4F8', color:T.navy,
              fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
              <span>🏢</span> Company Master Data
              <span style={{ marginLeft:'auto', fontSize:9, background:'#E3EDFA',
                padding:'1px 6px', borderRadius:3, color:T.accent }}>{companyList.length}</span>
            </div>

            {/* Add new company */}
            <div style={{ padding:'6px 12px', borderBottom:'1px solid #F0F0F0', display:'flex', gap:4 }}>
              <input value={addCompanyName} placeholder="Company name..."
                onChange={e => setAddCompanyName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && addCompanyName.trim()) {
                    const id = addCompanyName.trim().toLowerCase().replace(/\s+/g, '_');
                    saveCompanyData(id, { company_name: addCompanyName.trim() });
                    setAddCompanyName('');
                  }
                }}
                style={{ flex:1, padding:'4px 8px', border:`1px solid ${T.border}`,
                  borderRadius:4, fontSize:10, fontFamily:'inherit' }}/>
              <button onClick={() => {
                if (addCompanyName.trim()) {
                  const id = addCompanyName.trim().toLowerCase().replace(/\s+/g, '_');
                  saveCompanyData(id, { company_name: addCompanyName.trim() });
                  setAddCompanyName('');
                }
              }}
              style={{ padding:'4px 10px', background:T.accent, color:'#fff', border:'none',
                borderRadius:4, fontSize:10, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                + Add
              </button>
            </div>

            {/* Company list */}
            {companyList.length === 0 ? (
              <div style={{ padding:'10px 12px', color:T.muted, fontSize:10, textAlign:'center' }}>
                Add a company above to enter<br/>master data for Layer 2 analysis
              </div>
            ) : companyList.map(cid => {
              const cd = companyData[cid] || {};
              const filled = CMD_FIELDS.filter(f => cd[f.key]).length;
              const isEditing = editingClient?.id === cid && viewMode === 'company';
              return (
                <div key={cid}
                  onClick={() => {
                    setEditingClient({ id: cid, name: cd.company_name || cid });
                    setCmdForm(cd);
                    setViewMode('company');
                  }}
                  style={{ padding:'6px 12px', cursor:'pointer', fontSize:10,
                    display:'flex', alignItems:'center', gap:6, borderBottom:'1px solid #F5F5F5',
                    background: isEditing ? '#DBEAFE' : 'transparent' }}
                  onMouseOver={e => { if (!isEditing) e.currentTarget.style.background='#F0F4FA'; }}
                  onMouseOut={e => { if (!isEditing) e.currentTarget.style.background= isEditing ? '#DBEAFE' : 'transparent'; }}>
                  <span>🏢</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {cd.company_name || cid}
                    </div>
                    <div style={{ fontSize:8, color:T.muted }}>{filled}/{CMD_FIELDS.length} fields</div>
                  </div>
                  <span style={{ fontSize:9, color: filled > 10 ? T.green : T.muted, fontWeight:600 }}>
                    {filled > 10 ? '✓' : 'Edit'}
                  </span>
                  <button onClick={e => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${cd.company_name || cid}" company data?`)) deleteCompany(cid);
                  }}
                  style={{ background:'none', border:'none', color:'#CCC', fontSize:10, cursor:'pointer', padding:2 }}
                  onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color='#CCC'}>✕</button>
                </div>
              );
            })}
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
              height:'100%', flexDirection:'column', gap:16, color:T.muted, padding:24 }}>
              <div style={{ fontSize:64 }}>📋</div>
              <div style={{ fontSize:20, fontWeight:700, color:T.text }}>Document Review & Gap Analysis</div>

              {/* Step-by-step instructions */}
              <div style={{ background:T.white, borderRadius:10, border:`1px solid ${T.border}`,
                padding:'20px 28px', maxWidth:560, width:'100%' }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:14 }}>How to add documents for review:</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { step:'1', icon:'📁', text:'Click a project in the left sidebar to expand it (▶ arrow)' },
                    { step:'2', icon:'📦', text:'Click a dossier to see its uploaded documents' },
                    { step:'3', icon:'📄', text:'Click "+ Queue" next to any document, or "Queue All" to add all at once' },
                    { step:'4', icon:'🔍', text:'Select a queued document → click "Run AI Review" for dual-layer gap analysis' },
                  ].map(s => (
                    <div key={s.step} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <span style={{ background:T.accent, color:'#fff', width:22, height:22, borderRadius:'50%',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800,
                        flexShrink:0 }}>{s.step}</span>
                      <div style={{ fontSize:12, lineHeight:1.6, color:T.text }}>
                        <span style={{ marginRight:4 }}>{s.icon}</span>{s.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload standalone document */}
              <div style={{ background:T.white, borderRadius:10, border:`2px dashed ${T.border}`,
                padding:'20px 28px', maxWidth:560, width:'100%', textAlign:'center' }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:8 }}>
                  Or upload a standalone document for quick review
                </div>
                <div style={{ fontSize:11, color:T.muted, marginBottom:12, lineHeight:1.6 }}>
                  Upload a PDF directly — not linked to any dossier. Good for quick one-off gap analysis.
                </div>
                <label style={{ cursor:'pointer', display:'inline-block' }}>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const entry = {
                        id: 'standalone-' + Date.now(),
                        filename: file.name,
                        section: 'Standalone',
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        product_name: 'Standalone Review',
                        country: '—',
                        status: 'queued',
                        added_at: new Date().toISOString(),
                      };
                      setReviewQueue(prev => {
                        const next = [...prev, entry];
                        try { localStorage.setItem('raisa_review_queue', JSON.stringify(next)); } catch {}
                        return next;
                      });
                      setSelectedDoc(entry);
                      setViewMode('review');
                      e.target.value = '';
                    }}/>
                  <span style={{ padding:'10px 24px', background:T.navy, color:'#fff',
                    borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer',
                    display:'inline-block' }}>
                    ↑ Upload Document for Review
                  </span>
                </label>
              </div>

              {/* Layer cards */}
              <div style={{ display:'flex', gap:12, marginTop:4 }}>
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
                overflow:'hidden' }}>
                {CMD_SECTIONS.map((sec, si) => (
                  <div key={sec.id}>
                    {/* Section header */}
                    <div style={{ padding:'10px 20px', background: si % 2 === 0 ? '#F0F4F8' : '#FAFBFC',
                      borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:1,
                      display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
                      onClick={() => setCmdForm(p => ({...p, [`_open_${sec.id}`]: !p[`_open_${sec.id}`] }))}>
                      <span style={{ fontSize:14 }}>{sec.icon}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:T.navy, flex:1 }}>{sec.title}</span>
                      <span style={{ fontSize:9, color:T.muted }}>
                        {sec.fields.filter(f => cmdForm[f.key]).length}/{sec.fields.length} filled
                      </span>
                      <span style={{ fontSize:10, color:T.muted }}>{cmdForm[`_open_${sec.id}`] === false ? '▶' : '▼'}</span>
                    </div>

                    {/* Section fields — collapsible */}
                    {cmdForm[`_open_${sec.id}`] !== false && (
                      <div style={{ padding:'14px 20px' }}>
                        {sec.fields.map(f => (
                          <div key={f.key} style={{ marginBottom:12 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:T.muted,
                              textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:3 }}>
                              {f.label}
                            </label>
                            {f.type === 'select' ? (
                              <select value={cmdForm[f.key] || ''}
                                onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width:'100%', padding:'7px 10px', border:`1px solid ${T.border}`,
                                  borderRadius:5, fontSize:11, fontFamily:'inherit', background:'#fff' }}>
                                <option value="">Select...</option>
                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : f.type === 'textarea' ? (
                              <textarea value={cmdForm[f.key] || ''} placeholder={f.placeholder}
                                onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                                rows={f.placeholder && f.placeholder.includes('\n') ? Math.min(6, f.placeholder.split('\n').length + 1) : 3}
                                style={{ width:'100%', padding:'7px 10px', border:`1px solid ${T.border}`,
                                  borderRadius:5, fontSize:11, fontFamily:'inherit', resize:'vertical',
                                  boxSizing:'border-box', lineHeight:1.6 }}/>
                            ) : (
                              <input value={cmdForm[f.key] || ''} placeholder={f.placeholder}
                                onChange={e => setCmdForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width:'100%', padding:'7px 10px', border:`1px solid ${T.border}`,
                                  borderRadius:5, fontSize:11, fontFamily:'inherit', boxSizing:'border-box' }}/>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ padding:'14px 20px', borderTop:`1px solid ${T.border}`,
                  display:'flex', alignItems:'center', gap:12, background:'#FAFBFC', position:'sticky', bottom:0 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>
                      Completion: {CMD_FIELDS.filter(f => cmdForm[f.key]).length} / {CMD_FIELDS.length} fields filled
                    </div>
                    <div style={{ height:4, background:'#E5E7EB', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width: Math.round(CMD_FIELDS.filter(f => cmdForm[f.key]).length / CMD_FIELDS.length * 100) + '%',
                        height:'100%', background:T.green, transition:'width .3s' }}/>
                    </div>
                  </div>
                  <button onClick={() => {
                    // Strip internal _open_ keys before saving
                    const cleanData = {};
                    for (const [k, v] of Object.entries(cmdForm)) {
                      if (!k.startsWith('_open_')) cleanData[k] = v;
                    }
                    saveCompanyData(editingClient.id, cleanData);
                    setViewMode('browse');
                  }}
                  style={{ padding:'8px 20px', background:T.navy, color:'#fff', border:'none',
                    borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    💾 Save Company Data
                  </button>
                  <button onClick={() => setViewMode('browse')}
                    style={{ padding:'8px 20px', background:T.white, color:T.text,
                      border:`1px solid ${T.border}`, borderRadius:6, fontSize:12,
                      cursor:'pointer', fontFamily:'inherit' }}>
                    Cancel
                  </button>
                </div>
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
