import React, { useState } from 'react';
import { Camera, Plus, Trash2, Droplets, Scale, UploadCloud, Sparkles, CheckCircle2, Flame, Activity } from 'lucide-react';

export default function DashboardView({
  goal,
  meals,
  dailyLog,
  currentDate,
  onOpenScanner,
  onDeleteMeal,
  onAddWater,
  onLogWeight,
  onUpdateActivity,
  onOpenOnboarding
}) {
  const [quickWeight, setQuickWeight] = useState('');
  const [quickActivity, setQuickActivity] = useState('');
  const [userCommentText, setUserCommentText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Calculs totaux de la journée
  const targetCals = goal?.target_calories || 2000;
  const targetProt = goal?.target_protein || 150;
  const targetCarb = goal?.target_carbs || 230;
  const targetFat = goal?.target_fat || 57;
  const targetFiber = goal?.target_fiber || 28;

  let totalConsumedCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFiber = 0;

  meals.forEach(m => {
    totalConsumedCals += Number(m.total_cals) || 0;
    totalProt += Number(m.total_protein) || 0;
    totalCarb += Number(m.total_carbs) || 0;
    totalFat += Number(m.total_fat) || 0;
    totalFiber += Number(m.total_fiber) || 0;
  });

  const burnedActiveCals = Number(dailyLog?.burned_active_calories) || 0;
  const remainingCals = targetCals - totalConsumedCals + burnedActiveCals;
  const pctConsumed = Math.min(100, Math.round((totalConsumedCals / (targetCals + burnedActiveCals)) * 100));

  // Créneaux de repas
  const mealSlots = [
    { id: 'breakfast', label: 'Petit-Déjeuner', icon: '☕', target: Math.round(targetCals * 0.25) },
    { id: 'lunch', label: 'Déjeuner', icon: '🥗', target: Math.round(targetCals * 0.35) },
    { id: 'dinner', label: 'Dîner', icon: '🍲', target: Math.round(targetCals * 0.30) },
    { id: 'snack', label: 'Collations & En-cas', icon: '🍎', target: Math.round(targetCals * 0.10) },
  ];

  // Gestion du Drag and Drop d'image
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      onOpenScanner('lunch', evt.target.result, userCommentText);
    };
    reader.readAsDataURL(file);
  };

  const submitWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(quickWeight);
    if (w > 0) {
      onLogWeight(currentDate, w);
      setQuickWeight('');
    }
  };

  const submitActivity = (e) => {
    e.preventDefault();
    const act = parseInt(quickActivity);
    if (!isNaN(act) && act >= 0 && onUpdateActivity) {
      onUpdateActivity(currentDate, act);
      setQuickActivity('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* TOP SECTION: BILAN CALORIQUE & MACROS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Jauge Principale des Calories Restantes */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bilan Énergétique du Jour</span>
            <button 
              onClick={onOpenOnboarding} 
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Recalculer objectif
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 my-2">
            <div>
              <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                {remainingCals.toLocaleString()}
                <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1.5">kcal restantes</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                <span className="text-emerald-400 font-semibold">{targetCals}</span> (Objectif) − <span className="text-rose-400 font-semibold">{totalConsumedCals}</span> (Consommé) + <span className="text-amber-400 font-semibold">{burnedActiveCals}</span> (Activité) = <span className="text-white font-bold">{remainingCals}</span>
              </p>
            </div>

            {/* Jauge SVG Circulaire */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={remainingCals < 0 ? '#f43f5e' : '#10b981'}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (Math.min(100, pctConsumed) / 100) * 251.2}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs sm:text-sm font-bold font-mono text-white">{pctConsumed}%</span>
                <span className="text-[9px] text-slate-400">atteint</span>
              </div>
            </div>
          </div>

          {/* Micro badges d'état */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Objectif : {targetCals} kcal
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Consommé : {totalConsumedCals} kcal
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Activité : +{burnedActiveCals} kcal
            </span>
          </div>
        </div>

        {/* 4 Barres de Progression des Macronutriments */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Macronutriments & Fibres</span>
            <span className="text-[11px] text-slate-400 font-mono">Consommé / Cible</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Protéines */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-orange-400 flex items-center gap-1">🍗 Protéines</span>
                <span className="font-mono text-white font-bold">{Math.round(totalProt)} / {targetProt}g</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalProt / targetProt) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{Math.round((totalProt / targetProt) * 100)}% de la cible</span>
                <span>{Math.round(totalProt * 4)} kcal</span>
              </div>
            </div>

            {/* Glucides */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1">🍚 Glucides</span>
                <span className="font-mono text-white font-bold">{Math.round(totalCarb)} / {targetCarb}g</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalCarb / targetCarb) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{Math.round((totalCarb / targetCarb) * 100)}% de la cible</span>
                <span>{Math.round(totalCarb * 4)} kcal</span>
              </div>
            </div>

            {/* Lipides */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">🥑 Lipides</span>
                <span className="font-mono text-white font-bold">{Math.round(totalFat)} / {targetFat}g</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalFat / targetFat) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{Math.round((totalFat / targetFat) * 100)}% de la cible</span>
                <span>{Math.round(totalFat * 9)} kcal</span>
              </div>
            </div>

            {/* Fibres */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1">🥦 Fibres</span>
                <span className="font-mono text-white font-bold">{Math.round(totalFiber)} / {targetFiber}g</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((totalFiber / targetFiber) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{Math.round((totalFiber / targetFiber) * 100)}% de l'apport santé</span>
                <span>{totalFiber >= targetFiber ? 'Optimal' : 'À compléter'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CENTER SECTION: ZONE DE CAPTURE DRAG & DROP AVEC PRÉCISION TEXTUELLE */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Scanner & Analyser un Repas</h3>
              <p className="text-xs text-slate-400">Glissez-déposez une photo ou utilisez la caméra de votre téléphone</p>
            </div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
            dragActive 
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]' 
              : 'border-white/10 hover:border-emerald-500/40 bg-slate-900/40'
          }`}
          onClick={() => document.getElementById('dashboard-file-input').click()}
        >
          <input
            id="dashboard-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Déposez la photo de votre plat ici ou cliquez pour choisir
          </span>
          <span className="text-xs text-slate-400 mt-0.5">
            Formats acceptés : JPG, PNG, WEBP &bull; Compression automatique &lt; 1 Mo
          </span>
        </div>

        {/* Champ optionnel de précision textuelle (ex: avec huile d'olive) */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={userCommentText}
              onChange={(e) => setUserCommentText(e.target.value)}
              placeholder="Précision optionnelle pour l'IA (ex: avec 1 c. à soupe d'huile d'olive, sans sel, au four...)"
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => onOpenScanner('lunch', null, userCommentText)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Camera className="w-4 h-4" />
            Ouvrir la Caméra
          </button>
        </div>
      </div>

      {/* TRACKERS SECONDAIRES: EAU, ACTIVITÉ & POIDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tracker d'eau */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Hydratation du Jour</span>
              <div className="text-lg font-bold font-mono text-white">
                {dailyLog?.water_ml || 0} <span className="text-xs font-normal text-slate-400">/ 2500 ml</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddWater(currentDate, (dailyLog?.water_ml || 0) + 250)}
              className="text-xs font-bold px-2.5 py-1.5 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-white/5 rounded-lg transition"
            >
              +250ml
            </button>
            <button
              onClick={() => onAddWater(currentDate, (dailyLog?.water_ml || 0) + 500)}
              className="text-xs font-bold px-2.5 py-1.5 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-white/5 rounded-lg transition"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Tracker Activité & Dépense Sportive (+ kcal) */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Activité / Sport</span>
              <div className="text-lg font-bold font-mono text-white">
                +{burnedActiveCals} <span className="text-xs font-normal text-slate-400">kcal</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateActivity && onUpdateActivity(currentDate, burnedActiveCals + 150)}
              className="text-[11px] font-bold px-2 py-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-white/5 rounded-lg transition"
              title="Ajouter 150 kcal"
            >
              +150
            </button>
            <button
              onClick={() => onUpdateActivity && onUpdateActivity(currentDate, burnedActiveCals + 300)}
              className="text-[11px] font-bold px-2 py-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-white/5 rounded-lg transition"
              title="Ajouter 300 kcal"
            >
              +300
            </button>
            <form onSubmit={submitActivity} className="flex items-center">
              <input
                type="number"
                value={quickActivity}
                onChange={(e) => setQuickActivity(e.target.value)}
                placeholder="kcal"
                className="w-14 bg-slate-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-amber-500"
              />
            </form>
          </div>
        </div>

        {/* Tracker de poids */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Pesée Journalière</span>
              <div className="text-lg font-bold font-mono text-white">
                {dailyLog?.weight_kg ? `${dailyLog.weight_kg} kg` : 'Non renseigné'}
              </div>
            </div>
          </div>
          <form onSubmit={submitWeight} className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              placeholder="ex: 74.8"
              className="w-20 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="text-xs font-bold px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition"
            >
              Valider
            </button>
          </form>
        </div>

      </div>

      {/* BOTTOM SECTION: REPAS GROUPÉS PAR CRÉNEAU */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <span>Journal Alimentaire du Jour</span>
          <span className="text-xs font-mono text-slate-400 font-normal">({meals.length} repas saisis)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSlots.map(slot => {
            const slotMeals = meals.filter(m => m.meal_type === slot.id);
            const slotCals = slotMeals.reduce((acc, m) => acc + m.total_cals, 0);

            return (
              <div key={slot.id} className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                
                {/* Header du créneau */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{slot.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{slot.label}</h4>
                      <span className="text-[11px] text-slate-400">Cible indicative : ~{slot.target} kcal</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-emerald-400">{slotCals} kcal</div>
                    <button
                      onClick={() => onOpenScanner(slot.id)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 mt-0.5"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" /> Ajouter
                    </button>
                  </div>
                </div>

                {/* Liste des repas dans ce créneau */}
                {slotMeals.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    Aucun aliment enregistré pour ce moment.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slotMeals.map(meal => (
                      <div key={meal.id} className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {meal.photo_url ? (
                            <img src={meal.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-base shrink-0">
                              🍽️
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-slate-200 truncate">{meal.title}</h5>
                            <p className="text-[10px] text-slate-400">
                              {meal.total_weight}g &bull; P: {meal.total_protein}g | G: {meal.total_carbs}g | L: {meal.total_fat}g
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-white">{meal.total_cals} kcal</span>
                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
