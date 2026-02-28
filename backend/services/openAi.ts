import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateWithAI(prompt: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // Free Groq model
      messages: [
        {
          role: "system",
          content:
            "You are an expert software architect and prompt engineer. Generate structured, professional outputs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return completion.choices[0].message?.content || "";
  } catch (error: any) {
    console.error("Groq error:", error.response?.data || error.message);
    throw new Error("Groq generation failed");
  }
}
