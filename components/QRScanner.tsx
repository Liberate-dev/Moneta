import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AppButton } from './AppButton';
import { MOCK_QR_OPTIONS } from '../constants';
import { DrugQRCodeData } from '../types';

interface QRScannerProps {
  onScan: (data: DrugQRCodeData) => void;
  onCancel: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onCancel }) => {
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText) as DrugQRCodeData;
          // Simple validation
          if (parsedData.drug_id && parsedData.serial_number) {
            handleSuccess(parsedData);
          } else {
            setError("Invalid QR Code format");
          }
        } catch (e) {
          setError("Not a valid Moneta QR Code");
        }
      },
      (errorMessage) => {
        // Parse error, ignore common scanning errors
        // console.log(errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, []);

  const handleSuccess = (data: DrugQRCodeData) => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        onScan(data);
      }).catch((err) => {
        console.error("Failed to clear scanner", err);
        onScan(data); // Proceed anyway
      });
    } else {
      onScan(data);
    }
  };

  const handleSimulateScan = (data: DrugQRCodeData) => {
    handleSuccess(data);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black flex flex-col justify-center">

        {/* Real Scanner Container */}
        <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-900"></div>

        {error && (
          <div className="absolute top-24 left-0 right-0 text-center px-4">
            <span className="bg-red-500/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              {error}
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="bg-slate-900 p-6 pb-12 rounded-t-3xl -mt-6 relative z-10 max-h-[40vh] overflow-y-auto no-scrollbar border-t border-slate-800">
        <h3 className="text-white font-bold text-lg mb-2">Scan Medication</h3>
        <p className="text-slate-400 text-sm mb-6">
          Align the QR code within the frame logic.
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

      {/* Override html5-qrcode styles */}
      <style>{`
        #reader__scan_region {
          background: rgba(0,0,0,0.5);
        }
        #reader__dashboard_section_csr span {
           display: none;
        }
      `}</style>
    </div>
  );
};