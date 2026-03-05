"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCalendar } from "react-icons/fa";

const emptyForm = {
  title: "", description: "", date: "", venue: "",
  price: "", maxSeats: "", image: "", active: true,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (ev: any) => {
    setEditing(ev);
    setForm({
      ...ev,
      date: new Date(ev.date).toISOString().slice(0, 16),
      price: ev.price?.toString() || "",
      maxSeats: ev.maxSeats?.toString() || "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/events/${editing.id}` : "/api/events";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchEvents();
    setModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-400 text-sm">{events.length} events</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#800020] text-white px-5 py-2.5 rounded-xl hover:bg-[#5a0016] transition text-sm font-medium shadow-lg shadow-[#800020]/25">
            <FaPlus /> Add Event
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            )) : events.map(event => (
              <motion.div key={event.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="relative h-40 bg-gray-100">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={(e: any) => { e.target.src = "/web1.jpg"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🎉</div>
                  )}
                  {!event.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs font-bold bg-gray-800 px-3 py-1 rounded-full">Inactive</span></div>}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <FaCalendar className="text-[#800020]" />
                    {new Date(event.date).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    {event.price && <span className="font-bold text-[#800020]">₹{event.price}</span>}
                    {event.maxSeats && <span className="text-gray-400">{event.bookedSeats}/{event.maxSeats} seats</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(event)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#800020] hover:text-[#800020] transition">
                      <FaEdit size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-red-500 hover:text-red-500 transition">
                      <FaTrash size={11} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {modal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setModal(false)} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl text-[#800020] max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{editing ? "Edit Event" : "Add Event"}</h2>
                    <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>
                  <div className="space-y-4">
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Event Title *"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description *" rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm resize-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Date & Time *</label>
                        <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                      <input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="Venue"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price (₹)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      <input type="number" value={form.maxSeats} onChange={e => setForm({...form, maxSeats: e.target.value})} placeholder="Max Seats"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    </div>
                    <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="Image URL"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="accent-[#800020]" />
                      <span className="text-sm">Active (visible to customers)</span>
                    </label>
                    <button onClick={handleSave} disabled={saving || !form.title || !form.date}
                      className="w-full py-3.5 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition disabled:opacity-50">
                      {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
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
