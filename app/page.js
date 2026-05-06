'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Dashboard = dynamic(
  () => import('../components/Dashboard'),
  { ssr: false, loading: () => <Loader text="Loading Dashboard..." /> }
);

const RaisaChecklist = dynamic(
  () => import('../components/ctd-regulatory-assistant'),
  { ssr: false, loading: () => <Loader text="Loading Checklist..." /> }
);

const DocumentReview = dynamic(
  () => import('../components/DocumentReview'),
  { ssr: false, loading: () => <Loader text="Loading Document Review..." /> }
);

const IndiaRegulatory = dynamic(
  () => import('../components/IndiaRegulatory').then(m => ({ default: m.IndiaRegulatoryApp })),
  { ssr: false, loading: () => <Loader text="Loading India Regulatory..." /> }
);

const ProjectManager = dynamic(
  () => import('../components/ProjectManager'),
  { ssr: false, loading: () => <Loader text="Loading Project Manager..." /> }
);

function Loader({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh',
      background:'#F0F4F8', fontFamily:'Segoe UI,sans-serif', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid #D4D4D4', borderTop:'3px solid #1A3D6B',
        borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <div style={{ color:'#5D5D5D', fontSize:14 }}>{text}</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'CoLAB@2026';

const TABS = [
  { id:'dashboard', label:'Dashboard',         icon:'⊞'  },
  { id:'projects',  label:'Project Manager',   icon:'📁' },
  { id:'checklist', label:'Checklist',          icon:'✓'  },
  { id:'review',    label:'Document Review',    icon:'📋' },
  { id:'india',     label:'India Regulatory',   icon:'🇮🇳' },
];

export default function Home() {
  const [status,    setStatus]    = useState('checking');
  const [input,     setInput]     = useState('');
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const ok = sessionStorage.getItem('raisa_ok');
    setStatus(ok === 'true' ? 'app' : 'login');
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem('raisa_ok', 'true');
      setStatus('app');
    } else {
      setError('Incorrect access code.');
      setInput('');
    }
  }

  if (status === 'checking') return null;

  // ── APP ──────────────────────────────────────────────────────────────────
  if (status === 'app') {
    // Full-window Document Review — hides everything else
    if (activeTab === 'review') {
      return <DocumentReview onBack={() => setActiveTab('dashboard')} />;
    }

    return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* ── Top navigation bar ── */}
      <div style={{ background:'#1A3D6B', display:'flex', alignItems:'center',
        padding:'0', flexShrink:0, height:44 }}>

        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', height:44, flexShrink:0,
          borderRight:'1px solid rgba(255,255,255,0.12)', padding:'0 16px', marginRight:4 }}>
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <span style={{ fontSize:13, fontWeight:800, color:'#fff',
                letterSpacing:2, fontFamily:'Segoe UI,sans-serif' }}>RAISA</span>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>by CoLAB</span>
            </div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:1 }}>
              Regulatory Affairs Intelligence System & Analytics
            </div>
          </div>
        </div>

        {/* Tabs */}
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:'0 16px', height:44, border:'none', cursor:'pointer',
              background: activeTab===tab.id ? 'rgba(255,255,255,0.13)' : 'transparent',
              color: activeTab===tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize:12, fontWeight: activeTab===tab.id ? 700 : 400,
              fontFamily:'Segoe UI,sans-serif',
              borderBottom: activeTab===tab.id ? '3px solid #fff' : '3px solid transparent',
              transition:'all .15s', display:'flex', alignItems:'center', gap:6 }}
            onMouseEnter={e => { if(activeTab!==tab.id) e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { if(activeTab!==tab.id) e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
            <span style={{ fontSize:tab.id==='dashboard'?11:13 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        {/* Sign out */}
        <button onClick={() => { sessionStorage.removeItem('raisa_ok'); setStatus('login'); }}
          style={{ marginLeft:'auto', marginRight:16, background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.55)',
            padding:'4px 12px', borderRadius:4, cursor:'pointer',
            fontSize:11, fontFamily:'Segoe UI,sans-serif' }}>
          Sign out
        </button>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>

        {/* Dashboard — landing page, always mounted */}
        <div style={{ position:'absolute', inset:0,
          display: activeTab==='dashboard' ? 'block' : 'none', overflowY:'auto' }}>
          <Dashboard onNavigate={setActiveTab} />
        </div>

        {/* Project Manager — keep mounted for state preservation */}
        <div style={{ position:'absolute', inset:0,
          display: activeTab==='projects' ? 'block' : 'none' }}>
          <ProjectManager userId="user_default" />
        </div>

        {/* Checklist */}
        {activeTab === 'checklist' && (
          <div style={{ position:'absolute', inset:0 }}>
            <RaisaChecklist initialMode="checklist" />
          </div>
        )}

        {/* India Regulatory — keep mounted for state preservation */}
        <div style={{ position:'absolute', inset:0,
          display: activeTab==='india' ? 'block' : 'none' }}>
          <IndiaRegulatory />
        </div>
      </div>
    </div>
  );
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#F0F0F0', fontFamily:'Segoe UI,sans-serif', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:11, color:'#A8A8A8', letterSpacing:'1.5px',
            textTransform:'uppercase', marginBottom:10, fontWeight:500 }}>
            CoLAB Pharma Services
          </div>
          <div style={{ display:'inline-flex', alignItems:'stretch', marginBottom:12 }}>
            <div style={{ background:'#1A3D6B', color:'#fff', padding:'10px 20px',
              borderRadius:'6px 0 0 6px', fontSize:26, fontWeight:800, letterSpacing:3, lineHeight:1 }}>
              RAISA
            </div>
            <div style={{ background:'#2B579A', color:'rgba(255,255,255,0.8)', padding:'8px 14px',
              borderRadius:'0 6px 6px 0', fontSize:10, fontWeight:500, lineHeight:1.5,
              display:'flex', alignItems:'center' }}>
              <div>Regulatory Affairs<br/>Intelligence System<br/>&amp; Analytics</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:'#5D5D5D' }}>
            Pharmaceutical regulatory intelligence · 128+ countries
          </div>
        </div>

        <form onSubmit={handleSubmit}
          style={{ background:'#fff', borderRadius:12, padding:28,
            border:'1px solid #D4D4D4', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
          <label style={{ fontSize:11, fontWeight:600, color:'#5D5D5D',
            letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>
            Access Code
          </label>
          <input type="password" value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            placeholder="Enter your access code" autoFocus
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #D4D4D4',
              borderRadius:7, fontSize:14, outline:'none', boxSizing:'border-box',
              marginBottom:12, fontFamily:'Segoe UI,sans-serif', color:'#1E1E1E' }}
            onFocus={e => e.target.style.borderColor='#1A3D6B'}
            onBlur={e  => e.target.style.borderColor='#D4D4D4'}
          />
          {error && (
            <div style={{ fontSize:12, color:'#C50F1F', background:'#FFF0F0',
              border:'1px solid #FFD0D0', borderRadius:5, padding:'8px 10px', marginBottom:12 }}>
              {error}
            </div>
          )}
          <button type="submit"
            style={{ width:'100%', padding:11, background:'#1A3D6B', color:'#fff',
              border:'none', borderRadius:7, fontSize:14, fontWeight:600,
              cursor:'pointer', fontFamily:'Segoe UI,sans-serif' }}>
            Enter RAISA
          </button>
          <div style={{ textAlign:'center', marginTop:18, paddingTop:16,
            borderTop:'1px solid #F0F0F0', fontSize:11, color:'#C8C8C8' }}>
            A product of <span style={{ color:'#5D5D5D', fontWeight:500 }}>CoLAB</span> Pharma Services
          </div>
        </form>
      </div>
    </div>
  );
}
