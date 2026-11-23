import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, X, Plus, Trash2, Check, Sparkles, AlertCircle, RefreshCw, ChevronDown, Search } from 'lucide-react';
import { api } from '../services/api';

export default function ScannerModal({
  isOpen,
  onClose,
  targetMealSlot = 'lunch',
  currentDate,
  initialImage = null,
  initialComment = '',
  onMealSaved
}) {
  const [step, setStep] = useState('capture'); // 'capture' | 'analyzing' | 'validation'
  const [selectedSlot, setSelectedSlot] = useState(targetMealSlot);
  const [userComment, setUserComment] = useState(initialComment);
  const [imageSrc, setImageSrc] = useState(null);
  
  // États de l'analyse
  const [analyzingStatus, setAnalyzingStatus] = useState('Détection multi-objets des composants...');
  const [scanResult, setScanResult] = useState(null);
  const [initialAiItems, setInitialAiItems] = useState([]); // Pour la détection des écarts (feedback loop)
  const [activeItems, setActiveItems] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  // Modal d'ajout manuel rapide avec CIQUAL
  const [showAddModal, setShowAddModal] = useState(false);
  const [ciqualSearchTerm, setCiqualSearchTerm] = useState('');
  const [ciqualResults, setCiqualResults] = useState([]);

  // Caméra WebRTC
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(targetMealSlot);
      setUserComment(initialComment);
      if (initialImage) {
        setImageSrc(initialImage);
        startAnalysis(initialImage, initialComment);
      } else {
        setStep('capture');
        startCamera();
      }
    } else {
      stopCamera();
      setScanResult(null);
      setImageSrc(null);
      setActiveItems([]);
    }
  }, [isOpen, initialImage]);

  // Démarre la caméra mobile/desktop
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Caméra non supportée sur ce navigateur.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Accès caméra refusé :", err);
      setCameraError("Accès caméra indisponible ou refusé. Vous pouvez importer une photo.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture instantanée depuis la caméra avec compression client
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const side = Math.min(video.videoWidth || 640, video.videoHeight || 480);
    const size = Math.min(side, 1024); // Redimensionnement < 1024px
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const startX = ((video.videoWidth || size) - side) / 2;
    const startY = ((video.videoHeight || size) - side) / 2;
    ctx.drawImage(video, startX, startY, side, side, 0, 0, size, size);

    // Compression JPEG 0.85
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setImageSrc(compressedDataUrl);
    startAnalysis(compressedDataUrl, userComment);
  };

  // Upload fichier avec compression client
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1024;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h * maxDim) / w; w = maxDim; }
          else { w = (w * maxDim) / h; h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        setImageSrc(compressed);
        startAnalysis(compressed, userComment);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Lancement du pipeline d'analyse IA
  const startAnalysis = async (imgData, comment) => {
    setStep('analyzing');
    setAnalyzingStatus('Détection multi-objets des composants...');

    setTimeout(() => {
      setAnalyzingStatus('Estimation volumétrique & calcul des portions...');
    }, 900);

    setTimeout(() => {
      setAnalyzingStatus('Croisement avec la table nutritionnelle CIQUAL France...');
    }, 1800);

    try {
      const result = await api.scanMeal(imgData, comment);
      setScanResult(result);
      setInitialAiItems(JSON.parse(JSON.stringify(result.items || [])));
      setActiveItems(result.items || []);
      setStep('validation');
    } catch (err) {
      alert("Erreur lors de l'analyse : " + err.message);
      setStep('capture');
      startCamera();
    }
  };

  // Modification des grammes d'un aliment
  const handleGramChange = (index, deltaOrVal, isAbsolute = false) => {
    setActiveItems(prev => {
      const clone = [...prev];
      const cur = clone[index].grams;
      const next = isAbsolute ? Math.max(5, Number(deltaOrVal) || 0) : Math.max(5, cur + deltaOrVal);
      clone[index] = { ...clone[index], grams: next };
      return clone;
    });
  };

  // Suppression d'un aliment erroné
  const handleDeleteItem = (index) => {
    setActiveItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Recherche dans la base CIQUAL pour ajout manuel
  const handleSearchCiqual = async (term) => {
    setCiqualSearchTerm(term);
    if (!term.trim()) {
      setCiqualResults([]);
      return;
    }
    const res = await api.searchCiqual(term);
    setCiqualResults(res);
  };

  const addCiqualItem = (ciqualFood) => {
    const newItem = {
      name: ciqualFood.name,
      ciqualCode: ciqualFood.code,
      grams: 100,
      confidence: 100,
      calories_per_100g: ciqualFood.calories,
      protein_per_100g: ciqualFood.protein,
      carb_per_100g: ciqualFood.carbs,
      fat_per_100g: ciqualFood.fat,
      fiber_per_100g: ciqualFood.fiber,
      bbox: null
    };
    setActiveItems(prev => [...prev, newItem]);
    setShowAddModal(false);
    setCiqualSearchTerm('');
    setCiqualResults([]);
  };

  // Calcul instantané des totaux
  let totalCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalWeight = 0;

  activeItems.forEach(item => {
    const factor = (item.grams || 100) / 100;
    totalWeight += item.grams || 100;
    totalCals += Math.round((item.calories_per_100g || 0) * factor);
    totalProt += (item.protein_per_100g || 0) * factor;
    totalCarb += (item.carb_per_100g || 0) * factor;
    totalFat += (item.fat_per_100g || 0) * factor;
    totalFiber += (item.fiber_per_100g || 0) * factor;
  });

  // Validation finale & enregistrement dans le journal + feedback loop
  const handleSaveToJournal = async () => {
    if (activeItems.length === 0) {
      alert("Veuillez conserver au moins un aliment pour enregistrer ce repas.");
      return;
    }

    // 1. Calcul de la boucle de feedback (écarts pour ai_feedback_logs)
    const feedbackList = [];
    
    // Aliments supprimés
    initialAiItems.forEach(initItem => {
      const stillPresent = activeItems.find(a => a.name === initItem.name);
      if (!stillPresent) {
        feedbackList.push({
          scanId: scanResult?.scanId,
          action: 'item_deleted',
          originalName: initItem.name,
          originalGrams: initItem.grams,
          userComment: 'Supprimé par utilisateur lors de la validation'
        });
      }
    });

    // Aliments modifiés (grammes changés)
    activeItems.forEach(actItem => {
      const original = initialAiItems.find(i => i.name === actItem.name);
      if (original) {
        if (original.grams !== actItem.grams) {
          feedbackList.push({
            scanId: scanResult?.scanId,
            action: 'item_modified',
            originalName: original.name,
            finalName: actItem.name,
            originalGrams: original.grams,
            finalGrams: actItem.grams,
            userComment: `Grammage ajusté de ${original.grams}g à ${actItem.grams}g`
          });
        }
      } else {
        // Aliments ajoutés manuellement
        feedbackList.push({
          scanId: scanResult?.scanId,
          action: 'item_added',
          finalName: actItem.name,
          finalGrams: actItem.grams,
          userComment: 'Aliment non détecté, ajouté manuellement'
        });
      }
    });

    // Envoyer le feedback de manière asynchrone (ne bloque pas l'UI)
    if (feedbackList.length > 0) {
      api.submitFeedback(feedbackList).catch(e => console.warn("Erreur feedback:", e));
    }

    // 2. Enregistrer le repas
    try {
      const saved = await api.addMeal({
        date: currentDate,
        mealType: selectedSlot,
        title: scanResult?.title || 'Repas Analysé',
        totalCals,
        totalProtein: Math.round(totalProt),
        totalCarbs: Math.round(totalCarb),
        totalFat: Math.round(totalFat),
        totalFiber: Math.round(totalFiber),
        totalWeight,
        photoUrl: imageSrc,
        items: activeItems
      });

      if (onMealSaved) onMealSaved(saved.entry);
      onClose();
    } catch (err) {
      alert("Erreur enregistrement repas : " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Scanner IA & Validation Human-in-the-Loop</h3>
              <p className="text-[11px] text-slate-400">VLM Multimodal & Référentiel CIQUAL France</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: CAPTURE & WEBCAM */}
          {step === 'capture' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-white/10 flex items-center justify-center">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm font-semibold">{cameraError || "Initialisation de la caméra..."}</p>
                    <p className="text-xs text-slate-500 mt-1">Vous pouvez aussi importer une photo de votre galerie</p>
                  </div>
                )}

                {/* Bouton Shutter */}
                {cameraActive && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-xl flex items-center justify-center transition active:scale-95"
                      title="Prendre la photo"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Input de précision optionnelle */}
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Précision facultative pour l'IA (ex: sauce, huile, méthode de cuisson) :
                </label>
                <input
                  type="text"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="ex: avec 1 c. à soupe d'huile d'olive, blanc de poulet sans peau..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bouton importer fichier */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  Importer une photo existante
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING ANIMATION */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl">
                {imageSrc && <img src={imageSrc} alt="" className="w-full h-full object-cover" />}
                <div className="laser-line" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyse VLM & Croisement CIQUAL
                </div>
                <h4 className="text-base font-bold text-white font-display">{analyzingStatus}</h4>
                <p className="text-xs text-slate-400">Application du schéma JSON strict et normalisation aux 100g...</p>
              </div>
            </div>
          )}

          {/* STEP 3: SPLIT-SCREEN VALIDATION (HUMAN-IN-THE-LOOP) */}
          {step === 'validation' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Cas limites (photo floue ou hors sujet) */}
              {(!scanResult?.isMeal || scanResult?.edgeCaseWarning) && (
                <div className="lg:col-span-12 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-200 text-xs">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">Avertissement Cas Limite : </span>
                    {scanResult?.edgeCaseWarning || "L'image semble floue ou ambiguë."}
                    <span className="block text-[11px] text-amber-300/80 mt-0.5">
                      Vérifiez les portions estimées ou complétez avec le bouton "+ Ajouter un aliment CIQUAL" avant d'enregistrer dans votre journal.
                    </span>
                  </div>
                </div>
              )}
              
              {/* GAUCHE : PHOTO AVEC REPERES VISUELS & CONSEIL IA */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Image avec Bounding Boxes / Tags */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 aspect-square shadow-xl">
                  {imageSrc && <img src={imageSrc} alt="Repas analysé" className="w-full h-full object-cover" />}

                  {/* Overlays / Bounding Boxes */}
                  {activeItems.map((item, idx) => {
                    if (!item.bbox) return null;
                    const isHovered = highlightedIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`absolute border-2 rounded transition-all cursor-pointer ${
                          isHovered 
                            ? 'border-emerald-400 bg-emerald-500/30 scale-105 z-20' 
                            : 'border-emerald-500/70 bg-emerald-500/10 z-10'
                        }`}
                        style={{
                          top: `${item.bbox.top}%`,
                          left: `${item.bbox.left}%`,
                          width: `${item.bbox.width}%`,
                          height: `${item.bbox.height}%`
                        }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                      >
                        <span className="absolute -top-6 left-0 bg-slate-950/90 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/40 whitespace-nowrap shadow">
                          {item.name} ({item.grams}g)
                        </span>
                      </div>
                    );
                  })}

                  {/* Badge Confiance IA */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Confiance IA : {scanResult?.confidence || 93}%</span>
                  </div>
                </div>

                {/* Carte Conseil & NutriScore */}
                <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      💡 Analyse & Recommandation
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                      NutriScore {scanResult?.nutriScore || 'A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scanResult?.advice}
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Source : {scanResult?.source === 'gemini-vlm-ciqual' ? 'Gemini 2.0 VLM + CIQUAL' : 'Table CIQUAL France'}</span>
                    <span>Latence : {scanResult?.latencyMs || 840} ms</span>
                  </div>
                </div>

              </div>

              {/* DROITE : LISTE EDITABLE & RECALCUL INSTANTANE */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* Sélecteur de créneau & Bandeau total */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Ajouter ce repas à :</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="breakfast">Petit-Déjeuner</option>
                      <option value="lunch">Déjeuner</option>
                      <option value="dinner">Dîner</option>
                      <option value="snack">Collation</option>
                    </select>
                  </div>

                  {/* Bandeau Total Recalculé en direct */}
                  <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-300 font-medium">Total Calculé en Direct</span>
                      <div className="text-3xl font-extrabold font-display text-white">
                        {totalCals} <span className="text-xs font-normal text-emerald-400">kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        P: {Math.round(totalProt)}g
                      </span>
                      <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        G: {Math.round(totalCarb)}g
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        L: {Math.round(totalFat)}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liste des aliments éditables */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                    <span>Composants Décelés & Portions (Ajustables)</span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter un aliment CIQUAL
                    </button>
                  </div>

                  {activeItems.map((item, idx) => {
                    const factor = item.grams / 100;
                    const itemCals = Math.round(item.calories_per_100g * factor);
                    const isHovered = highlightedIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                        className={`p-3 rounded-xl border transition ${
                          isHovered 
                            ? 'bg-slate-800/90 border-emerald-500/50 shadow-md' 
                            : 'bg-slate-900/60 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                            <span className="text-[10px] text-slate-400">
                              Norme CIQUAL : {item.calories_per_100g} kcal/100g &bull; P:{item.protein_per_100g}g | G:{item.carb_per_100g}g | L:{item.fat_per_100g}g
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-emerald-400">{itemCals} kcal</span>
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                              title="Supprimer cet élément"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Contrôleurs de grammage */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGramChange(idx, -10)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0"
                          >
                            -10
                          </button>
                          <input
                            type="range"
                            min="10"
                            max="500"
                            step="5"
                            value={item.grams}
                            onChange={(e) => handleGramChange(idx, e.target.value, true)}
                            className="w-full accent-emerald-400"
                          />
                          <button
                            onClick={() => handleGramChange(idx, 10)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0"
                          >
                            +10
                          </button>
                          <div className="flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                            <input
                              type="number"
                              value={item.grams}
                              onChange={(e) => handleGramChange(idx, e.target.value, true)}
                              className="w-12 bg-transparent text-xs font-mono font-bold text-white text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">g</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bouton de validation final */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => { setStep('capture'); startCamera(); }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  >
                    Reprendre une photo
                  </button>
                  <button
                    onClick={handleSaveToJournal}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    Valider & Enregistrer dans le Journal ({totalCals} kcal)
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* SOUS-MODAL: AJOUTER UN ALIMENT VIA CIQUAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="w-full max-w-md glass-panel rounded-2xl p-5 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Ajouter un ingrédient CIQUAL</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={ciqualSearchTerm}
                onChange={(e) => handleSearchCiqual(e.target.value)}
                placeholder="Rechercher (ex: Pomme, Poulet, Quinoa, Huile d'olive...)"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {ciqualResults.map(item => (
                <button
                  key={item.code}
                  onClick={() => addCiqualItem(item)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.category} &bull; {item.calories} kcal / 100g</div>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
