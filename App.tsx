import React, { useState, useEffect } from 'react';
import { Drug, Dose, DrugQRCodeData, User } from './types';
import { generateSchedule, calculateCompliance, getRemainingDays } from './services/schedulerService';
import { requestNotificationPermission, sendLocalNotification } from './services/notificationService';
import { dataService } from './services/dataService';
import { QRScanner } from './components/QRScanner';
import { AppButton } from './components/AppButton';
import { DoseCard } from './components/DoseCard';
import { ComplianceChart } from './components/ComplianceChart';
import { EducationModal } from './components/EducationModal';
import { EducationView } from './components/EducationView';
import { AuthScreen } from './components/AuthScreen';

type Tab = 'dashboard' | 'schedule' | 'education' | 'profile';

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [scheduleView, setScheduleView] = useState<'upcoming' | 'history'>('upcoming');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<DrugQRCodeData | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // Modal State
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [medications, setMedications] = useState<Drug[]>([]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialization & Data Loading
  useEffect(() => {
    const initApp = async () => {
      try {
        const [loadedUser, loadedMeds, loadedDoses] = await Promise.all([
          dataService.getUser(),
          dataService.getMedications(),
          dataService.getDoses()
        ]);

        if (loadedUser) setUser(loadedUser);
        if (loadedMeds) setMedications(loadedMeds);
        if (loadedDoses) setDoses(loadedDoses);

        if ('Notification' in window) {
          setNotifPermission(Notification.permission);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });

      // Listen for messages from SW (Action Buttons)
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'MARK_TAKEN') {
          const doseId = event.data.payload?.doseId;
          if (doseId) {
            handleTakeDose(doseId);
            // Optional: Show toast
            alert("Dose marked as taken from notification!");
          }
        }
      });
    }
  }, []);

  // Persistence (Saving Data)
  useEffect(() => {
    if (!loading) {
      dataService.saveMedications(medications);
    }
  }, [medications, loading]);

  useEffect(() => {
    if (!loading) {
      dataService.saveDoses(doses);
    }
  }, [doses, loading]);

  useEffect(() => {
    if (!loading) {
      dataService.saveUser(user);
    }
  }, [user, loading]);

  // --- Real-time Monitor ---
  useEffect(() => {
    if (!user) return; // Only monitor if logged in

    const monitorSchedule = () => {
      const now = new Date();

      setDoses(prevDoses => {
        let changed = false;
        const newDoses = prevDoses.map(dose => {
          if (dose.status !== 'pending') return dose;

          const doseTime = new Date(dose.scheduledTime);
          const diffMins = (now.getTime() - doseTime.getTime()) / (1000 * 60);

          if (diffMins >= 0 && diffMins < 60 && !dose.notificationSent) {
            sendLocalNotification(
              `Time to take ${dose.drugName}`,
              `Dose ${dose.pillNumber} is due now. Keep your streak!`,
              { doseId: dose.id }
            );
            changed = true;
            return { ...dose, notificationSent: true };
          }

          if (diffMins >= 60) {
            changed = true;
            if (!dose.notificationSent) {
              sendLocalNotification(`Missed Dose: ${dose.drugName}`, `Please check your schedule.`);
            }
            return { ...dose, status: 'missed' as const, notificationSent: true };
          }

          return dose;
        });
        return changed ? newDoses : prevDoses;
      });
    };

    const interval = setInterval(monitorSchedule, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setShowLogoutConfirm(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifPermission('granted');
      sendLocalNotification("MONETA", "Notifications are enabled!");
    } else {
      setNotifPermission('denied');
    }
  };

  const handleScan = (data: DrugQRCodeData) => {
    // Unique QR Validation
    const isDuplicate = medications.some(med => med.serial_number === data.serial_number);
    if (isDuplicate) {
      alert("This specific medication box has already been added to your schedule.");
      return;
    }

    setScannedData(data);
    setShowScanner(false);
    setShowEducationModal(true);
  };

  const handleEducationConfirmed = () => {
    setShowEducationModal(false);
    setShowConfirm(true);
  };

  const handleEducationCanceled = () => {
    setShowEducationModal(false);
    setScannedData(null);
  };

  const confirmSchedule = (startNow: boolean) => {
    if (!scannedData) return;

    const startTime = new Date();
    if (!startNow) {
      startTime.setMinutes(0, 0, 0);
      startTime.setHours(startTime.getHours() + 1);
    }

    const newDrugId = crypto.randomUUID();
    const newDrug: Drug = {
      ...scannedData,
      id: newDrugId,
      startDate: startTime.toISOString(),
      isActive: true
    };

    const newDoses = generateSchedule(scannedData, newDrugId, startTime);

    setMedications(prev => [...prev, newDrug]);
    setDoses(prev => [...prev, ...newDoses]);
    setShowConfirm(false);
    setScannedData(null);
    setActiveTab('dashboard');

    if (notifPermission === 'default') {
      handleEnableNotifications();
    }
  };

  const handleTakeDose = (doseId: string) => {
    setDoses(prev => prev.map(d => {
      if (d.id === doseId) {
        return {
          ...d,
          status: 'taken',
          takenTime: new Date().toISOString()
        };
      }
      return d;
    }));
  };

  const resetData = async () => {
    if (confirm("Are you sure you want to delete all health data? This cannot be undone.")) {
      await dataService.clearAllData();
      setMedications([]);
      setDoses([]);
    }
  };

  // Computed Views
  const sortedDoses = [...doses].sort((a, b) =>
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  const pendingDoses = sortedDoses.filter(d => d.status === 'pending');
  const nextDose = pendingDoses.length > 0 ? pendingDoses[0] : null;
  const historyDoses = sortedDoses.filter(d => d.status !== 'pending').reverse();

  const complianceScore = calculateCompliance(doses);
  const remainingDays = getRemainingDays(doses);
  const activeMed = medications.find(m => m.isActive);

  // --- RENDER LOGIC ---

  // 1. Auth Guard
  if (!user && !loading) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 2. Full Screen Overlays (Scanner, Education, Confirm, Logout)
  if (showScanner) {
    return <QRScanner onScan={handleScan} onCancel={() => setShowScanner(false)} />;
  }

  if (showEducationModal && scannedData) {
    return (
      <EducationModal
        data={scannedData}
        onConfirm={handleEducationConfirmed}
        onCancel={handleEducationCanceled}
      />
    );
  }

  if (showConfirm && scannedData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 mx-auto text-sky-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 0 0 5 2h14a.3.3 0 0 0 .2.3l-3.6 5a.3.3 0 0 0 0 .4L19 22a.3.3 0 0 1-.3.3H5.3a.3.3 0 0 1-.3-.3l3.4-14.3a.3.3 0 0 0 0-.4L4.8 2.3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Medication Found</h2>
          <p className="text-center text-slate-500 mb-6">Confirm details to generate schedule</p>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Name</span>
              <span className="font-bold text-slate-800">{scannedData.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Dosage</span>
              <span className="font-medium text-slate-800">{scannedData.dosage}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Frequency</span>
              <span className="font-medium text-slate-800">{scannedData.frequency_per_day}x Daily</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Batch ID</span>
              <span className="font-mono text-xs font-bold text-slate-500 py-1 bg-slate-100 px-2 rounded">{scannedData.serial_number}</span>
            </div>
          </div>

          <div className="space-y-3">
            <AppButton onClick={() => confirmSchedule(true)} fullWidth>Start Now</AppButton>
            <AppButton onClick={() => confirmSchedule(false)} variant="secondary" fullWidth>Start Later (1 Hour)</AppButton>
            <AppButton onClick={() => setShowConfirm(false)} variant="secondary" className="text-red-500" fullWidth>Cancel</AppButton>
          </div>
        </div>
      </div>
    );
  }

  // Logout Confirmation Modal
  if (showLogoutConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Sign Out?</h2>
          <p className="text-center text-slate-500 mb-6">
            Your health data will be saved on this device.
          </p>
          <div className="space-y-3">
            <AppButton onClick={confirmLogout} variant="danger" fullWidth>Sign Out</AppButton>
            <AppButton onClick={() => setShowLogoutConfirm(false)} variant="secondary" fullWidth>Cancel</AppButton>
          </div>
        </div>
      </div>
    );
  }

  // 3. FORCE SETUP VIEW
  if (medications.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in">
        <div className="w-full max-w-sm text-center">

          <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto flex items-center justify-center mb-6 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Setup Treatment</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Welcome, <span className="font-bold text-slate-700">{user?.name.split(' ')[0]}</span>. To begin tracking your antibiotic adherence, you must scan the QR code on your medication packaging.
          </p>

          <div className="space-y-4">
            <AppButton onClick={() => setShowScanner(true)} fullWidth className="py-4 text-lg shadow-xl shadow-sky-500/20">
              Scan QR Code
            </AppButton>

            <button
              onClick={handleLogoutClick}
              className="text-sm text-slate-400 font-medium hover:text-red-500 transition-colors py-2"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-12 text-xs text-slate-300 uppercase tracking-widest font-bold">MONETA System</p>
        </div>
      </div>
    );
  }

  // 4. MAIN DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MONETA</h1>
          <p className="text-xs text-slate-400 font-medium">Hello, {user?.name.split(' ')[0]}</p>
        </div>
        <button onClick={() => setShowScanner(true)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-sky-50 hover:text-sky-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
        </button>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">

        {/* Enable Notification Banner */}
        {notifPermission !== 'granted' && 'Notification' in window && (
          <div className="bg-blue-600 rounded-xl p-4 text-white flex items-center justify-between shadow-lg shadow-blue-500/30">
            <div>
              <p className="font-bold text-sm">Enable Reminders</p>
              <p className="text-xs text-blue-100 opacity-80">Get notified when it's time.</p>
            </div>
            <button onClick={handleEnableNotifications} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50">Enable</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-slate-500 text-sm font-medium mb-1">Current Progress</h2>
                <p className="text-3xl font-bold text-slate-800 mb-1">{activeMed?.name}</p>
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs font-bold">{remainingDays} days left</span>
                  <span className="text-xs text-slate-400">{doses.filter(d => d.status === 'taken').length}/{doses.length} doses</span>
                </div>
              </div>
              <ComplianceChart percentage={complianceScore} />
            </div>

            {nextDose ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-700">Next Scheduled Dose</h3>
                  <span className="text-xs font-medium text-sky-500 bg-sky-50 px-2 py-1 rounded-md">Priority</span>
                </div>
                <DoseCard dose={nextDose} onTake={handleTakeDose} isNext={true} />
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <p className="font-bold text-green-800">All caught up!</p>
                  <p className="text-xs text-green-700">Great job.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button onClick={() => setScheduleView('upcoming')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${scheduleView === 'upcoming' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}>Upcoming</button>
              <button onClick={() => setScheduleView('history')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${scheduleView === 'history' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}>History</button>
            </div>
            <div className="space-y-3">
              {(scheduleView === 'upcoming' ? pendingDoses : historyDoses).map(dose => (
                <DoseCard key={dose.id} dose={dose} onTake={handleTakeDose} />
              ))}
              {(scheduleView === 'upcoming' ? pendingDoses : historyDoses).length === 0 && (
                <div className="text-center py-12 text-slate-400">No {scheduleView} doses.</div>
              )}
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && <EducationView />}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-300">
                {user?.name.charAt(0)}
              </div>
              <h2 className="font-bold text-xl text-slate-800">{user?.name}</h2>
              <p className="text-slate-400 text-sm">
                {user?.type === 'elderly' ? `Born: ${user?.birthDate}` : user?.email}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${user?.type === 'elderly' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {user?.type === 'elderly' ? 'Elderly Mode' : 'Standard Account'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Notifications</span>
                  <button onClick={handleEnableNotifications} className={`w-10 h-6 rounded-full relative transition-colors ${notifPermission === 'granted' ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifPermission === 'granted' ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <AppButton onClick={resetData} variant="secondary" fullWidth className="text-red-500 border-red-100">Delete Health Data</AppButton>
            <AppButton onClick={handleLogoutClick} variant="danger" fullWidth>Sign Out</AppButton>
          </div>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-30 max-w-md mx-auto">
        {['dashboard', 'schedule', 'education', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex flex-col items-center gap-1 ${activeTab === tab ? 'text-sky-500' : 'text-slate-400'}`}
          >
            {/* Simple Icons based on Tab Name */}
            {tab === 'dashboard' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
            {tab === 'schedule' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
            {tab === 'education' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>}
            {tab === 'profile' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
            <span className="text-[10px] font-medium capitalize">{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};