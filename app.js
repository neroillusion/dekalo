/* Dekalo — panel del taller (admin de Shopify).
 * Página estática: usa App Bridge + "Direct API access", así que no necesita servidor.
 * El archivo de impresión de 300 DPI se genera en la computadora del taller.
 */
const API = "shopify:admin/api/graphql.json";
const TAG = "dekalo";
const BLOCK = "gang-sheet-builder";
// Handle del listado en la App Store (lo da Shopify al crear el listado). Si cambia, actualízalo aquí.
const APP_HANDLE = "dekalo";
const PLANS = [
  { key: "free", name: "Gratis", m: 0, y: 0, feats: ["builder", "arrange", "dpi", "png", "sizes3", "wm"] },
  { key: "pro", name: "Pro", m: 19.99, y: 199, feats: ["builder", "arrange", "dpi", "png", "sizesU", "nowm", "d3", "bg", "text", "custom"] },
  { key: "taller", name: "Taller", m: 39.99, y: 399, feats: ["all", "white", "batch", "setup", "priority"] },
];
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- textos ---------- */
const L = {
  es: {
    tagline: "Builder de gang sheets para tu tienda", setupT: "Configuración", setupS: "Tres pasos y tus clientes pueden armar sus gang sheets.",
    s1: "Crear el producto Gang Sheet", s1t: "Cada variante es un tamaño de hoja con su precio. Puedes cambiar los precios después en Shopify.", s1done: "Producto listo:",
    s2: "Añadir el builder a la página del producto", s2t: "Abre el editor de temas con el bloque ya añadido. Solo dale Guardar.", s2b: "Abrir editor de temas",
    s3: "Probarlo como cliente", s3t: "Arma una hoja de prueba y añádela al carrito.", s3b: "Ver producto en la tienda",
    w: "Ancho (in)", h: "Largo (in)", p: "Precio", create: "Crear producto", creating: "Creando…", addRow: "+ Tamaño", edit: "Editar producto",
    ordersT: "Hojas para imprimir", ordersS: "Órdenes con gang sheets. El archivo se genera aquí mismo, en tu computadora.", pending: "Pendientes", all: "Todas", refresh: "Actualizar", more: "Cargar más",
    none: "Todavía no hay órdenes con gang sheets", noneS: "Cuando un cliente compre una hoja, aparecerá aquí lista para imprimir.",
    designs: "diseños", qty: "Cantidad", download: "Descargar PNG 300 DPI", files: "Archivos", generating: "Generando…", done: "Listo",
    corsErr: "No se pudo leer un archivo del pedido. Abre los archivos y descárgalos manualmente.", apiErr: "No se pudo conectar con Shopify:",
    unfulfilled: "Sin preparar", fulfilled: "Preparado", partial: "Parcial",
    helpT: "Ayuda", q1: "¿Dónde quedan los archivos de mis clientes?", a1: "Shopify los guarda con cada orden, igual que cualquier archivo subido en la página de producto. La app no los guarda en ningún servidor.",
    q2: "¿Cómo cambio tamaños o precios?", a2: "Edita las variantes del producto Gang Sheet. El nombre de cada variante debe tener la medida, por ejemplo: 22 x 24.",
    q3: "¿Puedo cambiar colores, textos y funciones del builder?", a3: "Sí. En el editor de temas, selecciona el bloque Gang Sheet Builder y cambia sus ajustes.",
    planT: "Tu plan", planS: "Los cobros los maneja Shopify en tu factura. Puedes cambiar o cancelar cuando quieras.", current: "Plan actual", choose: "Ver y cambiar planes", month: "/mes", year: "/año", save2: "2 meses gratis", trial: "14 días gratis", freeForever: "Gratis para siempre",
    f_builder: "Builder en tu página de producto", f_arrange: "Acomodo automático y hoja más barata", f_dpi: "Alertas de calidad (DPI y fondo)", f_png: "PNG 300 DPI listo para imprimir", f_sizes3: "Hasta 3 tamaños de hoja", f_wm: "Marca de agua «Hecho con Dekalo»", f_sizesU: "Tamaños de hoja ilimitados", f_nowm: "Sin marca de agua", f_d3: "Vista 3D (camiseta, taza, tote, film)", f_bg: "Quitar fondo con un clic", f_text: "Herramienta de texto con fuentes", f_custom: "Colores y textos personalizados", f_all: "Todo lo del plan Pro", f_white: "Marca blanca: sin Dekalo en ningún lado", f_batch: "Descargar todas las hojas pendientes", f_setup: "Configuración inicial hecha por Nero Illusion", f_priority: "Soporte prioritario",
    batch: "Descargar todas", batchOnly: "Descarga en lote: plan Taller", synced: "Plan actualizado en tu tienda",
    q4: "¿Qué formato es el archivo de impresión?", a4: "PNG con fondo transparente a 300 DPI, del tamaño exacto de la hoja, listo para tu software RIP.",
  },
  en: {
    tagline: "Gang sheet builder for your store", setupT: "Setup", setupS: "Three steps and your customers can build their gang sheets.",
    s1: "Create the Gang Sheet product", s1t: "Each variant is a sheet size with its price. You can change prices later in Shopify.", s1done: "Product ready:",
    s2: "Add the builder to the product page", s2t: "Opens the theme editor with the block already added. Just click Save.", s2b: "Open theme editor",
    s3: "Test it as a customer", s3t: "Build a test sheet and add it to the cart.", s3b: "View product in store",
    w: "Width (in)", h: "Length (in)", p: "Price", create: "Create product", creating: "Creating…", addRow: "+ Size", edit: "Edit product",
    ordersT: "Sheets to print", ordersS: "Orders with gang sheets. The file is generated right here, on your computer.", pending: "Pending", all: "All", refresh: "Refresh", more: "Load more",
    none: "No gang sheet orders yet", noneS: "When a customer buys a sheet, it will show up here ready to print.",
    designs: "designs", qty: "Quantity", download: "Download 300 DPI PNG", files: "Files", generating: "Generating…", done: "Done",
    corsErr: "Couldn't read a file from the order. Open the files and download them manually.", apiErr: "Couldn't connect to Shopify:",
    unfulfilled: "Unfulfilled", fulfilled: "Fulfilled", partial: "Partial",
    helpT: "Help", q1: "Where are my customers' files stored?", a1: "Shopify stores them with each order, like any file uploaded on a product page. The app doesn't store them on any server.",
    q2: "How do I change sizes or prices?", a2: "Edit the Gang Sheet product variants. Each variant name must include the size, for example: 22 x 24.",
    q3: "Can I change the builder's colors, texts and features?", a3: "Yes. In the theme editor, select the Gang Sheet Builder block and change its settings.",
    planT: "Your plan", planS: "Shopify bills you on your invoice. Change or cancel anytime.", current: "Current plan", choose: "View and change plans", month: "/mo", year: "/yr", save2: "2 months free", trial: "14-day free trial", freeForever: "Free forever",
    f_builder: "Builder on your product page", f_arrange: "Auto-arrange and cheapest sheet", f_dpi: "Quality alerts (DPI and background)", f_png: "Print-ready 300 DPI PNG", f_sizes3: "Up to 3 sheet sizes", f_wm: "«Made with Dekalo» watermark", f_sizesU: "Unlimited sheet sizes", f_nowm: "No watermark", f_d3: "3D view (tee, mug, tote, film)", f_bg: "One-click background removal", f_text: "Text tool with fonts", f_custom: "Custom colors and texts", f_all: "Everything in Pro", f_white: "White label: no Dekalo anywhere", f_batch: "Download all pending sheets", f_setup: "Setup done for you by Nero Illusion", f_priority: "Priority support",
    batch: "Download all", batchOnly: "Batch download: Shop plan", synced: "Plan updated in your store",
    q4: "What format is the print file?", a4: "Transparent PNG at 300 DPI, at the exact sheet size, ready for your RIP software.",
  },
};
let lang = (navigator.language || "es").slice(0, 2) === "en" ? "en" : "es";
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
const money = (v, cur) => { try { return new Intl.NumberFormat(lang === "es" ? "es-PR" : "en-US", { style: "currency", currency: cur || "USD" }).format(+v); } catch (e) { return "$" + (+v).toFixed(2); } };

/* ---------- configuración ---------- */
const DEF_SIZES = [{ w: 22, h: 12, p: 7 }, { w: 22, h: 24, p: 12 }, { w: 22, h: 36, p: 17 }, { w: 22, h: 48, p: 22 }, { w: 22, h: 60, p: 27 }, { w: 22, h: 120, p: 50 }];
let sizes = DEF_SIZES.map((s) => ({ ...s }));
let product = null, currency = "USD";

async function loadSetup() {
  $("setup").innerHTML = `<h2>${t("setupT")}</h2><p class="sub">${t("setupS")}</p><div class="skel"></div>`;
  try {
    const d = await gql(`query{shop{currencyCode} products(first:1,query:"tag:${TAG}"){nodes{id title handle onlineStoreUrl status variants(first:30){nodes{title price}}}}}`);
    currency = d.shop.currencyCode;
    product = d.products.nodes[0] || null;
  } catch (e) { showErr(e); product = null; }
  renderSetup();
}
function renderSetup() {
  const st1 = !!product;
  const prodUrl = product ? (product.onlineStoreUrl || `https://${shopDomain()}/products/${product.handle}`) : "";
  $("setup").innerHTML = `<h2>${t("setupT")}</h2><p class="sub">${t("setupS")}</p><div class="steps">
   <div class="step ${st1 ? "done" : ""}"><span class="num">${st1 ? "✓" : "1"}</span><div class="body"><b>${t("s1")}</b>
     ${st1 ? `<div class="txt">${t("s1done")} <b style="display:inline">${esc(product.title)}</b> · ${product.variants.nodes.map((v) => `${esc(v.title)} ${money(v.price, currency)}`).join(" · ")}</div><div class="row" style="margin-top:8px"><button class="btn" id="editProd">${t("edit")}</button></div>`
     : `<div class="txt">${t("s1t")}</div><table><tr><th>${t("w")}</th><th>${t("h")}</th><th>${t("p")}</th><th></th></tr>${sizes.map((s, i) => `<tr><td><input type="number" step="0.5" min="1" data-i="${i}" data-k="w" value="${s.w}"></td><td><input type="number" min="1" data-i="${i}" data-k="h" value="${s.h}"></td><td><input type="number" step="0.5" min="0" data-i="${i}" data-k="p" value="${s.p}"></td><td><button class="btn" data-del="${i}">✕</button></td></tr>`).join("")}</table>
       <div class="row"><button class="btn" id="addRow">${t("addRow")}</button><button class="btn pri" id="createProd">${t("create")}</button></div>`}</div></div>
   <div class="step"><span class="num">2</span><div class="body"><b>${t("s2")}</b><div class="txt">${t("s2t")}</div><div class="row" style="margin-top:8px"><button class="btn ${st1 ? "pri" : ""}" id="openTheme">${t("s2b")}</button></div></div></div>
   <div class="step"><span class="num">3</span><div class="body"><b>${t("s3")}</b><div class="txt">${t("s3t")}</div><div class="row" style="margin-top:8px"><a class="btn" id="viewProd" ${st1 ? `href="${esc(prodUrl)}" target="_blank" rel="noopener"` : "aria-disabled=true"}>${t("s3b")}</a></div></div></div></div>`;
  const tb = $("setup").querySelector("table");
  if (tb) {
    tb.oninput = (e) => { const d = e.target.dataset; if (d.k) sizes[+d.i][d.k] = +e.target.value; };
    tb.onclick = (e) => { const i = e.target.dataset.del; if (i !== undefined && sizes.length > 1) { sizes.splice(+i, 1); renderSetup(); } };
    $("addRow").onclick = () => { const l = sizes[sizes.length - 1]; sizes.push({ w: l.w, h: l.h + 12, p: l.p + 5 }); renderSetup(); };
    $("createProd").onclick = createProduct;
  }
  if ($("editProd")) $("editProd").onclick = () => goAdmin(`products/${numId(product.id)}`);
  $("openTheme").onclick = () => {
    const url = `https://${shopDomain()}/admin/themes/current/editor?template=product&addAppBlockId=${encodeURIComponent(apiKey())}/${BLOCK}&target=mainSection`;
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
        descriptionHtml: lang === "es" ? "<p>Arma tu gang sheet: sube tus diseños, acomódalos y míralos en 3D.</p>" : "<p>Build your gang sheet: upload your designs, arrange them and preview in 3D.</p>",
        productOptions: [{ name: optName, values: names.map((n) => ({ name: n })) }],
        variants: clean.map((s, i) => ({ optionValues: [{ optionName: optName, name: names[i] }], price: (+s.p).toFixed(2), inventoryPolicy: "CONTINUE" })),
      },
    });
    const errs = d.productSet.userErrors;
    if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    toast(t("s1done") + " DTF Gang Sheet");
    await loadSetup();
  } catch (e) { showErr(e); b.disabled = false; b.textContent = t("create"); }
}

/* ---------- planes (Shopify App Pricing, sin servidor) ---------- */
let plan = "free";
const planName = (k) => (lang === "en" && k === "taller" ? "Shop" : lang === "en" && k === "free" ? "Free" : PLANS.find((p) => p.key === k).name);
async function loadPlan() {
  try {
    const d = await gql(`query{currentAppInstallation{id activeSubscriptions{name status}}}`);
    const inst = d.currentAppInstallation;
    const sub = (inst.activeSubscriptions || []).find((s) => s.status === "ACTIVE");
    const n = (sub?.name || "").toLowerCase();
    plan = /taller|shop|studio/.test(n) ? "taller" : /pro/.test(n) ? "pro" : "free";
    // Guarda el plan en un dato oculto de la app (app-data metafield) que el tema lee para quitar la marca de agua.
    const r = await gql(`mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}`,
      { m: [{ ownerId: inst.id, namespace: "dekalo", key: "plan", type: "single_line_text_field", value: plan }] });
    if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map((e) => e.message).join("; "));
  } catch (e) { showErr(e); }
  renderPlan(); renderOrders(false);
}
function renderPlan() {
  const store = shopDomain().replace(".myshopify.com", "");
  $("plan").innerHTML = `<h2>${t("planT")}</h2><p class="sub">${t("planS")}</p>
   <div class="plans">${PLANS.map((p) => `<div class="pl ${p.key === plan ? "on" : ""}">
     <div class="pl-h"><b>${planName(p.key)}</b>${p.key === plan ? `<span class="tag ok">${t("current")}</span>` : ""}</div>
     <div class="pl-p">${p.m ? `<span class="big">$${p.m}</span>${t("month")}<div class="mu">$${p.y}${t("year")} · ${t("save2")}</div>` : `<span class="big">$0</span><div class="mu">${t("freeForever")}</div>`}</div>
     ${p.m ? `<div class="tag" style="margin-bottom:8px">${t("trial")}</div>` : ""}
     <ul>${p.feats.map((f) => `<li class="${f === "wm" ? "neg" : ""}">${t("f_" + f)}</li>`).join("")}</ul></div>`).join("")}</div>
   <div class="row" style="margin-top:12px"><button class="btn pri" id="changePlan">${t("choose")}</button></div>`;
  $("changePlan").onclick = () => window.open(`https://admin.shopify.com/store/${store}/charges/${APP_HANDLE}/pricing_plans`, "_top");
}
async function exportAll(btn) {
  if (plan !== "taller") { toast(t("batchOnly"), true); return; }
  btn.disabled = true;
  for (let i = 0; i < sheets.length; i++) { const b = document.querySelector(`[data-dl="${i}"]`); if (b) await exportSheet(i, b); }
  btn.disabled = false;
}

/* ---------- órdenes ---------- */
let filter = "pending", cursor = null, sheets = [];
async function loadOrders(reset = true) {
  if (reset) { cursor = null; sheets = []; renderOrders(true); }
  try {
    const q = filter === "pending" ? "fulfillment_status:unfulfilled" : "";
    const d = await gql(`query($c:String,$q:String){orders(first:25,after:$c,sortKey:CREATED_AT,reverse:true,query:$q){pageInfo{hasNextPage endCursor} nodes{id name createdAt displayFulfillmentStatus lineItems(first:50){nodes{id name variantTitle quantity customAttributes{key value}}}}}}`, { c: cursor, q });
    const o = d.orders;
    for (const ord of o.nodes) for (const li of ord.lineItems.nodes) {
      const attrs = Object.fromEntries((li.customAttributes || []).map((a) => [a.key, a.value]));
      if (!attrs._layout) continue;
      let lay; try { lay = JSON.parse(attrs._layout); } catch (e) { continue; }
      sheets.push({ ord, li, lay, files: attrs });
    }
    cursor = o.pageInfo.hasNextPage ? o.pageInfo.endCursor : null;
  } catch (e) { showErr(e); }
  renderOrders(false);
}
function stTag(s) { const m = { UNFULFILLED: ["wa", t("unfulfilled")], FULFILLED: ["ok", t("fulfilled")], PARTIALLY_FULFILLED: ["wa", t("partial")] }[s] || ["", s]; return `<span class="tag ${m[0]}">${esc(m[1])}</span>`; }
function renderOrders(loading) {
  const el = $("orders");
  el.innerHTML = `<h2>${t("ordersT")}</h2><p class="sub">${t("ordersS")}</p>
   <div class="toolbar"><div class="seg"><button data-f="pending" class="${filter === "pending" ? "on" : ""}">${t("pending")}</button><button data-f="all" class="${filter === "all" ? "on" : ""}">${t("all")}</button></div><button class="btn" id="refresh">${t("refresh")}</button>${sheets.length > 1 ? `<button class="btn ${plan === "taller" ? "pri" : ""}" id="batchBtn" title="${t("batchOnly")}">${t("batch")} (${sheets.length})${plan === "taller" ? "" : " 🔒"}</button>` : ""}</div>
   ${loading ? `<div class="skel"></div>` : sheets.length ? `<div class="grid">${sheets.map((s, i) => sheetCard(s, i)).join("")}</div>` : `<div class="empty"><b>${t("none")}</b>${t("noneS")}</div>`}
   ${!loading && cursor ? `<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="more">${t("more")}</button></div>` : ""}`;
  el.querySelector(".seg").onclick = (e) => { const f = e.target.dataset.f; if (f && f !== filter) { filter = f; loadOrders(); } };
  $("refresh").onclick = () => loadOrders();
  if ($("batchBtn")) $("batchBtn").onclick = (e) => exportAll(e.currentTarget);
  if ($("more")) $("more").onclick = () => loadOrders(false);
  if (!loading) sheets.forEach((s, i) => drawPreview(s, i));
}
function sheetCard(s, i) {
  const [w, h] = s.lay.s; const keys = [...new Set(s.lay.i.map((x) => x.f))];
  return `<div class="sheet"><div class="pv"><canvas id="pv${i}"></canvas></div><div class="meta">
   <div class="t"><a href="#" data-order="${numId(s.ord.id)}">${esc(s.ord.name)}</a>${stTag(s.ord.displayFulfillmentStatus)}</div>
   <div class="mu">${w} × ${h} in · ${s.lay.i.length} ${t("designs")} · ${t("qty")}: ${s.li.quantity} · ${new Date(s.ord.createdAt).toLocaleDateString(lang === "es" ? "es-PR" : "en-US")}</div>
   <div class="prog" id="pg${i}"><i></i></div><div class="err" id="er${i}"></div>
   <div class="row"><button class="btn pri" data-dl="${i}">${t("download")}</button><button class="btn" data-files="${i}">${t("files")} (${keys.length})</button></div></div>
   <div class="files" id="fl${i}">${keys.map((k) => `<a href="${esc(s.files[k] || "#")}" target="_blank" rel="noopener">${esc(k)}</a>`).join("")}</div></div>`;
}
document.addEventListener("click", (e) => {
  const o = e.target.closest("[data-order]"); if (o) { e.preventDefault(); goAdmin(`orders/${o.dataset.order}`); return; }
  const d = e.target.closest("[data-dl]"); if (d) { exportSheet(+d.dataset.dl, d); return; }
  const f = e.target.closest("[data-files]"); if (f) $("fl" + f.dataset.files).classList.toggle("show");
});

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
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast(`${t("done")}: ${name}`);
  } catch (e) {
    er.textContent = e && e.message === "img" ? t("corsErr") : (e.message || String(e));
    $("fl" + i).classList.add("show");
  } finally { btn.disabled = false; btn.textContent = old; setTimeout(() => pg.classList.remove("show"), 800); }
}

/* ---------- ayuda ---------- */
function renderHelp() { $("help").innerHTML = `<h2>${t("helpT")}</h2>${[1, 2, 3, 4].map((n) => `<details style="margin-top:10px"><summary>${t("q" + n)}</summary><p>${t("a" + n)}</p></details>`).join("")}`; }
function showErr(e) { $("banner").innerHTML = `<div class="banner err">${t("apiErr")} ${esc(e.message || e)}</div>`; }

/* ---------- inicio ---------- */
function renderAll() { $("tagline").textContent = t("tagline"); $("langBtn").textContent = lang === "es" ? "EN" : "ES"; document.documentElement.lang = lang; renderPlan(); renderSetup(); renderOrders(false); renderHelp(); }
$("langBtn").onclick = () => { lang = lang === "es" ? "en" : "es"; renderAll(); };
renderHelp(); $("tagline").textContent = t("tagline"); $("langBtn").textContent = lang === "es" ? "EN" : "ES";
loadPlan(); loadSetup(); loadOrders();
