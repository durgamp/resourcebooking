
import { GoogleGenAI } from "@google/genai";

export const getSmartInsights = async (occupancyData: any[]) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const dataString = JSON.stringify(occupancyData.map(d => ({
    reactor: d.reactorSerialNo,
    block: d.blockName,
    proposed: d.proposedPercent.toFixed(1),
    actual: d.actualPercent.toFixed(1),
    downtime: d.downtimeHours
  })));

  const prompt = `
    Analyze the following reactor occupancy data for the manufacturing facility.
    Provide 3 high-level management bullet points regarding:
    1. Overall capacity utilization (Proposed vs Actual).
    2. Any specific blocks or reactors that are bottlenecks or underutilized.
    3. Maintenance impact on availability.
    
    Data: ${dataString}
    Keep the tone professional and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Unable to generate insights at this time.";
  }
};
