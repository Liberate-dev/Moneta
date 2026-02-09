import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

import { DrugQRCodeData } from '../types';

interface QRScannerProps {
  onScan: (data: DrugQRCodeData) => void;
  onCancel: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onCancel }) => {
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Prefer back camera
          const cameraId = devices.find(d => d.label.toLowerCase().includes('back'))?.id || devices[0].id;

          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (!isMounted) return;
              try {
                const parsedData = JSON.parse(decodedText) as DrugQRCodeData;
                if (parsedData.drug_id && parsedData.serial_number) {
                  html5QrCode.stop().then(() => {
                    onScan(parsedData);
                  }).catch(err => {
                    console.error("Failed to stop", err);
                    onScan(parsedData);
                  });
                }
              } catch (e) {
                // Ignore invalid QRs
              }
            },
            (errorMessage) => {
              // parse error, ignore
            }
          );

          if (isMounted) setIsScanning(true);
        } else {
          setError("No camera found");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Camera error:", err);
          setError("Camera permission denied or error starting camera.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);



  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black flex flex-col justify-center items-center overflow-hidden">

        {/* Camera Container */}
        <div id="reader" className="w-full h-full object-cover"></div>

        {/* Custom Square Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Dark Background Wrapper */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Cutout for Scanner */}
          <div className="relative w-64 h-64 border-2 border-sky-500 rounded-2xl z-10 box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-500 rounded-tl-lg -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-500 rounded-tr-lg -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-500 rounded-bl-lg -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-500 rounded-br-lg -mb-1 -mr-1"></div>

            {/* Scan Line Animation */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_red] animate-[scan_2s_ease-in-out_infinite]"></div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-24 left-0 right-0 text-center px-4 z-20">
            <span className="bg-red-500/90 text-white px-6 py-3 rounded-full text-sm font-bold backdrop-blur-sm shadow-lg">
              {error}
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-white p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full z-20 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="bg-slate-900 p-6 pb-12 rounded-t-3xl -mt-6 relative z-10 max-h-[40vh] overflow-y-auto no-scrollbar border-t border-slate-800">
        <h3 className="text-white font-bold text-lg mb-2">Scan Medication</h3>
        <p className="text-slate-400 text-sm mb-6">
          Align the QR code within the frame to scan.
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
          0%, 100% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(16rem); opacity: 0; }
        }
        /* Hide html5-qrcode default elements if they appear */
        #reader video { object-fit: cover; width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  );
};