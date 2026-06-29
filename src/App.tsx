import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from './context/AppContext';

// Import sub-components
import { LanguageSelect } from './components/LanguageSelect';
import { Login } from './components/Login';
import { ProfileSetup } from './components/ProfileSetup';
import { HomeFeed } from './components/HomeFeed';
import { MapView } from './components/MapView';
import { ReportIssue } from './components/ReportIssue';
import { VerifySwipe } from './components/VerifySwipe';
import { CommunityCampaigns } from './components/CommunityCampaigns';
import { ImpactDashboard } from './components/ImpactDashboard';
import { MyProfile } from './components/MyProfile';

// Import Antigravity interactive canvas and AI Copilot
import { AntigravityCanvas } from './components/AntigravityCanvas';
import { AICopilot } from './components/AICopilot';
import { SevakChatbot } from './components/SevakChatbot';

// Icons
import {
  Flame,
  Map,
  PlusCircle,
  ShieldCheck,
  Megaphone,
  BarChart3,
  User,
  Bell,
  Globe,
  Loader2,
  Bot,
  Menu,
  X,
  Shield
} from 'lucide-react';

type Tab = 'Home' | 'Map' | 'Report' | 'Verify' | 'Community' | 'Dashboard' | 'Profile';

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, setLanguage, toasts, removeToast } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [step, setStep] = useState<'LANG' | 'LOGIN' | 'SETUP' | 'APP'>('LANG');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  
  // High-contrast, remix-inspired tab touch popup states
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warn'>('info');

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    
    // Customized feedback message for tabs satisfying: "make some Popup when i touch some tab"
    const messages: Record<Tab, { text: string; type: 'info' | 'success' | 'warn' }> = {
      Home: { text: '🇮🇳 Syncing Sovereign Grievance Live Feed...', type: 'success' },
      Map: { text: '🛰️ Calibrating Real-time Satellite Geo-Coordinates...', type: 'info' },
      Report: { text: '🔒 Opening Whistleblower Anonymous Encryption Vault...', type: 'warn' },
      Verify: { text: '🛡️ Initializing Ward Consensus Audit Ledger...', type: 'success' },
      Community: { text: '✊ Launching Public Mobilization Petitions...', type: 'success' },
      Dashboard: { text: '📊 Compiling Real-time Municipal Redressal Metrics...', type: 'info' },
      Profile: { text: '👤 Securing Indian Citizen Identity Credentials...', type: 'info' },
    };

    const current = messages[tab];
    setFeedbackText(current.text);
    setFeedbackType(current.type);
    setShowFeedback(true);

    // Auto-dismiss after 1500ms
    const timer = setTimeout(() => {
      setShowFeedback(false);
    }, 1500);
  };

  // Read initial layout progression state from localStorage / Context
  useEffect(() => {
    const savedLang = localStorage.getItem('sabka_solution_lang');
    if (!savedLang) {
      setStep('LANG');
    } else if (!user) {
      setStep('LOGIN');
    } else if (user && !user.name) {
      setStep('SETUP');
    } else {
      setStep('APP');
    }
  }, [user]);

  const handleLanguageNext = () => {
    setStep('LOGIN');
  };

  const handleLoginSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      setStep('SETUP');
    } else {
      setStep('APP');
    }
  };

  const handleSetupComplete = () => {
    setStep('APP');
  };

  const changeLanguageDirect = (lang: string) => {
    setLanguage(lang);
  };

  // Render current tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeFeed />;
      case 'Map':
        return <MapView />;
      case 'Report':
        return <ReportIssue />;
      case 'Verify':
        return <VerifySwipe />;
      case 'Community':
        return <CommunityCampaigns />;
      case 'Dashboard':
        return <ImpactDashboard />;
      case 'Profile':
        return <MyProfile />;
      default:
        return <HomeFeed />;
    }
  };

  // Helper for active navigation item classes
  const getNavClass = (tab: Tab) => {
    return `sidebar-item ${activeTab === tab ? 'active' : ''}`;
  };

  const getBottomNavClass = (tab: Tab) => {
    return `bottom-nav-item ${activeTab === tab ? 'active' : ''}`;
  };

  const getTabIcon = (tab: Tab, size: number = 24) => {
    switch (tab) {
      case 'Home': return <Flame size={size} />;
      case 'Map': return <Map size={size} />;
      case 'Report': return <PlusCircle size={size} />;
      case 'Verify': return <ShieldCheck size={size} />;
      case 'Community': return <Megaphone size={size} />;
      case 'Dashboard': return <BarChart3 size={size} />;
      case 'Profile': return <User size={size} />;
    }
  };

  if (step === 'LANG') {
    return (
      <>
        <AntigravityCanvas />
        <LanguageSelect onNext={handleLanguageNext} />
      </>
    );
  }

  if (step === 'LOGIN') {
    return (
      <>
        <AntigravityCanvas />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  if (step === 'SETUP') {
    return (
      <>
        <AntigravityCanvas />
        <ProfileSetup onSetupComplete={handleSetupComplete} />
      </>
    );
  }

  return (
    <div className="app-container" id="main-root-application" style={{ position: 'relative' }}>
      
      {/* Sovereign Patriotic Tricolor Ribbon */}
      <div className="national-tricolor-ribbon" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'linear-gradient(90deg, #FF6B00 0%, #FF6B00 33%, #FFFFFF 33%, #FFFFFF 66%, #059669 66%, #059669 100%)',
        zIndex: 1001,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
      }}></div>

      {/* Background Interactive Antigravity Canvas Layer */}
      <AntigravityCanvas />

      {/* Floating Sparkly AI Copilot Assistant */}
      <AICopilot />

      {/* Floating Sevak Citizens Helpline Chatbot */}
      <SevakChatbot />

      {/* Tab switch popups satisfying: "make some Popup when i touch some tab" */}
      {showFeedback && (
        <div className="tab-feedback-popup" style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: 'slideDownSpring 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '12px 24px',
            borderRadius: '40px',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: feedbackType === 'success' ? '#10B981' : feedbackType === 'warn' ? '#F59E0B' : '#FF6B00',
              boxShadow: `0 0 10px ${feedbackType === 'success' ? '#10B981' : feedbackType === 'warn' ? '#F59E0B' : '#FF6B00'}`
            }}></span>
            <span>{feedbackText}</span>
          </div>
        </div>
      )}
      
      {/* Toast Manager Rendering */}
      <div className="toast-container" id="global-toasts">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {toast.type === 'success' ? '✓ Success' : toast.type === 'error' ? '⚠ Error' : 'ℹ Info'}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '2px', opacity: 0.9 }}>{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          id="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 1005,
            transition: 'all 0.2s ease'
          }}
          className=""
        />
      )}

      {/* Main Left Sidebar (Visible on Desktop) */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="main-desktop-sidebar" style={{ 
        paddingTop: '36px',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '2px 0 20px rgba(15, 23, 42, 0.02)'
      }}>
        
        {/* National Emblem & Satyamev Jayate Trust Seal Banner */}
        <div className="national-seal-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#F8FAFC',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          borderLeft: '4px solid #FF9933',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px'
        }}>
          {/* Detailed Google-style vector Indian Flag */}
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
            <rect width="24" height="5.33" fill="#FF9933" />
            <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
            <rect y="10.66" width="24" height="5.33" fill="#128807" />
            <circle cx="12" cy="8" r="1.8" stroke="#000080" strokeWidth="0.4" />
            <circle cx="12" cy="8" r="0.4" fill="#000080" />
            <path d="M12 6.2v3.6M10.2 8h3.6M10.7 6.7l2.6 2.6M10.7 9.3l2.6-2.6" stroke="#000080" strokeWidth="0.25" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.5px' }}>सत्यमेव जयते</span>
            <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Govt of India Protocol</span>
          </div>
        </div>

        <div className="sidebar-brand" style={{ marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', fontSize: '1.45rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              SabkaSolution
            </h1>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Apni Awaaz • Apna Haq
            </span>
          </div>
        </div>

        {user && (
          <div className="sidebar-profile-footer" id="sidebar-user-card" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#F8FAFC', 
            border: '1px solid rgba(15, 23, 42, 0.05)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flexGrow: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>{user.ward}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(['Home', 'Map', 'Report', 'Verify', 'Community', 'Dashboard', 'Profile'] as Tab[]).map((tab) => (
            <button
              key={tab}
              id={`sidebar-item-${tab}`}
              className={getNavClass(tab)}
              onClick={() => handleTabClick(tab)}
              style={{ transition: 'var(--transition)' }}
            >
              {getTabIcon(tab)}
              <span>{t(`tab_${tab.toLowerCase()}` as any)}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Right Column Layout */}
      <div className="main-viewport-container" style={{ paddingTop: '20px' }}>
        
        {/* Universal Top Header */}
        <header className="top-navbar" id="universal-app-header" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 4px 30px rgba(15, 23, 42, 0.02)',
          position: 'relative',
          borderTop: '3px solid #FF9933' /* Sleek saffron top border represent Google-style flag ribbon */
        }}>
          {/* Subtle green bottom border accent to complete the tricolor layout gracefully */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'rgba(18, 136, 7, 0.08)'
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Menu Toggle Button for collapsible left sidebar on smaller screens */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: '#F1F5F9',
                border: '1.5px solid rgba(15, 23, 42, 0.08)',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--secondary)',
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-slate-200 active:scale-95"
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Detailed Google-style vector Indian Flag for top navbar */}
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
              <rect width="24" height="5.33" fill="#FF9933" />
              <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
              <rect y="10.66" width="24" height="5.33" fill="#128807" />
              <circle cx="12" cy="8" r="1.8" stroke="#000080" strokeWidth="0.4" />
              <circle cx="12" cy="8" r="0.4" fill="#000080" />
              <path d="M12 6.2v3.6M10.2 8h3.6M10.7 6.7l2.6 2.6M10.7 9.3l2.6-2.6" stroke="#000080" strokeWidth="0.25" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="mobile-brand-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                SabkaSolution
              </h2>
              <span className="mobile-brand-subtitle" style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apni Awaaz • Apna Haq</span>
            </div>

            {/* National Trust Seal Header */}
            <div className="header-national-seal" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              borderLeft: '1px solid rgba(15, 23, 42, 0.1)',
              paddingLeft: '12px',
              marginLeft: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.5px' }}>सत्यमेव जयते</span>
                <span style={{ fontSize: '0.55rem', background: 'linear-gradient(90deg, #FF6B00 0%, #059669 100%)', color: 'white', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>GOI</span>
              </div>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>National Grievance Protocol</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Hyperlocal Notification Bell Tray */}
            <div style={{ position: 'relative' }}>
              <button
                id="notification-bell-btn"
                className="header-icon-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{ position: 'relative', background: '#F1F5F9', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(15,23,42,0.04)' }}
              >
                <Bell size={18} color="var(--secondary)" />
                <span className="bell-badge-pulse" style={{ background: 'var(--primary)', top: '10px', right: '10px' }}></span>
              </button>

              {notificationsOpen && (
                <div className="notifications-dropdown" id="notif-dropdown" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Ward Alerts</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800 }}>2 active</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="notif-dropdown-item font-sans">
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>🚨 Pothole Dispatch Alert</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        MCD has dispatched an engineering team to inspect Road Damage at Sector 14.
                      </div>
                    </div>
                    <div className="notif-dropdown-item font-sans">
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)' }}>🏆 Streak Multiplier</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Your Swipe Streak is active! Keep verifying reports near you to unlock local rewards.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger Button inside Header Actions */}
            <button
              id="header-profile-btn"
              className={`header-icon-btn ${activeTab === 'Profile' ? 'active' : ''}`}
              onClick={() => handleTabClick('Profile')}
              style={{
                position: 'relative',
                background: activeTab === 'Profile' ? '#FFEBE0' : '#F1F5F9',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: activeTab === 'Profile' ? '1.5px solid #FF8A00' : '1px solid rgba(15,23,42,0.04)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              title="Go to Profile"
            >
              <User size={18} color={activeTab === 'Profile' ? '#FF8A00' : 'var(--secondary)'} />
            </button>
          </div>
        </header>

        {/* Dynamic viewport stage */}
        <main className="main-content" id="active-tab-viewport">
          {renderTabContent()}
        </main>

        {/* Global Footer with Privacy Policy & Copyright */}
        <footer className="site-footer" style={{
          padding: '24px 20px',
          background: '#FFFFFF',
          borderTop: '1px solid rgba(15, 23, 42, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          textAlign: 'center',
          width: '100%',
          marginTop: 'auto',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              margin: 0,
              fontWeight: 500
            }}>
              {t('copyright_text')}
            </p>
            <button
              onClick={() => setPrivacyOpen(true)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'rgba(255, 107, 0, 0.05)',
                border: '1px solid rgba(255, 107, 0, 0.15)',
                borderRadius: '20px',
                padding: '4px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              className="hover:bg-amber-50 active:scale-95"
            >
              <Shield size={12} />
              {t('privacy_policy')}
            </button>
          </div>
        </footer>
      </div>

      {/* Bottom Nav Bar (Mobile Touch devices) */}
      <nav className="bottom-nav" id="main-mobile-bottom-nav">
        {(['Home', 'Map', 'Report', 'Verify', 'Community'] as Tab[]).map((tab) => (
          <button
            key={tab}
            id={`bottom-nav-${tab}`}
            className={getBottomNavClass(tab)}
            onClick={() => handleTabClick(tab)}
          >
            {getTabIcon(tab, 18)}
            <span>{t(`tab_${tab.toLowerCase()}` as any)}</span>
          </button>
        ))}
      </nav>

      {/* Privacy Policy Dialog Modal */}
      {privacyOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          boxSizing: 'border-box'
        }} onClick={() => setPrivacyOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(255, 107, 0, 0.05)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(18, 136, 7, 0.03) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>
                  {t('privacy_policy')} - SabkaSolution
                </h3>
              </div>
              <button 
                onClick={() => setPrivacyOpen(false)}
                style={{
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--secondary)',
                  transition: 'background 0.2s'
                }}
                className="hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', fontSize: '0.88rem', color: 'var(--secondary)', lineHeight: '1.6', overflowY: 'auto' }}>
              <div style={{
                background: 'linear-gradient(90deg, #FF6B00 0%, #059669 100%)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textAlign: 'center'
              }}>
                🛡️ CITIZEN DATA TRUST & INTEGRITY PACT
              </div>

              <p style={{ marginBottom: '16px' }}>
                At <strong>SabkaSolution</strong>, we operate as a secure citizen governance utility under strict digital protocols. We are dedicated to maintaining the absolute confidentiality, security, and integrity of all user activity, grievance filing, and Ward communications.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #FF6B00' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>1. Identity Shielding</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                    Your personal contact number, full name, and sensitive credentials are never publicly exposed or shared with third-party tracking services. State and Municipal bodies only receive clean anonymous grievance telemetry.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>2. Verified Location Telemetry</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                    Hyperlocal radar and location coordinates are utilized solely to map municipal issues, prevent duplicate reports, and trigger ward-level dispatch alerts. No background persistent tracking is ever conducted.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>3. Integrity & Swipe Records</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                    User verifications, petition signatures, and swipe validations are logged on our distributed integrity audit trail to prevent bot manipulation, ensuring genuine civic action rewards (+Civic Points).
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #8B5CF6' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>4. National Grievance Standard Compliance</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                    SabkaSolution is engineered to support the Indian National Grievance Redressal Protocol guidelines, keeping citizen welfare, trust, and transparent ward governance at our absolute core.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(15, 23, 42, 0.06)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#F8FAFC',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px'
            }}>
              <button
                onClick={() => setPrivacyOpen(false)}
                style={{
                  background: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                className="hover:opacity-90 active:scale-95"
              >
                Close / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
