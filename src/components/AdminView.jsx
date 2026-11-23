import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Clock, CheckCircle2, Search, Filter, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AdminView() {
  const [metrics, setMetrics] = useState(null);
  const [ciqualList, setCiqualList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [met, foods] = await Promise.all([
        api.getAdminMetrics(),
        api.searchCiqual('')
      ]);
      setMetrics(met);
      setCiqualList(foods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    const results = await api.searchCiqual(term);
    setCiqualList(results);
  };

  const filteredFoods = categoryFilter === 'ALL'
    ? ciqualList
    : ciqualList.filter(f => f.category === categoryFilter);

  const categories = ['ALL', 'Viandes', 'Poissons', 'Œufs', 'Féculents', 'Légumineuses', 'Légumes', 'Fruits', 'Laitages', 'Fromages', 'Matières Grasses', 'Plats Préparés'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Supervision IA & Référentiel Nutritionnel CIQUAL
        </h2>
        <p className="text-xs text-slate-400">Suivi des quotas VLM, latence moyenne, boucle d'apprentissage et catalogue</p>
      </div>

      {/* 4 Cartes KPI Métriques IA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Appels VLM Effectués</span>
            <div className="text-2xl font-bold font-mono text-white">
              {metrics?.totalScans || 0} <span className="text-xs font-normal text-slate-400">scans</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Latence Moyenne</span>
            <div className="text-2xl font-bold font-mono text-white">
              {metrics?.avgLatencyMs || 850} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Tokens & Coût Estimé</span>
            <div className="text-xl font-bold font-mono text-white">
              {(metrics?.estimatedQuotaUsed || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">tok</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">≈ {metrics?.estimatedCostUsd || '0.0000'} $</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Catalogue CIQUAL</span>
            <div className="text-2xl font-bold font-mono text-white">
              {metrics?.totalCiqualFoods || 120} <span className="text-xs font-normal text-slate-400">items</span>
            </div>
          </div>
        </div>

      </div>

      {/* Boucle d'Amélioration & Logs de Feedback IA */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Boucle de Rétroaction IA (Human-in-the-Loop)</h3>
              <p className="text-xs text-slate-400">Analyse des écarts entre les propositions du modèle et les validations utilisateur</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {metrics?.feedbackSummary?.totalLogs || 0} corrections enregistrées
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400">Aliments Modifiés (Grammes)</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {metrics?.feedbackSummary?.actionsCount?.item_modified || 0}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400">Aliments Supprimés (Erreurs VLM)</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {metrics?.feedbackSummary?.actionsCount?.item_deleted || 0}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400">Aliments Ajoutés Manuellement</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {metrics?.feedbackSummary?.actionsCount?.item_added || 0}
            </div>
          </div>
        </div>

        {/* Top Aliments Corrigés */}
        {metrics?.feedbackSummary?.topCorrections?.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-300 block mb-2">Aliments les plus fréquemment corrigés :</span>
            <div className="flex flex-wrap gap-2">
              {metrics.feedbackSummary.topCorrections.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <span>{item.name}</span>
                  <span className="bg-white/10 px-1.5 py-0.2 rounded text-[10px] text-emerald-400 font-bold">{item.count}×</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catalogue & Référentiel CIQUAL */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-display">Référentiel Nutritionnel CIQUAL France</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Recherche */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Filtrer un aliment..."
                className="bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-48"
              />
            </div>

            {/* Filtre catégorie */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'Toutes catégories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau CIQUAL */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Nom de l'Aliment</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3 text-right">Calories / 100g</th>
                <th className="p-3 text-right">Protéines</th>
                <th className="p-3 text-right">Glucides</th>
                <th className="p-3 text-right">Lipides</th>
                <th className="p-3 text-right">Fibres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredFoods.map(item => (
                <tr key={item.code} className="hover:bg-white/5 transition">
                  <td className="p-3 text-slate-500 font-bold">{item.code}</td>
                  <td className="p-3 font-sans font-semibold text-white">{item.name}</td>
                  <td className="p-3 font-sans text-slate-400">{item.category}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{item.calories} kcal</td>
                  <td className="p-3 text-right text-orange-400">{item.protein}g</td>
                  <td className="p-3 text-right text-cyan-400">{item.carbs}g</td>
                  <td className="p-3 text-right text-amber-400">{item.fat}g</td>
                  <td className="p-3 text-right text-emerald-300">{item.fiber}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
