# -*- coding: utf-8 -*-
"""
NutriScan AI - Benchmark & Évaluation de Performance VLM (Google Colab)
======================================================================
Ce script permet de tester directement le modèle multimodal de NutriScan AI,
d'évaluer sa latence, sa consommation de tokens, son filtrage hors contexte (chambre vs plat),
et son croisement nutritionnel avec la table CIQUAL.

Pour exécuter dans Google Colab :
1. Créez un nouveau notebook sur https://colab.research.google.com
2. Copiez-collez les blocs ci-dessous ou exécutez ce script.
"""

# =====================================================================
# ÉTAPE 1 : INSTALLATION DES DÉPENDANCES
# =====================================================================
# Décommentez dans Colab :
# !pip install -q -U google-generativeai pillow requests tabulate matplotlib

import os
import time
import json
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
from tabulate import tabulate
import google.generativeai as genai

# =====================================================================
# ÉTAPE 2 : CONFIGURATION DE LA CLÉ API GEMINI
# =====================================================================
try:
    from google.colab import userdata
    GEMINI_API_KEY = userdata.get('GEMINI_API_KEY')
except Exception:
    import getpass
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or getpass.getpass("Entrez votre clé API Google Gemini : ")

genai.configure(api_key=GEMINI_API_KEY)

# Choix du modèle VLM recommandé pour NutriScan AI
MODEL_NAME = "gemini-2.0-flash"  # Ou "gemini-1.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

print(f" Modèle initialisé : {MODEL_NAME}")

# =====================================================================
# ÉTAPE 3 : TABLE NUTRITIONNELLE CIQUAL (RÉFÉRENTIEL FRANCE)
# =====================================================================
CIQUAL_DATABASE = {
    'PO01': {'name': 'Saumon cuit à la vapeur / grillé', 'cal': 180, 'p': 22.0, 'c': 0.0, 'f': 10.5, 'fib': 0.0},
    'VO01': {'name': 'Blanc de poulet rôti / poêlé', 'cal': 145, 'p': 29.5, 'c': 0.0, 'f': 2.8, 'fib': 0.0},
    'BO01': {'name': 'Steak haché de bœuf 5% MG cuit', 'cal': 138, 'p': 26.0, 'c': 0.0, 'f': 3.7, 'fib': 0.0},
    'FE01': {'name': 'Riz blanc cuit à l\'eau', 'cal': 130, 'p': 2.7, 'c': 28.2, 'f': 0.3, 'fib': 0.4},
    'FE02': {'name': 'Pâtes cuites non salées', 'cal': 131, 'p': 5.2, 'c': 25.0, 'f': 0.9, 'fib': 1.8},
    'FE03': {'name': 'Quinoa cuit', 'cal': 120, 'p': 4.4, 'c': 21.3, 'f': 1.9, 'fib': 2.8},
    'FE04': {'name': 'Pomme de terre cuite à l\'eau', 'cal': 86, 'p': 1.9, 'c': 18.5, 'f': 0.1, 'fib': 1.6},
    'FE05': {'name': 'Pain de campagne / baguette', 'cal': 265, 'p': 8.5, 'c': 53.0, 'f': 1.2, 'fib': 3.5},
    'LG01': {'name': 'Brocoli cuit à la vapeur', 'cal': 35, 'p': 2.4, 'c': 4.0, 'f': 0.6, 'fib': 2.6},
    'LG02': {'name': 'Haricots verts cuits', 'cal': 31, 'p': 1.8, 'c': 4.2, 'f': 0.2, 'fib': 3.0},
    'LG03': {'name': 'Salade verte (laitue / roquette)', 'cal': 15, 'p': 1.4, 'c': 1.5, 'f': 0.2, 'fib': 1.3},
    'LG04': {'name': 'Tomate crue fraîche', 'cal': 18, 'p': 0.9, 'c': 3.1, 'f': 0.2, 'fib': 1.2},
    'LG05': {'name': 'Avocat frais', 'cal': 160, 'p': 2.0, 'c': 1.8, 'f': 14.7, 'fib': 6.7},
    'MG01': {'name': 'Huile d\'olive vierge extra', 'cal': 884, 'p': 0.0, 'c': 0.0, 'f': 100.0, 'fib': 0.0},
    'MG02': {'name': 'Beurre doux', 'cal': 717, 'p': 0.8, 'c': 0.7, 'f': 81.1, 'fib': 0.0},
    'OE01': {'name': 'Œuf de poule entier cuit dur / au plat', 'cal': 155, 'p': 12.6, 'c': 1.1, 'f': 10.6, 'fib': 0.0},
}

def match_ciqual(food_name):
    """Recherche la correspondance la plus proche dans CIQUAL."""
    name_lower = food_name.lower()
    for code, data in CIQUAL_DATABASE.items():
        words = data['name'].lower().split()
        if any(w in name_lower for w in words if len(w) > 3):
            return code, data
    # Défaut
    return 'GEN', {'name': food_name, 'cal': 150, 'p': 10.0, 'c': 15.0, 'f': 5.0, 'fib': 2.0}

# =====================================================================
# ÉTAPE 4 : PROMPT VISION & PIPELINE NUTRISCAN AI
# =====================================================================
NUTRISCAN_PROMPT = """Tu es un expert mondial en vision par ordinateur et nutrition clinique.
Analyse cette image avec une extrême rigueur.

ÉTAPE 1 : CLASSIFICATION ET FILTRAGE HORS CONTEXTE (OBLIGATOIRE) :
Examine l'image entière :
- Est-ce que cette image contient RÉELLEMENT un repas, des aliments comestibles ou une boisson ?
- Si l'image représente une pièce (chambre, salon, bureau, lit), un objet non comestible (chaussure, voiture, écran), un animal ou un paysage sans aliment :
  RÉPONDS STRICTEMENT :
  {
    "isMeal": false,
    "confidence": 98,
    "edgeCaseWarning": "Aucun aliment détecté sur cette photo. Veuillez scanner un plat ou des ingrédients comestibles.",
    "items": []
  }

ÉTAPE 2 : DÉTECTION MULTI-OBJETS & ESTIMATION DES PORTIONS (UNIQUEMENT SI isMeal = true) :
Pour chaque aliment visible :
1. "name" : nom précis en français (ex: "Filet de saumon cuit", "Riz basmati", "Brocolis vapeur", "Huile d'olive").
2. "grams" : estimation volumétrique réaliste du poids cuit/consommé en grammes (entier > 0).
3. "confidence" : indice de confiance entre 0 et 100.
4. "bbox" : coordonnées de la boîte englobante de l'aliment en pourcentages :
   {"top": 0-100, "left": 0-100, "width": 0-100, "height": 0-100}.
5. "caloriesPer100g", "proteinPer100g", "carbPer100g", "fatPer100g", "fiberPer100g" : valeurs nutritionnelles pour 100g.

Réponds UNIQUEMENT avec un JSON valide suivant cette structure exacte, sans markdown :
{
  "isMeal": true,
  "confidence": 94,
  "title": "Nom du repas ou plat principal",
  "nutriScore": "A",
  "advice": "Conseil nutritionnel rapide",
  "items": [
    {
      "name": "Aliment",
      "grams": 150,
      "confidence": 92,
      "caloriesPer100g": 120,
      "proteinPer100g": 10.5,
      "carbPer100g": 15.0,
      "fatPer100g": 2.5,
      "fiberPer100g": 1.2,
      "bbox": {"top": 20, "left": 25, "width": 40, "height": 35}
    }
  ]
}"""

# =====================================================================
# ÉTAPE 5 : FONCTION D'ANALYSE & MESURE DE PERFORMANCE
# =====================================================================
def analyze_meal(image_input, user_note=""):
    """
    Exécute l'analyse VLM sur l'image et mesure :
    - Latence totale (ms)
    - Tokens consommés (prompt, réponse, total)
    - Filtrage hors contexte
    - Croisement nutritionnel CIQUAL
    """
    # 1. Chargement de l'image
    if isinstance(image_input, str):
        if image_input.startswith("http://") or image_input.startswith("https://"):
            resp = requests.get(image_input)
            img = Image.open(BytesIO(resp.content)).convert("RGB")
        else:
            img = Image.open(image_input).convert("RGB")
    else:
        img = image_input.convert("RGB")

    # 2. Redimensionnement optimal (similaire à NutriScan AI client)
    max_dim = 1024
    if max(img.size) > max_dim:
        img.thumbnail((max_dim, max_dim))

    # 3. Préparation du prompt
    prompt_text = NUTRISCAN_PROMPT
    if user_note:
        prompt_text += f"\n\nPrécision de l'utilisateur : \"{user_note}\""

    # 4. Inférence & Mesure du temps
    t_start = time.perf_counter()
    response = model.generate_content(
        [prompt_text, img],
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.2,
        }
    )
    t_end = time.perf_counter()
    latency_ms = round((t_end - t_start) * 1000, 1)

    # 5. Extraction des métriques de tokens
    usage = getattr(response, "usage_metadata", None)
    prompt_tokens = getattr(usage, "prompt_token_count", 0) if usage else 0
    candidate_tokens = getattr(usage, "candidates_token_count", 0) if usage else 0
    total_tokens = getattr(usage, "total_token_count", 0) if usage else 0

    # Coût estimé Gemini 2.0 Flash (prix indicatif Google Cloud)
    # $0.10 par million de tokens d'entrée, $0.40 par million de tokens de sortie
    cost_usd = ((prompt_tokens * 0.10) + (candidate_tokens * 0.40)) / 1_000_000

    # 6. Parsing du JSON
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    data = json.loads(raw_text.strip())

    # 7. Croisement CIQUAL
    computed_items = []
    total_cals, total_prot, total_carb, total_fat, total_fiber = 0, 0, 0, 0, 0

    if data.get("isMeal", True) and "items" in data:
        for item in data.get("items", []):
            code, ciqual_food = match_ciqual(item.get("name", ""))
            grams = item.get("grams", 100)
            factor = grams / 100.0

            cals = round(ciqual_food["cal"] * factor)
            prot = round(ciqual_food["p"] * factor, 1)
            carb = round(ciqual_food["c"] * factor, 1)
            fat = round(ciqual_food["f"] * factor, 1)
            fib = round(ciqual_food["fib"] * factor, 1)

            total_cals += cals
            total_prot += prot
            total_carb += carb
            total_fat += fat
            total_fiber += fib

            computed_items.append({
                "name": item.get("name"),
                "ciqual_official": ciqual_food["name"],
                "ciqual_code": code,
                "grams": grams,
                "confidence": item.get("confidence", 90),
                "calories": cals,
                "protein": prot,
                "carbs": carb,
                "fat": fat,
                "fiber": fib,
                "bbox": item.get("bbox", None)
            })

    metrics = {
        "latency_ms": latency_ms,
        "prompt_tokens": prompt_tokens,
        "candidate_tokens": candidate_tokens,
        "total_tokens": total_tokens,
        "cost_usd": cost_usd,
        "is_meal": data.get("isMeal", True),
        "warning": data.get("edgeCaseWarning"),
        "title": data.get("title", "Repas Détecté"),
        "nutri_score": data.get("nutriScore", "B"),
        "advice": data.get("advice", ""),
        "totals": {
            "calories": total_cals,
            "protein": round(total_prot, 1),
            "carbs": round(total_carb, 1),
            "fat": round(total_fat, 1),
            "fiber": round(total_fiber, 1)
        },
        "items": computed_items
    }

    return img, metrics

# =====================================================================
# ÉTAPE 6 : VISUALISATION DES RÉSULTATS (BOUNDING BOXES & GRAPHIQUES)
# =====================================================================
def plot_benchmark_results(img, metrics):
    """Affiche l'image avec repères visuels, le tableau des macros et le graphique."""
    fig = plt.figure(figsize=(15, 6))

    # Sous-graphe 1 : Image annotée avec bounding boxes
    ax1 = fig.add_subplot(1, 2, 1)
    img_draw = img.copy()
    draw = ImageDraw.Draw(img_draw)
    w, h = img.size

    colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"]

    if metrics["is_meal"]:
        for i, it in enumerate(metrics["items"]):
            bbox = it.get("bbox")
            if bbox:
                top = (bbox.get("top", 0) / 100) * h
                left = (bbox.get("left", 0) / 100) * w
                bw = (bbox.get("width", 0) / 100) * w
                bh = (bbox.get("height", 0) / 100) * h
                col = colors[i % len(colors)]
                draw.rectangle([left, top, left + bw, top + bh], outline=col, width=4)
                draw.text((left + 5, max(0, top - 15)), f"{it['name']} ({it['grams']}g)", fill=col)

        ax1.imshow(img_draw)
        ax1.set_title(f" {metrics['title']} (Nutri-Score {metrics['nutri_score']})", fontsize=12, fontweight='bold')
    else:
        ax1.imshow(img_draw)
        ax1.set_title(" HORS CONTEXTE : Aucun aliment détecté (0 kcal)", fontsize=12, color='red', fontweight='bold')

    ax1.axis("off")

    # Sous-graphe 2 : Répartition des Macronutriments
    ax2 = fig.add_subplot(1, 2, 2)
    tot = metrics["totals"]

    if metrics["is_meal"] and (tot["protein"] + tot["carbs"] + tot["fat"]) > 0:
        labels = [f"Protéines ({tot['protein']}g)", f"Glucides ({tot['carbs']}g)", f"Lipides ({tot['fat']}g)"]
        values = [tot["protein"] * 4, tot["carbs"] * 4, tot["fat"] * 9]  # Calories respectives
        pie_colors = ["#10b981", "#3b82f6", "#f59e0b"]
        ax2.pie(values, labels=labels, autopct="%1.1f%%", startangle=140, colors=pie_colors, textprops={'fontsize': 11})
        ax2.set_title(f"Apport énergétique total : {tot['calories']} kcal", fontsize=13, fontweight='bold')
    else:
        ax2.text(0.5, 0.5, "Aucun macronutriment (Filtrage actif)", ha='center', va='center', fontsize=12, color='gray')
        ax2.axis("off")

    plt.tight_layout()
    plt.show()

    # Affichage du rapport tabulé en console
    print("\n" + "="*70)
    print(" RAPPORT DE PERFORMANCE ET D'INFÉRENCE VLM")
    print("="*70)
    print(f"• Modèle IA        : {MODEL_NAME}")
    print(f"• Latence d'inférence: {metrics['latency_ms']} ms ({round(metrics['latency_ms']/1000, 2)} s)")
    print(f"• Tokens consommés : {metrics['total_tokens']} (Prompt: {metrics['prompt_tokens']}, Réponse: {metrics['candidate_tokens']})")
    print(f"• Coût estimé      : ${metrics['cost_usd']:.6f} USD")
    print(f"• Détection repas  : {' OUI' if metrics['is_meal'] else ' NON (Filtré avec succès)'}")

    if metrics["warning"]:
        print(f"• Avertissement    : {metrics['warning']}")

    if metrics["advice"]:
        print(f"• Conseil IA       : {metrics['advice']}")

    if metrics["items"]:
        table_rows = []
        for it in metrics["items"]:
            table_rows.append([
                it["name"],
                f"{it['grams']} g",
                f"{it['confidence']}%",
                f"{it['calories']} kcal",
                f"{it['protein']} g",
                f"{it['carbs']} g",
                f"{it['fat']} g",
                it["ciqual_official"]
            ])
        print("\n" + tabulate(
            table_rows,
            headers=["Aliment détecté", "Portion", "Confiance", "Calories", "Protéines", "Glucides", "Lipides", "Référentiel CIQUAL"],
            tablefmt="fancy_grid"
        ))
        print(f"\n TOTAL : {tot['calories']} kcal | Protéines: {tot['protein']}g | Glucides: {tot['carbs']}g | Lipides: {tot['fat']}g | Fibres: {tot['fiber']}g")
    print("="*70 + "\n")

# =====================================================================
# ÉTAPE 7 : EXEMPLES DE TESTS (REPAS RÉEL vs HORS CONTEXTE)
# =====================================================================
if __name__ == "__main__":
    print("\n Démarrage du banc d'essai NutriScan AI...")

    # TEST 1 : Photo de plat réel (Assiette Saumon & Légumes)
    sample_meal_url = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
    print("\n[TEST 1] Analyse d'un repas réel...")
    try:
        img_meal, metrics_meal = analyze_meal(sample_meal_url, user_note="avec filet d'huile d'olive")
        plot_benchmark_results(img_meal, metrics_meal)
    except Exception as e:
        print("Erreur Test 1 :", e)

    # TEST 2 : Photo hors contexte (Chambre à coucher / Objet)
    sample_bedroom_url = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
    print("\n[TEST 2] Vérification du filtrage anti-hallucination sur une photo de chambre...")
    try:
        img_room, metrics_room = analyze_meal(sample_bedroom_url)
        plot_benchmark_results(img_room, metrics_room)
    except Exception as e:
        print("Erreur Test 2 :", e)
