import React from 'react';
import { DrugQRCodeData } from '../types';
import { AppButton } from './AppButton';

interface EducationModalProps {
  data: DrugQRCodeData;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EducationModal: React.FC<EducationModalProps> = ({ data, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header with Drug Name */}
        <div className="bg-sky-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <h2 className="text-2xl font-bold relative z-10">Important Instructions</h2>
          <p className="opacity-90 relative z-10 text-sky-50">Please read before starting {data.name}</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Specific Instruction from QR */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">How to take this medicine</h3>
            <div className="flex items-start gap-3">
              <div className="bg-sky-100 text-sky-600 p-2 rounded-lg mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">{data.instruction}</p>
                <p className="text-slate-500 text-sm">Dosage: {data.dosage}</p>
              </div>
            </div>
          </div>

          {/* General Antibiotic Rules */}
          <div className="space-y-4">
            <h3 className="text-slate-800 font-bold">Golden Rules of Antibiotics</h3>
            
            <div className="flex gap-3 items-start">
              <div className="text-orange-500 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Finish the full course.</span> Even if you feel better, stopping early allows bacteria to survive and become resistant.
              </p>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-red-500 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Stick to the schedule.</span> Taking doses at the same time every day keeps the medicine effective in your body.
              </p>
            </div>
             
             <div className="flex gap-3 items-start">
              <div className="text-purple-500 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Never share.</span> This prescription is tailored for your specific infection only.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <AppButton onClick={onConfirm} fullWidth>
              I Understand & Continue
            </AppButton>
            <button onClick={onCancel} className="w-full text-center py-3 text-slate-400 text-sm mt-2 hover:text-slate-600">
              Cancel Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};