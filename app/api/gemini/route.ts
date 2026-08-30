import { NextRequest, NextResponse } from "next/server";

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function POST(request: NextRequest) {
  const { input } = await request.json();
  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ reply: "Input is required." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as GeminiApiResponse;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply: reply || "No response available." });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { reply: "Server error. Please try again later." },
      { status: 500 },
    );
  }
}
