
import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../config/supabase";
import { useNavigate } from "react-router-dom";
import { askWeatherAgent } from "../config/agent";
import { getTime } from "../utils/time";
import toast from "react-hot-toast";
import { cleanAgentText } from "../utils/clean";
import SplashScreen from "../components/Splash";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeHistory, setActiveHistory] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const reactionPanelRef = useRef(null);
  

  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const [reactions, setReactions] = useState({});
  const longPressTimer = useRef(null);

  const [user, setUser] = useState(null);
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);

  const [messages, setMessages] = useState([]);


 
  // FEATURE: Filter logic for messages based on searchQuery
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter((msg) =>
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const createNewChat = () => {
    if (!currentChatId && messages.length === 1) return;
    localStorage.removeItem("lastChatId");
    setCurrentChatId(null);
    setMessages([
      {
        role: "agent",
        text: "Atmospheric intelligence grid online. I am your Weather Agent, ready for real-time tracking and analysis. How can I assist your mission?",
        time: "W I N D Y",
        timestamp: getTime(),
      },
    ]);
    setActiveHistory(null);
    setSearchQuery("");
  };

  const handleClearAllChats = () => {
    setMessages([
      {
        role: "agent",
        text: "Atmospheric intelligence grid online. How can I assist you?",
        time: "W I N D Y",
        timestamp: getTime(),
      },
    ]);
    setCurrentChatId(null);
    setActiveHistory(null);
  };

  const openChat = async (chatId) => {
    setCurrentChatId(chatId);
    localStorage.setItem("lastChatId", chatId);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at");

    if (data) setMessages(data);

    const { data: reactionData } = await supabase
      .from("message_reactions")
      .select("message_id, user_id, reaction")
      .in(
        "message_id",
        (data || []).map((m) => m.id)
      );

    const userReactions = {};
    reactionData?.forEach((r) => {
      if (user && r.user_id === user.id) {
        userReactions[r.message_id] = r;
      }
    });

    setReactions(userReactions);
  };

  useEffect(() => {
    if (!scrollRef.current || searchQuery) {
      return
    }
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (user !== null) setLoading(false);
  }, [user]);


  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      setChatHistory(data || []);
    };
    if (user) loadChats();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (reactionPanelRef.current && !reactionPanelRef.current.contains(e.target)) {
        setActiveReactionMsg(null);
      }
    };
    if (activeReactionMsg) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [activeReactionMsg]);

  useEffect(() => {
  if (!user || chatHistory.length === 0) return;

  const lastChatId = localStorage.getItem("lastChatId");

  if (lastChatId) {
    const exists = chatHistory.find(c => c.id === lastChatId);
    if (exists) {
      openChat(lastChatId);
      return;
    }
  }

  // 👇 Only create default message if NO previous chat
  setMessages([
    {
      role: "agent",
      text: "Atmospheric intelligence grid online. I am your Weather Agent. How can I assist your mission?",
      time: "W I N D Y",
      timestamp: getTime(),
    },
  ]);
}, [user, chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;

    const userText = input;
    setInput("");
    setIsTyping(true);
    setSearchQuery(""); // Clear search when sending new message

    let chatId = currentChatId;
    let agentText = "";
    let tokenQueue = [];
    let isProcessingQueue = false;

    const TYPING_DELAY = 30;

    const processQueue = async () => {
      if (isProcessingQueue || tokenQueue.length === 0) return;
      isProcessingQueue = true;
      while (tokenQueue.length > 0) {
        const token = tokenQueue.shift();
        agentText += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: cleanAgentText(agentText),
          };
          return updated;
        });
        await new Promise((r) => setTimeout(r, TYPING_DELAY));
      }
      isProcessingQueue = false;
    };

    try {
      if (!chatId) {
        const { data: newChat, error } = await supabase
          .from("chats")
          .insert({ user_id: user.id, title: userText.slice(0, 30) })
          .select()
          .single();
        if (error) throw error;
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChatHistory((prev) => [newChat, ...prev]);
      }

      const { data: savedUserMsg } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, role: "user", text: userText })
        .select()
        .single();

      setMessages((prev) => [
        ...prev,
        { id: savedUserMsg.id, role: "user", text: userText, time: "YOU", timestamp: getTime() },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "",
          time: "W I N D Y",
          timestamp: getTime(),
          isStreaming: true, // ⭐ IMPORTANT
        },
      ]);

      await askWeatherAgent(userText, chatId, (token) => {
        tokenQueue.push(token);
        processQueue();
      });

      while (tokenQueue.length > 0) await new Promise((r) => setTimeout(r, 50));

      const { data: savedAgentMsg } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, role: "agent", text: cleanAgentText(agentText) })
        .select()
        .single();

      setMessages((prev) =>
        prev.map((m) =>
          m.isStreaming
            ? { ...m, isStreaming: false, id: savedAgentMsg.id }
            : m,
        ),
      );

    } catch (err) {
      console.error(err);
      toast.error("Message failed ❌");
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSingleReaction = async (messageId, emoji) => {
    if (!user) return;
    const existing = reactions[messageId];
    if (existing && existing.reaction === emoji) {
      await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", user.id);
      setReactions((prev) => {
        const updated = { ...prev };
        delete updated[messageId];
        return updated;
      });
      toast("Reaction removed");
      return;
    }
    await supabase.from("message_reactions").upsert(
      { message_id: messageId, user_id: user.id, reaction: emoji },
      { onConflict: "message_id,user_id" }
    );
    setReactions((prev) => ({
      ...prev,
      [messageId]: { message_id: messageId, user_id: user.id, reaction: emoji },
    }));
    toast.success(`Reaction updated ${emoji}`);
  };

   if (loading) {
     return <SplashScreen onComplete={() => setLoading(false)} />;
   }
  

  return (
    <main className="flex h-screen w-full bg-[#f0f9f4] text-[#2d4a3e] font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orbital-line w-[120vw] h-[120vw] opacity-10 text-[#cbd5e1]"></div>
        <div className="orbital-line w-[80vw] h-[80vw] opacity-20 text-[#cbd5e1]"></div>
        <div className="orbital-line w-[40vw] h-[40vw] opacity-30 text-[#cbd5e1]"></div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        activeHistory={activeHistory}
        setActiveHistory={setActiveHistory}
        onNewChat={createNewChat}
        onSelectChat={openChat}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        onClearChats={handleClearAllChats}
      />

      <section className="flex-1 flex flex-col relative min-w-0 z-10">
        <header className="h-16 flex items-center justify-between px-6 lg:px-12 gap-6 border-b border-[#cbd5e1]/10 bg-white/10 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors text-[#2d4a3e]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#2d4a3e] tracking-[0.3em]">
                WINDY Console
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            {/* FEATURE: Chat Search Filter UI */}
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-moss/40 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/40 border border-[#cbd5e1]/20 rounded-full py-1.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#4ade80]/10 focus:border-[#4ade80]/40 transition-all placeholder:text-moss/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="material-symbols-outlined text-xs text-moss/40 hover:text-red-400">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-[#cbd5e1]/20">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 hover:bg-white/50 rounded-lg transition-colors text-[#2d4a3e]"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-moss uppercase tracking-tight">
                {user?.user_metadata?.full_name || "Guest"}
              </p>
              <p className="text-[9px] font-black text-[#2d4a3e]/40 uppercase tracking-widest">
                {user?.email || "No session"}
              </p>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-white border-2 border-[#cbd5e1]/20 flex items-center justify-center text-xs font-black text-moss shadow-sm"
              >
                {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() ||
                  "?"}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-[#cbd5e1]/20 z-50">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setShowUserMenu(false);
                      navigate("/login");
                    }}
                    className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Search Bar Expandable */}
        {showSearch && (
          <div className="md:hidden p-4 bg-white/30 backdrop-blur-md border-b border-[#cbd5e1]/10 animate-in slide-in-from-top duration-300">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-moss/40 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search current chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white border border-[#cbd5e1]/20 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-8 scroll-smooth no-scrollbar"
        >
          {messages.length < 3 && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-1000">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tighter text-[#2d4a3e] uppercase">
                Weather at a Glance
              </h2>
              <p className="text-[#2d4a3e]/40 max-w-sm text-sm leading-relaxed font-semibold uppercase tracking-tight">
                Live conditions, accurate forecasts, and timely weather alerts
                worldwide.
              </p>
            </div>
          )}

          {/* FEATURE: Result status when searching */}
          {searchQuery && (
            <div className="max-w-4xl mx-auto px-4 py-2 bg-white/50 backdrop-blur rounded-xl border border-[#cbd5e1]/20 flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-moss/60 uppercase tracking-widest">
                Searching for:{" "}
                <span className="text-moss font-black">"{searchQuery}"</span>
              </span>
              <span className="text-[10px] font-black text-moss/60 uppercase">
                {filteredMessages.length} results
              </span>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-10 pb-12">
            {filteredMessages.length === 0 && searchQuery ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-moss/20 text-6xl mb-4">
                  search_off
                </span>
                <p className="text-moss/40 font-black uppercase text-xs tracking-[0.2em]">
                  No intelligence matches this query
                </p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`relative flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (msg.id) setActiveReactionMsg(msg.id);
                  }}
                  onTouchStart={() => {
                    longPressTimer.current = setTimeout(() => {
                      if (msg.id) setActiveReactionMsg(msg.id);
                    }, 300);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                >
                  <div
                    className={`flex items-center gap-2 mb-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <span className="text-[9px] font-black text-[#2d4a3e]/30 uppercase tracking-[0.4em]">
                      {msg.time ||
                        (msg.role === "user" ? "YOU" : "W I N D Y")}{" "}
                      • {msg.timestamp || "RECENT"}
                    </span>
                  </div>

                  <div
                    className={`max-w-[90%] lg:max-w-[75%] p-5 lg:p-6 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                      msg.role === "user"
                        ? "bg-[#2d4a3e] text-white rounded-tr-none"
                        : "bg-white text-[#2d4a3e] border border-[#cbd5e1]/20 rounded-tl-none"
                    }`}
                  >
                    {/* Highlighting logic could be added here if needed, but keeping text simple per instructions */}
                    {msg.text}
                    {isTyping &&
                      msg.role === "agent" &&
                      msg.isStreaming &&
                      isTyping &&
                      !searchQuery && <span className="typing-cursor">▌</span>}
                  </div>
                  {activeReactionMsg === msg.id && (
                    <div
                      className={`absolute ${msg.role === "user" ? "right-0" : "left-0"} -top-12 z-50`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        ref={reactionPanelRef}
                        className="flex gap-3 bg-white px-4 py-2 rounded-full shadow-xl border"
                      >
                        {["👍", "❤️", "😂", "😮", "😢", "👎"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              toggleSingleReaction(msg.id, emoji);
                              setActiveReactionMsg(null);
                            }}
                            className="text-lg hover:scale-125 transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {reactions[msg.id] && (
                    <div className="mt-1 text-xs flex justify-end">
                      <span className="px-2 py-0.5 bg-white border rounded-full shadow">
                        {reactions[msg.id].reaction}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 lg:p-10 pt-0 bg-[#f0f9f4]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="hidden sm:flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                "Will it rain tomorrow?",
                "Weekend forecast in London",
                "Any storm warnings?",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-[#cbd5e1]/30 hover:border-[#4ade80] text-[9px] font-black uppercase tracking-widest text-[#2d4a3e]/40 hover:text-[#4ade80] transition-all duration-300 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-[#cbd5e1] group-focus-within:text-[#4ade80] transition-colors">
                <span className="material-symbols-outlined text-xl">
                  explore
                </span>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  isTyping
                    ? "Analyzing weather data..."
                    : "Secure Communication... Ask Weather Agent"
                }
                className="w-full bg-white border border-[#cbd5e1]/40 rounded-[1.5rem] py-5 lg:py-6 pl-16 pr-20 focus:outline-none focus:ring-8 focus:ring-[#4ade80]/5 focus:border-[#4ade80]/40 placeholder:text-[#2d4a3e]/20 text-sm font-semibold transition-all shadow-lg"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#2d4a3e] hover:bg-[#4ade80] text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-[8px] text-center text-[#2d4a3e]/30 font-black uppercase tracking-[0.4em]">
                W I N D Y• Product ID: SHON
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="absolute -top-48 -left-48 w-[40rem] h-[40rem] rounded-full bg-[#4ade80]/5 blur-[120px] pointer-events-none"></div>
    </main>
  );
};

export default Home;
