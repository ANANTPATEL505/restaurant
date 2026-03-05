"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChair, FaCheck, FaTimes } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onOrderComplete: (order: any) => Promise<void>;
}

type Step = "details" | "payment" | "confirmation";

type TableRow = {
  id: string;
  number: number;
  capacity: number;
  location: string;
  isAvailable: boolean;
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
};

const LOC_ICON: Record<string, string> = {
  Indoor: "🏠", Outdoor: "🌿", Private: "🔒", Bar: "🍸",
};
const LOC_COLOR: Record<string, string> = {
  Indoor:  "bg-blue-50   border-blue-200   text-blue-700",
  Outdoor: "bg-green-50  border-green-200  text-green-700",
  Private: "bg-purple-50 border-purple-200 text-purple-700",
  Bar:     "bg-amber-50  border-amber-200  text-amber-700",
};

// ─── Table availability picker (inline component) ─────────────────────────────

function TablePicker({
  guests,
  selectedId,
  onSelect,
}: {
  guests: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [avail, setAvail] = useState<{ available: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locFilter, setLocFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const g = guests > 0 ? guests : 1;
      const res = await fetch(`/api/tables/availability?date=${now}&guests=${g}`);
      const data = await res.json();
      if (res.ok) {
        setTables(data.tables || []);
        setAvail({ available: data.available, total: data.total });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [guests]);

  useEffect(() => { load(); }, [load]);
  

  const locs = ["All", ...Array.from(new Set(tables.map(t => t.location)))];
  const shown = locFilter === "All" ? tables : tables.filter(t => t.location === locFilter);
  const selected = tables.find(t => t.id === selectedId);

  return (
    <div className="space-y-3">
      {/* Availability bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Pick a table, or we'll assign one for you.</p>
        {avail && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs font-bold text-green-700">{avail.available}</span>
            <span className="text-xs text-green-600">/ {avail.total} free</span>
          </div>
        )}
      </div>

      {/* Section filters */}
      <div className="flex gap-2 flex-wrap">
        {locs.map(loc => (
          <button key={loc} type="button" onClick={() => setLocFilter(loc)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              locFilter === loc
                ? "bg-[#800020] text-white border-[#800020]"
                : "border-gray-200 text-gray-500 hover:border-[#800020] hover:text-[#800020]"
            }`}>
            {loc !== "All" ? `${LOC_ICON[loc]} ` : ""}{loc}
          </button>
        ))}
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-0.5">
          {shown.map(table => {
            const isSel = selectedId === table.id;
            const ok    = table.isAvailable;
            return (
              <motion.button
                key={table.id}
                type="button"
                whileHover={ok ? { scale: 1.06, y: -2 } : {}}
                whileTap={ok ? { scale: 0.95 } : {}}
                onClick={() => ok && onSelect(isSel ? null : table.id)}
                disabled={!ok}
                title={`Table ${table.number} — ${table.location} (${table.capacity} seats)`}
                className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border-2 transition-all text-center select-none ${
                  !ok
                    ? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed"
                    : isSel
                    ? "bg-[#800020] border-[#800020] text-white shadow-xl shadow-[#800020]/25"
                    : "bg-white border-gray-200 hover:border-[#800020] cursor-pointer"
                }`}
              >
                {isSel && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
                    <FaCheck size={7} className="text-white" />
                  </span>
                )}
                <FaChair className={`text-base ${isSel ? "text-white" : ok ? "text-[#800020]" : "text-gray-300"}`} />
                <span className={`text-xs font-bold leading-none ${isSel ? "text-white" : "text-gray-800"}`}>
                  T{table.number}
                </span>
                <span className={`text-[9px] leading-none ${isSel ? "text-white/75" : "text-gray-400"}`}>
                  {table.capacity}p
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded-full border font-medium mt-0.5 leading-none ${
                  isSel
                    ? "bg-white/20 text-white border-white/20"
                    : LOC_COLOR[table.location] || "bg-gray-100 text-gray-500 border-gray-200"
                }`}>
                  {LOC_ICON[table.location]}
                </span>
                {!ok && (
                  <span className="text-[9px] text-red-400 font-bold leading-none">Full</span>
                )}
              </motion.button>
            );
          })}

          {shown.length === 0 && !loading && (
            <div className="col-span-6 text-center py-5 text-gray-400 text-xs">
              No tables in this section
            </div>
          )}
        </div>
      )}

      {/* Selected table banner */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-[#800020]/5 border border-[#800020]/20 rounded-2xl px-4 py-3"
          >
            <div className="w-9 h-9 bg-[#800020] rounded-xl flex items-center justify-center shrink-0">
              <FaChair className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#800020] text-sm">Table #{selected.number} Selected</p>
              <p className="text-xs text-gray-500 truncate">
                {LOC_ICON[selected.location]} {selected.location} · up to {selected.capacity} guests
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-gray-400 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#800020] inline-block" />Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#800020] border-2 border-green-400 inline-block" />Selected
        </span>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["details", "payment", "confirmation"];
  const labels = ["Details", "Payment", "Done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 px-6 py-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 transition-all ${i <= idx ? "text-[#800020]" : "text-gray-300"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
              i < idx ? "bg-[#800020] border-[#800020] text-white"
              : i === idx ? "border-[#800020] text-[#800020] bg-[#800020]/5"
              : "border-gray-200 text-gray-300"
            }`}>
              {i < idx ? <FaCheck size={8} /> : i + 1}
            </div>
            <span className="text-[10px] font-semibold hidden sm:block">{labels[i]}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded-full transition-all ${i < idx ? "bg-[#800020]" : "bg-gray-100"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CheckoutModal({
  isOpen, onClose, cartItems, total, onOrderComplete,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "", email: "", phone: "",
    type: "DINE_IN",
    addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: "",
    notes: "",
  });

  // Table selection (only for DINE_IN)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Payment state
  const [paymentData, setPaymentData] = useState({
    method: "card", cardNumber: "", expiry: "", cvv: "", upiId: "",
  });

  const subtotal = total;
  const tax      = subtotal * 0.05;
  const finalTotal = subtotal + tax;
  const isDelivery = formData.type === "DELIVERY";
  const isDineIn   = formData.type === "DINE_IN";

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("details"); setLoading(false); setOrderNo(""); setConfirmedTotal(null);
        setSelectedTableId(null);
        setFormData({ customerName:"", email:"", phone:"", type:"DINE_IN", addressLine1:"", addressLine2:"", landmark:"", city:"", state:"", pincode:"", notes:"" });
        setPaymentData({ method:"card", cardNumber:"", expiry:"", cvv:"", upiId:"" });
      }, 350);
    }
  }, [isOpen]);
  useEffect(() => {
  const lenis = (window as any).lenis;

  if (isOpen) {
    document.body.style.overflow = "hidden";
    lenis?.stop();
  } else {
    document.body.style.overflow = "";
    lenis?.start();
  }

  return () => {
    document.body.style.overflow = "";
    lenis?.start();
  };
}, [isOpen]);
  

  const deliveryAddressText = useMemo(() => {
    if (!isDelivery) return "";
    return [
      formData.addressLine1, formData.addressLine2, formData.landmark,
      [formData.city, formData.state, formData.pincode].filter(Boolean).join(", "),
    ].filter(Boolean).join(", ");
  }, [formData, isDelivery]);

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === "type" && value !== "DINE_IN") setSelectedTableId(null);
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPaymentData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  // ── Submit details ──
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim()) {
      alert("Name and phone are required."); return;
    }
    if (isDelivery) {
      if (!formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
        alert("Please fill all required delivery address fields."); return;
      }
    }
    setStep("payment");
  };

  // ── Submit payment + create order ──
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentData.method === "card" && (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv)) {
      alert("Please fill in all card details."); return;
    }
    if (paymentData.method === "upi" && !paymentData.upiId.trim()) {
      alert("Please enter your UPI ID."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          email:        formData.email.trim() || undefined,
          phone:        formData.phone.trim(),
          type:         formData.type,
          notes:        formData.notes.trim() || undefined,
          tableId:      isDineIn ? selectedTableId : null,
          deliveryAddress: isDelivery ? {
            line1:    formData.addressLine1.trim(),
            line2:    formData.addressLine2.trim() || null,
            landmark: formData.landmark.trim() || null,
            city:     formData.city.trim(),
            state:    formData.state.trim(),
            pincode:  formData.pincode.trim(),
          } : null,
          items:   cartItems.map(i => ({ menuItemId: i.id, qty: i.qty })),
          payment: {
            method: paymentData.method.toUpperCase(),
            upiId:  paymentData.upiId.trim() || null,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create order.");
      }

      const order = await res.json();
      setOrderNo(order.orderNo || order.id);
      setConfirmedTotal(typeof order.total === "number" ? order.total : finalTotal);
      await onOrderComplete(order);
      setStep("confirmation");
    } catch (err: any) {
      alert(err.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const confirmationTotal = confirmedTotal ?? finalTotal;

  const INPUT  = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#800020] text-sm transition";
  const LABEL  = "block text-sm font-semibold text-gray-700 mb-1.5";
  

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
        onClick={step !== "confirmation" ? onClose : undefined}
        className="fixed inset-0 bg-black z-40"
      />

      {/* Modal wrapper */}
      <motion.div
      data-lenis-prevent
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed inset-0 z-50 overflow-y-auto  p-3 sm:p-6"
      >
        <div className="min-h-full flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b">
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {step === "details"      && "Your Order Details"}
                    {step === "payment"      && "Payment"}
                    {step === "confirmation" && "Order Confirmed! 🎉"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {step === "details"      && "Step 1 of 2"}
                    {step === "payment"      && "Step 2 of 2"}
                    {step === "confirmation" && "Your order has been placed"}
                  </p>
                </div>
                {step !== "confirmation" && (
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition">
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
              <StepDots step={step} />
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 modal-scroll  px-6 pb-8 pt-4 text-[#800020] ">

              {/* ════════ STEP 1: DETAILS ════════ */}
              {step === "details" && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleDetailsSubmit}
                  className="space-y-5"
                >
                  {/* Name + Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Your Name *</label>
                      <input type="text" name="customerName" value={formData.customerName}
                        onChange={handleDetailsChange} required placeholder="Full name" className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Phone *</label>
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={handleDetailsChange} required placeholder="+91 98765 43210" className={INPUT} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={LABEL}>Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleDetailsChange} placeholder="you@example.com" className={INPUT} />
                  </div>

                  {/* Order type — card buttons */}
                  <div>
                    <label className={LABEL}>Order Type *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["DINE_IN", "TAKEAWAY", "DELIVERY"].map(type => (
                        <button key={type} type="button"
                          onClick={() => { setFormData(p => ({ ...p, type })); if (type !== "DINE_IN") setSelectedTableId(null); }}
                          className={`py-3.5 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1.5 ${
                            formData.type === type
                              ? "border-[#800020] bg-[#800020] text-white shadow-lg shadow-[#800020]/20"
                              : "border-gray-200 text-gray-600 hover:border-[#800020] hover:text-[#800020]"
                          }`}>
                          <span className="text-xl">{type === "DINE_IN" ? "🪑" : type === "TAKEAWAY" ? "🛍️" : "🛵"}</span>
                          {ORDER_TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── TABLE PICKER — only for DINE_IN ── */}
                  {isDineIn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#faf7f2] border border-gray-100 rounded-2xl p-4 space-y-1"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FaChair className="text-[#800020]" />
                        <h3 className="font-bold text-gray-900 text-sm">Choose Your Table</h3>
                        <span className="ml-auto text-xs text-gray-400">Optional</span>
                      </div>
                      <TablePicker
                        guests={2}
                        selectedId={selectedTableId}
                        onSelect={setSelectedTableId}
                      />
                    </motion.div>
                  )}

                  {/* ── DELIVERY ADDRESS ── */}
                  {isDelivery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-[#faf7f2] border border-gray-100 rounded-2xl p-4 space-y-4"
                    >
                      <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
                      <input type="text" name="addressLine1" value={formData.addressLine1}
                        onChange={handleDetailsChange} required={isDelivery}
                        placeholder="House / Flat, Street *" className={INPUT} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="addressLine2" value={formData.addressLine2}
                          onChange={handleDetailsChange} placeholder="Area / Locality" className={INPUT} />
                        <input type="text" name="landmark" value={formData.landmark}
                          onChange={handleDetailsChange} placeholder="Landmark" className={INPUT} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input type="text" name="city" value={formData.city}
                          onChange={handleDetailsChange} required={isDelivery} placeholder="City *" className={INPUT} />
                        <input type="text" name="state" value={formData.state}
                          onChange={handleDetailsChange} required={isDelivery} placeholder="State *" className={INPUT} />
                        <input type="text" name="pincode" value={formData.pincode}
                          onChange={handleDetailsChange} required={isDelivery} placeholder="Pincode *" className={INPUT} />
                      </div>
                    </motion.div>
                  )}

                  {/* Special requests */}
                  <div>
                    <label className={LABEL}>Special Requests <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea name="notes" value={formData.notes} onChange={handleDetailsChange} rows={2}
                      placeholder="Allergies, birthday setup, extra spicy…"
                      className={INPUT + " resize-none"} />
                  </div>

                  {/* Order summary */}
                  <div className="bg-[#faf7f2] rounded-2xl p-4 space-y-2 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Order Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-900">{ORDER_TYPE_LABELS[formData.type]}</span>
                    </div>
                    {isDineIn && selectedTableId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Table</span>
                        <span className="font-semibold text-[#800020]">Selected ✓</span>
                      </div>
                    )}
                    {isDelivery && deliveryAddressText && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-500 shrink-0">Deliver to</span>
                        <span className="font-semibold text-right text-xs text-gray-700">{deliveryAddressText}</span>
                      </div>
                    )}
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-500 truncate mr-4">{item.name} × {item.qty}</span>
                        <span className="font-semibold text-gray-900 shrink-0">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-1 space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                      <div className="flex justify-between text-xs text-gray-400"><span>GST (5%)</span><span>₹{tax.toFixed(0)}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                        <span>Total</span>
                        <span className="text-[#800020]">₹{finalTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/20 text-sm">
                    Proceed to Payment →
                  </button>
                </motion.form>
              )}

              {/* ════════ STEP 2: PAYMENT ════════ */}
              {step === "payment" && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  onSubmit={handlePaymentSubmit}
                  className="space-y-5"
                >
                  {/* Payment method */}
                  <div>
                    <label className={LABEL}>Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { k: "card", icon: "💳", label: "Card" },
                        { k: "upi",  icon: "📱", label: "UPI"  },
                        { k: "cash", icon: "💵", label: "Cash" },
                      ].map(m => (
                        <button key={m.k} type="button"
                          onClick={() => setPaymentData(p => ({ ...p, method: m.k }))}
                          className={`py-3.5 rounded-2xl border-2 text-sm font-bold flex flex-col items-center gap-1.5 transition-all ${
                            paymentData.method === m.k
                              ? "border-[#800020] bg-[#800020]/5 text-[#800020]"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}>
                          <span className="text-xl">{m.icon}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentData.method === "card" && (
                    <>
                      <div>
                        <label className={LABEL}>Card Number *</label>
                        <input type="text" name="cardNumber" value={paymentData.cardNumber}
                          onChange={handlePaymentChange} required
                          placeholder="1234 5678 9012 3456" maxLength={19} className={INPUT} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>Expiry *</label>
                          <input type="text" name="expiry" value={paymentData.expiry}
                            onChange={handlePaymentChange} required placeholder="MM/YY" maxLength={5} className={INPUT} />
                        </div>
                        <div>
                          <label className={LABEL}>CVV *</label>
                          <input type="password" name="cvv" value={paymentData.cvv}
                            onChange={handlePaymentChange} required placeholder="•••" maxLength={4} className={INPUT} />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentData.method === "upi" && (
                    <div>
                      <label className={LABEL}>UPI ID *</label>
                      <input type="text" name="upiId" value={paymentData.upiId}
                        onChange={handlePaymentChange} required
                        placeholder="yourname@upi" className={INPUT} />
                    </div>
                  )}

                  {paymentData.method === "cash" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <p className="text-sm text-amber-800 font-medium">
                        💵 Payment collected at {isDelivery ? "delivery" : "your table/pickup"}.
                      </p>
                    </div>
                  )}

                  {/* Final summary */}
                  <div className="bg-[#faf7f2] rounded-2xl p-4 space-y-2 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">Confirm Your Order</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-900">{ORDER_TYPE_LABELS[formData.type]}</span>
                    </div>
                    {isDineIn && selectedTableId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Table</span>
                        <span className="font-semibold text-[#800020]">Selected ✓</span>
                      </div>
                    )}
                    {isDelivery && deliveryAddressText && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-500 shrink-0">To</span>
                        <span className="font-semibold text-right text-xs text-gray-700">{deliveryAddressText}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200 mt-1">
                      <span>Total Amount</span>
                      <span className="text-[#800020]">₹{finalTotal.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep("details")}
                      className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition text-sm">
                      ← Back
                    </button>
                    <motion.button type="submit" disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="flex-1 py-3.5 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition disabled:opacity-60 shadow-xl shadow-[#800020]/20 text-sm">
                      {loading ? "Placing Order…" : "Complete Order ✓"}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* ════════ STEP 3: CONFIRMATION ════════ */}
              {step === "confirmation" && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-5"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg"
                  >
                    <FaCheck className="text-green-600 text-3xl" />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Order Confirmed!
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">We're preparing your order right away.</p>
                  </div>

                  <div className="bg-[#faf7f2] rounded-2xl p-5 text-left space-y-3 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Details</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Order No</span>
                      <span className="font-bold text-[#800020] text-lg">#{String(orderNo).slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-gray-900">{ORDER_TYPE_LABELS[formData.type]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment</span>
                      <span className="font-semibold text-gray-900 capitalize">{paymentData.method.toUpperCase()}</span>
                    </div>
                    {isDelivery && deliveryAddressText && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-500 shrink-0">Delivering to</span>
                        <span className="font-semibold text-right text-xs text-gray-700">{deliveryAddressText}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                      <span>Total Paid</span>
                      <span className="text-[#800020]">₹{confirmationTotal.toFixed(0)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    A confirmation will be sent via WhatsApp / email shortly.
                  </p>

                  <motion.button onClick={onClose}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/20 text-sm">
                    Done — Back to Menu
                  </motion.button>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
