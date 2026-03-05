"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaSearch, FaTrash, FaFire, FaStar, FaLeaf } from "react-icons/fa";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import CheckoutModal from "@/app/components/CheckoutModal";

const staticMenu = [
    { id: "1", name: "Bruschetta", category: "Starters", price: 299, image: "/food1.jpg", description: "Grilled bread topped with tomatoes & basil.", veg: true, spicy: false, featured: false, available: true },
    { id: "2", name: "Paneer Tikka", category: "Starters", price: 349, image: "/food2.jpg", description: "Spicy marinated paneer cubes grilled to perfection.", veg: true, spicy: true, featured: true, available: true },
    { id: "3", name: "Cream of Mushroom", category: "Soups", price: 249, image: "/web2.jpg", description: "Velvety mushroom soup with truffle oil.", veg: true, spicy: false, featured: false, available: true },
    { id: "4", name: "Butter Chicken", category: "Main Course", price: 449, image: "/food3.jpg", description: "Tender chicken in rich tomato-butter sauce.", veg: false, spicy: false, featured: true, available: true },
    { id: "5", name: "Dal Makhani", category: "Main Course", price: 329, image: "/web3.avif", description: "Slow-cooked black lentils in creamy tomato base.", veg: true, spicy: false, featured: false, available: true },
    { id: "6", name: "Italian Pasta", category: "Main Course", price: 499, image: "/food3.jpg", description: "Creamy alfredo pasta with herbs and parmesan.", veg: true, spicy: false, featured: false, available: true },
    { id: "7", name: "Chicken Biryani", category: "Main Course", price: 549, image: "/web4.jpg", description: "Fragrant basmati rice with spiced chicken.", veg: false, spicy: true, featured: true, available: true },
    { id: "8", name: "Naan", category: "Breads", price: 49, image: "/web5.webp", description: "Soft bread baked fresh in clay tandoor.", veg: true, spicy: false, featured: false, available: true },
    { id: "9", name: "Chocolate Lava Cake", category: "Desserts", price: 249, image: "/food4.jpg", description: "Warm molten chocolate inside with vanilla ice cream.", veg: true, spicy: false, featured: true, available: true },
    { id: "10", name: "Gulab Jamun", category: "Desserts", price: 149, image: "/web2.jpg", description: "Soft milk dumplings in rose-flavoured sugar syrup.", veg: true, spicy: false, featured: false, available: true },
    { id: "11", name: "Classic Mojito", category: "Drinks", price: 199, image: "/food5.jpg", description: "Fresh mint and lime soda - the perfect refresher.", veg: true, spicy: false, featured: false, available: true },
    { id: "12", name: "Mango Lassi", category: "Drinks", price: 179, image: "/web2.jpg", description: "Thick yogurt blended with sweet Alphonso mangoes.", veg: true, spicy: false, featured: false, available: true },
];
type CartItem = { id: string; name: string; price: number; qty: number; image: string };
export default function MenuPage() {
    const [menuData, setMenuData] = useState(staticMenu);
    const [categories, setCategories] = useState<string[]>([]);
    const [active, setActive] = useState("All");
    const [search, setSearch] = useState("");
    const [vegOnly, setVegOnly] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [addedId, setAddedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/menu")
            .then(r => r.json())
            .then(data => {
                if (data.items?.length) {
                    setMenuData(data.items.map((i: any) => ({ ...i, image: i.image || "/food1.jpg" })));
                    setCategories(data.categories || []);
                } else {
                    const cats = Array.from(new Set(staticMenu.map(i => i.category))) as string[];
                    setCategories(cats);
                }
            })
            .catch(() => {
                const cats = Array.from(new Set(staticMenu.map(i => i.category))) as string[];
                setCategories(cats);
            });
    }, []);
    const allCategories = ["All", "Featured", ...categories];

    const addToCart = (item: typeof staticMenu[0]) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === String(item.id));
            if (existing) return prev.map(i => i.id === String(item.id) ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { id: String(item.id), name: item.name, price: item.price, qty: 1, image: item.image }];
        });
        setAddedId(String(item.id));
        setTimeout(() => setAddedId(null), 1500);
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev
            .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
            .filter(i => i.qty > 0)
        );
    };

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);


    const filtered = useMemo(() => {
        return menuData.filter(item => {
            if (!item.available) return false;
            const matchCat = active === "All" ? true : active === "Featured" ? item.featured : item.category === active;
            const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
            const matchVeg = vegOnly ? item.veg : true;
            return matchCat && matchSearch && matchVeg;
        });
    }, [menuData, active, search, vegOnly]);


    return (
        <main className="relative bg-white overflow-hidden min-h-screen">
            <Navbar />

            {/* Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#800020]/5 via-white to-[#800020]/10" />

            {/* HERO */}
            <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center text-white overflow-hidden">
                <motion.img
                    src="/cafe.jpg"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 8 }}
                    className="absolute w-full h-full object-cover brightness-50"
                />
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-5xl md:text-7xl font-bold z-10 text-center px-4"
                >
                    Explore Our Menu
                </motion.h1>
            </section>

            {/* SEARCH */}
            <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex items-center border border-gray-200 rounded-full px-4 py-2.5 flex-1 min-w-52 bg-white shadow-sm">
                        <FaSearch className="text-[#800020] text-sm shrink-0" />
                        <input
                            type="text" placeholder="Search dishes..."
                            className="ml-3 w-full outline-none text-sm text-[#800020]"
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Veg Toggle */}
                    <button
                        onClick={() => setVegOnly(!vegOnly)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${vegOnly ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:border-green-600 hover:text-green-600"
                            }`}
                    >
                        <FaLeaf size={12} /> Veg Only
                    </button>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                        {allCategories.map(cat => (
                            <motion.button
                                key={cat}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActive(cat)}
                                className={`whitespace-nowrap px-4 py-2 text-sm rounded-full transition-all shrink-0 ${active === cat
                                    ? "bg-[#800020] text-white shadow-lg shadow-[#800020]/20"
                                    : "border border-gray-200 text-gray-600 hover:border-[#800020] hover:text-[#800020]"
                                    }`}
                            >
                                {cat === "Featured" ? "⭐ Featured" : cat}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MENU GRID */}
            <section className="px-4 sm:px-8 md:px-20 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence>
                    {filtered.map(item => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ y: -8 }}

                            className="relative bg-white rounded-3xl shadow-xl overflow-hidden group"
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden h-52">
                                <motion.img
                                    key={item.image}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                                    transition={{
                                        duration: 1,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    whileHover={{ scale: 1.08 }}
                                    onError={(e: any) => { e.target.src = "/web2.jpg"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Price Tag */}
                                <div className="absolute top-3 left-0 bg-[#800020] text-white px-4 py-1.5 rounded-r-full text-sm font-bold shadow-lg">
                                    ₹{item.price}
                                </div>

                                {/* Badges */}
                                <div className="absolute top-3 right-3 flex flex-col gap-1">
                                    {item.veg && <span className="w-5 h-5 bg-white rounded flex items-center justify-center shadow"><span className="w-3 h-3 rounded-sm border-2 border-green-600 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-green-600 block" /></span></span>}
                                    {item.spicy && <FaFire className="text-orange-500 drop-shadow-sm" size={16} />}
                                    {item.featured && <FaStar className="text-amber-400 drop-shadow-sm" size={16} />}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {item.name}
                                    </h3>
                                </div>
                                <span className="text-[10px] bg-[#800020]/10 text-[#800020] px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                                <p className="text-gray-400 text-xs mt-2 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>

                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => addToCart(item)}
                                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-semibold transition-all ${addedId === item.id
                                        ? "bg-green-500 text-white"
                                        : "bg-[#800020] text-white hover:bg-[#5a0016]"
                                        } shadow-md shadow-[#800020]/15`}
                                >
                                    <FaShoppingCart size={13} />
                                    {addedId === item.id ? "Added! ✓" : "Add to Cart"}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

            </section>

            {/* Floating Cart Button */}
            <motion.div
                onClick={() => setCartOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 bg-[#800020] text-white p-4 rounded-full shadow-2xl shadow-[#800020]/40 cursor-pointer z-40"
            >
                <FaShoppingCart size={20} />
                <AnimatePresence>
                    {cartCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                        >
                            {cartCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* CART OVERLAY */}
            <AnimatePresence>
                {cartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                            onClick={() => setCartOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            data-lenis-prevent
                            className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-2xl z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b">
                                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Your Cart</h2>
                                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
                            </div>

                            <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <FaShoppingCart className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p>Your cart is empty</p>
                                    </div>
                                ) : cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 text-[#800020] rounded-2xl">
                                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" onError={(e: any) => { e.target.src = "/web2.jpg"; }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                                            <p className="text-[#800020] text-sm font-bold">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border border-gray-300 rounded-lg flex items-center text-[#800020] justify-center text-sm hover:border-[#800020]">−</button>
                                            <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 border border-gray-300 rounded-lg flex text-[#800020] items-center justify-center text-sm hover:border-[#800020]">+</button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                                            <button onClick={() => updateQty(item.id, -item.qty)} className="text-red-400 hover:text-red-600 mt-1">
                                                <FaTrash size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {cart.length > 0 && (
                                <div className="px-6 py-6 border-t space-y-4 text-[#800020]">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between "><span>Subtotal</span><span>₹{total}</span></div>
                                        <div className="flex justify-between "><span>GST (5%)</span><span>₹{(total * 0.05).toFixed(0)}</span></div>
                                        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                                            <span>Total</span><span>₹{(total * 1.05).toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        setCheckoutOpen(true);
                                        setCartOpen(false);
                                    }} className="w-full py-4 bg-[#800020] text-white font-bold rounded-2xl hover:bg-[#5a0016] transition shadow-xl shadow-[#800020]/25">
                                        Proceed to Order
                                    </button>
                                    <button onClick={() => setCartOpen(false)} className="w-full py-3 border border-gray-200 text-gray-600 rounded-2xl text-sm hover:bg-gray-50 transition">
                                        Continue Browsing
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* CHECKOUT MODAL */}
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => {
                    setCheckoutOpen(false);
                }}
                cartItems={cart}
                total={total}
                onOrderComplete={async (order) => {
                    // Clear cart after successful order
                    setCart([]);
                    // Optionally show a success message or redirect
                }}
            />
        </main>
    );

}
