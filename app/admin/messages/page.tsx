"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaEnvelope, FaEnvelopeOpen, FaTimes, FaTrash } from "react-icons/fa";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    fetchMessages();
    setSelected(null);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-400 text-sm">{unreadCount} unread messages</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <FaEnvelope className="text-5xl mx-auto mb-3 opacity-20" />
                  <p>No messages yet</p>
                </div>
              ) : messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id); }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                    !msg.read ? "bg-[#800020]/5 border-[#800020]/20" : "bg-white border-gray-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !msg.read ? "bg-[#800020] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {!msg.read ? <FaEnvelope size={14} /> : <FaEnvelopeOpen size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!msg.read ? "text-gray-900" : "text-gray-600"}`}>{msg.name}</p>
                      <p className="text-xs text-gray-400 shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-[#800020] font-medium">{msg.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                  </div>
                  {!msg.read && <div className="w-2 h-2 rounded-full bg-[#800020] shrink-0 mt-2" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black z-40" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#800020]"
              >
                <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{selected.subject}</h3>
                    <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      ["From", selected.name],
                      ["Email", selected.email],
                      ["Date", new Date(selected.createdAt).toLocaleString()],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 pt-0.5">{k}</span>
                        <span className="text-sm text-gray-700">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                      className="flex-1 py-3 bg-[#800020] text-white rounded-xl text-sm font-semibold text-center hover:bg-[#5a0016] transition"
                    >
                      Reply via Email
                    </a>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="px-5 py-3 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
