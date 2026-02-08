import React, { useState } from 'react';
import { AppButton } from './AppButton';
import { MOCK_QR_OPTIONS } from '../constants';
import { DrugQRCodeData } from '../types';

interface QRScannerProps {
  onScan: (data: DrugQRCodeData) => void;
  onCancel: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onCancel }) => {
  const [scanning, setScanning] = useState(true);

  const handleSimulateScan = (data: DrugQRCodeData) => {
    setScanning(false);
    // Simulate processing delay
    setTimeout(() => {
      onScan(data);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black">
        {/* Camera Viewfinder Simulation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-sky-500 rounded-2xl relative animate-pulse">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-sky-500 -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-sky-500 -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-sky-500 -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-sky-500 -mb-1 -mr-1"></div>
            
            {/* Scanning Line */}
            <div className="w-full h-0.5 bg-red-500 absolute top-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Text Instructions */}
        <div className="absolute bottom-24 w-full text-center p-4">
          <p className="text-white text-lg font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Align QR Code within frame
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="bg-slate-900 p-6 pb-12 rounded-t-3xl -mt-6 relative z-10 max-h-[50vh] overflow-y-auto no-scrollbar">
        <h3 className="text-white font-bold text-lg mb-2">Scan Medication</h3>
        <p className="text-slate-400 text-sm mb-6">
          Scan the QR code on your antibiotic packaging to automatically generate your schedule.
        </p>
        
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Debug: Try Dummy QR</p>
          {MOCK_QR_OPTIONS.map((option, idx) => (
            <AppButton 
              key={idx} 
              onClick={() => handleSimulateScan(option.data)} 
              variant="secondary" 
              fullWidth 
              className="text-xs justify-start py-4 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-sky-500"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              {option.label}
            </AppButton>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-8rem); opacity: 0; }
          50% { transform: translateY(8rem); opacity: 1; }
        }
      `}</style>
    </div>
  );
};