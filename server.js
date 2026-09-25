const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const D = require('./lib/defaults');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, 'storage'));
const uploadsDir = path.join(dataDir, 'uploads');
const contentFile = path.join(dataDir, 'content.json');
const ordersFile = path.join(dataDir, 'orders.json');
const logFile = path.join(dataDir, 'changes.json');
const adminPassword = String(process.env.ADMIN_PASSWORD || '');
// وضع الإدارة المفتوح: عند ADMIN_OPEN=true تعمل لوحة التحكم بلا كلمة مرور.
const adminOpen = String(process.env.ADMIN_OPEN || '').toLowerCase() === 'true';
fs.mkdirSync(uploadsDir, {recursive: true});

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data', 'catalog.json'), 'utf8'));
const contentVersion = 3;
const fonts = ['Alexandria', 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'Almarai', 'Readex Pro', 'Noto Kufi Arabic', 'El Messiri'];
const statuses = {new: 'طلب جديد', review: 'قيد المراجعة', progress: 'قيد التنفيذ', waiting: 'بانتظار العميل', done: 'مكتمل', cancelled: 'ملغي'};

const defaults = {
  version: contentVersion, updatedAt: null,
  settings: {brand: 'مَدار', primary: '#1477c9', phone: '+966 50 000 0000', whatsapp: '', email: 'hello@madar.sa', city: 'الرياض، المملكة العربية السعودية', hours: 'السبت–الخميس، 9 ص–5 م', heroTitle: 'كل ما تحتاجه منشأتك | في مسار واحد واضح.', heroSubtitle: 'نؤسس أعمالك، ننفّذ معاملاتك، ونطوّر منظومتك الإدارية بمتابعة شفافة من أول طلب حتى الإنجاز.', motion: 'on', motionLevel: 'soft'},
  theme: {deep: '#123b68', accent: '#20c4d9', gold: '#f4b942', ink: '#102a43', fontHead: 'Alexandria', fontBody: 'Tajawal'},
  social: {x: '', linkedin: '', instagram: '', tiktok: '', snapchat: ''},
  seo: {title: 'مدار الأعمال | من التأسيس إلى النمو', description: 'مدار الأعمال — منصة سعودية متكاملة لخدمات التأسيس والتشغيل والتطوير المؤسسي.'},
  announcement: {on: false, text: '', link: ''},
  visibility: Object.fromEntries(D.sectionKeys.map(k => [k, true])),
  layout: {order: [...D.sectionKeys]},
  texts: {},
  customCss: '',
  faq: D.defaultFaq, sectors: D.defaultSectors, stages: D.defaultStages,
  activities: D.defaultActivities, articles: D.defaultArticles, services: D.defaultServices,
  catalogVersion: catalog.catalogVersion, entities: catalog.entities, govServices: catalog.govServices
};

const publicFiles = new Set(['index.html', 'admin.html', 'app.js', 'admin.js', 'site-config.js', 'admin.css', 'madar-style-00.css', 'madar-style-01.css', 'madar-style-02.css', 'madar-style-03.css', 'assets/images/saudi-business-establishment.svg', 'assets/images/company-formation.svg', 'assets/images/governance-kpi.svg', 'assets/images/feasibility-study.svg', 'favicon.ico', 'robots.txt', 'data/catalog.json', 'eservices.js', 'eservices.css', 'cms-texts.js']);
const mime = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon'};
const securityHeaders = {'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests", 'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()', 'strict-transport-security': 'max-age=31536000; includeSubDomains', 'cross-origin-opener-policy': 'same-origin', 'x-content-type-options': 'nosniff', 'x-frame-options': 'SAMEORIGIN', 'referrer-policy': 'strict-origin-when-cross-origin'};
const sessions = new Map(), attempts = new Map(), orderHits = new Map();

const clean = (value, max = 300) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
const cleanMulti = (value, max = 2000) => String(value ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
const hex = (v, fb) => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : fb;
const url = v => { const s = clean(v, 300); return /^https:\/\/[^\s"'<>]+$/i.test(s) ? s : ''; };
const clone = v => structuredClone(v);
function json(res, status, value, extra = {}) { res.writeHead(status, {...securityHeaders, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra}); res.end(JSON.stringify(value)); }
function send(res, status, body, extra = {}) { res.writeHead(status, {...securityHeaders, 'content-type': 'text/plain; charset=utf-8', ...extra}); res.end(body); }
function readFile(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return clone(fallback); } }
function atomicWrite(file, value) { const temp = file + '.' + process.pid + '.tmp'; fs.writeFileSync(temp, JSON.stringify(value, null, 1)); fs.renameSync(temp, file); }
function clientIp(req) { const f = String(req.headers['x-forwarded-for'] || '').split(',').map(x => x.trim()).filter(Boolean); return f[f.length - 1] || req.socket.remoteAddress || 'unknown'; }

function readContent() {
  const saved = readFile(contentFile, {});
  if (!saved || typeof saved !== 'object' || !Object.keys(saved).length) return clone(defaults);
  const freshCatalog = Number(saved.catalogVersion || 0) < catalog.catalogVersion || !Array.isArray(saved.govServices);
  const merged = {...clone(defaults), ...saved, version: contentVersion};
  for (const key of ['settings', 'theme', 'social', 'seo', 'announcement', 'layout']) merged[key] = {...clone(defaults[key]), ...(saved[key] || {})};
  merged.visibility = {...clone(defaults.visibility), ...(saved.visibility || {})};
  const order = Array.isArray(merged.layout.order) ? merged.layout.order.filter(k => D.sectionKeys.includes(k)) : [];
  merged.layout.order = [...new Set([...order, ...D.sectionKeys])];
  if (Number(saved.version || 0) < contentVersion) merged.services = clone(D.defaultServices);
  if (freshCatalog) { merged.entities = clone(catalog.entities); merged.govServices = clone(catalog.govServices); }
  merged.catalogVersion = catalog.catalogVersion;
  return merged;
}

function readJson(req, limit = 3_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0, data = '';
    req.on('data', chunk => { size += chunk.length; if (size > limit) { reject(new Error('large')); req.destroy(); return; } data += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('json')); } });
    req.on('error', reject);
  });
}

function normalizeContent(input) {
  const current = readContent(), settings = input?.settings || {}, theme = input?.theme || {}, visibility = input?.visibility || {};
  const safeImage = value => { const v = clean(value, 500); return /^(?:\/uploads\/[a-z0-9._-]+|assets\/images\/[a-z0-9._-]+|https:\/\/[^\s"'<>]+)$/i.test(v) ? v : ''; };
  const item = (x, i, type) => ({id: Number(x?.id) || Date.now() + i, tag: clean(x?.tag, 40), title: clean(x?.title, 120), desc: clean(x?.desc, 260), image: safeImage(x?.image), alt: clean(x?.alt, 160), ...(type === 'article' ? {link: /^(?:#|https:\/\/)/.test(clean(x?.link, 500)) ? clean(x?.link, 500) : '#'} : {})});
  const service = (x, i) => ({id: Number(x?.id) || Date.now() + i, cat: ['startup', 'government', 'consulting', 'growth'].includes(x?.cat) ? x.cat : 'consulting', icon: clean(x?.icon, 3) || '✦', title: clean(x?.title, 80) || 'خدمة أعمال', desc: clean(x?.desc, 220), audience: clean(x?.audience, 80), duration: clean(x?.duration, 40), price: clean(x?.price, 40), features: (Array.isArray(x?.features) ? x.features : []).slice(0, 16).map(v => clean(v, 80)).filter(Boolean), color: hex(x?.color, '#e8f5fd')});
  const entity = (x, i) => ({key: /^[a-z0-9-]{2,24}$/.test(x?.key) ? x.key : 'e' + (Date.now() + i).toString(36), name: clean(x?.name, 60) || 'جهة', icon: clean(x?.icon, 4) || '✦', color: hex(x?.color, '#e8f5fd'), desc: clean(x?.desc, 200)});
  const entities = (Array.isArray(input?.entities) ? input.entities : current.entities).slice(0, 40).map(entity);
  const keys = new Set(entities.map(x => x.key));
  const govServices = (Array.isArray(input?.govServices) ? input.govServices : current.govServices).slice(0, 800).map((x, i) => ({id: Number(x?.id) || Date.now() + i, entity: keys.has(x?.entity) ? x.entity : (entities[0]?.key || ''), title: clean(x?.title, 100), price: clean(x?.price, 30)})).filter(x => x.title && x.entity);
  const texts = {};
  Object.entries(input?.texts && typeof input.texts === 'object' ? input.texts : current.texts).slice(0, 600).forEach(([k, v]) => { if (/^[a-z0-9._-]{1,60}$/i.test(k) && clean(v, 600)) texts[k] = clean(v, 600); });
  const stages = (Array.isArray(input?.stages) ? input.stages : current.stages).slice(0, 6).map((s, i) => ({key: /^[a-z0-9-]{2,20}$/.test(s?.key) ? s.key : 's' + i, label: clean(s?.label, 40) || 'مرحلة', title: clean(s?.title, 100), desc: clean(s?.desc, 260), items: (Array.isArray(s?.items) ? s.items : []).slice(0, 8).map(v => clean(v, 60)).filter(Boolean)}));
  const order = (Array.isArray(input?.layout?.order) ? input.layout.order : current.layout.order).filter(k => D.sectionKeys.includes(k));
  return {
    version: contentVersion, updatedAt: new Date().toISOString(), catalogVersion: catalog.catalogVersion,
    settings: {brand: clean(settings.brand, 40) || current.settings.brand, primary: hex(settings.primary, '#1477c9'), phone: clean(settings.phone, 24), whatsapp: clean(settings.whatsapp, 24), email: clean(settings.email, 100), city: clean(settings.city, 100), hours: clean(settings.hours, 60), heroTitle: clean(settings.heroTitle, 140), heroSubtitle: clean(settings.heroSubtitle, 300), motion: settings.motion === 'off' ? 'off' : 'on', motionLevel: settings.motionLevel === 'rich' ? 'rich' : 'soft'},
    theme: {deep: hex(theme.deep, defaults.theme.deep), accent: hex(theme.accent, defaults.theme.accent), gold: hex(theme.gold, defaults.theme.gold), ink: hex(theme.ink, defaults.theme.ink), fontHead: fonts.includes(theme.fontHead) ? theme.fontHead : 'Alexandria', fontBody: fonts.includes(theme.fontBody) ? theme.fontBody : 'Tajawal'},
    social: Object.fromEntries(Object.keys(defaults.social).map(k => [k, url(input?.social?.[k] ?? current.social[k])])),
    seo: {title: clean(input?.seo?.title ?? current.seo.title, 90) || defaults.seo.title, description: clean(input?.seo?.description ?? current.seo.description, 300)},
    announcement: {on: Boolean(input?.announcement?.on ?? current.announcement.on), text: clean(input?.announcement?.text ?? current.announcement.text, 160), link: clean(input?.announcement?.link ?? current.announcement.link, 300)},
    visibility: Object.fromEntries(D.sectionKeys.map(k => [k, visibility[k] ?? current.visibility[k]]).map(([k, v]) => [k, v !== false])),
    layout: {order: [...new Set([...order, ...D.sectionKeys])]},
    texts,
    customCss: String(input?.customCss ?? current.customCss ?? '').replace(/<\/?style/gi, '').slice(0, 30000),
    faq: (Array.isArray(input?.faq) ? input.faq : current.faq).slice(0, 40).map(x => ({q: clean(x?.q, 200), a: cleanMulti(x?.a, 1200)})).filter(x => x.q && x.a),
    sectors: (Array.isArray(input?.sectors) ? input.sectors : current.sectors).slice(0, 30).map(v => clean(v, 40)).filter(Boolean),
    stages,
    activities: (Array.isArray(input?.activities) ? input.activities : current.activities).slice(0, 8).map((x, i) => item(x, i, 'activity')),
    articles: (Array.isArray(input?.articles) ? input.articles : current.articles).slice(0, 12).map((x, i) => item(x, i, 'article')),
    services: (Array.isArray(input?.services) ? input.services : current.services).slice(0, 100).map(service),
    entities, govServices
  };
}

// ——— الطلبات ———
function readOrders() { const v = readFile(ordersFile, []); return Array.isArray(v) ? v : []; }
function newOrderId(orders) { const used = new Set(orders.map(o => o.id)); let id; do { id = 'MD-' + (10000 + crypto.randomInt(90000)); } while (used.has(id)); return id; }
const progressOf = s => ({new: 10, review: 30, progress: 60, waiting: 60, done: 100, cancelled: 0}[s] ?? 10);
function logChange(area, detail) {
  const log = readFile(logFile, []);
  log.unshift({at: new Date().toISOString(), area: clean(area, 40) || 'عام', detail: clean(detail, 200)});
  atomicWrite(logFile, log.slice(0, 300));
}

function isAdmin(req) {
  if (adminOpen) return true;
  const token = Object.fromEntries(String(req.headers.cookie || '').split(';').map(x => x.trim().split('=')).filter(x => x.length === 2)).madar_admin;
  const expiry = sessions.get(token);
  if (!expiry || expiry < Date.now()) { if (token) sessions.delete(token); return false; }
  return true;
}
function guard(req, res) {
  if (!isAdmin(req)) { json(res, 401, {error: 'يلزم تسجيل الدخول'}); return false; }
  if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'MadarAdmin') { json(res, 403, {error: 'طلب غير مصرح'}); return false; }
  return true;
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/content' && req.method === 'GET') return json(res, 200, readContent());

  if (pathname === '/api/orders' && req.method === 'POST') {
    const ip = clientIp(req), recent = (orderHits.get(ip) || []).filter(t => Date.now() - t < 900000);
    if (recent.length >= 8) return json(res, 429, {error: 'أرسلت طلبات كثيرة، حاول بعد قليل'});
    try {
      const b = await readJson(req, 20000);
      const name = clean(b.name, 80), phone = clean(b.phone, 20).replace(/[\s()-]/g, '');
      if (name.length < 2) return json(res, 400, {error: 'أدخل اسمًا صحيحًا'});
      if (!/^(?:\+?966|0)?5\d{8}$/.test(phone)) return json(res, 400, {error: 'أدخل رقم جوال سعودي صحيحًا'});
      const orders = readOrders(), now = new Date().toISOString();
      const order = {id: newOrderId(orders), createdAt: now, updatedAt: now, status: 'new', customerType: clean(b.customer, 30), service: clean(b.service, 120) || 'غير محدد', need: cleanMulti(b.need, 2000), items: (Array.isArray(b.items) ? b.items : []).slice(0, 60).map(v => clean(v, 160)).filter(Boolean), name, phone, email: clean(b.email, 120), source: ['wizard', 'eservices', 'package'].includes(b.source) ? b.source : 'wizard', assignee: '', quote: '', publicNote: '', notes: [], history: [{at: now, status: 'new'}], read: false};
      orders.unshift(order); atomicWrite(ordersFile, orders.slice(0, 5000));
      recent.push(Date.now()); orderHits.set(ip, recent);
      return json(res, 201, {id: order.id});
    } catch (e) { return json(res, e.message === 'large' ? 413 : 400, {error: 'تعذر إرسال الطلب'}); }
  }

  if (pathname === '/api/track' && req.method === 'GET') {
    const q = new URL(req.url, 'http://localhost').searchParams, id = clean(q.get('id'), 20).toUpperCase(), last4 = clean(q.get('phone'), 4);
    const o = readOrders().find(x => x.id === id);
    if (!o || !/^\d{4}$/.test(last4) || !o.phone.endsWith(last4)) return json(res, 404, {error: 'لم نجد طلبًا بهذه البيانات'});
    return json(res, 200, {id: o.id, service: o.service, status: o.status, label: statuses[o.status], progress: progressOf(o.status), createdAt: o.createdAt, updatedAt: o.updatedAt, note: o.publicNote, history: o.history.map(h => ({at: h.at, label: statuses[h.status] || h.status}))});
  }

  if (pathname === '/api/admin/session' && req.method === 'GET') return json(res, 200, {authenticated: isAdmin(req), configured: Boolean(adminPassword) || adminOpen, open: adminOpen});
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    if (adminOpen) return json(res, 200, {ok: true});
    const ip = clientIp(req), recent = (attempts.get(ip) || []).filter(t => Date.now() - t < 900000); attempts.set(ip, recent);
    if (recent.length >= 8) return json(res, 429, {error: 'محاولات كثيرة، حاول لاحقًا'});
    if (!adminPassword) return json(res, 503, {error: 'لم تُضبط كلمة مرور الإدارة بعد'});
    try {
      const body = await readJson(req, 10000), supplied = Buffer.from(String(body.password || '')), expected = Buffer.from(adminPassword);
      if (!(supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected))) { recent.push(Date.now()); return json(res, 401, {error: 'كلمة المرور غير صحيحة'}); }
      const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, Date.now() + 28800000);
      return json(res, 200, {ok: true}, {'set-cookie': `madar_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`});
    } catch { return json(res, 400, {error: 'طلب غير صالح'}); }
  }
  if (pathname === '/api/admin/logout' && req.method === 'POST') { const t = Object.fromEntries(String(req.headers.cookie || '').split(';').map(x => x.trim().split('=')).filter(x => x.length === 2)).madar_admin; sessions.delete(t); return json(res, 200, {ok: true}, {'set-cookie': 'madar_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}); }

  if (!pathname.startsWith('/api/admin/')) return json(res, 404, {error: 'غير موجود'});
  if (!guard(req, res)) return;

  if (pathname === '/api/admin/content' && req.method === 'PUT') {
    try { const value = normalizeContent(await readJson(req)); atomicWrite(contentFile, value); logChange(req.headers['x-change-area'] ? decodeURIComponent(req.headers['x-change-area']) : 'المحتوى', 'تم حفظ ونشر التعديلات'); return json(res, 200, value); }
    catch (e) { return json(res, e.message === 'large' ? 413 : 400, {error: e.message === 'large' ? 'حجم البيانات كبير' : 'تعذر حفظ البيانات'}); }
  }
  if (pathname === '/api/admin/reset' && req.method === 'POST') {
    const body = await readJson(req, 1000).catch(() => ({})), current = readContent(), fresh = clone(defaults);
    const scope = String(body.scope || '');
    const map = {design: ['theme', 'customCss'], texts: ['texts'], catalog: ['entities', 'govServices'], packages: ['services'], all: Object.keys(defaults)};
    if (!map[scope]) return json(res, 400, {error: 'نطاق غير معروف'});
    map[scope].forEach(k => { current[k] = fresh[k]; });
    if (scope === 'design') current.settings.primary = defaults.settings.primary;
    const value = normalizeContent(current); atomicWrite(contentFile, value); logChange('استعادة', 'استعادة الافتراضي: ' + scope); return json(res, 200, value);
  }
  if (pathname === '/api/admin/orders' && req.method === 'GET') return json(res, 200, {orders: readOrders(), statuses});
  const om = pathname.match(/^\/api\/admin\/orders\/(MD-\d{4,6})$/);
  if (om) {
    const orders = readOrders(), o = orders.find(x => x.id === om[1]);
    if (!o) return json(res, 404, {error: 'الطلب غير موجود'});
    if (req.method === 'DELETE') { atomicWrite(ordersFile, orders.filter(x => x !== o)); logChange('الطلبات', `حذف الطلب ${o.id}`); return json(res, 200, {ok: true}); }
    if (req.method === 'PATCH') {
      try {
        const b = await readJson(req, 20000), now = new Date().toISOString();
        if (b.status && statuses[b.status] && b.status !== o.status) { o.status = b.status; o.history.push({at: now, status: b.status}); logChange('الطلبات', `${o.id}: ${statuses[b.status]}`); }
        for (const [k, m] of [['assignee', 80], ['quote', 40], ['publicNote', 400], ['service', 120], ['name', 80], ['email', 120]]) if (typeof b[k] === 'string') o[k] = clean(b[k], m);
        if (typeof b.note === 'string' && clean(b.note, 1000)) o.notes.push({at: now, text: cleanMulti(b.note, 1000)});
        if (typeof b.read === 'boolean') o.read = b.read;
        o.updatedAt = now; atomicWrite(ordersFile, orders); return json(res, 200, o);
      } catch { return json(res, 400, {error: 'تعذر تحديث الطلب'}); }
    }
  }
  if (pathname === '/api/admin/log' && req.method === 'GET') return json(res, 200, readFile(logFile, []));
  if (pathname === '/api/admin/backup' && req.method === 'GET') return json(res, 200, {exportedAt: new Date().toISOString(), content: readContent(), orders: readOrders()}, {'content-disposition': `attachment; filename="madar-backup-${new Date().toISOString().slice(0, 10)}.json"`});
  if (pathname === '/api/admin/restore' && req.method === 'POST') {
    try { const b = await readJson(req, 8_000_000); if (!b.content) return json(res, 400, {error: 'ملف غير صالح'}); const value = normalizeContent(b.content); atomicWrite(contentFile, value); logChange('النسخ الاحتياطي', 'استعادة المحتوى من ملف'); return json(res, 200, value); }
    catch { return json(res, 400, {error: 'تعذر قراءة الملف'}); }
  }
  if (pathname === '/api/admin/upload' && req.method === 'POST') {
    try {
      const body = await readJson(req, 3_000_000), match = String(body.data || '').match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return json(res, 415, {error: 'استخدم JPG أو PNG أو WebP فقط'});
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 2_000_000) return json(res, 413, {error: 'الحد الأقصى للصورة 2 ميجابايت'});
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
      fs.writeFileSync(path.join(uploadsDir, name), buffer, {flag: 'wx'});
      return json(res, 201, {url: `/uploads/${name}`});
    } catch { return json(res, 400, {error: 'تعذر رفع الصورة'}); }
  }
  return json(res, 404, {error: 'غير موجود'});
}

http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return send(res, 400, 'طلب غير صالح'); }
  if (pathname === '/health') return send(res, 200, 'ok', {'cache-control': 'no-store'});
  if (pathname.startsWith('/api/')) { try { return await handleApi(req, res, pathname); } catch { return json(res, 500, {error: 'خطأ في الخادم'}); } }
  if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'الطريقة غير مسموحة', {allow: 'GET, HEAD'});
  const requested = pathname === '/' ? 'index.html' : pathname === '/admin' ? 'admin.html' : pathname.replace(/^\/+/, ''), isUpload = requested.startsWith('uploads/');
  let filePath;
  if (isUpload) { const name = path.basename(requested); if (name !== requested.slice(8)) return send(res, 404, 'الصفحة غير موجودة'); filePath = path.join(uploadsDir, name); }
  else { if (!publicFiles.has(requested)) return send(res, 404, 'الصفحة غير موجودة'); filePath = path.join(root, requested); }
  const relative = path.relative(isUpload ? uploadsDir : root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(res, 404, 'الصفحة غير موجودة');
  const extension = path.extname(filePath).toLowerCase();
  const headers = {...securityHeaders, 'content-type': mime[extension] || 'application/octet-stream', 'cache-control': extension === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'};
  if (requested === 'admin.html') headers['x-robots-tag'] = 'noindex, nofollow';
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).on('error', () => res.destroy()).pipe(res);
}).listen(port, '0.0.0.0', () => console.log(`Madar is running on port ${port}${adminOpen ? ' (admin open mode)' : ''}`));
