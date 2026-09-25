// لوحة تحكم مدار — إدارة كاملة للمحتوى والتصميم والطلبات مع معاينة حية قبل النشر.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clean = (v, m = 300) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, m);
const esc = v => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/[&<>'"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[c]));
const lines = v => String(v || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const fmtDate = (v, withTime = true) => { try { return new Date(v).toLocaleString('ar-SA-u-ca-gregory-nu-latn', withTime ? {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'} : {day: 'numeric', month: 'short', year: 'numeric'}); } catch { return ''; } };

const FONTS = ['Alexandria', 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'Almarai', 'Readex Pro', 'Noto Kufi Arabic', 'El Messiri'];
const PRESETS = [
  {name: 'أزرق مدار', primary: '#1477c9', deep: '#123b68', accent: '#20c4d9', gold: '#f4b942', ink: '#102a43'},
  {name: 'أخضر وذهبي', primary: '#0f7b5f', deep: '#0b3d2e', accent: '#2bb58a', gold: '#c9a646', ink: '#10261e'},
  {name: 'كحلي وذهبي', primary: '#1f3c88', deep: '#0d1b3e', accent: '#3a7bd5', gold: '#d4a73a', ink: '#0f1a33'},
  {name: 'عنابي أنيق', primary: '#8c2a3b', deep: '#3b1220', accent: '#d0677a', gold: '#e0b25b', ink: '#2a1117'},
  {name: 'بنفسجي تقني', primary: '#5b4bd6', deep: '#231b5c', accent: '#22c3e6', gold: '#f2b84b', ink: '#16123a'},
  {name: 'فحمي عصري', primary: '#e0663a', deep: '#1f2328', accent: '#f2a541', gold: '#f2c94c', ink: '#1a1d21'}
];
const SECTION_NAMES = {visualStory: 'الصور والأنشطة الرئيسية', marquee: 'شريط القطاعات المتحرك', saudiValue: 'القيمة للسوق السعودي', method: 'منهجية العمل والإنفوجرافيك', services: 'مستكشف الباقات', journey: 'رحلة تنفيذ الخدمة', transformation: 'المقارنة قبل وبعد', solutions: 'حلول مراحل المنشأة', packages: 'بطاقات المسارات', eservices: 'الخدمات الحكومية المنفردة', track: 'تتبع الطلبات', knowledge: 'مركز المعرفة', deliverables: 'المخرجات والتسليمات', faq: 'الأسئلة الشائعة', cta: 'الدعوة الختامية للتواصل'};
const SECTION_ANCHORS = {visualStory: '.visual-story', marquee: '.sector-marquee', saudiValue: '.saudi-value', method: '#method', services: '#services', journey: '#journey', transformation: '.transformation', solutions: '#solutions', packages: '#packages', eservices: '#eservices', track: '#track', knowledge: '#knowledge', deliverables: '.deliverables', faq: '#faq', cta: '#about'};
const CATS = {startup: 'التأسيس', government: 'باقات المنشآت', consulting: 'المستثمرون', growth: 'الاستشارات'};
const STATUS_COLORS = {new: 'blue', review: 'amber', progress: 'violet', waiting: 'orange', done: 'green', cancelled: 'gray'};
const SOURCES = {wizard: 'نموذج الطلب', eservices: 'الخدمات المنفردة', package: 'صفحة الباقة'};

const PAGES = [
  {id: 'overview', icon: '⌂', title: 'لوحة القيادة', group: 'الرئيسية'},
  {id: 'orders', icon: '✉', title: 'الطلبات', group: 'الرئيسية', badge: true},
  {id: 'packages', icon: '▦', title: 'الباقات', group: 'الخدمات'},
  {id: 'eservices', icon: '☰', title: 'الخدمات المنفردة', group: 'الخدمات'},
  {id: 'design', icon: '🎨', title: 'التصميم والهوية', group: 'الموقع', preview: true},
  {id: 'texts', icon: '✎', title: 'نصوص الموقع', group: 'الموقع', preview: true},
  {id: 'sections', icon: '◫', title: 'الأقسام والترتيب', group: 'الموقع', preview: true},
  {id: 'blocks', icon: '❖', title: 'الأسئلة والقطاعات والمراحل', group: 'الموقع', preview: true},
  {id: 'media', icon: '▣', title: 'الصور والأنشطة', group: 'الموقع', preview: true},
  {id: 'articles', icon: '▤', title: 'مركز المعرفة', group: 'الموقع', preview: true},
  {id: 'settings', icon: '⚙', title: 'الإعدادات والتواصل', group: 'النظام'},
  {id: 'log', icon: '◷', title: 'سجل التغييرات', group: 'النظام'}
];

let content = null, published = '', orders = [], statuses = {}, changeLog = [], session = {open: false};
let page = 'overview', orderFilter = 'all', orderSearch = '', openOrderId = null, textDefaults = null;

// ——— أدوات ———
async function api(url, options = {}) {
  const res = await fetch(url, {credentials: 'same-origin', ...options, headers: {'content-type': 'application/json', 'x-requested-with': 'MadarAdmin', ...(options.headers || {})}});
  const data = await res.json().catch(() => ({error: 'استجابة غير صالحة'}));
  if (!res.ok) { if (res.status === 401) showLogin(); throw new Error(data.error || 'تعذر إكمال العملية'); }
  return data;
}
function toast(message, type = 'ok') { const t = $('#adminToast'); t.textContent = message; t.className = `toast show ${type}`; clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => t.className = 'toast', 2800); }
function getPath(obj, path) { return path.split('.').reduce((o, k) => o?.[k], obj); }
function setPath(obj, path, value) { const keys = path.split('.'), last = keys.pop(); const target = keys.reduce((o, k) => (o[k] = o[k] ?? {}), obj); target[last] = value; }
const isDirty = () => content && JSON.stringify(content) !== published;
function markDirty() {
  const dirty = isDirty(), s = $('#saveState');
  s.dataset.state = dirty ? 'dirty' : 'saved'; s.textContent = dirty ? 'تغييرات غير منشورة' : 'كل التغييرات منشورة';
  $('#saveBtn').disabled = !dirty; schedulePreview();
}
addEventListener('beforeunload', e => { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

// ——— الدخول ———
function showLogin() { $('#loginGate').classList.remove('hidden'); }
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginError').textContent = '';
  try { await api('/api/admin/login', {method: 'POST', body: JSON.stringify({password: $('#passwordInput').value})}); $('#loginGate').classList.add('hidden'); await boot(); }
  catch (err) { $('#loginError').textContent = err.message; }
});
$('#logoutBtn').addEventListener('click', async () => { try { await api('/api/admin/logout', {method: 'POST'}); } finally { location.reload(); } });

async function start() {
  try {
    session = await api('/api/admin/session', {method: 'GET'});
    $('#openFlag').hidden = !session.open; $('#logoutBtn').hidden = session.open;
    if (!session.authenticated) { showLogin(); if (!session.configured) $('#loginError').textContent = 'يلزم ضبط ADMIN_PASSWORD أو ADMIN_OPEN في إعدادات الخادم.'; return; }
    await boot();
  } catch { $('#page').innerHTML = '<div class="empty">تعذر الاتصال بالخادم، حدّث الصفحة.</div>'; }
}
async function boot() {
  content = await api('/api/content', {method: 'GET'});
  published = JSON.stringify(content);
  await Promise.all([loadOrders(), loadLog(), loadTextDefaults()]);
  renderNav(); go(location.hash.slice(1) || 'overview', false); markDirty();
  setInterval(async () => { const before = orders.filter(o => !o.read).length; await loadOrders(); const now = orders.filter(o => !o.read).length; if (now > before) toast(`وصل ${now - before} طلب جديد`); renderNav(); if (page === 'orders' || page === 'overview') renderPage(); }, 30000);
}
async function loadOrders() { try { const d = await api('/api/admin/orders', {method: 'GET'}); orders = d.orders; statuses = d.statuses; } catch {} }
async function loadLog() { try { changeLog = await api('/api/admin/log', {method: 'GET'}); } catch {} }
async function loadTextDefaults() {
  try {
    const html = await (await fetch('/index.html', {cache: 'no-store'})).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    textDefaults = MadarTexts.collect(doc).map(({key, scope, tag, value, br}) => ({key, scope, tag, value, br}));
  } catch { textDefaults = []; }
}

// ——— التنقل ———
function renderNav() {
  const unread = orders.filter(o => !o.read).length;
  let group = '', html = '';
  PAGES.forEach(p => {
    if (p.group !== group) { group = p.group; html += `<small>${group}</small>`; }
    html += `<button type="button" data-page="${p.id}" class="${p.id === page ? 'active' : ''}"><i>${p.icon}</i><span>${p.title}</span>${p.badge && unread ? `<b>${unread}</b>` : ''}</button>`;
  });
  $('#sideNav').innerHTML = html;
  $('#sideBrand').textContent = content?.settings?.brand || 'مَدار';
}
$('#sideNav').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) go(b.dataset.page); });
function go(id, push = true) {
  if (!PAGES.some(p => p.id === id)) id = 'overview';
  page = id; if (push) history.replaceState(null, '', '#' + id);
  const p = PAGES.find(x => x.id === id);
  $('#pageTitle').textContent = p.title; $('#pageKicker').textContent = p.group;
  $$('#sideNav button').forEach(b => b.classList.toggle('active', b.dataset.page === id));
  document.body.classList.remove('side-open');
  renderPage(); $('#page').scrollTop = 0; scrollTo(0, 0);
  if (p.preview && innerWidth > 1100 && $('#previewPane').hidden) togglePreview(true);
}
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (content && id && id !== page) go(id, false); });
$('#menuBtn').addEventListener('click', () => document.body.classList.toggle('side-open'));
$('#sideScrim').addEventListener('click', () => document.body.classList.remove('side-open'));

function renderPage() {
  const renderers = {overview, ordersPage, packages, eservices, design, texts, sections, blocks, media, articles, settings, log: logPage};
  const fn = renderers[page === 'orders' ? 'ordersPage' : page === 'log' ? 'log' : page];
  $('#page').innerHTML = fn();
  if (page === 'texts') filterTexts();
}
function head(title, sub, actions = '') { return `<div class="page-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div class="page-actions">${actions}</div></div>`; }
const field = (label, path, opts = {}) => {
  const v = getPath(content, path) ?? '';
  if (opts.type === 'textarea') return `<label class="f ${opts.wide ? 'wide' : ''}"><span>${label}</span><textarea data-bind="${path}" rows="${opts.rows || 3}" maxlength="${opts.max || 600}" ${opts.dir ? `dir="${opts.dir}"` : ''} placeholder="${esc(opts.ph || '')}">${esc(v)}</textarea>${opts.hint ? `<em>${opts.hint}</em>` : ''}</label>`;
  if (opts.type === 'select') return `<label class="f ${opts.wide ? 'wide' : ''}"><span>${label}</span><select data-bind="${path}">${opts.options.map(o => `<option value="${esc(o[0])}" ${String(v) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>${opts.hint ? `<em>${opts.hint}</em>` : ''}</label>`;
  if (opts.type === 'color') return `<label class="f color"><span>${label}</span><div><input type="color" data-bind="${path}" value="${esc(v)}"><code>${esc(v)}</code></div></label>`;
  if (opts.type === 'switch') return `<label class="switch ${opts.wide ? 'wide' : ''}"><input type="checkbox" data-bind="${path}" ${v ? 'checked' : ''}><i></i><span>${label}${opts.hint ? `<small>${opts.hint}</small>` : ''}</span></label>`;
  return `<label class="f ${opts.wide ? 'wide' : ''}"><span>${label}</span><input data-bind="${path}" value="${esc(v)}" maxlength="${opts.max || 200}" ${opts.dir ? `dir="${opts.dir}"` : ''} placeholder="${esc(opts.ph || '')}">${opts.hint ? `<em>${opts.hint}</em>` : ''}</label>`;
};
const statusPill = s => `<span class="pill ${STATUS_COLORS[s] || 'gray'}">${esc(statuses[s] || s)}</span>`;

// ——— لوحة القيادة ———
function overview() {
  const count = s => orders.filter(o => o.status === s).length;
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 13 + i); return d; });
  const perDay = days.map(d => orders.filter(o => { const c = new Date(o.createdAt); return c >= d && c < new Date(d.getTime() + 864e5); }).length);
  const max = Math.max(1, ...perDay);
  const total = orders.length || 1;
  const visible = Object.values(content.visibility).filter(Boolean).length;
  return `${head('نظرة شاملة على المنصة', 'الطلبات والخدمات والمحتوى في مكان واحد.', `<button class="btn ghost" data-go="orders">كل الطلبات ←</button>`)}
  <div class="kpis">
    <article class="k blue"><span>طلبات جديدة</span><b>${count('new')}</b><small>${orders.filter(o => !o.read).length} غير مقروءة</small></article>
    <article class="k violet"><span>قيد المراجعة والتنفيذ</span><b>${count('review') + count('progress') + count('waiting')}</b><small>${count('waiting')} بانتظار العميل</small></article>
    <article class="k green"><span>طلبات مكتملة</span><b>${count('done')}</b><small>من أصل ${orders.length} طلب</small></article>
    <article class="k amber"><span>الخدمات المعروضة</span><b>${content.services.length + content.govServices.length}</b><small>${content.services.length} باقات · ${content.govServices.length} خدمة منفردة</small></article>
  </div>
  <div class="grid-2">
    <article class="panel"><div class="panel-head"><h3>الطلبات خلال 14 يومًا</h3><span class="muted">${perDay.reduce((a, b) => a + b, 0)} طلب</span></div>
      <div class="bars">${perDay.map((n, i) => `<div title="${n} طلب — ${fmtDate(days[i], false)}"><i style="height:${Math.max(3, n / max * 100)}%"></i><small>${days[i].getDate()}</small></div>`).join('')}</div></article>
    <article class="panel"><div class="panel-head"><h3>توزيع الطلبات حسب الحالة</h3></div>
      <div class="dist">${Object.keys(statuses).map(s => `<div><span>${statusPill(s)}</span><i><u class="${STATUS_COLORS[s]}" style="width:${count(s) / total * 100}%"></u></i><b>${count(s)}</b></div>`).join('')}</div></article>
  </div>
  <div class="grid-2">
    <article class="panel"><div class="panel-head"><h3>أحدث الطلبات</h3><button class="link" data-go="orders">عرض الكل</button></div>
      ${orders.slice(0, 6).map(o => `<button class="mini-order ${o.read ? '' : 'unread'}" data-order="${o.id}"><div><b>${esc(o.name)}</b><small>${esc(o.service)} · ${fmtDate(o.createdAt)}</small></div>${statusPill(o.status)}</button>`).join('') || '<div class="empty small">لا توجد طلبات بعد. ستظهر هنا فور إرسالها من الموقع.</div>'}</article>
    <article class="panel"><div class="panel-head"><h3>آخر التغييرات</h3><button class="link" data-go="log">السجل الكامل</button></div>
      ${changeLog.slice(0, 6).map(l => `<div class="log-row"><i></i><div><b>${esc(l.area)}</b><small>${esc(l.detail)} · ${fmtDate(l.at)}</small></div></div>`).join('') || '<div class="empty small">لا توجد تغييرات مسجلة بعد.</div>'}</article>
  </div>
  <div class="quick">
    ${[['design', '🎨', 'غيّر الألوان والخطوط', 'مع معاينة حية'], ['texts', '✎', 'عدّل أي نص في الموقع', `${textDefaults?.length || 0} نصًا قابلًا للتعديل`], ['sections', '◫', 'رتّب الأقسام وأخفِها', `${visible} من ${Object.keys(content.visibility).length} ظاهر`], ['eservices', '☰', 'أدر الخدمات والأسعار', `${content.entities.length} جهة حكومية`]].map(([id, ic, t, s]) => `<button data-go="${id}"><i>${ic}</i><b>${t}</b><small>${s}</small></button>`).join('')}
  </div>`;
}

// ——— الطلبات ———
function filteredOrders() {
  const q = orderSearch.trim().toLowerCase();
  return orders.filter(o => (orderFilter === 'all' || (orderFilter === 'unread' ? !o.read : o.status === orderFilter)) && (!q || `${o.id} ${o.name} ${o.phone} ${o.email} ${o.service} ${o.items.join(' ')} ${o.need}`.toLowerCase().includes(q)));
}
function ordersPage() {
  const rows = filteredOrders(), tabs = [['all', 'الكل', orders.length], ['unread', 'غير مقروءة', orders.filter(o => !o.read).length], ...Object.keys(statuses).map(s => [s, statuses[s], orders.filter(o => o.status === s).length])];
  return `${head('إدارة الطلبات', 'كل الطلبات المرسلة من الموقع — افتح أي طلب لتغيير حالته أو إضافة ملاحظة للعميل.', `<button class="btn ghost" data-act="refresh-orders">⟳ تحديث</button><button class="btn ghost" data-act="export-orders">⇩ تصدير Excel</button>`)}
  <div class="tabs">${tabs.map(([k, l, n]) => `<button data-order-filter="${k}" class="${orderFilter === k ? 'active' : ''}">${l} <b>${n}</b></button>`).join('')}</div>
  <div class="searchbar"><span>⌕</span><input id="orderSearch" type="search" placeholder="ابحث بالاسم أو الجوال أو رقم الطلب أو الخدمة…" value="${esc(orderSearch)}"></div>
  <div class="table orders-table">
    <div class="tr th"><span>الطلب</span><span>العميل</span><span>الخدمة</span><span>المصدر</span><span>الحالة</span><span>التاريخ</span></div>
    ${rows.map(o => `<button class="tr ${o.read ? '' : 'unread'}" data-order="${o.id}"><span class="mono">${o.id}</span><span><b>${esc(o.name)}</b><small dir="ltr">${esc(o.phone)}</small></span><span>${esc(o.service)}${o.items.length ? `<small>${o.items.length} عنصر</small>` : ''}</span><span><small>${SOURCES[o.source] || ''}</small></span><span>${statusPill(o.status)}</span><span><small>${fmtDate(o.createdAt)}</small></span></button>`).join('') || `<div class="empty">${orders.length ? 'لا توجد طلبات مطابقة.' : 'لا توجد طلبات بعد. عند إرسال أي طلب من الموقع سيظهر هنا فورًا.'}</div>`}
  </div>`;
}
function openOrder(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  openOrderId = id;
  const wa = o.phone.replace(/\D/g, '').replace(/^0/, '966');
  $('#drawerCard').innerHTML = `
    <div class="drawer-head"><div><small>${SOURCES[o.source] || ''} · ${fmtDate(o.createdAt)}</small><h2 id="drawerTitle">${o.id}</h2></div><button class="icon-btn" data-close-drawer aria-label="إغلاق">×</button></div>
    <div class="drawer-body">
      <section class="cust"><div class="avatar">${esc(o.name.slice(0, 1))}</div><div><b>${esc(o.name)}</b><small>${esc(o.customerType || 'عميل')}</small></div>
        <div class="cust-actions"><a class="btn ghost sm" href="tel:${esc(o.phone)}">☎ اتصال</a><a class="btn ghost sm" href="https://wa.me/${wa}" target="_blank" rel="noopener">واتساب</a>${o.email ? `<a class="btn ghost sm" href="mailto:${esc(o.email)}">✉ بريد</a>` : ''}</div></section>
      <dl class="facts"><div><dt>الجوال</dt><dd dir="ltr">${esc(o.phone)}</dd></div><div><dt>البريد</dt><dd>${esc(o.email || '—')}</dd></div><div class="wide"><dt>الخدمة</dt><dd>${esc(o.service)}</dd></div></dl>
      ${o.items.length ? `<h4>الخدمات المطلوبة (${o.items.length})</h4><ul class="items">${o.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      ${o.need ? `<h4>وصف الاحتياج</h4><p class="need">${esc(o.need).replace(/\n/g, '<br>')}</p>` : ''}
      <h4>إدارة الطلب</h4>
      <div class="form-grid">
        <label class="f"><span>الحالة</span><select id="oStatus">${Object.entries(statuses).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="f"><span>المسؤول عن الطلب</span><input id="oAssignee" value="${esc(o.assignee)}" maxlength="80" placeholder="اسم الموظف"></label>
        <label class="f"><span>قيمة العرض</span><input id="oQuote" value="${esc(o.quote)}" maxlength="40" placeholder="مثال: 1,200 ر.س"></label>
        <label class="f wide"><span>ملاحظة تظهر للعميل عند التتبع</span><textarea id="oPublic" rows="2" maxlength="400" placeholder="مثال: بانتظار صورة السجل التجاري">${esc(o.publicNote)}</textarea></label>
      </div>
      <button class="btn primary" data-act="save-order">حفظ تحديث الطلب</button>
      <h4>ملاحظات داخلية</h4>
      <div class="notes">${o.notes.map(n => `<div><small>${fmtDate(n.at)}</small><p>${esc(n.text)}</p></div>`).join('') || '<small class="muted">لا توجد ملاحظات.</small>'}</div>
      <div class="note-add"><textarea id="oNote" rows="2" placeholder="أضف ملاحظة لا يراها العميل…"></textarea><button class="btn ghost" data-act="add-note">إضافة</button></div>
      <h4>سجل الحالة</h4>
      <ol class="timeline">${o.history.map(h => `<li><b>${esc(statuses[h.status] || h.status)}</b><small>${fmtDate(h.at)}</small></li>`).join('')}</ol>
      <div class="danger-zone"><button class="btn danger" data-act="delete-order">حذف الطلب نهائيًا</button><button class="btn ghost sm" data-act="toggle-read">${o.read ? 'تعليم كغير مقروء' : 'تعليم كمقروء'}</button></div>
    </div>`;
  $('#orderDrawer').classList.add('open'); $('#orderDrawer').setAttribute('aria-hidden', 'false');
  if (!o.read) patchOrder({read: true}, true);
}
function closeDrawer() { $('#orderDrawer').classList.remove('open'); $('#orderDrawer').setAttribute('aria-hidden', 'true'); openOrderId = null; }
async function patchOrder(body, silent = false) {
  try {
    const updated = await api(`/api/admin/orders/${openOrderId}`, {method: 'PATCH', body: JSON.stringify(body)});
    orders = orders.map(o => o.id === updated.id ? updated : o);
    if (!silent) { toast('تم تحديث الطلب'); openOrder(updated.id); loadLog(); }
    renderNav(); if (page === 'orders' || page === 'overview') renderPage();
  } catch (e) { toast(e.message, 'error'); }
}
function exportOrders() {
  const rows = [['رقم الطلب', 'التاريخ', 'الحالة', 'الاسم', 'الجوال', 'البريد', 'صفة العميل', 'الخدمة', 'العناصر', 'الوصف', 'المسؤول', 'قيمة العرض', 'المصدر']]
    .concat(filteredOrders().map(o => [o.id, fmtDate(o.createdAt), statuses[o.status], o.name, o.phone, o.email, o.customerType, o.service, o.items.join(' | '), o.need, o.assignee, o.quote, SOURCES[o.source] || '']));
  const csv = '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`).join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'})); a.download = `madar-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

// ——— الباقات ———
function packages() {
  return `${head('الباقات', 'تظهر في «مستكشف الباقات» بالموقع ويمكن طلبها مباشرة. كل عنصر في «النطاق» في سطر مستقل.', `<button class="btn primary" data-act="add" data-list="services">+ باقة جديدة</button>`)}
  <div class="cards">${content.services.map((s, i) => `<article class="card" data-list="services" data-i="${i}">
    <div class="card-top"><i class="chip-icon" style="background:${esc(s.color)}">${esc(s.icon)}</i><b>${esc(s.title)}</b>${reorder('services', i)}</div>
    <div class="form-grid">
      <label class="f wide"><span>اسم الباقة</span><input data-f="title" value="${esc(s.title)}" maxlength="80"></label>
      <label class="f wide"><span>الوصف</span><textarea data-f="desc" rows="2" maxlength="220">${esc(s.desc)}</textarea></label>
      <label class="f"><span>السعر</span><input data-f="price" value="${esc(s.price)}" maxlength="40"></label>
      <label class="f"><span>المدة</span><input data-f="duration" value="${esc(s.duration)}" maxlength="40"></label>
      <label class="f"><span>الفئة المناسبة</span><input data-f="audience" value="${esc(s.audience)}" maxlength="80"></label>
      <label class="f"><span>التصنيف</span><select data-f="cat">${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${s.cat === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="f"><span>الرمز</span><input data-f="icon" value="${esc(s.icon)}" maxlength="3"></label>
      <label class="f color"><span>لون البطاقة</span><div><input type="color" data-f="color" value="${esc(s.color)}"></div></label>
      <label class="f wide"><span>النطاق (${s.features.length})</span><textarea data-f="features" data-lines rows="4">${esc(s.features.join('\n'))}</textarea></label>
    </div></article>`).join('') || '<div class="empty">لا توجد باقات.</div>'}</div>`;
}
const reorder = (list, i) => `<span class="reorder"><button data-act="up" data-list="${list}" data-i="${i}" title="أعلى">↑</button><button data-act="down" data-list="${list}" data-i="${i}" title="أسفل">↓</button><button class="del" data-act="remove" data-list="${list}" data-i="${i}" title="حذف">×</button></span>`;

// ——— الخدمات المنفردة ———
function eservices() {
  const count = k => content.govServices.filter(s => s.entity === k).length;
  return `${head('الخدمات الحكومية المنفردة', `${content.entities.length} جهة · ${content.govServices.length} خدمة. اكتب كل خدمة في سطر: <b>اسم الخدمة | السعر</b> — اترك السعر فارغًا ليظهر «حسب الطلب».`, `<button class="btn primary" data-act="add" data-list="entities">+ جهة جديدة</button>`)}
  <div class="searchbar"><span>⌕</span><input id="entityFilter" type="search" placeholder="تصفية الجهات أو البحث عن خدمة…"></div>
  <div class="cards two">${content.entities.map((e, i) => `<article class="card" data-list="entities" data-i="${i}" data-search="${esc(e.name + ' ' + content.govServices.filter(s => s.entity === e.key).map(s => s.title).join(' '))}">
    <div class="card-top"><i class="chip-icon" style="background:${esc(e.color)}">${esc(e.icon)}</i><b>${esc(e.name)}</b><small class="muted">${count(e.key)} خدمة</small>${reorder('entities', i)}</div>
    <div class="form-grid">
      <label class="f wide"><span>اسم الجهة</span><input data-f="name" value="${esc(e.name)}" maxlength="60"></label>
      <label class="f"><span>الرمز</span><input data-f="icon" value="${esc(e.icon)}" maxlength="4"></label>
      <label class="f color"><span>اللون</span><div><input type="color" data-f="color" value="${esc(e.color)}"></div></label>
      <label class="f wide"><span>وصف مختصر</span><input data-f="desc" value="${esc(e.desc)}" maxlength="200"></label>
      <label class="f wide"><span>الخدمات</span><textarea data-f="services" data-lines rows="9" class="mono-lines">${esc(content.govServices.filter(s => s.entity === e.key).map(s => s.price ? `${s.title} | ${s.price}` : s.title).join('\n'))}</textarea></label>
    </div></article>`).join('')}</div>`;
}

// ——— التصميم ———
function design() {
  const t = content.theme, s = content.settings;
  return `${head('التصميم والهوية البصرية', 'كل تغيير يظهر فورًا في المعاينة الحية، ولا يُنشر للزوار إلا بعد الضغط على «حفظ ونشر».', `<button class="btn ghost" data-act="reset" data-scope="design">استعادة التصميم الافتراضي</button>`)}
  <article class="panel"><div class="panel-head"><h3>قوالب ألوان جاهزة</h3></div>
    <div class="presets">${PRESETS.map((p, i) => `<button data-preset="${i}" class="${s.primary === p.primary && t.deep === p.deep ? 'active' : ''}"><span>${[p.primary, p.deep, p.accent, p.gold].map(c => `<i style="background:${c}"></i>`).join('')}</span><b>${p.name}</b></button>`).join('')}</div></article>
  <article class="panel"><div class="panel-head"><h3>الألوان</h3></div><div class="form-grid cols-5">
    ${field('اللون الرئيسي', 'settings.primary', {type: 'color'})}${field('اللون الداكن', 'theme.deep', {type: 'color'})}${field('لون التمييز', 'theme.accent', {type: 'color'})}${field('اللون الذهبي', 'theme.gold', {type: 'color'})}${field('لون النصوص', 'theme.ink', {type: 'color'})}
  </div></article>
  <article class="panel"><div class="panel-head"><h3>الخطوط والاسم</h3></div><div class="form-grid">
    ${field('اسم العلامة', 'settings.brand', {max: 40})}
    ${field('خط العناوين', 'theme.fontHead', {type: 'select', options: FONTS.map(f => [f, f])})}
    ${field('خط النصوص', 'theme.fontBody', {type: 'select', options: FONTS.map(f => [f, f])})}
    <div class="font-sample wide" style="--fh:'${esc(t.fontHead)}';--fb:'${esc(t.fontBody)}'"><b>كل ما تحتاجه منشأتك في مسار واحد</b><p>نؤسس أعمالك وننفّذ معاملاتك بمتابعة شفافة من أول طلب حتى الإنجاز.</p></div>
  </div></article>
  <article class="panel"><div class="panel-head"><h3>الحركة والأنيميشن</h3></div><div class="form-grid">
    ${field('الحركة في الموقع', 'settings.motion', {type: 'select', options: [['on', 'مفعّلة'], ['off', 'متوقفة']]})}
    ${field('مستوى الحركة', 'settings.motionLevel', {type: 'select', options: [['soft', 'هادئة'], ['rich', 'غنية']]})}
  </div></article>
  <article class="panel"><div class="panel-head"><h3>CSS مخصص (متقدم)</h3><small class="muted">لأي تعديل شكلي غير متاح أعلاه</small></div>
    ${field('', 'customCss', {type: 'textarea', rows: 8, max: 30000, dir: 'ltr', wide: true, ph: '.hero h1 { letter-spacing: 0; }\n.btn-primary { border-radius: 30px; }'})}</article>`;
}

// ——— النصوص ———
function texts() {
  const groups = {};
  (textDefaults || []).forEach(t => (groups[t.scope] = groups[t.scope] || []).push(t));
  const edited = Object.keys(content.texts).length;
  return `${head('نصوص الموقع', `عدّل أي عنوان أو فقرة أو زر في الصفحة الرئيسية. الحقل الفارغ يعني استخدام النص الأصلي. استخدم <b>|</b> لكسر السطر في العناوين الكبيرة. (${edited} نص معدّل)`, `<button class="btn ghost" data-act="reset" data-scope="texts">استعادة كل النصوص الأصلية</button>`)}
  <article class="panel"><div class="panel-head"><h3>الواجهة الرئيسية</h3></div><div class="form-grid">
    ${field('العنوان الرئيسي', 'settings.heroTitle', {wide: true, max: 140, hint: 'الجزء بعد | يظهر بلون مميز في سطر ثانٍ'})}
    ${field('الوصف تحت العنوان', 'settings.heroSubtitle', {type: 'textarea', wide: true, max: 300})}
    ${field('ساعات العمل (الشريط العلوي)', 'settings.hours', {max: 60})}
  </div></article>
  <div class="searchbar"><span>⌕</span><input id="textFilter" type="search" placeholder="ابحث في نصوص الموقع…"></div>
  ${Object.entries(groups).map(([scope, items]) => `<article class="panel text-group" data-scope="${scope}"><div class="panel-head"><h3>${MadarTexts.scopeNames[scope] || scope}</h3><button class="link" data-peek="${scope}">عرض في المعاينة</button></div>
    <div class="text-list">${items.map(t => { const v = content.texts[t.key] || ''; return `<label class="tf ${v ? 'edited' : ''}" data-text-search="${esc(t.value + ' ' + v)}"><span><em>${esc(t.tag)}</em>${esc(t.value.slice(0, 60))}${t.value.length > 60 ? '…' : ''}</span>${t.value.length > 70 || t.br ? `<textarea rows="2" data-text-key="${t.key}" placeholder="${esc(t.value)}">${esc(v)}</textarea>` : `<input data-text-key="${t.key}" value="${esc(v)}" placeholder="${esc(t.value)}">`}${v ? `<button type="button" class="link" data-reset-text="${t.key}">استعادة</button>` : ''}</label>`; }).join('')}</div></article>`).join('')}`;
}
function filterTexts() {
  const q = ($('#textFilter')?.value || '').trim();
  $$('.text-group').forEach(g => { let any = false; g.querySelectorAll('.tf').forEach(l => { const hit = !q || l.dataset.textSearch.includes(q); l.hidden = !hit; any = any || hit; }); g.hidden = !any; });
}

// ——— الأقسام ———
function sections() {
  const order = content.layout.order;
  return `${head('الأقسام والترتيب', 'أظهر أو أخفِ أي قسم، وغيّر ترتيب ظهوره في الصفحة الرئيسية. الواجهة الرئيسية تبقى في الأعلى دائمًا.')}
  <div class="sec-list">${order.map((k, i) => `<div class="sec ${content.visibility[k] ? '' : 'off'}"><b class="num">${i + 1}</b><div><b>${SECTION_NAMES[k] || k}</b><small>${content.visibility[k] ? 'ظاهر للزوار' : 'مخفي حاليًا'}</small></div>
    <button class="link" data-peek-sec="${k}">عرض</button>
    <span class="reorder"><button data-act="sec-up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button data-act="sec-down" data-i="${i}" ${i === order.length - 1 ? 'disabled' : ''}>↓</button></span>
    <label class="switch"><input type="checkbox" data-bind="visibility.${k}" ${content.visibility[k] ? 'checked' : ''}><i></i></label></div>`).join('')}</div>`;
}

// ——— الأسئلة والقطاعات والمراحل ———
function blocks() {
  return `${head('محتوى الأقسام', 'الأسئلة الشائعة، شريط القطاعات، ومراحل «في أي مرحلة تقف؟».')}
  <article class="panel"><div class="panel-head"><h3>الأسئلة الشائعة (${content.faq.length})</h3><button class="btn ghost sm" data-act="add" data-list="faq">+ سؤال</button></div>
    ${content.faq.map((f, i) => `<div class="row-card" data-list="faq" data-i="${i}"><div class="form-grid"><label class="f wide"><span>السؤال</span><input data-f="q" value="${esc(f.q)}" maxlength="200"></label><label class="f wide"><span>الإجابة</span><textarea data-f="a" rows="2" maxlength="1200">${esc(f.a)}</textarea></label></div>${reorder('faq', i)}</div>`).join('')}</article>
  <article class="panel"><div class="panel-head"><h3>شريط القطاعات المتحرك</h3><small class="muted">قطاع في كل سطر</small></div>
    <label class="f wide"><textarea data-sectors rows="6">${esc(content.sectors.join('\n'))}</textarea></label></article>
  <article class="panel"><div class="panel-head"><h3>مراحل المنشأة</h3><button class="btn ghost sm" data-act="add" data-list="stages">+ مرحلة</button></div>
    ${content.stages.map((s, i) => `<div class="row-card" data-list="stages" data-i="${i}"><div class="form-grid">
      <label class="f"><span>اسم التبويب</span><input data-f="label" value="${esc(s.label)}" maxlength="40"></label>
      <label class="f"><span>العنوان</span><input data-f="title" value="${esc(s.title)}" maxlength="100"></label>
      <label class="f wide"><span>الوصف</span><textarea data-f="desc" rows="2" maxlength="260">${esc(s.desc)}</textarea></label>
      <label class="f wide"><span>العناصر (سطر لكل عنصر)</span><textarea data-f="items" data-lines rows="3">${esc(s.items.join('\n'))}</textarea></label></div>${reorder('stages', i)}</div>`).join('')}</article>`;
}

// ——— الصور والمقالات ———
function imageCard(item, i, list) {
  return `<article class="card media-card" data-list="${list}" data-i="${i}">
    <div class="media-img"><img src="${esc(item.image)}" alt=""><label class="btn ghost sm upload">⇪ رفع صورة<input type="file" accept="image/jpeg,image/png,image/webp" data-upload></label></div>
    <div class="form-grid">
      <label class="f"><span>التصنيف</span><input data-f="tag" value="${esc(item.tag)}" maxlength="40"></label>
      <label class="f"><span>العنوان</span><input data-f="title" value="${esc(item.title)}" maxlength="120"></label>
      <label class="f wide"><span>الوصف</span><textarea data-f="desc" rows="2" maxlength="260">${esc(item.desc)}</textarea></label>
      <label class="f wide"><span>رابط الصورة (أو ارفع صورة)</span><input data-f="image" value="${esc(item.image)}" maxlength="500" dir="ltr"></label>
      <label class="f wide"><span>وصف الصورة لمحركات البحث</span><input data-f="alt" value="${esc(item.alt)}" maxlength="160"></label>
      ${list === 'articles' ? `<label class="f wide"><span>رابط المقال</span><input data-f="link" value="${esc(item.link || '#')}" maxlength="500" dir="ltr"></label>` : ''}
    </div>${reorder(list, i)}</article>`;
}
function media() { return `${head('الصور والأنشطة', 'تظهر في أعلى الصفحة؛ البطاقة الأولى كبيرة. JPG أو PNG أو WebP حتى 2MB.', `<button class="btn primary" data-act="add" data-list="activities">+ نشاط</button>`)}<div class="cards">${content.activities.map((x, i) => imageCard(x, i, 'activities')).join('')}</div>`; }
function articles() { return `${head('مركز المعرفة', 'المقالات والأدلة المعروضة في قسم «مركز المعرفة».', `<button class="btn primary" data-act="add" data-list="articles">+ مقال</button>`)}<div class="cards">${content.articles.map((x, i) => imageCard(x, i, 'articles')).join('')}</div>`; }

// ——— الإعدادات ———
function settings() {
  return `${head('الإعدادات والتواصل', 'بيانات التواصل والروابط وتحسين محركات البحث وشريط الإعلانات.')}
  <article class="panel"><div class="panel-head"><h3>بيانات التواصل</h3></div><div class="form-grid">
    ${field('رقم الجوال', 'settings.phone', {max: 24, dir: 'ltr'})}${field('رقم واتساب (إن اختلف)', 'settings.whatsapp', {max: 24, dir: 'ltr', ph: 'نفس رقم الجوال'})}
    ${field('البريد الإلكتروني', 'settings.email', {max: 100, dir: 'ltr'})}${field('المدينة / العنوان', 'settings.city', {max: 100})}</div></article>
  <article class="panel"><div class="panel-head"><h3>شريط الإعلان أعلى الموقع</h3></div><div class="form-grid">
    ${field('إظهار شريط الإعلان', 'announcement.on', {type: 'switch', wide: true})}
    ${field('نص الإعلان', 'announcement.text', {max: 160, wide: true, ph: 'مثال: خصم 20% على الاشتراك السنوي حتى نهاية الشهر'})}
    ${field('رابط (اختياري)', 'announcement.link', {max: 300, dir: 'ltr', wide: true, ph: '#packages أو https://…'})}</div></article>
  <article class="panel"><div class="panel-head"><h3>حسابات التواصل الاجتماعي</h3></div><div class="form-grid">
    ${[['x', 'إكس (تويتر)'], ['linkedin', 'لينكدإن'], ['instagram', 'إنستغرام'], ['tiktok', 'تيك توك'], ['snapchat', 'سناب شات']].map(([k, l]) => field(l, 'social.' + k, {dir: 'ltr', max: 300, ph: 'https://'})).join('')}</div></article>
  <article class="panel"><div class="panel-head"><h3>محركات البحث</h3></div><div class="form-grid">
    ${field('عنوان الصفحة', 'seo.title', {wide: true, max: 90})}${field('الوصف', 'seo.description', {type: 'textarea', wide: true, max: 300})}</div></article>
  <article class="panel"><div class="panel-head"><h3>النسخ الاحتياطي والاستعادة</h3></div>
    <p class="muted">نزّل نسخة كاملة من المحتوى والطلبات، أو استعد المحتوى من نسخة سابقة.</p>
    <div class="btn-row"><a class="btn ghost" href="/api/admin/backup" download>⇩ تنزيل نسخة احتياطية</a><label class="btn ghost">⇪ استعادة من ملف<input type="file" accept="application/json" id="restoreFile" hidden></label>
    <button class="btn danger-ghost" data-act="reset" data-scope="catalog">استعادة الخدمات المنفردة الافتراضية</button><button class="btn danger-ghost" data-act="reset" data-scope="packages">استعادة الباقات الافتراضية</button></div></article>
  <article class="panel ${session.open ? 'warn-panel' : ''}"><div class="panel-head"><h3>الدخول إلى لوحة التحكم</h3></div>
    ${session.open ? `<p><b>الدخول مفتوح حاليًا بلا كلمة مرور.</b> أي شخص يعرف رابط <code dir="ltr">/admin.html</code> يستطيع تعديل الموقع ورؤية بيانات العملاء. لإعادة الحماية: احذف المتغير <code>ADMIN_OPEN</code> من إعدادات Railway، وتبقى كلمة المرور الحالية <code>ADMIN_PASSWORD</code> هي المستخدمة.</p>` : '<p>لوحة التحكم محمية بكلمة مرور.</p>'}</article>`;
}

// ——— السجل ———
function logPage() {
  return `${head('سجل التغييرات', 'كل عملية نشر أو تحديث طلب تُسجّل هنا (آخر 300 عملية).', '<button class="btn ghost" data-act="refresh-log">⟳ تحديث</button>')}
  <article class="panel">${changeLog.map(l => `<div class="log-row"><i></i><div><b>${esc(l.area)}</b><small>${esc(l.detail)}</small></div><small class="muted">${fmtDate(l.at)}</small></div>`).join('') || '<div class="empty">لا توجد تغييرات بعد.</div>'}</article>`;
}

// ——— جمع القوائم من الحقول ———
function collectItem(card) {
  const list = card.dataset.list, i = +card.dataset.i, item = content[list][i];
  if (!item) return;
  card.querySelectorAll('[data-f]').forEach(input => {
    const f = input.dataset.f;
    if (list === 'entities' && f === 'services') return;
    item[f] = input.hasAttribute('data-lines') ? lines(input.value) : input.value;
  });
  if (list === 'entities') {
    const e = item, old = content.govServices.filter(s => s.entity === e.key);
    const next = lines(card.querySelector('[data-f="services"]').value).map((ln, n) => { const [title, price = ''] = ln.split('|').map(x => clean(x, 100)); const prev = old.find(s => s.title === title); return title ? {id: prev ? prev.id : Date.now() + n, entity: e.key, title, price: clean(price, 30)} : null; }).filter(Boolean);
    const firstIdx = content.govServices.findIndex(s => s.entity === e.key);
    const others = content.govServices.filter(s => s.entity !== e.key);
    const at = firstIdx < 0 ? others.length : content.govServices.slice(0, firstIdx).filter(s => s.entity !== e.key).length;
    others.splice(at, 0, ...next); content.govServices = others;
  }
}
const blanks = {
  services: () => ({id: Date.now(), cat: 'growth', icon: '✦', title: 'باقة جديدة', desc: 'وصف مختصر للباقة.', audience: '', duration: '', price: '', features: [], color: '#e8f5fd'}),
  entities: () => ({key: 'e' + Date.now().toString(36), name: 'جهة جديدة', icon: '✦', color: '#e8f5fd', desc: ''}),
  faq: () => ({q: 'سؤال جديد؟', a: 'اكتب الإجابة هنا.'}),
  stages: () => ({key: 's' + Date.now().toString(36), label: 'مرحلة جديدة', title: 'عنوان المرحلة', desc: '', items: []}),
  activities: () => ({id: Date.now(), tag: 'نشاط', title: 'عنوان النشاط', desc: '', image: 'assets/images/saudi-business-establishment.svg', alt: 'صورة نشاط'}),
  articles: () => ({id: Date.now(), tag: 'مقال', title: 'عنوان المقال', desc: 'نبذة مختصرة.', image: 'assets/images/company-formation.svg', alt: 'صورة المقال', link: '#'})
};

// ——— الأحداث ———
const pageEl = $('#page');
pageEl.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.bind) { setPath(content, t.dataset.bind, t.type === 'checkbox' ? t.checked : t.value); if (t.type === 'color') { const code = t.parentElement.querySelector('code'); if (code) code.textContent = t.value; } if (t.dataset.bind.startsWith('theme.font')) { const s = $('.font-sample'); s?.style.setProperty(t.dataset.bind === 'theme.fontHead' ? '--fh' : '--fb', `'${t.value}'`); loadFont(t.value); } markDirty(); return; }
  if (t.dataset.textKey) { const v = t.value.trim(); if (v) content.texts[t.dataset.textKey] = v; else delete content.texts[t.dataset.textKey]; t.closest('.tf').classList.toggle('edited', !!v); markDirty(); return; }
  if (t.hasAttribute('data-sectors')) { content.sectors = lines(t.value); markDirty(); return; }
  if (t.id === 'orderSearch') { orderSearch = t.value; const pos = t.selectionStart; renderPage(); const n = $('#orderSearch'); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.id === 'textFilter') return filterTexts();
  if (t.id === 'entityFilter') { const q = t.value.trim(); $$('[data-list="entities"]').forEach(c => c.hidden = q && !c.dataset.search.includes(q)); return; }
  const card = t.closest('[data-list][data-i]'); if (card && t.dataset.f) { collectItem(card); markDirty(); }
});
pageEl.addEventListener('change', async e => {
  const t = e.target;
  if (t.type === 'checkbox' && t.dataset.bind?.startsWith('visibility.')) renderPage();
  if (t.dataset.upload !== undefined && t.files?.[0]) {
    const file = t.files[0], card = t.closest('[data-list]'); if (file.size > 2_000_000) return toast('الصورة أكبر من 2MB', 'error');
    const label = t.closest('.upload'); label.classList.add('loading');
    try { const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); const out = await api('/api/admin/upload', {method: 'POST', body: JSON.stringify({data})}); content[card.dataset.list][+card.dataset.i].image = out.url; renderPage(); markDirty(); toast('تم رفع الصورة — اضغط «حفظ ونشر»'); }
    catch (err) { toast(err.message, 'error'); } finally { label.classList.remove('loading'); }
  }
  if (t.id === 'restoreFile' && t.files?.[0]) {
    try { const data = JSON.parse(await t.files[0].text()); if (!confirm('سيُستبدل محتوى الموقع الحالي بمحتوى الملف. متابعة؟')) return; content = await api('/api/admin/restore', {method: 'POST', body: JSON.stringify({content: data.content || data})}); published = JSON.stringify(content); markDirty(); renderPage(); loadLog(); toast('تمت استعادة المحتوى ونشره'); }
    catch (err) { toast(err.message || 'ملف غير صالح', 'error'); }
  }
});
pageEl.addEventListener('click', async e => {
  const b = e.target.closest('button, [data-go], [data-order]'); if (!b) return;
  if (b.dataset.go) return go(b.dataset.go);
  if (b.dataset.order) return openOrder(b.dataset.order);
  if (b.dataset.orderFilter) { orderFilter = b.dataset.orderFilter; return renderPage(); }
  if (b.dataset.preset) { const p = PRESETS[+b.dataset.preset]; content.settings.primary = p.primary; Object.assign(content.theme, {deep: p.deep, accent: p.accent, gold: p.gold, ink: p.ink}); renderPage(); return markDirty(); }
  if (b.dataset.resetText) { delete content.texts[b.dataset.resetText]; renderPage(); filterTexts(); return markDirty(); }
  if (b.dataset.peek) return peek(`[data-cms-scope="${b.dataset.peek}"]`);
  if (b.dataset.peekSec) return peek(SECTION_ANCHORS[b.dataset.peekSec]);
  const act = b.dataset.act; if (!act) return;
  const list = b.dataset.list, i = +b.dataset.i;
  if (act === 'add') { const arr = content[list]; arr.unshift(blanks[list]()); renderPage(); markDirty(); return; }
  if (act === 'remove') { const label = list === 'entities' ? `«${content.entities[i].name}» وجميع خدماتها` : 'هذا العنصر'; if (!confirm(`حذف ${label}؟`)) return; const [gone] = content[list].splice(i, 1); if (list === 'entities') content.govServices = content.govServices.filter(s => s.entity !== gone.key); renderPage(); markDirty(); return; }
  if (act === 'up' || act === 'down') { const arr = content[list], j = act === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; renderPage(); markDirty(); return; }
  if (act === 'sec-up' || act === 'sec-down') { const arr = content.layout.order, j = act === 'sec-up' ? i - 1 : i + 1; [arr[i], arr[j]] = [arr[j], arr[i]]; renderPage(); markDirty(); peek(SECTION_ANCHORS[arr[j]]); return; }
  if (act === 'reset') { const names = {design: 'التصميم', texts: 'كل النصوص', catalog: 'الخدمات المنفردة', packages: 'الباقات'}; if (!confirm(`استعادة ${names[b.dataset.scope]} إلى الوضع الافتراضي ونشرها فورًا؟`)) return; try { content = await api('/api/admin/reset', {method: 'POST', body: JSON.stringify({scope: b.dataset.scope})}); published = JSON.stringify(content); renderPage(); markDirty(); loadLog(); toast('تمت الاستعادة'); } catch (err) { toast(err.message, 'error'); } return; }
  if (act === 'refresh-orders') { await loadOrders(); renderNav(); renderPage(); return toast('تم تحديث الطلبات'); }
  if (act === 'export-orders') return exportOrders();
  if (act === 'refresh-log') { await loadLog(); return renderPage(); }
});
$('#orderDrawer').addEventListener('click', async e => {
  if (e.target.closest('[data-close-drawer]')) return closeDrawer();
  const act = e.target.closest('[data-act]')?.dataset.act; if (!act) return;
  const o = orders.find(x => x.id === openOrderId);
  if (act === 'save-order') return patchOrder({status: $('#oStatus').value, assignee: $('#oAssignee').value, quote: $('#oQuote').value, publicNote: $('#oPublic').value});
  if (act === 'add-note') { const v = $('#oNote').value.trim(); if (!v) return; return patchOrder({note: v}); }
  if (act === 'toggle-read') return patchOrder({read: !o.read});
  if (act === 'delete-order') { if (!confirm(`حذف الطلب ${o.id} نهائيًا؟ لا يمكن التراجع.`)) return; try { await api(`/api/admin/orders/${o.id}`, {method: 'DELETE'}); orders = orders.filter(x => x !== o); closeDrawer(); renderNav(); renderPage(); toast('تم حذف الطلب'); } catch (err) { toast(err.message, 'error'); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (isDirty()) save(); } });

// ——— الحفظ والنشر ———
const areaName = () => PAGES.find(p => p.id === page)?.title || 'المحتوى';
async function save() {
  const btn = $('#saveBtn'); btn.disabled = true; btn.textContent = 'جارٍ النشر…';
  try { content = await api('/api/admin/content', {method: 'PUT', headers: {'x-change-area': encodeURIComponent(areaName())}, body: JSON.stringify(content)}); published = JSON.stringify(content); renderNav(); renderPage(); loadLog(); toast('تم الحفظ والنشر للزوار ✓'); }
  catch (err) { toast(err.message, 'error'); }
  finally { btn.textContent = 'حفظ ونشر'; markDirty(); }
}
$('#saveBtn').addEventListener('click', save);

// ——— المعاينة الحية ———
const frame = $('#previewFrame');
let previewReady = false, previewTimer, pendingPeek = null;
function togglePreview(force) {
  const show = typeof force === 'boolean' ? force : $('#previewPane').hidden;
  $('#previewPane').hidden = !show; document.body.classList.toggle('with-preview', show);
  $('#previewBtn').setAttribute('aria-pressed', String(show));
  if (show && frame.src === 'about:blank') { previewReady = false; frame.src = '/?preview=1'; }
}
$('#previewBtn').addEventListener('click', () => togglePreview());
$('#previewReload').addEventListener('click', () => { previewReady = false; frame.src = '/?preview=' + Date.now(); });
frame.addEventListener('load', () => { if (frame.src === 'about:blank') return; previewReady = true; setTimeout(() => sendPreview(pendingPeek), 400); pendingPeek = null; });
function sendPreview(scrollTo) { if (!previewReady || !content) return; try { frame.contentWindow.postMessage({type: 'madar:preview', content: JSON.parse(JSON.stringify(content)), scrollTo}, location.origin); } catch {} }
function schedulePreview() { if ($('#previewPane').hidden) return; clearTimeout(previewTimer); previewTimer = setTimeout(() => sendPreview(), 250); }
function peek(selector) { if ($('#previewPane').hidden) togglePreview(true); if (!previewReady) { pendingPeek = selector; return; } sendPreview(selector); }
$$('.seg [data-device]').forEach(b => b.addEventListener('click', () => { $$('.seg [data-device]').forEach(x => x.classList.toggle('active', x === b)); $('#frameWrap').dataset.device = b.dataset.device; }));
const loadedFonts = new Set(['Alexandria', 'Tajawal']);
function loadFont(f) { if (loadedFonts.has(f)) return; loadedFonts.add(f); const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;700;800&display=swap`; document.head.append(l); }

start();
