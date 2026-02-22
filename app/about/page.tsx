"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const team = [
  { name: "Chef Arjun Mehta", role: "Executive Chef", img: "/chef1.jpg", bio: "20+ years of culinary mastery across three continents." },
  { name: "Priya Sharma", role: "Head of Service", img: "/chef2.jpg", bio: "Hospitality perfected through passion and precision." },
  { name: "Ravi Patel", role: "Pastry Chef", img: "/chef3.jpg", bio: "Crafting desserts that are edible art forms." },
];

const milestones = [
  { year: "2008", title: "Our Humble Beginning", desc: "Started as a 12-table bistro in the heart of Surat." },
  { year: "2012", title: "First Award", desc: "Received the Gujarat Culinary Excellence Award." },
  { year: 2016, title: "Expansion", desc: "Opened our banquet hall for private events." },
  { year: "2020", title: "Digital Leap", desc: "Launched online ordering during the pandemic era." },
  { year: "2024", title: "Michelin Recognition", desc: "Featured in top 50 restaurants in Western India." },
];

function FadeIn({ children, delay = 0, className = "" }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="/web1.jpg" className="w-full h-full object-cover" alt="About Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 px-8 md:px-20 pb-20 text-white"
        >
          <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4 uppercase">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            More Than<br />a Restaurant
          </h1>
        </motion.div>
      </section>

      {/* STORY SECTION */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative">
              <img src="/web2.jpg" className="w-full h-[500px] object-cover rounded-3xl shadow-2xl" alt="Our Restaurant" />
              <div className="absolute -bottom-6 -right-6 bg-[#800020] text-white p-8 rounded-2xl shadow-xl">
                <p className="text-5xl font-bold">16+</p>
                <p className="text-sm tracking-wider opacity-80">YEARS OF EXCELLENCE</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-6">
              <p className="text-[#800020] tracking-[0.3em] text-xs uppercase font-semibold">Who We Are</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Crafting Memories, One Plate at a Time
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Since 2008, Savour has been a destination for those who believe that exceptional food is an art form. We source only the finest seasonal ingredients, honour traditional techniques, and infuse every dish with genuine passion.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our philosophy is simple: great food, warm hospitality, and an atmosphere that makes every guest feel at home. Whether it's a romantic dinner for two or a grand celebration, we pour our hearts into every experience.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {[
                  { num: "12K+", label: "Happy Guests" },
                  { num: "85+", label: "Menu Items" },
                  { num: "8", label: "Awards Won" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-bold text-[#800020]">{s.num}</p>
                    <p className="text-xs text-gray-500 tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-[#faf7f2] py-24 px-6 md:px-20">
        <FadeIn className="text-center mb-16">
          <p className="text-[#800020] tracking-[0.3em] text-xs uppercase font-semibold mb-3">Our Journey</p>
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Milestones That Define Us
          </h2>
        </FadeIn>
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-[#800020]/20" />
          {milestones.map((m, i) => (
            <FadeIn key={m.year.toString()} delay={i * 0.1} className={`flex items-center gap-8 mb-12 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                <p className="text-[#800020] font-bold text-2xl">{m.year}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{m.title}</h3>
                <p className="text-gray-500 mt-2 text-sm">{m.desc}</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#800020] border-4 border-[#faf7f2] shrink-0 z-10 shadow-lg" />
              <div className="flex-1" />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-[#800020] tracking-[0.3em] text-xs uppercase font-semibold mb-3">The People</p>
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Passionate Culinary Artists
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-10">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 0.15}>
              <motion.div whileHover={{ y: -8 }} className="group text-center">
                <div className="relative overflow-hidden rounded-3xl mb-6 aspect-square">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e: any) => { e.target.src = "/web2.jpg"; }}
                  />
                  <div className="absolute inset-0 bg-[#800020]/0 group-hover:bg-[#800020]/20 transition-all duration-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{member.name}</h3>
                <p className="text-[#800020] text-sm tracking-wider mt-1">{member.role}</p>
                <p className="text-gray-500 text-sm mt-3">{member.bio}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#800020] py-24 px-6 text-center text-white">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Experience Savour?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have made Savour their favourite dining destination.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/reservations" className="px-8 py-4 bg-white text-[#800020] font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
              Reserve a Table
            </Link>
            <Link href="/menu" className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#800020] transition-all">
              View Menu
            </Link>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
