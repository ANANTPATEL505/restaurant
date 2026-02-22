"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaPlus, FaTrash, FaTimes, FaImages } from "react-icons/fa";

const CATEGORIES = ["General", "Food", "Ambience", "Kitchen", "Events", "Team"];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ src: "", caption: "", category: "Food", featured: false });

  const fetchImages = async () => {
    setLoading(true);
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setImages(data);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleAdd = async () => {
    if (!form.src) return;
    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchImages();
    setModal(false);
    setForm({ src: "", caption: "", category: "Food", featured: false });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    fetchImages();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-400 text-sm">{images.length} images</p>
          </div>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#800020] text-white px-5 py-2.5 rounded-xl hover:bg-[#5a0016] transition text-sm font-medium shadow-lg shadow-[#800020]/25">
            <FaPlus /> Add Image
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(img => (
                <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e: any) => { e.target.src = "/web2.jpg"; }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2 px-3 text-center">
                      <p className="text-white text-xs font-medium">{img.caption}</p>
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{img.category}</span>
                      <button onClick={() => handleDelete(img.id)} className="mt-1 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                  {img.featured && <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">★</div>}
                </motion.div>
              ))}
              {images.length === 0 && (
                <div className="col-span-4 text-center py-20 text-gray-400">
                  <FaImages className="text-5xl mx-auto mb-3 opacity-20" />
                  <p>No images yet. Add your first image!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {modal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setModal(false)} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Add Image</h2>
                    <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>
                  <div className="space-y-4">
                    <input value={form.src} onChange={e => setForm({...form, src: e.target.value})} placeholder="Image URL *"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    {form.src && (
                      <div className="h-40 bg-gray-100 rounded-xl overflow-hidden">
                        <img src={form.src} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.src = "/web2.jpg"; }} />
                      </div>
                    )}
                    <input value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} placeholder="Caption"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="accent-[#800020]" />
                      <span className="text-sm">Featured image</span>
                    </label>
                    <button onClick={handleAdd} disabled={!form.src}
                      className="w-full py-3.5 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition disabled:opacity-50">
                      Add to Gallery
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
