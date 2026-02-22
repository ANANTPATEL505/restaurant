"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{ id: string; name: string; price: number; qty: number }>;
  total: number;
  onOrderComplete: (orderData: any) => Promise<void>;
}

type Step = "details" | "payment" | "confirmation";

type DeliveryAddressPayload = {
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
};

export default function CheckoutModal({ isOpen, onClose, cartItems, total, onOrderComplete }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    type: "DINE_IN",
    tableNo: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    method: "card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const subtotal = total;
  const tax = subtotal * 0.05;
  const finalTotal = subtotal + tax;
  const isDelivery = formData.type === "DELIVERY";
  const isDineIn = formData.type === "DINE_IN";

  const deliveryAddressText = useMemo(() => {
    if (!isDelivery) return "";
    const parts = [
      formData.addressLine1.trim(),
      formData.addressLine2.trim(),
      formData.landmark.trim(),
      [formData.city.trim(), formData.state.trim(), formData.pincode.trim()].filter(Boolean).join(", "),
    ].filter(Boolean);
    return parts.join(", ");
  }, [
    formData.addressLine1,
    formData.addressLine2,
    formData.city,
    formData.landmark,
    formData.pincode,
    formData.state,
    isDelivery,
  ]);

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "type") {
        return {
          ...prev,
          type: value,
          tableNo: value === "DINE_IN" ? prev.tableNo : "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("details");
      setLoading(false);
      setOrderNo("");
      setConfirmedTotal(null);
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        type: "DINE_IN",
        tableNo: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
      });
      setPaymentData({
        method: "card",
        cardNumber: "",
        expiry: "",
        cvv: "",
        upiId: "",
      });
    }
  }, [isOpen]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isDineIn && formData.tableNo.trim()) {
      const parsedTableNo = Number.parseInt(formData.tableNo, 10);
      if (!Number.isInteger(parsedTableNo) || parsedTableNo <= 0) {
        alert("Please enter a valid table number.");
        return;
      }
    }

    if (isDelivery) {
      const requiredAddressFields = [
        formData.addressLine1.trim(),
        formData.city.trim(),
        formData.state.trim(),
        formData.pincode.trim(),
      ];
      if (requiredAddressFields.some((field) => !field)) {
        alert("Please fill all required delivery address fields.");
        return;
      }
    }

    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentData.method === "card") {
      if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
        alert("Please fill in all card details.");
        return;
      }
    }

    if (paymentData.method === "upi" && !paymentData.upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }

    const deliveryAddress: DeliveryAddressPayload | null = isDelivery
      ? {
          line1: formData.addressLine1.trim(),
          line2: formData.addressLine2.trim() || null,
          landmark: formData.landmark.trim() || null,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        }
      : null;

    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          type: formData.type,
          tableNo: isDineIn && formData.tableNo.trim() ? Number.parseInt(formData.tableNo, 10) : null,
          notes: formData.notes.trim(),
          deliveryAddress,
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            qty: item.qty,
          })),
          payment: {
            method: paymentData.method.toUpperCase(),
            upiId: paymentData.upiId.trim(),
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to create order.");
      }

      const order = await response.json();
      setOrderNo(order.orderNo);
      setConfirmedTotal(typeof order.total === "number" ? order.total : finalTotal);

      if (onOrderComplete) {
        await onOrderComplete(order);
      }

      setStep("confirmation");
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Order creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const confirmationTotal = confirmedTotal ?? finalTotal;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40"
      />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 overflow-y-auto p-4"
      >
        <div className="min-h-full flex items-center justify-center">
          <motion.div
            data-lenis-prevent
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {step === "details" && "Order Details"}
                  {step === "payment" && "Payment Information"}
                  {step === "confirmation" && "Order Confirmed"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {step === "details" && "Step 1 of 3"}
                  {step === "payment" && "Step 2 of 3"}
                  {step === "confirmation" && "Your order has been placed"}
                </p>
              </div>
              {step !== "confirmation" && (
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500" aria-label="Close checkout modal">
                  x
                </button>
              )}
            </div>

            <div data-lenis-prevent className="p-6 flex-1 overflow-y-auto">
              {step === "details" && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleDetailsChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleDetailsChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleDetailsChange}
                        required
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Order Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleDetailsChange}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                      >
                        <option value="DINE_IN">Dine In</option>
                        <option value="TAKEAWAY">Takeaway</option>
                        <option value="DELIVERY">Delivery</option>
                      </select>
                    </div>
                  </div>

                  {isDineIn && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Table Number</label>
                      <input
                        type="number"
                        name="tableNo"
                        value={formData.tableNo}
                        onChange={handleDetailsChange}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  )}

                  {isDelivery && (
                    <div className="space-y-4 border border-gray-200 rounded-2xl p-4 bg-[#faf7f2]">
                      <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleDetailsChange}
                          required={isDelivery}
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                          placeholder="House/Flat, Street"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleDetailsChange}
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                          placeholder="Area, locality"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark</label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleDetailsChange}
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                          placeholder="Near..."
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleDetailsChange}
                            required={isDelivery}
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleDetailsChange}
                            required={isDelivery}
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleDetailsChange}
                            required={isDelivery}
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                            placeholder="Pincode"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleDetailsChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020] resize-none"
                      placeholder="Any special requests or allergies?"
                    />
                  </div>

                  <div className="bg-[#faf7f2] p-4 rounded-2xl space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order Type</span>
                      <span className="font-semibold">{ORDER_TYPE_LABELS[formData.type]}</span>
                    </div>
                    {isDineIn && formData.tableNo.trim() && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Table Number</span>
                        <span className="font-semibold">{formData.tableNo}</span>
                      </div>
                    )}
                    {isDelivery && deliveryAddressText && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-600 shrink-0">Delivery Address</span>
                        <span className="font-semibold text-right">{deliveryAddressText}</span>
                      </div>
                    )}
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.qty}
                        </span>
                        <span className="font-semibold">Rs {item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal</span>
                        <span>Rs {subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>GST (5%)</span>
                        <span>Rs {tax.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base">
                        <span>Total</span>
                        <span className="text-[#800020]">Rs {finalTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/25"
                  >
                    Proceed to Payment
                  </button>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select
                      name="method"
                      value={paymentData.method}
                      onChange={handlePaymentChange}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash on Delivery/Pickup</option>
                    </select>
                  </div>

                  {paymentData.method === "card" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentChange}
                          required
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiry"
                            value={paymentData.expiry}
                            onChange={handlePaymentChange}
                            required
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handlePaymentChange}
                            required
                            placeholder="123"
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentData.method === "upi" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID *</label>
                      <input
                        type="text"
                        name="upiId"
                        value={paymentData.upiId}
                        onChange={handlePaymentChange}
                        required
                        placeholder="yourname@bank"
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                  )}

                  {paymentData.method === "cash" && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                      <p className="text-sm text-blue-900">Payment will be collected at delivery/pickup time.</p>
                    </div>
                  )}

                  <div className="bg-[#faf7f2] p-4 rounded-2xl space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order Type</span>
                      <span className="font-semibold">{ORDER_TYPE_LABELS[formData.type]}</span>
                    </div>
                    {isDelivery && deliveryAddressText && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-600 shrink-0">Delivery Address</span>
                        <span className="font-semibold text-right">{deliveryAddressText}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                      <span>Total Amount</span>
                      <span className="text-[#800020]">Rs {finalTotal.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="flex-1 py-3 border-2 border-[#800020] text-[#800020] font-bold rounded-2xl hover:bg-[#800020]/5 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/25 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Complete Order"}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === "confirmation" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Order Confirmed
                  </h3>
                  <p className="text-gray-600 mb-4">Your order has been successfully placed.</p>
                  <div className="bg-[#faf7f2] p-4 rounded-2xl mb-6">
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-[#800020]">{orderNo}</p>
                  </div>
                  {isDelivery && deliveryAddressText && (
                    <p className="text-sm text-gray-600 mb-2">
                      Delivery to: <span className="font-semibold">{deliveryAddressText}</span>
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mb-6">
                    We will notify you via email and SMS. Total amount: <span className="font-bold">Rs {confirmationTotal.toFixed(0)}</span>
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/25"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
