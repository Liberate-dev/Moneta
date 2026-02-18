import React, { useState } from 'react';
import { DrugQRCodeData } from './types';
import { AppButton } from './components/AppButton';

import { useNavigate } from 'react-router-dom';

export const AdminApp: React.FC = () => {
  const navigate = useNavigate();
  const onBack = () => navigate('/');
  // Initial Form State
  const [formData, setFormData] = useState<Partial<DrugQRCodeData>>({
    name: '',
    dosage: '500mg',
    frequency_per_day: 3,
    duration_days: 5,
    instruction: 'Sesudah makan',
    total_pills: 15,
    drug_id: 'GENERIC-001',
    how_to_take: '',
    how_to_dispose: '',
    side_effects: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const [generatedQR, setGeneratedQR] = useState<{ json: string, url: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleGenerate = () => {
    // 1. Create Unique Serial Number
    const uniqueSerial = `SN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().getFullYear()}`;

    // 2. Calculate Expiry (Example: 1 year from now)
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    // 3. Construct Final Data Payload
    const finalData: DrugQRCodeData = {
      drug_id: formData.drug_id || 'UNKNOWN',
      serial_number: uniqueSerial,
      name: formData.name || 'Unknown Drug',
      dosage: formData.dosage || '0mg',
      frequency_per_day: Number(formData.frequency_per_day),
      duration_days: Number(formData.duration_days),
      instruction: formData.instruction || '',
      total_pills: Number(formData.total_pills),
      exp_date: expDate.toISOString().split('T')[0],
      how_to_take: formData.how_to_take,
      how_to_dispose: formData.how_to_dispose,
      side_effects: formData.side_effects
    };

    // 4. Convert to JSON String
    const jsonString = JSON.stringify(finalData);

    // 5. Generate QR Image URL (Using a public API for demo purposes to avoid npm deps)
    // In production, use a library like 'qrcode.react'
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonString)}`;

    setGeneratedQR({
      json: jsonString,
      url: qrUrl
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Base style for all inputs to force LIGHT THEME regardless of system settings
  const inputClass = "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900 placeholder-slate-400 shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase mb-1 tracking-wide";

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN: INPUT FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">MONETA <span className="text-sky-500">Admin</span></h1>
            <p className="text-slate-500 text-sm mt-1">QR Code Generator for Antibiotics</p>
          </div>

          {showSuccess && (
            <div className="mb-6 bg-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span className="font-bold">QR Code Generated Successfully!</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Drug Name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Amoxicillin"
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Dosage</label>
                <input
                  name="dosage"
                  type="text"
                  placeholder="e.g. 500mg"
                  className={inputClass}
                  value={formData.dosage}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Frequency (per day)</label>
                <input
                  name="frequency_per_day"
                  type="number"
                  className={inputClass}
                  value={formData.frequency_per_day}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Duration (Days)</label>
                <input
                  name="duration_days"
                  type="number"
                  className={inputClass}
                  value={formData.duration_days}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Total Pills</label>
                <input
                  name="total_pills"
                  type="number"
                  className={inputClass}
                  value={formData.total_pills}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Instruction</label>
              <select
                name="instruction"
                className={inputClass}
                value={formData.instruction}
                onChange={handleChange}
              >
                <option value="Sesudah makan">Sesudah makan (After food)</option>
                <option value="Sebelum makan">Sebelum makan (Before food)</option>
                <option value="Saat makan">Saat makan (With food)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Cara Minum (How to Take)</label>
              <input
                name="how_to_take"
                type="text"
                placeholder="e.g. Swallow whole with water"
                className={inputClass}
                value={formData.how_to_take}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className={labelClass}>Cara Buang (How to Dispose)</label>
              <input
                name="how_to_dispose"
                type="text"
                placeholder="e.g. Return unused pills to pharmacy"
                className={inputClass}
                value={formData.how_to_dispose}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className={labelClass}>Aturan / Efek Samping (Side Effects/Rules)</label>
              <textarea
                name="side_effects"
                rows={2}
                placeholder="e.g. May cause drowsiness. Do not drive."
                className={inputClass}
                value={formData.side_effects}
                onChange={handleChange}
              />
            </div>

            <div className="pt-6">
              <AppButton onClick={handleGenerate} fullWidth className="py-4 text-lg shadow-sky-500/20">
                Generate QR Code
              </AppButton>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden flex-grow min-h-[400px]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {!generatedQR ? (
              <div className="text-slate-500 relative z-10">
                <div className="w-32 h-32 border-4 border-dashed border-slate-700 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="16" x2="12" y2="21"></line></svg>
                </div>
                <p className="font-medium text-lg">Waiting for data...</p>
                <p className="text-sm opacity-60">Fill the form to generate label</p>
              </div>
            ) : (
              <div className="w-full animate-in zoom-in duration-300 relative z-10 flex flex-col items-center">
                <div className="bg-white p-6 rounded-2xl inline-block mb-8 shadow-2xl">
                  <img src={generatedQR.url} alt="QR Code" className="w-64 h-64 mix-blend-multiply" />
                  <p className="mt-2 text-slate-900 font-bold text-sm tracking-widest">{formData.drug_id}</p>
                </div>

                <div className="w-full text-left space-y-2 mb-6 font-mono text-xs bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 overflow-x-auto shadow-inner">
                  <p className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    PAYLOAD PREVIEW
                  </p>
                  <pre className="text-slate-300 whitespace-pre-wrap break-all">{generatedQR.json}</pre>
                </div>

                <AppButton onClick={handlePrint} variant="secondary" className="bg-white hover:bg-slate-200 text-slate-900 border-none font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print Label
                </AppButton>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full bg-white text-slate-500 text-sm font-bold hover:text-sky-600 hover:shadow-md transition-all border border-slate-200"
            >
              ← Back to App
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};