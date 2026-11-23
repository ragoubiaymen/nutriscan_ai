import React from 'react';
import { Camera, Calendar, ChevronLeft, ChevronRight, Settings, Sparkles, Activity, Database, BarChart3, BookOpen } from 'lucide-react';

export default function Header({ 
  currentDate, 
  onDateChange, 
  activeTab, 
  setActiveTab, 
  onOpenScanner, 
  onOpenSettings,
  hasGeminiKey 
}) {
  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formattedDate = () => {
    if (isToday) return "Aujourd'hui";
    const d = new Date(currentDate);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const tabs = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'history', label: 'Historique & Poids', icon: BarChart3 },
    { id: 'ciqual', label: 'Catalogue CIQUAL', icon: Database },
    { id: 'admin', label: 'Supervision IA', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base tracking-tight text-white">NutriVision</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400">Calculateur Nutritionnel & VLM CIQUAL</p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 shadow-inner">
          <button 
            onClick={handlePrevDay} 
            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition"
            title="Jour précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-200 min-w-[105px] justify-center">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedDate()}</span>
          </div>

          <button 
            onClick={handleNextDay} 
            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition"
            title="Jour suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 border border-white/5 p-1 rounded-xl">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Scanner Action */}
          <button
            onClick={() => onOpenScanner('lunch')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scanner un repas</span>
            <span className="sm:hidden">Scanner</span>
          </button>

          {/* Engine indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-900/80 border border-white/10 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-cyan-400'}`} />
            <span>{hasGeminiKey ? 'Gemini VLM' : 'CIQUAL Vision'}</span>
          </div>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition border border-white/5"
            title="Paramètres & Clé API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
