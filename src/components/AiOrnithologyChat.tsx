import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import {
  Bird,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Trash2,
  HelpCircle,
  Volume2,
  Compass,
  Cpu,
} from "lucide-react";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: `Hello! I am your **Urban Swift Conservation & Bioacoustics Specialist**. 

I can assist you with:
- **Acoustic Lure Calibration**: Setting up optimal speaker frequency response (4.8 - 8.2 kHz), decibel targets (~70-75dB at 1m), and dawn/dusk broadcast schedules.
- **Nest Box Construction & Siting**: Precise dimensions (65x30mm oval entrance hole, 4-5m height, shaded orientation N/NE/NW).
- **Prospecting Behavior ("Bangers")**: Recognizing when young swifts tap on your box and how to adjust call intervals.
- **Seasonal Timing**: Best calendar dates (May through August) for attraction broadcasts.

How can I help with your swift project today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    model: "gemini-3.5-flash",
  },
];

const QUICK_QUESTIONS = [
  "How loud should the swift caller speaker be without bothering neighbors?",
  "Why is my entrance hole size (65x30mm) so critical to exclude starlings?",
  "What is the exact difference between banger screaming calls and cavity duets?",
  "What height and wall orientation should my swift box have?",
  "When does the breeding season start and end in urban Europe/North America?",
];

export const AiOrnithologyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [specialistRole, setSpecialistRole] = useState<string>("general");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputText("");
    setIsLoading(true);
    setError(null);

    let systemRoleInstruction = "";
    if (specialistRole === "acoustics") {
      systemRoleInstruction = "You are a specialized bioacoustics engineer focusing strictly on swift sound lures, decibel limits (70-75dB), speaker wiring, amplifier timers, and acoustic frequency analysis.";
    } else if (specialistRole === "architecture") {
      systemRoleInstruction = "You are an architectural nest box specialist focusing on swift bricks, under-eaves installation, thermal insulation, starling-proof entrance baffles, and flight clearance.";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemInstruction: systemRoleInstruction || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to receive response from Gemini.");
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  };

  return (
    <div id="ai-ornithology-chat-panel" className="space-y-4">
      {/* Top Banner & Model Selector */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 text-slate-100 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bird className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Gemini Ornithology & Bioacoustics Specialist Chat
              </h2>
              <p className="text-xs text-slate-400">
                Multi-turn AI advisory powered by Gemini 3.5 Flash, 3.1 Pro, and 3.1 Flash Lite
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <label htmlFor="chat-model-select" className="text-xs text-slate-400">
                Model:
              </label>
              <select
                id="chat-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.5-flash" className="bg-slate-900 text-slate-200">
                  gemini-3.5-flash (General Tasks)
                </option>
                <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-slate-200">
                  gemini-3.1-pro-preview (Complex Tasks)
                </option>
                <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-slate-200">
                  gemini-3.1-flash-lite (Fast Tasks)
                </option>
              </select>
            </div>

            {/* Specialist Role Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <label htmlFor="specialist-role-select" className="text-xs text-slate-400">
                Specialist:
              </label>
              <select
                id="specialist-role-select"
                value={specialistRole}
                onChange={(e) => setSpecialistRole(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="general" className="bg-slate-900 text-slate-200">
                  General Ornithologist
                </option>
                <option value="acoustics" className="bg-slate-900 text-slate-200">
                  Bioacoustics & Sound Engine
                </option>
                <option value="architecture" className="bg-slate-900 text-slate-200">
                  Nest Box & Siting Architect
                </option>
              </select>
            </div>

            <button
              id="clear-chat-history-btn"
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isBot ? "self-start" : "self-end ml-auto flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isBot
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200 shadow-xs"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  }`}
                >
                  {/* Markdown or plain text formatted with paragraphs */}
                  <div className="whitespace-pre-wrap space-y-1.5">
                    {msg.content}
                  </div>

                  <div
                    className={`text-[10px] mt-2 flex items-center justify-between gap-2 ${
                      isBot ? "text-slate-500" : "text-emerald-200"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.model && (
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                        isBot ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-emerald-700/60 text-emerald-100"
                      }`}>
                        {msg.model}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Consulting Gemini ({selectedModel})...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex overflow-x-auto gap-1.5 scrollbar-none">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              id={`quick-q-btn-${idx}`}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-950 hover:bg-slate-800 hover:border-emerald-500/40 text-slate-300 rounded-full border border-slate-800 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about swift calls, speaker wattage, dusk timing, or nest box siting..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
            />
            <button
              id="chat-submit-btn"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors disabled:opacity-40 shadow-sm shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <div className="mt-2 text-[11px] text-rose-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
