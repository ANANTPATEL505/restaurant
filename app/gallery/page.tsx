"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const staticGallery = [
  { id: "1", src: "/web1.jpg", caption: "Our Main Dining Hall", category: "Ambience" },
  { id: "2", src: "/web2.jpg", caption: "Signature Dishes", category: "Food" },
  { id: "3", src: "/web3.avif", caption: "Fresh Ingredients", category: "Food" },
  { id: "4", src: "/web4.jpg", caption: "Private Dining Room", category: "Ambience" },
  { id: "5", src: "/web5.webp", caption: "Chef at Work", category: "Kitchen" },
  { id: "6", src: "/web6.gif", caption: "Evening Atmosphere", category: "Ambience" },
  { id: "7", src: "/food1.jpg", caption: "Bruschetta Delight", category: "Food" },
  { id: "8", src: "/food2.jpg", caption: "Paneer Tikka", category: "Food" },
  { id: "9", src: "/food3.jpg", caption: "Italian Pasta", category: "Food" },
];

const categories = ["All", "Food", "Ambience", "Kitchen", "Events"];

export default function GalleryPage() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [images, setImages] = useState(staticGallery);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(data => { if (data?.length) setImages(data); })
      .catch(() => {});
  }, []);

  const filtered = active === "All" ? images : images.filter(i => i.category === active);

  const navigate = (dir: 1 | -1) => {
    if (lightbox === null) return;
    const next = (lightbox + dir + filtered.length) % filtered.length;
    setLightbox(next);
  };

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="/web4.jpg" className="absolute inset-0 w-full h-full object-cover brightness-40" alt="" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white px-4">
          <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4">VISUAL JOURNEY</p>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Our Gallery</h1>
        </motion.div>
      </section>

      {/* Filter */}
      <section className="py-12 px-6 md:px-20">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                active === cat ? "bg-[#800020] text-white shadow-lg shadow-[#800020]/25" : "border border-gray-300 text-gray-600 hover:border-[#800020] hover:text-[#800020]"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 max-w-7xl mx-auto">
          <AnimatePresence>
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setLightbox(i)}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl"
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e: any) => { e.target.src = "/web2.jpg"; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-end">
                  <p className="text-white text-sm font-medium p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 p-3 rounded-full"
            >
              <FaChevronLeft />
            </button>

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl max-h-[80vh] px-16"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={filtered[lightbox].src}
                alt={filtered[lightbox].caption}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                onError={(e: any) => { e.target.src = "/web2.jpg"; }}
              />
              <p className="text-white text-center mt-4 text-sm">{filtered[lightbox].caption}</p>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 p-3 rounded-full"
            >
              <FaChevronRight />
            </button>

            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
