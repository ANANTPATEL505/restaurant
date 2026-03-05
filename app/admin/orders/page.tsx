"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaSearch, FaEye, FaTimes, FaClock, FaChair, FaRedo } from "react-icons/fa";

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"];
const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100  text-amber-700",
  CONFIRMED: "bg-blue-100   text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY:     "bg-green-100  text-green-700",
  DELIVERED: "bg-gray-100   text-gray-600",
  CANCELLED: "bg-red-100    text-red-700",
};
const TYPE_STYLES: Record<string, string> = {
  DINE_IN:  "bg-emerald-100 text-emerald-700",
  TAKEAWAY: "bg-orange-100  text-orange-700",
  DELIVERY: "bg-sky-100     text-sky-700",
};
const LOC_ICON: Record<string, string> = {
  Indoor: "🏠", Outdoor: "🌿", Private: "🔒", Bar: "🍸",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [allTables, setAllTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [assignTableId, setAssignTableId] = useState("");
  const [assigningSaving, setAssigningSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/orders${q}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchTables = async () => {
    const res = await fetch("/api/tables");
    const data = await res.json();
    setAllTables(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchOrders(); fetchTables(); }, [statusFilter]);
  useEffect(() => { const iv = setInterval(fetchOrders, 30000); return () => clearInterval(iv); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
    if (selected?.id === id) setSelected((p: any) => ({ ...p, status }));
  };

  const assignTable = async (orderId: string, tableId: string) => {
    setAssigningSaving(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: tableId || null }),
    });
    setAssigningSaving(false);
    fetchOrders(); fetchTables();
    setSelected(null);
  };

  const openDetail = (order: any) => { setSelected(order); setAssignTableId(order.tableId || ""); };

  const filtered = orders.filter(o =>
    (o.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.orderNo || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.phone || "").includes(search)
  );

  const statusCounts = orders.reduce((acc: any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const nextStatus = (cur: string) => STATUS_FLOW[STATUS_FLOW.indexOf(cur) + 1];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-400 text-sm">{orders.length} total · auto-refreshes every 30s</p>
            </div>
            <button onClick={fetchOrders} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition">
              <FaRedo size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Status Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL", "PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"].map(status => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === status ? "bg-[#800020] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#800020]"}`}>
                {status}{status !== "ALL" && statusCounts[status] ? ` (${statusCounts[status]})` : ""}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Search by name, order no, or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm bg-white" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-sm">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Order No", "Customer", "Type", "Table", "Items", "Total", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : filtered.map(order => (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-xs font-mono font-bold text-[#800020]">#{order.orderNo?.slice(-6)}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${TYPE_STYLES[order.type]}`}>{order.type.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4">
                      {order.table ? (
                        <div className="flex items-center gap-1.5">
                          <FaChair className="text-[#800020] text-xs" />
                          <span className="text-sm font-semibold text-[#800020]">T{order.table.number}</span>
                          <span className="text-xs text-gray-400">{LOC_ICON[order.table.location]}</span>
                        </div>
                      ) : order.type === "DINE_IN" ? (
                        <span className="text-xs text-amber-600 font-medium">⚠️ No table</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">₹{order.total?.toFixed(0)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => openDetail(order)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition" title="View">
                          <FaEye size={13} />
                        </button>
                        {nextStatus(order.status) && (
                          <button
                            onClick={() => updateStatus(order.id, nextStatus(order.status))}
                            className="px-3 py-1.5 bg-[#800020] text-white text-xs rounded-lg font-semibold hover:bg-[#5a0016] transition"
                            title={`Mark as ${nextStatus(order.status)}`}
                          >
                            → {nextStatus(order.status)}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FaClock className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black z-40" />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{selected.orderNo?.slice(-6)}</h2>
                    <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><FaTimes /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Customer info */}
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer</p>
                    {[
                      ["Name",  selected.customerName],
                      ["Phone", selected.phone],
                      ["Email", selected.email || "—"],
                      ["Type",  selected.type.replace("_", " ")],
                      ["Notes", selected.notes || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 text-sm">
                        <span className="text-gray-400 w-16 shrink-0">{k}</span>
                        <span className="text-gray-700 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Table Assignment */}
                  <div className="bg-[#faf7f2] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <FaChair className="text-[#800020]" />
                      <h4 className="font-bold text-gray-900 text-sm">Table Assignment</h4>
                      {selected.table && (
                        <span className="ml-auto text-xs bg-[#800020] text-white px-2 py-0.5 rounded-full font-semibold">T{selected.table.number}</span>
                      )}
                    </div>

                    <select value={assignTableId} onChange={e => setAssignTableId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] bg-white mb-3">
                      <option value="">No table (takeaway / delivery)</option>
                      {allTables
                        .filter(t => t.status !== "MAINTENANCE")
                        .sort((a, b) => a.number - b.number)
                        .map(t => (
                          <option key={t.id} value={t.id} disabled={t.status === "OCCUPIED" && t.id !== selected.tableId}>
                            Table #{t.number} — {LOC_ICON[t.location]} {t.location} · {t.capacity} seats · {t.status}
                            {t.id === selected.tableId ? " ← Current" : ""}
                          </option>
                        ))}
                    </select>

                    <motion.button onClick={() => assignTable(selected.id, assignTableId)} disabled={assigningSaving}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 bg-[#800020] text-white rounded-xl text-sm font-bold hover:bg-[#5a0016] transition disabled:opacity-60">
                      {assigningSaving ? "Saving..." : assignTableId ? `Assign Table #${allTables.find(t => t.id === assignTableId)?.number}` : "Clear Table Assignment"}
                    </motion.button>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                    <div className="space-y-2">
                      {selected.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{selected.subtotal?.toFixed(0)}</span></div>
                    <div className="flex justify-between text-sm text-gray-500"><span>GST (5%)</span><span>₹{selected.tax?.toFixed(0)}</span></div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200"><span>Total</span><span>₹{selected.total?.toFixed(0)}</span></div>
                  </div>

                  {/* Status Controls */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[...STATUS_FLOW, "CANCELLED"].map(s => (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition ${selected.status === s ? STATUS_STYLES[s] + " border-current" : "border-gray-200 text-gray-500 hover:border-[#800020] hover:text-[#800020]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
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
