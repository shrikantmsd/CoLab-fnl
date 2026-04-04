'use client';
import { useState } from 'react';

const T = {
  navy:'#1A3D6B', mid:'#2B579A', bg:'#F0F4F8', white:'#FFFFFF',
  border:'#D1D5DB', muted:'#6B7280', text:'#1F2937', dim:'#9CA3AF',
  green:'#166534', greenBg:'#DCFCE7', red:'#991B1B', redBg:'#FEE2E2',
};
const M = 'M';
const C = 'C';

// ── DOCUMENT TEMPLATES ────────────────────────────────────────────────────────
const DOC_TEMPLATES = {
  'Covering letter': {
    ref: 'D&C Rules 1945 — Rule 68 / Rule 122',
    purpose: 'Formal letter introducing the application, summarising intent and listing all enclosures.',
    sections: [
      { heading: 'Header', items: ['Company name and full registered address on letterhead','Date of application','Subject line: "Application for grant of licence in Form [XX] under Rule [XX] of D&C Rules, 1945"','To: The State Drugs Controller / CDSCO Zonal Office, [City]'] },
      { heading: 'Body', items: ['Brief company background (year of establishment, existing licences)','Category of licence sought — list of dosage forms and drug schedules proposed','Tabular product list: S.No | Product Name (INN) | Dosage Form | Strength | Schedule','Declaration of Schedule M / GMP compliance','Statement that all required documents are enclosed'] },
      { heading: 'Closing', items: ['Numbered list of all enclosures (must match application index)','Signature of authorised signatory with name and designation','Company rubber stamp / seal','Date and place of signing'] },
    ],
    format: 'Company letterhead. 1–2 pages. Signed original required.',
    sample: `To,
The State Drugs Controller,
[State] Food & Drug Administration, [City]

Date: __/__/____

Sub: Application for grant of Manufacturing Licence in Form 24 
     under Rule 68 of the Drugs & Cosmetics Rules, 1945

Sir/Madam,

We, M/s [Company Name] (a [proprietorship/partnership/pvt ltd] firm), hereby 
apply for grant of a Manufacturing Licence for manufacture for sale/distribution 
of the following drugs at premises situated at [Full address]:

| S.No | Product (INN)  | Dosage Form | Strength | Schedule |
|------|----------------|-------------|----------|----------|
|  1.  | [Product Name] | Tablets     | [X mg]   | OTC      |

We confirm full compliance with Schedule M requirements. All documents 
are enclosed as listed in the index.

Enclosures: [1. Form 24  2. Fee Challan  3. Site Plan  ...]

Yours faithfully,
[Name], [Designation]
[Company Name]                                [Seal]`,
  },

  'Site plan and layout': {
    ref: 'Schedule M — D&C Rules 1945 (GMP Requirements for Premises)',
    purpose: 'Architect-certified drawing of the manufacturing facility showing room layout, dimensions, and compliance with Schedule M spatial requirements.',
    sections: [
      { heading: 'Drawing Essentials', items: ['North direction indicator and scale (1:50 or 1:100)','Full address of premises on the drawing','Name of product categories to be manufactured','Architect name, registration number, and signature'] },
      { heading: 'Room Details (each room must show)', items: ['Room name and function (e.g. Granulation, Compression, Coating, QC Lab)','Room dimensions — length × width in metres','Total area of each room and cumulative total','Door and window positions','HVAC supply / return air diffuser positions'] },
      { heading: 'Flow Diagrams (unidirectional arrows)', items: ['Raw material entry → dispensing → manufacturing → packaging → dispatch','Personnel flow: entry → change room → gowning → production → exit','Waste / reject material flow route'] },
      { heading: 'Zones Required (Schedule M)', items: ['Receiving / quarantine area for raw materials','Sampling booth / weighing/dispensing area','Manufacturing areas (granulation, blending, compression, filling, coating)','Packaging area (primary and secondary)','Finished goods quarantine and release area','QC laboratory (with instruments listed)','Utility area (water system, HVAC plant room, electrical)','Toilets, change rooms, gowning / de-gowning areas'] },
    ],
    format: 'A1 or A2 drawing. Must be FDA pre-approved before construction. Attach physical + soft copy.',
    sample: null,
  },

  'Power of Attorney': {
    ref: 'D&C Rules 1945 — Import Registration Rules; NDCT Rules 2019',
    purpose: 'Legal document authorising an Indian agent or signatory to represent the principal company before regulatory authorities.',
    sections: [
      { heading: 'Parties', items: ['Full legal name and registered address of Grantor (company/foreign manufacturer)','Full legal name and address of Grantee (Indian agent/authorised signatory)','Relationship between parties'] },
      { heading: 'Scope of Authority Granted', items: ['Sign and submit all regulatory applications on behalf of Grantor','Appear before CDSCO, State FDA and other regulatory authorities','Receive regulatory correspondence, licences, and approvals','Respond to queries, deficiency letters, and inspection notices','Confirm product quality compliance on behalf of manufacturer'] },
      { heading: 'Validity & Execution', items: ['Validity period (or stated as perpetual until revoked in writing)','Governing law and jurisdiction','Signature of authorised officer of Grantor with name and designation','Company seal of Grantor','Date and place of execution'] },
      { heading: 'Authentication (for foreign manufacturers)', items: ['Notarised by Notary Public in country of origin','Apostilled under Hague Convention — OR authenticated by Indian Embassy in country of origin','Certified English translation if original is in another language'] },
    ],
    format: 'On stamp paper (India-based). Notarised + apostilled for foreign entities. Original required.',
    sample: null,
  },

  'Schedule M compliance declaration': {
    ref: 'Schedule M — D&C Rules 1945 (Revised 2023) — Good Manufacturing Practices and Requirements of Premises, Plant and Equipment for Pharmaceutical Products',
    purpose: 'Declaration by the manufacturer that all premises, equipment, personnel, and quality systems comply with Schedule M.',
    sections: [
      { heading: 'Header', items: ['Company name, manufacturing site address, and licence number (or application number)','Date of declaration','Product categories and dosage forms covered'] },
      { heading: 'Declaration Content', items: ['Premises comply with Schedule M Part I (layout, cleanrooms, utilities, services)','Personnel comply with Part IA (qualified QA Head, QC Head, Production Head)','Equipment complies with Part IC (qualification, calibration, maintenance SOPs)','For sterile products: Sterile manufacturing area complies with Schedule M Part II'] },
      { heading: 'Signatories Required', items: ['QA Head (Qualified Person) — name, qualification, signature','Managing Director / CEO — name, signature','Date of declaration'] },
    ],
    format: 'On company letterhead. Signed by QA Head AND MD/Director. 1–2 pages.',
    sample: null,
  },

  'Master Formula Record (MFR)': {
    ref: 'Schedule M, Part I, Section 7 — Documentation Requirements',
    purpose: 'Master document defining formula, manufacturing procedure, and quality standards for every product. Basis for all batch manufacturing.',
    sections: [
      { heading: 'Product Identification', items: ['Product name (INN + brand), strength, dosage form','Product code / reference number','Batch size (number of units / weight in kg)','Manufacturing licence number'] },
      { heading: 'Formula (per batch)', items: ['All ingredients (API + excipients) with quantity per batch','Grade and pharmacopoeial standard (IP/BP/USP/In-house) for each ingredient','Overage percentage for each ingredient (with justification)'] },
      { heading: 'Manufacturing Procedure', items: ['Step-by-step manufacturing instructions with process parameters','Equipment used at each step (with equipment ID)','In-process controls and acceptance limits at each step','Sampling plan for in-process testing'] },
      { heading: 'Quality & Packaging', items: ['Finished product specification (all tests with acceptance criteria)','Primary and secondary packaging specifications','Container closure system description','Storage conditions and approved shelf life'] },
      { heading: 'Document Control', items: ['Prepared by (Production Manager), Checked by (QA), Approved by (QA Head)','Version number, effective date, and superseded version reference','Page numbers (all pages must be numbered)','Access restriction stamp (controlled document)'] },
    ],
    format: 'Controlled document. Version-controlled. Physical copies numbered and access-restricted.',
    sample: null,
  },

  'Stability data': {
    ref: 'ICH Q1A(R2) — Stability Testing; Schedule Y, D&C Rules 1945; India = ICH Climatic Zone IVb',
    purpose: 'Scientific data demonstrating that the drug retains quality within specification throughout its proposed shelf life under India-specific storage conditions.',
    sections: [
      { heading: 'Study Design', items: ['Minimum 3 batches (pilot or commercial scale, same formula and process as proposed commercial)','Container/closure system: must be the same as proposed commercial pack','Study initiated at time of first manufacture — continue throughout shelf life claim period'] },
      { heading: 'Storage Conditions — India (Zone IVb)', items: ['Long-term:   30°C ± 2°C / 65% RH ± 5% RH  —  test at 0, 3, 6, 9, 12, 18, 24, 36 months','Accelerated: 40°C ± 2°C / 75% RH ± 5% RH  —  test at 0, 3, 6 months','Photostability: ICH Q1B — 1.2 million lux·hr + 200 Wh/m² UV (Option 1 or 2)','Note: 25°C/60%RH (Zone II) is NOT sufficient for India — Zone IVb is mandatory'] },
      { heading: 'Parameters to Test (solid oral)', items: ['Appearance (colour, shape, odour, any physical changes)','Assay (potency — % label claim by HPLC/UV)','Related substances / degradation products (with identification and quantification limits per ICH Q3B)','Dissolution (Q value, apparatus, medium, RPM, time)','Disintegration (for uncoated tablets)','Water content / moisture (Karl Fischer)','Hardness and friability (if critical)','Microbial limits (NMT USP/IP specifications)'] },
      { heading: 'Report Structure', items: ['Cover page: product, batches, conditions, dates','Summary table: all parameters across all batches across all time points','Statistical analysis: linear regression for trend analysis (ICH Q1E)','Conclusion: proposed shelf life with supporting rationale','Out-of-specification (OOS) investigations (if any)','Signed by QA Head with date'] },
    ],
    format: 'Technical report. Tabulated data. Statistical analysis included. Chromatograms as appendix.',
    sample: null,
  },

  'Certificate of Analysis (COA)': {
    ref: 'IP / BP / USP specifications; ICH Q6A — Specifications for New Drug Substances and Products',
    purpose: 'Document confirming that a specific batch meets its approved specification. One COA per batch per product.',
    sections: [
      { heading: 'Header Information', items: ['Product name (INN + brand), strength, dosage form','Batch number and batch size','Date of manufacture and date of expiry / retest date','Manufacturing site name and full address','Approved specification reference number'] },
      { heading: 'Test Results Table', items: ['Test name | Specification / Acceptance Criteria | Result | Pass/Fail — for each test','Drug substance COA: description, identification (IR/HPLC), assay (%), related substances, water content, residual solvents, particle size, microbial limits','Drug product COA: appearance, identification, assay, dissolution, disintegration, weight variation, hardness, friability, uniformity of content, related substances, water content, microbial limits'] },
      { heading: 'Signatures', items: ['Tested by: Analyst name and signature with date','Reviewed by: QC Manager name and signature','Approved/Released by: QA Head name and signature with date','Batch release status: Released / Rejected'] },
    ],
    format: 'On company QC letterhead. Original or certified true copy. One per batch.',
    sample: null,
  },

  'WHO-GMP certificate': {
    ref: 'WHO Technical Report Series No. 986 (2014) Annex 2; Schedule M D&C Rules 1945',
    purpose: 'Certificate confirming manufacturing site compliance with WHO GMP standards. Required for export tenders (UNICEF, USAID), WHO Prequalification, and regulated market registrations.',
    sections: [
      { heading: 'Certificate Must State', items: ['Name and full address of manufacturing site','List of product categories / dosage forms covered by the certificate','Statement of GMP compliance: "The above named manufacturer complies with WHO GMP requirements"','Date of last GMP inspection by CDSCO / State FDA','Inspection authority and inspecting officer details','Certificate validity period (typically 2–3 years)'] },
      { heading: 'Issued By', items: ['Drugs Controller General of India (DCGI) or authorised CDSCO officer','Official CDSCO stamp / seal','Certificate number and date of issue'] },
      { heading: 'How to Apply (from July 2025)', items: ['Mandatory via ONDLS portal only — ondls.cdsco.gov.in','Physical files no longer accepted (DCGI order June 2025)','Supporting documents: SMF, Schedule M checklist, inspection report, mfg licence','Timeline: 45–90 days from complete application'] },
    ],
    format: 'Issued by CDSCO on official letterhead. Apostilled if required by importing country.',
    sample: null,
  },

  'Site Master File (SMF)': {
    ref: 'WHO TRS No. 961 (2011) Annex 14; EU GMP Chapter 4; PIC/S PE 008',
    purpose: 'Comprehensive document describing the manufacturing and quality operations at a site. Used for GMP inspections, COPP, and WHO-GMP applications. Updated annually.',
    sections: [
      { heading: '1. General Information', items: ['Company name and site address','Legal status (Pvt Ltd / Partnership etc.)','Manufacturing licence numbers held','Contact details (QA Head, Regulatory contact)'] },
      { heading: '2. Manufacturing Activities', items: ['All dosage forms manufactured at the site','Drug schedules covered (General, C, C1, X)','Products manufactured for export vs domestic','Any contract / third-party manufacturing activities'] },
      { heading: '3. Quality Management', items: ['Quality policy statement','Organisation chart (all QA, QC, Production, Regulatory personnel)','Key personnel: QA Head, QC Head, Production Head — qualifications, experience','Annual training plan and GMP training records summary'] },
      { heading: '4. Premises & Equipment', items: ['Building layout overview (cleanroom classification, area summaries)','Utility systems: water (PW/WFI), HVAC, compressed air, steam','Major production equipment list (with qualification status)','Major QC instruments list (with calibration status)'] },
      { heading: '5. Production, QC & Distribution', items: ['Batch release procedure and Qualified Person (QP) role','QC laboratory overview (reference standards, stability programme)','Change control and deviation management systems','Distribution and cold chain details'] },
      { heading: '6. Compliance History', items: ['Regulatory inspections in last 3 years (authority, date, outcome, CAPA status)','Summary of product quality complaints in last 2 years','Drug recalls in last 5 years (if any)'] },
    ],
    format: 'Standalone controlled document. Typically 30–60 pages. Version-controlled. Approved by QA Head.',
    sample: null,
  },

  'Stability data summary': {
    ref: 'ICH Q1A(R2) / ICH Q1E — Stability Testing and Shelf Life Evaluation',
    purpose: 'Condensed summary of full stability report for inclusion in regulatory dossiers (COPP, NDA submissions). 2–5 pages.',
    sections: [
      { heading: 'Summary Table', items: ['Product name, strength, dosage form','Batch numbers, batch sizes, manufacturing dates','Storage conditions and testing intervals','Key parameters: Assay, Related Substances, Dissolution (results per batch per time point)','Shelf life conclusion (e.g. 24 months at 30°C/65%RH in HDPE container)'] },
      { heading: 'Conclusion', items: ['Proposed shelf life and storage conditions (as approved)','Any significant trends observed and their regulatory implications','Reference to full stability report (file reference number)','Signed by QA Head with date'] },
    ],
    format: '2–5 page summary. Tabular format. Appendix to COPP / NDA dossier.',
    sample: null,
  },

  'Form 9 (Undertaking)': {
    ref: 'Rule 24-A, D&C Rules 1945 — Import Licence Requirements',
    purpose: 'Formal undertaking by manufacturer/importer confirming product quality compliance for import into India.',
    sections: [
      { heading: 'Undertaking Must Confirm', items: ['Name and address of manufacturer (country of origin)','Product name(s), strength(s), dosage form(s) to be imported','Product is manufactured under WHO GMP conditions','Product quality meets standards of the Drugs & Cosmetics Act 1940','Product is freely sold / regulatory-approved in country of origin','Manufacturer will provide regulatory data and cooperate with CDSCO inspections'] },
      { heading: 'Execution', items: ['Signature of authorised official of manufacturer with name and designation','Company seal of manufacturer','Date and place of signing','Notarised in country of origin'] },
    ],
    format: 'On manufacturer letterhead. Notarised. Original required with import application.',
    sample: null,
  },

  'Ethics Committee approval': {
    ref: 'NDCT Rules 2019 — Schedule 1; ICMR National Ethical Guidelines 2017',
    purpose: 'Formal approval from CDSCO-registered Ethics Committee (EC/IEC) to conduct a clinical trial at a specific site.',
    sections: [
      { heading: 'Approval Letter Must Include', items: ['Name of Ethics Committee and its CDSCO registration number','Study site / hospital / institution name and address','Exact protocol title and version number (as registered on CTRI)','Name of Principal Investigator (PI)','Date of EC meeting and quorum confirmation','List of documents reviewed (protocol, IB, ICF, PIL, insurance, advertisements)','Approval decision — approved / approved with conditions'] },
      { heading: 'Conditions and Validity', items: ['Any conditions imposed (protocol modifications, additional information required)','Validity period of approval (typically 1 year — requires annual continuing review)','Name, signature, and designation of EC Chairperson','EC official letterhead and stamp'] },
      { heading: 'Ongoing Requirements', items: ['SAE reporting to EC within 7 days (expedited) per NDCT Rules','Annual progress report to EC','Protocol amendments must be re-approved by EC before implementation','Final study report to be submitted to EC on study completion'] },
    ],
    format: 'On EC official letterhead. Original for each study site. Separate letter per protocol version.',
    sample: null,
  },

  'Clinical Trial Protocol': {
    ref: 'NDCT Rules 2019 Schedule Y; ICH E6(R3) GCP; ICH E8; ICMR Guidelines 2017',
    purpose: 'Master document describing objective, design, methodology, statistics, and organisation of a clinical trial.',
    sections: [
      { heading: 'Administrative', items: ['Protocol title, version number, and date','Sponsor name and address; CRO name (if applicable)','Protocol ID / CTRI registration number','Principal Investigator(s) name and institution(s)'] },
      { heading: 'Scientific Content', items: ['Background and rationale (scientific justification for the study)','Study objectives: primary and secondary endpoints','Study design (randomised, double-blind, placebo-controlled, crossover etc.)','Study population: inclusion and exclusion criteria (clearly numbered)','Sample size calculation with power, alpha, and statistical assumptions'] },
      { heading: 'Procedures', items: ['Treatment: investigational product, dose, route, frequency, duration, storage','Study visits and procedures schedule (SPIRIT table)','Efficacy assessments: timing, method, scoring','Safety monitoring: AE, SAE definitions; SAE reporting timeline (24h to EC, 7/15 days to CDSCO)','Pharmacovigilance plan and DSMB composition (if applicable)'] },
      { heading: 'Statistics & Ethics', items: ['Statistical analysis plan: primary analysis, handling missing data, interim analyses','Compensation for participants (per NDCT Rules Schedule I — mandatory)','Insurance details: coverage amount, insurer name, policy number','Confidentiality and data protection measures','CTRI registration requirement (mandatory before first patient enrolment in India)'] },
    ],
    format: 'ICH format. Version-controlled. All pages numbered. Protocol amendments require EC re-approval.',
    sample: null,
  },

  'Informed Consent Form (ICF)': {
    ref: 'NDCT Rules 2019 Schedule I; ICH E6(R3) GCP; ICMR Guidelines 2017',
    purpose: 'Document through which a participant is informed about the trial and provides voluntary written consent.',
    sections: [
      { heading: 'Information Elements (mandatory — NDCT Rules)', items: ['Study title (in simple non-technical language)','That participation is voluntary and can be withdrawn at any time without penalty','Purpose and background of the research','Study procedures — what will happen, number of visits, duration','All foreseeable risks and discomforts','Expected benefits (direct and to society)','Available alternative treatments outside the trial'] },
      { heading: 'Rights & Protection', items: ['Confidentiality: how participant data will be stored and protected (ICMR data sharing policy)','Compensation for travel, food, and lost wages (if any)','Compensation and free treatment for trial-related injury (mandatory per NDCT Rules — insurance details)','Contact details of PI and EC for medical questions and complaints','CTRI registration number and where results will be published'] },
      { heading: 'Consent Process', items: ['Participant signature (or thumb impression + independent witness for illiterate participants)','Legally acceptable representative signature (for minors / impaired capacity)','PI or delegated investigator signature and date','Date of consent (must be before any study procedure)','Audio-Visual Aid (AVA): mandatory for illiterate participants — NDCT Rules 2019'] },
      { heading: 'Language Requirement', items: ['English version (primary)','Local language translation — mandatory (each site state language)','Both versions must be reviewed and approved by the Ethics Committee','Re-consent required if protocol is amended and participant is affected'] },
    ],
    format: 'NDCT Rules compliant. Both English + local language versions required. EC-approved.',
    sample: null,
  },

  'Drug Master File (DMF)': {
    ref: 'CDSCO DMF Guidelines; EDQM ASMF format; USFDA 21 CFR 314.420',
    purpose: 'Confidential submission to regulatory authority containing detailed manufacturing information about the API. Referenced by applicant in their NDA without disclosing confidential details.',
    sections: [
      { heading: 'Part I — Administrative (Open Part)', items: ['DMF holder name, address, contact','Product name (INN), CAS number, molecular formula and weight','Manufacturing sites for each synthesis step','Statement of commitment to update DMF for any changes'] },
      { heading: 'Part II — Drug Substance Information (Open Part — shared with applicant)', items: ['General properties of API (physical, chemical, stereochemistry)','Manufacturer list and manufacturing site addresses','Brief manufacturing process description (without confidential details)','Specification: all tests, methods, and acceptance criteria (IP/BP/USP or in-house)','Certificate of Analysis (COA) — recent commercial batch','Container closure system description and specifications','Stability data summary (accelerated + long-term per ICH Q1A)'] },
      { heading: 'Part III — Confidential Manufacturing Details (Closed Part — CDSCO only)', items: ['Detailed step-by-step synthesis / manufacturing process with reagents, solvents, conditions','In-process controls at each manufacturing step','Process validation data','Impurity profile: identification, fate, and purging rationale (ICH Q3A)','Genotoxic impurity control strategy (ICH M7)'] },
      { heading: 'Letter of Access', items: ['Letter of Access / Right of Reference issued by DMF holder to applicant','Allows CDSCO to reference DMF during NDA review without applicant seeing closed part','DMF reference number (CDSCO assigns after filing)'] },
    ],
    format: 'CTD format (Module 3.2.S). Submitted directly by API manufacturer. Reference number cited in NDA.',
    sample: null,
  },

  'Product Summary Sheet': {
    ref: 'WHO COPP Format — WHO Technical Report Series No. 1010, Annex 10',
    purpose: 'One-page product-specific summary sheet required for COPP application. One sheet per product.',
    sections: [
      { heading: 'Product Identification', items: ['Product name (brand and INN)','Dosage form, strength, pack size(s)','Route of administration','ATC code (if applicable)'] },
      { heading: 'Manufacturing', items: ['Name and address of Marketing Authorisation Holder','Name and address of each manufacturing site (API synthesis, formulation, primary packaging, secondary packaging — list each separately)','Manufacturing licence number(s)'] },
      { heading: 'Regulatory Status', items: ['Country of marketing authorisation: India','Marketing authorisation number and date of first approval in India','Current status: currently marketed / approved but not currently marketed','Approved therapeutic indications (as per CDSCO approval)','Approved dosage regimen'] },
      { heading: 'Product Quality', items: ['Active ingredient(s) with quantity per unit','Complete excipient list (qualitative — all excipients)','Approved shelf life and storage conditions (exact statement)','Key contra-indications (from approved PI)'] },
    ],
    format: 'Tabular one-page summary. One per product. Signed by QA Head.',
    sample: null,
  },

  'Annual Product Quality Review (APQR)': {
    ref: 'Schedule M D&C Rules 1945 (Revised 2023); ICH Q10 Pharmaceutical Quality System; EU GMP Chapter 1',
    purpose: 'Annual review of all batches manufactured in a calendar year to verify consistency of existing process and identify improvements.',
    sections: [
      { heading: 'Review Period and Scope', items: ['Product name, strength, dosage form','Review period (calendar year or rolling 12 months)','All batches manufactured, released, rejected, or recalled','Manufacturing site and licence number'] },
      { heading: 'Key Review Areas', items: ['Starting materials: review of all supplier COAs, any failures or rejections','In-process controls: summary of all in-process test results vs specification','Finished product testing: summary of all release test results for all batches','OOS / OOT investigations: number, root cause summary, CAPA closure status','Deviations and non-conformances: number and classification','Change controls implemented during the review period','Stability data review: status of ongoing studies, any failures','Customer complaints: number, nature, investigation outcomes'] },
      { heading: 'Conclusion', items: ['Assessment of process consistency (Cpk / process capability where applicable)','Identification of any trends requiring investigation or action','Recommendations for process improvement or specification revision','CAPA plan for any identified issues','Approval: QA Head signature with date'] },
    ],
    format: 'Annual controlled document. Typically 15–30 pages. Required for WHO-GMP and regulatory inspections.',
    sample: null,
  },

  'Free Sale Certificate (FSC)': {
    ref: 'CDSCO / State FDA guidelines for export certification',
    purpose: 'Certificate confirming that the product is freely sold in India without prescription or import restrictions. Required by some importing countries alongside COPP.',
    sections: [
      { heading: 'Certificate Must State', items: ['Product name (INN + brand), strength, dosage form, pack size','Name and address of manufacturer','Manufacturing licence number','Statement: "The product is freely sold in the Indian market"','Statement: "The product meets the quality standards of the Drugs & Cosmetics Act 1940"','Marketing authorisation number and date','Issuing authority: CDSCO or State FDA','Date of issue and validity period'] },
    ],
    format: 'Issued by CDSCO Zonal Office or State FDA. Apply at ONDLS portal. Original required.',
    sample: null,
  },
};

// ── NEES FOLDER MAPPING ───────────────────────────────────────────────────────
const NEES_FOLDERS = {
  form24_25:  ['1_Administrative','2_Premises_Site','3_Technical_Staff','4_Plant_Machinery','5_Manufacturing_Product'],
  form27_28:  ['1_Administrative','2_Premises_Cleanrooms','3_Technical_Staff','4_Plant_Equipment','5_Sterile_Validation','6_QC_Laboratory'],
  form40_41:  ['1_Administrative_Legal','2_Regulatory_GMP','3_Technical_Dossier'],
  form8_10:   ['1_Administrative'],
  form44_nda: ['M1_Administrative','M2_CTD_Summaries','M3_Quality_CMC','M4_Nonclinical','M5_Clinical'],
  form45_ct:  ['1_Administrative','2_Protocol_IB','3_Ethics','4_Site_Investigator'],
  copp:       ['1_Application_Admin','2_Regulatory_Licences','3_GMP_Quality','4_Product_Technical'],
  who_gmp:    ['1_Application_Admin','2_GMP_Documents','3_Quality_System'],
  form19_20:  ['1_Administrative'],
  form21_20g: ['1_Administrative'],
  md5_md9:    ['1_Administrative','2_Technical_File','3_Clinical_Evidence'],
  default:    ['1_Administrative','2_Documents'],
};

// ── CATEGORIES DATA ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id:'mfg', label:'Manufacturing Licences', icon:'🏭',
    color:'#1A3D6B', light:'#EEF4FF',
    authority:'State FDA (State Licensing Authority)',
    apps:[
      { id:'form24_25', label:'Form 24 / Form 25',
        sublabel:'Non-sterile FDF — Tablets, Capsules, Liquids, Semisolids',
        authority:'State FDA', timeline:'30–90 days', portal:'ONDLS Portal', validity:'Perpetual (5-yr retention fee)',
        description:'Manufacturing licence for non-biological drugs other than Schedule C, C(1) and X.',
        sections:[
          { title:'A. Administrative', folder:'1_Administrative', docs:[
            [M,'Covering letter — dosage forms, product list, purpose','Covering letter'],
            [M,'Application in Form 24 — duly filled and signed','Form 24 Application'],
            [M,'Fee payment challan (ONDLS / GRAS / State treasury)','Fee Challan'],
            [M,'Firm constitution: Partnership deed / MOA+AOA+CIN / Trust deed','Firm Constitution Documents'],
            [M,'Photo ID and address proof — all directors/partners (Aadhaar, PAN, Passport)','KYC Documents'],
            [M,'Power of Attorney in favour of authorised signatory (stamp paper)','Power of Attorney'],
          ]},
          { title:'B. Premises / Site', folder:'2_Premises_Site', docs:[
            [M,'Site plan and layout — architect-certified, to scale, per Schedule M','Site plan and layout'],
            [M,'Ownership / rent / lease / allotment letter for premises (registered)','Ownership / Lease Deed'],
            [M,'Property tax receipt or utility bill for premises','Premises Tax Receipt'],
            [M,'Consent to Establish — State Pollution Control Board (SPCB/MPCB)','Pollution Control Board NOC'],
            [M,'Consent to Operate — State Pollution Control Board','Consent to Operate Certificate'],
            [M,'NOC from Dept of Industrial Safety & Health (DISH)','DISH NOC'],
            [C,'Fire NOC from local fire authority (state-specific)','Fire NOC'],
          ]},
          { title:'C. Technical Staff', folder:'3_Technical_Staff', docs:[
            [M,'List of technical staff — Manufacturing Section (B.Pharm/M.Pharm/B.Sc Chem/B.Tech)','Staff List — Manufacturing Section'],
            [M,'List of technical staff — QC / Testing Section','Staff List — QC Section'],
            [M,'Appointment / Acceptance letters — all technical staff','Appointment Letters'],
            [M,'Educational qualifications — all technical staff (attested)','Qualification Certificates'],
            [M,'Pharmacy Council registration certificate for pharmacists','Pharmacy Council Registration'],
            [M,'Experience certificates of all technical staff','Experience Certificates'],
          ]},
          { title:'D. Plant, Machinery & Equipment', folder:'4_Plant_Machinery', docs:[
            [M,'List of production machinery with make, model, specifications','Equipment List — Production'],
            [M,'List of QC laboratory instruments','Equipment List — QC Laboratory'],
            [M,'Calibration certificates for critical instruments','Calibration Certificates'],
            [M,'Equipment qualification records (DQ/IQ/OQ)','Equipment Qualification Records'],
            [C,'AHU installation and validation certificate','AHU Validation Certificate'],
            [C,'Water system validation records (Purified Water)','Water System Validation'],
          ]},
          { title:'E. Manufacturing & Product', folder:'5_Manufacturing_Product', docs:[
            [M,'Product list — INN, dosage form, strength, schedule','Product List'],
            [M,'Master Formula Record (MFR) — per dosage form category','Master Formula Record (MFR)'],
            [M,'Schedule M compliance declaration — QA Head + MD signature','Schedule M compliance declaration'],
            [M,'Master SOP list (production, QC, HVAC, water, cleaning, pest control)','Master SOP List'],
            [C,'Process flow chart (for API / bulk drug)','Process Flow Chart'],
            [C,'Stability data — 3 batches: 40°C/75%RH (6m) + 30°C/65%RH (12m+) ICH Q1A Zone IVb','Stability data'],
            [C,'Site Master File (SMF)','Site Master File (SMF)'],
          ]},
        ]
      },
      { id:'form27_28', label:'Form 27 / Form 28',
        sublabel:'Sterile Products / Injectables — Schedule C and C1',
        authority:'State FDA + CDSCO (Joint Inspection)', timeline:'60–120 days', portal:'ONDLS Portal', validity:'Perpetual',
        description:'Sterile products — injectables, infusions, ophthalmic preparations. Joint CDSCO + State FDA inspection. Schedule M Part II applies.',
        sections:[
          { title:'A. Administrative', folder:'1_Administrative', docs:[
            [M,'Covering letter','Covering letter'],
            [M,'Application in Form 27 — CDSCO Zonal Office + State FDA','Form 27 Application'],
            [M,'Fee payment challan','Fee Challan'],
            [M,'Firm constitution, KYC, Power of Attorney','Firm Constitution Documents'],
            [M,'Schedule M Part II compliance declaration — sterile products','Schedule M compliance declaration'],
          ]},
          { title:'B. Premises & Cleanrooms', folder:'2_Premises_Cleanrooms', docs:[
            [M,'Site plan and layout — cleanroom classification (Grade A/B/C/D zones)','Site plan and layout'],
            [M,'Premises ownership / lease documents','Ownership / Lease Deed'],
            [M,'Pollution Control Board NOC (Establish + Operate)','Pollution Control Board NOC'],
            [M,'HVAC design and qualification report — cleanroom classification (EU GMP Annex 1)','HVAC Design & Qualification'],
            [M,'Environmental monitoring data — viable + non-viable particle counts','Environmental Monitoring Data'],
          ]},
          { title:'C. Sterile Process Validation', folder:'3_Sterile_Validation', docs:[
            [M,'Autoclave / steriliser validation (F0 studies, SAL 10⁻⁶)','Autoclave Validation Report'],
            [M,'Water for Injection (WFI) validation — TOC, conductivity, LAL endotoxin','WFI System Validation'],
            [M,'Aseptic fill process validation — Media Fill / APS (3 consecutive runs)','Media Fill / APS Records'],
            [M,'Container closure integrity testing (CCIT) data','CCIT Data'],
            [M,'Filter integrity test data (bubble point / forward flow — 0.22μ membrane)','Filter Integrity Test Data'],
            [C,'Lyophilisation cycle validation (freeze-dried products)','Lyophilisation Validation'],
          ]},
          { title:'D. QC Laboratory', folder:'4_QC_Laboratory', docs:[
            [M,'Sterility testing lab design (ISO Class 5 isolator / LAF)','Sterility Lab Design'],
            [M,'Sterility testing SOPs (IP / BP / USP methodology)','Sterility Testing SOPs'],
            [M,'LAL endotoxin testing method validation','LAL Endotoxin Validation'],
            [M,'Bioburden testing SOPs with alert/action limits','Bioburden Testing SOP'],
          ]},
        ]
      },
      { id:'form24a_25a', label:'Form 24-A / Form 25-A',
        sublabel:'Loan Licence — Contract Manufacturing',
        authority:'State FDA', timeline:'30–60 days', portal:'ONDLS Portal', validity:'Perpetual',
        description:'Licence for companies outsourcing manufacturing to a licensed principal facility.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Covering letter stating products and principal licensee details','Covering letter'],
            [M,'Application in Form 24-A','Form 24-A Application'],
            [M,'Fee payment challan','Fee Challan'],
            [M,'Copy of valid manufacturing licence (Form 25/28) of Principal Licensee','Principal Licence (Form 25/28)'],
            [M,'Loan Licence Agreement / MOU — Loan Licensee + Principal Licensee (stamp paper)','Loan Licence Agreement / MOU'],
            [M,'Firm constitution documents of Loan Licensee','Firm Constitution Documents'],
            [M,'Technical staff (Qualified Person) details at Loan Licensee','Staff Qualifications — Loan Licensee'],
            [M,'List of all products under loan licence','Product List'],
            [C,'WHO-GMP certificate of Principal Licensee','WHO-GMP certificate'],
            [C,'Quality Agreement between Loan and Principal Licensee','Quality Agreement'],
          ]},
        ]
      },
      { id:'form24f_25f', label:'Form 24-F / Form 25-F',
        sublabel:'Schedule X — Psychotropics / Controlled Substances',
        authority:'State FDA + NCB', timeline:'60–90 days', portal:'ONDLS Portal', validity:'Perpetual',
        description:'Manufacturing licence for Schedule X (psychotropic/controlled) drugs. NDPS Act compliance mandatory.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Application in Form 24-F','Form 24-F Application'],
            [M,'NOC from Narcotics Control Bureau (NCB) / State Narcotics Dept','NCB / Narcotics NOC'],
            [M,'All documents as in Form 24/25 (non-sterile manufacturing)','Form 24/25 Documents'],
            [M,'Double-lock storage facility design plan for Schedule X substances','Double-lock Storage Plan'],
            [M,'Designated Responsible Person details for Schedule X compliance','Schedule X Responsible Person Details'],
            [M,'Quota letter from Narcotics Commissioner','Narcotics Quota Letter'],
          ]},
        ]
      },
    ]
  },
  {
    id:'import', label:'Import Licences', icon:'📦',
    color:'#1E6B3A', light:'#E8F5EE',
    authority:'CDSCO — Central (SUGAM Portal)',
    apps:[
      { id:'form40_41', label:'Form 40 / Form 41',
        sublabel:'Import Registration Certificate — Foreign Manufacturer',
        authority:'CDSCO (Central)', timeline:'6–12 months', portal:'SUGAM Portal', validity:'5 years',
        description:'Mandatory first step for all foreign manufacturers before import licence. Includes dossier review.',
        sections:[
          { title:'A. Administrative / Legal', folder:'1_Administrative_Legal', docs:[
            [M,'Application in Form 40 — signed by foreign manufacturer or Indian agent','Form 40 Application'],
            [M,'Power of Attorney — notarised + apostilled by Indian Embassy in country of origin','Power of Attorney'],
            [M,'Undertaking in Form 9 — manufacturer quality compliance','Form 9 (Undertaking)'],
            [M,'Valid Wholesale Drug Licence of Indian authorised agent','Indian Agent Wholesale Licence'],
            [M,'Fee payment via SUGAM / BharatKosh','Fee Receipt'],
          ]},
          { title:'B. Regulatory / GMP', folder:'2_Regulatory_GMP', docs:[
            [M,'GMP / Manufacturing licence from national regulatory authority of country of origin','Foreign Manufacturing Licence / GMP'],
            [M,'WHO-GMP certificate or FDA EIR / EMA GMP cert / TGA licence','WHO-GMP certificate'],
            [M,'Free Sale Certificate from country of origin','Free Sale Certificate (FSC)'],
          ]},
          { title:'C. Technical / Product Dossier', folder:'3_Technical_Dossier', docs:[
            [M,'CTD dossier — Modules 2–3 quality sections minimum','CTD Dossier (Abridged)'],
            [M,'Certificate of Analysis (COA) — min 3 commercial batches per product','Certificate of Analysis (COA)'],
            [M,'Stability data — 40°C/75%RH (6m) + 30°C/65%RH (12m+) per ICH Q1A Zone IVb','Stability data'],
            [M,'Finished product specification','Product Specification'],
            [M,'Package Insert / SmPC (approved in country of origin)','Package Insert / SmPC'],
            [M,'Proposed label for Indian market — per D&C Rules Rule 96','Indian Market Label'],
            [C,'Drug Master File (DMF) / ASMF reference letter (if API outsourced)','Drug Master File (DMF)'],
            [C,'Bioequivalence study report (for generic products)','BE Study Report'],
          ]},
        ]
      },
      { id:'form8_10', label:'Form 8 / Form 10',
        sublabel:'Import Licence — Drugs (excl. Schedule X)',
        authority:'CDSCO (Central)', timeline:'30–60 days', portal:'SUGAM Portal', validity:'5 years',
        description:'Main import licence after valid RC exists. Apply via SUGAM.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Covering letter on importer company letterhead','Covering letter'],
            [M,'Application in Form 8','Form 8 Application'],
            [M,'Copy of valid Registration Certificate — Form 41 (must be current)','Registration Certificate (Form 41)'],
            [M,'Valid Wholesale Drug Licence of Indian importer','Wholesale Drug Licence'],
            [M,'Fee payment challan (SUGAM)','Fee Receipt'],
            [M,'Product list — INN, strength, dosage form, pack','Product List'],
            [C,'Fresh Form 9 undertaking (if RC renewed or manufacturer changed)','Form 9 (Undertaking)'],
          ]},
        ]
      },
    ]
  },
  {
    id:'nda', label:'New Drug Applications', icon:'💊',
    color:'#C05000', light:'#FFF0E6',
    authority:'CDSCO (Central) — SUGAM Portal — NDCT Rules 2019',
    apps:[
      { id:'form44_nda', label:'Form 44 — NDA / ANDA',
        sublabel:'New Drug Application / Generic Drug Application',
        authority:'CDSCO (Central)', timeline:'12–24 months (NDA); 6–12 months (ANDA)', portal:'SUGAM Portal', validity:'Perpetual post-approval',
        description:'Primary application for marketing authorisation. CTD format mandatory per NDCT Rules 2019.',
        sections:[
          { title:'Module 1 — Administrative', folder:'M1_Administrative', docs:[
            [M,'Covering letter with product details and submission index','Covering letter'],
            [M,'Form 44 — duly filled, signed, stamped on each page','Form 44 Application'],
            [M,'Power of Attorney — notarised + apostilled (foreign manufacturers)','Power of Attorney'],
            [M,'Fee payment receipt from BharatKosh / SUGAM','Fee Receipt'],
            [M,'Manufacturing licence Form 25/28 OR Import RC (Form 41) + Form 10','Manufacturing / Import Licence'],
            [M,'Regulatory approval status in ICH countries (FDA, EMA, PMDA)','Regulatory Status in ICH Countries'],
            [M,'Patent status declaration (Section 8, Patents Act 1970)','Patent Status Declaration'],
            [M,'Draft label for Indian market — per D&C Rules','Indian Market Label'],
            [M,'Package Insert (PI) — Indian format','Package Insert (PI)'],
            [M,'Patient Information Leaflet (PIL)','Patient Information Leaflet (PIL)'],
            [M,'Undertaking in Form 51 (for brand/trade name marketing)','Form 51 Undertaking'],
            [C,'Bridging study protocol / waiver justification (for NCEs)','Bridging Study Protocol'],
            [C,'Ethics Committee approvals for Indian studies','Ethics Committee approval'],
          ]},
          { title:'Module 2 — CTD Summaries', folder:'M2_CTD_Summaries', docs:[
            [M,'2.3 Quality Overall Summary (QOS) — per ICH M4Q(R1)','Quality Overall Summary (QOS)'],
            [M,'2.4 Nonclinical Overview','Nonclinical Overview'],
            [M,'2.5 Clinical Overview','Clinical Overview'],
            [M,'2.6 Nonclinical Written and Tabulated Summaries','Nonclinical Written Summaries'],
            [M,'2.7 Clinical Summary','Clinical Summary'],
          ]},
          { title:'Module 3 — Quality / CMC', folder:'M3_Quality_CMC', docs:[
            [M,'3.2.S.1–S.7 Drug Substance — manufacture, characterisation, control, stability','Drug Substance CMC (3.2.S)'],
            [M,'3.2.P.1–P.8 Drug Product — composition, development, manufacture, control, stability','Drug Product CMC (3.2.P)'],
            [M,'Drug Master File (DMF) / ASMF reference letter (if API outsourced)','Drug Master File (DMF)'],
            [M,'Stability data — 3 batches; 40°C/75%RH (6m) + 30°C/65%RH (12m+) Zone IVb','Stability data'],
            [M,'Bioequivalence study report (ANDA/generic — 80–125% CI per Schedule Y)','BE Study Report'],
          ]},
          { title:'Module 4 — Nonclinical', folder:'M4_Nonclinical', docs:[
            [M,'Safety pharmacology (ICH S7A/S7B)','Pharmacology Study Reports'],
            [M,'ADME studies — single and repeat dose PK','ADME Study Reports'],
            [M,'Toxicology — single dose, repeat dose, genotoxicity (ICH S2)','Toxicology Study Reports'],
            [C,'Reproductive and developmental toxicity (ICH S5)','Reproductive Toxicity Studies'],
            [C,'Carcinogenicity studies (ICH S1) — for long-term use drugs','Carcinogenicity Studies'],
          ]},
          { title:'Module 5 — Clinical', folder:'M5_Clinical', docs:[
            [M,'Phase I clinical study reports','Phase I Study Reports'],
            [M,'Phase II clinical study reports','Phase II Study Reports'],
            [M,'Phase III pivotal RCT reports','Phase III Study Reports'],
            [M,'Indian bridging study data OR waiver justification (ICH E5)','Indian Bridging Study / Waiver'],
            [M,'Ethics Committee approval letters — all Indian study sites','Ethics Committee approval'],
            [M,'Informed Consent Form (ICF) — English + local language','Informed Consent Form (ICF)'],
            [M,'CTRI registration number for all Indian trials','CTRI Registration Certificate'],
            [M,'Clinical Trial Protocol + amendments for Indian studies','Clinical Trial Protocol'],
          ]},
        ]
      },
      { id:'form45_ct', label:'Form 45 — Clinical Trial',
        sublabel:'Phase I / II / III / IV Clinical Trial Permission',
        authority:'CDSCO + Ethics Committee', timeline:'6–12 weeks', portal:'SUGAM Portal', validity:'Per trial duration',
        description:'Permission to conduct clinical trials in India. CTRI registration mandatory before enrolment.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Application in Form 44 (for clinical trial permission)','Form 44 Application'],
            [M,'Clinical Trial Protocol (full — objectives, design, endpoints, statistics)','Clinical Trial Protocol'],
            [M,"Investigator's Brochure (IB) — updated","Investigator's Brochure (IB)"],
            [M,'Phase I safety/PK data (if applying for Phase II/III)','Phase I Study Reports'],
            [M,'Ethics Committee approval from CDSCO-registered EC','Ethics Committee approval'],
            [M,'Informed Consent Form (ICF) — English + local language','Informed Consent Form (ICF)'],
            [M,'Principal Investigator CV and GCP training certificate','Investigator CV + GCP Certificate'],
            [M,'Audio-Visual Aid (AVA) for illiterate participants — mandatory','Audio-Visual Aid (AVA)'],
            [M,'Compensation / insurance details per NDCT Rules Schedule I','Insurance / Compensation Documents'],
            [C,'Regulatory approvals from other countries (multinational trial)','Foreign Regulatory Approvals'],
          ]},
        ]
      },
    ]
  },
  {
    id:'copp', label:'COPP / Export Certificates', icon:'🌐',
    color:'#7B3F00', light:'#FFF4E8',
    authority:'CDSCO (DCGI Office) — ONDLS Portal (mandatory from July 15, 2025)',
    apps:[
      { id:'copp', label:'COPP',
        sublabel:'Certificate of Pharmaceutical Product (WHO Format)',
        authority:'CDSCO — DCGI Office', timeline:'20–30 working days', portal:'ONDLS Portal', validity:'2–3 years',
        description:'WHO-format export certificate. Product-specific. ONDLS mandatory from July 2025. Physical files not accepted.',
        sections:[
          { title:'A. Application / Administrative', folder:'1_Application_Admin', docs:[
            [M,'Covering letter to ADC/DDC — destination country, product, purpose','Covering letter'],
            [M,'COPP application form via ONDLS portal (mandatory from July 2025)','COPP Application (ONDLS)'],
            [M,'Fee payment online — ONDLS / BharatKosh','Fee Receipt'],
            [M,'Product list: INN, strength, dosage form, pack, shelf life','Product List for COPP'],
          ]},
          { title:'B. Regulatory / Licences', folder:'2_Regulatory_Licences', docs:[
            [M,'Valid manufacturing licence — Form 25 or Form 28','Manufacturing Licence (Form 25/28)'],
            [M,'Product marketing authorisation in India (Form 46 / state approval)','Product Marketing Authorisation'],
            [M,'Product permission letters / NOC from CDSCO','Product Permission Letters'],
            [C,'Free Sale Certificate (FSC) if required by importing country','Free Sale Certificate (FSC)'],
          ]},
          { title:'C. GMP / Quality System', folder:'3_GMP_Quality', docs:[
            [M,'Current valid WHO-GMP certificate OR CDSCO GMP inspection clearance','WHO-GMP certificate'],
            [M,'Site Master File (SMF) — current, updated within last 12 months','Site Master File (SMF)'],
            [M,'Schedule M self-assessment / compliance checklist','Schedule M compliance declaration'],
            [M,'CDSCO / State FDA GMP inspection report (within last 2–3 years)','GMP Inspection Report'],
          ]},
          { title:'D. Product Technical (per product)', folder:'4_Product_Technical', docs:[
            [M,'Product Summary Sheet — INN, strength, dosage form, shelf life, storage, manufacturer','Product Summary Sheet'],
            [M,'Master Formula Record (MFR) — per product','Master Formula Record (MFR)'],
            [M,'Approved finished product specification','Product Specification'],
            [M,'Certificate of Analysis (COA) — 2–3 recent commercial batches','Certificate of Analysis (COA)'],
            [M,'Stability data summary — 40°C/75%RH + 30°C/65%RH Zone IVb','Stability data summary'],
            [M,'Approved Package Insert (PI) / SmPC','Package Insert / SmPC'],
            [M,'Approved label artwork','Label Artwork'],
            [C,'Bioequivalence data summary (for generic solid oral dosage forms)','BE Data Summary'],
          ]},
        ]
      },
      { id:'who_gmp', label:'WHO-GMP Certificate',
        sublabel:'Site GMP Certificate for Export / Tenders',
        authority:'CDSCO — DCGI Office', timeline:'45–90 days', portal:'ONDLS Portal', validity:'2–3 years',
        description:'Site-specific GMP certificate. Mandatory for UNICEF tenders, WHO Prequalification, government procurement.',
        sections:[
          { title:'Required Documents', folder:'1_Application_Admin', docs:[
            [M,'Application via ONDLS portal','WHO-GMP Application (ONDLS)'],
            [M,'Valid manufacturing licence (Form 25/28) — all relevant dosage forms','Manufacturing Licence (Form 25/28)'],
            [M,'Site Master File (SMF) — updated within last 12 months','Site Master File (SMF)'],
            [M,'Schedule M self-assessment / compliance checklist','Schedule M compliance declaration'],
            [M,'CDSCO GMP inspection report (within last 2–3 years)','GMP Inspection Report'],
            [M,'Product list at site with regulatory status','Product List with Regulatory Status'],
            [M,'Qualification and Validation Master Plan (VMP)','Validation Master Plan (VMP)'],
            [M,'Organisation chart with key personnel qualifications','Organisation Chart'],
            [M,'Annual Product Quality Review (APQR) — minimum one product','Annual Product Quality Review (APQR)'],
            [M,'OOS / deviation / CAPA summary (last 2 years)','OOS / CAPA Summary'],
            [M,'Master SOP list','Master SOP List'],
            [C,'NABL / ISO 17025 accreditation certificate for QC laboratory','NABL / ISO 17025 Certificate'],
            [C,'Internal / third-party GMP audit report (within 12 months)','GMP Audit Report'],
          ]},
        ]
      },
    ]
  },
  {
    id:'sale', label:'Sale & Distribution', icon:'🏪',
    color:'#5C2D91', light:'#F0EBF8',
    authority:'State FDA (State Licensing Authority)',
    apps:[
      { id:'form19_20', label:'Form 19 / Form 20',
        sublabel:'Retail Pharmacy Licence — Chemist / Medical Store',
        authority:'State FDA', timeline:'15–30 days', portal:'State FDA Portal / ONDLS', validity:'Perpetual',
        description:'Retail drug licence for pharmacy/chemist shops. Registered Pharmacist mandatory.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Application in Form 19','Form 19 Application'],
            [M,'Fee payment challan','Fee Challan'],
            [M,'Proof of premises (ownership / rental — registered)','Ownership / Lease Deed'],
            [M,'Site plan and layout (minimum 10 sq m)','Site plan and layout'],
            [M,'Registration certificate of Registered Pharmacist — Pharmacy Council','Pharmacy Council Registration'],
            [M,'Appointment letter of Registered Pharmacist','Appointment Letter — Pharmacist'],
            [M,'Educational qualification of pharmacist (B.Pharm / D.Pharm — attested)','Pharmacist Qualification Certificates'],
            [M,'Firm constitution documents','Firm Constitution Documents'],
            [M,'Photo ID and address proof of proprietor/directors','KYC Documents'],
            [M,'Declaration of cold storage / refrigerator availability','Cold Storage Declaration'],
          ]},
        ]
      },
      { id:'form21_20g', label:'Form 21 / Form 20-G',
        sublabel:'Wholesale Drug Licence — Distributor / C&F Agent',
        authority:'State FDA', timeline:'15–30 days', portal:'State FDA Portal / ONDLS', validity:'Perpetual',
        description:'Wholesale licence for bulk distribution to retailers, hospitals, institutions.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Application in Form 21','Form 21 Application'],
            [M,'Fee payment challan','Fee Challan'],
            [M,'Proof of premises (minimum 15 sq m as per state rules)','Premises Proof'],
            [M,'Site plan and layout with area measurements','Site plan and layout'],
            [M,'Details of Competent Person (Registered Pharmacist OR Graduate Science + 1yr exp)','Competent Person Details'],
            [M,'Appointment letter and qualification certificates of Competent Person','Competent Person Appointment'],
            [M,'Cold storage / refrigerator declaration for Schedule C/C1 drugs','Cold Storage Declaration'],
            [M,'Firm constitution documents','Firm Constitution Documents'],
            [M,'Photo ID and address proof of proprietor/directors/partners','KYC Documents'],
            [C,'Drug licence of principal company (if authorised C&F agent)','Principal Company Drug Licence'],
          ]},
        ]
      },
    ]
  },
  {
    id:'meddev', label:'Medical Devices', icon:'🩺',
    color:'#006B6B', light:'#E0F4F4',
    authority:'CDSCO — Medical Devices Rules 2017',
    apps:[
      { id:'md5_md9', label:'MD-5 / MD-9',
        sublabel:'Manufacturing Licence — Medical Devices',
        authority:'CDSCO (Class C/D) + State FDA (Class A/B)', timeline:'60–180 days', portal:'SUGAM Portal', validity:'Perpetual',
        description:'Manufacturing licence for medical devices. MD-5 for Class A/B, MD-9 for Class C/D. ISO 13485 mandatory for Class C/D.',
        sections:[
          { title:'Required Documents', folder:'1_Administrative', docs:[
            [M,'Application in Form MD-5 (Class A/B) or MD-9 (Class C/D)','MD-5 / MD-9 Application'],
            [M,'Proof of premises and site layout','Site plan and layout'],
            [M,'List of devices proposed with intended use','Device List with Intended Use'],
            [M,'ISO 13485 QMS certificate (mandatory for Class C/D)','ISO 13485 Certificate'],
            [M,'Technical File / Design Dossier per MDR 2017','Technical File / Design Dossier'],
            [M,'Risk Management File (ISO 14971)','Risk Management File (ISO 14971)'],
            [M,'Product test reports (applicable IS/IEC/ISO standards)','Product Test Reports'],
            [M,'Instructions for Use (IFU) draft','Instructions for Use (IFU)'],
            [M,'Post-Market Surveillance (PMS) plan','Post-Market Surveillance Plan'],
            [C,'Clinical evaluation report / clinical data (Class C/D)','Clinical Evaluation Report'],
            [C,'Sterilisation validation (for sterile devices)','Sterilisation Validation'],
            [C,'Biocompatibility report (ISO 10993) — body-contact devices','Biocompatibility Report (ISO 10993)'],
          ]},
        ]
      },
    ]
  },
];

// ── TEMPLATE PANEL ────────────────────────────────────────────────────────────
function TemplatePanel({ docName, catColor, onClose }) {
  const t = DOC_TEMPLATES[docName];
  if (!t) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ background: catColor||T.navy, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, fontSize:12, fontWeight:700, color:'#fff' }}>📄 {docName}</div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:3, padding:'2px 8px', fontSize:11, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:24, color:T.muted, textAlign:'center' }}>
        <div style={{ fontSize:32 }}>📋</div>
        <div style={{ fontSize:13, fontWeight:600, color:T.navy }}>Template Coming Soon</div>
        <div style={{ fontSize:11, lineHeight:1.7, maxWidth:260 }}>Detailed content template for "{docName}" will be added in the next update. Click any document marked with 📋 to view existing templates.</div>
      </div>
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ background: catColor||T.navy, padding:'10px 14px', flexShrink:0, display:'flex', alignItems:'flex-start', gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{docName}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', marginTop:2 }}>{t.ref}</div>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:3, padding:'2px 8px', fontSize:11, cursor:'pointer', flexShrink:0 }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
        <div style={{ background:'#EEF4FF', borderRadius:6, padding:'8px 12px', marginBottom:12, borderLeft:`3px solid ${catColor||T.navy}` }}>
          <div style={{ fontSize:9, fontWeight:700, color:T.navy, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Purpose</div>
          <div style={{ fontSize:11, color:T.text, lineHeight:1.6 }}>{t.purpose}</div>
        </div>
        {t.sections.map((sec,si) => (
          <div key={si} style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:catColor||T.navy, marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:18, height:18, background:catColor||T.navy, color:'#fff', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, flexShrink:0 }}>{si+1}</span>
              {sec.heading}
            </div>
            {sec.items.map((item,ii) => (
              <div key={ii} style={{ display:'flex', gap:8, padding:'4px 0', borderBottom:'1px solid #F3F4F6', alignItems:'flex-start' }}>
                <span style={{ color:catColor||T.mid, fontSize:10, flexShrink:0, marginTop:1 }}>▸</span>
                <span style={{ fontSize:11, color:T.text, lineHeight:1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{ background:'#F0FFF4', borderRadius:6, padding:'8px 12px', borderLeft:`3px solid ${T.green}` }}>
          <div style={{ fontSize:9, fontWeight:700, color:T.green, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Format / Notes</div>
          <div style={{ fontSize:11, color:T.text, lineHeight:1.6 }}>{t.format}</div>
        </div>
        {t.sample && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.navy, marginBottom:6 }}>📝 Sample Structure</div>
            <pre style={{ fontSize:10, background:'#1F2937', color:'#E5E7EB', padding:12, borderRadius:6, overflowX:'auto', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{t.sample}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CHECKLIST MODE ────────────────────────────────────────────────────────────
function ChecklistMode() {
  const [selCat, setSelCat] = useState(null);
  const [selApp, setSelApp] = useState(null);
  const [selDoc, setSelDoc] = useState(null);
  const [search, setSearch] = useState('');

  const cat = CATEGORIES.find(c=>c.id===selCat);
  const app = cat?.apps.find(a=>a.id===selApp);
  const allDocs = app ? app.sections.flatMap(s=>s.docs) : [];
  const hasTemplate = (name) => !!DOC_TEMPLATES[name];

  const searchResults = search.trim().length>1
    ? CATEGORIES.flatMap(c=>c.apps.filter(a=>
        a.label.toLowerCase().includes(search.toLowerCase())||
        a.sublabel.toLowerCase().includes(search.toLowerCase())
      ).map(a=>({...a,catId:c.id,catColor:c.color})))
    : [];

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Panel 1 — Categories */}
      <div style={{ width:190, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#F8FAFD', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'7px 10px', borderBottom:`1px solid ${T.border}` }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search forms..."
            style={{ width:'100%', padding:'5px 8px', border:`1px solid ${T.border}`, borderRadius:5, fontSize:11, boxSizing:'border-box', fontFamily:'inherit' }}/>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {CATEGORIES.map(c=>(
            <div key={c.id} onClick={()=>{ setSelCat(c.id); setSelApp(null); setSelDoc(null); setSearch(''); }}
              style={{ padding:'9px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                borderLeft: selCat===c.id?`4px solid ${c.color}`:'4px solid transparent',
                background: selCat===c.id?c.light:'transparent' }}
              onMouseOver={e=>{ if(selCat!==c.id) e.currentTarget.style.background=c.light+'AA'; }}
              onMouseOut={e=>{ if(selCat!==c.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ fontSize:12, fontWeight:700, color:selCat===c.id?c.color:T.text }}>{c.icon} {c.label}</div>
              <div style={{ fontSize:10, color:T.dim, marginTop:1 }}>{c.apps.length} applications</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 2 — Applications */}
      <div style={{ width:230, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'8px 12px', borderBottom:`1px solid ${T.border}`, background:cat?cat.light:T.bg, flexShrink:0 }}>
          {cat ? <><div style={{ fontSize:11, fontWeight:700, color:cat.color }}>{cat.icon} {cat.label}</div>
            <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{cat.authority}</div></>
           : <div style={{ fontSize:11, color:T.muted }}>← Select a category</div>}
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {(search.trim().length>1 ? searchResults : (cat?.apps||[])).map(a=>(
            <div key={a.id} onClick={()=>{ setSelApp(a.id); setSelDoc(null); if(a.catId) setSelCat(a.catId); setSearch(''); }}
              style={{ padding:'9px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                borderLeft: selApp===a.id?`4px solid ${cat?.color||T.navy}`:'4px solid transparent',
                background: selApp===a.id?(cat?.light||T.bg):'transparent' }}
              onMouseOver={e=>{ if(selApp!==a.id) e.currentTarget.style.background=T.bg; }}
              onMouseOut={e=>{ if(selApp!==a.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ fontSize:11, fontWeight:600, color:selApp===a.id?(cat?.color||T.navy):T.text }}>{a.label}</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2, lineHeight:1.4 }}>{a.sublabel}</div>
            </div>
          ))}
          {!cat && !search && (
            <div style={{ padding:'30px 14px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
              <div style={{ fontSize:11, lineHeight:1.6 }}>Select a category to browse applications</div>
            </div>
          )}
        </div>
      </div>

      {/* Panel 3 — Documents */}
      <div style={{ width: selDoc?310:undefined, flex:selDoc?'none':1, minWidth:selDoc?260:0,
        borderRight:selDoc?`1px solid ${T.border}`:'none', background:'#fff', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {app ? (<>
          <div style={{ background:cat?.color||T.navy, padding:'10px 14px', flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}>{app.label}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {[app.authority, app.timeline, app.validity].map((v,i)=>(
                <span key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.8)', background:'rgba(0,0,0,0.18)', padding:'1px 7px', borderRadius:2 }}>{v}</span>
              ))}
            </div>
          </div>
          <div style={{ padding:'5px 12px', borderBottom:`1px solid ${T.border}`, fontSize:10, display:'flex', gap:12, background:'#FAFAFA', flexShrink:0 }}>
            <span style={{ color:T.red, fontWeight:700 }}>◉ {allDocs.filter(d=>d[0]===M).length} Mandatory</span>
            <span style={{ color:T.green }}>○ {allDocs.filter(d=>d[0]===C).length} Conditional</span>
            <span style={{ color:T.dim, marginLeft:'auto' }}>📋 = template available</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {app.sections.map((sec,si)=>(
              <div key={si}>
                <div style={{ padding:'6px 12px', background:'#F0F4F8', borderBottom:`1px solid ${T.border}`, fontSize:11, fontWeight:700, color:T.navy, position:'sticky', top:0, zIndex:1 }}>
                  {sec.title}
                </div>
                {sec.docs.map(([type,desc,name],di)=>(
                  <div key={di} onClick={()=>setSelDoc(selDoc===name?null:name)}
                    style={{ display:'flex', gap:8, padding:'7px 12px', borderBottom:'1px solid #F3F4F6', cursor:'pointer',
                      background:selDoc===name?(cat?.light||'#EEF4FF'):'transparent',
                      borderLeft:selDoc===name?`3px solid ${cat?.color||T.navy}`:'3px solid transparent' }}
                    onMouseOver={e=>{ if(selDoc!==name) e.currentTarget.style.background='#F8FAFD'; }}
                    onMouseOut={e=>{ if(selDoc!==name) e.currentTarget.style.background='transparent'; }}>
                    <span style={{ fontSize:11, flexShrink:0, color:type===M?T.red:T.green, marginTop:1 }}>{type===M?'◉':'○'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:selDoc===name?600:400, color:selDoc===name?(cat?.color||T.navy):T.text }}>
                        {name} {hasTemplate(name)?'📋':''}
                      </div>
                      <div style={{ fontSize:9, color:T.muted, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ padding:'8px 12px', fontSize:10, color:T.muted, textAlign:'center', borderTop:`1px solid ${T.border}` }}>
              {allDocs.length} items · {allDocs.filter(d=>d[0]===M).length} mandatory · {allDocs.filter(d=>d[0]===C).length} conditional
            </div>
          </div>
        </>) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, color:T.muted, padding:30 }}>
            <div style={{ fontSize:36 }}>📋</div>
            <div style={{ fontSize:13, fontWeight:600, color:T.navy }}>Select an Application</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:8 }}>
              {CATEGORIES.map(c=>(
                <span key={c.id} onClick={()=>setSelCat(c.id)}
                  style={{ padding:'4px 10px', borderRadius:12, fontSize:11, background:c.light, color:c.color, cursor:'pointer', fontWeight:600, border:`1px solid ${c.color}30` }}>
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel 4 — Template */}
      {selDoc && (
        <div style={{ flex:1, background:'#FAFBFD', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <TemplatePanel docName={selDoc} catColor={cat?.color} onClose={()=>setSelDoc(null)}/>
        </div>
      )}
    </div>
  );
}

// ── PROJECTS MODE ─────────────────────────────────────────────────────────────
function ProjectsMode() {
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raisa_india_projects')||'[]'); } catch { return []; }
  });
  const [activeProjId, setActiveProjId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name:'', company:'', state:'', appId:'' });
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raisa_india_uploads')||'{}'); } catch { return {}; }
  });
  const [exporting, setExporting] = useState(false);

  // Persist uploads to localStorage whenever they change
  function updateUploads(updater) {
    setUploadedFiles(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('raisa_india_uploads', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Persist projects to localStorage on change
  const saveProjects = (list) => {
    setProjects(list);
    try { localStorage.setItem('raisa_india_projects', JSON.stringify(list)); } catch {}
  };

  const allApps = CATEGORIES.flatMap(c=>c.apps.map(a=>({...a,catId:c.id,catLabel:c.label,catColor:c.color})));
  const proj = projects.find(p=>p.id===activeProjId);
  const app  = proj ? allApps.find(a=>a.id===proj.appId) : null;
  const cat  = proj ? CATEGORIES.find(c=>c.id===proj.catId) : null;
  const projFiles = uploadedFiles[activeProjId]||{};
  const allDocs   = app ? app.sections.flatMap(s=>s.docs) : [];
  const uploaded  = allDocs.filter(d=>projFiles[d[2]]&&projFiles[d[2]].dataUrl);
  const pct       = allDocs.length ? Math.round((uploaded.length/allDocs.length)*100) : 0;

  function createProject() {
    if (!newForm.name||!newForm.appId) return;
    const selApp = allApps.find(a=>a.id===newForm.appId);
    const id = Date.now().toString();
    saveProjects([...projects, { id, ...newForm, catId:selApp?.catId, created:new Date().toLocaleDateString('en-IN') }]);
    setActiveProjId(id);
    setShowNew(false);
    setNewForm({ name:'', company:'', state:'', appId:'' });
  }

  function handleUpload(docName, file) {
    const reader = new FileReader();
    reader.onload = e => {
      const entry = { name:file.name, size:file.size, type:file.type, dataUrl:e.target.result };
      updateUploads(prev=>({ ...prev, [activeProjId]:{ ...(prev[activeProjId]||{}), [docName]:entry } }));
    };
    reader.readAsDataURL(file);
  }

  async function downloadNeeS() {
    if (!app||!proj||uploaded.length===0) return;
    setExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const slug = `${(proj.company||proj.name).replace(/[^a-zA-Z0-9]/g,'_')}_${app.label.replace(/[^a-zA-Z0-9]/g,'_')}`;
      const root = zip.folder(slug);

      // Add actual uploaded files in correct folder structure
      for (const sec of app.sections) {
        const folderName = sec.folder || sec.title.replace(/[^a-zA-Z0-9_\-]/g,'_');
        const folder = root.folder(folderName);
        for (const [,, name] of sec.docs) {
          const entry = projFiles[name];
          if (entry && entry.dataUrl) {
            // Convert base64 dataUrl back to binary
            const base64 = entry.dataUrl.split(',')[1];
            const ext = (entry.name||'file').split('.').pop() || 'pdf';
            const safeName = name.replace(/[^a-zA-Z0-9_\-\.]/g,'_');
            folder.file(`${safeName}.${ext}`, base64, { base64: true });
          }
        }
      }

      // index.html
      let idx = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>NeeS — ${proj.name}</title>
<style>*{box-sizing:border-box}body{font-family:Calibri,Arial,sans-serif;max-width:960px;margin:32px auto;padding:0 16px;color:#1F2937}
h1{color:#1A3D6B;border-bottom:3px solid #1A3D6B;padding-bottom:8px}
h2{color:#2B579A;margin:24px 0 8px;font-size:14px}
table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px}
th{background:#1A3D6B;color:#fff;padding:8px 10px;text-align:left}
td{padding:7px 10px;border-bottom:1px solid #e5e7eb}
tr:nth-child(even) td{background:#f8fafd}
.M{color:#991B1B;font-weight:700}.C{color:#1E6B3A}
.ok{color:#166534;font-weight:600}.miss{color:#9CA3AF}
.pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:#EEF4FF;color:#1A3D6B;margin:2px}
</style></head><body>
<h1>🇮🇳 NeeS Submission Package</h1>
<table><tr><th colspan="2">Submission Details</th></tr>
<tr><td><b>Project</b></td><td>${proj.name}</td></tr>
<tr><td><b>Company</b></td><td>${proj.company||'—'}</td></tr>
${proj.state?`<tr><td><b>State</b></td><td>${proj.state}</td></tr>`:''}
<tr><td><b>Application</b></td><td>${app.label} — ${app.sublabel}</td></tr>
<tr><td><b>Authority</b></td><td>${app.authority}</td></tr>
<tr><td><b>Portal</b></td><td>${app.portal}</td></tr>
<tr><td><b>Timeline</b></td><td>${app.timeline}</td></tr>
<tr><td><b>Created</b></td><td>${proj.created}</td></tr>
<tr><td><b>Progress</b></td><td><span class="pill">${uploaded.length} of ${allDocs.length} documents uploaded (${pct}%)</span></td></tr>
</table>`;

      for (const sec of app.sections) {
        idx += `<h2>${sec.title}</h2><table><tr><th width="12%">Type</th><th width="35%">Document Name</th><th width="53%">Status / Filename</th></tr>`;
        for (const [type,,name] of sec.docs) {
          const entry = projFiles[name];
          idx += `<tr><td class="${type}">${type==='M'?'◉ Mandatory':'○ Conditional'}</td>
<td>${name}</td>
<td class="${entry?'ok':'miss'}">${entry?'✓ '+(entry.name||entry):'— not yet uploaded'}</td></tr>`;
        }
        idx += '</table>';
      }
      idx += `<p style="color:#9CA3AF;font-size:11px;margin-top:32px">Generated by RAISA — CoLAB Pharma Services | NeeS Format | ${new Date().toLocaleDateString('en-IN')}</p></body></html>`;
      root.file('index.html', idx);

      // checklist.csv
      const csv = ['Type,Section,Document Name,Status,Filename',
        ...app.sections.flatMap(sec=>sec.docs.map(([type,,name])=>{
          const entry = projFiles[name];
          return `"${type==='M'?'Mandatory':'Conditional'}","${sec.title}","${name}","${entry?'Uploaded':'Missing'}","${entry?(entry.name||entry):''}"`;
        }))
      ].join('\n');
      root.file('checklist.csv', csv);

      root.file('README.txt',
`NeeS Submission Package
========================
Project     : ${proj.name}
Company     : ${proj.company||'—'}
Application : ${app.label} — ${app.sublabel}
Authority   : ${app.authority}
Portal      : ${app.portal}
Created     : ${proj.created}
Uploaded    : ${uploaded.length} of ${allDocs.length} documents (${pct}%)

HOW TO USE
----------
1. Open index.html in your browser to view the submission index
2. Check checklist.csv for full document status
3. All uploaded documents are in their respective section folders
4. Submit missing documents before final submission

Generated by RAISA — CoLAB Pharma Services
`);

      const blob = await zip.generateAsync({ type:'blob', compression:'DEFLATE' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${slug}_NeeS.zip`; a.click();
      URL.revokeObjectURL(url);
    } catch(e) { alert('Export error: '+e.message); }
    finally { setExporting(false); }
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:210, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#F8FAFD', display:'flex', flexDirection:'column' }}>
        <div style={{ background:T.navy, padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>My Projects</div>
          <button onClick={()=>setShowNew(true)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:4, padding:'3px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>+ New</button>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {projects.length===0 && (
            <div style={{ padding:'30px 14px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:24, marginBottom:8 }}>📁</div>
              <div style={{ fontSize:11, lineHeight:1.6 }}>No projects yet.<br/>Click + New to start.</div>
            </div>
          )}
          {projects.map(p=>{
            const pApp=allApps.find(a=>a.id===p.appId);
            const pCat=CATEGORIES.find(c=>c.id===p.catId);
            const pFiles=uploadedFiles[p.id]||{};
            const pDocs=pApp?pApp.sections.flatMap(s=>s.docs):[];
            const pUpl=pDocs.filter(d=>pFiles[d[2]]&&pFiles[d[2]].dataUrl).length;
            const ppct=pDocs.length?Math.round((pUpl/pDocs.length)*100):0;
            return (
              <div key={p.id}
                style={{ display:'flex', alignItems:'stretch', borderBottom:`1px solid ${T.border}`,
                  borderLeft:activeProjId===p.id?`4px solid ${pCat?.color||T.navy}`:'4px solid transparent',
                  background:activeProjId===p.id?(pCat?.light||T.bg):'transparent' }}>
                <div onClick={()=>setActiveProjId(p.id)}
                  style={{ flex:1, padding:'10px 12px', cursor:'pointer' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:activeProjId===p.id?(pCat?.color||T.navy):T.text }}>{p.name}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{pApp?.label||'—'}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                    <div style={{ flex:1, height:3, background:'#E5E7EB', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:ppct+'%', height:'100%', background:ppct===100?'#22C55E':(pCat?.color||T.navy) }}/>
                    </div>
                    <span style={{ fontSize:9, color:T.dim }}>{ppct}%</span>
                  </div>
                </div>
                <button
                  onClick={e=>{e.stopPropagation();if(confirm(`Delete "${p.name}"?`)){saveProjects(projects.filter(x=>x.id!==p.id));if(activeProjId===p.id)setActiveProjId(null);}}}
                  style={{ background:'transparent', border:'none', color:'#D1D5DB', fontSize:11, cursor:'pointer',
                    padding:'0 8px', borderLeft:`1px solid ${T.border}` }}
                  title="Delete project">✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      {proj&&app ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ background:cat?.color||T.navy, padding:'10px 16px', flexShrink:0, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{proj.name}{proj.company?` — ${proj.company}`:''}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{app.label} · {app.authority} · {app.portal}</div>
            </div>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{pct}%</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)' }}>{uploaded.length}/{allDocs.length} docs</div>
            </div>
            <button onClick={downloadNeeS} disabled={exporting||uploaded.length===0}
              style={{ padding:'8px 16px', background:uploaded.length===0?'rgba(255,255,255,0.15)':'#fff',
                color:uploaded.length===0?'rgba(255,255,255,0.35)':(cat?.color||T.navy),
                border:'none', borderRadius:6, fontSize:12, fontWeight:700,
                cursor:uploaded.length===0?'not-allowed':'pointer' }}>
              {exporting?'⏳ Packaging...':'⬇ Download NeeS'}
            </button>
          </div>
          <div style={{ height:4, background:'#E5E7EB', flexShrink:0 }}>
            <div style={{ width:pct+'%', height:'100%', background:pct===100?'#22C55E':(cat?.color||T.navy), transition:'width .3s' }}/>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {app.sections.map((sec,si)=>(
              <div key={si}>
                <div style={{ padding:'6px 14px', background:'#F0F4F8', borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:1, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:T.navy }}>{sec.title}</span>
                  <span style={{ fontSize:9, color:T.muted }}>
                    {sec.docs.filter(d=>projFiles[d[2]]).length}/{sec.docs.length} uploaded
                  </span>
                </div>
                {sec.docs.map(([type,desc,name],di)=>{
                  const f=projFiles[name];
                  return (
                    <div key={di} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 14px',
                      borderBottom:'1px solid #F3F4F6', background:f?'#F0FFF4':'transparent' }}>
                      <span style={{ fontSize:10, color:type===M?T.red:T.green, flexShrink:0, fontWeight:700 }}>{type===M?'◉':'○'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:f?600:400, color:f?T.green:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {f?`✓ ${name}`:name}
                        </div>
                        {!f && <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{desc.slice(0,70)}…</div>}
                        {f && <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{f.name}</div>}
                      </div>
                      <label style={{ cursor:'pointer', flexShrink:0 }}>
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" style={{ display:'none' }}
                          onChange={e=>{ if(e.target.files[0]){ handleUpload(name,e.target.files[0]); e.target.value=''; } }}/>
                        <span style={{ fontSize:10, padding:'3px 8px', borderRadius:3, display:'inline-block', fontWeight:600,
                          background:f?'#DCFCE7':'#EEF3FB', border:`1px solid ${f?'#86EFAC':'#BFD3EF'}`, color:f?T.green:T.mid }}>
                          {f?'↺ Replace':'↑ Upload'}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            ))}
            {uploaded.length===0 && (
              <div style={{ padding:'16px 14px', background:'#FFFBEB', borderTop:`1px solid ${T.border}`, fontSize:11, color:'#92400E' }}>
                ⚠️ Upload at least one document to enable NeeS package download.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, padding:40, color:T.muted }}>
          <div style={{ fontSize:40 }}>📁</div>
          <div style={{ fontSize:14, fontWeight:600, color:T.navy }}>{projects.length?'Select a project from the left':'Create your first project'}</div>
          <div style={{ fontSize:12, textAlign:'center', maxWidth:340, lineHeight:1.7 }}>Upload documents for each requirement, then download the complete set as a NeeS (Non-eCTD Electronic Submission) package organised in the correct folder structure.</div>
          <button onClick={()=>setShowNew(true)} style={{ padding:'10px 24px', background:T.navy, color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Create New Project</button>
        </div>
      )}

      {/* New project modal */}
      {showNew && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:440, boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy, marginBottom:20 }}>🆕 New Regulatory Project</div>
            {[
              { key:'name', label:'Project Name *', ph:'e.g. ABC Pharma — Form 24/25 Application' },
              { key:'company', label:'Company / Client Name', ph:'e.g. ABC Pharmaceuticals Pvt Ltd' },
              { key:'state', label:'State / Authority', ph:'e.g. Maharashtra FDA, CDSCO Delhi' },
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
                <input value={newForm[f.key]} onChange={e=>setNewForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.ph} style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`, borderRadius:6, fontSize:12, boxSizing:'border-box', fontFamily:'inherit' }}/>
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Application Type *</label>
              <select value={newForm.appId} onChange={e=>setNewForm(p=>({...p,appId:e.target.value}))}
                style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`, borderRadius:6, fontSize:12, fontFamily:'inherit' }}>
                <option value="">— Select application —</option>
                {CATEGORIES.map(c=>(
                  <optgroup key={c.id} label={`${c.icon} ${c.label}`}>
                    {c.apps.map(a=><option key={a.id} value={a.id}>{a.label} — {a.sublabel}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>{ setShowNew(false); setNewForm({name:'',company:'',state:'',appId:''}); }}
                style={{ flex:1, padding:'9px', border:`1px solid ${T.border}`, borderRadius:6, background:'#fff', color:T.text, fontSize:12, cursor:'pointer' }}>Cancel</button>
              <button onClick={createProject} disabled={!newForm.name||!newForm.appId}
                style={{ flex:2, padding:'9px', background:(!newForm.name||!newForm.appId)?'#9CA3AF':T.navy,
                  color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:(!newForm.name||!newForm.appId)?'not-allowed':'pointer' }}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT EXPORT ───────────────────────────────────────────────────────────────
export function IndiaRegulatoryApp() {
  const [mode, setMode] = useState('checklist');
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:"'Segoe UI',Arial,sans-serif", overflow:'hidden' }}>
      <div style={{ background:T.navy, display:'flex', alignItems:'center', padding:'0 16px', height:42, flexShrink:0, gap:2 }}>
        <div style={{ fontSize:13, fontWeight:800, color:'#fff', marginRight:12 }}>🇮🇳 India Regulatory</div>
        {[{ id:'checklist',label:'✓  Checklist & Templates' },{ id:'projects',label:'📁  Projects & NeeS Download' }].map(tab=>(
          <button key={tab.id} onClick={()=>setMode(tab.id)}
            style={{ padding:'0 16px', height:42, border:'none', cursor:'pointer',
              background:mode===tab.id?'rgba(255,255,255,0.15)':'transparent',
              color:mode===tab.id?'#fff':'rgba(255,255,255,0.5)',
              fontSize:12, fontWeight:mode===tab.id?700:400, fontFamily:'inherit',
              borderBottom:mode===tab.id?'3px solid #fff':'3px solid transparent',
              transition:'all .15s' }}>
            {tab.label}
          </button>
        ))}
        <div style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.35)' }}>
          D&C Rules 1945 · NDCT Rules 2019 · MDR 2017
        </div>
      </div>
      <div style={{ flex:1, overflow:'hidden' }}>
        {mode==='checklist' && <ChecklistMode/>}
        {mode==='projects'  && <ProjectsMode/>}
      </div>
    </div>
  );
}
