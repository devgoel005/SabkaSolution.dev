import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Check, X, ShieldAlert, Award, Flame, Zap, MapPin, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VerifySwipe: React.FC = () => {
  const { t } = useTranslation();
  const { issues, verifySwipe, user, showToast } = useApp();

  // Get only pending issues that the user hasn't already verified or rejected
  const pendingIssues = issues.filter(
    (issue) =>
      issue.status === 'PENDING' &&
      user &&
      !issue.verifiedBy?.includes(user.phone) &&
      !issue.rejectedBy?.includes(user.phone)
  );

  // Keep track of processing states to show loaders or feedback overlay
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionTaken, setActionTaken] = useState<'verified' | 'rejected' | null>(null);

  const handleVerifyAction = async (id: string, isVerified: boolean) => {
    if (processingId) return;

    setProcessingId(id);
    setActionTaken(isVerified ? 'verified' : 'rejected');

    // Small delay to let the user see the inline visual response before the card fades/collapses
    setTimeout(async () => {
      try {
        await verifySwipe(id, isVerified);
      } catch (err) {
        showToast('error', 'Failed to submit verification. Please try again.');
      } finally {
        setProcessingId(null);
        setActionTaken(null);
      }
    }, 450);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '640px', margin: '0 auto', paddingBottom: '80px' }} id="verify-swipe-screen" className="px-3 sm:px-4">
      
      {/* Premium Compact Header with Stats */}
      <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-4 mb-4 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
            <ShieldAlert size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white">{t('swipe_title')}</h2>
            <p className="text-[10px] text-slate-400 font-medium">Verify hyperlocal reports near you</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-500 border border-amber-500/20">
              <Flame size={14} fill="currentColor" />
              <span>{user.streak || 1} Days</span>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <Zap size={14} fill="currentColor" />
              <span>{user.points} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Hint banner */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700 flex gap-2.5 items-start">
        <HelpCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Earn Reputation Points:</span> Verify real complaints or report fake reports to earn <span className="font-bold text-blue-800">+10 points</span> per report. Help municipal teams filter verified local issues first.
        </div>
      </div>

      {/* Reports Feed Container */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {pendingIssues.length > 0 ? (
            pendingIssues.slice(0, 1).map((issue) => {
              const isCurrentProcessing = processingId === issue.id;
              
              return (
                <motion.div
                  key={issue.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: actionTaken === 'verified' ? 120 : -120, scale: 0.9, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm relative flex flex-col hover:border-slate-200 transition-all duration-200"
                  style={{
                    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  {/* Image banner with floating badges */}
                  <div className="relative h-44 w-full bg-slate-50">
                    <img
                      src={issue.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {issue.category}
                      </span>
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-red-400">
                        ⚠️ SEVERITY: {issue.severity}/5
                      </span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
                      <div className="flex items-center gap-1.5 text-white/95 font-semibold text-xs">
                        <MapPin size={12} className="text-orange-400 shrink-0" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-grow flex flex-col gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{issue.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {issue.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 w-full" />

                  {/* Action Buttons Footer */}
                  <div className="p-3 bg-slate-50/50 flex gap-3 items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Is this report authentic?
                    </span>
                    
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyAction(issue.id, false)}
                        disabled={processingId !== null}
                        className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-100 font-extrabold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
                        title="Mark as Fake/Duplicate"
                      >
                        <X size={15} strokeWidth={2.5} />
                        <span>Fake / Spam</span>
                      </button>

                      <button
                        onClick={() => handleVerifyAction(issue.id, true)}
                        disabled={processingId !== null}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
                        title="Confirm Real Issue"
                      >
                        <Check size={15} strokeWidth={2.5} />
                        <span>Real Issue</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct overlay feedback when clicked */}
                  {isCurrentProcessing && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 animate-fadeIn">
                      {actionTaken === 'verified' ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-bounce">
                            <CheckCircle size={28} />
                          </div>
                          <span className="text-sm font-black text-emerald-600 tracking-tight">VERIFYING COMPLAINT...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 animate-bounce">
                            <X size={28} />
                          </div>
                          <span className="text-sm font-black text-red-500 tracking-tight">REPORTING SPAM...</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center gap-4"
              id="verify-queue-empty"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                <Award size={36} />
              </div>
              <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">{t('swipe_empty')}</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
                Awesome job! You have verified all pending citizen reports in your neighborhood ward sector. Keep up the high citizenship score!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
