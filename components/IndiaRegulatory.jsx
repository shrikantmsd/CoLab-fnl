'use client';
import { useState } from 'react';

const T = {
  navy:'#1A3D6B', mid:'#2B579A', bg:'#F0F4F8', white:'#FFFFFF',
  border:'#D1D5DB', muted:'#6B7280', text:'#1F2937', dim:'#9CA3AF',
  red:'#991B1B', green:'#166534',
};
const M = 'M', C = 'C';

/* ─── TEMPLATES ──────────────────────────────────────────────────────────── */
const TEMPLATES = [
  {
    key:'cover', match:['covering letter'],
    title:'Covering Letter', format:'Company Letterhead · PDF · Signed by Authorised Signatory',
    purpose:'Formal letter introducing the application. Must be on company letterhead, address the exact licensing authority, reference the form number and fee challan, and list all enclosures.',
    sections:[
      { heading:'Header Block', items:['Company name, full address, CIN/GSTIN, phone, email','Date in DD/MM/YYYY format','Application reference number (internal)','To: The Licensing Authority / CDSCO Zonal Officer / DCGI (as applicable)'] },
      { heading:'Subject Line', items:['Application for grant of [Form 24 / Form 27 / COPP / Form 44 etc.]','State: dosage forms, product categories, purpose'] },
      { heading:'Para 1 — Company Introduction', items:['Date of incorporation, CIN, registered address','Nature of business (pharmaceutical manufacturing / import / distribution)','Existing licence details if renewal/expansion (licence number, date)'] },
      { heading:'Para 2 — Purpose of Application', items:['Clearly state what is being applied for','List all dosage forms / products (if manufacturing licence)','Reference fee challan number and amount paid','Reference Form number submitted'] },
      { heading:'Para 3 — Compliance Declaration', items:['Declaration of compliance with Schedule M / D&C Rules 1945 / NDCT Rules 2019 (as applicable)','Confirm all required documents are enclosed as per checklist','Request for early inspection and grant of licence'] },
      { heading:'Closing and Enclosures', items:['Yours faithfully / Sincerely','Authorised Signatory name, designation, signature, company seal','Enclosures: numbered list matching all documents submitted'] },
    ]
  },
  {
    key:'site_plan', match:['site plan','layout drawing','layout of'],
    title:'Site Plan and Layout Drawing', format:'Architect-Certified · To scale (1:100 min) · PDF',
    purpose:'Architectural drawing of manufacturing premises showing all areas, dimensions, and flow patterns. Must comply with Schedule M for pharmaceutical manufacturing or Schedule T for ASU.',
    sections:[
      { heading:'Drawing Title Block', items:['Company name and full address','Scale (e.g. 1:100)','Total built-up area (sq m)','Floor designation (Ground / First / Basement)','Architect name, registration number, seal and signature'] },
      { heading:'Areas to Show (Schedule M compliance)', items:['Reception and visitor area','Raw material stores: quarantine / approved / rejected (clearly labelled)','Dispensing and weighing area (with dust extraction if powder)','Manufacturing rooms (by dosage form category)','Packaging: primary + secondary (separate areas)','Finished goods store (quarantine + approved)','QC laboratory (chemistry + microbiology)','Utility areas: HVAC plant, purified water system, boiler room','Wash area, gowning room, change rooms, toilet facilities'] },
      { heading:'Flow Diagrams (separate sheets)', items:['Personnel flow: entry → gowning → production → degowning → exit','Material flow: RM receipt → quarantine → dispensing → production → packaging → finished goods → dispatch','Waste disposal flow (solid waste, liquid effluent, reject materials)'] },
      { heading:'Dimensions Required', items:['Each room: length × width (in metres)','Total area of each room in sq m','Corridor widths (min 1.5 m for material movement per Sch M)','Ceiling heights (min 3.0 m for production areas per Sch M)','Door widths (min 1.2 m for bulk material areas)'] },
      { heading:'For Sterile Manufacturing (Form 27/28)', items:['Cleanroom classification: Grade A/B/C/D (EU GMP) or ISO 5/7/8','Pressure differential cascade (positive pressure in cleaner areas)','HVAC supply and return air positions','Airlocks between classified areas'] },
    ]
  },
  {
    key:'poa', match:['power of attorney'],
    title:'Power of Attorney (POA)', format:'Stamp Paper (state-specific value) · Notarised · Apostilled for foreign manufacturers',
    purpose:'Legal document authorising a person or entity to act on behalf of the company for regulatory submissions and communications with licensing authorities.',
    sections:[
      { heading:'Parties', items:['GRANTOR: Full legal name of company, registered address, CIN/company registration number','GRANTEE: Full name of authorised person/agent, designation, address, ID proof reference'] },
      { heading:'Recitals', items:['Company is engaged in [pharmaceutical manufacturing / import / distribution]','Company wishes to authorise Grantee for specific regulatory activities'] },
      { heading:'Scope of Authority Granted', items:['Sign and submit applications to CDSCO / State FDA on behalf of company','Appear before licensing authority, inspectors, and courts','Receive official communications and inspection notices','Sign affidavits, undertakings, and declarations for licensing','Pay prescribed fees on behalf of company'] },
      { heading:'Duration and Limitations', items:['Valid from [date] until revoked in writing OR valid until [specific date]','Restricted to regulatory / licensing purposes only','Cannot sub-delegate authority to another person'] },
      { heading:'Execution', items:['Board Resolution number and date authorising the POA','Director / MD signature with company seal (wet ink)','Grantee acceptance signature','Notary public signature, seal, and registration number'] },
      { heading:'For Foreign Manufacturers', items:['Notarised by notary public in country of origin','Apostilled under the Hague Convention (if country is signatory)','Authenticated by Indian Embassy (if country is not Hague signatory)','English translation with translator certification (if original in other language)'] },
    ]
  },
  {
    key:'sch_m', match:['schedule m compliance','gmp compliance declaration','gmp declaration'],
    title:'Schedule M Compliance Declaration', format:'Company Letterhead · Signed by QA Head and MD/Director',
    purpose:'Self-declaration confirming that the manufacturing premises and operations comply with Good Manufacturing Practices as specified in Schedule M of the Drugs & Cosmetics Rules 1945.',
    sections:[
      { heading:'Declaration Heading', items:['Company name, address, existing licence number (if any)','To: The Licensing Authority [State FDA / CDSCO Zonal Officer]','Subject: Declaration of compliance with Schedule M GMP requirements'] },
      { heading:'Personnel (Sch M Cl. 2)', items:['Qualified Technical Staff (QTS) names, designations, qualifications listed','Designated Qualified Person / Head of QA named','SOP for GMP training in place with training records maintained'] },
      { heading:'Premises (Sch M Cl. 3)', items:['Premises constructed and maintained per Schedule M specifications','All manufacturing areas are segregated and clearly demarcated','Adequate lighting (min 300 lux in general areas, 500 lux in inspection areas)','Temperature and humidity controlled as required per dosage form','Pest control programme operational with contracted pest control agency'] },
      { heading:'Equipment (Sch M Cl. 4)', items:['All equipment designed, installed, qualified, and calibrated','Preventive Maintenance schedule documented and followed','Equipment cleaning SOPs in place and validated (cleaning validation where required)','Critical instruments calibrated against traceable national/international standards'] },
      { heading:'Documentation (Sch M Cl. 5)', items:['Master Formula Records (MFR) prepared and approved for all products','Batch Manufacturing Records (BMR) generated for each batch','All SOPs approved, numbered, version-controlled, and accessible to relevant staff','Document retention policy in place per D&C Rules (minimum 1 year post expiry)'] },
      { heading:'Quality Control (Sch M Cl. 7)', items:['In-house QC laboratory established with all required equipment','All raw materials, in-process materials, and finished products tested before release','Reference standards sourced from IP/BP/USP pharmacopoeias or in-house qualified standards'] },
      { heading:'Signatories', items:['Head of Quality Assurance: Name, Qualification, Signature, Date','Managing Director / Director: Name, Signature, Company Seal, Date'] },
    ]
  },
  {
    key:'mfr', match:['master formula record','mfr'],
    title:'Master Formula Record (MFR)', format:'Controlled Document · QA Approved · Per product per batch size',
    purpose:'Complete manufacturing instructions for a specific product. Forms the master document from which each Batch Manufacturing Record is generated. Must be approved before use and version-controlled.',
    sections:[
      { heading:'1. Product Identification', items:['Product name: Brand name + INN (International Non-proprietary Name)','Dosage form and strength (e.g. Tablet 500mg)','Batch size: number of units AND total weight/volume','Product code / Manufacturing code','MFR version number and effective date','Date of preparation and approval'] },
      { heading:'2. Composition (per batch)', items:['Drug substance (API): INN, pharmacopoeial grade (IP/BP/USP), quantity per unit + batch quantity','Excipients: name, grade, function (binder/disintegrant/lubricant etc.), quantity per unit + batch quantity','Overage (if any) with written technical justification','Net theoretical yield at each stage'] },
      { heading:'3. Equipment List', items:['All equipment required with equipment ID numbers and capacity','Cleaning procedure reference (SOP number, SOP version)','Equipment status (dedicated or shared — if shared, contamination control measures)'] },
      { heading:'4. Manufacturing Process (Step-by-step)', items:['Each step numbered sequentially with responsible operator designation','Process parameters: time, speed (rpm), temperature, pressure, humidity','In-process controls at each critical step with acceptance criteria and limits','Yield calculation at each stage (actual vs theoretical) with acceptable range','Hold times and conditions (between steps, bulk hold before packaging)'] },
      { heading:'5. Packaging Instructions', items:['Primary packaging material specification (material, dimensions, printing)','Secondary packaging components (carton, shipper, insert)','Batch coding requirements (batch no., MFG date, EXP date, MRP — as per label)','Finished pack description'] },
      { heading:'6. Finished Product Specification', items:['Description (appearance, colour, shape)','Identification (specific chemical test or HPLC)','Assay / Potency (% of label claim — limits per pharmacopoeia or approved spec)','Related substances / Degradation products (individual and total limits)','Dissolution (% dissolved at stated time in stated medium)','Physical tests: hardness, friability, disintegration, weight variation (for tablets)','Water content (Karl Fischer — for moisture-sensitive products)','Microbiological limits (TAMC, TYMC — for non-sterile) or Sterility + Endotoxins (for sterile)'] },
      { heading:'7. Approvals', items:['Prepared by: Production / R&D staff name, signature, date','Checked by: QC / Formulation scientist name, signature, date','Approved by: QA Head name, signature, date'] },
    ]
  },
  {
    key:'coa', match:['certificate of analysis','coa'],
    title:'Certificate of Analysis (COA)', format:'QC Dept Letterhead · Signed QC Head · Per batch',
    purpose:'Official document certifying that a batch of drug substance or drug product has been tested against its approved specification and the results of all tests are provided.',
    sections:[
      { heading:'Product and Batch Details', items:['Product name (INN + brand name if applicable)','Dosage form and strength','Batch number and manufacturing date','Expiry date (based on approved shelf life)','Batch size and quantity tested','Manufacturing site name and address'] },
      { heading:'Test Results Table', items:['Column headers: Test | Method Reference | Specification | Result | Pass/Fail','Appearance / Physical description','Identification (IR correlation, HPLC RT, TLC Rf)','Assay / Potency: method + result (e.g. 99.2% w/w)','Related substances: individual named impurities + total (% each)','Dissolution: % released at specified time point','Disintegration time (if applicable)','Water content / Loss on Drying (%, Karl Fischer)','Hardness (kP range) and Friability (%) — for tablets','pH (for liquids, injectables)','Microbial limits: TAMC (CFU/g), TYMC (CFU/g) — for non-sterile','Sterility (pass/fail) + Bacterial Endotoxins (EU/mL or EU/unit) — for injectables'] },
      { heading:'Method References', items:['IP/BP/USP edition for pharmacopoeial methods','In-house method reference: SOP number + version (for non-compendial)','Analytical instrument ID and calibration status'] },
      { heading:'Conclusion and Release', items:['Statement: Complies / Does Not Comply with approved specification','Recommendation: Approved for release / Rejected / Under investigation'] },
      { heading:'Signatories', items:['Analysed by: Analyst name, sign, date','Checked by: Senior Analyst name, sign, date','Approved for release: QC Head name, sign, date, department stamp'] },
    ]
  },
  {
    key:'stability', match:['stability data','stability study','stability report'],
    title:'Stability Data / Study Report', format:'Technical Report · Per product per batch · ICH Q1A(R2) format',
    purpose:'Documents that the drug product remains within approved quality limits throughout its shelf life under defined storage conditions. India is ICH Zone IVb — use 30°C/65%RH as long-term condition.',
    sections:[
      { heading:'1. Study Design Summary', items:['Product name, dosage form, strength, manufacturer','Batch numbers (minimum 3 batches — pilot or commercial scale)','Storage conditions: Long-term 30°C±2°C / 65%±5%RH; Accelerated 40°C±2°C / 75%±5%RH','Packaging: same material and configuration as proposed commercial pack','Testing intervals: LT — 0, 3, 6, 9, 12, 18, 24, 36 months; ACC — 0, 3, 6 months','Photostability per ICH Q1B: 1.2 million lux·hr + 200 Wh/m² UV'] },
      { heading:'2. Parameters Tested (per time point)', items:['Appearance and description (visual inspection)','Assay / Potency (% of label claim, HPLC method)','Related substances / degradation products (individual + total, %)','Dissolution (% released at specified time, specified medium)','Water content / Loss on drying (%, Karl Fischer)','pH (for liquid formulations)','Viscosity / rheology (for semisolids and liquids)','Microbiological limits: TAMC, TYMC (for non-sterile)','Sterility + Bacterial endotoxins (for injectables)','Container appearance and integrity (each time point)'] },
      { heading:'3. Data Presentation Format', items:['Separate data tables for each storage condition and each batch','Rows: test parameters | Columns: time points (0M, 3M, 6M ... 36M)','Include specification limits as reference in header row','Flag any values approaching or exceeding specification limit','Note any significant changes (>5% assay change, new degradation product)'] },
      { heading:'4. Statistical Analysis (ICH Q1E)', items:['Regression analysis of assay and degradation data vs time','95% one-sided confidence interval (lower for assay, upper for impurities)','Poolability testing across batches (F-test, p>0.25 for pooling)','Shelf life determined from intersection of regression line with specification limit'] },
      { heading:'5. Conclusions and Commitment', items:['Proposed shelf life (e.g. 24 months / 36 months)','Proposed storage condition (e.g. Store below 30°C, protect from light and moisture)','Post-approval stability commitment: 1 batch/year/product/site','Accelerated stability: significant change criteria evaluated (ICH Q1A definition)','Any out-of-specification results: investigation results and impact assessment'] },
    ]
  },
  {
    key:'smf', match:['site master file','smf'],
    title:'Site Master File (SMF)', format:'WHO TRS 961 Annex 14 format · Updated annually · Version-controlled',
    purpose:'Comprehensive overview document describing all GMP-relevant activities at a manufacturing site. Required for WHO-GMP certificate, COPP, and regulated market regulatory submissions.',
    sections:[
      { heading:'1. General Site Information', items:['Site name, address, GPS coordinates, contact details (QA Head and site director)','Manufacturing licence number(s) with validity dates','Types of products manufactured (dosage forms listed)','Total headcount: production, QC, QA, technical, management, support','Outsourced / contracted activities (analytical testing, manufacturing steps, cleaning)'] },
      { heading:'2. Quality Management System', items:['PQS overview (Pharmaceutical Quality System per ICH Q10)','Quality Policy statement (brief)','Management review frequency and last date','CAPA system — types, tracking, closure timelines','Change Control system — categories and approval process','Risk Management approach (ICH Q9)'] },
      { heading:'3. Personnel', items:['Organisational chart (site-level, not corporate level)','Key personnel: QA Head, QC Head, Production Head, Site Director — qualifications + years of experience','Training programme: induction, GMP, role-specific, annual refresher','Medical health monitoring programme for production staff'] },
      { heading:'4. Premises, Equipment, Utilities', items:['Site layout overview: total area, buildings, construction year, last renovation','Utilities: purified water system (type, capacity, loop design), HVAC (classification zones), compressed air','Equipment list: major production and QC equipment with qualification status (IQ/OQ/PQ)','Preventive maintenance programme frequency','Calibration programme (internal + external)'] },
      { heading:'5. Documentation System', items:['Document numbering / coding system (SOPs, specs, protocols, reports)','Version control and supersession procedure','Change history retention','Document distribution and access control','Electronic vs paper system (if hybrid, describe both)'] },
      { heading:'6. Production', items:['Dosage forms manufactured with annual batch/volume data','API and starting material sourcing (approved vendor list, supplier qualification process)','Contamination control strategy (dedicated equipment, campaign manufacturing)','Process validation status (validation master plan reference, critical processes listed)'] },
      { heading:'7. Quality Control', items:['In-house tests vs outsourced tests (name of contract laboratory if outsourced)','Reference standards: primary (IP/BP/USP) and working standards','OOS procedure overview — investigation levels, escalation','Stability programme: products under study, conditions, schedule'] },
      { heading:'8. Distribution, Complaints, Recalls', items:['Batch release procedure and responsible person','GDP (Good Distribution Practice) measures','Complaint handling process — categorisation, investigation timelines','Product recall procedure — recall committee, market withdrawal levels'] },
      { heading:'9. Regulatory Inspections and Audits', items:['Table: inspection authority | date | outcome | major observations | CAPA status','For each observation listed: root cause, CAPA taken, closure date, evidence','Third-party audits: UNICEF, customer audits — date, auditor, findings, status'] },
    ]
  },
  {
    key:'product_summary', match:['product summary sheet','product summary'],
    title:'Product Summary Sheet', format:'Company letterhead · One page per product',
    purpose:'Concise one-page summary of regulatory and technical details for each product in a COPP application. Enables the licensing authority to quickly verify product status.',
    sections:[
      { heading:'Product Identification', items:['Brand name (if any)','INN (International Non-proprietary Name) — bold and prominent','Dosage form (tablet / capsule / injection / cream etc.)','Strength per unit (e.g. 500 mg / 5 mg/mL)','Route of administration','ATC classification code'] },
      { heading:'Manufacturing and Regulatory', items:['Manufacturer name and full address of manufacturing site','Manufacturing licence number (Form 25/28) and validity','Marketing Authorisation number (Form 46 / state approval reference and date)','Country of manufacture: India'] },
      { heading:'Market and Approval Status', items:['Date of first marketing approval in India','Current approval status: Approved / Under Review / Withdrawn','Is product currently marketed in India? Yes / No (if No, provide reason)','Approved indications (brief)'] },
      { heading:'Product Characteristics', items:['Shelf life (months) and basis (real-time stability data)','Storage conditions (temperature, humidity, light protection)','Primary pack type and size (blister/10 / HDPE bottle/60 / ampoule 2mL etc.)','Available pack sizes'] },
      { heading:'Export / COPP Specific', items:['Importing country name','Is product approved/being registered in importing country?','Any specific importing country requirements noted'] },
    ]
  },
  {
    key:'icf', match:['informed consent','icf'],
    title:'Informed Consent Form (ICF)', format:'English + Local language · ICH E6(R2) GCP · Ethics Committee approved',
    purpose:'Documents a clinical trial participant\'s voluntary agreement to participate after being fully informed. Mandatory per NDCT Rules 2019. Must be approved by CDSCO-registered Ethics Committee.',
    sections:[
      { heading:'1. Introduction', items:['Study title and CTRI registration number','Sponsor name and contact, CRO name (if applicable)','Principal Investigator name, qualifications, institution','Invitation to participate and voluntary nature prominently stated'] },
      { heading:'2. Purpose and Background', items:['Why study is being conducted (in simple, non-technical language)','What is being tested (investigational drug / device)','Current approved treatments for the condition','Total number of participants expected (global and at this site)'] },
      { heading:'3. Study Procedures', items:['Number of visits and approximate duration of each','Tests and procedures at each visit (blood samples, imaging, physical exam)','Investigational product: name, dose, route, frequency, duration','Randomisation process explained (probability of each group)','Blinding (single/double-blind or open-label) explained'] },
      { heading:'4. Risks and Discomforts', items:['Known risks from pre-clinical and Phase I/II data','Unknown/unexpected risks that may emerge','Risks from study procedures (blood draws, biopsies)','Reproductive risks and required contraception measures','What will happen if new safety information emerges during study'] },
      { heading:'5. Benefits and Alternatives', items:['Possible direct benefits to participant (if any — may be none)','Potential benefits to future patients and society','Standard treatment alternatives available outside the trial','Statement on no guaranteed benefit'] },
      { heading:'6. Confidentiality and Data', items:['How participant\'s identity will be protected','Who will have access to records (sponsor, CRO, regulatory authorities, IRB/IEC)','Data storage location and duration','Use of data in publications (anonymised)'] },
      { heading:'7. Compensation and Costs', items:['Reimbursement for travel, meals, time (if any)','Compensation for study-related injuries per NDCT Rules 2019 Schedule I','No cost to participant for study-related procedures','No financial incentive that constitutes undue inducement'] },
      { heading:'8. Voluntary Participation and Contacts', items:['Participation is completely voluntary — no penalty for refusal or withdrawal','Right to withdraw at any time without affecting medical care','Contact: Investigator (name, phone, 24-hour emergency number)','Contact: Ethics Committee (name, phone, email) for complaints'] },
      { heading:'9. Signatures', items:['Participant: printed name, signature or thumb impression, date','Witness: name, signature, date (required for illiterate participants)','LAR (Legally Acceptable Representative): name, relationship, signature, date (for incapacitated)','Investigator/designee: printed name, signature, date','Audio-visual consent: reference number (per NDCT Rules — mandatory if required)'] },
    ]
  },
  {
    key:'pi_pil', match:['package insert','prescribing information','patient information leaflet','pil','pi —','pi/pil'],
    title:'Package Insert (PI) and Patient Information Leaflet (PIL)', format:'CDSCO PI Guidelines format · D&C Rules Schedule D · Per product',
    purpose:'PI provides prescribers with complete clinical and scientific product information. PIL provides patients with simplified usage information. Both required for CDSCO drug approval.',
    sections:[
      { heading:'Package Insert Sections (Prescriber PI)', items:['1. Product name, composition (qualitative + quantitative), dosage form, strength','2. Clinical pharmacology: mechanism of action, pharmacokinetics (absorption, distribution, metabolism, excretion)','3. Indications and usage: approved indications in India (exact wording as approved by CDSCO)','4. Contraindications: absolute and relative','5. Warnings and Precautions: boxed warnings (if any), important safety information','6. Drug Interactions: PK and PD interactions (clinical significance rated)','7. Special Populations: pregnancy (FDA/CDSCO category), lactation, paediatric use, geriatric use, renal impairment, hepatic impairment','8. Adverse Reactions: frequency table by System Organ Class (SOC) per MedDRA — Very common ≥1/10; Common ≥1/100; Uncommon ≥1/1000; Rare etc.','9. Overdose: signs, symptoms, management','10. Dosage and Administration: per indication, per special population, dose adjustments','11. How Supplied, Storage, and Handling','12. References (key clinical publications)','13. Date of PI preparation and date of last revision'] },
      { heading:'Patient Information Leaflet (PIL)', items:['Written in simple, non-technical language (reading level 6th grade)','What is this medicine? What is it used for?','What must I know before taking this medicine? (contraindications, warnings)','How to take: dose, timing, with/without food, what to do if missed dose','Possible side effects: listed from most to least common, when to seek help','How to store: temperature, humidity, keep out of reach of children','Pack contents and manufacturer information'] },
      { heading:'Label Requirements (Rule 96 D&C Rules)', items:['Drug name: generic (INN) name must be prominent (at least half the size of brand name)','Composition per unit dose (quantitative)','Batch number, manufacturing date, expiry date','"Rx" symbol / "Not to be sold without prescription" (where required)','Maximum retail price (MRP) per unit + total pack','Storage instructions','Manufacturer name, address, licence number','Net content (count for solids, volume for liquids)','CDSCO approval number or Form 46 reference'] },
    ]
  },
  {
    key:'noc', match:['pollution control','consent to establish','consent to operate','mpcb','spcb','dish'],
    title:'Pollution Control Board NOC (CTE / CTO)', format:'Issued by SPCB/MPCB/GPCB · Two separate certificates',
    purpose:'No Objection Certificate confirming the pharmaceutical manufacturing unit does not create unacceptable pollution. CTE required before construction. CTO required before commencing production.',
    sections:[
      { heading:'Consent to Establish (CTE) — Before Construction', items:['Applied to State Pollution Control Board before construction or major renovation','Application includes: site plan, process description, raw material quantities, utility consumption','Effluent generation details: wastewater quantity (KLD), composition (BOD, COD, SS, heavy metals)','Air emissions: solvents, solvent vapours, process dust, boiler flue gas','Solid waste: pharmaceutical waste (Schedule I, Category 2), general solid waste, scrap','ETP design proposed (type, capacity, treatment stages)'] },
      { heading:'Consent to Operate (CTO) — Before Commencing Operations', items:['Applied after facility construction is complete','Inspection by SPCB officer required before grant','ETP operational, validated, and treating effluent to prescribed standards','Stack emissions: monitored and within SPCB permissible limits','Hazardous waste disposal contract with authorised recycler/incinerator required','Annual returns to SPCB (Form 3) mandatory post-grant'] },
      { heading:'Documents Required for Application', items:['Company registration / CIN document','Site plan and layout','Environmental Impact Assessment (for large-scale greenfield projects)','Detailed manufacturing process flow with inputs and outputs at each stage','Water consumption per day (KLD)','Wastewater generation per day (KLD) and composition','ETP design details (manufacturer, capacity, treatment stages)','Air pollution control equipment details','Hazardous waste disposal plan (manifest system)','List of hazardous chemicals handled (MSDS attached)'] },
      { heading:'Industry Category (Pollution Index)', items:['Pharmaceutical formulation: Orange category (PI score 41–59)','API manufacture: Red category (PI score 60+)','Category determines compliance requirements and renewal frequency','Check latest CPCB/SPCB notification for current classification'] },
    ]
  },
];

function matchTemplate(txt) {
  const low = txt.toLowerCase();
  return TEMPLATES.find(t => t.match.some(kw => low.includes(kw))) || null;
}

/* ─── DATA ─────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id:'mfg', label:'Manufacturing Licences', icon:'🏭', color:'#1A3D6B', light:'#EEF4FF',
    authority:'State FDA — State Licensing Authority',
    apps:[
      {
        id:'f24_25', label:'Form 24 / Form 25', sublabel:'Non-sterile FDF — Tablets, Capsules, Liquids, Semisolids',
        authority:'State FDA', timeline:'30–90 days', validity:'Perpetual (retention fee/5 yrs)', portal:'ONDLS Portal',
        description:'Manufacturing licence for drugs other than Schedule C, C(1) and X. Tablets, capsules, liquids, ointments, creams, powders, suppositories.',
        nees_folders:['1_Administrative','2_Premises','3_Technical_Staff','4_Equipment','5_Manufacturing_Quality'],
        sections:[
          { title:'Administrative', docs:[
            [M,'Covering letter (company letterhead) — dosage forms, product list, purpose of licence'],
            [M,'Application in Form 24 — signed by director/authorised signatory'],
            [M,'Fee payment challan (ONDLS / GRAS portal)'],
            [M,'Firm constitution: MOA+AOA+Certificate of Incorporation / Partnership deed / Trust deed'],
            [M,'Photo ID and address proof — all directors/partners (Aadhaar, PAN, Passport)'],
            [M,'Power of Attorney in favour of authorised signatory (stamp paper)'],
          ]},
          { title:'Premises / Site', docs:[
            [M,'Site plan and layout drawing — architect-certified, to scale, as per Schedule M'],
            [M,'Ownership / rent / lease / allotment letter for premises (registered document)'],
            [M,'Property tax receipt or utility bill (premises address confirmation)'],
            [M,'Consent to Establish (NOC) from State Pollution Control Board (SPCB/MPCB)'],
            [M,'Consent to Operate from State Pollution Control Board'],
            [M,'NOC from Dept of Industrial Safety & Health (DISH)'],
            [C,'Fire NOC from local fire authority (state-specific requirement)'],
          ]},
          { title:'Technical Staff', docs:[
            [M,'List of technical staff — Manufacturing Section (qualification, experience, previous FDA approvals)'],
            [M,'List of technical staff — QC / Testing Section'],
            [M,'Appointment / Acceptance letters from each technical staff member'],
            [M,'Educational qualification certificates — all staff (attested: B.Pharm/M.Pharm/B.Sc Chem)'],
            [M,'Pharmacy Council registration certificate (for pharmacists)'],
            [M,'Experience certificates — all technical staff'],
          ]},
          { title:'Equipment & Manufacturing', docs:[
            [M,'List of plant and machinery — make, model, capacity, ID tag numbers'],
            [M,'List of QC laboratory equipment and analytical instruments'],
            [M,'Calibration certificates for all critical measuring instruments'],
            [M,'List of products proposed to manufacture (INN, dosage form, strength, category)'],
            [M,'Master Formula Record (MFR) — per dosage form category'],
            [M,'Schedule M compliance declaration — signed by QA Head + MD/Director'],
            [M,'Master SOP list (production, QC, HVAC, water system, cleaning, pest control)'],
            [C,'Stability data (3 batches: 40°C/75%RH + 30°C/65%RH per ICH Q1A Zone IVb)'],
            [C,'Site Master File (SMF) — for existing licensees or WHO-GMP applicants'],
          ]},
        ]
      },
      {
        id:'f27_28', label:'Form 27 / Form 28', sublabel:'Sterile / Injectables — Schedule C and C1',
        authority:'State FDA + CDSCO (Joint Inspection)', timeline:'60–120 days', validity:'Perpetual', portal:'ONDLS Portal',
        description:'Manufacturing licence for sterile preparations — injectables, infusions, ophthalmic. Joint inspection by CDSCO + State FDA mandatory. Schedule M Part II applies.',
        nees_folders:['1_Administrative','2_Premises','3_Technical_Staff','4_Equipment','5_Sterile_Validation','6_Manufacturing_Quality'],
        sections:[
          { title:'All Form 24/25 documents PLUS Sterile-specific:', docs:[
            [M,'Application in Form 27 (to CDSCO Zonal Office + State FDA simultaneously)'],
            [M,'Schedule M Part II (Sterile Products) compliance declaration'],
            [M,'HVAC design and qualification report — cleanroom classification (Grade A/B/C/D)'],
            [M,'Cleanroom area classification certificates (viable + non-viable particle counts)'],
            [M,'Environmental monitoring data (settle plates, contact plates, air sampling)'],
            [M,'Autoclave / steriliser validation reports (F0 studies, SAL 10⁻⁶)'],
            [M,'Water for Injection (WFI) system validation (TOC, conductivity, bioburden, LAL endotoxin)'],
            [M,'Aseptic fill process validation / Media Fill APS data (3 runs, ≤1 contamination/5000 units)'],
            [M,'Container closure integrity testing (CCIT) data'],
            [M,'Sterility testing laboratory design and SOP (ISO Class 5 isolator/LAF)'],
            [M,'LAL endotoxin method validation data'],
            [C,'Lyophilisation cycle validation (for freeze-dried products)'],
          ]},
        ]
      },
      {
        id:'f24a_25a', label:'Form 24-A / Form 25-A', sublabel:'Loan Licence — Contract Manufacturing',
        authority:'State FDA', timeline:'30–60 days', validity:'Perpetual', portal:'ONDLS Portal',
        description:'Loan licence for company outsourcing manufacturing to another licensed facility. Both Principal Licensee Form 25/28 and Loan Licensee Form 25-A required.',
        nees_folders:['1_Administrative','2_Legal_Agreements','3_Technical'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Covering letter — products, principal licensee details, purpose'],
            [M,'Application in Form 24-A (Loan Licensee)'],
            [M,'Fee payment challan'],
            [M,'Copy of valid Form 25/28 of Principal Licensee (manufacturer)'],
            [M,'Loan Licence Agreement / MOU — stamp paper, notarised'],
            [M,'Master Formula Record / product formula from Principal Licensee'],
            [M,'Firm constitution documents of Loan Licensee'],
            [M,'Qualified Person / Competent Technical Staff at Loan Licensee level'],
            [M,'List of all products to be manufactured under loan licence'],
            [C,'Quality Agreement between Loan and Principal Licensee (strongly recommended)'],
            [C,'WHO-GMP certificate of Principal Licensee'],
          ]},
        ]
      },
      {
        id:'f24f_25f', label:'Form 24-F / Form 25-F', sublabel:'Schedule X — Psychotropics / Controlled Substances',
        authority:'State FDA + NCB', timeline:'60–90 days', validity:'Perpetual', portal:'ONDLS Portal',
        description:'Manufacturing licence for Schedule X drugs. Additional compliance under NDPS Act 1985. NCB NOC mandatory before State FDA application.',
        nees_folders:['1_Administrative','2_Premises','3_Technical_Staff','4_Schedule_X_Compliance'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form 24-F'],
            [M,'NOC from Narcotics Control Bureau (NCB) / State Narcotics Department'],
            [M,'All documents as required for Form 24/25 (non-sterile manufacturing)'],
            [M,'Double-lock storage facility design plan for Schedule X substances'],
            [M,'Designated Responsible Person for Schedule X compliance (name and designation)'],
            [M,'Narcotic record-keeping SOPs (Register in Form prescribed under NDPS Rules)'],
            [M,'Quota letter from Narcotics Commissioner (for manufacturing specified quantities)'],
          ]},
        ]
      },
    ]
  },
  {
    id:'import', label:'Import Licences', icon:'📦', color:'#1E6B3A', light:'#E8F5EE',
    authority:'CDSCO — Central — SUGAM Portal',
    apps:[
      {
        id:'f40_41', label:'Form 40 / Form 41', sublabel:'Import Registration Certificate — Foreign Manufacturer',
        authority:'CDSCO (Central)', timeline:'6–12 months', validity:'5 years', portal:'SUGAM Portal',
        description:'Registration Certificate mandatory before any import licence. All foreign manufacturers must register. Includes full technical dossier review.',
        nees_folders:['1_Administrative','2_Regulatory_GMP','3_Technical_Dossier'],
        sections:[
          { title:'Administrative / Legal', docs:[
            [M,'Application in Form 40 — signed by foreign manufacturer or Indian authorised agent'],
            [M,'Power of Attorney — notarised + apostilled by Indian Embassy in country of origin'],
            [M,'Undertaking in Form 9 — manufacturer quality compliance declaration'],
            [M,'Valid Wholesale Drug Licence (Form 20-G) of Indian authorised agent'],
            [M,'Fee payment via SUGAM / BharatKosh portal'],
          ]},
          { title:'Regulatory & GMP', docs:[
            [M,'GMP/Manufacturing licence from national regulatory authority (country of origin)'],
            [M,'WHO-GMP certificate or equivalent (FDA EIR, EMA GMP certificate, TGA licence)'],
            [M,'Free Sale Certificate from country of origin regulatory authority'],
            [C,'Previous FDA 483 observations / EMA findings with CAPA responses'],
          ]},
          { title:'Technical / Product Dossier', docs:[
            [M,'CTD dossier — Modules 2–3 quality sections (Module 5 clinical for new molecules)'],
            [M,'Certificate of Analysis (COA) — minimum 3 commercial batches per product'],
            [M,'Stability data — accelerated (40°C/75%RH, 6M) + long-term (30°C/65%RH, 12M min)'],
            [M,'Finished product specification (all test parameters and limits)'],
            [M,'Package Insert / SmPC (approved in country of origin)'],
            [M,'Proposed label for Indian market (comply with D&C Rules Rule 96)'],
            [C,'Drug Master File (DMF) reference letter — if API from third-party supplier'],
            [C,'Bioequivalence study report — for generic products claiming BE'],
          ]},
        ]
      },
      {
        id:'f8_10', label:'Form 8 / Form 10', sublabel:'Import Licence — Drugs (excl. Schedule X)',
        authority:'CDSCO (Central)', timeline:'30–60 days', validity:'5 years', portal:'SUGAM Portal',
        description:'Main import licence for commercial import. Valid RC (Form 41) must exist before applying.',
        nees_folders:['1_Administrative','2_Licences'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Covering letter — Indian importer/distributor company letterhead'],
            [M,'Application in Form 8'],
            [M,'Copy of valid Registration Certificate (Form 41) — must be current, not expired'],
            [M,'Valid Wholesale Drug Licence (Form 20-G) of Indian importer'],
            [M,'Fee payment challan (SUGAM portal)'],
            [M,'Product list — INN, strength, dosage form, pack size, proposed MRP'],
            [C,'Fresh Form 9 undertaking (if RC renewed or manufacturer details changed)'],
          ]},
        ]
      },
    ]
  },
  {
    id:'nda', label:'New Drug Applications', icon:'💊', color:'#C05000', light:'#FFF0E6',
    authority:'CDSCO — Central — SUGAM Portal — NDCT Rules 2019',
    apps:[
      {
        id:'f44_nda', label:'Form 44 — NDA / ANDA', sublabel:'New Drug / Generic Drug Application',
        authority:'CDSCO (Central)', timeline:'12–24 months (NDA); 6–12 months (ANDA)', validity:'Marketing authorisation (perpetual)', portal:'SUGAM Portal',
        description:'Primary application for marketing authorisation. Covers NCE, subsequent new drugs, and generic drugs. Full CTD dossier mandatory per NDCT Rules 2019.',
        nees_folders:['1_Administrative','2_CTD_Summaries','3_Quality_CMC','4_Nonclinical','5_Clinical'],
        sections:[
          { title:'Module 1 — Administrative', docs:[
            [M,'Form 44 — duly filled, signed by MD/Director, company stamp on each page'],
            [M,'Covering letter with product details, submission category, full index of all documents'],
            [M,'Power of Attorney — notarised + apostilled (for foreign manufacturers)'],
            [M,'Fee payment receipt — BharatKosh / SUGAM portal'],
            [M,'Manufacturing licence Form 25/28 (India-made) OR Import RC Form 41 + Form 10'],
            [M,'Regulatory approval status in ICH countries (FDA/EMA/PMDA approval letter/SmPC)'],
            [M,'Patent status declaration (Section 8, Patents Act 1970)'],
            [M,'Draft label for Indian market — D&C Rules labelling compliance'],
            [M,'Package Insert (PI) — Indian format with full prescribing information'],
            [M,'Patient Information Leaflet (PIL)'],
            [M,'Undertaking in Form 51 (if drug marketed under brand/trade name)'],
            [C,'FDC clinical rationale document (if Fixed Dose Combination)'],
            [C,'Indian bridging study protocol / waiver justification (for NCEs — ICH E5)'],
          ]},
          { title:'Module 3 — Quality / CMC', docs:[
            [M,'3.2.S Drug Substance: nomenclature, manufacture, characterisation, specification, stability (S.1–S.7)'],
            [M,'3.2.P Drug Product: description/composition, development, manufacture, excipient control, specification, stability (P.1–P.8)'],
            [M,'Drug Master File (DMF) / ASMF reference letter (for outsourced API)'],
            [M,'Stability data — 3 batches: 40°C/75%RH (6M) + 30°C/65%RH (min 12M) Zone IVb'],
            [M,'Bioequivalence/BA study report (for ANDA — 80–125% CI per Schedule Y)'],
          ]},
          { title:'Module 4 — Nonclinical', docs:[
            [M,'Safety pharmacology studies (ICH S7A/S7B)'],
            [M,'ADME studies — pharmacokinetics (single + repeat dose)'],
            [M,'Toxicology: single dose, repeat dose (sub-acute + chronic)'],
            [M,'Genotoxicity (ICH S2): Ames test, chromosomal aberration, in vivo micronucleus'],
            [C,'Reproductive and developmental toxicity (ICH S5) — indication-specific'],
            [C,'Carcinogenicity (ICH S1) — for long-term use drugs'],
          ]},
          { title:'Module 5 — Clinical', docs:[
            [M,'Phase I clinical study reports (dose escalation, safety/PK)'],
            [M,'Phase III pivotal RCT reports (primary/secondary endpoints, full patient data)'],
            [M,'Indian bridging study data OR waiver justification (ICH E5)'],
            [M,'Ethics Committee approval letters — all Indian study sites'],
            [M,'Informed Consent Form (ICF) — English + local language'],
            [M,'CTRI registration number — all Indian clinical trials'],
            [M,'Clinical study protocol + all amendments (for Indian Phase II/III)'],
            [C,'Phase II study reports (dose-finding data)'],
          ]},
        ]
      },
      {
        id:'f45_ct', label:'Form 45 — Clinical Trial Permission', sublabel:'Phase I / II / III / IV Clinical Trial',
        authority:'CDSCO + Ethics Committee', timeline:'6–12 weeks', validity:'Per trial duration', portal:'SUGAM Portal',
        description:'Permission to conduct clinical trials in India. Mandatory before any phase begins. CTRI registration mandatory.',
        nees_folders:['1_Administrative','2_Protocol_IB','3_Ethics','4_Site_Information'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form 44 (clinical trial permission request)'],
            [M,'Clinical Trial Protocol — full protocol (design, objectives, endpoints, statistics, sample size)'],
            [M,"Investigator's Brochure (IB) — updated with all nonclinical + clinical data"],
            [M,'Phase I data (if applying for Phase II+): dose escalation, safety, PK summary'],
            [M,'Ethics Committee approval — CDSCO-registered EC/IEC'],
            [M,'Informed Consent Form (ICF) — English + local language'],
            [M,'Principal Investigator CV + GCP training certificate (within 5 years)'],
            [M,'Site qualification details — infrastructure, staff qualifications, equipment'],
            [M,'Regulatory approvals from other countries (for multinational trials)'],
            [M,'Compensation/insurance details per NDCT Rules 2019 Schedule I'],
            [C,'Audio-visual aid (AVA) for illiterate participants'],
            [C,'CRO contract / agreement details (if CRO conducting the trial)'],
          ]},
        ]
      },
    ]
  },
  {
    id:'copp', label:'COPP / Export Certificates', icon:'🌐', color:'#7B3F00', light:'#FFF4E8',
    authority:'CDSCO — DCGI Office — ONDLS Portal (mandatory from July 15, 2025)',
    apps:[
      {
        id:'copp_main', label:'COPP', sublabel:'Certificate of Pharmaceutical Product (WHO Format)',
        authority:'CDSCO — DCGI / Zonal Office', timeline:'20–30 working days', validity:'2–3 years', portal:'ONDLS Portal',
        description:'WHO-format certificate. Product-specific. Physical files NOT accepted from July 15, 2025 — ONDLS portal mandatory.',
        nees_folders:['1_Application','2_Regulatory_Licences','3_GMP_Documents','4_Product_Technical'],
        sections:[
          { title:'Application / Administrative', docs:[
            [M,'Covering letter — to ADC/DDC CDSCO Zonal Officer (destination country, product, purpose)'],
            [M,'Application via ONDLS portal (physical files NOT accepted from July 15, 2025)'],
            [M,'Fee payment online — ONDLS / BharatKosh'],
            [M,'List of products — INN, strength, dosage form, pack, shelf life'],
          ]},
          { title:'Regulatory / Licence', docs:[
            [M,'Valid manufacturing licence — Form 25 or Form 28 (applicable dosage form)'],
            [M,'Product marketing authorisation in India (Form 46 / state approval letter)'],
            [M,'Product permission letters / NOC from CDSCO for all applied products'],
            [C,'Free Sale Certificate — if required separately by importing country'],
          ]},
          { title:'GMP / Quality System', docs:[
            [M,'Current valid WHO-GMP certificate OR CDSCO GMP inspection clearance letter'],
            [M,'Site Master File (SMF) — current version'],
            [M,'Schedule M compliance certificate / self-inspection declaration'],
            [M,'CDSCO / State FDA GMP inspection report (within last 2–3 years)'],
            [C,'Third-party GMP inspection report (UNICEF, WHO PQ, USAID)'],
          ]},
          { title:'Product Technical (per product)', docs:[
            [M,'Product Summary Sheet — INN, strength, dosage form, shelf life, storage, mfr details'],
            [M,'Master Formula Record (MFR)'],
            [M,'Approved finished product specification (all test parameters)'],
            [M,'Certificate of Analysis (COA) — 2–3 recent commercial batches'],
            [M,'Stability data summary — accelerated + long-term per ICH Q1A Zone IVb'],
            [M,'Shelf life statement as approved by authority'],
            [M,'Summary of Product Characteristics (SmPC) / Approved Package Insert (PI)'],
            [M,'Label artwork — approved Indian label'],
            [C,'Bioequivalence data summary (generic solid oral dosage forms)'],
          ]},
        ]
      },
      {
        id:'who_gmp', label:'WHO-GMP Certificate', sublabel:'Site-level GMP Certificate',
        authority:'CDSCO — DCGI Office', timeline:'45–90 days', validity:'2–3 years', portal:'ONDLS Portal',
        description:'Site-specific GMP certificate. Required for UNICEF tenders, WHO Prequalification, government procurement, and regulated market registrations.',
        nees_folders:['1_Application','2_GMP_Documents','3_Quality_System','4_Inspection_History'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application via ONDLS portal (mandatory from July 15, 2025)'],
            [M,'Valid manufacturing licence (Form 25/28) — all relevant dosage forms'],
            [M,'Site Master File (SMF) — updated within 12 months'],
            [M,'Schedule M self-assessment / compliance checklist'],
            [M,'CDSCO GMP inspection report (within last 2–3 years)'],
            [M,'List of all products manufactured with regulatory status and approval dates'],
            [M,'Qualification and Validation Master Plan (VMP)'],
            [M,'Organisation chart + key personnel details (QA, QC, Production Heads — qualifications)'],
            [M,'Annual Product Quality Review (APQR) — at least one product'],
            [M,'OOS / Deviation / CAPA register summary (last 2 years)'],
            [M,'Master SOP list — production, QC, QA, environmental monitoring, cleaning'],
            [C,'NABL / ISO 17025 accreditation certificate for QC laboratory'],
            [C,'Internal / third-party GMP audit report (within 12 months)'],
          ]},
        ]
      },
      {
        id:'fsc', label:'Free Sale Certificate', sublabel:'Certificate of Free Sale in India',
        authority:'CDSCO or State FDA', timeline:'15–30 days', validity:'1–2 years', portal:'CDSCO Zonal / ONDLS',
        description:'Confirms product is freely available in India without restrictions. Often required alongside COPP.',
        nees_folders:['1_Application','2_Product_Documents'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application letter — CDSCO Zonal Office / State FDA'],
            [M,'Copy of manufacturing licence (Form 25/28)'],
            [M,'Product marketing authorisation (Form 46 / state approval)'],
            [M,'Product label / artwork (approved Indian label)'],
            [M,'Declaration that product freely sold without prescription restriction'],
            [M,'Fee payment'],
            [C,'Certificate of Analysis (COA) of recent commercial batch'],
          ]},
        ]
      },
    ]
  },
  {
    id:'sale', label:'Sale & Distribution', icon:'🏪', color:'#5C2D91', light:'#F0EBF8',
    authority:'State FDA — State Licensing Authority',
    apps:[
      {
        id:'f19_20', label:'Form 19 / Form 20', sublabel:'Retail Pharmacy / Chemist Shop Licence',
        authority:'State FDA', timeline:'15–30 days', validity:'Perpetual', portal:'State FDA / ONDLS',
        description:'Retail drug licence for pharmacies selling drugs to consumers. Registered Pharmacist must be in-charge. Minimum 10 sq m area required.',
        nees_folders:['1_Administrative','2_Premises','3_Pharmacist_Documents'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form 19'],
            [M,'Fee payment challan'],
            [M,'Proof of premises — ownership / rental agreement (registered document)'],
            [M,'Site plan and layout (minimum 10 sq m — label each zone)'],
            [M,'Registered Pharmacist registration certificate (Pharmacy Council of state)'],
            [M,'Appointment / employment letter of Pharmacist'],
            [M,'Educational qualification certificate — B.Pharm / D.Pharm (attested)'],
            [M,'Firm constitution documents (proprietorship / partnership deed / company incorporation)'],
            [M,'Photo ID and address proof of proprietor/directors'],
            [M,'Declaration of refrigerator / cold storage for Schedule C/C1/thermolabile drugs'],
            [C,'NOC from local municipal corporation (required in some states)'],
          ]},
        ]
      },
      {
        id:'f21_20g', label:'Form 21 / Form 20-G', sublabel:'Wholesale Drug Licence — Distributor / C&F Agent',
        authority:'State FDA', timeline:'15–30 days', validity:'Perpetual', portal:'State FDA / ONDLS',
        description:'Wholesale licence for bulk distribution. Required by C&F agents, stockists, super-stockists, hospital pharmacies.',
        nees_folders:['1_Administrative','2_Premises','3_Competent_Person'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form 21'],
            [M,'Fee payment challan'],
            [M,'Proof of premises (minimum area per state rules — typically 15 sq m)'],
            [M,'Site plan and layout with area measurements'],
            [M,'Competent Person: Registered Pharmacist OR Science graduate with 1 year drug distribution experience'],
            [M,'Appointment letter and qualification certificates of Competent Person'],
            [M,'Declaration of cold storage / refrigerator for Schedule C/C1 drugs'],
            [M,'Firm constitution documents'],
            [M,'Photo ID and address proof of proprietor/directors/partners'],
            [C,'Storage facility photographs (racking, temperature monitoring, segregation areas)'],
          ]},
        ]
      },
    ]
  },
  {
    id:'meddev', label:'Medical Devices', icon:'🩺', color:'#006B6B', light:'#E0F4F4',
    authority:'CDSCO — Medical Devices Rules 2017',
    apps:[
      {
        id:'md5_md9', label:'MD-5 / MD-9', sublabel:'Manufacturing Licence — Medical Devices',
        authority:'CDSCO (Class C/D) + State FDA (Class A/B)', timeline:'60–180 days', validity:'Perpetual', portal:'SUGAM Portal',
        description:'Manufacturing licence per MD Rules 2017. MD-5 for Class A/B. MD-9 for Class C/D. CDSCO inspection within 60 days for Class C/D.',
        nees_folders:['1_Administrative','2_Technical_File','3_QMS','4_Testing_Evidence'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form MD-5 (Class A/B) or MD-9 (Class C/D)'],
            [M,'Proof of premises and site layout'],
            [M,'List of medical devices proposed — with intended use and classification class'],
            [M,'ISO 13485 QMS certificate (mandatory for Class C/D)'],
            [M,'Technical File / Design Dossier per MDR 2017'],
            [M,'Risk Management File per ISO 14971'],
            [M,'Product test reports (performance and safety per applicable IS/IEC standards)'],
            [M,'Instructions for Use (IFU) draft'],
            [M,'Post-Market Surveillance (PMS) plan'],
            [M,'Qualified Person / Technical Staff qualifications'],
            [C,'Clinical evaluation report (Class C/D devices)'],
            [C,'Sterilisation validation (for sterile devices)'],
            [C,'Biocompatibility testing per ISO 10993 (for body-contact devices)'],
          ]},
        ]
      },
      {
        id:'md14_md15', label:'MD-14 / MD-15', sublabel:'Import Licence — Medical Devices',
        authority:'CDSCO (Central)', timeline:'90–270 days', validity:'Perpetual', portal:'SUGAM Portal',
        description:'Import licence for medical devices. MD-14 for Class A/B. MD-15 for Class C/D. Indian Authorised Agent with wholesale drug licence mandatory.',
        nees_folders:['1_Administrative','2_Technical_File','3_Regulatory_Approvals'],
        sections:[
          { title:'Required Documents', docs:[
            [M,'Application in Form MD-14 (Class A/B) or MD-15 (Class C/D)'],
            [M,'Indian Authorised Agent details + valid wholesale/manufacturing drug licence'],
            [M,'Power of Attorney — foreign manufacturer to Indian Authorised Agent'],
            [M,'Manufacturing licence / GMP certificate from country of origin authority'],
            [M,'ISO 13485 certificate of foreign manufacturer'],
            [M,'CE mark / FDA 510(k) / regulatory approval from country of origin'],
            [M,'Technical File / Device Master Record per MDR 2017'],
            [M,'Risk Management File (ISO 14971)'],
            [M,'Product test reports per applicable IS/IEC/ISO standards'],
            [M,'Instructions for Use (IFU) — English + local language if needed'],
            [M,'Shelf life data and storage conditions'],
            [C,'Clinical investigation data / clinical evidence (Class C/D)'],
            [C,'Sterilisation validation (for sterile devices)'],
          ]},
        ]
      },
    ]
  },
];

/* ─── NeeS INDEX GENERATOR ──────────────────────────────────────────────── */
function generateNeesHtml(proj, app, cat) {
  const allDocs = app.sections.flatMap(s =>
    s.docs.map(d => ({ type:d[0], text:d[1] }))
  );
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>NeeS Index — ${proj.name}</title>
<style>
*{box-sizing:border-box}body{font-family:Calibri,Arial,sans-serif;margin:0;padding:24px;background:#f4f6fa;color:#1f2937}
h1{color:#1A3D6B;border-bottom:3px solid #1A3D6B;padding-bottom:10px;margin:0 0 12px}
.meta{display:flex;flex-wrap:wrap;gap:16px;background:#fff;padding:12px 16px;border-radius:8px;margin-bottom:18px;border:1px solid #d1d5db}
.meta div{font-size:13px;color:#555}.meta strong{color:#1A3D6B}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08)}
th{background:#1A3D6B;color:#fff;padding:9px 14px;text-align:left;font-size:12px;font-weight:700}
td{padding:8px 14px;font-size:12px;border-bottom:1px solid #f0f0f0}
tr:nth-child(even) td{background:#f8f9fb}
.m{color:#991B1B;font-weight:700}.c{color:#166534}
.folder{font-size:11px;color:#1A3D6B;background:#eef4ff;padding:1px 7px;border-radius:3px;display:inline-block}
.done{color:#166534;font-weight:700}.pending{color:#92400E}
.prog{background:#e5e7eb;border-radius:3px;height:8px;overflow:hidden;margin-top:6px;width:200px}
.prog-fill{height:100%;background:#2B579A;border-radius:3px}
footer{margin-top:16px;font-size:11px;color:#6b7280;text-align:center}
</style></head><body>
<h1>🇮🇳 NeeS Submission Index</h1>
<div class="meta">
<div><strong>Project:</strong> ${proj.name}</div>
<div><strong>Application:</strong> ${app.label}</div>
<div><strong>Company:</strong> ${proj.company||'—'}</div>
<div><strong>State:</strong> ${proj.state||'—'}</div>
<div><strong>Authority:</strong> ${app.authority}</div>
<div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
</div>
<table>
<tr><th>#</th><th>Type</th><th>Document Required</th><th>NeeS Folder</th><th>Status</th></tr>
${allDocs.map((d,i) => {
  const fi = Math.min(Math.floor(i*app.nees_folders.length/allDocs.length), app.nees_folders.length-1);
  const done = proj.docs?.[i]==='uploaded';
  return `<tr><td>${String(i+1).padStart(3,'0')}</td>
<td class="${d.type===M?'m':'c'}">${d.type===M?'◉ Mandatory':'○ Conditional'}</td>
<td>${d.text}</td>
<td><span class="folder">📁 ${app.nees_folders[fi]}</span></td>
<td class="${done?'done':'pending'}">${done?'✓ Compiled':'⏳ Pending'}</td></tr>`;
}).join('')}
</table>
<br>
<div class="meta" style="margin-bottom:0">
<div><strong>Total:</strong> ${allDocs.length} documents</div>
<div><strong>Mandatory:</strong> ${allDocs.filter(d=>d.type===M).length}</div>
<div><strong>Conditional:</strong> ${allDocs.filter(d=>d.type===C).length}</div>
<div><strong>Compiled:</strong> ${Object.values(proj.docs||{}).filter(v=>v==='uploaded').length}</div>
<div style="width:100%"><strong>Progress:</strong>
<div class="prog"><div class="prog-fill" style="width:${allDocs.length?Math.round(Object.values(proj.docs||{}).filter(v=>v==='uploaded').length/allDocs.length*100):0}%"></div></div>
</div></div>
<footer>📁 NeeS Folder Structure: ${app.nees_folders.join(' / ')} / index.html / checklist.csv<br>
Generated by RAISA — CoLAB Pharma Services · ${new Date().toLocaleDateString('en-IN')}</footer>
</body></html>`;
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export function IndiaRegulatoryApp() {
  const [mode,         setMode]         = useState('checklist');
  const [selCat,       setSelCat]       = useState(null);
  const [selApp,       setSelApp]       = useState(null);
  const [selDoc,       setSelDoc]       = useState(null);
  const [searchQ,      setSearchQ]      = useState('');
  const [projects,     setProjects]     = useState([]);
  const [selProject,   setSelProject]   = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [newProj,      setNewProj]      = useState({ name:'', company:'', state:'', catId:'', appId:'' });

  const cat     = CATEGORIES.find(c => c.id === selCat);
  const app     = cat?.apps.find(a => a.id === selApp);
  const proj    = projects.find(p => p.id === selProject);
  const projCat = proj ? CATEGORIES.find(c => c.id === proj.catId) : null;
  const projApp = projCat?.apps.find(a => a.id === proj?.appId);

  const allProjDocs  = projApp ? projApp.sections.flatMap(s => s.docs) : [];
  const uploadedN    = proj ? Object.values(proj.docs||{}).filter(v=>v==='uploaded').length : 0;
  const pct          = allProjDocs.length ? Math.round((uploadedN/allProjDocs.length)*100) : 0;

  const searchResults = searchQ.trim().length > 1
    ? CATEGORIES.flatMap(c => c.apps.filter(a =>
        a.label.toLowerCase().includes(searchQ.toLowerCase()) ||
        a.sublabel.toLowerCase().includes(searchQ.toLowerCase())
      ).map(a => ({ ...a, catId:c.id })))
    : [];

  function toggleDoc(i) {
    setProjects(prev => prev.map(p => p.id!==selProject ? p : {
      ...p, docs:{ ...p.docs, [i]: p.docs?.[i]==='uploaded' ? 'pending' : 'uploaded' }
    }));
  }
  function createProj() {
    if (!newProj.name||!newProj.catId||!newProj.appId) return;
    const p = { ...newProj, id:Date.now().toString(), docs:{}, created:new Date().toLocaleDateString('en-IN') };
    setProjects(prev=>[...prev,p]);
    setSelProject(p.id); setShowModal(false);
    setNewProj({ name:'', company:'', state:'', catId:'', appId:'' });
  }
  function downloadNees() {
    if (!proj||!projApp||!projCat) return;
    const html = generateNeesHtml(proj, projApp, projCat);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html],{type:'text/html'}));
    a.download = `NeeS_${(proj.company||'Company').replace(/\s+/g,'_')}_${projApp.label.replace(/[^a-zA-Z0-9]/g,'_')}.html`;
    a.click();
  }

  /* TOP BAR */
  const topBar = (
    <div style={{ background:T.navy, display:'flex', alignItems:'center', gap:12,
      padding:'0 16px', height:42, flexShrink:0 }}>
      <span style={{ fontSize:14, fontWeight:800, color:'#fff', marginRight:4 }}>🇮🇳 India Regulatory</span>
      {['checklist','projects'].map(m => (
        <button key={m} onClick={()=>setMode(m)} style={{
          padding:'4px 16px', borderRadius:4, border:'none', cursor:'pointer',
          fontSize:12, fontWeight:700,
          background: mode===m ? '#fff' : 'rgba(255,255,255,0.15)',
          color: mode===m ? T.navy : 'rgba(255,255,255,0.8)',
        }}>
          {m==='checklist' ? '✓ Checklist' : '📁 Projects'}
        </button>
      ))}
    </div>
  );

  /* ══════ CHECKLIST MODE ══════ */
  if (mode==='checklist') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      {topBar}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* P1 — Categories */}
        <div style={{ width:176, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#F8FAFD', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'8px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search forms..."
              style={{ width:'100%', padding:'5px 8px', border:`1px solid ${T.border}`, borderRadius:4,
              fontSize:11, boxSizing:'border-box', fontFamily:'inherit' }}/>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={()=>{ setSelCat(c.id); setSelApp(null); setSelDoc(null); setSearchQ(''); }}
                style={{ padding:'8px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                  borderLeft: selCat===c.id ? `4px solid ${c.color}` : '4px solid transparent',
                  background: selCat===c.id ? c.light : 'transparent' }}
                onMouseOver={e=>{ if(selCat!==c.id) e.currentTarget.style.background=c.light+'88'; }}
                onMouseOut={e=>{ if(selCat!==c.id) e.currentTarget.style.background='transparent'; }}>
                <div style={{ fontSize:11, fontWeight:700, color:selCat===c.id?c.color:T.text }}>{c.icon} {c.label}</div>
                <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{c.apps.length} apps</div>
              </div>
            ))}
          </div>
        </div>

        {/* P2 — Applications */}
        <div style={{ width:214, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#fff', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'8px 12px', borderBottom:`1px solid ${T.border}`, background:cat?cat.light:T.bg, flexShrink:0 }}>
            {cat ? <><div style={{ fontSize:11, fontWeight:700, color:cat.color }}>{cat.icon} {cat.label}</div>
              <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{cat.authority}</div></>
            : searchQ ? <div style={{ fontSize:11, color:T.navy, fontWeight:600 }}>Results: "{searchQ}"</div>
            : <div style={{ fontSize:11, color:T.muted }}>← Select a category</div>}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {(searchQ.trim().length>1 ? searchResults : cat?.apps||[]).map(a => (
              <div key={a.id} onClick={()=>{ if(a.catId) setSelCat(a.catId); setSelApp(a.id); setSelDoc(null); setSearchQ(''); }}
                style={{ padding:'8px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                  borderLeft: selApp===a.id ? `4px solid ${cat?.color||T.navy}` : '4px solid transparent',
                  background: selApp===a.id ? (cat?.light||T.bg) : 'transparent' }}
                onMouseOver={e=>{ if(selApp!==a.id) e.currentTarget.style.background=T.bg; }}
                onMouseOut={e=>{ if(selApp!==a.id) e.currentTarget.style.background='transparent'; }}>
                <div style={{ fontSize:11, fontWeight:600, color:selApp===a.id?(cat?.color||T.navy):T.text }}>{a.label}</div>
                <div style={{ fontSize:10, color:T.muted, marginTop:2, lineHeight:1.4 }}>{a.sublabel}</div>
              </div>
            ))}
            {!cat&&!searchQ && <div style={{ padding:'30px 16px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🇮🇳</div>
              <div style={{ fontSize:11 }}>Select a category</div>
            </div>}
          </div>
        </div>

        {/* P3 — Document Checklist */}
        <div style={{ width:306, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#FAFBFD', display:'flex', flexDirection:'column' }}>
          {app ? <>
            <div style={{ background:cat?.color||T.navy, padding:'8px 14px', flexShrink:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{app.label}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{app.authority} · {app.timeline}</div>
            </div>
            <div style={{ padding:'5px 10px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:12, alignItems:'center', flexShrink:0, background:'#fff' }}>
              <span style={{ fontSize:10, color:T.red, fontWeight:700 }}>◉ Mandatory</span>
              <span style={{ fontSize:10, color:T.green }}>○ Conditional</span>
              <span style={{ fontSize:10, color:T.dim, marginLeft:'auto' }}>📄 = template available</span>
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {app.sections.map((sec,si) => (
                <div key={si}>
                  <div style={{ padding:'5px 12px', background:'#EEF4FF', borderBottom:`1px solid ${T.border}`, borderTop:si>0?`1px solid ${T.border}`:'none' }}>
                    <span style={{ fontSize:10, fontWeight:700, color:cat?.color||T.navy }}>{sec.title}</span>
                  </div>
                  {sec.docs.map(([type,text],di) => {
                    const tpl = matchTemplate(text);
                    const isSel = selDoc?.text===text;
                    return (
                      <div key={di} onClick={()=>setSelDoc({ text, template:tpl })}
                        style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 12px',
                          borderBottom:'1px solid #F3F4F6',
                          cursor:tpl?'pointer':'default',
                          background: isSel?(cat?.light||'#EEF4FF'):'transparent',
                          borderLeft: isSel?`3px solid ${cat?.color||T.navy}`:'3px solid transparent' }}
                        onMouseOver={e=>{ if(!isSel&&tpl) e.currentTarget.style.background='#F5F7FF'; }}
                        onMouseOut={e=>{ if(!isSel) e.currentTarget.style.background='transparent'; }}>
                        <span style={{ fontSize:12, color:type===M?T.red:T.green, fontWeight:800, flexShrink:0, marginTop:1 }}>
                          {type===M?'◉':'○'}
                        </span>
                        <span style={{ fontSize:11, color:T.text, lineHeight:1.5, fontWeight:type===M?500:400, flex:1 }}>
                          {text}
                        </span>
                        {tpl && <span style={{ fontSize:9, color:cat?.color||T.mid, flexShrink:0,
                          background:cat?.light||'#EEF4FF', padding:'1px 5px', borderRadius:3, whiteSpace:'nowrap' }}>
                          📄
                        </span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </> : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, padding:24, textAlign:'center' }}>
              <div style={{ fontSize:32 }}>📋</div>
              <div style={{ fontSize:12, color:T.muted }}>Select an application to view required documents</div>
            </div>
          )}
        </div>

        {/* P4 — Template Viewer */}
        <div style={{ flex:1, background:T.bg, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {selDoc?.template ? <>
            <div style={{ background:cat?.color||T.navy, padding:'10px 18px', flexShrink:0 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>📄 {selDoc.template.title}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{selDoc.template.format}</div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
              <div style={{ background:'#fff', borderRadius:8, padding:'12px 16px', marginBottom:14,
                border:`1px solid ${T.border}`, borderLeft:`4px solid ${cat?.color||T.navy}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Purpose</div>
                <div style={{ fontSize:12, color:T.text, lineHeight:1.7 }}>{selDoc.template.purpose}</div>
              </div>
              {selDoc.template.sections.map((sec,si) => (
                <div key={si} style={{ background:'#fff', borderRadius:8, marginBottom:12, border:`1px solid ${T.border}`, overflow:'hidden' }}>
                  <div style={{ padding:'7px 14px', background:(cat?.color||T.navy)+'18', borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:11, fontWeight:700, color:cat?.color||T.navy }}>{sec.heading}</span>
                  </div>
                  <div style={{ padding:'4px 0' }}>
                    {sec.items.map((item,ii) => (
                      <div key={ii} style={{ display:'flex', gap:8, padding:'5px 14px',
                        borderBottom:ii<sec.items.length-1?'1px solid #F3F4F6':'none' }}>
                        <span style={{ color:cat?.color||T.mid, flexShrink:0, fontSize:11, marginTop:1 }}>▸</span>
                        <span style={{ fontSize:11, color:T.text, lineHeight:1.55 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </> : selDoc ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, padding:32, textAlign:'center' }}>
              <div style={{ fontSize:36 }}>📝</div>
              <div style={{ fontSize:13, fontWeight:600, color:T.navy }}>No Template for this Document</div>
              <div style={{ fontSize:11, color:T.muted, maxWidth:320, lineHeight:1.7 }}>{selDoc.text}</div>
              <div style={{ fontSize:10, color:T.dim, marginTop:10 }}>
                Templates are available for: Covering Letter · Site Plan · Power of Attorney · Schedule M Declaration · MFR · COA · Stability Data · Site Master File · Package Insert / PIL · Product Summary Sheet · ICF · Pollution Control NOC
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, padding:32, textAlign:'center' }}>
              <div style={{ fontSize:42 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:700, color:T.navy }}>Template Viewer</div>
              <div style={{ fontSize:12, color:T.muted, maxWidth:340, lineHeight:1.8 }}>
                Click any document marked <span style={{ background:'#EEF4FF', padding:'1px 6px', borderRadius:3, fontSize:11, color:T.mid }}>📄</span> in the checklist to see its full content structure and template guide
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12, maxWidth:400 }}>
                {['Covering Letter','Site Plan & Layout','Power of Attorney','Schedule M Declaration','Master Formula Record','Certificate of Analysis','Stability Data Report','Site Master File (SMF)','Package Insert / PIL','Product Summary Sheet','Informed Consent Form','Pollution Control NOC'].map(t => (
                  <div key={t} style={{ fontSize:10, background:'#fff', padding:'5px 10px', borderRadius:5,
                    border:`1px solid ${T.border}`, color:T.muted }}>📄 {t}</div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  /* ══════ PROJECTS MODE ══════ */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      {topBar}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Project List */}
        <div style={{ width:220, flexShrink:0, borderRight:`1px solid ${T.border}`, background:'#F8FAFD', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'10px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
            <button onClick={()=>setShowModal(true)} style={{ width:'100%', padding:'7px', background:T.navy,
              color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
              + New Project
            </button>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {projects.length===0 && <div style={{ padding:'30px 16px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📁</div>
              <div style={{ fontSize:11 }}>No projects yet.<br/>Create one to start compiling documents.</div>
            </div>}
            {projects.map(p => {
              const pCat = CATEGORIES.find(c=>c.id===p.catId);
              const pApp = pCat?.apps.find(a=>a.id===p.appId);
              const tot = pApp ? pApp.sections.flatMap(s=>s.docs).length : 0;
              const done = Object.values(p.docs||{}).filter(v=>v==='uploaded').length;
              const pp = tot ? Math.round(done/tot*100) : 0;
              return (
                <div key={p.id} onClick={()=>setSelProject(p.id)}
                  style={{ padding:'10px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                    borderLeft: selProject===p.id ? `4px solid ${pCat?.color||T.navy}` : '4px solid transparent',
                    background: selProject===p.id ? (pCat?.light||T.bg) : 'transparent' }}
                  onMouseOver={e=>{ if(selProject!==p.id) e.currentTarget.style.background=T.bg; }}
                  onMouseOut={e=>{ if(selProject!==p.id) e.currentTarget.style.background='transparent'; }}>
                  <div style={{ fontSize:12, fontWeight:600, color:selProject===p.id?(pCat?.color||T.navy):T.text }}>{p.name}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{pApp?.label||'—'} · {p.created}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
                    <div style={{ flex:1, height:4, background:'#E5E7EB', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:pp+'%', height:'100%', background:pp===100?'#16A34A':(pCat?.color||T.mid) }}/>
                    </div>
                    <span style={{ fontSize:9, color:T.muted }}>{pp}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Workspace */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {proj&&projApp ? <>
            {/* Header */}
            <div style={{ background:projCat?.color||T.navy, padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{proj.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:2 }}>
                  {projApp.label} · {projApp.authority} · {proj.company||''} {proj.state?'· '+proj.state:''}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                  <div style={{ width:180, height:6, background:'rgba(255,255,255,0.25)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:pct+'%', height:'100%', background:pct===100?'#4ADE80':'#fff' }}/>
                  </div>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.9)', fontWeight:700 }}>
                    {uploadedN}/{allProjDocs.length} · {pct}%
                  </span>
                </div>
              </div>
              <button onClick={downloadNees} style={{ padding:'8px 18px', background:'#fff',
                color:projCat?.color||T.navy, border:'none', borderRadius:6, cursor:'pointer',
                fontSize:12, fontWeight:800 }}>
                ⬇ Download NeeS Index
              </button>
            </div>

            {/* Document checklist */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 20px' }}>
              <div style={{ fontSize:11, color:T.muted, marginBottom:12 }}>
                ☑ Click checkbox to mark document as compiled. Download NeeS Index when ready for submission.
              </div>
              {projApp.sections.map((sec,si) => {
                const offset = projApp.sections.slice(0,si).flatMap(s=>s.docs).length;
                return (
                  <div key={si} style={{ marginBottom:14, background:'#fff', borderRadius:8, border:`1px solid ${T.border}`, overflow:'hidden' }}>
                    <div style={{ padding:'7px 14px', background:(projCat?.color||T.navy)+'18', borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:11, fontWeight:700, color:projCat?.color||T.navy }}>{sec.title}</span>
                      <span style={{ fontSize:10, color:T.muted, marginLeft:8 }}>
                        {sec.docs.filter((_,i)=>proj.docs?.[offset+i]==='uploaded').length}/{sec.docs.length} compiled
                      </span>
                    </div>
                    {sec.docs.map(([type,text],di) => {
                      const gi = offset+di;
                      const done = proj.docs?.[gi]==='uploaded';
                      return (
                        <div key={di} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 14px',
                          borderBottom:di<sec.docs.length-1?'1px solid #F3F4F6':'none',
                          background:done?'#F0FDF4':'transparent' }}>
                          <button onClick={()=>toggleDoc(gi)} style={{ flexShrink:0, width:22, height:22,
                            borderRadius:4, cursor:'pointer', marginTop:1,
                            border:`2px solid ${done?'#16A34A':'#D1D5DB'}`,
                            background:done?'#16A34A':'#fff', color:'#fff',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800 }}>
                            {done?'✓':''}
                          </button>
                          <span style={{ fontSize:10, color:type===M?T.red:T.green, fontWeight:800, flexShrink:0, marginTop:3 }}>
                            {type===M?'◉':'○'}
                          </span>
                          <span style={{ fontSize:12, color:done?'#166534':T.text, lineHeight:1.55, fontWeight:done?600:type===M?500:400 }}>
                            {text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* NeeS folder preview */}
              <div style={{ background:'#fff', borderRadius:8, border:`1px solid ${T.border}`, padding:'12px 16px', marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.navy, marginBottom:8 }}>📁 NeeS Folder Structure</div>
                <div style={{ fontFamily:'monospace', fontSize:11, color:T.muted, lineHeight:2 }}>
                  <div>{(proj.company||'Company').replace(/\s+/g,'_')}_{projApp.label.replace(/[^a-zA-Z0-9]/g,'_')}/</div>
                  {projApp.nees_folders.map((f,i) => <div key={i} style={{ marginLeft:16 }}>├─ 📁 {f}/</div>)}
                  <div style={{ marginLeft:16 }}>├─ 📄 index.html <span style={{ color:'#2B579A' }}>(NeeS Index — download above)</span></div>
                  <div style={{ marginLeft:16 }}>└─ 📄 checklist.csv</div>
                </div>
              </div>
            </div>
          </> : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, padding:40, textAlign:'center' }}>
              <div style={{ fontSize:44 }}>📁</div>
              <div style={{ fontSize:15, fontWeight:700, color:T.navy }}>Projects</div>
              <div style={{ fontSize:12, color:T.muted, maxWidth:380, lineHeight:1.8 }}>
                Create a project for a specific regulatory application. Track document compilation status and download a NeeS-format index when ready for submission.
              </div>
              <button onClick={()=>setShowModal(true)} style={{ padding:'10px 24px', background:T.navy,
                color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, marginTop:8 }}>
                + Create New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NEW PROJECT MODAL */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:'28px', width:430,
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)', fontFamily:"'Segoe UI',Arial,sans-serif" }}>
            <div style={{ fontSize:16, fontWeight:800, color:T.navy, marginBottom:20 }}>📁 New Project</div>
            {[{l:'Project Name',k:'name',ph:'e.g. LUMEX Tablets — MH FDA 2026'},
              {l:'Company Name',k:'company',ph:'Your company name'},
              {l:'State',k:'state',ph:'e.g. Maharashtra'},
            ].map(f => (
              <div key={f.k} style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:700, color:T.navy, display:'block', marginBottom:4 }}>{f.l}</label>
                <input value={newProj[f.k]} onChange={e=>setNewProj(p=>({...p,[f.k]:e.target.value}))}
                  placeholder={f.ph} style={{ width:'100%', padding:'8px 10px', border:`1px solid ${T.border}`,
                  borderRadius:6, fontSize:12, boxSizing:'border-box', fontFamily:'inherit' }}/>
              </div>
            ))}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.navy, display:'block', marginBottom:4 }}>Application Category</label>
              <select value={newProj.catId} onChange={e=>setNewProj(p=>({...p,catId:e.target.value,appId:''}))}
                style={{ width:'100%', padding:'8px', border:`1px solid ${T.border}`, borderRadius:6, fontSize:12, fontFamily:'inherit' }}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            {newProj.catId && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:T.navy, display:'block', marginBottom:4 }}>Application Type</label>
                <select value={newProj.appId} onChange={e=>setNewProj(p=>({...p,appId:e.target.value}))}
                  style={{ width:'100%', padding:'8px', border:`1px solid ${T.border}`, borderRadius:6, fontSize:12, fontFamily:'inherit' }}>
                  <option value="">Select application...</option>
                  {CATEGORIES.find(c=>c.id===newProj.catId)?.apps.map(a=>
                    <option key={a.id} value={a.id}>{a.label} — {a.sublabel}</option>
                  )}
                </select>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'9px', border:`1px solid ${T.border}`, background:'#fff', borderRadius:6, cursor:'pointer', fontSize:12 }}>Cancel</button>
              <button onClick={createProj} disabled={!newProj.name||!newProj.catId||!newProj.appId}
                style={{ flex:2, padding:'9px', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700,
                  background:(!newProj.name||!newProj.catId||!newProj.appId)?'#D1D5DB':T.navy, color:'#fff' }}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
