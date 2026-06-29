import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Award, Zap, Flame, ShieldAlert, BarChart3, TrendingUp, Sparkles, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MOCK_MONTHLY_DATA = [
  { month: 'Jan', Resolved: 45, Pending: 20 },
  { month: 'Feb', Resolved: 58, Pending: 15 },
  { month: 'Mar', Resolved: 72, Pending: 25 },
  { month: 'Apr', Resolved: 85, Pending: 18 },
  { month: 'May', Resolved: 98, Pending: 12 },
  { month: 'Jun', Resolved: 124, Pending: 8 }
];

const MOCK_CATEGORY_DATA = [
  { name: 'Road Damage', value: 35, color: '#FF6B00' },
  { name: 'Waste Mgmt', value: 25, color: '#FFD166' },
  { name: 'Electricity', value: 15, color: '#3B82F6' },
  { name: 'Water Leak', value: 15, color: '#06D6A0' },
  { name: 'Corruption', value: 10, color: '#EF233C' }
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Ananya Deshmukh', points: 1420, ward: 'Ward 14', badge: '👑 Ward Captain' },
  { rank: 2, name: 'Vikram Singh', points: 1180, ward: 'Ward 14', badge: '🛡️ Local Sentinel' },
  { rank: 3, name: 'Karthik Rao', points: 950, ward: 'Ward 14', badge: '⚡ Civic Spark' }
];

const COUPONS = [
  {
    id: 'c1',
    title: '15% Off Organic Groceries',
    description: 'Get 15% discount on whole foods and fresh veggies at Mother Earth Stores.',
    partner: 'Mother Earth Organics',
    pointsCost: 300,
    code: 'SABKAEARTH15',
    expiry: '31 Aug 2026',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'c2',
    title: 'Free Ride on Metro E-Scooter',
    description: 'Redeem for a 20-minute free ride on Yulu Electric scooters near metro stations.',
    partner: 'Yulu Mobility',
    pointsCost: 200,
    code: 'CIVICYULU20',
    expiry: '15 Oct 2026',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'c3',
    title: '₹100 Cashback on Tata Power',
    description: 'Deduct ₹100 from your residential electricity bill for active community participation.',
    partner: 'Tata Power',
    pointsCost: 500,
    code: 'TATASABKA100',
    expiry: '30 Dec 2026',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=200'
  }
];

export const ImpactDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, redeemCoupon, showToast } = useApp();

  const [redeemedCodes, setRedeemedCodes] = React.useState<Record<string, string>>({});
  const [redeemingId, setRedeemingId] = React.useState<string | null>(null);

  const handleRedeem = async (couponId: string, cost: number, code: string) => {
    if (!user) {
      showToast('error', 'Please login to redeem partner rewards.');
      return;
    }
    if (user.points < cost) {
      showToast('error', 'Insufficient Reputation Points! Verify more local reports to earn points.');
      return;
    }

    setRedeemingId(couponId);
    try {
      const success = await redeemCoupon(couponId);
      if (success) {
        setRedeemedCodes(prev => ({ ...prev, [couponId]: code }));
      }
    } catch (e) {
      showToast('error', 'Redemption failure');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }} id="impact-dashboard-page">
      
      {/* Title */}
      <div className="top-navbar" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>{t('tab_dashboard')}</h2>
        </div>
      </div>

      <div className="bento-grid" id="impact-bento-grid">
        
        {/* Personal Score Stats card */}
        <div className="bento-item" style={{ background: 'linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary) 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--primary)" /> Citizen Impact Score
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{t('reputation')}</span>
              <span style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>
                {user?.points || 100} pts
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Daily Swipe Streak</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warn)' }}>
                <Flame size={18} fill="var(--warn)" color="var(--warn)" /> {user?.streak || 1} days
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '10px', lineHeight: 1.5 }}>
              Your reputation score places you in the <strong>Top 10%</strong> of active citizens in your ward division!
            </div>
          </div>
        </div>

        {/* Recharts Resolved Chart */}
        <div className="bento-item bento-item-span-2">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent)" /> {t('monthly_resolved_chart')}
          </h3>
          
          <div style={{ width: '100%', height: '180px' }} id="resolved-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,107,0,0.03)' }} />
                <Bar dataKey="Resolved" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Recharts Pie Chart */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--secondary)' }}>Category Breakdown</h3>
          <div style={{ width: '100%', height: '150px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Absolute Badge */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Primary Hazard</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--primary-dark)' }}>Road PWD</strong>
            </div>
          </div>

          {/* Mini Legend list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', marginTop: '12px' }}>
            {MOCK_CATEGORY_DATA.slice(0, 4).map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }}></span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard panel */}
        <div className="bento-item bento-item-span-2">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 {t('leaderboard')} — {user?.ward || 'Ward 14'}
          </h3>

          <div className="leaderboard-list" id="ward-leaderboard-list">
            {MOCK_LEADERBOARD.map((item, index) => (
              <div key={item.rank} className={`leaderboard-item rank-${item.rank}`}>
                <div className="leaderboard-user">
                  <span className="rank-badge">#{item.rank}</span>
                  <div>
                    <strong style={{ fontSize: '0.92rem' }}>{item.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.badge}</div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{item.points} pts</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Resident</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Partners Coupons Stores section */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" /> {t('partners')}
        </h3>

        <div className="coupon-grid" id="partner-rewards-coupon-grid">
          {COUPONS.map((coupon) => {
            const codeClaimed = redeemedCodes[coupon.id];
            
            return (
              <div key={coupon.id} className="coupon-card" id={`coupon-card-${coupon.id}`}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img
                    src={coupon.imageUrl}
                    alt={coupon.partner}
                    style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{coupon.partner}</span>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary)', margin: '2px 0' }}>{coupon.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{coupon.description}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cost: <strong>{coupon.pointsCost} pts</strong></span>
                  
                  {codeClaimed ? (
                    <div style={{ background: 'rgba(6,214,160,0.1)', color: '#05a87d', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      ✓ {codeClaimed}
                    </div>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleRedeem(coupon.id, coupon.pointsCost, coupon.code)}
                      disabled={redeemingId === coupon.id || (user && user.points < coupon.pointsCost)}
                      style={{ width: 'auto', padding: '6px 14px', fontSize: '0.78rem' }}
                      id={`redeem-btn-${coupon.id}`}
                    >
                      {redeemingId === coupon.id ? 'Redeeming...' : t('redeem', { points: coupon.pointsCost })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
