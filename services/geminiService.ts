
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const CACHE_KEY = 'vca_ai_cache';
const COOLDOWN_KEY = 'vca_ai_cooldown';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const COOLDOWN_DURATION = 1000 * 60 * 15; // 15 minutes cooldown after quota error

const STATIC_ADVICE = [
  "Draag altijd de voorgeschreven PBM's op de werf.",
  "Voer bij elke nieuwe taak een Last Minute Risico Analyse (LMRA) uit.",
  "Zorg dat vluchtwegen en nooduitgangen altijd vrij zijn van obstakels.",
  "Controleer elektrisch gereedschap op beschadigingen voor gebruik.",
  "Houd de werkplek schoon en georganiseerd om struikelgevaar te beperken.",
  "Gebruik de juiste ladder of trap voor de hoogte die je moet bereiken.",
  "Zorg voor voldoende verlichting op de werkplek voor een veilig overzicht."
];

const getCache = (): Record<string, { response: string, timestamp: number }> => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveToCache = (key: string, response: string) => {
  const cache = getCache();
  cache[key] = { response, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const checkCooldown = (): boolean => {
  const cooldown = localStorage.getItem(COOLDOWN_KEY);
  if (!cooldown) return false;
  const timestamp = parseInt(cooldown);
  if (Date.now() - timestamp < COOLDOWN_DURATION) {
    return true; // Still in cooldown
  }
  return false;
};

const setCooldown = () => {
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
};

/**
 * A helper function to retry API calls with exponential backoff on rate limits (429).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, backoff = 2000): Promise<T> {
  if (checkCooldown()) {
    throw new Error("API_COOLDOWN_ACTIVE");
  }

  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || "";
    const isQuotaError = error.status === 429 || errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted');
    
    if (isQuotaError) {
      setCooldown();
      if (retries > 0) {
        console.warn(`AI Quota limit hit, retrying in ${backoff}ms...`);
        await delay(backoff);
        return withRetry(fn, retries - 1, backoff * 2);
      }
    }
    throw error;
  }
}

export async function getSafetyAdvice(context: string) {
  const cacheKey = `advice_${context.substring(0, 50)}`;
  const cache = getCache();
  
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
    return cache[cacheKey].response;
  }

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Geef kort, krachtig en professioneel veiligheidsadvies (max 30 woorden) voor: ${context}. Focus op VCA normen.`,
    }));
    
    const text = response.text || STATIC_ADVICE[Math.floor(Math.random() * STATIC_ADVICE.length)];
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
    // If cooldown is active or API failed, return random static advice
    return STATIC_ADVICE[Math.floor(Math.random() * STATIC_ADVICE.length)];
  }
}

export async function searchSafetyLibrary(query: string) {
  const cacheKey = `search_${query.substring(0, 50)}`;
  const cache = getCache();

  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
    return cache[cacheKey].response;
  }

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `De gebruiker zoekt naar: "${query}" in een VCA veiligheidscatalogus. Geef 3 concrete veiligheidstips.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    }));
    
    const text = response.text || "VCA Tip: Controleer altijd de staat van je persoonlijke beschermingsmiddelen (PBM's) voor gebruik.";
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
    return "VCA Tip: Zorg voor een opgeruimde werkplek om struikelgevaar te voorkomen. Controleer elektrische kabels op beschadigingen voor gebruik.";
  }
}
