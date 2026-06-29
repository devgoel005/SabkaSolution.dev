import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  LogOut, 
  FileText, 
  Settings, 
  Calendar, 
  Landmark, 
  MapPin, 
  CheckCircle, 
  Clock,
  HardDrive,
  CloudLightning,
  RefreshCw,
  ExternalLink,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { 
  connectGoogleDrive, 
  disconnectGoogleDrive, 
  uploadAuditLogFile, 
  listAuditBackups, 
  deleteBackupFile,
  getCachedAccessToken,
  getConnectedGoogleUser
} from '../lib/googleDrive';

export const MyProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, issues, showToast } = useApp();

  // Find issues reported by this active user
  const myReports = issues.filter(issue => user && issue.reporterPhone === user.phone);

  // Google Drive integration states
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveUser, setDriveUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);

  // Check connection state on load
  useEffect(() => {
    const token = getCachedAccessToken();
    const gUser = getConnectedGoogleUser();
    if (token && gUser) {
      setDriveConnected(true);
      setDriveUser(gUser);
      loadBackups();
    }
  }, []);

  const loadBackups = async () => {
    setIsRefreshing(true);
    try {
      const files = await listAuditBackups();
      setBackups(files);
    } catch (err) {
      console.error('Failed to list backups:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectDrive = async () => {
    setIsConnecting(true);
    try {
      const res = await connectGoogleDrive();
      setDriveConnected(true);
      setDriveUser(res.user);
      showToast('success', `Google Drive linked successfully! Connected as ${res.user.displayName || 'User'}`);
      
      // Load backups immediately after linking
      const files = await listAuditBackups();
      setBackups(files);
    } catch (err: any) {
      showToast('error', `Drive authorization failed: ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectDrive = async () => {
    const confirmed = window.confirm('Are you sure you want to unlink your Google Drive account? Your access token will be securely removed from active memory.');
    if (!confirmed) return;

    try {
      await disconnectGoogleDrive();
      setDriveConnected(false);
      setDriveUser(null);
      setBackups([]);
      showToast('success', 'Google Drive unlinked successfully.');
    } catch (err) {
      showToast('error', 'Unlinking failed. Please try again.');
    }
  };

  const handleCreateBackup = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(`Are you sure you want to export your civic reports as a detailed Ward Audit Log into your Google Drive?`);
    if (!confirmed) return;

    setIsBackingUp(true);
    try {
      const res = await uploadAuditLogFile(myReports, user.name);
      showToast('success', `Backup file successfully uploaded to Google Drive!`);
      // Reload the backup files list
      await loadBackups();
    } catch (err: any) {
      showToast('error', `Backup failed: ${err.message || err}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDeleteBackup = async (fileId: string, fileName: string) => {
    // MANDATORY confirmation dialog for data mutations/deletions as per skill constraints
    const confirmed = window.confirm(`Are you sure you want to permanently delete the backup file "${fileName}" from your Google Drive? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteBackupFile(fileId);
      showToast('success', `Backup file "${fileName}" deleted successfully from Google Drive.`);
      // Reload backups
      await loadBackups();
    } catch (err: any) {
      showToast('error', `Deletion failed: ${err.message || err}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatBytes = (bytes: string | number) => {
    if (!bytes) return 'Unknown size';
    const num = Number(bytes);
    if (isNaN(num)) return 'Unknown size';
    if (num < 1024) return `${num} B`;
    if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / 1048576).toFixed(1)} MB`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '800px', margin: '0 auto' }} id="my-profile-page">
      
      {/* Title */}
      <div className="top-navbar" style={{ marginBottom: '24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserIcon size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>{t('profile')}</h2>
        </div>

        <button
          onClick={logout}
          className="btn-secondary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', borderColor: 'rgba(239,35,60,0.15)' }}
          id="btn-logout"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* User badge details card */}
          <div className="profile-card" id="user-profile-identity-card">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>

            <div className="profile-info">
              <h2>{user.name}</h2>
              <p style={{ fontWeight: 600, color: 'var(--primary)' }}>
                {user.role === 'VOLUNTEER' ? '🤝 Hyperlocal Ward Volunteer' : '👤 Active Resident Whistleblower'}
              </p>

              <div className="profile-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Landmark size={16} color="var(--primary)" />
                  <span><strong>Municipality:</strong> {user.city}, {user.state}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span><strong>Division:</strong> {user.ward}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span><strong>Joined:</strong> June 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Google Drive Integration Card */}
          <div 
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}
            id="google-drive-integration-section"
          >
            {/* Ambient decorative top banner */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4285F4 0%, #34A853 33%, #FBBC05 66%, #EA4335 100%)'
            }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <HardDrive size={22} color="#4285F4" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--secondary)', fontWeight: 750 }}>
                Google Drive Synchronization Gateway
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Connect your Google account to back up verified civic issue reports, hyperlocal audit catalogs, and photo evidence directly to your personal Google Drive in a custom <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SabkaSolution_Civic_Audit</code> folder.
            </p>

            {!driveConnected ? (
              <div style={{ 
                background: '#F8FAFC', 
                border: '1px dashed #CBD5E1', 
                borderRadius: 'var(--radius-md)', 
                padding: '20px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Lock size={14} />
                  <span>OAuth Sandbox Certified & End-to-end Secure</span>
                </div>

                {/* Google styled Material login button */}
                <button 
                  onClick={handleConnectDrive}
                  disabled={isConnecting}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #DADCE0',
                    borderRadius: '24px',
                    color: '#3C4043',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    height: '42px',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.15)',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.15)';
                  }}
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isConnecting ? 'Authorizing Secure Sync...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Linked Success Block */}
                <div style={{
                  background: 'rgba(52, 168, 83, 0.05)',
                  border: '1px solid rgba(52, 168, 83, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: '#34A853',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(52,168,83,0.3)'
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 750, color: '#1B5E20' }}>
                        Connected to Google Cloud
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#388E3C', fontWeight: 600 }}>
                        Active user: {driveUser?.displayName || 'Sovereign Citizen'} ({driveUser?.email})
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleDisconnectDrive}
                    className="btn-secondary"
                    style={{
                      width: 'auto',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--danger)',
                      borderColor: 'rgba(239,35,60,0.15)',
                      background: 'white'
                    }}
                  >
                    Disconnect
                  </button>
                </div>

                {/* Operations Suite */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCreateBackup}
                    disabled={isBackingUp || myReports.length === 0}
                    className="btn-primary"
                    style={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '44px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      opacity: myReports.length === 0 ? 0.5 : 1,
                      cursor: (isBackingUp || myReports.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <RefreshCw size={16} className={isBackingUp ? 'animate-spin' : ''} />
                    <span>{isBackingUp ? 'Generating Ward Audit Document...' : 'Backup All Complaints to Drive'}</span>
                  </button>
                </div>

                {/* List of active Drive Backups */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderOpen size={14} color="#4285F4" />
                      <span>Google Drive Archives ({backups.length})</span>
                    </h4>

                    <button 
                      onClick={loadBackups}
                      disabled={isRefreshing}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 750,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isRefreshing && backups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Querying Drive folder...
                    </div>
                  ) : backups.length === 0 ? (
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px dashed #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      textAlign: 'center'
                    }}>
                      <AlertCircle size={24} color="#94A3B8" style={{ margin: '0 auto 6px auto' }} />
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: 650 }}>
                        No audit files found in <code style={{ background: '#E2E8F0', padding: '1px 4px', borderRadius: '3px' }}>SabkaSolution_Civic_Audit</code> yet. Click above to create your first secure backup.
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      maxHeight: '220px', 
                      overflowY: 'auto',
                      paddingRight: '4px'
                    }}>
                      {backups.map((file) => (
                        <div 
                          key={file.id}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ minWidth: 0, flexGrow: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 750, color: 'var(--secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {file.name}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '3px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              <span>Created: {new Date(file.createdTime || Date.now()).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Size: {formatBytes(file.size)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <a 
                              href={file.webViewLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#E3F2FD',
                                color: '#1E88E5',
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                transition: '0.2s'
                              }}
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={14} />
                            </a>

                            <button 
                              onClick={() => handleDeleteBackup(file.id, file.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#FFEBEE',
                                color: '#E53935',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: '0.2s'
                              }}
                              title="Delete Backup"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Personal status timeline log of issues */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--primary)" /> Hyperlocal Audit Log ({myReports.length} complaints)
            </h3>

            {myReports.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px 0', textDecoration: 'none' }}>
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <FileText size={36} color="var(--text-secondary)" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ marginBottom: '4px' }}>{t('no_issues')}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '300px', margin: '0 auto' }}>
                    You have not reported any civic issues yet. Click on "Report Issue" to file your first complaint.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="profile-issues-timeline">
                {myReports.map((issue) => (
                  <div
                    key={issue.id}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      boxShadow: 'var(--shadow)'
                    }}
                    id={`profile-issue-${issue.id}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className={`status-chip status-${issue.status}`}>{issue.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ticket Token: SS-{issue.id}</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '6px' }}>{issue.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      {issue.description}
                    </p>

                    {/* Timeline Tracker Dots */}
                    <div className="audit-timeline-progress" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '20px', padding: '0 10px' }}>
                      {/* Connection bar */}
                      <div style={{ position: 'absolute', top: '8px', left: '20px', right: '20px', height: '3px', background: '#E2E8F0', zIndex: 1 }}></div>
                      
                      {/* Highlighted active portion */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '20px',
                        width: issue.status === 'RESOLVED' ? '100%' : issue.status === 'IN_PROGRESS' ? '66%' : issue.status === 'VERIFIED' ? '33%' : '0%',
                        height: '3px',
                        background: 'var(--primary)',
                        zIndex: 2,
                        transition: 'width 0.4s ease'
                      }}></div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 5 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Reported</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 5 }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: ['VERIFIED', 'IN_PROGRESS', 'RESOLVED'].includes(issue.status) ? 'var(--primary)' : '#CBD5E1',
                          border: '3px solid white',
                          boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                        }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: ['VERIFIED', 'IN_PROGRESS', 'RESOLVED'].includes(issue.status) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Verified</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 5 }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: ['IN_PROGRESS', 'RESOLVED'].includes(issue.status) ? 'var(--primary)' : '#CBD5E1',
                          border: '3px solid white',
                          boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                        }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: ['IN_PROGRESS', 'RESOLVED'].includes(issue.status) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Dispatched</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 5 }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: issue.status === 'RESOLVED' ? 'var(--accent)' : '#CBD5E1',
                          border: '3px solid white',
                          boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                        }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: issue.status === 'RESOLVED' ? 'var(--accent)' : 'var(--text-secondary)' }}>Resolved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>
      )}

    </div>
  );
};
