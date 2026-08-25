"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Bot, Send, X, MessageSquare, ArrowRight, Mic, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OrbState = "idle" | "listening" | "thinking" | "responding";

interface Message {
  role: "assistant" | "user";
  text: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function HolographicAIOrb() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Greetings. I am your NextGen Spatial AI Assistant. How can I assist your home search or compatibility analysis today?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInputVal("");
    setOrbState("thinking");

    // Process intelligence
    setTimeout(() => {
      setOrbState("responding");
      const lower = query.toLowerCase();

      let reply: Message = {
        role: "assistant",
        text: "I analyzed our spatial database. Here are the verified properties matching your requirements:",
      };

      if (lower.includes("powai") || lower.includes("mumbai") || lower.includes("2bhk") || lower.includes("2 bhk")) {
        reply = {
          role: "assistant",
          text: "Found 14 verified 2 BHK apartments in Powai, Mumbai with 94%+ lifestyle compatibility and lake views under ₹35,000/mo.",
          actionUrl: "/search?city=Mumbai&q=Powai&minBedrooms=2",
          actionLabel: "View Powai 2 BHK Matches",
        };
      } else if (lower.includes("bangalore") || lower.includes("whitefield") || lower.includes("pet")) {
        reply = {
          role: "assistant",
          text: "Located 8 pet-friendly luxury villas in Whitefield, Bangalore with private compounds and high natural light.",
          actionUrl: "/search?city=Bangalore&petsAllowed=true",
          actionLabel: "View Pet-Friendly Bangalore Homes",
        };
      } else if (lower.includes("pune") || lower.includes("hinjewadi") || lower.includes("studio")) {
        reply = {
          role: "assistant",
          text: "Discovered 6 high-tech studios near Hinjewadi IT Park starting from ₹15,000/mo with zero brokerage.",
          actionUrl: "/search?city=Pune&type=STUDIO",
          actionLabel: "View Hinjewadi Studios",
        };
      } else {
        reply = {
          role: "assistant",
          text: `Executing 3D spatial query for "${query}". Exploring all metropolitan sectors with highest mutual match compatibility.`,
          actionUrl: `/search?q=${encodeURIComponent(query)}`,
          actionLabel: "Explore Search Results",
        };
      }

      setMessages((prev) => [...prev, reply]);
      setTimeout(() => setOrbState("idle"), 1500);
    }, 1000);
  };

  return (
    <>
      {/* Floating Holographic Orb Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-full flex items-center justify-center focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Open AI Assistant"
        >
          {/* Animated Glowing Aura */}
          <div
            className={`absolute inset-0 rounded-full blur-md opacity-80 transition-all duration-500 ${
              orbState === "thinking"
                ? "bg-gradient-to-r from-violet-500 to-pink-500 animate-spin"
                : orbState === "responding"
                ? "bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 animate-pulse-glow"
            }`}
          />

          {/* Holographic Orb Inner Core */}
          <div className="relative w-full h-full rounded-full bg-[#080d22] border-2 border-cyan-400/60 flex items-center justify-center shadow-holo-md backdrop-blur-xl">
            <Sparkles className="w-6 h-6 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
          </div>

          {/* Tooltip on hover */}
          {!isOpen && (
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Spatial AI Assistant ✦
            </span>
          )}
        </button>
      </div>

      {/* Holographic Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md h-[520px] rounded-3xl glass-panel border border-cyan-400/40 shadow-holo-lg flex flex-col overflow-hidden animate-scale-in scanline-effect">
          {/* Top Bar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[rgba(8,12,30,0.9)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  Spatial AI Assistant
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="text-[10px] font-mono text-cyan-300">
                  {orbState === "thinking"
                    ? "Synthesizing parameters..."
                    : orbState === "responding"
                    ? "Transmitting recommendations..."
                    : "Live Neural Matrix Connected"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-holo-sm"
                      : "bg-white/10 text-white/90 rounded-bl-none border border-white/10 backdrop-blur-md"
                  }`}
                >
                  {m.text}
                </div>

                {m.actionUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      router.push(m.actionUrl!);
                      setIsOpen(false);
                    }}
                    className="mt-2 text-xs h-8 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-semibold shadow-holo-sm flex items-center gap-1"
                  >
                    {m.actionLabel} <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {[
              "Powai 2 BHK under 35k",
              "Whitefield Pet-Friendly",
              "Hinjewadi IT Studio",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-white/70 hover:text-cyan-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Console */}
          <div className="p-3 border-t border-white/10 bg-[rgba(8,12,30,0.9)] flex items-center gap-2">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything (e.g. 2BHK near metro under 30k)..."
              className="h-10 text-xs rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-cyan-400"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-holo-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
