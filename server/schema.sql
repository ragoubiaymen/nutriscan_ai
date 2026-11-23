-- =====================================================================
-- SCHEMA POSTGRESQL - NUTRISCAN AI PRO (v2.0)
-- Architecture relationnelle pour profil, scans vision VLM, journal & feedback
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE UTILISATEURS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE OBJECTIFS & PROFIL PHYSIOLOGIQUE (BMR, TDEE, MACROS)
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    age INT NOT NULL CHECK (age > 0 AND age < 130),
    weight NUMERIC(5, 2) NOT NULL CHECK (weight > 20 AND weight < 400),
    height NUMERIC(5, 2) NOT NULL CHECK (height > 50 AND height < 280),
    activity NUMERIC(4, 3) NOT NULL DEFAULT 1.375,
    goal VARCHAR(30) NOT NULL DEFAULT 'deficit_moderate',
    diet_preference VARCHAR(30) NOT NULL DEFAULT 'balanced',
    bmr INT NOT NULL,
    tdee INT NOT NULL,
    target_calories INT NOT NULL,
    target_protein INT NOT NULL,
    target_carbs INT NOT NULL,
    target_fat INT NOT NULL,
    target_fiber INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE SCANS IA MULTIMODAUX (VLM Gemini / GPT-4o)
CREATE TABLE IF NOT EXISTS meal_scans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    user_comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    confidence INT NOT NULL DEFAULT 90,
    nutri_score VARCHAR(5) DEFAULT 'A',
    advice TEXT,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE ÉLÉMENTS DÉTECTÉS PAR L'IA (Normalisés aux 100g)
CREATE TABLE IF NOT EXISTS detected_items (
    id VARCHAR(64) PRIMARY KEY,
    scan_id VARCHAR(64) REFERENCES meal_scans(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    ciqual_code VARCHAR(30),
    grams INT NOT NULL CHECK (grams > 0),
    confidence INT NOT NULL DEFAULT 90,
    calories_per_100g INT NOT NULL,
    protein_per_100g NUMERIC(5, 2) NOT NULL DEFAULT 0,
    carb_per_100g NUMERIC(5, 2) NOT NULL DEFAULT 0,
    fat_per_100g NUMERIC(5, 2) NOT NULL DEFAULT 0,
    fiber_per_100g NUMERIC(5, 2) NOT NULL DEFAULT 0,
    bbox_top NUMERIC(5, 2) DEFAULT 0,
    bbox_left NUMERIC(5, 2) DEFAULT 0,
    bbox_width NUMERIC(5, 2) DEFAULT 0,
    bbox_height NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE JOURNAL DES REPAS (Repas validés par l'utilisateur)
CREATE TABLE IF NOT EXISTS meal_entries (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    title VARCHAR(200) NOT NULL,
    total_cals INT NOT NULL DEFAULT 0,
    total_protein INT NOT NULL DEFAULT 0,
    total_carbs INT NOT NULL DEFAULT 0,
    total_fat INT NOT NULL DEFAULT 0,
    total_fiber INT NOT NULL DEFAULT 0,
    total_weight INT NOT NULL DEFAULT 0,
    photo_url TEXT,
    items_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE LOGS QUOTIDIENS (Bilan calories, activité, hydratation, poids)
CREATE TABLE IF NOT EXISTS daily_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target_calories INT NOT NULL DEFAULT 2000,
    consumed_calories INT NOT NULL DEFAULT 0,
    burned_active_calories INT NOT NULL DEFAULT 0,
    consumed_macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0, "fiber": 0}'::jsonb,
    water_ml INT NOT NULL DEFAULT 0,
    weight_kg NUMERIC(5, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, date)
);

-- 8. TABLE BOUCLE D'AMÉLIORATION IA (Human-in-the-Loop Feedback)
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
    id VARCHAR(64) PRIMARY KEY,
    scan_id VARCHAR(64) REFERENCES meal_scans(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL CHECK (action IN ('item_deleted', 'item_modified', 'item_added')),
    original_name VARCHAR(150),
    final_name VARCHAR(150),
    original_grams INT,
    final_grams INT,
    original_cals INT,
    final_cals INT,
    user_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLE RÉFÉRENTIEL NUTRITIONNEL CIQUAL
CREATE TABLE IF NOT EXISTS ciqual_foods (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    calories INT NOT NULL,
    protein NUMERIC(5, 2) NOT NULL,
    carbs NUMERIC(5, 2) NOT NULL,
    fat NUMERIC(5, 2) NOT NULL,
    fiber NUMERIC(5, 2) NOT NULL
);

-- 10. INDEX POUR PERFORMANCES OPTIMALES
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_scans_user ON meal_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_detected_items_scan ON detected_items(scan_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_action ON ai_feedback_logs(action);
CREATE INDEX IF NOT EXISTS idx_ciqual_search ON ciqual_foods(name, category);

-- 11. DONNÉES DE DÉPART (SEED PAR DÉFAUT)
INSERT INTO users (id, name, email) 
VALUES ('usr_default', 'Utilisateur Principal', 'user@nutriscan.ai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO nutrition_goals (id, user_id, gender, age, weight, height, activity, goal, diet_preference, bmr, tdee, target_calories, target_protein, target_carbs, target_fat, target_fiber)
VALUES ('goal_default', 'usr_default', 'male', 28, 75.0, 178.0, 1.375, 'deficit_moderate', 'balanced', 1720, 2365, 2065, 150, 230, 57, 29)
ON CONFLICT (id) DO NOTHING;
