"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaChair, FaPlus, FaTimes, FaEdit, FaTrash, FaRedo } from "react-icons/fa";

type Table = {
  id: string;
  number: number;
  capacity: number;
  location: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  reservations?: any[];
  orders?: any[];
};

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE:   "bg-green-100  text-green-700  border-green-200",
  OCCUPIED:    "bg-red-100    text-red-700    border-red-200",
  RESERVED:    "bg-blue-100   text-blue-700   border-blue-200",
  MAINTENANCE: "bg-gray-100   text-gray-500   border-gray-200",
};

const STATUS_BG: Record<string, string> = {
  AVAILABLE:   "bg-green-50  border-green-200  hover:border-green-400",
  OCCUPIED:    "bg-red-50    border-red-200    hover:border-red-400",
  RESERVED:    "bg-blue-50   border-blue-200   hover:border-blue-400",
  MAINTENANCE: "bg-gray-50   border-gray-200",
};

const STATUS_ICON: Record<string, string> = {
  AVAILABLE: "🟢", OCCUPIED: "🔴", RESERVED: "🔵", MAINTENANCE: "⚙️",
};

const LOC_ICON: Record<string, string> = {
  Indoor: "🏠", Outdoor: "🌿", Private: "🔒", Bar: "🍸",
};

const LOCATIONS = ["Indoor", "Outdoor", "Private", "Bar"];

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Table | null>(null);
  const [form, setForm] = useState({ number: "", capacity: "4", location: "Indoor" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      setTables(Array.isArray(data) ? data : []);
    } catch { setTables([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, []);

  const updateStatus = async (table: Table, status: string) => {
    await fetch(`/api/tables/${table.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTables();
  };

  const handleSave = async () => {
    if (!form.number || !form.capacity) { setFormError("Table number and capacity are required."); return; }
    setSaving(true); setFormError("");
    try {
      const url = editTable ? `/api/tables/${editTable.id}` : "/api/tables";
      const method = editTable ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: parseInt(form.number), capacity: parseInt(form.capacity), location: form.location }),
      });
      if (!res.ok) { const d = await res.json(); setFormError(d.error || "Failed"); return; }
      setShowAdd(false); setEditTable(null); setForm({ number: "", capacity: "4", location: "Indoor" });
      fetchTables();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await fetch(`/api/tables/${confirmDelete.id}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchTables();
  };

  const openEdit = (table: Table) => {
    setForm({ number: String(table.number), capacity: String(table.capacity), location: table.location });
    setEditTable(table);
    setShowAdd(true);
    setFormError("");
  };

  const locations = ["All", ...LOCATIONS];
  const statuses = ["All", "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

  const filtered = tables.filter(t => {
    const matchLoc = locationFilter === "All" || t.location === locationFilter;
    const matchSt = statusFilter === "All" || t.status === statusFilter;
    return matchLoc && matchSt;
  });

  const stats = {
    total:       tables.length,
    available:   tables.filter(t => t.status === "AVAILABLE").length,
    occupied:    tables.filter(t => t.status === "OCCUPIED").length,
    reserved:    tables.filter(t => t.status === "RESERVED").length,
    maintenance: tables.filter(t => t.status === "MAINTENANCE").length,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-400 text-sm">{stats.available} available · {stats.occupied} occupied · {stats.reserved} reserved</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchTables} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition">
                <FaRedo size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <motion.button onClick={() => { setShowAdd(true); setEditTable(null); setForm({ number: "", capacity: "4", location: "Indoor" }); setFormError(""); }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#800020] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#800020]/20">
                <FaPlus size={12} /> Add Table
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Tables", value: stats.total,       color: "text-gray-900",   bg: "bg-white"       },
              { label: "Available",    value: stats.available,   color: "text-green-600",  bg: "bg-green-50"    },
              { label: "Occupied",     value: stats.occupied,    color: "text-red-600",    bg: "bg-red-50"      },
              { label: "Reserved",     value: stats.reserved,    color: "text-blue-600",   bg: "bg-blue-50"     },
              { label: "Maintenance",  value: stats.maintenance, color: "text-gray-500",   bg: "bg-gray-50"     },
            ].map(card => (
              <div key={card.label} className={`${card.bg} rounded-2xl p-4 border border-gray-100 text-center shadow-sm`}>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex gap-2 flex-wrap">
              {locations.map(loc => (
                <button key={loc} onClick={() => setLocationFilter(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${locationFilter === loc ? "bg-[#800020] text-white border-[#800020]" : "bg-white border-gray-200 text-gray-500 hover:border-[#800020]"}`}>
                  {loc !== "All" ? `${LOC_ICON[loc]} ` : ""}{loc}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${statusFilter === s ? "bg-gray-700 text-white border-gray-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {s !== "All" ? `${STATUS_ICON[s]} ` : ""}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Table Grid (Floor Map) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(table => (
                <motion.div key={table.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all group ${STATUS_BG[table.status]}`}
                >
                  {/* Status dot */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${STATUS_STYLES[table.status]}`}>
                      {STATUS_ICON[table.status]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(table)} className="p-1.5 bg-white rounded-lg shadow text-gray-500 hover:text-[#800020]"><FaEdit size={10} /></button>
                    <button onClick={() => setConfirmDelete(table)} className="p-1.5 bg-white rounded-lg shadow text-gray-500 hover:text-red-500"><FaTrash size={10} /></button>
                  </div>

                  <div className="flex flex-col items-center gap-1 mt-6">
                    <FaChair className={`text-2xl ${table.status === "AVAILABLE" ? "text-green-500" : table.status === "OCCUPIED" ? "text-red-500" : table.status === "RESERVED" ? "text-blue-500" : "text-gray-400"}`} />
                    <span className="text-xl font-bold text-gray-900">T{table.number}</span>
                    <span className="text-xs text-gray-500">{table.capacity} seats</span>
                    <span className="text-xs text-gray-400">{LOC_ICON[table.location]} {table.location}</span>
                  </div>

                  {/* Quick status change */}
                  <select
                    value={table.status}
                    onChange={e => updateStatus(table, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="mt-3 w-full text-xs border-0 bg-white/60 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#800020] cursor-pointer"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>

                  {/* Active reservation badge */}
                  {table.reservations && table.reservations.length > 0 && (
                    <div className="mt-2 w-full text-center text-[10px] bg-blue-50 text-blue-600 rounded-lg px-2 py-1">
                      📅 {new Date(table.reservations[0].date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  {table.orders && table.orders.length > 0 && (
                    <div className="mt-1 w-full text-center text-[10px] bg-red-50 text-red-600 rounded-lg px-2 py-1">
                      🛒 Order #{table.orders[0].orderNo.slice(-4)}
                    </div>
                  )}
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-6 text-center py-16 text-gray-400">
                  <FaChair className="text-5xl mx-auto mb-3 opacity-20" />
                  <p>No tables found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAdd && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => { setShowAdd(false); setEditTable(null); }} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{editTable ? "Edit Table" : "Add New Table"}</h3>
                    <button onClick={() => { setShowAdd(false); setEditTable(null); }} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Table Number *</label>
                        <input type="number" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
                          placeholder="e.g. 15" min="1"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Capacity *</label>
                        <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                          placeholder="e.g. 4" min="1" max="20"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Location / Section</label>
                      <div className="grid grid-cols-2 gap-3">
                        {LOCATIONS.map(loc => (
                          <button key={loc} type="button" onClick={() => setForm(p => ({ ...p, location: loc }))}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition ${form.location === loc ? "border-[#800020] bg-[#800020]/5 text-[#800020]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            <span>{LOC_ICON[loc]}</span> {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formError && <p className="text-red-500 text-sm">{formError}</p>}

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowAdd(false); setEditTable(null); }}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                        Cancel
                      </button>
                      <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 bg-[#800020] text-white rounded-xl text-sm font-bold hover:bg-[#5a0016] transition disabled:opacity-60 shadow-lg shadow-[#800020]/20">
                        {saving ? "Saving..." : editTable ? "Save Changes" : "Add Table"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <AnimatePresence>
          {confirmDelete && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-red-500 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Table #{confirmDelete.number}?</h3>
                  <p className="text-gray-500 text-sm mb-6">This will permanently remove the table. Any linked reservations will lose their table assignment.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20">Delete</button>
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
