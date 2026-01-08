import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    });

    const botReply =
      completion.choices[0].message?.content ?? "I couldn't respond.";

    return NextResponse.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
