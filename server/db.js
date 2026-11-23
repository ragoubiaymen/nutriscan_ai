import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CIQUAL_DATABASE } from './ciqualData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'nutriscan.json');
const SEED_FILE = path.join(__dirname, '..', 'data', 'nutriscan.json');

// Assurer l'existence du dossier de données
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Schéma initial de la base de données relationnelle
const DEFAULT_SCHEMA = {
  users: [
    {
      id: 'usr_default',
      name: 'Utilisateur Principal',
      email: 'user@nutriscan.ai',
      created_at: new Date().toISOString()
    }
  ],
  nutrition_goals: [
    {
      id: 'goal_default',
      user_id: 'usr_default',
      gender: 'male',
      age: 28,
      weight: 75,
      height: 178,
      activity: 1.375,
      goal: 'deficit_moderate',
      diet_preference: 'balanced',
      bmr: 1720,
      tdee: 2365,
      target_calories: 2065,
      target_protein: 150,
      target_carbs: 230,
      target_fat: 57,
      target_fiber: 29,
      updated_at: new Date().toISOString()
    }
  ],
  meal_scans: [],
  detected_items: [],
  meal_entries: [],
  daily_logs: {},
  ai_feedback_logs: [],
  ciqual_foods: CIQUAL_DATABASE
};

class RelationalDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(SEED_FILE) ? SEED_FILE : null);
      if (targetFile) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        const parsed = JSON.parse(raw);
        // Garantir que toutes les tables existent
        const data = {
          ...DEFAULT_SCHEMA,
          ...parsed,
          ciqual_foods: CIQUAL_DATABASE // Toujours garder la base CIQUAL à jour
        };
        // Si on est sur Vercel et que le fichier /tmp n'existait pas encore, le créer
        if (!fs.existsSync(DB_FILE)) {
          this.save(data);
        }
        return data;
      }
    } catch (e) {
      console.error('Erreur lecture base de données, réinitialisation :', e);
    }
    this.save(DEFAULT_SCHEMA);
    return DEFAULT_SCHEMA;
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erreur sauvegarde base de données :', e);
    }
  }

  // USERS & GOALS
  getUser(userId = 'usr_default') {
    return this.data.users.find(u => u.id === userId) || this.data.users[0];
  }

  getGoal(userId = 'usr_default') {
    return this.data.nutrition_goals.find(g => g.user_id === userId) || this.data.nutrition_goals[0];
  }

  saveGoal(userId = 'usr_default', goalData) {
    const idx = this.data.nutrition_goals.findIndex(g => g.user_id === userId);
    const updated = {
      id: idx >= 0 ? this.data.nutrition_goals[idx].id : `goal_${Date.now()}`,
      user_id: userId,
      ...goalData,
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) this.data.nutrition_goals[idx] = updated;
    else this.data.nutrition_goals.push(updated);

    this.save();
    return updated;
  }

  // MEAL SCANS & DETECTED ITEMS
  createScan(userId = 'usr_default', { imageUrl, userComment, status = 'analyzing', latencyMs = 0, confidence = 0, advice = '', nutriScore = 'A' }) {
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const scan = {
      id: scanId,
      user_id: userId,
      image_url: imageUrl,
      user_comment: userComment || '',
      status,
      confidence,
      advice,
      nutri_score: nutriScore,
      latency_ms: latencyMs,
      created_at: new Date().toISOString()
    };
    this.data.meal_scans.push(scan);
    this.save();
    return scan;
  }

  saveDetectedItems(scanId, items) {
    const saved = items.map((item, idx) => ({
      id: `det_${scanId}_${idx}`,
      scan_id: scanId,
      name: item.name,
      grams: Number(item.grams) || 100,
      confidence: Number(item.confidence) || 90,
      calories_per_100g: Number(item.caloriesPer100g || item.calories_per_100g) || 100,
      protein_per_100g: Number(item.proteinPer100g || item.protein_per_100g) || 0,
      carb_per_100g: Number(item.carbPer100g || item.carb_per_100g) || 0,
      fat_per_100g: Number(item.fatPer100g || item.fat_per_100g) || 0,
      fiber_per_100g: Number(item.fiberPer100g || item.fiber_per_100g) || 0,
      bbox: item.bbox || null
    }));

    this.data.detected_items.push(...saved);
    this.save();
    return saved;
  }

  // MEAL ENTRIES & DAILY LOGS
  getMealsByDate(userId = 'usr_default', dateStr) {
    return this.data.meal_entries.filter(m => m.user_id === userId && m.date === dateStr);
  }

  addMealEntry(userId = 'usr_default', meal) {
    const entryId = `entry_${Date.now()}`;
    const entry = {
      id: entryId,
      user_id: userId,
      date: meal.date,
      meal_type: meal.mealType, // 'breakfast', 'lunch', 'dinner', 'snack'
      title: meal.title,
      total_cals: Math.round(Number(meal.totalCals) || 0),
      total_protein: Math.round(Number(meal.totalProtein) || 0),
      total_carbs: Math.round(Number(meal.totalCarbs) || 0),
      total_fat: Math.round(Number(meal.totalFat) || 0),
      total_fiber: Math.round(Number(meal.totalFiber) || 0),
      total_weight: Math.round(Number(meal.totalWeight) || 0),
      photo_url: meal.photoUrl || '',
      items: meal.items || [],
      created_at: new Date().toISOString()
    };
    this.data.meal_entries.push(entry);
    this.updateDailyLogTotals(userId, meal.date);
    this.save();
    return entry;
  }

  deleteMealEntry(userId = 'usr_default', entryId) {
    const idx = this.data.meal_entries.findIndex(m => m.id === entryId && m.user_id === userId);
    if (idx >= 0) {
      const date = this.data.meal_entries[idx].date;
      this.data.meal_entries.splice(idx, 1);
      this.updateDailyLogTotals(userId, date);
      this.save();
      return true;
    }
    return false;
  }

  updateDailyLogTotals(userId, dateStr) {
    const meals = this.getMealsByDate(userId, dateStr);
    let consumedCals = 0;
    let prot = 0, carb = 0, fat = 0, fib = 0;

    meals.forEach(m => {
      consumedCals += m.total_cals;
      prot += m.total_protein;
      carb += m.total_carbs;
      fat += m.total_fat;
      fib += m.total_fiber;
    });

    const key = `${userId}_${dateStr}`;
    const existing = this.data.daily_logs[key] || {
      user_id: userId,
      date: dateStr,
      water_ml: 0,
      weight_kg: null,
      burned_active_calories: 0
    };

    const goal = this.getGoal(userId);
    this.data.daily_logs[key] = {
      ...existing,
      target_calories: goal.target_calories || 2000,
      consumed_calories: consumedCals,
      burned_active_calories: existing.burned_active_calories || 0,
      consumed_macros: { protein: prot, carbs: carb, fat, fiber: fib }
    };
  }

  getDailyLog(userId = 'usr_default', dateStr) {
    const key = `${userId}_${dateStr}`;
    if (!this.data.daily_logs[key]) {
      this.updateDailyLogTotals(userId, dateStr);
    }
    return this.data.daily_logs[key];
  }

  setDailyWater(userId = 'usr_default', dateStr, amountMl) {
    const key = `${userId}_${dateStr}`;
    const log = this.getDailyLog(userId, dateStr);
    log.water_ml = Math.max(0, amountMl);
    this.data.daily_logs[key] = log;
    this.save();
    return log;
  }

  setDailyWeight(userId = 'usr_default', dateStr, weightKg) {
    const key = `${userId}_${dateStr}`;
    const log = this.getDailyLog(userId, dateStr);
    log.weight_kg = Number(weightKg);
    this.data.daily_logs[key] = log;
    this.save();
    return log;
  }

  setDailyActivity(userId = 'usr_default', dateStr, burnedCalories) {
    const key = `${userId}_${dateStr}`;
    const log = this.getDailyLog(userId, dateStr);
    log.burned_active_calories = Math.max(0, Number(burnedCalories) || 0);
    this.data.daily_logs[key] = log;
    this.save();
    return log;
  }

  // AI FEEDBACK LOOP (Human-in-the-loop logs)
  recordAIFeedback(feedbackList) {
    if (!Array.isArray(feedbackList) || feedbackList.length === 0) return [];
    const saved = feedbackList.map(item => ({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      scan_id: item.scanId || null,
      user_id: item.userId || 'usr_default',
      action: item.action, // 'item_deleted', 'item_modified', 'item_added'
      original_name: item.originalName || null,
      final_name: item.finalName || null,
      original_grams: item.originalGrams || null,
      final_grams: item.finalGrams || null,
      original_cals: item.originalCals || null,
      final_cals: item.finalCals || null,
      user_comment: item.userComment || '',
      created_at: new Date().toISOString()
    }));
    this.data.ai_feedback_logs.push(...saved);
    this.save();
    return saved;
  }

  getAIFeedbackSummary() {
    const logs = this.data.ai_feedback_logs;
    const actionsCount = { item_deleted: 0, item_modified: 0, item_added: 0 };
    const frequentCorrections = {};

    logs.forEach(l => {
      actionsCount[l.action] = (actionsCount[l.action] || 0) + 1;
      const key = l.original_name || l.final_name;
      if (key) {
        frequentCorrections[key] = (frequentCorrections[key] || 0) + 1;
      }
    });

    const topCorrections = Object.entries(frequentCorrections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalLogs: logs.length,
      actionsCount,
      topCorrections,
      recentLogs: logs.slice(-15).reverse()
    };
  }

  // HISTORY & TRENDS
  getHistory(userId = 'usr_default', days = 30) {
    const result = {
      dates: [],
      calories: [],
      targetCalories: [],
      weights: [],
      mealsGallery: []
    };

    const goal = this.getGoal(userId);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const log = this.getDailyLog(userId, dStr);

      result.dates.push(dStr);
      result.calories.push(log ? log.consumed_calories : 0);
      result.targetCalories.push(goal.target_calories || 2000);
      result.weights.push(log && log.weight_kg ? log.weight_kg : null);
    }

    // Récupérer les photos de repas récentes
    const recentMealsWithPhotos = this.data.meal_entries
      .filter(m => m.user_id === userId && m.photo_url)
      .slice(-12)
      .reverse();

    result.mealsGallery = recentMealsWithPhotos;
    return result;
  }

  // SEARCH CIQUAL
  searchCiqual(term) {
    if (!term || term.trim().length === 0) return this.data.ciqual_foods.slice(0, 25);
    const q = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return this.data.ciqual_foods.filter(item => {
      const name = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cat = item.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return name.includes(q) || cat.includes(q);
    }).slice(0, 30);
  }
}

export const db = new RelationalDatabase();
