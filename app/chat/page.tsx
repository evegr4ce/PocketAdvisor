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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      const botMessage: Message = { text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        text: "Oops, something went wrong.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-[#0a2540]">ChatBot</h1>
          <p className="text-slate-500 mt-1">
            Your own personal financial advisor
          </p>
        </div>

        {/* ChatBox */}
        <div className="w-full max-w-2xl h-[70vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col mx-auto">
          {/* Messages */}
          <ul className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <li
                key={idx}
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  msg.sender === "user"
                    ? "bg-blue-100 text-blue-900 self-end"
                    : "bg-gray-100 text-gray-900 self-start"
                }`}
              >
                {msg.text}
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex border-t border-gray-200 p-3 gap-2"
          >
            <textarea
              className="flex-1 p-2 border rounded-lg resize-none bg-gray-50"
              rows={2}
              placeholder="Enter a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
  );
}
