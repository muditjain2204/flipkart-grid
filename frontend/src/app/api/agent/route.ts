import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompts: Record<string, string> = {
  event: `You are the Event Intelligence Agent for a smart city traffic system.
Given the event details, estimate the traffic risk and crowd impact.
Output valid JSON with strictly these keys:
{
  "Risk Level": "e.g., HIGH, MODERATE, CRITICAL",
  "Arrival Window": "e.g., 16:00 - 18:30",
  "Event Severity": "e.g., Severe Impact"
}`,
  traffic: `You are the Traffic Perception Agent.
Based on the provided event risk and context, estimate realistic current traffic conditions.
Output valid JSON with strictly these keys:
{
  "Vehicle Count": "e.g., 1,482/hr",
  "Density Level": "e.g., High (0.84)",
  "Avg Speed": "e.g., 12 km/h",
  "Queue Length": "e.g., 1.2 km"
}`,
  prediction: `You are the Congestion Prediction Agent.
Analyze the event and current traffic data to forecast future conditions.
Output valid JSON with strictly these keys:
{
  "Predicted State": "e.g., Severe Gridlock",
  "Peak Hours": "e.g., 17:30 - 19:00",
  "Confidence": "e.g., 94%"
}`,
  resource: `You are the Resource Planning Agent.
Determine police and barricade requirements based on the predicted congestion.
Output valid JSON with strictly these keys:
{
  "Officers Req.": "e.g., 85 Personnel",
  "Barricades": "e.g., 42 Units",
  "Priority Zones": "e.g., Gates 1-4"
}`,
  diversion: `You are the Diversion Strategy Agent.
Suggest alternate routes and restrictions based on predicted congestion.
Output valid JSON with strictly these keys:
{
  "Detour Route": "e.g., SP Ring Road (+12m)",
  "Restricted Radius": "e.g., 2.0 km",
  "Emergency Lane": "e.g., Open"
}`,
  decision: `You are the Decision Synthesis Agent.
Aggregate the resource, diversion, and risk data into a final executive plan.
Output valid JSON with strictly these keys:
{
  "Unified Plan": "e.g., Execute Protocol Alpha",
  "Action Items": "e.g., Dispatch + Reroute",
  "Final Score": "e.g., Actionable"
}`
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const { agentId, context } = await req.json();

    if (!agentId || !systemPrompts[agentId]) {
      return NextResponse.json({ error: "Invalid agentId" }, { status: 400 });
    }

    const prompt = systemPrompts[agentId];
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, cheap, and capable
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Context data from previous pipeline steps: \n${JSON.stringify(context, null, 2)}\n\nGenerate your analysis.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const outputString = response.choices[0].message.content || "{}";
    const outputJson = JSON.parse(outputString);

    return NextResponse.json({ output: outputJson });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
