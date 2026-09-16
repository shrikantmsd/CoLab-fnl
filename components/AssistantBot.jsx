'use client';
import { useState, useEffect, useCallback } from 'react';

const NAVY = '#1A3D6B';
const ACCENT = '#2B579A';
const FACE = '#EAF2FC';

// Thresholds shared with the rest of the app (same 60-day window used in the
// Project Manager compliance modal, same <15-day window used for tenders).
const COMPLIANCE_URGENT_DAYS = 60;
const TENDER_URGENT_DAYS = 15;
const GUIDELINE_FRESH_DAYS = 14;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.round(diff / 86400000);
}

function readCompanyData() {
  try { return JSON.parse(localStorage.getItem('raisa_company_data') || '{}'); } catch { return {}; }
}

// Loosely match a tender's text against a product name/INN — case-insensitive
// substring check in either direction, good enough for a heuristic v1.
function looksLikeMatch(tenderText, productName) {
  if (!tenderText || !productName) return false;
  const a = tenderText.toLowerCase();
  const b = productName.toLowerCase().trim();
  if (b.length < 3) return false;
  return a.includes(b) || b.includes(a);
}

async function buildSignals() {
  const signals = [];

  // ── Dossiers: compliance dates + RTQ-open sequences ──────────────────────
  let dossiers = [];
  try {
    const res = await fetch('/api/projects?type=all-dossiers');
    const json = await res.json();
    dossiers = json.data || [];
  } catch { /* portfolio fetch failed — skip dossier-based signals this pass */ }

  dossiers.forEach(d => {
    const label = d.product_name || d.product_inn || 'Untitled product';
    const where = d.country ? ` — ${d.country}` : '';

    const annualDays = daysUntil(d.annual_filing_due);
    if (annualDays != null && annualDays < COMPLIANCE_URGENT_DAYS) {
      signals.push({
        severity: annualDays < 0 ? 'overdue' : 'urgent',
        icon: '📅',
        title: `Annual filing ${annualDays < 0 ? 'overdue' : 'due soon'}: ${label}${where}`,
        subtitle: annualDays < 0 ? `${Math.abs(annualDays)} days overdue` : `Due in ${annualDays} days`,
        tab: 'projects',
      });
    }

    const renewalDays = daysUntil(d.registration_renewal_due);
    if (renewalDays != null && renewalDays < COMPLIANCE_URGENT_DAYS) {
      signals.push({
        severity: renewalDays < 0 ? 'overdue' : 'urgent',
        icon: '📅',
        title: `Registration renewal ${renewalDays < 0 ? 'overdue' : 'due soon'}: ${label}${where}`,
        subtitle: renewalDays < 0 ? `${Math.abs(renewalDays)} days overdue` : `Due in ${renewalDays} days`,
        tab: 'projects',
      });
    }

    (d.sequences || []).forEach(seq => {
      const isRtq = /rtq|response to query/i.test(seq.label || '');
      const isOpen = !['submitted', 'approved', 'complete', 'completed'].includes((seq.status || '').toLowerCase());
      if (isRtq && isOpen) {
        signals.push({
          severity: 'urgent',
          icon: '📨',
          title: `RTQ awaiting response: ${label}${where}`,
          subtitle: seq.label || 'Response to Query',
          tab: 'projects',
        });
      }
    });
  });

  // ── Guideline updates — recent ones only, not the whole archive ─────────
  try {
    const res = await fetch('/api/business-intel/data?category=guidelines');
    const json = await res.json();
    (json.data || []).forEach(g => {
      const ageDays = g.createdAt ? Math.round((Date.now() - new Date(g.createdAt)) / 86400000) : null;
      if (ageDays != null && ageDays <= GUIDELINE_FRESH_DAYS) {
        signals.push({
          severity: 'notice',
          icon: '📘',
          title: `New guideline: ${g.title}`,
          subtitle: g.authority || '',
          tab: 'bizdev',
        });
      }
    });
  } catch { /* guideline fetch failed — skip this signal source */ }

  // ── Tenders matching a product you already have a working dossier for ──
  try {
    const res = await fetch('/api/business-intel/data?category=tenders');
    const json = await res.json();
    const readyProducts = dossiers.filter(d => (d.status || 'draft') !== 'draft');
    (json.data || []).forEach(t => {
      const match = readyProducts.find(d =>
        looksLikeMatch(t.product, d.product_name) || looksLikeMatch(t.title, d.product_name) ||
        looksLikeMatch(t.product, d.product_inn) || looksLikeMatch(t.title, d.product_inn));
      if (match) {
        signals.push({
          severity: t.daysLeft != null && t.daysLeft < TENDER_URGENT_DAYS ? 'urgent' : 'notice',
          icon: '📢',
          title: `Tender match: ${t.title}`,
          subtitle: `You have a dossier for ${match.product_name || match.product_inn}`,
          tab: 'bizdev',
        });
      }
    });
  } catch { /* tender fetch failed — skip this signal source */ }

  // ── Company licence / WHO-GMP expiry — read from local company data ─────
  const companies = readCompanyData();
  Object.values(companies).forEach(c => {
    [
      { field: 'who_gmp_expiry', label: 'WHO-GMP certificate' },
      { field: 'mfg_licence_expiry', label: 'Manufacturing licence' },
    ].forEach(({ field, label }) => {
      const dLeft = daysUntil(c[field]);
      if (dLeft != null && dLeft < COMPLIANCE_URGENT_DAYS) {
        signals.push({
          severity: dLeft < 0 ? 'overdue' : 'urgent',
          icon: '📜',
          title: `${label} ${dLeft < 0 ? 'expired' : 'expiring soon'}: ${c.company_name || 'Company'}`,
          subtitle: dLeft < 0 ? `${Math.abs(dLeft)} days overdue` : `Expires in ${dLeft} days`,
          tab: 'review',
        });
      }
    });
  });

  // Overdue first, then urgent, then notice — most important at the top.
  const order = { overdue: 0, urgent: 1, notice: 2 };
  signals.sort((a, b) => order[a.severity] - order[b.severity]);
  return signals;
}

export default function AssistantBot({ onNavigate }) {
  const [signals, setSignals] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await buildSignals();
    setSignals(result);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const hasUrgent = signals.some(s => s.severity !== 'notice');
  const statusColor = loading ? '#9CA3AF' : hasUrgent ? '#F59E0B' : '#2ECC71';

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
      fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>

      {open && (
        <div style={{ position: 'absolute', bottom: 78, right: 0, width: 320, maxHeight: 420,
          background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
          border: '1px solid #E0E0E0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          <div style={{ background: NAVY, color: '#fff', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>What needs attention</span>
            <button onClick={refresh} title="Re-check"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: 13 }}>↻</button>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: 15 }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Checking…</div>
            ) : signals.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 12, lineHeight: 1.6 }}>
                Nothing urgent right now — filings, RTQs, licences and tenders all look on track.
              </div>
            ) : signals.map((s, i) => {
              const sevColor = s.severity === 'overdue' ? '#DC2626' : s.severity === 'urgent' ? '#D97706' : '#2B579A';
              return (
                <div key={i} onClick={() => { onNavigate?.(s.tab); setOpen(false); }}
                  style={{ display: 'flex', gap: 10, padding: '10px 16px', cursor: 'pointer',
                    borderBottom: '1px solid #F0F0F0', alignItems: 'flex-start' }}
                  onMouseOver={e => e.currentTarget.style.background = '#F7F9FC'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1E1E1E', lineHeight: 1.4 }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: sevColor, fontWeight: 600, marginTop: 2 }}>{s.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div onClick={() => setOpen(v => !v)} style={{ cursor: 'pointer', position: 'relative' }}
        title={hasUrgent ? `${signals.length} things need attention` : 'All clear'}>
        <svg width="60" height="66" viewBox="0 0 60 66">
          <ellipse cx="30" cy="60" rx="20" ry="4" fill="#0F1E33" opacity="0.15"/>
          <line x1="30" y1="18" x2="30" y2="6" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="30" cy="5" r="4.5" fill={statusColor}/>
          {hasUrgent && !loading && <circle cx="30" cy="5" r="7.5" fill={statusColor} opacity="0.3"/>}
          <ellipse cx="30" cy="38" rx="24" ry="26" fill={NAVY}/>
          <ellipse cx="22" cy="26" rx="9" ry="11" fill={ACCENT} opacity="0.55"/>
          <circle cx="30" cy="30" r="14" fill={FACE}/>
          <circle cx="25" cy="29" r="2" fill={NAVY}/>
          <circle cx="35" cy="29" r="2" fill={NAVY}/>
          <path d="M24 35 Q30 39 36 35" fill="none" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        {signals.length > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, background: '#DC2626', color: '#fff',
            fontSize: 10, fontWeight: 800, minWidth: 17, height: 17, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            border: '2px solid #fff' }}>
            {signals.length}
          </span>
        )}
      </div>
    </div>
  );
}
