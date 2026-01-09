import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Convert messages into Ollama-friendly chat format
    const ollamaMessages = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1:8b",
        messages: [
          {
            role: "system",
            content: `You are Pocket Buddy, a friendly personal financial advisor for Demo.
Demo: Income $4,500 biweekly | Expenses: Rent $1,100, Utilities $140, Groceries $350, Insurance $180, Debt $200
Accounts: Checking $1,750.50, Savings $6,200 | Subscriptions: Hulu $32.99, Adobe $9.99 (Jan 2026)
Recent: +$4,500 paycheck (Jan 6), −$85.50 Costco (Jan 4)

Be concise, supportive, actionable. Greet by name. Use only provided data.`,
          },
          ...ollamaMessages,
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      reply: data.message?.content ?? "Sorry — no response generated.",
    });
  } catch (error) {
    console.error("Ollama error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
