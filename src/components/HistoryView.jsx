import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Calendar, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';

export default function HistoryView() {
  const [period, setPeriod] = useState(30);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const weightCanvasRef = useRef(null);
  const calorieCanvasRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [period]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(period);
      setHistoryData(data);
    } catch (err) {
      console.error("Erreur historique:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyData && !loading) {
      drawWeightChart();
      drawCalorieChart();
    }
  }, [historyData, loading]);

  // Dessin graphique de poids
  const drawWeightChart = () => {
    const canvas = weightCanvasRef.current;
    if (!canvas || !historyData) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = 220;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const weights = historyData.weights;
    const dates = historyData.dates;
    const validPoints = [];

    weights.forEach((w, idx) => {
      if (w !== null && w > 0) validPoints.push({ val: w, idx });
    });

    if (validPoints.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Aucune pesée enregistrée pour cette période.', width / 2, height / 2);
      return;
    }

    const minW = Math.min(...validPoints.map(p => p.val)) - 1;
    const maxW = Math.max(...validPoints.map(p => p.val)) + 1;
    const padding = 35;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Ligne de tendance
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    validPoints.forEach((p, i) => {
      const x = padding + (p.idx / (dates.length - 1)) * chartW;
      const y = height - padding - ((p.val - minW) / (maxW - minW)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    validPoints.forEach(p => {
      const x = padding + (p.idx / (dates.length - 1)) * chartW;
      const y = height - padding - ((p.val - minW) / (maxW - minW)) * chartH;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.val}kg`, x, y - 8);
    });
  };

  // Dessin graphique de calories
  const drawCalorieChart = () => {
    const canvas = calorieCanvasRef.current;
    if (!canvas || !historyData) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = 220;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const cals = historyData.calories;
    const targets = historyData.targetCalories;
    const dates = historyData.dates;
    const padding = 30;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const maxCal = Math.max(2600, ...cals, ...targets);

    const barW = Math.max(3, chartW / dates.length - 4);

    cals.forEach((c, idx) => {
      const x = padding + idx * (barW + 4);
      const h = (c / maxCal) * chartH;
      const y = height - padding - h;

      ctx.fillStyle = c > 0 ? (c <= targets[idx] + 100 ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, c > 0 ? y : height - padding - 4, barW, c > 0 ? h : 4);
    });

    // Ligne cible
    const targetY = height - padding - (targets[0] / maxCal) * chartH;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, targetY);
    ctx.lineTo(width - padding, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header & Sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Historique & Tendances Métaboliques
          </h2>
          <p className="text-xs text-slate-400">Évolution de la masse corporelle, régularité calorique et galerie des repas</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
          {[7, 30, 90].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                period === p 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p} jours
            </button>
          ))}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Courbe de poids */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Évolution du Poids</span>
              <span className="text-[11px] text-emerald-400 font-mono font-normal">({period} derniers jours)</span>
            </h3>
          </div>
          <div className="w-full overflow-hidden">
            <canvas ref={weightCanvasRef} className="w-full block" />
          </div>
        </div>

        {/* Régularité calorique */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Régularité des Calories Journalières</span>
              <span className="text-[11px] text-cyan-400 font-mono font-normal">(-- Cible)</span>
            </h3>
          </div>
          <div className="w-full overflow-hidden">
            <canvas ref={calorieCanvasRef} className="w-full block" />
          </div>
        </div>

      </div>

      {/* Galerie Visuelle des Repas */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          Galerie Visuelle des Repas Scannés
        </h3>

        {historyData?.mealsGallery?.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-xs text-slate-500">
            Aucun repas avec photo scannée enregistré pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {historyData?.mealsGallery?.map(meal => (
              <div key={meal.id} className="glass-card rounded-xl overflow-hidden border border-white/10 group">
                <div className="aspect-square relative overflow-hidden bg-slate-900">
                  <img src={meal.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <span className="absolute bottom-1.5 right-1.5 bg-slate-950/80 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white border border-white/10">
                    {meal.total_cals} kcal
                  </span>
                </div>
                <div className="p-2">
                  <h5 className="text-[11px] font-bold text-white truncate">{meal.title}</h5>
                  <span className="text-[10px] text-slate-400">{meal.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
