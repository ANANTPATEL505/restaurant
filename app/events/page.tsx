"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaUsers } from "react-icons/fa";

const staticEvents = [
  {
    id: "1",
    title: "Wine & Dine Evening",
    description: "An exclusive evening pairing our finest dishes with curated wines from around the world. Limited seats for an intimate experience.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Main Dining Hall",
    price: 2499,
    maxSeats: 30,
    bookedSeats: 18,
    image: "/web1.jpg",
  },
  {
    id: "2",
    title: "Chef's Table Experience",
    description: "Join our Executive Chef for a behind-the-scenes culinary journey. Watch, learn, and taste as the magic happens.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Private Kitchen",
    price: 3999,
    maxSeats: 12,
    bookedSeats: 5,
    image: "/web2.jpg",
  },
  {
    id: "3",
    title: "Festive Brunch Buffet",
    description: "Celebrate the season with our lavish Sunday brunch featuring 60+ dishes, live music, and bottomless mimosas.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Rooftop Terrace",
    price: 1499,
    maxSeats: 100,
    bookedSeats: 34,
    image: "/web4.jpg",
  },
];

function EventCard({ event, delay }: { event: typeof staticEvents[0]; delay: number }) {
  const eventDate = new Date(event.date);
  const seatsLeft = (event.maxSeats || 0) - event.bookedSeats;
  const percentage = event.maxSeats ? (event.bookedSeats / event.maxSeats) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group"
    >
      <div className="relative overflow-hidden h-56">
        <img
          src={event.image || "/web1.jpg"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e: any) => { e.target.src = "/web1.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {event.price && (
          <div className="absolute top-4 right-4 bg-[#800020] text-white text-sm font-bold px-3 py-1.5 rounded-full">
            ₹{event.price.toLocaleString()}
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {eventDate.getDate()}
          </p>
          <p className="text-sm opacity-80">
            {eventDate.toLocaleString("en", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          {event.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>

        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-[#800020] shrink-0" />
            <span>{eventDate.toLocaleString("en", { weekday: "long", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#800020] shrink-0" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.maxSeats && (
            <div className="flex items-center gap-2">
              <FaUsers className="text-[#800020] shrink-0" />
              <span>{seatsLeft} seats remaining</span>
            </div>
          )}
        </div>

        {event.maxSeats && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{event.bookedSeats} booked</span>
              <span>{event.maxSeats} total</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: delay + 0.4, duration: 1 }}
                className={`h-full rounded-full ${percentage > 80 ? "bg-red-500" : "bg-[#800020]"}`}
              />
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={seatsLeft === 0}
          className="mt-2 py-3 bg-[#800020] text-white rounded-2xl font-semibold text-sm hover:bg-[#5a0016] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaTicketAlt />
          {seatsLeft === 0 ? "Sold Out" : "Book Event"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState(staticEvents);

  useEffect(() => {
    fetch("/api/events?upcoming=true")
      .then(r => r.json())
      .then(data => { if (data?.length) setEvents(data); })
      .catch(() => {});
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="/web4.jpg" className="absolute inset-0 w-full h-full object-cover brightness-40" alt="" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white px-4">
          <p className="text-[#d4a855] tracking-[0.4em] text-sm mb-4">WHAT'S ON</p>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Upcoming Events
          </h1>
        </motion.div>
      </section>

      <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto">
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FaCalendar className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-xl">No upcoming events. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} delay={i * 0.15} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
