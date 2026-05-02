import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const prompt = `Analyze the sentiment of the following text and provide a result exactly in this JSON format:
{
  "positive": number (0-100),
  "neutral": number (0-100),
  "negative": number (0-100),
  "insight": "Short summary in French of why it's positive/negative"
}
The three numbers must add up exactly to 100.
Text: "${text}"`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();
    
    // Clean JSON response (sometimes Gemini adds markdown blocks)
    const cleanedJson = resultText.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanedJson);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Failed to analyze sentiment', error);
    return res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      positive: 33,
      neutral: 34,
      negative: 33,
      insight: "Erreur lors de l'analyse. Veuillez réessayer."
    });
  }
}
