"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaLeaf, FaFire, FaStar } from "react-icons/fa";

const CATEGORIES = ["Starters", "Main Course", "Desserts", "Drinks", "Breads", "Soups", "Salads", "Specials"];

const emptyForm = {
  name: "", description: "", price: "", category: "Starters",
  image: "", available: true, featured: false, spicy: false, veg: true,
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ ...item, price: item.price.toString() });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/menu/${editing.id}` : "/api/menu";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchItems();
    setModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchItems();
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const cats = ["All", ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-400 text-sm">{items.length} items total</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#800020] text-white px-5 py-2.5 rounded-xl hover:bg-[#5a0016] transition text-sm font-medium shadow-lg shadow-[#800020]/25"
          >
            <FaPlus /> Add Item
          </button>
        </div>

        <div className="p-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {cats.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    catFilter === cat ? "bg-[#800020] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#800020]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-40 bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e: any) => { e.target.src = "/food1.jpg"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🍽️</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.veg && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">VEG</span>}
                      {item.spicy && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">🌶</span>}
                      {item.featured && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">★</span>}
                    </div>
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">Unavailable</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                      <span className="text-[#800020] font-bold text-sm shrink-0">₹{item.price}</span>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3">{item.description}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{item.category}</span>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-[#800020] hover:text-[#800020] transition"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-red-500 hover:text-red-500 transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-4 text-center py-20 text-gray-400">
                  <p className="text-lg">No items found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {modal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setModal(false)} className="fixed inset-0 bg-black z-40" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{editing ? "Edit Item" : "Add New Item"}</h2>
                    <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Item Name *</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Butter Chicken"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Price (₹) *</label>
                        <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="299"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Category *</label>
                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Description *</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Brief description of the dish..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm resize-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Image URL</label>
                        <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://... or /food1.jpg"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "available", label: "Available", icon: "✅" },
                        { key: "featured", label: "Featured", icon: "⭐" },
                        { key: "veg", label: "Vegetarian", icon: "🌿" },
                        { key: "spicy", label: "Spicy", icon: "🌶️" },
                      ].map(opt => (
                        <label key={opt.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#800020] transition">
                          <input
                            type="checkbox"
                            checked={(form as any)[opt.key]}
                            onChange={e => setForm({...form, [opt.key]: e.target.checked})}
                            className="accent-[#800020]"
                          />
                          <span className="text-sm">{opt.icon} {opt.label}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving || !form.name || !form.price || !form.description}
                      className="w-full py-3.5 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition disabled:opacity-50 shadow-lg shadow-[#800020]/25"
                    >
                      {saving ? "Saving..." : editing ? "Update Item" : "Add Item"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <AnimatePresence>
          {deleteConfirm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-red-500 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Item?</h3>
                  <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
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
