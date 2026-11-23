import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onKeySaved, onOpenOnboarding }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('nutrivision_gemini_key') || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: 'Veuillez renseigner une clé API.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
      if (res.ok) {
        setTestResult({ ok: true, message: '✅ Clé Google Gemini valide et connectée avec succès !' });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({ ok: false, message: `❌ Échec : ${err.error?.message || res.statusText}` });
      }
    } catch (e) {
      setTestResult({ ok: false, message: '❌ Impossible de joindre Google Gemini (vérifiez votre connexion).' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem('nutrivision_gemini_key', cleanKey);
    } else {
      localStorage.removeItem('nutrivision_gemini_key');
    }
    if (onKeySaved) onKeySaved(cleanKey);
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('nutrivision_gemini_key');
    if (onKeySaved) onKeySaved('');
    setTestResult({ ok: true, message: 'Clé effacée. Moteur CIQUAL Local réactivé.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-white/10 p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Paramètres & Clé IA</h3>
              <p className="text-[11px] text-slate-400">Configuration du modèle VLM</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Moteur Actif */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 block">Moteur d'analyse actif :</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-cyan-400'}`} />
            <span className="text-xs font-bold text-white">
              {apiKey ? 'Google Gemini 2.0 / 1.5 Flash (VLM Cloud)' : 'Moteur Vision Optique & CIQUAL Local (Sans clé)'}
            </span>
          </div>
        </div>

        {/* Input Clé Gemini */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Clé API Google Gemini (Optionnelle - 100% Gratuite)</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Obtenir en 30s &rarr;
            </a>
          </label>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Collez votre clé : AIzaSy..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing}
              className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition border border-white/5 flex items-center justify-center gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              Tester la Clé
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition border border-white/5"
            >
              Effacer
            </button>
          </div>

          {testResult && (
            <p className={`text-xs mt-1.5 p-2 rounded-lg ${testResult.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {testResult.message}
            </p>
          )}
        </div>

        {/* Profil Métabolique Shortcut */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => { onClose(); onOpenOnboarding(); }}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition border border-white/5 text-center"
          >
            ⚙️ Modifier mes données physiologiques & objectifs BMR
          </button>
        </div>

        {/* Sauvegarde */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition"
        >
          Enregistrer les Paramètres
        </button>

      </div>
    </div>
  );
}
