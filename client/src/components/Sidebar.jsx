
import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';



const Sidebar = ({
  isOpen,
  onClose,
  activeHistory,
  setActiveHistory,
  user,
  onNewChat,
  onSelectChat,
  chatHistory,
  setChatHistory,
  onClearChats,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const exportChat = async (chatId, chatTitle) => {
    // 1️⃣ Get messages of this chat
    const { data: messages } = await supabase
      .from("messages")
      .select("role, text, created_at")
      .eq("chat_id", chatId)
      .order("created_at");

    if (!messages?.length) {
      toast.error("No messages to export");
      return;
    }



    // 2️⃣ Convert messages to readable text
    const content = messages
      .map((msg) => {
        const sender = msg.role === "user" ? "YOU" : "WEATHER AGENT";
        return `[${sender}] ${msg.text}•${msg.created_at}`;
      })
      .join("\n\n");

    // 3️⃣ Create file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // 4️⃣ Download file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatTitle || "weather-chat"}.txt`;
    a.click();

    URL.revokeObjectURL(url);

    toast.success("Chat exported successfully");
  };

  const saveRename = async (chatId) => {
    if (!draftTitle.trim()) {
      setEditingId(null);
      return;
    }

    // Update database
    await supabase.from("chats").update({ title: draftTitle }).eq("id", chatId);

    // Update UI instantly
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: draftTitle } : chat,
      ),
    );

    setEditingId(null);
  };

  const deleteChat = async (chatId) => {
    toast(
      (t) => (
        <div>
          <p className="font-semibold">Delete this chat permanently?</p>
          <div className="flex gap-2 mt-4">
            <button
              className="px-3 py-2 bg-red-500 text-white rounded-md"
              onClick={async () => {
                toast.dismiss(t.id);

                const loading = toast.loading("Deleting chat...");

                try {
                  // 1️⃣ Delete messages
                  await supabase
                    .from("messages")
                    .delete()
                    .eq("chat_id", chatId);

                  // 2️⃣ Delete chat
                  await supabase.from("chats").delete().eq("id", chatId);

                  // 3️⃣ Update UI
                  setChatHistory((prev) =>
                    prev.filter((chat) => chat.id !== chatId),
                  );

                  if (activeHistory !== null) {
                    setActiveHistory(null);
                  }

                  toast.success("Chat deleted", { id: loading });
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete chat", {
                    id: loading,
                  });
                }
              }}
            >
              Delete
            </button>

            <button
              className="px-3 py-2 bg-gray-200 rounded-md"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };


  const clearHistory = async () => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    // 🔔 Toast confirmation instead of window.confirm
    toast(
      (t) => (
        <div>
          <p>Are you sure you want to clear all chat history?</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
            <button
              className='p-2 bg-black text-white rounded-md'
              onClick={async () => {
                toast.dismiss(t.id);

                const loadingToast = toast.loading("Clearing chat history...");

                try {
                  // 1️⃣ Get all chats
                  const { data: chats, error } = await supabase
                    .from("chats")
                    .select("id")
                    .eq("user_id", user.id);

                  if (error) throw error;

                  // 2️⃣ Delete messages
                  if (chats?.length) {
                    const chatIds = chats.map((c) => c.id);
                    await supabase
                      .from("messages")
                      .delete()
                      .in("chat_id", chatIds);
                  }

                  // 3️⃣ Delete chats
                  await supabase.from("chats").delete().eq("user_id", user.id);

                  // 4️⃣ Clear SIDEBAR state
                  setChatHistory([]);

                  // 5️⃣ 🔥 Tell HOME to reset chat UI
                  onClearChats();

                  toast.success("Chat history cleared!", {
                    id: loadingToast,
                  });
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to clear chat history", {
                    id: loadingToast,
                  });
                }
              }}
            >
              Yes
            </button>

            <div className="bg-red-400 rounded-md p-2">
              <button className="text-white" onClick={() => toast.dismiss(t.id)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };


  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-2xl border-r border-[#cbd5e1]/40">
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ade80] flex items-center justify-center shadow-lg shadow-[#4ade80]/20">
              <span className="material-symbols-outlined text-white text-2xl">
                cyclone
              </span>
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.1em] uppercase text-[#2d4a3e]">
                W I N D Y
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-[#4ade80] animate-pulse"></span>
                <span className="text-[8px] text-[#2d4a3e]/40 font-black uppercase tracking-widest">
                  Pazago - Shon
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-[#2d4a3e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <button
          onClick={() => {
            onNewChat();
            setActiveHistory(null);
            if (window.innerWidth < 1024) onClose();
          }}
          className="w-full py-4 bg-[#2d4a3e] hover:bg-black text-white rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl shadow-[#2d4a3e]/10 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">
            add_circle
          </span>
          New Chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1 no-scrollbar">
        <h3 className="text-[9px] font-black text-[#2d4a3e]/30 uppercase tracking-[0.4em] px-2 mb-4 mt-4">
          Chat History
        </h3>
        {chatHistory.map((chat, idx) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeHistory === idx ? "bg-[#4ade80]/10" : "hover:bg-white/50"
            }`}
          >
            {/* ICON */}
            <span className="material-symbols-outlined text-sm opacity-50">
              history
            </span>

            {/* SAME PLACE RENAME */}
            {editingId === chat.id ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename(chat.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onBlur={() => saveRename(chat.id)}
                className="flex-1 bg-transparent outline-none text-[10px] font-black uppercase tracking-wider"
              />
            ) : (
              <button
                onClick={() => {
                  setActiveHistory(idx);
                  onSelectChat(chat.id);

                  // ✅ CLOSE sidebar on mobile
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className="flex-1 text-left truncate text-[10px] font-black uppercase tracking-wider"
              >
                {chat.title || "New Chat"}
              </button>
            )}

            {/* ⋮ MENU (Rename trigger) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => exportChat(chat.id, chat.title)}
                className="text-[#2d4a3e]/40 hover:text-blue-500"
                title="Export chat"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
              </button>

              {/* EDIT */}
              <button
                onClick={() => {
                  setEditingId(chat.id);
                  setDraftTitle(chat.title || "");
                }}
                className="text-[#2d4a3e]/40 hover:text-[#4ade80]"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteChat(chat.id)}
                className="text-[#2d4a3e]/40 hover:text-red-500"
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>
              </button>
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <div className="bg-white/80 rounded-2xl p-5 border border-[#cbd5e1]/20 shadow-sm">
          <h4 className="text-[9px] font-black text-[#2d4a3e]/40 uppercase tracking-widest mb-2">
            Local Awareness
          </h4>
          <p className="text-[10px] text-[#2d4a3e]/60 leading-relaxed font-bold uppercase tracking-tight">
            Agent is currently tracking 14 weather patterns globally.
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="w-full flex items-center justify-between px-3 text-[9px] font-black text-[#2d4a3e]/30 hover:text-red-500 uppercase tracking-[0.3em] transition-colors"
        >
          Clear History
          <span className="material-symbols-outlined text-xs">
            delete_sweep
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-[#2d4a3e]/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform lg:transform-none transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
