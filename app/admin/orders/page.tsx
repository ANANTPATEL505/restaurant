"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaSearch, FaEye, FaTimes, FaClock } from "react-icons/fa";

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"];
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};
const TYPE_STYLES: Record<string, string> = {
  DINE_IN: "bg-emerald-100 text-emerald-700",
  TAKEAWAY: "bg-orange-100 text-orange-700",
  DELIVERY: "bg-sky-100 text-sky-700",
};
const PAYMENT_LABELS: Record<string, string> = {
  CARD: "Card",
  UPI: "UPI",
  CASH: "Cash",
};

const formatDeliveryAddress = (address: any) => {
  if (!address || typeof address !== "object") return "N/A";
  const line1 = typeof address.line1 === "string" ? address.line1 : "";
  const line2 = typeof address.line2 === "string" ? address.line2 : "";
  const landmark = typeof address.landmark === "string" ? address.landmark : "";
  const city = typeof address.city === "string" ? address.city : "";
  const state = typeof address.state === "string" ? address.state : "";
  const pincode = typeof address.pincode === "string" ? address.pincode : "";

  const parts = [line1, line2, landmark, [city, state, pincode].filter(Boolean).join(", ")].filter(Boolean);
  return parts.length ? parts.join(", ") : "N/A";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    try {
      const res = await fetch(`/api/orders${q}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch orders (${res.status})`);
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      console.log(`Attempting to update order ${id} to status ${status}`);
      
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      console.log(`Response status: ${response.status}`);
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (!response.ok) {
        const errorMsg = data?.details || data?.error || `Failed to update status: ${response.statusText}`;
        console.error("Error updating order:", errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log("Order updated successfully:", data);
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
      
      fetchOrders();
      if (selected?.id === id) {
        setSelected(data);
      }
    } catch (error) {
      console.error("Update failed:", error);
      const message = error instanceof Error ? error.message : "Failed to update order status";
      alert(`Error: ${message}`);
    }
  };

  const filtered = orders.filter((o) =>
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search)
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-400 text-sm">Auto-refreshes every 30s</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FaClock /> Live
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["ALL", ...STATUS_FLOW, "CANCELLED"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === s ? "bg-[#800020] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#800020]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm bg-white" />
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Customer", "Type", "Payment", "Items", "Total", "Status", "Time", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
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
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_STYLES[order.type]}`}>{order.type.replace("_", " ")}</span>
                      {order.tableNo && <p className="text-xs text-gray-400 mt-1">Table {order.tableNo}</p>}
                      {order.type === "DELIVERY" && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{formatDeliveryAddress(order.deliveryAddress)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="font-medium text-gray-800">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "Card"}</p>
                      {order.paymentRef && <p className="text-xs text-gray-400">{order.paymentRef}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total?.toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setSelected(order)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition">
                          <FaEye size={14} />
                        </button>
                        {/* Quick status advance */}
                        {STATUS_FLOW.indexOf(order.status) !== -1 && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                          <button
                            onClick={() => updateStatus(order.id, STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1])}
                            className="text-xs px-3 py-1.5 bg-[#800020] text-white rounded-lg hover:bg-[#5a0016] transition font-medium"
                          >
                            → {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">No orders found</div>
            )}
          </div>
          </div>
        </div>
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black z-40" />
              <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{selected.orderNo}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes /></button>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${TYPE_STYLES[selected.type]}`}>{selected.type.replace("_", " ")}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      ["Customer", selected.customerName],
                      ["Phone", selected.phone],
                      ["Email", selected.email || "N/A"],
                      ["Table No", selected.tableNo || "N/A"],
                      ["Delivery Address", formatDeliveryAddress(selected.deliveryAddress)],
                      ["Payment", PAYMENT_LABELS[selected.paymentMethod] || selected.paymentMethod || "Card"],
                      ["Payment Ref", selected.paymentRef || "N/A"],
                      ["Notes", selected.notes || "None"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 text-sm">
                        <span className="text-gray-400 w-24 shrink-0">{k}</span>
                        <span className="text-gray-700 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <h4 className="font-bold text-gray-900 text-sm mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {selected.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name} × {item.qty}</span>
                          <span className="font-medium text-gray-900">₹{(item.price * item.qty).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtotal</span><span>₹{selected.subtotal?.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>GST (5%)</span><span>₹{selected.tax?.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-sm pt-1">
                        <span>Total</span><span>₹{selected.total?.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[...STATUS_FLOW, "CANCELLED"].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          disabled={selected.status === s}
                          className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                            selected.status === s ? "bg-[#800020] text-white" : "border border-gray-200 text-gray-600 hover:border-[#800020] hover:text-[#800020]"
                          } disabled:cursor-default`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {updateSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 p-3 bg-green-100 text-green-700 rounded-xl text-xs font-medium text-center"
                      >
                        ✓ Order status updated successfully
                      </motion.div>
                    )}
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
