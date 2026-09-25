const defaultServices=[
{id:101,cat:'startup',icon:'▦',title:'باقة التأسيس',desc:'إدارة الخدمات الحكومية للمنشأة منذ التأسيس خلال أول ثلاثة أشهر.',audience:'من 1 إلى 4 موظفين',duration:'3 أشهر',price:'4,500 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','مكتب العمل','الجوازات','التأمينات الاجتماعية','البريد السعودي'],color:'#e5f5ff'},
{id:102,cat:'consulting',icon:'◇',title:'باقة المستثمر الأجنبي',desc:'مسار تأسيس ومتابعة للخدمات الحكومية المخصصة للمستثمر الأجنبي داخل المملكة.',audience:'المستثمر الأجنبي',duration:'3 أشهر',price:'18,000 ر.س',features:['وزارة الاستثمار','وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','مكتب العمل','الجوازات','التأمينات الاجتماعية'],color:'#eef0ff'},
{id:103,cat:'consulting',icon:'◈',title:'باقة المستثمر الخليجي',desc:'متابعة إجراءات التأسيس والمنصات الحكومية للمستثمر الخليجي خلال مرحلة الانطلاق.',audience:'المستثمر الخليجي',duration:'3 أشهر',price:'6,000 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','مكتب العمل','الجوازات','التأمينات الاجتماعية','البريد السعودي'],color:'#e8f9f5'},
{id:104,cat:'government',icon:'B',title:'الباقة البرونزية',desc:'إدارة دورية للمنصات الحكومية الأساسية للمنشآت الصغيرة ضمن نطاق تشغيلي واضح.',audience:'من 5 إلى 14 موظفًا',duration:'3 أشهر',price:'2,940 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','الغرف التجارية','أبشر أعمال والجوازات','التأمينات الاجتماعية','العنوان الوطني'],color:'#fff1e4'},
{id:105,cat:'government',icon:'S',title:'الباقة الفضية',desc:'متابعة موسعة للمنصات الحكومية تناسب المنشآت التي تنمو في عدد الموظفين والالتزامات.',audience:'من 15 إلى 29 موظفًا',duration:'3 أشهر',price:'5,220 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','الغرف التجارية','أبشر أعمال والجوازات','التأمينات الاجتماعية','العنوان الوطني'],color:'#edf3f7'},
{id:106,cat:'government',icon:'G',title:'الباقة الذهبية',desc:'إدارة متقدمة للمنصات الحكومية للمنشآت المتوسطة مع حجم عمليات والتزامات أكبر.',audience:'من 30 إلى 49 موظفًا',duration:'3 أشهر',price:'7,350 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','الغرف التجارية','أبشر أعمال والجوازات','التأمينات الاجتماعية','العنوان الوطني'],color:'#fff5dd'},
{id:107,cat:'government',icon:'◆',title:'الباقة الماسية',desc:'إدارة شاملة للمنصات الحكومية للمنشآت الأكبر مع متابعة أكثر اتساعًا للاحتياجات التشغيلية.',audience:'حتى 99 موظفًا',duration:'3 أشهر',price:'11,880 ر.س',features:['وزارة الاستثمار','وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','مكتب العمل','الجوازات','التأمينات الاجتماعية'],color:'#e9f7ff'},
{id:108,cat:'government',icon:'P',title:'الباقة البلاتينية',desc:'مستوى متابعة موسع للمنشآت ذات الاحتياج الحكومي والتشغيلي الكبير.',audience:'منشآت ذات تشغيل موسع',duration:'3 أشهر',price:'18,000 ر.س',features:['وزارة التجارة','منصة بلدي','الدفاع المدني','منصة مدد','منصة قوى','هيئة الزكاة','مكتب العمل','الجوازات','التأمينات الاجتماعية','البريد السعودي'],color:'#eeeaff'},
{id:109,cat:'growth',icon:'◎',title:'استشارة خاصة في الخدمات الحكومية',desc:'جلسة متخصصة لفهم الحالة وتحديد المسار الأنسب للتعامل مع الخدمة الحكومية المطلوبة.',audience:'الأفراد والمنشآت',duration:'جلسة خاصة',price:'199 ر.س',features:['تشخيص الاحتياج','تحديد الجهة والمنصة','مراجعة المتطلبات','توضيح خطوات التنفيذ'],color:'#e7f8f1'}
];
function cleanText(value,max=180){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max)}
function escapeHTML(value){return cleanText(value,1200).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function safeColor(value){return /^#[0-9a-f]{6}$/i.test(String(value))?String(value):'#e8f5fd'}
function normalizeService(s,index){return{id:Number.isFinite(+s?.id)?+s.id:index+1,cat:['startup','government','consulting','growth'].includes(s?.cat)?s.cat:'consulting',icon:cleanText(s?.icon||'✦',3),title:cleanText(s?.title||'خدمة أعمال',80),desc:cleanText(s?.desc||'',220),audience:cleanText(s?.audience||'',80),duration:cleanText(s?.duration||'',40),price:cleanText(s?.price||'',40),features:(Array.isArray(s?.features)?s.features:[]).slice(0,16).map(x=>cleanText(x,80)).filter(Boolean),color:safeColor(s?.color)}}
let services=defaultServices.map(normalizeService);
const $id=id=>document.getElementById(id);

// ——— مراحل المنشأة ———
let stages=[
{key:'idea',label:'لدي فكرة مشروع',title:'حوّل الفكرة إلى قرار واضح',desc:'نختبر جدوى الفكرة ونحدّد نموذج العمل والمتطلبات قبل الالتزام بالتكاليف.',items:['دراسة جدوى أولية','تحليل السوق والمنافسين','اختيار نموذج العمل','خريطة التأسيس']},
{key:'launch',label:'أؤسس منشأة',title:'أسّس كيانك على أساس سليم',desc:'ننسّق خطوات التأسيس والتراخيص ونجهزك للانتقال إلى التشغيل.',items:['اختيار الكيان القانوني','إجراءات السجل والتأسيس','التراخيص اللازمة','ملف جاهزية التشغيل']},
{key:'operate',label:'أبدأ التشغيل',title:'شغّل منشأتك بوضوح وانضباط',desc:'نرتّب الالتزامات الحكومية والموارد البشرية والعمليات اليومية.',items:['إدارة المنصات الحكومية','سياسات الموارد البشرية','التقويم النظامي','إجراءات التشغيل']},
{key:'scale',label:'أبحث عن النمو',title:'ابنِ منظومة قابلة للنمو',desc:'نربط الاستراتيجية بالحوكمة والعمليات والمؤشرات لتوسّع أكثر ثباتًا.',items:['خطة استراتيجية','مؤشرات أداء KPI','حوكمة وصلاحيات','تحول رقمي وجودة']}];
const panel=$id('stagePanel');
function showStage(key){const s=stages.find(x=>x.key===key)||stages[0];if(!s)return;const n=String(stages.indexOf(s)+1).padStart(2,'0');panel.innerHTML=`<span class="stage-number">${n}</span><h3>${escapeHTML(s.title)}</h3><p>${escapeHTML(s.desc)}</p><div class="stage-list">${s.items.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div>`}
function renderStageTabs(){const tabs=$id('stageTabs'),active=tabs.querySelector('.active')?.dataset.stage;tabs.innerHTML=stages.map((s,i)=>`<button type="button" data-stage="${escapeHTML(s.key)}"><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(s.label)}</button>`).join('');const current=tabs.querySelector(`[data-stage="${active}"]`)||tabs.querySelector('button');if(current){current.classList.add('active');showStage(current.dataset.stage)}}
$id('stageTabs').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(!b)return;document.querySelectorAll('#stageTabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');showStage(b.dataset.stage)});
renderStageTabs();

// ——— الباقات ———
const grid=$id('servicesGrid');
function renderServices(filter='all',term=''){const q=cleanText(term,80).toLowerCase();const rows=services.filter(s=>(filter==='all'||s.cat===filter)&&(!q||(`${s.title} ${s.desc} ${s.audience} ${s.features.join(' ')}`).toLowerCase().includes(q)));grid.innerHTML=rows.map(s=>`<article class="service-card reveal visible" style="--card-color:${safeColor(s.color)}"><div class="service-card-top"><span class="service-icon">${escapeHTML(s.icon)}</span>${s.price?`<strong>${escapeHTML(s.price)}</strong>`:''}</div><h3>${escapeHTML(s.title)}</h3>${s.audience?`<span class="service-audience">${escapeHTML(s.audience)}</span>`:''}<p>${escapeHTML(s.desc)}</p><div class="service-meta">${s.duration?`<span>◷ ${escapeHTML(s.duration)}</span>`:''}<span>${s.features.length} عناصر ضمن النطاق</span></div><a href="#" data-service="${escapeHTML(s.title)}">عرض تفاصيل الباقة ←</a></article>`).join('');$id('noResults').hidden=rows.length>0}
function syncServiceOptions(){const select=document.querySelector('#requestForm select[name="service"]');if(!select)return;const current=select.value;select.replaceChildren(new Option('اختر الباقة أو الخدمة',''));services.forEach(s=>select.add(new Option(s.title,s.title)));['خدمة حكومية منفردة','تأسيس شركة أو منشأة','دراسة جدوى','حوكمة وتطوير مؤسسي','موارد بشرية','لست متأكدًا'].forEach(t=>select.add(new Option(t,t)));if([...select.options].some(o=>o.value===current))select.value=current}
const refreshServices=()=>renderServices(document.querySelector('.filters .active')?.dataset.filter||'all',$id('serviceSearch').value);
renderServices();syncServiceOptions();
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');refreshServices()});
$id('serviceSearch').addEventListener('input',refreshServices);$id('searchBtn').onclick=refreshServices;

// ——— الحركة والتنقل ———
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting||entry.target.dataset.done)return;entry.target.dataset.done='1';const el=entry.target,target=+el.dataset.count,suffix=el.dataset.suffix||'',started=performance.now();function tick(now){const p=Math.min(1,(now-started)/1100),value=Math.round(target*(1-Math.pow(1-p,3)));el.textContent=value+suffix;if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}),{threshold:.6});document.querySelectorAll('.counter').forEach(x=>counterObserver.observe(x));
addEventListener('scroll',()=>$id('header').classList.toggle('scrolled',scrollY>10));
const menu=document.querySelector('.menu-btn'),nav=document.querySelector('nav');menu.onclick=()=>{nav.classList.toggle('open');menu.setAttribute('aria-expanded',nav.classList.contains('open'))};document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// ——— نموذج الطلب ———
const modal=$id('wizardModal'),form=$id('requestForm');let step=1,orderContext={source:'wizard',items:[]};
function updateWizard(){document.querySelectorAll('.wizard-step').forEach(x=>x.classList.toggle('active',+x.dataset.step===step));$id('stepCount').textContent=`${step} / 4`;$id('wizardProgress').style.width=`${step*25}%`;$id('prevStep').hidden=step===1||step===4;const next=$id('nextStep');next.hidden=step===4;next.disabled=false;next.innerHTML=step===3?'إرسال الطلب <span>←</span>':'التالي <span>←</span>'}
function openWizard(service='',context={}){step=1;form.reset();orderContext={source:context.source||'wizard',items:Array.isArray(context.items)?context.items:[]};if(service){const select=form.elements.service;[...select.options].forEach(o=>{if(o.value&&(o.text.includes(service)||service.includes(o.text)))o.selected=true})}updateWizard();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
window.openWizard=openWizard;
function closeWizard(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.addEventListener('click',e=>{if(e.target.closest('.open-wizard')){e.preventDefault();openWizard()}});
modal.querySelector('.modal-close').onclick=closeWizard;modal.querySelector('.modal-backdrop').onclick=closeWizard;
async function submitOrder(){const next=$id('nextStep');const name=cleanText(form.elements.name.value,80),phone=form.elements.phone.value.replace(/[\s()-]/g,'');if(name.length<2)return toast('أدخل اسمًا صحيحًا');if(!/^(?:\+?966|0)?5\d{8}$/.test(phone))return toast('أدخل رقم جوال سعودي صحيحًا');next.disabled=true;next.textContent='جارٍ الإرسال…';try{const r=await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({customer:form.elements.customer.value,service:form.elements.service.value,need:form.elements.need.value,name,phone,email:form.elements.email.value,items:orderContext.items,source:orderContext.source})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'تعذر إرسال الطلب');$id('generatedId').textContent=data.id;$id('trackInput').value=data.id;$id('trackPhone').value=phone.slice(-4);step=4;updateWizard();document.dispatchEvent(new CustomEvent('madar:order-sent'))}catch(err){toast(err.message||'تعذر إرسال الطلب، حاول مجددًا');updateWizard()}}
$id('nextStep').onclick=()=>{if(step===1&&!form.elements.customer.value)return toast('اختر صفة العميل للمتابعة');if(step===2&&!form.elements.service.value)return toast('اختر نوع الخدمة للمتابعة');if(step===3)return submitOrder();step=Math.min(4,step+1);updateWizard()};
$id('prevStep').onclick=()=>{step=Math.max(1,step-1);updateWizard()};

// ——— تفاصيل الباقة ———
const serviceModal=$id('serviceModal');let selectedService='';
function openService(title){const s=services.find(x=>x.title===title);if(!s)return;selectedService=s.title;$id('detailIcon').textContent=s.icon;$id('detailTitle').textContent=s.title;$id('detailDesc').textContent=s.desc;$id('detailAudience').textContent=s.audience||'حسب احتياج المنشأة';$id('detailDuration').textContent=s.duration||'تحدد بعد المراجعة';$id('detailPrice').textContent=s.price||'عرض مخصص';$id('detailPoints').innerHTML=(s.features.length?s.features:['مراجعة أولية للاحتياج','تحديد المتطلبات بوضوح','متابعة رقمية لكل مرحلة']).map(x=>`<span>✓ ${escapeHTML(x)}</span>`).join('');serviceModal.classList.add('open');serviceModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeService(){serviceModal.classList.remove('open');serviceModal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
grid.addEventListener('click',e=>{const a=e.target.closest('[data-service]');if(a){e.preventDefault();openService(a.dataset.service)}});serviceModal.querySelector('.service-close').onclick=closeService;serviceModal.querySelector('.modal-backdrop').onclick=closeService;serviceModal.querySelector('.detail-order').onclick=()=>{closeService();openWizard(selectedService,{source:'package',items:[selectedService]})};

// ——— لوحة العميل التجريبية ———
const dash=$id('dashboardModal');$id('demoDashboard').onclick=()=>{dash.classList.add('open');dash.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};function closeDash(){dash.classList.remove('open');document.body.style.overflow=''};dash.querySelector('.dash-close').onclick=closeDash;dash.querySelector('.modal-backdrop').onclick=closeDash;

// ——— تتبّع الطلب ———
$id('trackBtn').onclick=async()=>{const id=$id('trackInput').value.trim().toUpperCase(),last4=$id('trackPhone').value.trim();if(!/^MD-\d{4,6}$/.test(id))return toast('أدخل رقم الطلب بالصيغة MD-12345');if(!/^\d{4}$/.test(last4))return toast('أدخل آخر 4 أرقام من الجوال');const btn=$id('trackBtn');btn.disabled=true;try{const r=await fetch(`/api/track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(last4)}`);const d=await r.json();if(!r.ok)throw new Error(d.error);const box=$id('trackResult'),fmt=v=>new Date(v).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn',{day:'numeric',month:'short'});box.innerHTML=`<div><span>طلب #${escapeHTML(d.id)}</span><b>${escapeHTML(d.service)}</b></div><strong>${d.progress}%</strong><div class="progress"><i style="width:${d.progress}%"></i></div><ol>${d.history.map((h,i)=>`<li class="${i===d.history.length-1?'active':'done'}">${escapeHTML(h.label)} <small>${fmt(h.at)}</small></li>`).join('')}</ol>${d.note?`<p class="track-note">${escapeHTML(d.note)}</p>`:''}`;toast('تم تحديث حالة الطلب: '+d.label)}catch(err){toast(err.message||'لم نجد الطلب')}finally{btn.disabled=false}};

function toast(msg){const t=$id('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),3200)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeWizard();closeDash();closeService()}});
const progressBar=$id('scrollProgress'),backTop=$id('backTop');
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progressBar.style.width=`${max?scrollY/max*100:0}%`;backTop?.classList.toggle('show',scrollY>650)});if(backTop)backTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(800px) rotateY(${x*4}deg) rotateX(${-y*4}deg) translateY(-3px)`});card.addEventListener('pointerleave',()=>card.style.transform='')})}

// ——— تطبيق محتوى لوحة التحكم ———
const cmsSectionSelectors={visualStory:'.visual-story',marquee:'.sector-marquee',saudiValue:'.saudi-value',method:'#method',services:'#services',journey:'#journey',transformation:'.transformation',solutions:'#solutions',packages:'#packages',eservices:'#eservices',track:'#track',knowledge:'#knowledge',deliverables:'.deliverables',faq:'#faq',cta:'#about'};
const cmsTexts=window.MadarTexts?window.MadarTexts.collect(document):[];
const pristine={title:document.title,description:document.querySelector('meta[name="description"]')?.content||'',faq:$id('faqList').innerHTML,marquee:$id('marqueeTrack').innerHTML};
const defaultFonts={head:'Alexandria',body:'Tajawal'};
function setMeta(name,value){const m=document.querySelector(`meta[name="${name}"]`);if(m&&value)m.content=value}
function applyTheme(settings,theme){
  const rootStyle=document.documentElement.style;
  if(/^#[0-9a-f]{6}$/i.test(settings.primary||'')){rootStyle.setProperty('--blue',settings.primary);setMeta('theme-color',settings.primary)}
  const map={deep:'--deep',accent:'--cyan',gold:'--gold',ink:'--ink'};Object.entries(map).forEach(([k,v])=>{if(/^#[0-9a-f]{6}$/i.test(theme?.[k]||''))rootStyle.setProperty(v,theme[k])});
  if(/^#[0-9a-f]{6}$/i.test(theme?.accent||''))rootStyle.setProperty('--light',theme.accent);
  const head=theme?.fontHead||defaultFonts.head,body=theme?.fontBody||defaultFonts.body;let style=$id('cmsFonts');
  if(head===defaultFonts.head&&body===defaultFonts.body){style?.remove();return}
  const fams=[...new Set([head,body])].filter(f=>!['Alexandria','Tajawal'].includes(f));
  let link=$id('cmsFontLink');if(fams.length){if(!link){link=document.createElement('link');link.id='cmsFontLink';link.rel='stylesheet';document.head.append(link)}link.href='https://fonts.googleapis.com/css2?'+fams.map(f=>'family='+f.replace(/ /g,'+')+':wght@400;500;600;700;800').join('&')+'&display=swap'}
  if(!style){style=document.createElement('style');style.id='cmsFonts';document.head.append(style)}
  style.textContent=`body,body *{font-family:"${body}",Tajawal,sans-serif!important}h1,h2,h3,h4,h5,.brand b,.btn,.eyebrow,.price,.counter,.section-head h2,nav a,strong,b{font-family:"${head}",Alexandria,sans-serif!important}`;
}
function applyCMS(data){
  if(!data||typeof data!=='object')return;
  window.MADAR_CONTENT=data;
  const settings=data.settings||{},theme=data.theme||{};
  if(settings.brand)document.querySelectorAll('.brand b').forEach(x=>x.textContent=cleanText(settings.brand,40));
  applyTheme(settings,theme);
  if(settings.heroTitle){const title=$id('heroTitle'),parts=cleanText(settings.heroTitle,140).split('|');title.replaceChildren(document.createTextNode(parts.shift()||''));if(parts.length){title.append(document.createElement('br'));const em=document.createElement('em');em.textContent=parts.join(' ').trim();title.append(em)}}
  if(settings.heroSubtitle)$id('heroSubtitle').textContent=cleanText(settings.heroSubtitle,300);
  if(settings.hours)$id('hoursText').textContent=settings.hours;
  document.body.classList.toggle('motion-off',settings.motion==='off');document.body.classList.toggle('motion-rich',settings.motionLevel==='rich');
  if(settings.phone){const digits=settings.phone.replace(/\D/g,'');document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:+'+digits;a.textContent=settings.phone})}
  const wa=(settings.whatsapp||settings.phone||'').replace(/\D/g,'');if(wa)document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>a.href='https://wa.me/'+wa);
  if(settings.email)document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href='mailto:'+settings.email;a.textContent=settings.email});
  if(settings.city){const contact=document.querySelector('.footer-grid>div:last-child p');if(contact)contact.textContent=settings.city}
  document.querySelectorAll('[data-social]').forEach(a=>{const link=data.social?.[a.dataset.social];if(link){a.href=link;a.target='_blank';a.rel='noopener';a.hidden=false}else if(['tiktok','snapchat'].includes(a.dataset.social))a.hidden=true});
  document.title=data.seo?.title||pristine.title;setMeta('description',data.seo?.description||pristine.description);
  const ann=data.announcement||{};$id('announceBar').hidden=!(ann.on&&ann.text);$id('announceText').textContent=ann.text||'';const al=$id('announceLink');al.hidden=!/^(?:https:\/\/|#)/.test(ann.link||'');if(!al.hidden)al.href=ann.link;
  // النصوص
  const texts=data.texts||{};cmsTexts.forEach(item=>window.MadarTexts.write(item,texts[item.key]||item.value));
  // الأقسام: الإظهار والترتيب
  const main=$id('main'),order=Array.isArray(data.layout?.order)?data.layout.order:Object.keys(cmsSectionSelectors);main.style.display='flex';main.style.flexDirection='column';
  Object.entries(cmsSectionSelectors).forEach(([key,selector])=>{const section=document.querySelector(selector);if(!section)return;section.hidden=data.visibility?.[key]===false;const i=order.indexOf(key);section.style.order=i<0?99:i+1});
  // الأسئلة الشائعة
  if(Array.isArray(data.faq)){const list=$id('faqList');list.innerHTML=data.faq.length?data.faq.map((x,i)=>`<details${i===0?' open':''}><summary>${escapeHTML(x.q)} <i>+</i></summary><p>${escapeHTML(x.a).replace(/\n/g,'<br>')}</p></details>`).join(''):pristine.faq}
  // شريط القطاعات
  if(Array.isArray(data.sectors)&&data.sectors.length){const items=data.sectors.map(s=>`<span>${escapeHTML(s)}</span><i></i>`).join('');$id('marqueeTrack').innerHTML=items+items}
  // المراحل
  if(Array.isArray(data.stages)&&data.stages.length){stages=data.stages;renderStageTabs()}
  // الصور والمقالات
  if(Array.isArray(data.activities)&&data.activities.length){document.querySelector('.visual-grid').innerHTML=data.activities.map((item,index)=>`<article class="visual-card ${index===0?'visual-wide ':''}visible tilt"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.alt||item.title)}" loading="lazy" width="${index===0?1600:1000}" height="${index===0?1000:700}"><div><span>${escapeHTML(item.tag)}</span><h3>${escapeHTML(item.title)}</h3>${item.desc?`<p>${escapeHTML(item.desc)}</p>`:''}</div></article>`).join('')}
  if(Array.isArray(data.articles)&&data.articles.length){document.querySelector('.articles').innerHTML=data.articles.map(item=>`<article class="article visible"><span>${escapeHTML(item.tag)}</span><div class="article-art"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.alt||item.title)}" loading="lazy" width="1000" height="700"></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.desc)}</p><a href="${escapeHTML(item.link||'#')}">اقرأ المقال ←</a></article>`).join('')}
  if(Array.isArray(data.services)){services=data.services.slice(0,100).map(normalizeService);refreshServices();syncServiceOptions()}
  // CSS مخصص
  let css=$id('cmsCustomCss');if(data.customCss){if(!css){css=document.createElement('style');css.id='cmsCustomCss';document.head.append(css)}css.textContent=data.customCss}else css?.remove();
  document.dispatchEvent(new CustomEvent('madar:content',{detail:data}));
}
fetch('/api/content',{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject()).then(applyCMS).catch(()=>{});
// معاينة حية من لوحة التحكم (نفس النطاق فقط)
addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='madar:preview')return;applyCMS(e.data.content);if(e.data.scrollTo){const t=document.querySelector(e.data.scrollTo);t?.scrollIntoView({block:'start'})}});
if(window.parent!==window)document.documentElement.classList.add('in-preview');
