/* Dekalo — panel del taller (admin de Shopify).
 * Página estática: usa App Bridge + "Direct API access", así que no necesita servidor.
 * El archivo de impresión de 300 DPI se genera en la computadora del taller.
 */
const API = "shopify:admin/api/graphql.json";
const TAG = "dekalo";
const BLOCK = "gang-sheet-builder";
// Handle del listado en la App Store (lo da Shopify al crear el listado). Si cambia, actualízalo aquí.
const APP_HANDLE = "dekalo";
// Planes sin comisión: Básico (clave "free"), Pro y Master. Todos con 14 días gratis en Shopify App Pricing.
const RATES = { free: 0, pro: 0, taller: 0 }, PRO_FREE_ORDERS = 0;
// Hojas que se pueden descargar por mes en cada plan.
const LIMITS = { free: 150, pro: 500, taller: Infinity };
// Ponlo en true cuando los planes estén creados en el Partner Dashboard: sin plan activo no se descarga.
const PLANS_LIVE = false;
// Dirección del puente de cobro por uso (App Events API). Vacío = solo se registra en el panel.
const USAGE_ENDPOINT = "";
const PLANS = [
  { key: "free", m: 9.99, y: 99, feats: ["builder", "arrange", "dpi", "png", "sizesU", "bg", "text", "lim150", "nofee", "wm"] },
  { key: "pro", m: 29.99, y: 299, best: true, feats: ["allBasic", "lim500", "nowm", "custom", "support"] },
  { key: "taller", m: 59.99, y: 599, feats: ["all", "limU", "white", "batch", "priority"] },
];
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- textos ---------- */
const L = {
  es: {
    tagline: "Gang sheets DTF para tu tienda", hiM: "Buenos días", hiA: "Buenas tardes", hiN: "Buenas noches",
    welcome: "Te damos la bienvenida a Dekalo. Tus clientes arman sus hojas en tu tienda y tú recibes el archivo listo para imprimir.",
    welcomeDone: "Todo está listo. Aquí tienes tus hojas por imprimir y cómo va tu negocio.",
    progress: "pasos listos", stPend: "Hojas por imprimir", stSold: "Ventas en hojas (30 días)", stFee: "Hojas descargadas este mes", stPlan: "Tu plan",
    feeNote: "2% por hoja vendida", feeNotePro: "1% por hoja · órdenes sin comisión que te quedan:", feeNotePro2: "1% por hoja vendida", noFee: "0% de comisión", limitHit: "Llegaste al límite de hojas de tu plan este mes. Sube de plan para seguir descargando.", needPlan: "Activa tu plan para descargar hojas. Todos tienen 14 días gratis.", unl: "sin límite",
    setupT: "Configura en 3 pasos", setupS: "Toma menos de 5 minutos. Puedes volver aquí cuando quieras.",
    s1: "Crea el producto Gang Sheet", s1t: "Cada variante es un tamaño de hoja con su precio. Puedes cambiar los precios después en Shopify.", s1done: "Producto listo:",
    s2: "Pon el builder en tu tienda", s2t: "Abre el editor de temas con el bloque ya añadido. Solo dale Guardar.", s2b: "Abrir editor de temas",
    s3: "Pruébalo como cliente", s3t: "Arma una hoja de prueba y añádela al carrito.", s3b: "Ver producto en la tienda",
    w: "Ancho (in)", h: "Largo (in)", p: "Precio", create: "Crear producto", creating: "Creando…", addRow: "+ Tamaño", edit: "Editar producto",
    ordersT: "Producción", ordersS: "Tus gang sheets vendidas. Descarga cada hoja a 300 DPI y márcala cuando la imprimas.", kPend: "Hojas por imprimir", kFilm: "Film necesario", kDes: "Diseños por imprimir", fTodo: "Por imprimir", fHecho: "Impresas", search: "Buscar orden #", vGrid: "Cuadrícula", vList: "Lista", stNew: "Nueva", stDown: "Descargada", stPrinted: "Impresa", stShip: "Enviada", mark: "Marcar como impresa", unmark: "Volver a pendiente", markedP: "Hoja marcada como impresa", markedU: "Hoja de vuelta en pendientes", openOrder: "Ver orden en Shopify", allDone: "¡Todo al día!", allDoneS: "No tienes hojas por imprimir. Las nuevas aparecerán aquí.", noneDone: "Todavía no hay hojas impresas", noneDoneS: "Cuando marques una hoja como impresa, aparecerá aquí.", noMatch: "No hay órdenes con ese número", pending: "Pendientes", all: "Todas", refresh: "Actualizar", more: "Cargar más",
    none: "Todavía no hay hojas por imprimir", noneS: "Cuando un cliente compre una gang sheet, aparecerá aquí lista para descargar.",
    designs: "diseños", qty: "Cantidad", download: "Descargar PNG 300 DPI", files: "Archivos", generating: "Generando…", done: "Listo", saveB: "Guardar PNG en tu computadora", focusT: "Mostrando la orden", focusAll: "Ver todas", saveT: "Hoja lista: toca «Guardar PNG» si no se descargó sola",
    corsErr: "No se pudo leer un archivo del pedido. Abre los archivos y descárgalos manualmente.", apiErr: "No se pudo conectar con Shopify:",
    unfulfilled: "Sin preparar", fulfilled: "Preparado", partial: "Parcial", charged: "Comisión",
    helpT: "Preguntas frecuentes", q1: "¿Dónde quedan los archivos de mis clientes?", a1: "Shopify los guarda con cada orden, igual que cualquier archivo subido en la página de producto. Dekalo no los guarda en ningún servidor.",
    q2: "¿Cómo cambio tamaños o precios?", a2: "Edita las variantes del producto Gang Sheet. El nombre de cada variante debe tener la medida, por ejemplo: 22 x 24.",
    q3: "¿Puedo cambiar colores, textos y funciones del builder?", a3: "Sí. En el editor de temas, selecciona el bloque Dekalo Gang Sheet y cambia sus ajustes.",
    q4: "¿Qué formato es el archivo de impresión?", a4: "PNG con fondo transparente a 300 DPI, del tamaño exacto de la hoja, listo para tu software RIP.",
    q5: "¿Dekalo cobra comisión por orden?", a5: "No. Pagas solo tu plan, mensual o anual, y cada plan empieza con 14 días gratis. 0% de comisión en todos los planes. Shopify lo cobra en tu factura de siempre.",
    planT: "Planes", planS: "Shopify cobra en tu factura de siempre. Cambia o cancela cuando quieras.", current: "Tu plan", choose: "Ver y cambiar planes", month: "/mes", year: "/año", save2: "2 meses gratis", trial: "14 días gratis", best: "Más popular",
    payAsYouSell: "Paga solo cuando vendes", nm_free: "Básico", nm_pro: "Pro", nm_taller: "Master",
    f_builder: "Builder en tu página de producto", f_arrange: "Acomodo automático y hoja más barata", f_dpi: "Alertas de calidad (DPI y fondo)", f_png: "PNG 300 DPI listo para imprimir", f_sizesU: "Tamaños de hoja ilimitados", f_bg: "Quitar fondo con un clic", f_text: "Herramienta de texto con fuentes",
    f_fee: "2% por hoja vendida", f_wm: "Marca pequeña «Hecho con Dekalo»", f_allFree: "Todo lo del plan Básico", f_allBasic: "Todo lo del plan Básico", f_lim150: "Hasta 150 hojas al mes", f_lim500: "Hasta 500 hojas al mes", f_limU: "Hojas ilimitadas", f_nofee: "0% de comisión", f_fee1: "1% por hoja vendida", f_free20: "Tus primeras 20 órdenes sin comisión", f_nowm: "Sin marca de agua", f_custom: "Colores y textos personalizados", f_support: "Soporte por email",
    f_all: "Todo lo del plan Pro", f_white: "Marca blanca: sin Dekalo en ningún lado", f_batch: "Descargar todas las hojas pendientes", f_priority: "Soporte prioritario",
    compare: "La competencia cobra 3% a 5% por pedido o más de $100 al mes. Dekalo: 0% de comisión y planes desde $9.99.",
    batch: "Descargar todas", batchOnly: "Descarga en lote: plan Master", contactT: "¿Necesitas ayuda?", contactS: "Escríbenos y te ayudamos con lo que necesites.", contactB: "Escribir a soporte",
  },
  en: {
    tagline: "DTF gang sheets for your store", hiM: "Good morning", hiA: "Good afternoon", hiN: "Good evening",
    welcome: "Welcome to Dekalo. Your customers build their sheets in your store and you get a print-ready file.",
    welcomeDone: "You're all set. Here are your sheets to print and how your business is doing.",
    progress: "steps done", stPend: "Sheets to print", stSold: "Sheet sales (30 days)", stFee: "Sheets downloaded this month", stPlan: "Your plan",
    feeNote: "2% per sheet sold", feeNotePro: "1% per sheet · fee-free orders left:", feeNotePro2: "1% per sheet sold", noFee: "0% fees", limitHit: "You reached your plan\u2019s sheet limit this month. Upgrade to keep downloading.", needPlan: "Activate your plan to download sheets. Every plan has a 14-day free trial.", unl: "unlimited",
    setupT: "Set up in 3 steps", setupS: "Takes less than 5 minutes. Come back anytime.",
    s1: "Create the Gang Sheet product", s1t: "Each variant is a sheet size with its price. You can change prices later in Shopify.", s1done: "Product ready:",
    s2: "Add the builder to your store", s2t: "Opens the theme editor with the block already added. Just click Save.", s2b: "Open theme editor",
    s3: "Test it as a customer", s3t: "Build a test sheet and add it to the cart.", s3b: "View product in store",
    w: "Width (in)", h: "Length (in)", p: "Price", create: "Create product", creating: "Creating…", addRow: "+ Size", edit: "Edit product",
    ordersT: "Production", ordersS: "Your sold gang sheets. Download each sheet at 300 DPI and mark it when printed.", kPend: "Sheets to print", kFilm: "Film needed", kDes: "Designs to print", fTodo: "To print", fHecho: "Printed", search: "Search order #", vGrid: "Grid", vList: "List", stNew: "New", stDown: "Downloaded", stPrinted: "Printed", stShip: "Shipped", mark: "Mark as printed", unmark: "Back to pending", markedP: "Sheet marked as printed", markedU: "Sheet back in pending", openOrder: "Open order in Shopify", allDone: "All caught up!", allDoneS: "No sheets to print. New ones will show up here.", noneDone: "No printed sheets yet", noneDoneS: "When you mark a sheet as printed, it shows up here.", noMatch: "No orders with that number", pending: "Pending", all: "All", refresh: "Refresh", more: "Load more",
    none: "No sheets to print yet", noneS: "When a customer buys a gang sheet, it will show up here ready to download.",
    designs: "designs", qty: "Quantity", download: "Download 300 DPI PNG", files: "Files", generating: "Generating…", done: "Done", saveB: "Save PNG to your computer", focusT: "Showing order", focusAll: "See all", saveT: "Sheet ready: tap «Save PNG» if it didn't download",
    corsErr: "Couldn't read a file from the order. Open the files and download them manually.", apiErr: "Couldn't connect to Shopify:",
    unfulfilled: "Unfulfilled", fulfilled: "Fulfilled", partial: "Partial", charged: "Fee",
    helpT: "FAQ", q1: "Where are my customers' files stored?", a1: "Shopify stores them with each order, like any file uploaded on a product page. Dekalo doesn't store them on any server.",
    q2: "How do I change sizes or prices?", a2: "Edit the Gang Sheet product variants. Each variant name must include the size, for example: 22 x 24.",
    q3: "Can I change the builder's colors, texts and features?", a3: "Yes. In the theme editor, select the Dekalo Gang Sheet block and change its settings.",
    q4: "What format is the print file?", a4: "Transparent PNG at 300 DPI, at the exact sheet size, ready for your RIP software.",
    q5: "Does Dekalo charge a fee per order?", a5: "No. You only pay your plan, monthly or yearly, and every plan starts with a 14-day free trial. 0% fees on every plan. Shopify bills it on your usual invoice.",
    planT: "Plans", planS: "Shopify bills you on your usual invoice. Change or cancel anytime.", current: "Your plan", choose: "View and change plans", month: "/mo", year: "/yr", save2: "2 months free", trial: "14-day free trial", best: "Most popular",
    payAsYouSell: "Pay only when you sell", nm_free: "Basic", nm_pro: "Pro", nm_taller: "Master",
    f_builder: "Builder on your product page", f_arrange: "Auto-arrange and cheapest sheet", f_dpi: "Quality alerts (DPI and background)", f_png: "Print-ready 300 DPI PNG", f_sizesU: "Unlimited sheet sizes", f_bg: "One-click background removal", f_text: "Text tool with fonts",
    f_fee: "2% per sheet sold", f_wm: "Small «Made with Dekalo» badge", f_allFree: "Everything in Basic", f_allBasic: "Everything in Basic", f_lim150: "Up to 150 sheets a month", f_lim500: "Up to 500 sheets a month", f_limU: "Unlimited sheets", f_nofee: "0% fees", f_fee1: "1% per sheet sold", f_free20: "Your first 20 orders fee-free", f_nowm: "No watermark", f_custom: "Custom colors and texts", f_support: "Email support",
    f_all: "Everything in Pro", f_white: "White label: no Dekalo anywhere", f_batch: "Download all pending sheets", f_priority: "Priority support",
    compare: "Other apps charge 3% to 5% per order or over $100 a month. Dekalo: 0% fees and plans from $9.99.",
    batch: "Download all", batchOnly: "Batch download: Master plan", contactT: "Need help?", contactS: "Write to us and we'll help with anything you need.", contactB: "Contact support",
  },
};
const LS = (() => { try { return window["local" + "Storage"]; } catch (e) { return null; } })();
const savedLang = (() => { try { return LS.getItem("dekalo_lang"); } catch (e) { return null; } })();
let lang = savedLang || ((new URLSearchParams(location.search).get("locale") || "es").slice(0, 2) === "en" ? "en" : "es");
const t = (k) => L[lang][k] ?? k;

/* ---------- Shopify ---------- */
const SB = () => window.shopify;
const shopDomain = () => SB()?.config?.shop || "";
const apiKey = () => SB()?.config?.apiKey || document.querySelector('meta[name="shopify-api-key"]')?.content || "";
async function gql(query, variables = {}) {
  const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(Array.isArray(j.errors) ? j.errors.map((e) => e.message).join("; ") : String(j.errors));
  return j.data;
}
const numId = (gid) => String(gid).split("/").pop();
const goAdmin = (path) => window.open(`shopify://admin/${path}`, "_top");
const toast = (m, err) => { try { SB()?.toast?.show(m, { isError: !!err }); } catch (e) {} };
const money = (v, cur) => { try { return new Intl.NumberFormat(lang === "es" ? "es-PR" : "en-US", { style: "currency", currency: cur || currency || "USD" }).format(+v); } catch (e) { return "$" + (+v).toFixed(2); } };

/* ---------- estado ---------- */
const DEF_SIZES = [{ w: 22, h: 12, p: 7 }, { w: 22, h: 24, p: 12 }, { w: 22, h: 36, p: 17 }, { w: 22, h: 48, p: 22 }, { w: 22, h: 60, p: 27 }, { w: 22, h: 120, p: 50 }];
let sizes = DEF_SIZES.map((s) => ({ ...s }));
let product = null, currency = "USD", shopName = "", ownerName = "", themeDone = false;
let plan = "free", instId = null, billed = {}, subActive = false;

/* ---------- bienvenida ---------- */
function greeting() { const h = new Date().getHours(); return h < 12 ? t("hiM") : h < 19 ? t("hiA") : t("hiN"); }
function stepsDone() { return (product ? 1 : 0) + (themeDone ? 1 : 0) + (sheets.length ? 1 : 0); }
function proFreeLeft() { return Math.max(0, PRO_FREE_ORDERS - (billed._proFree || []).length); }
function usedThisMonth() { const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0); return Object.values(typeof prod === "object" ? prod : {}).filter((e) => (e.d || 0) >= +m).length; }
function monthFee() { const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0); return Object.values(billed).filter((b) => b.t >= +m).reduce((a, b) => a + b.f, 0); }
function renderWelcome() {
  const done = stepsDone(), pct = Math.round(done / 3 * 100);
  const pend = sheets.filter(isPending).length;
  const since = Date.now() - 30 * 864e5;
  const sold = sheets.filter((s) => +new Date(s.ord.createdAt) >= since).reduce((a, s) => a + s.total, 0);
  const first = (ownerName || "").split(" ")[0];
  $("welcome").innerHTML = `<div class="hero-in">
    <div class="hero-txt"><div class="eyebrow">${esc(shopName || "Dekalo")}</div>
      <h1>${greeting()}${first ? ", " + esc(first) : ""}</h1>
      <p>${done === 3 ? t("welcomeDone") : t("welcome")}</p></div>
    <div class="ring" style="--p:${pct}"><div><b>${done}/3</b><span>${t("progress")}</span></div></div></div>
   <div class="stats">
    <div class="stat"><span>${t("stPend")}</span><b>${pend}</b></div>
    <div class="stat"><span>${t("stSold")}</span><b>${money(sold)}</b></div>
    <div class="stat"><span>${t("stFee")}</span><b>${usedThisMonth()}${isFinite(LIMITS[plan]) ? " / " + LIMITS[plan] : ""}</b><i>${isFinite(LIMITS[plan]) ? t("noFee") : t("unl") + " · " + t("noFee")}</i></div>
    <div class="stat"><span>${t("stPlan")}</span><b>${t("nm_" + plan)}</b><a href="#plan" class="lnk" id="seePlans">${t("choose")} →</a></div>
   </div>`;
}

/* ---------- configuración ---------- */
async function loadSetup() {
  try {
    const d = await gql(`query{shop{name currencyCode shopOwnerName} products(first:1,query:"tag:${TAG}"){nodes{id title handle onlineStoreUrl status templateSuffix variants(first:30){nodes{title price}}}}}`);
    currency = d.shop.currencyCode; shopName = d.shop.name; ownerName = d.shop.shopOwnerName || "";
    product = d.products.nodes[0] || null;
  } catch (e) { showErr(e); product = null; }
  try { themeDone = LS.getItem("dekalo_theme_" + shopDomain()) === "1"; } catch (e) {}
  renderSetup(); renderWelcome();
}
function renderSetup() {
  const st1 = !!product, done = stepsDone();
  const prodUrl = product ? (product.onlineStoreUrl || `https://${shopDomain()}/products/${product.handle}`) : "";
  const step = (n, ok, title, body) => `<div class="step ${ok ? "done" : ""}"><span class="num">${ok ? "✓" : n}</span><div class="body"><b>${title}</b>${body}</div></div>`;
  $("setup").innerHTML = `<div class="sec-h"><div><h2>${t("setupT")}</h2><p class="sub">${t("setupS")}</p></div><span class="pill">${done}/3</span></div>
   <div class="bar"><i style="width:${Math.round(done / 3 * 100)}%"></i></div><div class="steps">
   ${step(1, st1, t("s1"), st1 ? `<div class="txt">${t("s1done")} <strong>${esc(product.title)}</strong> · ${product.variants.nodes.map((v) => `${esc(v.title)} ${money(v.price)}`).join(" · ")}</div><div class="row"><button class="btn" id="editProd">${t("edit")}</button></div>`
     : `<div class="txt">${t("s1t")}</div><table><tr><th>${t("w")}</th><th>${t("h")}</th><th>${t("p")}</th><th></th></tr>${sizes.map((s, i) => `<tr><td><input type="number" step="0.5" min="1" data-i="${i}" data-k="w" value="${s.w}"></td><td><input type="number" min="1" data-i="${i}" data-k="h" value="${s.h}"></td><td><input type="number" step="0.5" min="0" data-i="${i}" data-k="p" value="${s.p}"></td><td><button class="btn ghost" data-del="${i}" aria-label="x">✕</button></td></tr>`).join("")}</table>
       <div class="row"><button class="btn" id="addRow">${t("addRow")}</button><button class="btn pri" id="createProd">${t("create")}</button></div>`)}
   ${step(2, themeDone, t("s2"), `<div class="txt">${t("s2t")}</div><div class="row"><button class="btn ${st1 && !themeDone ? "pri" : ""}" id="openTheme">${t("s2b")}</button></div>`)}
   ${step(3, sheets.length > 0, t("s3"), `<div class="txt">${t("s3t")}</div><div class="row"><a class="btn" id="viewProd" ${st1 ? `href="${esc(prodUrl)}" target="_blank" rel="noopener"` : "aria-disabled=true"}>${t("s3b")} ↗</a></div>`)}</div>`;
  const tb = $("setup").querySelector("table");
  if (tb) {
    tb.oninput = (e) => { const d = e.target.dataset; if (d.k) sizes[+d.i][d.k] = +e.target.value; };
    tb.onclick = (e) => { const i = e.target.dataset.del; if (i !== undefined && sizes.length > 1) { sizes.splice(+i, 1); renderSetup(); } };
    $("addRow").onclick = () => { const l = sizes[sizes.length - 1]; sizes.push({ w: l.w, h: l.h + 12, p: l.p + 5 }); renderSetup(); };
    $("createProd").onclick = createProduct;
  }
  if ($("editProd")) $("editProd").onclick = () => goAdmin(`products/${numId(product.id)}`);
  $("openTheme").onclick = () => {
    try { LS.setItem("dekalo_theme_" + shopDomain(), "1"); } catch (e) {}
    const tpl = product && product.templateSuffix ? `product.${product.templateSuffix}` : "product";
    const url = `https://${shopDomain()}/admin/themes/current/editor?template=${tpl}&addAppBlockId=${encodeURIComponent(apiKey())}/${BLOCK}&target=mainSection`;
    window.open(url, "_top");
  };
}
async function createProduct() {
  const b = $("createProd"); b.disabled = true; b.textContent = t("creating");
  const clean = sizes.filter((s) => s.w > 0 && s.h > 0).sort((a, b) => a.w * a.h - b.w * b.h);
  const names = clean.map((s) => `${s.w} x ${s.h}`);
  const optName = lang === "es" ? "Tamaño" : "Size";
  try {
    const d = await gql(`mutation($input:ProductSetInput!){productSet(synchronous:true,input:$input){product{id} userErrors{field message}}}`, {
      input: {
        title: "DTF Gang Sheet", status: "ACTIVE", productType: "DTF Gang Sheet", tags: [TAG],
        descriptionHtml: lang === "es" ? "<p>Arma tu gang sheet: sube tus diseños y los acomodamos para ahorrar film.</p>" : "<p>Build your gang sheet: upload your designs and we arrange them to save film.</p>",
        productOptions: [{ name: optName, values: names.map((n) => ({ name: n })) }],
        variants: clean.map((s, i) => ({ optionValues: [{ optionName: optName, name: names[i] }], price: (+s.p).toFixed(2), inventoryPolicy: "CONTINUE" })),
      },
    });
    const errs = d.productSet.userErrors;
    if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    await publishOnline(d.productSet.product.id);
    toast(t("s1done") + " DTF Gang Sheet");
    await loadSetup();
  } catch (e) { showErr(e); b.disabled = false; b.textContent = t("create"); }
}
/* Publica el producto en la Tienda online para que se vea en la tienda (no solo en el admin). */
async function publishOnline(productId) {
  try {
    const p = await gql(`query{publications(first:20){nodes{id name catalog{title}}}}`);
    const pubs = p.publications.nodes;
    const online = pubs.find((x) => /online store|tienda online/i.test(x.name || (x.catalog && x.catalog.title) || "")) || pubs[0];
    if (!online) return;
    const r = await gql(`mutation($id:ID!,$in:[PublicationInput!]!){publishablePublish(id:$id,input:$in){userErrors{message}}}`, { id: productId, in: [{ publicationId: online.id }] });
    const e = r.publishablePublish.userErrors; if (e.length) console.warn("Dekalo publish:", e);
  } catch (e) { console.warn("Dekalo: no se pudo publicar en la Tienda online", e); }
}

/* ---------- planes (Shopify App Pricing, sin servidor) ---------- */
async function loadPlan() {
  try {
    const d = await gql(`query{currentAppInstallation{id activeSubscriptions{name status} billed:metafield(namespace:"dekalo",key:"billed"){value}}}`);
    const inst = d.currentAppInstallation; instId = inst.id;
    try { billed = JSON.parse(inst.billed?.value || "{}") || {}; } catch (e) { billed = {}; }
    const sub = (inst.activeSubscriptions || []).find((s) => s.status === "ACTIVE");
    subActive = !!sub;
    const n = (sub?.name || "").toLowerCase();
    plan = /taller|shop|studio|master/.test(n) ? "taller" : /pro/.test(n) ? "pro" : "free";
    // Guarda el plan en un dato oculto de la app (app-data metafield) que el tema lee para la marca de agua.
    const r = await gql(`mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}`,
      { m: [{ ownerId: inst.id, namespace: "dekalo", key: "plan", type: "single_line_text_field", value: plan }] });
    if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map((e) => e.message).join("; "));
  } catch (e) { showErr(e); }
  renderPlan(); renderWelcome(); renderOrders(false);
}
function renderPlan() {
  const store = shopDomain().replace(".myshopify.com", "");
  $("plan").innerHTML = `<div class="sec-h"><div><h2>${t("planT")}</h2><p class="sub">${t("planS")}</p></div></div>
   <div class="plans">${PLANS.map((p) => `<div class="pl ${p.key === plan ? "on" : ""} ${p.best ? "best" : ""}">
     <div class="pl-h"><b>${t("nm_" + p.key)}</b>${p.key === plan ? `<span class="tag ok">${t("current")}</span>` : p.best ? `<span class="tag dark">${t("best")}</span>` : ""}</div>
     <div class="pl-p">${p.m ? `<span class="big">$${p.m}</span>${t("month")}<div class="mu">$${p.y}${t("year")} · ${t("save2")}</div>` : `<span class="big">$0</span>${t("month")}<div class="mu">${t("payAsYouSell")}</div>`}</div>
     <div class="tag" style="margin-bottom:10px">${t("trial")}</div>
     <ul>${p.feats.map((f) => `<li class="${f === "wm" || f === "fee" ? "neg" : ""}">${t("f_" + f)}</li>`).join("")}</ul></div>`).join("")}</div>
   <div class="compare">${t("compare")}</div>
   <div class="row" style="margin-top:12px"><button class="btn pri" id="changePlan">${t("choose")}</button></div>`;
  $("changePlan").onclick = () => window.open(`https://admin.shopify.com/store/${store}/charges/${APP_HANDLE}/pricing_plans`, "_top");
}
async function exportAll(btn) {
  if (plan !== "taller") { toast(t("batchOnly"), true); return; }
  btn.disabled = true;
  for (let i = 0; i < sheets.length; i++) { const b = document.querySelector(`[data-dl="${i}"]`); if (b) await exportSheet(i, b); }
  btn.disabled = false;
}

/* ---------- comisión del plan Gratis (sin servidor) ----------
 * Se cobra una sola vez por hoja, cuando el taller la descarga para imprimir.
 * El registro vive en un metafield de la instalación de la app (lo ve solo esta app).
 * Si hay un puente de cobro configurado (USAGE_ENDPOINT), se envía el evento a Shopify App Pricing. */
async function chargeSheet(s) {
  const rate = RATES[plan] || 0;
  if (!rate || !instId || billed[s.li.id]) return;
  let fee = Math.max(0, s.total * rate);
  if (plan === "pro") { const L = billed._proFree || (billed._proFree = []); if (L.includes(s.ord.id)) fee = 0; else if (L.length < PRO_FREE_ORDERS) { L.push(s.ord.id); fee = 0; } }
  billed[s.li.id] = { f: Math.round(fee * 100) / 100, t: Date.now(), o: s.ord.id };
  const cut = Date.now() - 120 * 864e5; for (const k in billed) if (billed[k].t < cut) delete billed[k];
  try {
    await gql(`mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}`,
      { m: [{ ownerId: instId, namespace: "dekalo", key: "billed", type: "json", value: JSON.stringify(billed) }] });
    if (USAGE_ENDPOINT && fee > 0) {
      const tok = await SB().idToken();
      await fetch(USAGE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify({ line: numId(s.li.id), cents: Math.round(fee * 100) }) });
    }
  } catch (e) { console.warn("Dekalo: comisión no registrada", e); }
  renderWelcome(); renderOrders(false);
}

/* ---------- producción (órdenes con gang sheets) ---------- */
const ready = {};
let focusOrder = null, focusLi = null, autoDone = false;
try { const u = new URLSearchParams(location.search); focusOrder = u.get("order"); focusLi = u.get("li"); } catch (e) {}
let filter = "todo", cursor = null, sheets = [], view = "grid", query = "", prod = {}, prodLoaded = false;
const isPrinted = (s) => !!(prod[s.li.id] && prod[s.li.id].p) || s.ord.displayFulfillmentStatus === "FULFILLED";
const isPending = (s) => !isPrinted(s);
const ICO = {
  dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
  ok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  ext: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></svg>',
  ref: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></svg>',
};
function ago(d) {
  const m = Math.round((Date.now() - +new Date(d)) / 6e4);
  try {
    const rtf = new Intl.RelativeTimeFormat(lang === "es" ? "es" : "en", { numeric: "auto" });
    if (m < 60) return rtf.format(-Math.max(m, 1), "minute");
    const h = Math.round(m / 60); if (h < 24) return rtf.format(-h, "hour");
    const dd = Math.round(h / 24); if (dd < 30) return rtf.format(-dd, "day");
  } catch (e) {}
  return new Date(d).toLocaleDateString(lang === "es" ? "es-PR" : "en-US", { day: "numeric", month: "short", year: "numeric" });
}
const fmtLen = (inch) => (inch >= 12 ? `${(inch / 12).toFixed(1)} ft` : `${Math.round(inch)} in`);
async function loadProd() {
  try { const d = await gql(`query{currentAppInstallation{prod:metafield(namespace:"dekalo",key:"prod"){value}}}`); prod = JSON.parse(d.currentAppInstallation.prod?.value || "{}") || {}; } catch (e) { prod = {}; }
  prodLoaded = true;
}
async function saveProd() {
  if (!instId) return;
  const cut = Date.now() - 180 * 864e5; for (const k in prod) if (Math.max(prod[k].p || 0, prod[k].d || 0) < cut) delete prod[k];
  try { await gql(`mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}`, { m: [{ ownerId: instId, namespace: "dekalo", key: "prod", type: "json", value: JSON.stringify(prod) }] }); } catch (e) { console.warn("Dekalo prod", e); }
}
function markProd(s, k, on = true) {
  const e = prod[s.li.id] || (prod[s.li.id] = {}); if (on) e[k] = Date.now(); else delete e[k];
  saveProd(); renderOrders(false); renderWelcome();
  if (k === "p") toast(on ? t("markedP") : t("markedU"));
}
async function loadOrders(reset = true) {
  if (reset) { cursor = null; sheets = []; renderOrders(true); if (!prodLoaded) await loadProd(); }
  try {
    const d = await gql(`query($c:String){orders(first:50,after:$c,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor} nodes{id name createdAt displayFulfillmentStatus lineItems(first:50){nodes{id name variantTitle quantity originalTotalSet{shopMoney{amount}} customAttributes{key value}}}}}}`, { c: cursor });
    const o = d.orders;
    for (const ord of o.nodes) for (const li of ord.lineItems.nodes) {
      const attrs = Object.fromEntries((li.customAttributes || []).map((a) => [a.key, a.value]));
      if (!attrs._layout) continue;
      let lay; try { lay = JSON.parse(attrs._layout); } catch (e) { continue; }
      sheets.push({ ord, li, lay, files: attrs, total: +(li.originalTotalSet?.shopMoney?.amount || 0) });
    }
    cursor = o.pageInfo.hasNextPage ? o.pageInfo.endCursor : null;
  } catch (e) { showErr(e); }
  renderOrders(false); renderWelcome(); renderSetup(); autoFocus();
}
function autoFocus() {
  if (!focusOrder || autoDone) return;
  const idx = sheets.map((s, i) => [s, i]).filter(([s]) => numId(s.ord.id) === focusOrder && (!focusLi || numId(s.li.id) === focusLi)).map(([, i]) => i);
  if (!idx.length) { if (cursor) loadOrders(false); return; }
  autoDone = true; $("orders").scrollIntoView({ behavior: "smooth", block: "start" });
  (async () => { for (const i of idx) { const b = document.querySelector(`[data-dl="${i}"]`); if (b) await exportSheet(i, b); } })();
}
function statusOf(s) {
  const p = prod[s.li.id] || {};
  if (s.ord.displayFulfillmentStatus === "FULFILLED") return ["ok", t("stShip")];
  if (p.p) return ["ok", t("stPrinted")];
  if (p.d) return ["", t("stDown")];
  return ["wa", t("stNew")];
}
function visible() {
  const q = query.trim().toLowerCase().replace("#", "");
  return sheets.map((s, i) => [s, i]).filter(([s]) => focusOrder ? numId(s.ord.id) === focusOrder : (filter === "todo" ? isPending(s) : filter === "hecho" ? isPrinted(s) : true) && (!q || s.ord.name.toLowerCase().replace("#", "").includes(q)));
}
function renderOrders(loading) {
  const el = $("orders"); if (!el) return;
  const pend = sheets.filter(isPending);
  const filmIn = pend.reduce((a, s) => a + (+s.lay.s[1] || 0) * s.li.quantity, 0);
  const nDes = pend.reduce((a, s) => a + s.lay.i.length * s.li.quantity, 0);
  const vis = loading ? [] : visible();
  const empty = !sheets.length ? [t("none"), t("noneS")] : filter === "todo" ? [t("allDone"), t("allDoneS")] : filter === "hecho" ? [t("noneDone"), t("noneDoneS")] : [t("noMatch"), ""];
  el.innerHTML = `<div class="sec-h"><div><h2>${t("ordersT")}</h2><p class="sub">${t("ordersS")}</p></div>${pend.length > 1 ? `<button class="btn ${plan === "taller" ? "pri" : ""}" id="batchBtn" title="${t("batchOnly")}">${ICO.dl} ${t("batch")} (${pend.length})${plan === "taller" ? "" : " 🔒"}</button>` : ""}</div>
   <div class="kpis"><div><span>${t("kPend")}</span><b>${pend.length}</b></div><div><span>${t("kFilm")}</span><b>${fmtLen(filmIn)}</b></div><div><span>${t("kDes")}</span><b>${nDes}</b></div></div>
   ${focusOrder ? `<div class="focus">${t("focusT")} <b>${esc((sheets.find((s) => numId(s.ord.id) === focusOrder) || { ord: { name: "#" + focusOrder } }).ord.name)}</b> · <a href="#" id="allOrders">${t("focusAll")}</a></div>` : ""}
   <div class="toolbar"><div class="seg" id="fseg">${[["todo", `${t("fTodo")} <em>${pend.length}</em>`], ["hecho", t("fHecho")], ["all", t("all")]].map(([k, l]) => `<button data-f="${k}" class="${filter === k ? "on" : ""}">${l}</button>`).join("")}</div>
     <label class="search">${ICO.search}<input id="q" type="search" placeholder="${t("search")}" value="${esc(query)}" autocomplete="off"></label><span class="sp"></span>
     <div class="seg ic" id="vseg"><button data-v="grid" class="${view === "grid" ? "on" : ""}" title="${t("vGrid")}" aria-label="${t("vGrid")}">${ICO.grid}</button><button data-v="list" class="${view === "list" ? "on" : ""}" title="${t("vList")}" aria-label="${t("vList")}">${ICO.list}</button></div>
     <button class="btn icon" id="refresh" title="${t("refresh")}" aria-label="${t("refresh")}">${ICO.ref}</button></div>
   ${loading ? `<div class="grid"><div class="skc"></div><div class="skc"></div><div class="skc"></div></div>`
     : vis.length ? (view === "grid" ? `<div class="grid">${vis.map(([s, i]) => sheetCard(s, i)).join("")}</div>` : `<div class="list">${vis.map(([s, i]) => sheetRow(s, i)).join("")}</div>`)
     : `<div class="empty"><div class="empty-ic">${filter === "todo" && sheets.length ? ICO.ok : '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="13" height="13" rx="2"/><rect x="8" y="8" width="13" height="13" rx="2"/></svg>'}</div><b>${empty[0]}</b>${empty[1]}</div>`}
   ${!loading && cursor ? `<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="more">${t("more")}</button></div>` : ""}`;
  $("fseg").onclick = (e) => { const b = e.target.closest("[data-f]"); if (b && b.dataset.f !== filter) { filter = b.dataset.f; renderOrders(false); } };
  $("vseg").onclick = (e) => { const b = e.target.closest("[data-v]"); if (b && b.dataset.v !== view) { view = b.dataset.v; try { LS.setItem("dekalo_view", view); } catch (er) {} renderOrders(false); } };
  $("q").oninput = (e) => { query = e.target.value; const pos = e.target.selectionStart; renderOrders(false); const q = $("q"); q.focus(); try { q.setSelectionRange(pos, pos); } catch (er) {} };
  $("refresh").onclick = () => loadOrders();
  if ($("allOrders")) $("allOrders").onclick = (e) => { e.preventDefault(); focusOrder = null; renderOrders(false); };
  if ($("batchBtn")) $("batchBtn").onclick = (e) => exportAll(e.currentTarget);
  if ($("more")) $("more").onclick = () => loadOrders(false);
  if (!loading) vis.forEach(([s, i]) => drawPreview(s, i));
}
function thumbs(s) {
  const keys = [...new Set(s.lay.i.map((x) => x.f))];
  return `<div class="thumbs">${keys.slice(0, 5).map((k) => { const u = s.files[k] || ""; return `<a href="${esc(u || "#")}" target="_blank" rel="noopener" title="${esc(k)}">${u ? `<img src="${esc(u)}" alt="${esc(k)}" loading="lazy">` : ""}</a>`; }).join("")}${keys.length > 5 ? `<span>+${keys.length - 5}</span>` : ""}</div>`;
}
function sheetCard(s, i) {
  const [w, h] = s.lay.s; const b = billed[s.li.id]; const st = statusOf(s); const pr = isPrinted(s);
  return `<div class="sheet ${pr ? "done" : ""}"><div class="pv"><canvas id="pv${i}"></canvas><span class="chip">${w}×${h} in</span>${s.li.quantity > 1 ? `<span class="chip q">×${s.li.quantity}</span>` : ""}</div>
   <div class="meta"><div class="t"><a href="#" data-order="${numId(s.ord.id)}">${esc(s.ord.name)}</a><span class="tag ${st[0]}">${st[1]}</span></div>
   <div class="mu">${ago(s.ord.createdAt)} · ${s.lay.i.length} ${t("designs")} · ${money(s.total)}${b ? ` · ${t("charged")} ${money(b.f)}` : ""}</div>
   ${thumbs(s)}
   <div class="prog" id="pg${i}"><i></i></div><div class="err" id="er${i}"></div>${saveLink(s)}
   <div class="acts"><button class="btn pri grow" data-dl="${i}">${ICO.dl} ${t("download")}</button><button class="btn icon ${pr ? "on" : ""}" data-pr="${i}" title="${pr ? t("unmark") : t("mark")}" aria-label="${pr ? t("unmark") : t("mark")}">${ICO.ok}</button><button class="btn icon" data-order="${numId(s.ord.id)}" title="${t("openOrder")}" aria-label="${t("openOrder")}">${ICO.ext}</button></div></div></div>`;
}
function sheetRow(s, i) {
  const [w, h] = s.lay.s; const st = statusOf(s); const pr = isPrinted(s);
  return `<div class="lrow ${pr ? "done" : ""}"><div class="lpv"><canvas id="pv${i}"></canvas></div>
   <div class="lmain"><a href="#" data-order="${numId(s.ord.id)}">${esc(s.ord.name)}</a><span class="mu">${w}×${h} in${s.li.quantity > 1 ? ` ×${s.li.quantity}` : ""} · ${s.lay.i.length} ${t("designs")} · ${ago(s.ord.createdAt)}</span></div>
   <span class="tag ${st[0]}">${st[1]}</span>
   <button class="btn pri" data-dl="${i}">${ICO.dl}<span class="hide-s">${t("download")}</span></button>
   <button class="btn icon ${pr ? "on" : ""}" data-pr="${i}" title="${pr ? t("unmark") : t("mark")}" aria-label="${pr ? t("unmark") : t("mark")}">${ICO.ok}</button>
   <div class="prog" id="pg${i}"><i></i></div><div class="err" id="er${i}"></div>${saveLink(s)}</div>`;
}
function saveLink(s) { const r = ready[s.li.id]; return r ? `<a class="btn ok-save" href="${r.url}" download="${esc(r.name)}">${ICO.dl} ${t("saveB")}</a>` : ""; }
document.addEventListener("click", (e) => {
  const o = e.target.closest("[data-order]"); if (o) { e.preventDefault(); goAdmin(`orders/${o.dataset.order}`); return; }
  const d = e.target.closest("[data-dl]"); if (d) { exportSheet(+d.dataset.dl, d); return; }
  const p = e.target.closest("[data-pr]"); if (p) { const s = sheets[+p.dataset.pr]; markProd(s, "p", !(prod[s.li.id] && prod[s.li.id].p)); return; }
  if (e.target.closest("#seePlans")) { e.preventDefault(); $("plan").scrollIntoView({ behavior: "smooth" }); }
});
try { view = LS.getItem("dekalo_view") || "grid"; } catch (e) {}

/* ---------- motor de render ---------- */
const imgCache = new Map();
function loadImg(url) {
  if (!imgCache.has(url)) imgCache.set(url, new Promise((res, rej) => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => res(im); im.onerror = () => rej(new Error("img")); im.src = url; }));
  return imgCache.get(url);
}
async function imagesFor(s) { const out = {}; for (const k of new Set(s.lay.i.map((x) => x.f))) { const u = s.files[k]; if (!u) throw new Error("missing " + k); out[k] = await loadImg(u.startsWith("//") ? "https:" + u : u); } return out; }
function bbox(it) { const a = (it.r || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); const bw = it.w * c + it.h * s, bh = it.w * s + it.h * c; return { y: it.y - bh / 2, h: bh }; }
function drawItem(ctx, it, img, sc) { ctx.save(); ctx.translate(it.x * sc, it.y * sc); ctx.rotate((it.r || 0) * Math.PI / 180); ctx.scale(it.fx ? -1 : 1, it.fy ? -1 : 1); ctx.drawImage(img, -it.w * sc / 2, -it.h * sc / 2, it.w * sc, it.h * sc); ctx.restore(); }
async function drawPreview(s, i) {
  const c = $("pv" + i); if (!c) return; const [w, h] = s.lay.s; const sc = Math.min(280 / w, 300 / h); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
  const x = c.getContext("2d");
  try { const imgs = await imagesFor(s); for (const it of s.lay.i) drawItem(x, it, imgs[it.f], sc); }
  catch (e) { x.fillStyle = "#ddd"; for (const it of s.lay.i) { x.save(); x.translate(it.x * sc, it.y * sc); x.rotate((it.r || 0) * Math.PI / 180); x.fillRect(-it.w * sc / 2, -it.h * sc / 2, it.w * sc, it.h * sc); x.restore(); } }
}
const CRC = (() => { const T = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; } return T; })();
const crc32 = (ps) => { let c = -1; for (const p of ps) for (let i = 0; i < p.length; i++) c = CRC[(c ^ p[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const u32 = (v) => new Uint8Array([(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]);
const chunk = (ty, d) => { const b = new TextEncoder().encode(ty); return [u32(d.length), b, d, u32(crc32([b, d]))]; };
async function encodePNG(W, H, dpi, stripH, strip, prog) {
  const cs = new CompressionStream("deflate"), w = cs.writable.getWriter(), r = cs.readable.getReader(), parts = [];
  const pump = (async () => { for (;;) { const x = await r.read(); if (x.done) break; parts.push(x.value); } })();
  const RL = W * 4 + 1;
  for (let y = 0; y < H; y += stripH) { const h = Math.min(stripH, H - y); const d = await strip(y, h); const raw = new Uint8Array(RL * h); for (let i = 0; i < h; i++) raw.set(d.subarray(i * W * 4, (i + 1) * W * 4), i * RL + 1); await w.write(raw); prog((y + h) / H); await new Promise((z) => setTimeout(z)); }
  await w.close(); await pump;
  const ih = new Uint8Array(13); ih.set(u32(W)); ih.set(u32(H), 4); ih[8] = 8; ih[9] = 6;
  const pm = Math.round(dpi / 0.0254), ph = new Uint8Array(9); ph.set(u32(pm)); ph.set(u32(pm), 4); ph[8] = 1;
  const out = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), ...chunk("IHDR", ih), ...chunk("pHYs", ph)];
  for (const p of parts) out.push(...chunk("IDAT", p));
  out.push(...chunk("IEND", new Uint8Array(0)));
  return new Blob(out, { type: "image/png" });
}
async function exportSheet(i, btn) {
  const s = sheets[i]; const pg = $("pg" + i), bar = pg.querySelector("i"), er = $("er" + i); er.textContent = "";
  if (PLANS_LIVE && !subActive) { er.textContent = t("needPlan"); toast(t("needPlan"), true); return; }
  if (!(prod[s.li.id] && prod[s.li.id].d) && usedThisMonth() >= LIMITS[plan]) { er.textContent = t("limitHit"); toast(t("limitHit"), true); return; }
  btn.disabled = true; const old = btn.textContent; btn.textContent = t("generating"); pg.classList.add("show"); bar.style.width = "0";
  try {
    const imgs = await imagesFor(s);
    const dpi = 300, [w, h] = s.lay.s, W = Math.round(w * dpi), H = Math.round(h * dpi), sh = Math.max(16, Math.min(1024, Math.floor(16e6 / W)));
    const cv = document.createElement("canvas"); cv.width = W; cv.height = sh; const x = cv.getContext("2d", { willReadFrequently: true }); x.imageSmoothingQuality = "high";
    const B = s.lay.i.map((it) => [it, bbox(it)]);
    const blob = await encodePNG(W, H, dpi, sh, async (y0, hh) => {
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, sh);
      for (const [it, b] of B) { if ((b.y + b.h) * dpi < y0 || b.y * dpi > y0 + hh) continue; x.setTransform(1, 0, 0, 1, 0, -y0); drawItem(x, it, imgs[it.f], dpi); }
      x.setTransform(1, 0, 0, 1, 0, 0); return x.getImageData(0, 0, W, hh).data;
    }, (p) => { bar.style.width = Math.round(p * 100) + "%"; });
    const name = `${s.ord.name.replace(/[^\w-]/g, "")}_${w}x${h}in_300dpi${s.li.quantity > 1 ? "_x" + s.li.quantity : ""}.png`;
    const url = URL.createObjectURL(blob); if (ready[s.li.id]) URL.revokeObjectURL(ready[s.li.id].url); ready[s.li.id] = { url, name };
    try { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (er2) {}
    toast(t("saveT"));
    chargeSheet(s);
    markProd(s, "d");
  } catch (e) {
    er.textContent = e && e.message === "img" ? t("corsErr") : (e.message || String(e));
    $("fl" + i)?.classList.add("show");
  } finally { btn.disabled = false; btn.textContent = old; setTimeout(() => pg.classList.remove("show"), 800); }
}

/* ---------- ayuda ---------- */
function renderHelp() {
  $("help").innerHTML = `<div class="help-grid"><div><h2>${t("helpT")}</h2>${[1, 2, 3, 4, 5].map((n) => `<details><summary>${t("q" + n)}</summary><p>${t("a" + n)}</p></details>`).join("")}</div>
   <div class="contact"><div class="logo sm">${LOGO}</div><b>${t("contactT")}</b><p>${t("contactS")}</p><a class="btn" href="mailto:info@neroillusion.com?subject=Dekalo" target="_blank" rel="noopener">${t("contactB")}</a></div></div>`;
}
function showErr(e) { $("banner").innerHTML = `<div class="banner err">${t("apiErr")} ${esc(e.message || e)}</div>`; }
const LOGO = document.querySelector(".logo")?.innerHTML || "";

/* ---------- inicio ---------- */
function renderAll() { $("tagline").textContent = t("tagline"); $("langBtn").textContent = lang === "es" ? "EN" : "ES"; document.documentElement.lang = lang; renderWelcome(); renderPlan(); renderSetup(); renderOrders(false); renderHelp(); }
$("langBtn").onclick = () => { lang = lang === "es" ? "en" : "es"; try { LS.setItem("dekalo_lang", lang); } catch (e) {} renderAll(); };
renderHelp(); renderWelcome(); $("tagline").textContent = t("tagline"); $("langBtn").textContent = lang === "es" ? "EN" : "ES"; document.documentElement.lang = lang;
loadPlan(); loadSetup(); loadOrders();
