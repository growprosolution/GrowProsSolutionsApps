
import { GoogleGenAI } from "@google/genai";
import { SearchResponse, SearchEngine, SearchResult } from "../types";

export interface WorkerConfig {
  strat: string;
  startRank: number;
  endRank: number;
  label: string;
}

export type DeviceType = 'Desktop' | 'Mobile';

export class GeminiService {
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(fn: () => Promise<any>, maxRetries = 2, initialDelay = 3000): Promise<any> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const errMsg = error.message?.toLowerCase() || "";
        
        if (errMsg.includes('search_grounding_request_per_project') || errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('resource_exhausted')) {
          if (errMsg.includes('search_grounding')) {
            throw new Error("SEARCH_GROUNDING_QUOTA_EXCEEDED");
          }
          const delay = initialDelay * Math.pow(2, i);
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  private generateSearchUrl(keywords: string, engine: SearchEngine, rank: number | null, location?: string): string {
    const encodedQuery = encodeURIComponent(keywords);
    const pageIndex = rank ? Math.floor((rank - 1) / 10) : 0;
    const googleStart = pageIndex * 10;
    const locationParam = location && location !== "Native IP / Current Location" ? `&near=${encodeURIComponent(location)}` : '';

    switch (engine) {
      case 'Bing':
        return `https://www.bing.com/search?q=${encodedQuery}`;
      case 'Yahoo':
        return `https://search.yahoo.com/search?p=${encodedQuery}`;
      case 'DuckDuckGo':
        return `https://duckduckgo.com/?q=${encodedQuery}`;
      case 'Google':
      default:
        return `https://www.google.com/search?q=${encodedQuery}&gl=us&pws=0${locationParam}${pageIndex > 0 ? `&start=${googleStart}` : ''}`;
    }
  }

  private async runSearchWorker(
    ai: any, 
    targetDomain: string, 
    keywords: string, 
    location: string, 
    engine: SearchEngine, 
    config: WorkerConfig,
    deviceType: DeviceType,
    coords?: { latitude: number, longitude: number }
  ): Promise<SearchResponse & { methodologyNote?: string }> {
    let locationInstruction = "";
    if (location === "Native IP / Current Location") {
      locationInstruction = coords 
        ? `Location Context: Latitude ${coords.latitude}, Longitude ${coords.longitude}.`
        : "Location Context: User's current local IP region.";
    } else {
      locationInstruction = `Location Context: ${location}.`;
    }

    const prompt = `
      [STRICT ORGANIC SEO AUDIT - ${deviceType.toUpperCase()} MODE]
      Audit the search results for keyword: "${keywords}"
      Target Website to track: "${targetDomain}"
      ${locationInstruction}

      OUTPUT REQUIREMENTS (MUST FOLLOW):
      1. IGNORE all Ads, Map Packs, and Shopping widgets. Only count pure "blue link" organic results.
      2. TOP 40: Provide a list of the first 40 organic results (Rank 1 to 40).
      3. TARGET NEIGHBORHOOD: Locate "${targetDomain}" in the top 100.
         - If found at Rank X: You MUST provide Rank X-5, X-4, X-3, X-2, X-1, X (target), X+1, X+2, X+3, X+4, X+5.
         - If NOT found in top 100: Just state targetRank as null.
      4. FOR EVERY result listed (both in Top 40 and Neighborhood), you MUST include:
         - rank: The organic position number.
         - url: The full URL.
         - title: The page title.
         - description: A concise 1-sentence meta-description based on search results.

      JSON FORMAT:
      {
        "targetRank": number | null,
        "results": [
          { "rank": number, "url": "string", "title": "string", "description": "string" }
        ],
        "summary": "Brief device-specific SEO insight."
      }
    `;

    return await this.fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const text = response.text || "{}";
      const data = JSON.parse(text.replace(/```json|```/g, ""));
      return {
        targetRank: data.targetRank || null,
        results: (data.results || []).map((r: any) => ({ 
          rank: r.rank, 
          url: r.url, 
          title: r.title, 
          description: r.description || "Organic SEO result details...",
          keywords: [] 
        })),
        summary: data.summary || `${deviceType} audit sequence finished.`,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || 'Source',
          uri: c.web?.uri || '#'
        })) || []
      };
    });
  }

  async analyzeOrganicRank(
    website: string, 
    keywords: string, 
    location: string, 
    engine: SearchEngine,
    deviceType: DeviceType = 'Desktop',
    onProgress?: (progress: number) => void,
    coords?: { latitude: number, longitude: number }
  ): Promise<SearchResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const targetDomain = website.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    const config: WorkerConfig = { strat: 'DEEP_DIVE', startRank: 1, endRank: 100, label: 'Full Extraction' };

    try {
      const response = await this.runSearchWorker(ai, targetDomain, keywords, location, engine, config, deviceType, coords);
      
      const allResults = response.results;
      let bestRank = response.targetRank;
      
      // Secondary check: verify domain match if the AI targetRank is missing or inconsistent
      const manualMatch = allResults.find(r => r.url.toLowerCase().includes(targetDomain));
      if (manualMatch && (bestRank === null || manualMatch.rank < bestRank)) {
        bestRank = manualMatch.rank;
      }

      // Filter: Keep Top 40 AND the +/- 5 Neighborhood
      const finalResults = allResults
        .filter(r => {
          const isTop40 = r.rank <= 40;
          const isNeighborhood = bestRank !== null && r.rank >= (bestRank - 5) && r.rank <= (bestRank + 5);
          return isTop40 || isNeighborhood;
        })
        .sort((a, b) => a.rank - b.rank);

      if (onProgress) onProgress(1);

      return {
        targetRank: bestRank,
        results: finalResults,
        summary: response.summary,
        sources: response.sources,
        searchUrl: this.generateSearchUrl(keywords, engine, bestRank, location)
      };
    } catch (err: any) {
      if (err.message === "SEARCH_GROUNDING_QUOTA_EXCEEDED") {
        throw new Error("Search grounding quota reached for this API key.");
      }
      throw err;
    }
  }
}
