"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { FaStar, FaCheck, FaTimes, FaTrash } from "react-icons/fa";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/reviews?all=true");
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const approve = async (id: string) => {
    await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    fetchReviews();
  };

  const remove = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const filtered = reviews.filter(r =>
    filter === "pending" ? !r.approved :
    filter === "approved" ? r.approved : true
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b px-8 py-5 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-400 text-sm">{reviews.filter(r => !r.approved).length} pending approval</p>
        </div>
        <div className="p-8">
          <div className="flex gap-2 mb-6">
            {["pending", "approved", "all"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${filter === f ? "bg-[#800020] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(review => (
              <motion.div key={review.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-6 border shadow-sm ${!review.approved ? "border-amber-200" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < review.rating ? "text-amber-400" : "text-gray-200"} size={14} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.comment}</p>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {!review.approved && (
                    <button onClick={() => approve(review.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition">
                      <FaCheck size={12} /> Approve
                    </button>
                  )}
                  <button onClick={() => remove(review.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                    <FaTrash size={12} /> Delete
                  </button>
                </div>
                {!review.approved && <span className="block text-center text-xs text-amber-600 font-medium mt-2">Pending Approval</span>}
              </motion.div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <FaStar className="text-4xl mx-auto mb-3 opacity-20" />
                <p>No {filter} reviews</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
