import { supabaseAdmin } from '../../../lib/supabase';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

const OID = {
  ICH_COU:  '2.16.840.1.113883.3.989.2.2.1.1.1',
  ICH_IG:   '2.16.840.1.113883.3.989.2.2.2.1',
  FDA_IG:   '2.16.840.1.113883.3.989.2.2.2.4',
  EMA_IG:   '2.16.840.1.113883.3.989.2.2.2.2',
  PMDA_IG:  '2.16.840.1.113883.3.989.2.2.2.3',
};

const SECTION_TO_COU = {
  '2.3':'ich_2.3','2.4':'ich_2.4','2.5':'ich_2.5',
  '3.2.S.1':'ich_3.2.s.1','3.2.S.2':'ich_3.2.s.2','3.2.S.2.1':'ich_3.2.s.2.1',
  '3.2.S.2.2':'ich_3.2.s.2.2','3.2.S.2.3':'ich_3.2.s.2.3','3.2.S.2.4':'ich_3.2.s.2.4',
  '3.2.S.2.5':'ich_3.2.s.2.5','3.2.S.3':'ich_3.2.s.3','3.2.S.3.1':'ich_3.2.s.3.1',
  '3.2.S.3.2':'ich_3.2.s.3.2','3.2.S.4':'ich_3.2.s.4','3.2.S.4.1':'ich_3.2.s.4.1',
  '3.2.S.4.2':'ich_3.2.s.4.2','3.2.S.4.3':'ich_3.2.s.4.3','3.2.S.4.4':'ich_3.2.s.4.4',
  '3.2.S.5':'ich_3.2.s.5','3.2.S.6':'ich_3.2.s.6','3.2.S.7':'ich_3.2.s.7',
  '3.2.S.7.1':'ich_3.2.s.7.1','3.2.S.7.2':'ich_3.2.s.7.2','3.2.S.7.3':'ich_3.2.s.7.3',
  '3.2.P.1':'ich_3.2.p.1','3.2.P.2':'ich_3.2.p.2','3.2.P.3':'ich_3.2.p.3',
  '3.2.P.3.1':'ich_3.2.p.3.1','3.2.P.3.2':'ich_3.2.p.3.2','3.2.P.3.3':'ich_3.2.p.3.3',
  '3.2.P.4':'ich_3.2.p.4','3.2.P.5':'ich_3.2.p.5','3.2.P.5.1':'ich_3.2.p.5.1',
  '3.2.P.5.2':'ich_3.2.p.5.2','3.2.P.5.3':'ich_3.2.p.5.3','3.2.P.5.4':'ich_3.2.p.5.4',
  '3.2.P.5.6':'ich_3.2.p.5.6','3.2.P.6':'ich_3.2.p.6','3.2.P.7':'ich_3.2.p.7',
  '3.2.P.8':'ich_3.2.p.8','3.2.P.8.1':'ich_3.2.p.8.1','3.2.P.8.2':'ich_3.2.p.8.2',
  '3.2.P.8.3':'ich_3.2.p.8.3','3.2.A.1':'ich_3.2.a.1','3.2.A.2':'ich_3.2.a.2',
  '3.2.A.3':'ich_3.2.a.3','3.3':'ich_3.3',
  '4.2.1':'ich_4.2.1.1','4.2.2':'ich_4.2.2.1','4.2.3':'ich_4.2.3.1','4.3':'ich_4.3',
  '5.2':'ich_5.2','5.3.1':'ich_5.3.1.1','5.3.3':'ich_5.3.3.1',
  '5.3.5':'ich_5.3.5.1','5.4':'ich_5.4',
};

function getRegionalOID(authority) {
  const a = (authority||'').toUpperCase();
  if (a.includes('FDA')||a.includes(' US')) return OID.FDA_IG;
  if (a.includes('EMA')||a.includes('EMEA')) return OID.EMA_IG;
  if (a.includes('PMDA')||a.includes('JAPAN')) return OID.PMDA_IG;
  return OID.ICH_IG;
}

function getCouCode(section) {
  const s = section.toUpperCase();
  if (SECTION_TO_COU[s]) return SECTION_TO_COU[s];
  const parts = s.split('.');
  for (let i = parts.length-1; i >= 1; i--) {
    const key = parts.slice(0,i).join('.');
    if (SECTION_TO_COU[key]) return SECTION_TO_COU[key];
  }
  const m = parts[0];
  return {'2':'ich_2.3','3':'ich_3.2.s','4':'ich_4.2.1.1','5':'ich_5.2'}[m] || 'ich_2.3';
}

function md5hex(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

function xe(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dossier_id = searchParams.get('dossier_id');
  const sequence   = searchParams.get('sequence') || '0000';
  if (!dossier_id) return Response.json({ error: 'dossier_id required' }, { status: 400 });

  const db = supabaseAdmin();
  try {
    const { data: dossier } = await db.from('dossiers').select('*').eq('id', dossier_id).single();
    const { data: allNodes } = await db.from('dossier_nodes').select('*')
      .eq('dossier_id', dossier_id).eq('sequence_number', sequence).order('section');
    const { data: docs } = await db.from('documents').select('*').eq('dossier_id', dossier_id);

    // Fetch relates_to for this sequence (ICH M8 relatesTo element)
    const { data: seqMeta } = await db.from('sequences').select('relates_to,relationship_type,label')
      .eq('dossier_id', dossier_id).eq('sequence_number', sequence).single();
    const relatesTo     = seqMeta?.relates_to || null;
    const relationshipType = seqMeta?.relationship_type || 'SUCC';

    const nodeMap = {};
    (allNodes||[]).forEach(n => { nodeMap[n.id] = n; });

    // Download uploaded files and compute MD5
    const uploadedItems = [];
    for (const doc of (docs||[])) {
      const node = nodeMap[doc.node_id];
      if (!node || node.operation === 'unchanged') continue;
      const { data: fileData, error } = await db.storage.from('colab-documents').download(doc.file_path);
      if (error || !fileData) continue;
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const checksum = md5hex(buffer);
      const sec = node.section.toLowerCase().replace(/\./g,'-');
      const modNum = node.module.replace(/[^0-9]/g,'')[0] || '2';
      const filename = doc.filename.replace(/[^a-zA-Z0-9._-]/g,'-');
      const folderPath = `m${modNum}/${sec}/${filename}`;
      uploadedItems.push({ doc, buffer, checksum, folderPath, node });
    }

    const seqInt = parseInt(sequence,10) || 1;
    const seqPadded = String(seqInt).padStart(4,'0');
    const regionalOID = getRegionalOID(dossier.authority);
    const suUUID = randomUUID();
    const subUUID = randomUUID();
    const appUUID = randomUUID();
    const now = new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);

    // Build CoU components
    let components = '';
    let priority = 1000;
    for (const { doc, docUUID, folderPath, node, checksum } of uploadedItems.map(i=>({...i,docUUID:i.doc.id}))) {
      const couCode = getCouCode(node.section);
      const couUUID = randomUUID();
      const statusCode = node.operation === 'delete' ? 'suspended' : 'active';
      components += `
    <component>
      <priorityNumber value="${priority}"/>
      <contextOfUse>
        <id root="${couUUID}"/>
        <code code="${couCode}" codeSystem="${OID.ICH_COU}"/>
        <statusCode code="${statusCode}"/>
        <derivedFrom>
          <documentReference>
            <id root="${docUUID}"/>
          </documentReference>
        </derivedFrom>
      </contextOfUse>
    </component>`;
      priority += 1000;
    }

    // Build document elements
    let docElements = '';
    for (const { doc, checksum, folderPath } of uploadedItems) {
      const title = xe(doc.filename.replace(/\.[^.]+$/,''));
      docElements += `
        <component>
          <document>
            <id root="${doc.id}"/>
            <title value="${title}"/>
            <text integrityCheckAlgorithm="SHA-256" mediaType="application/pdf">
              <reference value="${folderPath}"/>
              <integrityCheck>${checksum}</integrityCheck>
            </text>
          </document>
        </component>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  ICH eCTD v4.0 Submission Unit — Generated by RAISA (CoLAB Pharma Services)
  Product   : ${xe(dossier.product_name)} — ${xe(dossier.country)}
  Authority : ${xe(dossier.authority)} | ${xe(dossier.submission_type)}
  Sequence  : ${seqPadded} | Format: eCTD v4.0 / ICH M8 IG v1.6 (May 2024)
  CV        : ICH eCTD v4.0 CV Package v6 (February 2025)
  Generated : ${new Date().toISOString()}
  Note      : Validate against PORP_IN000001UV.xsd
              Module 1 requires Regional M1 IG supplement
-->
<PORP_IN000001UV ITSVersion="XML_1.0"
  xmlns="urn:hl7-org:v3"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="urn:hl7-org:v3 PORP_IN000001UV.xsd">

  <id root="${randomUUID()}"/>
  <creationTime value="${now}"/>
  <interactionId root="2.16.840.1.113883.1.6" extension="PORP_IN000001UV"/>
  <processingCode code="P"/>
  <processingModeCode code="T"/>
  <acceptAckCode code="AL"/>

  <receiver typeCode="RCV">
    <device classCode="DEV" determinerCode="INSTANCE">
      <id>
        <item root="${regionalOID}" identifierName="${xe(dossier.authority)} Regional IG"/>
        <item root="${OID.ICH_IG}" identifierName="ICH eCTD v4.0 IG v1.6"/>
      </id>
    </device>
  </receiver>

  <sender typeCode="SND">
    <device classCode="DEV" determinerCode="INSTANCE">
      <id root="${randomUUID()}"/>
    </device>
  </sender>

  <controlActProcess classCode="CACT" moodCode="EVN">
    <subject typeCode="SUBJ">
      <submissionUnit>

        <id root="${suUUID}"/>
        <code code="original" codeSystem="${regionalOID}"/>
        <title value="${xe(dossier.submission_type)} — ${xe(dossier.product_name)} — Sequence ${seqPadded}"/>
        <statusCode code="active"/>

        <!-- relatesTo: ICH M8 eCTD v4.0 Sequence Relationship -->
        ${relatesTo ? `
        <relatesTo typeCode="${relationshipType}">
          <submissionUnit>
            <id root="${suUUID}"/>
            <sequenceNumber value="${parseInt(relatesTo)||0}"/>
          </submissionUnit>
        </relatesTo>` : '<!-- Initial submission — no relatesTo -->'}

        <!-- Context of Use — Modules 2 to 5 (ICH harmonised) -->
        ${components}

        <componentOf1>
          <sequenceNumber value="${seqInt}"/>
          <submission>
            <id root="${subUUID}"/>
            <code code="${xe(dossier.submission_type)}" codeSystem="${regionalOID}"/>

            <componentOf>
              <application>
                <id><item root="${appUUID}"/></id>
                <code code="drug-application" codeSystem="${regionalOID}"/>

                <!-- Document Elements -->
                ${docElements}

              </application>
            </componentOf>
          </submission>
        </componentOf1>

      </submissionUnit>
    </subject>
  </controlActProcess>

</PORP_IN000001UV>`;

    // Build ZIP
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const productSlug = (dossier.product_name||'product').replace(/\s+/g,'-').toLowerCase();
    const authSlug = (dossier.authority||'auth').replace(/\s+/g,'-').toUpperCase();
    const root = `${authSlug}-${productSlug}-v4-seq${seqPadded}`;

    zip.file(`${root}/submissionunit.xml`, xml);
    for (const { buffer, folderPath } of uploadedItems) {
      zip.file(`${root}/${folderPath}`, buffer);
    }

    // Node manifest with CoU codes
    const csv = ['Module,Section,CoU Code,Title,Required,Status,Operation,File,MD5 Checksum',
      ...(allNodes||[]).map(n => {
        const item = uploadedItems.find(i => i.node.id === n.id);
        return `"${n.module}","${n.section}","${getCouCode(n.section)}","${n.title.replace(/"/g,'""')}","${n.required?'Yes':'No'}","${n.status}","${n.operation||'new'}","${item?item.doc.filename:''}","${item?item.checksum:''}"`;
      })].join('\n');
    zip.file(`${root}/node-manifest.csv`, csv);

    zip.file(`${root}/README.txt`,
`RAISA eCTD v4.0 Export
======================
Product    : ${dossier.product_name}
Country    : ${dossier.country}
Authority  : ${dossier.authority}
Submission : ${dossier.submission_type}
Standard   : ICH eCTD v4.0 / M8 IG v1.6 (May 2024)
CV Version : ICH eCTD v4.0 CV Package v6 (Feb 2025)
Sequence   : ${seqPadded} (integer value: ${seqInt})
Generated  : ${new Date().toISOString()} by RAISA (CoLAB)

CONTENTS
--------
submissionunit.xml  — eCTD v4.0 XML (validate vs PORP_IN000001UV.xsd)
node-manifest.csv   — Section list with ICH CoU codes and MD5 checksums
m2/ to m5/          — PDFs in ICH CTD folder structure

SUBMISSION STATUS
-----------------
Uploaded  : ${uploadedItems.length} sections
Total     : ${(allNodes||[]).length} sections
Missing   : ${(allNodes||[]).length - uploadedItems.length} sections

IMPORTANT
---------
Module 1 (regional administrative) must be prepared separately
per the Regional M1 Implementation Guide for your target authority:
  FDA  : FDA Regional eCTD v4.0 M1 IG v1.7
  EMA  : EU eCTD v4.0 M1 IG v1.2
  PMDA : JP eCTD v4.0 M1 IG

Validate with: FDA eCTD v4.0 Validation Tool (fda.gov)
               PMDA eCTD v4.0 Validation Tool (pmda.go.jp)

REGIONAL MANDATES
-----------------
Japan PMDA : MANDATORY from April 1, 2026
EMA        : Optional (CAPs) from Dec 22, 2025, mandatory 2027
US FDA     : Voluntary from Sept 16, 2024, mandatory 2029
`);

    const zipBuf = await zip.generateAsync({ type:'nodebuffer', compression:'DEFLATE', compressionOptions:{level:6} });

    return new Response(zipBuf, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${root}.zip"`,
        'Content-Length': zipBuf.length.toString(),
      }
    });

  } catch(err) {
    console.error('v4.0 export error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
