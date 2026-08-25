"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Send, 
  Search, 
  Building2, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  MoreVertical, 
  Paperclip,
  CheckCheck,
  Circle,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

interface Conversation {
  id: string;
  property?: {
    id: string;
    title: string;
    city: string;
    locality: string;
    rent: number;
    images?: { url: string }[];
  } | null;
  otherUser?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const json = await res.json();
        const convos = json.data || [];
        if (convos.length > 0) {
          setConversations(convos);
          setSelectedConvo(convos[0]);
          loadMessages(convos[0].id);
          return;
        }
      }
      
      // Fallback demo state
      const demoConvos: Conversation[] = [
        {
          id: "demo-convo-1",
          property: {
            id: "demo-1",
            title: "Modern 2 BHK Skyline Suite — Powai",
            city: "Mumbai",
            locality: "Powai",
            rent: 30000,
            images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" }]
          },
          otherUser: {
            id: "landlord-suresh",
            firstName: "Suresh",
            lastName: "Kamath",
            role: "LANDLORD"
          },
          lastMessage: "Sounds great! Would you be available for a physical visit this Saturday at 11 AM?",
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          unreadCount: 1,
        },
        {
          id: "demo-convo-2",
          property: {
            id: "demo-2",
            title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
            city: "Bangalore",
            locality: "Whitefield",
            rent: 55000,
            images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" }]
          },
          otherUser: {
            id: "landlord-anita",
            firstName: "Anita",
            lastName: "Reddy",
            role: "LANDLORD"
          },
          lastMessage: "Yes, small pets are definitely welcome in our society!",
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          unreadCount: 0,
        }
      ];

      setConversations(demoConvos);
      setSelectedConvo(demoConvos[0]);
      setMessages([
        {
          id: "m1",
          senderId: "landlord-suresh",
          content: "Hello Priya! Thank you for your application for the 2BHK in Powai.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: "m2",
          senderId: "current-user",
          content: "Hi Suresh! I loved the photos and the location is super close to my office in Powai. Are the maintenance charges included in the rent?",
          createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        },
        {
          id: "m3",
          senderId: "landlord-suresh",
          content: "The rent is ₹30,000 and maintenance is ₹3,000 extra paid directly to society. Everything is professionally managed with 24/7 power backup.",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "m4",
          senderId: "landlord-suresh",
          content: "Sounds great! Would you be available for a physical visit this Saturday at 11 AM?",
          createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        }
      ]);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convoId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConvo) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const messageToSend = inputText.trim();
    setInputText("");

    try {
      setSending(true);
      await fetch(`/api/conversations/${selectedConvo.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageToSend }),
      });
    } catch {
      // Optimistic
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = `${c.otherUser?.firstName || ""} ${c.otherUser?.lastName || ""}`.toLowerCase();
    const title = (c.property?.title || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || title.includes(q);
  });

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col bg-[#050814] text-foreground">
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex gap-4 overflow-hidden">
        
        {/* Left Sidebar: Conversation List */}
        <div className={`w-full md:w-96 flex flex-col glass-card-3d rounded-3xl overflow-hidden border border-white/10 ${selectedConvo ? "hidden md:flex" : "flex"}`}>
          {/* Search & Header */}
          <div className="p-4 border-b border-white/10 bg-[rgba(8,12,30,0.85)]">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Direct Channels
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/40">
                Live Chat
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <Input
                placeholder="Search chats, properties, landlords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-white/50 text-xs">
                No active conversations found
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConvo?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedConvo(c);
                      loadMessages(c.id);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-cyan-500/15 border-l-2 border-cyan-400"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {c.otherUser?.firstName?.[0] || "U"}{c.otherUser?.lastName?.[0] || ""}
                      </div>
                      {(c.unreadCount ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#050814]">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                          {c.otherUser?.firstName} {c.otherUser?.lastName}
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                        </div>
                        {c.lastMessageAt && (
                          <span className="text-[10px] text-white/40 shrink-0 font-mono">
                            {formatRelativeTime(c.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {c.property && (
                        <div className="text-[11px] text-cyan-300 font-medium truncate mb-0.5 font-mono">
                          {c.property.title}
                        </div>
                      )}

                      <p className="text-xs text-white/60 truncate">
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane: Active Chat Room */}
        {selectedConvo ? (
          <div className="flex-1 flex flex-col glass-card-3d rounded-3xl overflow-hidden border border-white/10">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-[rgba(8,12,30,0.85)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvo(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                >
                  ←
                </button>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedConvo.otherUser?.firstName?.[0] || "U"}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    {selectedConvo.otherUser?.firstName} {selectedConvo.otherUser?.lastName}
                    <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30">
                      {selectedConvo.otherUser?.role}
                    </span>
                  </div>
                  {selectedConvo.property && (
                    <Link
                      href={`/properties/${selectedConvo.property.id}`}
                      className="text-xs text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Building2 className="w-3 h-3 text-cyan-400" />
                      {selectedConvo.property.title} (₹{selectedConvo.property.rent.toLocaleString("en-IN")}/mo)
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href="/visits">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-xl border-cyan-400/40 text-cyan-300 bg-cyan-500/10">
                    <Calendar className="w-3.5 h-3.5" /> Schedule Visit
                  </Button>
                </Link>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[rgba(6,10,26,0.6)] custom-scrollbar">
              {messages.map((m) => {
                const isMe = m.senderId === "current-user" || m.senderId !== selectedConvo.otherUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? "chat-bubble--sent text-white"
                          : "chat-bubble--received text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-white/40 px-1 font-mono">
                      <span>{formatRelativeTime(m.createdAt)}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-white/10 bg-[rgba(8,12,30,0.85)] flex items-center gap-2">
              <Input
                placeholder="Type your message to landlord..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs rounded-xl h-11 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-cyan-400"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 font-bold text-xs shadow-holo-sm border border-cyan-400/40"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 glass-card-3d rounded-3xl items-center justify-center text-center p-8 text-white/50 border border-white/10">
            <div>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-cyan-400/40" />
              <h3 className="font-bold text-white text-base">Select a conversation</h3>
              <p className="text-xs text-white/50 mt-1 max-w-sm">
                Connect directly with property owners and tenants without brokers or intermediaries.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
