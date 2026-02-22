  "use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaCheckCircle } from "react-icons/fa";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      alert("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const info = [
    { icon: FaPhone, title: "Call Us", lines: ["+91 1234567890", "+91 9876543210"] },
    { icon: FaEnvelope, title: "Email", lines: ["hello@savour.in", "reservations@savour.in"] },
    { icon: FaMapMarkerAlt, title: "Address", lines: ["123 Main Street", "Surat, Gujarat 394107"] },
    { icon: FaClock, title: "Hours", lines: ["Mon–Fri: 10AM–10PM", "Sat–Sun: 10AM–11PM"] },
  ];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <img src="/web1.jpg" className="absolute inset-0 w-full h-full object-cover brightness-30" alt="" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white px-4">
          <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4">GET IN TOUCH</p>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
        </motion.div>
      </section>

      <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-16">
          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="text-[#800020] tracking-widest text-xs uppercase font-semibold mb-3">Contact Information</p>
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                We'd Love to Hear From You
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Whether you have a question, feedback, or need help planning your event — we're here to help.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {info.map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 bg-[#faf7f2] rounded-2xl">
                  <div className="w-10 h-10 bg-[#800020] rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-gray-500 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 text-[#800020]">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#faf7f2] rounded-3xl"
              >
                <FaCheckCircle className="text-[#800020] text-5xl mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-5 ">
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] text-sm " />
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required
                    className="w-full px-4 py-3.5 border-2 border-[#800020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm" />
                </div>
                <select name="subject" value={form.subject} onChange={handleChange} required
                  className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] text-sm">
                  <option value="">Select Subject</option>
                  <option>General Enquiry</option>
                  <option>Reservation Help</option>
                  <option>Event Planning</option>
                  <option>Feedback</option>
                  <option>Complaint</option>
                  <option>Other</option>
                </select>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your message..." rows={6} required
                  className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-[#800020] text-sm resize-none" />
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition-all disabled:opacity-60 shadow-xl shadow-[#800020]/20"
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-6 md:px-20 pb-20 max-w-7xl mx-auto">
        <div className="h-80 rounded-3xl overflow-hidden shadow-xl">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4686.560615867984!2d72.84078136320618!3d21.203050738231845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04ef9dc913593%3A0x96106052132786c3!2sSurat!5e0!3m2!1sen!2sin!4v1770273457727!5m2!1sen!2sin"
            loading="lazy"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
