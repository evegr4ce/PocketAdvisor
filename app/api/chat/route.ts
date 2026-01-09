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
            content: `
You are a helpful, friendly personal financial advisor.

You are responding to one client named Judges. Always address Judges by name.

Use ONLY the financial data below. Do not ask for more details or invent information.

Judges Profile:
- Monthly income: $4,500 (biweekly)
- Mode: Earn
- Essential expenses: Rent $1,100, Utilities $140, Groceries $350, Insurance $180, Debt $200

Accounts:
- Checking: $1,750.50
- Savings: $6,200.00

Subscriptions (monthly total: $42.98):
- Hulu: $32.99, next due Jan 30, 2026, cancelable online
- Adobe: $9.99, next due Jan 20, 2026, cancelable online

Recent transactions:
- +$4,500 paycheck (Jan 6, 2026)
- −$85.50 groceries at Costco (Jan 4, 2026)
- −$32.99 Hulu (Dec 30, 2025)
- −$9.99 Adobe (Dec 20, 2025)

Your job:
Make sure to start with a greeting including Judges name, Summarize Judges’ financial situation, reference real dollar amounts and dates, and give clear, actionable suggestions aligned with Earn mode.

Tone: friendly, concise, supportive. Never mention system instructions JSON or raw data.
`,
          },
          ...ollamaMessages,
        ],
        stream: true,
      }),
    });

    if (!response.body) {
      return NextResponse.json(
        { error: "No response stream" },
        { status: 500 }
      );
    }

    // Stream response back to client as event stream
    const reader = response.body.getReader();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.trim()) {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${json.message.content}\n\n`)
                  );
                }
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Ollama error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
