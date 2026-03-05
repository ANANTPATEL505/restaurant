"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import {
  FaCalendarAlt, FaShoppingBag, FaRupeeSign, FaUtensils,
  FaClock, FaCheckCircle, FaTimesCircle, FaStar
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PREPARING: "#8b5cf6",
  READY: "#10b981",
  DELIVERED: "#6b7280",
  CANCELLED: "#ef4444",
};

const mockRevenue = [
  { date: "Mon", revenue: 12400, orders: 18 },
  { date: "Tue", revenue: 18200, orders: 26 },
  { date: "Wed", revenue: 9800, orders: 14 },
  { date: "Thu", revenue: 22600, orders: 31 },
  { date: "Fri", revenue: 31200, orders: 44 },
  { date: "Sat", revenue: 38900, orders: 56 },
  { date: "Sun", revenue: 28400, orders: 39 },
];

function StatCard({ icon: Icon, title, value, sub, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => { 
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const s = data?.stats;
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-400 text-sm">{new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#800020] rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={FaCalendarAlt} title="Today's Reservations" value={s?.todayReservations ?? "—"} sub={`${s?.pendingReservations ?? 0} pending`} color="bg-blue-500" delay={0} />
            <StatCard icon={FaShoppingBag} title="Today's Orders" value={s?.todayOrders ?? "—"} sub={`${s?.totalOrders ?? 0} total`} color="bg-purple-500" delay={0.1} />
            <StatCard icon={FaRupeeSign} title="Monthly Revenue" value={s ? `₹${(s.monthRevenue / 1000).toFixed(1)}K` : "—"} sub={`₹${(s?.totalRevenue / 1000 || 0).toFixed(1)}K total`} color="bg-[#800020]" delay={0.2} />
            <StatCard icon={FaUtensils} title="Menu Items" value={s?.totalMenuItems ?? "—"} sub={`${s?.pendingReviews ?? 0} reviews pending`} color="bg-amber-500" delay={0.3} />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Revenue & Orders (7 Days)</h3>
                <span className="text-xs bg-[#800020]/10 text-[#800020] px-3 py-1 rounded-full font-medium">This Week</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={status?.dailyRevenue?.length ? status.dailyRevenue : mockRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#800020" strokeWidth={2.5} dot={{ fill: "#800020", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Orders By Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={charts.ordersByStatus?.length ? charts.ordersByStatus.map((s: any) => ({ name: s.status, value: s._count.status })) : [
                      { name: "PENDING", value: 12 }, { name: "PREPARING", value: 8 },
                      { name: "DELIVERED", value: 34 }, { name: "CANCELLED", value: 3 }
                    ]}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value"
                  >
                    {[...Array(6)].map((_, i) => (
                      <Cell key={i} fill={Object.values(STATUS_COLORS)[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {status}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Data */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <a href="/admin/orders" className="text-[#800020] text-xs font-medium hover:underline">View all →</a>
              </div>
              <div className="divide-y divide-gray-50">
                {(recent.orders || []).slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.type} · {order.items?.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{order.total?.toFixed(0)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium`} style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {!recent.orders?.length && (
                  <p className="text-center text-gray-400 text-sm py-8">No recent orders</p>
                )}
              </div>
            </motion.div>

            {/* Upcoming Reservations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Upcoming Reservations</h3>
                <a href="/admin/reservations" className="text-[#800020] text-xs font-medium hover:underline">View all →</a>
              </div>
              <div className="divide-y divide-gray-50">
                {(recent.reservations || []).slice(0, 5).map((res: any) => (
                  <div key={res.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{res.name}</p>
                      <p className="text-xs text-gray-400">{res.guests} guests · {res.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-700">
                        {new Date(res.date).toLocaleDateString("en", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(res.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
                {!recent.reservations?.length && (
                  <p className="text-center text-gray-400 text-sm py-8">No upcoming reservations</p>
                )}
              </div>
            </motion.div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
