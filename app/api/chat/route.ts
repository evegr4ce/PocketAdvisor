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

Be concise, supportive, actionable. Greet by name. Use only provided data. IMPORTANT: Do NOT use new lines or line breaks. Keep all text on a single line using only punctuation and spaces for formatting.`,
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

    // Stream response back to client
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
                try {
                  const json = JSON.parse(line);
                  if (json.message?.content) {
                    controller.enqueue(
                      encoder.encode(`data: ${json.message.content}\n\n`)
                    );
                  }
                } catch {
                  // Skip unparseable lines
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
