import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Issue } from '../types';
import { Megaphone, MessageSquare, Users, PenTool, Share2, TrendingUp, AlertTriangle } from 'lucide-react';

export const CommunityCampaigns: React.FC = () => {
  const { t } = useTranslation();
  const { issues, campaignGroups, joinCampaignGroup, signCampaign, user, showToast } = useApp();

  // Find all issues that have an active campaign
  const activeCampaigns = issues.filter((issue) => issue.campaign);

  const handleJoinGroup = (groupId: string) => {
    if (!user) {
      showToast('error', 'Login is required to join citizen advocacy groups.');
      return;
    }
    joinCampaignGroup(groupId);
  };

  const handleShareGroupWhatsApp = (groupName: string) => {
    const text = `📢 *Join Citizens Campaign Group on SabkaSolution* 📢\n\nI have joined the *${groupName}* coalition. We are mobilizing citizens to coordinate formal municipal audits and resolve public hazards.\n\n👉 Join our ward group here: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    showToast('success', 'WhatsApp group invite deep-link shared!');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }} id="community-campaigns-screen">
      
      {/* Page Header */}
      <div className="top-navbar" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Megaphone size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>{t('campaign_title')}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Petitions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent)" /> Trending Civic Petitions
          </h3>

          {activeCampaigns.length === 0 ? (
            <div style={{ padding: '40px 20px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <PenTool size={36} color="var(--text-secondary)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ marginBottom: '4px' }}>No active campaigns in your area</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '350px', margin: '0 auto' }}>
                Go to verified feed issues and click "Start Campaign" to draft a petition letter using the AI Campaign Agent!
              </p>
            </div>
          ) : (
            activeCampaigns.map((issue) => {
              const camp = issue.campaign!;
              const progressPercentage = Math.min(100, (camp.signaturesCount / 100) * 100);
              const alreadySigned = user && camp.signedBy?.includes(user.phone);

              return (
                <div key={issue.id} className="campaign-card" id={`campaign-${issue.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <span className="status-chip status-VERIFIED" style={{ fontSize: '0.65rem', marginBottom: '6px', display: 'inline-block' }}>
                        {issue.category}
                      </span>
                      <h3>{camp.campaignName}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Petition directed to: <strong>{issue.authorityName || 'Municipal Authority'}</strong>
                      </p>
                    </div>

                    <span style={{ fontSize: '0.75rem', background: 'rgba(255, 107, 0, 0.1)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                      {camp.hashtag}
                    </span>
                  </div>

                  <pre style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', maxHeight: '110px', overflowY: 'auto', whiteSpace: 'pre-wrap', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
                    {camp.petitionBody}
                  </pre>

                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                      📝 {camp.signaturesCount} Citizens Signed (Goal: 100)
                    </span>

                    {alreadySigned ? (
                      <button className="btn-secondary" disabled style={{ padding: '6px 14px', background: '#E2E8F0', borderColor: '#E2E8F0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        ✓ Petition Signed
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => signCampaign(issue.id)}
                        style={{ width: 'auto', padding: '6px 14px', fontSize: '0.82rem' }}
                        id={`sign-petition-btn-${issue.id}`}
                      >
                        Sign Petition
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Neighborhood Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--primary)" /> Ward Groups
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="ward-groups-list">
            {campaignGroups.map((group) => {
              const joined = user && group.members?.includes(user.phone);
              return (
                <div
                  key={group.id}
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: 'var(--shadow)'
                  }}
                  id={`group-card-${group.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>📍 {group.city}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{group.category}</span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>{group.name}</h4>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>👥 {group.memberCount} active members</span>
                    <span>📑 {group.issuesCount} reports</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {joined ? (
                      <button
                        className="btn-secondary"
                        style={{ flexGrow: 1, padding: '6px', fontSize: '0.78rem', color: '#05a87d', borderColor: '#d1fae5', background: '#f0fdf4' }}
                        disabled
                      >
                        ✓ Joined Ward Group
                      </button>
                    ) : (
                      <button
                        className="btn-secondary"
                        onClick={() => handleJoinGroup(group.id)}
                        style={{ flexGrow: 1, padding: '6px', fontSize: '0.78rem' }}
                        id={`join-group-${group.id}`}
                      >
                        Join Group
                      </button>
                    )}

                    <button
                      className="btn-secondary"
                      onClick={() => handleShareGroupWhatsApp(group.name)}
                      style={{ padding: '6px 10px' }}
                      title="Share Group on WhatsApp"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
