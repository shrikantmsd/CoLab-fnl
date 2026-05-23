import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  const type = searchParams.get('type') || 'projects';
  const parent_id = searchParams.get('parent_id');

  const db = supabaseAdmin();

  try {
    if (type === 'projects') {
      const { data, error } = await db
        .from('projects')
        .select('*, clients(count), products(count)')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return Response.json({ data });
    }

    if (type === 'clients') {
      const { data, error } = await db
        .from('clients')
        .select('*')
        .eq('project_id', parent_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return Response.json({ data });
    }

    if (type === 'products') {
      const { data, error } = await db
        .from('products')
        .select('*, clients(name), dossiers(count)')
        .eq('project_id', parent_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return Response.json({ data });
    }

    if (type === 'dossiers' || type === 'dossier') {
      const { data, error } = await db
        .from('dossiers')
        .select('*, dossier_nodes(count), documents(count)')
        .eq('product_id', parent_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return Response.json({ data });
    }

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { type, ...data } = body;
  const db = supabaseAdmin();

  try {
    // Map modal type names to actual table names
    const tableMap = {
      'project': 'projects',
      'projects': 'projects',
      'clients': 'clients',
      'client': 'clients',
      'products': 'products',
      'product': 'products',
      'dossiers': 'dossiers',
      'dossier': 'dossiers',
    };
    const tableName = tableMap[type] || type;
    // Strip columns that don't belong in each table
    const insertData = { ...data };
    if (tableName !== 'projects') {
      delete insertData.user_id;
    }
    if (tableName === 'dossiers') {
      delete insertData.project_id;  // dossiers links via product_id, not project_id
    }
    // clients and products keep their project_id — no change needed
    const { data: result, error } = await db
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // If creating a dossier, auto-generate nodes from the checklist
    if (type === 'dossiers' || type === 'dossier') {
      try { await generateDossierNodes(db, result); } catch(e) { console.error('Node gen error:', e.message); }
    }

    return Response.json({ data: result });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const body = await request.json();
  const { type, id, ...updates } = body;
  const db = supabaseAdmin();

  try {
    const tableName2 = {'project':'projects','clients':'clients','products':'products','dossiers':'dossiers'}[type] || type;
    const { data, error } = await db
      .from(tableName2)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const db = supabaseAdmin();

  try {
    const tbl = {'project':'projects','clients':'clients','products':'products','dossiers':'dossiers'}[type] || type;
    const { error } = await db.from(tbl).delete().eq('id', id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Auto-generate dossier nodes based on country + submission type
async function generateDossierNodes(db, dossier) {
  const nodes = getStandardNodes(dossier.dossier_format, dossier.m4q_version);

  const nodeRows = nodes.map(n => ({
    dossier_id: dossier.id,
    module: n.module,
    section: n.section,
    title: n.title,
    required: n.required,
    status: 'missing',
    sequence_number: '0000',
  }));

  await db.from('dossier_nodes').insert(nodeRows);

  // Also create the SEQ 0000 sequence record
  try {
    await db.from('sequences').insert({
      dossier_id: dossier.id,
      sequence_number: '0000',
      label: 'Initial Submission',
      description: 'Original / first submission',
      status: 'draft',
    });
  } catch(e) { console.warn('SEQ 0000 already exists:', e.message); }
}

function getStandardNodes(format = 'CTD', version = 'R1') {
  if (format === 'CTD' && version === 'R1') {
    return [
      // Module 1
      { module: 'Module 1', section: '1.0', title: 'Administrative Information', required: true },
      { module: 'Module 1', section: '1.1', title: 'Comprehensive Table of Contents', required: true },
      { module: 'Module 1', section: '1.2', title: 'Application Form', required: true },
      { module: 'Module 1', section: '1.3', title: 'Product Information', required: true },
      { module: 'Module 1', section: '1.4', title: 'Information about Experts', required: true },
      // Module 2
      { module: 'Module 2', section: '2.3', title: 'Quality Overall Summary', required: true },
      { module: 'Module 2', section: '2.4', title: 'Nonclinical Overview', required: true },
      { module: 'Module 2', section: '2.5', title: 'Clinical Overview', required: true },
      { module: 'Module 2', section: '2.6', title: 'Nonclinical Written and Tabulated Summaries', required: true },
      { module: 'Module 2', section: '2.7', title: 'Clinical Summary', required: true },
      // Module 3 — Drug Substance (3.2.S)
      { module: 'Module 3', section: '3.2.S.1.1', title: 'Nomenclature', required: true },
      { module: 'Module 3', section: '3.2.S.1.2', title: 'Structure', required: true },
      { module: 'Module 3', section: '3.2.S.1.3', title: 'General Properties', required: true },
      { module: 'Module 3', section: '3.2.S.2.1', title: 'Manufacturer(s) — Drug Substance', required: true },
      { module: 'Module 3', section: '3.2.S.2.2', title: 'Description of Manufacturing Process and Process Controls', required: true },
      { module: 'Module 3', section: '3.2.S.2.3', title: 'Control of Materials', required: true },
      { module: 'Module 3', section: '3.2.S.2.4', title: 'Controls of Critical Steps and Intermediates', required: true },
      { module: 'Module 3', section: '3.2.S.2.5', title: 'Process Validation and/or Evaluation', required: true },
      { module: 'Module 3', section: '3.2.S.2.6', title: 'Manufacturing Process Development', required: true },
      { module: 'Module 3', section: '3.2.S.3.1', title: 'Elucidation of Structure and Other Characteristics', required: true },
      { module: 'Module 3', section: '3.2.S.3.2', title: 'Impurities', required: true },
      { module: 'Module 3', section: '3.2.S.4.1', title: 'Specification', required: true },
      { module: 'Module 3', section: '3.2.S.4.2', title: 'Analytical Procedures', required: true },
      { module: 'Module 3', section: '3.2.S.4.3', title: 'Validation of Analytical Procedures', required: true },
      { module: 'Module 3', section: '3.2.S.4.4', title: 'Batch Analyses', required: true },
      { module: 'Module 3', section: '3.2.S.4.5', title: 'Justification of Specification', required: true },
      { module: 'Module 3', section: '3.2.S.5', title: 'Reference Standards or Materials', required: true },
      { module: 'Module 3', section: '3.2.S.6', title: 'Container Closure System', required: true },
      { module: 'Module 3', section: '3.2.S.7.1', title: 'Stability Summary and Conclusions', required: true },
      { module: 'Module 3', section: '3.2.S.7.2', title: 'Post-approval Stability Protocol and Commitment', required: true },
      { module: 'Module 3', section: '3.2.S.7.3', title: 'Stability Data', required: true },
      // Module 3 — Drug Product (3.2.P)
      { module: 'Module 3', section: '3.2.P.1', title: 'Description and Composition of the Drug Product', required: true },
      { module: 'Module 3', section: '3.2.P.2', title: 'Pharmaceutical Development', required: true },
      { module: 'Module 3', section: '3.2.P.3.1', title: 'Manufacturer(s) — Drug Product', required: true },
      { module: 'Module 3', section: '3.2.P.3.2', title: 'Batch Formula', required: true },
      { module: 'Module 3', section: '3.2.P.3.3', title: 'Description of Manufacturing Process and Process Controls', required: true },
      { module: 'Module 3', section: '3.2.P.3.4', title: 'Controls of Critical Steps and Intermediates', required: true },
      { module: 'Module 3', section: '3.2.P.3.5', title: 'Process Validation and/or Evaluation', required: true },
      { module: 'Module 3', section: '3.2.P.4', title: 'Control of Excipients', required: true },
      { module: 'Module 3', section: '3.2.P.5.1', title: 'Specification', required: true },
      { module: 'Module 3', section: '3.2.P.5.2', title: 'Analytical Procedures', required: true },
      { module: 'Module 3', section: '3.2.P.5.3', title: 'Validation of Analytical Procedures', required: true },
      { module: 'Module 3', section: '3.2.P.5.4', title: 'Batch Analyses', required: true },
      { module: 'Module 3', section: '3.2.P.5.5', title: 'Characterisation of Impurities', required: true },
      { module: 'Module 3', section: '3.2.P.5.6', title: 'Justification of Specification', required: true },
      { module: 'Module 3', section: '3.2.P.6', title: 'Reference Standards or Materials', required: false },
      { module: 'Module 3', section: '3.2.P.7', title: 'Container Closure System', required: true },
      { module: 'Module 3', section: '3.2.P.8.1', title: 'Stability Summary and Conclusions', required: true },
      { module: 'Module 3', section: '3.2.P.8.2', title: 'Post-approval Stability Protocol and Commitment', required: true },
      { module: 'Module 3', section: '3.2.P.8.3', title: 'Stability Data', required: true },
      // Module 3 — Appendices & Regional
      { module: 'Module 3', section: '3.2.A', title: 'Appendices', required: false },
      { module: 'Module 3', section: '3.2.R', title: 'Regional Information', required: false },
      { module: 'Module 3', section: '3.3', title: 'Literature References', required: false },
      // Module 4
      { module: 'Module 4', section: '4.2.1', title: 'Pharmacology Studies', required: true },
      { module: 'Module 4', section: '4.2.2', title: 'Pharmacokinetics Studies', required: true },
      { module: 'Module 4', section: '4.2.3', title: 'Toxicology Studies', required: true },
      { module: 'Module 4', section: '4.3',   title: 'Literature References', required: false },
      // Module 5
      { module: 'Module 5', section: '5.2', title: 'Tabular Listing of Clinical Studies', required: true },
      { module: 'Module 5', section: '5.3.1', title: 'Reports of Biopharmaceutic Studies', required: true },
      { module: 'Module 5', section: '5.3.3', title: 'Reports of Human PK Studies', required: true },
      { module: 'Module 5', section: '5.3.5', title: 'Reports of Efficacy and Safety Studies', required: true },
    ];
  }

  // ACTD format
  return [
    { module: 'Part I', section: 'I.A', title: 'Table of Contents', required: true },
    { module: 'Part I', section: 'I.B', title: 'Application Form', required: true },
    { module: 'Part I', section: 'I.C', title: 'Summary of Product Characteristics', required: true },
    { module: 'Part I', section: 'I.D', title: 'Labelling', required: true },
    { module: 'Part I', section: 'I.E', title: 'Expert Reports', required: true },
    { module: 'Part II', section: 'II.A', title: 'Quality Overall Summary', required: true },
    { module: 'Part II', section: 'II.B', title: 'Body of Data — Drug Substance', required: true },
    { module: 'Part II', section: 'II.C', title: 'Body of Data — Drug Product', required: true },
    { module: 'Part II', section: 'II.D', title: 'Appendices', required: false },
    { module: 'Part III', section: 'III.A', title: 'Nonclinical Overview', required: true },
    { module: 'Part III', section: 'III.B', title: 'Nonclinical Written Summaries', required: true },
    { module: 'Part III', section: 'III.C', title: 'Nonclinical Tabulated Summaries', required: true },
    { module: 'Part III', section: 'III.D', title: 'Nonclinical Study Reports', required: true },
    { module: 'Part IV', section: 'IV.A', title: 'Clinical Overview', required: true },
    { module: 'Part IV', section: 'IV.B', title: 'Clinical Summary', required: true },
    { module: 'Part IV', section: 'IV.C', title: 'Tabular Listing of Clinical Studies', required: true },
    { module: 'Part IV', section: 'IV.D', title: 'Clinical Study Reports', required: true },
  ];
}
