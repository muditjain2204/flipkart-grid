import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../config/logger";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

export async function generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("LLM returned empty content");
    }

    return JSON.parse(content) as T;
  } catch (error) {
    logger.error("LLM Generation Error:", error);
    throw error;
  }
}
