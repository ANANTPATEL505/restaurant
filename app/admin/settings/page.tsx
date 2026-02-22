"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaSave, FaCheckCircle } from "react-icons/fa";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    restaurantName: "Savour Fine Dining",
    tagline: "Craft, passion, and exceptional flavors",
    phone: "+91 1234567890",
    email: "hello@savour.in",
    address: "123 Main Street, Surat, Gujarat 394107",
    aboutText: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { if (data?.restaurantName) setSettings(s => ({ ...s, ...data })); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-400 text-sm">Manage restaurant information</p>
          </div>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${
              saved ? "bg-green-500 text-white shadow-green-500/25" : "bg-[#800020] text-white shadow-[#800020]/25"
            }`}
          >
            {saved ? <><FaCheckCircle /> Saved!</> : <><FaSave /> {saving ? "Saving..." : "Save Changes"}</>}
          </motion.button>
        </div>

        <div className="p-8 max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b">Restaurant Info</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Restaurant Name</label>
                    <input value={settings.restaurantName} onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Tagline</label>
                    <input value={settings.tagline || ""} onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Phone</label>
                    <input value={settings.phone || ""} onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
                    <input value={settings.email || ""} onChange={e => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Address</label>
                  <input value={settings.address || ""} onChange={e => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">About Text</label>
                  <textarea value={settings.aboutText || ""} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} rows={5}
                    placeholder="Write something about your restaurant..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h4 className="font-semibold text-blue-700 text-sm mb-2">💡 Coming Soon</h4>
              <p className="text-blue-600 text-xs leading-relaxed">
                Advanced features including opening hours editor, social media links, hero image upload, WhatsApp API configuration, and email SMTP settings are being added in the next update.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
