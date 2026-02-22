"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const mockWeekly = [
  { day: "Mon", revenue: 12400, orders: 18, reservations: 8 },
  { day: "Tue", revenue: 18200, orders: 26, reservations: 12 },
  { day: "Wed", revenue: 9800, orders: 14, reservations: 6 },
  { day: "Thu", revenue: 22600, orders: 31, reservations: 15 },
  { day: "Fri", revenue: 31200, orders: 44, reservations: 22 },
  { day: "Sat", revenue: 38900, orders: 56, reservations: 30 },
  { day: "Sun", revenue: 28400, orders: 39, reservations: 18 },
];

const mockCategories = [
  { name: "Main Course", value: 38 },
  { name: "Starters", value: 24 },
  { name: "Drinks", value: 18 },
  { name: "Desserts", value: 12 },
  { name: "Others", value: 8 },
];

const COLORS = ["#800020", "#c04060", "#e07090", "#f0a0b0", "#f8d0d8"];

const mockMonthly = [
  { month: "Sep", revenue: 142000 }, { month: "Oct", revenue: 168000 },
  { month: "Nov", revenue: 195000 }, { month: "Dec", revenue: 231000 },
  { month: "Jan", revenue: 187000 }, { month: "Feb", revenue: 214000 },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  
  // Calculate total reservations count
  const totalReservations = data?.recent?.reservations?.length || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-400 text-sm">Business performance overview</p>
          </div>
          <div className="flex gap-2">
            {["week", "month", "year"].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  period === p ? "bg-[#800020] text-white" : "border border-gray-200 text-gray-600 hover:border-[#800020]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Revenue", value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`, change: "+12.4%", up: true },
              { label: "Total Orders", value: stats?.totalOrders || "—", change: "+8.2%", up: true },
              { label: "Reservations", value: totalReservations || "—", change: "+5.7%", up: true },
              { label: "Menu Items", value: stats?.totalMenuItems || "—", change: "-2.1%", up: false },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                <p className={`text-xs font-medium mt-2 ${kpi.up ? "text-green-600" : "text-red-500"}`}>
                  {kpi.change} vs last {period}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Revenue & Orders Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={period === "month" ? charts.monthlyRevenue || mockMonthly : charts.dailyRevenue || mockWeekly} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey={period === "month" ? "month" : "day"} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
                  formatter={(v: any, name: string) => [name === "revenue" ? `₹${Number(v).toLocaleString()}` : v, name]} />
                <Bar yAxisId="left" dataKey="revenue" fill="#800020" radius={[6, 6, 0, 0]} />
                {period !== "month" && <Bar yAxisId="right" dataKey="orders" fill="#f0a0b0" radius={[6, 6, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Sales by Category</h3>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={charts.categoryBreakdown?.length ? charts.categoryBreakdown : mockCategories} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ value }) => `${value}`} labelLine={false}>
                      {(charts.categoryBreakdown || mockCategories).map((_, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 flex-1">
                  {(charts.categoryBreakdown || mockCategories).slice(0, 5).map((cat: any, i: number) => (
                    <div key={cat.name || cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600">{cat.name || cat.category}</span>
                      </div>
                      <span className="font-bold text-gray-900">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Weekly Reservations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Daily Reservations</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockWeekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }} />
                  <Line type="monotone" dataKey="reservations" stroke="#800020" strokeWidth={2.5} dot={{ fill: "#800020", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Top Performing */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Top Performing Items</h3>
            <div className="space-y-4">
              {[
                { name: "Butter Chicken", orders: 142, revenue: 56658, change: "+18%" },
                { name: "Paneer Tikka", orders: 128, revenue: 44672, change: "+12%" },
                { name: "Italian Pasta", orders: 96, revenue: 47904, change: "+8%" },
                { name: "Chocolate Lava Cake", orders: 89, revenue: 22211, change: "+22%" },
                { name: "Classic Mojito", orders: 84, revenue: 16716, change: "+5%" },
              ].map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-xs text-green-600 font-medium">{item.change}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.orders / 142) * 100}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                          className="h-full bg-[#800020] rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-20 text-right">{item.orders} orders</span>
                      <span className="text-xs font-bold text-gray-700 w-20 text-right">₹{(item.revenue / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        </div>
      </main>
    </div>
  );
}
