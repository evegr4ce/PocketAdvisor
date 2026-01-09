"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Navbar from "@/components/navbar";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hey! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.slice(6);
            if (text) {
              botText += text;
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg?.sender === "bot") {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    text: botText,
                  };
                } else {
                  updated.push({ text: botText, sender: "bot" });
                }
                return updated;
              });
            }
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        text: "Oops, something went wrong.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="ml-64 min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div>
            <h1 className="text-3xl font-semibold text-[#0a2540]">
              Pocket Buddy
            </h1>
            <p className="text-slate-500 mt-1">
              Your own personal financial advisor
            </p>
          </div>

          {/* ChatBox */}
          <div className="w-full max-w-2xl h-[70vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col mx-auto\">
            {/* Messages */}
            <ul className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <li
                  key={idx}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } items-end`}
                >
                  {msg.sender === "bot" ? (
                    <>
                      <img
                        src="/pocket_logo.png"
                        alt="Pocket Advisor logo"
                        className="w-12 h-12 rounded-full mr-3 flex-shrink-0 shadow-md border border-gray-100"
                      />
                      <div className="px-4 py-2 rounded-lg max-w-[60%] break-words text-sm leading-relaxed bg-white border border-gray-200 text-gray-900 shadow-sm">
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-2 rounded-lg max-w-[80%] break-words text-sm leading-relaxed bg-blue-600 text-white shadow-md">
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  )}
                </li>
              ))}

              {isLoading && (
                <li className="flex justify-start items-end gap-3">
                  <img
                    src="/pocket_logo.png"
                    alt="Pocket Advisor logo"
                    className="w-10 h-10 rounded-full flex-shrink-0 shadow-md border border-gray-100"
                  />
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0s" }}
                    />
                    <span
                      className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </li>
              )}

              <div ref={messagesEndRef} />
            </ul>

            {/* Input */}
            <form
              ref={formRef}
              onSubmit={handleSend}
              className="flex border-t border-gray-200 p-3 gap-2 items-center"
            >
              <textarea
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden"
                rows={1}
                placeholder="Enter a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    Math.min(e.currentTarget.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
