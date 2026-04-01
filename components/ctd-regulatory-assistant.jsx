'use client';

import React, { useState, useRef, useCallback } from "react";


const THEME = {
  // MS Word / Office-inspired professional light theme
  bg:         "#F0F0F0",
  surface:    "#FFFFFF",
  surfaceAlt: "#F7F7F7",
  surfaceHov: "#EEF4FB",
  border:     "#D4D4D4",
  borderDark: "#B0B0B0",
  accent:     "#2B579A",
  accentSoft: "#2B579A18",
  accentGlow: "#2B579A28",
  text:       "#1E1E1E",
  textMuted:  "#5D5D5D",
  textDim:    "#A8A8A8",
  green:      "#107C10",
  red:        "#C50F1F",
  blue:       "#0078D4",
  purple:     "#6264A7",
  brand:      "#C50F1F",
  ribbon:     "#2B579A",
  ribbonDark: "#1D3D6E",
};

// ─── Region metadata ──────────────────────────────────────────────────────────
// ─── All countries by continent ──────────────────────────────────────────────
const REGION_DATA = {
  "Supranational": [
    { code: "WHO",  authority: "WHO",   name: "World Health Organization",         color: "#1565C0", appNumPh: "WHO-000000",       portal: "who.int" },
    { code: "EMA",  authority: "EMA",   name: "European Medicines Agency",         color: "#003399", appNumPh: "EMEA/H/C/000000",  portal: "CESP Gateway" },
    { code: "PICS", authority: "PIC/S", name: "Pharmaceutical Inspection Co-operation Scheme", color: "#7B1FA2", appNumPh: "PICS-000000", portal: "picscheme.org" },
  ],
  "SRA": [
    // Shortcut list of ICH / Stringent Regulatory Authorities — countries remain in their original region tabs
    { code: "US",  authority: "FDA",        name: "United States",     color: "#B22234", appNumPh: "NDA000000",        portal: "ESG / ECTD Gateway" },
    { code: "EU",  authority: "EMA",        name: "European Union",    color: "#003399", appNumPh: "EMEA/H/C/000000",  portal: "CESP Gateway" },
    { code: "JP",  authority: "PMDA",       name: "Japan",             color: "#BC002D", appNumPh: "21300AMZ00000000", portal: "eCTD Gateway" },
    { code: "UK",  authority: "MHRA",       name: "United Kingdom",    color: "#012169", appNumPh: "PL00000/0000",     portal: "MHRA Submissions" },
    { code: "CA",  authority: "HC",         name: "Canada",            color: "#D80621", appNumPh: "HC-000000",        portal: "CESG Gateway" },
    { code: "AU",  authority: "TGA",        name: "Australia",         color: "#00008B", appNumPh: "PM-2024-00000-0",  portal: "TGA eBusiness" },
    { code: "CH",  authority: "Swissmedic", name: "Switzerland",       color: "#D52B1E", appNumPh: "CH-2024-000000",   portal: "Swissmedic ePortal" },
    { code: "KR",  authority: "MFDS",       name: "South Korea",       color: "#003478", appNumPh: "MFDS-000000",      portal: "mfds.go.kr" },
    { code: "SG",  authority: "HSA",        name: "Singapore",         color: "#EF3340", appNumPh: "HSA-000000",       portal: "hsa.gov.sg" },
  ],
  "Africa": [
    { code: "ZA",  authority: "SAHPRA", name: "South Africa",                      color: "#007A4D", appNumPh: "SAHPRA-000000",     portal: "sahpra.org.za" },
    { code: "NG",  authority: "NAFDAC", name: "Nigeria",                           color: "#008751", appNumPh: "NAFDAC-000000",     portal: "nafdac.gov.ng" },
    { code: "KE",  authority: "PPB",    name: "Kenya",                             color: "#006600", appNumPh: "PPB-000000",        portal: "pharmacyboardkenya.org" },
    { code: "GH",  authority: "FDA-GH", name: "Ghana",                             color: "#006B3F", appNumPh: "FDA-GH-000000",     portal: "fdaghana.gov.gh" },
    { code: "TZ",  authority: "TMDA",   name: "Tanzania",                          color: "#1EB53A", appNumPh: "TMDA-000000",       portal: "tmda.go.tz" },
    { code: "UG",  authority: "NDA-UG", name: "Uganda",                            color: "#000000", appNumPh: "NDA-UG-000000",     portal: "nda.or.ug" },
    { code: "ZW",  authority: "MCAZ",   name: "Zimbabwe",                          color: "#006400", appNumPh: "MCAZ-000000",       portal: "mcaz.co.zw" },
    { code: "CM",  authority: "DPML-CM",name: "Cameroon",                          color: "#007A5E", appNumPh: "DPML-000000",       portal: "minsante.cm" },
    { code: "SN",  authority: "ANRP-SN",name: "Senegal",                           color: "#00853F", appNumPh: "ANRP-000000",       portal: "sante.gouv.sn" },
    { code: "CI",  authority: "DPML-CI",name: "Ivory Coast",                       color: "#F77F00", appNumPh: "DPML-CI-000000",    portal: "dpml.ci" },
    { code: "MW",  authority: "PMRA",   name: "Malawi",                            color: "#CE1126", appNumPh: "PMRA-000000",       portal: "pmra.mw" },
    { code: "NA",  authority: "NMRC",   name: "Namibia",                           color: "#009543", appNumPh: "NMRC-000000",       portal: "nmrc.com.na" },
    { code: "BJ",  authority: "ABRP",   name: "Benin",                             color: "#008751", appNumPh: "ABRP-000000",       portal: "abrp.bj" },
    { code: "BF",  authority: "ANRP-BF",name: "Burkina Faso",                      color: "#EF2B2D", appNumPh: "ANRP-BF-000000",   portal: "anrp.bf" },
    { code: "BI",  authority: "ABREMA", name: "Burundi",                           color: "#CE1126", appNumPh: "ABREMA-000000",     portal: "abrema.bi" },
    { code: "CV",  authority: "ERIS",   name: "Cape Verde",                        color: "#003893", appNumPh: "ERIS-000000",       portal: "eris.cv" },
    { code: "CG",  authority: "DPM-CG", name: "Congo",                             color: "#009A44", appNumPh: "DPM-CG-000000",     portal: "sante.gouv.cg" },
    { code: "ML",  authority: "DPM-ML", name: "Mali",                              color: "#009A44", appNumPh: "DPM-ML-000000",     portal: "sante.gouv.ml" },
  ],
  "MENA": [
    // ── North Africa ──
    { code: "EG",  authority: "EDA",    name: "Egypt",                             color: "#CE1126", appNumPh: "EDA-000000",        portal: "eda.mohp.gov.eg" },
    { code: "MA",  authority: "DPM",    name: "Morocco",                           color: "#C1272D", appNumPh: "DPM-000000",        portal: "sante.gov.ma" },
    { code: "TN",  authority: "DPM-TN", name: "Tunisia",                           color: "#E70013", appNumPh: "DPM-TN-000000",     portal: "santetunisie.rns.tn" },
    { code: "DZ",  authority: "MIPA",   name: "Algeria",                           color: "#006233", appNumPh: "DZ-000000",         portal: "industrie-pharmac.gov.dz" },
    { code: "LY",  authority: "NCDC-LY",name: "Libya",                             color: "#000000", appNumPh: "LY-000000",         portal: "health.gov.ly" },
    { code: "MR",  authority: "CNM",    name: "Mauritania",                        color: "#006233", appNumPh: "CNM-000000",        portal: "sante.gov.mr" },
    // ── Middle East ──
    { code: "SA",  authority: "SFDA",   name: "Saudi Arabia",                      color: "#006C35", appNumPh: "SFDA-000000",       portal: "sfda.gov.sa" },
    { code: "AE",  authority: "MOHAP",  name: "UAE",                               color: "#00732F", appNumPh: "MOHAP-000000",      portal: "mohap.gov.ae" },
    { code: "KW",  authority: "KDFC",   name: "Kuwait",                            color: "#007A3D", appNumPh: "KW-000000",         portal: "moh.gov.kw" },
    { code: "QA",  authority: "QPD",    name: "Qatar",                             color: "#8D1B3D", appNumPh: "QA-000000",         portal: "moph.gov.qa" },
    { code: "BH",  authority: "NHRA",   name: "Bahrain",                           color: "#CE1126", appNumPh: "BH-000000",         portal: "nhra.gov.bh" },
    { code: "OM",  authority: "DGPA",   name: "Oman",                              color: "#DB161B", appNumPh: "OM-000000",         portal: "moh.gov.om" },
    { code: "JO",  authority: "JFDA",   name: "Jordan",                            color: "#007A3D", appNumPh: "JO-000000",         portal: "jfda.jo" },
    { code: "LB",  authority: "MOH-LB", name: "Lebanon",                           color: "#00A651", appNumPh: "LB-000000",         portal: "public.moph.gov.lb" },
    { code: "IQ",  authority: "KIMADIA",name: "Iraq",                              color: "#CE1126", appNumPh: "IQ-000000",         portal: "moh.gov.iq" },
    { code: "IR",  authority: "FDA-IR", name: "Iran",                              color: "#239F40", appNumPh: "IR-000000",         portal: "fda.gov.ir" },
    { code: "IL",  authority: "MOH-IL", name: "Israel",                            color: "#0038B8", appNumPh: "IL-000000",         portal: "health.gov.il" },
    { code: "SY",  authority: "DDC-SY", name: "Syria",                             color: "#CE1126", appNumPh: "SY-000000",         portal: "moh.gov.sy" },
    { code: "YE",  authority: "SBMMA",  name: "Yemen",                             color: "#CE1126", appNumPh: "YE-000000",         portal: "moh.gov.ye" },
    { code: "PS",  authority: "GDP-PS", name: "Palestine",                          color: "#000000", appNumPh: "PS-000000",         portal: "moh.ps" },
  ],
  "N. America": [
    { code: "US",  authority: "FDA",     name: "United States",                    color: "#B22234", appNumPh: "NDA000000",         portal: "ESG / ECTD Gateway" },
    { code: "CA",  authority: "HC",      name: "Canada",                           color: "#D80621", appNumPh: "HC-000000",         portal: "CESG Gateway" },
  ],
  "C. America": [
    { code: "MX",  authority: "COFEPRIS",name: "Mexico",                           color: "#006847", appNumPh: "COFEPRIS-000000",   portal: "cofepris.gob.mx" },
    { code: "GT",  authority: "MSPAS",   name: "Guatemala",                        color: "#4997D0", appNumPh: "MSPAS-000000",      portal: "mspas.gob.gt" },
    { code: "HN",  authority: "ARSA",    name: "Honduras",                         color: "#0073CF", appNumPh: "ARSA-000000",       portal: "arsa.gob.hn" },
    { code: "SV",  authority: "DSMSP",   name: "El Salvador",                      color: "#0F47AF", appNumPh: "DSMSP-000000",      portal: "salud.gob.sv" },
    { code: "NI",  authority: "DGRS",    name: "Nicaragua",                        color: "#3E6DBF", appNumPh: "DGRS-000000",       portal: "minsa.gob.ni" },
    { code: "CR",  authority: "MS-CR",   name: "Costa Rica",                       color: "#002B7F", appNumPh: "MS-CR-000000",      portal: "ministeriodesalud.go.cr" },
    { code: "PA",  authority: "DNFD",    name: "Panama",                           color: "#005293", appNumPh: "DNFD-000000",       portal: "minsa.gob.pa" },
  ],
  "Caribbean": [
    { code: "CU",  authority: "CECMED",  name: "Cuba",                             color: "#002A8F", appNumPh: "CECMED-000000",     portal: "cecmed.cu" },
    { code: "DO",  authority: "DGDF",    name: "Dominican Republic",               color: "#002D62", appNumPh: "DGDF-000000",       portal: "salud.gob.do" },
    { code: "JM",  authority: "MoH-JM", name: "Jamaica",                           color: "#000000", appNumPh: "JM-000000",         portal: "moh.gov.jm" },
    { code: "TT",  authority: "TT-Chem", name: "Trinidad & Tobago",                color: "#CE1126", appNumPh: "TT-000000",         portal: "health.gov.tt" },
    { code: "PR",  authority: "SARAFS",  name: "Puerto Rico",                      color: "#ED0C04", appNumPh: "PR-000000",         portal: "salud.pr.gov" },
  ],
  "S. America": [
    { code: "BR",  authority: "ANVISA",  name: "Brazil",                           color: "#009C3B", appNumPh: "ANVISA/2024/000000",portal: "ANVISA Solicita" },
    { code: "AR",  authority: "ANMAT",   name: "Argentina",                        color: "#74ACDF", appNumPh: "ANMAT-000000",      portal: "anmat.gob.ar" },
    { code: "CO",  authority: "INVIMA",  name: "Colombia",                         color: "#FCD116", appNumPh: "INVIMA-000000",     portal: "invima.gov.co" },
    { code: "CL",  authority: "ISP",     name: "Chile",                            color: "#D52B1E", appNumPh: "ISP-000000",        portal: "ispch.cl" },
    { code: "PE",  authority: "DIGEMID", name: "Peru",                             color: "#D91023", appNumPh: "DIGEMID-000000",    portal: "digemid.minsa.gob.pe" },
    { code: "VE",  authority: "INHRR",   name: "Venezuela",                        color: "#CF142B", appNumPh: "INHRR-000000",      portal: "mpps.gob.ve" },
    { code: "EC",  authority: "ARCSA",   name: "Ecuador",                          color: "#FFD100", appNumPh: "ARCSA-000000",      portal: "controlsanitario.gob.ec" },
    { code: "BO",  authority: "UNIMED",  name: "Bolivia",                          color: "#D52B1E", appNumPh: "UNIMED-000000",     portal: "snis.minsalud.gob.bo" },
    { code: "UY",  authority: "MSP-UY",  name: "Uruguay",                          color: "#0038A8", appNumPh: "MSP-000000",        portal: "msp.gub.uy" },
    { code: "PY",  authority: "DINAVISA",name: "Paraguay",                         color: "#D52B1E", appNumPh: "DINAVISA-000000",   portal: "dinavisa.gov.py" },
  ],
  "Asia": [
    { code: "IN",  authority: "CDSCO",  name: "India",                             color: "#FF9933", appNumPh: "CDSCO/2024/000000", portal: "SUGAM Portal" },
    { code: "JP",  authority: "PMDA",   name: "Japan",                             color: "#BC002D", appNumPh: "21300AMZ00000000",  portal: "eCTD Gateway" },
    { code: "CN",  authority: "NMPA",   name: "China",                             color: "#DE2910", appNumPh: "NMPA2024000000",    portal: "NMPA Online Platform" },
    { code: "KR",  authority: "MFDS",   name: "South Korea",                       color: "#003478", appNumPh: "MFDS-000000",       portal: "mfds.go.kr" },
    { code: "SG",  authority: "HSA",    name: "Singapore",                         color: "#EF3340", appNumPh: "HSA-000000",        portal: "hsa.gov.sg" },
    { code: "MY",  authority: "NPRA",   name: "Malaysia",                          color: "#CC0001", appNumPh: "NPRA-000000",       portal: "npra.gov.my" },
    { code: "TH",  authority: "FDA-TH", name: "Thailand",                          color: "#A51931", appNumPh: "FDA-TH-000000",     portal: "fda.moph.go.th" },
    { code: "ID",  authority: "BPOM",   name: "Indonesia",                         color: "#CE1126", appNumPh: "BPOM-000000",       portal: "pom.go.id" },
    { code: "PH",  authority: "FDA-PH", name: "Philippines",                       color: "#0038A8", appNumPh: "FDA-PH-CPR-000000", portal: "FDA eServices Portal (fda.gov.ph)" },
    { code: "VN",  authority: "DAV",    name: "Vietnam",                           color: "#DA251D", appNumPh: "DAV-000000",        portal: "dav.gov.vn" },
    { code: "PK",  authority: "DRAP",   name: "Pakistan",                          color: "#01411C", appNumPh: "DRAP-000000",       portal: "dra.gov.pk" },
    { code: "BD",  authority: "DGDA",   name: "Bangladesh",                        color: "#006A4E", appNumPh: "DGDA-000000",       portal: "dgda.gov.bd" },
    { code: "LK",  authority: "NMRA-LK",name: "Sri Lanka",                         color: "#8D153A", appNumPh: "NMRA-000000",       portal: "nmra.gov.lk" },
    { code: "NP",  authority: "DDA-NP", name: "Nepal",                             color: "#003893", appNumPh: "DDA-000000",        portal: "dda.gov.np" },
    { code: "TR",  authority: "TITCK",  name: "Turkey",                            color: "#E30A17", appNumPh: "TITCK-000000",      portal: "titck.gov.tr" },
    { code: "TW",  authority: "FDA-TW", name: "Taiwan",                            color: "#003087", appNumPh: "TW-000000",         portal: "fda.gov.tw" },
    { code: "HK",  authority: "DOH-HK", name: "Hong Kong",                         color: "#DE2910", appNumPh: "HK-000000",         portal: "dh.gov.hk" },
    { code: "MM",  authority: "FDA-MM", name: "Myanmar",                           color: "#FECB00", appNumPh: "MM-000000",         portal: "fda.gov.mm" },
    { code: "KH",  authority: "DDF-KH", name: "Cambodia",                          color: "#032EA1", appNumPh: "KH-000000",         portal: "maff.gov.kh" },
    { code: "LA",  authority: "FDD-LA", name: "Laos",                              color: "#CE1126", appNumPh: "LA-000000",         portal: "moh.gov.la" },
    { code: "MN",  authority: "MOH-MN", name: "Mongolia",                          color: "#C4272F", appNumPh: "MN-000000",         portal: "moh.mn" },
    { code: "MV",  authority: "MFDA",   name: "Maldives",                          color: "#D21034", appNumPh: "MV-000000",         portal: "fda.gov.mv" },
    { code: "BT",  authority: "DRA-BT", name: "Bhutan",                            color: "#FF8000", appNumPh: "BT-000000",         portal: "dra.gov.bt" },
    { code: "AF",  authority: "GDPA",   name: "Afghanistan",                       color: "#009A44", appNumPh: "AF-000000",         portal: "moph.gov.af" },
  ],
  "Europe": [
    { code: "UK",  authority: "MHRA",   name: "United Kingdom",                    color: "#012169", appNumPh: "PL00000/0000",      portal: "MHRA Submissions" },
    { code: "CH",  authority: "Swissmedic",name:"Switzerland",                     color: "#D52B1E", appNumPh: "CH-2024-000000",    portal: "Swissmedic ePortal" },
    { code: "DE",  authority: "BfArM",  name: "Germany",                           color: "#000000", appNumPh: "DE-000000",         portal: "bfarm.de" },
    { code: "FR",  authority: "ANSM",   name: "France",                            color: "#002395", appNumPh: "FR-000000",         portal: "ansm.sante.fr" },
    { code: "IT",  authority: "AIFA",   name: "Italy",                             color: "#009246", appNumPh: "IT-000000",         portal: "aifa.gov.it" },
    { code: "ES",  authority: "AEMPS",  name: "Spain",                             color: "#AA151B", appNumPh: "ES-000000",         portal: "aemps.es" },
    { code: "NL",  authority: "CBG-MEB",name: "Netherlands",                       color: "#AE1C28", appNumPh: "NL-000000",         portal: "cbg-meb.nl" },
    { code: "BE",  authority: "FAMHP",  name: "Belgium",                           color: "#FAE042", appNumPh: "BE-000000",         portal: "fagg-afmps.be" },
    { code: "SE",  authority: "MPA-SE", name: "Sweden",                            color: "#006AA7", appNumPh: "SE-000000",         portal: "lakemedelsverket.se" },
    { code: "DK",  authority: "DKMA",   name: "Denmark",                           color: "#C60C30", appNumPh: "DK-000000",         portal: "dkma.dk" },
    { code: "NO",  authority: "NOMA",   name: "Norway",                            color: "#EF2B2D", appNumPh: "NO-000000",         portal: "legemiddelverket.no" },
    { code: "FI",  authority: "FIMEA",  name: "Finland",                           color: "#003580", appNumPh: "FI-000000",         portal: "fimea.fi" },
    { code: "PL",  authority: "URPL",   name: "Poland",                            color: "#DC143C", appNumPh: "PL-000000",         portal: "urpl.gov.pl" },
    { code: "PT",  authority: "INFARMED",name:"Portugal",                          color: "#006600", appNumPh: "PT-000000",         portal: "infarmed.pt" },
    { code: "AT",  authority: "BASG",   name: "Austria",                           color: "#ED2939", appNumPh: "AT-000000",         portal: "basg.gv.at" },
    { code: "GR",  authority: "EOF",    name: "Greece",                            color: "#0D5EAF", appNumPh: "GR-000000",         portal: "eof.gr" },
    { code: "CZ",  authority: "SÚKL",   name: "Czech Republic",                    color: "#D7141A", appNumPh: "CZ-000000",         portal: "sukl.cz" },
    { code: "HU",  authority: "OGYEI",  name: "Hungary",                           color: "#CE2939", appNumPh: "HU-000000",         portal: "ogyei.gov.hu" },
    { code: "RO",  authority: "ANMDM",  name: "Romania",                           color: "#002B7F", appNumPh: "RO-000000",         portal: "anm.ro" },
    { code: "BG",  authority: "BDA",    name: "Bulgaria",                          color: "#00966E", appNumPh: "BG-000000",         portal: "bda.bg" },
    { code: "HR",  authority: "HALMED", name: "Croatia",                           color: "#FF0000", appNumPh: "HR-000000",         portal: "halmed.hr" },
    { code: "SK",  authority: "ŠÚKL",   name: "Slovakia",                          color: "#0B4EA2", appNumPh: "SK-000000",         portal: "sukl.sk" },
    { code: "IE",  authority: "HPRA",   name: "Ireland",                           color: "#169B62", appNumPh: "IE-000000",         portal: "hpra.ie" },
    { code: "LT",  authority: "SMCA",   name: "Lithuania",                         color: "#006A44", appNumPh: "LT-000000",         portal: "vvkt.lt" },
    { code: "LV",  authority: "SAM-LV", name: "Latvia",                            color: "#9E3039", appNumPh: "LV-000000",         portal: "zva.gov.lv" },
    { code: "EE",  authority: "SAM-EE", name: "Estonia",                           color: "#0072CE", appNumPh: "EE-000000",         portal: "ravimiamet.ee" },
    { code: "SI",  authority: "JAZMP",  name: "Slovenia",                          color: "#003DA5", appNumPh: "SI-000000",         portal: "jazmp.si" },
    { code: "CY",  authority: "PHS-CY", name: "Cyprus",                            color: "#4E9E51", appNumPh: "CY-000000",         portal: "moh.gov.cy" },
    { code: "MT",  authority: "MMA",    name: "Malta",                             color: "#CF142B", appNumPh: "MT-000000",         portal: "medicinesauthority.gov.mt" },
    { code: "LU",  authority: "MOH-LU", name: "Luxembourg",                        color: "#EF3340", appNumPh: "LU-000000",         portal: "ms.public.lu" },
    { code: "IS",  authority: "IMA",    name: "Iceland",                           color: "#003897", appNumPh: "IS-000000",         portal: "serlyfjaskra.is" },
    { code: "AL",  authority: "AKBPM",  name: "Albania",                           color: "#E41E20", appNumPh: "AL-000000",         portal: "akbpm.gov.al" },
    { code: "LI",  authority: "AHV-LI", name: "Liechtenstein",                     color: "#002B7F", appNumPh: "LI-000000",         portal: "llv.li" },
  ],
  "CIS": [
    { code: "RU",  authority: "ROSZDRAV",name: "Russia",                           color: "#D52B1E", appNumPh: "RU-000000",         portal: "roszdravnadzor.gov.ru" },
    { code: "UA",  authority: "MOH-UA",  name: "Ukraine",                          color: "#005BBB", appNumPh: "UA-000000",         portal: "moz.gov.ua" },
    { code: "BY",  authority: "MOH-BY",  name: "Belarus",                          color: "#CF101A", appNumPh: "BY-000000",         portal: "minzdrav.gov.by" },
    { code: "KZ",  authority: "NDDA",    name: "Kazakhstan",                       color: "#00AFCA", appNumPh: "KZ-000000",         portal: "ndda.kz" },
    { code: "UZ",  authority: "NCDC",    name: "Uzbekistan",                       color: "#1EB53A", appNumPh: "UZ-000000",         portal: "dav.gov.uz" },
    { code: "AZ",  authority: "CAE-AZ",  name: "Azerbaijan",                       color: "#0092BC", appNumPh: "AZ-000000",         portal: "icare.gov.az" },
    { code: "AM",  authority: "SCDMTE",  name: "Armenia",                          color: "#D90012", appNumPh: "AM-000000",         portal: "pharm.am" },
    { code: "GE",  authority: "NMCE-GE", name: "Georgia",                          color: "#FF0000", appNumPh: "GE-000000",         portal: "moh.gov.ge" },
    { code: "MD",  authority: "ANSP-MD", name: "Moldova",                          color: "#003DA5", appNumPh: "MD-000000",         portal: "ansp.md" },
    { code: "KG",  authority: "SDMP-KG", name: "Kyrgyzstan",                       color: "#E8112D", appNumPh: "KG-000000",         portal: "mz.gov.kg" },
    { code: "TJ",  authority: "MOH-TJ",  name: "Tajikistan",                       color: "#006600", appNumPh: "TJ-000000",         portal: "moh.tj" },
    { code: "TM",  authority: "MOH-TM",  name: "Turkmenistan",                     color: "#1DBE4C", appNumPh: "TM-000000",         portal: "saglykhemy.gov.tm" },
  ],
  "Oceania": [
    { code: "AU",  authority: "TGA",    name: "Australia",                         color: "#00008B", appNumPh: "PM-2024-00000-0",   portal: "TGA eBusiness" },
    { code: "NZ",  authority: "MEDSAFE",name: "New Zealand",                       color: "#00247D", appNumPh: "NZ-000000",         portal: "medsafe.govt.nz" },
    { code: "PG",  authority: "PSSB",   name: "Papua New Guinea",                  color: "#000000", appNumPh: "PG-000000",         portal: "health.gov.pg" },
  ],
};

// Flat lookup for backward compatibility
const REGION_META = Object.values(REGION_DATA).flat().reduce((acc, r) => {
  acc[r.code] = r;
  return acc;
}, {});

// ─── Region-specific submission types ────────────────────────────────────────
const REGION_SUB_TYPES = {
  US: [
    { value: "NDA",   label: "NDA — New Drug Application",              desc: "New chemical entity or new formulation for marketing approval" },
    { value: "ANDA",  label: "ANDA — Abbreviated New Drug Application", desc: "Generic drug application referencing an approved NDA" },
    { value: "BLA",   label: "BLA — Biologics License Application",     desc: "Biological products including vaccines, blood, and cellular therapies" },
    { value: "IND",   label: "IND — Investigational New Drug",          desc: "Authorization to begin clinical trials in the US" },
    { value: "NDA-PAS", label: "NDA-PAS — Prior Approval Supplement",  desc: "Post-approval change requiring FDA approval before implementation" },
    { value: "NDA-CBE30", label: "NDA-CBE30 — Changes Being Effected (30 days)", desc: "Moderate post-approval change; implement 30 days after submission" },
    { value: "NDA-CBE0",  label: "NDA-CBE0 — Changes Being Effected",  desc: "Low-risk post-approval change; implement upon submission" },
    { value: "NDA-AR",    label: "NDA-AR — Annual Report",             desc: "Annual summary of minor changes and manufacturing data" },
    { value: "NDA-Efficacy Supplement", label: "NDA-Efficacy Supplement", desc: "New indication, dosage form, or labeling expansion" },
    { value: "DMF",   label: "DMF — Drug Master File",                 desc: "Confidential submission for reference by other applicants" },
    // ── API DOSSIER ──
    { value: "DMF-Type-II",  label: "DMF Type II — API / Drug Substance",     desc: "API master file covering synthesis, manufacturing, controls, and stability of drug substance" },
    { value: "DMF-Type-III", label: "DMF Type III — Packaging Material",       desc: "Master file for packaging components referenced in NDA/ANDA" },
    { value: "DMF-Type-IV",  label: "DMF Type IV — Excipient / Colorant",      desc: "Confidential excipient dossier referenced by finished product applicants" },
    { value: "DMF-Type-V",   label: "DMF Type V — FDA-Accepted Reference Info", desc: "Pre-cleared reference information package accepted by FDA" },
    { value: "API-DOSSIER",  label: "API Dossier — Common Technical Document",  desc: "Full CTD Module 3.2.S API/drug substance dossier for standalone regulatory submission or reference" },
  ],
  EU: [
    { value: "MAA",        label: "MAA — Marketing Authorisation Application",  desc: "Initial application for marketing authorisation in the EU" },
    { value: "MAA-DCP",    label: "MAA-DCP — Decentralised Procedure",          desc: "Simultaneous authorisation in multiple EU member states" },
    { value: "MAA-MRP",    label: "MAA-MRP — Mutual Recognition Procedure",     desc: "Extension of existing national authorisation to other member states" },
    { value: "MAA-CP",     label: "MAA-CP — Centralised Procedure",             desc: "Single EU-wide authorisation via EMA (mandatory for biotech, orphan, etc.)" },
    { value: "Variation-IA", label: "Variation Type IA — Minor Variation",      desc: "Minor change with no impact on quality/safety; notify and implement" },
    { value: "Variation-IB", label: "Variation Type IB — Minor Variation",      desc: "Moderate change; notify before implementing" },
    { value: "Variation-II", label: "Variation Type II — Major Variation",      desc: "Major change requiring prior approval before implementation" },
    { value: "Extension",  label: "Extension of Indication",                    desc: "New therapeutic indication or major labeling change" },
    { value: "Renewal",    label: "5-Year Renewal",                             desc: "Periodic benefit-risk assessment renewal submission" },
    { value: "IMPD",       label: "IMPD — Investigational Medicinal Product Dossier", desc: "Clinical trial authorisation for investigational products" },
    { value: "ASMF",       label: "ASMF — Active Substance Master File",        desc: "Confidential drug substance information for EU submissions" },
    // ── API DOSSIER ──
    { value: "ASMF-Full",  label: "ASMF Full Dossier",                          desc: "Complete Active Substance Master File (Applicant's + Restricted Part) per EMA ASMF guideline" },
    { value: "CEP",        label: "CEP — Certificate of Suitability (EDQM)",    desc: "EDQM Certificate of Suitability confirming API compliance with European Pharmacopoeia monograph" },
    { value: "API-Dossier-EU", label: "API Dossier (Module 3.2.S — EU CTD)",   desc: "Standalone API/drug substance CTD dossier (Module 3.2.S) for EU regulatory reference or standalone filing" },
    { value: "WC-Dossier", label: "Well-Characterised Biological Dossier",      desc: "Active substance dossier for well-characterised biologics submitted per EMA scientific guidelines" },
  ],
  JP: [
    { value: "JNDA",       label: "JNDA — New Drug Application (Japan)",        desc: "Initial marketing approval application to PMDA/MHLW" },
    { value: "JGDA",       label: "JGDA — Generic Drug Application",            desc: "Generic drug application in Japan" },
    { value: "JCTA",       label: "JCTA — Clinical Trial Application",          desc: "Notification to conduct clinical trials (CTA/CTN) in Japan" },
    { value: "J-Partial Change", label: "Partial Change Application",           desc: "Post-approval change requiring PMDA approval" },
    { value: "J-Minor Change",   label: "Minor Change Notification",            desc: "Minor post-approval change; notify within 30 days" },
    { value: "J-DMF",      label: "MF — Drug Master File (Japan)",             desc: "Japanese master file for drug substance/packaging" },
    // ── API DOSSIER ──
    { value: "J-API-Dossier", label: "API Dossier — PMDA Module 3.2.S",        desc: "Drug substance CTD dossier submitted to PMDA as standalone or referenced in JNDA" },
    { value: "J-CEP",         label: "CEP — EDQM Certificate (Japan accepted)", desc: "EDQM CEP accepted by PMDA in lieu of full API dossier where applicable" },
    { value: "MF-Packaging",  label: "MF — Packaging / Excipient Master File",  desc: "Japanese master file covering packaging materials or excipients" },
  ],
  CA: [
    { value: "NDS",        label: "NDS — New Drug Submission",                  desc: "Initial application for new drug market approval in Canada" },
    { value: "ANDS",       label: "ANDS — Abbreviated New Drug Submission",     desc: "Generic drug application referencing an approved NDS" },
    { value: "BLA-CA",     label: "BLA — Biologics Licence Application",        desc: "Biological product marketing authorisation in Canada" },
    { value: "CTA",        label: "CTA — Clinical Trial Application",           desc: "Authorization to conduct clinical trials in Canada" },
    { value: "Supplement-S", label: "Supplement — Significant Change",         desc: "Post-approval significant change requiring prior approval" },
    { value: "Notifiable Change", label: "Notifiable Change",                  desc: "Post-approval change requiring notification to Health Canada" },
    { value: "Annual Notification", label: "Annual Notification",              desc: "Annual report of minor changes and manufacturing data" },
    { value: "DMF-CA",     label: "DMF — Drug Master File (Canada)",            desc: "Canadian drug master file for reference submissions" },
    // ── API DOSSIER ──
    { value: "API-Dossier-CA", label: "API Dossier — Health Canada Module 3.2.S", desc: "Drug substance CTD dossier per Health Canada CTD guidance — standalone or referenced in NDS/ANDS" },
    { value: "CEP-CA",         label: "CEP — EDQM Certificate (Health Canada)",   desc: "EDQM Certificate of Suitability accepted by Health Canada in lieu of full API dossier" },
    { value: "DMF-Excipient-CA", label: "DMF — Excipient Master File (Canada)",   desc: "Health Canada master file for excipients/packaging materials referenced in drug submissions" },
  ],
  AU: [
    { value: "Type 1 — New",    label: "Type 1 — New Prescription Medicine",   desc: "New chemical entity or new formulation requiring full evaluation" },
    { value: "Type 2",          label: "Type 2 — Generic Medicine",             desc: "Generic application referencing an approved registered medicine" },
    { value: "Type 3",          label: "Type 3 — OTC / Complementary",         desc: "Over-the-counter or complementary medicines registration" },
    { value: "Type 4 — Biosimilar", label: "Type 4 — Biosimilar",              desc: "Biosimilar application per TGA guidance" },
    { value: "PM-Major",        label: "PM — Post-Market Change (Major)",       desc: "Major post-approval change requiring TGA evaluation" },
    { value: "PM-Minor",        label: "PM — Post-Market Change (Minor)",       desc: "Minor post-approval change with administrative notification" },
    { value: "CTN",             label: "CTN — Clinical Trial Notification",     desc: "Notification scheme for clinical trials in Australia" },
    { value: "ARTG",            label: "ARTG Inclusion — Listed Medicine",      desc: "Listing in the Australian Register of Therapeutic Goods" },
    // ── API DOSSIER ──
    { value: "API-Dossier-AU",  label: "API Dossier — TGA Module 3.2.S",       desc: "Drug substance CTD dossier submitted to TGA as standalone or referenced in prescription medicine application" },
    { value: "CEP-AU",          label: "CEP — EDQM Certificate (TGA accepted)", desc: "EDQM Certificate of Suitability accepted by TGA — simplifies Module 3.2.S requirements" },
    { value: "MF-TGA",          label: "Master File — TGA Packaging/Excipient", desc: "TGA master file for packaging materials or excipients referenced by finished product sponsors" },
  ],
  UK: [
    { value: "MA",              label: "MA — Marketing Authorisation",          desc: "New marketing authorisation via MHRA (post-Brexit)" },
    { value: "MA-NI",           label: "MA-NI — Northern Ireland (via EMA)",   desc: "Northern Ireland remains under EU centralised procedure" },
    { value: "Variation-Minor", label: "Minor Variation",                       desc: "Minor post-approval change with MHRA notification" },
    { value: "Variation-Major", label: "Major Variation",                       desc: "Major post-approval change requiring MHRA approval" },
    { value: "CTA-UK",          label: "CTA — Clinical Trial Authorisation",   desc: "Authorisation to conduct clinical trials in the UK" },
    { value: "PLR",             label: "PLR — Product Licence",                desc: "Standard product licence for medicines in Great Britain" },
    // ── API DOSSIER ──
    { value: "ASMF-UK",         label: "ASMF — Active Substance Master File (MHRA)", desc: "UK post-Brexit ASMF per MHRA guidance — Applicant's Part + Restricted Part" },
    { value: "CEP-UK",          label: "CEP — EDQM Certificate (MHRA accepted)",     desc: "EDQM CEP accepted by MHRA for Great Britain and Northern Ireland submissions" },
    { value: "API-Dossier-UK",  label: "API Dossier — MHRA Module 3.2.S",           desc: "Drug substance CTD dossier for standalone UK API submission or reference in MA application" },
  ],
  CH: [
    { value: "Swissmedic-New",    label: "New Authorisation",                  desc: "Initial authorisation for new medicinal products in Switzerland" },
    { value: "Swissmedic-Generic", label: "Generic Authorisation",             desc: "Generic medicine authorisation referencing approved product" },
    { value: "Swissmedic-Var-Major", label: "Major Variation",                 desc: "Major post-approval change requiring Swissmedic approval" },
    { value: "Swissmedic-Var-Minor", label: "Minor Variation",                 desc: "Minor post-approval change via notification" },
    { value: "CTA-CH",            label: "CTA — Clinical Trial Application",  desc: "Clinical trial authorisation in Switzerland" },
    // ── API DOSSIER ──
    { value: "ASMF-CH",           label: "ASMF — Active Substance Master File (Swissmedic)", desc: "Drug substance master file submitted to Swissmedic per Swiss Pharma regulation" },
    { value: "CEP-CH",            label: "CEP — EDQM Certificate (Swissmedic)", desc: "EDQM Certificate of Suitability accepted by Swissmedic" },
    { value: "API-Dossier-CH",    label: "API Dossier — Swissmedic Module 3.2.S", desc: "Drug substance CTD dossier for Swiss regulatory submission" },
  ],
  IN: [
    // ── DRUGS (New Drugs — Schedule Y / D&C Act Rule 122) ──
    { value: "NDA-IN",           label: "NDA — New Drug Application (Form 44)",           desc: "New drug application to CDSCO under D&C Act Rule 122B — Schedule Y compliant CTD dossier" },
    { value: "ANDA-IN",          label: "ANDA — Abbreviated New Drug Application",         desc: "Generic drug application (Form 44) with bioequivalence and comparative dissolution data" },
    { value: "SNDA-IN",          label: "SNDA — Subsequent New Drug Application",          desc: "New indication, formulation, or dosage form for an already approved drug" },
    { value: "BAP",              label: "BAP — Biological / Biosimilar Application",       desc: "Biologics and biosimilars per CDSCO guidelines — includes reference comparator data" },
    { value: "Fixed-Dose-Combo", label: "FDC — Fixed Dose Combination (Form 44)",          desc: "New FDC application per CDSCO FDC guidelines — requires independent clinical justification" },
    { value: "Phytopharmaceutical", label: "Phytopharmaceutical Drug Application",         desc: "Herbal / plant-derived drug application under CDSCO Phytopharmaceutical Guidelines 2015" },
    // ── CLINICAL TRIALS (Rule 122 DAB/DAC) ──
    { value: "IND-IN",           label: "IND — Permission to Import Investigational Drug", desc: "Form 12 — Permission to import new drug for Phase I–III clinical trial" },
    { value: "CT-IN",            label: "CT Permission — Clinical Trial (Form CT-04)",     desc: "Permission to conduct Phase I/II/III/IV clinical trials in India (CTRI registration required)" },
    { value: "BA-BE",            label: "BA/BE Study Permission",                          desc: "Bioavailability / bioequivalence study permission for generic development" },
    { value: "CELR",             label: "CELR — Clinical Trial Registry",                  desc: "Clinical Establishment Licence renewal for trial sites" },
    // ── IMPORT / MANUFACTURING ──
    { value: "Import-Licence",   label: "Import Licence (Form 10 / Form 10-A)",            desc: "Licence to import new or approved drug for sale/distribution in India" },
    { value: "Mfg-Licence",      label: "Manufacturing Licence (Form 25/25A)",             desc: "Licence to manufacture drugs for sale — issued under D&C Act Rule 68 by State Licensing Authority" },
    { value: "Loan-Licence",     label: "Loan Licence (Form 25B)",                         desc: "Manufacturing under loan licence arrangement using third-party facilities" },
    { value: "Repacking-Licence", label: "Repacking / Relabelling Licence",               desc: "Licence for repacking or relabelling of imported bulk drugs" },
    // ── POST-APPROVAL / VARIATIONS ──
    { value: "Variation-Major",  label: "Major Variation — Post Approval Change",          desc: "Changes to approved drug requiring prior CDSCO approval: manufacturing site, new strength" },
    { value: "Variation-Minor",  label: "Minor Variation — Notification",                  desc: "Minor post-approval changes notified to CDSCO: packaging, shelf-life extension, labelling" },
    { value: "Annual Return",    label: "Annual Return (Form 18 / 19)",                    desc: "Annual sales and manufacturing data return to State Licensing Authority" },
    // ── COSMETICS (D&C Act Part XIII, Rules 144–157) ──
    { value: "Cosmetic-Import",  label: "Cosmetic — Import Registration (Form COS-1)",     desc: "Registration of imported cosmetics under D&C Act Part XIII — includes safety dossier and labelling" },
    { value: "Cosmetic-Mfg",     label: "Cosmetic — Manufacturing Licence",                desc: "State Licensing Authority licence to manufacture cosmetics per D&C Act Schedule Q GMP" },
    { value: "Cosmetic-Notif",   label: "Cosmetic — Mandatory Notification",               desc: "Mandatory pre-market notification for cosmetics per D&C Act (Amendment) 2020" },
    { value: "Cosmetic-Variation", label: "Cosmetic — Post-Approval Variation",            desc: "Notification for changes to registered/approved cosmetic formulation or labelling" },
    // ── API DOSSIER ──
    { value: "API-Dossier-IN",    label: "API Dossier — CDSCO Drug Substance CTD",         desc: "Drug substance (API) dossier per CDSCO Schedule Y CTD format — Module 3.2.S compliant" },
    { value: "API-Mfg-Licence",   label: "API Manufacturing Licence (Form 25/25D)",         desc: "Licence to manufacture Active Pharmaceutical Ingredients for sale — D&C Act Rule 68A" },
    { value: "API-Export-Cert",   label: "API Export Certificate",                          desc: "Certificate for export of APIs per D&C Act — required for international regulatory filings" },
    { value: "API-CoA-Dossier",   label: "API Quality Dossier (CoA + Stability)",           desc: "Analytical quality package including Certificate of Analysis, stability data, and impurity profile" },
    { value: "WC-CDSCO",          label: "Written Confirmation — EDQM / ICH Q7 GMP",       desc: "Written confirmation from API manufacturer confirming GMP compliance per ICH Q7 for export" },
  ],
  CN: [
    { value: "NMPA-NDA",     label: "NDA — New Drug Application (China)",      desc: "New drug registration with NMPA/CDE" },
    { value: "NMPA-Generic", label: "Generic Drug Registration",               desc: "Generic application with bioequivalence data" },
    { value: "NMPA-Biosimilar", label: "Biosimilar Registration",              desc: "Biosimilar application per NMPA biosimilar guidelines" },
    { value: "IND-CN",       label: "IND — Clinical Trial Application",        desc: "CTA for clinical trials in China (60-day default approval)" },
    { value: "NMPA-Supplement", label: "Supplement — Post-Approval Change",   desc: "Post-approval change submission to NMPA" },
    // ── API DOSSIER ──
    { value: "API-Dossier-CN",  label: "API Registration — NMPA Drug Substance", desc: "Drug substance registration with NMPA/CDE — required separately before finished product application" },
    { value: "API-Mfg-CN",     label: "API Manufacturing Site Registration",      desc: "API manufacturing site registration with NMPA — mandatory for domestic and imported APIs" },
    { value: "CEP-CN",         label: "CEP — EDQM Certificate (NMPA reference)",  desc: "EDQM CEP used as supporting reference for NMPA API registration" },
  ],
  BR: [
    { value: "ANVISA-New",   label: "New Registration",                        desc: "Initial drug registration with ANVISA in Brazil" },
    { value: "ANVISA-Generic", label: "Generic Registration",                  desc: "Generic drug registration with ANVISA" },
    { value: "ANVISA-Similar", label: "Similar Drug Registration",             desc: "Similar (reference-based) drug registration" },
    { value: "ANVISA-Biotech", label: "Biological Product Registration",       desc: "Biological and biosimilar product registration" },
    { value: "Post-Approval-BR", label: "Post-Approval Petition",             desc: "Change petition for approved registered products" },
    // ── API DOSSIER ──
    { value: "API-Dossier-BR",  label: "API Dossier — ANVISA Drug Substance",    desc: "Active ingredient dossier for ANVISA registration — RDC 204/2017 compliant Module 3.2.S" },
    { value: "API-Mfg-BR",      label: "API Manufacturing Authorisation (ANVISA)", desc: "ANVISA authorisation for API manufacturing site in Brazil" },
    { value: "CEP-BR",          label: "CEP — EDQM Certificate (ANVISA accepted)", desc: "EDQM Certificate of Suitability used as supporting document in ANVISA API dossier" },
  ],
  // ── PHILIPPINES (FDA-PH) — ACTD format per AO 2020-0017 & RA 9711 ────────────
  PH: [
    // ── Product Registration (CPR) — ACTD 4-Part format ──
    { value: "CPR-New",       label: "CPR — New Drug Registration (ACTD)",        desc: "New Chemical Entity or New Formulation — Certificate of Product Registration via ACTD Parts I–IV" },
    { value: "CPR-Generic",   label: "CPR — Generic Drug Registration (ACTD)",    desc: "Generic drug registration using ACTD format; Part III & IV may be waived per ASEAN guidelines" },
    { value: "CPR-Biotech",   label: "CPR — Biological / Biotechnology Product",  desc: "Biologics, vaccines and biotechnology products requiring full ACTD submission" },
    { value: "CPR-Herbal",    label: "CPR — Herbal / Traditional Medicine",       desc: "Traditional and herbal medicines under BFAD/FDA-PH classification" },
    { value: "CPR-Renewal",   label: "CPR Renewal",                               desc: "Renewal of existing Certificate of Product Registration" },
    { value: "CPR-Variation", label: "CPR Variation — Major / Minor",             desc: "Post-approval variation to registered product (major or minor classification)" },
    { value: "CPN",           label: "CPN — Certificate of Product Notification", desc: "Notification-based authorization for OTC products and specific health product categories" },
    // ── Medical Device ──
    { value: "MD-CDRRHR",     label: "Medical Device Registration (CDRRHR)",      desc: "ASEAN Medical Device Directive (AMDD) compliant device registration via CDRRHR" },
    { value: "MD-IVD",        label: "IVD Registration — In-Vitro Diagnostic",    desc: "In-vitro diagnostic device and reagents registration" },
    // ── Cosmetics ──
    { value: "CCRR-Cosmetic", label: "Cosmetics Notification (CCRR)",             desc: "Cosmetics product notification under CCRR per ASEAN Cosmetics Directive" },
    // ── Site / Establishment ──
    { value: "LTO-Initial",   label: "LTO — Initial License to Operate",          desc: "Initial establishment licensing per AO 2020-0017 — all establishment types (CDRR / CDRRHR / CCRR / CFRR)" },
    { value: "LTO-Renewal",   label: "LTO — Renewal",                             desc: "License to Operate renewal — e-Application via FDA eServices Portal" },
    { value: "LTO-Variation", label: "LTO — Variation (Major / Minor)",           desc: "LTO variation per Annex C of AO 2020-0017 (transfer, expansion, ownership change, etc.)" },
    // ── Clinical Trial ──
    { value: "CT-PH",         label: "CT Authorization — Philippines FDA",        desc: "Clinical trial notification/authorization for investigational products" },
    { value: "BA-BE-PH",      label: "BA/BE Study — Bioequivalence (Philippines)",desc: "Bioavailability/Bioequivalence study authorization for generic registration support" },
  ],
};

// ─── Product categories — filter submission types ─────────────────────────────
const PRODUCT_CATEGORIES = [
  { value: "FINISHED",     label: "Finished Dose Form",         icon: "💊", keywords: ["NDA","ANDA","SNDA","MAA","NDS","ANDS","BLA","JNDA","JGDA","Type 1","Type 2","Type 3","Generic","Registration","New Prescription","Similar","Marketing Auth","MA —","PLR","Phytopharm","FDC","Subsequent","New Drug"] },
  { value: "API",          label: "API / Drug Substance",       icon: "🧪", keywords: ["DMF","ASMF","API","CEP","Active Substance","Drug Master","MF —","WC-","Written Confirmation","EDQM","Export Cert"] },
  { value: "BIOLOGICAL",   label: "Biological / Biosimilar",    icon: "🧬", keywords: ["BLA","Biosimilar","Biological","BAP","Biotech","Well-Characterised","WC-Dossier","Vaccine"] },
  { value: "COSMETIC",     label: "Cosmetics",                  icon: "✨", keywords: ["Cosmetic","COS-","Cosmetics Notification","Cosmetics Registration"] },
  { value: "MEDDEVICE",    label: "Medical Device",             icon: "🩺", keywords: ["Medical Device","Device","In Vitro","IVD","MDR","510k","PMA","De Novo","CDRH","IVDR","TGA Device","PMDA Device","MD-","Device Licence","Device Registration","SUGAM-MD"] },
  { value: "MASTERFILE",   label: "Master File / Dossier",      icon: "🗂️", keywords: ["DMF","ASMF","MF —","Master File","CEP","EDQM","CoA Dossier"] },
  { value: "ALL",          label: "All",                        icon: "📦", keywords: [] },
];

const LOGO_SRC = null; // Logo removed to reduce file size

const CTD_MODULES = [
  { id: 1, label: "Module 1", title: "Administrative Information", color: "#4a9eff", icon: "📋",
    ectdPath: "m1", sections: ["1.1 Table of Contents","1.2 Application Form","1.3 Product Information","1.4 Information on Experts"] },
  { id: 2, label: "Module 2", title: "CTD Summaries", color: "#c9a84c", icon: "📊",
    ectdPath: "m2", sections: ["2.3 Quality Overall Summary","2.4 Nonclinical Overview","2.5 Clinical Overview","2.6 Nonclinical Written Summaries","2.7 Clinical Summaries"] },
  { id: 3, label: "Module 3", title: "Quality / CMC", color: "#2ecc71", icon: "⚗️",
    ectdPath: "m3", sections: ["3.2.S Drug Substance","3.2.P Drug Product","3.2.A Appendices","3.3 Literature References"] },
  { id: 4, label: "Module 4", title: "Nonclinical Study Reports", color: "#9b59b6", icon: "🔬",
    ectdPath: "m4", sections: ["4.2.1 Pharmacology","4.2.2 Pharmacokinetics","4.2.3 Toxicology","4.3 Literature References"] },
  { id: 5, label: "Module 5", title: "Clinical Study Reports", color: "#e74c3c", icon: "🏥",
    ectdPath: "m5", sections: ["5.2 Tabular Listing","5.3 Clinical Study Reports","5.4 Literature References"] },
];

// ─── ICH eCTD section path map ────────────────────────────────────────────────
const ECTD_PATHS = {
  1: { admin: "m1/us/administrative", pi: "m1/us/labeling", rmp: "m1/us/rems" },
  2: { qos: "m2/23-quality-overall-summary", nonclinical: "m2/24-nonclinical-overview", clinical: "m2/25-clinical-overview" },
  3: { substance: "m3/32s", product: "m3/32p", appendices: "m3/32a" },
  4: { pharmacology: "m4/421-primary-pharmacodynamics", pk: "m4/422-pk", tox: "m4/423-single-dose-tox" },
  5: { tabular: "m5/52-tabular-listing", csr: "m5/53-csr" },
};

// ─── Clinical Trial Permission Documents (CDSCO Form CT-04) ──────────────────
// Per New Drugs & Clinical Trials (NDCT) Rules, 2019 and Schedule Y (amended)
// Submitted to CDSCO CLA via SUGAM — completely separate from CTD Modules 1-5
const CT_PHASE_LABELS = {
  "CT-IN":    "Phase I / II / III / IV — New Drug",
  "BA-BE-IN": "BA/BE Study — Bioequivalence",
  "CT-MED":   "Medical Device Clinical Investigation",
};

function getCTPermissionDocuments(country, subType) {
  const docs = [];
  const add = (cat, id, title, required, desc, form) =>
    docs.push({ cat, id, title, required: !!required, desc: desc||"", form: form||"", regClass: "ct" });

  const isBABE   = subType && (subType.includes("BA/BE") || subType.includes("BA-BE"));
  const isPhase1 = subType && subType.includes("Phase I");

  if (country === "IN") {

    // ── A. APPLICATION & LEGAL ──────────────────────────────────────────────
    add("Application","CT-A1","Form CT-04 — Application for Clinical Trial Permission",true,
      "Statutory application form under NDCT Rules 2019, Rule 22. Submit electronically via SUGAM portal (sugamapp.cdsco.gov.in) to CDSCO Central Licensing Authority. One Form CT-04 per protocol. Include proposed trial title, phase, therapeutic indication, study drug INN, sponsor details, proposed sites, estimated subject numbers.","Form CT-04");
    add("Application","CT-A2","SUGAM Application Reference & Fee Payment Proof",true,
      "SUGAM pre-submission reference number. Application fee per NDCT Rules 2019 Schedule II (varies by phase). Payment via NEFT/challan to CDSCO. Retain acknowledgement receipt — required for tracking and correspondence.");
    add("Application","CT-A3","Sponsor Authorisation Letter / CRO Delegation",true,
      "If a Contract Research Organisation (CRO) is managing the trial: notarised letter from Sponsor delegating responsibilities to CRO per NDCT Rule 25. Specify clearly which obligations are delegated and which remain with sponsor. If foreign sponsor: appoint Indian legal representative with full regulatory authority.");
    add("Application","CT-A4","Power of Attorney (Foreign Sponsor)",subType && !subType.includes("domestic"),
      "Notarised and apostilled PoA from foreign sponsor authorising Indian regulatory agent or CRO. Must be legalised by Indian Embassy/Consulate. Specify scope: submission, correspondence, regulatory commitments, safety reporting.");
    add("Application","CT-A5","Sponsor Contact Details & Regulatory Affairs Contact",true,
      "Full name, address, phone, email of sponsor's regulatory affairs contact in India. 24-hour emergency contact for SAE reporting. Medical monitor details.");

    // ── B. PROTOCOL & SCIENTIFIC DESIGN ────────────────────────────────────
    add("Protocol","CT-B1","Clinical Trial Protocol (Final Version with version no. & date)",true,
      "Comprehensive trial protocol per ICH E6(R3) GCP and NDCT Rules Schedule Y. Must include: title, phase, objectives, primary/secondary endpoints, study design (randomised/controlled/open/blinded), sample size with statistical justification (per ICH E9/E9R1), inclusion/exclusion criteria, treatment arms (IMP dose, route, duration), concomitant medications policy, discontinuation criteria, efficacy and safety assessments schedule, interim analysis plan (if any), data collection methods. Version number and date on every page.");
    add("Protocol","CT-B2","Protocol Synopsis (≤5 pages)",true,
      "Concise synopsis of the full protocol for CDSCO review. Mandatory separate document — CDSCO reviewers use this for initial assessment. Include: study question, design, population, IMP, endpoints, duration, site count.");
    add("Protocol","CT-B3","Statistical Analysis Plan (SAP)",true,
      "Detailed SAP per ICH E9(R1). Specify: primary analysis population (ITT/PP/mITT), statistical test with alpha and power, multiplicity adjustments, handling of missing data (MCAR/MAR/MNAR), sensitivity analyses, safety analysis framework. Should be finalised before unblinding.");
    add("Protocol","CT-B4","Justification for Phase / Design / Dose Selection",!isBABE,
      "Rationale document explaining: why this phase is appropriate, dose selection basis (from PK/PD/preclinical data), starting dose justification (per ICH M3(R2)), dose escalation rules (Phase I), study duration justification. For new molecular entities: provide ICH M3 Stage classification.");
    if (isBABE) {
      add("Protocol","CT-B5","BA/BE Study Protocol — Reference Product Selection Justification",true,
        "For bioequivalence: reference listed drug (RLD) identification and justification. Proposed PK parameters for BE demonstration (AUC, Cmax, Tmax). Washout period justification. BE acceptance limits (80–125% for standard; narrow therapeutic index per CDSCO BE guidelines).");
    }

    // ── C. INVESTIGATOR'S BROCHURE (IB) ─────────────────────────────────────
    add("IB","CT-C1","Investigator's Brochure (IB) — Current Version",true,
      "Current IB per ICH E6(R3) Section 7. Must include: IMP description & formulation, non-clinical studies summary (pharmacology, PK, toxicology), clinical data summary (previous trials), known/potential risks & benefits, guidance for investigators. Version/date on cover page. IB must be updated when significant new safety data emerges. For marketed drugs used off-label: current approved SmPC/prescribing information may substitute.");
    add("IB","CT-C2","Summary of Non-Clinical Studies (Pharmacology, PK, Toxicology)",true,
      "Tabulated and narrative summary of all completed non-clinical studies per ICH M3(R2) and ICH S guidelines. Include: in vitro pharmacology, in vivo pharmacology, single/repeat dose toxicology, genotoxicity (ICH S2R1), reproductive toxicology (ICH S5R3), carcinogenicity (if applicable per ICH S1A), local tolerance. Highlight studies supporting first-in-human dose or clinical phase.");
    add("IB","CT-C3","Summary of Previous Clinical Data (if any)",true,
      "For drugs with previous human exposure: tabulated summary of all Phase I/II/III studies conducted globally. Include: study phase, design, subject numbers, dose, duration, efficacy outcomes, safety/AEs (common, serious), PK parameters. DSUR or CIOMS I forms for SAEs. If no prior human data (first-in-human): provide statement.");

    // ── D. REGULATORY & ETHICS ──────────────────────────────────────────────
    add("Ethics","CT-D1","Ethics Committee (EC) Approval — All Participating Sites",true,
      "Independent Ethics Committee approval per NDCT Rules 2019, Rule 8 and Schedule Y, Part I. Requirements: EC must be registered with CDSCO (check CDSCO EC Registry). Approval must cover: protocol version, IB version, ICF/PIS version. For multi-site trials: approval from each site's EC OR central EC (if applicable). EC approval letter must include protocol title, EC reference number, approval date, validity period. Non-negotiable — trial cannot begin before EC approval.");
    add("Ethics","CT-D2","CTRI Pre-Registration / Registration Number",true,
      "Clinical Trials Registry India (www.ctri.nic.in) pre-registration is mandatory per NDCT Rules. Obtain CTRI pre-registration number before CDSCO submission. CTRI number must appear on all trial documents. Include CTRI acknowledgement letter.");
    add("Ethics","CT-D3","Regulatory Approval from Reference Country (FDA / EMA / PMDA)",!isBABE,
      "For new drugs already approved or under investigation in major ICH regions: copy of IND (FDA Form 1571), CTA (EMA), or equivalent. This significantly accelerates CDSCO review. Include current IB version as filed with reference authority. If first global trial in India: provide justification for conducting global FIH trial in India per NDCT guidance.");
    add("Ethics","CT-D4","GCP Compliance Declaration — All Investigators",true,
      "Signed GCP training declaration from all Principal Investigators. GCP training certificate (ICH E6R3 compliant) within last 3 years. CDSCO's requirement per NDCT Rule 51. Include institution name, investigator name, training provider, date.");
    add("Ethics","CT-D5","Comparison of India GCP Standards with ICH GCP (if applicable)",false,
      "For multinational trials: brief document comparing NDCT Rules 2019 / Schedule Y provisions with ICH E6(R3) GCP standard. Demonstrates sponsor's awareness of India-specific requirements. Optional but recommended for first-time sponsors in India.");

    // ── E. INVESTIGATIONAL MEDICINAL PRODUCT (IMP) ──────────────────────────
    add("IMP","CT-E1","IMP Description, Composition & Formulation",true,
      "Qualitative and quantitative composition of IMP. Dosage form, strength, route of administration, pack size. Pharmaceutical development rationale (brief). Drug substance: INN, CAS number, molecular formula, structure, source. Reference to drug substance quality data (ICH Q6A for chemical; Q6B for biological). Comparator drug details (if applicable): source, batch number, expiry.");
    add("IMP","CT-E2","Certificate of Analysis (CoA) — IMP Batch(es) for Clinical Use",true,
      "CoA from QC-approved batch of IMP to be used in the trial. Tests per approved specification: assay, purity/impurities, dissolution (if solid oral), sterility (if injectable), endotoxin, appearance. Batch number, manufacture date, expiry date. Signed by QC/QA release. For manufactured-in-India IMP: must be from Form 27 (test licence) batch.");
    add("IMP","CT-E3","IMP Labelling — Draft Label (Schedule Y / NDCT Annex Format)",true,
      "Draft label for IMP per NDCT Rules Schedule, Annexure format. Mandatory elements: study title, protocol number, IMP name/code, sponsor name & address, batch number, expiry date, storage conditions, route of administration, dosage instructions, 'FOR CLINICAL TRIAL USE ONLY — NOT FOR SALE', emergency contact number. Labels in English + local language at site if required.");
    add("IMP","CT-E4","IMP Manufacturing & Import Authorisation",true,
      isBABE
        ? "For BA/BE study: import licence (Form 10/Form 10-A) or Form 27 test licence for IMP. Attach IMP and reference product import clearance from CDSCO."
        : "Form 27 (Test Licence) from CLA if IMP manufactured in India. OR Import licence (Form 10) + NOC from CDSCO if IMP is imported. Include manufacturing GMP certificate (Schedule M / WHO-GMP / EU GMP as applicable).");
    add("IMP","CT-E5","IMP Storage, Handling & Cold Chain (if applicable)",false,
      "Storage conditions and temperature monitoring plan for IMP at sponsor, depot and investigational sites. Cold chain management SOP if temperature-sensitive. Drug accountability and reconciliation procedure.");
    add("IMP","CT-E6","Stability Data for IMP — to cover Trial Duration",true,
      "Real-time and/or accelerated stability data per ICH Q1A(R2). Data must support IMP expiry date through end of trial. For new formulations: minimum 3 months real-time data with 6 months accelerated. Provide ongoing stability commitment if full data not yet available.");

    // ── F. SUBJECT PROTECTION ────────────────────────────────────────────────
    add("SubjectProtection","CT-F1","Informed Consent Form (ICF) & Patient Information Sheet (PIS)",true,
      "ICF and PIS per NDCT Rules 2019 Rule 13 and Schedule Y, Part I, Clause 2. Mandatory elements: nature/purpose of trial, procedures, risks/discomforts, benefits, alternatives, confidentiality, voluntary participation, right to withdraw, compensation for injury, contact information (PI, EC, CDSCO helpline). Must be in English AND vernacular language of each site. Readability: 6th grade level. EC-approved version required before use.");
    add("SubjectProtection","CT-F2","Audio-Visual Recording Consent Procedure (AV-ICF)",true,
      "NDCT Rules 2019 mandate audio-visual recording of the informed consent process for vulnerable populations (illiterate subjects, children, those with cognitive impairment). Provide: AV-ICF SOP, equipment specifications, recording storage procedure, subject rights regarding recording. This is India-specific — not typically required in other ICH regions.");
    add("SubjectProtection","CT-F3","Trial Insurance / Indemnity Coverage",true,
      "Mandatory per NDCT Rules 2019 Rule 42. Sponsor must provide insurance covering trial-related injury/death. Provide: insurance certificate/policy with coverage amount, insured period, scope of coverage. CDSCO checks that coverage is adequate for the Indian trial context. Indemnity bond from sponsor to institution/investigators.");
    add("SubjectProtection","CT-F4","Compensation Policy — Trial-Related Injury & Death",true,
      "Written compensation policy per NDCT Rules 2019 Rule 43 and 44. Must specify: formula/criteria for compensation calculation, process for claim, timeline for settlement, categories of compensatable events vs. non-compensatable events (disease progression, pre-existing conditions). Government formula: income × years remaining to age 65 × multiplier. Separate from insurance.");
    add("SubjectProtection","CT-F5","Recruitment Strategy & Advertising Materials (if any)",false,
      "If subject recruitment advertisements are planned (posters, social media, websites): draft advertisement for EC and CDSCO review. Must not be coercive or offer undue inducement. Subject payment: reimbursement for expenses only — no payment for participation per Indian GCP.");

    // ── G. SITES & INVESTIGATORS ─────────────────────────────────────────────
    add("Sites","CT-G1","List of Proposed Investigational Sites (with addresses & contact)",true,
      "Complete list of all Indian investigational sites: institution name, address, department, PI name, phone, email. CDSCO site registration number (if CDSCO-registered site). Hospital/institution type (government/private). Site must have adequate facilities for the indication being studied. For Phase I: site must be CDSCO-approved Phase I unit.");
    add("Sites","CT-G2","Principal Investigator CVs — All Sites",true,
      "Curriculum vitae for each PI per ICH E6(R3). Include: full name, qualifications, current position, GCP training (within 3 years), relevant therapeutic area experience, previous CT experience (number/role), publication list (relevant). CDSCO Form 1572 equivalent signed declaration.");
    add("Sites","CT-G3","Site Qualification Summary — Facilities & Capabilities",true,
      "For each site: description of available facilities (wards, labs, pharmacy, emergency equipment), patient volume in relevant indication, staff (nurses, data managers, pharmacist), patient database size. For Phase I: CDSCO Phase I unit approval letter mandatory.");
    add("Sites","CT-G4","Sub-Investigator List & Delegation Log",false,
      "List of all sub-investigators and trial staff at each site who will conduct trial procedures or make trial-related decisions. Signed delegation log (investigator responsibility matrix).");

    // ── H. SAFETY & MONITORING ───────────────────────────────────────────────
    add("Safety","CT-H1","Safety Monitoring Plan / DSMB Charter (Phase II/III)",!isBABE && !isPhase1,
      "Data Safety Monitoring Board (DSMB) charter for Phase II/III trials with interim analyses or safety monitoring. Include: DSMB composition and independence, meeting frequency, data reviewed, unblinding procedure, stopping rules (O'Brien-Fleming or similar). For Phase I dose escalation: Dose Escalation Committee (DEC) charter with stopping criteria per protocol.");
    add("Safety","CT-H2","SAE Reporting Plan — CDSCO & EC Expedited Reporting",true,
      "Per NDCT Rules 2019 Rule 46: Serious Adverse Events (SAEs) must be reported to CDSCO and EC within 24 hours of sponsor awareness (fatal/life-threatening) or 7 days (other SAEs) with 15-day follow-up. Provide: SAE reporting SOP, CDSCO-SUGAM SAE portal procedure, EC reporting process, global safety reporting integration with IND/CTA if applicable.");
    add("Safety","CT-H3","Risk Minimisation Plan",false,
      "Identification and mitigation of foreseeable risks to subjects. For high-risk trials or novel mechanisms: detailed risk-benefit analysis. Include stopping rules, dose modifications, risk communication to investigators. Reference IB Section on known risks.");

    // ── I. DATA MANAGEMENT ───────────────────────────────────────────────────
    add("DataMgmt","CT-I1","Case Report Form (CRF) — Draft (Paper or eDCM design)",true,
      "Draft CRF or eCRF/eDC system specifications. Must capture all protocol-required data points. For paper CRF: all pages. For electronic: eCRF screenshots or Annotated CRF. Must include SAE forms, protocol deviation forms. 21 CFR Part 11 / EU Annex 11 compliance for electronic systems.");
    add("DataMgmt","CT-I2","Data Management Plan (DMP)",false,
      "DMP covering: CRF completion guidelines, data flow, database structure, edit checks, data lock procedure, archiving. For eDC: system validation summary, user access controls, audit trail.");
    add("DataMgmt","CT-I3","Clinical Data Sharing / Archiving Plan",false,
      "Per NDCT Rules 2019 Rule 48: trial records to be retained for 5 years after trial completion or marketing approval, whichever is later. Specify archiving location (sponsor site or CRO), electronic vs. paper, disaster recovery.");

    // ── J. UNDERTAKINGS & DECLARATIONS ──────────────────────────────────────
    add("Declarations","CT-J1","Sponsor Undertaking — NDCT Rules 2019 Compliance",true,
      "Signed undertaking from Sponsor (MD/CEO/authorised signatory) committing to: comply with NDCT Rules 2019 and all CDSCO conditions, conduct trial per approved protocol, provide compensation for trial-related injury/death, submit SAE reports within stipulated timelines, submit periodic progress reports (6-monthly), notify CDSCO of any protocol changes before implementation, notify sites of new safety information. Cannot be delegated.");
    add("Declarations","CT-J2","Declaration by Principal Investigators — All Sites",true,
      "Signed declaration by each PI: agreement to conduct trial per approved protocol and NDCT Rules, GCP compliance, subject safety priority, data integrity, no undisclosed conflicts of interest, commitment to reporting. Equivalent to FDA Form 1572 / EMA Investigator's Undertaking.");
    add("Declarations","CT-J3","Conflict of Interest Declaration — Investigators & Sponsor",true,
      "Disclosure of any financial or other relationship between investigators/institutions and sponsor. Per Schedule Y and NDCT Rules. CDSCO requires transparency to assess potential bias in patient selection and reporting.");
    add("Declarations","CT-J4","Annual Progress Report Commitment",false,
      "Acknowledgement of obligation to submit 6-monthly / annual safety update reports to CDSCO throughout trial duration. Include trial status, subject enrolment, SAE summary, protocol deviations, interim data (if any).");
  }

  return docs;
}

const CT_CAT_META = {
  Application:       { label: "Application & Legal",                icon: "📝", color: "#1565C0" },
  Protocol:          { label: "Protocol & Scientific Design",        icon: "🔬", color: "#6A1B9A" },
  IB:                { label: "Investigator's Brochure & Data",      icon: "📖", color: "#2E7D32" },
  Ethics:            { label: "Regulatory & Ethics",                 icon: "⚖️",  color: "#C62828" },
  IMP:               { label: "Investigational Medicinal Product",   icon: "💊", color: "#E65100" },
  SubjectProtection: { label: "Subject Protection",                  icon: "🛡️",  color: "#00695C" },
  Sites:             { label: "Sites & Investigators",               icon: "🏥", color: "#283593" },
  Safety:            { label: "Safety & Monitoring",                 icon: "🚨", color: "#B71C1C" },
  DataMgmt:          { label: "Data Management",                     icon: "🗄️",  color: "#37474F" },
  Declarations:      { label: "Undertakings & Declarations",         icon: "✍️",  color: "#4A148C" },
};

// ─── Site / Facility Registration Documents ──────────────────────────────────
// Completely separate from CTD product dossier — different authority, different checklist
const SITE_REG_TYPES = {
  IN: [
    { value: "Form25",   label: "Form 25 — General / Non-sterile Mfg. (SLA)",         authority: "State Licensing Authority (SLA)",               desc: "Oral solids, oral liquids, topicals, semi-solids, powders" },
    { value: "Form25A",  label: "Form 25-A — Sterile / Restricted / Schedule C (CLA)", authority: "CDSCO Central Licensing Authority (DCG(I))",     desc: "Injectables, LVP, ophthalmic, biologics, vaccines, IVDs, rDNA" },
    { value: "Form25B",  label: "Form 25-B — Loan Licence / Contract Mfg. (SLA)",      authority: "State Licensing Authority (SLA)",               desc: "Manufacturing under loan licence using third-party facilities" },
    { value: "Form25D",  label: "Form 25-D — API / Drug Substance Mfg. (CLA)",         authority: "CDSCO Central Licensing Authority (DCG(I))",     desc: "Active Pharmaceutical Ingredient manufacture — ICH Q7 / Schedule M Part III" },
    { value: "Form27",   label: "Form 27 — Test Licence / R&D / Clinical Batches",     authority: "CDSCO Central Licensing Authority (DCG(I))",     desc: "Investigational batch manufacture for clinical trials only — not for commercial sale" },
    { value: "Form28",   label: "Form 28 — Wholesale Licence (Drugs)",                 authority: "State Licensing Authority (SLA)",               desc: "Distribution and wholesale of finished pharmaceutical products" },
    { value: "Form29",   label: "Form 29 — Retail / Hospital Pharmacy Licence",        authority: "State Licensing Authority (SLA)",               desc: "Retail dispensing and hospital pharmacy operations" },
  ],
  US: [
    { value: "FDADRLS", label: "FDA Drug Establishment Registration (FEI)",            authority: "US FDA — Center for Drug Evaluation (CDER)",    desc: "Annual drug establishment registration — all domestic & foreign mfg sites" },
    { value: "FDABIO",  label: "FDA Biologics Establishment Registration (BLA site)",  authority: "US FDA — Center for Biologics (CBER)",          desc: "Registration for biological product manufacturing sites" },
    { value: "FDAAPI",  label: "FDA API / Drug Substance Facility Registration",       authority: "US FDA — CDER Import/Export",                   desc: "Foreign API manufacturer registration for US market access" },
  ],
  EU: [
    { value: "EUGMP",   label: "EU Manufacturing Authorisation (MIA)",                 authority: "National Competent Authority (NCA) / EMA",      desc: "Manufacturing and Import Authorisation — required before any EU product approval" },
    { value: "EUGMPAPI", label: "EU GMP Certificate — API Site (EudraGMDP)",           authority: "National Competent Authority (NCA)",            desc: "API manufacturer GMP certificate per EU Directive 2011/62 (Falsified Medicines)" },
    { value: "EUWDA",   label: "EU Wholesale Distribution Authorisation (WDA)",        authority: "National Competent Authority (NCA)",            desc: "GDP-compliant wholesale distribution licence per EU Directive 2001/83 Article 77" },
  ],
  UK: [
    { value: "UKMIA",   label: "UK Manufacturer's / Importer's Authorisation (MIA)",  authority: "MHRA",                                          desc: "Equivalent to EU MIA — required post-Brexit for UK manufacturing sites" },
  ],
  JP: [
    { value: "JPMFL",   label: "Manufacturing Business Licence (製造業許可)",            authority: "MHLW / PMDA",                                   desc: "Pharmaceutical Manufacturing Business Licence under PMD Act Article 13" },
    { value: "JPMSS",   label: "Manufacturing Site Standard Compliance (GMP適合性調査)", authority: "PMDA",                                          desc: "GMP conformity assessment for each manufacturing site" },
  ],
  CA: [
    { value: "CANES",   label: "Establishment Licence (EL) — Health Canada",           authority: "Health Canada — HPFB",                          desc: "Mandatory for all Canadian drug manufacturers, importers, distributors" },
  ],
  AU: [
    { value: "AUGMP",      label: "GMP Licence — TGA Manufacturing Licence",              authority: "Therapeutic Goods Administration (TGA)",         desc: "TGA manufacturing licence / GMP clearance per TGA GMP Standards" },
  ],
  PH: [
    { value: "LTO-Initial",   label: "LTO — Initial (Drug Mfr / Trader / Distributor)",  authority: "FDA-PH — CDRR",   desc: "Initial License to Operate for drug establishments (manufacturers, traders, importers, exporters, wholesalers, drugstores) per AO 2020-0017 & RA 9711" },
    { value: "LTO-Initial-MD",label: "LTO — Initial (Medical Device — CDRRHR)",          authority: "FDA-PH — CDRRHR", desc: "Initial LTO for medical device manufacturers, traders, distributors; radiation-emitting devices; IVD devices" },
    { value: "LTO-Initial-CS",label: "LTO — Initial (Cosmetics / HUHS — CCRR)",          authority: "FDA-PH — CCRR",   desc: "Initial LTO for cosmetics and household/urban hazardous substances establishments" },
    { value: "LTO-Renewal",   label: "LTO — Renewal",                                    authority: "FDA-PH",          desc: "Renewal of existing LTO — file at least 3 months prior to expiry via FDA eServices Portal" },
    { value: "LTO-Variation", label: "LTO — Variation (Major or Minor)",                 authority: "FDA-PH",          desc: "LTO variation per Annex C of AO 2020-0017: location transfer, expansion, ownership change, name change, qualified person change, etc." },
  ],
};

function getSiteRegistrationDocuments(country, siteType) {
  const docs = [];
  const add = (cat, id, title, required, desc, form) =>
    docs.push({ cat, id, title, required: !!required, desc: desc||"", form: form||"", regClass: "site" });

  if (country === "IN") {
    if (siteType === "Form25" || siteType === "Form25B") {
      const isBond = siteType === "Form25B";
      // ── APPLICATION DOCUMENTS ────────────────────────────────────────────
      add("Application","A1", isBond ? "Form 25-B — Loan Licence Application" : "Form 25 — Manufacturing Licence Application", true,
        isBond ? "Completed Form 25-B in prescribed format. Applicant = loan licensee (product owner). Attach: own Form 25-B + CMO's valid Form 25/25-A."
               : "Completed Form 25 in prescribed format per D&C Act Rule 68. Submit to State Licensing Authority of the state where the manufacturing site is located. Include all product categories to be manufactured.",
        isBond ? "Form 25-B" : "Form 25");
      add("Application","A2","Challan / Proof of Licence Fee Payment",true,"State-specific fee (varies by state and number of dosage forms). Pay via state treasury challan or online GRAS portal. Attach original challan receipt.");
      add("Application","A3","Covering Letter / Application Letter",true,"Formal letter to the Licensing Authority stating: applicant name, site address, products proposed, dosage forms, intended market (domestic/export). Signed by MD/Director.");

      // ── PREMISES DOCUMENTS ───────────────────────────────────────────────
      add("Premises","P1","Site Ownership / Lease / Rent Agreement",true,"Proof of ownership (sale deed) OR registered lease/rent agreement for the manufacturing premises. Minimum 9-year lease recommended by most SLAs. Must be in applicant company's name.");
      add("Premises","P2","Building Layout Plan (Site Map) — Approved by Architect",true,"Detailed floor plan drawn to scale by a licensed architect or structural engineer. Show: manufacturing areas, QC lab, warehouses, change rooms, HVAC plant, utility rooms, waste treatment. All dimensions labelled. Approved/stamped by local municipal authority if required by state.");
      add("Premises","P3","Building Completion / Occupancy Certificate",true,"Municipal corporation / local authority occupancy certificate confirming the building is fit for use. Required by most SLAs before inspection.");
      add("Premises","P4","Factory Licence / No Objection Certificate (NOC)",true,"Factory licence under the Factories Act 1948. NOC from local body / municipality / gram panchayat. Pollution NOC from State Pollution Control Board (SPCB) — Consent to Establish (CTE) and Consent to Operate (CTO) as applicable.");
      add("Premises","P5","Utilities Qualification Documentation",true,"Water system: WFI / purified water validation (Ph.Eur. / IP standards). HVAC: qualification (IQ/OQ/PQ) for all classified areas. Compressed air: quality testing. Power: UPS/DG backup. Effluent treatment plant details.");

      // ── PERSONNEL ────────────────────────────────────────────────────────
      add("Personnel","H1","Technical Director / Competent Person — Appointment Letter & Qualifications",true,"D&C Act Rule 71: Competent person must be B.Pharm / M.Pharm / MSc (Chemistry/Pharmacology) + minimum experience. Provide: appointment letter, degree certificate, experience certificate, state pharmacy council registration (if required), age proof. Full-time employment contract — not honorary.");
      add("Personnel","H2","Qualified Person (QA Head) — Appointment & Qualifications",true,"Responsible for batch release. Qualification: B.Pharm/M.Pharm + GMP experience. Submit appointment letter, degree, experience certificate.");
      add("Personnel","H3","Production Head — Appointment & Qualifications",false,"Optional at initial stage but required before operations. Same qualification requirements as QA Head.");
      add("Personnel","H4","List of All Technical Staff with Qualifications",true,"Tabulated list: Name, Designation, Qualification, Experience (years), Responsibilities. Cross-reference with org chart.");
      add("Personnel","H5","Organisational Chart (Reporting Structure)",true,"Hierarchy showing MD → Technical Director → QA/QC/Production/Warehouse. Must show independence of QA from Production.");

      // ── EQUIPMENT & INSTRUMENTS ──────────────────────────────────────────
      add("Equipment","E1","Equipment List — Manufacturing (with make, model, capacity)",true,"Complete list of all manufacturing equipment. Include: name, make/model, manufacturer, capacity/output, installation date, qualification status (IQ/OQ/PQ). Group by dosage form. Equipment must match the dosage forms applied for.");
      add("Equipment","E2","Equipment List — QC / Analytical Instruments",true,"Complete list of all QC instruments. Include: HPLC, UV/Vis spectrophotometer, dissolution apparatus, disintegration tester, hardness tester, balance, pH meter etc. Calibration certificates for critical instruments.");
      add("Equipment","E3","Equipment Purchase Invoices / Proofs of Ownership",false,"Invoices or proof of equipment ownership/rental. Some SLAs require this to verify equipment is actually present on-site.");
      add("Equipment","E4","Instrument Calibration Certificates",true,"Calibration certificates from NABL-accredited labs for all critical instruments. Must be valid (within calibration interval).");

      // ── QUALITY SYSTEM ───────────────────────────────────────────────────
      add("Quality","Q1","List of Standard Operating Procedures (SOPs) — Master Index",true,"Master SOP index covering all Schedule M areas: manufacturing, QC testing, cleaning, training, deviation, change control, CAPA, recall, complaints, stability, vendor qualification. SOPs need not be submitted in full — master index with document numbers and revision status is sufficient for initial application.");
      add("Quality","Q2","Self-Inspection Checklist / Internal Audit Programme",true,"Written self-inspection programme per Schedule M. Include frequency (at least annual), areas covered, responsible persons, CAPA process.");
      add("Quality","Q3","Schedule M GMP Self-Assessment / Declaration",true,"Signed declaration by Technical Director and QA Head confirming compliance with Schedule M (Revised 2005 / Amendment 2023) for all applicable parts.");
      add("Quality","Q4","Stability Testing Protocol",false,"Basic stability storage conditions and testing protocol per ICH Q1A(R2) / IP stability guidelines. Required if product stability testing will be conducted on-site.");

      // ── COMPANY DOCUMENTS ────────────────────────────────────────────────
      add("Company","C1","Certificate of Incorporation / Partnership Deed / Trust Deed",true,"Proof of legal entity: Company — Certificate of Incorporation (MCA/ROC), MOA, AOA. Partnership — Registered Partnership Deed. Sole Proprietor — affidavit / trade licence. LLP — LLP Agreement + registration certificate.");
      add("Company","C2","GST Registration Certificate",true,"Valid GSTIN for the manufacturing entity. Required by all SLAs. Include GSTIN number clearly on application form.");
      add("Company","C3","PAN Card of the Company / Firm",true,"Permanent Account Number (PAN) issued by Income Tax Department.");
      add("Company","C4","Board Resolution / Authorisation Letter for Signing",true,"Board resolution authorising the signatory to apply for the manufacturing licence. Notarised resolution from Board of Directors (for companies).");
      add("Company","C5","Power of Attorney (if agent applying)",false,"Notarised PoA if a consultant or agent is submitting the application on behalf of the company.");

      if (isBond) {
        add("ContractMfg","CM1","Contract Manufacturing Agreement (CMA)",true,"Executed legal agreement between the loan licensee (you) and the contract manufacturer (CMO). Must specify: products to be manufactured, responsibilities, quality standards, GMP requirements, audit rights, confidentiality, duration, termination clauses. Signed by both parties.");
        add("ContractMfg","CM2","Quality Agreement between Loan Licensee and CMO",true,"Separate quality agreement defining QA responsibilities, batch release authority, deviation/OOS handling, recall responsibilities, regulatory inspection notification per ICH Q10.");
        add("ContractMfg","CM3","CMO's Valid Manufacturing Licence (Form 25 / Form 25-A)",true,"Self-attested copy of the contract manufacturer's current Form 25 or Form 25-A covering the dosage form(s) to be manufactured. Must be valid through the expected production period.");
      }
    }

    if (siteType === "Form25A") {
      add("Application","A1","Form 25-A — Manufacturing Licence Application (Sterile/Schedule C)",true,"Completed Form 25-A submitted to CDSCO Central Licensing Authority (DCG(I)), FDA Bhavan, New Delhi. Covers Schedule C and C(1) substances: sterile injectables, LVPs, ophthalmic preparations, biologics, vaccines, blood products, rDNA products, IVDs.","Form 25-A");
      add("Application","A2","Challan / Proof of Fee Payment — CDSCO Schedule",true,"Fee as per CDSCO fee schedule (not state fee). Pay via CDSCO SUGAM portal or designated bank.");
      add("Application","A3","Covering Letter to DCG(I)",true,"Formal covering letter to Drug Controller General of India. State: site address, products, schedule (C/C(1)), sterility assurance approach.");
      add("Premises","P1","Site Ownership / Lease Agreement",true,"Ownership deed or registered long-term lease for sterile manufacturing site.");
      add("Premises","P2","Sterile Manufacturing Facility Layout — Cleanroom Classification",true,"Detailed layout showing cleanroom grades (Grade A/B/C/D per Schedule M Part II / EU GMP Annex 1 basis). HVAC design with air classification, pressure differentials, air change rates. Drawn by qualified cleanroom engineer.");
      add("Premises","P3","HVAC Qualification Report (IQ/OQ/PQ)",true,"Full HVAC qualification per ISPE guidelines. Include: air velocity, HEPA filter integrity, particle count, pressure differentials, temperature/humidity mapping. All classified areas must meet Schedule M Part II requirements.");
      add("Premises","P4","Environmental Monitoring Programme",true,"Validated EM programme covering: viable monitoring (settle plates, active air sampling, contact plates), non-viable particle monitoring, alert and action limits per Schedule M Part II. Include trend analysis approach.");
      add("Premises","P5","Water System Qualification (WFI / PW)",true,"Water for injection (WFI) system: distillation/membrane qualification, continuous monitoring system, Ph.Eur./IP quality standards, hot recirculation at ≥70°C. Include P&ID, IQ/OQ/PQ reports summary.");
      add("Premises","P6","Autoclave / Sterilisation Qualification",true,"For terminal sterilisation: autoclave IQ/OQ/PQ. F0 calculations. Steam quality tests (non-condensable gas, superheat, dryness fraction). For aseptic fill: isolator/RABS qualification or Grade A fill zone validation per Annex 1 2023.");
      add("Premises","P7","Clean-in-Place (CIP) / Steam-in-Place (SIP) Validation",true,"CIP/SIP validation for all product-contact equipment. Include cleaning validation protocols, TOC and conductivity monitoring.");
      add("Personnel","H1","Qualified Person (QA Head) — Appointment & Qualifications",true,"For CLA (Form 25-A), CDSCO inspectors typically require higher qualification: M.Pharm/PhD preferred with sterile manufacturing experience. Submit appointment letter, degrees, experience.");
      add("Personnel","H2","Competent Person — Technical Director Appointment",true,"Full-time employment. Experience in sterile manufacturing mandatory.");
      add("Personnel","H3","Training Records Summary — Aseptic Technique",true,"Documented aseptic technique training for all personnel entering Grade A/B areas. Media fill participation records.");
      add("Equipment","E1","Equipment List — Sterile Manufacturing (fillers, lyophilisers, autoclaves)",true,"Complete list of all sterile manufacturing equipment with qualification status. Include vial/ampoule filling lines, lyophilisers, autoclaves, blow-fill-seal machines as applicable.");
      add("Equipment","E2","Isolator / RABS / LAF Qualification Certificates",true,"Full qualification documentation for isolator, RABS or LAF units used for aseptic operations. Include glove integrity testing records.");
      add("Quality","Q1","Contamination Control Strategy (CCS) Document",true,"Per WHO TRS 1044 Annex 3 and EU GMP Annex 1 (2023). Document-based risk assessment and controls for particulate, microbial, and pyrogen contamination. Required for all new sterile facility applications.");
      add("Quality","Q2","Process Simulation (Media Fill) Protocol & Results",true,"Validated aseptic process simulation (media fill) per PDA TR No. 22. Three consecutive successful runs required. Results must show ≤0.1% contamination rate.");
      add("Quality","Q3","Sterility Assurance Level (SAL) Justification",true,"SAL 10⁻⁶ justification for terminal sterilisation; parametric release justification if applicable. For aseptic products: sterility test programme per IP/USP/Ph.Eur.");
      add("Quality","Q4","Schedule M Part II — Full GMP Self-Assessment",true,"Comprehensive self-assessment against Schedule M Part II (Sterile Products) checklist.");
      add("Quality","Q5","WHO Prequalification / EU GMP Certificate (if available)",false,"Evidence of WHO PQ or EudraGMDP certificate accelerates CDSCO CLA inspection scheduling.");
      add("Company","C1","Certificate of Incorporation / Legal Entity Proof",true,"As per Form 25 requirements.");
      add("Company","C2","GST Certificate + PAN",true,"Valid GSTIN and PAN.");
    }

    if (siteType === "Form25D") {
      add("Application","A1","Form 25-D — API Manufacturing Licence Application",true,"Submitted to CDSCO CLA. Covers all APIs/drug substances manufactured at the site. List each INN, CAS number, therapeutic category, chemical synthesis route (synthetic/fermentation/semi-synthetic/biological).","Form 25-D");
      add("Application","A2","Fee Payment — CDSCO Schedule (per API / per site)",true,"CDSCO fee per API and per site. Pay via SUGAM/designated bank.");
      add("Application","A3","Covering Letter to DCG(I) / CLA",true,"Formal letter listing all APIs, intended markets (domestic/export), GMP standards to be followed.");
      add("Premises","P1","Site Plan / Layout of API Manufacturing Facility",true,"Detailed site map and floor plan. Show: synthesis areas, purification, drying, milling, packing, QC lab, solvent recovery, waste treatment, utilities. Include material and personnel flow paths.");
      add("Premises","P2","Environmental Compliance — SPCB NOC / ETP",true,"State Pollution Control Board (SPCB) Consent to Establish + Consent to Operate. Effluent Treatment Plant (ETP) details. Solvent management plan. Hazardous waste authorisation (under HW Rules 2016).");
      add("Premises","P3","Utility Qualification (RO/DI Water, N2, Clean Steam)",true,"Reagent/purified water quality meeting ICH Q7 / Schedule M Part III standards. Nitrogen/inert gas quality certificates. Utilities equipment qualification summary.");
      add("Personnel","H1","Technical Head / API Competent Person — Appointment",true,"Must have chemistry/pharmacy qualification + API synthesis experience. Full-time employment. ICH Q7 awareness mandatory.");
      add("Personnel","H2","QA Head — Appointment & Qualifications",true,"Independent from production. Responsible for API batch release per ICH Q7 §2.");
      add("Personnel","H3","Key Personnel List with Qualifications",true,"All technical staff involved in API manufacturing, QC, QA.");
      add("Equipment","E1","Synthesis Equipment List (reactors, distillation, filtration)",true,"Complete equipment list: reactors (SS/glass-lined, volume), distillation columns, centrifuges, filtration equipment, dryers, milling equipment. Make, model, material of construction, capacity.");
      add("Equipment","E2","Analytical Instruments List — QC Lab",true,"HPLC, GC, GC headspace, KF titrator, NMR access, IR, ICP-MS (for elemental impurities per ICH Q3D), particle size analyser, melting point apparatus. Calibration records.");
      add("Equipment","E3","Solvent Recovery System",false,"Details of solvent recovery/recycling equipment. Required if Class 1/2 solvents (ICH Q3C) are used.");
      add("Quality","Q1","ICH Q7 GMP Compliance Self-Assessment",true,"Formal self-assessment against all ICH Q7 sections. Signed by Technical Head and QA Head.");
      add("Quality","Q2","Starting Material Qualification — Vendor List",true,"List of starting materials and their suppliers. Supplier qualification programme. Re-evaluation schedule. ICH Q7 §7 compliance.");
      add("Quality","Q3","Critical Quality Attributes (CQAs) and Control Strategy",true,"For each API: define CQAs, CPPs, in-process controls, specifications (assay, related substances, ICH Q3D elemental impurities, residual solvents per ICH Q3C, PSD, polymorphism if applicable).");
      add("Quality","Q4","Process Validation Protocols (per ICH Q7 §12)",true,"Process validation approach: three commercial-scale batches per API. Include critical steps, acceptance criteria, sampling plan.");
      add("Quality","Q5","Impurity Profile — ICH Q3A Compliance",true,"Documented impurity control strategy per ICH Q3A: identification threshold, qualification threshold, reporting threshold. Genotoxic impurity control per ICH M7.");
      add("Quality","Q6","Schedule M Part III Self-Assessment",true,"D&C Act Schedule M Part III (API GMP) compliance self-assessment.");
      add("Company","C1","Legal Entity Documents (CoI, MOA, AOA)",true,"Certificate of Incorporation, MOA/AOA, GSTIN, PAN.");
    }

    if (siteType === "Form28") {
      add("Application","A1","Form 28 — Wholesale Licence Application",true,"Application for licence to carry on wholesale business of drugs under D&C Act Rule 63. Submit to SLA.","Form 28");
      add("Application","A2","Fee Payment — State Treasury Challan",true,"Wholesale licence fee as per state schedule.");
      add("Premises","P1","Premises — Ownership or Lease Agreement",true,"Proof of ownership or registered lease for storage premises.");
      add("Premises","P2","Cold Storage Facility Evidence (if applicable)",true,"Required for temperature-sensitive products (vaccines, biologics, insulin). IQ/OQ of refrigerated storage.");
      add("Personnel","H1","Registered Pharmacist Appointment Letter",true,"D&C Act: wholesale dealer must employ a registered pharmacist (R.Ph.) for supervision. Submit pharmacy council registration.");
      add("Company","C1","Legal Entity Documents",true,"CoI/Partnership Deed/Trade Licence + GSTIN + PAN.");
    }

  } else if (country === "US") {
    add("Application","A1","Drug Establishment Registration — FDA CDER/CBER Portal",true,"Annual registration of drug manufacturing establishment via FDA ESG portal. FEI (Facility Establishment Identifier) number assigned on first registration. Due annually by December 31. Domestic and foreign manufacturers of finished dosage forms, API, biologics must register.");
    add("Application","A2","Drug Listing (FDA UID / NDC)",true,"List all drugs manufactured, prepared, propagated, compounded, or processed at the registered site. Assign NDC numbers. Submit via SPL (Structured Product Labeling) format.");
    add("Application","A3","Agent Designation (for Foreign Establishments)",siteType === "FDAAPI","Foreign manufacturers must designate a US agent. US agent contact details required on registration form.");
    add("Premises","P1","Establishment Address and Contact Information",true,"Official site name, street address, city, state/country, zip/postal code, telephone, main contact person.");
    add("Premises","P2","Type of Operation (Manufacture, Repack, Relabel, etc.)",true,"Identify all operations performed: manufacture, repackage, relabel, salvage. Each operation type listed separately.");
    add("Quality","Q1","21 CFR Part 211 cGMP Compliance Status",true,"Declaration of cGMP compliance per 21 CFR Part 210/211 (finished products) or Part 212 (APIs). Prepare for FDA PAI (Pre-Approval Inspection) if linked to an NDA/ANDA.");
    add("Quality","Q2","FDA Inspection History — EIR / Form 483",false,"Most recent Establishment Inspection Report (EIR) and any outstanding Form 483 observations with CAPA status.");
    add("Personnel","H1","Site Representative / Regulatory Affairs Contact",true,"Designated contact for FDA communications. Name, title, phone, email.");

  } else if (country === "EU") {
    add("Application","A1","Manufacturing and Import Authorisation (MIA) Application",true,"Application to National Competent Authority (NCA) for Manufacturing Authorisation per EU Directive 2001/83/EC Article 40. Required before any EU product approval. Covers all manufacturing operations at the site.","MIA");
    add("Application","A2","Application Form — NCA-Specific Format",true,"NCA-specific application form (varies by member state). E.g., MHRA (UK): MIA application form. BfArM (DE): specific form. All require same core information.");
    add("Application","A3","Inspection Scheduling Request / Fee Payment",true,"Request for GMP inspection from NCA. Fee payment per NCA schedule. Inspection typically within 90 days of application for new sites.");
    add("Premises","P1","Site Plan and Building Description",true,"Architectural plans of manufacturing site. Description of buildings, manufacturing areas, QC labs, warehouses, HVAC plant, utilities. All areas used for medicinal product manufacture identified.");
    add("Premises","P2","HVAC and Clean Area Classification Evidence",true,"Cleanroom classification to EU GMP Annex 1 (Annex 1 2023 for sterile). Non-sterile: controlled environments as appropriate. Qualification reports summary.");
    add("Personnel","H1","Qualified Person (QP) — EU Directive Article 51 Requirements",true,"Mandatory for all EU manufacturing sites. QP must: hold pharmacy/medicine/chemistry degree + 2 years practical experience. EU national or resident. Responsible for batch certification and release. Submit: CV, degree certificates, NCA QP registration (required in some member states).");
    add("Personnel","H2","Site Head / Director of Manufacturing — Appointment",true,"Responsible for all manufacturing operations. Declaration of responsibility per GMP Chapter 2.");
    add("Quality","Q1","Site Master File (SMF) per PIC/S PE 008-4",true,"Comprehensive site description per PIC/S Site Master File guideline. Updated within 12 months of any significant change. Document used by NCA inspector as primary reference.");
    add("Quality","Q2","EU GMP Chapter 1-9 + Annexes Self-Assessment",true,"Self-assessment against applicable EU GMP chapters and annexes. Identify gaps and CAPA plan.");
    add("Quality","Q3","Pharmaceutical Quality System (PQS) Description",true,"PQS per ICH Q10. Organisation, documentation hierarchy, change control, CAPA, APR/PQR, technology transfer procedures.");

  } else if (country === "JP") {
    add("Application","A1","Manufacturing Business Licence Application (製造業許可申請書)",true,"Application to PMDA/Prefectural Health Office for Manufacturing Business Licence under PMD Act Article 13.","製造業許可");
    add("Application","A2","Fee Payment — PMD Act Schedule",true,"Manufacturing licence fee per PMD Act fee schedule. Pay to prefectural treasury.");
    add("Premises","P1","Site Plan and Layout",true,"Building plans showing all manufacturing and QC areas. Cleanroom layout for sterile products.");
    add("Personnel","H1","General Manufacturing Supervisor (総括製造販売責任者) Appointment",true,"Qualified supervisor per PMD Act. Must hold pharmacy degree or equivalent + GMP experience.");
    add("Quality","Q1","GMP Conformity Assessment Application (GMP適合性調査申請)",true,"Separate GMP conformity assessment application to PMDA for each manufacturing category. Required for product approval linkage.");

  } else if (country === "PH") {
    const isRenewal  = siteType === "LTO-Renewal";
    const isVariation = siteType === "LTO-Variation";

    // ── A. APPLICATION FORM (all LTO types) ────────────────────────────────
    add("Application","A1","Accomplished e-Application Form with Declaration of Undertaking",true,
      "Submitted online via FDA E-Service Portal System (fda.gov.ph). Must be filed by the owner/President/CEO or duly authorised full-time employee — NOT consultants or freelancers. Includes: Location Plan, GPS coordinates, name of Qualified Person per Annex B of AO 2020-0017.",
      "FDA e-Application");

    if (!isRenewal) {
      // ── B. BUSINESS NAME REGISTRATION ──────────────────────────────────
      add("Application","A2","Proof of Business Name Registration",true,
        "Any ONE of the following in PDF: (a) DTI Certificate of Business Registration — sole proprietorship; (b) SEC Certificate of Registration + Articles of Incorporation — corporation/partnership/juridical person; (c) Cooperative Authority Certificate + Articles of Cooperation — cooperative; (d) Law creating the establishment + SEC Certificate — government-owned corporation. Note: If business/establishment address differs from registration address, submit Mayor's Permit / Business Permit.");

      if (!isVariation) {
        // ── C. PROOF OF INCOME (Initial only) ────────────────────────────
        add("Application","A3","Proof of Income — Latest Audited Financial Statement with Balance Sheet",true,
          "Latest audited Financial Statement with Balance Sheet in PDF. Required to verify capitalisation corresponding to applicable fee tier per RA 9711 and latest FDA issuances.");
      }

      if (isVariation) {
        add("Application","A3","Documentary Requirements per Annex C of AO 2020-0017",true,
          "Specific documents depending on variation type: Major Variation (local manufacturers) — Business permit reflecting new address + Updated SMF (for location transfer); Updated SMF (for expansion/additional product line). Minor Variation — Business permit, Contract Agreements, floor plan expansion, Deed of Sale/MOA/notarised affidavit (change of ownership), Certificate of Zonal Change, name + credentials of new qualified/authorized person as applicable.");
      }
    }

    // ── D. PAYMENT ──────────────────────────────────────────────────────────
    add("Application","A4","Payment of Prescribed Fees",true,
      "Pay via FDA Cashier, Landbank of the Philippines, Development Bank of the Philippines, or Bancnet per existing FDA issuances. Incomplete payment will not be accepted — application will not proceed. Fee amount per latest FDA fee schedule based on capitalisation.");

    // ── E. MANUFACTURER-SPECIFIC (Initial + Major Variation) ────────────────
    if (!isRenewal) {
      add("Quality","Q1","Risk Management Plan (RMP)",true,
        "Required for: ALL drug manufacturers/traders/distributors (CDRR), ALL cosmetics/HUHS/HUP/TCCA manufacturers/traders/distributors (CCRR), ALL medical device manufacturers/traders/distributors (CDRRHR), medium and large food manufacturers (CFRR). Contents: identification, characterisation, prevention/minimisation of product-related risks; post-market surveillance activities; risk intervention measures per AO 2020-0017 Section VI.1.D.",
        "RMP");
      add("Quality","Q2","Site Master File (SMF)",
        siteType !== "LTO-Variation",
        "Required for: Drug manufacturers (CDRR), cosmetics/HUHS manufacturers (CCRR), medical device manufacturers (CDRRHR), large and medium food manufacturers (CFRR). Describes QA, production and QC operations at the named site and closely integrated adjacent operations. Per PIC/S PE 008 format. Must be presented to FDA inspector upon inspection request.",
        "SMF");
    }

    // ── F. QUALIFIED PERSON (Annex B) ────────────────────────────────────────
    add("Personnel","H1","Qualified Person — Credentials (Annex B of AO 2020-0017)",true,
      "CDRR (Drug establishments): Registered Pharmacist per RA 10918 — submit PRC Identification Card + Certificate of Attendance to relevant seminars/trainings on drug safety, quality and efficacy. CDRRHR (Medical devices): Registered professional in allied health (Pharmacy, Nursing, Medical Technology, Dentistry, Radiology, Medicine, PT, Engineering) — PRC ID required. CCRR (Cosmetics): Registered professional in allied health; manufacturers additionally require Registered Chemist/Chemical Engineer/Pharmacist. Note: QPIRA certificates are no longer required per AO 2020-0017 Section V.10.");

    add("Personnel","H2","Drug Manufacturer Key Personnel Declarations (when applicable)",false,
      "For Drug Manufacturers (CDRR): FDA may request names/details of — Production Manager/Head; Quality Assurance Manager/Head; Quality Control Manager/Head; Authorized Person for Batch Release; Pharmacovigilance Officer. For Medical Device Manufacturers (CDRRHR): Production Manager, QA Manager, QC Manager. For Cosmetic/HUHS Manufacturers (CCRR): Production Manager, QC/QA Manager, Product Safety Assessor.");

    // ── G. INSPECTION NOTE ──────────────────────────────────────────────────
    add("Compliance","C1","Pre-LTO Inspection — Manufacturing Plants",true,
      "Pre-licensing inspection is MANDATORY for all manufacturing plant applicants (CDRR/CDRRHR/CCRR/CFRR manufacturers). All other covered establishments are subject to post-licensing inspection at any time within LTO validity. Physical office must exist — virtual offices are grounds for disapproval/revocation. FDA inspector will review RMP and SMF on-site.");
    add("Compliance","C2","FDA E-Service Portal Acknowledgement Receipt",true,
      "Application is considered officially filed only upon receipt of the Acknowledgement Receipt from FDA containing: employee name who received it, reference number, agency logo, date/time, payment confirmation, and statement of completeness. File renewal application at least 3 months before LTO expiry. Renewal filed after expiry is subject to surcharge per RA 9711.");
  }

  return docs;
}

// ─── Required Documents lookup (CTD module-wise) ─────────────────────────────
function getRequiredDocuments(country, productCategory, subType) {
  const isAPI       = ["API","MASTERFILE"].includes(productCategory) || subType.includes("DMF") || subType.includes("ASMF") || subType.includes("API-Dossier") || subType.includes("CEP");
  const isBio       = productCategory === "BIOLOGICAL" || subType.includes("BLA") || subType.includes("Biosimilar") || subType.includes("BAP") || subType.includes("WC-");
  const isGeneric   = productCategory === "GENERIC" || subType.includes("ANDA") || subType.includes("Generic") || subType.includes("Abbreviated");
  const isClinical  = productCategory === "CLINICAL" || subType.includes("IND") || subType.includes("CTA") || subType.includes("IMPD") || subType.includes("CT Permission") || subType.includes("BA/BE");
  const isVariation = productCategory === "VARIATION" || subType.includes("Variation") || subType.includes("Supplement") || subType.includes("CBE");
  const isCosmetic  = productCategory === "COSMETIC" || subType.includes("Cosmetic");
  const isCEP       = subType.includes("CEP");
  const isIN        = country === "IN";
  const isUS        = country === "US";
  const isEU        = country === "EU";
  const isCA        = country === "CA";
  const isAU        = country === "AU";
  const isJP        = country === "JP";
  const isUK        = country === "UK";
  const isPH        = country === "PH";

  const docs = [];
  // regClass: "site" = facility/manufacturer registration | "product" = product dossier/application | "both" = applicable to both
  const add  = (module, section, title, required, desc, form, regClass) =>
    docs.push({ module, section, title, required: !!required, desc: desc||"", form: form||"", regClass: regClass||"product" });

  // ── MODULE 1 — Administrative ──────────────────────────────────────────────
  if (isUS) {
    add(1,"1.1","Cover Letter",true,"Summary description of submission content");
    add(1,"1.2","Form FDA 356h — Application Form",true,"NDA/BLA/ANDA signed cover form","FDA 356h");
    add(1,"1.3.1","Labeling — Prescribing Information (PI)",true,"Proposed PI in SPL format");
    add(1,"1.3.2","Labeling — Carton / Container Labels",true,"Packaging artwork for all configurations");
    add(1,"1.3.3","Patient Package Insert / Medication Guide",!isGeneric,"Required when FDA determines necessary for safe use");
    add(1,"1.4","Patent Certifications (Para III / IV)",isGeneric,"Para IV certification for challenged patents","FDA 3542a");
    add(1,"1.5.1","Debarment Certification",true,"Certification per 21 USC 335a");
    add(1,"1.5.2","Financial Disclosure (Form FDA 3455)",!isGeneric,"Financial disclosure for clinical investigators","FDA 3455");
    add(1,"1.6","Environmental Assessment / Categorical Exclusion",true,"EA or 21 CFR 25.31 exclusion claim");
    if (isClinical) add(1,"1.2","IND Safety Reporting Plan",true,"Expedited/annual safety reporting per 21 CFR 312.32");
    if (isVariation) add(1,"1.12","Supplement — Basis Statement",true,"Statement of regulatory basis for post-approval change");
  } else if (isEU) {
    add(1,"1.0","Cover Letter",true,"Letter to EMA/National CA summarising submission");
    add(1,"1.2","EU Application Form",true,"Signed application form per EMA template","EMA/356h");
    add(1,"1.3.1","Summary of Product Characteristics (SmPC)",true,"Proposed SmPC per QRD template");
    add(1,"1.3.2","Labelling Mock-ups",true,"Outer/inner packaging mock-ups per Annex to Dir 2001/83/EC");
    add(1,"1.3.3","Package Leaflet (PL)",true,"Patient leaflet per QRD template");
    add(1,"1.4","Expert Information (QP / Regulatory Expert CVs)",true,"QP declaration and CV per EU Directive","site");
    add(1,"1.6","Environmental Risk Assessment (ERA)",!isBio,"ERA per EMA/CHMP/SWP/44609/2010");
    add(1,"1.7","GCP Declaration",!isGeneric,"GCP compliance statement for all clinical studies");
    add(1,"1.8","Overview of Pharmacovigilance System (PSMF ref.)",true,"Reference to PSMF and Qualified Person for PV");
    add(1,"1.8.1","Risk Management Plan (EU-RMP)",!isGeneric,"EU RMP per GVP Module V");
    if (isClinical) add(1,"1.0","Investigator's Brochure (IB)",true,"Current IB per ICH E6(R2)");
  } else if (isIN) {
    // ── Module 1 Administrative — CDSCO India (flat 2-part sections → each item = direct outline leaf) ──
    add(1,"1.1","Form 44 — Application for New Drug / CT Permission",true,
      "Prescribed application form per D&C Act Rule 122B. Submit to CDSCO Central Licensing Authority (CLA) via SUGAM portal (sugamapp.cdsco.gov.in). Applicant must be Indian entity or appoint authorised agent. Fee payment (challan/NEFT) required at time of submission.","Form 44");
    add(1,"1.2","Cover Letter to DCG(I)",true,
      "Addressed to Drug Controller General of India, CDSCO HQ, FDA Bhavan, Kotla Road, New Delhi 110002. Include submission type, proposed trade name, INN, dosage form, strength, pack sizes, and brief clinical rationale. Mention SUGAM reference number once obtained.");
    add(1,"1.3","Power of Attorney / Authorised Agent Appointment",true,
      "Notarised PoA if applicant is foreign entity appointing an Indian authorised agent. Must be apostilled in the country of origin and legalised by the Indian Embassy/Consulate. Must be specific to this submission unless a general PoA is provided.");

    // ── MANUFACTURING LICENCES (CDSCO / State Licensing Authority) ─────────
    // Each licence is a DIRECT leaf in Module 1 — visible immediately in outline
    add(1,"1.MFG25","Form 25 — Mfg. Licence: Non-sterile / General Drugs (SLA)",true,
      "Issued by State Licensing Authority (SLA) under D&C Act Rule 68 & 69 (Schedule M, Revised 2005 / 2023). Covers: Oral solids (tablets, capsules, powders), oral liquids (syrups, suspensions), topicals (ointments, creams), semi-solids. Validity: 5 years — attach renewal receipt if renewed within 12 months. The licensed premises address MUST match Module 3.2.P.3.1 manufacturing site. Include Annexure listing all authorised product categories and dosage forms.","Form 25","site");
    add(1,"1.MFG25A","Form 25-A — Mfg. Licence: Sterile / Restricted / Schedule C Products (CLA)",true,
      "Issued by CDSCO Central Licensing Authority (DCG(I)) under Rule 68A — NOT the SLA. Required for: sterile injectables (SVP/LVP), ophthalmic preparations, biologicals (vaccines, sera, toxoids), recombinant DNA products, blood & blood components, biosimilars, monoclonal antibodies, in-vitro diagnostics (IVDs). All Schedule C and C(1) substances MUST carry Form 25-A. Include Schedule M Part II (sterile manufacturing) compliance declaration. Cleanroom classification, HVAC validation, environmental monitoring programme summary required.","Form 25-A","site");
    add(1,"1.MFG25B","Form 25-B — Loan Licence: Contract Manufacturing Arrangement",!isVariation,
      "Required when the applicant (product owner) does not manufacture the product themselves — a contract site does. Issued to the LOAN LICENSEE (product owner). The CONTRACT MANUFACTURER must hold a valid Form 25 or Form 25-A. Attach: (1) Applicant's Form 25-B, (2) CMO's Form 25/25-A copy, (3) Signed Contract Manufacturing Agreement, (4) Quality Agreement (per ICH Q10). Both licences must cover the relevant dosage form.","Form 25-B","site");
    add(1,"1.MFG25D","Form 25-D — API / Drug Substance Manufacturing Licence (CLA)",subType && (subType.includes("API") || subType.includes("DMF")) ? true : false,
      "Issued by CDSCO CLA under D&C Act Rule 68A. Mandatory for APIs (Active Pharmaceutical Ingredients) manufactured in India. Required in Module 3.2.S.1.2 (Manufacturer) section. Must confirm compliance with ICH Q7 (API GMP) and Schedule M Part III. Cross-reference: attach CEP/ASMF/DMF reference if applicable. WHO Prequalification or EU GMP certificate recommended for export-oriented APIs.","Form 25-D","site");
    add(1,"1.MFG27","Form 27 — Test Licence: R&D / Clinical Batch Manufacture",isClinical,
      "Issued by CLA for small-scale manufacture of Investigational Medicinal Products (IMPs) for clinical trials ONLY. Not valid for commercial sale. Required when clinical trial batches are manufactured in India under the CT Permission (Form CT-04). Valid for the trial duration only; must be renewed upon trial extension. Attach CT-04 cross-reference.","Form 27");
    add(1,"1.IMP10","Form 10 — Import Licence: Finished Formulation",subType && subType.includes("Import") ? true : false,
      "Required to import a finished drug formulation for sale/distribution in India. Issued by CDSCO CLA. Separate Form 10 per product. Include proof of approval in country of origin. Validity: 3 years (renewable). Products must be registered under Rule 122B concurrently. Mention anticipated port of entry and customs details.","Form 10","site");
    add(1,"1.IMP10A","Form 10-A — Import Licence: Raw Material / API",subType && subType.includes("Import") ? true : false,
      "For import of drug substances (APIs) and pharmaceutical excipients. Issued by CDSCO. Include CEP/ASMF/DMF reference number. Specify port of entry, HS code, intended use (manufacturing, R&D, export). Link to Module 3.2.S.1.2 manufacturer details.","Form 10-A","site");

    // ── GMP COMPLIANCE CERTIFICATES ─────────────────────────────────────────
    add(1,"1.GMP.M","Schedule M — GMP Compliance Certificate",true,
      "Certificate of GMP compliance per D&C Act Schedule M (Revised 2005, Amendment 2023). Issued or acknowledged by SLA/CLA following factory inspection. Must cover: premises, equipment qualification, QMS, QC laboratory, product recall, complaint handling, self-inspection. Schedule M is MANDATORY for all Indian manufacturers effective 2023 — no small-scale exemption. Attach last inspection report and CAPA closure letter if observations were raised.","site");
    add(1,"1.GMP.WHO","WHO-GMP Certificate (TRS 986 / TRS 992)",!isClinical,
      "WHO GMP certificate per WHO TRS 986 Annex 2 (for non-sterile) / TRS 992 Annex 3 (for sterile). Issued by the national regulatory authority of the manufacturing country. Required for imported products and WHO Prequalified products. Validity: 3 years from WHO inspection date. Mandatory for CDSCO submissions under WHO Prequalification Programme. Include original + certified translation if not in English.","site");
    add(1,"1.GMP.FDA","cGMP Certificate — US FDA / EU EudraGMDP / PIC/S",false,
      "US FDA: attach Form 483 / EIR / FEI number (Establishment Identifier). EU GMP: EudraGMDP certificate number, scope, and validity. PIC/S member country GMP certificate. Highly recommended for imported products; CDSCO may accept in lieu of WHO-GMP. Include DUNS number for US sites.");
    add(1,"1.GMP.SMF","Site Master File (SMF) / Drug Master File (DMF)",true,
      "SMF prepared per PIC/S PE 008-4 template. For API sites: Type II DMF or ASMF. Contents: site map, org chart, GMP scope, product list, utilities (WFI, compressed air, HVAC), equipment list, QMS summary, regulatory inspection history. Must cover ALL manufacturing sites listed in Module 3. Update within 12 months of any major site change.","site");

    // ── LABELLING, REGULATORY DOCUMENTS, PHARMACOVIGILANCE ──────────────────
    add(1,"1.4","Proposed Package Insert (PI) & Labelling — Schedule D",true,
      "Package insert per D&C Act Schedule D and CDSCO Labelling Guidelines. Mandatory elements: trade name, INN (English + Devnagri), composition table, pharmacology, indications, contraindications, warnings, ADRs, dosage regimen, storage conditions, batch no., mfg date, expiry date, Mfg Licence No. (Form 25/25-A as applicable), MRP. OTC products: Hindi or regional language insert may be required by State Drug Controller.");
    add(1,"1.5","Free Sale Certificate (FSC) / Certificate of Pharmaceutical Product (CPP)",!isClinical,
      "Proof of approval and free sale in a major ICH region (US FDA, EMA, PMDA, Health Canada, TGA). Issued per WHO Certification Scheme (WHO Technical Report Series). Required by CDSCO for expedited review (fast track) or when the product is simultaneously approved in a recognised country. CPP must be issued within 12 months of this application.");
    add(1,"1.6","Schedule Y Undertaking / Declaration",true,
      "Statutory undertaking per D&C Act Schedule Y (as amended 2005/2019). Covers: (a) Data integrity of all preclinical/clinical studies, (b) GCP/GLP compliance declaration, (c) Commitment to conduct Phase III bridging studies in India if required by CDSCO, (d) CTRI registration confirmation (www.ctri.nic.in), (e) Post-marketing PV and PvPI commitment. Signed by authorized signatory. Cannot be delegated to CRO.","Schedule Y");
    add(1,"1.7","SUGAM Application Reference / Fee Payment Proof",true,
      "SUGAM portal (sugamapp.cdsco.gov.in) application reference number (format: CTD/YYYY/NNNNNN). SUGAM submission acknowledgement screenshot or email. Application fee payment challan or NEFT transfer receipt as per CDSCO Schedule of Fees (2022 revision). Keep SUGAM login credentials for tracking application status.");
    add(1,"1.8","Pharmacovigilance Plan — PvPI / CDSCO GVP",!isGeneric,
      "PV plan per CDSCO Good Pharmacovigilance Practices Guidelines and IPC/PvPI (Pharmacovigilance Programme of India). Include: PSUR/PBRER schedule, expedited SAE reporting (within 15 calendar days to CDSCO + PvPI), signal detection plan, DILI monitoring (if hepatotoxic agent), risk minimisation activities. Appoint Indian Pharmacovigilance contact. Register with PvPI National Coordinating Centre, IPC, Ghaziabad.");

    if (isCosmetic) {
      add(1,"COS-1","Form COS-1 — Cosmetic Import Registration",true,"Prescribed registration form for imported cosmetics per D&C Act Part XIII","COS-1");
      add(1,"COS-2","Cosmetic Product Safety Report (CPSR)",true,"Safety dossier per D&C Act Part XIII and CDSCO Cosmetics Rules 2020");
      add(1,"COS-3","ISO 22716 / Schedule Q GMP Certificate",true,"Good Manufacturing Practice certificate for cosmetics per Schedule Q of D&C Act");
      add(1,"COS-4","Certificate of Free Sale — Country of Origin",true,"Proof cosmetic is freely sold and not banned in country of origin");
      add(1,"COS-5","Ingredient List with INCI Names & Concentrations",true,"Full INCI ingredient list per CDSCO labelling requirements; restricted substances declaration");
      add(1,"COS-6","Manufacturing Licence for Cosmetics — Form 32",true,"State licence under D&C Act Rule 143 / Form 32 for domestic cosmetic manufacture","Form 32");
    }
  } else if (isCA) {
    add(1,"1.1","Cover Letter",true,"Summary letter to Health Canada");
    add(1,"1.2","Application Form HC/SC 3011",true,"New Drug Submission form","HC/SC 3011");
    add(1,"1.3.1","Product Monograph (PM)",true,"Canadian PM — equivalent of SmPC/PI");
    add(1,"1.3.2","Patient Medication Information (PMI)",true,"Plain-language patient information");
    add(1,"1.4","Financial Disclosure",false,"Clinical investigator financial disclosure");
    add(1,"1.5","Environmental Assessment",false,"Required for specific drug classes");
  } else if (isAU) {
    add(1,"1.1","Cover Letter",true,"Letter to TGA summarising submission");
    add(1,"1.2","TGA Application Form (eBusiness Services)",true,"Application completed in TGA eBusiness portal");
    add(1,"1.3.1","Product Information (PI)",true,"TGA-approved product information");
    add(1,"1.3.2","Consumer Medicine Information (CMI)",true,"Patient-facing consumer medicine information");
    add(1,"1.4","TGA Fee Payment Confirmation",true,"Proof of evaluation fee payment");
    add(1,"1.5","GMP Clearance / OTC / PIC/S Certificate",true,"TGA GMP clearance or overseas GMP certificate","site");
  } else if (isJP) {
    add(1,"1.1","Application Form (Todokede)",true,"Official PMDA/MHLW application form","Todokede");
    add(1,"1.2","Cover Letter",true,"Submission summary letter to PMDA");
    add(1,"1.3","Package Insert (Sho-nin-jiko / Packaging Insert)",true,"Proposed Japanese label per MHLW guidelines");
    add(1,"1.4","GMP Certificate (Pharmaceutical Affairs Act)",true,"GMP certificate from all manufacturing sites","site");
    add(1,"1.5","Patent / Exclusivity Declaration",true,"Patent clearance statement");
  } else if (isUK) {
    add(1,"1.0","Cover Letter",true,"Letter to MHRA summarising submission");
    add(1,"1.2","UK Application Form",true,"MHRA post-Brexit application form");
    add(1,"1.3.1","Summary of Product Characteristics (UK SmPC)",true,"UK SmPC per MHRA QRD template");
    add(1,"1.3.2","Labelling Mock-ups",true,"Packaging mock-ups per UK labelling legislation");
    add(1,"1.3.3","Package Leaflet",true,"Patient leaflet per MHRA template");
    add(1,"1.8","PSMF Reference + UK QPPV Details",true,"Reference to UK Pharmacovigilance System Master File");
    add(1,"1.8.1","UK Risk Management Plan",!isGeneric,"UK-specific RMP per MHRA guidance");
  } else if (isPH) {
    // ── Philippines FDA — ACTD Part I: Administrative Data & Product Information ──
    // Per AO 2020-0017 (RA 9711), ASEAN ACTD December 2016
    // Format: 4 Parts (I–IV) instead of ICH CTD 5 Modules
    add(1,"I-A","ACTD Section A — Introduction",true,
      "Brief general introduction to the pharmaceutical product: pharmacological class, mode of action, proposed indication. Identify submission type: New Drug, Generic, Biological, Herbal, Variation, or Renewal.");
    add(1,"I-B","ACTD Section B — Overall ACTD Table of Contents",true,
      "Comprehensive Table of Contents for the entire ACTD Parts I–IV. Must be prepared in prescribed ACTD format per ASEAN Secretariat December 2016 guidelines. Font: Times New Roman 12pt. All pages numbered; each Part starts at page 1.");
    add(1,"I-C.1","Certificate of Product Registration (CPR) Application Form",true,
      "FDA-PH prescribed CPR application form. Submit via FDA E-Service Portal System (fda.gov.ph). Application must be owned/filed by the registered company owner/President/CEO or full-time authorised employee — NOT consultants or freelancers working on per-product basis.","FDA CPR Form");
    add(1,"I-C.2","Letter of Authorization / Power of Attorney (if applicable)",!isGeneric,
      "If applicant is a foreign company: notarised PoA appointing Philippine local authorised representative. Must be apostilled/legalised. If local applicant acts on behalf of foreign innovator: distributor/marketing authorisation holder agreement.");
    add(1,"I-C.3","Certificate of Product Registration or Free Sale Certificate (FSC) from Country of Origin",true,
      "CPR or FSC issued by the regulatory authority of the country of manufacture or origin. Must be notarised/apostilled. For ASEAN member state products: Certificate of Pharmaceutical Product (CPP) per WHO format is acceptable.");
    add(1,"I-C.4","GMP Certificate from Manufacturing Site",true,
      "Valid GMP Certificate or compliance certificate issued by the competent authority of the country of manufacture. WHO-GMP format preferred. For ASEAN manufacturers: ASEAN GMP certificate. Covers manufacturing site(s) for all dosage forms applied for.","GMP Cert","site");
    add(1,"I-C.5","Proposed Labelling — Package Insert / Package Label",true,
      "Proposed Package Insert (PI) / Patient Information Leaflet and all carton/label mock-ups. Must comply with FDA-PH labelling requirements per RA 9711. Include: brand name, INN/generic name, dosage form, strength, composition, indications, contraindications, warnings, dosage instructions, storage, manufacturer details, CPR number (to be assigned).");
    add(1,"I-C.6","Product Data Sheet (PDS) / Summary of Product Characteristics",true,
      "Approved PDS from country of origin or proposed PDS for Philippines. Must align with clinical data in ACTD Parts III and IV.");
    add(1,"I-C.7","Declaration of Authenticity and Completeness",true,
      "Signed declaration by the duly authorised representative confirming accuracy and completeness of all submitted documents. Submission of falsified/misrepresented data is grounds for disapproval and administrative sanctions per RA 9711.");
    add(1,"I-C.8","Payment of Registration Fees",true,
      "Payment per FDA-PH prescribed fee schedule via FDA Cashier, Landbank of the Philippines, Development Bank of the Philippines, or Bancnet. Incomplete payment will halt application processing. Acknowledgement Receipt issued upon complete application with payment.");
  } else {
    add(1,"1.1","Cover Letter",true,"Cover letter to regulatory authority");
    add(1,"1.2","Application Form",true,"Prescribed application form for the region");
    add(1,"1.3","Proposed Labelling / Product Information",true,"Label, package insert or SmPC as applicable");
    add(1,"1.4","GMP Certificate from Manufacturing Site",true,"GMP compliance documentation","site");
  }

  // ── ACTD Parts II–IV for Philippines (product registration) ──────────────
  if (isPH) {
    // PART II — Quality Document (equivalent to ICH CTD Module 3)
    add(2,"II-A","ACTD Part II — Table of Contents (Quality)",true,
      "Table of Contents specific to Part II Quality Document.");
    add(2,"II-B","Quality Overall Summary (QOS)",true,
      "Non-clinical quality expert summary covering: drug substance and drug product manufacture, characterisation, specifications, stability. Written by qualified expert. Per ACTD Part II Section B.");
    add(3,"II-C.1","Drug Substance — Nomenclature, Structure, General Properties",true,
      "INN, CAS number, molecular formula/weight, structural formula, physicochemical properties. Per ACTD Part II Section C (Drug Substance sub-section).");
    add(3,"II-C.2","Drug Substance — Manufacture",true,
      "Manufacturing process description, process controls, batch formula, in-process controls. GMP compliance statement for API site.");
    add(3,"II-C.3","Drug Substance — Characterisation",true,
      "Elucidation of structure, physicochemical/biological properties, impurity profile.");
    add(3,"II-C.4","Drug Substance — Control of Drug Substance",true,
      "Specifications (acceptance criteria + test methods), method validation, batch analysis data, reference standards.");
    add(3,"II-C.5","Drug Substance — Reference Standards / Materials",true,"Reference standards used in quality testing.");
    add(3,"II-C.6","Drug Substance — Container Closure System",true,"Container/closure for storage and shipment of API.");
    add(3,"II-C.7","Drug Substance — Stability",true,
      "Stability data per ICH Q1A–Q1F. Long-term, intermediate, accelerated. Proposed retest period/shelf life.");
    add(3,"II-C.8","Drug Product — Description and Composition",true,
      "Quantitative composition per unit dose. Function of each excipient. Batch formula.");
    add(3,"II-C.9","Drug Product — Pharmaceutical Development",!isGeneric,
      "Formulation development rationale, excipient selection, compatibility, container closure selection. Per ACTD ICH Q8 guidance.");
    add(3,"II-C.10","Drug Product — Manufacture",true,
      "Manufacturing process flowchart, in-process controls, batch formula, process validation summary. Name and address of manufacturer.");
    add(3,"II-C.11","Drug Product — Control of Excipients",true,
      "Specifications and source of all excipients including novel excipients.");
    add(3,"II-C.12","Drug Product — Control of Drug Product (Finished Product Specifications)",true,
      "Finished product specifications, test methods, method validation, batch analysis. Reference standards.");
    add(3,"II-C.13","Drug Product — Reference Standards / Materials",true,"Reference standards for finished product testing.");
    add(3,"II-C.14","Drug Product — Container Closure System",true,
      "Container/closure description, specifications, qualification. Child-resistant packaging if applicable.");
    add(3,"II-C.15","Drug Product — Stability",true,
      "Stability studies per ICH Q1A–Q1F. Shelf life/storage conditions claim. In-use stability if applicable.");

    // PART III — Nonclinical (equivalent to ICH CTD Module 4) — waived for generics
    if (!isGeneric) {
      add(4,"III-A","ACTD Part III — Table of Contents (Nonclinical)",true,"ToC for Nonclinical Document.");
      add(4,"III-B","Nonclinical Overview",true,
        "Integrated nonclinical overview: pharmacology, pharmacokinetics, toxicology. Per ACTD Part III Section B. Note: For NCE/Biotech products already registered in Reference Countries (ICH, Australia, Canada), full study reports may be waived by FDA-PH — authority may request specific reports on case-by-case basis.");
      add(4,"III-C.1","Nonclinical Written Summary — Pharmacology",true,"Primary/secondary pharmacodynamics, safety pharmacology.");
      add(4,"III-C.2","Nonclinical Written Summary — Pharmacokinetics",true,"Absorption, distribution, metabolism, excretion (ADME).");
      add(4,"III-C.3","Nonclinical Written Summary — Toxicology",true,"Single/repeat dose, genotoxicity, carcinogenicity, reproductive toxicity, local tolerance.");
      add(4,"III-D","Nonclinical Study Reports",false,
        "Full study reports if required. For products registered in Reference Countries, full reports may be waived — FDA-PH will specify requirements during evaluation.");
    } else {
      add(4,"III","ACTD Part III — Nonclinical (Waived for Generic)",false,
        "Part III is NOT required for Generic Drug applications per ACTD guidelines. Bioequivalence data in Part IV Section C replaces nonclinical requirement.");
    }

    // PART IV — Clinical (equivalent to ICH CTD Module 5) — waived for generics (BA/BE required)
    if (!isGeneric) {
      add(5,"IV-A","ACTD Part IV — Table of Contents (Clinical)",true,"ToC for Clinical Document.");
      add(5,"IV-B","Clinical Overview",true,
        "Benefit-risk assessment integrating clinical pharmacology, efficacy, and safety data. Per ACTD Part IV Section B.");
      add(5,"IV-C.1","Clinical Summary — Biopharmaceutics & Analytical Methods",true,"BA/BE, in vitro dissolution, bioanalytical method validation.");
      add(5,"IV-C.2","Clinical Summary — Clinical Pharmacology Studies",true,"PK, PD, special populations, drug interactions.");
      add(5,"IV-C.3","Clinical Summary — Clinical Efficacy",true,"Pivotal and supportive efficacy studies, dose-response, subgroup analyses.");
      add(5,"IV-C.4","Clinical Summary — Clinical Safety",true,"Adverse events, deaths, discontinuations, laboratory abnormalities, safety in special populations.");
      add(5,"IV-C.5","Synopses of Individual Studies",true,"Structured synopses for all pivotal clinical studies.");
      add(5,"IV-D","Tabular Listing of All Clinical Studies",true,"Comprehensive table of all clinical studies submitted.");
      add(5,"IV-E","Clinical Study Reports",false,
        "Full CSRs per ICH E3. For products already approved in Reference Countries, FDA-PH may waive or accept published literature in lieu of full CSRs.");
      add(5,"IV-F","Key Literature References",true,"Published literature supporting clinical sections.");
    } else {
      add(5,"IV-BE","BA/BE Study Report — Bioequivalence",true,
        "Full bioequivalence study report per FDA-PH and ASEAN BE guidelines. Comparative BA against Philippine Reference Standard (PRS) or WHO-designated comparator. Single dose, fasting and fed conditions (if applicable). Statistical analysis: 90% CI for AUC and Cmax must be within 80–125%.");
      add(5,"IV-C1","Analytical Method Validation Report (Bioanalytical)",true,
        "Full validation of bioanalytical method used in BE study per FDA-PH/ASEAN bioanalytical guidelines.");
      add(5,"IV-D","Tabular Listing of Bioequivalence Studies",true,"Summary table of all BE studies submitted.");
    }
    return docs;
  }
  if (!isCEP) {
    add(2,"2.1","Table of Contents (Overall CTD ToC)",true,"Comprehensive ToC for entire submission");
    add(2,"2.2","CTD Introduction",true,"Brief introduction to pharmacological class and intended use");
    add(2,"2.3","Quality Overall Summary (QOS)",true,"Non-clinical quality expert summary per ICH M4Q — covers S and P sections");
    if (!isGeneric && !isAPI && !isClinical) {
      add(2,"2.4","Nonclinical Overview",true,"Integrated nonclinical assessment — pharmacology, PK, toxicology per ICH M4S");
      add(2,"2.6.1","Nonclinical Written Summary — Pharmacology",true,"Written pharmacology summary per ICH M4S");
      add(2,"2.6.2","Nonclinical Written Summary — Pharmacokinetics",true,"Written PK/ADME summary");
      add(2,"2.6.3","Nonclinical Written Summary — Toxicology",true,"Written toxicology summary");
      add(2,"2.6.4","Nonclinical Tabulated Summary — Pharmacology",true,"Tabulated pharmacology study data");
      add(2,"2.6.5","Nonclinical Tabulated Summary — Pharmacokinetics",true,"Tabulated PK study data");
      add(2,"2.6.6","Nonclinical Tabulated Summary — Toxicology",true,"Tabulated toxicology study data");
      add(2,"2.5","Clinical Overview",true,"Integrated benefit-risk assessment per ICH M4E");
      add(2,"2.7.1","Clinical Summary — Biopharmaceutics",true,"Summary of BA, BE and in vitro dissolution studies");
      add(2,"2.7.2","Clinical Summary — Clinical Pharmacology",true,"Summary of PK and PD studies");
      add(2,"2.7.3","Clinical Summary — Efficacy",true,"Integrated summary of clinical efficacy");
      add(2,"2.7.4","Clinical Summary — Safety",true,"Integrated summary of clinical safety (ISS)");
    } else if (isGeneric) {
      add(2,"2.7.1","Summary of Biopharmaceutics Studies (incl. BE)",true,"BE summary — pivotal BE study conclusions and tables");
    }
  }

  // ── MODULE 3 — Quality ────────────────────────────────────────────────────
  // 3.2.S — Drug Substance (all submission types)
  add(3,"3.2.S.1.1","Drug Substance — Nomenclature (INN / USAN / CAS)",true,"International non-proprietary name, USAN, CAS number");
  add(3,"3.2.S.1.2","Drug Substance — Structure",true,"Molecular formula, molecular weight, structural formula, stereochemistry");
  add(3,"3.2.S.1.3","Drug Substance — Physicochemical Properties",true,"Solubility, pKa, polymorphic forms, hygroscopicity, particle size distribution");
  add(3,"3.2.S.2.1","Drug Substance — Manufacturer(s)",true,"Names, addresses, roles of all DS manufacturers");
  add(3,"3.2.S.2.2","Drug Substance — Manufacturing Process & Controls",true,"Full synthetic route, reaction conditions, in-process controls, reprocessing per ICH Q11");
  add(3,"3.2.S.2.3","Drug Substance — Control of Materials",true,"Starting materials, reagents, solvents, catalysts specifications");
  add(3,"3.2.S.2.4","Drug Substance — Controls of Critical Steps & Intermediates",true,"IPC acceptance criteria for critical synthesis steps");
  add(3,"3.2.S.2.5","Drug Substance — Process Validation",true,"Validation data or reference to process validation package");
  add(3,"3.2.S.2.6","Drug Substance — Manufacturing Process Development",!isVariation,"Development history and changes from lab to commercial scale per ICH Q11");
  add(3,"3.2.S.3.1","Drug Substance — Structural Elucidation & Characterisation",true,"MS, NMR, IR, UV, X-ray crystallography data");
  add(3,"3.2.S.3.2","Drug Substance — Impurities Profile",true,"Synthetic impurities, genotoxic impurities, ICH Q3A/Q3C/M7 compliance");
  add(3,"3.2.S.4.1","Drug Substance — Specification",true,"Release and shelf-life specifications with acceptance criteria per ICH Q6A");
  add(3,"3.2.S.4.2","Drug Substance — Analytical Procedures",true,"Full analytical methods for all DS tests");
  add(3,"3.2.S.4.3","Drug Substance — Analytical Method Validation",true,"Validation per ICH Q2(R2) — accuracy, precision, linearity, specificity");
  add(3,"3.2.S.4.4","Drug Substance — Batch Analyses (CoA ≥3 batches)",true,"Certificates of Analysis for minimum 3 representative batches");
  add(3,"3.2.S.4.5","Drug Substance — Justification of Specification",true,"Scientific and regulatory justification for all acceptance criteria");
  add(3,"3.2.S.5","Drug Substance — Reference Standards",true,"Primary/working standard certificates and characterisation data");
  add(3,"3.2.S.6","Drug Substance — Container Closure System",true,"Description and specifications of DS packaging/storage system");
  add(3,"3.2.S.7.1","Drug Substance — Stability Summary & Conclusions",true,"ICH Q1A(R2) stability conclusions per agreed protocol");
  add(3,"3.2.S.7.2","Drug Substance — Post-Approval Stability Protocol",false,"Ongoing stability commitments and monitoring plan");
  add(3,"3.2.S.7.3","Drug Substance — Stability Data",true,"Long-term, accelerated, stress, and photo-stability tabulated data");

  if (!isAPI && !isCEP) {
    // 3.2.P — Drug Product
    add(3,"3.2.P.1","Drug Product — Description & Composition",true,"Qualitative and quantitative composition table, excipient functions");
    add(3,"3.2.P.2.1","Drug Product — Components: Drug Substance Properties",true,"DS properties relevant to formulation (solubility, particle size, polymorphism)");
    add(3,"3.2.P.2.2","Drug Product — Excipients Selection & Justification",true,"Excipient functionality, concentration ranges, compatibility");
    add(3,"3.2.P.2.3","Drug Product — Pharmaceutical Development",true,"Formulation rationale, QbD elements, design space per ICH Q8(R2)");
    add(3,"3.2.P.2.4","Drug Product — Packaging — Extractables & Leachables",true,"Container closure material compatibility, E&L studies per USP <661>/<1663>");
    add(3,"3.2.P.2.5","Drug Product — Microbiological Attributes",true,"Bioburden limits, preservative efficacy, sterility assurance");
    add(3,"3.2.P.2.6","Drug Product — Compatibility with Reconstitution Diluents",false,"Compatibility studies if product requires reconstitution or admixture");
    add(3,"3.2.P.3.1","Drug Product — Manufacturer(s)",true,"Manufacturer, packaging site, QC site details and responsibilities");
    add(3,"3.2.P.3.2","Drug Product — Batch Formula",true,"Commercial batch formula with all components and quantities");
    add(3,"3.2.P.3.3","Drug Product — Manufacturing Process Description",true,"Process description, flow diagram, equipment list, in-process controls");
    add(3,"3.2.P.3.4","Drug Product — Controls of Critical Steps & Intermediates",true,"IPCs for all critical manufacturing steps with acceptance criteria");
    add(3,"3.2.P.3.5","Drug Product — Process Validation / Evaluation",true,"PV summary data or validation protocol for commercial manufacturing");
    add(3,"3.2.P.4.1","Drug Product — Excipient Specifications",true,"Compendial (USP/EP/BP/IP) or non-compendial excipient specifications");
    add(3,"3.2.P.5.1","Drug Product — Specification",true,"Release and shelf-life specifications per ICH Q6A");
    add(3,"3.2.P.5.2","Drug Product — Analytical Procedures",true,"All DP test methods (assay, dissolution, uniformity, etc.)");
    add(3,"3.2.P.5.3","Drug Product — Analytical Method Validation",true,"Method validation per ICH Q2(R2)");
    add(3,"3.2.P.5.4","Drug Product — Batch Analyses",true,"Release CoA for ≥3 batches including at least 1 pilot-scale batch");
    add(3,"3.2.P.5.5","Drug Product — Characterisation of Impurities",true,"Degradation products identification and qualification per ICH Q3B");
    add(3,"3.2.P.5.6","Drug Product — Justification of Specification",true,"Statistical and regulatory basis for all DP acceptance criteria");
    add(3,"3.2.P.6","Drug Product — Reference Standards",true,"DP reference standard certificates");
    add(3,"3.2.P.7","Drug Product — Container Closure System",true,"Container closure materials, dimensions, integrity testing, E&L");
    add(3,"3.2.P.8.1","Drug Product — Stability Summary & Conclusions",true,"ICH Q1A(R2) stability conclusions");
    add(3,"3.2.P.8.2","Drug Product — Post-Approval Stability Protocol",false,"Ongoing stability protocol and commitment schedule");
    add(3,"3.2.P.8.3","Drug Product — Stability Data",true,"Long-term, accelerated, in-use, and photostability tabulated data");
    if (isGeneric) {
      add(3,"3.2.P.2.2.1","Comparative Dissolution Profiles (multi-pH)",true,"Dissolution comparison vs RLD at pH 1.2, 4.5, 6.8 per BE guidance");
    }
  }

  add(3,"3.2.A.1","Appendix — Facilities & Equipment",!isVariation,"Site master file or manufacturing site description");
  if (isBio) add(3,"3.2.A.2","Appendix — Adventitious Agents Safety (TSE/BSE)",true,"TSE/BSE risk assessment per ICH Q5A/Q5D");
  add(3,"3.2.A.3","Appendix — Novel Excipients Safety Package",false,"Full safety package required for any novel or non-compendial excipient");
  add(3,"3.3","Literature References",false,"Published literature supporting quality sections");

  // ── MODULE 4 — Nonclinical ────────────────────────────────────────────────
  if (!isGeneric && !isAPI && !isCEP && !isCosmetic && !isVariation) {
    add(4,"4.2.1.1","Pharmacology — Primary Pharmacodynamics",true,"In vitro and in vivo studies of primary mechanism of action");
    add(4,"4.2.1.2","Pharmacology — Secondary Pharmacodynamics",false,"Off-target/receptor panel studies, selectivity data");
    add(4,"4.2.1.3","Safety Pharmacology — Core Battery",true,"CNS, cardiovascular (hERG, in vivo QT), respiratory per ICH S7A/S7B");
    add(4,"4.2.1.4","Pharmacology — Pharmacodynamic Drug Interactions",false,"In vitro or in vivo PD interaction studies");
    add(4,"4.2.2.1","Pharmacokinetics — Analytical Methods Validation",true,"Bioanalytical method validation in nonclinical matrices per ICH M10");
    add(4,"4.2.2.2","Pharmacokinetics — Absorption (Single & Multiple Dose)",true,"Single and multiple dose PK in at least 2 species");
    add(4,"4.2.2.3","Pharmacokinetics — Tissue Distribution",true,"Quantitative whole-body autoradiography (QWBA) or tissue distribution study");
    add(4,"4.2.2.4","Pharmacokinetics — Metabolism (In Vitro & In Vivo)",true,"Metabolic pathways, reactive metabolites, species comparison per ICH M12");
    add(4,"4.2.2.5","Pharmacokinetics — Excretion & Mass Balance",true,"Routes of excretion, mass balance study, biliary excretion");
    add(4,"4.2.2.6","Pharmacokinetics — Drug-Drug Interaction Studies",false,"CYP inhibition/induction in vitro per ICH M12");
    add(4,"4.2.3.1","Toxicology — Single Dose Toxicity",true,"Acute toxicity in 2 species, 2 routes per ICH M3(R2)");
    add(4,"4.2.3.2","Toxicology — Repeat Dose Toxicity (28/90 day)",true,"Repeat-dose studies in rodent and non-rodent species per ICH M3(R2)");
    add(4,"4.2.3.3","Toxicology — Genotoxicity",true,"Ames test + in vitro chromosomal aberration + in vivo micronucleus per ICH S2(R1)");
    add(4,"4.2.3.4","Toxicology — Carcinogenicity",!isClinical,"2-year rat and mouse carcinogenicity studies per ICH S1A decision tree");
    add(4,"4.2.3.5","Toxicology — Reproductive & Developmental (DART)",true,"Fertility (Seg I), EFD (Seg II), Pre/Postnatal (Seg III) per ICH S5(R3)");
    add(4,"4.2.3.6","Toxicology — Local Tolerance",false,"Studies at intended clinical route (e.g. ocular, dermal, inhalation)");
    add(4,"4.2.3.7","Toxicology — Immunotoxicity / Phototoxicity",false,"ICH S8 (immunotox) and ICH S10 (photosafety) as indicated");
    add(4,"4.3","Literature References — Nonclinical",false,"Published nonclinical literature used in summaries");
  }

  // ── MODULE 5 — Clinical ───────────────────────────────────────────────────
  if (!isAPI && !isCEP && !isCosmetic) {
    add(5,"5.2","Tabular Listing of All Clinical Studies",true,"Master list of all clinical studies: phase, design, objective, status");
    add(5,"5.3.1.1","Biopharmaceutic Studies — Bioavailability Study Reports",!isGeneric,"Absolute and relative BA study reports");
    add(5,"5.3.1.2","Bioequivalence Study Report (Pivotal BE)",isGeneric,"Pivotal BE study report with statistical analysis per region-specific BE guidance");
    add(5,"5.3.1.3","In Vitro / In Vivo Correlation (IVIVC)",false,"IVIVC model if dissolution is proposed as surrogate for in vivo data");
    if (!isGeneric && !isVariation) {
      add(5,"5.3.2.1","Clinical Pharmacology — Phase I: Healthy Subjects PK",true,"SAD/MAD studies in healthy volunteers — PK, tolerability, safety");
      add(5,"5.3.2.2","Clinical Pharmacology — PK in Patient Populations",true,"PK studies in special populations: renal/hepatic impairment, elderly, paediatric");
      add(5,"5.3.3.1","Clinical Pharmacology — PK/PD Study Reports",true,"Exposure-response and dose-response analyses per ICH E4");
      add(5,"5.3.4","Population PK Analysis Report",false,"PopPK model with covariates and model validation per FDA/EMA guidance");
      add(5,"5.3.5.1","Efficacy — Controlled Phase II/III Study Reports (CSRs)",true,"Full Clinical Study Reports per ICH E3 for all pivotal controlled trials");
      add(5,"5.3.5.2","Efficacy — Uncontrolled / Open-Label Study Reports",false,"Supporting Phase II or OLE study reports");
      add(5,"5.3.5.3","Efficacy — Integrated Summary of Efficacy (ISE)",false,"Pooled/meta-analysis across all efficacy studies per FDA ISE guidance");
      add(5,"5.3.6","Post-Marketing Experience",isVariation,"PSUR / PBRER / DSUR for post-marketing data (if applicable)");
    }
    if (isClinical) {
      add(5,"5.3.5.4","Integrated Safety Summary (ISS)",true,"All clinical safety data integrated across studies");
    }
    add(5,"5.3.7","CRFs & Individual Patient Data Listings",!isGeneric,"Case report forms and patient listings for pivotal studies per ICH E3");
    add(5,"5.4","Literature References — Clinical",false,"Published clinical literature used in Module 2.7 summaries");
  }

  return docs;
}

// ─── ICH M4Q(R2) — Revised Quality Module Structure ───────────────────────────
// Source: ICH Harmonised Guideline M4Q(R2) Draft, endorsed 14 May 2025 (Step 2)
// Public consultation open. Final sign-off expected June 2027.
//
// KEY STRUCTURAL CHANGES vs M4Q(R1):
//  • Section numbering: 3.2.S/3.2.P replaced by 2-letter material codes:
//    DS (Drug Substance), DP (Drug Product), SI (Substance Intermediate),
//    SM (Starting/Source Material), RM (Raw Material), EX (Excipient),
//    RS (Reference Standard), IM (Impurities), PI (Product Intermediate),
//    MD (Medical Device), PM (Packaged Medicinal Product), PH (Pharmaceutical
//    Product after transformation), AP (Analytical Procedures), FA (Facilities)
//  • Each material section follows DMCS sub-structure:
//    .D Description | .M Manufacture | .C Control | .S Storage
//  • Module 2.3 becomes PRIMARY assessment basis (not Module 3)
//    → 2.3.1 General Information
//    → 2.3.2 Overall Development & Overall Control Strategy (QTPP/CQAs)
//    → 2.3.3 Core Quality Information (by material type, DMCS)
//    → 2.3.4 Development Summary & Justification
//    → 2.3.5 Product Lifecycle Management (ICH Q12 PLCM/PACMPs)
//    → 2.3.6 Product Quality Benefit Risk (optional)
//  • Module 3 is now SUPPORTING DATA repository for Module 2.3
//  • Expanded scope: biologicals, ATMPs, combination products, multiconstituent
//  • Modules 1, 4, 5 unchanged
function getRequiredDocumentsR2(country, productCategory, subType) {
  const isAPI     = ["API","MASTERFILE"].includes(productCategory) || subType.includes("DMF") || subType.includes("ASMF") || subType.includes("API-Dossier") || subType.includes("CEP");
  const isBio     = productCategory === "BIOLOGICAL" || subType.includes("BLA") || subType.includes("Biosimilar") || subType.includes("BAP") || subType.includes("Biotech");
  const isGeneric = productCategory === "GENERIC" || subType.includes("ANDA") || subType.includes("Generic");
  const isATMP    = subType.includes("Gene") || subType.includes("Cell") || subType.includes("ATMP");
  const isCEP     = subType.includes("CEP");
  const isMD      = productCategory === "MEDDEVICE" || subType.includes("combination") || subType.includes("device");

  const docs = [];
  const add = (module, section, title, required, desc) =>
    docs.push({ module, section, title, required: !!required, desc: desc||"", form:"", regClass:"product", r2: true });

  // ═══ MODULE 2.3 — QUALITY OVERVIEW (M4Q(R2) completely restructured) ══════
  // 2.3.1 General Information
  add(2,"2.3.1","General Information",true,
    "Non-proprietary names of drug substance(s) and product(s); dosage form(s) and release profile(s); strength(s); route(s) and method(s) of administration; primary packaging; medical device(s) or co-packaged item(s); maximum daily dose. Schematic representation of product configuration may be included. [§2.3.1]");

  // 2.3.2 Overall Development and Overall Control Strategy
  add(2,"2.3.2","Overall Development and Overall Control Strategy",true,
    "High-level overview of development and control strategy (OCS) built upon ICH Q8 considering patient's needs. This section is the anchor for regulatory assessment and may be updated throughout the lifecycle. [§2.3.2]");
  add(2,"2.3.2.1","Quality Target Product Profile (QTPP) and CQAs",true,
    "QTPP per ICH Q8. List of Critical Quality Attributes (CQAs) in tabulated format with brief justification for selection. Cross-references to 2.3.4 permitted. [ICH Q6A/Q6B, Q8, Q9, Q11] [§2.3.2.1]");
  add(2,"2.3.2.2","Overall Development Strategy",true,
    "Concise overview of development rationale: pivotal decisions made to achieve intended quality; how CQAs guided DS, DP, and process development per ICH Q8/Q11. Enhanced approach (design space, prior knowledge, platform technologies) briefly discussed. Cross-references to 2.3.4 or Module 3 permitted. [§2.3.2.2]");
  add(2,"2.3.2.3","Overall Control Strategy Representation",true,
    "Holistic OCS from starting/source materials to final DP including packaging. Table, diagram, or flowchart showing how individual control strategies interact to ensure product quality. [ICH Q6A/Q6B, Q8, Q9, Q10, Q11] Cross-references to 2.3.3 CQI permitted. [§2.3.2.3]");

  // 2.3.3 Core Quality Information — organised by material type using DMCS
  // DS (mandatory for all)
  add(2,"2.3.3.DS","Core Quality Information — Drug Substance (DS)",true,
    "Central CQI section for the drug substance. Repeat per drug substance name and/or manufacturer as needed. Organised using DMCS sub-sections. [§2.3.3.DS]");
  add(2,"2.3.3.DS.D.1","DS — Nomenclature",true,
    "INN, USAN/BAN/JAN, WHO Reference Number, company code, CAS registry number, compendial name, other chemical names. [§2.3.3.DS.D.1]");
  add(2,"2.3.3.DS.D.2","DS — Structural Characteristics",true,
    "Chemical entities: structural formula, stereochemistry, molecular formula, confirmation of structure, spectral analysis, molecular mass. Biologics: molecular structure, amino acid sequence, glycosylation sites, post-translational modifications, structural heterogeneity. [§2.3.3.DS.D.2]");
  add(2,"2.3.3.DS.D.3","DS — General Properties",true,
    "Summary of general properties and their impact on DP CQAs. Chemical: crystalline form, pH, ionic strength, particle size, hygroscopicity, solubility. Biologics: biological activities and immunological properties. [§2.3.3.DS.D.3]");
  add(2,"2.3.3.DS.M.1","DS — Description of Manufacturing Process",true,
    "Commercial manufacturing process with flow diagram/process schematic; unit operations; batch size/scale; starting/source materials; aseptic processing; intermediates. Continuous manufacturing: equipment design/dimensions per ICH Q13. AI/ML process models identified. Reprocessing steps in flow diagram. [ICH Q7, Q8, Q11, Q13] [§2.3.3.DS.M.1]");
  add(2,"2.3.3.DS.M.2","DS — Process Controls",true,
    "Process parameters and IPCs essential to consistent quality with associated test methods (cross-reference 2.3.3.AP) and acceptance criteria per unit operation. Model descriptions in 2.3.3.AP if associated with process parameters. [§2.3.3.DS.M.2]");
  add(2,"2.3.3.DS.C","DS — Control (Specification)",true,
    "Specification(s) for DS: tests, analytical procedure names, acceptance criteria for release and/or retest period/shelf life with applicable pharmacopoeia standards. Cross-references to 2.3.3.AP. RTRT approach described if applicable. [ICH Q6A/Q6B, Q11, Q14, M7] [§2.3.3.DS.C]");
  add(2,"2.3.3.DS.S.1","DS — Container Closure System",true,
    "Container closure system for bulk material (biologics) and drug substance. Specifications for primary packaging and functional secondary packaging critical to DS quality. [ICH Q11] [§2.3.3.DS.S.1]");
  add(2,"2.3.3.DS.S.2","DS — Stability, Storage Conditions, Retest Period/Shelf Life",true,
    "Proposed retest period/shelf life and storage conditions. Post-approval stability protocol and stability commitment. Biologics: traceability (chain of custody and identity). [ICH Q1/Q5C] [§2.3.3.DS.S.2]");

  // SI, SM, RM — required for biologics; optional/conditional for chemical entities
  add(2,"2.3.3.SI","Core Quality Information — Substance Intermediates [if applicable]",isBio || isATMP,
    "For intermediates with established specifications. Chemical: typically only 2.3.3.SI.C populated. Biologics (e.g. antibody for ADC, viral vectors for ex vivo gene ATMPs): Description, Control, Storage required. Manufacture may be integrated in 2.3.3.DS.M or provided separately for complex processes. [§2.3.3.SI]");
  add(2,"2.3.3.SM","Core Quality Information — Starting/Source Materials [if applicable]",isBio || isATMP,
    "Description, manufacture, control, storage per ICH Q5A/Q5B/Q5D/Q11. Biological starting materials: source information, procedures to generate WCB/seed lots, cell modification procedures. Animal/human-derived: procurement information. [§2.3.3.SM]");
  add(2,"2.3.3.RM","Core Quality Information — Raw Materials [if applicable]",isBio,
    "Raw materials used in DS and substance intermediate manufacturing. Multiple materials may be presented in single tabular format. Biological raw materials: adventitious agent control, manufacturing/source information. [ICH Q5A, Q11] [§2.3.3.RM]");
  add(2,"2.3.3.EX","Core Quality Information — Excipients [if applicable]",!isAPI && !isCEP,
    "Excipients used in finished dosage form. Compendial: tabular format with function and standard reference. Novel/non-compendial: full DMCS with cross-reference to supporting safety data (nonclinical/clinical). [§2.3.3.EX]");
  add(2,"2.3.3.RS","Core Quality Information — Reference Standards and/or Materials",true,
    "Reference standard(s) and/or material(s) used for testing DS, DP, substance intermediate, and product intermediate. Multiple reference standards may be presented in tabular format. [ICH Q6A/Q6B] [§2.3.3.RS]");

  if (!isAPI && !isCEP) {
    // DP sections
    add(2,"2.3.3.DP","Core Quality Information — Drug Product (DP)",true,
      "Central CQI section for the drug product. Repeat per drug product name and/or manufacturer/strength as needed. Organised using DMCS sub-sections. [§2.3.3.DP]");
    add(2,"2.3.3.DP.D.1","DP — Description and Composition",true,
      "Qualitative and quantitative composition; physical description. Combination products: description of interface between drug and device components. [§2.3.3.DP.D.1]");
    add(2,"2.3.3.DP.D.2","DP — Formulation Development (CQI)",true,
      "Rationale for proposed formulation components, their grades and amounts. Compatibility of DS and excipients. Influence of formulation on DP CQAs. [§2.3.3.DP.D.2]");
    add(2,"2.3.3.DP.M.1","DP — Description of Manufacturing Process",true,
      "Commercial manufacturing process with flow diagram; unit operations; batch size/scale; equipment; process parameters; IPCs. Sterile products: sterilisation method and acceptance criteria. Continuous manufacturing per ICH Q13. [§2.3.3.DP.M.1]");
    add(2,"2.3.3.DP.M.2","DP — Process Controls",true,
      "Process parameters and IPCs per unit operation with acceptance criteria. Cross-references to 2.3.3.AP. Models described in 2.3.3.AP if applicable. [§2.3.3.DP.M.2]");
    add(2,"2.3.3.DP.C","DP — Control (Specification)",true,
      "Specification(s) for DP: tests, analytical procedure names, acceptance criteria for release and shelf life. Cross-references to 2.3.3.AP. RTRT approach if applicable. [ICH Q6A/Q6B, Q8, Q14] [§2.3.3.DP.C]");
    add(2,"2.3.3.DP.S.1","DP — Container Closure System",true,
      "Container closure system for the drug product. Specifications for primary and functional secondary packaging. Device interface specifications for combination products. [§2.3.3.DP.S.1]");
    add(2,"2.3.3.DP.S.2","DP — Stability, Storage Conditions, Shelf Life",true,
      "Proposed shelf life and storage conditions; in-use stability if applicable. Post-approval stability protocol and commitment. [ICH Q1/Q5C] [§2.3.3.DP.S.2]");
  }

  if (isMD) {
    add(2,"2.3.3.MD","Core Quality Information — Medical Device [if applicable]",true,
      "Device component description; interface with drug component; critical device quality attributes; device manufacturing and controls relevant to DP CQAs. [§2.3.3.MD]");
  }

  // 2.3.3.AP — Analytical Procedures (all submissions)
  add(2,"2.3.3.AP","Core Quality Information — Analytical Procedures",true,
    "For each analytical procedure referenced in 2.3.3 CQI sections: description/identification of the procedure; cross-references to relevant 3.2.AP sections in Module 3. Process models linked to analytical procedures described here. [ICH Q2(R2), Q14] [§2.3.3.AP]");

  // 2.3.3.FA — Facilities
  add(2,"2.3.3.FA","Core Quality Information — Facilities",false,
    "Facility information relevant to product quality: manufacturing sites, GMP status, key equipment. Biologics and ATMPs: extended facility documentation including cell banks, viral vectors, and ex vivo manufacturing. [§2.3.3.FA]");

  // 2.3.4 Development Summary and Justification
  add(2,"2.3.4.IN","Development Summary — Integrated Development and Justifications",true,
    "Integrated cross-cutting development justifications. 2.3.4.IN.1: Development of the overall control strategy; rationale for the OCS and contribution of individual element. 2.3.4.IN.2: Special studies (e.g. 2.3.4.IN.2.1 Biopharmaceutics, 2.3.4.IN.2.2 Adventitious agents, 2.3.4.IN.2.3 Elemental impurities, 2.3.4.IN.2.4 Nitrosamine impurities, 2.3.4.IN.2.5 Extractables & leachables). [§2.3.4.IN]");
  add(2,"2.3.4.DS","Development Summary — Drug Substance",true,
    "Detailed development justification for DS including: manufacturing process development, selection of starting materials, control of intermediates, specification justification, container closure justification, stability conclusions. Cross-reference to 3.2.DS in Module 3 for supporting data. [§2.3.4.DS]");
  add(2,"2.3.4.SM","Development Summary — Starting/Source Materials [if applicable]",isBio || isATMP,
    "MCB generation for biologicals; characterisation and qualification of cell banks. Justification of starting material designation and control. [ICH Q5B, Q5D] [§2.3.4.SM]");
  add(2,"2.3.4.RS","Development Summary — Reference Standards and/or Materials",true,
    "Establishment and qualification of in-house primary and working reference standards. Characterisation data summary. Calibration/qualification approach for biological reference materials. [§2.3.4.RS]");
  if (!isAPI && !isCEP) {
    add(2,"2.3.4.DP","Development Summary — Drug Product",true,
      "Detailed DP development justification: formulation development rationale, process development, selection and justification of excipients and ranges, IPC development, specification development, container closure justification, stability conclusions. [§2.3.4.DP]");
  }
  if (isMD) {
    add(2,"2.3.4.MD","Development Summary — Medical Device [if applicable]",true,
      "Development justification for the device component: design verification, validation, biocompatibility, extractables/leachables. [§2.3.4.MD]");
  }
  add(2,"2.3.4.AP","Development Summary — Analytical Procedures",true,
    "Development and validation justification for analytical procedures: analytical target profile (ATP), development history, validation summary per ICH Q2(R2), lifecycle plan per ICH Q14. [§2.3.4.AP]");

  // 2.3.5 Product Lifecycle Management
  add(2,"2.3.5.1","Product Lifecycle Management — Change Summary and Justifications",false,
    "For post-approval submissions: summary and justification of changes to previously approved information. [§2.3.5.1]");
  add(2,"2.3.5.2","Product Lifecycle Management — PLCM Document [if applicable]",false,
    "Product Life Cycle Management Document per ICH Q12: list of Established Conditions (ECs) with CTD location references, reporting categories, and proposed regulatory flexibility. Enables more predictable post-approval change management. [§2.3.5.2]");
  add(2,"2.3.5.3","Product Lifecycle Management — PACMPs [if applicable]",false,
    "Post-Approval Change Management Protocols per ICH Q12: description of proposed changes, supporting studies protocol, pre-agreed regulatory reporting category. [§2.3.5.3]");

  // 2.3.6 Optional
  add(2,"2.3.6","Product Quality Benefit-Risk [optional]",false,
    "Optional section. Applicant's evaluation of quality benefit-risk considerations: residual uncertainties, risk mitigation measures, and overall quality benefit-risk conclusion. [§2.3.6]");

  // Unchanged Module 2 sections (M4S / M4E — not touched by M4Q(R2))
  if (!isGeneric && !isAPI) {
    add(2,"2.4","Nonclinical Overview",true,"Unchanged in M4Q(R2) — per ICH M4S");
    add(2,"2.5","Clinical Overview",true,"Unchanged in M4Q(R2) — per ICH M4E");
    add(2,"2.6","Nonclinical Written & Tabulated Summaries",true,"Unchanged in M4Q(R2) — per ICH M4S");
    add(2,"2.7","Clinical Summary",true,"Unchanged in M4Q(R2) — per ICH M4E");
  } else if (isGeneric) {
    add(2,"2.7.1","Summary of Biopharmaceutics Studies (incl. BE)",true,"Unchanged in M4Q(R2)");
  }

  // ═══ MODULE 3 — BODY OF DATA (supporting detail for Module 2.3) ═══════════
  // New section numbering: 3.2.XX not 3.2.S/3.2.P
  add(3,"3.1","Table of Contents of Module 3",true,"TOC for all Module 3 sections. [§3.1]");

  // 3.2.DS Drug Substances
  add(3,"3.2.DS.D","DS — Description (supporting data)",true,
    "Supporting data for drug substance structure and general properties including physicochemical and biological properties. Supports 2.3.3.DS.D. [§3.2.DS.D]");
  add(3,"3.2.DS.M.1","DS — Description of Manufacturing Process (detailed)",true,
    "Suitably detailed commercial process description: all unit operations, critical and other process parameters, IPCs with control ranges/acceptance criteria. Supports 2.3.3.DS.M.1. [§3.2.DS.M.1]");
  add(3,"3.2.DS.M.2","DS — Development of Manufacturing Process",true,
    "Process development data supporting process parameters and material attributes necessary to ensure DS quality. Functional relationships of material attributes and process parameters to CQAs. Basis for design space if applicable. Process models studies and data. [ICH Q11] [§3.2.DS.M.2]");
  add(3,"3.2.DS.M.3","DS — Extractable and Leachable Studies [if applicable]",isBio,
    "E&L studies for equipment where relevant. [§3.2.DS.M.3]");
  add(3,"3.2.DS.M.4","DS — Viral Clearance Studies [if applicable]",isBio || isATMP,
    "Viral clearance study data. [§3.2.DS.M.4]");
  add(3,"3.2.DS.M.5","DS — Changes During Development",true,
    "Comparability studies for DS manufacturing development vs. proposed commercial process. [§3.2.DS.M.5]");
  add(3,"3.2.DS.M.6","DS — Comparability for Multiple Manufacturing Sites [if applicable]",false,
    "Comparative studies for multiple sites/processes. [§3.2.DS.M.6]");
  add(3,"3.2.DS.M.7","DS — Process Validation or Evaluation Studies",true,
    "Process evaluation/validation data for biologics and aseptic processing/sterilisation for chemical entities demonstrating process suitability. [§3.2.DS.M.7]");
  add(3,"3.2.DS.C.1","DS — Batch Analysis",true,
    "Batch analysis results or CoAs for relevant batches (stability, nonclinical, clinical). Supports 2.3.3.DS.C. [§3.2.DS.C.1]");
  add(3,"3.2.DS.C.2","DS — Justification of Specifications",true,
    "Supportive studies/data justifying specification(s). Supports 2.3.4.DS. [§3.2.DS.C.2]");
  add(3,"3.2.DS.S.1","DS — Container Closure System (supporting data)",true,
    "Container closure system documents; E&L data/studies; studies to select and demonstrate CCS suitability; CoA(s). [§3.2.DS.S.1]");
  add(3,"3.2.DS.S.2","DS — Stability Data",true,
    "Stability data supporting storage conditions and retest period/shelf life. Handling and shipping data if applicable. [§3.2.DS.S.2]");

  // 3.2.SI, SM, RM, EX, RS
  if (isBio || isATMP) {
    add(3,"3.2.SI","Substance Intermediates — Supporting Data [if applicable]",true,
      "Cross-reference to 3.2.DS.M highlighting steps producing substance intermediates. Description, manufacture (if separate from DS.M), control (batch analysis), storage (CCS, stability) per applicable DMCS sub-sections. [§3.2.SI]");
    add(3,"3.2.SM","Starting/Source Materials — Supporting Data [if applicable]",true,
      "Additional DS/intermediate characterisation; adventitious agent control; batch analysis/CoAs; biological: stability/shipping of starting materials. [ICH Q5A, Q5B, Q5D, Q11] [§3.2.SM]");
    add(3,"3.2.RM","Raw Materials — Supporting Data [if applicable]",isBio,
      "Additional description, manufacturing, control, and storage data for raw materials. Biological: adventitious agent control information. [§3.2.RM]");
  }
  if (!isAPI && !isCEP) {
    add(3,"3.2.EX","Excipients — Supporting Data [if applicable]",false,
      "For novel/non-compendial excipients and adjuvants: supportive DMCS data. For compendial excipients: batch analysis data justifying proposed specifications adequacy. [§3.2.EX]");
  }
  add(3,"3.2.RS","Reference Standards/Materials — Supporting Data",true,
    "Description, manufacture of in-house reference materials, control (batch analysis, characterisation for biologics), storage (use period/conditions for biologics). [§3.2.RS]");

  // 3.2.IM Impurities — note: only .D populated; M/C/S = N/A
  add(3,"3.2.IM","Impurities — Description and Characterisation",true,
    "For impurities reported in specifications of DS and/or DP: nomenclature, structural formula, type/origin. Information supporting identification, characterisation, verification, or qualification. [3.2.IM.D only — 3.2.IM.M/C/S are not applicable] [ICH Q3A, Q3B, Q3C, Q3D, Q3E, Q6A/Q6B, M7] [§3.2.IM]");

  if (!isAPI && !isCEP) {
    // 3.2.DP Drug Products
    add(3,"3.2.DP.D.1","DP — Components (supporting data)",true,
      "Experimental designs for critical/interacting variables; DS–excipient compatibility; compatibility with integral devices. [§3.2.DP.D.1]");
    add(3,"3.2.DP.D.2","DP — Formulation Development (supporting data)",true,
      "Studies and/or published literature supporting proposed dosage form, formulation development, and excipient ranges. Complex dosage forms: additional details or diagrams. [§3.2.DP.D.2]");
    add(3,"3.2.DP.D.3","DP — Comparability During Formulation and Product Development",false,
      "Comparative in vitro studies (e.g., dissolution). Device changes during product development. [§3.2.DP.D.3]");
    add(3,"3.2.DP.D.4","DP — Physicochemical and Biological Performance Characteristics",true,
      "In vitro performance data: dissolution, drug release, aerodynamic characterisation for inhalation products. For biologics: activity, potency, identity characterisation. [§3.2.DP.D.4]");
    add(3,"3.2.DP.M.1","DP — Description of Manufacturing Process (detailed)",true,
      "Detailed commercial process description: all steps, CPPs, IPCs with acceptance criteria. Sterile: sterilisation validation. Continuous manufacturing per ICH Q13. [§3.2.DP.M.1]");
    add(3,"3.2.DP.M.2","DP — Development of Manufacturing Process",true,
      "Process development data; functional relationships of process parameters to DP CQAs; design space justification; process model studies. [§3.2.DP.M.2]");
    add(3,"3.2.DP.M.3","DP — Extractable and Leachable Studies [if applicable]",false,
      "E&L studies for manufacturing equipment relevant to DP quality. [§3.2.DP.M.3]");
    add(3,"3.2.DP.M.4","DP — Viral Clearance Studies [if applicable]",isBio || isATMP,
      "Viral clearance studies for biological drug products. [§3.2.DP.M.4]");
    add(3,"3.2.DP.M.5","DP — Changes During Development",true,
      "Comparability studies for formulation and process changes during development vs. proposed commercial. [§3.2.DP.M.5]");
    add(3,"3.2.DP.M.6","DP — Comparability for Multiple Manufacturing Sites [if applicable]",false,
      "Comparative studies for more than one DP manufacturing site. [§3.2.DP.M.6]");
    add(3,"3.2.DP.M.7","DP — Process Validation or Evaluation Studies",true,
      "PV studies demonstrating commercial process suitability including reprocessing. Sterile: sterility assurance validation. [§3.2.DP.M.7]");
    add(3,"3.2.DP.C.1","DP — Batch Analysis",true,
      "Release CoA(s) for relevant batches. Supports 2.3.3.DP.C. [§3.2.DP.C.1]");
    add(3,"3.2.DP.C.2","DP — Justification of Specifications",true,
      "Supportive studies/data justifying DP specification(s). Supports 2.3.4.DP. [§3.2.DP.C.2]");
    add(3,"3.2.DP.S.1","DP — Container Closure System (supporting data)",true,
      "CCS documents; E&L data/studies; studies demonstrating CCS suitability; CoA(s). [§3.2.DP.S.1]");
    add(3,"3.2.DP.S.2","DP — Stability Data",true,
      "Stability data supporting proposed shelf life and storage conditions. In-use stability data if applicable. [§3.2.DP.S.2]");
  }

  if (isMD) {
    add(3,"3.2.MD","Medical Device — Supporting Data [if applicable]",true,
      "Detailed device description, manufacture, control, and storage data. Design verification and validation studies. Biocompatibility data. E&L data. [§3.2.MD]");
  }

  // 3.2.AP Analytical Procedures
  add(3,"3.2.AP","Analytical Procedures — Detailed Methods and Validation Data",true,
    "Full detailed descriptions of all analytical procedures referenced in 2.3.3.AP and 2.3.3 CQI sections. Validation data per ICH Q2(R2). Analytical procedure lifecycle data per ICH Q14. Process analytical technology (PAT) and RTRT method descriptions. [§3.2.AP]");

  // 3.2.FA Facilities
  add(3,"3.2.FA","Facilities — Detailed Information [if applicable]",false,
    "Detailed facility information supporting 2.3.3.FA: site master files, GMP certificates, equipment qualification, cleanroom classification. Biologics/ATMPs: cell banking facility, viral manufacturing containment, cold chain. [§3.2.FA]");

  // Modules 4 and 5 — completely unchanged in M4Q(R2)
  if (!isGeneric && !isAPI) {
    add(4,"4.2","Nonclinical Study Reports",true,"Unchanged in M4Q(R2) — per ICH M4S. No structural changes to Module 4.");
    add(5,"5.3","Clinical Study Reports",true,"Unchanged in M4Q(R2) — per ICH M4E. No structural changes to Module 5.");
  }

  return docs;
}

const MODULE_COLORS = { 1: "#0078D4", 2: "#986F00", 3: "#107C10", 4: "#6264A7", 5: "#C50F1F" };
const M4Q_R2_COLOR  = "#C17900"; // amber — draft/pending adoption

const PdfIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <rect width="24" height="24" rx="3" fill="#FF0000"/>
    <path d="M4 7h3.2c1.6 0 2.8 1.1 2.8 2.7 0 1.7-1.2 2.8-2.8 2.8H5.6V15H4V7zm1.6 4.1h1.4c.8 0 1.3-.5 1.3-1.4 0-.8-.5-1.3-1.3-1.3H5.6v2.7z" fill="white"/>
    <path d="M11 7h2.7c2.3 0 3.8 1.5 3.8 4s-1.5 4-3.8 4H11V7zm1.6 6.6h1c1.4 0 2.2-.9 2.2-2.6s-.8-2.6-2.2-2.6h-1v5.2z" fill="white"/>
    <path d="M18.2 7H22v1.4h-2.2v2h2v1.4h-2V15h-1.6V7z" fill="white"/>
  </svg>
);
const MODULE_ICONS  = { 1: "📋", 2: "📊", 3: "⚗️", 4: "🐭", 5: "🏥" };
const MODULE_TITLES = {
  1: "Module 1 — Administrative & Regional",
  2: "Module 2 — CTD Summaries & Overviews",
  3: "Module 3 — Quality (CMC / Pharmaceutical)",
  4: "Module 4 — Nonclinical Study Reports",
  5: "Module 5 — Clinical Study Reports",
};

// ─── Document Template Library (compact outlines — AI fills full content) ────
function getDocTemplate(section, appInfo) {
  const A = appInfo.applicant || "[APPLICANT NAME]";
  const N = appInfo.appNumber || "[APPLICATION NUMBER]";
  const D = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const REGION = appInfo.country || "US";
  const SUBTYPE = appInfo.subType || "NDA";
  const auth = { US:"FDA", EU:"EMA", IN:"CDSCO", CA:"Health Canada", AU:"TGA", JP:"PMDA", UK:"MHRA", CH:"Swissmedic" }[REGION] || "Authority";

  const T = {
    "1.1": `COVER LETTER
${A} | Application No: ${N} | ${D}

To: ${auth}
RE: ${SUBTYPE} — [Drug Product Name] ([INN]) [Strength] [Dosage Form]

Dear Reviewing Division,

${A} hereby submits the enclosed ${SUBTYPE} for [Drug Product Name] ([INN]).

SUBMISSION OVERVIEW
  Module 1 — Administrative
  Module 2 — CTD Summaries
  Module 3 — Quality (CMC)
  Module 4 — Nonclinical [if applicable]
  Module 5 — Clinical [if applicable]

KEY SUBMISSION DETAILS
  Applicant:       ${A}
  Application No:  ${N}
  Submission Type: ${SUBTYPE}
  Drug Product:    [Name] [Strength] [Dosage Form]
  Drug Substance:  [INN / CAS No.]
  Indication:      [Therapeutic Indication]
  Route:           [Route of Administration]

ENCLOSURES
  1. Completed application form
  2. CTD Modules 1–5 in eCTD format
  3. [Additional enclosures]

Contact: [Name], [Title] | [Email] | [Phone]

Respectfully,
[Authorized Signatory]
${A}
Date: ${D}`,

    "1.2": `APPLICATION FORM — ${SUBTYPE}
Applicant: ${A} | App No: ${N} | Date: ${D}

APPLICANT INFORMATION
  Name:    ${A}
  Address: [Street, City, State/Province, ZIP, Country]
  Contact: [Name, Title, Email, Phone]

PRODUCT INFORMATION
  Drug Product:    [Name] [Strength] [Dosage Form]
  Drug Substance:  [INN / USAN]
  Route:           [Route of Administration]
  Indication:      [Therapeutic Indication]

SUBMISSION TYPE: [X] ${SUBTYPE}

CERTIFICATIONS
  [ ] Debarment certification (see 1.5.1)
  [ ] Patent certifications (if applicable)

Signature: ___________________ Date: ${D}
[Authorized Signatory Name, Title]`,

    "1.3.1": (REGION === "EU"
      ? "SUMMARY OF PRODUCT CHARACTERISTICS (SmPC)\n" +
        "[Drug Product Name] ([INN]) [Strength] [Dosage Form]\n" +
        "Prepared by: " + A + " | " + N + " | " + D + "\n\n" +
        "1. NAME OF THE MEDICINAL PRODUCT\n" +
        "   [Drug Name] [Strength] [Pharmaceutical Form]\n\n" +
        "2. QUALITATIVE AND QUANTITATIVE COMPOSITION\n" +
        "   Each [unit] contains [strength] [INN].\n" +
        "   Excipients with known effect: [list]\n\n" +
        "3. PHARMACEUTICAL FORM\n" +
        "   [Description: colour, shape, marking]\n\n" +
        "4. CLINICAL PARTICULARS\n" +
        "   4.1 Therapeutic indications\n" +
        "       [DRUG NAME] is indicated for [indication] in [population].\n" +
        "   4.2 Posology and method of administration\n" +
        "       Adults: [dose] [route] [frequency]\n" +
        "   4.3 Contraindications\n" +
        "       Hypersensitivity to active substance or excipients.\n" +
        "   4.4 Special warnings and precautions\n" +
        "       [Warnings]\n" +
        "   4.8 Undesirable effects\n" +
        "       [ADR table by SOC and frequency]\n\n" +
        "5. PHARMACOLOGICAL PROPERTIES\n" +
        "   5.1 Pharmacodynamic properties\n" +
        "       ATC code: [Code] | Mechanism: [Description]\n" +
        "   5.2 Pharmacokinetic properties\n" +
        "       Absorption, Distribution, Metabolism, Elimination\n\n" +
        "6. PHARMACEUTICAL PARTICULARS\n" +
        "   6.1 Excipients: [List]\n" +
        "   6.3 Shelf life: [Duration]\n" +
        "   6.4 Storage: [Conditions]\n\n" +
        "Marketing Authorisation Holder: " + A
      : "PRESCRIBING INFORMATION\n" +
        "[Drug Product Name] ([INN]) [Strength] [Dosage Form]\n" +
        "Prepared by: " + A + " | " + N + " | " + D + "\n\n" +
        "HIGHLIGHTS OF PRESCRIBING INFORMATION\n" +
        "Initial U.S. Approval: [Year]\n\n" +
        "INDICATIONS AND USAGE\n" +
        "  [Drug Name] is a [class] indicated for [indication]. ([1])\n\n" +
        "DOSAGE AND ADMINISTRATION\n" +
        "  [Recommended dose and schedule] ([2])\n\n" +
        "DOSAGE FORMS AND STRENGTHS\n" +
        "  [Dosage form] [Strength(s)] ([3])\n\n" +
        "CONTRAINDICATIONS\n" +
        "  [Contraindications] ([4])\n\n" +
        "WARNINGS AND PRECAUTIONS\n" +
        "  [Key warnings] ([5])\n\n" +
        "ADVERSE REACTIONS\n" +
        "  Most common (>=5%): [List] ([6])\n" +
        "  Report to FDA: 1-800-FDA-1088\n\n" +
        "FULL PRESCRIBING INFORMATION:\n" +
        "  1  INDICATIONS AND USAGE\n" +
        "  2  DOSAGE AND ADMINISTRATION\n" +
        "  3  DOSAGE FORMS AND STRENGTHS\n" +
        "  4  CONTRAINDICATIONS\n" +
        "  5  WARNINGS AND PRECAUTIONS\n" +
        "  6  ADVERSE REACTIONS\n" +
        "  7  DRUG INTERACTIONS\n" +
        "  8  USE IN SPECIFIC POPULATIONS\n" +
        "  11 DESCRIPTION\n" +
        "  12 CLINICAL PHARMACOLOGY\n" +
        "  13 NONCLINICAL TOXICOLOGY\n" +
        "  14 CLINICAL STUDIES\n" +
        "  16 HOW SUPPLIED/STORAGE\n" +
        "  17 PATIENT COUNSELING\n\n" +
        "Revised: [Month Year]"
    ),

    "1.5.1": `DEBARMENT CERTIFICATION
21 USC 335a(k)(1)

Application No: ${N} | ${A} | ${D}

I certify that:
1. ${A} has not used services of any debarred person in connection 
   with this application (Section 306(a)).
2. No individual debarred under Section 306(b) has been employed 
   by ${A} in connection with this application.
3. ${A} will not employ any debarred person for services related 
   to any application submitted to FDA.

Signature: _________________
[Name, Title]
${A}
Date: ${D}`,

    "2.3": `QUALITY OVERALL SUMMARY (QOS) — Module 2.3
${A} | Application: ${N} | Date: ${D}

2.3.S DRUG SUBSTANCE ([INN])
  2.3.S.1 General Information
    INN: [INN] | CAS: [CAS#] | MW: [XXX] g/mol
    BCS Class: [I/II/III/IV] | Polymorphic Form: [Form X]
  
  2.3.S.2 Manufacture
    Manufacturer: [Name, Site]
    Route: [X]-step synthesis; Starting materials: [list]
    Process validation: [Summary of approach]
  
  2.3.S.3 Characterisation
    Structure confirmed by: NMR, MS, IR, X-ray
    Impurity profile: Identified impurities per ICH Q3A
  
  2.3.S.4 Control of Drug Substance
    Specification: [Assay 98–102%; impurities per ICH Q3A limits]
    Method validation: Per ICH Q2(R2)
  
  2.3.S.7 Stability (ICH Q1A(R2))
    Long-term:   25°C/60%RH → [X] months
    Accelerated: 40°C/75%RH → 6 months
    Proposed retest period: [XX] months

2.3.P DRUG PRODUCT ([Trade Name] [Dosage Form])
  2.3.P.1 Description
    [Colour, shape, marking, coating]
    Composition: [INN] [X mg] + [Excipients]
  
  2.3.P.2 Pharmaceutical Development
    QbD approach: [CQAs, CPPs, Design Space if applicable]
  
  2.3.P.5 Control of Drug Product
    Specification: Assay [95–105%], Dissolution ≥[X]% at [X] min
  
  2.3.P.8 Stability
    Long-term: 25°C/60%RH → [XX] months
    Proposed shelf life: [XX] months at [storage conditions]`,

    "2.4": `NONCLINICAL OVERVIEW — Module 2.4
${A} | Application: ${N} | Date: ${D}

2.4.1 OVERVIEW OF NONCLINICAL TESTING STRATEGY
  Studies conducted per ICH M3(R2), S1–S9. GLP compliant where applicable.

2.4.2 PHARMACOLOGY
  Primary PD: IC50/EC50 = [X nM]; [mechanism of action]
  Safety Pharm (ICH S7A/B): CNS — no effects; CV — hERG IC50 [X μM]; Resp — no effects

2.4.3 PHARMACOKINETICS
  Bioavailability: [X%] (rat), [Y%] (dog)
  t½: [X h]; Vd: [X L/kg]; Major CYP: [CYP3A4]
  Metabolites: [M1, M2 identified]; Excretion: [renal/biliary]

2.4.4 TOXICOLOGY
  Single dose NOAEL: Rat [X] mg/kg; Dog [X] mg/kg
  Repeat-dose (90d): Rat NOAEL [X] mg/kg/d; Dog NOAEL [X] mg/kg/d
  Target organs: [Liver (adaptive)]; Reversible: [Yes]
  Safety margin (AUC ratio): [X]-fold vs clinical dose
  Genotoxicity: Ames (-), CA (-), MN (-) — Non-genotoxic
  Carcinogenicity: [Not required / Negative at [X] mg/kg]
  Reproductive tox: Fertility NOAEL [X]; EFD NOAEL [X]; no teratogenicity

2.4.5 CONCLUSIONS
  Nonclinical package supports proposed clinical use. No genotoxic potential.
  Adequate safety margins at proposed clinical dose of [X mg].`,

    "2.5": `CLINICAL OVERVIEW — Module 2.5
${A} | Application: ${N} | Date: ${D}

2.5.1 PRODUCT DEVELOPMENT RATIONALE
  [Drug Name] ([INN]) is a [class] for treatment of [indication].
  Unmet need: [Disease burden; limitations of current therapy]
  Mechanism: [MOA description]

2.5.2 OVERVIEW OF BIOPHARMACEUTICS
  Bioavailability: ~[X]% | Tmax: [X h] | t½: [X h]
  Food effect: [None/Increase by X%] | Key interactions: [CYP involvement]

2.5.3 CLINICAL PHARMACOLOGY
  Cmax: [X ng/mL] | AUC: [X ng·h/mL] | Protein binding: [X%]
  Special populations: Renal — [dose adjustment Y/N]; Hepatic — [Y/N]

2.5.4 OVERVIEW OF EFFICACY
  Phase III Programme: [N] pivotal trials
  Primary endpoint ([endpoint]): [Drug] vs [comparator]
    Effect size: [X] (95% CI: [Y, Z]); p < [0.001]
  All pivotal trials met primary endpoint: [Yes/No]

2.5.5 OVERVIEW OF SAFETY
  Exposed: [N] patients | [Y patient-years]
  AEs ≥5%: [List with frequencies]
  SAEs: [X%] vs [Y%] comparator | Deaths: [n ([X%])]
  Discontinuations: [X%] vs [Y%]

2.5.6 BENEFIT-RISK CONCLUSIONS
  Benefit-risk balance favourable for [indication].
  Efficacy: [Summary] | Safety: [Manageable, as described in labelling]`,

    "3.2.S.4.1": `DRUG SUBSTANCE SPECIFICATION — 3.2.S.4.1
[INN] | ${A} | ${N} | Version [X] | ${D}

TEST                    METHOD          ACCEPTANCE CRITERIA
─────────────────────────────────────────────────────────────
Description             Visual          [Colour] [physical form]
Identification (IR)     In-house        Conforms to reference std
Identification (HPLC)   In-house        Rt matches reference ±2%
Assay (dried basis)     HPLC-UV         98.0–102.0%
Known impurity [A]      HPLC-UV         ≤ 0.10%
Known impurity [B]      HPLC-UV         ≤ 0.10%
Any unknown individual  HPLC-UV         ≤ 0.10%
Total impurities        HPLC-UV         ≤ 0.50%
Residual solvents       GC-headspace    Per ICH Q3C limits
Elemental impurities    ICP-MS          Per ICH Q3D limits
Genotoxic impurities    LC-MS/MS        Per ICH M7 TTC limits
Water content           Karl Fischer    ≤ [X.X]%
Polymorphic form        XRPD            Conforms to Form [X]
Particle size           Laser diff.     D90 ≤ [XX] μm
Microbial limits        USP <61>/<62>   TAMC ≤ 100 CFU/g
─────────────────────────────────────────────────────────────
References: ICH Q3A(R2), Q3C(R8), Q3D(R2), Q6A, M7(R2)
Prepared by: [Name], [Title] — ${A} | ${D}`,

    "3.2.P.5.1": `DRUG PRODUCT SPECIFICATION — 3.2.P.5.1
[Trade Name] ([INN]) [Strength] [Dosage Form] | ${A} | ${N} | ${D}

TEST                    METHOD          ACCEPTANCE CRITERIA
─────────────────────────────────────────────────────────────
Description             Visual          [Colour, shape, marking]
Identification (HPLC)   In-house        Rt matches reference
Assay                   HPLC-UV/PDA     95.0–105.0% of label
Content uniformity      USP <905>       Per pharmacopoeial criteria
Dissolution             USP <711>       ≥ [X]% at [XX] min
                        App [I/II] [rpm] Medium: [buffer pH X]
Known impurity [A]      HPLC-UV         ≤ 0.1%
Total degradants        HPLC-UV         ≤ [X.X]%
Water content           Karl Fischer    ≤ [X.X]%
Microbial limits        USP <61>/<62>   TAMC ≤ 100 CFU/g
─────────────────────────────────────────────────────────────
References: ICH Q6A, USP/Ph. Eur. monographs
Prepared by: [Name], [Title] — ${A} | ${D}`,

    "5.3.1.2": `BIOEQUIVALENCE STUDY REPORT — 5.3.1.2
${A} | Protocol: [STUDY-001-BE] | ${D}

STUDY: Pivotal BE — [Test Product] vs [Reference/RLD]
         Under [Fasting/Fed] Conditions

DESIGN
  Type:       2×2 crossover, randomised, single-dose
  Subjects:   [N] healthy adults (18–55 yr, BMI 18–30)
  Washout:    [X] days
  Dose:       [X mg] [route]
  Sampling:   0–48h post-dose | Analyte: [INN] by LC-MS/MS

RESULTS
─────────────────────────────────────────────────────────
Parameter   Test          Reference    T/R Ratio  90% CI
─────────────────────────────────────────────────────────
Cmax        [X±X ng/mL]  [X±X ng/mL]  [XX.X%]   [XX.X–XX.X%]
AUC0-t      [X±X]        [X±X]        [XX.X%]   [XX.X–XX.X%]
AUC0-inf    [X±X]        [X±X]        [XX.X%]   [XX.X–XX.X%]
─────────────────────────────────────────────────────────

CONCLUSION: 90% CI for Cmax, AUC0-t, AUC0-inf all within 80–125%.
BIOEQUIVALENCE [IS / IS NOT] DEMONSTRATED.

Safety: [N] AEs (all mild, non-serious). Well-tolerated.
Prepared by: [Name], [Title] — ${A} | ${D}`,
    // ── CDSCO India — Manufacturing Licence Templates ─────────────────────
    "IN.1.4.1": `FORM 25 — MANUFACTURING LICENCE (NON-STERILE DRUGS)
Drugs & Cosmetics Act, 1940 | Rule 68 & 69 | Schedule M (Revised)
────────────────────────────────────────────────────────────────

LICENCE DETAILS (To be completed from actual State Licence)
  Licence No.           : [FORM-25/STATE/YEAR/NNNNNN]
  Issued By             : State Licensing Authority (SLA)
                          [State Drug Control Organisation]
  Date of Issue         : [DD/MM/YYYY]
  Valid Up To           : [DD/MM/YYYY] (renewable every 5 years, Rule 71)
  Licensee Name         : ${A}
  Registered Address    : [Full address as on licence]
  Manufacturing Site    : [Factory address — must match dossier]

PRODUCTS AUTHORISED ON THIS LICENCE
  ┌─────────────────────────────────────────────────────────────┐
  │ Product Category              │ Dosage Form(s)              │
  ├─────────────────────────────────────────────────────────────┤
  │ Oral Solids                   │ Tablets, Capsules, Powders  │
  │ Oral Liquids                  │ Syrups, Suspensions, Elixirs│
  │ Topicals                      │ Ointments, Creams, Gels     │
  │ Other (specify)               │ [As per licence face]       │
  └─────────────────────────────────────────────────────────────┘

GMP COMPLIANCE DECLARATION (Schedule M, 2005 — amended 2023)
  GMP Certificate No.   : [SLA/GMP/YEAR/NNNNNN]
  Inspecting Authority  : [SLA Inspector Name, Designation]
  Last Inspection Date  : [DD/MM/YYYY]
  Inspection Outcome    : [Satisfactory / Outstanding observations resolved]
  Schedule M Status     : ☑ Compliant with Schedule M (Revised) 2005
  Next Inspection Due   : [DD/MM/YYYY]

QUALIFIED / COMPETENT PERSONS
  Technical Director    : [Name, B.Pharm/M.Pharm/PhD], Registration No. [XXXX]
  Quality Assurance Head: [Name, Qualification]
  Production Head       : [Name, Qualification]

SUBMISSION CHECKLIST — CDSCO M1 Requirements
  ☐ Self-attested photocopy of Form 25 (all pages)
  ☐ Annexure to Form 25 listing all approved products
  ☐ Current Schedule M GMP certificate
  ☐ Last SLA inspection report (if available)
  ☐ Renewal receipt if licence renewed within past 12 months

NOTE: This document must be valid at time of CDSCO filing and throughout 
the review period. Form 44 application will be rejected if manufacturing 
licence is expired or does not cover the submitted dosage form.`,

    "IN.1.4.2": `FORM 25-A — MANUFACTURING LICENCE (RESTRICTED CATEGORIES)
Drugs & Cosmetics Act, 1940 | Rule 68A | Schedule C & C(1)
Central Licensing Authority (CLA) — CDSCO, New Delhi
────────────────────────────────────────────────────────────────

LICENCE DETAILS
  Licence No.           : [FORM-25A/CLA/YEAR/NNNNNN]
  Issued By             : Drug Controller General of India (DCG(I))
                          CDSCO, FDA Bhavan, Kotla Road, New Delhi 110002
  Date of Issue         : [DD/MM/YYYY]
  Valid Up To           : [DD/MM/YYYY]
  Licensee Name         : ${A}
  Registered Address    : [Corporate address]
  Manufacturing Site    : [Site address — must match Module 3 dossier]

SCHEDULE C / C(1) PRODUCTS AUTHORISED
  ┌────────────────────────────────────────────────────────────────────────┐
  │ Category                              │ Products / Dosage Forms        │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ☐ Sterile Injectables (Small Volume)  │ Ampoules, Vials ≤100mL        │
  │ ☐ Large Volume Parenterals (LVPs)     │ Infusion bags/bottles ≥100mL  │
  │ ☐ Ophthalmic Preparations            │ Eye drops, ointments           │
  │ ☐ Biological Products                │ Vaccines, sera, toxoids        │
  │ ☐ Recombinant DNA Products           │ Monoclonal antibodies, proteins│
  │ ☐ Blood & Blood Products             │ Per Schedule C list            │
  │ ☐ In-Vitro Diagnostics (IVDs)        │ Kits, reagents                 │
  │ ☐ Other Schedule C(1) drugs          │ [Specify per licence]          │
  └────────────────────────────────────────────────────────────────────────┘

GMP / FACILITY COMPLIANCE
  Schedule M Applicability : Schedule M Part I + Part II (Sterile) mandatory
  Cleanroom Classification : Grade A/B (fill zones), Grade C/D (support)
  Sterility Assurance Level: SAL 10⁻⁶ (terminal sterilisation)
                             Aseptic fill — validated per PDA TR1 / WHO TRS 986
  HVAC Qualification       : IQ/OQ/PQ completed; monitoring per Schedule M
  Environmental Monitoring : Viable / non-viable, per EU GMP Annex 1 (2023) basis

REGULATORY INSPECTION HISTORY
  Last CDSCO Inspection    : [DD/MM/YYYY] — Outcome: [Satisfactory]
  WHO Prequalification     : ☐ Yes — PQ Reference No. [XXXXXXX]  ☐ Pending
  US FDA ANDA/BLA Approval : ☐ Registered (FEI No. [XXXXXXXXX])
  EU GMP Certificate       : ☐ EudraGMDP No. [XXXXXXXXXXXX]

SUBMISSION CHECKLIST — CDSCO CLA Requirements
  ☐ Self-attested copy of Form 25-A (all pages including Schedule C list)
  ☐ CDSCO CLA inspection report (latest)
  ☐ Schedule M Part II compliance certificate
  ☐ WHO-GMP certificate (TRS 986/992) if applicable
  ☐ Cleanroom qualification summary
  ☐ Contamination control strategy (per WHO TRS 1044 Annex 3)`,

    "IN.1.4.3": `FORM 25-B — LOAN LICENCE (CONTRACT MANUFACTURING ARRANGEMENT)
Drugs & Cosmetics Act, 1940 | Rule 68B
────────────────────────────────────────────────────────────────

LOAN LICENCE DETAILS
  Loan Licence No.      : [FORM-25B/STATE/YEAR/NNNNNN]
  Licence Holder        : ${A}  [= the APPLICANT/OWNER of the product]
  Issued By             : State Licensing Authority (SLA)
  Date of Issue         : [DD/MM/YYYY]
  Valid Up To           : [DD/MM/YYYY]

CONTRACT MANUFACTURER DETAILS
  Manufacturer Name     : [Contract Manufacturing Organisation (CMO) Name]
  Manufacturing Licence : Form 25 No. [XXXX] / Form 25-A No. [XXXX]
  Site Address          : [Manufacturing site — must match dossier Module 3.2.P.3]
  GMP Certificate       : [Certificate No., issuing authority, valid to]

CONTRACT MANUFACTURING AGREEMENT
  Agreement Date        : [DD/MM/YYYY]
  Agreement Reference   : [Internal ref / legal agreement no.]
  Product(s) Covered    : [Product name, dosage form, strength(s)]
  Responsibilities:
    Quality responsibilities   : Defined per ICH Q10 PQS
    Batch release authority    : ☐ CMO QP  ☐ Loan Licensee (${A})
    Analytical testing         : ☐ CMO lab  ☐ Shared  ☐ Loan licensee lab
    Regulatory submissions     : ${A} (applicant)
    Product complaints         : ${A} (primary contact)
    PV / pharmacovigilance     : ${A}

DOCUMENTS TO ATTACH WITH CDSCO APPLICATION
  ☐ Self-attested copy of Form 25-B (loan licence)
  ☐ Self-attested copy of CMO's Form 25 / Form 25-A
  ☐ Executed contract manufacturing agreement (signed & dated)
  ☐ Quality agreement between ${A} and CMO
  ☐ Site Master File of CMO (or equivalent)
  ☐ Latest GMP inspection report of CMO site`,

    "IN.1.4.4": `FORM 25-D — API / DRUG SUBSTANCE MANUFACTURING LICENCE
Drugs & Cosmetics Act, 1940 | Rule 68A | ICH Q7 / Schedule M Part III
Central Licensing Authority — CDSCO
────────────────────────────────────────────────────────────────

LICENCE DETAILS
  Licence No.           : [FORM-25D/CLA/YEAR/NNNNNN]
  Issued By             : Drug Controller General of India (DCG(I)) — CLA
  Licensee Name         : ${A}
  API Manufacturing Site: [Site name, address — must match Module 3.2.S]
  Date of Issue         : [DD/MM/YYYY]
  Valid Up To           : [DD/MM/YYYY]

API(s) AUTHORISED FOR MANUFACTURE
  ┌────────────────────────────────────────────────────────────────────────┐
  │ INN / Approved Name       │ CAS No.    │ Chemical Route  │ Category  │
  ├────────────────────────────────────────────────────────────────────────┤
  │ [Drug Substance Name]     │ [CAS No.]  │ [X-step synth]  │ [Sch C/H] │
  └────────────────────────────────────────────────────────────────────────┘

GMP COMPLIANCE — ICH Q7 / SCHEDULE M PART III
  ICH Q7 Compliance     : ☑ Full compliance with ICH Q7 (API GMP guideline)
  Schedule M Part III   : ☑ Compliant (amended D&C Rules)
  Starting Materials    : Defined, qualified suppliers, per ICH Q7 §7
  Critical Quality Attrs: [CQAs identified per ICH Q8/Q11]
  Process Validation    : ☑ Completed for [X] commercial batches (per ICH Q7 §12)
  Change Control        : Per ICH Q10 PQS; CDSCO notified per Rule 122DA

REGULATORY & EXPORT COMPLIANCE
  WHO Prequalification  : ☐ API listed (PQ ref [XXXXX])  ☐ Not applicable
  EU GMP (EudraGMDP)    : ☐ Certificate No. [XXXXX]
  US FDA Drug Listing   : ☐ NDC/API registered; FEI No. [XXXXXXXXX]
  CEP (EDQM)            : ☐ Certificate No. [XXXXX]  ☐ Not applicable
  EDQM Written Confm.   : ☐ WC issued [date]  ☐ Pending

CROSS-REFERENCE TO MODULE 3
  Section 3.2.S.1.2      : Manufacturer information — Form 25-D details
  Section 3.2.S.2.1      : Manufacturing site name/address — matches licence
  Section 3.2.S.2.2–2.4  : Process description, controls, GMP
  Section 3.2.A.1        : Facilities & equipment — Site Master File reference`,

    "IN.1.5.1": `SCHEDULE M — GMP COMPLIANCE CERTIFICATE
Drugs & Cosmetics Act, 1940 | Schedule M (Revised 2005, Amendment 2023)
────────────────────────────────────────────────────────────────

CERTIFICATE DETAILS
  Certificate No.       : [SLA/GMP/STATE/YEAR/NNNNNN]
  Issued To             : ${A}
  Manufacturing Site    : [Site name and full address]
  Issued By             : [Designation], [State Drug Control Organisation]
  Issue Date            : [DD/MM/YYYY]
  Valid Up To           : [DD/MM/YYYY]
  Manufacturing Licence : Form 25 No. [XXXX] / Form 25-A No. [XXXX]

SCOPE OF COMPLIANCE
  ┌────────────────────────────────────────────────────────────────────────┐
  │ Schedule M Area        │ Requirement                  │ Status        │
  ├────────────────────────────────────────────────────────────────────────┤
  │ Part I — GMP           │ Premises, Equipment, QMS     │ ☑ Compliant  │
  │ Part II — Sterile      │ Cleanrooms, aseptic fill     │ ☑ / N/A      │
  │ Part III — APIs        │ ICH Q7 equivalent            │ ☑ / N/A      │
  │ Annex I — Ophthalmic   │ Sterile eye preparations     │ ☑ / N/A      │
  │ Annex II — Metered Dose│ MDI / DPI manufacture        │ ☑ / N/A      │
  └────────────────────────────────────────────────────────────────────────┘

KEY GMP AREAS VERIFIED (per Schedule M self-inspection checklist)
  Organisation & Personnel   : QA/QC/Production org chart; trained personnel
  Premises & Equipment       : Validated utilities; qualified equipment (IQ/OQ/PQ)
  Documentation (SOPs/BMRs)  : Current SOPs; batch manufacturing records controlled
  Raw Material Controls       : Qualified suppliers; incoming material testing
  In-Process Controls         : Defined IPCs; deviations managed per CAPA
  Finished Product Release    : QP/Authorised Person release system
  Distribution                : GDP-compliant dispatch; cold chain if applicable
  Complaints & Recall         : Written procedures; CDSCO recall compliance
  Self-Inspection             : Annual internal audit programme

LAST CDSCO / SLA INSPECTION
  Inspection Date       : [DD/MM/YYYY]
  Inspection Team       : [Lead Inspector Name], [SLA / CDSCO]
  Observations Raised   : [X] Major / [X] Minor / [X] Critical
  CAPA Submitted        : [DD/MM/YYYY]   Closed: [DD/MM/YYYY]
  Overall Outcome       : ☑ Satisfactory — Licence renewed/maintained

NOTE: Schedule M was made mandatory for all pharmaceutical manufacturers
in India effective 1 January 2005 (Small Scale Exemption removed 2023).
Non-compliance results in licence suspension per D&C Act Section 27.`,

    "IN.1.8": `SCHEDULE Y UNDERTAKING / DECLARATION
Drugs & Cosmetics Act, 1940 | Schedule Y (as amended)
────────────────────────────────────────────────────────────────

APPLICATION REFERENCE
  Application No.  : ${N}
  Drug Product     : [Name] [Strength] [Dosage Form]
  Applicant        : ${A}
  Submission Date  : ${D}
  Submission Type  : [NDA-IN / BAP / FDC / CT Permission]

STATUTORY DECLARATION
  We, ${A}, the applicant for the above drug, hereby declare and undertake:

1. DATA INTEGRITY & SCIENTIFIC VALIDITY
   All preclinical and clinical data submitted in this application was 
   generated in accordance with Good Laboratory Practice (GLP) and Good 
   Clinical Practice (GCP) respectively. Data has not been selectively 
   reported. All adverse findings and deviations are disclosed.

2. COMPLIANCE WITH SCHEDULE Y REQUIREMENTS
   ☑ Phase I, II, III data meet Schedule Y requirements for Indian patients
   ☑ [OR: Bridging study waiver requested — basis: [reason]]
   ☑ Phase III studies conducted in India OR waiver applied for per Rule 122B
   ☑ Clinical trials registered with CTRI (www.ctri.nic.in) — CTRI No. [XXXX]

3. MANUFACTURING & QUALITY COMPLIANCE
   ☑ Drug product manufactured under valid Form 25/25-A licence
   ☑ Manufacturing site complies with Schedule M GMP
   ☑ Drug substance sourced from licenced/approved API manufacturer

4. POST-MARKETING PHARMACOVIGILANCE COMMITMENT
   ${A} commits to:
   ☑ Report all Serious Adverse Events (SAEs) within 15 calendar days
   ☑ Submit Periodic Safety Update Reports (PSURs) per CDSCO PV guidelines
   ☑ Register with PvPI (Pharmacovigilance Programme of India) — IPC, Ghaziabad
   ☑ Maintain Indian Pharmacovigilance contact: [Name, email, phone]

5. RISK MANAGEMENT
   ☑ Risk Management Plan (if applicable) submitted as per CDSCO guidance
   ☑ Patient/prescriber communication materials will be submitted for approval

AUTHORISED SIGNATORY
  Name    : ______________________________
  Title   : [CEO / Director / Authorised Agent]
  Company : ${A}
  Date    : ${D}
  Seal    : [Company seal / stamp]

  "I confirm the above statements are true and correct to the best of my 
   knowledge and belief. I accept responsibility for the accuracy of data 
   submitted in this application to CDSCO."`,
  };

  // Section → key mapping
  const key =
    section === "1.1" ? "1.1" :
    section === "1.2" || section === "1.2_FDA" ? "1.2" :
    section.startsWith("1.3") ? "1.3.1" :
    section === "1.5.1" ? "1.5.1" :
    section === "2.3" ? "2.3" :
    section === "2.4" ? "2.4" :
    section === "2.5" ? "2.5" :
    section === "3.2.S.4.1" ? "3.2.S.4.1" :
    section === "3.2.P.5.1" ? "3.2.P.5.1" :
    section === "5.3.1.2" ? "5.3.1.2" :
    // CDSCO India manufacturing licence templates
    (REGION === "IN" && section === "1.MFG25")   ? "IN.1.4.1" :
    (REGION === "IN" && section === "1.MFG25A")  ? "IN.1.4.2" :
    (REGION === "IN" && section === "1.MFG25B")  ? "IN.1.4.3" :
    (REGION === "IN" && section === "1.MFG25D")  ? "IN.1.4.4" :
    (REGION === "IN" && section === "1.GMP.M")   ? "IN.1.5.1" :
    (REGION === "IN" && section === "1.6")       ? "IN.1.8"   : null;

  return T[key] || null;
}
function generateIndexXML(docs, appInfo) {
  const now = new Date().toISOString().split("T")[0];
  const seqNum = appInfo.sequence.padStart(4, "0");

  const leafNodes = docs.filter((d) => d.analyzed && d.moduleId).map((d) => {
    const mod = CTD_MODULES.find((m) => m.id === d.moduleId);
    const safeName = d.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "").toLowerCase().replace(/\.[^.]+$/, "") + ".pdf";
    const path = `${mod?.ectdPath || "m1"}/${safeName}`;
    return `    <leaf ID="${d.id.slice(0,8)}" operation="${d.metadata?.operation || "new"}" checksum-type="MD5" checksum="d41d8cd98f00b204e9800998ecf8427e">
      <title>${d.metadata?.documentType || d.name.replace(/\.[^.]+$/, "")}</title>
      <file href="${path}"/>
    </leaf>`;
  }).join("\n");

  // AI-generated summaries as leaves
  const summaryLeaves = [
    { id: "qos-001", path: "m2/23-quality-overall-summary/quality-overall-summary.pdf", title: "Quality Overall Summary (Module 2.3)" },
    { id: "nco-001", path: "m2/24-nonclinical-overview/nonclinical-overview.pdf", title: "Nonclinical Overview (Module 2.4)" },
    { id: "clo-001", path: "m2/25-clinical-overview/clinical-overview.pdf", title: "Clinical Overview (Module 2.5)" },
  ].map((s) => `    <leaf ID="${s.id}" operation="new" checksum-type="MD5" checksum="d41d8cd98f00b204e9800998ecf8427e">
      <title>${s.title}</title>
      <file href="${s.path}"/>
    </leaf>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ich-ectd-index SYSTEM "ich-ectd-index-v32.dtd">
<!-- Generated by RAISA — Regulatory Affairs Intelligence System and Analytics -->
<!-- docuBridge-compatible eCTD v3.2.2 backbone -->
<ich-ectd-index version="3.2.2">
  <header>
    <applicant>${appInfo.applicant || "Applicant Name"}</applicant>
    <application-number>${appInfo.appNumber || "NDA000000"}</application-number>
    <sequence-number>${seqNum}</sequence-number>
    <submission-date>${now}</submission-date>
    <country>${appInfo.country || "US"}</country>
    <submission-type>${appInfo.subType || "NDA"}</submission-type>
    <generated-by>RAISA v1.0 — Regulatory Affairs Intelligence System and Analytics</generated-by>
  </header>
  <ich-ectd>
    <!-- Module 1: Administrative -->
    <m1>
${leafNodes.split("\n").filter((l) => l.includes('"m1/')).join("\n") || "    <!-- No Module 1 documents -->"}
    </m1>
    <!-- Module 2: Summaries (AI-Generated) -->
    <m2>
      <m23>
${summaryLeaves.split("\n").filter((l,i) => i < 4).join("\n")}
      </m23>
      <m24>
${summaryLeaves.split("\n").filter((l,i) => i >= 4 && i < 8).join("\n")}
      </m24>
      <m25>
${summaryLeaves.split("\n").filter((l,i) => i >= 8).join("\n")}
      </m25>
    </m2>
    <!-- Module 3: Quality/CMC -->
    <m3>
${leafNodes.split("\n").filter((l) => l.includes('"m3/')).join("\n") || "    <!-- No Module 3 documents -->"}
    </m3>
    <!-- Module 4: Nonclinical -->
    <m4>
${leafNodes.split("\n").filter((l) => l.includes('"m4/')).join("\n") || "    <!-- No Module 4 documents -->"}
    </m4>
    <!-- Module 5: Clinical -->
    <m5>
${leafNodes.split("\n").filter((l) => l.includes('"m5/')).join("\n") || "    <!-- No Module 5 documents -->"}
    </m5>
  </ich-ectd>
</ich-ectd-index>`;
}

// ─── docuBridge manifest CSV generator ───────────────────────────────────────
function generateManifestCSV(docs, appInfo) {
  const header = "File Path,Document Title,Module,Section,Operation,Document Type,Drug Substance,Dosage Form,Route,Phase,Lifecycle\n";
  const rows = docs.filter((d) => d.analyzed && d.moduleId).map((d) => {
    const mod = CTD_MODULES.find((m) => m.id === d.moduleId);
    const safeName = d.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "").toLowerCase().replace(/\.[^.]+$/, "") + ".pdf";
    const path = `${mod?.ectdPath || "m1"}/${safeName}`;
    const m = d.metadata || {};
    return `"${path}","${m.documentType || d.name}","${mod?.label || ""}","${mod?.title || ""}","${m.operation || "new"}","${m.documentType || ""}","${m.drugSubstanceName || ""}","${m.dosageForm || ""}","${m.routeOfAdministration || ""}","${m.clinicalPhase || ""}","ICH eCTD v3.2.2"`;
  });
  // Add AI summary rows
  const summaries = [
    `"m2/23-quality-overall-summary/quality-overall-summary.pdf","Quality Overall Summary","Module 2","2.3 Quality Overall Summary","new","Quality Summary","","","","","ICH eCTD v3.2.2"`,
    `"m2/24-nonclinical-overview/nonclinical-overview.pdf","Nonclinical Overview","Module 2","2.4 Nonclinical Overview","new","Nonclinical Summary","","","","","ICH eCTD v3.2.2"`,
    `"m2/25-clinical-overview/clinical-overview.pdf","Clinical Overview","Module 2","2.5 Clinical Overview","new","Clinical Summary","","","","","ICH eCTD v3.2.2"`,
  ];
  return header + rows.join("\n") + "\n" + summaries.join("\n");
}

// ─── Safe eCTD filename ───────────────────────────────────────────────────────
function toEctdFilename(name) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "").toLowerCase().replace(/\.[^.]+$/, "") + ".pdf";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

async function callClaude(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages }),
  });
  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("\n") || "";
}

// ─── UI components ────────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4,
    background: color + "22", color, border: `1px solid ${color}44`,
    fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", fontFamily: "monospace" }}>{children}</span>;
}

function GlowButton({ onClick, disabled, children, variant = "primary", style = {} }) {
  const base = { padding: "8px 18px", borderRadius: 3, cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: 12, letterSpacing: "0.02em", border: "none",
    transition: "all 0.15s", opacity: disabled ? 0.5 : 1, fontFamily: "'Segoe UI', sans-serif", ...style };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base,
    background: THEME.accent, color: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{children}</button>;
  if (variant === "danger") return <button onClick={onClick} disabled={disabled} style={{ ...base,
    background: THEME.red + "15", color: THEME.red, border: `1px solid ${THEME.red}40` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "#FFFFFF",
    color: THEME.accent, border: `1px solid ${THEME.accent}` }}>{children}</button>;
}

function Card({ children, style = {}, glow, highlight }) {
  return <div style={{ background: THEME.surface,
    border: `1px solid ${glow ? THEME.accent + "80" : highlight ? highlight + "60" : THEME.border}`,
    borderRadius: 4, padding: 16, 
    boxShadow: glow ? `0 0 0 2px ${THEME.accent}30, 0 2px 8px rgba(0,0,0,0.1)` : "0 1px 4px rgba(0,0,0,0.08)", 
    ...style }}>
    {children}
  </div>;
}

function SectionTitle({ children, sub, right }) {
  return <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 8, borderBottom: `2px solid ${THEME.accent}` }}>
    <div>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: THEME.accent, fontFamily: "'Segoe UI', sans-serif", letterSpacing: "0.02em" }}>{children}</h3>
      {sub && <p style={{ margin: "3px 0 0", fontSize: 11, color: THEME.textMuted, lineHeight: 1.4 }}>{sub}</p>}
    </div>
    {right && <div>{right}</div>}
  </div>;
}

function Spinner() {
  return <div style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%",
    border: `2px solid ${THEME.accent}33`, borderTopColor: THEME.accent,
    animation: "spin 0.8s linear infinite", verticalAlign: "middle" }} />;
}

function ProgressBar({ value, color = THEME.accent }) {
  return <div style={{ height: 4, background: THEME.border, borderRadius: 2, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 2,
      transition: "width 0.5s ease" }} />
  </div>;
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    style={{ padding: "4px 12px", borderRadius: 4, border: `1px solid ${THEME.border}`, background: "transparent",
      color: copied ? THEME.green : THEME.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
    {copied ? "✓ Copied" : label}
  </button>;
}

function DownloadButton({ content, filename, label }) {
  return <button onClick={() => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }} style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${THEME.accent}55`,
    background: THEME.accentSoft, color: THEME.accent, cursor: "pointer", fontSize: 12,
    fontWeight: 700, fontFamily: "monospace" }}>⬇ {label}</button>;
}

function ModuleCard({ mod, documents, active, onClick }) {
  const count = documents.filter((d) => d.moduleId === mod.id).length;
  return <div onClick={onClick} style={{ background: active ? THEME.surfaceAlt : THEME.surface,
    border: `1px solid ${active ? mod.color + "66" : THEME.border}`, borderRadius: 8,
    padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
    boxShadow: active ? `0 0 20px ${mod.color}22` : "none" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>{mod.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: mod.color, letterSpacing: "0.08em", fontFamily: "monospace" }}>{mod.label}</div>
        <div style={{ fontSize: 12, color: THEME.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mod.title}</div>
      </div>
      {count > 0 && <span style={{ background: mod.color + "22", color: mod.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{count}</span>}
    </div>
  </div>;
}

function UploadZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const handle = (files) => {
    const arr = Array.from(files).filter((f) =>
      f.type === "application/pdf" || f.name.endsWith(".docx") || f.name.endsWith(".doc") ||
      f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.type === "text/plain");
    if (arr.length) onFiles(arr);
  };
  return <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
    onDragLeave={() => setDragging(false)}
    onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
    onClick={() => inputRef.current?.click()}
    style={{ border: `2px dashed ${dragging ? THEME.accent : THEME.border}`, borderRadius: 10,
      padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
      background: dragging ? THEME.accentSoft : THEME.surfaceAlt,
      boxShadow: dragging ? `0 0 30px ${THEME.accentGlow}` : "none" }}>
    <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
      style={{ display: "none" }} onChange={(e) => handle(e.target.files)} />
    <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
    <div style={{ color: THEME.text, fontWeight: 600, marginBottom: 4 }}>Drop regulatory documents into RAISA</div>
    <div style={{ color: THEME.textMuted, fontSize: 12 }}>PDF · DOCX · XLSX · TXT</div>
    <div style={{ marginTop: 14 }}><GlowButton variant="secondary" style={{ fontSize: 12 }}>Browse Files</GlowButton></div>
  </div>;
}

function MetadataTable({ data }) {
  if (!data?.length) return null;
  return <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ background: THEME.surfaceAlt }}>
          {Object.keys(data[0]).map((k) => <th key={k} style={{ padding: "8px 12px", textAlign: "left",
            color: THEME.accent, fontWeight: 700, letterSpacing: "0.06em",
            borderBottom: `1px solid ${THEME.border}`, fontFamily: "monospace", fontSize: 11 }}>{k.toUpperCase()}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
          {Object.values(row).map((v, j) => <td key={j} style={{ padding: "8px 12px", color: THEME.text, verticalAlign: "top" }}>{String(v)}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div>;
}

function DocumentRow({ doc, onAnalyze, analyzing }) {
  const mod = CTD_MODULES.find((m) => m.id === doc.moduleId);
  return <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
    background: THEME.surfaceAlt, borderRadius: 8, border: `1px solid ${THEME.border}` }}>
    <span style={{ fontSize: 16 }}>{doc.type === "pdf" ? <PdfIcon size={18} /> : doc.type === "xlsx" ? "📊" : "📝"}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
        {doc.analyzed && <><span style={{ color: THEME.green, fontFamily: "monospace" }}>→ {toEctdFilename(doc.name)}</span> · </>}
        {(doc.size / 1024).toFixed(1)} KB
        {mod && <> · <span style={{ color: mod.color }}>{mod.label}</span></>}
        {doc.metadata?.operation && <> · <Badge color={THEME.blue}>{doc.metadata.operation}</Badge></>}
      </div>
    </div>
    {!doc.analyzed && (analyzing === doc.id ? <Spinner /> :
      <GlowButton variant="secondary" onClick={() => onAnalyze(doc)} style={{ fontSize: 11, padding: "5px 12px" }}>Analyze</GlowButton>)}
    {doc.analyzed && <span style={{ color: THEME.green, fontSize: 16 }}>✓</span>}
  </div>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App({ initialMode = "checklist" }) {
  const [documents, setDocuments] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [landingMode, setLandingMode] = useState(initialMode === "review" ? "review" : "checklist");
  const [validationIssues, setValidationIssues] = useState([]);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [selectedDocNode, setSelectedDocNode] = useState(null);
  const [log, setLog] = useState([]);
  const [appInfo, setAppInfo] = useState({
    applicant: "", appNumber: "", sequence: "0000",
    subType: "NDA", country: "US", productCategory: "ALL", registrationType: "new", _lastAppNumPh: "NDA000000",
    appType: "product",  // "product" = CTD/eCTD product registration | "site" = facility/manufacturer registration
    siteType: "",        // e.g. "Form25" | "Form25A" | "Form25D" | "FDASITE" | "EUGMP" etc.
  });
  const [ribbonPanel, setRibbonPanel] = React.useState(null); // "upload" | "guidelines" | "generate" | null
  const toggleRibbonPanel = (name) => setRibbonPanel(p => p === name ? null : name);
  const [xmlView, setXmlView] = useState(false);
  // ── PLCM State ──
  const [ecRegister, setEcRegister] = useState([
    { id: "ec-001", ctdSection: "3.2.S.2.2", description: "Manufacturing process for drug substance", reportingCategory: "Prior Approval", status: "Approved", approvedState: "As filed", lastChanged: null, pacmpRef: "" },
    { id: "ec-002", ctdSection: "3.2.P.3.3", description: "Manufacturing process for drug product", reportingCategory: "Prior Approval", status: "Approved", approvedState: "As filed", lastChanged: null, pacmpRef: "" },
    { id: "ec-003", ctdSection: "3.2.S.4.1", description: "Drug substance specifications", reportingCategory: "Notification", status: "Approved", approvedState: "As filed", lastChanged: null, pacmpRef: "" },
    { id: "ec-004", ctdSection: "3.2.P.5.1", description: "Drug product specifications", reportingCategory: "Notification", status: "Approved", approvedState: "As filed", lastChanged: null, pacmpRef: "" },
  ]);
  const [pacmpLog, setPacmpLog] = useState([
    { id: "pacmp-001", title: "Manufacturing Site Change Protocol", ecRef: "ec-002", status: "Active", submittedDate: "2024-03-15", approvedDate: "2024-09-10", region: "US", description: "Pre-agreed protocol for transfer of drug product manufacturing to secondary site." },
  ]);
  const [sequenceHistory, setSequenceHistory] = useState([
    { seq: "0000", date: "2023-06-01", type: "Original Submission", subType: "NDA", changes: "Initial Marketing Authorization Application", status: "Approved", ecChanges: [] },
  ]);
  const [changeAssessments, setChangeAssessments] = useState([]);
  const [assessingChange, setAssessingChange] = useState(false);
  const [newEC, setNewEC] = useState({ ctdSection: "", description: "", reportingCategory: "Prior Approval", approvedState: "" });
  const [newPACMP, setNewPACMP] = useState({ title: "", ecRef: "", description: "", region: "US" });
  const [newSeq, setNewSeq] = useState({ type: "Variation", subType: "CBE-30", changes: "", ecChanges: [] });
  const [plcmShowAddEC, setPlcmShowAddEC] = useState(false);
  const [plcmShowAddPACMP, setPlcmShowAddPACMP] = useState(false);
  const [plcmShowAddSeq, setPlcmShowAddSeq] = useState(false);
  const [plcmActiveSection, setPlcmActiveSection] = useState("timeline");
  const [changeDoc, setChangeDoc] = useState(null);
  const changeDocRef = useRef();
  const [checkedDocs, setCheckedDocs] = useState({});
  const [reqDocsCollapsed, setReqDocsCollapsed] = useState({});
  const [m4qMode, setM4qMode] = useState("R1"); // "R1" = current | "R2" = ICH M4Q(R2) June 2027
  const [templateDoc, setTemplateDoc] = useState(null);
  const [templateContent, setTemplateContent] = useState("");
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const templateRef = useRef();

  // ── Document Review Panel ─────────────────────────────────────────────────
  const [docReviewOpen, setDocReviewOpen]     = useState(false);
  React.useEffect(() => { if (initialMode === "review") setDocReviewOpen(true); }, []);
  const [drFile, setDrFile]                   = useState(null);
  const [drFileB64, setDrFileB64]             = useState(null);
  const [drFileMime, setDrFileMime]           = useState(null);
  const [drDocType, setDrDocType]             = useState("");
  const [drReviewing, setDrReviewing]         = useState(false);
  const [drResult, setDrResult]               = useState(null);
  const [drRaw, setDrRaw]                     = useState("");
  const [drActiveTab, setDrActiveTab]         = useState("summary");
  const [drProgress, setDrProgress]           = useState("");
  const drFileRef = useRef();

  const [guidelines, setGuidelines] = useState([]);      // uploaded regulatory guideline files
  const [customReqs, setCustomReqs] = useState({});       // parsed requirements keyed by guideline id
  const guidelineInputRef = useRef();

  const addLog = (msg, type = "info") => setLog((p) => [...p, { msg, type, ts: new Date().toLocaleTimeString() }]);

  // ── Guideline upload & AI parse ───────────────────────────────────────────
  const handleGuidelineUpload = async (files) => {
    for (const file of Array.from(files)) {
      const id = `gl-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const entry = { id, name: file.name, size: file.size, status: "parsing", requirements: [] };
      setGuidelines(p => [...p, entry]);
      addLog(`Parsing guideline: ${file.name}`, "info");
      try {
        // Read file
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result.split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const isText = file.type === "text/plain";
        const textContent = isText ? atob(base64) : null;

        // Call Claude to extract required documents from the guideline
        const msgContent = isText
          ? [{ type: "text", text: `You are a regulatory affairs specialist. Extract ALL required and optional documents from this regulatory guideline into a structured JSON array. Return ONLY valid JSON, no markdown, no explanation.

Format: [{"section":"1.1","title":"Document Title","required":true,"desc":"Brief description of content required","module":1}]

Module mapping: 1=Administrative/M1, 2=CTD Summaries/M2, 3=Quality-CMC/M3, 4=Nonclinical/M4, 5=Clinical/M5. If section unclear, infer from context.

GUIDELINE TEXT:
${textContent}` }]
          : [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: "You are a regulatory affairs specialist. Extract ALL required and optional documents listed in this regulatory guideline into a structured JSON array. Return ONLY valid JSON, no markdown, no explanation. Format: [{\"section\":\"1.1\",\"title\":\"Document Title\",\"required\":true,\"desc\":\"Brief description\",\"module\":1}]. Module mapping: 1=Administrative/M1, 2=CTD Summaries/M2, 3=Quality-CMC/M3, 4=Nonclinical/M4, 5=Clinical/M5. Include every document/form/certificate mentioned as required or recommended." }
            ];

        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: msgContent }] })
        });
        const data = await resp.json();
        const rawText = (data.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
        let reqs = [];
        try {
          reqs = JSON.parse(rawText);
        } catch (e) {
          reqs = [];
        }

        setGuidelines(p => p.map(g => g.id === id ? { ...g, status: "done", requirements: reqs } : g));
        setCustomReqs(p => ({ ...p, [id]: reqs }));
        addLog(`✓ Parsed ${reqs.length} requirements from ${file.name}`, "success");
      } catch (err) {
        setGuidelines(p => p.map(g => g.id === id ? { ...g, status: "error" } : g));
        addLog(`✗ Failed to parse ${file.name}: ${err.message}`, "error");
      }
    }
  };

  const removeGuideline = (id) => {
    setGuidelines(p => p.filter(g => g.id !== id));
    setCustomReqs(p => { const n = {...p}; delete n[id]; return n; });
  };

  // Merge built-in + custom requirements
  // When m4qMode === "R2": swap Modules 2 & 3 for the ICH M4Q(R2) structure (June 2027)
  const getMergedRequirements = (country, productCategory, subType) => {
    let base;
    if (m4qMode === "R2") {
      const r1 = getRequiredDocuments(country, productCategory, subType);
      const r2 = getRequiredDocumentsR2(country, productCategory, subType);
      // Keep M1, M4, M5 from R1; replace M2 & M3 with R2 versions
      base = [
        ...r1.filter(d => d.module !== 2 && d.module !== 3),
        ...r2.filter(d => d.module === 2 || d.module === 3),
      ];
    } else {
      base = getRequiredDocuments(country, productCategory, subType);
    }
    const custom = Object.values(customReqs).flat().map(r => ({ ...r, fromGuideline: true }));
    // Deduplicate by section — custom takes priority
    const map = {};
    base.forEach(r => { map[r.section] = r; });
    custom.forEach(r => { map[r.section] = { ...map[r.section], ...r, fromGuideline: true }; });
    return Object.values(map);
  };

  // ── Template handler ──────────────────────────────────────────────────────
  const openTemplate = async (doc) => {
    setTemplateDoc(doc);
    const prebuilt = getDocTemplate(doc.section, appInfo);
    if (prebuilt) {
      setTemplateContent(prebuilt);
    } else {
      setTemplateContent("");
      setGeneratingTemplate(true);
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            system: `You are an expert pharmaceutical regulatory affairs specialist. Generate a professional regulatory document template. Use [PLACEHOLDER] brackets for all variable content. Include all ICH CTD-required sections, headings, and guidance notes. Format as plain text with clear section headers using ─── lines. Make it comprehensive and immediately usable.`,
            messages: [{ role: "user", content: `Generate a complete regulatory document template for:\n\nDocument: ${doc.title}\nCTD Section: ${doc.section}\nRegion: ${appInfo.country || "US"} (${appInfo.subType || "NDA"})\nApplicant: ${appInfo.applicant || "[APPLICANT NAME]"}\nApp Number: ${appInfo.appNumber || "[APP NUMBER]"}\n\nDescription: ${doc.desc}\n\nInclude all required sections, ICH guideline references, and content guidance. Use today's date placeholder where needed.` }]
          })
        });
        const data = await resp.json();
        setTemplateContent(data.content?.[0]?.text || "Template generation failed. Please try again.");
      } catch (e) {
        setTemplateContent("Error generating template. Check your connection and try again.");
      }
      setGeneratingTemplate(false);
    }
  };

  const exportTemplatePDF = () => {
    const doc = templateDoc;
    const content = templateRef.current?.value || templateContent;
    const blob = new Blob([content], { type: "text/plain" });
    // Build a printable HTML page for PDF save
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.title}</title><style>
      body { font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.6; margin: 2cm; color: #111; }
      h1 { font-size: 13pt; border-bottom: 2px solid #000; padding-bottom: 6px; }
      pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
      .header { text-align: center; margin-bottom: 24px; }
      .section { font-size: 8pt; color: #666; }
      @page { margin: 2cm; size: A4; }
    </style></head><body>
      <div class="header">
        <h1>${doc.title}</h1>
        <div class="section">CTD Section ${doc.section} | ${appInfo.country || "US"} | ${appInfo.subType || "NDA"} | ${appInfo.appNumber || "[APP NUMBER]"}</div>
        <hr/>
      </div>
      <pre>${content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
    </body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
  };

  const copyTemplate = () => {
    const content = templateRef.current?.value || templateContent;
    navigator.clipboard.writeText(content).catch(() => {});
  };

  const handleFiles = useCallback(async (files) => {
    const newDocs = files.map((f) => ({
      id: `${Date.now()}-${Math.random()}`, name: f.name, size: f.size,
      type: f.name.endsWith(".pdf") ? "pdf" : f.name.endsWith(".xlsx") || f.name.endsWith(".xls") ? "xlsx" : "docx",
      file: f, analyzed: false, moduleId: null, metadata: null, status: "pending",
    }));
    setDocuments((p) => [...p, ...newDocs]);
    addLog(`Loaded ${files.length} document(s)`, "success");
  }, []);

  const analyzeDocument = useCallback(async (doc) => {
    setAnalyzing(doc.id);
    addLog(`Analyzing: ${doc.name}`, "info");
    try {
      let messages;
      const prompt = `Analyze this pharmaceutical regulatory document and return ONLY valid JSON:
{"moduleId":<1-5>,"moduleName":"","documentType":"","drugSubstanceName":"","dosageForm":"","routeOfAdministration":"","therapeuticIndication":"","manufacturingProcess":"","stabilityConditions":"","studySpecies":"","studyDuration":"","clinicalPhase":"","studyOutcomes":"","keyFindings":"2-3 sentence summary","operation":"new","ectdSection":"e.g. m3/32s/drug-substance","regulatoryFlags":[]}
Note: "operation" must be one of: new, replace, delete, append (ICH eCTD lifecycle)
Note: "ectdSection" must follow ICH eCTD folder naming (lowercase, hyphens)`;

      if (doc.type === "pdf") {
        const b64 = await readFileAsBase64(doc.file);
        messages = [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
          { type: "text", text: prompt }
        ]}];
      } else {
        const text = await doc.file.text().catch(() => `Filename: ${doc.name}`);
        messages = [{ role: "user", content: `${prompt}\n\nDocument text:\n${text.slice(0, 3000)}` }];
      }

      const raw = await callClaude(messages, `You are an expert pharmaceutical regulatory affairs specialist with deep knowledge of ICH CTD/eCTD guidelines and LORENZ docuBridge submission standards. Classify documents into CTD Modules 1-5. Use ICH controlled vocabulary and eCTD v3.2.2 file naming conventions. Return ONLY valid JSON.`);
      let meta;
      try {
        meta = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch (e) {
        meta = { moduleId: 1, documentType: "Unknown", keyFindings: raw.slice(0, 200), operation: "new" };
      }

      setDocuments((p) => p.map((d) => d.id === doc.id ? { ...d, analyzed: true, moduleId: meta.moduleId, metadata: meta, status: "analyzed" } : d));
      addLog(`✓ ${doc.name} → ${CTD_MODULES.find((m) => m.id === meta.moduleId)?.label} [op: ${meta.operation || "new"}]`, "success");
      if (meta.regulatoryFlags?.length) {
        setValidationIssues((p) => [...p, ...meta.regulatoryFlags.map((f) => ({ doc: doc.name, flag: f }))]);
      }
    } catch (err) {
      addLog(`✗ Error: ${err.message}`, "error");
    } finally { setAnalyzing(null); }
  }, []);

  const generateDossier = useCallback(async () => {
    setGenerating(true); setActiveTab("dossier");
    addLog("Generating CTD dossier + docuBridge export...", "info");
    const analyzedDocs = documents.filter((d) => d.analyzed && d.metadata);
    const metaSummary = analyzedDocs.map((d) => JSON.stringify(d.metadata)).join("\n\n");
    try {
      addLog("Generating QOS (Module 2.3)...", "info");
      const qos = await callClaude([{ role: "user", content: `Generate a Quality Overall Summary (Module 2.3) in formal regulatory language for FDA/EMA submission.\n\nDocument metadata:\n${metaSummary}` }],
        "You are a senior regulatory affairs writer. Write formal ICH-compliant regulatory summaries.");
      addLog("Generating Nonclinical Overview (Module 2.4)...", "info");
      const nonclinical = await callClaude([{ role: "user", content: `Generate a Nonclinical Overview (Module 2.4) covering pharmacology, PK, toxicology per ICH M4S.\n\nDocument metadata:\n${metaSummary}` }],
        "You are a senior regulatory affairs writer specializing in nonclinical summaries.");
      addLog("Generating Clinical Overview (Module 2.5)...", "info");
      const clinical = await callClaude([{ role: "user", content: `Generate a Clinical Overview (Module 2.5) covering efficacy, safety, benefit-risk per ICH E3.\n\nDocument metadata:\n${metaSummary}` }],
        "You are a senior regulatory affairs writer specializing in clinical summaries.");

      const structure = CTD_MODULES.map((mod) => ({ ...mod, docs: analyzedDocs.filter((d) => d.moduleId === mod.id) }));
      const metaTable = analyzedDocs.map((d) => ({
        "eCTD File": toEctdFilename(d.name),
        "Module": `M${d.moduleId}`,
        "Type": d.metadata?.documentType || "-",
        "Drug": d.metadata?.drugSubstanceName || "-",
        "Dosage Form": d.metadata?.dosageForm || "-",
        "Route": d.metadata?.routeOfAdministration || "-",
        "Operation": d.metadata?.operation || "new",
        "eCTD Path": d.metadata?.ectdSection || CTD_MODULES.find((m) => m.id === d.moduleId)?.ectdPath || "-",
      }));

      const indexXML = generateIndexXML(analyzedDocs, appInfo);
      const manifestCSV = generateManifestCSV(analyzedDocs, appInfo);

      setDossier({ qos, nonclinical, clinical, structure, metaTable, indexXML, manifestCSV });
      addLog("✓ Dossier + docuBridge export ready", "success");
    } catch (err) {
      addLog(`✗ Failed: ${err.message}`, "error");
    } finally { setGenerating(false); }
  }, [documents, appInfo]);

  const analyzedCount = documents.filter((d) => d.analyzed).length;
  const canGenerate = analyzedCount > 0 && !generating;
  const filteredDocs = activeModule ? documents.filter((d) => d.moduleId === activeModule) : documents;

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Calibri', Arial, sans-serif", background: THEME.bg, height: "100vh", color: THEME.text, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#F0F0F0; }
        ::-webkit-scrollbar-thumb { background:#C0C0C0; border-radius:3px; }
        input[type=text] { background:#FFFFFF; border:1px solid #D4D4D4; color:#1E1E1E;
          padding:6px 10px; border-radius:3px; font-size:12px; font-family:"Segoe UI",sans-serif; width:100%;
          box-shadow:inset 0 1px 2px rgba(0,0,0,0.08); }
        input[type=text]:focus { border-color:#2B579A; outline:none; box-shadow:0 0 0 2px #2B579A22; }
        select { background:#FFFFFF; border:1px solid #D4D4D4; color:#1E1E1E;
          padding:6px 10px; border-radius:3px; font-size:12px; font-family:"Segoe UI",sans-serif;
          box-shadow:inset 0 1px 2px rgba(0,0,0,0.06); }
        select:focus { border-color:#2B579A; outline:none; }
      `}</style>

      {/* ── TITLE BAR ── */}
      <div style={{ background: THEME.ribbon, borderBottom: `1px solid ${THEME.ribbonDark}`,
        padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 46,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        </div>


        <div style={{ flex: 1 }} />
        {/* Tab navigation — right-aligned like docuBridge ribbon tabs */}
        <div style={{ display: "flex", gap: 0, height: "100%", alignItems: "stretch" }}>
          {["upload", "dossier", "export", "plcm", "validation", "log"].map((tab) => {
            const LABELS = {
              upload:     "📤 Upload",
              dossier:    "📁 Dossier",
              "export":   "⬇ Export",
              plcm:       "🔄 PLCM",
              validation: validationIssues.length > 0 ? "⚠ Validation" : "✓ Validation",
              log:        "📋 Log",
            };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "0 14px", border: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "3px solid #fff" : "3px solid transparent",
                borderTop: "3px solid transparent",
                background: activeTab === tab ? "rgba(255,255,255,0.18)" : "transparent",
                color: activeTab === tab ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                fontWeight: activeTab === tab ? 700 : 500, fontSize: 11, letterSpacing: "0.04em",
                fontFamily: "'Segoe UI', sans-serif", transition: "all 0.12s",
              }}>
                {LABELS[tab] || tab}
              </button>
            );
          })}
        </div>

      </div>

      {/* ── RIBBON (docuBridge-style grouped toolbar) ── */}
      <div style={{ background: "#F3F3F3", borderBottom: "1px solid #C8C8C8", display: "flex", alignItems: "stretch", flexShrink: 0, userSelect: "none" }}>

        {/* GROUP: Outline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 8px 2px" }}>
            <button onClick={() => setOutlineCollapsed(p => !p)}
              title={outlineCollapsed ? "Show Outline Panel" : "Hide Outline Panel"}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px",
                background: !outlineCollapsed ? "#DDEEFF" : "transparent",
                border: !outlineCollapsed ? "1px solid #A8C4E0" : "1px solid transparent",
                borderRadius: 3, cursor: "pointer", minWidth: 44 }}
              onMouseEnter={e => e.currentTarget.style.background=!outlineCollapsed?"#CCDDEf":"#E8E8E8"}
              onMouseLeave={e => e.currentTarget.style.background=!outlineCollapsed?"#DDEEFF":"transparent"}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="6" height="16" rx="1" fill={!outlineCollapsed ? "#2B579A" : "#888"} opacity="0.8"/>
                <rect x="9" y="1" width="8" height="3" rx="1" fill="#888"/>
                <rect x="9" y="6" width="8" height="3" rx="1" fill="#888"/>
                <rect x="9" y="11" width="8" height="3" rx="1" fill="#888"/>
              </svg>
              <span style={{ fontSize: 9, color: !outlineCollapsed ? THEME.accent : "#666" }}>{outlineCollapsed ? "Show" : "Hide"}</span>
            </button>
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Outline</div>
        </div>

        {/* GROUP: Content */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "4px 6px 2px" }}>
            {[
              { icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="10" rx="1" fill="#DDD" stroke="#AAA" strokeWidth="1"/><rect x="1" y="1" width="6" height="10" rx="1" fill="#A0C4F0"/><rect x="1" y="12" width="14" height="3" rx="1" fill="#EEE" stroke="#CCC" strokeWidth="0.5"/></svg>
                ), label: "Current Pane", onClick: () => {} },
              { icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="10" rx="1" fill="#DDD" stroke="#AAA" strokeWidth="1"/><rect x="9" y="1" width="6" height="10" rx="1" fill="#DDD" stroke="#AAA" strokeWidth="1"/><rect x="1" y="12" width="14" height="3" rx="1" fill="#EEE" stroke="#CCC" strokeWidth="0.5"/></svg>
                ), label: "New Pane", onClick: () => {} },
              { icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" fill="#E53935" opacity="0.85"/><text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fff" fontFamily="Arial">PDF</text></svg>
                ), label: "Native View", onClick: () => {} },
              { icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ), label: "Switch", onClick: () => {} },
            ].map(({ icon, label, onClick }) => (
              <button key={label} onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "4px 8px", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 42 }}
                onMouseEnter={e => { e.currentTarget.style.background="#E0E8F4"; e.currentTarget.style.borderColor="#B8CCE4"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}>
                {icon}
                <span style={{ fontSize: 9, color: "#555", whiteSpace: "nowrap" }}>{label}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Content</div>
        </div>

        {/* GROUP: Upload */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "4px 6px 2px" }}>
            <button onClick={() => toggleRibbonPanel("upload")}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "4px 12px", background: ribbonPanel === "upload" ? "#E0EEF8" : documents.length > 0 ? "#EAF2FF" : "transparent",
                border: ribbonPanel === "upload" ? "1px solid #7EAAD4" : documents.length > 0 ? "1px solid #A8C4E0" : "1px solid transparent",
                borderRadius: 3, cursor: "pointer", minWidth: 52 }}
              onMouseEnter={e => { e.currentTarget.style.background="#D0E4F8"; e.currentTarget.style.borderColor="#7EAAD4"; }}
              onMouseLeave={e => { e.currentTarget.style.background=ribbonPanel==="upload"?"#E0EEF8":documents.length>0?"#EAF2FF":"transparent"; e.currentTarget.style.borderColor=ribbonPanel==="upload"?"#7EAAD4":documents.length>0?"#A8C4E0":"transparent"; }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 12V4M9 4L5.5 7.5M9 4L12.5 7.5" stroke={documents.length > 0 ? "#2B579A" : "#666"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="13" width="14" height="2.5" rx="1" fill={documents.length > 0 ? "#2B579A" : "#999"}/>
              </svg>
              <span style={{ fontSize: 9, color: documents.length > 0 ? THEME.accent : "#666", fontWeight: documents.length > 0 ? 700 : 400 }}>
                {documents.length > 0 ? `${documents.length} Doc${documents.length > 1 ? "s" : ""}` : "Upload"}
              </span>
            </button>
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Documents</div>
        </div>

        {/* GROUP: Guidelines */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "4px 6px 2px" }}>
            <button onClick={() => toggleRibbonPanel("guidelines")}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "4px 12px", background: ribbonPanel === "guidelines" ? "#E8F5E8" : guidelines.length > 0 ? "#F0FAF0" : "transparent",
                border: ribbonPanel === "guidelines" ? "1px solid #8BC88B" : guidelines.length > 0 ? "1px solid #B8DCB8" : "1px solid transparent",
                borderRadius: 3, cursor: "pointer", minWidth: 52 }}
              onMouseEnter={e => { e.currentTarget.style.background="#D8EFD8"; e.currentTarget.style.borderColor="#8BC88B"; }}
              onMouseLeave={e => { e.currentTarget.style.background=ribbonPanel==="guidelines"?"#E8F5E8":guidelines.length>0?"#F0FAF0":"transparent"; e.currentTarget.style.borderColor=ribbonPanel==="guidelines"?"#8BC88B":guidelines.length>0?"#B8DCB8":"transparent"; }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="1" width="11" height="14" rx="1.5" fill={guidelines.length > 0 ? "#E8F5E8" : "#F0F0F0"} stroke={guidelines.length > 0 ? "#107C10" : "#AAA"} strokeWidth="1.1"/>
                <path d="M15 5l2 2-6 6-3 1 1-3 6-6z" fill={guidelines.length > 0 ? "#107C10" : "#AAA"} opacity="0.8"/>
                <line x1="5" y1="5.5" x2="10" y2="5.5" stroke={guidelines.length > 0 ? "#107C10" : "#CCC"} strokeWidth="0.8"/>
                <line x1="5" y1="8" x2="10" y2="8" stroke={guidelines.length > 0 ? "#107C10" : "#CCC"} strokeWidth="0.8"/>
                <line x1="5" y1="10.5" x2="8" y2="10.5" stroke={guidelines.length > 0 ? "#107C10" : "#CCC"} strokeWidth="0.8"/>
              </svg>
              <span style={{ fontSize: 9, color: guidelines.length > 0 ? "#107C10" : "#666", fontWeight: guidelines.length > 0 ? 700 : 400 }}>
                {guidelines.length > 0 ? `${guidelines.length} Guide${guidelines.length > 1 ? "s" : ""}` : "Guidelines"}
              </span>
            </button>
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Reg. Guidelines</div>
        </div>

        {/* GROUP: Generate Dossier */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "4px 6px 2px" }}>
            <button onClick={() => canGenerate ? toggleRibbonPanel("generate") : null} disabled={!canGenerate}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "4px 14px", background: ribbonPanel === "generate" ? "#D0E4F8" : canGenerate ? "#EAF2FF" : "transparent",
                border: ribbonPanel === "generate" ? "1px solid #7EAAD4" : canGenerate ? "1px solid #A8C4E0" : "1px solid transparent",
                borderRadius: 3, cursor: canGenerate ? "pointer" : "default", minWidth: 60, opacity: canGenerate ? 1 : 0.45 }}
              onMouseEnter={e => { if(canGenerate){ e.currentTarget.style.background="#D0E4F8"; e.currentTarget.style.borderColor="#7EAAD4"; }}}
              onMouseLeave={e => { if(canGenerate){ e.currentTarget.style.background=ribbonPanel==="generate"?"#D0E4F8":"#EAF2FF"; e.currentTarget.style.borderColor=ribbonPanel==="generate"?"#7EAAD4":"#A8C4E0"; }}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L9 12M9 12L5 8M9 12L13 8" stroke={canGenerate ? "#2B579A" : "#AAA"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="14" width="14" height="2.5" rx="1" fill={canGenerate ? "#2B579A" : "#CCC"}/>
              </svg>
              <span style={{ fontSize: 9, color: canGenerate ? THEME.accent : "#AAA", fontWeight: 700 }}>
                {generating ? "Building…" : "Dossier"}
              </span>
            </button>
            <button onClick={() => setActiveTab("import")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 42 }}
              onMouseEnter={e => { e.currentTarget.style.background="#E0E8F4"; e.currentTarget.style.borderColor="#B8CCE4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 11L8 3M8 3L5 6M8 3L11 6" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="12" width="12" height="2" rx="1" fill="#555"/>
              </svg>
              <span style={{ fontSize: 9, color: "#555" }}>Import</span>
            </button>
            <button onClick={() => setActiveTab("export")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 42 }}
              onMouseEnter={e => { e.currentTarget.style.background="#E0E8F4"; e.currentTarget.style.borderColor="#B8CCE4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4L8 12M8 12L5 9M8 12L11 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="2" width="12" height="2" rx="1" fill="#555"/>
              </svg>
              <span style={{ fontSize: 9, color: "#555" }}>Export</span>
            </button>
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Dossier</div>
        </div>

        {/* GROUP: Validation */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "4px 6px 2px" }}>
            <button onClick={() => setActiveTab("validation")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 10px", background: validationIssues.length > 0 ? "#FFF0F0" : "transparent",
              border: validationIssues.length > 0 ? "1px solid #F5C6C6" : "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 52 }}
              onMouseEnter={e => { e.currentTarget.style.background="#F8E0E0"; e.currentTarget.style.borderColor="#E8AABB"; }}
              onMouseLeave={e => { e.currentTarget.style.background=validationIssues.length>0?"#FFF0F0":"transparent"; e.currentTarget.style.borderColor=validationIssues.length>0?"#F5C6C6":"transparent"; }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {validationIssues.length > 0
                  ? <g><path d="M9 2L16 15H2L9 2Z" fill="#F5C6C6" stroke="#C50F1F" strokeWidth="1.2"/>
                      <path d="M9 7v4" stroke="#C50F1F" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="13.5" r="0.9" fill="#C50F1F"/></g>
                  : <g><circle cx="9" cy="9" r="7" fill="#E8F5E8" stroke="#107C10" strokeWidth="1.2"/>
                      <path d="M5.5 9L7.5 11L12.5 6" stroke="#107C10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></g>
                }
              </svg>
              <span style={{ fontSize: 9, color: validationIssues.length > 0 ? "#C50F1F" : "#107C10", fontWeight: validationIssues.length > 0 ? 700 : 400 }}>
                {validationIssues.length > 0 ? `${validationIssues.length} Issues` : "Valid"}
              </span>
            </button>
            <button onClick={() => setActiveTab("plcm")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 40 }}
              onMouseEnter={e => { e.currentTarget.style.background="#E8F0F8"; e.currentTarget.style.borderColor="#B8CCE4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 8A5 5 0 1 1 8 3" stroke="#6264A7" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 1l4 2-2 4" stroke="#6264A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 9, color: "#6264A7" }}>PLCM</span>
            </button>
            {/* ── Document Review button ── */}
            <button onClick={() => setDocReviewOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px", background: "transparent", border: "1px solid transparent", borderRadius: 3, cursor: "pointer", minWidth: 44 }}
              onMouseEnter={e => { e.currentTarget.style.background="#FFF3E0"; e.currentTarget.style.borderColor="#FFB74D"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}
              title="Open Document Review — AI-powered compliance review of any regulatory document">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="10" height="13" rx="1.5" fill="#FFF3E0" stroke="#E65100" strokeWidth="1.2"/>
                <line x1="4.5" y1="5" x2="9.5" y2="5" stroke="#E65100" strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="#E65100" strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="10" x2="7.5" y2="10" stroke="#E65100" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="13" cy="13" r="2.5" fill="#E65100"/>
                <path d="M12.3 13l.5.5 1-1" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 9, color: "#E65100", fontWeight: 600 }}>Review</span>
            </button>
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Workbench</div>
        </div>

        {/* GROUP: Window */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #D8D8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px 2px" }}>
            {[
              { label: "Attributes", key: "showAttr" },
              { label: "Seq. No.", key: "showSeq" },
            ].map(({ label, key }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, color: "#444" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: THEME.accent, width: 12, height: 12 }} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#888", textAlign: "center", padding: "1px 6px 3px", borderTop: "1px solid #DDD", background: "#EBEBEB" }}>Window</div>
        </div>

        {/* Sequence pill — right-aligned */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
            {REGION_META[appInfo.country]?.flag} {appInfo.country} &nbsp;·&nbsp; {appInfo.subType || "NDA"}
          </span>
          <div style={{ background: THEME.accent, color: "#fff", padding: "2px 12px", borderRadius: 2, fontSize: 11, fontWeight: 800, fontFamily: "monospace" }}>
            SEQ {(appInfo.sequence || "0000").padStart(4,"0")}
          </div>
        </div>
      </div>

      {/* ── RIBBON DROPDOWN PANELS ─────────────────────────────────────── */}
      {ribbonPanel && (
        <div style={{ borderBottom: "1px solid #C0C8D4", background: "#F8FAFD", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", zIndex: 50, flexShrink: 0 }}>

          {/* ── UPLOAD PANEL ── */}
          {ribbonPanel === "upload" && (
            <div style={{ display: "flex", gap: 0, minHeight: 160, maxHeight: 380, overflow: "hidden" }}>
              {/* Drop zone */}
              <div style={{ width: 280, borderRight: "1px solid #D8DDE8", padding: "14px 16px", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: THEME.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Drop Documents</div>
                <UploadZone onFiles={handleFiles} />
              </div>
              {/* Uploaded list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Uploaded Documents ({documents.length})</span>
                  {documents.filter(d => !d.analyzed).length > 0 && (
                    <button onClick={() => { const u = documents.filter(d => !d.analyzed); u.forEach((d,i) => setTimeout(() => analyzeDocument(d), i*1500)); }}
                      disabled={!!analyzing} style={{ fontSize: 9, padding: "2px 8px", background: THEME.accent, color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: 700 }}>
                      Analyze All ({documents.filter(d => !d.analyzed).length})
                    </button>
                  )}
                </div>
                {documents.length === 0 ? (
                  <div style={{ color: THEME.textDim, fontSize: 11, fontStyle: "italic", paddingTop: 20, textAlign: "center" }}>No documents uploaded yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {filteredDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} onAnalyze={analyzeDocument} analyzing={analyzing} />)}
                  </div>
                )}
              </div>
              {/* Stats sidebar */}
              <div style={{ width: 140, borderLeft: "1px solid #D8DDE8", padding: "14px 14px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: "monospace", lineHeight: 1 }}>{analyzedCount}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>Analyzed</div>
                </div>
                <div style={{ height: 1, background: THEME.border }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: THEME.textMuted, fontFamily: "monospace", lineHeight: 1 }}>{documents.length}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>Total</div>
                </div>
                <button onClick={() => { setRibbonPanel(null); }} style={{ marginTop: "auto", fontSize: 10, padding: "4px 8px",
                  background: "#F0F0F0", border: "1px solid #DDD", borderRadius: 3, cursor: "pointer", color: "#666" }}>Close</button>
              </div>
            </div>
          )}

          {/* ── GUIDELINES PANEL ── */}
          {ribbonPanel === "guidelines" && (
            <div style={{ display: "flex", gap: 0, minHeight: 140, maxHeight: 360, overflow: "hidden" }}>
              {/* Upload / manage guidelines */}
              <div style={{ width: 380, borderRight: "1px solid #D8DDE8", padding: "14px 16px", flexShrink: 0, overflowY: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#107C10", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Regulatory Guidelines</span>
                  <button onClick={() => guidelineInputRef.current?.click()} style={{ fontSize: 9, padding: "2px 8px", background: "#107C10", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: 700, marginLeft: "auto" }}>+ Add PDF</button>
                  <input ref={guidelineInputRef} type="file" multiple accept=".pdf,.txt,.docx,.doc" style={{ display: "none" }} onChange={(e) => handleGuidelineUpload(e.target.files)} />
                </div>
                {guidelines.length === 0 ? (
                  <div onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleGuidelineUpload(e.dataTransfer.files); }}
                    onClick={() => guidelineInputRef.current?.click()}
                    style={{ border: "1.5px dashed #B8DCB8", borderRadius: 4, padding: "18px 12px", textAlign: "center",
                      cursor: "pointer", color: "#888", fontSize: 11, background: "#FAFFF8" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📋</div>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>Drop FDA / EMA / CDSCO / PMDA guidance PDFs</div>
                    <div style={{ fontSize: 10, color: "#AAA" }}>AI extracts required documents and adds them to the checklist</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {guidelines.map(gl => (
                      <div key={gl.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                        background: gl.status === "done" ? "#F0F7F0" : gl.status === "error" ? "#FFF0F0" : "#FFF8E8",
                        borderRadius: 4, border: `1px solid ${gl.status === "done" ? "#C8E6C8" : gl.status === "error" ? "#F5C6C6" : "#FAD9A1"}` }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{gl.status === "parsing" ? "⏳" : gl.status === "done" ? "✅" : "❌"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gl.name}</div>
                          <div style={{ fontSize: 9, color: THEME.textMuted }}>{gl.status === "parsing" ? "Parsing with AI…" : gl.status === "done" ? `✓ +${gl.requirements.length} requirements added to checklist` : "Parse failed — try a different file"}</div>
                        </div>
                        <button onClick={() => removeGuideline(gl.id)} style={{ background: "transparent", border: "none", color: "#AAA", cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>
                      </div>
                    ))}
                    <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleGuidelineUpload(e.dataTransfer.files); }}
                      onClick={() => guidelineInputRef.current?.click()}
                      style={{ border: "1px dashed #CCC", borderRadius: 3, padding: "5px", textAlign: "center", cursor: "pointer", color: "#AAA", fontSize: 10, background: "#FAFAFA" }}>
                      + Add another guideline
                    </div>
                  </div>
                )}
              </div>
              {/* Active custom requirements summary */}
              <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Custom Requirements Active in Checklist
                </div>
                {Object.values(customReqs).flat().length === 0 ? (
                  <div style={{ fontSize: 11, color: THEME.textDim, fontStyle: "italic", textAlign: "center", paddingTop: 20 }}>
                    No custom requirements yet.<br/>Upload a guideline PDF to extract them.
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#107C10", fontWeight: 700 }}>📎 {Object.values(customReqs).flat().length} requirements active</span>
                      <button onClick={() => { setCustomReqs({}); setGuidelines([]); }} style={{ fontSize: 9, padding: "2px 6px", background: "transparent", border: "1px solid #F5C6C6", color: THEME.red, borderRadius: 3, cursor: "pointer" }}>Clear All</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {Object.values(customReqs).flat().slice(0, 20).map((r, i) => (
                        <div key={i} style={{ fontSize: 10, padding: "3px 8px", background: "#F0F7F0", border: "1px solid #C8E6C8", borderRadius: 3, color: THEME.text }}>
                          <span style={{ fontFamily: "monospace", color: "#107C10", marginRight: 6 }}>§{r.section}</span>{r.title}
                        </div>
                      ))}
                      {Object.values(customReqs).flat().length > 20 && (
                        <div style={{ fontSize: 10, color: THEME.textMuted, textAlign: "center" }}>…and {Object.values(customReqs).flat().length - 20} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ width: 100, borderLeft: "1px solid #D8DDE8", padding: "14px 10px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#107C10", fontFamily: "monospace" }}>{guidelines.length}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>Guides</div>
                </div>
                <div style={{ height: 1, background: THEME.border, width: "100%" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: THEME.accent, fontFamily: "monospace" }}>{Object.values(customReqs).flat().length}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>Custom Reqs</div>
                </div>
                <button onClick={() => setRibbonPanel(null)} style={{ marginTop: "auto", fontSize: 10, padding: "4px 8px", background: "#F0F0F0", border: "1px solid #DDD", borderRadius: 3, cursor: "pointer", color: "#666" }}>Close</button>
              </div>
            </div>
          )}

          {/* ── GENERATE DOSSIER PANEL ── */}
          {ribbonPanel === "generate" && (
            <div style={{ display: "flex", gap: 0, minHeight: 120 }}>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
                {/* Stats */}
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  {[
                    { val: analyzedCount, label: "Analyzed", color: THEME.green },
                    { val: documents.length, label: "Total Docs", color: THEME.textMuted },
                    { val: Object.values(checkedDocs).filter(Boolean).length, label: "Checked Off", color: THEME.accent },
                  ].map(({ val, label, color }) => (
                    <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 10, color: THEME.textMuted }}>{label}</div>
                    </div>
                  ))}
                </div>
                {/* Divider */}
                <div style={{ width: 1, alignSelf: "stretch", background: THEME.border }} />
                {/* Generate CTA */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, marginBottom: 4 }}>
                    ⚡ Generate CTD Dossier
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
                    AI will build Module 2 summaries (QOS, Nonclinical Overview, Clinical Overview) from your uploaded and analyzed documents, and generate an eCTD index.xml.
                  </div>
                  <GlowButton onClick={() => { generateDossier(); setRibbonPanel(null); }} disabled={!canGenerate} style={{ fontSize: 13, padding: "10px 28px" }}>
                    {generating ? <><Spinner /> Generating…</> : "⚡ Generate Dossier Now"}
                  </GlowButton>
                  {!canGenerate && <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 6, fontStyle: "italic" }}>Upload and analyze at least one document first.</div>}
                </div>
              </div>
              <div style={{ width: 80, borderLeft: "1px solid #D8DDE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button onClick={() => setRibbonPanel(null)} style={{ fontSize: 10, padding: "4px 8px", background: "#F0F0F0", border: "1px solid #DDD", borderRadius: 3, cursor: "pointer", color: "#666" }}>Close</button>
              </div>
            </div>
          )}

        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── OUTLINE PANEL (persistent, docuBridge-style) ── */}
        {!outlineCollapsed && (() => {
          const reqDocs = getMergedRequirements(appInfo.country, appInfo.productCategory || "ALL", appInfo.subType || "NDA");
          const totalRequired = reqDocs.filter((d) => d.required).length;
          const totalChecked  = reqDocs.filter((d) => checkedDocs[`${d.module}-${d.section}`]).length;
          const totalOptional = reqDocs.filter((d) => !d.required).length;
          const pct = totalRequired > 0 ? Math.round((totalChecked / totalRequired) * 100) : 0;

          const MODULE_LABELS_O = {
            1: "1 Administrative Information and Prescribing Information",
            2: m4qMode === "R2" ? "2 CTD Summaries — M4Q(R2) Revised Structure" : "2 Common Technical Document Summaries",
            3: m4qMode === "R2" ? "3 Quality — DMCS Template (M4Q(R2))" : "3 Quality",
            4: "4 Nonclinical Study Reports",
            5: "5 Clinical Study Reports",
          };

          const FOLDER_LABELS_O = {
            "1":"1 Administrative Information","1.1":"1.1 Table of Contents","1.2":"1.2 Application Forms","1.3":"1.3 Product Information",
            "1.4":"1.4 Expert Information","1.5":"1.5 Regional Requirements","1.6":"1.6 Environmental Risk Assessment",
            // ── CDSCO India — Manufacturing & Licence section labels ──────────
            "1.MFG":"Manufacturing Licences (CDSCO)",
            "1.MFG25":"Form 25 — Mfg. Licence (Non-sterile, SLA)",
            "1.MFG25A":"Form 25-A — Mfg. Licence (Sterile/Restricted, CLA)",
            "1.MFG25B":"Form 25-B — Loan Licence (Contract Mfg.)",
            "1.MFG25D":"Form 25-D — API Mfg. Licence (CLA)",
            "1.MFG27":"Form 27 — Test Licence (R&D/Clinical)",
            "1.IMP10":"Form 10 — Import Licence (Finished Formulation)",
            "1.IMP10A":"Form 10-A — Import Licence (Raw Material/API)",
            "1.GMP":"GMP Compliance",
            "1.GMP.M":"Schedule M — GMP Compliance Certificate",
            "1.GMP.WHO":"WHO-GMP Certificate",
            "1.GMP.FDA":"cGMP — US FDA / EU EudraGMDP / PIC/S",
            "1.GMP.SMF":"Site Master File (SMF) / DMF",
            // ─────────────────────────────────────────────────────────────────
            // ── M4Q(R1) — Module 2 & 3 labels ────────────────────────────────
            "2":"2 CTD Summaries","2.3":"2.3 Quality Overall Summary","2.4":"2.4 Nonclinical Overview","2.5":"2.5 Clinical Overview",
            "2.6":"2.6 Nonclinical Summaries","2.7":"2.7 Clinical Summary",
            "3":"3 Quality","3.1":"3.1 Table of Contents","3.2":"3.2 Body of Data","3.2.S":"3.2.S Drug Substance",
            "3.2.S.1":"3.2.S.1 General Information","3.2.S.2":"3.2.S.2 Manufacture","3.2.S.3":"3.2.S.3 Characterisation",
            "3.2.S.4":"3.2.S.4 Control","3.2.S.5":"3.2.S.5 Reference Standards","3.2.S.7":"3.2.S.7 Stability",
            "3.2.P":"3.2.P Drug Product","3.2.P.1":"3.2.P.1 Description","3.2.P.2":"3.2.P.2 Development",
            "3.2.P.3":"3.2.P.3 Manufacture","3.2.P.5":"3.2.P.5 Control","3.2.P.8":"3.2.P.8 Stability",
            // ── M4Q(R2) — Module 2.3 new section structure ───────────────────
            "2.3.1":"2.3.1 General Information",
            "2.3.2":"2.3.2 Overall Development & Control Strategy",
            "2.3.2.1":"2.3.2.1 QTPP & CQAs","2.3.2.2":"2.3.2.2 Overall Development Strategy",
            "2.3.2.3":"2.3.2.3 Overall Control Strategy Representation",
            "2.3.3":"2.3.3 Core Quality Information (CQI)",
            "2.3.3.DS":"2.3.3.DS Drug Substance","2.3.3.DS.D":"2.3.3.DS.D Description",
            "2.3.3.DS.M":"2.3.3.DS.M Manufacture","2.3.3.DS.C":"2.3.3.DS.C Control",
            "2.3.3.DS.S":"2.3.3.DS.S Storage",
            "2.3.3.SI":"2.3.3.SI Substance Intermediates","2.3.3.SM":"2.3.3.SM Starting/Source Materials",
            "2.3.3.RM":"2.3.3.RM Raw Materials","2.3.3.EX":"2.3.3.EX Excipients",
            "2.3.3.RS":"2.3.3.RS Reference Standards","2.3.3.DP":"2.3.3.DP Drug Product",
            "2.3.3.DP.D":"2.3.3.DP.D Description","2.3.3.DP.M":"2.3.3.DP.M Manufacture",
            "2.3.3.DP.C":"2.3.3.DP.C Control","2.3.3.DP.S":"2.3.3.DP.S Storage",
            "2.3.3.MD":"2.3.3.MD Medical Device","2.3.3.AP":"2.3.3.AP Analytical Procedures",
            "2.3.3.FA":"2.3.3.FA Facilities",
            "2.3.4":"2.3.4 Development Summary & Justification",
            "2.3.4.IN":"2.3.4.IN Integrated Development & Justifications",
            "2.3.4.DS":"2.3.4.DS Drug Substance","2.3.4.SM":"2.3.4.SM Starting/Source Materials",
            "2.3.4.RS":"2.3.4.RS Reference Standards","2.3.4.DP":"2.3.4.DP Drug Product",
            "2.3.4.MD":"2.3.4.MD Medical Device","2.3.4.AP":"2.3.4.AP Analytical Procedures",
            "2.3.5":"2.3.5 Product Lifecycle Management",
            "2.3.5.1":"2.3.5.1 Change Summary & Justifications",
            "2.3.5.2":"2.3.5.2 PLCM Document","2.3.5.3":"2.3.5.3 PACMPs",
            "2.3.6":"2.3.6 Product Quality Benefit-Risk [optional]",
            // ── M4Q(R2) — Module 3 new two-letter material codes ─────────────
            "3.2.DS":"3.2.DS Drug Substance","3.2.DS.D":"3.2.DS.D Description",
            "3.2.DS.M":"3.2.DS.M Manufacture","3.2.DS.C":"3.2.DS.C Control",
            "3.2.DS.S":"3.2.DS.S Storage",
            "3.2.SI":"3.2.SI Substance Intermediates","3.2.SM":"3.2.SM Starting/Source Materials",
            "3.2.RM":"3.2.RM Raw Materials","3.2.EX":"3.2.EX Excipients",
            "3.2.RS":"3.2.RS Reference Standards/Materials",
            "3.2.IM":"3.2.IM Impurities",
            "3.2.DP":"3.2.DP Drug Product","3.2.DP.D":"3.2.DP.D Description",
            "3.2.DP.M":"3.2.DP.M Manufacture","3.2.DP.C":"3.2.DP.C Control",
            "3.2.DP.S":"3.2.DP.S Storage",
            "3.2.PI":"3.2.PI Product Intermediates","3.2.MD":"3.2.MD Medical Devices",
            "3.2.PM":"3.2.PM Packaged Medicinal Products","3.2.PH":"3.2.PH Pharmaceutical Product after transformation",
            "3.2.AP":"3.2.AP Analytical Procedures","3.2.FA":"3.2.FA Facilities",
            "4":"4 Nonclinical Study Reports","4.2":"4.2 Study Reports","4.2.1":"4.2.1 Pharmacology",
            "4.2.2":"4.2.2 Pharmacokinetics","4.2.3":"4.2.3 Toxicology",
            "5":"5 Clinical Study Reports","5.2":"5.2 Tabular Listing","5.3":"5.3 Clinical Study Reports",
            "5.3.1":"5.3.1 Biopharmaceutics","5.3.3":"5.3.3 PK/PD Studies","5.3.5":"5.3.5 Efficacy/Safety",
          };

          const OTreeNode = ({ section, label, depth, color, isLast, module, allDocs }) => {
            const key = "o-" + section;
            const isCol = reqDocsCollapsed[key];
            const myDocs = allDocs.filter((d) => d.section === section);
            const childSections = [...new Set(
              allDocs.filter((d) => d.section !== section && d.section.startsWith(section + "."))
                .map((d) => {
                  const rest = d.section.slice(section.length + 1);
                  const nextSeg = rest.split(".")[0];
                  return section + "." + nextSeg;
                })
            )].sort((a, b) => {
              const key = s => s.split(".").map(seg => isNaN(seg) ? seg : seg.padStart(4,"0")).join(".");
              return key(a).localeCompare(key(b));
            });
            const cc = "#B8BCC4";
            const indent = depth * 16;
            const isSelected = selectedDocNode === section;
            return (
              <div>
                <div onClick={() => { setReqDocsCollapsed((p) => ({ ...p, [key]: !p[key] })); setSelectedDocNode(section); }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none",
                    background: isSelected ? THEME.accent + "22" : "transparent",
                    borderLeft: isSelected ? "3px solid " + THEME.accent : "3px solid transparent",
                  }}>
                  <div style={{ width: indent + 20, flexShrink: 0, display: "flex", alignItems: "stretch" }}>
                    {depth > 0 && Array.from({ length: depth }).map((_, i) => (
                      <div key={i} style={{ width: 16, display: "flex", justifyContent: "center" }}>
                        <div style={{ width: 1, background: cc, minHeight: 20 }} />
                      </div>
                    ))}
                    <div style={{ width: 20, position: "relative", height: 20, display: "flex", alignItems: "center" }}>
                      {depth > 0 && <><div style={{ position: "absolute", left: 0, top: 0, bottom: "50%", width: 1, background: cc }} />
                      {!isLast && <div style={{ position: "absolute", left: 0, top: "50%", bottom: 0, width: 1, background: cc }} />}
                      <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: cc }} /></>}
                    </div>
                  </div>
                  <span style={{ fontSize: 8, color: "#888", width: 10, textAlign: "center", flexShrink: 0 }}>{isCol ? "▶" : "▼"}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, margin: "0 4px" }}>
                    <path d="M1 3.5a1 1 0 011-1h3.5l1.5 1.5H12a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1v-6.5z" fill={isCol ? "#BBBFC8" : "#D0D4DC"}/>
                    {!isCol && <path d="M1 6h12" stroke="#B0B4BC" strokeWidth="0.7"/>}
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: depth === 0 ? 700 : 500, color: isSelected ? THEME.accent : (depth === 0 ? color : THEME.text), flex: 1, padding: "3px 4px 3px 0", lineHeight: 1.3 }}>
                    {label || FOLDER_LABELS_O[section] || section}
                  </span>
                </div>
                {!isCol && (
                  <div>
                    {myDocs.map((doc, di) => {
                      const docKey = module + "-" + doc.section;
                      const checked = !!checkedDocs[docKey];
                      const isDSel = selectedDocNode === docKey;
                      return (
                        <div key={docKey} onClick={() => { setCheckedDocs((p) => ({ ...p, [docKey]: !p[docKey] })); setSelectedDocNode(docKey); }}
                          style={{ display: "flex", alignItems: "center", cursor: "pointer",
                            background: isDSel ? THEME.accent + "18" : checked ? color + "10" : "transparent",
                            borderLeft: isDSel ? "3px solid " + THEME.accent : "3px solid transparent",
                          }}>
                          <div style={{ width: (depth+1)*16 + 20, flexShrink: 0, display: "flex", alignItems: "stretch" }}>
                            {Array.from({ length: depth+1 }).map((_, i) => (
                              <div key={i} style={{ width: 16, display: "flex", justifyContent: "center" }}>
                                <div style={{ width: 1, background: cc, minHeight: 20 }} />
                              </div>
                            ))}
                            <div style={{ width: 20, position: "relative", height: 20 }}>
                              <div style={{ position: "absolute", left: 0, top: 0, bottom: "50%", width: 1, background: cc }} />
                              {!(di === myDocs.length - 1 && childSections.length === 0) && <div style={{ position: "absolute", left: 0, top: "50%", bottom: 0, width: 1, background: cc }} />}
                              <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: cc }} />
                            </div>
                          </div>
                          <span style={{ flexShrink: 0, marginRight: 4, display: "flex", alignItems: "center" }}>
                            {checked
                              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#107C10" opacity="0.15"/><path d="M3 6l2 2 4-4" stroke="#107C10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              : doc.required
                                ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1" fill="#fff" stroke="#9BAFD0" strokeWidth="1"/><line x1="3.5" y1="4" x2="8.5" y2="4" stroke="#C0CADE" strokeWidth="0.8"/><line x1="3.5" y1="6" x2="8.5" y2="6" stroke="#C0CADE" strokeWidth="0.8"/><line x1="3.5" y1="8" x2="6.5" y2="8" stroke="#C0CADE" strokeWidth="0.8"/></svg>
                                : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1" fill="#FAFAFA" stroke="#D0D0D0" strokeWidth="1" strokeDasharray="2 1"/><line x1="3.5" y1="5" x2="8.5" y2="5" stroke="#DDD" strokeWidth="0.8"/><line x1="3.5" y1="7" x2="7" y2="7" stroke="#DDD" strokeWidth="0.8"/></svg>
                            }
                          </span>
                          <div style={{ flex: 1, minWidth: 0, padding: "3px 6px 3px 0" }}>
                            <div style={{ fontSize: 10, color: isDSel ? THEME.accent : checked ? THEME.textMuted : THEME.text,
                              textDecoration: checked ? "line-through" : "none",
                              fontWeight: doc.required ? 600 : 400, lineHeight: 1.3,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              [{(appInfo.sequence || "0000").padStart(4,"0")}] {doc.title}
                            </div>
                            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#AAA" }}>{doc.section}</div>
                          </div>
                        </div>
                      );
                    })}
                    {childSections.map((cs, ci) => (
                      <OTreeNode key={cs} section={cs} label={FOLDER_LABELS_O[cs] || cs}
                        depth={depth+1} color={color} isLast={ci === childSections.length-1} module={module} allDocs={allDocs} />
                    ))}
                  </div>
                )}
              </div>
            );
          };

          const ectdPathsO = { 1:"m1/", 2:"m2/", 3:"m3/32/", 4:"m4/42/", 5:"m5/53/" };

          return (
            <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid #C8CDD6",
              display: "flex", flexDirection: "column", background: "#F5F6F8", overflow: "hidden",
              boxShadow: "2px 0 6px rgba(0,0,0,0.06)" }}>
              {/* Current Outline header */}
              <div style={{ background: "#3D5A8A", color: "#FFF", padding: "6px 10px",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, flex: 1, fontFamily: "'Segoe UI', sans-serif" }}>Current Outline</span>
                {/* M4Q Version Toggle */}
                <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.25)", borderRadius: 4, padding: "1px 2px", gap: 1 }}>
                  <button onClick={() => setM4qMode("R1")} title="ICH M4Q(R1) — Current standard" style={{
                    padding: "2px 7px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                    background: m4qMode === "R1" ? "#fff" : "transparent",
                    color: m4qMode === "R1" ? "#1F3A8A" : "rgba(255,255,255,0.6)",
                    transition: "all 0.15s",
                  }}>R1</button>
                  <button onClick={() => setM4qMode("R2")} title="ICH M4Q(R2) — June 2027 adoption" style={{
                    padding: "2px 7px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                    background: m4qMode === "R2" ? "#C17900" : "transparent",
                    color: m4qMode === "R2" ? "#fff" : "rgba(255,255,255,0.6)",
                    transition: "all 0.15s",
                  }}>R2</button>
                </div>
                <button onClick={() => setOutlineCollapsed(true)} style={{ background: "rgba(255,255,255,0.2)",
                  border: "none", color: "#FFF", cursor: "pointer", padding: "1px 6px", borderRadius: 2, fontSize: 11 }}>✕</button>
              </div>

              {/* M4Q(R2) amber banner */}
              {m4qMode === "R2" && (
                <div style={{ background: "#FFF3CD", borderBottom: "2px solid #C17900", padding: "6px 10px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#7A4700" }}>ICH M4Q(R2) — DRAFT PREVIEW</div>
                      <div style={{ fontSize: 9, color: "#8A5200", lineHeight: 1.4 }}>
                        Modules 2 &amp; 3 reflect the revised structure.<br/>
                        Final adoption expected <strong>June 2027</strong>. Not for live submissions.
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 5, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <span style={{ background: "#C17900", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>§2.3.2 OCS/QTPP</span>
                    <span style={{ background: "#C17900", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>§2.3.3 CQI by material</span>
                    <span style={{ background: "#C17900", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>DMCS template</span>
                    <span style={{ background: "#C17900", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>3.2.DS/DP new codes</span>
                  </div>
                </div>
              )}

              {/* docuBridge-style zoom slider */}
              <div style={{ background: "#EAEDF2", borderBottom: "1px solid #D0D0D0", padding: "4px 10px",
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <input type="range" min={30} max={100} defaultValue={65} style={{ flex: 1, height: 3, accentColor: THEME.accent, cursor: "pointer" }} />
              </div>

              {/* Navigation input row — exact docuBridge style */}
              <div style={{ background: "#F2F4F8", borderBottom: "1px solid #D0D0D0", padding: "4px 8px",
                display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {/* Seq number box */}
                <div style={{ background: "#fff", border: "1px solid #B8BCC8", borderRadius: 2, padding: "1px 6px",
                  fontFamily: "monospace", fontWeight: 800, fontSize: 11, color: THEME.accent, minWidth: 40, textAlign: "center" }}>
                  {(appInfo.sequence || "0000").padStart(4,"0")}
                </div>
                <div style={{ width: 1, height: 16, background: "#CCC" }} />
                {/* Checked/Required as page-range style */}
                <div style={{ background: "#fff", border: "1px solid #B8BCC8", borderRadius: 2, padding: "1px 6px",
                  fontFamily: "monospace", fontSize: 10, color: "#555", minWidth: 36, textAlign: "center" }}>
                  {totalChecked} - {totalRequired}
                </div>
                <div style={{ width: 1, height: 16, background: "#CCC" }} />
                {/* Progress */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, height: 4, background: "#D0D0D0", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: pct === 100 ? THEME.green : THEME.accent, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: pct === 100 ? THEME.green : THEME.accent, fontWeight: 700, minWidth: 28, textAlign: "right" }}>{pct}%</span>
                </div>
                <button onClick={() => setCheckedDocs({})} style={{ background: "transparent", border: "1px solid #CCC",
                  padding: "1px 5px", borderRadius: 2, cursor: "pointer", fontSize: 9, color: "#888" }}>↺</button>
              </div>

              {/* App identity bar */}
              <div style={{ background: "#EEF1F7", borderBottom: "1px solid #D8DBE2", padding: "4px 10px",
                fontSize: 10, fontFamily: "'Segoe UI', sans-serif", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: THEME.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {appInfo.appNumber || "[Application Number]"}
                  {appInfo.applicant ? " — " + appInfo.applicant : ""}
                </div>
                <div style={{ color: "#888", fontSize: 9 }}>
                  {REGION_META[appInfo.country]?.flag} {appInfo.country} · {appInfo.subType || "NDA"}
                  {appInfo.registrationType === "plcm" ? " · PLCM" : " · New"}
                </div>
              </div>

              {/* Tree */}
              <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>

                {/* ══ PHARMACOVIGILANCE ════════════════════════════════════════ */}
                {appInfo.appType === "pv" && (
                  <div>
                    <div style={{ background: "linear-gradient(90deg, #880E4F 0%, #AD1457 100%)", color: "#fff", padding: "8px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>🛡️ Pharmacovigilance</div>
                      <div style={{ fontSize: 9, opacity: 0.85 }}>ICH E2A · E2B · E2C(R2) · E2D · E2E · E2F · GVP Modules I–XVI</div>
                    </div>
                    <div style={{ padding: "24px 16px", textAlign: "center", color: THEME.textMuted }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#880E4F" }}>
                        {appInfo.subType ? appInfo.subType + " Checklist" : "Select PV Activity"}
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.5 }}>
                        {appInfo.subType
                          ? "PV document checklist coming soon for " + appInfo.subType + "."
                          : "Choose a Pharmacovigilance activity above to see the required document checklist."}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ CLINICAL TRIAL PERMISSION CHECKLIST (IN CT-04) ═══════════ */}
                {(appInfo.appType === "clinical" || (appInfo.appType === "product" && appInfo.country === "IN" && appInfo.subType === "CT-IN")) && (() => {
                  const ctDocs = getCTPermissionDocuments(appInfo.country, appInfo.subType);
                  const cats = [...new Set(ctDocs.map(d => d.cat))];
                  const totalReq = ctDocs.filter(d => d.required).length;
                  const totalDone = ctDocs.filter(d => checkedDocs["ct-" + d.id]).length;
                  return (
                    <div>
                      {/* Header */}
                      <div style={{ background: "linear-gradient(90deg, #1A237E 0%, #283593 100%)", color: "#fff", padding: "8px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>🔬 CT Permission — Form CT-04</div>
                        <div style={{ fontSize: 9, opacity: 0.85 }}>New Drugs & Clinical Trials Rules, 2019 · CDSCO Central Licensing Authority</div>
                      </div>
                      <div style={{ background: "#E8EAF6", borderBottom: "1px solid #C5CAE9", padding: "4px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 9, color: "#283593", fontWeight: 700, flex: 1 }}>CTRI pre-registration mandatory before submission</span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color: "#1A237E", fontWeight: 700 }}>{totalDone}/{totalReq}</span>
                      </div>

                      {/* Categories */}
                      {cats.map(cat => {
                        const meta = CT_CAT_META[cat] || { label: cat, icon: "📁", color: "#555" };
                        const catDocs = ctDocs.filter(d => d.cat === cat);
                        const catKey = "ct-cat-" + cat;
                        const isCol = reqDocsCollapsed[catKey];
                        const catDone = catDocs.filter(d => checkedDocs["ct-" + d.id]).length;
                        const catReq = catDocs.filter(d => d.required).length;
                        return (
                          <div key={cat}>
                            <div onClick={() => setReqDocsCollapsed(p => ({ ...p, [catKey]: !p[catKey] }))}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", cursor: "pointer",
                                background: meta.color + "10", borderBottom: "1px solid " + meta.color + "22" }}>
                              <span style={{ fontSize: 8, color: "#666", width: 10 }}>{isCol ? "▶" : "▼"}</span>
                              <span style={{ fontSize: 12 }}>{meta.icon}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, flex: 1 }}>{meta.label}</span>
                              <span style={{ fontSize: 9, fontFamily: "monospace", color: catDone === catReq ? THEME.green : THEME.textDim }}>
                                {catDone}/{catReq}
                              </span>
                            </div>
                            {!isCol && catDocs.map((doc) => {
                              const dk = "ct-" + doc.id;
                              const ch = !!checkedDocs[dk];
                              const iDS = selectedDocNode === dk;
                              return (
                                <div key={dk} onClick={() => { setCheckedDocs(p => ({ ...p, [dk]: !p[dk] })); setSelectedDocNode(dk); }}
                                  style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", padding: "5px 6px 5px 24px",
                                    background: iDS ? meta.color + "18" : ch ? meta.color + "08" : "transparent",
                                    borderLeft: iDS ? "3px solid " + meta.color : "3px solid transparent",
                                    borderBottom: "1px solid " + THEME.border + "55" }}>
                                  <span style={{ flexShrink: 0, marginRight: 6, marginTop: 2 }}>
                                    {ch
                                      ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill={meta.color} opacity="0.15"/><path d="M3.5 6.5l2 2 4-4" stroke={meta.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      : doc.required
                                        ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="10" height="11" rx="1.2" fill="#fff" stroke={meta.color} strokeWidth="1" opacity="0.7"/><line x1="4" y1="5" x2="9" y2="5" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/><line x1="4" y1="7" x2="9" y2="7" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/><line x1="4" y1="9" x2="7" y2="9" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/></svg>
                                        : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="10" height="11" rx="1.2" fill="#F8F8F8" stroke="#CCC" strokeWidth="0.8" strokeDasharray="2 1"/></svg>
                                    }
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: doc.required ? 600 : 400,
                                      color: iDS ? meta.color : ch ? THEME.textMuted : THEME.text,
                                      textDecoration: ch ? "line-through" : "none",
                                      lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {doc.title}
                                    </div>
                                    <div style={{ fontSize: 9, color: "#AAA", fontFamily: "monospace", display: "flex", gap: 6 }}>
                                      {doc.form && <span style={{ color: meta.color, fontWeight: 700 }}>{doc.form}</span>}
                                      <span>{doc.required ? "Required" : "Recommended"}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ══ SITE REGISTRATION CHECKLIST ══════════════════════════════ */}
                {appInfo.appType === "site" && (() => {
                  const siteDocs = getSiteRegistrationDocuments(appInfo.country, appInfo.siteType);
                  if (!appInfo.siteType) return (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: THEME.textMuted }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🏭</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Select a Site / Licence Type</div>
                      <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.5 }}>Choose the licence type in the Markets panel to see the required documents checklist.</div>
                    </div>
                  );
                  if (!siteDocs.length) return (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: THEME.textMuted }}>
                      <div style={{ fontSize: 11 }}>No checklist available yet for this site type.</div>
                    </div>
                  );

                  // Group by category
                  const cats = [...new Set(siteDocs.map(d => d.cat))];
                  const CAT_META = {
                    Application:  { label: "Application Documents",       icon: "📝", color: "#1565C0" },
                    Premises:     { label: "Premises & Infrastructure",    icon: "🏗️",  color: "#6A1B9A" },
                    Personnel:    { label: "Personnel & Qualifications",   icon: "👤", color: "#2E7D32" },
                    Equipment:    { label: "Equipment & Instruments",      icon: "⚙️",  color: "#E65100" },
                    Quality:      { label: "Quality System (GMP)",        icon: "✅", color: "#00695C" },
                    Company:      { label: "Company / Legal Documents",    icon: "🏢", color: "#37474F" },
                    ContractMfg:  { label: "Contract Manufacturing",       icon: "🤝", color: "#4527A0" },
                  };
                  const totalReq = siteDocs.filter(d => d.required).length;
                  const totalDone = siteDocs.filter(d => checkedDocs["site-" + d.id]).length;

                  return (
                    <div>
                      {/* Site checklist header bar */}
                      <div style={{ background: "#FF9800", color: "#fff", padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, flex: 1 }}>
                          {SITE_REG_TYPES[appInfo.country]?.find(s => s.value === appInfo.siteType)?.label || "Site Registration"}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", background: "rgba(0,0,0,0.2)", padding: "1px 6px", borderRadius: 10 }}>
                          {totalDone}/{totalReq} done
                        </span>
                      </div>
                      <div style={{ background: "#FFF8F0", padding: "4px 10px 3px", borderBottom: "1px solid #FFD0A0",
                        fontSize: 9, color: "#8B4000" }}>
                        Issuing Authority: <strong>{SITE_REG_TYPES[appInfo.country]?.find(s => s.value === appInfo.siteType)?.authority}</strong>
                      </div>

                      {/* Categories */}
                      {cats.map(cat => {
                        const meta = CAT_META[cat] || { label: cat, icon: "📁", color: "#555" };
                        const catDocs = siteDocs.filter(d => d.cat === cat);
                        const catKey = "site-cat-" + cat;
                        const isCol = reqDocsCollapsed[catKey];
                        const catDone = catDocs.filter(d => checkedDocs["site-" + d.id]).length;
                        return (
                          <div key={cat}>
                            {/* Category row */}
                            <div onClick={() => setReqDocsCollapsed(p => ({ ...p, [catKey]: !p[catKey] }))}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", cursor: "pointer",
                                background: meta.color + "10", borderBottom: "1px solid " + meta.color + "25" }}>
                              <span style={{ fontSize: 8, color: "#666", width: 10 }}>{isCol ? "▶" : "▼"}</span>
                              <span style={{ fontSize: 12 }}>{meta.icon}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, flex: 1 }}>{meta.label}</span>
                              <span style={{ fontSize: 9, fontFamily: "monospace", color: catDone === catDocs.filter(d=>d.required).length ? THEME.green : THEME.textDim }}>
                                {catDone}/{catDocs.filter(d => d.required).length}
                              </span>
                            </div>
                            {/* Doc items */}
                            {!isCol && catDocs.map((doc, di) => {
                              const dk = "site-" + doc.id;
                              const ch = !!checkedDocs[dk];
                              const iDS = selectedDocNode === dk;
                              return (
                                <div key={dk} onClick={() => { setCheckedDocs(p => ({ ...p, [dk]: !p[dk] })); setSelectedDocNode(dk); }}
                                  style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", padding: "5px 6px 5px 28px",
                                    background: iDS ? meta.color + "18" : ch ? meta.color + "08" : "transparent",
                                    borderLeft: iDS ? "3px solid " + meta.color : "3px solid transparent",
                                    borderBottom: "1px solid " + THEME.border + "60" }}>
                                  <span style={{ flexShrink: 0, marginRight: 6, marginTop: 1 }}>
                                    {ch
                                      ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill={meta.color} opacity="0.15"/><path d="M3.5 6.5l2 2 4-4" stroke={meta.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      : doc.required
                                        ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="10" height="11" rx="1.2" fill="#fff" stroke={meta.color} strokeWidth="1" opacity="0.7"/><line x1="4" y1="5" x2="9" y2="5" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/><line x1="4" y1="7" x2="9" y2="7" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/><line x1="4" y1="9" x2="7" y2="9" stroke={meta.color} strokeWidth="0.8" opacity="0.5"/></svg>
                                        : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="10" height="11" rx="1.2" fill="#F8F8F8" stroke="#CCC" strokeWidth="0.8" strokeDasharray="2 1"/></svg>
                                    }
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: doc.required ? 600 : 400,
                                      color: iDS ? meta.color : ch ? THEME.textMuted : THEME.text,
                                      textDecoration: ch ? "line-through" : "none",
                                      lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {doc.title}
                                    </div>
                                    <div style={{ fontSize: 9, color: "#AAA", fontFamily: "monospace", display: "flex", gap: 6 }}>
                                      {doc.form && <span style={{ color: meta.color, fontWeight: 700 }}>{doc.form}</span>}
                                      <span>{doc.required ? "Required" : "Optional"}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ══ PRODUCT REGISTRATION — CTD MODULE TREE ═══════════════════ */}
                {appInfo.appType === "product" && !(appInfo.country === "IN" && appInfo.subType === "CT-IN") && [1,2,3,4,5].map((mn) => {
                  const mDocs = reqDocs.filter((d) => d.module === mn);
                  if (!mDocs.length) return null;
                  const col = MODULE_COLORS[mn];
                  const mKey = "o-m" + mn;
                  const isMCol = reqDocsCollapsed[mKey];
                  const mChecked = mDocs.filter((d) => checkedDocs[mn + "-" + d.section]).length;
                  const mReq = mDocs.filter((d) => d.required).length;
                  const isModSel = selectedDocNode === "m" + mn;

                  const DocLeaf = ({ doc, groupDocs, idx }) => {
                    const dk = mn + "-" + doc.section;
                    const ch = !!checkedDocs[dk];
                    const iDS = selectedDocNode === dk;
                    const isLast = idx === groupDocs.length - 1;
                    return (
                      <div key={dk} onClick={() => { setCheckedDocs((p) => ({ ...p, [dk]: !p[dk] })); setSelectedDocNode(dk); }}
                        style={{ display: "flex", alignItems: "center", cursor: "pointer",
                          background: iDS ? THEME.accent + "18" : ch ? col + "10" : "transparent",
                          borderLeft: iDS ? "3px solid " + THEME.accent : "3px solid transparent" }}>
                        <div style={{ width: 56, display: "flex", alignItems: "center", position: "relative", height: 22, flexShrink: 0 }}>
                          <div style={{ position: "absolute", left: 8, top: 0, bottom: "50%", width: 1, background: "#B8BCC4" }} />
                          {!isLast && <div style={{ position: "absolute", left: 8, top: "50%", bottom: 0, width: 1, background: "#B8BCC4" }} />}
                          <div style={{ position: "absolute", left: 8, top: "50%", width: 20, height: 1, background: "#B8BCC4" }} />
                        </div>
                        <span style={{ flexShrink: 0, marginRight: 4, display: "flex", alignItems: "center" }}>
                          {ch
                            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#107C10" opacity="0.15"/><path d="M3 6l2 2 4-4" stroke="#107C10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : doc.required
                              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1" fill="#fff" stroke="#9BAFD0" strokeWidth="1"/><line x1="3.5" y1="4" x2="8.5" y2="4" stroke="#C0CADE" strokeWidth="0.8"/><line x1="3.5" y1="6" x2="8.5" y2="6" stroke="#C0CADE" strokeWidth="0.8"/><line x1="3.5" y1="8" x2="6.5" y2="8" stroke="#C0CADE" strokeWidth="0.8"/></svg>
                              : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1" fill="#FAFAFA" stroke="#D0D0D0" strokeWidth="1" strokeDasharray="2 1"/><line x1="3.5" y1="5" x2="8.5" y2="5" stroke="#DDD" strokeWidth="0.8"/><line x1="3.5" y1="7" x2="7" y2="7" stroke="#DDD" strokeWidth="0.8"/></svg>
                          }
                        </span>
                        <div style={{ flex: 1, minWidth: 0, padding: "3px 6px 3px 0" }}>
                          <div style={{ fontSize: 10, color: iDS ? THEME.accent : ch ? THEME.textMuted : THEME.text,
                            textDecoration: ch ? "line-through" : "none", fontWeight: doc.required ? 600 : 400,
                            lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            [{(appInfo.sequence || "0000").padStart(4,"0")}] {doc.title}
                          </div>
                          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#AAA", display: "flex", gap: 6, alignItems: "center" }}>
                            <span>{doc.section}</span>
                            {doc.form && <span style={{ color: THEME.accent, fontWeight: 600 }}>{doc.form}</span>}
                            {doc.r2 && <span style={{ background: "#C17900", color: "#fff", fontSize: 7, fontWeight: 700, padding: "0px 3px", borderRadius: 2 }}>R2</span>}
                          </div>
                        </div>
                      </div>
                    );
                  };

                  // Smart section grouping — handles both R1 numeric (2.3.S.1) and R2 alphanumeric (2.3.3.DS, 3.2.DS.M.1) codes
                  const sectionSortKey = (s) => {
                    // Convert each segment to zero-padded number or keep as string for stable sort
                    return s.split(".").map(seg => isNaN(seg) ? seg : seg.padStart(4, "0")).join(".");
                  };

                  const getTopSection = (section) => {
                    const p = section.split(".");
                    // For R2 codes: 2.3.3.DS → top = "2.3.3" (3 parts); 3.2.DS → top = "3.2" (2 parts)
                    // For R1 codes: 2.3.S.1 → top = "2.3"; 3.2.S.4 → top = "3.2"
                    // Heuristic: if 3rd segment is all letters (e.g. DS, DP, SM), keep 3 segments as top
                    if (p.length >= 3 && /^[A-Z]+$/.test(p[2])) return p.slice(0, 3).join(".");
                    return p.length > 1 ? p.slice(0, 2).join(".") : section;
                  };

                  const renderSectionGroup = (groupDocs) => {
                    const topSecs = [...new Set(groupDocs.map((d) => getTopSection(d.section)))]
                      .sort((a, b) => sectionSortKey(a).localeCompare(sectionSortKey(b)));
                    return topSecs.map((ts, ti) => {
                      const docsAt = groupDocs.filter((d) => d.section === ts);
                      const docsBelow = groupDocs.filter((d) => d.section !== ts && d.section.startsWith(ts + "."));
                      if (!docsBelow.length && docsAt.length > 0) {
                        return docsAt.map((doc, di) => (
                          <DocLeaf key={mn+"-"+doc.section} doc={doc} groupDocs={docsAt} idx={di} />
                        ));
                      }
                      return (
                        <OTreeNode key={ts} section={ts} label={FOLDER_LABELS_O[ts] || ts}
                          depth={1} color={col} isLast={ti === topSecs.length-1} module={mn} allDocs={groupDocs} />
                      );
                    });
                  };

                  return (
                    <div key={mn}>
                      <div onClick={() => { setReqDocsCollapsed((p) => ({ ...p, [mKey]: !p[mKey] })); setSelectedDocNode("m" + mn); }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", cursor: "pointer", userSelect: "none",
                          background: isModSel ? col + "20" : isMCol ? "transparent" : col + "0E",
                          borderLeft: isModSel ? "3px solid " + col : "3px solid transparent",
                          borderBottom: "1px solid " + col + "22",
                        }}>
                        <span style={{ fontSize: 8, color: "#666", width: 10, flexShrink: 0 }}>{isMCol ? "▶" : "▼"}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M1 4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" fill={col} opacity={isMCol ? 0.85 : 0.6}/>
                          {!isMCol && <path d="M1 7h14" stroke={col} strokeWidth="0.8" opacity="0.8"/>}
                        </svg>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 12, color: col, lineHeight: 1.3 }}>{MODULE_LABELS_O[mn]}</span>
                        {m4qMode === "R2" && (mn === 2 || mn === 3) && (
                          <span style={{ background: "#C17900", color: "#fff", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>R2</span>
                        )}
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: mChecked === mReq ? THEME.green : THEME.textDim }}>
                          {mChecked}/{mReq}
                        </span>
                      </div>
                      {!isMCol && (
                        <div style={{ background: "#FAFBFC" }}>
                          {mn === 1 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 4px 3px 36px", borderLeft: "3px solid transparent" }}>
                              <div style={{ width: 16, position: "relative", height: 18, flexShrink: 0 }}>
                                <div style={{ position: "absolute", left: 0, top: 0, bottom: "50%", width: 1, background: "#B8BCC4" }} />
                                <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: "#B8BCC4" }} />
                                <div style={{ position: "absolute", left: 0, top: "50%", bottom: 0, width: 1, background: "#B8BCC4" }} />
                              </div>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}><rect x="1" y="1" width="11" height="11" rx="1.5" fill="#E8EEF8" stroke="#9BAFD0" strokeWidth="0.8"/><polyline points="3,5 6.5,8 10,5" stroke="#2B579A" strokeWidth="1" fill="none"/></svg>
                              <span style={{ fontSize: 10, color: THEME.accent, fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>
                                {REGION_META[appInfo.country]?.authority || ""}-envelope.xml
                              </span>
                            </div>
                          )}
                          {renderSectionGroup(mDocs)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nodes count footer */}
              <div style={{ background: "#E8EBF0", borderTop: "1px solid #D0D0D0", padding: "3px 10px",
                fontSize: 9, fontFamily: "monospace", color: "#888", flexShrink: 0, display: "flex", gap: 12 }}>
                <span>Nodes: {reqDocs.length}</span>
                <span>Checked: {totalChecked}</span>
                <span>Region: {appInfo.country || "US"}</span>
                <span style={{ color: m4qMode === "R2" ? "#C17900" : "#888", fontWeight: m4qMode === "R2" ? 700 : 400 }}>
                  M4Q({m4qMode}){m4qMode === "R2" ? " ⚠️" : ""}
                </span>
              </div>
            </div>
          );
        })()}

        {/* ── MAIN content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, minWidth: 0 }}>

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div style={{ animation: "fadeIn 0.3s ease", display: "flex", gap: 0, alignItems: "flex-start" }}>

              {/* ── CENTER: Markets + eCTD Tree ── */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Markets */}
                <Card>
                  <SectionTitle sub="Select region, product type, and submission type — required documents populate below">Markets</SectionTitle>

                  {/* ── STEP 1: REGION / REGULATORY AUTHORITY ── */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Region / Regulatory Authority</div>

                    {/* Continent tabs */}
                    <div style={{ display: "flex", borderBottom: `2px solid ${THEME.border}`, marginBottom: 8, gap: 0 }}>
                      {Object.keys(REGION_DATA).map((continent) => {
                        const hasActive = REGION_DATA[continent].some(r => r.code === appInfo.country);
                        const CONT_COLORS = { Supranational: "#1565C0", SRA: "#00796B", Africa: "#2E7D32", MENA: "#C17900", "N. America": "#B71C1C", "C. America": "#1B5E20", "Caribbean": "#006064", "S. America": "#4527A0", Asia: "#E65100", Europe: "#283593", CIS: "#6A1B9A", Oceania: "#00695C" };
                        const col = CONT_COLORS[continent] || THEME.accent;
                        return (
                          <button key={continent} onClick={() => setAppInfo(p => ({ ...p, _continent: continent }))}
                            style={{
                              padding: "5px 10px", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                              background: "transparent",
                              color: (appInfo._continent || "Americas") === continent || hasActive ? col : THEME.textMuted,
                              borderBottom: (appInfo._continent || "Americas") === continent || (!appInfo._continent && hasActive)
                                ? `3px solid ${col}` : "3px solid transparent",
                              marginBottom: -2, transition: "all 0.15s",
                            }}>
                            {continent}
                          </button>
                        );
                      })}
                    </div>

                    {/* Country buttons for active continent */}
                    {(() => {
                      const activeContinent = appInfo._continent || Object.keys(REGION_DATA).find(c => REGION_DATA[c].some(r => r.code === appInfo.country)) || "Americas";
                      const countries = REGION_DATA[activeContinent] || [];
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 5 }}>
                          {countries.map((r) => {
                            const isActive = appInfo.country === r.code;
                            return (
                              <button key={r.code} title={`${r.name} — ${r.authority}`} onClick={() => {
                                const appNumPh = r.appNumPh || "APP000000";
                                const allTypes = REGION_SUB_TYPES[r.code] || REGION_SUB_TYPES["US"];
                                const regFiltered = appInfo.registrationType === "new"
                                  ? allTypes.filter((t) => !["CBE0","CBE30","PAS","Type IA","Type IB","Type II","Annual Report","PACMP","PIV","Lifecycle","Variation"].some((kw) => t.label.includes(kw) || t.value.includes(kw)))
                                  : allTypes.filter((t) => ["CBE0","CBE30","PAS","Type IA","Type IB","Type II","Annual Report","PACMP","Lifecycle","Variation","PIV","Supplement","Amendment","Change"].some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                                const firstType = (regFiltered.length ? regFiltered : allTypes)[0]?.value || "NDA";
                                setAppInfo((p) => ({ ...p, country: r.code, _continent: activeContinent, subType: firstType, productCategory: p.productCategory || "FINISHED", appNumber: p.appNumber === p._lastAppNumPh ? appNumPh : p.appNumber, _lastAppNumPh: appNumPh }));
                              }} style={{
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                                padding: "7px 4px", borderRadius: 5, cursor: "pointer", width: "100%",
                                border: isActive ? `2px solid ${r.color}` : `2px solid ${THEME.border}`,
                                background: isActive ? r.color + "18" : THEME.surfaceAlt,
                                borderBottom: isActive ? `3px solid ${r.color}` : `3px solid transparent`,
                                transition: "all 0.12s",
                              }}>
                                <div style={{ width: "100%", height: 6, borderRadius: 2, background: isActive ? r.color : r.color + "40", marginBottom: 2 }} />
                                <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? r.color : THEME.text, textAlign: "center", lineHeight: 1.2, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.authority}</span>
                                <span style={{ fontSize: 8, fontWeight: 500, color: isActive ? r.color : THEME.textMuted, textAlign: "center", lineHeight: 1.2, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {REGION_META[appInfo.country] && (
                      <div style={{ fontSize: 10, color: THEME.blue, marginTop: 7, fontFamily: "monospace" }}>
                        📡 {REGION_META[appInfo.country].portal} &nbsp;·&nbsp; <strong>{REGION_META[appInfo.country].name}</strong> — {REGION_META[appInfo.country].authority}
                      </div>
                    )}
                  </div>

                  {/* ── STEP 2: APPLICATION TYPE — 3 tabs ── */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 6, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Application Type</div>
                    <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${THEME.border}` }}>
                      {[
                        { val: "site",     icon: "🏭", label: "Site / Facility\nRegistration",    activeColor: "#E65100", activeBg: "#FFF3E0", activeBorder: "#FF9800" },
                        { val: "product",  icon: "📋", label: "Product\nRegistration",             activeColor: THEME.accent, activeBg: "#EAF2FF", activeBorder: THEME.accent },
                        { val: "clinical", icon: "🔬", label: "Clinical\nTrials",                  activeColor: "#1A237E", activeBg: "#E8EAF6", activeBorder: "#3949AB" },
                        { val: "pv",       icon: "🛡️",  label: "Pharmaco-\nvigilance",              activeColor: "#880E4F", activeBg: "#FCE4EC", activeBorder: "#AD1457" },
                      ].map(({ val, icon, label, activeColor, activeBg, activeBorder }, idx, arr) => {
                        const isActive = appInfo.appType === val;
                        return (
                          <button key={val} onClick={() => {
                            // When switching to clinical, auto-set relevant subType
                            if (val === "clinical") {
                              const ctTypes = (REGION_SUB_TYPES[appInfo.country] || []).filter(t =>
                                ["CT","CTA","IND","IMPD","BA/BE","CTRI","Clinical Trial"].some(kw => t.label.includes(kw) || t.value.includes(kw))
                              );
                              const firstCT = ctTypes[0]?.value || "CT-IN";
                              setAppInfo(p => ({ ...p, appType: val, subType: firstCT }));
                            } else {
                              setAppInfo(p => ({ ...p, appType: val }));
                            }
                          }} style={{
                            flex: 1, padding: "10px 8px", border: "none", cursor: "pointer", textAlign: "center",
                            background: isActive ? activeBg : THEME.surfaceAlt,
                            borderRight: idx < arr.length - 1 ? `1px solid ${THEME.border}` : "none",
                            borderBottom: isActive ? `3px solid ${activeBorder}` : "3px solid transparent",
                            transition: "all 0.15s",
                          }}>
                            <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? activeColor : THEME.textMuted, lineHeight: 1.3, whiteSpace: "pre-line" }}>{label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── SITE TYPE SELECTOR (only when Site Registration chosen) ── */}
                  {appInfo.appType === "site" && (
                    <div style={{ marginBottom: 14, padding: 12, background: "#FFF8F0", border: "1px solid #FFD0A0", borderRadius: 5 }}>
                      <div style={{ fontSize: 11, color: "#8B4000", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        🏭 Site / Licence Type
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(SITE_REG_TYPES[appInfo.country] || []).map((st) => (
                          <label key={st.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer",
                            padding: "8px 10px", borderRadius: 4,
                            background: appInfo.siteType === st.value ? "#FF9800" + "18" : "#fff",
                            border: appInfo.siteType === st.value ? "1px solid #FF9800" : "1px solid #EEE",
                          }}>
                            <input type="radio" name="siteType" value={st.value} checked={appInfo.siteType === st.value}
                              onChange={() => setAppInfo(p => ({ ...p, siteType: st.value }))}
                              style={{ marginTop: 2, accentColor: "#FF9800" }}/>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#5D2E00" }}>{st.label}</div>
                              <div style={{ fontSize: 10, color: "#8B5A00", marginTop: 1 }}>Issued by: {st.authority}</div>
                              <div style={{ fontSize: 10, color: "#A06000", marginTop: 1, fontStyle: "italic" }}>{st.desc}</div>
                            </div>
                          </label>
                        ))}
                        {!(SITE_REG_TYPES[appInfo.country] || []).length && (
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontStyle: "italic" }}>
                            Site registration types for {appInfo.country} coming soon.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── CLINICAL TRIALS — sub-type selector ── */}
                  {appInfo.appType === "clinical" && (
                    <div style={{ marginBottom: 14, padding: 12, background: "#E8EAF6", border: "1px solid #C5CAE9", borderRadius: 5 }}>
                      <div style={{ fontSize: 11, color: "#1A237E", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        🔬 Clinical Trial Type
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {(() => {
                          const ctTypes = (REGION_SUB_TYPES[appInfo.country] || []).filter(t =>
                            ["CT","CTA","IND","IMPD","BA/BE","CTRI","Clinical Trial","BA-BE"].some(kw => t.label.includes(kw) || t.value.includes(kw))
                          );
                          const fallback = [
                            { value: "CT-IN", label: "CT Permission — Clinical Trial (Form CT-04)", desc: "Phase I / II / III / IV — New Drug (NDCT Rules 2019)" },
                          ];
                          return (ctTypes.length ? ctTypes : fallback).map(t => (
                            <label key={t.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer",
                              padding: "8px 10px", borderRadius: 4,
                              background: appInfo.subType === t.value ? "#3949AB18" : "#fff",
                              border: appInfo.subType === t.value ? "1px solid #3949AB" : "1px solid #C5CAE9",
                            }}>
                              <input type="radio" name="ctType" value={t.value} checked={appInfo.subType === t.value}
                                onChange={() => setAppInfo(p => ({ ...p, subType: t.value }))}
                                style={{ marginTop: 2, accentColor: "#3949AB" }}/>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#1A237E" }}>{t.label}</div>
                                {t.desc && <div style={{ fontSize: 10, color: "#3949AB", marginTop: 1, fontStyle: "italic" }}>{t.desc}</div>}
                              </div>
                            </label>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* ── PHARMACOVIGILANCE — sub-type selector ── */}
                  {appInfo.appType === "pv" && (
                    <div style={{ marginBottom: 14, padding: 12, background: "#FCE4EC", border: "1px solid #F8BBD0", borderRadius: 5 }}>
                      <div style={{ fontSize: 11, color: "#880E4F", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        🛡️ Pharmacovigilance Activity
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {[
                          { value: "PSUR",    label: "PSUR — Periodic Safety Update Report",              desc: "Benefit-risk evaluation report submitted at defined intervals per ICH E2C(R2)" },
                          { value: "PBRER",   label: "PBRER — Periodic Benefit-Risk Evaluation Report",   desc: "ICH E2C(R2) harmonised format replacing PSUR" },
                          { value: "DSUR",    label: "DSUR — Development Safety Update Report",           desc: "Annual safety update for investigational drugs per ICH E2F" },
                          { value: "PADER",   label: "PADER — Periodic Adverse Drug Experience Report",   desc: "FDA 21 CFR 314.81 periodic safety reporting for approved drugs" },
                          { value: "SAE",     label: "SAE — Serious Adverse Event Expedited Report",      desc: "15-day/7-day expedited reporting of serious unexpected ADRs" },
                          { value: "ICSRs",   label: "ICSRs — Individual Case Safety Reports",            desc: "MedWatch / EudraVigilance / VigiBase ICSR submission (E2B R3)" },
                          { value: "RMP",     label: "RMP — Risk Management Plan",                        desc: "EU RMP / US REMS / national risk minimisation plan" },
                          { value: "REMS",    label: "REMS — Risk Evaluation and Mitigation Strategy",    desc: "FDA-required safety programme for drugs with serious risk" },
                          { value: "SIGNAL",  label: "Signal Detection & Evaluation Report",              desc: "Documented signal detection, assessment and regulatory action per ICH E2D" },
                          { value: "PV-AUDIT",label: "PV System Audit / GVP Inspection Response",        desc: "Pharmacovigilance system master file (PSMF) and GVP Module I–XVI compliance" },
                        ].map(t => (
                          <label key={t.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer",
                            padding: "8px 10px", borderRadius: 4,
                            background: appInfo.subType === t.value ? "#AD145718" : "#fff",
                            border: appInfo.subType === t.value ? "1px solid #AD1457" : "1px solid #F8BBD0",
                          }}>
                            <input type="radio" name="pvType" value={t.value} checked={appInfo.subType === t.value}
                              onChange={() => setAppInfo(p => ({ ...p, subType: t.value }))}
                              style={{ marginTop: 2, accentColor: "#AD1457" }}/>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#880E4F" }}>{t.label}</div>
                              {t.desc && <div style={{ fontSize: 10, color: "#AD1457", marginTop: 1, fontStyle: "italic" }}>{t.desc}</div>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── PRODUCT REGISTRATION — region/type/submission selectors ── */}
                  {appInfo.appType === "product" && (
                    <div>
                      {/* Product Type — icon button grid */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Product Type</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                          {PRODUCT_CATEGORIES.map((c) => {
                            const isActive = appInfo.productCategory === c.value;
                            return (
                              <button key={c.value} onClick={() => {
                                const cat = c.value;
                                const allTypes = REGION_SUB_TYPES[appInfo.country] || REGION_SUB_TYPES["US"];
                                const catDef = PRODUCT_CATEGORIES.find((pc) => pc.value === cat);
                                const catFiltered = cat === "ALL" ? allTypes : allTypes.filter((t) =>
                                  catDef?.keywords.some((kw) => t.label.includes(kw) || t.value.includes(kw))
                                );
                                const plcmKws = ["CBE0","CBE30","PAS","Type IA","Type IB","Type II","Annual Report","PACMP","Lifecycle","Variation","PIV","Supplement","Amendment","Change"];
                                const regFiltered = appInfo.registrationType === "new"
                                  ? catFiltered.filter((t) => !plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)))
                                  : catFiltered.filter((t) => plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                                setAppInfo((p) => ({ ...p, productCategory: cat, subType: (regFiltered.length ? regFiltered : catFiltered)[0]?.value || allTypes[0]?.value || "" }));
                              }} style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                width: "100%", padding: "7px 10px", borderRadius: 4, cursor: "pointer",
                                border: isActive ? `1.5px solid ${THEME.accent}` : `1.5px solid ${THEME.border}`,
                                background: isActive ? THEME.accent + "12" : THEME.surfaceAlt,
                                transition: "all 0.12s",
                              }}>
                                <span style={{ fontSize: 13 }}>{c.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? THEME.accent : THEME.textMuted, whiteSpace: "nowrap" }}>{c.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Activity Type — toggle below product type */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Activity Type</div>
                        <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${THEME.border}`, width: "100%" }}>
                          {[
                            { val: "new",  label: "New Registration",      icon: "🆕", desc: "First-time marketing authorisation" },
                            { val: "plcm", label: "PLCM / Post-Approval",  icon: "🔄", desc: "Variations, supplements, lifecycle" },
                          ].map(({ val, label, icon, desc }, idx) => {
                            const isActive = appInfo.registrationType === val;
                            return (
                            <button key={val} title={desc} onClick={() => {
                              const allTypes = REGION_SUB_TYPES[appInfo.country] || REGION_SUB_TYPES["US"];
                              const catDef = PRODUCT_CATEGORIES.find((c) => c.value === (appInfo.productCategory || "ALL"));
                              const catFiltered = appInfo.productCategory === "ALL" ? allTypes : allTypes.filter((t) =>
                                catDef?.keywords.some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                              const plcmKws = ["CBE0","CBE30","PAS","Type IA","Type IB","Type II","Annual Report","PACMP","Lifecycle","Variation","PIV","Supplement","Amendment","Change"];
                              const regFiltered = val === "new"
                                ? catFiltered.filter((t) => !plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)))
                                : catFiltered.filter((t) => plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                              const firstType = (regFiltered.length ? regFiltered : catFiltered)[0]?.value || allTypes[0]?.value || "";
                              setAppInfo((p) => ({ ...p, registrationType: val, subType: firstType }));
                            }} style={{
                              flex: 1, padding: "10px 8px", border: "none", cursor: "pointer", textAlign: "center",
                              background: isActive ? THEME.accent + "12" : THEME.surfaceAlt,
                              borderRight: idx === 0 ? `1px solid ${THEME.border}` : "none",
                              borderBottom: isActive ? `3px solid ${THEME.accent}` : "3px solid transparent",
                              transition: "all 0.15s",
                            }}>
                              <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? THEME.accent : THEME.textMuted, lineHeight: 1.3 }}>{label}</div>
                            </button>
                          );})}
                        </div>
                      </div>

                      {/* Submission Type */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Submission Type</div>
                        {(() => {
                          const allTypes = REGION_SUB_TYPES[appInfo.country] || REGION_SUB_TYPES["US"];
                          const catDef = PRODUCT_CATEGORIES.find((c) => c.value === (appInfo.productCategory || "ALL"));
                          const catFiltered = appInfo.productCategory === "ALL" ? allTypes : allTypes.filter((t) =>
                            catDef?.keywords.some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                          const plcmKws = ["CBE0","CBE30","PAS","Type IA","Type IB","Type II","Annual Report","PACMP","Lifecycle","Variation","PIV","Supplement","Amendment","Change"];
                          const regFiltered = appInfo.registrationType === "new"
                            ? catFiltered.filter((t) => !plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)))
                            : catFiltered.filter((t) => plcmKws.some((kw) => t.label.includes(kw) || t.value.includes(kw)));
                          const finalList = regFiltered.length ? regFiltered : catFiltered.length ? catFiltered : allTypes;
                          const cols = finalList.length <= 2 ? finalList.length : finalList.length <= 4 ? 2 : finalList.length <= 6 ? 3 : 4;
                          const selectedDesc = finalList.find(t => t.value === appInfo.subType)?.desc;
                          return (
                            <>
                              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
                                {finalList.map((t) => {
                                  const isActive = appInfo.subType === t.value;
                                  return (
                                    <button key={t.value} onClick={() => setAppInfo(p => ({ ...p, subType: t.value }))}
                                      title={t.desc || t.label}
                                      style={{
                                        padding: "7px 6px", borderRadius: 4, cursor: "pointer", textAlign: "center",
                                        border: isActive ? `1.5px solid ${THEME.accent}` : `1.5px solid ${THEME.border}`,
                                        background: isActive ? THEME.accent + "12" : THEME.surfaceAlt,
                                        fontSize: 10, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? THEME.accent : THEME.textMuted,
                                        lineHeight: 1.3, transition: "all 0.12s",
                                        wordBreak: "break-word", hyphens: "auto",
                                      }}>
                                      {t.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {selectedDesc && (
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 6, lineHeight: 1.4 }}>
                                  {selectedDesc}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* ── Submission Details — integrated into Markets card ── */}
                  <div style={{ borderTop: `2px solid ${THEME.border}`, marginTop: 16, paddingTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 12 }}>📋</span>
                      <div style={{ fontWeight: 700, fontSize: 12, color: THEME.accent, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "monospace" }}>
                        {appInfo.registrationType === "new" ? "New Submission Details" : "PLCM — Select Base Dossier"}
                      </div>
                    </div>

                    {appInfo.registrationType === "new" ? (
                      /* ── NEW REGISTRATION: Applicant + App Number + Sequence ── */
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.5fr", gap: 12 }}>
                        {[
                          ["Applicant / MAH", "applicant", "Company Name"],
                          ["Application Number", "appNumber", REGION_META[appInfo.country]?.appNumPh || "APP000000"],
                          ["Sequence No.", "sequence", "0000"],
                        ].map(([label, key, ph]) => (
                          <div key={key}>
                            <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4, fontWeight: 600 }}>{label}</div>
                            <input type="text" value={appInfo[key] || ""} placeholder={ph}
                              onChange={(e) => setAppInfo((p) => ({ ...p, [key]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ── PLCM: Select from published dossier / sequence history ── */
                      <div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 10, lineHeight: 1.5 }}>
                          Select the previously approved dossier this PLCM activity is based on:
                        </div>
                        {sequenceHistory.filter((s) => s.status === "Approved" || s.status === "Under Review").length === 0 ? (
                          <div style={{ padding: "12px", background: THEME.surfaceAlt, borderRadius: 4, border: `1px dashed ${THEME.border}`, textAlign: "center", color: THEME.textMuted, fontSize: 11 }}>
                            No approved sequences found in database. Add sequences in the PLCM tab first.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, maxHeight: 180, overflowY: "auto" }}>
                            {sequenceHistory.filter((s) => s.status === "Approved" || s.status === "Under Review").map((seq) => {
                              const isSelected = appInfo.basedOnSeq === seq.seq;
                              return (
                                <div key={seq.seq} onClick={() => setAppInfo((p) => ({ ...p, basedOnSeq: seq.seq, appNumber: p.appNumber || seq.appNumber || "", sequence: String(parseInt(seq.seq || "0") + 1).padStart(4, "0") }))}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                                    background: isSelected ? THEME.accent + "12" : THEME.surfaceAlt,
                                    border: `1.5px solid ${isSelected ? THEME.accent : THEME.border}`,
                                    borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}>
                                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${isSelected ? THEME.accent : "#BBBFC7"}`, background: isSelected ? THEME.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {isSelected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: THEME.accent }}>SEQ {seq.seq}</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: THEME.text }}>{seq.subType}</span>
                                      <span style={{ fontSize: 10, color: THEME.textMuted }}>{seq.date}</span>
                                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 2, fontWeight: 700,
                                        background: seq.status === "Approved" ? THEME.green + "22" : "#f39c1222",
                                        color: seq.status === "Approved" ? THEME.green : "#f39c12" }}>{seq.status}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {seq.changes}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: THEME.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>New Sequence Details</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.5fr", gap: 12 }}>
                            {[
                              ["Applicant / MAH", "applicant", "Company Name"],
                              ["Application Number", "appNumber", REGION_META[appInfo.country]?.appNumPh || "APP000000"],
                              ["New Sequence", "sequence", "0001"],
                            ].map(([label, key, ph]) => (
                              <div key={key}>
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4, fontWeight: 600 }}>{label}</div>
                                <input type="text" value={appInfo[key] || ""} placeholder={ph}
                                  onChange={(e) => setAppInfo((p) => ({ ...p, [key]: e.target.value }))} />
                              </div>
                            ))}
                          </div>
                          {appInfo.basedOnSeq && (
                            <div style={{ marginTop: 8, fontSize: 10, color: THEME.green, fontFamily: "monospace" }}>
                              ✓ Based on SEQ {appInfo.basedOnSeq} → incrementing to SEQ {appInfo.sequence}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* DOSSIER TAB */}
          {activeTab === "dossier" && (
            <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Generated CTD Dossier</h2>
                  <p style={{ margin: 0, color: THEME.textMuted, fontSize: 13 }}>AI-generated summaries + docuBridge-ready export files.</p>
                </div>
                {generating && <div style={{ display: "flex", alignItems: "center", gap: 8, color: THEME.accent }}><Spinner /><span style={{ fontSize: 12 }}>Generating...</span></div>}
              </div>
              {!dossier && !generating && (
                <Card style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>No Dossier Generated Yet</div>
                  <div style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 20 }}>Fill in Markets info above, analyze your documents, then generate.</div>
                  <GlowButton onClick={generateDossier} disabled={!canGenerate}>Generate CTD Dossier</GlowButton>
                </Card>
              )}
              {dossier && (<>
                {dossier.metaTable?.length > 0 && (
                  <Card>
                    <SectionTitle sub="docuBridge-compatible file names & eCTD paths">Regulatory Metadata & eCTD Mapping</SectionTitle>
                    <MetadataTable data={dossier.metaTable} />
                  </Card>
                )}
                <Card glow>
                  <SectionTitle sub="Module 2.3 — ICH CTD Quality Overall Summary">Quality Overall Summary (QOS)</SectionTitle>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: THEME.text, whiteSpace: "pre-wrap",
                    background: THEME.surfaceAlt, padding: 16, borderRadius: 6, maxHeight: 300, overflowY: "auto" }}>{dossier.qos}</div>
                  <div style={{ marginTop: 10, fontSize: 11, color: THEME.textMuted }}>📎 docuBridge path: m2/23-quality-overall-summary/quality-overall-summary.pdf</div>
                </Card>
                <Card>
                  <SectionTitle sub="Module 2.4 — ICH M4S Nonclinical Overview">Nonclinical Overview</SectionTitle>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: THEME.text, whiteSpace: "pre-wrap",
                    background: THEME.surfaceAlt, padding: 16, borderRadius: 6, maxHeight: 300, overflowY: "auto" }}>{dossier.nonclinical}</div>
                  <div style={{ marginTop: 10, fontSize: 11, color: THEME.textMuted }}>📎 docuBridge path: m2/24-nonclinical-overview/nonclinical-overview.pdf</div>
                </Card>
                <Card>
                  <SectionTitle sub="Module 2.5 — ICH E3 Clinical Overview">Clinical Overview</SectionTitle>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: THEME.text, whiteSpace: "pre-wrap",
                    background: THEME.surfaceAlt, padding: 16, borderRadius: 6, maxHeight: 300, overflowY: "auto" }}>{dossier.clinical}</div>
                  <div style={{ marginTop: 10, fontSize: 11, color: THEME.textMuted }}>📎 docuBridge path: m2/25-clinical-overview/clinical-overview.pdf</div>
                </Card>
              </>)}
            </div>
          )}

          {/* EXPORT TAB */}
          {activeTab === "export" && (
            <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Publishing Tool Export</h2>
                  <p style={{ margin: 0, color: THEME.textMuted, fontSize: 13 }}>
                    Generate export packages for <strong style={{ color: THEME.blue }}>LORENZ docuBridge</strong> and <strong style={{ color: "#f39c12" }}>EXTEDO eCTDmanager</strong> — both fully compatible with ICH eCTD v3.2.2.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <div style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${THEME.blue}44`,
                    background: THEME.blue + "11", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11 }}>🔵</span>
                    <span style={{ fontSize: 11, color: THEME.blue, fontWeight: 700, fontFamily: "monospace" }}>LORENZ docuBridge</span>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid #f39c1244`,
                    background: "#f39c1211", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11 }}>🟠</span>
                    <span style={{ fontSize: 11, color: "#f39c12", fontWeight: 700, fontFamily: "monospace" }}>EXTEDO eCTDmanager</span>
                  </div>
                </div>
              </div>

              {/* SHARED: eCTD Folder Structure (same for both tools) */}
              <Card>
                <SectionTitle
                  sub="ICH M8 eCTD folder hierarchy — identical for docuBridge & Extedo"
                  right={dossier && <DownloadButton content={generateFolderScript(documents, appInfo)} filename="create-folders.sh" label="create-folders.sh" />}
                >
                  📁 Shared eCTD Folder Structure
                </SectionTitle>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Badge color={THEME.blue}>docuBridge</Badge>
                  <Badge color="#f39c12">Extedo</Badge>
                  <Badge color={THEME.green}>ICH M8 Standard</Badge>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.9,
                  background: THEME.surfaceAlt, padding: 16, borderRadius: 6, overflowX: "auto" }}>
                  <div style={{ color: "#e52934", fontWeight: 700 }}>📁 {appInfo.appNumber || "NDA000000"}/</div>
                  <div style={{ paddingLeft: 16, color: THEME.accent }}>📁 {(appInfo.sequence || "0000").padStart(4,"0")}/   ← sequence</div>
                  {CTD_MODULES.map((mod) => {
                    const modDocs = documents.filter((d) => d.moduleId === mod.id && d.analyzed);
                    return (
                      <div key={mod.id}>
                        <div style={{ paddingLeft: 32, color: mod.color, fontWeight: 600 }}>📁 {mod.ectdPath}/</div>
                        {modDocs.map((d) => (
                          <div key={d.id} style={{ paddingLeft: 48, color: THEME.textMuted }}>
                            <span style={{ color: THEME.textDim }}><PdfIcon size={12} /></span>
                            <span>{d.metadata?.ectdSection ? d.metadata.ectdSection.replace(mod.ectdPath + "/", "") + "/" : ""}</span>
                            <span style={{ color: THEME.text }}>{toEctdFilename(d.name)}</span>
                            <span style={{ color: THEME.blue }}> [{d.metadata?.operation || "new"}]</span>
                            {(d.moduleId === 4 || d.moduleId === 5) && <span style={{ color: "#f39c12" }}> ← STF required</span>}
                          </div>
                        ))}
                        {mod.id === 2 && (<>
                          <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 23-quality-overall-summary/<span style={{ color: THEME.text }}>quality-overall-summary.pdf</span></div>
                          <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 24-nonclinical-overview/<span style={{ color: THEME.text }}>nonclinical-overview.pdf</span></div>
                          <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 25-clinical-overview/<span style={{ color: THEME.text }}>clinical-overview.pdf</span></div>
                        </>)}
                      </div>
                    );
                  })}
                  <div style={{ paddingLeft: 16, color: THEME.accent }}><PdfIcon size={11} /> index.xml   ← XML backbone (shared)</div>
                  <div style={{ paddingLeft: 16, color: "#f39c12" }}><PdfIcon size={11} /> envelope.xml  ← Extedo regional M1 envelope</div>
                  <div style={{ paddingLeft: 16, color: "#f39c12" }}>📁 stf/  ← Study Tagging Files (Extedo M4/M5)</div>
                  <div style={{ paddingLeft: 16, color: THEME.textMuted }}><PdfIcon size={11} /> util/</div>
                </div>
              </Card>

              {/* ── LORENZ docuBridge SECTION ── */}
              <div style={{ borderLeft: `3px solid ${THEME.blue}`, paddingLeft: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: THEME.blue + "22",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔵</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: THEME.blue }}>LORENZ docuBridge</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>docuBridge ONE · TWO · FIVE — eCTD v3.2.2</div>
                  </div>
                </div>

                {/* docuBridge How to Import */}
                <Card highlight={THEME.blue} style={{ marginBottom: 16 }}>
                  <SectionTitle sub="Step-by-step docuBridge import workflow">How to Import into docuBridge</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["1", "Download index.xml + manifest.csv below"],
                      ["2", "Open LORENZ docuBridge → File → New Sequence"],
                      ["3", "Enter Application Number and Sequence from the sidebar"],
                      ["4", "Import → Import from XML Backbone → select index.xml"],
                      ["5", "Use manifest.csv for batch document attribute import (TWO/FIVE only)"],
                      ["6", "Place PDF files into the generated eCTD folder structure"],
                      ["7", "Run LORENZ eValidator → verify no errors before submission"],
                    ].map(([num, text]) => (
                      <div key={num} style={{ display: "flex", gap: 12, alignItems: "center",
                        padding: "7px 12px", background: THEME.surfaceAlt, borderRadius: 6 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: THEME.blue + "33",
                          color: THEME.blue, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>{num}</span>
                        <span style={{ fontSize: 12, color: THEME.text }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
                  <Card>
                    <SectionTitle sub="ICH eCTD v3.2.2 XML backbone — primary docuBridge import file">index.xml</SectionTitle>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <Badge color={THEME.green}>eCTD v3.2.2</Badge>
                      <Badge color={THEME.blue}>docuBridge Ready</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      XML backbone with leaf nodes, lifecycle ops (new/replace/delete/append), MD5 checksums, and module hierarchy. Import via File → Import → XML Backbone.
                    </div>
                    {dossier ? <div style={{ display: "flex", gap: 8 }}>
                      <DownloadButton content={dossier.indexXML} filename="index.xml" label="index.xml" />
                      <CopyButton text={dossier.indexXML} label="Copy" />
                    </div> : <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first</div>}
                  </Card>
                  <Card>
                    <SectionTitle sub="Batch document attribute import — docuBridge TWO/FIVE">manifest.csv</SectionTitle>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <Badge color={THEME.accent}>Batch Import</Badge>
                      <Badge color={THEME.blue}>TWO / FIVE</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      CSV with file paths, CTD sections, lifecycle operations, drug substance, dosage form and route metadata for batch attribute import.
                    </div>
                    {dossier ? <div style={{ display: "flex", gap: 8 }}>
                      <DownloadButton content={dossier.manifestCSV} filename="docubridge-manifest.csv" label="manifest.csv" />
                      <CopyButton text={dossier.manifestCSV} label="Copy" />
                    </div> : <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first</div>}
                  </Card>
                </div>
              </div>

              {/* ── EXTEDO eCTDmanager SECTION ── */}
              <div style={{ borderLeft: `3px solid #f39c12`, paddingLeft: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f39c1222",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🟠</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#f39c12" }}>EXTEDO eCTDmanager</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>eCTDmanager v8+ · EXTEDOpulse · eCTD v3.2.2 + v4.0 · 21 CFR Part 11</div>
                  </div>
                </div>

                {/* Extedo How to Import */}
                <Card highlight="#f39c12" style={{ marginBottom: 16 }}>
                  <SectionTitle sub="Step-by-step Extedo eCTDmanager import workflow">How to Import into eCTDmanager</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["1", "Download envelope.xml + extedo-attributes.csv + stf-template.xml below"],
                      ["2", "Open EXTEDO eCTDmanager → New Sequence → enter Envelope Info"],
                      ["3", "Import envelope.xml via File → Import → Envelope / Backbone"],
                      ["4", "Add documents: File → Add from File System → map to CTD sections"],
                      ["5", "Import extedo-attributes.csv via Tools → Import Custom Attributes"],
                      ["6", "For M4/M5 studies: use STF Wizard → import stf-template.xml per study"],
                      ["7", "Run EXTEDO EURS Validator → resolve all errors and warnings"],
                      ["8", "Publish: File → Publish → select output format (eCTD, NeeS, IMPD, etc.)"],
                    ].map(([num, text]) => (
                      <div key={num} style={{ display: "flex", gap: 12, alignItems: "center",
                        padding: "7px 12px", background: THEME.surfaceAlt, borderRadius: 6 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f39c1233",
                          color: "#f39c12", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>{num}</span>
                        <span style={{ fontSize: 12, color: THEME.text }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Extedo Download Files */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                  {/* Envelope XML */}
                  <Card>
                    <SectionTitle sub="Regional M1 envelope — Extedo primary import file">envelope.xml</SectionTitle>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      <Badge color="#f39c12">Extedo M1</Badge>
                      <Badge color={THEME.green}>Region: {appInfo.country || "US"}</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Regional Module 1 envelope XML with applicant, product, submission date, application number, and regional metadata. Extedo's primary sequence entry point.
                    </div>
                    {dossier ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <DownloadButton content={generateExtedoEnvelope(documents, appInfo)} filename="envelope.xml" label="envelope.xml" />
                      <CopyButton text={generateExtedoEnvelope(documents, appInfo)} label="Copy" />
                    </div> : <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first</div>}
                  </Card>

                  {/* Custom Attributes CSV */}
                  <Card>
                    <SectionTitle sub="Extedo custom attribute import — Tools → Import">extedo-attributes.csv</SectionTitle>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      <Badge color="#f39c12">Custom Attrs</Badge>
                      <Badge color={THEME.purple}>21 CFR Part 11</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Extedo-format CSV with document titles, CTD node paths, document types, ICH controlled vocabulary terms, and lifecycle operations for bulk attribute import.
                    </div>
                    {dossier ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <DownloadButton content={generateExtedoAttributes(documents, appInfo)} filename="extedo-attributes.csv" label="attributes.csv" />
                      <CopyButton text={generateExtedoAttributes(documents, appInfo)} label="Copy" />
                    </div> : <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first</div>}
                  </Card>

                  {/* STF Template */}
                  <Card>
                    <SectionTitle sub="Study Tagging Files for M4/M5 — Extedo STF Wizard">stf-template.xml</SectionTitle>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      <Badge color="#f39c12">STF</Badge>
                      <Badge color={THEME.blue}>M4 + M5</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      ICH eCTD Study Tagging File template for nonclinical (4.2.x) and clinical (5.3.x) study reports. Required by FDA/EMA. Import via Extedo STF Wizard Window.
                    </div>
                    {dossier ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <DownloadButton content={generateSTF(documents, appInfo)} filename="stf-template.xml" label="stf-template.xml" />
                      <CopyButton text={generateSTF(documents, appInfo)} label="Copy" />
                    </div> : <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first</div>}
                  </Card>
                </div>

                {/* Extedo Output Formats */}
                <Card style={{ marginBottom: 0 }}>
                  <SectionTitle sub="All formats supported by EXTEDO eCTDmanager — select on publish">Supported Output Formats</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                    {[
                      ["eCTD v3.2.2", THEME.green, "ICH standard — FDA, EMA, JP"],
                      ["eCTD v4.0", "#2ecc71", "Next-gen — FDA mandatory 2025+"],
                      ["NeeS", THEME.blue, "Non-eCTD Electronic Submission"],
                      ["IMPD", "#f39c12", "Investigational Medicinal Product Dossier"],
                      ["CTA", "#f39c12", "Clinical Trial Application"],
                      ["ASMF", "#9b59b6", "Active Substance Master File"],
                      ["DMF", "#9b59b6", "Drug Master File"],
                      ["VNeeS", THEME.textMuted, "Veterinary NeeS"],
                      ["ACTD", THEME.textMuted, "ASEAN CTD"],
                      ["eCopy", THEME.textMuted, "EU eCopy format"],
                    ].map(([fmt, color, desc]) => (
                      <div key={fmt} style={{ background: THEME.surfaceAlt, borderRadius: 6, padding: "9px 10px",
                        border: `1px solid ${color}33` }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 700, color, fontSize: 11, marginBottom: 3 }}>{fmt}</div>
                        <div style={{ fontSize: 10, color: THEME.textMuted, lineHeight: 1.4 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* SHARED: XML Preview */}
              {dossier && (
                <Card>
                  <SectionTitle
                    sub="Shared ICH eCTD v3.2.2 backbone — used by both docuBridge and Extedo"
                    right={<button onClick={() => setXmlView((v) => !v)} style={{ padding: "4px 12px",
                      borderRadius: 4, border: `1px solid ${THEME.border}`, background: "transparent",
                      color: THEME.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                      {xmlView ? "Collapse" : "Preview index.xml"}
                    </button>}
                  >index.xml Preview</SectionTitle>
                  {xmlView && (
                    <pre style={{ margin: 0, fontSize: 11, color: THEME.text, background: THEME.surfaceAlt,
                      padding: 16, borderRadius: 6, overflowX: "auto", maxHeight: 400, overflowY: "auto",
                      lineHeight: 1.6, fontFamily: "monospace" }}>{dossier.indexXML}</pre>
                  )}
                  {!xmlView && <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Click "Preview index.xml" to expand.</div>}
                </Card>
              )}

              {/* How to Import */}
              <Card highlight={THEME.blue}>
                <SectionTitle sub="Step-by-step docuBridge import workflow">How to Import into docuBridge</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["1", "Download the files below (index.xml + manifest CSV + folder structure)"],
                    ["2", "Open LORENZ docuBridge → File → New Sequence"],
                    ["3", "Enter the Application Number and Sequence from the sidebar"],
                    ["4", "Import → Import from XML Backbone → select index.xml"],
                    ["5", "Use the Manifest CSV to batch-import document attributes"],
                    ["6", "Copy your PDF files into the generated folder structure"],
                    ["7", "Run LORENZ eValidator to check compliance before submission"],
                  ].map(([num, text]) => (
                    <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "8px 12px", background: THEME.surfaceAlt, borderRadius: 6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: THEME.blue + "33",
                        color: THEME.blue, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>{num}</span>
                      <span style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Download Files */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* index.xml */}
                <Card>
                  <SectionTitle sub="ICH eCTD v3.2.2 XML backbone — primary docuBridge import file">
                    index.xml — XML Backbone
                  </SectionTitle>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <Badge color={THEME.green}>eCTD v3.2.2</Badge>
                    <Badge color={THEME.blue}>docuBridge Ready</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                    Contains application metadata, module structure, leaf nodes with lifecycle operations (new/replace/delete/append), file paths, and checksums. Import directly into docuBridge via File → Import → XML Backbone.
                  </div>
                  {dossier ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <DownloadButton content={dossier.indexXML} filename="index.xml" label="index.xml" />
                      <CopyButton text={dossier.indexXML} label="Copy XML" />
                    </div>
                  ) : (
                    <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first to download</div>
                  )}
                </Card>

                {/* Manifest CSV */}
                <Card>
                  <SectionTitle sub="Document metadata manifest for docuBridge batch import">
                    manifest.csv — Document Manifest
                  </SectionTitle>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <Badge color={THEME.accent}>Batch Import</Badge>
                    <Badge color={THEME.blue}>docuBridge TWO/FIVE</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                    CSV with file paths, document titles, CTD module, eCTD section, lifecycle operation, and extracted metadata. Use with docuBridge's batch attribute import feature.
                  </div>
                  {dossier ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <DownloadButton content={dossier.manifestCSV} filename="raisa-manifest.csv" label="manifest.csv" />
                      <CopyButton text={dossier.manifestCSV} label="Copy CSV" />
                    </div>
                  ) : (
                    <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>Generate dossier first to download</div>
                  )}
                </Card>
              </div>

              {/* Folder Structure */}
              <Card>
                <SectionTitle
                  sub="ICH M8 / docuBridge eCTD folder hierarchy"
                  right={dossier && <DownloadButton content={generateFolderScript(documents, appInfo)} filename="create-folders.sh" label="create-folders.sh" />}
                >
                  eCTD Folder Structure
                </SectionTitle>
                <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.9,
                  background: THEME.surfaceAlt, padding: 16, borderRadius: 6, overflowX: "auto" }}>
                  <div style={{ color: "#e52934", fontWeight: 700 }}>📁 {appInfo.appNumber || "NDA000000"}/</div>
                  <div style={{ paddingLeft: 16, color: THEME.accent }}>📁 {(appInfo.sequence || "0000").padStart(4,"0")}/   ← sequence</div>
                  {CTD_MODULES.map((mod) => {
                    const modDocs = documents.filter((d) => d.moduleId === mod.id && d.analyzed);
                    return (
                      <div key={mod.id}>
                        <div style={{ paddingLeft: 32, color: mod.color, fontWeight: 600 }}>📁 {mod.ectdPath}/</div>
                        {modDocs.map((d) => (
                          <div key={d.id} style={{ paddingLeft: 48, color: THEME.textMuted }}>
                            <span style={{ color: THEME.textDim }}><PdfIcon size={12} /></span>
                            <span>{d.metadata?.ectdSection ? d.metadata.ectdSection.replace(mod.ectdPath + "/", "") + "/" : ""}</span>
                            <span style={{ color: THEME.text }}>{toEctdFilename(d.name)}</span>
                            <span style={{ color: THEME.blue }}> [{d.metadata?.operation || "new"}]</span>
                          </div>
                        ))}
                        {mod.id === 2 && (
                          <>
                            <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 23-quality-overall-summary/<span style={{ color: THEME.text }}>quality-overall-summary.pdf</span> <span style={{ color: THEME.blue }}>[new]</span></div>
                            <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 24-nonclinical-overview/<span style={{ color: THEME.text }}>nonclinical-overview.pdf</span> <span style={{ color: THEME.blue }}>[new]</span></div>
                            <div style={{ paddingLeft: 48, color: THEME.textMuted }}>📁 25-clinical-overview/<span style={{ color: THEME.text }}>clinical-overview.pdf</span> <span style={{ color: THEME.blue }}>[new]</span></div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ paddingLeft: 16, color: THEME.accent }}><PdfIcon size={11} /> index.xml   ← XML backbone</div>
                  <div style={{ paddingLeft: 16, color: THEME.textMuted }}><PdfIcon size={11} /> util/</div>
                </div>
              </Card>

              {/* XML Preview */}
              {dossier && (
                <Card>
                  <SectionTitle
                    sub="ICH eCTD v3.2.2 XML backbone preview"
                    right={<button onClick={() => setXmlView((v) => !v)} style={{ padding: "4px 12px",
                      borderRadius: 4, border: `1px solid ${THEME.border}`, background: "transparent",
                      color: THEME.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                      {xmlView ? "Collapse" : "Expand XML"}
                    </button>}
                  >index.xml Preview</SectionTitle>
                  {xmlView && (
                    <pre style={{ margin: 0, fontSize: 11, color: THEME.text, background: THEME.surfaceAlt,
                      padding: 16, borderRadius: 6, overflowX: "auto", maxHeight: 400,
                      overflowY: "auto", lineHeight: 1.6, fontFamily: "monospace" }}>
                      {dossier.indexXML}
                    </pre>
                  )}
                  {!xmlView && (
                    <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>
                      Click "Expand XML" to preview the full backbone file.
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === "import" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 860 }}>
              <Card style={{ marginBottom: 16 }}>
                <SectionTitle sub="Import eCTD sequences, legacy dossiers, or structured data packages into RAISA">
                  Import
                </SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                  {/* eCTD Sequence Import */}
                  <div style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderRadius: 4, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>📦</span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.text }}>eCTD Sequence Package</div>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Import a zipped eCTD sequence folder (with index.xml backbone). RAISA will parse the structure, extract metadata, and populate the dossier tree.
                    </div>
                    <div style={{ border: `2px dashed ${THEME.border}`, borderRadius: 4, padding: "18px 12px", textAlign: "center", cursor: "pointer", color: THEME.textMuted, fontSize: 11, background: "#fff" }}
                      onClick={() => addLog("eCTD import: feature coming soon", "info")}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🗜</div>
                      <div style={{ fontWeight: 600 }}>Drop .zip eCTD package here</div>
                      <div style={{ fontSize: 10, marginTop: 3 }}>Supports ICH eCTD v3.2.2 and v4.0</div>
                    </div>
                  </div>

                  {/* NeeS / Legacy Import */}
                  <div style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderRadius: 4, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>🗃</span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.text }}>NeeS / Legacy Dossier</div>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Import a Non-eCTD Electronic Submission (NeeS) or unstructured legacy dossier. AI will classify documents and map them to CTD sections.
                    </div>
                    <div style={{ border: `2px dashed ${THEME.border}`, borderRadius: 4, padding: "18px 12px", textAlign: "center", cursor: "pointer", color: THEME.textMuted, fontSize: 11, background: "#fff" }}
                      onClick={() => addLog("Legacy import: feature coming soon", "info")}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>📂</div>
                      <div style={{ fontWeight: 600 }}>Drop folder or .zip here</div>
                      <div style={{ fontSize: 10, marginTop: 3 }}>PDF · DOCX · XLSX — AI auto-classifies</div>
                    </div>
                  </div>

                  {/* docuBridge Export Import */}
                  <div style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderRadius: 4, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, color: THEME.blue }}>🔵</span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.text }}>docuBridge Export File</div>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Import a LORENZ docuBridge .dbx or manifest CSV. RAISA will reconstruct the eCTD structure and populate the sequence history.
                    </div>
                    <div style={{ border: `2px dashed ${THEME.border}`, borderRadius: 4, padding: "18px 12px", textAlign: "center", cursor: "pointer", color: THEME.textMuted, fontSize: 11, background: "#fff" }}
                      onClick={() => addLog("docuBridge import: feature coming soon", "info")}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🔵</div>
                      <div style={{ fontWeight: 600 }}>Drop .dbx or manifest.csv here</div>
                      <div style={{ fontSize: 10, marginTop: 3 }}>LORENZ docuBridge TWO / FIVE</div>
                    </div>
                  </div>

                  {/* Extedo Import */}
                  <div style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderRadius: 4, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>🟠</span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.text }}>EXTEDO eCTDmanager</div>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                      Import EXTEDO eCTDmanager envelope.xml or attributes CSV. Parses regional M1 metadata and reconstructs the submission tree.
                    </div>
                    <div style={{ border: `2px dashed ${THEME.border}`, borderRadius: 4, padding: "18px 12px", textAlign: "center", cursor: "pointer", color: THEME.textMuted, fontSize: 11, background: "#fff" }}
                      onClick={() => addLog("EXTEDO import: feature coming soon", "info")}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🟠</div>
                      <div style={{ fontWeight: 600 }}>Drop envelope.xml or .csv here</div>
                      <div style={{ fontSize: 10, marginTop: 3 }}>EXTEDO eCTDmanager compatible</div>
                    </div>
                  </div>

                </div>
              </Card>
            </div>
          )}

          {/* ARCHIVES TAB */}
          {activeTab === "archives" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 860 }}>
              <Card style={{ marginBottom: 16 }}>
                <SectionTitle sub="Archived submissions, completed sequences, and historical dossier records">
                  Archives
                </SectionTitle>
                {sequenceHistory.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: THEME.textMuted, fontSize: 12 }}>
                    No archived submissions yet. Completed sequences will appear here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "70px 90px 100px 1fr 80px 80px", gap: 0,
                      background: THEME.surfaceAlt, borderBottom: `2px solid ${THEME.accent}`, padding: "8px 12px",
                      fontSize: 10, fontWeight: 700, color: THEME.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      <div>Seq</div><div>Date</div><div>Type</div><div>Summary</div><div>Status</div><div>Region</div>
                    </div>
                    {sequenceHistory.map((seq, idx) => (
                      <div key={seq.seq} style={{ display: "grid", gridTemplateColumns: "70px 90px 100px 1fr 80px 80px", gap: 0,
                        padding: "10px 12px", borderBottom: `1px solid ${THEME.border}`,
                        background: idx % 2 === 0 ? "#fff" : THEME.surfaceAlt,
                        fontSize: 11, alignItems: "center" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color: THEME.accent }}>SEQ {seq.seq}</div>
                        <div style={{ color: THEME.textMuted }}>{seq.date}</div>
                        <div style={{ color: THEME.text, fontWeight: 600 }}>{seq.subType}</div>
                        <div style={{ color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seq.changes}</div>
                        <div>
                          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, fontWeight: 700,
                            background: seq.status === "Approved" ? THEME.green + "20" : seq.status === "Under Review" ? THEME.blue + "20" : THEME.textMuted + "20",
                            color: seq.status === "Approved" ? THEME.green : seq.status === "Under Review" ? THEME.blue : THEME.textMuted }}>
                            {seq.status}
                          </span>
                        </div>
                        <div style={{ color: THEME.textMuted }}>{appInfo.country || "US"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Archived Dossier Packages */}
              <Card>
                <SectionTitle sub="Previously generated eCTD packages available for download or review">
                  Archived Packages
                </SectionTitle>
                <div style={{ padding: 24, textAlign: "center", color: THEME.textMuted, fontSize: 12, background: THEME.surfaceAlt, borderRadius: 4, border: `1px dashed ${THEME.border}` }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🗄</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>No archived packages</div>
                  <div style={{ fontSize: 11 }}>Generate a dossier and export it — it will be stored here for future reference.</div>
                </div>
              </Card>
            </div>
          )}

          {/* ── VALIDATION TAB ── */}
          {activeTab === "validation" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Consistency Validation</h2>
              <p style={{ margin: "0 0 20px", color: THEME.textMuted, fontSize: 13 }}>
                Cross-module checks + pre-submission checklists for <strong style={{ color: THEME.blue }}>LORENZ eValidator</strong> and <strong style={{ color: "#f39c12" }}>EXTEDO EURS Validator</strong>.
              </p>
              <Card style={{ marginBottom: 16 }}>
                <SectionTitle>Dossier Completeness</SectionTitle>
                {CTD_MODULES.map((mod) => {
                  const count = documents.filter((d) => d.moduleId === mod.id && d.analyzed).length;
                  return <div key={mod.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: mod.color, fontWeight: 600 }}>{mod.label} — {mod.title}</span>
                      <span style={{ color: THEME.textMuted }}>{count} doc{count !== 1 ? "s" : ""}</span>
                    </div>
                    <ProgressBar value={Math.min(100, count * 25)} color={mod.color} />
                  </div>;
                })}
              </Card>
              <Card style={{ marginBottom: 16 }}>
                <SectionTitle sub={`${validationIssues.length} issue(s) flagged by AI`}>Regulatory Flags</SectionTitle>
                {validationIssues.length === 0 ? (
                  <div style={{ color: THEME.green, fontSize: 13 }}>✓ No validation issues detected</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {validationIssues.map((issue, i) => (
                      <div key={i} style={{ background: THEME.surfaceAlt, borderRadius: 6, padding: "10px 14px",
                        border: `1px solid ${THEME.accent}44`, display: "flex", gap: 10 }}>
                        <span style={{ color: THEME.accent }}>⚠</span>
                        <div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: "monospace" }}>{issue.doc}</div>
                          <div style={{ fontSize: 12, color: THEME.text }}>{issue.flag}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card highlight={THEME.blue}>
                  <SectionTitle sub="LORENZ eValidator — run before docuBridge submission">🔵 docuBridge eValidator Checklist</SectionTitle>
                  {[
                    ["XML backbone well-formed", "DTD compliance via eValidator"],
                    ["File naming", "Lowercase, hyphens only, .pdf extension"],
                    ["Lifecycle operations", "new / replace / delete / append on all leaves"],
                    ["Hyperlinks", "eValidator scans for broken cross-document links"],
                    ["PDF/A compliance", "PDF/A-1b or PDF 1.4–1.7 required"],
                    ["Sequence numbering", "4-digit zero-padded: 0000, 0001…"],
                    ["MD5 checksums", "index.xml checksums must match actual files"],
                    ["M1 region folders", "US: m1/us/ · EU: m1/eu/ · JP: m1/jp/"],
                  ].map(([check, hint]) => (
                    <div key={check} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <span style={{ color: THEME.textDim, fontSize: 14, flexShrink: 0 }}>☐</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{check}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>{hint}</div>
                      </div>
                    </div>
                  ))}
                </Card>
                <Card highlight="#f39c12">
                  <SectionTitle sub="EXTEDO EURS Validator — run before eCTDmanager submission">🟠 EXTEDO EURS Validator Checklist</SectionTitle>
                  {[
                    ["Envelope XML valid", "envelope.xml must validate against regional DTD"],
                    ["Custom attributes complete", "All Extedo-required fields populated in attributes CSV"],
                    ["STFs for M4/M5", "STF required for 4.2.x and 5.3.1.x–5.3.5.x sections"],
                    ["STF file-tags correct", "Each study file must have correct file-tag element"],
                    ["Hyperlink engine", "Extedo auto-removes broken hyperlinks during export"],
                    ["21 CFR Part 11", "Audit trail and electronic signatures enabled"],
                    ["eCTD v4.0 readiness", "Verify metadata structure for v4.0 if applicable"],
                    ["EURS profiles", "Select correct regional profile: EU/US/JP/GCC/CH/AU"],
                  ].map(([check, hint]) => (
                    <div key={check} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <span style={{ color: THEME.textDim, fontSize: 14, flexShrink: 0 }}>☐</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{check}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>{hint}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* ── PLCM TAB ── */}
          {activeTab === "plcm" && (
            <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: 0 }}>
              {/* PLCM Header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 24 }}>🔄</span>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Product Lifecycle Management</h2>
                  <Badge color={THEME.purple}>ICH Q12</Badge>
                </div>
                <p style={{ margin: 0, color: THEME.textMuted, fontSize: 13 }}>
                  Manage Established Conditions, post-approval CMC changes, PACMPs, and submission sequences across the full product lifecycle.
                </p>
              </div>

              {/* PLCM Sub-nav */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 12 }}>
                {[
                  { id: "timeline", label: "📅 Sequence Timeline", color: THEME.blue },
                  { id: "ec", label: "📋 EC Register", color: THEME.green },
                  { id: "change", label: "⚡ Change Assessor", color: THEME.accent },
                  { id: "pacmp", label: "📑 PACMP Tracker", color: THEME.purple },
                  { id: "document", label: "PDF PLCM Document", color: THEME.brand },
                ].map((s) => (
                  <button key={s.id} onClick={() => setPlcmActiveSection(s.id)} style={{
                    padding: "7px 16px", borderRadius: 6, border: `1px solid ${plcmActiveSection === s.id ? s.color + "66" : THEME.border}`,
                    background: plcmActiveSection === s.id ? s.color + "18" : "transparent",
                    color: plcmActiveSection === s.id ? s.color : THEME.textMuted,
                    fontWeight: plcmActiveSection === s.id ? 700 : 500, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
                  }}>{s.label}</button>
                ))}
              </div>

              {/* ── TIMELINE SECTION ── */}
              {plcmActiveSection === "timeline" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card>
                    <SectionTitle
                      sub="Chronological history of all eCTD sequences and post-approval changes"
                      right={<GlowButton variant="secondary" onClick={() => setPlcmShowAddSeq(true)} style={{ fontSize: 11, padding: "5px 14px" }}>+ Add Sequence</GlowButton>}
                    >Submission Sequence Timeline</SectionTitle>

                    {/* Timeline visual */}
                    <div style={{ position: "relative", paddingLeft: 32 }}>
                      <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: THEME.border }} />
                      {sequenceHistory.map((seq, i) => {
                        const statusColor = seq.status === "Approved" ? THEME.green : seq.status === "Pending" ? THEME.accent : seq.status === "Rejected" ? THEME.red : THEME.blue;
                        return (
                          <div key={seq.seq} style={{ position: "relative", marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
                            <div style={{ position: "absolute", left: -27, top: 4, width: 16, height: 16, borderRadius: "50%",
                              background: statusColor, border: `2px solid ${THEME.bg}`, boxShadow: `0 0 8px ${statusColor}88` }} />
                            <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: "12px 16px",
                              border: `1px solid ${statusColor}33` }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <span style={{ fontFamily: "monospace", fontWeight: 700, color: THEME.accent, fontSize: 13 }}>SEQ {seq.seq}</span>
                                <Badge color={statusColor}>{seq.status}</Badge>
                                <Badge color={THEME.blue}>{seq.subType}</Badge>
                                <Badge color={THEME.textMuted}>{seq.type}</Badge>
                                <span style={{ marginLeft: "auto", fontSize: 11, color: THEME.textMuted, fontFamily: "monospace" }}>{seq.date}</span>
                              </div>
                              <div style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5, marginBottom: seq.ecChanges?.length ? 8 : 0 }}>{seq.changes}</div>
                              {seq.ecChanges?.length > 0 && (
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                  <span style={{ fontSize: 11, color: THEME.textMuted }}>EC Changes:</span>
                                  {seq.ecChanges.map((ec) => <Badge key={ec} color={THEME.green}>{ec}</Badge>)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Sequence Form */}
                    {plcmShowAddSeq && (
                      <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 16, border: `1px solid ${THEME.blue}44`, marginTop: 8 }}>
                        <SectionTitle sub="Record a new eCTD submission sequence">New Sequence</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                          {[
                            ["Sequence No.", "seq", String(sequenceHistory.length).padStart(4,"0")],
                            ["Date", "date", new Date().toISOString().split("T")[0]],
                            ["Status", "status", "Pending"],
                          ].map(([label, key, ph]) => (
                            <div key={key}>
                              <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>{label}</div>
                              <input type="text" placeholder={ph} value={newSeq[key] || ""} onChange={(e) => setNewSeq((p) => ({ ...p, [key]: e.target.value }))} />
                            </div>
                          ))}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Type</div>
                          <select value={newSeq.subType} onChange={(e) => setNewSeq((p) => ({ ...p, subType: e.target.value }))} style={{ width: "100%" }}>
                            {(REGION_SUB_TYPES[appInfo.country] || REGION_SUB_TYPES["US"]).map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Change Description</div>
                          <input type="text" placeholder="Describe the changes in this sequence..." value={newSeq.changes || ""} onChange={(e) => setNewSeq((p) => ({ ...p, changes: e.target.value }))} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 6, fontFamily: "monospace" }}>EC Changes (select affected ECs)</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {ecRegister.map((ec) => {
                              const sel = newSeq.ecChanges?.includes(ec.id);
                              return <button key={ec.id} onClick={() => setNewSeq((p) => ({ ...p, ecChanges: sel ? p.ecChanges.filter((x) => x !== ec.id) : [...(p.ecChanges||[]), ec.id] }))}
                                style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${sel ? THEME.green : THEME.border}`,
                                  background: sel ? THEME.green + "22" : "transparent", color: sel ? THEME.green : THEME.textMuted,
                                  cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                                {ec.ctdSection}
                              </button>;
                            })}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <GlowButton onClick={() => {
                            const seq = { seq: newSeq.seq || String(sequenceHistory.length).padStart(4,"0"), date: newSeq.date || new Date().toISOString().split("T")[0],
                              type: newSeq.subType || "Variation", subType: newSeq.subType || "CBE-30", changes: newSeq.changes || "", status: newSeq.status || "Pending", ecChanges: newSeq.ecChanges || [] };
                            setSequenceHistory((p) => [...p, seq]);
                            if (seq.ecChanges?.length) {
                              setEcRegister((p) => p.map((ec) => seq.ecChanges.includes(ec.id) ? { ...ec, lastChanged: seq.date, status: "Updated" } : ec));
                            }
                            setNewSeq({ type: "Variation", subType: "CBE-30", changes: "", ecChanges: [] });
                            setPlcmShowAddSeq(false);
                            addLog(`Sequence ${seq.seq} added to timeline`, "success");
                          }} style={{ fontSize: 12 }}>Add Sequence</GlowButton>
                          <GlowButton variant="secondary" onClick={() => setPlcmShowAddSeq(false)} style={{ fontSize: 12 }}>Cancel</GlowButton>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Summary stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      ["Total Sequences", sequenceHistory.length, THEME.blue],
                      ["Approved", sequenceHistory.filter((s) => s.status === "Approved").length, THEME.green],
                      ["Pending", sequenceHistory.filter((s) => s.status === "Pending").length, THEME.accent],
                      ["EC Changes", sequenceHistory.reduce((a, s) => a + (s.ecChanges?.length || 0), 0), THEME.purple],
                    ].map(([label, val, color]) => (
                      <Card key={label} style={{ textAlign: "center", padding: "14px 12px" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "monospace" }}>{val}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{label}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ── EC REGISTER SECTION ── */}
              {plcmActiveSection === "ec" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card>
                    <SectionTitle
                      sub="Established Conditions (ECs) per ICH Q12 — must report changes to regulatory authority"
                      right={<GlowButton variant="secondary" onClick={() => setPlcmShowAddEC(true)} style={{ fontSize: 11, padding: "5px 14px" }}>+ Add EC</GlowButton>}
                    >Established Conditions Register</SectionTitle>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: THEME.surfaceAlt }}>
                            {["CTD Section", "Established Condition", "Reporting Category", "Approved State", "Status", "Last Changed", "PACMP", "Actions"].map((h) => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: THEME.accent, fontWeight: 700,
                                letterSpacing: "0.06em", borderBottom: `1px solid ${THEME.border}`, fontFamily: "monospace", fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ecRegister.map((ec) => {
                            const catColor = ec.reportingCategory === "Prior Approval" ? THEME.red : ec.reportingCategory === "Notification" ? THEME.accent : THEME.green;
                            return (
                              <tr key={ec.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                <td style={{ padding: "10px 12px" }}><span style={{ fontFamily: "monospace", color: THEME.blue, fontSize: 11 }}>{ec.ctdSection}</span></td>
                                <td style={{ padding: "10px 12px", color: THEME.text, maxWidth: 200 }}>{ec.description}</td>
                                <td style={{ padding: "10px 12px" }}><Badge color={catColor}>{ec.reportingCategory}</Badge></td>
                                <td style={{ padding: "10px 12px", color: THEME.textMuted, fontSize: 11 }}>{ec.approvedState}</td>
                                <td style={{ padding: "10px 12px" }}><Badge color={ec.status === "Approved" ? THEME.green : ec.status === "Updated" ? THEME.blue : THEME.accent}>{ec.status}</Badge></td>
                                <td style={{ padding: "10px 12px", color: THEME.textMuted, fontSize: 11, fontFamily: "monospace" }}>{ec.lastChanged || "—"}</td>
                                <td style={{ padding: "10px 12px" }}>{ec.pacmpRef ? <Badge color={THEME.purple}>{ec.pacmpRef}</Badge> : <span style={{ color: THEME.textDim, fontSize: 11 }}>—</span>}</td>
                                <td style={{ padding: "10px 12px" }}>
                                  <button onClick={() => setEcRegister((p) => p.filter((e) => e.id !== ec.id))}
                                    style={{ background: "transparent", border: `1px solid ${THEME.red}44`, color: THEME.red,
                                      cursor: "pointer", borderRadius: 4, padding: "3px 8px", fontSize: 10 }}>Remove</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {plcmShowAddEC && (
                      <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 16, border: `1px solid ${THEME.green}44`, marginTop: 14 }}>
                        <SectionTitle sub="Define a new Established Condition for this product">Add Established Condition</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>CTD Section</div>
                            <input type="text" placeholder="e.g. 3.2.S.2.2" value={newEC.ctdSection} onChange={(e) => setNewEC((p) => ({ ...p, ctdSection: e.target.value }))} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>EC Description</div>
                            <input type="text" placeholder="e.g. Drug substance manufacturing process" value={newEC.description} onChange={(e) => setNewEC((p) => ({ ...p, description: e.target.value }))} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Reporting Category</div>
                            <select value={newEC.reportingCategory} onChange={(e) => setNewEC((p) => ({ ...p, reportingCategory: e.target.value }))} style={{ width: "100%" }}>
                              <option>Prior Approval</option>
                              <option>Notification</option>
                              <option>Annual Report</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Approved State</div>
                          <input type="text" placeholder="e.g. Batch size: 500 kg; Site: Facility A" value={newEC.approvedState} onChange={(e) => setNewEC((p) => ({ ...p, approvedState: e.target.value }))} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <GlowButton onClick={() => {
                            if (!newEC.ctdSection || !newEC.description) return;
                            setEcRegister((p) => [...p, { ...newEC, id: `ec-${Date.now()}`, status: "Approved", lastChanged: null, pacmpRef: "" }]);
                            setNewEC({ ctdSection: "", description: "", reportingCategory: "Prior Approval", approvedState: "" });
                            setPlcmShowAddEC(false);
                            addLog(`EC added: ${newEC.ctdSection}`, "success");
                          }} style={{ fontSize: 12 }}>Add EC</GlowButton>
                          <GlowButton variant="secondary" onClick={() => setPlcmShowAddEC(false)} style={{ fontSize: 12 }}>Cancel</GlowButton>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Reporting Category legend */}
                  <Card>
                    <SectionTitle sub="ICH Q12 reporting requirements for EC changes">Reporting Category Reference</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      {[
                        ["Prior Approval", THEME.red, "Submit and await HA approval BEFORE implementing change. Highest regulatory burden.", "Examples: new manufacturing site, process change affecting product quality"],
                        ["Notification", THEME.accent, "Submit notification to HA. May implement before or after submission depending on region.", "Examples: minor specification change, container closure update"],
                        ["Annual Report", THEME.green, "Report in next annual report. Lowest burden — implement immediately after internal QA approval.", "Examples: minor method refinements, non-EC process optimizations"],
                      ].map(([cat, color, desc, ex]) => (
                        <div key={cat} style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: "12px 14px", border: `1px solid ${color}44` }}>
                          <Badge color={color}>{cat}</Badge>
                          <div style={{ fontSize: 12, color: THEME.text, marginTop: 8, lineHeight: 1.5 }}>{desc}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6, fontStyle: "italic" }}>{ex}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── CHANGE ASSESSOR SECTION ── */}
              {plcmActiveSection === "change" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card glow>
                    <SectionTitle sub="Upload a document describing a proposed CMC change — AI determines if it affects Established Conditions and what submission is required">
                      ⚡ AI Change Impact Assessor
                    </SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <p style={{ margin: "0 0 14px", fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>
                          Upload a change control document, deviation report, or process change description. RAISA will cross-reference it against your EC Register and determine the required regulatory action.
                        </p>
                        <div onClick={() => changeDocRef.current?.click()}
                          style={{ border: `2px dashed ${changeDoc ? THEME.green : THEME.border}`, borderRadius: 8, padding: "20px 16px",
                            textAlign: "center", cursor: "pointer", background: changeDoc ? THEME.green + "11" : THEME.surfaceAlt,
                            marginBottom: 14, transition: "all 0.2s" }}>
                          <input ref={changeDocRef} type="file" style={{ display: "none" }} accept=".pdf,.docx,.txt"
                            onChange={(e) => setChangeDoc(e.target.files[0])} />
                          <div style={{ fontSize: 24, marginBottom: 8 }}>{changeDoc ? "✅" : "📋"}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: changeDoc ? THEME.green : THEME.text }}>
                            {changeDoc ? changeDoc.name : "Drop change document here"}
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>Change control record, deviation report, process description</div>
                        </div>
                        <GlowButton onClick={async () => {
                          if (!changeDoc) return;
                          setAssessingChange(true);
                          addLog(`Assessing change impact: ${changeDoc.name}`, "info");
                          try {
                            let text = `Filename: ${changeDoc.name}`;
                            if (changeDoc.type !== "application/pdf") text = await changeDoc.text().catch(() => text);
                            const ecSummary = ecRegister.map((ec) => `${ec.id}: ${ec.ctdSection} — ${ec.description} [${ec.reportingCategory}] Current state: ${ec.approvedState}`).join("\n");
                            const raw = await callClaude([{ role: "user", content: `You are an ICH Q12 regulatory expert. Analyze this proposed CMC change and determine its regulatory impact.\n\nProposed change document:\n${text.slice(0, 2000)}\n\nEstablished Conditions Register:\n${ecSummary}\n\nReturn ONLY valid JSON:\n{"changeTitle":"","changeSummary":"","affectedECs":["ec-id1"],"isECChange":true,"requiredSubmissionType":"Prior Approval|Notification|Annual Report|None","submissionRationale":"","riskLevel":"High|Medium|Low","recommendedAction":"","estimatedTimeline":"","pacmpApplicable":true,"pacmpRationale":""}` }],
                              "You are a senior pharmaceutical regulatory affairs expert specializing in ICH Q12 post-approval change management. Return ONLY valid JSON.");
                            let result;
                            try {
                              result = JSON.parse(raw.replace(/```json|```/g, "").trim());
                            } catch (e) {
                              result = { changeTitle: changeDoc.name, changeSummary: raw.slice(0, 300), isECChange: false, requiredSubmissionType: "None", riskLevel: "Low", recommendedAction: "Manual review required" };
                            }
                            setChangeAssessments((p) => [{ ...result, id: Date.now(), docName: changeDoc.name, date: new Date().toISOString().split("T")[0] }, ...p]);
                            setChangeDoc(null);
                            addLog(`✓ Change impact assessed: ${result.requiredSubmissionType}`, "success");
                          } catch (err) { addLog(`✗ Assessment failed: ${err.message}`, "error"); }
                          finally { setAssessingChange(false); }
                        }} disabled={!changeDoc || assessingChange} style={{ width: "100%" }}>
                          {assessingChange ? <><Spinner /> Assessing...</> : "⚡ Assess Change Impact"}
                        </GlowButton>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: THEME.accent, fontFamily: "monospace", marginBottom: 10, textTransform: "uppercase" }}>Assessment History</div>
                        {changeAssessments.length === 0 ? (
                          <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic", padding: "20px 0" }}>No assessments yet. Upload a change document to begin.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                            {changeAssessments.map((a) => {
                              const riskColor = a.riskLevel === "High" ? THEME.red : a.riskLevel === "Medium" ? THEME.accent : THEME.green;
                              const subColor = a.requiredSubmissionType === "Prior Approval" ? THEME.red : a.requiredSubmissionType === "Notification" ? THEME.accent : a.requiredSubmissionType === "Annual Report" ? THEME.green : THEME.textMuted;
                              return (
                                <div key={a.id} style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: "12px 14px",
                                  border: `1px solid ${riskColor}33` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text, flex: 1 }}>{a.changeTitle || a.docName}</span>
                                    <Badge color={riskColor}>{a.riskLevel} Risk</Badge>
                                  </div>
                                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                    <Badge color={subColor}>{a.requiredSubmissionType}</Badge>
                                    {a.isECChange && <Badge color={THEME.red}>EC Change</Badge>}
                                    {a.pacmpApplicable && <Badge color={THEME.purple}>PACMP Eligible</Badge>}
                                  </div>
                                  <div style={{ fontSize: 11, color: THEME.text, lineHeight: 1.5, marginBottom: 6 }}>{a.changeSummary}</div>
                                  <div style={{ fontSize: 11, color: THEME.accent, lineHeight: 1.5 }}>→ {a.recommendedAction}</div>
                                  {a.estimatedTimeline && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>Timeline: {a.estimatedTimeline}</div>}
                                  {a.affectedECs?.length > 0 && (
                                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 11, color: THEME.textMuted }}>Affected ECs:</span>
                                      {a.affectedECs.map((eid) => {
                                        const ec = ecRegister.find((e) => e.id === eid);
                                        return ec ? <Badge key={eid} color={THEME.green}>{ec.ctdSection}</Badge> : null;
                                      })}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 8, fontFamily: "monospace" }}>{a.date} · {a.docName}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Change Type Quick Reference */}
                  <Card>
                    <SectionTitle sub="ICH Q12 regulatory submission types for post-approval CMC changes">Submission Type Quick Reference</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["Prior Approval Supplement (PAS)", THEME.red, "New manufacturing site · Process changes affecting quality · New dosage form · Labeling changes (FDA US)"],
                        ["Changes Being Effected in 30 Days (CBE-30)", THEME.accent, "Manufacturing process improvement · Test method revision · Specification tightening"],
                        ["Changes Being Effected (CBE-0)", THEME.blue, "Quality improvement changes with no risk · New sterile site already validated"],
                        ["Annual Report", THEME.green, "Editorial changes · Low-risk manufacturing optimizations · Stability protocol minor updates"],
                        ["Variation Type II (EMA)", THEME.red, "Major variation requiring prior approval · New indication · Manufacturing site change"],
                        ["Variation Type IB (EMA)", THEME.accent, "Moderate variation — notify before implementing"],
                        ["Variation Type IA (EMA)", THEME.green, "Minor variation — immediate implementation + notification"],
                        ["PACMP-covered Change", THEME.purple, "Pre-agreed change using Post-Approval Change Management Protocol — streamlined submission"],
                      ].map(([type, color, desc]) => (
                        <div key={type} style={{ background: THEME.surfaceAlt, borderRadius: 6, padding: "10px 12px", border: `1px solid ${color}33` }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color, marginBottom: 4 }}>{type}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.5 }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── PACMP TRACKER SECTION ── */}
              {plcmActiveSection === "pacmp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card>
                    <SectionTitle
                      sub="Post-Approval Change Management Protocols — pre-agreed with regulatory authority (ICH Q12 Section 4)"
                      right={<GlowButton variant="secondary" onClick={() => setPlcmShowAddPACMP(true)} style={{ fontSize: 11, padding: "5px 14px" }}>+ Add PACMP</GlowButton>}
                    >PACMP Register</SectionTitle>

                    {pacmpLog.map((p) => {
                      const statusColor = p.status === "Active" ? THEME.green : p.status === "Pending Approval" ? THEME.accent : THEME.textMuted;
                      const linkedEC = ecRegister.find((ec) => ec.id === p.ecRef);
                      return (
                        <div key={p.id} style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: "14px 16px",
                          border: `1px solid ${statusColor}44`, marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: THEME.text, marginBottom: 4 }}>{p.title}</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Badge color={statusColor}>{p.status}</Badge>
                                <Badge color={THEME.blue}>{p.region}</Badge>
                                {linkedEC && <Badge color={THEME.green}>{linkedEC.ctdSection}</Badge>}
                              </div>
                            </div>
                            <button onClick={() => setPacmpLog((prev) => prev.filter((x) => x.id !== p.id))}
                              style={{ background: "transparent", border: `1px solid ${THEME.red}44`, color: THEME.red,
                                cursor: "pointer", borderRadius: 4, padding: "3px 8px", fontSize: 10 }}>Remove</button>
                          </div>
                          <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>
                          <div style={{ display: "flex", gap: 16, fontSize: 11, color: THEME.textMuted, fontFamily: "monospace" }}>
                            {p.submittedDate && <span>Submitted: <span style={{ color: THEME.text }}>{p.submittedDate}</span></span>}
                            {p.approvedDate && <span>Approved: <span style={{ color: THEME.green }}>{p.approvedDate}</span></span>}
                          </div>
                        </div>
                      );
                    })}

                    {pacmpLog.length === 0 && !plcmShowAddPACMP && (
                      <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>No PACMPs registered yet.</div>
                    )}

                    {plcmShowAddPACMP && (
                      <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 16, border: `1px solid ${THEME.purple}44`, marginTop: 8 }}>
                        <SectionTitle sub="Register a new Post-Approval Change Management Protocol">New PACMP</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Protocol Title</div>
                            <input type="text" placeholder="e.g. Manufacturing Site Transfer Protocol" value={newPACMP.title} onChange={(e) => setNewPACMP((p) => ({ ...p, title: e.target.value }))} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Linked EC</div>
                            <select value={newPACMP.ecRef} onChange={(e) => setNewPACMP((p) => ({ ...p, ecRef: e.target.value }))} style={{ width: "100%" }}>
                              <option value="">— Select EC —</option>
                              {ecRegister.map((ec) => <option key={ec.id} value={ec.id}>{ec.ctdSection}: {ec.description.slice(0,30)}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Region</div>
                            <select value={newPACMP.region} onChange={(e) => setNewPACMP((p) => ({ ...p, region: e.target.value }))} style={{ width: "100%" }}>
                              {["US","EU","JP","CA","AU","Global"].map((r) => <option key={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4, fontFamily: "monospace" }}>Protocol Description</div>
                          <input type="text" placeholder="Describe the scope and conditions of this PACMP..." value={newPACMP.description} onChange={(e) => setNewPACMP((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <GlowButton onClick={() => {
                            if (!newPACMP.title) return;
                            const pacmp = { ...newPACMP, id: `pacmp-${Date.now()}`, status: "Pending Approval", submittedDate: new Date().toISOString().split("T")[0] };
                            setPacmpLog((p) => [...p, pacmp]);
                            if (newPACMP.ecRef) setEcRegister((p) => p.map((ec) => ec.id === newPACMP.ecRef ? { ...ec, pacmpRef: pacmp.id } : ec));
                            setNewPACMP({ title: "", ecRef: "", description: "", region: "US" });
                            setPlcmShowAddPACMP(false);
                            addLog(`PACMP added: ${pacmp.title}`, "success");
                          }} style={{ fontSize: 12 }}>Register PACMP</GlowButton>
                          <GlowButton variant="secondary" onClick={() => setPlcmShowAddPACMP(false)} style={{ fontSize: 12 }}>Cancel</GlowButton>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card highlight={THEME.purple}>
                    <SectionTitle sub="How PACMPs reduce regulatory burden under ICH Q12">What PACMPs Enable</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["Predictability", "Pre-agreed criteria mean you know exactly what data is needed before starting studies"],
                        ["Streamlined Review", "HA reviews the protocol once; individual changes reviewed faster under it"],
                        ["Implementation Flexibility", "In some regions, implement change upon submission (not awaiting approval)"],
                        ["Lifecycle Planning", "Can be designed for recurring change types across a product's entire lifecycle"],
                      ].map(([title, desc]) => (
                        <div key={title} style={{ background: THEME.surfaceAlt, borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: THEME.purple, marginBottom: 4 }}>{title}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.5 }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── PLCM DOCUMENT SECTION ── */}
              {plcmActiveSection === "document" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card glow>
                    <SectionTitle sub="AI-generated ICH Q12 PLCM document — submit in eCTD Module 1, 2, or 3 depending on region">
                      Generate PLCM Document
                    </SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                      {[
                        ["US (FDA) → Module 1", THEME.blue, "Administrative section — M1 preferred by FDA"],
                        ["EU (EMA) → Module 3", THEME.green, "Quality section — EMA prefers Module 3.2.P"],
                        ["JP (PMDA) → Module 3", THEME.accent, "Quality section for Japan submissions"],
                      ].map(([label, color, desc]) => (
                        <div key={label} style={{ background: THEME.surfaceAlt, borderRadius: 6, padding: "10px 12px", border: `1px solid ${color}44` }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                    <GlowButton onClick={async () => {
                      setGenerating(true);
                      addLog("Generating PLCM document...", "info");
                      try {
                        const ecTable = ecRegister.map((ec) => `| ${ec.ctdSection} | ${ec.description} | ${ec.reportingCategory} | ${ec.approvedState || "As approved"} |`).join("\n");
                        const pacmpTable = pacmpLog.map((p) => `| ${p.title} | ${p.status} | ${p.region} | ${p.submittedDate || "TBD"} |`).join("\n");
                        const seqTable = sequenceHistory.map((s) => `| ${s.seq} | ${s.date} | ${s.subType} | ${s.changes} | ${s.status} |`).join("\n");
                        const drugName = documents.find((d) => d.metadata?.drugSubstanceName)?.metadata?.drugSubstanceName || appInfo.appNumber;
                        const plcmText = await callClaude([{ role: "user", content: `Generate a formal Product Lifecycle Management (PLCM) document per ICH Q12 for:\nProduct: ${drugName}\nApplicant: ${appInfo.applicant || "Applicant"}\nApplication: ${appInfo.appNumber}\n\nEstablished Conditions:\n${ecTable}\n\nPACMPs:\n${pacmpTable}\n\nSubmission History:\n${seqTable}\n\nInclude: executive summary, EC listing with CTD cross-references, reporting category justifications, PACMP summaries, post-approval commitment tracking, revision history, and regional placement guidance.` }],
                          "You are a senior regulatory affairs specialist. Write a formal ICH Q12-compliant PLCM document in professional regulatory language.");
                        setDossier((p) => ({ ...(p || {}), plcmDoc: plcmText }));
                        setActiveTab("plcm");
                        addLog("✓ PLCM document generated", "success");
                      } catch (err) { addLog(`✗ Failed: ${err.message}`, "error"); }
                      finally { setGenerating(false); }
                    }} disabled={generating}>
                      {generating ? <><Spinner /> Generating...</> : "⚡ Generate PLCM Document"}
                    </GlowButton>
                  </Card>

                  {dossier?.plcmDoc && (
                    <Card>
                      <SectionTitle
                        sub="ICH Q12 Product Lifecycle Management Document — ready for eCTD submission"
                        right={
                          <div style={{ display: "flex", gap: 8 }}>
                            <DownloadButton content={dossier.plcmDoc} filename="plcm-document.txt" label="Download PLCM" />
                            <CopyButton text={dossier.plcmDoc} label="Copy" />
                          </div>
                        }
                      >PLCM Document</SectionTitle>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <Badge color={THEME.green}>ICH Q12</Badge>
                        <Badge color={THEME.blue}>Module 1 / 3 Ready</Badge>
                        <Badge color={THEME.blue}>docuBridge</Badge>
                        <Badge color="#f39c12">Extedo</Badge>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.8, color: THEME.text, whiteSpace: "pre-wrap",
                        background: THEME.surfaceAlt, padding: 16, borderRadius: 6, maxHeight: 500, overflowY: "auto" }}>
                        {dossier.plcmDoc}
                      </div>
                      <div style={{ marginTop: 10, padding: "10px 14px", background: THEME.surfaceAlt, borderRadius: 6, border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.accent, fontFamily: "monospace", marginBottom: 6 }}>eCTD PLACEMENT</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          {[["US/FDA", "m1/us/administrative/plcm-document.pdf"], ["EU/EMA", "m3/32p/plcm-document.pdf"], ["JP/PMDA", "m3/32p/plcm-document.pdf"]].map(([region, path]) => (
                            <div key={region} style={{ fontSize: 11 }}>
                              <span style={{ color: THEME.textMuted }}>{region}: </span>
                              <span style={{ color: THEME.blue, fontFamily: "monospace" }}>{path}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* EC Register Summary for PLCM doc */}
                  <Card>
                    <SectionTitle sub="Established Conditions table — included in PLCM document">EC Summary Table</SectionTitle>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: THEME.surfaceAlt }}>
                            {["CTD Section", "Established Condition", "Reporting Category", "Current Approved State", "PACMP"].map((h) => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: THEME.accent, fontWeight: 700,
                                borderBottom: `1px solid ${THEME.border}`, fontFamily: "monospace", fontSize: 10 }}>{h.toUpperCase()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ecRegister.map((ec) => {
                            const catColor = ec.reportingCategory === "Prior Approval" ? THEME.red : ec.reportingCategory === "Notification" ? THEME.accent : THEME.green;
                            const linkedPACMP = pacmpLog.find((p) => p.ecRef === ec.id);
                            return (
                              <tr key={ec.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                <td style={{ padding: "10px 12px" }}><span style={{ fontFamily: "monospace", color: THEME.blue, fontSize: 11 }}>{ec.ctdSection}</span></td>
                                <td style={{ padding: "10px 12px", color: THEME.text }}>{ec.description}</td>
                                <td style={{ padding: "10px 12px" }}><Badge color={catColor}>{ec.reportingCategory}</Badge></td>
                                <td style={{ padding: "10px 12px", color: THEME.textMuted, fontSize: 11 }}>{ec.approvedState || "As approved"}</td>
                                <td style={{ padding: "10px 12px" }}>{linkedPACMP ? <Badge color={THEME.purple}>{linkedPACMP.title.slice(0,20)}…</Badge> : <span style={{ color: THEME.textDim, fontSize: 11 }}>None</span>}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* LOG TAB */}
          {activeTab === "log" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Processing Log</h2>
              <p style={{ margin: "0 0 20px", color: THEME.textMuted, fontSize: 13 }}>Audit trail of all operations.</p>
              <Card>
                {log.length === 0 ? <div style={{ color: THEME.textDim, fontSize: 12, fontStyle: "italic" }}>No operations logged yet.</div> : (
                  <div style={{ fontFamily: "monospace", fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    {log.map((entry, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "5px 0", borderBottom: `1px solid ${THEME.border}` }}>
                        <span style={{ color: THEME.textDim, flexShrink: 0 }}>{entry.ts}</span>
                        <span style={{ color: entry.type === "success" ? THEME.green : entry.type === "error" ? THEME.red : THEME.text }}>{entry.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* ── DOCUMENT PREVIEW PANE (docuBridge right pane) ── */}
        {selectedDocNode && (() => {
          const parts = selectedDocNode.split("-");
          const modNum = parseInt(parts[0]) || null;
          const reqDocs = getMergedRequirements(appInfo.country, appInfo.productCategory || "ALL", appInfo.subType || "NDA");
          const doc = reqDocs.find((d) => String(d.module) + "-" + d.section === selectedDocNode);
          const modColor = modNum ? (MODULE_COLORS[modNum] || THEME.accent) : THEME.accent;
          const seqBadge = (appInfo.sequence || "0000").padStart(4, "0");
          const template = doc && appInfo ? (() => { try { return getDocTemplate(doc.section, appInfo); } catch(e) { return null; } })() : null;
          return (
            <div style={{ width: 380, flexShrink: 0, borderLeft: "1px solid #C8CDD6", display: "flex",
              flexDirection: "column", background: "#FFFFFF", boxShadow: "-2px 0 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Header bar */}
              <div style={{ background: "#3D5A8A", color: "#FFF", padding: "6px 12px",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="1" y="1" width="11" height="11" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
                  <line x1="3" y1="4.5" x2="10" y2="4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8"/>
                  <line x1="3" y1="6.5" x2="10" y2="6.5" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8"/>
                  <line x1="3" y1="8.5" x2="7" y2="8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, flex: 1, fontFamily: "'Segoe UI', sans-serif",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {seqBadge} {doc ? doc.title : selectedDocNode}
                </span>
                <button onClick={() => setSelectedDocNode(null)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                    color: "#FFF", cursor: "pointer", padding: "1px 7px", borderRadius: 2, fontSize: 12, fontWeight: 700 }}>✕</button>
              </div>
              {/* Metadata strip */}
              {doc && (
                <div style={{ background: "#F2F5FA", borderBottom: "1px solid #D8DBE8", padding: "6px 12px",
                  display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, fontWeight: 700,
                    background: doc.required ? "#EAF2FF" : "#F4F4F4",
                    color: doc.required ? THEME.accent : "#888",
                    border: "1px solid " + (doc.required ? "#B8CCE4" : "#DDD") }}>
                    {doc.required ? "Required" : "Optional"}
                  </span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                    background: modColor + "18", color: modColor, border: "1px solid " + modColor + "40" }}>
                    M{modNum}
                  </span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10,
                    background: "#F0F0F0", color: "#555", border: "1px solid #DDD", fontFamily: "monospace" }}>
                    § {doc.section}
                  </span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setCheckedDocs(p => ({ ...p, [selectedDocNode]: !p[selectedDocNode] }))}
                    style={{ fontSize: 9, padding: "2px 10px",
                      background: checkedDocs[selectedDocNode] ? THEME.green : "transparent",
                      color: checkedDocs[selectedDocNode] ? "#fff" : THEME.accent,
                      border: "1px solid " + (checkedDocs[selectedDocNode] ? THEME.green : THEME.accent),
                      borderRadius: 2, cursor: "pointer" }}>
                    {checkedDocs[selectedDocNode] ? "✓ Done" : "Mark Ready"}
                  </button>
                </div>
              )}
              {/* Content */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {template ? (
                  <div>
                    <div style={{ background: "#F6F7F9", padding: "8px 14px", borderBottom: "1px solid #E4E6EC",
                      display: "flex", justifyContent: "space-between", fontSize: 9, color: "#888", fontFamily: "monospace" }}>
                      <span>{doc?.section} · {appInfo.subType || "NDA"} · {appInfo.country || "US"}</span>
                      <span>SEQ {seqBadge}</span>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <pre style={{ margin: 0, fontFamily: "'Courier New', monospace", fontSize: 10, lineHeight: 1.7,
                        color: "#2A2A2A", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{template}</pre>
                    </div>
                    <div style={{ background: "#F4F5F8", borderTop: "1px solid #E0E2EA", padding: "6px 12px", display: "flex", gap: 8 }}>
                      <button onClick={() => { const blob = new Blob([template], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (doc?.section || "doc") + "-template.txt"; a.click(); }}
                        style={{ fontSize: 10, padding: "4px 12px", background: THEME.accent, color: "#fff", border: "none", borderRadius: 2, cursor: "pointer" }}>⬇ Download</button>
                      <button onClick={() => navigator.clipboard?.writeText(template)}
                        style={{ fontSize: 10, padding: "4px 12px", background: "#fff", color: THEME.accent, border: "1px solid " + THEME.accent, borderRadius: 2, cursor: "pointer" }}>Copy</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "32px 20px", textAlign: "center" }}>
                    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" style={{ marginBottom: 12 }}>
                      <rect x="3" y="2" width="28" height="38" rx="3" fill="#F0F2F6" stroke="#D0D4DC" strokeWidth="1.2"/>
                      <path d="M25 2l8 8v2h-8V2Z" fill="#DDE1EC" stroke="#C4C8D8" strokeWidth="0.8"/>
                      <line x1="8" y1="17" x2="26" y2="17" stroke="#E0E4EC" strokeWidth="1.2"/>
                      <line x1="8" y1="23" x2="26" y2="23" stroke="#E0E4EC" strokeWidth="1.2"/>
                      <line x1="8" y1="29" x2="18" y2="29" stroke="#E0E4EC" strokeWidth="1.2"/>
                    </svg>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>
                      {doc ? doc.title : "Select a document"}
                    </div>
                    {doc?.desc && <div style={{ fontSize: 11, color: "#AAA", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 14px" }}>{doc.desc}</div>}
                    {!doc && <div style={{ fontSize: 11, color: "#BBB", fontStyle: "italic" }}>Click any item in the outline to preview it here</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TEMPLATE MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {templateDoc && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(5,8,20,0.88)",
          backdropFilter: "blur(8px)", zIndex: 9999,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 0 0 0",
        }} onClick={(e) => { if (e.target === e.currentTarget) setTemplateDoc(null); }}>
          <div style={{
            width: "100%", maxWidth: "100vw", height: "95vh",
            background: THEME.surface, borderTop: `2px solid ${MODULE_COLORS[templateDoc.module]}`,
            display: "flex", flexDirection: "column", animation: "slideUp 0.25s ease",
          }}>
            {/* ── Header bar ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 24px",
              borderBottom: `1px solid ${THEME.border}`,
              background: MODULE_COLORS[templateDoc.module] + "12",
            }}>
              <span style={{ fontSize: 20 }}>{MODULE_ICONS[templateDoc.module]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: THEME.text }}>{templateDoc.title}</div>
                <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: "monospace" }}>
                  CTD {templateDoc.section} &nbsp;·&nbsp; {REGION_META[appInfo.country]?.flag} {appInfo.country}
                  &nbsp;·&nbsp; {appInfo.subType} &nbsp;·&nbsp; {appInfo.appNumber || "[APP NUMBER]"}
                </div>
              </div>
              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyTemplate} style={{
                  padding: "8px 16px", borderRadius: 6, border: `1px solid ${THEME.border}`,
                  background: THEME.surfaceAlt, color: THEME.text, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                }}>📋 Copy</button>
                <button onClick={exportTemplatePDF} style={{
                  padding: "8px 16px", borderRadius: 6, border: "none",
                  background: MODULE_COLORS[templateDoc.module], color: "#fff",
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6,
                }}>🖨️ Print / Save PDF</button>
                <button onClick={async () => {
                  setGeneratingTemplate(true);
                  try {
                    const resp = await fetch("https://api.anthropic.com/v1/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 2000,
                        system: "You are an expert pharmaceutical regulatory affairs specialist. Generate a professional, comprehensive regulatory document template. Use [PLACEHOLDER] brackets for all variable content. Include all ICH CTD-required sections, headings, and guidance notes. Format as plain text with clear section headers.",
                        messages: [{ role: "user", content: `Regenerate a complete template for:\nDocument: ${templateDoc.title}\nCTD Section: ${templateDoc.section}\nRegion: ${appInfo.country} (${appInfo.subType})\nApplicant: ${appInfo.applicant || "[APPLICANT]"}\nApp Number: ${appInfo.appNumber || "[APP NUMBER]"}\nDescription: ${templateDoc.desc}\n\nMake it comprehensive, professional, and ready to fill in.` }]
                      })
                    });
                    const data = await resp.json();
                    setTemplateContent(data.content?.[0]?.text || templateContent);
                  } catch (e) { }
                  setGeneratingTemplate(false);
                }} disabled={generatingTemplate} style={{
                  padding: "8px 16px", borderRadius: 6, border: `1px solid ${THEME.accent}`,
                  background: THEME.accentSoft, color: THEME.accent,
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {generatingTemplate ? <><Spinner />Generating…</> : "✨ AI Regenerate"}
                </button>
                <button onClick={() => setTemplateDoc(null)} style={{
                  padding: "8px 14px", borderRadius: 6, border: `1px solid ${THEME.border}`,
                  background: "transparent", color: THEME.textMuted, cursor: "pointer", fontSize: 18,
                }}>✕</button>
              </div>
            </div>

            {/* ── Two-column body: template left, info panel right ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

              {/* Left: editable template */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Toolbar strip */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 16px",
                  background: THEME.surfaceAlt, borderBottom: `1px solid ${THEME.border}`,
                  fontSize: 11, color: THEME.textMuted,
                }}>
                  <span style={{ fontFamily: "monospace", color: MODULE_COLORS[templateDoc.module], fontWeight: 700 }}>
                    {templateDoc.section}
                  </span>
                  <span>·</span>
                  <span>Edit directly in the template below. [PLACEHOLDER] fields = replace with your data.</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    {generatingTemplate && <span style={{ color: THEME.accent, fontFamily: "monospace" }}>
                      <Spinner /> AI generating…
                    </span>}
                    <span style={{ color: THEME.textDim }}>
                      {templateContent.split("\n").length} lines
                    </span>
                  </div>
                </div>
                {generatingTemplate && !templateContent ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
                    <Spinner />
                    <div style={{ color: THEME.textMuted, fontSize: 13 }}>AI is generating your template…</div>
                  </div>
                ) : (
                  <textarea
                    ref={templateRef}
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    spellCheck={false}
                    style={{
                      flex: 1, background: "#070c1a", color: "#d4e0f7",
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                      fontSize: 12, lineHeight: 1.7, padding: "20px 24px",
                      border: "none", outline: "none", resize: "none",
                      overflowY: "auto",
                    }}
                  />
                )}
              </div>

              {/* Right: info + quick guide panel */}
              <div style={{
                width: 280, flexShrink: 0, borderLeft: `1px solid ${THEME.border}`,
                overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16,
                background: THEME.surface,
              }}>
                {/* Document info */}
                <div style={{ background: MODULE_COLORS[templateDoc.module] + "15", borderRadius: 8, padding: "14px", border: `1px solid ${MODULE_COLORS[templateDoc.module]}33` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: MODULE_COLORS[templateDoc.module], textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8 }}>Document Info</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{templateDoc.title}</div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{templateDoc.desc}</div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: MODULE_COLORS[templateDoc.module] }}>
                    CTD Section {templateDoc.section}
                  </div>
                </div>

                {/* Applicant prefill info */}
                <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 14, border: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: THEME.accent, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8 }}>Pre-filled Data</div>
                  {[
                    ["Applicant", appInfo.applicant || "—"],
                    ["App Number", appInfo.appNumber || "—"],
                    ["Region", `${REGION_META[appInfo.country]?.flag || ""} ${appInfo.country}`],
                    ["Submission", appInfo.subType],
                    ["Sequence", appInfo.sequence || "0000"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
                      <span style={{ color: THEME.textMuted }}>{k}:</span>
                      <span style={{ color: THEME.text, fontFamily: "monospace", fontWeight: 600, textAlign: "right", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* ICH guideline references */}
                <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 14, border: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: THEME.blue, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>📚 ICH Guidelines</div>
                  {(({
                    "1": ["ICH M4 — CTD Structure", "ICH M1 — Regional Admin", "ICH E6(R2) — GCP"],
                    "2": ["ICH M4Q — Quality Summaries", "ICH M4S — Nonclinical Summaries", "ICH M4E — Clinical Summaries"],
                    "3": ["ICH Q1A(R2) — Stability", "ICH Q2(R2) — Analytical", "ICH Q3A/B — Impurities", "ICH Q6A — Specifications", "ICH Q8(R2) — Pharmaceutical Dev", "ICH Q11 — Drug Substance Dev"],
                    "4": ["ICH S1A — Carcinogenicity", "ICH S2(R1) — Genotoxicity", "ICH S5(R3) — Reproductive Tox", "ICH S7A/B — Safety Pharm", "ICH M3(R2) — Nonclinical Studies"],
                    "5": ["ICH E3 — CSR Structure", "ICH E8 — Clinical Studies", "ICH E9(R1) — Statistical Analysis", "ICH M13A — Bioequivalence"],
                  })[String(templateDoc.module)] || []).map((g) => (
                    <div key={g} style={{ fontSize: 11, color: THEME.blue, padding: "3px 0", borderBottom: `1px solid ${THEME.border}33` }}>
                      📖 {g}
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div style={{ background: THEME.surfaceAlt, borderRadius: 8, padding: 14, border: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: THEME.green, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>💡 Tips</div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 11, color: THEME.textMuted, lineHeight: 1.8 }}>
                    <li>Replace all <span style={{ color: THEME.accent, fontFamily: "monospace" }}>[PLACEHOLDER]</span> fields with actual data</li>
                    <li>Use <strong>AI Regenerate</strong> to get a customised version based on your inputs</li>
                    <li>Click <strong>Print / Save PDF</strong> to export — choose "Save as PDF" in the print dialog</li>
                    <li>Edit directly in the text editor before exporting</li>
                    <li>All ICH section references are included for reviewer traceability</li>
                  </ul>
                </div>

                {/* Mark as ready button */}
                <button onClick={() => {
                  const key = `${templateDoc.module}-${templateDoc.section}`;
                  setCheckedDocs((p) => ({ ...p, [key]: true }));
                  setTemplateDoc(null);
                }} style={{
                  width: "100%", padding: "12px", borderRadius: 8, border: "none",
                  background: THEME.green, color: "#fff", cursor: "pointer",
                  fontWeight: 700, fontSize: 13,
                }}>
                  ✓ Mark as Ready & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DOCUMENT REVIEW PANEL — Full-screen, slideUp like template viewer
          AI-powered compliance review of any regulatory / QA / MFG document
      ══════════════════════════════════════════════════════════════════════ */}
      {docReviewOpen && (() => {

        /* ── Document type catalogue ────────────────────────────────────── */
        const DR_TYPES = [
          { group:"CTD / Regulatory",  items:[
            { id:"CTD-M2",   label:"Module 2 — CTD Summaries (QOS/NCS/CS)",    icon:"📊", color:"#986F00" },
            { id:"CTD-M3",   label:"Module 3 — Quality / CMC",                 icon:"⚗️", color:"#107C10" },
            { id:"CTD-M4",   label:"Module 4 — Nonclinical Study Reports",      icon:"🐭", color:"#6264A7" },
            { id:"CTD-M5",   label:"Module 5 — Clinical Study Reports",         icon:"🏥", color:"#C50F1F" },
            { id:"COVER",    label:"Cover Letter / Application Form",           icon:"📋", color:"#0078D4" },
            { id:"PIL",      label:"PIL — Patient Information Leaflet",         icon:"📰", color:"#0078D4" },
            { id:"ARTWORK",  label:"Artwork / Label / Carton",                  icon:"🎨", color:"#8B00CC" },
          ]},
          { group:"Quality / Laboratory", items:[
            { id:"AMV",      label:"Analytical Method Validation (AMV)",        icon:"🔬", color:"#6264A7" },
            { id:"COA",      label:"Certificate of Analysis (COA)",             icon:"✅", color:"#107C10" },
            { id:"SPEC",     label:"Specification (SPEC) — DS/DP/Excipient",   icon:"📐", color:"#107C10" },
            { id:"STP",      label:"Standard Test Procedure (STP)",             icon:"🧪", color:"#107C10" },
            { id:"STAB",     label:"Stability Report",                          icon:"📈", color:"#C17900" },
          ]},
          { group:"Manufacturing / Batch", items:[
            { id:"BMR",      label:"Batch Manufacturing Record (BMR)",          icon:"🏭", color:"#E65100" },
            { id:"BPR",      label:"Batch Packaging Record (BPR)",              icon:"📦", color:"#E65100" },
            { id:"PDR",      label:"Product Development Report (PDR)",          icon:"🗂️", color:"#1565C0" },
            { id:"PV",       label:"Process Validation Report (PV)",            icon:"⚙️", color:"#1565C0" },
          ]},
          { group:"Pharmacovigilance / Safety", items:[
            { id:"PSUR",     label:"PSUR / PBRER",                              icon:"🛡️", color:"#C50F1F" },
            { id:"RMP",      label:"Risk Management Plan (RMP)",                icon:"⚠️", color:"#C50F1F" },
            { id:"ICSR",     label:"Individual Case Safety Report (ICSR)",      icon:"🩺", color:"#C50F1F" },
          ]},
          { group:"Other QA / Regulatory", items:[
            { id:"SOP",      label:"Standard Operating Procedure (SOP)",        icon:"📗", color:"#2B579A" },
            { id:"CAPA",     label:"CAPA / Deviation Report",                   icon:"🔧", color:"#986F00" },
            { id:"OTHER",    label:"Any Other Document",                        icon:"📄", color:"#5D5D5D" },
          ]},
        ];

        const allTypeItems = DR_TYPES.flatMap(g => g.items);
        const selType = allTypeItems.find(t => t.id === drDocType);

        /* ── Build review prompt per doc type ───────────────────────────── */
        const getReviewPrompt = (docType, country, subType) => {
          const region = country || "Global";
          const base = `You are a senior pharmaceutical regulatory affairs and QA expert with 20+ years of experience. Review the provided document thoroughly.

Return ONLY a valid JSON object — no markdown, no preamble, no explanation outside JSON.

JSON structure:
{
  "docType": "${docType}",
  "title": "detected document title or name",
  "overallScore": <0-100>,
  "overallVerdict": "PASS" | "PASS WITH OBSERVATIONS" | "FAIL",
  "executiveSummary": "3-5 sentence executive summary of the review",
  "criticalIssues": [ { "id":"C1", "section":"section/field", "issue":"description", "regulation":"applicable guideline/regulation", "action":"required corrective action" } ],
  "majorObservations": [ { "id":"M1", "section":"", "issue":"", "regulation":"", "recommendation":"" } ],
  "minorObservations": [ { "id":"m1", "section":"", "issue":"", "recommendation":"" } ],
  "logicalConsistencyChecks": [
    { "check":"Batch number consistency", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Manufacturing date validity", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Expiry/retest date logic", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Yield/reconciliation", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Signature/date completeness", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Version/revision consistency", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Cross-reference accuracy", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" },
    { "check":"Unit/quantity consistency", "status":"PASS"|"FAIL"|"NA"|"WARNING", "detail":"" }
  ],
  "sectionScores": [ { "section":"section name", "score":<0-100>, "comments":"" } ],
  "gapAnalysis": [ { "missingItem":"", "requiredBy":"", "impact":"Critical"|"Major"|"Minor" } ],
  "complianceMatrix": [ { "guideline":"", "requirement":"", "status":"Compliant"|"Non-Compliant"|"Partial"|"NA", "note":"" } ],
  "suggestedImprovements": [ { "area":"", "suggestion":"", "priority":"High"|"Medium"|"Low" } ],
  "positiveFindings": [ "strength 1", "strength 2" ]
}`;

          const typeSpecific = {
            "CTD-M2": `\n\nSpecific focus for CTD Module 2 (Quality Overview / NCS / CS):\n- ICH M4Q completeness (2.3 QOS all sections present)\n- Linkage between QOS and Module 3 data\n- CQA identification and justification (ICH Q8)\n- Nonclinical/Clinical summary completeness per M4S/M4E\n- Benefit-risk statement adequacy\nRegion: ${region}`,
            "CTD-M3": `\n\nSpecific focus for CTD Module 3 (Quality/CMC):\n- All 3.2.S and 3.2.P sections present and complete\n- ICH Q6A specifications adequacy\n- ICH Q2(R2) method validation completeness\n- ICH Q1A stability data adequacy\n- ICH Q3A/Q3B impurity limits compliance\n- Manufacturing process description completeness (ICH Q11)\nRegion: ${region}, Submission: ${subType || "NDA/MAA"}`,
            "AMV": `\n\nSpecific focus for Analytical Method Validation:\n- ICH Q2(R2) parameters: Specificity, Linearity, Range, Accuracy, Precision (Repeatability, Intermediate, Reproducibility), DL, QL, Robustness\n- ICH Q14 Analytical Procedure Development section if present\n- System suitability criteria\n- Statistical analysis adequacy\n- Reference standard traceability\n- All acceptance criteria clearly defined and justified`,
            "COA": `\n\nSpecific focus for Certificate of Analysis:\n- Batch number format and consistency throughout\n- Manufacturing date and expiry/retest date — logical (mfg date < exp date, shelf life calculation correct)\n- All specification parameters listed and results within acceptance criteria\n- Analytical procedure references\n- Authorised signatory and QC/QA release statement\n- Statement of compliance with pharmacopoeia if applicable\n- Storage conditions stated`,
            "SPEC": `\n\nSpecific focus for Specification document:\n- ICH Q6A/Q6B compliance — all required tests present\n- Acceptance criteria justified (not just copied from pharmacopoeia without justification)\n- Test methods referenced by name and version\n- Regulatory basis stated (USP/EP/BP/IP/JP or in-house)\n- Approval signatures, version control, effective date\n- Impurity limits per ICH Q3A/Q3B/M7`,
            "STP": `\n\nSpecific focus for Standard Test Procedure:\n- Method principle and scope clearly defined\n- Reagents, materials, equipment specified with grades/specifications\n- Step-by-step instructions unambiguous and complete\n- Calculation formulas clearly stated with worked example\n- System suitability requirements\n- Acceptance criteria\n- Safety precautions\n- Version control, approval signatures, effective date`,
            "STAB": `\n\nSpecific focus for Stability Report:\n- ICH Q1A(R2) protocol compliance: storage conditions, time points, test parameters\n- Statistical analysis: mean kinetics (Arrhenius), regression analysis\n- Degradation pathway identification\n- Proposed shelf life scientifically justified\n- Batch selection representativeness\n- Packaging system relevance\n- Ongoing stability commitment\n- Out-of-spec results — any investigations conducted`,
            "BMR": `\n\nSpecific focus for Batch Manufacturing Record:\n- Batch number, product name, strength, batch size — consistent throughout all pages\n- Manufacturing date and expiry date — logical, shelf life correctly calculated\n- Raw material references: item codes, lot numbers, quantities weighed — within limits\n- Yield at each stage and final yield within approved limits\n- In-process control results within specifications\n- Critical process parameters recorded vs. approved ranges\n- All process steps signed and dated — no gaps\n- Environmental monitoring data if sterile\n- Equipment identifications recorded\n- Deviations or exceptions noted and referenced\n- Final QA release signature`,
            "BPR": `\n\nSpecific focus for Batch Packaging Record:\n- Batch number and product details consistent with BMR\n- Packaging material reconciliation — all received, used, rejected, returned quantities balance\n- Artwork/label version and code matches approved version\n- Line clearance documented before start\n- Sampling records and in-process checks (seal integrity, print legibility, pack count)\n- Rejection quantities documented and disposed\n- Final reconciliation: yield within approved limits\n- Destruction records for rejected/excess labels\n- QA release signature`,
            "PDR": `\n\nSpecific focus for Product Development Report:\n- Formulation development rationale — QbD approach, QTPP, CQAs\n- Design of experiments (DoE) data reviewed\n- Critical formulation variables identified\n- Compatibility studies (DS-excipient) reported\n- Scale-up considerations addressed\n- Stability-indicative nature of methods confirmed\n- Regulatory submission readiness`,
            "PV": `\n\nSpecific focus for Process Validation Report:\n- Validation protocol referenced and approved before execution\n- Number of consecutive batches (typically ≥3) meets guideline requirement\n- All CPPs monitored and within approved ranges for all batches\n- All CQAs of validated batches meet specification\n- Statistical analysis of data (mean, SD, %RSD, Cpk ≥1.33 for critical parameters)\n- Cleaning validation if multiproduct equipment\n- Reprocessing validation if applicable\n- Annual product review commitment stated`,
            "PIL": `\n\nSpecific focus for Patient Information Leaflet:\n- Readability and plain language (Gunning Fog Index target <12)\n- All SmPC key sections reflected: indication, dosing, contraindications, side effects, storage\n- Warning statements legally required\n- Readability study reference if applicable\n- Regulatory region specific format compliance: ${region}`,
            "ARTWORK": `\n\nSpecific focus for Artwork / Label:\n- Mandatory regulatory information present: product name, INN, strength, dosage form, route\n- Batch number, manufacturing date, expiry date fields present\n- Storage conditions stated\n- Manufacturer/MAH name and address\n- Barcode/2D code if required\n- Braille if required (EU)\n- Language compliance for region: ${region}\n- Font size legibility (minimum 7pt for EU)\n- Warning symbols correct`,
            "PSUR": `\n\nSpecific focus for PSUR/PBRER:\n- ICH E2C(R2) / PBRER format compliance\n- CIOMS line listings completeness\n- Cumulative exposure data\n- Benefit-risk evaluation current\n- Regulatory actions section complete\n- Risk minimisation measures effectiveness\n- Periodic safety update commitments`,
            "CAPA": `\n\nSpecific focus for CAPA/Deviation Report:\n- Root cause analysis — is 5-Why or Ishikawa used?\n- Immediate containment actions documented\n- Corrective actions — specific, measurable, time-bound\n- Preventive actions — address systemic issue\n- Effectiveness check planned with criteria and timeline\n- Impact assessment on batches/patients\n- Regulatory notification assessment completed`,
          };

          return base + (typeSpecific[docType] || `\n\nDocument type: ${docType}. Review for completeness, accuracy, regulatory compliance, and logical consistency.`);
        };

        /* ── Run review ─────────────────────────────────────────────────── */
        const runReview = async () => {
          if (!drFile || !drDocType) return;
          setDrReviewing(true);
          setDrResult(null);
          setDrRaw("");
          setDrActiveTab("summary");

          const steps = [
            "Reading document structure...",
            "Identifying document type and version...",
            "Running logical consistency checks...",
            "Checking compliance against applicable guidelines...",
            "Scoring each section...",
            "Generating gap analysis...",
            "Compiling review report...",
          ];
          let si = 0;
          setDrProgress(steps[0]);
          const ticker = setInterval(() => {
            si = Math.min(si + 1, steps.length - 1);
            setDrProgress(steps[si]);
          }, 2200);

          try {
            const isImage = drFileMime?.startsWith("image/");
            const isPdf   = drFileMime === "application/pdf";
            const prompt  = getReviewPrompt(drDocType, appInfo.country, appInfo.subType);

            let msgContent;
            if (isImage) {
              msgContent = [
                { type: "image", source: { type: "base64", media_type: drFileMime, data: drFileB64 } },
                { type: "text",  text: prompt + "\n\nReview the document shown in the image above." },
              ];
            } else if (isPdf) {
              msgContent = [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: drFileB64 } },
                { type: "text",  text: prompt + "\n\nReview the PDF document provided above." },
              ];
            } else {
              // For text/docx etc — send as text extraction note
              msgContent = [
                { type: "text", text: prompt + `\n\nThe document content (extracted text) is provided below:\n\n${atob(drFileB64).slice(0, 15000)}` },
              ];
            }

            const resp = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4000,
                messages: [{ role: "user", content: msgContent }],
              }),
            });
            const data = await resp.json();
            const raw  = data.content?.[0]?.text || "";
            setDrRaw(raw);
            try {
              const clean = raw.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(clean);
              setDrResult(parsed);
              setDrActiveTab("summary");
            } catch (e) {
              setDrResult(null);
            }
          } catch (e) {
            setDrRaw("Review failed. Please try again.");
          } finally {
            clearInterval(ticker);
            setDrProgress("");
            setDrReviewing(false);
          }
        };

        /* ── helpers ─────────────────────────────────────────────────────── */
        const verdictColor = (v) => ({ "PASS":"#107C10","PASS WITH OBSERVATIONS":"#C17900","FAIL":"#C50F1F" }[v] || "#888");
        const statusColor  = (s) => ({ "PASS":"#107C10","FAIL":"#C50F1F","WARNING":"#C17900","NA":"#AAA","Compliant":"#107C10","Non-Compliant":"#C50F1F","Partial":"#C17900" }[s] || "#888");
        const impactColor  = (i) => ({ "Critical":"#C50F1F","Major":"#C17900","Minor":"#2B579A" }[i] || "#888");
        const scoreGrad    = (n) => n >= 85 ? "#107C10" : n >= 65 ? "#C17900" : "#C50F1F";

        const TABS = [
          { id:"summary",    label:"Summary",        icon:"📋" },
          { id:"logic",      label:"Logic Checks",   icon:"🔢" },
          { id:"issues",     label:"Issues",         icon:"⚠️" },
          { id:"sections",   label:"Sections",       icon:"📊" },
          { id:"gaps",       label:"Gap Analysis",   icon:"🔍" },
          { id:"compliance", label:"Compliance",     icon:"⚖️" },
          { id:"improve",    label:"Improvements",   icon:"💡" },
        ];

        const ACCENT = "#E65100";

        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}>
            <div style={{
              width: "100%", maxWidth: "100vw", height: "96vh",
              background: THEME.surface, borderTop: `3px solid ${ACCENT}`,
              display: "flex", flexDirection: "column", animation: "slideUp 0.25s ease",
            }}>

              {/* ─ Header bar ─ */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                borderBottom: `1px solid ${THEME.border}`,
                background: `linear-gradient(135deg, ${ACCENT}18, #FFF7F0)`,
                flexShrink: 0,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: ACCENT, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="1" width="12" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.4"/>
                    <line x1="6" y1="6" x2="14" y2="6" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="6" y1="9" x2="14" y2="9" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="6" y1="12" x2="10" y2="12" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
                    <circle cx="16" cy="16" r="4" fill={ACCENT}/>
                    <path d="M14.8 16l.8.8 1.6-1.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: THEME.text }}>Document Review</div>
                  <div style={{ fontSize: 11, color: THEME.textMuted }}>
                    AI-powered regulatory & QA compliance review · RAISA Intelligence Engine
                    {appInfo.country && <span style={{ marginLeft: 8, color: ACCENT }}>· {REGION_META[appInfo.country]?.flag} {appInfo.country} / {appInfo.subType}</span>}
                  </div>
                </div>
                {drResult && (
                  <div style={{ display:"flex", alignItems:"center", gap: 12, marginRight: 16 }}>
                    {/* Score ring */}
                    <div style={{ position:"relative", width: 56, height: 56 }}>
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#EEE" strokeWidth="6"/>
                        <circle cx="28" cy="28" r="22" fill="none"
                          stroke={scoreGrad(drResult.overallScore)}
                          strokeWidth="6"
                          strokeDasharray={`${(drResult.overallScore / 100) * 138.2} 138.2`}
                          strokeLinecap="round"
                          transform="rotate(-90 28 28)"
                        />
                      </svg>
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: scoreGrad(drResult.overallScore), lineHeight: 1 }}>{drResult.overallScore}</span>
                        <span style={{ fontSize: 7, color: "#AAA" }}>/ 100</span>
                      </div>
                    </div>
                    <div style={{ padding: "5px 14px", borderRadius: 6, background: verdictColor(drResult.overallVerdict) + "18", border:`1px solid ${verdictColor(drResult.overallVerdict)}40` }}>
                      <div style={{ fontSize: 9, color: THEME.textMuted, fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Verdict</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: verdictColor(drResult.overallVerdict) }}>{drResult.overallVerdict}</div>
                    </div>
                    {drResult.criticalIssues?.length > 0 && (
                      <div style={{ padding:"5px 12px", borderRadius:6, background:"#C50F1F18", border:"1px solid #C50F1F40", textAlign:"center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color:"#C50F1F", lineHeight:1 }}>{drResult.criticalIssues.length}</div>
                        <div style={{ fontSize: 9, color:"#C50F1F", fontWeight:600 }}>Critical</div>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => { setDocReviewOpen(false); setDrFile(null); setDrFileB64(null); setDrResult(null); setDrDocType(""); setDrRaw(""); }}
                  style={{ padding:"6px 16px", borderRadius:6, border:`1px solid ${THEME.border}`, background:THEME.surfaceAlt, color:THEME.text, cursor:"pointer", fontSize:12, fontWeight:600 }}>
                  ✕ Close
                </button>
              </div>

              {/* ─ Body: left config + right results ─ */}
              <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

                {/* LEFT: Upload + config (fixed width) */}
                <div style={{ width: 300, flexShrink:0, borderRight:`1px solid ${THEME.border}`, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:14, background:THEME.surfaceAlt }}>

                  {/* Upload zone */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>1 — Upload Document</div>
                    <div
                      onClick={() => drFileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor=ACCENT; e.currentTarget.style.background="#FFF3E0"; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor="#DDD"; e.currentTarget.style.background=THEME.surface; }}
                      onDrop={async e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor="#DDD"; e.currentTarget.style.background=THEME.surface;
                        const f = e.dataTransfer.files[0]; if (!f) return;
                        setDrFile(f);
                        const b64 = await new Promise(res => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.readAsDataURL(f); });
                        setDrFileB64(b64); setDrFileMime(f.type || "application/octet-stream");
                      }}
                      style={{ border:`2px dashed #DDD`, borderRadius:10, padding:"18px 12px", textAlign:"center", cursor:"pointer", background:THEME.surface, transition:"all 0.15s" }}>
                      {drFile ? (
                        <div>
                          <div style={{ fontSize:22, marginBottom:6 }}>📄</div>
                          <div style={{ fontSize:12, fontWeight:700, color:ACCENT, wordBreak:"break-all" }}>{drFile.name}</div>
                          <div style={{ fontSize:10, color:THEME.textMuted, marginTop:4 }}>{(drFile.size/1024).toFixed(1)} KB · {drFile.type || "unknown type"}</div>
                          <div style={{ marginTop:8, fontSize:10, color:THEME.accent, textDecoration:"underline", cursor:"pointer" }}>Click to change file</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize:28, marginBottom:6 }}>📤</div>
                          <div style={{ fontSize:12, fontWeight:700, color:THEME.text }}>Drop document here</div>
                          <div style={{ fontSize:10, color:THEME.textMuted, marginTop:4 }}>or click to browse</div>
                          <div style={{ fontSize:9, color:THEME.textDim, marginTop:6 }}>PDF · DOCX · PNG · JPG · TXT</div>
                        </div>
                      )}
                    </div>
                    <input ref={drFileRef} type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" style={{ display:"none" }}
                      onChange={async e => {
                        const f = e.target.files?.[0]; if (!f) return;
                        setDrFile(f);
                        const b64 = await new Promise(res => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.readAsDataURL(f); });
                        setDrFileB64(b64); setDrFileMime(f.type || "application/octet-stream");
                      }}
                    />
                  </div>

                  {/* Doc type selector */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>2 — Document Type</div>
                    {DR_TYPES.map(grp => (
                      <div key={grp.group} style={{ marginBottom:8 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:THEME.textDim, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 0 4px", borderBottom:`1px solid ${THEME.border}`, marginBottom:4 }}>{grp.group}</div>
                        {grp.items.map(item => (
                          <button key={item.id} onClick={() => setDrDocType(item.id)} style={{
                            display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 8px", borderRadius:5,
                            border: drDocType===item.id ? `1px solid ${item.color}` : "1px solid transparent",
                            background: drDocType===item.id ? item.color+"15" : "transparent",
                            cursor:"pointer", textAlign:"left", marginBottom:1,
                          }}>
                            <span style={{ fontSize:13 }}>{item.icon}</span>
                            <span style={{ fontSize:10, fontWeight: drDocType===item.id ? 700:400, color: drDocType===item.id ? item.color : THEME.text, lineHeight:1.3 }}>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Review button */}
                  <button
                    onClick={runReview}
                    disabled={!drFile || !drDocType || drReviewing}
                    style={{
                      padding:"12px", borderRadius:8, border:"none", cursor: (!drFile||!drDocType||drReviewing)?"not-allowed":"pointer",
                      background: (!drFile||!drDocType||drReviewing) ? "#DDD" : ACCENT,
                      color: (!drFile||!drDocType||drReviewing) ? "#999" : "#fff",
                      fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    }}>
                    {drReviewing ? <><Spinner />Reviewing…</> : "🔍 Run AI Review"}
                  </button>
                  {drReviewing && drProgress && (
                    <div style={{ fontSize:10, color:ACCENT, textAlign:"center", fontStyle:"italic", animation:"pulse 1.5s infinite" }}>{drProgress}</div>
                  )}
                </div>

                {/* RIGHT: Results panel */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

                  {/* No result state */}
                  {!drResult && !drReviewing && !drRaw && (
                    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, color:THEME.textMuted }}>
                      <div style={{ fontSize:56 }}>🔍</div>
                      <div style={{ fontSize:18, fontWeight:700, color:THEME.text }}>Upload a document and select its type</div>
                      <div style={{ fontSize:13, maxWidth:400, textAlign:"center", lineHeight:1.6 }}>
                        The AI will perform a comprehensive review covering compliance, logical consistency checks, gap analysis, section scoring, and improvement recommendations.
                      </div>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
                        {["Batch no. consistency","Date logic","Yield checks","ICH compliance","Gap analysis","Section scores"].map(t => (
                          <span key={t} style={{ background:ACCENT+"15", color:ACCENT, fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:12, border:`1px solid ${ACCENT}30` }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviewing spinner */}
                  {drReviewing && (
                    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
                      <div style={{ width:60, height:60, border:`5px solid ${ACCENT}30`, borderTopColor:ACCENT, borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
                      <div style={{ fontSize:16, fontWeight:700, color:THEME.text }}>{drProgress}</div>
                      <div style={{ fontSize:12, color:THEME.textMuted }}>Analysing {drFile?.name}</div>
                    </div>
                  )}

                  {/* Raw fallback if JSON parse failed */}
                  {!drReviewing && drRaw && !drResult && (
                    <div style={{ flex:1, overflowY:"auto", padding:24 }}>
                      <div style={{ background:"#FFF3E0", border:`1px solid ${ACCENT}40`, borderRadius:8, padding:16, marginBottom:16 }}>
                        <div style={{ fontWeight:700, color:ACCENT, marginBottom:6 }}>⚠️ Review returned unstructured output</div>
                        <div style={{ fontSize:11, color:THEME.textMuted }}>The AI returned text that could not be parsed as structured JSON. Raw output shown below.</div>
                      </div>
                      <pre style={{ whiteSpace:"pre-wrap", fontSize:12, lineHeight:1.6, color:THEME.text }}>{drRaw}</pre>
                    </div>
                  )}

                  {/* Structured results */}
                  {!drReviewing && drResult && (
                    <>
                      {/* Tab bar */}
                      <div style={{ display:"flex", borderBottom:`1px solid ${THEME.border}`, background:THEME.surfaceAlt, flexShrink:0, overflowX:"auto" }}>
                        {TABS.map(tab => (
                          <button key={tab.id} onClick={() => setDrActiveTab(tab.id)} style={{
                            padding:"9px 16px", border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                            background:"transparent", whiteSpace:"nowrap",
                            color: drActiveTab===tab.id ? ACCENT : THEME.textMuted,
                            borderBottom: drActiveTab===tab.id ? `3px solid ${ACCENT}` : "3px solid transparent",
                          }}>{tab.icon} {tab.label}</button>
                        ))}
                      </div>

                      <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

                        {/* ── SUMMARY TAB ── */}
                        {drActiveTab==="summary" && (
                          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                            {/* Doc info row */}
                            <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
                              <div style={{ flex:1, minWidth:260, background:THEME.surfaceAlt, borderRadius:8, padding:16, border:`1px solid ${THEME.border}` }}>
                                <div style={{ fontSize:10, color:THEME.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Document Reviewed</div>
                                <div style={{ fontSize:14, fontWeight:800, marginBottom:4 }}>{drResult.title || drFile?.name}</div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:6 }}>
                                  <span style={{ background:selType?.color+"15", color:selType?.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, border:`1px solid ${selType?.color}30` }}>{selType?.icon} {selType?.label}</span>
                                  <span style={{ background:THEME.border, fontSize:10, padding:"2px 8px", borderRadius:4 }}>{appInfo.country} · {appInfo.subType}</span>
                                </div>
                              </div>
                              <div style={{ background: verdictColor(drResult.overallVerdict)+"15", borderRadius:8, padding:16, border:`2px solid ${verdictColor(drResult.overallVerdict)}40`, textAlign:"center", minWidth:140 }}>
                                <div style={{ fontSize:36, fontWeight:900, color:scoreGrad(drResult.overallScore), lineHeight:1 }}>{drResult.overallScore}</div>
                                <div style={{ fontSize:10, color:THEME.textMuted, marginBottom:8 }}>Overall Score / 100</div>
                                <div style={{ fontSize:13, fontWeight:800, color:verdictColor(drResult.overallVerdict) }}>{drResult.overallVerdict}</div>
                              </div>
                            </div>
                            {/* Executive summary */}
                            <div style={{ background:"#F0F7FF", border:`1px solid #C0D8F0`, borderRadius:8, padding:16 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:THEME.accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Executive Summary</div>
                              <div style={{ fontSize:13, color:THEME.text, lineHeight:1.7 }}>{drResult.executiveSummary}</div>
                            </div>
                            {/* Quick stats row */}
                            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                              {[
                                { label:"Critical Issues",  val:drResult.criticalIssues?.length||0,      color:"#C50F1F" },
                                { label:"Major Obs.",       val:drResult.majorObservations?.length||0,   color:"#C17900" },
                                { label:"Minor Obs.",       val:drResult.minorObservations?.length||0,   color:"#2B579A" },
                                { label:"Gaps Found",       val:drResult.gapAnalysis?.length||0,         color:"#6264A7" },
                                { label:"Improvements",     val:drResult.suggestedImprovements?.length||0, color:"#107C10" },
                                { label:"Positive Findings",val:drResult.positiveFindings?.length||0,    color:"#107C10" },
                              ].map(s => (
                                <div key={s.label} style={{ background:s.color+"12", border:`1px solid ${s.color}30`, borderRadius:8, padding:"10px 16px", textAlign:"center", minWidth:100 }}>
                                  <div style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                                  <div style={{ fontSize:9, color:THEME.textMuted, marginTop:3, fontWeight:600 }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                            {/* Positive findings */}
                            {drResult.positiveFindings?.length > 0 && (
                              <div style={{ background:"#F0FFF4", border:`1px solid #C0E8C0`, borderRadius:8, padding:14 }}>
                                <div style={{ fontSize:11, fontWeight:700, color:"#107C10", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>✅ Strengths / Positive Findings</div>
                                <ul style={{ margin:0, padding:"0 0 0 16px" }}>
                                  {drResult.positiveFindings.map((p,i) => <li key={i} style={{ fontSize:12, color:THEME.text, lineHeight:1.7 }}>{p}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── LOGIC CHECKS TAB ── */}
                        {drActiveTab==="logic" && (
                          <div>
                            <div style={{ fontSize:13, color:THEME.textMuted, marginBottom:16 }}>Cross-field logical consistency checks — batch numbers, dates, yields, quantities, signatures.</div>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {drResult.logicalConsistencyChecks?.map((c, i) => (
                                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:14, borderRadius:8, border:`1px solid ${statusColor(c.status)}30`, background:statusColor(c.status)+"08" }}>
                                  <div style={{ width:72, flexShrink:0 }}>
                                    <span style={{ fontSize:10, fontWeight:700, color:statusColor(c.status), background:statusColor(c.status)+"20", padding:"2px 6px", borderRadius:4 }}>{c.status}</span>
                                  </div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:THEME.text, marginBottom:4 }}>{c.check}</div>
                                    <div style={{ fontSize:11, color:THEME.textMuted, lineHeight:1.5 }}>{c.detail || "No issues detected."}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── ISSUES TAB ── */}
                        {drActiveTab==="issues" && (
                          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                            {/* Critical */}
                            {drResult.criticalIssues?.length > 0 && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:800, color:"#C50F1F", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                                  <span style={{ background:"#C50F1F", color:"#fff", fontSize:10, padding:"2px 8px", borderRadius:4 }}>CRITICAL</span>
                                  {drResult.criticalIssues.length} issue(s) — require immediate action
                                </div>
                                {drResult.criticalIssues.map((c,i) => (
                                  <div key={i} style={{ borderLeft:"4px solid #C50F1F", padding:"12px 16px", marginBottom:8, background:"#FFF5F5", borderRadius:"0 8px 8px 0" }}>
                                    <div style={{ fontSize:11, fontFamily:"monospace", color:"#C50F1F", marginBottom:4 }}>{c.id} · {c.section}</div>
                                    <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{c.issue}</div>
                                    <div style={{ fontSize:11, color:"#C17900", marginBottom:4 }}>📋 Regulation: {c.regulation}</div>
                                    <div style={{ fontSize:11, color:THEME.accent, fontWeight:600 }}>→ Action: {c.action}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Major */}
                            {drResult.majorObservations?.length > 0 && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:800, color:"#C17900", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                                  <span style={{ background:"#C17900", color:"#fff", fontSize:10, padding:"2px 8px", borderRadius:4 }}>MAJOR</span>
                                  {drResult.majorObservations.length} observation(s)
                                </div>
                                {drResult.majorObservations.map((m,i) => (
                                  <div key={i} style={{ borderLeft:"4px solid #C17900", padding:"12px 16px", marginBottom:8, background:"#FFFBF0", borderRadius:"0 8px 8px 0" }}>
                                    <div style={{ fontSize:11, fontFamily:"monospace", color:"#C17900", marginBottom:4 }}>{m.id} · {m.section}</div>
                                    <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{m.issue}</div>
                                    {m.regulation && <div style={{ fontSize:11, color:THEME.textMuted, marginBottom:4 }}>📋 {m.regulation}</div>}
                                    <div style={{ fontSize:11, color:THEME.accent, fontWeight:600 }}>→ {m.recommendation}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Minor */}
                            {drResult.minorObservations?.length > 0 && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:800, color:"#2B579A", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                                  <span style={{ background:"#2B579A", color:"#fff", fontSize:10, padding:"2px 8px", borderRadius:4 }}>MINOR</span>
                                  {drResult.minorObservations.length} observation(s)
                                </div>
                                {drResult.minorObservations.map((m,i) => (
                                  <div key={i} style={{ borderLeft:"4px solid #2B579A", padding:"12px 16px", marginBottom:8, background:"#F0F5FF", borderRadius:"0 8px 8px 0" }}>
                                    <div style={{ fontSize:11, fontFamily:"monospace", color:"#2B579A", marginBottom:4 }}>{m.id} · {m.section}</div>
                                    <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{m.issue}</div>
                                    <div style={{ fontSize:11, color:THEME.accent }}>{m.recommendation}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {(!drResult.criticalIssues?.length && !drResult.majorObservations?.length && !drResult.minorObservations?.length) && (
                              <div style={{ textAlign:"center", padding:40, color:THEME.textMuted }}>
                                <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
                                <div style={{ fontSize:16, fontWeight:700, color:"#107C10" }}>No issues found</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── SECTIONS TAB ── */}
                        {drActiveTab==="sections" && (
                          <div>
                            <div style={{ fontSize:13, color:THEME.textMuted, marginBottom:16 }}>Section-by-section scores and reviewer comments.</div>
                            {drResult.sectionScores?.map((s,i) => (
                              <div key={i} style={{ padding:14, borderRadius:8, border:`1px solid ${THEME.border}`, marginBottom:10, background:THEME.surfaceAlt }}>
                                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                                  <div style={{ flex:1, fontSize:13, fontWeight:700 }}>{s.section}</div>
                                  <div style={{ fontSize:15, fontWeight:800, color:scoreGrad(s.score), minWidth:36, textAlign:"right" }}>{s.score}</div>
                                </div>
                                <div style={{ background:THEME.border, borderRadius:4, height:6, marginBottom:8 }}>
                                  <div style={{ height:6, borderRadius:4, background:scoreGrad(s.score), width:`${s.score}%`, transition:"width 0.5s" }}/>
                                </div>
                                <div style={{ fontSize:11, color:THEME.textMuted, lineHeight:1.5 }}>{s.comments}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── GAP ANALYSIS TAB ── */}
                        {drActiveTab==="gaps" && (
                          <div>
                            <div style={{ fontSize:13, color:THEME.textMuted, marginBottom:16 }}>Missing elements vs. applicable regulatory requirements.</div>
                            {drResult.gapAnalysis?.length > 0 ? drResult.gapAnalysis.map((g,i) => (
                              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:14, borderRadius:8, border:`1px solid ${impactColor(g.impact)}30`, background:impactColor(g.impact)+"08", marginBottom:8 }}>
                                <span style={{ background:impactColor(g.impact), color:"#fff", fontSize:9, fontWeight:700, padding:"3px 7px", borderRadius:4, whiteSpace:"nowrap", marginTop:1 }}>{g.impact}</span>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{g.missingItem}</div>
                                  <div style={{ fontSize:11, color:THEME.textMuted }}>Required by: {g.requiredBy}</div>
                                </div>
                              </div>
                            )) : (
                              <div style={{ textAlign:"center", padding:40, color:"#107C10" }}>
                                <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
                                <div style={{ fontSize:16, fontWeight:700 }}>No gaps identified</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── COMPLIANCE TAB ── */}
                        {drActiveTab==="compliance" && (
                          <div>
                            <div style={{ fontSize:13, color:THEME.textMuted, marginBottom:16 }}>Compliance status against applicable ICH guidelines and regional regulations.</div>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                              <thead>
                                <tr style={{ background:THEME.surfaceAlt, borderBottom:`2px solid ${THEME.border}` }}>
                                  {["Guideline","Requirement","Status","Note"].map(h => (
                                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:700, color:THEME.text }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {drResult.complianceMatrix?.map((row,i) => (
                                  <tr key={i} style={{ borderBottom:`1px solid ${THEME.border}`, background: i%2===0?"transparent":THEME.surfaceAlt }}>
                                    <td style={{ padding:"8px 12px", fontWeight:600, color:THEME.accent, fontFamily:"monospace", fontSize:10 }}>{row.guideline}</td>
                                    <td style={{ padding:"8px 12px", color:THEME.text }}>{row.requirement}</td>
                                    <td style={{ padding:"8px 12px" }}>
                                      <span style={{ background:statusColor(row.status)+"20", color:statusColor(row.status), fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4 }}>{row.status}</span>
                                    </td>
                                    <td style={{ padding:"8px 12px", color:THEME.textMuted, fontSize:10 }}>{row.note}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* ── IMPROVEMENTS TAB ── */}
                        {drActiveTab==="improve" && (
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            <div style={{ fontSize:13, color:THEME.textMuted, marginBottom:6 }}>Suggested improvements to strengthen this document before submission.</div>
                            {drResult.suggestedImprovements?.map((s,i) => (
                              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:14, borderRadius:8, border:`1px solid ${impactColor(s.priority==="High"?"Critical":s.priority==="Medium"?"Major":"Minor")}30`, background:THEME.surfaceAlt }}>
                                <span style={{ background: s.priority==="High"?"#C50F1F":s.priority==="Medium"?"#C17900":"#2B579A", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 7px", borderRadius:4, whiteSpace:"nowrap", marginTop:1 }}>{s.priority}</span>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:12, fontWeight:700, color:THEME.text, marginBottom:4 }}>{s.area}</div>
                                  <div style={{ fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>{s.suggestion}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {(() => {
        const totalNodes = getMergedRequirements(appInfo.country, appInfo.productCategory || "ALL", appInfo.subType || "NDA").length;
        const totalPages = Math.max(analyzedCount * 12, totalNodes * 3);
        return (
          <div style={{ background: "#DFE3EA", borderTop: "1px solid #B8BDC8", padding: "0",
            height: 22, display: "flex", alignItems: "stretch", flexShrink: 0, fontSize: 9, fontFamily: "'Segoe UI', monospace" }}>
            {/* Left section: Nodes + Pages (primary docuBridge stats) */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, borderRight: "1px solid #B8BDC8" }}>
              <span style={{ padding: "0 12px", color: "#333", fontWeight: 600, borderRight: "1px solid #CDD0D8" }}>
                Nodes: <strong style={{ color: THEME.accent }}>{totalNodes}</strong>
              </span>
              <span style={{ padding: "0 12px", color: "#333", fontWeight: 600 }}>
                Documents: <strong style={{ color: THEME.accent }}>{documents.length}</strong>
              </span>
            </div>
            {/* Middle: selected node path */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 12px", overflow: "hidden" }}>
              {selectedDocNode ? (
                <span style={{ color: THEME.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 9 }}>
                  ▸ {selectedDocNode}
                </span>
              ) : (
                <span style={{ color: "#AAA", fontStyle: "italic" }}>No selection</span>
              )}
            </div>
            {/* Right section: page navigation like docuBridge */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, borderLeft: "1px solid #B8BDC8" }}>
              <span style={{ padding: "0 10px", color: "#555", borderRight: "1px solid #CDD0D8" }}>
                {REGION_META[appInfo.country]?.authority || "FDA"} · {appInfo.subType || "NDA"} · SEQ {(appInfo.sequence || "0000").padStart(4,"0")}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 8px" }}>
                <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0 3px", color: "#555", fontSize: 11, lineHeight: 1 }}>◀</button>
                <span style={{ padding: "0 6px", background: "#fff", border: "1px solid #CCC", borderRadius: 2, fontSize: 9, fontFamily: "monospace", minWidth: 30, textAlign: "center" }}>1</span>
                <span style={{ padding: "0 4px", color: "#888" }}>/</span>
                <span style={{ padding: "0 4px", color: "#555", fontFamily: "monospace" }}>{totalNodes}</span>
                <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0 3px", color: "#555", fontSize: 11, lineHeight: 1 }}>▶</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function generateFolderScript(docs, appInfo) {
  const seq = (appInfo.sequence || "0000").padStart(4, "0");
  const base = `${appInfo.appNumber || "NDA000000"}/${seq}`;
  const dirs = new Set();
  CTD_MODULES.forEach((mod) => {
    dirs.add(`${base}/${mod.ectdPath}`);
    mod.sections.forEach((s) => {
      const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      dirs.add(`${base}/${mod.ectdPath}/${slug}`);
    });
  });
  ["23-quality-overall-summary","24-nonclinical-overview","25-clinical-overview"].forEach((s) => dirs.add(`${base}/m2/${s}`));
  docs.filter((d) => d.analyzed && d.metadata?.ectdSection).forEach((d) => dirs.add(`${base}/${d.metadata.ectdSection}`));
  dirs.add(`${base}/stf`);
  return `#!/bin/bash\n# RAISA eCTD folder structure — compatible with LORENZ docuBridge & EXTEDO eCTDmanager\n# Application: ${appInfo.appNumber || "NDA000000"} | Sequence: ${seq} | Region: ${appInfo.country || "US"}\n\n` +
    Array.from(dirs).sort().map((d) => `mkdir -p "${d}"`).join("\n") +
    `\n\necho "✓ eCTD folder structure created (docuBridge + Extedo compatible)"`;
}

// ─── EXTEDO Envelope XML generator ───────────────────────────────────────────
function generateExtedoEnvelope(docs, appInfo) {
  const now = new Date().toISOString().split("T")[0];
  const seq = (appInfo.sequence || "0000").padStart(4, "0");
  const drug = docs.find((d) => d.analyzed && d.metadata?.drugSubstanceName)?.metadata?.drugSubstanceName || "Drug Substance";
  const form = docs.find((d) => d.analyzed && d.metadata?.dosageForm)?.metadata?.dosageForm || "";
  const route = docs.find((d) => d.analyzed && d.metadata?.routeOfAdministration)?.metadata?.routeOfAdministration || "";
  const indication = docs.find((d) => d.analyzed && d.metadata?.therapeuticIndication)?.metadata?.therapeuticIndication || "";
  const regionMap = { US: "us", EU: "eu", JP: "jp", CA: "ca", AU: "au", IN: "in" };
  const region = regionMap[appInfo.country] || "us";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- EXTEDO eCTDmanager — Regional Envelope XML (Module 1) -->
<!-- Generated by RAISA — Regulatory Affairs Intelligence System and Analytics -->
<!-- Import via: File → Import → Envelope / Backbone in eCTDmanager -->
<envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="3.2.2">
  <application>
    <applicant>${appInfo.applicant || "Applicant Name"}</applicant>
    <application-number>${appInfo.appNumber || "NDA000000"}</application-number>
    <application-type>${appInfo.subType || "NDA"}</application-type>
    <sequence-number>${seq}</sequence-number>
    <submission-date>${now}</submission-date>
    <region>${region}</region>
    <country>${appInfo.country || "US"}</country>
  </application>
  <product>
    <proprietary-name>${drug}</proprietary-name>
    <non-proprietary-name>${drug}</non-proprietary-name>
    <dosage-form>${form}</dosage-form>
    <route-of-administration>${route}</route-of-administration>
    <indication>${indication}</indication>
    <applicant-product-id>${appInfo.appNumber || "NDA000000"}</applicant-product-id>
  </product>
  <submission>
    <submission-type>${appInfo.subType || "NDA"}</submission-type>
    <sequence-description>Initial submission generated by RAISA v1.0</sequence-description>
    <ectd-version>3.2.2</ectd-version>
    <generated-by>RAISA — CTD/eCTD Regulatory Affairs Assistant</generated-by>
    <generation-date>${now}</generation-date>
  </submission>
  <!-- 
    EXTEDO eCTDmanager Import Notes:
    1. Open eCTDmanager → New Sequence
    2. File → Import → Envelope / Backbone → select this file  
    3. Verify Envelope Info fields in the Sequence Properties panel
    4. Add documents via File → Add from File System
    5. Run EURS Validator before publishing
  -->
</envelope>`;
}

// ─── EXTEDO Custom Attributes CSV generator ───────────────────────────────────
function generateExtedoAttributes(docs, appInfo) {
  const header = "NodePath,Title,DocumentType,LifecycleOperation,DrugSubstance,DosageForm,RouteOfAdministration,TherapeuticIndication,StudySpecies,StudyDuration,ClinicalPhase,ManufacturingProcess,StabilityConditions,StudyOutcomes,ICHSection,Region,ApplicationNumber,SequenceNumber,GeneratedBy\n";
  const rows = docs.filter((d) => d.analyzed && d.moduleId).map((d) => {
    const mod = CTD_MODULES.find((m) => m.id === d.moduleId);
    const m = d.metadata || {};
    const safeName = toEctdFilename(d.name);
    const nodePath = `${mod?.ectdPath || "m1"}/${m.ectdSection?.split("/").slice(1).join("/") || safeName}`;
    return [
      `"${nodePath}"`,
      `"${m.documentType || d.name}"`,
      `"${m.documentType || ""}"`,
      `"${m.operation || "new"}"`,
      `"${m.drugSubstanceName || ""}"`,
      `"${m.dosageForm || ""}"`,
      `"${m.routeOfAdministration || ""}"`,
      `"${m.therapeuticIndication || ""}"`,
      `"${m.studySpecies || ""}"`,
      `"${m.studyDuration || ""}"`,
      `"${m.clinicalPhase || ""}"`,
      `"${m.manufacturingProcess || ""}"`,
      `"${m.stabilityConditions || ""}"`,
      `"${m.studyOutcomes || ""}"`,
      `"${m.ectdSection || mod?.ectdPath || ""}"`,
      `"${appInfo.country || "US"}"`,
      `"${appInfo.appNumber || "NDA000000"}"`,
      `"${(appInfo.sequence || "0000").padStart(4,"0")}"`,
      `"RAISA v1.0"`,
    ].join(",");
  });
  const summaries = [
    `"m2/23-quality-overall-summary/quality-overall-summary.pdf","Quality Overall Summary (Module 2.3)","Quality Summary","new","","","","","","","","","","","m2/23-quality-overall-summary","${appInfo.country || "US"}","${appInfo.appNumber || "NDA000000"}","${(appInfo.sequence||"0000").padStart(4,"0")}","RAISA v1.0"`,
    `"m2/24-nonclinical-overview/nonclinical-overview.pdf","Nonclinical Overview (Module 2.4)","Nonclinical Overview","new","","","","","","","","","","","m2/24-nonclinical-overview","${appInfo.country || "US"}","${appInfo.appNumber || "NDA000000"}","${(appInfo.sequence||"0000").padStart(4,"0")}","RAISA v1.0"`,
    `"m2/25-clinical-overview/clinical-overview.pdf","Clinical Overview (Module 2.5)","Clinical Overview","new","","","","","","","","","","","m2/25-clinical-overview","${appInfo.country || "US"}","${appInfo.appNumber || "NDA000000"}","${(appInfo.sequence||"0000").padStart(4,"0")}","RAISA v1.0"`,
  ];
  return header + rows.join("\n") + (rows.length ? "\n" : "") + summaries.join("\n");
}

// ─── EXTEDO STF (Study Tagging File) template generator ──────────────────────
function generateSTF(docs, appInfo) {
  const now = new Date().toISOString().split("T")[0];
  const studyDocs = docs.filter((d) => d.analyzed && (d.moduleId === 4 || d.moduleId === 5));

  const studyNodes = studyDocs.map((d, i) => {
    const m = d.metadata || {};
    const safeName = toEctdFilename(d.name);
    const mod = CTD_MODULES.find((mod) => mod.id === d.moduleId);
    const stfCategory = d.moduleId === 4 ? "4.2.3.2" : "5.3.5.1";
    return `  <study ID="STUDY-${String(i+1).padStart(3,"0")}">
    <study-type>${d.moduleId === 4 ? "nonclinical" : "clinical"}</study-type>
    <study-id>${m.drugSubstanceName || "STUDY"}-${String(i+1).padStart(3,"0")}</study-id>
    <stf-category>${stfCategory}</stf-category>
    <species>${m.studySpecies || "Not specified"}</species>
    <duration>${m.studyDuration || "Not specified"}</duration>
    <route-of-administration>${m.routeOfAdministration || "Not specified"}</route-of-administration>
    <phase>${m.clinicalPhase || "N/A"}</phase>
    <file-tag type="${d.moduleId === 4 ? "nonclinical-study-report" : "clinical-study-report"}">
      <file href="${mod?.ectdPath || "m4"}/${safeName}"/>
      <title>${m.documentType || d.name}</title>
      <operation>${m.operation || "new"}</operation>
    </file-tag>
  </study>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ich-ectd-stf SYSTEM "ich-ectd-stf-v26.dtd">
<!-- EXTEDO eCTDmanager — Study Tagging File (STF) -->
<!-- ICH eCTD STF Specification v2.6.1 -->
<!-- Generated by RAISA — Regulatory Affairs Intelligence System and Analytics -->
<!-- Import via: Extedo STF Wizard Window → STF Filetags View -->
<!-- Required for: eCTD sections 4.2.x and 5.3.1.x – 5.3.5.x -->
<ich-ectd-stf version="2.6.1">
  <header>
    <applicant>${appInfo.applicant || "Applicant Name"}</applicant>
    <application-number>${appInfo.appNumber || "NDA000000"}</application-number>
    <sequence-number>${(appInfo.sequence || "0000").padStart(4,"0")}</sequence-number>
    <creation-date>${now}</creation-date>
    <generated-by>RAISA v1.0 — Regulatory Affairs Intelligence System and Analytics</generated-by>
    <eurs-validator-note>
      Run EXTEDO EURS Validator after import.
      Select regional profile: ${appInfo.country || "US"}.
      Verify STF file-tag assignments in STF Filetags View.
    </eurs-validator-note>
  </header>
  <studies>
${studyNodes || "    <!-- No Module 4/5 study documents analyzed yet. Analyze nonclinical/clinical reports first. -->"}
  </studies>
</ich-ectd-stf>`;
}
