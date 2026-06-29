import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  Sparkles, 
  Smartphone, 
  X, 
  CheckCircle, 
  UserCheck, 
  Building2, 
  ChevronRight, 
  QrCode, 
  AlertCircle,
  ShieldAlert,
  User,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (isNewUser: boolean) => void;
}

import { INDIAN_STATES, STATE_CITIES } from '../data/districts';

const STATE_LOCALIZATION: Record<string, Record<string, string>> = {
  en: {
    'Andhra Pradesh': 'Andhra Pradesh',
    'Bihar': 'Bihar',
    'Delhi': 'Delhi',
    'Gujarat': 'Gujarat',
    'Haryana': 'Haryana',
    'Karnataka': 'Karnataka',
    'Kerala': 'Kerala',
    'Madhya Pradesh': 'Madhya Pradesh',
    'Maharashtra': 'Maharashtra',
    'Odisha': 'Odisha',
    'Punjab': 'Punjab',
    'Rajasthan': 'Rajasthan',
    'Tamil Nadu': 'Tamil Nadu',
    'Telangana': 'Telangana',
    'Uttar Pradesh': 'Uttar Pradesh',
    'West Bengal': 'West Bengal'
  },
  hi: {
    'Andhra Pradesh': 'आंध्र प्रदेश',
    'Bihar': 'बिहार',
    'Delhi': 'दिल्ली',
    'Gujarat': 'गुजरात',
    'Haryana': 'हरियाणा',
    'Karnataka': 'कर्नाटक',
    'Kerala': 'केरल',
    'Madhya Pradesh': 'मध्य प्रदेश',
    'Maharashtra': 'महाराष्ट्र',
    'Odisha': 'ओडिशा',
    'Punjab': 'पंजाब',
    'Rajasthan': 'राजस्थान',
    'Tamil Nadu': 'तमिलनाडु',
    'Telangana': 'तेलंगाना',
    'Uttar Pradesh': 'उत्तर प्रदेश',
    'West Bengal': 'पश्चिम बंगाल'
  }
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const { sendOTP, verifyOTP, showToast, registerProfile } = useApp();
  
  // Mandatory Login Fields
  const [name, setName] = useState('');
  const [selectedState, setSelectedState] = useState('Delhi');
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [ward, setWard] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'VOLUNTEER'>('CITIZEN');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Security CAPTCHA Challenge states
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Incoming Simulated SMS notification state
  const [smsNotification, setSmsNotification] = useState<{ phone: string; otp: string } | null>(null);

  // Biometric login states
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('');
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricResultState, setBiometricResultState] = useState<'idle' | 'scanning' | 'success' | 'failure'>('idle');

  // DigiLocker simulation states
  const [showDigiLocker, setShowDigiLocker] = useState(false);
  const [digiLockerStep, setDigiLockerStep] = useState<'AADHAAR' | 'OTP' | 'SUCCESS'>('AADHAAR');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [digiLockerOtp, setDigiLockerOtp] = useState('');
  const [digiLockerVerifying, setDigiLockerVerifying] = useState(false);
  const [generatedAadhaarOtp, setGeneratedAadhaarOtp] = useState('');
  const [digiLockerLinked, setDigiLockerLinked] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate a random math captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 20) + 10;
    const n2 = Math.floor(Math.random() * 15) + 5;
    setNum1(n1);
    setNum2(n2);
    setCaptchaInput('');
    setCaptchaSolved(false);
  };

  // Check if biometric login is already enrolled
  useEffect(() => {
    generateCaptcha();

    const isEnrolled = localStorage.getItem('biometric_auth_enabled') === 'true';
    setBiometricEnrolled(isEnrolled);

    const userStr = localStorage.getItem('sabka_solution_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.badges?.some((b: string) => b.includes('DigiLocker'))) {
          setDigiLockerLinked(true);
        }
      } catch (e) {}
    }
  }, []);

  // Monitor OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Listen to custom simulated SMS dispatch event
  useEffect(() => {
    const handleSms = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSmsNotification({
          phone: customEvent.detail.phone,
          otp: customEvent.detail.otp
        });
        
        // Auto-dismiss SMS slide-down after 8 seconds
        setTimeout(() => {
          setSmsNotification(null);
        }, 8000);
      }
    };

    window.addEventListener('simulated_sms_received', handleSms);
    return () => {
      window.removeEventListener('simulated_sms_received', handleSms);
    };
  }, []);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const cities = STATE_CITIES[stateName] || [];
    setSelectedCity(cities[0] || '');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Fields Validation
    if (!name.trim()) {
      showToast('error', 'Full Name is mandatory before login.');
      return;
    }
    if (!selectedState) {
      showToast('error', 'State selection is mandatory before login.');
      return;
    }
    if (!selectedCity) {
      showToast('error', 'City selection is mandatory before login.');
      return;
    }
    if (!ward.trim()) {
      showToast('error', 'Municipal Ward/Locality is mandatory before login.');
      return;
    }
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      showToast('error', 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    // 2. Security CAPTCHA Check Validation
    const expected = num1 + num2;
    if (parseInt(captchaInput) !== expected) {
      showToast('error', '❌ Security CAPTCHA failed! Please solve the citizen integrity check to proceed.');
      generateCaptcha();
      return;
    }

    setSending(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+91 ${cleanPhone}`;
      const success = await sendOTP(formattedPhone);
      if (success) {
        setStep('OTP');
        setCountdown(30);
        showToast('success', '🔐 Security Check Passed! OTP successfully dispatched.');
      }
    } catch (err) {
      showToast('error', 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOTPChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('error', 'Please enter the complete 6-digit verification code.');
      return;
    }
    setVerifying(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+91 ${cleanPhone}`;
      const res = await verifyOTP(formattedPhone, otpCode);
      if (res.success) {
        // Register the complete profile immediately using mandatory details!
        await registerProfile({
          phone: formattedPhone,
          name,
          role,
          state: selectedState,
          city: selectedCity,
          ward,
          points: 100
        });

        // Offer biometric enrollment on first login if not yet enrolled
        if (!biometricEnrolled) {
          localStorage.setItem('temp_enrolling_phone', formattedPhone);
          const confirmBio = window.confirm('Would you like to enroll Biometric Unlock (Fingerprint/FaceID) for rapid logins in the future?');
          if (confirmBio) {
            localStorage.setItem('biometric_auth_enabled', 'true');
            localStorage.setItem('biometric_phone_number', formattedPhone);
            showToast('success', 'Biometric credential safely locked inside WebAuthn sandbox!');
          }
        }
        
        showToast('success', `Welcome, ${name}! Profile successfully verified and secured.`);
        onLoginSuccess(false); // Bypass setup step because we already completely populated their profile
      }
    } catch (err) {
      showToast('error', 'Verification failed. Please check the code.');
    } finally {
      setVerifying(false);
    }
  };

  // Biometric Login flow
  const triggerBiometricAuth = () => {
    const enrolledPhone = localStorage.getItem('biometric_phone_number');
    if (!enrolledPhone) {
      showToast('error', 'No enrolled biometric profiles found. Please verify with mobile OTP first to register fingerprint.');
      setBiometricResultState('failure');
      setTimeout(() => setBiometricResultState('idle'), 3000);
      return;
    }

    setBiometricResultState('scanning');
    setBiometricScanning(true);
    setBiometricStatus('Connecting to secure WebAuthn system...');
    
    // Scan steps animation delay
    setTimeout(() => {
      setBiometricStatus('Scanning fingerprint sensor...');
      setTimeout(() => {
        setBiometricStatus('Verifying cryptographic signature...');
        setTimeout(() => {
          // Success! Log user back in
          const savedProfile = localStorage.getItem(`profile_${enrolledPhone}`);
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            localStorage.setItem('sabka_solution_user', savedProfile);
            showToast('success', `Welcome back, ${parsed.name}! Authenticated via Biometrics.`);
            setBiometricResultState('success');
            setTimeout(() => {
              onLoginSuccess(false);
            }, 1000);
          } else {
            // Simulated baseline
            const baselineUser = {
              id: 'bio_user',
              phone: enrolledPhone,
              name: 'Sovereign Citizen',
              ward: 'Ward 100, City Center',
              city: 'Delhi',
              state: 'Delhi',
              role: 'CITIZEN' as const,
              avatarUrl: '',
              points: 150,
              streak: 3,
              badges: ['Biometric Pioneer']
            };
            localStorage.setItem('sabka_solution_user', JSON.stringify(baselineUser));
            showToast('success', 'Access granted via touch security.');
            setBiometricResultState('success');
            setTimeout(() => {
              onLoginSuccess(false);
            }, 1000);
          }
          setBiometricScanning(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  // DigiLocker linking flow
  const triggerDigiLockerFlow = () => {
    setShowDigiLocker(true);
    setDigiLockerStep('AADHAAR');
    setAadhaarNumber('');
    setDigiLockerOtp('');
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      showToast('error', 'Please enter a valid 12-digit Aadhaar Card Number.');
      return;
    }

    setDigiLockerVerifying(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedAadhaarOtp(generatedOtp);
      setDigiLockerStep('OTP');
      setDigiLockerVerifying(false);
      showToast('info', 'Aadhaar OTP dispatched to linked mobile number.');
      
      // Simulate SMS popup for Aadhaar linkage
      setSmsNotification({
        phone: 'UIDAI Gateway',
        otp: generatedOtp
      });
    }, 1200);
  };

  const handleAadhaarOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (digiLockerOtp !== generatedAadhaarOtp) {
      showToast('error', 'Incorrect Aadhaar OTP code. Check the simulated SMS notification.');
      return;
    }

    setDigiLockerVerifying(true);
    setTimeout(() => {
      setDigiLockerStep('SUCCESS');
      setDigiLockerVerifying(false);
      showToast('success', 'Aadhaar documents securely fetched and verified from DigiLocker Cloud!');
    }, 1500);
  };

  const completeDigiLockerLogin = async () => {
    const mockVerifiedCitizen = {
      phone: '+91 9886012345',
      name: 'Dr. Devashish Goel',
      role: 'CITIZEN' as const,
      state: 'Karnataka',
      city: 'Bengaluru',
      ward: 'Ward 150 (Bellandur)',
    };

    // Save profile verified details
    try {
      const newUser = {
        ...mockVerifiedCitizen,
        id: 'usr_digi_' + Date.now().toString(),
        points: 250, // bonus points for sovereign verification
        streak: 1,
        badges: ['Sovereign Patriot', 'DigiLocker Verified 👑']
      };

      localStorage.setItem('sabka_solution_user', JSON.stringify(newUser));
      localStorage.setItem(`profile_${newUser.phone}`, JSON.stringify(newUser));
      localStorage.setItem('biometric_auth_enabled', 'true');
      localStorage.setItem('biometric_phone_number', newUser.phone);
      
      setDigiLockerLinked(true);
      setShowDigiLocker(false);
      showToast('success', `Aadhaar verified! Registered and logged in securely as ${newUser.name}.`);
      onLoginSuccess(false); // Goes to dashboard directly
    } catch (err) {
      showToast('error', 'Linking failed. Try standard registration.');
    }
  };

  const triggerBypass = async () => {
    setName('Dr. Devashish Goel');
    setSelectedState('Karnataka');
    setSelectedCity('Bengaluru');
    setWard('Ward 150 (Bellandur)');
    setRole('VOLUNTEER');
    setPhoneNumber('9999999999');
    setStep('OTP');
    setOtp(['1', '2', '3', '4', '5', '6']);
    setCaptchaInput((num1 + num2).toString());
    showToast('info', 'Secure Bypass loaded. Solving security challenge automatically...');
  };

  return (
    <div className="login-page" id="login-auth-screen" style={{ 
      position: 'relative', 
      overflowY: 'auto', 
      minHeight: '100vh', 
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)',
      zIndex: 1
    }}>
      {/* Decorative premium star grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
        backgroundSize: '32px 32px',
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      {/* Floating elegant glow orbs representing Saffron & Green */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '15%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(255, 153, 51, 0.16) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '15%',
        width: '480px',
        height: '480px',
        background: 'radial-gradient(circle, rgba(18, 136, 7, 0.14) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      
      {/* 1. Simulated Android/iOS Push SMS Notification Toast */}
      <AnimatePresence>
        {smsNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '380px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 107, 0, 0.35)',
              borderRadius: '20px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              zIndex: 9999,
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #D94E00 100%)',
              padding: '8px',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 10px rgba(255, 107, 0, 0.3)'
            }}>
              <Smartphone size={20} />
            </div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💬 {smsNotification.phone === 'UIDAI Gateway' ? 'MuniTech National ID' : 'Sovereign SMS Gateway'}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Just Now</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, margin: '2px 0 4px 0', color: '#F1F5F9' }}>
                {smsNotification.phone === 'UIDAI Gateway' 
                  ? `Your DigiLocker verification security OTP code is ${smsNotification.otp}.` 
                  : `Your SabkaSolution account sign-in code is ${smsNotification.otp}.`}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    if (showDigiLocker && digiLockerStep === 'OTP') {
                      setDigiLockerOtp(smsNotification.otp);
                      showToast('success', 'Aadhaar OTP copied!');
                    } else if (step === 'OTP') {
                      setOtp(smsNotification.otp.split(''));
                      showToast('success', 'OTP code auto-filled!');
                    }
                    setSmsNotification(null);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 750,
                    color: '#FF6B00',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  Auto-fill code
                </button>
              </div>
            </div>
            <button 
              onClick={() => setSmsNotification(null)}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant, glowing Lotus Flower design background */}
      <div className="lotus-watermark" style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '135%',
        height: '135%',
        maxWidth: '1000px',
        maxHeight: '1000px',
        opacity: 0.55,
        pointerEvents: 'none',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <g transform="translate(200, 250)">
            {/* Soft Radial Center Glow */}
            <circle cx="0" cy="-60" r="130" fill="url(#lotusCenterGlow)" opacity="0.35" filter="blur(25px)" />
            
            {/* Outer Bottom-most Petals */}
            <path d="M 0 0 C -65 45, -160 25, -170 -45 C -125 -65, -65 -45, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="1.8" opacity="0.7" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 153, 51, 0.25))' }} />
            <path d="M 0 0 C 65 45, 160 25, 170 -45 C 125 -65, 65 -45, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="1.8" opacity="0.7" style={{ filter: 'drop-shadow(0 0 8px rgba(18, 136, 7, 0.25))' }} />
            
            {/* Mid-tier Outer Petals */}
            <path d="M 0 0 C -75 -10, -140 -45, -130 -115 C -85 -105, -30 -65, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="2" opacity="0.8" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 153, 51, 0.3))' }} />
            <path d="M 0 0 C 75 -10, 140 -45, 130 -115 C 85 -105, 30 -65, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="2" opacity="0.8" style={{ filter: 'drop-shadow(0 0 10px rgba(18, 136, 7, 0.3))' }} />
            
            {/* Inner-tier Side Petals */}
            <path d="M 0 0 C -45 -35, -85 -85, -65 -160 C -30 -115, -10 -65, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="2.2" opacity="0.9" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 153, 51, 0.35))' }} />
            <path d="M 0 0 C 45 -35, 85 -85, 65 -160 C 30 -115, 10 -65, 0 0 Z" fill="url(#lotusGradient)" stroke="url(#lotusStroke)" strokeWidth="2.2" opacity="0.9" style={{ filter: 'drop-shadow(0 0 12px rgba(18, 136, 7, 0.35))' }} />
            
            {/* Majestic Central Petal */}
            <path d="M 0 0 C -35 -55, -45 -125, 0 -200 C 45 -125, 35 -55, 0 0 Z" fill="url(#lotusGradientCenter)" stroke="url(#lotusStrokeCenter)" strokeWidth="2.8" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 153, 51, 0.5))' }} />
            
            {/* Rising Sparks/Nectar Dots */}
            <g opacity="0.8">
              <circle cx="0" cy="-225" r="4.5" fill="#FF9933" style={{ filter: 'drop-shadow(0 0 5px #FF9933)' }} />
              <circle cx="-35" cy="-195" r="3.5" fill="#FF9933" style={{ filter: 'drop-shadow(0 0 4px #FF9933)' }} />
              <circle cx="35" cy="-195" r="3.5" fill="#FF9933" style={{ filter: 'drop-shadow(0 0 4px #FF9933)' }} />
              <circle cx="-70" cy="-170" r="2.5" fill="#FF9933" />
              <circle cx="70" cy="-170" r="2.5" fill="#FF9933" />
              <circle cx="-100" cy="-135" r="2" fill="#128807" />
              <circle cx="100" cy="-135" r="2" fill="#128807" />
            </g>
            
            {/* Graceful Lotus Base Curves */}
            <path d="M -30 15 Q 0 45 30 15" stroke="url(#lotusStroke)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M -50 25 Q 0 65 50 25" stroke="url(#lotusStroke)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          
          <defs>
            <linearGradient id="lotusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 153, 51, 0.12)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.02)" />
              <stop offset="100%" stopColor="rgba(18, 136, 7, 0.12)" />
            </linearGradient>
            <linearGradient id="lotusGradientCenter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 153, 51, 0.28)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.08)" />
              <stop offset="100%" stopColor="rgba(18, 136, 7, 0.28)" />
            </linearGradient>
            <linearGradient id="lotusStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="100%" stopColor="#128807" />
            </linearGradient>
            <linearGradient id="lotusStrokeCenter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#128807" />
            </linearGradient>
            <radialGradient id="lotusCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#128807" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <motion.div 
        layout 
        className="login-card" 
        style={{ 
          overflow: 'hidden', 
          position: 'relative', 
          width: '100%', 
          maxWidth: '520px', 
          margin: '0 auto', 
          borderRadius: '24px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      >
        
        {/* Cinematic top tricolor trim */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #128807 100%)'
        }}></div>

        <div className="login-header" style={{ marginBottom: '20px' }}>
          <div className="logo-container" style={{ position: 'relative', margin: '0 auto 12px auto' }}>
            <ShieldCheck size={36} />
            <span style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              background: '#059669',
              borderRadius: '50%',
              padding: '2px',
              border: '2px solid white'
            }}>
              <Sparkles size={10} color="white" />
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: '#0F172A' }}>SabkaSolution</h2>
          <p style={{ color: '#64748B', fontWeight: 500 }}>{t('tagline')}</p>
          <span style={{ fontSize: '0.8rem', color: '#FF6B00', fontWeight: 800, marginTop: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('login_mandatory_signin')}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'PHONE' ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <form onSubmit={handleSendOTP} id="login-phone-form" className="space-y-5">
                
                {/* 1. Full Name */}
                <div className="form-group">
                  <label htmlFor="login-name" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                    <User size={15} className="text-[#FF6B00]" />
                    <span>{t('login_full_name')} <span className="text-red-600 font-bold">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="login-name"
                    placeholder={t('login_name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-base text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold shadow-md focus:bg-white"
                  />
                </div>

                {/* 2. State & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="login-state" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                      <MapPin size={15} className="text-[#FF6B00]" />
                      <span>{t('login_state')} <span className="text-red-600 font-bold">*</span></span>
                    </label>
                    <select
                      id="login-state"
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-base text-slate-950 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-extrabold shadow-md focus:bg-white cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {STATE_LOCALIZATION[i18n.language]?.[st] || st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-city" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                      <Building2 size={15} className="text-[#FF6B00]" />
                      <span>{t('login_city')} <span className="text-red-600 font-bold">*</span></span>
                    </label>
                    <select
                      id="login-city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-base text-slate-950 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-extrabold shadow-md focus:bg-white cursor-pointer"
                    >
                      {(STATE_CITIES[selectedState] || []).map((cty) => (
                        <option key={cty} value={cty}>{cty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Municipal Ward & Role Select Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="login-ward" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                      <Building2 size={15} className="text-[#FF6B00]" />
                      <span>{t('login_ward')} <span className="text-red-600 font-bold">*</span></span>
                    </label>
                    <input
                      type="text"
                      id="login-ward"
                      placeholder={t('login_ward_placeholder')}
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-base text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold shadow-md focus:bg-white"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-role" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                      <UserCheck size={15} className="text-[#FF6B00]" />
                      <span>{t('login_role')} <span className="text-red-600 font-bold">*</span></span>
                    </label>
                    <select
                      id="login-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'CITIZEN' | 'VOLUNTEER')}
                      required
                      className="w-full bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-base text-slate-950 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-extrabold shadow-md focus:bg-white cursor-pointer"
                    >
                      <option value="CITIZEN">{t('login_role_citizen')}</option>
                      <option value="VOLUNTEER">{t('login_role_volunteer')}</option>
                    </select>
                  </div>
                </div>

                {/* 4. Phone Number */}
                <div className="form-group">
                  <label htmlFor="phone-input" className="flex items-center gap-2 text-sm font-black text-slate-950 uppercase tracking-widest mb-2">
                    <Smartphone size={15} className="text-[#FF6B00]" />
                    <span>{t('login_phone')} <span className="text-red-600 font-bold">*</span></span>
                  </label>
                  <div className="input-with-prefix" style={{ padding: '4px', display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '2px solid #94A3B8', borderRadius: '18px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                    <span className="input-prefix" style={{ borderRadius: '14px 0 0 14px', background: '#F1F5F9', color: '#0F172A', padding: '14px 22px', fontSize: '1.15rem', fontWeight: 900, borderRight: '2px solid #94A3B8' }}>+91</span>
                    <input
                      type="tel"
                      id="phone-input"
                      placeholder={t('login_phone_placeholder')}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ fontWeight: 800, paddingLeft: '18px', background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1.15rem', color: '#020617' }}
                    />
                  </div>
                </div>

                {/* 5. Citizen Integrity Security CAPTCHA Check */}
                <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-600 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <span className="flex items-center gap-2 text-sm md:text-base font-black text-emerald-950 uppercase tracking-widest">
                      <ShieldCheck size={20} className="text-emerald-700 animate-pulse" />
                      <span>{t('login_security_check')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-1.5 rounded-xl hover:bg-emerald-200/50 text-emerald-800 transition-colors border-2 border-emerald-300 shadow-sm"
                      title="Regenerate math puzzle"
                    >
                      <RefreshCw size={14} className="text-emerald-800" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                    🛡️ {t('login_captcha_caption')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                    <div className="bg-emerald-100 text-emerald-950 text-xl font-black px-6 py-3.5 rounded-2xl border-2 border-emerald-400 shadow-md tracking-widest select-none flex items-center justify-center min-w-[130px]">
                      {num1} + {num2} = ?
                    </div>
                    <input
                      type="number"
                      placeholder={t('login_solve_math')}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                      required
                      className="flex-grow bg-white border-2 border-emerald-600 rounded-2xl px-5 py-3.5 text-lg text-slate-950 placeholder-slate-500 focus:outline-none focus:border-emerald-800 focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-center shadow-md"
                    />
                  </div>
                </div>

                {/* Action Submit Button */}
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-2xl text-base font-black tracking-widest text-white bg-slate-950 border-2 border-slate-800 hover:bg-emerald-700 hover:border-emerald-600 hover:shadow-emerald-500/20 hover:shadow-2xl cursor-pointer transition-all duration-300 shadow-xl transform active:scale-[0.98]"
                  disabled={sending} 
                  id="btn-send-otp"
                >
                  {sending ? t('login_verifying_seal') : (
                    <>
                      <span>{t('login_submit_btn')}</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                {/* Premium Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
                  <div style={{ flexGrow: 1, height: '1px', background: '#E2E8F0' }}></div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('login_or_connect')}</span>
                  <div style={{ flexGrow: 1, height: '1px', background: '#E2E8F0' }}></div>
                </div>

                {/* Advanced Authentication Options Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* DigiLocker Button */}
                  <button
                    type="button"
                    onClick={triggerDigiLockerFlow}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #0A5F9E 0%, #033C66 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '10px',
                      boxShadow: '0 8px 16px rgba(10, 95, 158, 0.2)',
                      transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <QrCode size={16} style={{ flexShrink: 0 }} />
                    <span style={{ textAlign: 'left' }}>{t('login_digilocker')}</span>
                    
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.62rem', background: '#FF9933', color: 'white', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>GOVT</span>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        background: digiLockerLinked ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.12)', 
                        border: digiLockerLinked ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.25)',
                        color: digiLockerLinked ? '#34D399' : '#E2E8F0', 
                        padding: '1px 6px', 
                        borderRadius: '4px', 
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ 
                          width: '5px', 
                          height: '5px', 
                          borderRadius: '50%', 
                          background: digiLockerLinked ? '#10B981' : '#CBD5E1',
                          display: 'inline-block'
                        }} />
                        {digiLockerLinked ? 'Linked' : 'Link'}
                      </span>
                    </div>
                  </button>

                  {/* Biometric Button */}
                  <motion.button
                    type="button"
                    onClick={triggerBiometricAuth}
                    disabled={!biometricEnrolled || biometricResultState === 'scanning'}
                    animate={biometricEnrolled && biometricResultState === 'idle' ? {
                      scale: [1, 1.02, 1],
                      boxShadow: [
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        '0 0 12px rgba(5, 150, 105, 0.35)',
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      ]
                    } : biometricResultState === 'failure' ? {
                      x: [0, -6, 6, -6, 6, 0]
                    } : {}}
                    transition={{
                      scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                      boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                      x: { duration: 0.4 }
                    }}
                    style={{
                      width: '100%',
                      background: biometricResultState === 'success' ? '#059669' : biometricResultState === 'failure' ? '#EF4444' : biometricEnrolled ? 'var(--secondary)' : '#F1F5F9',
                      color: (biometricEnrolled || biometricResultState !== 'idle') ? 'white' : '#94A3B8',
                      border: biometricEnrolled ? 'none' : '1px dashed #CBD5E1',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: biometricEnrolled ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'background 0.3s, color 0.3s'
                    }}
                  >
                    {biometricResultState === 'success' ? (
                      <>
                        <CheckCircle size={16} />
                        <span>{t('login_biometric_success')}</span>
                      </>
                    ) : biometricResultState === 'failure' ? (
                      <>
                        <AlertCircle size={16} />
                        <span>{t('login_biometric_failed')}</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint size={16} className={biometricEnrolled ? 'animate-pulse' : ''} />
                        <span>{biometricEnrolled ? t('login_biometric_prompt') : t('login_biometric_enroll')}</span>
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="bypass-badge" onClick={triggerBypass} id="bypass-login-btn" style={{ padding: '12px', border: '1px dashed #FF6B00', borderRadius: '16px', background: '#FFF7ED', cursor: 'pointer', textAlign: 'center', marginTop: '16px' }}>
                  <strong style={{ color: '#C2410C', fontSize: '0.8rem' }}>{t('login_bypass_title')}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#EA580C', marginTop: '4px', fontWeight: 600 }}>
                    {t('login_bypass_desc')}
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <form onSubmit={handleVerifyOTP} id="login-otp-form">
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label style={{ marginBottom: '14px', fontWeight: 750, color: 'var(--secondary)', display: 'block' }}>
                    {t('enter_otp')} - {t('otp_sent_to')} +91 {phoneNumber}
                  </label>
                  
                  <div className="otp-box-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        autoComplete="one-time-code"
                        className="otp-input-single"
                        value={digit}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        onChange={(e) => handleOTPChange(e.target, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        id={`otp-box-${idx}`}
                        style={{ width: '42px', height: '48px', fontSize: '1.3rem', textAlign: 'center', border: '2px solid #CBD5E1', borderRadius: '10px', outline: 'none' }}
                      />
                    ))}
                  </div>

                  {/* Visual Countdown Timer Progress Bar */}
                  {countdown > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '100%', maxWidth: '240px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                        <motion.div 
                          initial={{ width: '100%' }}
                          animate={{ width: `${(countdown / 30) * 100}%` }}
                          transition={{ duration: 1, ease: 'linear' }}
                          style={{
                            height: '100%',
                            background: countdown < 10 ? '#EF4444' : '#FF6B00',
                            boxShadow: '0 0 6px rgba(255, 107, 0, 0.4)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: countdown < 10 ? '#EF4444' : '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Smartphone size={12} />
                        <span>{t('otp_expires_in')} {countdown} {t('otp_seconds')}</span>
                      </span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-6 text-white font-extrabold text-xs tracking-wider" disabled={verifying} id="btn-verify-otp" style={{ height: '52px', fontSize: '0.95rem', background: '#10B981', border: 'none', cursor: 'pointer' }}>
                  {verifying ? t('otp_verifying') : t('verify_otp')}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.82rem' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#C2410C', cursor: 'pointer', fontWeight: 750 }}
                    onClick={() => setStep('PHONE')}
                  >
                    {t('otp_change_number')}
                  </button>
                  
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {countdown > 0 ? `${t('otp_resend_in')} ${countdown}s` : (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', fontWeight: 750 }}
                        onClick={handleSendOTP}
                      >
                        {t('otp_resend_btn')}
                      </button>
                    )}
                  </span>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. Biometric Scan Overlay Animation */}
      <AnimatePresence>
        {biometricScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(20px)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: 'white'
            }}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '24px' }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(5, 150, 105, 0.3)',
                  boxShadow: '0 0 40px rgba(5, 150, 105, 0.2)'
                }}
              ></motion.div>
              
              <div style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981'
              }}>
                <Fingerprint size={56} className="animate-pulse" />
              </div>

              {/* Laser scan line animation */}
              <motion.div
                animate={{ y: [10, 110, 10] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: '12px',
                  right: '12px',
                  height: '3px',
                  background: '#10B981',
                  boxShadow: '0 0 10px #10B981, 0 0 20px #10B981',
                  borderRadius: '10px',
                  zIndex: 2
                }}
              />
            </div>

            <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Security Biometrics Active</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, minHeight: '20px' }}>{biometricStatus}</p>
            
            <button 
              onClick={() => setBiometricScanning(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '30px',
                marginTop: '32px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel Scan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DigiLocker Government Gateway Integration Modal */}
      <AnimatePresence>
        {showDigiLocker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                border: '1px solid rgba(15, 23, 42, 0.1)'
              }}
            >
              {/* Official Govt-Style Header */}
              <div style={{
                background: '#0B5F9E',
                padding: '16px 20px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '4px solid #FF9933'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <QrCode size={24} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>DigiLocker KYC Gateway</h4>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>MeitY, Government of India</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDigiLocker(false)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px' }}>
                {digiLockerStep === 'AADHAAR' && (
                  <form onSubmit={handleAadhaarSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <ShieldAlert size={40} color="#FF9933" style={{ margin: '0 auto 8px auto' }} />
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Enter 12-Digit Aadhaar Card</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                        Your identity will be verified securely via direct e-KYC handshake with UIDAI servers.
                      </p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="0000 0000 0000"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.25rem',
                          fontWeight: 750,
                          textAlign: 'center',
                          letterSpacing: '1px',
                          outline: 'none',
                          background: '#F8FAFC'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '12px', borderRadius: '12px', marginBottom: '20px', alignItems: 'flex-start' }}>
                      <Lock size={16} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.68rem', color: '#64748B', margin: 0, fontWeight: 650 }}>
                        Your Aadhaar details are processed through a sandboxed e-KYC module. No Aadhaar data is stored on our servers.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={digiLockerVerifying}
                      style={{
                        width: '100%',
                        background: '#0B5F9E',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: '0.2s'
                      }}
                    >
                      {digiLockerVerifying ? 'Verifying with UIDAI Servers...' : 'Request Aadhaar Link OTP'}
                    </button>
                  </form>
                )}

                {digiLockerStep === 'OTP' && (
                  <form onSubmit={handleAadhaarOtpVerify}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <Smartphone size={36} color="#0B5F9E" style={{ margin: '0 auto 8px auto' }} />
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Enter UIDAI Security Code</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                        Enter the secure 6-digit Aadhaar OTP sent to your linked mobile number ending with XXXX.
                      </p>
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="------"
                        value={digiLockerOtp}
                        onChange={(e) => setDigiLockerOtp(e.target.value.replace(/\D/g, ''))}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          textAlign: 'center',
                          letterSpacing: '12px',
                          outline: 'none',
                          background: '#F8FAFC'
                        }}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={digiLockerVerifying}
                      style={{
                        width: '100%',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: '0.2s'
                      }}
                    >
                      {digiLockerVerifying ? 'Confirming Cryptographic Handshake...' : 'Authenticate & Pull Documents'}
                    </button>
                  </form>
                )}

                {digiLockerStep === 'SUCCESS' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'rgba(5, 150, 105, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                      margin: '0 auto 16px auto'
                    }}>
                      <CheckCircle size={36} />
                    </div>
                    
                    <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>National KYC Complete!</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '24px' }}>
                      Official documents fetched securely. Verified citizen profile auto-extracted.
                    </p>

                    {/* Extracted Certificate Card */}
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid rgba(15,23,42,0.08)',
                      borderRadius: '16px',
                      padding: '16px',
                      textAlign: 'left',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>DigiLocker Verified Vault</span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>E-KYC OK</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <div><strong style={{ color: '#64748B' }}>Verified Name:</strong> <span style={{ fontWeight: 750, color: '#0F172A' }}>Dr. Devashish Goel</span></div>
                        <div><strong style={{ color: '#64748B' }}>Jurisdiction:</strong> <span style={{ fontWeight: 700, color: '#0F172A' }}>Koramangala, Bengaluru, KA</span></div>
                        <div><strong style={{ color: '#64748B' }}>Document Pull:</strong> <span style={{ fontWeight: 700, color: '#0F172A' }}>Aadhaar (UIDAI), PAN Card (ITD)</span></div>
                      </div>
                    </div>

                    <button 
                      onClick={completeDigiLockerLogin}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0A5F9E 0%, #033C66 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <UserCheck size={18} />
                      <span>Proceed to Secure Dashboard (+250 pts)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
