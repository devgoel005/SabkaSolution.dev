import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { UserCheck, Award } from 'lucide-react';

interface ProfileSetupProps {
  onSetupComplete: () => void;
}

import { INDIAN_STATES, STATE_CITIES } from '../data/districts';

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSetupComplete }) => {
  const { t } = useTranslation();
  const { registerProfile, showToast } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'VOLUNTEER'>('CITIZEN');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('New Delhi');
  const [ward, setWard] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const cities = STATE_CITIES[selectedState] || [];
    setCity(cities[0] || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Please enter your full name.');
      return;
    }
    if (!ward.trim()) {
      showToast('error', 'Please enter your municipal Ward or locality.');
      return;
    }

    setSaving(true);
    try {
      const activeUserPhone = localStorage.getItem('sabka_solution_active_phone') || '+91 9999999999';
      const success = await registerProfile({
        phone: activeUserPhone,
        name,
        role,
        state,
        city,
        ward,
        points: 100 // starting points
      });
      if (success) {
        onSetupComplete();
      }
    } catch (err) {
      showToast('error', 'Profile creation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-page" id="profile-setup-screen">
      <div className="india-watermark">
        <svg viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <path d="M120,40 L160,20 L180,40 L210,30 L220,60 L240,65 L250,90 L260,110 L310,130 L320,160 L340,170 L300,180 L290,210 L280,240 L240,250 L230,270 L210,290 L190,320 L180,360 L160,400 L140,430 L135,440 L120,410 L125,370 L110,340 L85,320 L75,280 L70,240 L80,210 L60,190 L50,160 L60,130 L80,110 L100,100 L110,70 L120,40 Z" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeDasharray="5 5" />
        </svg>
      </div>

      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header" style={{ marginBottom: '24px' }}>
          <div className="logo-container" style={{ background: 'linear-gradient(135deg, var(--accent), #05a87d)' }}>
            <UserCheck size={36} />
          </div>
          <h2>{t('setup_profile')}</h2>
          <p style={{ fontSize: '0.85rem' }}>Help us connect you to your hyperlocal ward authorities</p>
        </div>

        <form onSubmit={handleSubmit} id="profile-setup-form">
          <div className="form-group">
            <label htmlFor="setup-name">{t('full_name')}</label>
            <input
              type="text"
              id="setup-name"
              placeholder="e.g. Amit Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--surface)'
              }}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('role')}</label>
            <div className="role-options">
              <div
                id="role-citizen-btn"
                className={`role-card ${role === 'CITIZEN' ? 'active' : ''}`}
                onClick={() => setRole('CITIZEN')}
              >
                <h4>👤 {t('citizen')}</h4>
                <p>{t('citizen_desc')}</p>
              </div>
              <div
                id="role-volunteer-btn"
                className={`role-card ${role === 'VOLUNTEER' ? 'active' : ''}`}
                onClick={() => setRole('VOLUNTEER')}
              >
                <h4>🤝 {t('volunteer')}</h4>
                <p>{t('volunteer_desc')}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="setup-state">{t('state')}</label>
              <select
                id="setup-state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="setup-city">{t('city')}</label>
              <select
                id="setup-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              >
                {(STATE_CITIES[state] || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="setup-ward">{t('ward')}</label>
            <input
              type="text"
              id="setup-ward"
              placeholder="e.g. Ward No. 45, Koramangala"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--surface)'
              }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving} id="btn-submit-profile">
            {saving ? 'Saving Profile...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Award size={18} /> {t('save_profile')} (+100 pts Starter Gift)
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
