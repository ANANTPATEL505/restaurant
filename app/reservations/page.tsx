"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCalendar, FaUsers, FaPhone, FaEnvelope, FaUser, FaCheckCircle } from "react-icons/fa";

export default function ReservationsPage() {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", guests: "", message: "",
  });
  const [date, setDate] = useState<Dayjs | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError("Please select a date and time."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: date.toISOString(), guests: parseInt(formData.guests) }),
      });

      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <Navbar />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-[#800020] rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <FaCheckCircle className="text-white text-4xl" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reservation Confirmed!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you, <strong>{formData.name}</strong>! We've received your reservation for {date?.format("DD MMM YYYY [at] hh:mm A")} for <strong>{formData.guests} guests</strong>. We'll confirm via WhatsApp/Phone shortly.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", email: "", guests: "", message: "" }); setDate(null); }}
            className="px-8 py-3 bg-[#800020] text-white rounded-full font-semibold hover:bg-[#5a0016] transition"
          >
            Make Another Reservation
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <main className="min-h-screen bg-white">
        <Navbar />

        {/* Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <img src="/web1.jpg" className="absolute inset-0 w-full h-full object-cover brightness-40" alt="" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center text-white px-4"
          >
            <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4">BOOK YOUR EXPERIENCE</p>
            <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Reserve Your Table
            </h1>
          </motion.div>
        </section>

        {/* Form Section */}
        <section className="py-20 px-6 md:px-20 text-[#800020] max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 flex flex-col gap-8"
            >
              <div>
                <p className="text-[#800020] tracking-widest text-xs uppercase font-semibold mb-3">Experience</p>
                <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  An Unforgettable Dining Experience Awaits
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                From intimate dinners to grand celebrations, we create personalized experiences for every occasion. Our team will ensure every detail is perfect.
              </p>

              <div className="space-y-4">
                {[
                  { icon: FaCalendar, title: "Opening Hours", desc: "Mon–Fri: 10AM–10PM\nSat–Sun: 10AM–11PM" },
                  { icon: FaPhone, title: "Phone", desc: "+91 1234567890" },
                  { icon: FaEnvelope, title: "Email", desc: "reservations@savour.in" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-[#faf7f2] rounded-2xl">
                    <div className="w-10 h-10 bg-[#800020] rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm whitespace-pre">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-3"
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 space-y-5 border border-gray-100">
                <h3 className="text-2xl font-bold text-[#800020]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Make a Reservation
                </h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-sm" />
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="Your Name" required
                      className="w-full pl-11 pr-4 py-3.5 border-2  rounded-xl focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-sm" />
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="Phone Number" required
                      className="w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-sm" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="Email Address (optional)"
                    className="w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <DateTimePicker
                    label="Date & Time"
                    value={date}
                    onChange={setDate}
                    format="DD/MM/YYYY hh:mm A"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "medium",
                        InputProps: {
													sx: {
                            
														"& .MuiSvgIcon-root": {
															color: "#800020",
														},
														"& fieldset": {
															borderRadius: "12px",
															borderColor: "#800020",
                              height:"55px",
                              border:"2px solid #800020"
														},
														"&:hover fieldset": {
															borderColor: "#800020",
														},
														"&.Mui-focused fieldset": {
															borderColor: "#800020",
														},
													},
												},
												InputLabelProps: {
													sx: {
														color: "#800020",
														"&.Mui-focused": { color: "#800020" },
													},
												},
                      },
                    }}
                  />
                  <div className="relative">
                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-sm" />
                    <select
                      name="guests" value={formData.guests} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm appearance-none"
                    >
                      <option value="">Number of Guests</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                      ))}
                      <option value="9+">9+ People (large group)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  name="message" value={formData.message} onChange={handleChange}
                  placeholder="Special requests — birthday, anniversary, dietary needs, window seat..."
                  rows={4}
                  className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm resize-none"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl text-base hover:bg-[#5a0016] transition-all disabled:opacity-60 shadow-xl shadow-[#800020]/20"
                >
                  {loading ? "Confirming..." : "Confirm Reservation"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </LocalizationProvider>
  );
}
