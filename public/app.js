"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const { useState, useEffect, useRef, useCallback } = React;
function Icon({ name, size = 20, className = "", style = {} }) {
    return (React.createElement("span", { className: `material-symbols-outlined ${className}`, style: Object.assign({ fontSize: size, width: size, height: size, lineHeight: 1 }, style) }, name));
}
const storage = {
    async get(key) {
        const res = await fetch(`/api/storage/${key}`);
        if (res.status === 404)
            return null;
        if (!res.ok)
            throw new Error("storage_error");
        return res.json();
    },
    async set(key, value) {
        const res = await fetch(`/api/storage/${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        });
        if (!res.ok)
            throw new Error("storage_error");
        return res.json();
    },
};
const DEFAULT_LOGO = "";
const DEFAULT_CONFIG = {
    pin: "",
    businessName: "Medgud",
    logo: DEFAULT_LOGO,
    isOpen: true,
    orderSchedule: "Lunes a viernes: pedidos de 14:00 a 21:00 hs\nSábados: solo pedidos grandes",
    orderStartTime: "14:00",
    orderEndTime: "21:00",
    deliveryDays: "Lunes a viernes",
    deliveryStartTime: "15:00",
    deliveryEndTime: "20:00",
    description: "Somos un negocio familiar que busca mejorar su atención y servicio con el tiempo, le pedimos una disculpa a nuestros clientes por nuestras inconsistencias, pero falta capacidad para poder brindar los servicios de forma debidamente correcta.",
    whatsapp: "772 111 55 36",
    managerWhatsapp: "",
    largeOrderThreshold: 8,
    currency: "$",
};
function formatPrice(value, currency) {
    const n = Number(value) || 0;
    return `${currency}${n.toLocaleString("es-AR")}`;
}
function timeToMinutes(t) {
    if (!t || typeof t !== "string" || !t.includes(":"))
        return null;
    const [h, m] = t.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m))
        return null;
    return h * 60 + m;
}
function isWithinOrderWindow(config, now) {
    const start = timeToMinutes(config.orderStartTime);
    const end = timeToMinutes(config.orderEndTime);
    if (start === null || end === null)
        return true;
    const current = now.getHours() * 60 + now.getMinutes();
    if (start === end)
        return true;
    if (start < end)
        return current >= start && current < end;
    return current >= start || current < end;
}
function buildDeliveryScheduleText(config) {
    const days = (config.deliveryDays || "").trim();
    const start = config.deliveryStartTime;
    const end = config.deliveryEndTime;
    if (!start || !end)
        return days;
    return `${days ? days + ": " : ""}reparto de ${start} a ${end} hs`;
}
function resizeImage(file, maxWidth = 480, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Imagen inválida"));
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function App() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [products, setProducts] = useState([]);
    const [storageError, setStorageError] = useState(false);
    const [ownerMode, setOwnerMode] = useState(false);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [pinError, setPinError] = useState("");
    const [adminOpen, setAdminOpen] = useState(false);
    const [adminTab, setAdminTab] = useState("productos");
    const [editingProduct, setEditingProduct] = useState(null);
    const [cart, setCart] = useState({});
    const [showCart, setShowCart] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: "", address: "", houseNumber: "", notes: "" });
    const [orderSent, setOrderSent] = useState(false);
    const [toast, setToast] = useState(null);
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const clockInterval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(clockInterval);
    }, []);
    useEffect(() => {
        let mounted = true;
        async function load(isFirstLoad) {
            try {
                let cfgRes = null;
                try {
                    cfgRes = await storage.get("config");
                }
                catch (e) { }
                if (cfgRes && cfgRes.value) {
                    if (mounted)
                        setConfig(JSON.parse(cfgRes.value));
                }
                else if (isFirstLoad && mounted) {
                    setConfig(null);
                }
                let prodRes = null;
                try {
                    prodRes = await storage.get("products");
                }
                catch (e) { }
                if (prodRes && prodRes.value) {
                    if (mounted)
                        setProducts(JSON.parse(prodRes.value));
                }
                else if (isFirstLoad && mounted) {
                    setProducts([]);
                }
            }
            catch (e) {
                if (mounted && isFirstLoad)
                    setStorageError(true);
            }
            finally {
                if (mounted && isFirstLoad)
                    setLoading(false);
            }
        }
        load(true);
        const interval = setInterval(() => load(false), 15000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(null), 2200);
    }
    const persistConfig = useCallback(async (next) => {
        setConfig(next);
        try {
            await storage.set("config", JSON.stringify(next));
        }
        catch (e) {
            showToast("No se pudo guardar. Intentá de nuevo.");
        }
    }, []);
    const persistProducts = useCallback(async (next) => {
        setProducts(next);
        try {
            await storage.set("products", JSON.stringify(next));
        }
        catch (e) {
            showToast("No se pudo guardar. Intentá de nuevo.");
        }
    }, []);
    if (loading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-amber-50" },
            React.createElement(Icon, { name: "progress_activity", className: "animate-spin text-sky-500", size: 32 })));
    }
    if (storageError) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-amber-50 p-6 text-center" },
            React.createElement("div", null,
                React.createElement(Icon, { name: "error", className: "mx-auto mb-3 text-sky-600", size: 32 }),
                React.createElement("p", { className: "text-slate-700" }, "Ocurrió un problema al cargar los datos. Recargá la página."))));
    }
    if (!config) {
        return (React.createElement(SetupWizard, { onCreate: async (cfg) => {
                await persistConfig(cfg);
                setOwnerMode(true);
            } }));
    }
    const cartItems = Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((i) => i.product && i.qty > 0);
    const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
    const cartTotal = cartItems.reduce((s, i) => s + i.qty * Number(i.product.price || 0), 0);
    function getStock(product) {
        if (!product || !product.trackStock)
            return Infinity;
        const n = Number(product.stock);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
    function addToCart(id) {
        const product = products.find((p) => p.id === id);
        const max = getStock(product);
        setCart((c) => {
            const current = c[id] || 0;
            if (current >= max)
                return c;
            return Object.assign(Object.assign({}, c), { [id]: current + 1 });
        });
    }
    function changeQty(id, delta) {
        const product = products.find((p) => p.id === id);
        const max = getStock(product);setCart((c) => {
            const next = Object.assign(Object.assign({}, c), { [id]: Math.min(max, Math.max(0, (c[id] || 0) + delta)) });
            if (next[id] === 0)
                delete next[id];
            return next;
        });
    }
    function buildWhatsAppUrl() {
        const lines = [];
        lines.push(`🛍️ *Nuevo pedido — ${config.businessName}*`);
        lines.push("");
        cartItems.forEach((i) => {
            lines.push(`• ${i.qty}x ${i.product.name} — ${formatPrice(i.product.price * i.qty, config.currency)}`);
        });
        lines.push("");
        lines.push(`*Total: ${formatPrice(cartTotal, config.currency)}*`);
        lines.push("");
        if (checkoutForm.name)
            lines.push(`🙋 Nombre: ${checkoutForm.name}`);
        lines.push(`📍 Dirección: ${checkoutForm.address}`);
        lines.push(`🏠 N° de casa: ${checkoutForm.houseNumber}`);
        if (checkoutForm.notes)
            lines.push(`📝 Notas: ${checkoutForm.notes}`);
        const isLarge = cartCount >= Number(config.largeOrderThreshold || 999999);
        const target = (isLarge && config.managerWhatsapp) ? config.managerWhatsapp : config.whatsapp;
        const digits = (target || "").replace(/\D/g, "");
        return { url: `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`, isLarge, hasNumber: !!digits };
    }
    function tryUnlock() {
        if (pinInput === config.pin) {
            setOwnerMode(true);
            setShowPinPrompt(false);
            setPinInput("");
            setPinError("");
        }
        else {
            setPinError("PIN incorrecto");
        }
    }
    const visibleProducts = products.filter((p) => p.visible !== false);
    const categories = Array.from(new Set(visibleProducts.map((p) => p.category || "General")));
    const ordersOpen = isWithinOrderWindow(config, now);
    if (!config.isOpen && !ownerMode) {
        return (React.createElement("div", { className: "min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center relative" },
            React.createElement("style", null, FONT_IMPORT),
            config.logo && (React.createElement("img", { src: config.logo, alt: config.businessName, className: "w-28 h-28 object-contain mb-5 mx-auto" })),
            React.createElement("div", { className: "border-4 border-red-600 bg-red-600/10 rounded-2xl px-8 py-10 max-w-sm w-full sign-swing" },
                React.createElement("p", { className: "text-white/70 text-sm tracking-widest uppercase mb-2", style: { fontFamily: "'Poppins', sans-serif" } }, config.businessName),
                React.createElement("div", { className: "text-red-500 font-black text-4xl tracking-wide mb-3", style: { fontFamily: "'Poppins', sans-serif" } }, "CERRADO"),
                React.createElement("p", { className: "text-white text-sm" }, "Ahora mismo no estamos recibiendo pedidos."),
                config.orderSchedule && (React.createElement("div", { className: "mt-5 flex items-start justify-center gap-2 text-white/80 text-sm" },
                    React.createElement(Icon, { name: "schedule", size: 16, className: "mt-0.5 shrink-0" }),
                    React.createElement("span", { className: "whitespace-pre-line" }, config.orderSchedule))),
                buildDeliveryScheduleText(config) && (React.createElement("div", { className: "mt-3 flex items-start justify-center gap-2 text-white/80 text-sm" },
                    React.createElement(Icon, { name: "local_shipping", size: 16, className: "mt-0.5 shrink-0" }),
                    React.createElement("span", { className: "whitespace-pre-line" }, buildDeliveryScheduleText(config))))),
            React.createElement("button", { onClick: () => setShowPinPrompt(true), className: "absolute bottom-5 right-5 text-white/30 hover:text-white/70 transition-colors", "aria-label": "Acceso dueño" },
                React.createElement(Icon, { name: "key", size: 18 })),
            showPinPrompt && (React.createElement(PinModal, { value: pinInput, error: pinError, onChange: setPinInput, onClose: () => { setShowPinPrompt(false); setPinInput(""); setPinError(""); }, onSubmit: tryUnlock }))));
    }
    return (React.createElement("div", { className: "min-h-screen bg-amber-50", style: { fontFamily: "'Inter', sans-serif" } },
        React.createElement("style", null, FONT_IMPORT),
        React.createElement("header", { className: "app-enter bg-gradient-to-b from-sky-400 to-sky-300 text-white relative overflow-hidden" },
            React.createElement("div", { className: "max-w-2xl mx-auto px-5 pt-8 pb-12 relative z-10" },
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement("div", { className: "flex items-center gap-4" },
                        config.logo && (React.createElement("div", { className: "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black overflow-hidden shrink-0 p-1.5", style: {
                                border: "2px solid rgba(255,255,255,0.6)",
                                boxShadow: "5px 5px 0 0 #f59e0b, 5px 5px 0 3px #0c4a6e",
                                transform: "rotate(-3deg)",
                            } },
                            React.createElement("img", { src: config.logo, alt: config.businessName, className: "w-full h-full object-contain rounded-xl" }))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sky-50/80 uppercase mb-0.5", style: { fontSize: 10, letterSpacing: "0.18em" } }, "Menú privado"),
                            React.createElement("h1", { className: "text-5xl sm:text-6xl leading-none", style: {
                                    fontFamily: "'Pacifico', cursive",
                                    textShadow: "0 0 10px rgba(255,255,255,0.7), 0 0 22px rgba(186,230,253,0.9), 0 0 42px rgba(125,211,252,0.7), 0 0 64px rgba(56,189,248,0.4)",
                                } }, config.businessName))),
                    React.createElement("span", { className: `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${config.isOpen ? "bg-white/90 text-sky-700" : "bg-red-600 text-white"}` },
                        React.createElement("span", { className: `w-1.5 h-1.5 rounded-full ${config.isOpen ? "bg-emerald-500" : "bg-white"}` }),
                        config.isOpen ? "Abierto" : "Cerrado (vista dueño)")),
                React.createElement("div", { className: "mt-6 flex gap-3" },
                    config.orderSchedule && (React.createElement("div", { className: "flex-1 flex items-start gap-2 text-white bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 shadow-sm", style: { transform: "translateY(-4px) rotate(-1.5deg)" } },
                        React.createElement(Icon, { name: "schedule", size: 14, className: "mt-0.5 shrink-0" }),
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("p", { className: "text-[9px] uppercase tracking-widest text-white/70 font-semibold mb-0.5" }, "Pedidos"),
                            React.createElement("p", { className: "text-xs font-semibold whitespace-pre-line leading-tight" }, config.orderSchedule)))),
                    buildDeliveryScheduleText(config) && (React.createElement("div", { className: "flex-1 flex items-start gap-2 text-white bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 shadow-sm", style: { transform: "translateY(6px) rotate(1.5deg)" } },
                        React.createElement(Icon, { name: "local_shipping", size: 14, className: "mt-0.5 shrink-0" }),
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("p", { className: "text-[9px] uppercase tracking-widest text-white/70 font-semibold mb-0.5" }, "Reparto"),
                            React.createElement("p", { className: "text-xs font-semibold whitespace-pre-line leading-tight" }, buildDeliveryScheduleText(config)))))),
                config.description && (React.createElement("p", { className: "mt-5 text-white/90", style: { fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.35 } }, config.description))),
            React.createElement("div", { className: "absolute -bottom-3 right-8 text-white drop-shadow-lg animate-bounce z-20" },
                React.createElement(Icon, { name: "icecream", size: 36 })),
            React.createElement("svg", { className: "absolute bottom-0 left-0 w-full", viewBox: "0 0 400 24", preserveAspectRatio: "none", style: { height: 20 } },
                React.createElement("path", { d: "M0,12 C50,24 100,0 150,12 C200,24 250,0 300,12 C350,24 400,0 400,12 L400,24 L0,24 Z", fill: "#fffbeb" }))),
        React.createElement("div", { className: "relative" },
            React.createElement("main", { className: "app-enter max-w-2xl mx-auto px-5 py-6 pb-28", style: { animationDelay: "0.12s" } }, visibleProducts.length === 0 ? (React.createElement("div", { className: "text-center py-16 text-slate-400" },
                React.createElement(Icon, { name: "shopping_bag", className: "mx-auto mb-3", size: 32 }),
                React.createElement("p", null, "Todavía no hay productos disponibles."))) : (categories.map((cat) => (React.createElement("section", { key: cat, className: "mb-7" },
                categories.length > 1 && (React.createElement("h2", { className: "text-sky-700 font-semibold mb-3 text-sm tracking-wide uppercase", style: { fontFamily: "'Poppins', sans-serif" } }, cat)),
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5" }, visibleProducts.filter((p) => (p.category || "General") === cat).map((p) => {
                    const stock = getStock(p);
                    const soldOut = p.trackStock && stock <= 0;
                    const atMax = cart[p.id] >= stock;
                    return (React.createElement("div", { key: p.id, className: "bg-white rounded-3xl overflow-hidden flex flex-col transition-transform active:translate-x-0.5 active:translate-y-0.5", style: {
                            border: "3px solid #0c4a6e",
                            boxShadow: "7px 7px 0 0 #f59e0b, 7px 7px 0 3px #0c4a6e",
                            opacity: soldOut ? 0.55 : 1,
                        } },
                        React.createElement("div", { className: "h-44 shrink-0 bg-sky-100 flex items-center justify-center overflow-hidden relative" },
                            p.image ? (React.createElement("img", { src: p.image, alt: p.name, className: "w-full h-full object-cover" })) : (React.createElement(Icon, { name: "add_photo_alternate", className: "text-sky-300", size: 30 })),
                            p.trackStock && (React.createElement("span", { className: `absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${soldOut ? "bg-red-600 text-white" : "bg-white/90 text-sky-700"}` }, soldOut ? "Agotado" : `Quedan ${stock}`))),
                        React.createElement("div", { className: "p-4 flex flex-col gap-2.5" },
                            React.createElement("p", { className: "text-slate-800 leading-snug", style: { fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.15rem" } }, p.name),
                            React.createElement("div", { className: "flex items-center justify-between gap-2" },
                                React.createElement("span", { className: "inline-block bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold px-3.5 py-1.5 rounded-full", style: { fontSize: "1.05rem", boxShadow: "2px 2px 0 0 #0c4a6e" } }, formatPrice(p.price, config.currency)),
                                soldOut ? (React.createElement("span", { className: "text-xs font-semibold text-red-500 px-3 py-2" }, "Sin stock")) : cart[p.id] ? (React.createElement("div", { className: "flex items-center gap-2 bg-sky-50 rounded-full px-1" },
                                    React.createElement("button", { onClick: () => changeQty(p.id, -1), className: "w-7 h-7 flex items-center justify-center text-sky-600" },
                                        React.createElement(Icon, { name: "remove", size: 15 })),
                                    React.createElement("span", { className: "text-sm font-semibold text-sky-800 w-4 text-center" }, cart[p.id]),
                                    React.createElement("button", { onClick: () => changeQty(p.id, 1), disabled: atMax, className: "w-7 h-7 flex items-center justify-center text-sky-600 disabled:text-slate-300" },
                                        React.createElement(Icon, { name: "add", size: 15 })))) : (React.createElement("button", { onClick: () => addToCart(p.id), className: "flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors shrink-0" },
                                    React.createElement(Icon, { name: "add", size: 13 }),
                                    " Agregar"))))));
                }))))))),
            !ordersOpen && (React.createElement("div", { className: "absolute inset-0 z-10 flex items-center justify-center px-6 text-center backdrop-blur-sm overflow-hidden", style: { background: "rgba(56,189,248,0.4)" } },
                React.createElement("div", { className: "absolute top-4 left-0 w-full h-9 overflow-hidden pointer-events-none" },
                    React.createElement("div", { className: "truck-drive absolute top-0" },
                        React.createElement(Icon, { name: "local_shipping", className: "text-white drop-shadow", size: 30 }))),
                React.createElement("div", { className: "bg-white/95 rounded-3xl px-6 py-8 max-w-xs w-full sign-swing", style: { border: "3px solid #0284c7", boxShadow: "6px 6px 0 0 #0284c7" } },
                    React.createElement("div", { className: "mx-auto mb-3 w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center" },
                        React.createElement(Icon, { name: "local_shipping", className: "text-sky-600", size: 26 })),
                    React.createElement("p", { className: "font-black text-sky-700 text-xl tracking-wide mb-2", style: { fontFamily: "'Poppins', sans-serif" } }, "ESTAMOS DE REPARTO"),
                    React.createElement("p", { className: "text-slate-600 text-sm" },
                        "Lo sentimos, por el momento no se puede seguir pidiendo porque estamos de reparto.",
                        config.orderStartTime && ` Volvemos a recibir pedidos mañana a las ${config.orderStartTime} hs.`))))),
        React.createElement("div", { className: "fixed bottom-0 left-0 right-0 z-20" }, ordersOpen && cartCount > 0 && !showCart && !checkoutOpen && (React.createElement("div", { className: "max-w-2xl mx-auto px-5 pb-4" },
            React.createElement("button", { onClick: () => setShowCart(true), className: "w-full bg-sky-600 hover:bg-sky-700 text-white rounded-2xl py-3.5 px-5 shadow-lg flex items-center justify-between font-semibold" },
                React.createElement("span", { className: "flex items-center gap-2" },
                    React.createElement(Icon, { name: "shopping_bag", size: 18 }),
                    " Ver pedido (",
                    cartCount,
                    ")"),
                React.createElement("span", null, formatPrice(cartTotal, config.currency)))))),
        !ownerMode && (React.createElement("button", { onClick: () => setShowPinPrompt(true), className: "fixed top-3 right-3 z-20 text-sky-800/30 hover:text-sky-800/70 bg-white/40 rounded-full p-2", "aria-label": "Acceso dueño" },
            React.createElement(Icon, { name: "lock", size: 15 }))),
        ownerMode && (React.createElement(OwnerQuickBar, { isOpen: config.isOpen, onToggleOpen: () => persistConfig(Object.assign(Object.assign({}, config), { isOpen: !config.isOpen })), onOpenPanel: () => setAdminOpen(true), onExit: () => setOwnerMode(false) })),
        showPinPrompt && (React.createElement(PinModal, { value: pinInput, error: pinError, onChange: setPinInput, onClose: () => { setShowPinPrompt(false); setPinInput(""); setPinError(""); }, onSubmit: tryUnlock })),
        showCart && (React.createElement(CartDrawer, { items: cartItems, total: cartTotal, currency: config.currency, onClose: () => setShowCart(false), onChangeQty: changeQty, onCheckout: () => { setShowCart(false); setCheckoutOpen(true); } })),
        checkoutOpen && (React.createElement(CheckoutModal, { form: checkoutForm, setForm: setCheckoutForm, total: cartTotal, currency: config.currency, orderSent: orderSent, onClose: () => { setCheckoutOpen(false); setOrderSent(false); }, onSend: async () => {
                try {
                    const res = await storage.get("config");
                    if (res && res.value) {
                        const latest = JSON.parse(res.value);
                        if (!latest.isOpen) {
                            setConfig(latest);
                            setCheckoutOpen(false);
                            showToast("El local acaba de cerrar. Tu pedido no se pudo enviar.");
                            return;
                        }
                        if (!isWithinOrderWindow(latest, new Date())) {
                            setConfig(latest);
                            setCheckoutOpen(false);
                            showToast("El horario de pedidos ya cerró. Tu pedido no se pudo enviar.");
                            return;
                        }
                    }
                }
                catch (e) { /* si falla la verificación, seguimos con el estado local */ }
                const { url, hasNumber } = buildWhatsAppUrl();
                if (!hasNumber) {
                    showToast("El dueño todavía no configuró el número de WhatsApp.");
                    return;
                }
                window.open(url, "_blank");
                const updatedProducts = products.map((p) => {
                    const item = cartItems.find((ci) => ci.product.id === p.id);
                    if (item && p.trackStock) {
                        const remaining = Math.max(0, (Number(p.stock) || 0) - item.qty);
                        return Object.assign(Object.assign({}, p), { stock: remaining });
                    }
                    return p;
                });
                persistProducts(updatedProducts);
                setOrderSent(true);
                setCart({});
            } })),
        adminOpen && ownerMode && (React.createElement(AdminPanel, { config: config, products: products, tab: adminTab, setTab: setAdminTab, onClose: () => setAdminOpen(false), onSaveConfig: persistConfig, onSaveProducts: persistProducts, editingProduct: editingProduct, setEditingProduct: setEditingProduct, showToast: showToast })),
        toast && (React.createElement("div", { className: "fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50" }, toast))));
}
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&family=Pacifico&family=Baloo+2:wght@600;700;800&family=Caveat:wght@600;700&display=swap');
.sign-swing { animation: swing 4.5s ease-in-out infinite; transform-origin: top center; }
@keyframes swing { 0%,100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
.app-enter { animation: appEnter 0.55s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes appEnter { from { opacity: 0; transform: translateY(16px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
.truck-drive { animation: truckDrive 3.2s linear infinite; left: -15%; }
@keyframes truckDrive { from { left: -15%; } to { left: 105%; } }`;
function SetupWizard({ onCreate }) {
    const [form, setForm] = useState(Object.assign(Object.function OwnerQuickBar({ isOpen, onToggleOpen, onOpenPanel, onExit }) {
    return (React.createElement("div", { className: "fixed bottom-4 left-4 right-4 z-30 flex justify-center" },
        React.createElement("div", { className: "bg-slate-900 text-white rounded-full shadow-xl flex items-center gap-1 px-2 py-2" },
            React.createElement("button", { onClick: onOpenPanel, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium" },
                React.createElement(Icon, { name: "settings", size: 15 }),
                " Editar menú"),
            React.createElement("button", { onClick: onToggleOpen, className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}` },
                React.createElement(Icon, { name: "power_settings_new", size: 15 }),
                " ",
                isOpen ? "Abierto" : "Cerrado"),
            React.createElement("button", { onClick: onExit, className: "px-3 py-1.5 rounded-full hover:bg-white/10 text-sm text-white/60" }, "Salir"))));
}
function CartDrawer({ items, total, currency, onClose, onChangeQty, onCheckout }) {
    return (React.createElement("div", { className: "fixed inset-0 bg-black/40 z-40 flex items-end" },
        React.createElement("div", { className: "bg-white w-full rounded-t-3xl p-5 max-h-[75vh] flex flex-col" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h3", { className: "font-bold text-slate-800 text-lg", style: { fontFamily: "'Poppins', sans-serif" } }, "Tu pedido"),
                React.createElement("button", { onClick: onClose },
                    React.createElement(Icon, { name: "close", size: 20, className: "text-slate-400" }))),
            React.createElement("div", { className: "overflow-y-auto flex-1 space-y-3" }, items.map(({ product, qty }) => (React.createElement("div", { key: product.id, className: "flex items-center gap-3" },
                React.createElement("div", { className: "w-12 h-12 bg-sky-100 rounded-lg overflow-hidden shrink-0" }, product.image && React.createElement("img", { src: product.image, className: "w-full h-full object-cover", alt: "" })),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("p", { className: "text-sm font-medium text-slate-800 truncate" }, product.name),
                    React.createElement("p", { className: "text-xs text-sky-600" }, formatPrice(product.price, currency))),
                React.createElement("div", { className: "flex items-center gap-2 bg-sky-50 rounded-full px-1" },
                    React.createElement("button", { onClick: () => onChangeQty(product.id, -1), className: "w-6 h-6 flex items-center justify-center text-sky-600" },
                        React.createElement(Icon, { name: "remove", size: 13 })),
                    React.createElement("span", { className: "text-sm font-semibold w-4 text-center" }, qty),
                    React.createElement("button", { onClick: () => onChangeQty(product.id, 1), className: "w-6 h-6 flex items-center justify-center text-sky-600" },
                        React.createElement(Icon, { name: "add", size: 13 }))))))),
            React.createElement("div", { className: "border-t border-sky-100 mt-4 pt-4" },
                React.createElement("div", { className: "flex justify-between font-bold text-slate-800 mb-3" },
                    React.createElement("span", null, "Total"),
                    React.createElement("span", null, formatPrice(total, currency))),
                React.createElement("button", { onClick: onCheckout, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2" },
                    "Continuar ",
                    React.createElement(Icon, { name: "arrow_back", size: 16, className: "rotate-180" }))))));
}
function CheckoutModal({ form, setForm, total, currency, orderSent, onClose, onSend }) {
    const canSend = form.address.trim() && form.houseNumber.trim();
    return (React.createElement("div", { className: "fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center sm:justify-center" },
        React.createElement("div", { className: "bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h3", { className: "font-bold text-slate-800 text-lg", style: { fontFamily: "'Poppins', sans-serif" } }, "Datos de entrega"),
                React.createElement("button", { onClick: onClose },
                    React.createElement(Icon, { name: "close", size: 20, className: "text-slate-400" }))),
            orderSent ? (React.createElement("div", { className: "text-center py-6" },
                React.createElement(Icon, { name: "check_circle", className: "mx-auto text-emerald-500 mb-3", size: 36 }),
                React.createElement("p", { className: "font-semibold text-slate-800 mb-1" }, "¡Pedido enviado!"),
                React.createElement("p", { className: "text-sm text-slate-500 mb-5" }, "Se abrió WhatsApp con tu pedido listo para enviar."),
                React.createElement("button", { onClick: onClose, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl" }, "Cerrar"))) : (React.createElement(React.Fragment, null,
                React.createElement(Field, { label: "Nombre (opcional)" },
                    React.createElement("input", { className: "input", value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })) })),
                React.createElement(Field, { label: "Dirección" },
                    React.createElement("input", { className: "input", value: form.address, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { address: e.target.value })) })),
                React.createElement(Field, { label: "Número de casa / depto" },
                    React.createElement("input", { className: "input", value: form.houseNumber, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { houseNumber: e.target.value })) })),
                React.createElement(Field, { label: "Notas (opcional)" },
                    React.createElement("textarea", { className: "input", rows: 2, value: form.notes, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { notes: e.target.value })) })),
                React.createElement("div", { className: "flex justify-between text-sm text-slate-500 mb-3" },
                    React.createElement("span", null, "Total del pedido"),
                    React.createElement("span", { className: "font-semibold text-slate-800" }, formatPrice(total, currency))),
                React.createElement("button", { disabled: !canSend, onClick: onSend, className: "w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2" },
                    React.createElement(Icon, { name: "send", size: 16 }),
                    " Enviar por WhatsApp"),
                React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; margin-bottom:0.1rem; } .input:focus { border-color:#38bdf8; }`))))));
}
function AdminPanel({ config, products, tab, setTab, onClose, onSaveConfig, onSaveProducts, editingProduct, setEditingProduct, showToast }) {
    return (React.createElement("div", { className: "fixed inset-0 bg-white z-50 flex flex-col", style: { fontFamily: "'Inter', sans-serif" } },
        React.createElement("style", null, FONT_IMPORT),
        React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-sky-100" },
            React.createElement("h2", { className: "font-bold text-slate-800 text-lg", style: { fontFamily: "'Poppins', sans-serif" } }, "Panel del dueño"),
            React.createElement("button", { onClick: onClose },
                React.createElement(Icon, { name: "close", size: 22, className: "text-slate-400" }))),
        React.createElement("div", { className: "flex border-b border-sky-100 px-5 gap-4" }, [["productos", "Productos"], ["config", "Configuración"]].map(([key, label]) => (React.createElement("button", { key: key, onClick: () => setTab(key), className: `py-3 text-sm font-semibold border-b-2 transition-colors ${tab === key ? "border-sky-500 text-sky-700" : "border-transparent text-slate-400"}` }, label)))),
        React.createElement("div", { className: "flex-1 overflow-y-auto p-5" }, tab === "productos" ? (React.createElement(ProductsTab, { products: products, onSave: onSaveProducts, editingProduct: editingProduct, setEditingProduct: setEditingProduct, showToast: showToast })) : (React.createElement(ConfigTab, { config: config, onSave: onSaveConfig, showToast: showToast })))));
}
function ProductsTab({ products, onSave, editingProduct, setEditingProduct, showToast }) {
    if (editingProduct) {
        return (React.createElement(ProductForm, { product: editingProduct, onCancel: () => setEditingProduct(null), onSubmit: (p) => {
                const exists = products.some((x) => x.id === p.id);
                const next = exists ? products.map((x) => (x.id === p.id ? p : x)) : [...products, p];
                onSave(next);
                setEditingProduct(null);
                showToast("Producto guardado");
            } }));
    }
    return (React.createElement("div", null,
        React.createElement("button", { onClick: () => setEditingProduct({ id: uid(), name: "", price: "", image: "", visible: true, category: "General", trackStock: false, stock: 0 }), className: "w-full mb-4 border-2 border-dashed border-sky-300 text-sky-600 rounded-xl py-3 font-semibold flex items-center justify-center gap-2" },
            React.createElement(Icon, { name: "add", size: 16 }),
            " Nuevo producto"),
        React.createElement("div", { className: "space-y-2" },
            products.map((p) => (React.createElement("div", { key: p.id, className: "flex items-center gap-3 bg-sky-50 rounded-xl p-2" },
                React.createElement("div", { className: "w-11 h-11 bg-white rounded-lg overflow-hidden shrink-0" }, p.image && React.createElement("img", { src: p.image, className: "w-full h-full object-cover", alt: "" })),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("p", { className: "text-sm font-semibold text-slate-800 truncate" }, p.name || "Sin nombre"),
                    React.createElement("p", { className: "text-xs text-slate-500" },
                        formatPrice(p.price, "$"),
                        " · ",
                        p.category || "General",
                        p.trackStock ? ` · quedan ${Math.max(0, Number(p.stock) || 0)}` : "")),
                React.createElement("button", { onClick: () => {
                        const next = products.map((x) => (x.id === p.id ? Object.assign(Object.assign({}, x), { visible: !x.visible }) : x));
                        onSave(next);
                    }, className: "p-1.5 text-slate-400 hover:text-sky-600", title: p.visible !== false ? "Ocultar" : "Mostrar" }, p.visible !== false ? React.createElement(Icon, { name: "visibility", size: 17 }) : React.createElement(Icon, { name: "visibility_off", size: 17 })),
                React.createElement("button", { onClick: () => setEditingProduct(p), className: "p-1.5 text-slate-400 hover:text-sky-600" },
                    React.createElement(Icon, { name: "edit", size: 17 })),
                React.createElement("button", { onClick: () => { onSave(products.filter((x) => x.id !== p.id)); showToast("Producto eliminado"); }, className: "p-1.5 text-slate-400 hover:text-red-500" },
                    React.createElement(Icon, { name: "delete", size: 17 }))))),
            products.length === 0 && React.createElement("p", { className: "text-center text-slate-400 text-sm py-8" }, "Todavía no cargaste productos."))));
}
function ProductForm({ product, onCancel, onSubmit }) {
    var _a;
    const [form, setForm] = useState(product);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    async function handleFile(e) {
        const file = e.target.files[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const dataUrl = await resizeImage(file);
            setForm((f) => (Object.assign(Object.assign({}, f), { image: dataUrl })));
        }
        catch (err) {
        }
        finally {
            setUploading(false);
        }
    }
    const valid = form.name.trim() && String(form.price).trim() !== "";
    return (React.createElement("div", null,
        React.createElement("button", { onClick: onCancel, className: "flex items-center gap-1 text-sky-600 text-sm font-medium mb-4" },
            React.createElement(Icon, { name: "arrow_back", size: 15 }),
            " Volver"),
        React.createElement("div", { className: "flex justify-center mb-4" },
            React.createElement("button", { onClick: () => { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-28 h-28 rounded-2xl bg-sky-50 border-2 border-dashed border-sky-300 flex items-center justify-center overflow-hidden relative" }, uploading ? (React.createElement(Icon, { name: "progress_activity", className: "animate-spin text-sky-400", size: 22 })) : form.image ? (React.createElement("img", { src: form.image, className: "w-full h-full object-cover", alt: "" })) : (React.createElement(Icon, { name: "add_photo_alternate", className: "text-sky-300", size: 26 }))),
            React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleFile })),
        React.createElement("p", { className: "text-center text-xs text-slate-400 -mt-2 mb-4" }, "Tocá la imagen para agregar o cambiar la foto"),
        React.createElement(Field, { label: "Nombre del producto" },
            React.createElement("input", { className: "input", value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })) })),
        React.createElement(Field, { label: "Precio" },
            React.createElement("input", { className: "input", type: "number", inputMode: "decimal", value: form.price, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { price: e.target.value })) })),
        React.createElement(Field, { label: "Categoría (opcional)" },
            React.createElement("input", { className: "input", value: form.category, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { category: e.target.value })) })),
        React.createElement("label", { className: "flex items-center gap-2 text-sm text-slate-600 mb-3" },
            React.createElement("input", { type: "checkbox", checked: form.visible !== false, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { visible: e.target.checked })) }),
            "Visible para los clientes ahora"),
        React.createElement("label", { className: "flex items-center gap-2 text-sm text-slate-600 mb-2" },
            React.createElement("input", { type: "checkbox", checked: !!form.trackStock, onChange: (e) => { var _a; return setForm(Object.assign(Object.assign({}, form), { trackStock: e.target.checked, stock: e.target.checked ? ((_a = form.stock) !== null && _a !== void 0 ? _a : 0) : form.stock })); } }),
            "Controlar cantidad disponible"),
        form.trackStock && (React.createElement(Field, { label: "Cantidad restante" },
            React.createElement("input", { className: "input", type: "number", inputMode: "numeric", min: "0", value: (_a = form.stock) !== null && _a !== void 0 ? _a : 0, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { stock: e.target.value })) }))),
        React.createElement("button", { disabled: !valid, onClick: () => onSubmit(Object.assign(Object.assign({}, form), { price: Number(form.price), stock: form.trackStock ? Math.max(0, Number(form.stock) || 0) : form.stock })), className: "w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mt-2" },
            React.createElement(Icon, { name: "save", size: 16 }),
            " Guardar producto"),
        React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; } .input:focus { border-color:#38bdf8; }`)));
}
function ConfigTab({ config, onSave, showToast }) {
    const [form, setForm] = useState(config);
    const [showPinChange, setShowPinChange] = useState(false);
    const [newPin, setNewPin] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoFileRef = useRef(null);
    function save() {
        onSave(form);
        showToast("Configuración guardada");
    }
    async function handleLogoFile(e) {
        const file = e.target.files[0];
        if (!file)
            return;
        setUploadingLogo(true);
        try {
            const dataUrl = await resizeImage(file, 320, 0.85);
            setForm((f) => (Object.assign(Object.assign({}, f), { logo: dataUrl })));
        }
        catch (err) {
        }
        finally {
            setUploadingLogo(false);
        }
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex justify-center mb-4" },
            React.createElement("button", { onClick: () => { var _a; return (_a = logoFileRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-24 h-24 rounded-2xl bg-black flex items-center justify-center overflow-hidden relative shadow-sm" }, uploadingLogo ? (React.createElement(Icon, { name: "progress_activity", className: "animate-spin text-white", size: 20 })) : form.logo ? (React.createElement("img", { src: form.logo, className: "w-full h-full object-contain p-1", alt: "Logo" })) : (React.createElement(Icon, { name: "add_photo_alternate", className: "text-white/50", size: 22 }))),
            React.createElement("input", { ref: logoFileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleLogoFile })),
        React.createElement("p", { className: "text-center text-xs text-slate-400 -mt-2 mb-4" }, "Tocá el logo para cambiarlo"),
        React.createElement(Field, { label: "Nombre del local" },
            React.createElement("input", { className: "input", value: form.businessName, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { businessName: e.target.value })) })),
        React.createElement(Field, { label: "Horario de pedidos (editable solo por vos)" },
            React.createElement("textarea", { className: "input", rows: 2, value: form.orderSchedule, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { orderSchedule: e.target.value })) })),
        React.createElement("div", { className: "grid grid-cols-2 gap-3 -mt-1" },
            React.createElement(Field, { label: "Empiezan los pedidos" },
                React.createElement("input", { className: "input", type: "time", value: form.orderStartTime || "", onChange: (e) => setForm(Object.assign(Object.assign({}, form), { orderStartTime: e.target.value })) })),
            React.createElement(Field, { label: "Terminan los pedidos" },
                React.createElement("input", { className: "input", type: "time", value: form.orderEndTime || "", onChange: (e) => setForm(Object.assi
function OwnerQuickBar({ isOpen, onToggleOpen, onOpenPanel, onExit }) {const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App, null));
