import React, { useState } from 'react';
import { AppButton } from './AppButton';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'elderly'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    birthDate: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleStandardAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    // Simulate API Call
    setTimeout(() => {
      onLogin({
        id: crypto.randomUUID(),
        name: formData.email.split('@')[0],
        email: formData.email,
        type: 'standard'
      });
    }, 500);
  };

  const handleElderlyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.birthDate) {
      setError('Mohon isi Nama dan Tanggal Lahir');
      return;
    }

    // Direct login logic for Elderly
    setTimeout(() => {
      onLogin({
        id: crypto.randomUUID(),
        name: formData.fullName,
        birthDate: formData.birthDate,
        type: 'elderly'
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-sky-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4 rotate-3 transform transition-transform hover:rotate-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">MONETA</h1>
          <p className="text-slate-500 font-medium mt-1">Antibiotic Adherence Tracker</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

          {/* ELDERLY VIEW */}
          {view === 'elderly' ? (
            <form onSubmit={handleElderlyAuth} className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-slate-800">Mode Lansia</h2>
                <p className="text-sm text-slate-500">Masuk mudah tanpa password</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-lg"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-lg"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

              <AppButton type="submit" fullWidth className="py-4 text-lg bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30">
                Masuk Sekarang
              </AppButton>

              <button
                type="button"
                onClick={() => { setView('login'); setError(''); }}
                className="w-full text-center text-slate-400 text-sm hover:text-slate-600"
              >
                Kembali ke halaman utama
              </button>
            </form>
          ) : (

            /* STANDARD VIEW (Login/Register) */
            <form onSubmit={handleStandardAuth} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {view === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <AppButton type="submit" fullWidth>
                {view === 'login' ? 'Sign In' : 'Sign Up'}
              </AppButton>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue as</span></div>
              </div>

              {/* TOMBOL LANSIA */}
              <button
                type="button"
                onClick={() => { setView('elderly'); setError(''); }}
                className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Saya Lansia
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView(view === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-sm text-slate-400 hover:text-sky-500 transition-colors"
                >
                  {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* DEV MODE LINK REMOVED - Admin accessed via /admin URL */}

        <p className="text-center text-xs text-slate-300 mt-2">v1.0.0 • Secure Health Data</p>
      </div>
    </div>
  );
};