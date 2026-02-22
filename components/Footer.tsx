import Link from "next/link";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTwitter, FaUtensils } from "react-icons/fa";

const hours = [
  { day: "Monday–Thursday", time: "10 AM – 10 PM" },
  { day: "Friday–Saturday", time: "10 AM – 11 PM" },
  { day: "Sunday", time: "10 AM – 9 PM" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a0008] text-white">
      {/* Top Wave */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none" style={{ height: 60 }}>
          <path fill="#1a0008" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>

      <div className="px-6 md:px-20 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800020] rounded-full flex items-center justify-center">
              <FaUtensils className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>SAVOUR</p>
              <p className="text-xs text-white/40 tracking-widest">FINE DINING</p>
            </div>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Since 2008, crafting exceptional dining experiences with passion, precision, and the finest ingredients.
          </p>
          <div className="flex gap-3">
            {[FaInstagram, FaFacebook, FaWhatsapp, FaTwitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 bg-white/10 hover:bg-[#800020] rounded-lg flex items-center justify-center transition-colors">
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm tracking-widest text-white/70 uppercase">Quick Links</h4>
          {[
            { href: "/menu", label: "Our Menu" },
            { href: "/reservations", label: "Reserve a Table" },
            { href: "/gallery", label: "Photo Gallery" },
            { href: "/events", label: "Events" },
            { href: "/about", label: "Our Story" },
            { href: "/contact", label: "Contact" },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-white/50 hover:text-white text-sm transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm tracking-widest text-white/70 uppercase">Opening Hours</h4>
          {hours.map(h => (
            <div key={h.day} className="flex flex-col gap-0.5">
              <p className="text-white/80 text-sm font-medium">{h.day}</p>
              <p className="text-white/40 text-xs">{h.time}</p>
            </div>
          ))}
        </div>

        {/* Contact + Map */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm tracking-widest text-white/70 uppercase">Find Us</h4>
          <p className="text-white/50 text-sm">123 Main Street, Surat, Gujarat 394107</p>
          <p className="text-white/50 text-sm">+91 1234567890</p>
          <p className="text-white/50 text-sm">hello@savour.in</p>
          <div className="h-32 rounded-xl overflow-hidden mt-2">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4686.560615867984!2d72.84078136320618!3d21.203050738231845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04ef9dc913593%3A0x96106052132786c3!2sSurat!5e0!3m2!1sen!2sin!4v1770273457727!5m2!1sen!2sin"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 md:px-20 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Savour Fine Dining. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Privacy Policy</a>
          <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
