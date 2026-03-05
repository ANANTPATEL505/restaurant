"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCalendar, FaUsers, FaPhone, FaEnvelope, FaUser, FaCheckCircle, FaChair, FaMapMarkerAlt } from "react-icons/fa";

type TableRow = {
  id: string; number: number; capacity: number; location: string; status: string; isAvailable: boolean;
};

const LOC_COLOR: Record<string, string> = {
  Indoor:  "bg-blue-50   border-blue-200   text-blue-700",
  Outdoor: "bg-green-50  border-green-200  text-green-700",
  Private: "bg-purple-50 border-purple-200 text-purple-700",
  Bar:     "bg-amber-50  border-amber-200  text-amber-700",
};

const LOC_ICON: Record<string, string> = {
  Indoor: "🏠", Outdoor: "🌿", Private: "🔒", Bar: "🍸",
};

export default function ReservationsPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", guests: "", message: "" });
  const [date, setDate] = useState<Dayjs | null>(null);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [availability, setAvailability] = useState<{ available: number; total: number } | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const fetchAvailability = useCallback(async () => {
    if (!date || !formData.guests) return;
    setLoadingTables(true);
    setSelectedTableId(null);
    try {
      const res = await fetch(`/api/tables/availability?date=${date.toISOString()}&guests=${formData.guests}`);
      const data = await res.json();
      if (res.ok) { setTables(data.tables || []); setAvailability({ available: data.available, total: data.total }); }
    } catch { /* ignore */ }
    finally { setLoadingTables(false); }
  }, [date, formData.guests]);

  useEffect(() => { if (step === 2) fetchAvailability(); }, [step, fetchAvailability]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError("Please select a date and time."); return; }
    if (!formData.guests) { setError("Please select number of guests."); return; }
    setError("");
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: date!.toISOString(), guests: parseInt(formData.guests), tableId: selectedTableId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const locations = ["All", ...Array.from(new Set(tables.map(t => t.location)))];
  const filteredTables = locationFilter === "All" ? tables : tables.filter(t => t.location === locationFilter);

  // SUCCESS
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-lg bg-white rounded-3xl p-12 shadow-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-[#800020] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#800020]/30">
              <FaCheckCircle className="text-white text-4xl" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-playfair),serif" }}>Booking Confirmed!</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Thank you, <strong>{formData.name}</strong>! We've reserved{" "}
              {selectedTable ? <><strong>Table #{selectedTable.number}</strong> ({selectedTable.location})</> : "a table"}{" "}
              for <strong>{formData.guests} guests</strong> on <strong>{date?.format("DD MMM YYYY [at] hh:mm A")}</strong>.
              We'll confirm via WhatsApp or phone shortly.
            </p>
            {selectedTable && (
              <div className="bg-[#faf7f2] rounded-2xl p-4 mb-6 text-left space-y-2 text-[#800020]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Table</p>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Table Number</span><span className="font-bold text-[#800020]">#{selectedTable.number}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span className="font-medium">{LOC_ICON[selectedTable.location]} {selectedTable.location}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Capacity</span><span className="font-medium">Up to {selectedTable.capacity} guests</span></div>
              </div>
            )}
            <button onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", email: "", guests: "", message: "" }); setDate(null); setSelectedTableId(null); setStep(1); }}
              className="px-8 py-3 bg-[#800020] text-white rounded-full font-semibold hover:bg-[#5a0016] transition">
              Make Another Booking
            </button>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <main className="min-h-screen bg-white">
        <Navbar />

        {/* Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <img src="/web1.jpg" className="absolute inset-0 w-full h-full object-cover brightness-40" alt="" onError={(e: any) => { e.currentTarget.style.background = "#1a0008"; }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white px-4">
            <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4">BOOK YOUR EXPERIENCE</p>
            <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-playfair),serif" }}>Reserve Your Table</h1>
            <p className="text-white/70 mt-4">Choose your date, pick your table, confirm in seconds.</p>
          </motion.div>
        </section>

        {/* Stepper */}
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#800020] z-0 transition-all duration-500" style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }} />
            {[{ n: 1, label: "Your Details" }, { n: 2, label: "Pick a Table" }, { n: 3, label: "Confirm" }].map(({ n, label }) => (
              <div key={n} className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= n ? "bg-[#800020] text-white shadow-lg shadow-[#800020]/30" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                  {step > n ? "✓" : n}
                </div>
                <span className={`text-xs font-medium ${step >= n ? "text-[#800020]" : "text-gray-400"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <section className="py-12 px-6 md:px-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">

            {/* Sidebar */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div>
                <p className="text-[#800020] tracking-widest text-xs uppercase font-semibold mb-2">Dining Info</p>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair),serif" }}>Plan Your Visit</h2>
              </div>
              <div className="space-y-3">
                {[
                  { icon: FaCalendar,     title: "Opening Hours", desc: "Mon–Fri: 10AM–10PM\nSat–Sun: 10AM–11PM" },
                  { icon: FaPhone,        title: "Phone",         desc: "+91 1234567890"                        },
                  { icon: FaEnvelope,     title: "Email",         desc: "reservations@savour.in"                },
                  { icon: FaMapMarkerAlt, title: "Location",      desc: "123 Main St, Surat, Gujarat"           },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-[#faf7f2] rounded-2xl">
                    <div className="w-9 h-9 bg-[#800020] rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="text-white text-xs" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs whitespace-pre">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#faf7f2] rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seating Sections</p>
                {["Indoor", "Outdoor", "Private", "Bar"].map(loc => (
                  <div key={loc} className="flex items-center gap-2 mb-2">
                    <span className="text-base">{LOC_ICON[loc]}</span>
                    <span className="text-sm text-gray-600 font-medium">{loc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Panel */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.form key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    onSubmit={handleStep1Submit}
                    className="bg-white rounded-3xl text-[#800020] shadow-2xl p-8 md:p-10 space-y-5 border border-gray-100">
                    <h3 className="text-xl font-bold text-[#800020]" style={{ fontFamily: "var(--font-playfair),serif" }}>Step 1 — Your Details</h3>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-xs" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name *" required
                          className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-xs" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number *" required
                          className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                    </div>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-xs" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address (optional)"
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <DateTimePicker label="Date & Time *" value={date} onChange={setDate} format="DD/MM/YYYY hh:mm A"
                        slotProps={{
											textField: {
												fullWidth: true,
												InputProps: {
													sx: {
														"& .MuiSvgIcon-root": {
															color: "#800020",
														},
														"& fieldset": {
															borderRadius: "12px",
															borderColor: "#800020",
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
										}}/>
                      <div className="relative">
                        <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-[#800020] text-xs z-10" />
                        <select name="guests" value={formData.guests} onChange={handleChange} required
                          className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm appearance-none bg-white">
                          <option value="">Guests *</option>
                          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n===1?"Person":"People"}</option>)}
                          <option value="9">9+ (large group)</option>
                        </select>
                      </div>
                    </div>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows={3}
                      placeholder="Special requests — birthday, anniversary, dietary needs, window seat..."
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm resize-none" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl text-base hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/20">
                      Check Table Availability →
                    </motion.button>
                  </motion.form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair),serif" }}>Step 2 — Pick Your Table</h3>
                          <p className="text-sm text-gray-400 mt-1">{date?.format("DD MMM YYYY [at] hh:mm A")} · {formData.guests} guests</p>
                        </div>
                        {availability && (
                          <div className="text-right bg-[#faf7f2] rounded-2xl px-4 py-2">
                            <p className="text-2xl font-bold text-[#800020]">{availability.available}</p>
                            <p className="text-xs text-gray-400">of {availability.total} free</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {locations.map(loc => (
                          <button key={loc} onClick={() => setLocationFilter(loc)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${locationFilter === loc ? "bg-[#800020] text-white border-[#800020]" : "border-gray-200 text-gray-500 hover:border-[#800020]"}`}>
                            {loc !== "All" ? `${LOC_ICON[loc]} ` : ""}{loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      {loadingTables ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {[...Array(12)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {filteredTables.map(table => {
                            const isSelected = selectedTableId === table.id;
                            const isAvail = table.isAvailable;
                            return (
                              <motion.button key={table.id}
                                whileHover={isAvail ? { scale: 1.04, y: -2 } : {}}
                                whileTap={isAvail ? { scale: 0.97 } : {}}
                                onClick={() => isAvail && setSelectedTableId(isSelected ? null : table.id)}
                                disabled={!isAvail}
                                className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                                  !isAvail ? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed"
                                  : isSelected ? "bg-[#800020] border-[#800020] text-white shadow-xl shadow-[#800020]/30"
                                  : "bg-white border-gray-200 hover:border-[#800020] cursor-pointer"
                                }`}>
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-[10px] font-bold">✓</span>
                                  </div>
                                )}
                                <FaChair className={`text-xl ${isSelected ? "text-white" : isAvail ? "text-[#800020]" : "text-gray-300"}`} />
                                <span className={`text-base font-bold leading-none ${isSelected ? "text-white" : "text-gray-900"}`}>T{table.number}</span>
                                <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-400"}`}>{table.capacity} seats</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${isSelected ? "bg-white/20 text-white border-white/20" : LOC_COLOR[table.location] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                  {LOC_ICON[table.location]} {table.location}
                                </span>
                                {!isAvail && <span className="text-[10px] text-red-400 font-semibold">Booked</span>}
                              </motion.button>
                            );
                          })}
                          {filteredTables.length === 0 && (
                            <div className="col-span-4 text-center py-8 text-gray-400">
                              <FaChair className="text-3xl mx-auto mb-2 opacity-20" />
                              <p className="text-sm">No tables in this section</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                      <div className="flex gap-5 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#800020] inline-block" />Available</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />Booked</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#800020] border-2 border-green-500 inline-block" />Selected</span>
                      </div>

                      <AnimatePresence>
                        {selectedTable && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="bg-[#800020]/5 border border-[#800020]/20 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#800020] rounded-xl flex items-center justify-center shrink-0">
                              <FaChair className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-[#800020] text-sm">Table #{selectedTable.number} Selected</p>
                              <p className="text-xs text-gray-500">{LOC_ICON[selectedTable.location]} {selectedTable.location} · Up to {selectedTable.capacity} guests</p>
                            </div>
                            <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">← Back</button>
                        <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#800020] text-white font-bold rounded-xl text-sm hover:bg-[#5a0016] transition shadow-lg shadow-[#800020]/20">
                          {selectedTable ? `Continue with Table #${selectedTable.number} →` : "Continue Without Preference →"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-playfair),serif" }}>Step 3 — Confirm Reservation</h3>
                    <div className="space-y-3 mb-6">
                      {[
                        { label: "Name",        value: formData.name },
                        { label: "Phone",       value: formData.phone },
                        { label: "Email",       value: formData.email || "—" },
                        { label: "Date & Time", value: date?.format("DD MMM YYYY [at] hh:mm A") || "" },
                        { label: "Guests",      value: `${formData.guests} people` },
                        { label: "Table",       value: selectedTable ? `Table #${selectedTable.number} — ${selectedTable.location} (${selectedTable.capacity} seats)` : "No preference (we'll assign one)" },
                        { label: "Notes",       value: formData.message || "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 bg-gray-50 rounded-xl p-3.5">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
                          <span className={`text-sm font-medium ${label === "Table" && selectedTable ? "text-[#800020]" : "text-gray-700"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="px-5 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">← Change Table</button>
                      <motion.button onClick={handleFinalSubmit} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3.5 bg-[#800020] text-white font-bold rounded-xl text-sm hover:bg-[#5a0016] transition disabled:opacity-60 shadow-xl shadow-[#800020]/20">
                        {loading ? "Confirming..." : "Confirm Reservation ✓"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </LocalizationProvider>
  );
}
