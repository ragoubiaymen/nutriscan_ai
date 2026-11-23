import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import { calculateNutritionTargets } from './bmr.js';
import { analyzeMealImageServer } from './vision.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Limite étendue pour recevoir les images base64
app.use(express.json({ limit: '15mb' }));

// Compatibilité Vercel Serverless & Express standard
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    db_items: db.data.meal_entries.length,
    scans_count: db.data.meal_scans.length
  });
});

// 2. PROFIL & OBJECTIFS (Calcul BMR/TDEE côté serveur)
app.get('/api/profile', (req, res) => {
  const userId = req.query.userId || 'usr_default';
  const goal = db.getGoal(userId);
  const user = db.getUser(userId);
  res.json({ user, goal });
});

app.post('/api/profile', (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { gender, age, weight, height, activity, goal, dietPreference, customMacros } = req.body;

  // Calcul physiologique côté serveur
  const computed = calculateNutritionTargets({
    gender,
    age: Number(age),
    weight: Number(weight),
    height: Number(height),
    activity: Number(activity),
    goal,
    dietPreference
  });

  const updatedGoal = db.saveGoal(userId, {
    gender,
    age: Number(age),
    weight: Number(weight),
    height: Number(height),
    activity: Number(activity),
    goal,
    diet_preference: dietPreference || 'balanced',
    bmr: computed.bmr,
    tdee: computed.tdee,
    target_calories: customMacros?.targetCalories || computed.targetCalories,
    target_protein: customMacros?.protein || computed.macros.protein,
    target_carbs: customMacros?.carbs || computed.macros.carbs,
    target_fat: customMacros?.fat || computed.macros.fat,
    target_fiber: customMacros?.fiber || computed.macros.fiber
  });

  res.json({ success: true, goal: updatedGoal });
});

// 3. SCAN IA & DÉTECTION VLM (Schéma JSON strict + CIQUAL)
app.post('/api/scan', async (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { imageDataUrl, userComment } = req.body;
  const clientApiKey = req.headers['x-gemini-key'] || req.body.apiKey || '';

  if (!imageDataUrl) {
    return res.status(400).json({ error: 'Photo manquante pour le scan.' });
  }

  try {
    const analysis = await analyzeMealImageServer(imageDataUrl, userComment, clientApiKey);

    // Sauvegarder dans meal_scans
    const scan = db.createScan(userId, {
      imageUrl: imageDataUrl.length > 500000 ? imageDataUrl.slice(0, 500000) : imageDataUrl, // Stocker version optimisée
      userComment,
      status: 'completed',
      latencyMs: analysis.latencyMs,
      confidence: analysis.confidence,
      advice: analysis.advice,
      nutriScore: analysis.nutriScore
    });

    // Sauvegarder les detected_items
    const detectedItems = db.saveDetectedItems(scan.id, analysis.items);

    res.json({
      scanId: scan.id,
      isMeal: analysis.isMeal !== false,
      edgeCaseWarning: analysis.edgeCaseWarning || null,
      title: analysis.title,
      confidence: analysis.confidence,
      nutriScore: analysis.nutriScore,
      advice: analysis.advice,
      latencyMs: analysis.latencyMs,
      source: analysis.source,
      items: detectedItems
    });
  } catch (err) {
    console.error('Erreur scan:', err);
    res.status(500).json({ error: err.message || 'Échec de l’analyse visuelle.' });
  }
});

// 4. REPAS & JOURNAL QUOTIDIEN
app.get('/api/meals', (req, res) => {
  const userId = req.query.userId || 'usr_default';
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const meals = db.getMealsByDate(userId, date);
  const dailyLog = db.getDailyLog(userId, date);
  res.json({ date, meals, dailyLog });
});

app.post('/api/meals', (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { date, mealType, title, totalCals, totalProtein, totalCarbs, totalFat, totalFiber, totalWeight, photoUrl, items } = req.body;

  const entry = db.addMealEntry(userId, {
    date: date || new Date().toISOString().split('T')[0],
    mealType: mealType || 'lunch',
    title: title || 'Repas enregistré',
    totalCals,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalWeight,
    photoUrl,
    items: items || []
  });

  res.json({ success: true, entry });
});

app.delete('/api/meals/:id', (req, res) => {
  const userId = req.query.userId || 'usr_default';
  const success = db.deleteMealEntry(userId, req.params.id);
  res.json({ success });
});

// 5. HYDRATATION & POIDS
app.post('/api/daily/water', (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { date, amountMl } = req.body;
  const log = db.setDailyWater(userId, date, amountMl);
  res.json({ success: true, waterMl: log.water_ml });
});

app.post('/api/daily/weight', (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { date, weightKg } = req.body;
  const log = db.setDailyWeight(userId, date, weightKg);
  res.json({ success: true, weightKg: log.weight_kg });
});

app.post('/api/daily/activity', (req, res) => {
  const userId = req.body.userId || 'usr_default';
  const { date, burnedCalories } = req.body;
  const log = db.setDailyActivity(userId, date, burnedCalories);
  res.json({ success: true, burnedCalories: log.burned_active_calories });
});

// 6. BOUCLE D'AMÉLIORATION IA (ai_feedback_logs)
app.post('/api/feedback', (req, res) => {
  const { feedbackList } = req.body;
  const recorded = db.recordAIFeedback(feedbackList);
  res.json({ success: true, recordedCount: recorded.length });
});

// 7. HISTORIQUE & TENDANCES (7, 30, 90 jours)
app.get('/api/history', (req, res) => {
  const userId = req.query.userId || 'usr_default';
  const days = parseInt(req.query.period) || 30;
  const history = db.getHistory(userId, days);
  res.json(history);
});

// 8. TABLEAU DE BORD ADMIN & SUPERVISION IA
app.get('/api/admin/metrics', (req, res) => {
  const feedback = db.getAIFeedbackSummary();
  const scans = db.data.meal_scans;
  const totalScans = scans.length;
  const avgLatency = totalScans > 0
    ? Math.round(scans.reduce((acc, s) => acc + (s.latency_ms || 1200), 0) / totalScans)
    : 0;

  res.json({
    totalScans,
    avgLatencyMs: avgLatency,
    estimatedQuotaUsed: totalScans * 1400, // ~1400 tokens / scan image VLM
    estimatedCostUsd: ((totalScans * 1400) / 1000000 * 0.15).toFixed(4),
    feedbackSummary: feedback,
    totalCiqualFoods: db.data.ciqual_foods.length
  });
});

// 9. RECHERCHE CATALOGUE CIQUAL
app.get('/api/ciqual/search', (req, res) => {
  const term = req.query.q || '';
  const results = db.searchCiqual(term);
  res.json(results);
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NutriScan AI Pro Server v2.0 démarré sur http://localhost:${PORT}`);
  });
}

export default app;
