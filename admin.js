const defaults=[{id:1,cat:'startup',icon:'▦',title:'تأسيس الشركات',desc:'من اختيار الكيان حتى إصدار السجل وتجهيز المنشأة للتشغيل.',color:'#e5f5ff'},{id:2,cat:'government',icon:'⌁',title:'الخدمات الحكومية',desc:'تنفيذ ومتابعة معاملات المنشأة عبر الجهات والمنصات ذات العلاقة.',color:'#e8f9f5'},{id:3,cat:'government',icon:'٪',title:'الزكاة والضريبة',desc:'خدمات التسجيل والإقرارات والمتابعة المحاسبية للمنشآت.',color:'#fff5dd'},{id:4,cat:'government',icon:'♙',title:'الموارد البشرية',desc:'خدمات قوى ومدد والتأمينات وتنظيم دورة حياة الموظف.',color:'#f0edff'},{id:5,cat:'consulting',icon:'◎',title:'دراسات الجدوى',desc:'دراسة السوق والجوانب الفنية والمالية قبل قرار الاستثمار.',color:'#e5f8f8'},{id:6,cat:'consulting',icon:'⌘',title:'الحوكمة والامتثال',desc:'أطر واضحة للصلاحيات والسياسات والمخاطر واستدامة القرار.',color:'#eaf0ff'},{id:7,cat:'growth',icon:'↗',title:'التخطيط ومؤشرات الأداء',desc:'تحويل الرؤية إلى أهداف ومبادرات ومؤشرات قابلة للقياس.',color:'#e7f8f1'},{id:8,cat:'growth',icon:'✓',title:'الجودة وشهادات ISO',desc:'تحليل الفجوات وبناء الأنظمة والتأهيل لمتطلبات الجودة.',color:'#eaf7ff'},{id:9,cat:'government',icon:'⌂',title:'التراخيص البلدية والسلامة',desc:'إصدار وتجديد التراخيص ومتابعة متطلبات السلامة.',color:'#fff2e8'},{id:10,cat:'growth',icon:'◈',title:'التحول الرقمي',desc:'أتمتة الإجراءات وربط البيانات وبناء لوحات قيادة للأعمال.',color:'#e9f5ff'},{id:11,cat:'startup',icon:'◇',title:'خدمات المستثمرين',desc:'مسار تأسيس منظم للمستثمر السعودي والخليجي والأجنبي.',color:'#eef9e9'},{id:12,cat:'government',icon:'®',title:'الملكية الفكرية',desc:'تسجيل العلامات التجارية ومتابعة الطلبات وحماية الأصول.',color:'#f7edff'}];
function safeParse(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function cleanText(value,max=180){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max)}
function escapeHTML(value){return cleanText(value,500).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
let services=safeParse('madar_services',defaults);
if(!Array.isArray(services))services=[...defaults];
services=services.slice(0,100);
const titles={overview:'نظرة عامة',content:'الهوية والمحتوى',media:'الصور والحركة',services:'إدارة الخدمات',orders:'إدارة الطلبات',analytics:'التقارير والتحليلات'};
document.querySelectorAll('aside nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('aside nav button,.admin-page').forEach(x=>x.classList.remove('active'));
b.classList.add('active');
document.getElementById(b.dataset.page).classList.add('active');
document.getElementById('pageTitle').textContent=titles[b.dataset.page]});
const settings=safeParse('madar_settings',{});
brandInput.value=settings.brand||'مَدار';
colorInput.value=settings.primary||'#1477c9';
phoneInput.value=settings.phone||'+966 50 000 0000';
heroTitleInput.value=settings.heroTitle||'كل ما تحتاجه منشأتك | في مسار واحد واضح.';
heroSubtitleInput.value=settings.heroSubtitle||'نؤسس أعمالك، ننفّذ معاملاتك، ونطوّر منظومتك الإدارية بمتابعة شفافة من أول طلب حتى الإنجاز.';
motionInput.value=settings.motion||'on';
motionLevelInput.value=settings.motionLevel||'soft';
settingsForm.onsubmit=e=>{e.preventDefault();
Object.assign(settings,{brand:cleanText(brandInput.value,40),primary:/^#[0-9a-f]{6}$/i.test(colorInput.value)?colorInput.value:'#1477c9',phone:cleanText(phoneInput.value,24)});
localStorage.setItem('madar_settings',JSON.stringify(settings));
toast('تم حفظ إعدادات الهوية')};
mediaForm.onsubmit=e=>{e.preventDefault();
Object.assign(settings,{heroTitle:cleanText(heroTitleInput.value,140),heroSubtitle:cleanText(heroSubtitleInput.value,300),motion:motionInput.value==='off'?'off':'on',motionLevel:motionLevelInput.value==='rich'?'rich':'soft'});
localStorage.setItem('madar_settings',JSON.stringify(settings));
toast('تم حفظ إعدادات الصور والحركة')};
function render(){serviceCount.textContent=services.length;
serviceAdminList.innerHTML=services.map(s=>`<article class="service-item"><i>${escapeHTML(s.icon||'✦')}</i><div><b>${escapeHTML(s.title||'خدمة أعمال')}</b><small>${escapeHTML(s.cat||'consulting')}</small></div><button data-delete="${Number(s.id)||0}" title="حذف">×</button></article>`).join('')}render();
serviceAdminList.onclick=e=>{const b=e.target.closest('[data-delete]');
if(!b)return;
services=services.filter(s=>s.id!==+b.dataset.delete);
localStorage.setItem('madar_services',JSON.stringify(services));
render();
toast('تم حذف الخدمة من هذه النسخة')};
addService.onclick=()=>{const title=prompt('اسم الخدمة الجديدة');
if(!cleanText(title,80))return;
const desc=cleanText(prompt('وصف مختصر للخدمة')||'خدمة أعمال متخصصة قابلة للتخصيص حسب احتياج المنشأة.',220);
services.push({id:Date.now(),cat:'consulting',icon:'✦',title:cleanText(title,80),desc,color:'#e8f5fd'});
localStorage.setItem('madar_services',JSON.stringify(services));
render();
toast('تمت إضافة الخدمة')};
function toast(m){adminToast.textContent=m;
adminToast.classList.add('show');
setTimeout(()=>adminToast.classList.remove('show'),2300)}
