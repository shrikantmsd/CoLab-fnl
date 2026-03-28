'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const RaisaApp = dynamic(
  () => import('../components/ctd-regulatory-assistant'),
  {
    ssr: false,
    loading: () => (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',
        background:'#F0F0F0',fontFamily:'Segoe UI,sans-serif',flexDirection:'column',gap:'16px'}}>
        <div style={{width:'40px',height:'40px',border:'3px solid #D4D4D4',borderTop:'3px solid #1A3D6B',
          borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <div style={{color:'#5D5D5D',fontSize:'14px'}}>Loading RAISA...</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    ),
  }
);

const ProjectManager = dynamic(() => import('../components/ProjectManager'), {
  ssr: false,
  loading: () => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',
      background:'#F0F0F0',fontFamily:'Segoe UI,sans-serif',flexDirection:'column',gap:'16px'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid #D4D4D4',borderTop:'3px solid #1A3D6B',
        borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <div style={{color:'#5D5D5D',fontSize:'14px'}}>Loading Project Manager...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

const PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'raisa2026';

export default function Home() {
  const [status, setStatus]       = useState('checking');
  const [input, setInput]         = useState('');
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('checklist');

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
      setError('Incorrect access code. Please check your credentials and try again.');
      setInput('');
    }
  }

  if (status === 'checking') return null;

  // ── APP ────────────────────────────────────────────────────────────────────
  if (status === 'app') return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>

      {/* Top bar — CoLAB division > RAISA product */}
      <div style={{background:'#1A3D6B',display:'flex',alignItems:'center',
        padding:'0 16px 0 0',flexShrink:0}}>

        {/* Brand identity */}
        <div style={{display:'flex',alignItems:'center',borderRight:'1px solid rgba(255,255,255,0.15)',
          padding:'0 16px 0 14px',marginRight:'4px',height:'44px'}}>
          <div style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:'6px'}}>
              <span style={{fontSize:'13px',fontWeight:'700',color:'#fff',
                letterSpacing:'1px',fontFamily:'Segoe UI,sans-serif'}}>
                RAISA
              </span>
              <span style={{fontSize:'9px',color:'rgba(255,255,255,0.45)',
                fontFamily:'Segoe UI,sans-serif',letterSpacing:'0.3px'}}>
                by CoLAB
              </span>
            </div>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',
              fontFamily:'Segoe UI,sans-serif',letterSpacing:'0.2px',marginTop:'1px'}}>
              Regulatory Affairs Intelligence System & Analytics
            </div>
          </div>
        </div>

        {/* Tab buttons */}
        {[
          { id:'checklist', label:'Checklist & Review' },
          { id:'projects',  label:'Project Manager' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'0 16px', height:'44px', border:'none', cursor:'pointer',
            background: activeTab === tab.id ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
            fontSize:'12px', fontWeight: activeTab === tab.id ? 600 : 400,
            fontFamily:'Segoe UI,sans-serif',
            borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
            transition:'all .15s',
          }}>
            {tab.label}
          </button>
        ))}

        {/* Sign out */}
        <button
          onClick={() => { sessionStorage.removeItem('raisa_ok'); setStatus('login'); }}
          style={{marginLeft:'auto',background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.18)',color:'rgba(255,255,255,0.55)',
            padding:'4px 12px',borderRadius:'4px',cursor:'pointer',
            fontSize:'11px',fontFamily:'Segoe UI,sans-serif'}}>
          Sign out
        </button>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:'hidden'}}>
        {activeTab === 'checklist' && <RaisaApp />}
        {activeTab === 'projects'  && <ProjectManager userId="user_default" />}
      </div>
    </div>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#F0F0F0',fontFamily:'Segoe UI,sans-serif',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>

        {/* Logo block */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>

          {/* CoLAB parent label */}
          <div style={{fontSize:'11px',color:'#A8A8A8',letterSpacing:'1.5px',
            textTransform:'uppercase',marginBottom:'10px',fontWeight:'500'}}>
            CoLAB Pharma Services
          </div>

          {/* RAISA product name */}
          <div style={{display:'inline-flex',alignItems:'stretch',marginBottom:'12px'}}>
            <div style={{background:'#1A3D6B',color:'#fff',
              padding:'10px 20px',borderRadius:'6px 0 0 6px',
              fontSize:'26px',fontWeight:'800',letterSpacing:'3px',
              fontFamily:'Segoe UI,sans-serif',lineHeight:'1'}}>
              RAISA
            </div>
            <div style={{background:'#2B579A',color:'rgba(255,255,255,0.8)',
              padding:'8px 14px',borderRadius:'0 6px 6px 0',
              fontSize:'10px',fontWeight:'500',letterSpacing:'0.4px',
              lineHeight:'1.5',display:'flex',alignItems:'center',
              fontFamily:'Segoe UI,sans-serif'}}>
              <div>
                Regulatory Affairs<br/>
                Intelligence System<br/>
                &amp; Analytics
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{fontSize:'12px',color:'#5D5D5D'}}>
            Pharmaceutical regulatory intelligence · 128+ countries
          </div>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit}
          style={{background:'#fff',borderRadius:'12px',padding:'28px',
            border:'1px solid #D4D4D4',boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>

          <label style={{fontSize:'11px',fontWeight:'600',color:'#5D5D5D',
            letterSpacing:'0.06em',textTransform:'uppercase',
            display:'block',marginBottom:'8px'}}>
            Access Code
          </label>

          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            placeholder="Enter your access code"
            autoFocus
            style={{width:'100%',padding:'11px 14px',
              border:'1.5px solid #D4D4D4',borderRadius:'7px',
              fontSize:'14px',outline:'none',boxSizing:'border-box',
              marginBottom:'12px',fontFamily:'Segoe UI,sans-serif',
              color:'#1E1E1E'}}
            onFocus={e => e.target.style.borderColor='#1A3D6B'}
            onBlur={e  => e.target.style.borderColor='#D4D4D4'}
          />

          {error && (
            <div style={{fontSize:'12px',color:'#C50F1F',background:'#FFF0F0',
              border:'1px solid #FFD0D0',borderRadius:'5px',
              padding:'8px 10px',marginBottom:'12px',lineHeight:'1.5'}}>
              {error}
            </div>
          )}

          <button type="submit"
            style={{width:'100%',padding:'11px',background:'#1A3D6B',
              color:'#fff',border:'none',borderRadius:'7px',fontSize:'14px',
              fontWeight:'600',cursor:'pointer',fontFamily:'Segoe UI,sans-serif',
              letterSpacing:'0.5px'}}>
            Enter RAISA
          </button>

          {/* CoLAB footer */}
          <div style={{textAlign:'center',marginTop:'18px',paddingTop:'16px',
            borderTop:'1px solid #F0F0F0',fontSize:'11px',color:'#C8C8C8',
            letterSpacing:'0.3px'}}>
            A product of <span style={{color:'#5D5D5D',fontWeight:'500'}}>CoLAB</span> Pharma Services
          </div>

        </form>
      </div>
    </div>
  );
}
