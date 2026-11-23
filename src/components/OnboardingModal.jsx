import React, { useState } from 'react';
import { Target, User, Activity, Flame, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function OnboardingModal({ isOpen, onClose, currentGoal, onGoalUpdated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    gender: currentGoal?.gender || 'male',
    age: currentGoal?.age || 28,
    weight: currentGoal?.weight || 75,
    height: currentGoal?.height || 178,
    activity: currentGoal?.activity || 1.375,
    goal: currentGoal?.goal || 'deficit_moderate',
    dietPreference: currentGoal?.diet_preference || 'balanced',
    targetCalories: currentGoal?.target_calories || 2065,
    targetProtein: currentGoal?.target_protein || 150,
    targetCarbs: currentGoal?.target_carbs || 230,
    targetFat: currentGoal?.target_fat || 57,
    targetFiber: currentGoal?.target_fiber || 29
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Recalcul automatique lorsque l'on arrive sur l'étape 4
  const computeTargets = async () => {
    setLoading(true);
    try {
      const res = await api.saveProfile(formData);
      if (res.goal) {
        setFormData(prev => ({
          ...prev,
          targetCalories: res.goal.target_calories,
          targetProtein: res.goal.target_protein,
          targetCarbs: res.goal.target_carbs,
          targetFat: res.goal.target_fat,
          targetFiber: res.goal.target_fiber
        }));
        if (onGoalUpdated) onGoalUpdated(res.goal);
      }
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.saveProfile({
        ...formData,
        customMacros: {
          targetCalories: Number(formData.targetCalories),
          protein: Number(formData.targetProtein),
          carbs: Number(formData.targetCarbs),
          fat: Number(formData.targetFat),
          fiber: Number(formData.targetFiber)
        }
      });
      if (onGoalUpdated) onGoalUpdated(res.goal);
      onClose();
    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Calculateur Métabolique & Cibles</h3>
              <p className="text-xs text-slate-400">Étape {step} sur 4 &bull; Formule scientifique Mifflin-St Jeor</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6">

          {/* STEP 1: Physiologie */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Vos Caractéristiques Physiologiques
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('gender', 'male')}
                  className={`p-3 rounded-xl border text-center font-medium text-sm transition ${
                    formData.gender === 'male' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  👨 Homme
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('gender', 'female')}
                  className={`p-3 rounded-xl border text-center font-medium text-sm transition ${
                    formData.gender === 'female' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  👩 Femme
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Âge (ans)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Taille (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Activité */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Niveau d'Activité Physique Hebdomadaire
              </h4>

              <div className="space-y-2">
                {[
                  { value: 1.2, label: 'Sédentaire', desc: 'Peu ou pas d’exercice, travail de bureau' },
                  { value: 1.375, label: 'Légèrement actif', desc: '1 à 3 séances de sport par semaine' },
                  { value: 1.55, label: 'Modérément actif', desc: '3 à 5 entraînements réguliers par semaine' },
                  { value: 1.725, label: 'Très actif', desc: '6 à 7 séances intenses par semaine' },
                  { value: 1.9, label: 'Athlète de haut niveau', desc: 'Entraînement biquotidien ou travail physique lourd' },
                ].map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleChange('activity', item.value)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      Number(formData.activity) === item.value
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    {Number(formData.activity) === item.value && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Objectif & Régime */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Objectif Nutritionnel & Préférences
              </h4>

              <div>
                <label className="text-xs text-slate-400 mb-2 block font-medium">Votre But Principal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: 'deficit_moderate', label: 'Perte de graisse modérée (-300 kcal)', tag: 'Recommandé' },
                    { value: 'deficit_aggressive', label: 'Perte rapide (-500 kcal)', tag: 'Sèche' },
                    { value: 'maintenance', label: 'Maintien & Recomposition', tag: 'Équilibre' },
                    { value: 'surplus_lean', label: 'Prise de masse propre (+250 kcal)', tag: 'Muscle' },
                    { value: 'surplus_heavy', label: 'Prise de masse (+500 kcal)', tag: 'Force' },
                  ].map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleChange('goal', item.value)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                        formData.goal === item.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">{item.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block font-medium">Régime Alimentaire</label>
                <select
                  value={formData.dietPreference}
                  onChange={(e) => handleChange('dietPreference', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="balanced">Équilibré Standard (45% Glucides, 25% Prot, 30% Lipides)</option>
                  <option value="high_protein">Hyper-protéiné / Musculation (2.2g/kg de protéines)</option>
                  <option value="keto">Cétogène / Low-Carb (65% Lipides, faible en glucides)</option>
                  <option value="vegetarian">Végétarien / Végétal</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Cibles Instantanées & Ajustement Manuel */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs text-slate-300 font-medium">Cible Journalière Calculée</span>
                <div className="text-3xl font-display font-extrabold text-white mt-1">
                  {formData.targetCalories} <span className="text-sm font-normal text-emerald-400">kcal / jour</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Métabolisme de base (BMR) : ~{Math.round(formData.targetCalories * 0.75)} kcal &bull; Dépense totale (TDEE) : ~{Math.round(formData.targetCalories * 1.15)} kcal
                </p>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Répartition des Macronutriments (Ajustables)
              </h4>

              <div className="space-y-3">
                {/* Protéines */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-orange-400 font-semibold">Protéines (P)</span>
                    <span className="text-white font-mono font-bold">{formData.targetProtein}g ({formData.targetProtein * 4} kcal)</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="280"
                    step="5"
                    value={formData.targetProtein}
                    onChange={(e) => handleChange('targetProtein', Number(e.target.value))}
                    className="w-full accent-orange-400"
                  />
                </div>

                {/* Glucides */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-400 font-semibold">Glucides (G)</span>
                    <span className="text-white font-mono font-bold">{formData.targetCarbs}g ({formData.targetCarbs * 4} kcal)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="450"
                    step="5"
                    value={formData.targetCarbs}
                    onChange={(e) => handleChange('targetCarbs', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Lipides */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-semibold">Lipides (L)</span>
                    <span className="text-white font-mono font-bold">{formData.targetFat}g ({formData.targetFat * 9} kcal)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="2"
                    value={formData.targetFat}
                    onChange={(e) => handleChange('targetFat', Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                {/* Fibres */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-semibold">Fibres recommandées</span>
                    <span className="text-white font-mono font-bold">{formData.targetFiber}g</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="1"
                    value={formData.targetFiber}
                    onChange={(e) => handleChange('targetFiber', Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          ) : <div />}

          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={computeTargets}
              disabled={loading}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="w-4 h-4" />
              Calculer mes cibles
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-4 h-4" />
              Valider mes Objectifs
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
