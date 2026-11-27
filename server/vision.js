import { matchCiqualFood } from './ciqualData.js';

const GEMINI_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
];

export async function analyzeMealImageServer(imageDataUrl, userComment = '', clientApiKey = '') {
  const startTime = Date.now();
  const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();

  const imageMatch = typeof imageDataUrl === 'string'
    ? imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
    : null;

  if (!imageMatch) {
    throw new Error('Format d’image invalide. Formats acceptés : JPEG, PNG, WebP.');
  }

  const mimeType = imageMatch[1];
  const base64Data = imageMatch[2];

  // Mode Démo CIQUAL sans clé API pour tests immédiats
  if (apiKey.toLowerCase() === 'demo' || userComment.toLowerCase() === 'demo') {
    return {
      isMeal: true,
      edgeCaseWarning: null,
      title: 'Salade Méditerranéenne & Saumon Grillé (Mode Démo)',
      confidence: 96,
      nutriScore: 'A',
      advice: 'Exemple de démonstration CIQUAL : repas riche en Oméga-3 et protéines maigres. Renseignez votre clé API Gemini pour analyser vos photos personnelles.',
      latencyMs: Date.now() - startTime,
      source: 'ciqual-demo',
      items: [
        {
          name: 'Pavé de saumon grillé',
          ciqualCode: 'PO01',
          ciqualOfficialName: 'Saumon cuit à la vapeur',
          grams: 140,
          confidence: 97,
          caloriesPer100g: 180,
          proteinPer100g: 22.0,
          carbPer100g: 0.0,
          fatPer100g: 10.5,
          fiberPer100g: 0.0,
          bbox: { top: 20, left: 15, width: 45, height: 40 }
        },
        {
          name: 'Quinoa cuit',
          ciqualCode: 'FE02',
          ciqualOfficialName: 'Quinoa cuit',
          grams: 150,
          confidence: 94,
          caloriesPer100g: 120,
          proteinPer100g: 4.4,
          carbPer100g: 21.3,
          fatPer100g: 1.9,
          fiberPer100g: 2.8,
          bbox: { top: 35, left: 50, width: 40, height: 45 }
        },
        {
          name: 'Avocat frais',
          ciqualCode: 'FR01',
          ciqualOfficialName: 'Avocat',
          grams: 80,
          confidence: 92,
          caloriesPer100g: 160,
          proteinPer100g: 2.0,
          carbPer100g: 1.8,
          fatPer100g: 14.7,
          fiberPer100g: 6.7,
          bbox: { top: 15, left: 55, width: 30, height: 25 }
        }
      ]
    };
  }

  // Si aucune clé Gemini n'est fournie, avertir clairement l'utilisateur
  if (!apiKey) {
    throw new Error('Clé API Gemini non configurée. Veuillez renseigner votre clé API gratuite Google Gemini dans les Paramètres (⚙️) pour activer la reconnaissance visuelle par IA.');
  }

  const prompt = `Tu es un expert mondial en vision par ordinateur et nutrition clinique.
Analyse cette image avec une extrême rigueur.

ÉTAPE 1 : CLASSIFICATION ET FILTRAGE HORS CONTEXTE (OBLIGATOIRE) :
Examine l'image entière :
- Est-ce que cette image contient RÉELLEMENT un repas, des aliments comestibles ou une boisson ?
- Si l'image représente une chambre, un lit, un meuble, un mur, un écran d'ordinateur, un clavier, un animal, un vêtement, un être humain sans plat, un objet quelconque ou tout environnement non alimentaire :
  Tu dois OBLIGATOIREMENT et STRICTEMENT répondre :
  {
    "isMeal": false,
    "edgeCaseWarning": "Aucun aliment détecté sur cette photo. L'image ne contient pas de nourriture (ex: chambre, objet, environnement non alimentaire).",
    "title": "Aucun aliment détecté",
    "confidence": 98,
    "nutriScore": null,
    "advice": "Cette image ne contient aucun aliment comestible. Prenez une photo directe de votre plat ou assiette.",
    "items": []
  }

- Si l'image est trop floue, sombre ou totalement illisible :
  Tu dois répondre "isMeal": false avec "items": [] et un message d'avertissement explicite.

ÉTAPE 2 : SI ET SEULEMENT SI DES ALIMENTS SONT VISIBLES :
${userComment ? `Précision importante fournie par l'utilisateur : "${userComment}". Intègre absolument cette indication.` : ''}
Identifie précisément chaque aliment visible, estime son poids réaliste en grammes, son indice de confiance et ses macronutriments rapportés pour 100g.
Pour chaque aliment :
- name : nom précis de l'aliment en français (référencé selon les usages CIQUAL)
- grams : portion estimée en grammes
- confidence : indice de confiance (80 à 98)
- caloriesPer100g : kcal pour 100g
- proteinPer100g : protéines pour 100g
- carbPer100g : glucides pour 100g
- fatPer100g : lipides pour 100g
- fiberPer100g : fibres pour 100g
- bbox : position approximative { top, left, width, height } en pourcentages (0-100)

Donne aussi :
- isMeal: true
- edgeCaseWarning: null
- title: nom du plat ou résumé du repas
- advice: conseil nutritionnel clinique bienveillant et personnalisé
- nutriScore: "A", "B", "C", "D" ou "E"
- confidence: score global de confiance (0 à 100)

Réponds UNIQUEMENT par un objet JSON valide suivant exactement cette structure.`;

  const requestBody = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  });

  let lastErrorMsg = '';

  for (const endpoint of GEMINI_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        lastErrorMsg = errorBody.error?.message || `Erreur HTTP ${response.status} sur ${endpoint}`;
        console.warn(`Échec endpoint ${endpoint}:`, lastErrorMsg);
        continue; // Passer au modèle suivant
      }

      const payload = await response.json();
      const rawText = payload.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
      if (!rawText) {
        throw new Error("L'IA Gemini a renvoyé un contenu vide.");
      }

      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const latencyMs = Date.now() - startTime;

      // CAS 1 : FILTRAGE HORS CONTEXTE (Aucun aliment détecté)
      if (parsed.isMeal === false || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        return {
          isMeal: false,
          edgeCaseWarning: parsed.edgeCaseWarning || "Aucun aliment détecté sur cette photo (environnement ou objet non alimentaire).",
          title: parsed.title && parsed.title !== 'Repas Analysé par IA' ? parsed.title : 'Aucun aliment détecté',
          confidence: parsed.confidence || 95,
          nutriScore: null,
          advice: parsed.advice || "Cette photo ne contient aucun aliment comestible reconnaissable. Prenez une photo directe de votre plat.",
          latencyMs,
          source: 'gemini-vlm',
          items: [] // ZÉRO ALIMENT, ZÉRO CALORIE
        };
      }

      // CAS 2 : VRAIS ALIMENTS DÉTECTÉS - CROISEMENT AVEC CIQUAL
      const enrichedItems = parsed.items.map(item => {
        const ciqualMatch = matchCiqualFood(item.name);
        return {
          name: item.name,
          ciqualCode: ciqualMatch ? ciqualMatch.code : null,
          ciqualOfficialName: ciqualMatch ? ciqualMatch.name : null,
          grams: Math.max(5, Math.round(Number(item.grams) || 100)),
          confidence: Math.round(Number(item.confidence) || 90),
          // Si matché avec CIQUAL, fiabiliser avec les valeurs normées officielles
          caloriesPer100g: ciqualMatch ? ciqualMatch.calories : Math.round(Number(item.caloriesPer100g) || 100),
          proteinPer100g: ciqualMatch ? ciqualMatch.protein : Math.round((Number(item.proteinPer100g) || 0) * 10) / 10,
          carbPer100g: ciqualMatch ? ciqualMatch.carbs : Math.round((Number(item.carbPer100g) || 0) * 10) / 10,
          fatPer100g: ciqualMatch ? ciqualMatch.fat : Math.round((Number(item.fatPer100g) || 0) * 10) / 10,
          fiberPer100g: ciqualMatch ? ciqualMatch.fiber : Math.round((Number(item.fiberPer100g) || 0) * 10) / 10,
          bbox: item.bbox || { top: 25, left: 25, width: 50, height: 50 }
        };
      });

      return {
        isMeal: true,
        edgeCaseWarning: parsed.edgeCaseWarning || null,
        title: parsed.title || 'Repas Analysé',
        confidence: parsed.confidence || 93,
        nutriScore: parsed.nutriScore || 'A',
        advice: parsed.advice || 'Analyse VLM et croisement CIQUAL effectués avec succès.',
        latencyMs,
        source: 'gemini-vlm-ciqual',
        items: enrichedItems
      };
    } catch (err) {
      lastErrorMsg = err.message;
      console.warn(`Tentative VLM échouée (${endpoint}):`, err.message);
    }
  }

  // Si tous les endpoints ont échoué, renvoyer l'erreur précise
  throw new Error(lastErrorMsg || "Impossible de joindre l'API de vision Gemini. Vérifiez votre clé API et votre connexion.");
}
