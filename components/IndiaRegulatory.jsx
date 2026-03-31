'use client';
import { useState } from 'react';

// ── Colour palette ────────────────────────────────────────────────────────────
const T = {
  navy:    '#1A3D6B',
  mid:     '#2B579A',
  bg:      '#F0F4F8',
  white:   '#FFFFFF',
  border:  '#D1D5DB',
  muted:   '#6B7280',
  text:    '#1F2937',
  dim:     '#9CA3AF',
};

// ── Mandatory / Conditional badge ─────────────────────────────────────────────
const MANDATORY   = 'M';
const CONDITIONAL = 'C';

// ══════════════════════════════════════════════════════════════════════════════
//  DATA — categories → applications → documents
// ══════════════════════════════════════════════════════════════════════════════
const CATEGORIES = [
  {
    id: 'mfg',
    label: 'Manufacturing Licences',
    icon: '🏭',
    color: '#1A3D6B',
    light: '#EEF4FF',
    authority: 'State FDA (State Licensing Authority)',
    apps: [
      {
        id: 'form24_25',
        label: 'Form 24 / Form 25',
        sublabel: 'Non-sterile FDF — Tablets, Capsules, Liquids, Semisolids',
        authority: 'State FDA',
        description: 'Manufacturing licence for non-biological drugs other than Schedule C, C(1) and X. Covers tablets, capsules, liquids, ointments, creams, powders, granules, suppositories.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'ONDLS Portal — ondls.cdsco.gov.in',
        timeline: '30–90 days after inspection',
        sections: [
          {
            title: 'A. Administrative / General',
            docs: [
              [MANDATORY, 'Covering letter (company letterhead) — stating dosage forms, product categories, purpose of licence'],
              [MANDATORY, 'Application in Form 24 — duly filled, signed by proprietor/director/authorised signatory'],
              [MANDATORY, 'Fee payment challan (ONDLS / GRAS portal / State treasury)'],
              [MANDATORY, 'Firm constitution documents: Partnership deed (ROF) / MOA+AOA+Certificate of Incorporation / Trust deed'],
              [MANDATORY, 'Photo ID and address proof of all directors/partners (Aadhaar, PAN, Passport)'],
              [MANDATORY, 'Power of Attorney in favour of authorised signatory (on stamp paper)'],
              [MANDATORY, 'List of directors / partners / trustees with full details'],
            ]
          },
          {
            title: 'B. Premises / Site',
            docs: [
              [MANDATORY, 'Site plan and layout drawing — architect-certified, to scale, with dimensions, as per Schedule M'],
              [MANDATORY, 'Proof of ownership / rent / lease / allotment letter for premises (registered document)'],
              [MANDATORY, 'Property tax receipt or utility bill for premises address'],
              [MANDATORY, 'Consent to Establish (NOC) from State Pollution Control Board (SPCB / MPCB / GPCB)'],
              [MANDATORY, 'Consent to Operate from State Pollution Control Board'],
              [MANDATORY, 'NOC from Department of Industrial Safety & Health (DISH)'],
              [CONDITIONAL, 'Fire NOC from local fire authority (state-specific requirement)'],
            ]
          },
          {
            title: 'C. Technical Staff',
            docs: [
              [MANDATORY, 'List of qualified technical staff — Manufacturing Section (B.Pharm / M.Pharm / B.Sc Chemistry / B.Tech)'],
              [MANDATORY, 'List of qualified technical staff — Quality Control / Testing Section'],
              [MANDATORY, 'Appointment letters / Acceptance letters from each technical staff member'],
              [MANDATORY, 'Educational qualification certificates of all technical staff (attested copies)'],
              [MANDATORY, 'Pharmacy Council registration certificate (for pharmacists)'],
              [MANDATORY, 'Experience certificates of all technical staff'],
              [CONDITIONAL, 'Previous FDA approval letters / experience letters from prior employers'],
            ]
          },
          {
            title: 'D. Plant, Machinery & Equipment',
            docs: [
              [MANDATORY, 'List of all plant and machinery with make, model, and specifications'],
              [MANDATORY, 'List of QC laboratory equipment and analytical instruments'],
              [MANDATORY, 'Calibration certificates for all critical measuring instruments'],
              [MANDATORY, 'Equipment qualification records (DQ/IQ/OQ) — for major production equipment'],
              [CONDITIONAL, 'AHU installation and validation certificate — for controlled/clean environments'],
              [CONDITIONAL, 'Water system validation records (purified water) — where PW required'],
            ]
          },
          {
            title: 'E. Manufacturing & Product Documents',
            docs: [
              [MANDATORY, 'List of products proposed to be manufactured (INN, dosage form, strength, category)'],
              [MANDATORY, 'Manufacturing process description / Master Formula Record (MFR) — per dosage form category'],
              [MANDATORY, 'Schedule M compliance declaration (signed by QA Head and MD/Director)'],
              [MANDATORY, 'Master SOP list (production, QC, HVAC, water system, cleaning, pest control, recall)'],
              [CONDITIONAL, 'Process flow chart — required for API / bulk drug manufacture'],
              [CONDITIONAL, 'Stability data (3 batches: accelerated 40°C/75%RH + long-term 30°C/65%RH per ICH Q1A Zone IVb) — required at product approval stage'],
              [CONDITIONAL, 'Site Master File (SMF) / Pharmaceutical Quality System (PQS) document'],
            ]
          }
        ]
      },
      {
        id: 'form27_28',
        label: 'Form 27 / Form 28',
        sublabel: 'Sterile Products / Injectables — Schedule C and C1',
        authority: 'State FDA + CDSCO (Joint Inspection)',
        description: 'Manufacturing licence for sterile preparations — injectables, infusions, ophthalmic preparations, sterile powders. Higher GMP standards apply (Schedule M Part II). Joint inspection by CDSCO + State FDA mandatory.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'ONDLS Portal — ondls.cdsco.gov.in',
        timeline: '60–120 days after joint inspection',
        sections: [
          {
            title: 'A. All Documents as in Form 24/25 PLUS:',
            docs: [
              [MANDATORY, 'Application in Form 27 (submitted to both CDSCO Zonal Office + State FDA)'],
              [MANDATORY, 'Schedule M Part II (Sterile Products) compliance declaration'],
              [MANDATORY, 'HVAC design report — cleanroom classification (Grade A/B/C/D per EU GMP / ISO class)'],
              [MANDATORY, 'Cleanroom area classification certificates (ISO 5 for critical filling, ISO 7/8 for background)'],
            ]
          },
          {
            title: 'B. Sterile-specific Validation',
            docs: [
              [MANDATORY, 'Environmental monitoring data — viable (settle plates, contact plates, air sampling) and non-viable (particle counts)'],
              [MANDATORY, 'Autoclave / steriliser validation reports (F0 studies, SAL 10⁻⁶ demonstration)'],
              [MANDATORY, 'Water for Injection (WFI) system validation (TOC, conductivity, bioburden, LAL endotoxin)'],
              [MANDATORY, 'Aseptic fill process validation — Media Fill / APS (3 runs, ≤1 contamination per 5000 units)'],
              [MANDATORY, 'Container closure integrity testing (CCIT) data'],
              [MANDATORY, 'Sterilisation validation — filtration (0.22μ membrane integrity test / bubble point)'],
              [CONDITIONAL, 'Lyophilisation cycle validation (if freeze-dried products)'],
              [CONDITIONAL, 'Terminal sterilisation validation (autoclaving, dry heat — for terminally sterilised products)'],
            ]
          },
          {
            title: 'C. QC Laboratory — Sterile',
            docs: [
              [MANDATORY, 'Sterility testing laboratory design (ISO class 5 isolator or LAF)'],
              [MANDATORY, 'Sterility testing SOPs (per IP / BP / USP methodology)'],
              [MANDATORY, 'LAL (Limulus Amebocyte Lysate) endotoxin testing method validation'],
              [MANDATORY, 'Bioburden testing procedures and alert/action limits'],
            ]
          }
        ]
      },
      {
        id: 'form24a_25a',
        label: 'Form 24-A / Form 25-A',
        sublabel: 'Loan Licence — Contract Manufacturing',
        authority: 'State FDA',
        description: 'Loan licence issued to a company (Loan Licensee) that outsources manufacturing to another licensed facility (Principal Licensee — Form 25/28). Both licences required for finished product release.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'ONDLS Portal',
        timeline: '30–60 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Covering letter stating products, principal licensee details, purpose of loan licence'],
              [MANDATORY, 'Application in Form 24-A (Loan Licensee)'],
              [MANDATORY, 'Fee payment challan'],
              [MANDATORY, 'Copy of valid manufacturing licence (Form 25 or Form 28) of Principal Licensee'],
              [MANDATORY, 'Loan Licence Agreement / MOU between Loan Licensee and Principal Licensee (stamp paper, notarised)'],
              [MANDATORY, 'Copy of product formula / MFR from Principal Licensee'],
              [MANDATORY, 'Firm constitution documents of Loan Licensee'],
              [MANDATORY, 'Qualified Person / Competent Technical Staff details at Loan Licensee level'],
              [MANDATORY, 'List of all products to be manufactured under loan licence'],
              [MANDATORY, 'Site plan and premises proof of Loan Licensee registered office'],
              [CONDITIONAL, 'WHO-GMP certificate of Principal Licensee (strengthens application)'],
              [CONDITIONAL, 'Quality Agreement between Loan and Principal Licensee (recommended)'],
            ]
          }
        ]
      },
      {
        id: 'form24f_25f',
        label: 'Form 24-F / Form 25-F',
        sublabel: 'Schedule X — Psychotropics / Controlled Substances',
        authority: 'State FDA + Narcotics Control Bureau',
        description: 'Manufacturing licence for Schedule X drugs (psychotropics, controlled substances). Additional compliance under NDPS Act 1985. Narcotics Department NOC is mandatory.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'ONDLS Portal + Narcotics Dept',
        timeline: '60–90 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 24-F'],
              [MANDATORY, 'NOC from State Narcotics Department / Narcotics Control Bureau (NCB)'],
              [MANDATORY, 'All documents as required in Form 24/25 (non-sterile manufacturing)'],
              [MANDATORY, 'Double-lock storage facility design plan for Schedule X substances'],
              [MANDATORY, 'Designated Responsible Person name and details for Schedule X compliance'],
              [MANDATORY, 'Narcotic / psychotropic record-keeping SOPs (Register maintenance)'],
              [MANDATORY, 'Quota letter from Narcotics Commissioner (for manufacturing specified quantities)'],
              [CONDITIONAL, 'NDPS licence (where separate NDPS licence required by state)'],
            ]
          }
        ]
      },
      {
        id: 'form27c_28c',
        label: 'Form 27-C / Form 28-C',
        sublabel: 'Blood Bank — Collection, Processing, Storage',
        authority: 'State FDA + State Blood Transfusion Council (SBTC)',
        description: 'Licence for blood bank operations — collection, testing, processing, storage and distribution of whole blood and blood components.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'ONDLS Portal',
        timeline: '60–90 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 27-C'],
              [MANDATORY, 'SBTC (State Blood Transfusion Council) approval / NOC'],
              [MANDATORY, 'Plan of premises — blood bank layout per NBTC guidelines'],
              [MANDATORY, 'Qualification certificates of medical officers (MBBS/MD Blood Banking) and technical staff'],
              [MANDATORY, 'List of equipment: blood collection sets, centrifuge, blood bank refrigerators, -80°C freezers, plasma extractor'],
              [MANDATORY, 'SOPs for donor screening, collection, testing, processing, storage, distribution'],
              [MANDATORY, 'Serological testing SOPs — HIV 1&2, HBsAg, HCV, Syphilis (VDRL/RPR), Malaria'],
              [MANDATORY, 'Blood component preparation SOPs (if blood components to be prepared)'],
              [MANDATORY, 'Haemovigilance programme documentation'],
              [CONDITIONAL, 'NABL accreditation certificate for serological testing lab (preferred for regulatory inspections)'],
              [CONDITIONAL, 'Cold chain validation / temperature mapping of storage units'],
            ]
          }
        ]
      },
      {
        id: 'form29_30',
        label: 'Form 29 / Form 30',
        sublabel: 'Test / Analysis Licence (R&D Manufacturing)',
        authority: 'State FDA',
        description: 'Licence to manufacture drugs for the purpose of examination, test or analysis only — NOT for commercial sale. Used by R&D labs, DSIR-registered units, and manufacturers generating CMC data.',
        validity: 'As specified in licence',
        portal: 'ONDLS Portal / State FDA Portal',
        timeline: '15–20 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 30'],
              [MANDATORY, 'Copy of Form 25/28 manufacturing licence (if existing manufacturer applying for test batches)'],
              [MANDATORY, 'DSIR registration certificate (for R&D units without manufacturing licence)'],
              [MANDATORY, 'Fee challan (TR-6 — Rs 100 for 1st drug, Rs 50 each additional)'],
              [MANDATORY, 'Utilisation break-up: quantity, purpose (CMC data generation, stability, bioequivalence)'],
              [MANDATORY, 'Signing authority letter'],
              [MANDATORY, 'List of drugs to be manufactured for testing'],
              [CONDITIONAL, 'Protocol for study for which test batches are being manufactured'],
            ]
          }
        ]
      },
    ]
  },

  {
    id: 'import',
    label: 'Import Licences',
    icon: '📦',
    color: '#1E6B3A',
    light: '#E8F5EE',
    authority: 'CDSCO — Central (via SUGAM Portal)',
    apps: [
      {
        id: 'form40_41',
        label: 'Form 40 / Form 41',
        sublabel: 'Import Registration Certificate (RC) — Foreign Manufacturer',
        authority: 'CDSCO (Central)',
        description: 'Registration Certificate mandatory first step for all foreign manufacturers before import licence. Applies to all imported finished formulations and APIs. Valid 5 years, renewable.',
        validity: '5 years (renewable)',
        portal: 'SUGAM Portal — sugam.gov.in',
        timeline: '6–12 months (includes dossier review)',
        sections: [
          {
            title: 'A. Administrative / Legal',
            docs: [
              [MANDATORY, 'Application in Form 40 — signed by foreign manufacturer or authorised Indian agent'],
              [MANDATORY, 'Power of Attorney — notarised + apostilled by Indian Embassy in country of origin'],
              [MANDATORY, 'Undertaking in Form 9 — manufacturer\'s quality compliance undertaking'],
              [MANDATORY, 'Valid Wholesale Drug Licence (Form 20-G or equivalent) of Indian authorised agent'],
              [MANDATORY, 'Fee payment via SUGAM / BharatKosh portal'],
            ]
          },
          {
            title: 'B. Regulatory / GMP Documents',
            docs: [
              [MANDATORY, 'GMP / Manufacturing licence issued by national regulatory authority of country of origin'],
              [MANDATORY, 'WHO-GMP certificate — or equivalent (FDA Establishment Inspection Report, EMA GMP certificate, TGA licence)'],
              [MANDATORY, 'Free Sale Certificate from country of origin regulatory authority'],
              [CONDITIONAL, 'Previous inspection findings / 483 responses (if FDA-inspected)'],
            ]
          },
          {
            title: 'C. Technical / Product Dossier',
            docs: [
              [MANDATORY, 'CTD dossier — abridged (Modules 2–3 quality sections minimum; Module 5 clinical for new molecules)'],
              [MANDATORY, 'Certificate of Analysis (COA) — minimum 3 commercial batches per product (all parameters)'],
              [MANDATORY, 'Stability data — accelerated (40°C/75%RH, 6 months) + long-term (30°C/65%RH or 25°C/60%RH, 12 months minimum)'],
              [MANDATORY, 'Finished product specification (all tests and limits)'],
              [MANDATORY, 'Package Insert / SmPC / Prescribing Information (approved in country of origin)'],
              [MANDATORY, 'Proposed label for Indian market — comply with D&C Rules Schedule K, Rule 96'],
              [CONDITIONAL, 'Drug Master File (DMF) / ASMF reference letter (if API from third-party supplier)'],
              [CONDITIONAL, 'Bioequivalence study report (for generic products claiming BE)'],
            ]
          }
        ]
      },
      {
        id: 'form8_10',
        label: 'Form 8 / Form 10',
        sublabel: 'Import Licence — Drugs (excl. Schedule X)',
        authority: 'CDSCO (Central)',
        description: 'Main import licence for all drugs excluding Schedule X substances. Issued after valid Registration Certificate exists. Apply via SUGAM portal.',
        validity: '5 years (renewable)',
        portal: 'SUGAM Portal',
        timeline: '30–60 days after RC',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Covering letter on company letterhead (Indian importer/distributor)'],
              [MANDATORY, 'Application in Form 8'],
              [MANDATORY, 'Copy of valid Registration Certificate — Form 41 (must be current and not expired)'],
              [MANDATORY, 'Valid Wholesale Drug Licence (Form 20-G) of Indian importer'],
              [MANDATORY, 'Fee payment challan (SUGAM)'],
              [MANDATORY, 'Product list — INN, strength, dosage form, pack size, proposed MRP'],
              [CONDITIONAL, 'Fresh Form 9 undertaking from manufacturer (if RC was renewed or manufacturer changed)'],
            ]
          }
        ]
      },
      {
        id: 'form8a_10a',
        label: 'Form 8-A / Form 10-A',
        sublabel: 'Import Licence — Including Schedule X',
        authority: 'CDSCO (Central)',
        description: 'Import licence when product list includes Schedule X (psychotropic/narcotic) drugs. Same as Form 8/10 plus NCB/Narcotics requirements.',
        validity: '5 years',
        portal: 'SUGAM Portal',
        timeline: '45–75 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'All documents as in Form 8/10 above'],
              [MANDATORY, 'NOC from Narcotics Control Bureau (NCB) for Schedule X items'],
              [MANDATORY, 'Quota approval letter from Narcotics Commissioner (if applicable)'],
              [MANDATORY, 'Wholesale licence specifically covering Schedule X drugs'],
            ]
          }
        ]
      },
      {
        id: 'form42_43',
        label: 'Form 42 / Form 43',
        sublabel: 'Cosmetics Import Registration Certificate',
        authority: 'CDSCO (Central)',
        description: 'Registration Certificate for import of cosmetics into India. Required before any cosmetic import. Governed by Cosmetics Rules under D&C Rules 1945.',
        validity: '5 years',
        portal: 'SUGAM Portal',
        timeline: '3–6 months',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 42'],
              [MANDATORY, 'Free Sale Certificate from country of origin'],
              [MANDATORY, 'GMP certificate or manufacturing licence of cosmetics manufacturer'],
              [MANDATORY, 'Complete list of ingredients (INCI names) per product'],
              [MANDATORY, 'Product label (proposed for Indian market — comply with Cosmetics Rules labelling)'],
              [MANDATORY, 'Safety data / toxicology summary for each product'],
              [MANDATORY, 'Power of Attorney from foreign manufacturer to Indian importer'],
              [MANDATORY, 'Valid Wholesale / Trade licence of Indian authorised agent'],
              [MANDATORY, 'Fee payment challan'],
              [CONDITIONAL, 'Clinical / safety study reports (for skin-contact cosmetics or hair dyes)'],
              [CONDITIONAL, 'Prohibited substance declaration (negative test for banned substances)'],
            ]
          }
        ]
      },
      {
        id: 'form12',
        label: 'Form 12',
        sublabel: 'Small Quantity Import — Test / Analysis / R&D',
        authority: 'CDSCO (Central)',
        description: 'Permit to import small quantities of drugs exclusively for testing, analysis, or R&D purposes. NOT for commercial sale. Valid once only for stated quantity.',
        validity: 'Single use / stated quantity',
        portal: 'SUGAM Portal / CDSCO office',
        timeline: '7–15 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application letter / Form 12 (addressing CDSCO)'],
              [MANDATORY, 'Copy of manufacturing licence Form 25/28 (if existing manufacturer)'],
              [MANDATORY, 'DSIR registration certificate (if R&D unit without manufacturing licence)'],
              [MANDATORY, 'Form 29 (test licence) if applicable for manufacturing test samples'],
              [MANDATORY, 'Fee challan: TR-6 — Rs 100 for first drug, Rs 50 for each additional drug'],
              [MANDATORY, 'Utilisation break-up: product name, quantity, purpose, disposal plan'],
              [MANDATORY, 'Signing authority letter (authorising signatory details)'],
              [MANDATORY, 'Study protocol (if for clinical/bioequivalence/stability study)'],
            ]
          }
        ]
      },
    ]
  },

  {
    id: 'nda',
    label: 'New Drug Applications',
    icon: '💊',
    color: '#C05000',
    light: '#FFF0E6',
    authority: 'CDSCO (Central) — via SUGAM Portal — NDCT Rules 2019',
    apps: [
      {
        id: 'form44_nda',
        label: 'Form 44 — NDA / ANDA',
        sublabel: 'New Drug Application / Generic Drug Application',
        authority: 'CDSCO (Central)',
        description: 'Primary application for marketing authorisation of new drugs in India. Covers New Chemical Entities (NCE), subsequent new drugs (new dosage form/strength/indication), and generic drugs (ANDA — Abbreviated NDA). CTD format mandatory per NDCT Rules 2019.',
        validity: 'N/A (marketing authorisation perpetual post-approval)',
        portal: 'SUGAM Portal — sugam.gov.in',
        timeline: '12–24 months (NDA); 6–12 months (ANDA)',
        sections: [
          {
            title: 'Module 1 — Administrative',
            docs: [
              [MANDATORY, 'Form 44 — duly filled, signed by MD/Director, company stamp on each page'],
              [MANDATORY, 'Covering letter with product details, submission category, index of all documents'],
              [MANDATORY, 'Power of Attorney — notarised + apostilled (foreign manufacturers)'],
              [MANDATORY, 'Fee payment receipt from BharatKosh / SUGAM portal'],
              [MANDATORY, 'Manufacturing licence Form 25/28 (India-made) OR Import RC (Form 41) + Import licence (Form 10)'],
              [MANDATORY, 'Regulatory approval status in ICH countries (FDA approval letter, EMA SmPC, PMDA approval)'],
              [MANDATORY, 'Patent status declaration (Section 8, Patents Act — if patent applicable)'],
              [MANDATORY, 'Undertaking — patent non-infringement / Para IV declaration (if applicable)'],
              [MANDATORY, 'Draft label for Indian market — comply with D&C Rules labelling requirements'],
              [MANDATORY, 'Package Insert (PI) — Indian format with full prescribing information'],
              [MANDATORY, 'Patient Information Leaflet (PIL)'],
              [MANDATORY, 'Undertaking in Form 51 (if drug marketed under brand/trade name)'],
              [CONDITIONAL, 'Fixed Dose Combination (FDC) clinical rationale document (if FDC)'],
              [CONDITIONAL, 'Bridging study protocol / waiver justification (for new NCEs requiring Indian bridging)'],
            ]
          },
          {
            title: 'Module 2 — CTD Summaries',
            docs: [
              [MANDATORY, '2.3 Quality Overall Summary (QOS) — per ICH M4Q(R1)'],
              [MANDATORY, '2.4 Nonclinical Overview'],
              [MANDATORY, '2.5 Clinical Overview'],
              [MANDATORY, '2.6 Nonclinical Written and Tabulated Summaries'],
              [MANDATORY, '2.7 Clinical Summary'],
            ]
          },
          {
            title: 'Module 3 — Quality / CMC',
            docs: [
              [MANDATORY, '3.2.S.1–S.7 — Drug Substance: nomenclature, manufacture, characterisation, control, reference standards, container closure, stability'],
              [MANDATORY, '3.2.P.1–P.8 — Drug Product: description/composition, pharma development, manufacture, excipient control, product control, reference standards, container closure, stability'],
              [MANDATORY, 'Drug Master File (DMF) / ASMF reference letter (if API outsourced)'],
              [MANDATORY, 'Stability data — 3 batches; accelerated 40°C/75%RH (6 months) + long-term 30°C/65%RH (min 12 months) per ICH Q1A Zone IVb'],
              [MANDATORY, 'Bioequivalence / BA study report (for ANDA/generic — meet 80–125% CI per Schedule Y)'],
              [CONDITIONAL, '3.2.A — Appendices (facilities, adventitious agents, excipients of human/animal origin)'],
            ]
          },
          {
            title: 'Module 4 — Nonclinical (Schedule Y)',
            docs: [
              [MANDATORY, 'Primary pharmacodynamics (ICH S7A/S7B safety pharmacology)'],
              [MANDATORY, 'ADME studies (pharmacokinetics — single and repeat dose)'],
              [MANDATORY, 'Single-dose and repeat-dose toxicology (sub-acute + chronic)'],
              [MANDATORY, 'Genotoxicity studies (ICH S2 — Ames test, chromosomal aberration, in vivo micronucleus)'],
              [CONDITIONAL, 'Reproductive and developmental toxicity (ICH S5) — for relevant indications'],
              [CONDITIONAL, 'Carcinogenicity studies (ICH S1) — for long-term use drugs'],
              [CONDITIONAL, 'Local tolerance studies (for injectables, topicals)'],
            ]
          },
          {
            title: 'Module 5 — Clinical (NDCT Rules 2019)',
            docs: [
              [MANDATORY, 'Phase I clinical study reports (first-in-human, dose escalation, safety/PK data)'],
              [MANDATORY, 'Phase II clinical study reports (dose-finding, safety/efficacy signals)'],
              [MANDATORY, 'Phase III pivotal RCT reports (primary and secondary endpoints, patient data, safety)'],
              [MANDATORY, 'Indian bridging study data OR written justification/waiver (ICH E5 — ethnic bridging for NCEs)'],
              [MANDATORY, 'Ethics Committee (EC) approval letters for all Indian study sites (per NDCT Rules)'],
              [MANDATORY, 'Informed Consent Form (ICF) templates used at Indian clinical study sites'],
              [MANDATORY, 'CTRI (Clinical Trials Registry India) registration number for all Indian trials'],
              [MANDATORY, 'Clinical study protocol + all amendments (for each Indian Phase II/III study)'],
              [CONDITIONAL, 'Post-marketing surveillance data / PSURs (if marketed in other countries)'],
              [CONDITIONAL, 'Real-world evidence data (if supporting additional indications)'],
            ]
          }
        ]
      },
      {
        id: 'form44_fdc',
        label: 'Form 44 — Fixed Dose Combination (FDC)',
        sublabel: 'New FDC Application',
        authority: 'CDSCO (Central)',
        description: 'Application for marketing authorisation of a Fixed Dose Combination of two or more drugs in a fixed ratio. Requires strong clinical rationale. Subject to CDSCO expert committee review under Rule 122E.',
        validity: 'Marketing authorisation post-approval',
        portal: 'SUGAM Portal',
        timeline: '18–30 months',
        sections: [
          {
            title: 'FDC-specific Documents (in addition to standard Form 44)',
            docs: [
              [MANDATORY, 'Clinical rationale for the FDC — justification for combining the drugs (pharmacological, clinical, adherence benefit)'],
              [MANDATORY, 'PK interaction data between the two/more APIs in the combination'],
              [MANDATORY, 'Dose-response data for each individual component AND the combination'],
              [MANDATORY, 'Comparative clinical study vs monotherapy components (or published literature justification)'],
              [MANDATORY, 'Stability data for the combination — compatibility studies (APIs in presence of each other)'],
              [MANDATORY, 'Declaration that the FDC has a therapeutic advantage over individual components'],
              [CONDITIONAL, 'Published WHO / ICH / international guidelines supporting the combination'],
              [CONDITIONAL, 'Expert committee recommendation / prior consultation with CDSCO'],
            ]
          }
        ]
      },
      {
        id: 'form45_ct',
        label: 'Form 45 — Clinical Trial Permission',
        sublabel: 'Phase I / II / III / IV Clinical Trial',
        authority: 'CDSCO (Central) + Ethics Committee',
        description: 'Permission to conduct clinical trials in India. Mandatory before any Phase I–IV trial begins. Governed by NDCT Rules 2019. Registration on CTRI (Clinical Trials Registry India) mandatory.',
        validity: 'Per trial duration (protocol-specific)',
        portal: 'SUGAM Portal',
        timeline: '6–12 weeks (CDSCO review)',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 44 (clinical trial permission application)'],
              [MANDATORY, 'Clinical Trial Protocol (full protocol including study design, objectives, endpoints, statistics)'],
              [MANDATORY, 'Investigator\'s Brochure (IB) — updated, with all nonclinical and clinical data to date'],
              [MANDATORY, 'Phase I data (if applying for Phase II onwards) — including dose escalation, safety, PK'],
              [MANDATORY, 'Ethics Committee (EC/IEC) approval from CDSCO-registered EC'],
              [MANDATORY, 'Informed Consent Form (ICF) — in English AND local language(s)'],
              [MANDATORY, 'Principal Investigator CV and qualifications (GCP-certified)'],
              [MANDATORY, 'Site qualification details — infrastructure, staff, GCP training records'],
              [MANDATORY, 'Regulatory approvals from other countries (if multinational trial)'],
              [MANDATORY, 'Audio-visual aid (AVA) for patient consent (for illiterate participants)'],
              [MANDATORY, 'Compensation / insurance details (per NDCT Rules Schedule I)'],
              [CONDITIONAL, 'Drug supply arrangement details (import permit for investigational product)'],
              [CONDITIONAL, 'CRO contract details (if CRO conducting the trial)'],
              [CONDITIONAL, 'Pharmacovigilance plan and SAE reporting procedures'],
            ]
          }
        ]
      },
      {
        id: 'form44_biosimilar',
        label: 'Form 44 — Biological / Biosimilar',
        sublabel: 'New Biological Drug / Biosimilar Application',
        authority: 'CDSCO (Central)',
        description: 'Application for biological drugs (vaccines, monoclonal antibodies, recombinant proteins) and biosimilars. Follows CDSCO Guidelines on Similar Biologics 2012 (revised 2025 draft). Stricter comparability and immunogenicity requirements.',
        validity: 'Marketing authorisation post-approval',
        portal: 'SUGAM Portal',
        timeline: '18–36 months',
        sections: [
          {
            title: 'Biosimilar-specific Documents (in addition to standard Form 44)',
            docs: [
              [MANDATORY, 'Reference Biological Product (RBP) details — the innovator product used for comparability'],
              [MANDATORY, 'Physico-chemical characterisation — extensive (primary structure, post-translational modifications, higher-order structure)'],
              [MANDATORY, 'Functional comparability — in vitro assays, binding studies, bioassays'],
              [MANDATORY, 'Immunogenicity data — anti-drug antibody (ADA) assay development and validation'],
              [MANDATORY, 'Comparative non-clinical studies (PK/PD comparability with RBP)'],
              [MANDATORY, 'Comparative Phase III clinical trial (efficacy + safety vs RBP in sensitive indication)'],
              [MANDATORY, 'Post-market immunogenicity surveillance plan'],
              [CONDITIONAL, 'Cell banking records (Master Cell Bank and Working Cell Bank characterisation)'],
              [CONDITIONAL, 'Comparability exercise data (if manufacturing process changes during development)'],
            ]
          }
        ]
      },
    ]
  },

  {
    id: 'copp',
    label: 'COPP / Export Certificates',
    icon: '🌐',
    color: '#7B3F00',
    light: '#FFF4E8',
    authority: 'CDSCO (DCGI Office) — via ONDLS Portal (mandatory from July 15, 2025)',
    apps: [
      {
        id: 'copp',
        label: 'COPP',
        sublabel: 'Certificate of Pharmaceutical Product (WHO Format)',
        authority: 'CDSCO — DCGI Office',
        description: 'WHO-format certificate confirming that the pharmaceutical product is authorised for marketing in India. Required for product registration in most importing countries. Product-specific (not site-specific). From July 2025 — ONDLS portal mandatory; physical files not accepted.',
        validity: '2–3 years from date of notarisation',
        portal: 'ONDLS Portal — ondls.cdsco.gov.in (mandatory from July 15, 2025)',
        timeline: '20–30 working days',
        sections: [
          {
            title: 'A. Application / Administrative',
            docs: [
              [MANDATORY, 'Covering letter addressed to ADC/DDC (CDSCO Zonal/Sub-Zonal Officer) — stating destination country, product, purpose'],
              [MANDATORY, 'Application form via ONDLS portal (mandatory from July 15, 2025 — physical files not accepted)'],
              [MANDATORY, 'Fee payment online — ONDLS / BharatKosh'],
              [MANDATORY, 'List of products for which COPP required (INN, strength, dosage form, pack, shelf life)'],
            ]
          },
          {
            title: 'B. Regulatory / Licence Documents',
            docs: [
              [MANDATORY, 'Copy of valid manufacturing licence — Form 25 or Form 28 (product-specific dosage form)'],
              [MANDATORY, 'Copy of product marketing authorisation / product approval in India (Form 46 / state approval letter)'],
              [MANDATORY, 'Copy of product permission letters / NOC from CDSCO for all applied products'],
              [CONDITIONAL, 'Free Sale Certificate (FSC) issued by CDSCO or State FDA — if separately required by importing country'],
            ]
          },
          {
            title: 'C. GMP / Quality System',
            docs: [
              [MANDATORY, 'Copy of current valid WHO-GMP certificate (issued after last inspection) OR CDSCO GMP inspection clearance'],
              [MANDATORY, 'Site Master File (SMF) — current, covering all relevant products and dosage forms'],
              [MANDATORY, 'Schedule M compliance certificate / self-inspection declaration'],
              [MANDATORY, 'CDSCO / State FDA GMP inspection report (within last 2–3 years)'],
              [CONDITIONAL, 'Third-party GMP inspection report (UNICEF, WHO PQ, USAID) — strengthens application'],
            ]
          },
          {
            title: 'D. Product Technical Documents (per product)',
            docs: [
              [MANDATORY, 'Product Summary Sheet — INN, strength, dosage form, pack size, shelf life, storage conditions, manufacturer, marketing auth. holder'],
              [MANDATORY, 'Master Formula Record (MFR) — per product'],
              [MANDATORY, 'Approved finished product specification (all tests: appearance, assay, dissolution, impurities, micro, etc.)'],
              [MANDATORY, 'Certificate of Analysis (COA) — minimum 2–3 recent commercial batches (all parameters)'],
              [MANDATORY, 'Stability data summary — accelerated (40°C/75%RH) + real-time (30°C/65%RH) per ICH Q1A Zone IVb'],
              [MANDATORY, 'Shelf life statement (as approved by CDSCO / state authority)'],
              [MANDATORY, 'Summary of Product Characteristics (SmPC) / Approved Package Insert (PI)'],
              [MANDATORY, 'Label artwork (approved Indian label)'],
              [CONDITIONAL, 'Bioequivalence data summary (for generic solid oral dosage forms)'],
              [CONDITIONAL, 'Impurity profile summary (per ICH Q3A/Q3B)'],
            ]
          }
        ]
      },
      {
        id: 'who_gmp',
        label: 'WHO-GMP Certificate',
        sublabel: 'Good Manufacturing Practice Certificate for Site',
        authority: 'CDSCO — DCGI Office',
        description: 'Site-specific (not product-specific) GMP certificate issued to manufacturing facility. Mandatory for UNICEF tenders, WHO Prequalification, government procurement, and regulated market registrations.',
        validity: '2–3 years from date of issue',
        portal: 'ONDLS Portal (mandatory from July 15, 2025)',
        timeline: '45–90 days (may require fresh GMP inspection)',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application via ONDLS portal'],
              [MANDATORY, 'Valid manufacturing licence (Form 25/28) — all relevant dosage forms'],
              [MANDATORY, 'Site Master File (SMF) — updated within last 12 months'],
              [MANDATORY, 'Schedule M self-assessment / compliance checklist'],
              [MANDATORY, 'CDSCO GMP inspection report (within last 2–3 years)'],
              [MANDATORY, 'List of all products manufactured at site (with regulatory status and approval dates)'],
              [MANDATORY, 'Qualification and Validation Master Plan (VMP) — covering equipment, utilities, processes, cleaning, analytical methods'],
              [MANDATORY, 'Organisational chart and key personnel (QA Head, QC Head, Production Head — with qualifications and GMP training records)'],
              [MANDATORY, 'Annual Product Quality Review (APQR) — at least one product'],
              [MANDATORY, 'OOS / deviation / CAPA register summary (last 2 years)'],
              [MANDATORY, 'Master SOP list — particularly production, QC, QA, environmental monitoring, cleaning'],
              [CONDITIONAL, 'NABL / ISO 17025 accreditation certificate for QC laboratory'],
              [CONDITIONAL, 'Internal / third-party GMP audit report (within 12 months)'],
              [CONDITIONAL, 'Regulatory inspection history (FDA 483s, EMA findings, WHO PQ inspection) with CAPA closure evidence'],
            ]
          }
        ]
      },
      {
        id: 'fsc',
        label: 'Free Sale Certificate (FSC)',
        sublabel: 'Certificate confirming free sale in India',
        authority: 'CDSCO or State FDA',
        description: 'Certificate confirming that the product is freely sold in India without prescription restrictions. Often required alongside COPP by importing countries, especially for OTC and nutraceutical products.',
        validity: '1–2 years (as stated on certificate)',
        portal: 'CDSCO Zonal Office / ONDLS',
        timeline: '15–30 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application letter to CDSCO Zonal Office / State FDA'],
              [MANDATORY, 'Copy of manufacturing licence (Form 25/28)'],
              [MANDATORY, 'Copy of product marketing authorisation (CDSCO Form 46 / state permission)'],
              [MANDATORY, 'Product label / artwork (approved Indian label)'],
              [MANDATORY, 'Declaration that product is freely sold in India without prescription requirement'],
              [MANDATORY, 'Fee payment'],
              [CONDITIONAL, 'COA of recent commercial batch'],
            ]
          }
        ]
      },
    ]
  },

  {
    id: 'sale',
    label: 'Sale & Distribution',
    icon: '🏪',
    color: '#5C2D91',
    light: '#F0EBF8',
    authority: 'State FDA (State Licensing Authority)',
    apps: [
      {
        id: 'form19_20',
        label: 'Form 19 / Form 20',
        sublabel: 'Retail Pharmacy Licence — Chemist / Medical Store',
        authority: 'State FDA',
        description: 'Retail drug licence for pharmacy/chemist shops selling drugs to consumers. A Registered Pharmacist must be in-charge. Minimum area requirements apply.',
        validity: 'Perpetual (retention fee every 5 years)',
        portal: 'State FDA Portal / ONDLS',
        timeline: '15–30 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 19'],
              [MANDATORY, 'Fee payment challan'],
              [MANDATORY, 'Proof of premises (ownership / rental agreement — registered document)'],
              [MANDATORY, 'Site plan and layout (minimum 10 sq m as per D&C Rules)'],
              [MANDATORY, 'Registration certificate of Registered Pharmacist (in-charge) from Pharmacy Council'],
              [MANDATORY, 'Appointment / employment letter of Registered Pharmacist'],
              [MANDATORY, 'Educational qualification (B.Pharm / D.Pharm) of pharmacist (attested copies)'],
              [MANDATORY, 'Firm constitution documents (proprietorship declaration / partnership deed / company docs)'],
              [MANDATORY, 'Photo ID and address proof of proprietor/directors'],
              [MANDATORY, 'Declaration of cold storage / refrigerator availability (for Schedule C/C1/thermolabile drugs)'],
              [CONDITIONAL, 'NOC from local municipal corporation (state-specific)'],
              [CONDITIONAL, 'Photographs of premises (interior and exterior)'],
            ]
          }
        ]
      },
      {
        id: 'form21_20g',
        label: 'Form 21 / Form 20-G',
        sublabel: 'Wholesale Drug Licence — Distributor / C&F Agent',
        authority: 'State FDA',
        description: 'Wholesale licence for bulk distribution of drugs to retailers, hospitals, institutions. Required by C&F agents, stockists, super-stockists, hospital stores.',
        validity: 'Perpetual (retention fee every 5 years)',
        portal: 'State FDA Portal / ONDLS',
        timeline: '15–30 days',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form 21'],
              [MANDATORY, 'Fee payment challan'],
              [MANDATORY, 'Proof of premises (minimum area as per state rules — typically 15 sq m)'],
              [MANDATORY, 'Site plan and layout with area measurements'],
              [MANDATORY, 'Details of Competent Person (Registered Pharmacist OR Graduate in Science with 1 year experience)'],
              [MANDATORY, 'Appointment letter and qualification certificates of Competent Person'],
              [MANDATORY, 'Declaration of cold storage / refrigerator for Schedule C/C1 drugs'],
              [MANDATORY, 'Firm constitution documents'],
              [MANDATORY, 'Photo ID and address proof of proprietor/directors/partners'],
              [CONDITIONAL, 'Storage facility photographs (racking, temperature-controlled areas, segregation)'],
              [CONDITIONAL, 'Drug licence of principal company (if authorised C&F agent)'],
            ]
          }
        ]
      },
    ]
  },

  {
    id: 'meddev',
    label: 'Medical Devices',
    icon: '🩺',
    color: '#006B6B',
    light: '#E0F4F4',
    authority: 'CDSCO — Medical Devices Rules 2017',
    apps: [
      {
        id: 'md5_md9',
        label: 'MD-5 / MD-9',
        sublabel: 'Manufacturing Licence — Medical Devices',
        authority: 'CDSCO (Class C/D) + State FDA (Class A/B)',
        description: 'Manufacturing licence for medical devices. MD-5 for Class A & B (low/medium risk). MD-9 for Class C & D (high/critical risk). Inspection within 60 days for Class C & D.',
        validity: 'Perpetual (licence retention fee every 5 years)',
        portal: 'SUGAM Portal',
        timeline: '60–180 days (Class C/D requires CDSCO inspection)',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form MD-5 (Class A/B) or MD-9 (Class C/D)'],
              [MANDATORY, 'Proof of premises and site layout'],
              [MANDATORY, 'List of medical devices proposed to be manufactured with intended use'],
              [MANDATORY, 'ISO 13485 Quality Management System certificate (mandatory for Class C/D)'],
              [MANDATORY, 'Technical File / Design Dossier per MDR 2017'],
              [MANDATORY, 'Risk Management File (ISO 14971)'],
              [MANDATORY, 'Product test reports (performance and safety testing per applicable IS/IEC standards)'],
              [MANDATORY, 'Labelling (IFU — Instructions for Use) draft'],
              [MANDATORY, 'Post-Market Surveillance (PMS) plan'],
              [MANDATORY, 'Qualified Person / Technical Staff details (with qualifications in biomedical/engineering)'],
              [CONDITIONAL, 'Clinical evaluation report / clinical investigation data (for Class C/D)'],
              [CONDITIONAL, 'Sterilisation validation report (for sterile devices)'],
              [CONDITIONAL, 'Biocompatibility testing report (ISO 10993) — for devices in contact with body'],
              [CONDITIONAL, 'Shelf life / packaging validation report'],
            ]
          }
        ]
      },
      {
        id: 'md14_md15',
        label: 'MD-14 / MD-15',
        sublabel: 'Import Licence — Medical Devices',
        authority: 'CDSCO (Central)',
        description: 'Import licence for medical devices. MD-14 for Class A & B. MD-15 for Class C & D. Foreign manufacturer must appoint Indian Authorised Agent with wholesale drug licence.',
        validity: 'Perpetual',
        portal: 'SUGAM Portal',
        timeline: '90–270 days (CDSCO target: 270 days)',
        sections: [
          {
            title: 'Required Documents',
            docs: [
              [MANDATORY, 'Application in Form MD-14 (Class A/B) or MD-15 (Class C/D)'],
              [MANDATORY, 'Indian Authorised Agent details — name, address, wholesale/manufacturing licence'],
              [MANDATORY, 'Power of Attorney from foreign manufacturer to Indian Authorised Agent'],
              [MANDATORY, 'Manufacturing licence / GMP certificate from country of origin regulatory authority'],
              [MANDATORY, 'ISO 13485 certificate of foreign manufacturer'],
              [MANDATORY, 'CE marking / FDA 510(k) / regulatory approval in country of origin (if available)'],
              [MANDATORY, 'Technical File / Device Master Record per MDR 2017'],
              [MANDATORY, 'Risk Management File (ISO 14971)'],
              [MANDATORY, 'Product test reports (applicable IS/IEC/ISO standards)'],
              [MANDATORY, 'Instructions for Use (IFU) — English + proposed Indian language if needed'],
              [MANDATORY, 'Shelf life data and storage conditions'],
              [CONDITIONAL, 'Clinical investigation data / clinical evidence (Class C/D)'],
              [CONDITIONAL, 'Sterilisation validation (for sterile devices)'],
              [CONDITIONAL, 'Software documentation (for software as medical device — SaMD)'],
            ]
          }
        ]
      },
    ]
  },
];


// ══════════════════════════════════════════════════════════════════════════════
//  UI COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export function IndiaRegulatoryApp() {
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [searchQ,      setSearchQ]      = useState('');

  const cat  = CATEGORIES.find(c => c.id === selectedCat);
  const app  = cat?.apps.find(a => a.id === selectedApp);

  // Search across all apps
  const searchResults = searchQ.trim().length > 1
    ? CATEGORIES.flatMap(c => c.apps
        .filter(a => a.label.toLowerCase().includes(searchQ.toLowerCase())
                  || a.sublabel.toLowerCase().includes(searchQ.toLowerCase()))
        .map(a => ({ ...a, catId: c.id, catLabel: c.label, catColor: c.color })))
    : [];

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', fontFamily:"'Segoe UI', Arial, sans-serif" }}>

      {/* ── PANEL 1: Categories ─────────────────────────────────────────────── */}
      <div style={{ width:220, flexShrink:0, borderRight:`1px solid ${T.border}`,
        background:'#F8FAFD', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ background:T.navy, padding:'12px 14px', flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'0.5px' }}>
            🇮🇳 India Regulatory
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:2 }}>
            CDSCO · State FDA · NDCT Rules 2019
          </div>
        </div>

        {/* Search */}
        <div style={{ padding:'8px 10px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search forms..."
            style={{ width:'100%', padding:'5px 8px', border:`1px solid ${T.border}`,
              borderRadius:5, fontSize:11, boxSizing:'border-box',
              background:'#fff', fontFamily:'inherit' }}
          />
        </div>

        {/* Category list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {CATEGORIES.map(c => (
            <div key={c.id}
              onClick={() => { setSelectedCat(c.id); setSelectedApp(null); setSearchQ(''); }}
              style={{
                padding:'10px 14px', cursor:'pointer', borderBottom:`1px solid ${T.border}`,
                borderLeft: selectedCat===c.id ? `4px solid ${c.color}` : '4px solid transparent',
                background: selectedCat===c.id ? c.light : 'transparent',
                transition:'all .12s',
              }}
              onMouseOver={e => { if(selectedCat!==c.id) e.currentTarget.style.background=c.light+'88'; }}
              onMouseOut={e => { if(selectedCat!==c.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ fontSize:12, fontWeight:700,
                color: selectedCat===c.id ? c.color : T.text }}>
                {c.icon} {c.label}
              </div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>
                {c.apps.length} applications
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANEL 2: Applications ───────────────────────────────────────────── */}
      <div style={{ width:280, flexShrink:0, borderRight:`1px solid ${T.border}`,
        background:'#fff', display:'flex', flexDirection:'column' }}>

        {/* Panel header */}
        <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}`, flexShrink:0,
          background: cat ? cat.light : T.bg }}>
          {cat ? (
            <>
              <div style={{ fontSize:12, fontWeight:700, color:cat.color }}>
                {cat.icon} {cat.label}
              </div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{cat.authority}</div>
            </>
          ) : searchQ ? (
            <div style={{ fontSize:12, fontWeight:600, color:T.navy }}>
              Search results for "{searchQ}"
            </div>
          ) : (
            <div style={{ fontSize:12, color:T.muted }}>← Select a category</div>
          )}
        </div>

        {/* App list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {(searchQ.trim().length > 1 ? searchResults : (cat?.apps || [])).map(a => (
            <div key={a.id}
              onClick={() => {
                if (searchQ && a.catId) { setSelectedCat(a.catId); }
                setSelectedApp(a.id);
                setSearchQ('');
              }}
              style={{
                padding:'10px 14px', cursor:'pointer',
                borderBottom:`1px solid ${T.border}`,
                borderLeft: selectedApp===a.id
                  ? `4px solid ${cat?.color||T.navy}` : '4px solid transparent',
                background: selectedApp===a.id ? (cat?.light||T.bg) : 'transparent',
                transition:'all .12s',
              }}
              onMouseOver={e => { if(selectedApp!==a.id) e.currentTarget.style.background=T.bg; }}
              onMouseOut={e => { if(selectedApp!==a.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ fontSize:12, fontWeight:600,
                color: selectedApp===a.id ? (cat?.color||T.navy) : T.text }}>
                {a.label}
              </div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2, lineHeight:1.4 }}>
                {a.sublabel}
              </div>
              {a.authority && searchQ && (
                <div style={{ fontSize:9, color:T.dim, marginTop:2 }}>
                  {a.catLabel || a.authority}
                </div>
              )}
            </div>
          ))}

          {!cat && !searchQ && (
            <div style={{ padding:'40px 20px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🇮🇳</div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:6, color:T.navy }}>
                India Regulatory Intelligence
              </div>
              <div style={{ fontSize:11, lineHeight:1.7 }}>
                Select a category to browse applications and their required documents
              </div>
            </div>
          )}

          {searchQ && searchResults.length === 0 && (
            <div style={{ padding:'30px 20px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:20, marginBottom:8 }}>🔍</div>
              <div style={{ fontSize:12 }}>No results for "{searchQ}"</div>
            </div>
          )}
        </div>
      </div>

      {/* ── PANEL 3: Document Requirements ─────────────────────────────────── */}
      <div style={{ flex:1, background:T.bg, overflow:'hidden',
        display:'flex', flexDirection:'column' }}>

        {app ? (
          <>
            {/* App header */}
            <div style={{ background:cat?.color||T.navy, padding:'14px 20px', flexShrink:0 }}>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:4 }}>
                {app.label} — {app.sublabel}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {[
                  { icon:'🏢', val:app.authority },
                  { icon:'⏱', val:app.timeline },
                  { icon:'🌐', val:app.portal },
                  { icon:'📅', val:app.validity },
                ].map((m,i) => (
                  <span key={i} style={{ fontSize:10, color:'rgba(255,255,255,0.85)',
                    background:'rgba(0,0,0,0.20)', padding:'2px 8px', borderRadius:3 }}>
                    {m.icon} {m.val}
                  </span>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

              {/* Description */}
              <div style={{ background:'#fff', borderRadius:8, padding:'12px 16px',
                marginBottom:16, border:`1px solid ${T.border}`,
                borderLeft:`4px solid ${cat?.color||T.navy}` }}>
                <div style={{ fontSize:11, color:T.muted, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
                  Overview
                </div>
                <div style={{ fontSize:12, color:T.text, lineHeight:1.7 }}>
                  {app.description}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display:'flex', gap:16, marginBottom:12, fontSize:11 }}>
                <span style={{ color:'#991B1B', fontWeight:700 }}>
                  ◉ Mandatory
                </span>
                <span style={{ color:'#1E6B3A' }}>
                  ○ Conditional / where applicable
                </span>
              </div>

              {/* Document sections */}
              {app.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom:16, background:'#fff',
                  borderRadius:8, border:`1px solid ${T.border}`, overflow:'hidden' }}>

                  {/* Section header */}
                  <div style={{ padding:'8px 14px', background:cat?.color+'18'||T.bg,
                    borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:12, fontWeight:700, color:cat?.color||T.navy }}>
                      {sec.title}
                    </div>
                  </div>

                  {/* Document items */}
                  <div style={{ padding:'4px 0' }}>
                    {sec.docs.map(([type, text], di) => (
                      <div key={di} style={{
                        display:'flex', gap:10, padding:'7px 14px',
                        borderBottom: di < sec.docs.length-1 ? `1px solid #F3F4F6` : 'none',
                        background: type === MANDATORY ? 'transparent' : '#FAFFFE',
                      }}>
                        {/* Badge */}
                        <span style={{
                          flexShrink:0, width:18, height:18, borderRadius:'50%',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:10, fontWeight:800, marginTop:1,
                          background: type===MANDATORY ? '#FEE2E2' : '#DCFCE7',
                          color: type===MANDATORY ? '#991B1B' : '#166534',
                        }}>
                          {type===MANDATORY ? '◉' : '○'}
                        </span>
                        {/* Text */}
                        <span style={{
                          fontSize:12, color:T.text, lineHeight:1.55,
                          fontWeight: type===MANDATORY ? 500 : 400,
                        }}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Total count */}
              <div style={{ padding:'8px 12px', background:'#EEF4FF',
                borderRadius:6, border:`1px solid #BFD3EF`, fontSize:11, color:T.mid }}>
                <strong>Total: {app.sections.reduce((n,s)=>n+s.docs.length,0)} items</strong>
                {' · '}
                <span style={{ color:'#991B1B' }}>
                  {app.sections.reduce((n,s)=>n+s.docs.filter(d=>d[0]===MANDATORY).length,0)} mandatory
                </span>
                {' · '}
                <span style={{ color:'#1E6B3A' }}>
                  {app.sections.reduce((n,s)=>n+s.docs.filter(d=>d[0]===CONDITIONAL).length,0)} conditional
                </span>
              </div>

            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center',
            justifyContent:'center', flexDirection:'column', gap:12, padding:40 }}>
            <div style={{ fontSize:48 }}>📋</div>
            <div style={{ fontSize:16, fontWeight:700, color:T.navy }}>
              Select an Application
            </div>
            <div style={{ fontSize:13, color:T.muted, textAlign:'center', maxWidth:360, lineHeight:1.7 }}>
              Choose a category from the left panel, then select an application to view its complete document requirements
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
              {CATEGORIES.map(c => (
                <span key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  style={{ padding:'6px 14px', borderRadius:20, fontSize:12,
                    background:c.light, color:c.color, cursor:'pointer', fontWeight:600,
                    border:`1px solid ${c.color}30` }}>
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
