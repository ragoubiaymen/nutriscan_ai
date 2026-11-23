import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import AdminView from './components/AdminView';
import ScannerModal from './components/ScannerModal';
import OnboardingModal from './components/OnboardingModal';
import SettingsModal from './components/SettingsModal';
import { api } from './services/api';
import { BookOpen, BarChart3, Database, Activity, Camera } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'history' | 'ciqual' | 'admin'

  // Données serveur
  const [goal, setGoal] = useState(null);
  const [meals, setMeals] = useState([]);
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerSlot, setScannerSlot] = useState('lunch');
  const [scannerInitialImage, setScannerInitialImage] = useState(null);
  const [scannerInitialComment, setScannerInitialComment] = useState('');

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  // Toast simple
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setHasGeminiKey(Boolean(localStorage.getItem('nutrivision_gemini_key')));
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchDayMeals(currentDate);
  }, [currentDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const prof = await api.getProfile();
      setGoal(prof.goal);
      await fetchDayMeals(currentDate);
    } catch (err) {
      console.warn("Connexion API initiale :", err);
      // Fallback local par défaut
      setGoal({
        target_calories: 2065,
        target_protein: 150,
        target_carbs: 230,
        target_fat: 57,
        target_fiber: 28
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDayMeals = async (dateStr) => {
    try {
      const res = await api.getMeals(dateStr);
      setMeals(res.meals || []);
      setDailyLog(res.dailyLog || null);
    } catch (err) {
      console.warn("Échec chargement repas :", err);
    }
  };

  const handleOpenScanner = (slot = 'lunch', image = null, comment = '') => {
    setScannerSlot(slot);
    setScannerInitialImage(image);
    setScannerInitialComment(comment);
    setIsScannerOpen(true);
  };

  const handleMealSaved = (savedEntry) => {
    showToast(`Repas "${savedEntry.title}" validé et ajouté au journal ! 🎉`);
    fetchDayMeals(currentDate);
  };

  const handleDeleteMeal = async (mealId) => {
    if (confirm("Supprimer cet aliment du journal ?")) {
      await api.deleteMeal(mealId);
      showToast("Aliment supprimé du journal.");
      fetchDayMeals(currentDate);
    }
  };

  const handleAddWater = async (dateStr, amount) => {
    await api.updateWater(dateStr, amount);
    fetchDayMeals(dateStr);
    showToast(`+${amount}ml d'eau enregistrés ! 💧`);
  };

  const handleLogWeight = async (dateStr, weightKg) => {
    await api.updateWeight(dateStr, weightKg);
    fetchDayMeals(dateStr);
    showToast(`Pesée de ${weightKg}kg enregistrée pour aujourd'hui ! ⚖️`);
  };

  const handleUpdateActivity = async (dateStr, burnedCalories) => {
    await api.updateActivity(dateStr, burnedCalories);
    fetchDayMeals(dateStr);
    showToast(`Dépense sportive de ${burnedCalories} kcal enregistrée ! 🔥`);
  };

  const handleGoalUpdated = (newGoal) => {
    setGoal(newGoal);
    showToast("Objectifs nutritionnels et cibles recalculés !");
    fetchDayMeals(currentDate);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl backdrop-blur-md animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={handleOpenScanner}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 lg:pb-8">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400">
            Initialisation de NutriVision AI PRO...
          </div>
        ) : (
          <>
            {activeTab === 'journal' && (
              <DashboardView
                goal={goal}
                meals={meals}
                dailyLog={dailyLog}
                currentDate={currentDate}
                onOpenScanner={handleOpenScanner}
                onDeleteMeal={handleDeleteMeal}
                onAddWater={handleAddWater}
                onLogWeight={handleLogWeight}
                onUpdateActivity={handleUpdateActivity}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
              />
            )}

            {activeTab === 'history' && <HistoryView />}

            {activeTab === 'ciqual' && <AdminView defaultTab="ciqual" />}

            {activeTab === 'admin' && <AdminView defaultTab="metrics" />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-white/10 backdrop-blur-lg flex items-center justify-around py-2 px-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === 'journal' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Graphiques</span>
        </button>

        {/* Floating Scan Button */}
        <button
          onClick={() => handleOpenScanner('lunch')}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-slate-950 transition active:scale-95"
          title="Scanner un repas"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('ciqual')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === 'ciqual' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Database className="w-4 h-4" />
          <span>CIQUAL</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Activity className="w-4 h-4" />
          <span>Supervision</span>
        </button>
      </div>

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        targetMealSlot={scannerSlot}
        currentDate={currentDate}
        initialImage={scannerInitialImage}
        initialComment={scannerInitialComment}
        onMealSaved={handleMealSaved}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentGoal={goal}
        onGoalUpdated={handleGoalUpdated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={(k) => setHasGeminiKey(Boolean(k))}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

    </div>
  );
}
