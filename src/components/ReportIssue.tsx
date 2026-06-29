import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Upload, Camera, Sparkles, CheckCircle, MapPin, Send, AlertCircle, RefreshCw, Twitter, FileText } from 'lucide-react';

// Hardcoded state-municipal authority lookup table for Phase 1 targeting
const AUTHORITY_CONTACTS: Record<string, Record<string, { authority: string; email: string; twitter: string }>> = {
  'Delhi': {
    'Infrastructure': { authority: 'Delhi Public Works Dept (PWD)', email: 'complaints@pwd.delhi.gov.in', twitter: '@pwddelhi' },
    'Waste Management': { authority: 'Municipal Corporation of Delhi (MCD)', email: 'sanitation@mcd.gov.in', twitter: '@MCD_Delhi' },
    'Electricity': { authority: 'BSES Yamuna Power Ltd', email: 'bypl.complaints@relianceada.com', twitter: '@BSESDelhi' },
    'Corruption': { authority: 'Anti-Corruption Branch HQ, Delhi', email: 'acbdelhi@nic.in', twitter: '@ACB_Delhi' },
    'default': { authority: 'District Commissioner Office Delhi', email: 'dc-office@delhi.gov.in', twitter: '@DelhiGovDigital' }
  },
  'Karnataka': {
    'Infrastructure': { authority: 'Bruhat Bengaluru Mahanagara Palike (BBMP - PWD)', email: 'comm@bbmp.gov.in', twitter: '@BBMPCOMM' },
    'Waste Management': { authority: 'BBMP Solid Waste Management Dept', email: 'swm@bbmp.gov.in', twitter: '@BBMPSWM' },
    'Electricity': { authority: 'Bangalore Electricity Supply (BESCOM)', email: 'complaints@bescom.co.in', twitter: '@NammaBESCOM' },
    'Corruption': { authority: 'Karnataka Lokayukta', email: 'lokayukta@kar.nic.in', twitter: '@KArLokayukta' },
    'default': { authority: 'BBMP Grievance Redressal Cell', email: 'grievance@bbmp.gov.in', twitter: '@BBMP_Grievance' }
  },
  'Maharashtra': {
    'Infrastructure': { authority: 'Brihanmumbai Municipal Corporation (BMC)', email: 'mc@mcgm.gov.in', twitter: '@mybmc' },
    'Waste Management': { authority: 'BMC Solid Waste Management Division', email: 'mc.sanitation@mcgm.gov.in', twitter: '@mybmcsWM' },
    'Electricity': { authority: 'MSEDCL Maharashtra Power Grid', email: 'powercell@msedcl.gov.in', twitter: '@MSEDCL' },
    'Corruption': { authority: 'Anti-Corruption Bureau, Maharashtra', email: 'acbwebcomplaint@mahapolice.gov.in', twitter: '@ACBMaharashtra' },
    'default': { authority: 'Mumbai Ward Commissioner Board', email: 'wardcommissioner@mcgm.gov.in', twitter: '@mybmcHelp' }
  }
};

const PRESET_MOCK_IMAGES = [
  {
    id: 'p1',
    title: 'Waterlogged Pothole',
    caption: 'Hazardous water-logged crater in Gurgaon, Sector 14',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
    description: 'Extremely deep pothole filled with rainwater. Vehicles are swerving to avoid it, causing near-miss accidents. It is located near the metro pillar 45.'
  },
  {
    id: 'p2',
    title: 'Garbage Dump Overflow',
    caption: 'Overflowing dustbins in Koramangala, Bengaluru',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
    description: 'The community primary garbage bin is completely filled and trash is spilling on the footpath. Stray dogs are scattering it, causing foul smell and unhygienic conditions.'
  },
  {
    id: 'p3',
    title: 'Broken Streetlight Row',
    caption: 'Dark residential row in Dadar, Mumbai',
    url: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=400',
    description: 'Three consecutive streetlights are not operational since last Monday. The street is Pitch black after 7 PM, making it unsafe for women and children.'
  }
];

export const ReportIssue: React.FC = () => {
  const { t } = useTranslation();
  const { analyzeImage, reportIssue, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [ticketId, setTicketId] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(3);
  const [anonymous, setAnonymous] = useState(false);
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('New Delhi');
  const [ward, setWard] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  // Auto-escalated compiled information
  const [authorityName, setAuthorityName] = useState('Local Municipal Corporation');
  const [authorityEmail, setAuthorityEmail] = useState('local-complaints@india.gov.in');
  const [authorityTwitter, setAuthorityTwitter] = useState('@IndiaGrievance');
  const [emailDraft, setEmailDraft] = useState('');

  // AI Security and Authenticity check state to prevent fake entries
  const [authenticity, setAuthenticity] = useState<{ status: string; reason: string } | null>(null);

  const triggerAIImageAnalysis = async (imgData: string) => {
    setLoadingAI(true);
    showToast('info', 'AI Vision Agent analyzing image & physical site authenticity...');
    try {
      const suggestions = await analyzeImage(imgData);
      
      setTitle(suggestions.title || 'Civic Hazard');
      setCategory(suggestions.category || 'Infrastructure');
      setSeverity(suggestions.severity || 3);
      setDescription(suggestions.description || 'A potential civic issue detected from photo.');
      
      if (suggestions.detectedLocation) {
        setState(suggestions.detectedLocation.state || 'Delhi');
        setCity(suggestions.detectedLocation.city || 'New Delhi');
        setWard(suggestions.detectedLocation.ward || 'Sector 14 Area');
        setLandmark(suggestions.detectedLocation.landmark || '');
        setPincode(suggestions.detectedLocation.pincode || '110001');
      }

      if (suggestions.authenticityCheck) {
        setAuthenticity(suggestions.authenticityCheck);
        if (suggestions.authenticityCheck.status === 'VERIFIED') {
          showToast('success', 'AI Integrity Guard: Photo verified authentic. Fake entry filter passed!');
        } else {
          showToast('warning', 'AI Integrity Alert: Unrecognized geotag or suspicious pattern detected.');
        }
      }
      
      setStep(2);
    } catch (e) {
      console.error(e);
      showToast('error', 'AI vision processing failed. Entering details manually.');
      setStep(2);
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePresetSelect = async (preset: typeof PRESET_MOCK_IMAGES[0]) => {
    setImageUrl(preset.url);
    await triggerAIImageAnalysis(preset.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        triggerAIImageAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep2 = () => {
    if (!title.trim()) {
      showToast('error', 'Please enter an issue title.');
      return;
    }
    if (!description.trim()) {
      showToast('error', 'Please provide a description.');
      return;
    }
    setStep(3);
  };

  const handleGPSDetect = () => {
    showToast('info', 'Detecting GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Mocking address fields based on coordinates
        setWard('Ward No. 12, Indiranagar Cell');
        setState('Karnataka');
        setCity('Bengaluru');
        setPincode('560038');
        showToast('success', 'Coordinates match: Ward No. 12, Bengaluru.');
      },
      (err) => {
        showToast('warning', 'Permission blocked. Please enter location manually.');
        setWard('Sector 14 Area');
        setCity('New Delhi');
        setState('Delhi');
        setPincode('110001');
      }
    );
  };

  const handleNextStep3 = () => {
    if (!city.trim() || !state.trim() || !ward.trim()) {
      showToast('error', 'Please fill in city, state, and ward.');
      return;
    }

    // Trigger Phase 1 Auto-Escalation Agent: Authority Lookup and Email compilation
    const lookupState = state.includes('Delhi') ? 'Delhi' : state.includes('Karnataka') ? 'Karnataka' : state.includes('Maharashtra') ? 'Maharashtra' : 'default';
    const contacts = AUTHORITY_CONTACTS[lookupState]?.[category] || AUTHORITY_CONTACTS[lookupState]?.['default'] || AUTHORITY_CONTACTS['Delhi']['default'];

    setAuthorityName(contacts.authority);
    setAuthorityEmail(contacts.email);
    setAuthorityTwitter(contacts.twitter);

    const emailText = `To: ${contacts.email}\nSubject: Formal Complaint - ${title} [SabkaSolution Token ID: SS-${Date.now().toString().substring(7)}]\n\nRespected Sir/Madam,\n\nWe are writing to officially report a severe ${category} issue in ${city}, ${state}.\n\nLocation: ${ward}, Landmark: ${landmark || 'None'}, Pincode: ${pincode || 'None'}\n\nDescription details: ${description}\n\nThis complaint was filed on our citizen grievance portal. We kindly urge you to dispatch field inspectors and expedite the resolution.\n\nSincerely,\nSabkaSolution Citizen Coalition\nReporter: ${anonymous ? 'Anonymous Whistleblower' : 'Active Citizen'}`;

    setEmailDraft(emailText);
    setStep(4);
  };

  const handleSubmitReport = async () => {
    setLoadingAI(true);
    try {
      const res = await reportIssue({
        title,
        category,
        description,
        location: `${ward}, ${landmark ? `${landmark}, ` : ''}${city}, ${state}`,
        ward,
        city,
        state,
        pincode,
        severity,
        anonymous,
        imageUrl: imageUrl || PRESET_MOCK_IMAGES[0].url
      });

      if (res.success) {
        setTicketId(`SS-${res.issue.id}`);
        setStep(5);
        triggerConfettiEffect();
      }
    } catch (e) {
      showToast('error', 'Failed to submit report. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const triggerConfettiEffect = () => {
    // Generate simple custom CSS confetti particles
    const confettiContainer = document.getElementById('confetti-stage');
    if (!confettiContainer) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.position = 'absolute';
      particle.style.width = '10px';
      particle.style.height = '10px';
      particle.style.background = ['#FF6B00', '#06D6A0', '#FFD166', '#EF233C', '#3B82F6'][Math.floor(Math.random() * 5)];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
      particle.style.opacity = '0.8';
      particle.style.animation = 'confettiFall 3s infinite linear';
      confettiContainer.appendChild(particle);
    }
  };

  return (
    <div className="report-wizard" id="report-wizard-form" style={{ animation: 'slideUp 0.4s ease-out' }}>
      
      <div className="wizard-steps">
        <div className={`wizard-step ${step === 1 ? 'active' : ''}`}>{t('step_capture')}</div>
        <div className={`wizard-step ${step === 2 ? 'active' : ''}`}>{t('step_describe')}</div>
        <div className={`wizard-step ${step === 3 ? 'active' : ''}`}>{t('step_location')}</div>
        <div className={`wizard-step ${step === 4 ? 'active' : ''}`}>{t('step_authority')}</div>
        <div className={`wizard-step ${step === 5 ? 'active' : ''}`}>{t('step_submit')}</div>
      </div>

      <div 
        className="wizard-body"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
          padding: '24px',
          marginTop: '16px',
          position: 'relative'
        }}
      >
        
        {/* STEP 1: CAPTURE */}
        {step === 1 && (
          <div id="report-step-1" style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ marginBottom: '14px', textAlign: 'center' }}>{t('image_upload')}</h3>
            
            <div 
              className="file-upload-zone" 
              id="file-upload-zone-el"
              onClick={() => document.getElementById('report-file-picker')?.click()}
              style={{
                border: '2.5px dashed var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '50px 30px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(255,107,0,0.02) 0%, rgba(255,255,255,0.9) 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01), 0 4px 12px rgba(255,107,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Animated scanning glow effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                animation: 'scanLine 3s infinite linear'
              }} />
              
              <div style={{
                background: 'rgba(255, 107, 0, 0.08)',
                padding: '16px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.1)',
                marginBottom: '8px'
              }}>
                <Upload size={32} color="var(--primary)" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--secondary)' }}>
                {t('drag_drop')}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '320px', margin: 0 }}>
                Supports camera capture & file uploads up to 10MB.
              </p>
              <div style={{
                marginTop: '8px',
                background: 'var(--secondary)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <Sparkles size={12} color="var(--primary)" />
                AI Auto-Category & Anti-Fake Location Active
              </div>
              <input
                type="file"
                id="report-file-picker"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>

            {loadingAI && (
              <div className="ai-analyzer-loading">
                <Sparkles size={24} className="shimmer" color="var(--primary)" style={{ borderRadius: '50%', padding: '4px' }} />
                <div>
                  <strong>{t('ai_analyzing')}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Identifying coordinates, severity models, and complaint drafts...</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '30px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Or select a Hackathon Preset for rapid testing:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} id="preset-grid">
                {PRESET_MOCK_IMAGES.map(preset => (
                  <div
                    key={preset.id}
                    className="issue-card"
                    onClick={() => handlePresetSelect(preset)}
                    style={{ cursor: 'pointer', padding: '10px', fontSize: '0.8rem' }}
                    id={`preset-${preset.id}`}
                  >
                    <img src={preset.url} alt={preset.title} style={{ height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} referrerPolicy="no-referrer" />
                    <strong style={{ display: 'block' }}>{preset.title}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{preset.caption}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DESCRIBE */}
        {step === 2 && (
          <div id="report-step-2" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {/* Sparkles Tip block (CSS Selector 5) */}
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06) 0%, rgba(255, 137, 50, 0.02) 100%)', 
                padding: '14px 18px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(255, 107, 0, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.02)'
              }}>
                <Sparkles size={18} color="var(--primary)" />
                {/* Sparkles span (CSS Selector 4) */}
                <span style={{ 
                  fontSize: '0.88rem', 
                  fontWeight: 600, 
                  color: 'var(--primary-dark)',
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-sans)'
                }}>{t('ai_success')}</span>
              </div>

              {authenticity && (
                /* Authenticity Card itself (CSS Selector 3) */
                <div style={{
                  background: authenticity.status === 'VERIFIED' 
                    ? 'linear-gradient(135deg, rgba(6, 214, 160, 0.08) 0%, rgba(6, 214, 160, 0.02) 100%)' 
                    : 'linear-gradient(135deg, rgba(239, 35, 60, 0.08) 0%, rgba(239, 35, 60, 0.02) 100%)',
                  border: authenticity.status === 'VERIFIED' 
                    ? '1.5px solid rgba(6, 214, 160, 0.3)' 
                    : '1.5px solid rgba(239, 35, 60, 0.3)',
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  boxShadow: authenticity.status === 'VERIFIED'
                    ? '0 4px 15px rgba(6, 214, 160, 0.05)'
                    : '0 4px 15px rgba(239, 35, 60, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out'
                }}>
                  <div style={{
                    background: authenticity.status === 'VERIFIED' ? 'var(--accent)' : 'var(--danger)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    <CheckCircle size={16} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '0.92rem', 
                      fontWeight: 700, 
                      color: authenticity.status === 'VERIFIED' ? 'var(--accent)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      AI Guard Status: {authenticity.status}
                    </h4>
                    {/* Reason paragraph (CSS Selector 1) */}
                    <p style={{ 
                      margin: '6px 0 0 0', 
                      fontSize: '0.82rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: '1.5',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0,0,0,0.02)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: authenticity.status === 'VERIFIED' ? '3px solid var(--accent)' : '3px solid var(--danger)'
                    }}>
                      {authenticity.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="report-title-input">{t('issue_title')}</label>
              <input
                type="text"
                id="report-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="report-category-select">Category</label>
              <select
                id="report-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', fontSize: '1rem' }}
              >
                {['Infrastructure', 'Waste Management', 'Electricity', 'Corruption', 'Road Damage', 'Water Leak', 'Streetlight', 'Drainage', 'Encroachment', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="report-description">{t('issue_desc')}</label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                required
              />
            </div>

            <div className="form-group">
              <label>Severity Score: {severity}/5</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('severity_1')}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  style={{ flexGrow: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 700 }}>{t('severity_5')}</span>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                type="checkbox"
                id="anonymous-checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="anonymous-checkbox" style={{ margin: 0, fontWeight: 500, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {t('anonymous_report')}
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
              {authenticity && authenticity.status !== 'VERIFIED' && (
                <div style={{
                  background: 'rgba(239, 35, 60, 0.04)',
                  border: '1px solid rgba(239, 35, 60, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  <AlertCircle size={16} />
                  <span>Entry Blocked: This image has been flagged as suspicious or AI-generated. Only verified real-world public complaints are allowed to prevent fake entries.</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  onClick={handleNextStep2} 
                  id="btn-next-2"
                  disabled={authenticity ? authenticity.status !== 'VERIFIED' : false}
                  style={{
                    opacity: (authenticity && authenticity.status !== 'VERIFIED') ? 0.4 : 1,
                    cursor: (authenticity && authenticity.status !== 'VERIFIED') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {authenticity && authenticity.status !== 'VERIFIED' ? 'Blocked by AI Guard' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <div id="report-step-3" style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ marginBottom: '14px' }}>{t('step_location')}</h3>

            <button
              id="gps-detect-btn"
              type="button"
              className="btn-secondary"
              onClick={handleGPSDetect}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', marginBottom: '20px' }}
            >
              <MapPin size={18} color="var(--primary)" /> {t('detect_gps')}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="report-state">State</label>
                <input
                  type="text"
                  id="report-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-city">City</label>
                <input
                  type="text"
                  id="report-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="report-ward-input">Ward / Locality Name</label>
              <input
                type="text"
                id="report-ward-input"
                placeholder="e.g. Ward 14, Koramangala"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="report-landmark">Landmark (Optional)</label>
                <input
                  type="text"
                  id="report-landmark"
                  placeholder="e.g. near Metro Station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-pincode">Pincode</label>
                <input
                  type="text"
                  id="report-pincode"
                  placeholder="e.g. 560034"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={handleNextStep3} id="btn-next-3">Continue</button>
            </div>
          </div>
        )}

        {/* STEP 4: AUTHORITY TARGETING */}
        {step === 4 && (
          <div id="report-step-4" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ background: 'rgba(6, 214, 160, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 214, 160, 0.3)', marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle size={18} /> {t('authority_detected')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t('authority_will_notify')}
              </p>
              
              <div style={{ fontSize: '0.9rem', fontWeight: 600, background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '10px' }}>
                🏛️ {authorityName} ({authorityEmail})
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> {t('email_preview')}</label>
              <pre style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                {emailDraft}
              </pre>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Twitter size={18} color="#1da1f2" />
              <span style={{ fontSize: '0.85rem' }}>
                We will also tag their handle: <strong style={{ color: '#1da1f2' }}>{authorityTwitter}</strong> on citizen Twitter boards.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn-primary" onClick={handleSubmitReport} id="btn-submit-report">
                {t('submit_report')} (+50 pts)
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUBMIT SUCCESS */}
        {step === 5 && (
          <div className="success-screen" id="report-step-5">
            <div id="confetti-stage" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}></div>
            
            <div className="success-icon">
              <CheckCircle size={56} />
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--secondary)' }}>{t('report_success')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your issue has been logged on the real-time ward radar and routed to {authorityName} via the auto-escalator.
            </p>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', display: 'inline-block', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{t('ticket_id')}</span>
              <strong style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>{ticketId}</strong>
            </div>

            <div>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '12px 30px' }}
                onClick={() => {
                  setStep(1);
                  setImageUrl('');
                  setTitle('');
                  setDescription('');
                  // Redirect to Feed Tab
                  const tabBtn = document.getElementById('sidebar-item-Home') || document.getElementById('bottom-nav-Home');
                  tabBtn?.click();
                }}
              >
                Go to Feed Radar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
