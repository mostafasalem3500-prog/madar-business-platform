// تحديد النصوص القابلة للتعديل في الصفحة الرئيسية — يُستخدم في الموقع ولوحة التحكم بنفس الطريقة
// حتى تتطابق المفاتيح. كل عنصر نصي داخل [data-cms-scope] يحصل على مفتاح «النطاق.الرقم».
(function (global) {
  const SKIP = '[data-no-cms],script,style,svg,.brand,.social,#servicesGrid,#stagePanel,#stageTabs,.es-shell,.es-stats,.articles,.visual-grid,.marquee-track,.faq-list,#trackResult,.avatars,.command-wrap,.track-search,.no-results';
  const LETTERS = /\p{L}{2,}/u;
  function ownText(el) { return [...el.childNodes].some(n => n.nodeType === 3 && LETTERS.test(n.textContent)); }
  function collect(doc) {
    const out = [];
    doc.querySelectorAll('[data-cms-scope]').forEach(scope => {
      let n = 0;
      const walk = el => {
        for (const c of el.children) {
          if (c.matches(SKIP)) continue;
          const br = !!c.querySelector(':scope > br');
          if (ownText(c) || br) {
            out.push({key: scope.dataset.cmsScope + '.' + (n++), scope: scope.dataset.cmsScope, el: c, br, em: !!c.querySelector(':scope > em'), tag: c.tagName.toLowerCase(), value: read(c, br)});
            if (br) continue;
          }
          walk(c);
        }
      };
      walk(scope);
    });
    return out;
  }
  function read(el, br) {
    if (br) return [...el.childNodes].map(n => n.nodeName === 'BR' ? '|' : n.textContent).join('').replace(/\s*\|\s*/g, ' | ').replace(/\s+/g, ' ').trim();
    return [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
  }
  function write(item, value) {
    const el = item.el;
    if (item.br) {
      const parts = String(value).split('|').map(s => s.trim());
      el.replaceChildren();
      parts.forEach((p, i) => {
        if (i) el.append(document.createElement('br'));
        if (item.em && i && i === parts.length - 1) { const em = document.createElement('em'); em.textContent = p; el.append(em); }
        else el.append(document.createTextNode(p));
      });
      return;
    }
    const texts = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (!texts.length) { el.prepend(document.createTextNode(value)); return; }
    const t = texts[0], lead = t.textContent.match(/^\s*/)[0], trail = t.textContent.match(/\s*$/)[0];
    t.textContent = lead + value + trail;
    texts.slice(1).forEach(x => { x.textContent = ' '; });
  }
  const scopeNames = {topbar: 'الشريط العلوي', hero: 'الواجهة الرئيسية', visual: 'الصور والأنشطة', value: 'القيمة للسوق السعودي', method: 'منهجية العمل', services: 'مستكشف الباقات', journey: 'رحلة الخدمة', compare: 'قبل وبعد', solutions: 'مراحل المنشأة', packages: 'الباقات', eservices: 'الخدمات المنفردة', track: 'تتبع الطلب', knowledge: 'مركز المعرفة', deliver: 'المخرجات', faq: 'الأسئلة الشائعة', cta: 'الدعوة الختامية', footer: 'التذييل'};
  global.MadarTexts = {collect, read, write, scopeNames};
})(window);
