import { analyzeMealImageServer } from '../server/vision.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { imageDataUrl, userComment } = req.body || {};
  const clientApiKey = req.headers['x-gemini-key'] || req.body?.apiKey || '';

  try {
    const analysis = await analyzeMealImageServer(imageDataUrl, userComment, clientApiKey);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
