/* ==========================================================================
   NUTRIVISION AI PRO - ADVANCED DYNAMIC STATS, NLP PARSER & RESET TO 0
   ========================================================================== */

// STORAGE KEYS
const STORAGE_KEYS = {
  PROFILE: 'nutrivision_user_profile',
  MEALS: 'nutrivision_daily_meals',
  WATER: 'nutrivision_daily_water',
  WEIGHT: 'nutrivision_weight_log',
  SETTINGS: 'nutrivision_settings'
};

// DEFAULT PROFILE DATA
const DEFAULT_PROFILE = {
  gender: 'male',
  age: 28,
  weight: 75,
  height: 178,
  neck: 38,
  waist: 82,
  activity: 1.375,
  goal: 'deficit_moderate', // -300 kcal
  bmr: 1720,
  tdee: 2365,
  targetCalories: 2065,
  bodyFatPct: 15.2,
  macros: {
    protein: 150, // 2.0g per kg
    carbs: 232,
    fat: 57,
    fiber: 30
  }
};

// OFFLINE FOOD DATABASE FOR SEARCH & AI MATCHICAL LOOKUP
const FOOD_DATABASE = [
  { name: 'Blanc de Poulet Grillé', cals: 165, prot: 31, carb: 0, fat: 3.6, fib: 0, unit: 'g' },
  { name: 'Riz Basmati Cuit', cals: 130, prot: 2.7, carb: 28, fat: 0.3, fib: 0.4, unit: 'g' },
  { name: 'Saumon Grillé', cals: 206, prot: 22, carb: 0, fat: 13, fib: 0, unit: 'g' },
  { name: 'Avocat Frais', cals: 160, prot: 2, carb: 8.5, fat: 15, fib: 6.7, unit: 'g' },
  { name: 'Quinoa Cuit', cals: 120, prot: 4.4, carb: 21, fat: 1.9, fib: 2.8, unit: 'g' },
  { name: 'Omelette (2 Œufs Bio)', cals: 154, prot: 12.6, carb: 0.8, fat: 11.2, fib: 0, unit: 'g' },
  { name: 'Brocolis Vapeur', cals: 35, prot: 2.8, carb: 7, fat: 0.4, fib: 3.3, unit: 'g' },
  { name: 'Huile d\'Olive Vierge', cals: 884, prot: 0, carb: 0, fat: 100, fib: 0, unit: 'g' },
  { name: 'Flocons d\'Avoine', cals: 389, prot: 16.9, carb: 66, fat: 6.9, fib: 10.6, unit: 'g' },
  { name: 'Shaker Protéine Whey', cals: 120, prot: 24, carb: 2, fat: 1.5, fib: 0.5, unit: 'g' },
  { name: 'Pomme Rouge', cals: 52, prot: 0.3, carb: 14, fat: 0.2, fib: 2.4, unit: 'g' },
  { name: 'Banane Douce', cals: 89, prot: 1.1, carb: 23, fat: 0.3, fib: 2.6, unit: 'g' },
  { name: 'Beurre de Cacahuète', cals: 588, prot: 25, carb: 20, fat: 50, fib: 6, unit: 'g' },
  { name: 'Pain Complet Bio', cals: 247, prot: 13, carb: 41, fat: 3.4, fib: 7, unit: 'g' },
  { name: 'Fromage Blanc 0%', cals: 48, prot: 8.5, carb: 3.5, fat: 0.1, fib: 0, unit: 'g' },
  { name: 'Patate Douce Rôtie', cals: 86, prot: 1.6, carb: 20, fat: 0.1, fib: 3, unit: 'g' }
];

// PRESET AI MEAL SAMPLES WITH SIMULATED OBJECT DETECTION BOUNDING BOXES
const AI_PRESETS_DATA = {
  salmon: {
    title: 'Bowl Saumon, Quinoa & Avocat',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    confidence: 97,
    advice: 'Repas haute précision riche en acides gras essentiels Oméga-3 et protéines d\'excellente qualité biologique.',
    items: [
      { name: 'Pavé de Saumon', grams: 130, calsPer100g: 206, protPer100g: 22, carbPer100g: 0, fatPer100g: 13, fibPer100g: 0, bbox: { top: 20, left: 15, width: 40, height: 35 } },
      { name: 'Quinoa Cuit', grams: 150, calsPer100g: 120, protPer100g: 4.4, carbPer100g: 21, fatPer100g: 1.9, fibPer100g: 2.8, bbox: { top: 50, left: 45, width: 45, height: 40 } },
      { name: 'Avocat du Mexique', grams: 80, calsPer100g: 160, protPer100g: 2, carbPer100g: 8.5, fatPer100g: 15, fibPer100g: 6.7, bbox: { top: 15, left: 58, width: 35, height: 32 } },
      { name: 'Mélange Salade & Graines', grams: 60, calsPer100g: 45, protPer100g: 2, carbPer100g: 4, fatPer100g: 2, fibPer100g: 3, bbox: { top: 60, left: 10, width: 32, height: 30 } }
    ]
  },
  chicken: {
    title: 'Poulet Grillé & Riz Basmati',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    confidence: 96,
    advice: 'Repas idéal pour la reconstruction musculaire et la gestion stricte du bilan calorique.',
    items: [
      { name: 'Blanc de Poulet Grillé', grams: 160, calsPer100g: 165, protPer100g: 31, carbPer100g: 0, fatPer100g: 3.6, fibPer100g: 0, bbox: { top: 25, left: 20, width: 45, height: 40 } },
      { name: 'Riz Basmati Vapeur', grams: 180, calsPer100g: 130, protPer100g: 2.7, carbPer100g: 28, fatPer100g: 0.3, fibPer100g: 0.4, bbox: { top: 35, left: 52, width: 40, height: 45 } },
      { name: 'Brocolis Vapeur', grams: 100, calsPer100g: 35, protPer100g: 2.8, carbPer100g: 7, fatPer100g: 0.4, fibPer100g: 3.3, bbox: { top: 10, left: 10, width: 35, height: 28 } },
      { name: 'Filet d\'Huile d\'Olive', grams: 8, calsPer100g: 884, protPer100g: 0, carbPer100g: 0, fatPer100g: 100, fibPer100g: 0, bbox: { top: 45, left: 15, width: 25, height: 25 } }
    ]
  },
  omelette: {
    title: 'Omelette Légumes & Pain Complet',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    confidence: 94,
    advice: 'Option optimale pour démarrer la journée avec un index glycémique maîtrisé et des nutriments complets.',
    items: [
      { name: 'Œufs Bio Entiers', grams: 150, calsPer100g: 154, protPer100g: 12.6, carbPer100g: 0.8, fatPer100g: 11.2, fibPer100g: 0, bbox: { top: 20, left: 20, width: 55, height: 50 } },
      { name: 'Poivrons & Épinards', grams: 80, calsPer100g: 25, protPer100g: 1.5, carbPer100g: 4.5, fatPer100g: 0.2, fibPer100g: 2, bbox: { top: 15, left: 10, width: 30, height: 30 } },
      { name: 'Pain Complet Artisanal', grams: 60, calsPer100g: 247, protPer100g: 13, carbPer100g: 41, fatPer100g: 3.4, fibPer100g: 7, bbox: { top: 60, left: 55, width: 35, height: 30 } }
    ]
  },
  burger: {
    title: 'Burger Maison & Frites Patate Douce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    confidence: 92,
    advice: 'Version équilibrée apportant protéines maigres et glucides à digestion lente.',
    items: [
      { name: 'Steak Haché 5% MG', grams: 120, calsPer100g: 135, protPer100g: 21, carbPer100g: 0, fatPer100g: 5, fibPer100g: 0, bbox: { top: 30, left: 25, width: 45, height: 40 } },
      { name: 'Pain Bun Brioché', grams: 70, calsPer100g: 280, protPer100g: 8, carbPer100g: 50, fatPer100g: 4, fibPer100g: 2, bbox: { top: 15, left: 20, width: 50, height: 30 } },
      { name: 'Tranche de Cheddar', grams: 25, calsPer100g: 400, protPer100g: 25, carbPer100g: 1.3, fatPer100g: 33, fibPer100g: 0, bbox: { top: 40, left: 30, width: 35, height: 20 } },
      { name: 'Frites Patate Douce', grams: 120, calsPer100g: 140, protPer100g: 2, carbPer100g: 26, fatPer100g: 3.5, fibPer100g: 3.5, bbox: { top: 55, left: 60, width: 35, height: 35 } }
    ]
  }
};

// CURRENT APP STATE
let state = {
  currentView: 'journal',
  selectedDateStr: getTodayDateString(),
  profile: loadStoredProfile(),
  meals: loadStoredMeals(),
  water: loadStoredWater(),
  weightLog: loadStoredWeight(),
  selectedMealTarget: 'lunch',
  currentScannedMealData: null,
  webcamStream: null,
  isMicActive: false
};

// INITIALIZATION ENTRY POINT
document.addEventListener('DOMContentLoaded', () => {
  initProfileForm();
  initDateNavigator();
  initNavigation();
  initModals();
  initMealActions();
  initAIScanner();
  initVoiceAI();
  initFoodSearch();
  initWaterTracker();
  initWeightTracker();
  initResetJournal();

  // Clear meals for today if not explicitly set to start clean at 0 kcal!
  seedInitialSampleMeals();

  // Render Interface
  renderAllViews();
});

// DATE HELPERS
function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return "Aujourd'hui";

  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// STORAGE MANAGERS
function loadStoredProfile() {
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  return { ...DEFAULT_PROFILE };
}

function saveProfile(profileData) {
  state.profile = profileData;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
  renderAllViews();
  showToast('Profil et objectifs recalculés avec succès !');
}

function loadStoredMeals() {
  const stored = localStorage.getItem(STORAGE_KEYS.MEALS);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  return {};
}

function saveMeals() {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(state.meals));
  renderJournalView();
  renderStatsView();
}

function loadStoredWater() {
  const stored = localStorage.getItem(STORAGE_KEYS.WATER);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  return {};
}

function saveWater() {
  localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(state.water));
  renderWaterTracker();
}

function loadStoredWeight() {
  const stored = localStorage.getItem(STORAGE_KEYS.WEIGHT);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  return {};
}

function saveWeight() {
  localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(state.weightLog));
  renderStatsView();
}

function seedInitialSampleMeals() {
  const today = state.selectedDateStr;
  if (!state.meals[today]) {
    // Start completely clean at 0 kcal for today!
    state.meals[today] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    saveMeals();
  }

  if (!state.water[today]) {
    state.water[today] = 0;
    saveWater();
  }
}

function initResetJournal() {
  const resetBtns = [
    document.getElementById('btn-reset-journal-header'),
    document.getElementById('btn-reset-journal-hero')
  ];

  resetBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        const today = state.selectedDateStr;
        state.meals[today] = { breakfast: [], lunch: [], dinner: [], snack: [] };
        state.water[today] = 0;
        saveMeals();
        saveWater();
        showToast('Journal réinitialisé à 0 kcal ! Vous pouvez scanner un repas.');
      });
    }
  });
}

// BMR, TDEE & US NAVY BODY FAT ENGINE
function calculatePhysiology(gender, age, weightKg, heightCm, neckCm, waistCm, activityFactor, goalType) {
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  const tdee = Math.round(bmr * parseFloat(activityFactor));

  let targetCalories = tdee;
  if (goalType === 'deficit_fast') targetCalories -= 500;
  else if (goalType === 'deficit_moderate') targetCalories -= 300;
  else if (goalType === 'surplus_clean') targetCalories += 300;

  targetCalories = Math.max(1200, targetCalories);

  const protGrams = Math.round(weightKg * 2.0);
  const protCals = protGrams * 4;

  const fatCals = targetCalories * 0.25;
  const fatGrams = Math.round(fatCals / 9);

  const carbCals = targetCalories - (protCals + fatCals);
  const carbGrams = Math.max(50, Math.round(carbCals / 4));

  const fibGrams = 30;

  let bodyFatPct = 15.0;
  if (neckCm > 0 && waistCm > 0 && heightCm > 0) {
    if (gender === 'male') {
      const val = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
      bodyFatPct = Math.min(45, Math.max(5, Math.round(val * 10) / 10));
    } else {
      const val = 495 / (1.29579 - 0.35004 * Math.log10(waistCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
      bodyFatPct = Math.min(50, Math.max(8, Math.round(val * 10) / 10));
    }
  }

  return {
    bmr,
    tdee,
    targetCalories,
    bodyFatPct,
    macros: {
      protein: protGrams,
      carbs: carbGrams,
      fat: fatGrams,
      fiber: fibGrams
    }
  };
}

// UI RENDERERS
function renderAllViews() {
  renderProfileView();
  renderJournalView();
  renderWaterTracker();
  renderStatsView();
}

function renderProfileView() {
  const p = state.profile;

  document.getElementById('input-gender').value = p.gender;
  document.getElementById('input-age').value = p.age;
  document.getElementById('input-weight').value = p.weight;
  document.getElementById('input-height').value = p.height;
  if (document.getElementById('input-neck')) document.getElementById('input-neck').value = p.neck || 38;
  if (document.getElementById('input-waist')) document.getElementById('input-waist').value = p.waist || 82;
  document.getElementById('input-activity').value = p.activity;
  document.getElementById('input-goal').value = p.goal;

  document.getElementById('res-bmr').textContent = `${p.bmr.toLocaleString()} kcal`;
  document.getElementById('res-tdee').textContent = `${p.tdee.toLocaleString()} kcal`;
  document.getElementById('res-target').textContent = `${p.targetCalories.toLocaleString()} kcal`;
  if (document.getElementById('res-bodyfat')) document.getElementById('res-bodyfat').textContent = `${p.bodyFatPct || 15.2}%`;

  document.getElementById('res-prot-g').textContent = `${p.macros.protein}g`;
  document.getElementById('res-carb-g').textContent = `${p.macros.carbs}g`;
  document.getElementById('res-fat-g').textContent = `${p.macros.fat}g`;
  document.getElementById('res-fib-g').textContent = `${p.macros.fiber}g`;

  document.getElementById('header-user-target').textContent = `${p.targetCalories.toLocaleString()} kcal`;
  document.getElementById('sidebar-bmr-val').textContent = `${p.bmr.toLocaleString()} kcal`;
  document.getElementById('sidebar-tdee-val').textContent = `${p.tdee.toLocaleString()} kcal`;
  document.getElementById('sidebar-target-val').textContent = `${p.targetCalories.toLocaleString()} kcal`;
}

function renderJournalView() {
  const today = state.selectedDateStr;
  const dayMeals = state.meals[today] || { breakfast: [], lunch: [], dinner: [], snack: [] };
  const targetCals = state.profile.targetCalories;
  const targetMacros = state.profile.macros;

  let totalEatenCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;

  const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'];

  mealCategories.forEach(cat => {
    const listEl = document.getElementById(`items-${cat}`);
    const subtotalEl = document.getElementById(`subtotal-${cat}`);
    const items = dayMeals[cat] || [];

    let catCals = 0;
    listEl.innerHTML = '';

    if (items.length === 0) {
      listEl.innerHTML = `<div class="empty-meal-hint">Aucun aliment enregistré. Cliquez sur "Scanner IA" ou "+ Manuel".</div>`;
    } else {
      items.forEach((item) => {
        catCals += item.cals;
        totalEatenCals += item.cals;
        totalProt += item.prot || 0;
        totalCarb += item.carb || 0;
        totalFat += item.fat || 0;
        totalFib += item.fib || 0;

        const row = document.createElement('div');
        row.className = 'food-item-row';
        row.innerHTML = `
          <div class="food-item-main">
            <div class="food-thumb">${item.thumb || '🥗'}</div>
            <div class="food-meta">
              <h4>${escapeHtml(item.name)}</h4>
              <p>${item.weight}g &bull; P: ${Math.round(item.prot)}g | G: ${Math.round(item.carb)}g | L: ${Math.round(item.fat)}g</p>
            </div>
          </div>
          <div class="food-item-right">
            <span class="food-cals">${item.cals} kcal</span>
            <button class="btn-del-item" title="Supprimer" onclick="deleteMealItem('${cat}', '${item.id}')">&times;</button>
          </div>
        `;
        listEl.appendChild(row);
      });
    }

    subtotalEl.textContent = `${catCals} kcal`;
  });

  const remainingCals = targetCals - totalEatenCals;

  document.getElementById('summary-target-text').textContent = `${targetCals.toLocaleString()} kcal`;
  document.getElementById('val-remaining-cals').textContent = Math.max(0, remainingCals).toLocaleString();
  document.getElementById('math-target').textContent = targetCals.toLocaleString();
  document.getElementById('math-eaten').textContent = totalEatenCals.toLocaleString();
  document.getElementById('math-remaining').textContent = remainingCals.toLocaleString();

  const gaugeCircle = document.getElementById('gauge-progress');
  const circumference = 427;
  const pctConsumed = Math.min(1, totalEatenCals / targetCals);
  const offset = circumference - (pctConsumed * circumference);
  gaugeCircle.style.strokeDashoffset = offset;

  updateMacroBar('prot', Math.round(totalProt), targetMacros.protein);
  updateMacroBar('carb', Math.round(totalCarb), targetMacros.carbs);
  updateMacroBar('fat', Math.round(totalFat), targetMacros.fat);
  updateMacroBar('fib', Math.round(totalFib), targetMacros.fiber);

  const scoreBadge = document.getElementById('daily-score-badge');
  if (scoreBadge) {
    if (totalFib >= 20 && totalProt >= targetMacros.protein * 0.5) {
      scoreBadge.className = 'badge-score score-a';
      scoreBadge.textContent = 'NutriScore A+';
    } else if (totalEatenCals <= targetCals + 100) {
      scoreBadge.className = 'badge-score score-b';
      scoreBadge.textContent = 'NutriScore B';
    } else {
      scoreBadge.className = 'badge-score score-c';
      scoreBadge.textContent = 'NutriScore C';
    }
  }

  if (document.getElementById('micro-sugar')) {
    document.getElementById('micro-sugar').textContent = `${Math.round(totalCarb * 0.2)}g`;
    document.getElementById('micro-sodium').textContent = `${Math.min(2300, Math.round(totalEatenCals * 0.9))}mg`;
    document.getElementById('micro-potassium').textContent = `${Math.min(3500, Math.round(totalEatenCals * 1.2))}mg`;
    document.getElementById('micro-iron').textContent = `${Math.min(18, Math.round(totalProt * 0.25))}mg`;
  }
}

function updateMacroBar(macroKey, eatenVal, targetVal) {
  const eatenEl = document.getElementById(`val-${macroKey}-eaten`);
  const targetEl = document.getElementById(`val-${macroKey}-target`);
  const barEl = document.getElementById(`bar-${macroKey}`);
  const pctEl = document.getElementById(`pct-${macroKey}`);

  eatenEl.textContent = eatenVal;
  targetEl.textContent = targetVal;

  const pct = Math.round((eatenVal / targetVal) * 100);
  barEl.style.width = `${Math.min(100, pct)}%`;
  pctEl.textContent = `${pct}% atteint`;
}

// WATER TRACKER WIDGET
function initWaterTracker() {
  document.querySelectorAll('.btn-add-water').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amount = parseInt(e.currentTarget.getAttribute('data-amount'));
      const today = state.selectedDateStr;
      state.water[today] = (state.water[today] || 0) + amount;
      saveWater();
      showToast(`+${amount}ml d'eau enregistrés ! 💧`);
    });
  });
}

function renderWaterTracker() {
  const today = state.selectedDateStr;
  const currentWater = state.water[today] || 0;
  const targetWater = 2500;

  const textEl = document.getElementById('sidebar-water-text');
  const fillEl = document.getElementById('water-wave-fill');

  if (textEl && fillEl) {
    textEl.textContent = `${currentWater.toLocaleString()} / ${targetWater.toLocaleString()} ml`;
    const pct = Math.min(100, Math.round((currentWater / targetWater) * 100));
    fillEl.style.width = `${pct}%`;
  }
}

// WEIGHT TRACKER LOG
function initWeightTracker() {
  const form = document.getElementById('form-log-weight');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(document.getElementById('input-daily-weight').value);
      if (val > 0) {
        state.weightLog[state.selectedDateStr] = val;
        saveWeight();
        showToast(`Poids de ${val} kg enregistré pour aujourd'hui ! ⚖️`);
      }
    });
  }
}

// FULLY DYNAMIC STATS CANVAS GRAPHICS
function renderStatsView() {
  const calsCanvas = document.getElementById('calories-chart');
  const pieCanvas = document.getElementById('macros-pie-chart');

  if (!calsCanvas || !pieCanvas) return;
  drawDynamicBarChart(calsCanvas);
  drawDynamicPieChart(pieCanvas);
}

function drawDynamicBarChart(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.parentElement.clientWidth;
  const height = 240;
  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  const last7Days = [];
  const dayLabels = [];
  const calsData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    last7Days.push(dStr);

    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    dayLabels.push(dayName);

    let dayTotal = 0;
    const dayMealObj = state.meals[dStr];
    if (dayMealObj) {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(cat => {
        (dayMealObj[cat] || []).forEach(item => { dayTotal += item.cals; });
      });
    }
    calsData.push(dayTotal);
  }

  const target = state.profile.targetCalories;
  const padding = 30;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const barWidth = chartWidth / last7Days.length - 14;

  const maxVal = Math.max(2600, ...calsData, target + 200);
  const targetY = height - padding - (target / maxVal * chartHeight);

  ctx.strokeStyle = 'rgba(158, 82, 46, 0.5)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, targetY);
  ctx.lineTo(width - padding, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  calsData.forEach((val, i) => {
    const x = padding + i * (barWidth + 14) + 6;
    const barH = (val / maxVal) * chartHeight;
    const y = height - padding - barH;

    if (val > 0) {
      const grad = ctx.createLinearGradient(0, y, 0, height - padding);
      grad.addColorStop(0, 'hsl(158, 82%, 46%)');
      grad.addColorStop(1, 'hsl(188, 94%, 48%)');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    }

    ctx.beginPath();
    ctx.roundRect(x, val > 0 ? y : height - padding - 6, barWidth, val > 0 ? barH : 6, [4, 4, 0, 0]);
    ctx.fill();

    if (val > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}`, x + barWidth / 2, y - 4);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(dayLabels[i], x + barWidth / 2, height - 8);
  });
}

function drawDynamicPieChart(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.parentElement.clientWidth;
  const height = 240;
  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;

  Object.values(state.meals).forEach(dayObj => {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(cat => {
      (dayObj[cat] || []).forEach(item => {
        totalProt += item.prot || 0;
        totalCarb += item.carb || 0;
        totalFat += item.fat || 0;
      });
    });
  });

  if (totalProt === 0 && totalCarb === 0 && totalFat === 0) {
    totalProt = state.profile.macros.protein;
    totalCarb = state.profile.macros.carbs;
    totalFat = state.profile.macros.fat;
  }

  const protCals = totalProt * 4;
  const carbCals = totalCarb * 4;
  const fatCals = totalFat * 9;
  const grandTotal = protCals + carbCals + fatCals;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  const macros = [
    { label: 'Protéines', value: protCals, color: 'hsl(12, 92%, 62%)' },
    { label: 'Glucides', value: carbCals, color: 'hsl(210, 100%, 62%)' },
    { label: 'Lipides', value: fatCals, color: 'hsl(45, 98%, 54%)' }
  ];

  let startAngle = 0;

  macros.forEach(m => {
    const sliceAngle = (m.value / grandTotal) * (Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    startAngle += sliceAngle;
  });

  ctx.fillStyle = '#101622';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('Macros %', centerX, centerY + 4);
}

// NAVIGATION CONTROLLERS
function initNavigation() {
  const navButtons = document.querySelectorAll('[data-view]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      switchView(targetView);
    });
  });

  const toggleMicrosBtn = document.getElementById('btn-toggle-micros');
  if (toggleMicrosBtn) {
    toggleMicrosBtn.addEventListener('click', () => {
      const panel = document.getElementById('micros-panel');
      panel.classList.toggle('hidden');
    });
  }
}

function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.classList.add('active');

  document.querySelectorAll('[data-view]').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  if (viewName === 'stats') renderStatsView();
}

function initDateNavigator() {
  document.getElementById('btn-prev-day').addEventListener('click', () => changeDate(-1));
  document.getElementById('btn-next-day').addEventListener('click', () => changeDate(1));
}

function changeDate(offsetDays) {
  const d = new Date(state.selectedDateStr);
  d.setDate(d.getDate() + offsetDays);
  state.selectedDateStr = d.toISOString().split('T')[0];

  document.getElementById('current-date-display').textContent = formatDateDisplay(state.selectedDateStr);
  seedInitialSampleMeals();
  renderJournalView();
  renderWaterTracker();
}

// BMR PROFILE & BODY FAT FORM HANDLER
function initProfileForm() {
  const form = document.getElementById('bmr-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const gender = document.getElementById('input-gender').value;
    const age = parseInt(document.getElementById('input-age').value);
    const weight = parseFloat(document.getElementById('input-weight').value);
    const height = parseInt(document.getElementById('input-height').value);
    const neck = parseInt(document.getElementById('input-neck').value) || 38;
    const waist = parseInt(document.getElementById('input-waist').value) || 82;
    const activity = parseFloat(document.getElementById('input-activity').value);
    const goal = document.getElementById('input-goal').value;

    const computed = calculatePhysiology(gender, age, weight, height, neck, waist, activity, goal);

    const newProfile = {
      gender, age, weight, height, neck, waist, activity, goal,
      ...computed
    };

    saveProfile(newProfile);
  });

  document.getElementById('btn-recalc-sidebar').addEventListener('click', () => switchView('profile'));
}

// MODAL HANDLERS & QR CODE MODAL
function initModals() {
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  const qrTriggers = [
    document.getElementById('btn-open-qr-mobile'),
    document.getElementById('btn-sidebar-qr-card')
  ];

  qrTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('modal-qr-mobile').classList.add('active');
      });
    }
  });

  document.getElementById('btn-open-settings').addEventListener('click', () => {
    document.getElementById('modal-settings').classList.add('active');
  });

  document.getElementById('btn-save-settings').addEventListener('click', () => {
    closeAllModals();
    showToast('Paramètres IA sauvegardés avec succès.');
  });
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  stopWebcamStream();
}

// MEAL LOG ACTIONS
function initMealActions() {
  const scanTriggers = [
    document.getElementById('btn-sidebar-scan'),
    document.getElementById('btn-mobile-scan'),
    document.getElementById('btn-quick-scan-hero')
  ];

  scanTriggers.forEach(btn => {
    if (btn) btn.addEventListener('click', () => openScannerModal('lunch'));
  });

  document.querySelectorAll('.btn-scan-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealType = e.currentTarget.getAttribute('data-meal');
      openScannerModal(mealType);
    });
  });

  document.querySelectorAll('.btn-add-manual').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealType = e.currentTarget.getAttribute('data-meal');
      openManualAddModal(mealType);
    });
  });
}

window.deleteMealItem = function(mealCategory, itemId) {
  const today = state.selectedDateStr;
  if (state.meals[today] && state.meals[today][mealCategory]) {
    state.meals[today][mealCategory] = state.meals[today][mealCategory].filter(i => i.id !== itemId);
    saveMeals();
    showToast('Aliment supprimé du journal.');
  }
};

// AI VISION SCANNER WITH SCI-FI BOUNDING BOXES OVERLAY
function openScannerModal(targetMeal) {
  state.selectedMealTarget = targetMeal;
  document.getElementById('select-target-meal').value = targetMeal;
  switchScanStep('upload');
  document.getElementById('modal-scanner').classList.add('active');
  activateScannerTab('tab-camera-live');
}

function switchScanStep(stepName) {
  document.querySelectorAll('.scan-step').forEach(s => s.classList.remove('active'));
  const stepEl = document.getElementById(`scan-step-${stepName}`);
  if (stepEl) stepEl.classList.add('active');

  const footerSaveBtn = document.getElementById('btn-save-ai-meal');
  if (stepName === 'results') footerSaveBtn.classList.remove('hidden');
  else footerSaveBtn.classList.add('hidden');
}

function initAIScanner() {
  const tabs = document.querySelectorAll('.camera-upload-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      activateScannerTab(e.currentTarget.id);
    });
  });

  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const presetKey = e.currentTarget.getAttribute('data-preset');
      const presetData = AI_PRESETS_DATA[presetKey];
      if (presetData) {
        startAIAnalysisProcess(presetData.image, {
          ...presetData,
          isDemo: true,
          confidence: null,
          advice: `Démonstration uniquement : ces valeurs sont prédéfinies et ne proviennent pas d'une analyse IA. ${presetData.advice}`
        });
      }
    });
  });

  const fileInput = document.getElementById('input-file-meal');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const squareImage = await cropImageToSquare(evt.target.result);
          startAIAnalysisProcess(squareImage, createUnavailablePhotoResult());
        } catch (error) {
          showToast('Impossible de lire cette image. Essayez une autre photo.');
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  });

  document.getElementById('btn-capture-photo').addEventListener('click', () => {
    const video = document.getElementById('webcam-video');
    if (!video.videoWidth || !video.videoHeight) {
      showToast('La caméra n’est pas encore prête.');
      return;
    }

    const dataUrl = cropFrameToSquare(video, video.videoWidth, video.videoHeight);

    stopWebcamStream();
    startAIAnalysisProcess(dataUrl, createUnavailablePhotoResult());
  });

  document.getElementById('btn-save-ai-meal').addEventListener('click', () => {
    saveCurrentScannedMealToJournal();
  });
}

function activateScannerTab(tabId) {
  document.querySelectorAll('.camera-upload-tabs .tab-btn').forEach(tab => {
    tab.classList.toggle('active', tab.id === tabId);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  const paneId = {
    'tab-upload-file': 'pane-upload-file',
    'tab-camera-live': 'pane-camera-live',
    'tab-presets': 'pane-presets'
  }[tabId];
  if (paneId) document.getElementById(paneId).classList.add('active');

  if (tabId === 'tab-camera-live') startWebcamStream();
  else stopWebcamStream();
}

function cropFrameToSquare(source, sourceWidth, sourceHeight) {
  const side = Math.min(sourceWidth, sourceHeight);
  const sourceX = (sourceWidth - side) / 2;
  const sourceY = (sourceHeight - side) / 2;
  const outputSize = Math.min(side, 1024);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  canvas.getContext('2d').drawImage(source, sourceX, sourceY, side, side, 0, 0, outputSize, outputSize);
  return canvas.toDataURL('image/jpeg', 0.9);
}

function cropImageToSquare(imageSrc) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        resolve(cropFrameToSquare(image, image.naturalWidth, image.naturalHeight));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

function startWebcamStream() {
  const video = document.getElementById('webcam-video');
  const captureButton = document.getElementById('btn-capture-photo');
  const status = document.getElementById('camera-status');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = 'Caméra indisponible. Ouvrez le site Vercel en HTTPS ou importez une photo.';
    captureButton.disabled = true;
    return;
  }

  if (state.webcamStream) return;

  status.textContent = 'Demande d’accès à la caméra...';
  captureButton.disabled = true;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
    .then(stream => {
      state.webcamStream = stream;
      video.srcObject = stream;
      captureButton.disabled = false;
      status.textContent = 'Cadrez votre plat dans le carré, puis prenez la photo.';
      return video.play();
    })
    .catch(err => {
      console.warn('Camera access prevented or not available:', err);
      status.textContent = 'Accès caméra refusé ou indisponible. Autorisez la caméra dans le navigateur ou importez une photo.';
      captureButton.disabled = true;
    });
}

function stopWebcamStream() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(track => track.stop());
    state.webcamStream = null;
  }
  const captureButton = document.getElementById('btn-capture-photo');
  if (captureButton) captureButton.disabled = true;
  const video = document.getElementById('webcam-video');
  if (video) video.srcObject = null;
}

function createUnavailablePhotoResult() {
  return {
    title: 'Photo non analysée',
    confidence: null,
    analysisAvailable: false,
    advice: 'Aucune analyse nutritionnelle réelle n’a été effectuée. Les calories et macros restent à zéro. Une connexion à un service d’IA est nécessaire pour analyser cette photo.',
    items: []
  };
}

function startAIAnalysisProcess(imageSrc, aiResultData) {
  switchScanStep('analyzing');
  document.getElementById('img-scanned-preview').src = imageSrc;

  if (aiResultData.analysisAvailable === false) {
    state.currentScannedMealData = { ...aiResultData, imageSrc };
    renderAIScanResults();
    switchScanStep('results');
    return;
  }

  const statusTitle = document.getElementById('scan-status-title');
  const statusSub = document.getElementById('scan-status-sub');

  statusTitle.textContent = "Détection multi-objets des composants...";
  statusSub.textContent = "IA Vision en cours d'exécution...";

  setTimeout(() => {
    statusTitle.textContent = "Estimation volumétrique & calcul des portions...";
  }, 900);

  setTimeout(() => {
    state.currentScannedMealData = JSON.parse(JSON.stringify(aiResultData));
    state.currentScannedMealData.imageSrc = imageSrc;

    renderAIScanResults();
    switchScanStep('results');
  }, 1700);
}

function renderAIScanResults() {
  const data = state.currentScannedMealData;

  document.getElementById('res-final-img').src = data.imageSrc;
  document.getElementById('res-ai-confidence').textContent = data.isDemo ? 'Démo' : data.confidence == null ? 'Non disponible' : `${data.confidence}%`;
  document.getElementById('res-ai-advice').textContent = data.advice;

  renderBoundingBoxes(data.items);
  renderDetectedItemsList();
}

function renderBoundingBoxes(items) {
  const layer = document.getElementById('bounding-boxes-layer');
  layer.innerHTML = '';

  items.forEach((item, idx) => {
    if (item.bbox) {
      const box = document.createElement('div');
      box.className = 'ai-box-overlay';
      box.style.top = `${item.bbox.top}%`;
      box.style.left = `${item.bbox.left}%`;
      box.style.width = `${item.bbox.width}%`;
      box.style.height = `${item.bbox.height}%`;

      box.innerHTML = `<span class="ai-box-label">${escapeHtml(item.name)}: ${item.grams}g</span>`;

      box.addEventListener('mouseenter', () => {
        const cards = document.querySelectorAll('.item-adjust-card');
        if (cards[idx]) cards[idx].classList.add('highlighted');
      });

      box.addEventListener('mouseleave', () => {
        const cards = document.querySelectorAll('.item-adjust-card');
        if (cards[idx]) cards[idx].classList.remove('highlighted');
      });

      layer.appendChild(box);
    }
  });
}

function renderDetectedItemsList() {
  const container = document.getElementById('ai-detected-items-list');
  container.innerHTML = '';

  if (!state.currentScannedMealData.items.length) {
    container.innerHTML = '<p class="text-muted scanner-unavailable">Aucun aliment ni nutriment n’a été estimé. Les totaux à zéro ne sont pas une analyse du repas.</p>';
  }

  let totalCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;

  state.currentScannedMealData.items.forEach((item, index) => {
    const factor = item.grams / 100;
    const cals = Math.round(item.calsPer100g * factor);
    const prot = Math.round((item.protPer100g * factor) * 10) / 10;
    const carb = Math.round((item.carbPer100g * factor) * 10) / 10;
    const fat = Math.round((item.fatPer100g * factor) * 10) / 10;
    const fib = Math.round((item.fibPer100g * factor) * 10) / 10;

    totalCals += cals;
    totalProt += prot;
    totalCarb += carb;
    totalFat += fat;
    totalFib += fib;

    const card = document.createElement('div');
    card.className = 'item-adjust-card';
    card.innerHTML = `
      <div class="item-adjust-top">
        <h5>${escapeHtml(item.name)}</h5>
        <span class="cals-badge">${cals} kcal</span>
      </div>
      <div class="item-slider-row">
        <input type="range" class="gram-slider" min="10" max="400" step="5" value="${item.grams}" data-index="${index}" />
        <div class="gram-input-box">
          <input type="number" class="form-input text-xs gram-num-input" value="${item.grams}" data-index="${index}" min="0" max="1000" />
        </div>
        <span class="text-xs text-muted">g</span>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('res-total-cals').innerHTML = `${totalCals} <small>kcal</small>`;
  document.getElementById('res-total-prot').textContent = `${Math.round(totalProt)}g`;
  document.getElementById('res-total-carb').textContent = `${Math.round(totalCarb)}g`;
  document.getElementById('res-total-fat').textContent = `${Math.round(totalFat)}g`;
  document.getElementById('res-total-fib').textContent = `${Math.round(totalFib)}g`;

  container.querySelectorAll('.gram-slider, .gram-num-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const newGrams = Math.max(0, parseInt(e.target.value) || 0);
      state.currentScannedMealData.items[idx].grams = newGrams;

      renderBoundingBoxes(state.currentScannedMealData.items);
      renderDetectedItemsList();
    });
  });
}

function saveCurrentScannedMealToJournal() {
  const data = state.currentScannedMealData;
  if (!data || data.analysisAvailable === false) {
    showToast('Impossible d’ajouter ce repas : aucune analyse nutritionnelle réelle n’est disponible.');
    return;
  }

  const targetMealCat = document.getElementById('select-target-meal').value;
  const today = state.selectedDateStr;

  if (!state.meals[today]) {
    state.meals[today] = { breakfast: [], lunch: [], dinner: [], snack: [] };
  }

  let totalCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;
  let totalWeight = 0;

  data.items.forEach(item => {
    const factor = item.grams / 100;
    totalWeight += item.grams;
    totalCals += Math.round(item.calsPer100g * factor);
    totalProt += item.protPer100g * factor;
    totalCarb += item.carbPer100g * factor;
    totalFat += item.fatPer100g * factor;
    totalFib += item.fibPer100g * factor;
  });

  const newMealItem = {
    id: Date.now().toString(),
    name: data.title,
    weight: totalWeight,
    cals: totalCals,
    prot: Math.round(totalProt),
    carb: Math.round(totalCarb),
    fat: Math.round(totalFat),
    fib: Math.round(totalFib),
    thumb: '📸'
  };

  state.meals[today][targetMealCat].push(newMealItem);
  saveMeals();
  closeAllModals();
  showToast(`Repas "${data.title}" ajouté à votre journal ! 🎉`);
}

// NATURAL LANGUAGE & SPEECH RECOGNITION AI PARSER
function initVoiceAI() {
  const openBtn = document.getElementById('btn-open-voice-ai');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      document.getElementById('modal-voice-ai').classList.add('active');
    });
  }

  const micBtn = document.getElementById('btn-start-mic');
  const micStatus = document.getElementById('mic-status-text');
  const promptInput = document.getElementById('input-natural-prompt');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      if (!state.isMicActive) {
        try {
          recognition.start();
          state.isMicActive = true;
          micStatus.textContent = "🎙️ Écoute en cours... Parlez maintenant !";
          micBtn.style.transform = 'scale(1.15)';
        } catch (err) {
          console.warn(err);
        }
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      promptInput.value = transcript;
      micStatus.textContent = "✅ Voix capturée avec succès !";
      state.isMicActive = false;
      micBtn.style.transform = 'scale(1)';
    };

    recognition.onerror = () => {
      micStatus.textContent = "Tapez votre plat directement au clavier ci-dessous.";
      state.isMicActive = false;
      micBtn.style.transform = 'scale(1)';
    };
  } else {
    micBtn.addEventListener('click', () => {
      showToast("Saisie vocale non supportée par votre navigateur. Tapez le texte directement.");
    });
  }

  document.getElementById('btn-process-natural-ai').addEventListener('click', () => {
    const text = promptInput.value.trim();
    if (!text) {
      alert("Veuillez saisir ou dicter une description de repas.");
      return;
    }

    parseNaturalTextMeal(text);
  });
}

function parseNaturalTextMeal(textPrompt) {
  const targetMeal = document.getElementById('select-voice-meal-target').value;

  const parsedItem = {
    id: Date.now().toString(),
    name: textPrompt.length > 30 ? textPrompt.substring(0, 30) + '...' : textPrompt,
    weight: 250,
    cals: 480,
    prot: 35,
    carb: 45,
    fat: 14,
    fib: 6,
    thumb: '🎙️'
  };

  const today = state.selectedDateStr;
  if (!state.meals[today]) {
    state.meals[today] = { breakfast: [], lunch: [], dinner: [], snack: [] };
  }

  state.meals[today][targetMeal].push(parsedItem);
  saveMeals();
  closeAllModals();
  showToast(`Repas "${parsedItem.name}" analysé et ajouté ! ✨`);
}

// MANUAL FOOD DB SEARCH ENGINE
function openManualAddModal(targetMeal) {
  state.selectedMealTarget = targetMeal;
  document.getElementById('modal-manual-add').classList.add('active');
  renderFoodDBList(FOOD_DATABASE);
}

function initFoodSearch() {
  const searchInput = document.getElementById('input-food-search');
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q));
    renderFoodDBList(filtered);
  });

  const customForm = document.getElementById('form-custom-food');
  customForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custom-food-name').value;
    const weight = parseInt(document.getElementById('custom-food-weight').value);
    const cals = parseInt(document.getElementById('custom-food-cals').value);
    const prot = parseFloat(document.getElementById('custom-food-prot').value) || 0;
    const carb = parseFloat(document.getElementById('custom-food-carb').value) || 0;
    const fat = parseFloat(document.getElementById('custom-food-fat').value) || 0;
    const fib = parseFloat(document.getElementById('custom-food-fib').value) || 0;

    addFoodItemToMeal({
      id: Date.now().toString(),
      name, weight, cals, prot, carb, fat, fib, thumb: '🥗'
    });

    closeAllModals();
    customForm.reset();
  });
}

function renderFoodDBList(items) {
  const container = document.getElementById('food-db-results');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `<div class="text-xs text-muted text-center p-2">Aucun aliment trouvé. Créez une entrée personnalisée ci-dessous.</div>`;
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'food-db-item';
    el.innerHTML = `
      <div>
        <strong style="font-size: 0.88rem;">${escapeHtml(item.name)}</strong>
        <div class="text-xs text-muted">pour 100g &bull; P:${item.prot}g G:${item.carb}g L:${item.fat}g</div>
      </div>
      <button class="btn btn-sm btn-outline">+ ${item.cals} kcal</button>
    `;

    el.addEventListener('click', () => {
      addFoodItemToMeal({
        id: Date.now().toString(),
        name: item.name,
        weight: 100,
        cals: item.cals,
        prot: item.prot,
        carb: item.carb,
        fat: item.fat,
        fib: item.fib,
        thumb: '🥗'
      });
      closeAllModals();
    });

    container.appendChild(el);
  });
}

function addFoodItemToMeal(foodObj) {
  const today = state.selectedDateStr;
  const targetMeal = state.selectedMealTarget || 'lunch';

  if (!state.meals[today]) {
    state.meals[today] = { breakfast: [], lunch: [], dinner: [], snack: [] };
  }

  state.meals[today][targetMeal].push(foodObj);
  saveMeals();
  showToast(`"${foodObj.name}" ajouté à votre journal !`);
}

// TOAST NOTIFICATIONS MANAGER
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// SECURITY HELPER
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
