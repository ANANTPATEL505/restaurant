"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FaHome, FaUtensils, FaCalendarAlt, FaShoppingBag,
  FaImages, FaStar, FaChartBar, FaCalendarCheck,
  FaSignOutAlt, FaCog, FaBars, FaTimes, FaEnvelope
} from "react-icons/fa";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FaHome },
  { href: "/admin/menu", label: "Menu Items", icon: FaUtensils },
  { href: "/admin/reservations", label: "Reservations", icon: FaCalendarAlt },
  { href: "/admin/orders", label: "Orders", icon: FaShoppingBag },
  { href: "/admin/gallery", label: "Gallery", icon: FaImages },
  { href: "/admin/events", label: "Events", icon: FaCalendarCheck },
  { href: "/admin/reviews", label: "Reviews", icon: FaStar },
  { href: "/admin/analytics", label: "Analytics", icon: FaChartBar },
  { href: "/admin/messages", label: "Messages", icon: FaEnvelope },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-[#1a0008] text-white flex flex-col sticky top-0 overflow-hidden z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              SAVOUR
            </p>
            <p className="text-xs text-white/50 tracking-widest">ADMIN PANEL</p>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
        >
          {collapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-[#800020] text-white shadow-lg shadow-[#800020]/30"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {active && !collapsed && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/admin/settings">
          <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer`}>
            <FaCog size={18} />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FaSignOutAlt size={18} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
