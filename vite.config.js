import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import cors from 'cors';
import { db } from './server/db.js';
import { calculateNutritionTargets } from './server/bmr.js';
import { analyzeMealImageServer } from './server/vision.js';

function fullstackApiPlugin() {
  const api = express();
  api.use(cors());
  api.use(express.json({ limit: '15mb' }));

  api.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0.0' });
  });

  api.get('/api/profile', (req, res) => {
    const userId = req.query.userId || 'usr_default';
    res.json({ user: db.getUser(userId), goal: db.getGoal(userId) });
  });

  api.post('/api/profile', (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const { gender, age, weight, height, activity, goal, dietPreference, customMacros } = req.body;
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

  api.post('/api/scan', async (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const { imageDataUrl, userComment } = req.body;
    const clientApiKey = req.headers['x-gemini-key'] || req.body.apiKey || '';
    if (!imageDataUrl) return res.status(400).json({ error: 'Photo manquante pour le scan.' });

    try {
      const analysis = await analyzeMealImageServer(imageDataUrl, userComment, clientApiKey);
      const scan = db.createScan(userId, {
        imageUrl: imageDataUrl.length > 500000 ? imageDataUrl.slice(0, 500000) : imageDataUrl,
        userComment,
        status: 'completed',
        latencyMs: analysis.latencyMs,
        confidence: analysis.confidence,
        advice: analysis.advice,
        nutriScore: analysis.nutriScore
      });
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
      res.status(500).json({ error: err.message || 'Échec de l’analyse visuelle.' });
    }
  });

  api.get('/api/meals', (req, res) => {
    const userId = req.query.userId || 'usr_default';
    const date = req.query.date || new Date().toISOString().split('T')[0];
    res.json({ date, meals: db.getMealsByDate(userId, date), dailyLog: db.getDailyLog(userId, date) });
  });

  api.post('/api/meals', (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const entry = db.addMealEntry(userId, req.body);
    res.json({ success: true, entry });
  });

  api.delete('/api/meals/:id', (req, res) => {
    const userId = req.query.userId || 'usr_default';
    res.json({ success: db.deleteMealEntry(userId, req.params.id) });
  });

  api.post('/api/daily/water', (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const log = db.setDailyWater(userId, req.body.date, req.body.amountMl);
    res.json({ success: true, waterMl: log.water_ml });
  });

  api.post('/api/daily/weight', (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const log = db.setDailyWeight(userId, req.body.date, req.body.weightKg);
    res.json({ success: true, weightKg: log.weight_kg });
  });

  api.post('/api/daily/activity', (req, res) => {
    const userId = req.body.userId || 'usr_default';
    const log = db.setDailyActivity(userId, req.body.date, req.body.burnedCalories);
    res.json({ success: true, burnedCalories: log.burned_active_calories });
  });

  api.post('/api/feedback', (req, res) => {
    const recorded = db.recordAIFeedback(req.body.feedbackList);
    res.json({ success: true, recordedCount: recorded.length });
  });

  api.get('/api/history', (req, res) => {
    const userId = req.query.userId || 'usr_default';
    const days = parseInt(req.query.period) || 30;
    res.json(db.getHistory(userId, days));
  });

  api.get('/api/admin/metrics', (req, res) => {
    const feedback = db.getAIFeedbackSummary();
    const scans = db.data.meal_scans;
    const totalScans = scans.length;
    const avgLatency = totalScans > 0 ? Math.round(scans.reduce((a, s) => a + (s.latency_ms || 1200), 0) / totalScans) : 0;
    res.json({
      totalScans,
      avgLatencyMs: avgLatency,
      estimatedQuotaUsed: totalScans * 1400,
      estimatedCostUsd: ((totalScans * 1400) / 1000000 * 0.15).toFixed(4),
      feedbackSummary: feedback,
      totalCiqualFoods: db.data.ciqual_foods.length
    });
  });

  api.get('/api/ciqual/search', (req, res) => {
    res.json(db.searchCiqual(req.query.q || ''));
  });

  return {
    name: 'nutrivision-fullstack-api',
    configureServer(server) {
      server.middlewares.use(api);
    }
  };
}

export default defineConfig({
  plugins: [react(), fullstackApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
