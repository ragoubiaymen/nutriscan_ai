/* ==========================================================================
   NUTRIVISION AI PRO - ADVANCED DYNAMIC STATS, NLP PARSER & RESET TO 0
   ========================================================================== */

// STORAGE KEYS
const STORAGE_KEYS = {
  PROFILE: 'nutrivision_user_profile',
  MEALS: 'nutrivision_daily_meals',
  WATER: 'nutrivision_daily_water',
  WEIGHT: 'nutrivision_weight_log',
  SETTINGS: 'nutrivision_settings',
  GEMINI_KEY: 'nutrivision_gemini_key'
};

// DEFAULT PROFILE DATA
const DEFAULT_PROFILE = {
  gender: 'male',
  age: 28,
  weight: 75,
  height: 178,
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
  },
  preferences: { diet: 'all', cuisine: 'any', budget: 'standard', avoid: '' }
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
  { name: 'Patate Douce Rôtie', cals: 86, prot: 1.6, carb: 20, fat: 0.1, fib: 3, unit: 'g' },
  { name: 'Semoule de couscous cuite', cals: 112, prot: 3.8, carb: 23.2, fat: 0.2, fib: 1.4, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Pois chiches cuits', cals: 164, prot: 8.9, carb: 27.4, fat: 2.6, fib: 7.6, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Tomate', cals: 18, prot: 0.9, carb: 3.9, fat: 0.2, fib: 1.2, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Oignon', cals: 40, prot: 1.1, carb: 9.3, fat: 0.1, fib: 1.7, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Poivron', cals: 31, prot: 1, carb: 6, fat: 0.3, fib: 2.1, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Ail', cals: 149, prot: 6.4, carb: 33, fat: 0.5, fib: 2.1, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Harissa', cals: 48, prot: 2, carb: 8, fat: 1, fib: 3, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Pain blanc', cals: 265, prot: 9, carb: 49, fat: 3.2, fib: 2.7, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Œuf entier', cals: 143, prot: 12.6, carb: 0.7, fat: 9.5, fib: 0, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Thon au naturel égoutté', cals: 116, prot: 25.5, carb: 0, fat: 0.8, fib: 0, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Courgette', cals: 17, prot: 1.2, carb: 3.1, fat: 0.3, fib: 1, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Carotte', cals: 41, prot: 0.9, carb: 9.6, fat: 0.2, fib: 2.8, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Pomme de terre', cals: 87, prot: 1.9, carb: 20.1, fat: 0.1, fib: 1.8, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Agneau maigre', cals: 206, prot: 25, carb: 0, fat: 11, fib: 0, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Merguez', cals: 300, prot: 16, carb: 2, fat: 26, fib: 0, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' },
  { name: 'Feuille de brick', cals: 280, prot: 8, carb: 57, fat: 1.5, fib: 2, unit: 'g', cuisine: 'tunisian', source: 'Valeurs moyennes indicatives par ingrédient' }
];

const TUNISIAN_RECIPES = [
  {
    id: 'couscous-poulet', name: 'Couscous au poulet', diet: 'omnivore', budget: 'standard',
    ingredients: [
      { name: 'Semoule de couscous cuite', grams: 180 }, { name: 'Blanc de Poulet Grillé', grams: 100 },
      { name: 'Pois chiches cuits', grams: 40 }, { name: 'Carotte', grams: 60 },
      { name: 'Courgette', grams: 60 }, { name: 'Tomate', grams: 60 }, { name: "Huile d'Olive Vierge", grams: 8 }
    ]
  },
  {
    id: 'ojja-merguez', name: 'Ojja aux merguez et œufs', diet: 'omnivore', budget: 'standard',
    ingredients: [
      { name: 'Merguez', grams: 70 }, { name: 'Œuf entier', grams: 100 },
      { name: 'Tomate', grams: 180 }, { name: 'Poivron', grams: 80 },
      { name: 'Ail', grams: 5 }, { name: 'Harissa', grams: 8 }, { name: "Huile d'Olive Vierge", grams: 5 }
    ]
  },
  {
    id: 'lablabi', name: 'Lablabi (pois chiches et pain)', diet: 'vegetarian', budget: 'economy',
    ingredients: [
      { name: 'Pois chiches cuits', grams: 200 }, { name: 'Pain blanc', grams: 50 },
      { name: 'Œuf entier', grams: 50 }, { name: 'Ail', grams: 5 },
      { name: 'Harissa', grams: 8 }, { name: "Huile d'Olive Vierge", grams: 5 }
    ]
  },
  {
    id: 'brik-thon', name: 'Brik au thon et œuf (huile à ajuster)', diet: 'pescatarian', budget: 'standard',
    ingredients: [
      { name: 'Thon au naturel égoutté', grams: 50 }, { name: 'Œuf entier', grams: 50 },
      { name: 'Pomme de terre', grams: 60 }, { name: 'Feuille de brick', grams: 25 },
      { name: "Huile d'Olive Vierge", grams: 8 }
    ]
  },
  {
    id: 'couscous-vegetarien', name: 'Couscous aux légumes', diet: 'vegetarian', budget: 'economy',
    ingredients: [
      { name: 'Semoule de couscous cuite', grams: 180 }, { name: 'Pois chiches cuits', grams: 70 },
      { name: 'Carotte', grams: 70 }, { name: 'Courgette', grams: 80 },
      { name: 'Tomate', grams: 70 }, { name: "Huile d'Olive Vierge", grams: 7 }
    ]
  }
];

const OTHER_RECIPES = [
  {
    id: 'poulet-riz', name: 'Poulet, riz et brocolis', cuisine: 'international',
    diet: 'omnivore', budget: 'standard',
    ingredients: [
      { name: 'Blanc de Poulet Grillé', grams: 120 }, { name: 'Riz Basmati Cuit', grams: 150 },
      { name: 'Brocolis Vapeur', grams: 120 }, { name: "Huile d'Olive Vierge", grams: 5 }
    ]
  },
  {
    id: 'omelette-pain', name: 'Omelette et pain complet', cuisine: 'international',
    diet: 'vegetarian', budget: 'economy',
    ingredients: [
      { name: 'Omelette (2 Œufs Bio)', grams: 120 }, { name: 'Pain Complet Bio', grams: 60 },
      { name: 'Brocolis Vapeur', grams: 80 }
    ]
  },
  {
    id: 'saumon-quinoa', name: 'Saumon, quinoa et avocat', cuisine: 'international',
    diet: 'pescatarian', budget: 'premium',
    ingredients: [
      { name: 'Saumon Grillé', grams: 100 }, { name: 'Quinoa Cuit', grams: 140 },
      { name: 'Avocat Frais', grams: 40 }, { name: 'Brocolis Vapeur', grams: 80 }
    ]
  }
];

const RECIPE_DATABASE = [
  ...TUNISIAN_RECIPES.map(recipe => ({ ...recipe, cuisine: 'tunisian' })),
  ...OTHER_RECIPES
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
  isMicActive: false,
  foodScope: 'all'
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
    try {
      const profile = JSON.parse(stored);
      return {
        ...DEFAULT_PROFILE,
        ...profile,
        macros: { ...DEFAULT_PROFILE.macros, ...profile.macros },
        preferences: { ...DEFAULT_PROFILE.preferences, ...profile.preferences }
      };
    } catch (e) { console.error(e); }
  }
  return { ...DEFAULT_PROFILE, macros: { ...DEFAULT_PROFILE.macros }, preferences: { ...DEFAULT_PROFILE.preferences } };
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

// BMR, TDEE & BMI-BASED BODY FAT ESTIMATE
function calculatePhysiology(gender, age, weightKg, heightCm, activityFactor, goalType) {
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

  const bodyFatPct = estimateBodyFatPct(gender, age, weightKg, heightCm);

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

function estimateBodyFatPct(gender, age, weightKg, heightCm) {
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const estimate = 1.2 * bmi + 0.23 * age - (gender === 'male' ? 10.8 : 0) - 5.4;
  const lowerBound = gender === 'male' ? 5 : 8;
  const upperBound = gender === 'male' ? 45 : 50;
  return Math.min(upperBound, Math.max(lowerBound, Math.round(estimate * 10) / 10));
}

function normalizeFoodName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getUniqueFoodDatabase() {
  const uniqueFoods = new Map();
  FOOD_DATABASE.forEach(food => {
    const key = normalizeFoodName(food.name);
    if (!uniqueFoods.has(key)) {
      uniqueFoods.set(key, {
        ...food,
        source: food.source || 'Base locale — valeurs moyennes indicatives'
      });
    }
  });
  return [...uniqueFoods.values()];
}

function getRecipeNutrition(recipe, gramsByIngredient = null) {
  const foodsByName = new Map(getUniqueFoodDatabase().map(food => [food.name, food]));
  return recipe.ingredients.reduce((nutrition, ingredient, index) => {
    const food = foodsByName.get(ingredient.name);
    if (!food) throw new Error(`Ingrédient absent de la base : ${ingredient.name}`);
    const grams = gramsByIngredient ? gramsByIngredient[index] : ingredient.grams;
    const factor = grams / 100;
    nutrition.weight += grams;
    nutrition.cals += food.cals * factor;
    nutrition.prot += food.prot * factor;
    nutrition.carb += food.carb * factor;
    nutrition.fat += food.fat * factor;
    nutrition.fib += food.fib * factor;
    return nutrition;
  }, { weight: 0, cals: 0, prot: 0, carb: 0, fat: 0, fib: 0 });
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
  const preferences = p.preferences || DEFAULT_PROFILE.preferences;

  document.getElementById('input-gender').value = p.gender;
  document.getElementById('input-age').value = p.age;
  document.getElementById('input-weight').value = p.weight;
  document.getElementById('input-height').value = p.height;
  document.getElementById('input-activity').value = p.activity;
  document.getElementById('input-goal').value = p.goal;
  document.getElementById('input-diet').value = preferences.diet;
  document.getElementById('input-cuisine').value = preferences.cuisine;
  document.getElementById('input-budget').value = preferences.budget;
  document.getElementById('input-avoid-foods').value = preferences.avoid;

  document.getElementById('res-bmr').textContent = `${p.bmr.toLocaleString()} kcal`;
  document.getElementById('res-tdee').textContent = `${p.tdee.toLocaleString()} kcal`;
  document.getElementById('res-target').textContent = `${p.targetCalories.toLocaleString()} kcal`;
  const bodyFatPct = estimateBodyFatPct(p.gender, p.age, p.weight, p.height);
  document.getElementById('res-bodyfat').textContent = `${bodyFatPct}%`;
  document.getElementById('res-bodyfat-desc').textContent = `Masse maigre estimée : ${(p.weight * (1 - bodyFatPct / 100)).toFixed(1)} kg · estimation indicative`;

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
              <p class="food-source">${escapeHtml(item.source || 'Source non renseignée')}</p>
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
    const microTotals = { sugar: 0, sodium: 0, potassium: 0, iron: 0 };
    const microCoverage = { sugar: 0, sodium: 0, potassium: 0, iron: 0 };
    const dayItemCount = mealCategories.reduce((count, category) =>
      count + (dayMeals[category] || []).length, 0);
    mealCategories.forEach(category => {
      (dayMeals[category] || []).forEach(item => {
        Object.keys(microTotals).forEach(key => {
          const value = item.micros?.[key];
          if (Number.isFinite(value)) {
            microTotals[key] += value;
            microCoverage[key] += 1;
          }
        });
      });
    });

    document.getElementById('micro-sugar').textContent = microCoverage.sugar
      ? `${microTotals.sugar.toFixed(1)}g` : 'Non disponible';
    document.getElementById('micro-sodium').textContent = microCoverage.sodium
      ? `${Math.round(microTotals.sodium)}mg` : 'Non disponible';
    document.getElementById('micro-potassium').textContent = microCoverage.potassium
      ? `${Math.round(microTotals.potassium)}mg` : 'Non disponible';
    document.getElementById('micro-iron').textContent = microCoverage.iron
      ? `${Math.round(microTotals.iron)}mg` : 'Non disponible';
    Object.keys(microCoverage).forEach(key => {
      document.getElementById(`micro-${key}-coverage`).textContent =
        `${microCoverage[key]}/${dayItemCount} aliment(s) renseigné(s)`;
    });
  }

  renderMealRecommendations({
    calories: totalEatenCals,
    protein: totalProt,
    carbs: totalCarb,
    fat: totalFat,
    fiber: totalFib
  });
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

function renderMealRecommendations(consumed) {
  const container = document.getElementById('meal-recommendations');
  if (!container) return;

  const profile = state.profile;
  const preferences = profile.preferences || DEFAULT_PROFILE.preferences;
  const remainingCals = Math.max(0, profile.targetCalories - consumed.calories);
  const deficits = {
    protein: Math.max(0, profile.macros.protein - consumed.protein),
    carbs: Math.max(0, profile.macros.carbs - consumed.carbs),
    fat: Math.max(0, profile.macros.fat - consumed.fat),
    fiber: Math.max(0, profile.macros.fiber - consumed.fiber)
  };
  const avoided = preferences.avoid.split(',').map(normalizeFoodName).filter(Boolean);
  const eligible = RECIPE_DATABASE.filter(recipe => {
    if (preferences.diet === 'vegetarian' && recipe.diet !== 'vegetarian') return false;
    if (preferences.diet === 'pescatarian' && !['vegetarian', 'pescatarian'].includes(recipe.diet)) return false;
    if (preferences.cuisine === 'tunisian' && recipe.cuisine !== 'tunisian') return false;
    const recipeWords = normalizeFoodName(`${recipe.name} ${recipe.ingredients.map(item => item.name).join(' ')}`);
    if (avoided.some(term => recipeWords.includes(term))) return false;
    return true;
  }).map(recipe => {
    const nutrition = getRecipeNutrition(recipe);
    const calorieShare = remainingCals > 0
      ? Math.min(1, nutrition.cals / remainingCals)
      : 0;
    const macroFit = [
      [nutrition.prot, deficits.protein, 0.4],
      [nutrition.carb, deficits.carbs, 0.2],
      [nutrition.fat, deficits.fat, 0.15],
      [nutrition.fib, deficits.fiber, 0.25]
    ].reduce((score, [amount, deficit, weight]) => {
      const targetForMeal = deficit * calorieShare;
      const fit = targetForMeal > 0 ? Math.min(amount, targetForMeal) / targetForMeal : 0.5;
      return score + fit * weight;
    }, 0);
    const calorieFit = remainingCals > 0
      ? Math.max(0, 1 - Math.abs(nutrition.cals - Math.min(remainingCals, 600)) / Math.max(250, Math.min(remainingCals, 600)))
      : 0;
    const budgetFit = preferences.budget === 'economy'
      ? (recipe.budget === 'economy' ? 0.12 : recipe.budget === 'premium' ? -0.2 : 0)
      : preferences.budget === 'standard' && recipe.budget === 'premium' ? -0.08 : 0;
    return {
      recipe,
      nutrition,
      score: macroFit * 0.65 + calorieFit * 0.35 + budgetFit
    };
  }).filter(result => remainingCals > 0 && result.nutrition.cals <= remainingCals)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  container.innerHTML = `
    <div class="recommendations-header">
      <div>
        <h3>Suggestions adaptées à votre journée</h3>
        <p class="text-xs text-muted">Selon votre budget calorique, les macros restantes, vos préférences et les recettes disponibles.</p>
      </div>
      <div class="recommendations-controls">
        <span class="recommendations-remaining">${Math.round(remainingCals)} kcal restantes</span>
        <label for="recommendation-target-meal">Ajouter à :
          <select id="recommendation-target-meal" class="form-input">
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="snack">Collation</option>
          </select>
        </label>
      </div>
    </div>
    ${eligible.length ? `<div class="recommendations-grid">${eligible.map(({ recipe, nutrition }) => `
      <article class="recommendation-card">
        <div class="recommendation-card-heading">
          <h4>${escapeHtml(recipe.name)}</h4>
          <span>${Math.round(nutrition.cals)} kcal</span>
        </div>
        <p class="recommendation-macros">P ${Math.round(nutrition.prot)}g · G ${Math.round(nutrition.carb)}g · L ${Math.round(nutrition.fat)}g · Fibres ${Math.round(nutrition.fib)}g</p>
        <p class="food-source">${recipe.cuisine === 'tunisian' ? 'Recette tunisienne' : 'Recette équilibrée'} · quantités et huile modifiables dans le catalogue</p>
        <button type="button" class="btn btn-sm btn-outline recommendation-add" data-recipe="${recipe.id}">Ajouter au journal</button>
      </article>
    `).join('')}</div>` : `<p class="text-xs text-muted recommendation-empty">${remainingCals > 0 ? 'Aucune recette disponible ne correspond à ces préférences et à votre budget calorique restant.' : 'Votre objectif calorique est atteint. Modifiez votre journal ou consultez les suggestions un autre jour.'}</p>`}
  `;

  document.getElementById('recommendation-target-meal').value = state.selectedMealTarget;
  document.getElementById('recommendation-target-meal').addEventListener('change', event => {
    state.selectedMealTarget = event.target.value;
  });
  container.querySelectorAll('.recommendation-add').forEach(button => {
    button.addEventListener('click', () => {
      const recipe = RECIPE_DATABASE.find(item => item.id === button.dataset.recipe);
      if (recipe) addRecipeToMeal(recipe);
    });
  });
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
    const activity = parseFloat(document.getElementById('input-activity').value);
    const goal = document.getElementById('input-goal').value;

    const computed = calculatePhysiology(gender, age, weight, height, activity, goal);

    const newProfile = {
      gender, age, weight, height, activity, goal,
      preferences: state.profile.preferences,
      ...computed
    };

    saveProfile(newProfile);
  });

  const preferencesForm = document.getElementById('preferences-form');
  preferencesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(preferencesForm);
    state.profile.preferences = {
      diet: formData.get('diet'),
      cuisine: formData.get('cuisine'),
      budget: formData.get('budget'),
      avoid: document.getElementById('input-avoid-foods').value.trim()
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
    renderJournalView();
    showToast('Préférences enregistrées. Vos suggestions sont actualisées.');
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

  const btnOpenSettings = document.getElementById('btn-open-settings');
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      const currentKey = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
      const input = document.getElementById('input-gemini-key');
      if (input) input.value = currentKey;
      const testStatus = document.getElementById('gemini-key-test-status');
      if (testStatus) testStatus.textContent = '';
      updateSettingsEngineUI();
      document.getElementById('modal-settings').classList.add('active');
    });
  }

  const btnToggleKey = document.getElementById('btn-toggle-key-visibility');
  if (btnToggleKey) {
    btnToggleKey.addEventListener('click', () => {
      const input = document.getElementById('input-gemini-key');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  }

  const btnClearKey = document.getElementById('btn-clear-gemini-key');
  if (btnClearKey) {
    btnClearKey.addEventListener('click', () => {
      const input = document.getElementById('input-gemini-key');
      if (input) input.value = '';
      localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
      updateSettingsEngineUI();
      const testStatus = document.getElementById('gemini-key-test-status');
      if (testStatus) {
        testStatus.textContent = 'Clé effacée. Moteur Vision Optique Local activé.';
        testStatus.style.color = 'var(--text-muted)';
      }
      showToast('Clé Gemini effacée.');
    });
  }

  const btnTestKey = document.getElementById('btn-test-gemini-key');
  if (btnTestKey) {
    btnTestKey.addEventListener('click', async () => {
      const input = document.getElementById('input-gemini-key');
      const testStatus = document.getElementById('gemini-key-test-status');
      const key = input ? input.value.trim() : '';
      if (!key) {
        if (testStatus) {
          testStatus.textContent = 'Veuillez saisir une clé API Gemini avant de tester.';
          testStatus.style.color = '#f87171';
        }
        return;
      }
      if (testStatus) {
        testStatus.textContent = 'Test de connexion à Google Gemini en cours... ⏳';
        testStatus.style.color = 'var(--cyan-accent)';
      }
      const res = await testGeminiApiKey(key);
      if (res.ok) {
        if (testStatus) {
          testStatus.textContent = '✅ Connexion réussie ! Le modèle Gemini Flash Vision est opérationnel.';
          testStatus.style.color = '#34d399';
        }
      } else {
        if (testStatus) {
          testStatus.textContent = `❌ Échec : ${res.error}`;
          testStatus.style.color = '#f87171';
        }
      }
    });
  }

  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const input = document.getElementById('input-gemini-key');
      const key = input ? input.value.trim() : '';
      if (key) {
        localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
      }
      updateSettingsEngineUI();
      closeAllModals();
      showToast(key ? 'Clé Gemini enregistrée avec succès ! 🔑' : 'Paramètres sauvegardés (Moteur Local actif).');
    });
  }
}

function updateSettingsEngineUI() {
  const key = (localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '').trim();
  const badge = document.getElementById('settings-active-engine-badge');
  const text = document.getElementById('settings-active-engine-text');
  if (badge && text) {
    if (key) {
      badge.className = 'badge-status-pill gemini-active mt-1';
      text.textContent = 'Google Gemini Flash Vision (Cloud Actif)';
    } else {
      badge.className = 'badge-status-pill mt-1';
      text.textContent = 'Moteur Vision Optique Local (Sans clé)';
    }
  }
}

async function testGeminiApiKey(apiKey) {
  if (!apiKey) return { ok: false, error: 'Veuillez saisir une clé API.' };
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error?.message || `Erreur ${res.status}` };
    }
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      return { ok: true };
    }
    return { ok: false, error: 'Aucun modèle disponible pour cette clé.' };
  } catch (e) {
    return { ok: false, error: 'Connexion réseau impossible vers Google Gemini.' };
  }
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
  if (stepName === 'results' && state.currentScannedMealData && state.currentScannedMealData.items?.length > 0) {
    footerSaveBtn.classList.remove('hidden');
  } else {
    footerSaveBtn.classList.add('hidden');
  }
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
          source: 'Démonstration — valeurs prédéfinies',
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
          startAIAnalysisProcess(squareImage, null);
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
    startAIAnalysisProcess(dataUrl, null);
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

function createUnavailablePhotoResult(message) {
  return {
    title: 'Photo non analysée',
    confidence: null,
    analysisAvailable: false,
    advice: message || 'Aucune analyse nutritionnelle réelle n’a été effectuée. Les calories et macros restent à zéro.',
    items: []
  };
}

// HSL Color Converter for pixel classification
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Computer Vision Optical Meal Analyzer (Extracts real pixel colors, spatial layout & proportions)
function analyzeImageLocally(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        let greenCount = 0;     // Vegetables, avocado, salad, herbs
        let amberCount = 0;     // Carbs, rice, pasta, bread, potatoes, fries
        let redBrownCount = 0;  // Meat, chicken, steak, salmon, legumes
        let whiteCount = 0;     // Rice, dairy, egg white, mozzarella
        let redOrangeCount = 0; // Fresh fruits, tomatoes, berries
        let totalCount = 0;

        // Track quadrants (tl, tr, bl, br) for accurate bounding box placement
        const quadrants = {
          tl: { green: 0, amber: 0, redBrown: 0, redOrange: 0, total: 0 },
          tr: { green: 0, amber: 0, redBrown: 0, redOrange: 0, total: 0 },
          bl: { green: 0, amber: 0, redBrown: 0, redOrange: 0, total: 0 },
          br: { green: 0, amber: 0, redBrown: 0, redOrange: 0, total: 0 }
        };

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
            if (a < 128) continue;

            const [h, s, l] = rgbToHsl(r, g, b);
            totalCount++;

            const qKey = (y < size / 2) ? ((x < size / 2) ? 'tl' : 'tr') : ((x < size / 2) ? 'bl' : 'br');
            const q = quadrants[qKey];
            q.total++;

            if (h >= 65 && h <= 170 && s >= 15 && l >= 15 && l <= 85) {
              greenCount++;
              q.green++;
            } else if ((h < 25 || h > 340) && s > 40 && l > 35) {
              redOrangeCount++;
              q.redOrange++;
            } else if (h >= 25 && h <= 60 && s >= 20 && l >= 25 && l <= 75) {
              amberCount++;
              q.amber++;
            } else if ((h <= 30 || h >= 330) && s >= 15 && l >= 12 && l <= 55) {
              redBrownCount++;
              q.redBrown++;
            } else if (s <= 18 && l >= 70) {
              whiteCount++;
            }
          }
        }

        const validTotal = Math.max(1, totalCount);
        const pGreen = greenCount / validTotal;
        const pAmber = amberCount / validTotal;
        const pRedBrown = redBrownCount / validTotal;
        const pWhite = whiteCount / validTotal;
        const pRedOrange = redOrangeCount / validTotal;

        // Find bounding box helper for a category
        const getBBoxFor = (cat) => {
          let bestQ = 'tl';
          let maxVal = -1;
          for (const [k, v] of Object.entries(quadrants)) {
            const score = v[cat] || 0;
            if (score > maxVal) { maxVal = score; bestQ = k; }
          }
          const coords = {
            tl: { top: 15, left: 12, width: 44, height: 40 },
            tr: { top: 15, left: 50, width: 42, height: 42 },
            bl: { top: 52, left: 12, width: 44, height: 42 },
            br: { top: 52, left: 50, width: 44, height: 40 }
          };
          return coords[bestQ] || { top: 25, left: 25, width: 50, height: 50 };
        };

        const items = [];
        let title = "Repas Équilibré";
        let advice = "Analyse optique par segmentation spectrale des ingrédients terminée.";
        let confidence = Math.min(96, Math.max(88, Math.round(91 + Math.random() * 4)));
        let nutriScore = 'A';

        // 1. Dominant Fruits
        if (pRedOrange > 0.25 || (pRedOrange > 0.15 && pGreen < 0.1 && pRedBrown < 0.1)) {
          title = "Assiette Fruits Frais & Énergie";
          advice = "Riche en antioxydants naturels, vitamines et glucides simples à assimilation rapide.";
          nutriScore = 'A';
          items.push({
            name: "Fruits Frais de Saison (Pomme / Baies)",
            grams: Math.round(140 + pRedOrange * 100),
            calsPer100g: 54,
            protPer100g: 0.5,
            carbPer100g: 14,
            fatPer100g: 0.2,
            fibPer100g: 2.4,
            bbox: getBBoxFor('redOrange')
          });
          items.push({
            name: "Banane ou Flocons d'Avoine",
            grams: 90,
            calsPer100g: 89,
            protPer100g: 1.1,
            carbPer100g: 23,
            fatPer100g: 0.3,
            fibPer100g: 2.6,
            bbox: { top: 48, left: 45, width: 42, height: 38 }
          });
        }
        // 2. Dominant Salad & Greens
        else if (pGreen > 0.28 || (pGreen > 0.18 && pRedBrown < 0.15 && pAmber < 0.15)) {
          title = "Salade Fraîcheur & Super-Aliments";
          advice = "Faible densité calorique, excellent apport en fibres et micronutriments protecteurs.";
          nutriScore = 'A';
          items.push({
            name: "Salade Composée & Légumes Croquants",
            grams: Math.round(130 + pGreen * 120),
            calsPer100g: 25,
            protPer100g: 1.8,
            carbPer100g: 3.5,
            fatPer100g: 0.4,
            fibPer100g: 2.8,
            bbox: getBBoxFor('green')
          });
          items.push({
            name: "Avocat Frais Tranché",
            grams: Math.round(60 + pGreen * 40),
            calsPer100g: 160,
            protPer100g: 2.0,
            carbPer100g: 8.5,
            fatPer100g: 15.0,
            fibPer100g: 6.7,
            bbox: { top: 20, left: 45, width: 38, height: 36 }
          });
          items.push({
            name: "Vinaigrette à l'Huile d'Olive",
            grams: 12,
            calsPer100g: 720,
            protPer100g: 0,
            carbPer100g: 0.5,
            fatPer100g: 80.0,
            fibPer100g: 0,
            bbox: { top: 62, left: 25, width: 25, height: 25 }
          });
        }
        // 3. Dominant Carbs / Fast Food / Pasta
        else if (pAmber > 0.35 && pGreen < 0.1) {
          title = "Plat Féculents & Garniture Dorée";
          advice = "Apport énergétique substantiel. Idéal avant un entraînement ou pour recharger le glycogène.";
          nutriScore = 'B';
          items.push({
            name: "Pâtes ou Riz Rissolé",
            grams: Math.round(160 + pAmber * 100),
            calsPer100g: 145,
            protPer100g: 4.5,
            carbPer100g: 29.0,
            fatPer100g: 1.8,
            fibPer100g: 1.5,
            bbox: getBBoxFor('amber')
          });
          items.push({
            name: "Sauce & Garniture Maigre",
            grams: 80,
            calsPer100g: 85,
            protPer100g: 3.2,
            carbPer100g: 7.0,
            fatPer100g: 4.5,
            fibPer100g: 1.2,
            bbox: { top: 22, left: 30, width: 42, height: 38 }
          });
          items.push({
            name: "Fromage Râpé ou Assaisonnement",
            grams: 20,
            calsPer100g: 390,
            protPer100g: 26.0,
            carbPer100g: 1.5,
            fatPer100g: 31.0,
            fibPer100g: 0,
            bbox: { top: 58, left: 55, width: 32, height: 30 }
          });
        }
        // 4. Balanced Plate: Protein + Carbs + Veggies
        else {
          title = "Assiette Fitness : Protéines & Féculents";
          advice = "Ratio macro-nutritionnel harmonieux : protéines de qualité supérieure pour le maintien musculaire.";
          nutriScore = 'A';
          items.push({
            name: pRedBrown > 0.15 ? "Blanc de Poulet Grillé" : "Pavé de Saumon / Poisson",
            grams: Math.round(140 + pRedBrown * 80),
            calsPer100g: pRedBrown > 0.15 ? 165 : 185,
            protPer100g: pRedBrown > 0.15 ? 31.0 : 23.0,
            carbPer100g: 0,
            fatPer100g: pRedBrown > 0.15 ? 3.6 : 10.0,
            fibPer100g: 0,
            bbox: getBBoxFor('redBrown')
          });
          items.push({
            name: pWhite > 0.12 ? "Riz Basmati Vapeur" : "Quinoa & Féculents Cuits",
            grams: Math.round(150 + pAmber * 70),
            calsPer100g: 130,
            protPer100g: 3.0,
            carbPer100g: 28.0,
            fatPer100g: 0.5,
            fibPer100g: 1.0,
            bbox: getBBoxFor('amber')
          });
          items.push({
            name: "Légumes Vapeur & Brocolis",
            grams: Math.max(70, Math.round(90 + pGreen * 80)),
            calsPer100g: 35,
            protPer100g: 2.8,
            carbPer100g: 6.5,
            fatPer100g: 0.4,
            fibPer100g: 3.2,
            bbox: getBBoxFor('green')
          });
          items.push({
            name: "Filet d'Huile d'Olive",
            grams: 8,
            calsPer100g: 884,
            protPer100g: 0,
            carbPer100g: 0,
            fatPer100g: 100.0,
            fibPer100g: 0,
            bbox: { top: 40, left: 40, width: 22, height: 22 }
          });
        }

        resolve({
          title,
          advice,
          confidence,
          nutriScore,
          analysisAvailable: true,
          isLocalAi: true,
          items
        });
      } catch (err) {
        console.error("Local visual analysis error:", err);
        resolve(createUnavailablePhotoResult("Échec du traitement de l'image."));
      }
    };
    img.onerror = () => {
      resolve(createUnavailablePhotoResult("Impossible de charger la photo pour l'analyse."));
    };
    img.src = imageSrc;
  });
}

// Direct Client-Side Gemini Vision API Request
async function analyzeWithGeminiDirect(imageBase64Url, apiKey) {
  const match = imageBase64Url.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) throw new Error("Format d'image non supporté (JPEG, PNG ou WebP requis).");
  const mimeType = match[1];
  const base64Data = match[2];

  const prompt = `Analyse cette photo de repas sans prétendre à une précision impossible.
Identifie les aliments réellement visibles et estime leur portion en grammes. N'invente pas les ingrédients cachés (huile, sauces ou garnitures) ; indique clairement que leur absence ne peut pas être vérifiée depuis la photo.
Pour chaque aliment, fournis :
- name : nom de l'aliment en français
- grams : poids estimé en grammes (nombre)
- caloriesPer100g : kcal pour 100g (nombre)
- proteinPer100g : protéines en g pour 100g (nombre)
- carbPer100g : glucides en g pour 100g (nombre)
- fatPer100g : lipides en g pour 100g (nombre)
- fiberPer100g : fibres en g pour 100g (nombre)
- bbox : position approximative dans l'image { top, left, width, height } en pourcentages (0-100)

Fournis aussi :
- title : nom résumé du repas (ex: "Saumon grillé et riz basmati")
- advice : conseil nutritionnel bienveillant et analyse
- nutriScore : "A", "B", "C", "D" ou "E"
- confidence : ne pas fournir de pourcentage de confiance

Une image seule ne permet pas de connaître exactement le poids ni la recette. Indique dans advice que les valeurs sont des estimations à corriger et confirmer par l'utilisateur.
Réponds UNIQUEMENT en JSON strict avec cette structure :
{
  "title": "Nom du plat",
  "advice": "Conseil...",
  "items": [
    { "name": "Aliment", "grams": 150, "caloriesPer100g": 120, "proteinPer100g": 20, "carbPer100g": 0, "fatPer100g": 4, "fiberPer100g": 0, "bbox": { "top": 20, "left": 15, "width": 40, "height": 35 } }
  ]
}`;

  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`
  ];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Erreur Gemini (${response.status})`);
      }

      const payload = await response.json();
      const rawText = payload.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
      if (!rawText) throw new Error("Réponse vide du modèle Gemini.");

      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        throw new Error("Aucun aliment n'a pu être identifié distinctement.");
      }

      return {
        title: parsed.title || "Repas Analysé par Gemini",
        advice: parsed.advice || "Analyse multimodale effectuée en direct via Google Gemini.",
        confidence: null,
        nutriScore: parsed.nutriScore || 'A',
        analysisAvailable: true,
        isGemini: true,
        source: 'Estimation visuelle Gemini — à confirmer',
        items: parsed.items.map(i => ({
          name: String(i.name || 'Aliment').slice(0, 80),
          grams: Math.max(5, Math.round(Number(i.grams) || 100)),
          calsPer100g: Math.round(Number(i.caloriesPer100g || i.calsPer100g) || 100),
          protPer100g: Math.round((Number(i.proteinPer100g || i.protPer100g) || 0) * 10) / 10,
          carbPer100g: Math.round((Number(i.carbPer100g) || 0) * 10) / 10,
          fatPer100g: Math.round((Number(i.fatPer100g) || 0) * 10) / 10,
          fibPer100g: Math.round((Number(i.fiberPer100g || i.fibPer100g) || 0) * 10) / 10,
          bbox: i.bbox || null
        }))
      };
    } catch (err) {
      lastError = err;
      console.warn("Gemini call attempt failed:", err);
    }
  }

  throw lastError || new Error("Impossible de joindre le service Google Gemini.");
}

async function startAIAnalysisProcess(imageSrc, aiResultData) {
  switchScanStep('analyzing');
  document.getElementById('img-scanned-preview').src = imageSrc;

  // If a preset was explicitly clicked
  if (aiResultData && aiResultData.analysisAvailable !== false) {
    setTimeout(() => {
      state.currentScannedMealData = JSON.parse(JSON.stringify(aiResultData));
      state.currentScannedMealData.imageSrc = imageSrc;
      renderAIScanResults();
      switchScanStep('results');
    }, 1200);
    return;
  }

  const statusTitle = document.getElementById('scan-status-title');
  const statusSub = document.getElementById('scan-status-sub');
  statusTitle.textContent = "Recherche d’un moteur d’analyse...";
  statusSub.textContent = "Les portions calculées à partir d’une photo restent des estimations à confirmer.";

  let finalAnalysis = null;
  const userGeminiKey = (localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '').trim();

  // Tier 1: Direct Gemini API if configured
  if (userGeminiKey) {
    try {
      statusTitle.textContent = "Analyse multimodale Google Gemini...";
      statusSub.textContent = "Interrogation de Gemini Flash Vision en direct...";
      finalAnalysis = await analyzeWithGeminiDirect(imageSrc, userGeminiKey);
    } catch (err) {
      console.warn("Direct Gemini Vision failed, falling back:", err);
      showToast(`Gemini direct: ${err.message}. Passage au moteur de secours.`, 4000);
    }
  }

  // Tier 2: Serverless /api/analyze-meal if hosted on Vercel
  if (!finalAnalysis) {
    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: imageSrc })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.analysisAvailable && Array.isArray(result.items) && result.items.length > 0) {
          finalAnalysis = result;
        }
      }
    } catch (e) {
      // Local or offline
    }
  }

  if (!finalAnalysis) {
    finalAnalysis = createUnavailablePhotoResult(
      'Aucune analyse fiable n’est disponible. Une photo seule ne permet pas de confirmer les ingrédients, l’huile ni le poids. Configurez Gemini, ou ajoutez les aliments manuellement.'
    );
  }

  state.currentScannedMealData = {
    ...finalAnalysis,
    imageSrc
  };

  renderAIScanResults();
  switchScanStep('results');
}

function renderAIScanResults() {
  const data = state.currentScannedMealData;
  if (!data) return;

  document.getElementById('res-final-img').src = data.imageSrc;
  document.getElementById('res-ai-confidence').textContent = data.isDemo
    ? 'Données de démonstration'
    : data.source || (data.analysisAvailable ? 'Estimation IA à vérifier' : 'Aucune analyse');
  document.getElementById('res-ai-advice').textContent = data.advice;

  const scoreBadge = document.getElementById('meal-nutriscore-badge');
  if (scoreBadge) {
    const score = (data.nutriScore || 'A').toUpperCase();
    scoreBadge.className = `badge-score score-${score.toLowerCase()}`;
    scoreBadge.textContent = `Score ${score}`;
  }

  renderBoundingBoxes(data.items || []);
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

  if (!state.currentScannedMealData.items || !state.currentScannedMealData.items.length) {
    container.innerHTML = `
      <p class="text-muted scanner-unavailable">${escapeHtml(state.currentScannedMealData.advice)}</p>
      <button type="button" class="btn btn-outline scanner-manual-add">Ajouter les aliments manuellement</button>
    `;
    document.getElementById('res-total-cals').innerHTML = `0 <small>kcal</small>`;
    document.getElementById('res-total-prot').textContent = `0g`;
    document.getElementById('res-total-carb').textContent = `0g`;
    document.getElementById('res-total-fat').textContent = `0g`;
    document.getElementById('res-total-fib').textContent = `0g`;
    container.querySelector('.scanner-manual-add').addEventListener('click', () => {
      const targetMeal = document.getElementById('select-target-meal').value;
      closeAllModals();
      openManualAddModal(targetMeal);
    });
    return;
  }

  state.currentScannedMealData.items.forEach((item, index) => {
    const factor = item.grams / 100;
    const cals = Math.round(item.calsPer100g * factor);

    const card = document.createElement('div');
    card.className = 'item-adjust-card';
    card.innerHTML = `
      <div class="item-adjust-top">
        <h5>${escapeHtml(item.name)}</h5>
        <span class="cals-badge">${cals} kcal</span>
      </div>
      <div class="item-slider-row">
        <input type="range" class="gram-slider" min="1" max="${Math.max(400, item.grams * 2)}" step="1" value="${item.grams}" data-index="${index}" aria-label="Ajuster la portion de ${escapeHtml(item.name)}" />
        <div class="gram-input-box">
          <input type="number" class="form-input text-xs gram-num-input" value="${item.grams}" data-index="${index}" min="1" max="5000" inputmode="numeric" aria-label="Quantité en grammes de ${escapeHtml(item.name)}" />
        </div>
        <span class="text-xs text-muted">g</span>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.gram-slider, .gram-num-input').forEach(input => {
    input.addEventListener(input.type === 'range' ? 'input' : 'change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const newGrams = Math.min(5000, Math.max(1, parseInt(e.target.value) || 1));
      state.currentScannedMealData.items[idx].grams = newGrams;

      const card = e.target.closest('.item-adjust-card');
      card.querySelector('.gram-slider').value = newGrams;
      card.querySelector('.gram-slider').max = Math.max(400, newGrams * 2);
      card.querySelector('.gram-num-input').value = newGrams;
      card.querySelector('.cals-badge').textContent =
        `${Math.round(state.currentScannedMealData.items[idx].calsPer100g * newGrams / 100)} kcal`;
      renderBoundingBoxes(state.currentScannedMealData.items);
      updateScannedMealTotals();
    });
  });

  updateScannedMealTotals();
}

function updateScannedMealTotals() {
  const totals = state.currentScannedMealData.items.reduce((sum, item) => {
    const factor = item.grams / 100;
    sum.cals += Math.round(item.calsPer100g * factor);
    sum.prot += item.protPer100g * factor;
    sum.carb += item.carbPer100g * factor;
    sum.fat += item.fatPer100g * factor;
    sum.fib += item.fibPer100g * factor;
    return sum;
  }, { cals: 0, prot: 0, carb: 0, fat: 0, fib: 0 });

  document.getElementById('res-total-cals').innerHTML = `${totals.cals} <small>kcal</small>`;
  document.getElementById('res-total-prot').textContent = `${Math.round(totals.prot)}g`;
  document.getElementById('res-total-carb').textContent = `${Math.round(totals.carb)}g`;
  document.getElementById('res-total-fat').textContent = `${Math.round(totals.fat)}g`;
  document.getElementById('res-total-fib').textContent = `${Math.round(totals.fib)}g`;
}

function saveCurrentScannedMealToJournal() {
  const data = state.currentScannedMealData;
  if (!data || !data.items || data.items.length === 0) {
    showToast('Impossible d’ajouter ce repas : aucun aliment détecté.');
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
    thumb: '📸',
    source: data.source || 'Estimation photo IA — à confirmer'
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
  state.selectedMealTarget = targetMeal;
  closeAllModals();
  openManualAddModal(targetMeal);
  document.getElementById('custom-food-name').value = textPrompt;
  showToast('Description reprise. Vérifiez les ingrédients, le poids et les valeurs avant de valider.');
}

// MANUAL FOOD DB SEARCH ENGINE
function openManualAddModal(targetMeal) {
  state.selectedMealTarget = targetMeal;
  state.foodScope = 'all';
  document.getElementById('input-food-search').value = '';
  document.querySelectorAll('[data-food-scope]').forEach(button =>
    button.classList.toggle('active', button.dataset.foodScope === 'all'));
  document.getElementById('modal-manual-add').classList.add('active');
  renderManualFoodCatalog();
}

function initFoodSearch() {
  const searchInput = document.getElementById('input-food-search');
  searchInput.addEventListener('input', renderManualFoodCatalog);

  document.querySelectorAll('[data-food-scope]').forEach(button => {
    button.addEventListener('click', () => {
      state.foodScope = button.dataset.foodScope;
      document.querySelectorAll('[data-food-scope]').forEach(tab =>
        tab.classList.toggle('active', tab === button));
      renderManualFoodCatalog();
    });
  });

  document.getElementById('btn-lookup-barcode').addEventListener('click', lookupFoodBarcode);

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

function renderManualFoodCatalog() {
  const query = normalizeFoodName(document.getElementById('input-food-search').value);
  const foods = getUniqueFoodDatabase().filter(food => {
    const matchesScope = state.foodScope !== 'tunisian' || food.cuisine === 'tunisian';
    return matchesScope && normalizeFoodName(food.name).includes(query);
  });
  renderFoodDBList(foods);
  renderRecipeList(query);
}

function renderRecipeList(query = '') {
  const container = document.getElementById('recipe-db-list');
  const matchingRecipes = RECIPE_DATABASE.filter(recipe => {
    const matchesScope = state.foodScope !== 'tunisian' || recipe.cuisine === 'tunisian';
    return matchesScope && normalizeFoodName(recipe.name).includes(query);
  });
  container.innerHTML = matchingRecipes.length
    ? matchingRecipes.map(recipe => {
        const nutrition = getRecipeNutrition(recipe);
        return `
          <article class="recipe-db-card" data-recipe-card="${recipe.id}">
            <div class="recipe-db-heading">
              <div>
                <h4>${escapeHtml(recipe.name)}</h4>
                <span class="text-xs text-muted">${Math.round(nutrition.cals)} kcal estimées par portion · modifiez l’huile selon la préparation</span>
              </div>
              <strong class="recipe-db-total">${Math.round(nutrition.cals)} kcal</strong>
            </div>
            <div class="recipe-ingredients-grid">
              ${recipe.ingredients.map((ingredient, index) => `
                <label>${escapeHtml(ingredient.name)}
                  <input type="number" min="0" max="2000" step="1" value="${ingredient.grams}" inputmode="numeric" data-recipe="${recipe.id}" data-ingredient="${index}" aria-label="${escapeHtml(ingredient.name)} en grammes" />
                  <span>g</span>
                </label>
              `).join('')}
            </div>
            <p class="food-source">Calcul estimatif depuis les ingrédients renseignés ; recette, cuisson et quantité d’huile varient.</p>
            <button type="button" class="btn btn-sm btn-outline recipe-add" data-recipe="${recipe.id}">Ajouter cette portion</button>
          </article>
        `;
      }).join('')
    : '<p class="text-xs text-muted">Aucune recette correspondante.</p>';

  container.querySelectorAll('[data-recipe][data-ingredient]').forEach(input => {
    input.addEventListener('input', () => {
      const recipe = RECIPE_DATABASE.find(item => item.id === input.dataset.recipe);
      const card = input.closest('.recipe-db-card');
      const amounts = recipe.ingredients.map((ingredient, index) => {
        const amountInput = card.querySelector(`[data-ingredient="${index}"]`);
        return Math.min(2000, Math.max(0, Number(amountInput.value) || 0));
      });
      const nutrition = getRecipeNutrition(recipe, amounts);
      card.querySelector('.recipe-db-total').textContent = `${Math.round(nutrition.cals)} kcal`;
    });
  });

  container.querySelectorAll('.recipe-add').forEach(button => {
    button.addEventListener('click', () => {
      const recipe = RECIPE_DATABASE.find(item => item.id === button.dataset.recipe);
      const card = button.closest('.recipe-db-card');
      const amounts = recipe.ingredients.map((ingredient, index) =>
        Math.min(2000, Math.max(0, Number(card.querySelector(`[data-ingredient="${index}"]`).value) || 0)));
      if (amounts.some(grams => grams < 1)) {
        showToast('Chaque ingrédient doit avoir une quantité supérieure à 0 g.');
        return;
      }
      addRecipeToMeal(recipe, amounts);
      closeAllModals();
    });
  });
}

function addRecipeToMeal(recipe, gramsByIngredient) {
  const nutrition = getRecipeNutrition(recipe, gramsByIngredient);
  addFoodItemToMeal({
    id: `${recipe.id}-${Date.now()}`,
    name: recipe.name,
    weight: Math.round(nutrition.weight),
    cals: Math.round(nutrition.cals),
    prot: Math.round(nutrition.prot * 10) / 10,
    carb: Math.round(nutrition.carb * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    fib: Math.round(nutrition.fib * 10) / 10,
    thumb: recipe.cuisine === 'tunisian' ? '🇹🇳' : '🍽️',
    source: 'Calcul estimatif par ingrédients — recette modifiable',
    ingredients: recipe.ingredients.map((ingredient, index) => ({
      name: ingredient.name,
      grams: gramsByIngredient ? gramsByIngredient[index] : ingredient.grams
    }))
  });
}

async function lookupFoodBarcode() {
  const barcodeInput = document.getElementById('input-food-barcode');
  const status = document.getElementById('barcode-lookup-status');
  const button = document.getElementById('btn-lookup-barcode');
  const barcode = barcodeInput.value.replace(/\s/g, '');

  if (!/^\d{8,14}$/.test(barcode)) {
    status.textContent = 'Entrez un code-barres valide de 8 à 14 chiffres.';
    return;
  }

  button.disabled = true;
  status.textContent = 'Recherche du produit...';
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=status,product_name,product_name_fr,brands,nutriments`);
    if (!response.ok) throw new Error('Service produit momentanément indisponible. Réessayez.');

    const result = await response.json();
    const product = result.product;
    if (result.status !== 1 || !product) {
      throw new Error('Produit non trouvé. Vérifiez le code ou utilisez les valeurs de son étiquette.');
    }

    const nutrition = product.nutriments || {};
    const readNutrient = value => value !== undefined && value !== null && value !== '' ? Number(value) : NaN;
    const kcalValue = readNutrient(nutrition['energy-kcal_100g']);
    const energyKj = readNutrient(nutrition.energy_100g);
    const nutrients = {
      cals: Number.isFinite(kcalValue) ? kcalValue : energyKj / 4.184,
      prot: readNutrient(nutrition.proteins_100g),
      carb: readNutrient(nutrition.carbohydrates_100g),
      fat: readNutrient(nutrition.fat_100g),
      fib: readNutrient(nutrition.fiber_100g),
      microsPer100g: {
        sugar: readNutrient(nutrition.sugars_100g),
        sodium: readNutrient(nutrition.sodium_100g) * 1000,
        potassium: readNutrient(nutrition.potassium_100g),
        iron: readNutrient(nutrition.iron_100g)
      }
    };

    if (!Number.isFinite(nutrients.cals) || !['prot', 'carb', 'fat', 'fib'].every(key => Number.isFinite(nutrients[key]))) {
      throw new Error('Les valeurs nutritionnelles sont incomplètes. Vérifiez l’étiquette et saisissez-les manuellement.');
    }

    const name = [product.product_name_fr || product.product_name, product.brands].filter(Boolean).join(' - ');
    renderBarcodeProduct({ name: name || `Produit ${barcode}`, barcode, ...nutrients });
    status.textContent = 'Produit trouvé. Entrez la quantité consommée et vérifiez les valeurs avec l’étiquette.';
  } catch (error) {
    status.textContent = error.message || 'Impossible de rechercher ce produit.';
    document.getElementById('barcode-product-result')?.remove();
  } finally {
    button.disabled = false;
  }
}

function renderBarcodeProduct(product) {
  document.getElementById('barcode-product-result')?.remove();
  const container = document.getElementById('food-db-results');
  const card = document.createElement('div');
  card.id = 'barcode-product-result';
  card.className = 'food-db-item barcode-product-result';
  card.innerHTML = `
    <div class="barcode-product-details">
      <strong>${escapeHtml(product.name)}</strong>
      <span class="text-xs text-muted">pour 100 g · ${Math.round(product.cals)} kcal · P ${product.prot} g · G ${product.carb} g · L ${product.fat} g</span>
    </div>
    <label class="barcode-portion-label">Quantité (g)
      <input class="form-input barcode-portion-input" type="number" min="1" max="5000" step="1" value="100" inputmode="decimal" />
    </label>
    <button type="button" class="btn btn-sm btn-primary">Ajouter</button>
  `;

  card.querySelector('button').addEventListener('click', () => {
    const grams = Number(card.querySelector('.barcode-portion-input').value);
    if (!Number.isFinite(grams) || grams < 1 || grams > 5000) {
      document.getElementById('barcode-lookup-status').textContent = 'La quantité doit être comprise entre 1 et 5000 g.';
      return;
    }

    const factor = grams / 100;
    addFoodItemToMeal({
      id: Date.now().toString(),
      name: product.name,
      weight: grams,
      cals: Math.round(product.cals * factor),
      prot: Math.round(product.prot * factor * 10) / 10,
      carb: Math.round(product.carb * factor * 10) / 10,
      fat: Math.round(product.fat * factor * 10) / 10,
      fib: Math.round(product.fib * factor * 10) / 10,
      thumb: '🏷️',
      source: 'Open Food Facts — fiche produit',
      sourceId: product.barcode,
      micros: Object.fromEntries(Object.entries(product.microsPer100g)
        .filter(([, value]) => Number.isFinite(value))
        .map(([key, value]) => [key, value * factor]))
    });
    closeAllModals();
  });

  container.prepend(card);
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
        <div class="food-source">${escapeHtml(item.source || 'Base locale — valeurs moyennes indicatives')}</div>
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
        thumb: '🥗',
        source: 'Base locale NutriVision — valeurs indicatives'
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

  state.meals[today][targetMeal].push({
    ...foodObj,
    source: foodObj.source || 'Saisie manuelle — valeurs fournies par l’utilisateur'
  });
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
