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
            content:
              "You are a helpful, friendly personal financial advisor. Answer clearly and concisely.",
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
