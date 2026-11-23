// Calculs physiologiques côté serveur : Mifflin-St Jeor & TDEE

export function calculateBMR(gender, weightKg, heightCm, ageYears) {
  // Mifflin-St Jeor Equation
  // Homme : 10 * poids + 6.25 * taille - 5 * age + 5
  // Femme : 10 * poids + 6.25 * taille - 5 * age - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === 'female' ? Math.round(base - 161) : Math.round(base + 5);
}

export function calculateTDEE(bmr, activityLevel) {
  // Activity Multipliers:
  // 1.2 = Sédentaire
  // 1.375 = Légèrement actif (1-3 séances/semaine)
  // 1.55 = Modérément actif (3-5 séances/semaine)
  // 1.725 = Très actif (6-7 séances intenses)
  // 1.9 = Athlète d'élite / travail physique lourd
  const factor = Number(activityLevel) || 1.375;
  return Math.round(bmr * factor);
}

export function calculateNutritionTargets(profile) {
  const {
    gender = 'male',
    age = 28,
    weight = 75,
    height = 178,
    activity = 1.375,
    goal = 'deficit_moderate', // 'deficit_aggressive', 'deficit_moderate', 'maintenance', 'surplus_lean', 'surplus_heavy'
    dietPreference = 'balanced' // 'balanced', 'high_protein', 'keto', 'vegetarian'
  } = profile;

  const bmr = calculateBMR(gender, Number(weight), Number(height), Number(age));
  const tdee = calculateTDEE(bmr, activity);

  // Ajustement calorique selon objectif
  let targetCalories = tdee;
  if (goal === 'deficit_aggressive') targetCalories = Math.max(1200, tdee - 500);
  else if (goal === 'deficit_moderate') targetCalories = Math.max(1200, tdee - 300);
  else if (goal === 'maintenance') targetCalories = tdee;
  else if (goal === 'surplus_lean') targetCalories = tdee + 250;
  else if (goal === 'surplus_heavy') targetCalories = tdee + 500;

  // Calcul des macronutriments cibles
  // Protéines : 1.8g - 2.2g par kg selon objectif
  let proteinGrams = Math.round(Number(weight) * (goal.includes('deficit') ? 2.0 : 1.8));
  if (dietPreference === 'high_protein') proteinGrams = Math.round(Number(weight) * 2.2);

  // Lipides : 25% à 30% des calories totales (9 kcal / g)
  let fatPct = 0.28;
  if (dietPreference === 'keto') fatPct = 0.65;
  const fatCalories = targetCalories * fatPct;
  const fatGrams = Math.round(fatCalories / 9);

  // Glucides : Le restant des calories (4 kcal / g)
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbGrams = Math.round(remainingCalories / 4);

  // Fibres : 14g pour 1000 kcal (recommandation OMS / ANSES)
  const fiberGrams = Math.max(25, Math.round((targetCalories / 1000) * 14));

  return {
    bmr,
    tdee,
    targetCalories,
    macros: {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
      fiber: fiberGrams
    }
  };
}
