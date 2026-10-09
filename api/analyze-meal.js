const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'La clé Gemini manque dans les variables d’environnement Vercel.' });
  }

  const imageDataUrl = req.body?.imageDataUrl;
  const imageMatch = typeof imageDataUrl === 'string'
    ? imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
    : null;

  if (!imageMatch) {
    return res.status(400).json({ error: 'Image invalide. Formats acceptés : JPEG, PNG ou WebP.' });
  }
  if (imageMatch[2].length > MAX_IMAGE_BASE64_LENGTH) {
    return res.status(413).json({ error: 'Image trop volumineuse. Essayez une photo plus petite.' });
  }

  const prompt = `Analyse cette photo de repas. Identifie uniquement les aliments réellement visibles et estime leurs portions comestibles en grammes. À partir de tables nutritionnelles usuelles, estime les calories et macros de chaque aliment. Une image ne permet pas de connaître exactement le poids ou les ingrédients cachés : indique clairement dans advice qu'il s'agit d'estimations à vérifier, ne prétends pas à une précision certaine. Si aucun aliment n'est identifiable, retourne items vide. Réponds uniquement avec un JSON ayant cette structure : {"title":"nom bref du repas","advice":"limites et conseil","items":[{"name":"aliment","grams":150,"caloriesPer100g":120,"proteinPer100g":3,"carbPer100g":27,"fatPer100g":1,"fiberPer100g":2}]}. Les champs nutritionnels sont des nombres pour 100 g.`;

  try {
    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: imageMatch[1], data: imageMatch[2] } }
          ]
        }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => ({}));
      const providerMessage = errorBody.error?.message;
      const status = geminiResponse.status === 429 ? 503 : 502;
      return res.status(status).json({
        error: geminiResponse.status === 429
          ? 'Limite de requêtes Gemini atteinte. Réessayez plus tard.'
          : 'Le service Gemini n’a pas pu analyser cette photo. Vérifiez sa configuration dans Vercel.',
        detail: typeof providerMessage === 'string' ? providerMessage.slice(0, 240) : undefined
      });
    }

    const payload = await geminiResponse.json();
    const responseText = payload.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();
    if (!responseText) {
      return res.status(502).json({ error: 'Gemini n’a pas retourné de résultat exploitable.' });
    }

    const analysis = JSON.parse(responseText);
    const items = Array.isArray(analysis.items)
      ? analysis.items.slice(0, 20).map(item => ({
          name: String(item.name || 'Aliment détecté').slice(0, 80),
          grams: positiveNumber(item.grams),
          calsPer100g: positiveNumber(item.caloriesPer100g),
          protPer100g: positiveNumber(item.proteinPer100g),
          carbPer100g: positiveNumber(item.carbPer100g),
          fatPer100g: positiveNumber(item.fatPer100g),
          fibPer100g: positiveNumber(item.fiberPer100g)
        })).filter(item => item.grams > 0)
      : [];

    if (items.length === 0) {
      return res.status(422).json({ error: 'Aucun aliment n’a pu être identifié sur cette photo. Essayez une image plus nette.' });
    }

    return res.status(200).json({
      title: String(analysis.title || 'Repas analysé').slice(0, 100),
      advice: `${String(analysis.advice || 'Les quantités et valeurs nutritionnelles sont des estimations visuelles.') .slice(0, 500)} Vérifiez les portions avant de les enregistrer.`,
      confidence: null,
      analysisAvailable: true,
      items
    });
  } catch (error) {
    console.error('Meal image analysis failed:', error);
    return res.status(502).json({ error: 'Erreur pendant l’analyse. Réessayez avec une autre photo.' });
  }
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.min(number, 10000) : 0;
}
