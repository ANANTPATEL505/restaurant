"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaSearch, FaCalendar, FaUsers, FaPhone, FaCheck, FaTimes, FaEye } from "react-icons/fa";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-green-100 text-green-700",
  NO_SHOW: "bg-gray-100 text-gray-600",
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [fetchError, setFetchError] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/reservations${q}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setReservations([]);
        setFetchError(typeof data?.error === "string" ? data.error : "Failed to fetch reservations");
        return;
      }

      const normalized = Array.isArray(data) ? data : Array.isArray(data?.reservations) ? data.reservations : [];
      setReservations(normalized);
    } catch {
      setReservations([]);
      setFetchError("Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchReservations();
    setSelected(null);
  };

  const filtered = reservations.filter((r) =>
    (r?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(r?.phone ?? "").includes(search)
  );

  const statusCounts = reservations.reduce((acc: any, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-400 text-sm">{reservations.length} total reservations</p>
        </div>

        <div className="p-8">
          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  statusFilter === status ? "bg-[#800020] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#800020]"
                }`}
              >
                {status} {status !== "ALL" && statusCounts[status] ? `(${statusCounts[status]})` : ""}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text" placeholder="Search by name or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm bg-white"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {!!fetchError && !loading && (
              <div className="px-6 py-4 text-sm text-red-600 border-b border-red-100 bg-red-50">{fetchError}</div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Name", "Date & Time", "Guests", "Phone", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-full" /></td></tr>
                  ))
                ) : filtered.map(res => (
                  <motion.tr
                    key={res.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{res.name}</p>
                      {res.email && <p className="text-xs text-gray-400">{res.email}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-[#800020] text-xs" />
                        {new Date(res.date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 ml-5">{new Date(res.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUsers className="text-[#800020] text-xs" />
                        {res.guests}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-[#800020] text-xs" />
                        {res.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[res.status]}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(res)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition" title="View">
                          <FaEye size={14} />
                        </button>
                        {res.status === "PENDING" && (
                          <>
                            <button onClick={() => updateStatus(res.id, "CONFIRMED")} className="p-2 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition" title="Confirm">
                              <FaCheck size={14} />
                            </button>
                            <button onClick={() => updateStatus(res.id, "CANCELLED")} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition" title="Cancel">
                              <FaTimes size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FaCalendar className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No reservations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Reservation Details</h3>
                    <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Name", value: selected.name },
                      { label: "Phone", value: selected.phone },
                      { label: "Email", value: selected.email || "N/A" },
                      { label: "Date & Time", value: new Date(selected.date).toLocaleString() },
                      { label: "Guests", value: `${selected.guests} people` },
                      { label: "Special Request", value: selected.message || "None" },
                    ].map(item => (
                      <div key={item.label} className="flex gap-4 bg-gray-50 rounded-xl p-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">{item.label}</span>
                        <span className="text-sm text-gray-700">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <select
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020]"
                      defaultValue={selected.status}
                      onChange={e => updateStatus(selected.id, e.target.value)}
                    >
                      {["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => setSelected(null)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      Close
                    </button>
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
