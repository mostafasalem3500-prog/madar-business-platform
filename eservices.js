// مستكشف الخدمات الحكومية المنفردة — يعرض الخدمات حسب الجهة، مع بحث وسلة طلب.
(()=>{
  const root=document.getElementById('eservices');
  if(!root)return;
  const $=s=>root.querySelector(s);
  const clean=(v,m=120)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,m);
  const esc=v=>clean(v,300).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const color=v=>/^#[0-9a-f]{6}$/i.test(String(v))?v:'#e8f5fd';
  const toArabicDigits=n=>Number(n).toLocaleString('en-US');
  const priceValue=p=>{const m=String(p||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/,/g,'').match(/\d+(?:\.\d+)?/);return m?Number(m[0]):0};
  let entities=[],services=[],active='',term='';
  const picked=new Map();

  const list=$('#esList'),side=$('#esEntities'),head=$('#esHead'),cart=document.getElementById('esCart');

  function counts(){const c={};services.forEach(s=>c[s.entity]=(c[s.entity]||0)+1);return c}
  function renderStats(){
    const prices=services.map(s=>priceValue(s.price)).filter(Boolean);
    $('#esTotal').textContent=toArabicDigits(services.length);
    $('#esEntityCount').textContent=toArabicDigits(entities.length);
    $('#esFrom').textContent=prices.length?toArabicDigits(Math.min(...prices)):'—';
  }
  function renderSide(){
    const c=counts();
    side.innerHTML=entities.filter(e=>c[e.key]).map(e=>`<button type="button" role="tab" aria-selected="${e.key===active&&!term}" data-entity="${esc(e.key)}" class="${e.key===active&&!term?'active':''}" style="--e-color:${color(e.color)}"><i aria-hidden="true">${esc(e.icon)}</i><span>${esc(e.name)}</span><b>${toArabicDigits(c[e.key])}</b></button>`).join('');
  }
  function row(s,showEntity){
    const e=entities.find(x=>x.key===s.entity)||{};const on=picked.has(s.id);
    return `<article class="es-item${on?' picked':''}" data-id="${s.id}"><div><h4>${esc(s.title)}</h4>${showEntity?`<small>${esc(e.icon)} ${esc(e.name)}</small>`:''}</div><span class="es-price${s.price?'':' quote'}">${s.price?esc(s.price):'حسب الطلب'}</span><button type="button" class="es-add" data-pick="${s.id}" aria-pressed="${on}" aria-label="${on?'إزالة':'إضافة'} ${esc(s.title)}">${on?'✓':'+'}</button></article>`;
  }
  function render(){
    const q=term.toLowerCase();
    if(q){
      const rows=services.filter(s=>{const e=entities.find(x=>x.key===s.entity);return `${s.title} ${e?.name||''}`.toLowerCase().includes(q)});
      head.innerHTML=`<i aria-hidden="true">⌕</i><div><span>نتائج البحث</span><h3>«${esc(term)}»</h3><p>${rows.length?`${toArabicDigits(rows.length)} خدمة مطابقة في جميع الجهات`:'لا توجد خدمة مطابقة — صف معاملتك وسننفذها لك.'}</p></div>`;
      head.style.setProperty('--e-color','#eef9ff');
      list.innerHTML=rows.slice(0,120).map(s=>row(s,true)).join('')||`<div class="es-empty"><p>لم نجد «${esc(term)}» في القائمة، لكن فريقنا ينفذ أغلب المعاملات الحكومية.</p><button type="button" class="btn btn-primary" data-custom>اطلب معاملة غير مدرجة ←</button></div>`;
    }else{
      const e=entities.find(x=>x.key===active)||entities[0];if(!e){list.innerHTML='';return}
      active=e.key;const rows=services.filter(s=>s.entity===e.key);
      head.style.setProperty('--e-color',color(e.color));
      head.innerHTML=`<i aria-hidden="true">${esc(e.icon)}</i><div><span>${toArabicDigits(rows.length)} خدمة</span><h3>${esc(e.name)}</h3>${e.desc?`<p>${esc(e.desc)}</p>`:''}</div><button type="button" class="es-all" data-all="${esc(e.key)}">${rows.every(s=>picked.has(s.id))?'إلغاء التحديد':'تحديد الكل'}</button>`;
      list.innerHTML=rows.map(s=>row(s,false)).join('');
    }
    renderSide();renderCart();
  }
  function renderCart(){
    const items=[...picked.values()],sum=items.reduce((a,s)=>a+priceValue(s.price),0),quotes=items.filter(s=>!priceValue(s.price)).length;
    cart.classList.toggle('show',items.length>0);cart.setAttribute('aria-hidden',String(!items.length));if(!items.length)cart.classList.remove('expanded');
    cart.querySelector('#esCartCount').textContent=toArabicDigits(items.length);
    cart.querySelector('#esCartSum').textContent=sum?`${toArabicDigits(sum)} ر.س${quotes?' + خدمات بعرض سعر':''}`:'بعرض سعر';
    cart.querySelector('#esCartList').innerHTML=items.map(s=>`<span>${esc(s.title)}<button type="button" data-unpick="${s.id}" aria-label="إزالة ${esc(s.title)}">×</button></span>`).join('');
  }
  function toggle(id){const s=services.find(x=>x.id===id);if(!s)return;picked.has(id)?picked.delete(id):picked.set(id,s);render()}

  side.addEventListener('click',e=>{const b=e.target.closest('[data-entity]');if(!b)return;active=b.dataset.entity;term='';$('#esSearch').value='';render();if(matchMedia('(max-width:900px)').matches)head.scrollIntoView({behavior:'smooth',block:'nearest'})});
  root.addEventListener('click',e=>{
    const p=e.target.closest('[data-pick]');if(p){toggle(Number(p.dataset.pick));return}
    const all=e.target.closest('[data-all]');if(all){const rows=services.filter(s=>s.entity===all.dataset.all),every=rows.every(s=>picked.has(s.id));rows.forEach(s=>every?picked.delete(s.id):picked.set(s.id,s));render();return}
    if(e.target.closest('[data-custom]'))order([]);
    const item=e.target.closest('.es-item');if(item&&!e.target.closest('button'))toggle(Number(item.dataset.id));
  });
  let timer;$('#esSearch').addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>{term=clean(e.target.value,60);render()},120)});
  cart.addEventListener('click',e=>{const u=e.target.closest('[data-unpick]');if(u){picked.delete(Number(u.dataset.unpick));render();return}if(e.target.closest('#esClear')){picked.clear();render();return}if(e.target.closest('#esOrder'))order([...picked.values()]);if(e.target.closest('#esToggle'))cart.classList.toggle('expanded')});

  function order(items){
    if(typeof window.openWizard!=='function')return;
    window.openWizard('خدمة حكومية منفردة');
    const form=document.getElementById('requestForm');if(!form)return;
    const select=form.elements.service;if(select&&![...select.options].some(o=>o.value==='خدمة حكومية منفردة'))select.add(new Option('خدمة حكومية منفردة','خدمة حكومية منفردة'),1);if(select)select.value='خدمة حكومية منفردة';
    if(form.elements.need)form.elements.need.value=items.length?'الخدمات المطلوبة:\n'+items.map(s=>{const e=entities.find(x=>x.key===s.entity);return `• ${s.title} — ${e?.name||''}`}).join('\n'):'';
  }

  function load(data){
    if(!data||!Array.isArray(data.entities)||!Array.isArray(data.govServices))return false;
    entities=data.entities.map(e=>({key:clean(e.key,24),name:clean(e.name,60),icon:clean(e.icon,4)||'✦',color:color(e.color),desc:clean(e.desc,200)}));
    services=data.govServices.map((s,i)=>({id:Number(s.id)||i+1,entity:clean(s.entity,24),title:clean(s.title,100),price:clean(s.price,30)})).filter(s=>s.title);
    if(!entities.some(e=>e.key===active))active=entities[0]?.key||'';
    [...picked.keys()].forEach(id=>{const s=services.find(x=>x.id===id);s?picked.set(id,s):picked.delete(id)});
    renderStats();render();return true;
  }
  document.addEventListener('madar:content',e=>load(e.detail));
  if(!load(window.MADAR_CONTENT))fetch('data/catalog.json',{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():null).then(d=>{if(!services.length)load(d)}).catch(()=>{});
})();
