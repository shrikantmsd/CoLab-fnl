'use client';
import { useState, useEffect } from 'react';
import { THEMES, useTheme, setActiveThemeName } from '../lib/theme';

export default function Settings() {
  const T = useTheme(); // Settings itself previews the active theme live

  const [profile, setProfile] = useState({ profile_name: '', profile_email: '', profile_role: '' });
  const [hasCustomPassword, setHasCustomPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.data) {
          setProfile({
            profile_name: json.data.profile_name || '',
            profile_email: json.data.profile_email || '',
            profile_role: json.data.profile_role || '',
          });
          setHasCustomPassword(!!json.data.has_custom_password);
        }
      } catch { /* leave fields blank if fetch fails */ }
      setLoading(false);
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setSavedMsg('');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSavedMsg('Profile saved');
    } catch {
      setSavedMsg('Could not save — try again');
    }
    setSaving(false);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  async function savePassword() {
    if (!newPassword.trim()) return;
    setSaving(true);
    setSavedMsg('');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword.trim() }),
      });
      setHasCustomPassword(true);
      setNewPassword('');
      setSavedMsg('Password updated — the original one still works too');
    } catch {
      setSavedMsg('Could not save — try again');
    }
    setSaving(false);
    setTimeout(() => setSavedMsg(''), 4000);
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: `1px solid ${T.border}`,
    borderRadius: 7, fontSize: 13, fontFamily: T.fontFamily, boxSizing: 'border-box',
    background: T.white, color: T.text,
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase',
    letterSpacing: '0.05em', display: 'block', marginBottom: 6,
  };
  const cardStyle = {
    background: T.white, borderRadius: 12, border: `1px solid ${T.border}`,
    padding: 22, marginBottom: 20,
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: T.bg, padding: 24, fontFamily: T.fontFamily }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: T.navy }}>Settings</h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: T.muted }}>
          Appearance, profile, and access — shared across everyone using RAISA right now.
        </p>

        {/* ── Appearance ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Appearance</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
            This is saved on this device — pick whichever theme you prefer viewing RAISA in.
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {Object.values(THEMES).map(theme => {
              const active = theme.name === T.name;
              return (
                <div key={theme.name} onClick={() => setActiveThemeName(theme.name)}
                  style={{
                    flex: 1, cursor: 'pointer', borderRadius: 10, padding: 14,
                    border: active ? `2px solid ${theme.lime}` : `1px solid ${T.border}`,
                    background: theme.bg,
                  }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: theme.navy }} />
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: theme.lime }} />
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: theme.white, border: `1px solid ${T.border}` }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.navy === '#0A0A0A' ? theme.navy : theme.text }}>
                    {theme.label}
                  </div>
                  {active && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.mid, marginTop: 4 }}>✓ Active</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Profile ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Profile</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
            Shared for now — this becomes each person's own profile once individual logins exist.
          </div>
          {loading ? (
            <div style={{ fontSize: 12, color: T.dim }}>Loading…</div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={profile.profile_name}
                  onChange={e => setProfile(p => ({ ...p, profile_name: e.target.value }))}
                  placeholder="e.g. Shrikant Sharma" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={profile.profile_email} type="email"
                  onChange={e => setProfile(p => ({ ...p, profile_email: e.target.value }))}
                  placeholder="e.g. shrikant@colab.pharma" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Role / Title</label>
                <input style={inputStyle} value={profile.profile_role}
                  onChange={e => setProfile(p => ({ ...p, profile_role: e.target.value }))}
                  placeholder="e.g. Senior Consultant" />
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding: '9px 20px', background: T.navy, color: '#fff', border: 'none',
                  borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
                  fontFamily: T.fontFamily }}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </>
          )}
        </div>

        {/* ── Access ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Access Password</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
            {hasCustomPassword
              ? 'A custom password is set. The original default password still works too, as a safety net.'
              : 'Currently using the default access password. Set a new one below if you want to change it.'}
          </div>
          <label style={labelStyle}>New Password</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="Enter a new password" />
            <button onClick={savePassword} disabled={saving || !newPassword.trim()}
              style={{ padding: '9px 18px', background: T.navy, color: '#fff', border: 'none',
                borderRadius: 7, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                cursor: (saving || !newPassword.trim()) ? 'not-allowed' : 'pointer',
                opacity: (saving || !newPassword.trim()) ? 0.5 : 1, fontFamily: T.fontFamily }}>
              Update
            </button>
          </div>
        </div>

        {savedMsg && (
          <div style={{ fontSize: 12, fontWeight: 600, color: T.mid, textAlign: 'center', marginTop: -8, marginBottom: 16 }}>
            {savedMsg}
          </div>
        )}
      </div>
    </div>
  );
}
