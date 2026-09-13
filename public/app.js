"use strict";

var __rest = (this && this.__rest) || function (s, e) {

    var t = {

}
;

    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];

    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s);
 i < p.length;
 i++) {

            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];

        
}

    return t;

}
;

/* Adaptado para correr en Replit: React (JSX ya compilado a JS plano),
   Material Symbols en vez de lucide-react, y una API propia respaldada
   por un archivo local en vez de window.storage. */
const {
 useState, useEffect, useRef, useCallback 
}
 = React;

/* ---------- Ícono genérico (Material Symbols) ---------- */
function Icon({
 name, size = 20, className = "", style = {

}
 
}
) {

    return (React.createElement("span", {
 className: `material-symbols-outlined ${className}`, style: Object.assign({
 fontSize: size, width: size, height: size, lineHeight: 1 
}
, style) 
}
, name));

}

/* ---------- Almacenamiento compartido (reemplaza a window.storage) ---------- */
const storage = {

    async get(key) {

        const res = await fetch(`/api/storage/${key}`);

        if (res.status === 404)
            return null;

        if (!res.ok)
            throw new Error("storage_error");

        return res.json();

    
}
,
    async set(key, value) {

        const res = await fetch(`/api/storage/${key}`, {

            method: "POST",
            headers: {
 "Content-Type": "application/json" 
}
,
            body: JSON.stringify({
 value 
}
),
        
}
);

        if (!res.ok)
            throw new Error("storage_error");

        return res.json();

    
}
,

}
;

/* ---------- Logo por defecto ---------- */
const DEFAULT_LOGO = "data:image/jpeg;base64,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\
iAiIgIiICIiAiIgIiIP/9k=";

/* ---------- Config por defecto (primera vez que se abre el enlace) ---------- */
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
    description: "Somos un negocio familiar que busca mejorar su atención y servicio con el tiempo, le pedimos una disculpa a nuestros clientes por nuestras inconsistencias, pero falta capacidad para poder brindar los \
servicios de forma debidamente correcta.",
    whatsapp: "772 111 55 36",
    managerWhatsapp: "",
    largeOrderThreshold: 8,
    currency: "$",

}
;

/* ---------- Utilidades ---------- */
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
 // sin horario configurado: no se restringe
    const current = now.getHours() * 60 + now.getMinutes();

    if (start === end)
        return true;

    if (start < end)
        return current >= start && current < end;

    return current >= start || current < end;
 // horario que cruza la medianoche

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

            
}
;

            img.src = e.target.result;

        
}
;

        reader.readAsDataURL(file);

    
}
);

}

function uid() {

    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

}

/* ---------- Componente principal ---------- */
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

    const [cart, setCart] = useState({

}
);

    const [showCart, setShowCart] = useState(false);

    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const [checkoutForm, setCheckoutForm] = useState({
 name: "", address: "", houseNumber: "", notes: "" 
}
);

    const [orderSent, setOrderSent] = useState(false);

    const [toast, setToast] = useState(null);

    const [now, setNow] = useState(() => new Date());

    useEffect(() => {

        const clockInterval = setInterval(() => setNow(new Date()), 30000);

        return () => clearInterval(clockInterval);

    
}
, []);

    useEffect(() => {

        let mounted = true;

        async function load(isFirstLoad) {

            try {

                let cfgRes = null;

                try {

                    cfgRes = await storage.get("config");

                
}

                catch (e) {
 /* no existe todavía o falla transitoria */ 
}

                if (cfgRes && cfgRes.value) {

                    if (mounted)
                        setConfig(JSON.parse(cfgRes.value));

                
}

                else if (isFirstLoad && mounted) {

                    setConfig(null);
 // primera vez que se abre el enlace: no hay configuración
                
}

                let prodRes = null;

                try {

                    prodRes = await storage.get("products");

                
}

                catch (e) {
 /* no existe todavía o falla transitoria */ 
}

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

        return () => {
 mounted = false;
 clearInterval(interval);
 
}
;

    
}
, []);

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

    
}
, []);

    const persistProducts = useCallback(async (next) => {

        setProducts(next);

        try {

            await storage.set("products", JSON.stringify(next));

        
}

        catch (e) {

            showToast("No se pudo guardar. Intentá de nuevo.");

        
}

    
}
, []);

    /* ---------- Configuración inicial (primer acceso) ---------- */
    if (loading) {

        return (React.createElement("div", {
 className: "min-h-screen flex items-center justify-center bg-amber-50" 
}
,
            React.createElement(Icon, {
 name: "progress_activity", className: "animate-spin text-sky-500", size: 32 
}
)));

    
}

    if (storageError) {

        return (React.createElement("div", {
 className: "min-h-screen flex items-center justify-center bg-amber-50 p-6 text-center" 
}
,
            React.createElement("div", null,
                React.createElement(Icon, {
 name: "error", className: "mx-auto mb-3 text-sky-600", size: 32 
}
),
                React.createElement("p", {
 className: "text-slate-700" 
}
, "Ocurri\u00F3 un problema al cargar los datos. Recarg\u00E1 la p\u00E1gina."))));

    
}

    if (!config) {

        return (React.createElement(SetupWizard, {
 onCreate: async (cfg) => {

                await persistConfig(cfg);

                setOwnerMode(true);

            
}
 
}
));

    
}

    /* ---------- Carrito: helpers ---------- */
    const cartItems = Object.entries(cart)
        .map(([id, qty]) => ({
 product: products.find((p) => p.id === id), qty 
}
))
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

            return Object.assign(Object.assign({

}
, c), {
 [id]: current + 1 
}
);

        
}
);

    
}

    function changeQty(id, delta) {

        const product = products.find((p) => p.id === id);

        const max = getStock(product);

        setCart((c) => {

            const next = Object.assign(Object.assign({

}
, c), {
 [id]: Math.min(max, Math.max(0, (c[id] || 0) + delta)) 
}
);

            if (next[id] === 0)
                delete next[id];

            return next;

        
}
);

    
}

    function buildWhatsAppUrl() {

        const lines = [];

        lines.push(`🛍️ *Nuevo pedido — ${config.businessName}*`);

        lines.push("");

        cartItems.forEach((i) => {

            lines.push(`• ${i.qty}x ${i.product.name} — ${formatPrice(i.product.price * i.qty, config.currency)}`);

        
}
);

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

        return {
 url: `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`, isLarge, hasNumber: !!digits 
}
;

    
}

    /* ---------- Owner: login por PIN ---------- */
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

    /* ---------- Vista: local CERRADO ---------- */
    if (!config.isOpen && !ownerMode) {

        return (React.createElement("div", {
 className: "min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center relative" 
}
,
            React.createElement("style", null, FONT_IMPORT),
            config.logo && (React.createElement("img", {
 src: config.logo, alt: config.businessName, className: "w-28 h-28 object-contain mb-5 mx-auto" 
}
)),
            React.createElement("div", {
 className: "border-4 border-red-600 bg-red-600/10 rounded-2xl px-8 py-10 max-w-sm w-full sign-swing" 
}
,
                React.createElement("p", {
 className: "text-white/70 text-sm tracking-widest uppercase mb-2", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, config.businessName),
                React.createElement("div", {
 className: "text-red-500 font-black text-4xl tracking-wide mb-3", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "CERRADO"),
                React.createElement("p", {
 className: "text-white text-sm" 
}
, "Ahora mismo no estamos recibiendo pedidos."),
                config.orderSchedule && (React.createElement("div", {
 className: "mt-5 flex items-start justify-center gap-2 text-white/80 text-sm" 
}
,
                    React.createElement(Icon, {
 name: "schedule", size: 16, className: "mt-0.5 shrink-0" 
}
),
                    React.createElement("span", {
 className: "whitespace-pre-line" 
}
, config.orderSchedule))),
                buildDeliveryScheduleText(config) && (React.createElement("div", {
 className: "mt-3 flex items-start justify-center gap-2 text-white/80 text-sm" 
}
,
                    React.createElement(Icon, {
 name: "local_shipping", size: 16, className: "mt-0.5 shrink-0" 
}
),
                    React.createElement("span", {
 className: "whitespace-pre-line" 
}
, buildDeliveryScheduleText(config))))),
            React.createElement("button", {
 onClick: () => setShowPinPrompt(true), className: "absolute bottom-5 right-5 text-white/30 hover:text-white/70 transition-colors", "aria-label": "Acceso due\u00F1o" 
}
,
                React.createElement(Icon, {
 name: "key", size: 18 
}
)),
            showPinPrompt && (React.createElement(PinModal, {
 value: pinInput, error: pinError, onChange: setPinInput, onClose: () => {
 setShowPinPrompt(false);
 setPinInput("");
 setPinError("");
 
}
, onSubmit: tryUnlock 
}
))));

    
}

    /* ---------- Vista principal ---------- */
    return (React.createElement("div", {
 className: "min-h-screen bg-amber-50", style: {
 fontFamily: "'Inter', sans-serif" 
}
 
}
,
        React.createElement("style", null, FONT_IMPORT),
        React.createElement("header", {
 className: "app-enter bg-gradient-to-b from-sky-400 to-sky-300 text-white relative overflow-hidden" 
}
,
            React.createElement("div", {
 className: "max-w-2xl mx-auto px-5 pt-8 pb-12 relative z-10" 
}
,
                React.createElement("div", {
 className: "flex items-start justify-between" 
}
,
                    React.createElement("div", {
 className: "flex items-center gap-4" 
}
,
                        config.logo && (React.createElement("div", {
 className: "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black overflow-hidden shrink-0 p-1.5", style: {

                                border: "2px solid rgba(255,255,255,0.6)",
                                boxShadow: "5px 5px 0 0 #f59e0b, 5px 5px 0 3px #0c4a6e",
                                transform: "rotate(-3deg)",
                            
}
 
}
,
                            React.createElement("img", {
 src: config.logo, alt: config.businessName, className: "w-full h-full object-contain rounded-xl" 
}
))),
                        React.createElement("div", null,
                            React.createElement("p", {
 className: "text-sky-50/80 uppercase mb-0.5", style: {
 fontSize: 10, letterSpacing: "0.18em" 
}
 
}
, "Men\u00FA privado"),
                            React.createElement("h1", {
 className: "text-5xl sm:text-6xl leading-none", style: {

                                    fontFamily: "'Pacifico', cursive",
                                    textShadow: "0 0 10px rgba(255,255,255,0.7), 0 0 22px rgba(186,230,253,0.9), 0 0 42px rgba(125,211,252,0.7), 0 0 64px rgba(56,189,248,0.4)",
                                
}
 
}
, config.businessName))),
                    React.createElement("span", {
 className: `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${config.isOpen ? "bg-white/90 text-sky-700" : "bg-red-600 text-white"}` 
}
,
                        React.createElement("span", {
 className: `w-1.5 h-1.5 rounded-full ${config.isOpen ? "bg-emerald-500" : "bg-white"}` 
}
),
                        config.isOpen ? "Abierto" : "Cerrado (vista dueño)")),
                React.createElement("div", {
 className: "mt-6 flex gap-3" 
}
,
                    config.orderSchedule && (React.createElement("div", {
 className: "flex-1 flex items-start gap-2 text-white bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 shadow-sm", style: {
 transform: "translateY(-4px) rotate(-1.5deg)" 
}
 
}
,
                        React.createElement(Icon, {
 name: "schedule", size: 14, className: "mt-0.5 shrink-0" 
}
),
                        React.createElement("div", {
 className: "min-w-0" 
}
,
                            React.createElement("p", {
 className: "text-[9px] uppercase tracking-widest text-white/70 font-semibold mb-0.5" 
}
, "Pedidos"),
                            React.createElement("p", {
 className: "text-xs font-semibold whitespace-pre-line leading-tight" 
}
, config.orderSchedule)))),
                    buildDeliveryScheduleText(config) && (React.createElement("div", {
 className: "flex-1 flex items-start gap-2 text-white bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 shadow-sm", style: {
 transform: "translateY(6px) rotate(1.5deg)" 
}
 
}
,
                        React.createElement(Icon, {
 name: "local_shipping", size: 14, className: "mt-0.5 shrink-0" 
}
),
                        React.createElement("div", {
 className: "min-w-0" 
}
,
                            React.createElement("p", {
 className: "text-[9px] uppercase tracking-widest text-white/70 font-semibold mb-0.5" 
}
, "Reparto"),
                            React.createElement("p", {
 className: "text-xs font-semibold whitespace-pre-line leading-tight" 
}
, buildDeliveryScheduleText(config)))))),
                config.description && (React.createElement("p", {
 className: "mt-5 text-white/90", style: {
 fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.35 
}
 
}
, config.description))),
            React.createElement("div", {
 className: "absolute -bottom-3 right-8 text-white drop-shadow-lg animate-bounce z-20" 
}
,
                React.createElement(Icon, {
 name: "icecream", size: 36 
}
)),
            React.createElement("svg", {
 className: "absolute bottom-0 left-0 w-full", viewBox: "0 0 400 24", preserveAspectRatio: "none", style: {
 height: 20 
}
 
}
,
                React.createElement("path", {
 d: "M0,12 C50,24 100,0 150,12 C200,24 250,0 300,12 C350,24 400,0 400,12 L400,24 L0,24 Z", fill: "#fffbeb" 
}
))),
        React.createElement("div", {
 className: "relative" 
}
,
            React.createElement("main", {
 className: "app-enter max-w-2xl mx-auto px-5 py-6 pb-28", style: {
 animationDelay: "0.12s" 
}
 
}
, visibleProducts.length === 0 ? (React.createElement("div", {
 className: "text-center py-16 text-slate-400" 
}
,
                React.createElement(Icon, {
 name: "shopping_bag", className: "mx-auto mb-3", size: 32 
}
),
                React.createElement("p", null, "Todav\u00EDa no hay productos disponibles."))) : (categories.map((cat) => (React.createElement("section", {
 key: cat, className: "mb-7" 
}
,
                categories.length > 1 && (React.createElement("h2", {
 className: "text-sky-700 font-semibold mb-3 text-sm tracking-wide uppercase", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, cat)),
                React.createElement("div", {
 className: "grid grid-cols-1 sm:grid-cols-2 gap-5" 
}
, visibleProducts.filter((p) => (p.category || "General") === cat).map((p) => {

                    const stock = getStock(p);

                    const soldOut = p.trackStock && stock <= 0;

                    const atMax = cart[p.id] >= stock;

                    return (React.createElement("div", {
 key: p.id, className: "bg-white rounded-3xl overflow-hidden flex flex-col transition-transform active:translate-x-0.5 active:translate-y-0.5", style: {

                            border: "3px solid #0c4a6e",
                            boxShadow: "7px 7px 0 0 #f59e0b, 7px 7px 0 3px #0c4a6e",
                            opacity: soldOut ? 0.55 : 1,
                        
}
 
}
,
                        React.createElement("div", {
 className: "h-44 shrink-0 bg-sky-100 flex items-center justify-center overflow-hidden relative" 
}
,
                            p.image ? (React.createElement("img", {
 src: p.image, alt: p.name, className: "w-full h-full object-cover" 
}
)) : (React.createElement(Icon, {
 name: "add_photo_alternate", className: "text-sky-300", size: 30 
}
)),
                            p.trackStock && (React.createElement("span", {
 className: `absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${soldOut ? "bg-red-600 text-white" : "bg-white/90 text-sky-700"}` 
}
, soldOut ? "Agotado" : `Quedan ${stock}`))),
                        React.createElement("div", {
 className: "p-4 flex flex-col gap-2.5" 
}
,
                            React.createElement("p", {
 className: "text-slate-800 leading-snug", style: {
 fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.15rem" 
}
 
}
, p.name),
                            React.createElement("div", {
 className: "flex items-center justify-between gap-2" 
}
,
                                React.createElement("span", {
 className: "inline-block bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold px-3.5 py-1.5 rounded-full", style: {
 fontSize: "1.05rem", boxShadow: "2px 2px 0 0 #0c4a6e" 
}
 
}
, formatPrice(p.price, config.currency)),
                                soldOut ? (React.createElement("span", {
 className: "text-xs font-semibold text-red-500 px-3 py-2" 
}
, "Sin stock")) : cart[p.id] ? (React.createElement("div", {
 className: "flex items-center gap-2 bg-sky-50 rounded-full px-1" 
}
,
                                    React.createElement("button", {
 onClick: () => changeQty(p.id, -1), className: "w-7 h-7 flex items-center justify-center text-sky-600" 
}
,
                                        React.createElement(Icon, {
 name: "remove", size: 15 
}
)),
                                    React.createElement("span", {
 className: "text-sm font-semibold text-sky-800 w-4 text-center" 
}
, cart[p.id]),
                                    React.createElement("button", {
 onClick: () => changeQty(p.id, 1), disabled: atMax, className: "w-7 h-7 flex items-center justify-center text-sky-600 disabled:text-slate-300" 
}
,
                                        React.createElement(Icon, {
 name: "add", size: 15 
}
)))) : (React.createElement("button", {
 onClick: () => addToCart(p.id), className: "flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors shrink-0" 
}
,
                                    React.createElement(Icon, {
 name: "add", size: 13 
}
),
                                    " Agregar"))))));

                
}
))))))),
            !ordersOpen && (React.createElement("div", {
 className: "absolute inset-0 z-10 flex items-center justify-center px-6 text-center backdrop-blur-sm overflow-hidden", style: {
 background: "rgba(56,189,248,0.4)" 
}
 
}
,
                React.createElement("div", {
 className: "absolute top-4 left-0 w-full h-9 overflow-hidden pointer-events-none" 
}
,
                    React.createElement("div", {
 className: "truck-drive absolute top-0" 
}
,
                        React.createElement(Icon, {
 name: "local_shipping", className: "text-white drop-shadow", size: 30 
}
))),
                React.createElement("div", {
 className: "bg-white/95 rounded-3xl px-6 py-8 max-w-xs w-full sign-swing", style: {
 border: "3px solid #0284c7", boxShadow: "6px 6px 0 0 #0284c7" 
}
 
}
,
                    React.createElement("div", {
 className: "mx-auto mb-3 w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center" 
}
,
                        React.createElement(Icon, {
 name: "local_shipping", className: "text-sky-600", size: 26 
}
)),
                    React.createElement("p", {
 className: "font-black text-sky-700 text-xl tracking-wide mb-2", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "ESTAMOS DE REPARTO"),
                    React.createElement("p", {
 className: "text-slate-600 text-sm" 
}
,
                        "Lo sentimos, por el momento no se puede seguir pidiendo porque estamos de reparto.",
                        config.orderStartTime && ` Volvemos a recibir pedidos mañana a las ${config.orderStartTime} hs.`))))),
        React.createElement("div", {
 className: "fixed bottom-0 left-0 right-0 z-20" 
}
, ordersOpen && cartCount > 0 && !showCart && !checkoutOpen && (React.createElement("div", {
 className: "max-w-2xl mx-auto px-5 pb-4" 
}
,
            React.createElement("button", {
 onClick: () => setShowCart(true), className: "w-full bg-sky-600 hover:bg-sky-700 text-white rounded-2xl py-3.5 px-5 shadow-lg flex items-center justify-between font-semibold" 
}
,
                React.createElement("span", {
 className: "flex items-center gap-2" 
}
,
                    React.createElement(Icon, {
 name: "shopping_bag", size: 18 
}
),
                    " Ver pedido (",
                    cartCount,
                    ")"),
                React.createElement("span", null, formatPrice(cartTotal, config.currency)))))),
        !ownerMode && (React.createElement("button", {
 onClick: () => setShowPinPrompt(true), className: "fixed top-3 right-3 z-20 text-sky-800/30 hover:text-sky-800/70 bg-white/40 rounded-full p-2", "aria-label": "Acceso due\u00F1o" 
}
,
            React.createElement(Icon, {
 name: "lock", size: 15 
}
))),
        ownerMode && (React.createElement(OwnerQuickBar, {
 isOpen: config.isOpen, onToggleOpen: () => persistConfig(Object.assign(Object.assign({

}
, config), {
 isOpen: !config.isOpen 
}
)), onOpenPanel: () => setAdminOpen(true), onExit: () => setOwnerMode(false) 
}
)),
        showPinPrompt && (React.createElement(PinModal, {
 value: pinInput, error: pinError, onChange: setPinInput, onClose: () => {
 setShowPinPrompt(false);
 setPinInput("");
 setPinError("");
 
}
, onSubmit: tryUnlock 
}
)),
        showCart && (React.createElement(CartDrawer, {
 items: cartItems, total: cartTotal, currency: config.currency, onClose: () => setShowCart(false), onChangeQty: changeQty, onCheckout: () => {
 setShowCart(false);
 setCheckoutOpen(true);
 
}
 
}
)),
        checkoutOpen && (React.createElement(CheckoutModal, {
 form: checkoutForm, setForm: setCheckoutForm, total: cartTotal, currency: config.currency, orderSent: orderSent, onClose: () => {
 setCheckoutOpen(false);
 setOrderSent(false);
 
}
, onSend: async () => {

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

                catch (e) {
 /* si falla la verificación, seguimos con el estado local */ 
}

                const {
 url, hasNumber 
}
 = buildWhatsAppUrl();

                if (!hasNumber) {

                    showToast("El dueño todavía no configuró el número de WhatsApp.");

                    return;

                
}

                window.open(url, "_blank");

                const updatedProducts = products.map((p) => {

                    const item = cartItems.find((ci) => ci.product.id === p.id);

                    if (item && p.trackStock) {

                        const remaining = Math.max(0, (Number(p.stock) || 0) - item.qty);

                        return Object.assign(Object.assign({

}
, p), {
 stock: remaining 
}
);

                    
}

                    return p;

                
}
);

                persistProducts(updatedProducts);

                setOrderSent(true);

                setCart({

}
);

            
}
 
}
)),
        adminOpen && ownerMode && (React.createElement(AdminPanel, {
 config: config, products: products, tab: adminTab, setTab: setAdminTab, onClose: () => setAdminOpen(false), onSaveConfig: persistConfig, onSaveProducts: persistProducts, editingProduct: editingProduct, setEditingProduct: setEditingProduct, showToast: showToast 
}
)),
        toast && (React.createElement("div", {
 className: "fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50" 
}
, toast))));

}

/* ---------- Fuentes ---------- */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&family=Pacifico&family=Baloo+2:wght@600;700;800&family=Caveat:wght@600;700&display=swap');
.sign-swing { animation: swing 4.5s ease-in-out infinite; transform-origin: top center; }
@keyframes swing { 0%,100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
.app-enter { animation: appEnter 0.55s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes appEnter { from { opacity: 0; transform: translateY(16px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
.truck-drive { animation: truckDrive 3.2s linear infinite; left: -15%; }
@keyframes truckDrive { from { left: -15%; } to { left: 105%; } }`;

/* ---------- Configuración inicial ---------- */
function SetupWizard({
 onCreate 
}
) {

    const [form, setForm] = useState(Object.assign(Object.assign({

}
, DEFAULT_CONFIG), {
 pin: "", confirmPin: "" 
}
));

    const [error, setError] = useState("");

    function submit() {

        if (!form.pin || form.pin.length < 4)
            return setError("Elegí un PIN de al menos 4 dígitos.");

        if (form.pin !== form.confirmPin)
            return setError("Los PIN no coinciden.");

        const {
 confirmPin 
}
 = form, cfg = __rest(form, ["confirmPin"]);

        onCreate(cfg);

    
}

    return (React.createElement("div", {
 className: "min-h-screen bg-amber-50 flex items-center justify-center p-5", style: {
 fontFamily: "'Inter', sans-serif" 
}
 
}
,
        React.createElement("style", null, FONT_IMPORT),
        React.createElement("div", {
 className: "bg-white rounded-3xl shadow-xl max-w-sm w-full p-6" 
}
,
            React.createElement("h1", {
 className: "text-xl font-bold text-slate-800 mb-1", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "Configuraci\u00F3n inicial"),
            React.createElement("p", {
 className: "text-slate-500 text-sm mb-5" 
}
, "Esto se hace una sola vez. Guard\u00E1 tu PIN, lo vas a necesitar para editar el men\u00FA."),
            React.createElement(Field, {
 label: "Nombre del local" 
}
,
                React.createElement("input", {
 className: "input", value: form.businessName, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 businessName: e.target.value 
}
)) 
}
)),
            React.createElement(Field, {
 label: "N\u00FAmero del gerente (para pedidos grandes)" 
}
,
                React.createElement("input", {
 className: "input", placeholder: "Opcional", value: form.managerWhatsapp, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 managerWhatsapp: e.target.value 
}
)) 
}
)),
            React.createElement("p", {
 className: "text-xs text-slate-400 mb-3" 
}
, "Los horarios de pedidos, reparto y el n\u00FAmero de WhatsApp para pedidos ya vienen con un valor por defecto. Los vas a poder editar despu\u00E9s desde el panel del due\u00F1o."),
            React.createElement("div", {
 className: "grid grid-cols-2 gap-3" 
}
,
                React.createElement(Field, {
 label: "Eleg\u00ED un PIN" 
}
,
                    React.createElement("input", {
 className: "input", type: "password", inputMode: "numeric", value: form.pin, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 pin: e.target.value 
}
)) 
}
)),
                React.createElement(Field, {
 label: "Repet\u00ED el PIN" 
}
,
                    React.createElement("input", {
 className: "input", type: "password", inputMode: "numeric", value: form.confirmPin, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 confirmPin: e.target.value 
}
)) 
}
))),
            error && React.createElement("p", {
 className: "text-red-600 text-xs mb-3 flex items-center gap-1" 
}
,
                React.createElement(Icon, {
 name: "error", size: 13 
}
),
                " ",
                error),
            React.createElement("button", {
 onClick: submit, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl mt-1" 
}
, "Crear mi men\u00FA")),
        React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; } .input:focus { border-color:#38bdf8; }`)));

}

function Field({
 label, children 
}
) {

    return (React.createElement("div", {
 className: "mb-3" 
}
,
        React.createElement("label", {
 className: "block text-xs font-semibold text-slate-500 mb-1" 
}
, label),
        children));

}

/* ---------- PIN modal ---------- */
function PinModal({
 value, error, onChange, onClose, onSubmit 
}
) {

    return (React.createElement("div", {
 className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" 
}
,
        React.createElement("div", {
 className: "bg-white rounded-2xl p-6 w-full max-w-xs" 
}
,
            React.createElement("div", {
 className: "flex justify-between items-center mb-4" 
}
,
                React.createElement("h3", {
 className: "font-bold text-slate-800 flex items-center gap-2", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
,
                    React.createElement(Icon, {
 name: "lock", size: 16 
}
),
                    " Acceso due\u00F1o"),
                React.createElement("button", {
 onClick: onClose 
}
,
                    React.createElement(Icon, {
 name: "close", size: 18, className: "text-slate-400" 
}
))),
            React.createElement("input", {
 autoFocus: true, type: "password", inputMode: "numeric", placeholder: "PIN", value: value, onChange: (e) => onChange(e.target.value), onKeyDown: (e) => e.key === "Enter" && onSubmit(), className: "w-full border border-sky-200 rounded-xl px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-sky-400" 
}
),
            error && React.createElement("p", {
 className: "text-red-600 text-xs mt-2 text-center" 
}
, error),
            React.createElement("button", {
 onClick: onSubmit, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl mt-4" 
}
, "Ingresar"))));

}

/* ---------- Barra rápida del dueño ---------- */
function OwnerQuickBar({
 isOpen, onToggleOpen, onOpenPanel, onExit 
}
) {

    return (React.createElement("div", {
 className: "fixed bottom-4 left-4 right-4 z-30 flex justify-center" 
}
,
        React.createElement("div", {
 className: "bg-slate-900 text-white rounded-full shadow-xl flex items-center gap-1 px-2 py-2" 
}
,
            React.createElement("button", {
 onClick: onOpenPanel, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium" 
}
,
                React.createElement(Icon, {
 name: "settings", size: 15 
}
),
                " Editar men\u00FA"),
            React.createElement("button", {
 onClick: onToggleOpen, className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}` 
}
,
                React.createElement(Icon, {
 name: "power_settings_new", size: 15 
}
),
                " ",
                isOpen ? "Abierto" : "Cerrado"),
            React.createElement("button", {
 onClick: onExit, className: "px-3 py-1.5 rounded-full hover:bg-white/10 text-sm text-white/60" 
}
, "Salir"))));

}

/* ---------- Carrito ---------- */
function CartDrawer({
 items, total, currency, onClose, onChangeQty, onCheckout 
}
) {

    return (React.createElement("div", {
 className: "fixed inset-0 bg-black/40 z-40 flex items-end" 
}
,
        React.createElement("div", {
 className: "bg-white w-full rounded-t-3xl p-5 max-h-[75vh] flex flex-col" 
}
,
            React.createElement("div", {
 className: "flex justify-between items-center mb-4" 
}
,
                React.createElement("h3", {
 className: "font-bold text-slate-800 text-lg", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "Tu pedido"),
                React.createElement("button", {
 onClick: onClose 
}
,
                    React.createElement(Icon, {
 name: "close", size: 20, className: "text-slate-400" 
}
))),
            React.createElement("div", {
 className: "overflow-y-auto flex-1 space-y-3" 
}
, items.map(({
 product, qty 
}
) => (React.createElement("div", {
 key: product.id, className: "flex items-center gap-3" 
}
,
                React.createElement("div", {
 className: "w-12 h-12 bg-sky-100 rounded-lg overflow-hidden shrink-0" 
}
, product.image && React.createElement("img", {
 src: product.image, className: "w-full h-full object-cover", alt: "" 
}
)),
                React.createElement("div", {
 className: "flex-1 min-w-0" 
}
,
                    React.createElement("p", {
 className: "text-sm font-medium text-slate-800 truncate" 
}
, product.name),
                    React.createElement("p", {
 className: "text-xs text-sky-600" 
}
, formatPrice(product.price, currency))),
                React.createElement("div", {
 className: "flex items-center gap-2 bg-sky-50 rounded-full px-1" 
}
,
                    React.createElement("button", {
 onClick: () => onChangeQty(product.id, -1), className: "w-6 h-6 flex items-center justify-center text-sky-600" 
}
,
                        React.createElement(Icon, {
 name: "remove", size: 13 
}
)),
                    React.createElement("span", {
 className: "text-sm font-semibold w-4 text-center" 
}
, qty),
                    React.createElement("button", {
 onClick: () => onChangeQty(product.id, 1), className: "w-6 h-6 flex items-center justify-center text-sky-600" 
}
,
                        React.createElement(Icon, {
 name: "add", size: 13 
}
))))))),
            React.createElement("div", {
 className: "border-t border-sky-100 mt-4 pt-4" 
}
,
                React.createElement("div", {
 className: "flex justify-between font-bold text-slate-800 mb-3" 
}
,
                    React.createElement("span", null, "Total"),
                    React.createElement("span", null, formatPrice(total, currency))),
                React.createElement("button", {
 onClick: onCheckout, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2" 
}
,
                    "Continuar ",
                    React.createElement(Icon, {
 name: "arrow_back", size: 16, className: "rotate-180" 
}
))))));

}

/* ---------- Checkout ---------- */
function CheckoutModal({
 form, setForm, total, currency, orderSent, onClose, onSend 
}
) {

    const canSend = form.address.trim() && form.houseNumber.trim();

    return (React.createElement("div", {
 className: "fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center sm:justify-center" 
}
,
        React.createElement("div", {
 className: "bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5" 
}
,
            React.createElement("div", {
 className: "flex justify-between items-center mb-4" 
}
,
                React.createElement("h3", {
 className: "font-bold text-slate-800 text-lg", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "Datos de entrega"),
                React.createElement("button", {
 onClick: onClose 
}
,
                    React.createElement(Icon, {
 name: "close", size: 20, className: "text-slate-400" 
}
))),
            orderSent ? (React.createElement("div", {
 className: "text-center py-6" 
}
,
                React.createElement(Icon, {
 name: "check_circle", className: "mx-auto text-emerald-500 mb-3", size: 36 
}
),
                React.createElement("p", {
 className: "font-semibold text-slate-800 mb-1" 
}
, "\u00A1Pedido enviado!"),
                React.createElement("p", {
 className: "text-sm text-slate-500 mb-5" 
}
, "Se abri\u00F3 WhatsApp con tu pedido listo para enviar."),
                React.createElement("button", {
 onClick: onClose, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl" 
}
, "Cerrar"))) : (React.createElement(React.Fragment, null,
                React.createElement(Field, {
 label: "Nombre (opcional)" 
}
,
                    React.createElement("input", {
 className: "input", value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 name: e.target.value 
}
)) 
}
)),
                React.createElement(Field, {
 label: "Direcci\u00F3n" 
}
,
                    React.createElement("input", {
 className: "input", value: form.address, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 address: e.target.value 
}
)) 
}
)),
                React.createElement(Field, {
 label: "N\u00FAmero de casa / depto" 
}
,
                    React.createElement("input", {
 className: "input", value: form.houseNumber, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 houseNumber: e.target.value 
}
)) 
}
)),
                React.createElement(Field, {
 label: "Notas (opcional)" 
}
,
                    React.createElement("textarea", {
 className: "input", rows: 2, value: form.notes, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 notes: e.target.value 
}
)) 
}
)),
                React.createElement("div", {
 className: "flex justify-between text-sm text-slate-500 mb-3" 
}
,
                    React.createElement("span", null, "Total del pedido"),
                    React.createElement("span", {
 className: "font-semibold text-slate-800" 
}
, formatPrice(total, currency))),
                React.createElement("button", {
 disabled: !canSend, onClick: onSend, className: "w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2" 
}
,
                    React.createElement(Icon, {
 name: "send", size: 16 
}
),
                    " Enviar por WhatsApp"),
                React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; margin-bottom:0.1rem; } .input:focus { border-color:#38bdf8; }`))))));

}

/* ---------- Panel del dueño ---------- */
function AdminPanel({
 config, products, tab, setTab, onClose, onSaveConfig, onSaveProducts, editingProduct, setEditingProduct, showToast 
}
) {

    return (React.createElement("div", {
 className: "fixed inset-0 bg-white z-50 flex flex-col", style: {
 fontFamily: "'Inter', sans-serif" 
}
 
}
,
        React.createElement("style", null, FONT_IMPORT),
        React.createElement("div", {
 className: "flex items-center justify-between px-5 py-4 border-b border-sky-100" 
}
,
            React.createElement("h2", {
 className: "font-bold text-slate-800 text-lg", style: {
 fontFamily: "'Poppins', sans-serif" 
}
 
}
, "Panel del due\u00F1o"),
            React.createElement("button", {
 onClick: onClose 
}
,
                React.createElement(Icon, {
 name: "close", size: 22, className: "text-slate-400" 
}
))),
        React.createElement("div", {
 className: "flex border-b border-sky-100 px-5 gap-4" 
}
, [["productos", "Productos"], ["config", "Configuración"]].map(([key, label]) => (React.createElement("button", {
 key: key, onClick: () => setTab(key), className: `py-3 text-sm font-semibold border-b-2 transition-colors ${tab === key ? "border-sky-500 text-sky-700" : "border-transparent text-slate-400"}` 
}
, label)))),
        React.createElement("div", {
 className: "flex-1 overflow-y-auto p-5" 
}
, tab === "productos" ? (React.createElement(ProductsTab, {
 products: products, onSave: onSaveProducts, editingProduct: editingProduct, setEditingProduct: setEditingProduct, showToast: showToast 
}
)) : (React.createElement(ConfigTab, {
 config: config, onSave: onSaveConfig, showToast: showToast 
}
)))));

}

function ProductsTab({
 products, onSave, editingProduct, setEditingProduct, showToast 
}
) {

    if (editingProduct) {

        return (React.createElement(ProductForm, {
 product: editingProduct, onCancel: () => setEditingProduct(null), onSubmit: (p) => {

                const exists = products.some((x) => x.id === p.id);

                const next = exists ? products.map((x) => (x.id === p.id ? p : x)) : [...products, p];

                onSave(next);

                setEditingProduct(null);

                showToast("Producto guardado");

            
}
 
}
));

    
}

    return (React.createElement("div", null,
        React.createElement("button", {
 onClick: () => setEditingProduct({
 id: uid(), name: "", price: "", image: "", visible: true, category: "General", trackStock: false, stock: 0 
}
), className: "w-full mb-4 border-2 border-dashed border-sky-300 text-sky-600 rounded-xl py-3 font-semibold flex items-center justify-center gap-2" 
}
,
            React.createElement(Icon, {
 name: "add", size: 16 
}
),
            " Nuevo producto"),
        React.createElement("div", {
 className: "space-y-2" 
}
,
            products.map((p) => (React.createElement("div", {
 key: p.id, className: "flex items-center gap-3 bg-sky-50 rounded-xl p-2" 
}
,
                React.createElement("div", {
 className: "w-11 h-11 bg-white rounded-lg overflow-hidden shrink-0" 
}
, p.image && React.createElement("img", {
 src: p.image, className: "w-full h-full object-cover", alt: "" 
}
)),
                React.createElement("div", {
 className: "flex-1 min-w-0" 
}
,
                    React.createElement("p", {
 className: "text-sm font-semibold text-slate-800 truncate" 
}
, p.name || "Sin nombre"),
                    React.createElement("p", {
 className: "text-xs text-slate-500" 
}
,
                        formatPrice(p.price, "$"),
                        " \u00B7 ",
                        p.category || "General",
                        p.trackStock ? ` · quedan ${Math.max(0, Number(p.stock) || 0)}` : "")),
                React.createElement("button", {
 onClick: () => {

                        const next = products.map((x) => (x.id === p.id ? Object.assign(Object.assign({

}
, x), {
 visible: !x.visible 
}
) : x));

                        onSave(next);

                    
}
, className: "p-1.5 text-slate-400 hover:text-sky-600", title: p.visible !== false ? "Ocultar" : "Mostrar" 
}
, p.visible !== false ? React.createElement(Icon, {
 name: "visibility", size: 17 
}
) : React.createElement(Icon, {
 name: "visibility_off", size: 17 
}
)),
                React.createElement("button", {
 onClick: () => setEditingProduct(p), className: "p-1.5 text-slate-400 hover:text-sky-600" 
}
,
                    React.createElement(Icon, {
 name: "edit", size: 17 
}
)),
                React.createElement("button", {
 onClick: () => {
 onSave(products.filter((x) => x.id !== p.id));
 showToast("Producto eliminado");
 
}
, className: "p-1.5 text-slate-400 hover:text-red-500" 
}
,
                    React.createElement(Icon, {
 name: "delete", size: 17 
}
))))),
            products.length === 0 && React.createElement("p", {
 className: "text-center text-slate-400 text-sm py-8" 
}
, "Todav\u00EDa no cargaste productos."))));

}

function ProductForm({
 product, onCancel, onSubmit 
}
) {

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

            setForm((f) => (Object.assign(Object.assign({

}
, f), {
 image: dataUrl 
}
)));

        
}

        catch (err) {

            /* silencioso: la imagen simplemente no se carga */
        
}

        finally {

            setUploading(false);

        
}

    
}

    const valid = form.name.trim() && String(form.price).trim() !== "";

    return (React.createElement("div", null,
        React.createElement("button", {
 onClick: onCancel, className: "flex items-center gap-1 text-sky-600 text-sm font-medium mb-4" 
}
,
            React.createElement(Icon, {
 name: "arrow_back", size: 15 
}
),
            " Volver"),
        React.createElement("div", {
 className: "flex justify-center mb-4" 
}
,
            React.createElement("button", {
 onClick: () => {
 var _a;
 return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click();
 
}
, className: "w-28 h-28 rounded-2xl bg-sky-50 border-2 border-dashed border-sky-300 flex items-center justify-center overflow-hidden relative" 
}
, uploading ? (React.createElement(Icon, {
 name: "progress_activity", className: "animate-spin text-sky-400", size: 22 
}
)) : form.image ? (React.createElement("img", {
 src: form.image, className: "w-full h-full object-cover", alt: "" 
}
)) : (React.createElement(Icon, {
 name: "add_photo_alternate", className: "text-sky-300", size: 26 
}
))),
            React.createElement("input", {
 ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleFile 
}
)),
        React.createElement("p", {
 className: "text-center text-xs text-slate-400 -mt-2 mb-4" 
}
, "Toc\u00E1 la imagen para agregar o cambiar la foto"),
        React.createElement(Field, {
 label: "Nombre del producto" 
}
,
            React.createElement("input", {
 className: "input", value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 name: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "Precio" 
}
,
            React.createElement("input", {
 className: "input", type: "number", inputMode: "decimal", value: form.price, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 price: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "Categor\u00EDa (opcional)" 
}
,
            React.createElement("input", {
 className: "input", value: form.category, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 category: e.target.value 
}
)) 
}
)),
        React.createElement("label", {
 className: "flex items-center gap-2 text-sm text-slate-600 mb-3" 
}
,
            React.createElement("input", {
 type: "checkbox", checked: form.visible !== false, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 visible: e.target.checked 
}
)) 
}
),
            "Visible para los clientes ahora"),
        React.createElement("label", {
 className: "flex items-center gap-2 text-sm text-slate-600 mb-2" 
}
,
            React.createElement("input", {
 type: "checkbox", checked: !!form.trackStock, onChange: (e) => {
 var _a;
 return setForm(Object.assign(Object.assign({

}
, form), {
 trackStock: e.target.checked, stock: e.target.checked ? ((_a = form.stock) !== null && _a !== void 0 ? _a : 0) : form.stock 
}
));
 
}
 
}
),
            "Controlar cantidad disponible"),
        form.trackStock && (React.createElement(Field, {
 label: "Cantidad restante" 
}
,
            React.createElement("input", {
 className: "input", type: "number", inputMode: "numeric", min: "0", value: (_a = form.stock) !== null && _a !== void 0 ? _a : 0, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 stock: e.target.value 
}
)) 
}
))),
        React.createElement("button", {
 disabled: !valid, onClick: () => onSubmit(Object.assign(Object.assign({

}
, form), {
 price: Number(form.price), stock: form.trackStock ? Math.max(0, Number(form.stock) || 0) : form.stock 
}
)), className: "w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mt-2" 
}
,
            React.createElement(Icon, {
 name: "save", size: 16 
}
),
            " Guardar producto"),
        React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; } .input:focus { border-color:#38bdf8; }`)));

}

function ConfigTab({
 config, onSave, showToast 
}
) {

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

            setForm((f) => (Object.assign(Object.assign({

}
, f), {
 logo: dataUrl 
}
)));

        
}

        catch (err) {

            /* silencioso */
        
}

        finally {

            setUploadingLogo(false);

        
}

    
}

    return (React.createElement("div", null,
        React.createElement("div", {
 className: "flex justify-center mb-4" 
}
,
            React.createElement("button", {
 onClick: () => {
 var _a;
 return (_a = logoFileRef.current) === null || _a === void 0 ? void 0 : _a.click();
 
}
, className: "w-24 h-24 rounded-2xl bg-black flex items-center justify-center overflow-hidden relative shadow-sm" 
}
, uploadingLogo ? (React.createElement(Icon, {
 name: "progress_activity", className: "animate-spin text-white", size: 20 
}
)) : form.logo ? (React.createElement("img", {
 src: form.logo, className: "w-full h-full object-contain p-1", alt: "Logo" 
}
)) : (React.createElement(Icon, {
 name: "add_photo_alternate", className: "text-white/50", size: 22 
}
))),
            React.createElement("input", {
 ref: logoFileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleLogoFile 
}
)),
        React.createElement("p", {
 className: "text-center text-xs text-slate-400 -mt-2 mb-4" 
}
, "Toc\u00E1 el logo para cambiarlo"),
        React.createElement(Field, {
 label: "Nombre del local" 
}
,
            React.createElement("input", {
 className: "input", value: form.businessName, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 businessName: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "Horario de pedidos (editable solo por vos)" 
}
,
            React.createElement("textarea", {
 className: "input", rows: 2, value: form.orderSchedule, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 orderSchedule: e.target.value 
}
)) 
}
)),
        React.createElement("div", {
 className: "grid grid-cols-2 gap-3 -mt-1" 
}
,
            React.createElement(Field, {
 label: "Empiezan los pedidos" 
}
,
                React.createElement("input", {
 className: "input", type: "time", value: form.orderStartTime || "", onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 orderStartTime: e.target.value 
}
)) 
}
)),
            React.createElement(Field, {
 label: "Terminan los pedidos" 
}
,
                React.createElement("input", {
 className: "input", type: "time", value: form.orderEndTime || "", onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 orderEndTime: e.target.value 
}
)) 
}
))),
        React.createElement("p", {
 className: "text-xs text-slate-400 -mt-2 mb-3" 
}
, "Fuera de este horario, la app bloquea los pedidos autom\u00E1ticamente y muestra \"Estamos de reparto\"."),
        React.createElement(Field, {
 label: "D\u00EDas de reparto" 
}
,
            React.createElement("input", {
 className: "input", value: form.deliveryDays, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 deliveryDays: e.target.value 
}
)) 
}
)),
        React.createElement("div", {
 className: "grid grid-cols-2 gap-3 -mt-1" 
}
,
            React.createElement(Field, {
 label: "Empieza el reparto" 
}
,
                React.createElement("input", {
 className: "input", type: "time", value: form.deliveryStartTime || "", onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 deliveryStartTime: e.target.value 
}
)) 
}
)),
            React.createElement(Field, {
 label: "Termina el reparto" 
}
,
                React.createElement("input", {
 className: "input", type: "time", value: form.deliveryEndTime || "", onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 deliveryEndTime: e.target.value 
}
)) 
}
))),
        React.createElement("p", {
 className: "text-xs text-slate-400 -mt-2 mb-3" 
}
,
            "As\u00ED se va a ver: \"",
            buildDeliveryScheduleText(form) || "—",
            "\". Se actualiza solo, no hace falta escribirlo aparte."),
        React.createElement(Field, {
 label: "Mensaje para tus clientes" 
}
,
            React.createElement("textarea", {
 className: "input", rows: 3, value: form.description, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 description: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "Tu n\u00FAmero de WhatsApp" 
}
,
            React.createElement("input", {
 className: "input", value: form.whatsapp, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 whatsapp: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "N\u00FAmero del gerente (pedidos grandes)" 
}
,
            React.createElement("input", {
 className: "input", value: form.managerWhatsapp, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 managerWhatsapp: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "Cantidad de productos para considerar un pedido grande" 
}
,
            React.createElement("input", {
 className: "input", type: "number", value: form.largeOrderThreshold, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 largeOrderThreshold: e.target.value 
}
)) 
}
)),
        React.createElement(Field, {
 label: "S\u00EDmbolo de moneda" 
}
,
            React.createElement("input", {
 className: "input", value: form.currency, onChange: (e) => setForm(Object.assign(Object.assign({

}
, form), {
 currency: e.target.value 
}
)) 
}
)),
        React.createElement("div", {
 className: "flex items-center justify-between bg-sky-50 rounded-xl px-4 py-3 mb-4" 
}
,
            React.createElement("span", {
 className: "text-sm font-medium text-slate-700" 
}
, "Estado del local"),
            React.createElement("button", {
 onClick: () => setForm(Object.assign(Object.assign({

}
, form), {
 isOpen: !form.isOpen 
}
)), className: `px-3 py-1.5 rounded-full text-sm font-semibold ${form.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}` 
}
, form.isOpen ? "Abierto" : "Cerrado")),
        React.createElement("button", {
 onClick: save, className: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mb-4" 
}
,
            React.createElement(Icon, {
 name: "save", size: 16 
}
),
            " Guardar cambios"),
        !showPinChange ? (React.createElement("button", {
 onClick: () => setShowPinChange(true), className: "w-full text-sky-600 text-sm font-medium py-2" 
}
, "Cambiar PIN de acceso")) : (React.createElement("div", {
 className: "border-t border-sky-100 pt-4" 
}
,
            React.createElement(Field, {
 label: "Nuevo PIN" 
}
,
                React.createElement("input", {
 className: "input", type: "password", inputMode: "numeric", value: newPin, onChange: (e) => setNewPin(e.target.value) 
}
)),
            React.createElement("button", {
 onClick: () => {

                    if (newPin.length < 4)
                        return showToast("El PIN debe tener al menos 4 dígitos");

                    onSave(Object.assign(Object.assign({

}
, form), {
 pin: newPin 
}
));

                    setShowPinChange(false);

                    setNewPin("");

                    showToast("PIN actualizado");

                
}
, className: "w-full bg-slate-800 text-white font-semibold py-2.5 rounded-xl" 
}
, "Confirmar nuevo PIN"))),
        React.createElement("style", null, `.input { width:100%; border:1px solid #bae6fd; border-radius:0.75rem; padding:0.55rem 0.8rem; font-size:0.9rem; outline:none; } .input:focus { border-color:#38bdf8; }`)));

}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(React.createElement(App, null));

