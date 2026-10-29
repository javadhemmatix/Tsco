(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const fa = value => Number(value).toLocaleString('fa-IR');
  const money = value => `${fa(value)} تومان`;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const products = [
    { id:'powerbank', name:'پاوربانک', subtitle:'شارژ همراه، در هر مسیر', price:850000, image:'assets/product-powerbank.webp', specification:'ظرفیت و توان خروجی متناسب با مدل منتخب' },
    { id:'earbuds', name:'هندزفری بی‌سیم', subtitle:'برای شنیدن و همراه بودن', price:950000, image:'assets/product-earbuds.webp', specification:'نوع اتصال و زمان پخش طبق مدل نهایی' },
    { id:'speaker', name:'اسپیکر قابل‌حمل', subtitle:'ریتم خوب لحظه‌های مشترک', price:1150000, image:'assets/product-speaker.webp', specification:'توان و مقاومت بدنه طبق مدل نهایی' },
    { id:'headphones', name:'هدفون', subtitle:'تمرکز بیشتر، تجربه بهتر', price:1250000, image:'assets/product-headphones.webp', specification:'نوع اتصال و میکروفن طبق مدل منتخب' },
    { id:'charger', name:'شارژر خودرو و کابل', subtitle:'انرژی همراه در مسیر', price:650000, image:'assets/product-charger.webp', specification:'نوع درگاه و توان خروجی طبق مدل منتخب' },
    { id:'mouse', name:'ماوس بی‌سیم', subtitle:'یک همراه کاربردی روی میز کار', price:450000, image:'assets/product-mouse.webp', specification:'حسگر و نوع اتصال طبق مدل منتخب' }
  ];
  const bundles = [
    {id:'work', name:'همراهِ هر روز', kicker:'انتخابی برای همکاران شما', category:'work', description:'هدیه‌ای کاربردی برای خوش‌آمدگویی، قدردانی و شروع یک همکاری خوب.', items:['headphones','mouse'], price:1850000, image:'assets/bundle-work.webp', theme:'work', label:'محیط کار', note:'باکس هدیه + کارت پیام'},
    {id:'camp', name:'بیرون از روزمره', kicker:'برای لحظه‌های خارج از دفتر', category:'camp', description:'یک ترکیب شنیدنی برای سفر، طبیعت و دورهمی‌های به‌یادماندنی.', items:['speaker','powerbank'], price:2150000, image:'assets/bundle-camp.webp', theme:'camp', label:'کمپ و طبیعت', note:'باکس هدیه + کارت پیام'},
    {id:'road', name:'همسفرِ لحظه‌ها', kicker:'یک هدیه برای مسیرهای تازه', category:'road', description:'انرژی و موسیقی را همراه کنید؛ از مسیرهای روزانه تا سفرهای دور.', items:['powerbank','charger'], price:1650000, image:'assets/bundle-road.webp', theme:'road', label:'سفر و آفرود', note:'باکس هدیه + کارت پیام'}
  ];
  window.TSCO_DATA = { products, bundles, pricesAreIndicative:true };
  const selected = new Set(['powerbank', 'earbuds']);
  const maxProducts = 4;
  let boxColor = 'مشکی';
  let currentBundle = null;
  let logoURL = null;
  let activeFilter = 'all';
  let reviews = [];
  const storageKey = 'tsco-local-reviews-v2';
  const validReview = review => review && typeof review.org === 'string' && review.org.trim().length > 0 && review.org.length <= 100 && typeof review.text === 'string' && review.text.trim().length > 0 && review.text.length <= 600 && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 && bundles.some(bundle => bundle.id === review.bundle);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) reviews = saved.filter(validReview).slice(0, 30);
  } catch { /* Storage is optional for the standalone file. */ }

  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('is-visible'), 5200);
  }
  function image(src, alt, className = '') {
    return `<img src="${src}" alt="${escape(alt)}" class="${className}" loading="lazy" decoding="async">`;
  }
  function download(filename, content, type = 'text/plain;charset=utf-8') {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob(['\ufeff', content], { type }));
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function renderBundles(category = 'all') {
    activeFilter = category;
    const list = category === 'all' ? bundles : bundles.filter(bundle => bundle.category === category);
    const grid = $('#bundle-grid');
    if (!grid) return;
    grid.innerHTML = list.length ? list.map(bundle => `<article class="bundle-card ${bundle.theme}">
      <button class="bundle-photo" data-bundle="${bundle.id}" aria-label="جزئیات باکس ${bundle.name}">
        ${image(bundle.image, `چیدمان مفهومی باکس ${bundle.name}`)}<span class="bundle-badge">${bundle.label}</span><span class="photo-arrow">${icon('arrow')}</span>
      </button>
      <div class="bundle-content"><span class="card-kicker">${bundle.kicker}</span><h3>${bundle.name}</h3><p>${bundle.description}</p>
        <div class="bundle-contents">${bundle.items.map(id => `<span>${products.find(product => product.id === id).name}</span>`).join('')}</div>
        <div class="card-meta"><div class="price"><small>برآورد هر باکس، از</small><strong>${fa(bundle.price)} <span>تومان</span></strong></div><button class="card-action" data-bundle="${bundle.id}" aria-label="مشاهده باکس ${bundle.name}">${icon('arrow')}</button></div>
      </div></article>`).join('') : `<article class="category-request"><span class="category-request-icon">${icon('box')}</span><div class="card-kicker">طراحی یک ترکیب متفاوت</div><h3>${category === 'beauty' ? 'هدیه‌ای برای حال خوب' : 'یک انتخاب برای دنیای بازی'}</h3><p>برای این دسته، ترکیب اختصاصی را با توجه به موجودی و بودجه سازمان شما پیشنهاد می‌کنیم.</p><button class="button button-red" data-category-request="${category}">دریافت پیشنهاد اختصاصی ${icon('arrow')}</button></article>`;
    $$('#bundle-filters [data-category], [data-category]').forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const status = $('#bundle-status');
    if (status) status.textContent = list.length ? `${fa(list.length)} ترکیب پیشنهادی` : 'ترکیب اختصاصی با مشاوره';
  }
  function getQuantity() {
    const value = Number($('#builder-quantity')?.value || 10);
    return Number.isFinite(value) ? Math.min(100000, Math.max(10, Math.floor(value))) : 10;
  }
  function selectionPrice() {
    return products.filter(product => selected.has(product.id)).reduce((total, product) => total + product.price, 0);
  }
  function renderBuilder() {
    const list = $('#builder-products');
    if (list) list.innerHTML = products.map(product => `<button type="button" class="pick-product ${selected.has(product.id) ? 'is-selected' : ''}" data-product="${product.id}" draggable="true" aria-pressed="${selected.has(product.id)}" aria-label="${selected.has(product.id) ? 'حذف' : 'افزودن'} ${product.name}">
      ${image(product.image, product.name)}<span class="pick-info"><span class="pick-title">${product.name}</span><span class="pick-price">${money(product.price)}</span></span><span class="pick-check">${icon(selected.has(product.id) ? 'check' : 'plus')}</span>
    </button>`).join('');
    const items = $('#box-items');
    if (items) items.innerHTML = products.filter(product => selected.has(product.id)).map(product => `<div class="box-product" draggable="true" data-product="${product.id}">${image(product.image, product.name)}<span>${product.name}</span><button type="button" data-remove-product="${product.id}" aria-label="حذف ${product.name}">${icon('close')}</button></div>`).join('');
    $('#gift-box')?.classList.toggle('is-empty', selected.size === 0);
    const total = selectionPrice();
    if ($('#builder-total')) $('#builder-total').innerHTML = `${fa(total)} <span>تومان</span>`;
    if ($('#builder-count')) $('#builder-count').textContent = `${fa(selected.size)} از ${fa(maxProducts)} محصول`;
    if ($('#builder-summary')) $('#builder-summary').textContent = selected.size ? products.filter(product => selected.has(product.id)).map(product => product.name).join(' + ') : 'جعبه منتظر انتخاب شماست';
    if ($('#order-total')) $('#order-total').textContent = money(total * getQuantity());
    if ($('#builder-cta')) $('#builder-cta').disabled = selected.size === 0;
  }
  function toggleProduct(id, forceAdd = false) {
    if (!products.some(product => product.id === id)) return;
    if (selected.has(id)) {
      if (!forceAdd) selected.delete(id);
    } else {
      if (selected.size >= maxProducts) return toast('برای چیدمان بهتر، حداکثر ۴ محصول انتخاب کنید. ابتدا یکی از محصولات را بردارید.');
      selected.add(id);
    }
    renderBuilder();
  }
  function requestMessage(text) {
    const dialog = $('#bundle-dialog');
    if (dialog?.open) dialog.close();
    const input = $('#request-message');
    if (input) input.value = text;
    const quantity = $('#request-form [name="quantity"]');
    if (quantity) quantity.value = getQuantity();
    $('#contact')?.scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(() => $('#request-form [name="organization"]')?.focus({ preventScroll:true }), 500);
  }
  function boxSummary() {
    const brand = ($('#brand-name')?.value || '').trim();
    return `باکس اختصاصی تسکو\nمحصولات: ${products.filter(product => selected.has(product.id)).map(product => product.name).join('، ')}\nرنگ جعبه: ${boxColor}\nنام برند: ${brand || 'هنوز تعیین نشده'}\nتعداد: ${fa(getQuantity())}\nبرآورد هر باکس: ${money(selectionPrice())}\nبرآورد محصولات کل سفارش: ${money(selectionPrice() * getQuantity())}\n\nاین محاسبه نمونه است و هزینه بسته‌بندی، چاپ و ارسال را شامل نمی‌شود. قیمت و موجودی نهایی نیاز به استعلام دارد.`;
  }
  function reviewMarkup(review) {
    const name = bundles.find(bundle => bundle.id === review.bundle)?.name || '';
    return `<article class="review-card"><div class="review-stars" aria-label="امتیاز ${fa(review.rating)} از ۵">${Array.from({ length:5 }, (_, index) => `<span class="${index < review.rating ? 'is-filled' : ''}">${icon('star')}</span>`).join('')}</div><blockquote>${escape(review.text)}</blockquote><div class="review-author"><span>${escape(review.org.trim().slice(0, 1))}</span><div><strong>${escape(review.org)}</strong><small>باکس ${name}</small></div></div><p class="review-local">ذخیره روی این مرورگر · تأییدنشده</p></article>`;
  }
  function renderReviews() {
    if (!$('#reviews-list')) return;
    $('#reviews-list').innerHTML = reviews.length ? reviews.slice(0, 3).map(reviewMarkup).join('') : `<article class="review-empty"><div class="review-empty-stars" aria-hidden="true">${icon('star').repeat(5)}</div><h3>تجربه شما، شروع این گفت‌وگوست.</h3><p>تجربه خرید سازمانی خود را ثبت کنید. نظرات این نسخه روی مرورگر شما نگهداری می‌شوند.</p><button class="text-button" data-open-review>نوشتن اولین تجربه ${icon('arrow')}</button></article>`;
  }
  function openReview(bundle = bundles[0].id) {
    if ($('#bundle-dialog')?.open) $('#bundle-dialog').close();
    const select = $('#review-bundle');
    if (select) select.value = bundles.some(item => item.id === bundle) ? bundle : bundles[0].id;
    $('#review-dialog')?.showModal();
  }
  function showBundle(id) {
    const bundle = bundles.find(item => item.id === id);
    if (!bundle || !$('#bundle-detail')) return;
    currentBundle = id;
    const photos = [{ src:bundle.image, alt:`چیدمان مفهومی ${bundle.name}` }, ...bundle.items.map(itemId => { const product = products.find(item => item.id === itemId); return { src:product.image, alt:product.name }; })];
    $('#bundle-detail').innerHTML = `<div class="detail-layout"><div class="detail-gallery"><div class="detail-main-image">${image(photos[0].src, photos[0].alt)}</div><div class="detail-thumbs">${photos.map((photo, index) => `<button type="button" data-gallery="${photo.src}" data-alt="${photo.alt}" class="${index === 0 ? 'is-active' : ''}" aria-label="نمایش ${photo.alt}">${image(photo.src, photo.alt)}</button>`).join('')}</div></div><div class="detail-copy"><div class="card-kicker">${bundle.kicker}</div><h2 id="bundle-dialog-title">${bundle.name}</h2><p>${bundle.description}</p><ul class="detail-specs">${bundle.items.map(itemId => {const product = products.find(item => item.id === itemId);return `<li><strong>${product.name}</strong><span>${product.specification}</span></li>`;}).join('')}<li><strong>شخصی‌سازی</strong><span>حک یا چاپ لوگو و کارت پیام، پس از بررسی فنی</span></li><li><strong>بسته‌بندی</strong><span>انتخاب رنگ و ترکیب متناسب با هویت سازمان</span></li></ul><div class="detail-price"><small>برآورد نمونه هر باکس، از</small><strong>${money(bundle.price)}</strong></div><div class="detail-actions"><button class="button button-red" data-request-bundle="${bundle.id}">درخواست پیش‌فاکتور ${icon('arrow')}</button><button class="text-button" data-customize-bundle="${bundle.id}">شخصی‌سازی این ترکیب</button></div><p class="detail-note">تصاویر مفهومی‌اند. مدل دقیق، موجودی، قیمت نهایی و شرایط ضمانت در پیش‌فاکتور تأیید می‌شوند.</p></div></div><section class="detail-reviews"><h3>تجربه سازمان‌ها درباره این باکس</h3>${reviews.filter(review => review.bundle === id).slice(0, 3).map(reviewMarkup).join('') || '<p>هنوز تجربه‌ای برای این باکس ثبت نشده است.</p>'}<button class="text-button" data-open-review="${bundle.id}">ثبت تجربه شما ${icon('arrow')}</button></section>`;
    $('#bundle-dialog').setAttribute('aria-labelledby', 'bundle-dialog-title');
    $('#bundle-dialog').showModal();
  }
  document.addEventListener('click', event => {
    const target = event.target;
    const filter = target.closest('[data-category]');
    if (filter) renderBundles(filter.dataset.category);
    const detail = target.closest('[data-bundle]');
    if (detail) showBundle(detail.dataset.bundle);
    const remove = target.closest('[data-remove-product]');
    const product = target.closest('button[data-product]');
    if (remove) toggleProduct(remove.dataset.removeProduct);
    else if (product) toggleProduct(product.dataset.product);
    const color = target.closest('[data-box-color]');
    if (color) {
      $$('#builder [data-box-color]').forEach(button => { const active = button === color; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
      $('#gift-box')?.style.setProperty('--box-color', color.dataset.boxColor);
      boxColor = color.dataset.colorName || color.getAttribute('aria-label') || 'انتخابی';
    }
    const close = target.closest('[data-close]');
    if (close) close.closest('dialog')?.close();
    const review = target.closest('[data-open-review]');
    if (review) openReview(review.dataset.openReview || currentBundle);
    const request = target.closest('[data-request-bundle]');
    if (request) {
      const bundle = bundles.find(item => item.id === request.dataset.requestBundle);
      requestMessage(`درخواست مشاوره و پیش‌فاکتور برای باکس «${bundle.name}» شامل ${bundle.items.map(id => products.find(item => item.id === id).name).join('، ')}.\nبرآورد نمایشی هر باکس: ${money(bundle.price)}`);
    }
    const customize = target.closest('[data-customize-bundle]');
    if (customize) {
      const bundle = bundles.find(item => item.id === customize.dataset.customizeBundle);
      selected.clear(); bundle.items.forEach(id => selected.add(id)); renderBuilder(); $('#bundle-dialog').close(); $('#builder')?.scrollIntoView({ behavior:'smooth' });
    }
    const categoryRequest = target.closest('[data-category-request]');
    if (categoryRequest) requestMessage(`درخواست پیشنهاد هدیه سازمانی در دسته ${categoryRequest.dataset.categoryRequest === 'beauty' ? 'زیبایی و مراقبت' : 'گیم و سرگرمی'} با توجه به موجودی روز.`);
    const thumb = target.closest('[data-gallery]');
    if (thumb) {
      const main = $('#bundle-detail .detail-main-image img');
      if (main) {main.src = thumb.dataset.gallery; main.alt = thumb.dataset.alt;}
      $$('.detail-thumbs button').forEach(button => button.classList.toggle('is-active', button === thumb));
    }
  });
  document.addEventListener('dragstart', event => {
    const product = event.target.closest('[draggable="true"][data-product]');
    if (!product) return;
    event.dataTransfer.setData('text/plain', product.dataset.product);
    event.dataTransfer.effectAllowed = 'copy';
  });
  $('#gift-box')?.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; $('#gift-box').classList.add('is-dragover'); });
  $('#gift-box')?.addEventListener('dragleave', event => { if (!$('#gift-box').contains(event.relatedTarget)) $('#gift-box').classList.remove('is-dragover'); });
  $('#gift-box')?.addEventListener('drop', event => { event.preventDefault(); $('#gift-box').classList.remove('is-dragover'); toggleProduct(event.dataTransfer.getData('text/plain'), true); });
  $('#builder-quantity')?.addEventListener('input', () => { if ($('#order-total')) $('#order-total').textContent = money(selectionPrice() * getQuantity()); });
  $('#builder-quantity')?.addEventListener('change', event => { event.target.value = getQuantity(); renderBuilder(); });
  $('#brand-name')?.addEventListener('input', event => { if ($('#box-logo-text')) $('#box-logo-text').textContent = event.target.value.trim().slice(0, 30) || 'YOUR BRAND'; });
  $('#brand-logo')?.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) { event.target.value = ''; return toast('لوگو را با فرمت PNG، JPG یا WebP و حجم کمتر از ۳ مگابایت انتخاب کنید.'); }
    if (logoURL) URL.revokeObjectURL(logoURL);
    logoURL = URL.createObjectURL(file);
    const image = $('#box-logo-image');
    if (image) {image.src = logoURL;image.hidden = false;}
    if ($('#box-logo-text')) $('#box-logo-text').hidden = true;
    if ($('#clear-logo')) $('#clear-logo').hidden = false;
    toast('لوگوی شما فقط در پیش‌نمایش همین مرورگر استفاده می‌شود.');
  });
  $('#clear-logo')?.addEventListener('click', () => {
    if (logoURL) URL.revokeObjectURL(logoURL); logoURL = null;
    if ($('#box-logo-image')) {$('#box-logo-image').hidden = true;$('#box-logo-image').removeAttribute('src');}
    if ($('#box-logo-text')) $('#box-logo-text').hidden = false;
    if ($('#brand-logo')) $('#brand-logo').value = '';
    $('#clear-logo').hidden = true;
  });
  $('#builder-cta')?.addEventListener('click', () => { if (selected.size) requestMessage(boxSummary()); else toast('ابتدا یک محصول به باکس اضافه کنید.'); });
  $('#download-selection')?.addEventListener('click', () => { if (!selected.size) return toast('ابتدا محصول دلخواهتان را انتخاب کنید.'); download('TSCO-my-gift-box.txt', boxSummary()); toast('مشخصات باکس شما دریافت شد.'); });
  if ($('#review-bundle')) $('#review-bundle').innerHTML = bundles.map(bundle => `<option value="${bundle.id}">${bundle.name}</option>`).join('');
  $('#review-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const review = { org:String(data.org || '').trim().slice(0, 100), text:String(data.text || '').trim().slice(0, 600), rating:Number(data.rating), bundle:data.bundle };
    if (!validReview(review)) return toast('نام سازمان، متن نظر و امتیاز معتبر را وارد کنید.');
    reviews.unshift(review); reviews = reviews.slice(0, 30);
    let persistent = true;
    try {localStorage.setItem(storageKey, JSON.stringify(reviews));} catch {persistent = false;}
    renderReviews();
    $('#review-dialog').close(); event.target.reset();
    toast(persistent ? 'تجربه شما روی این مرورگر ذخیره شد؛ این نظر انتشار عمومی ندارد.' : 'تجربه در این صفحه ثبت شد؛ ذخیره دائمی مرورگر در دسترس نیست.');
  });
  $('#request-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const phone = String(data.phone || '').replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phone)) return toast('شماره تماس معتبر وارد کنید.');
    download('TSCO-consultation-request.txt', `درخواست مشاوره فروش سازمانی تسکو\n\nنام سازمان: ${String(data.organization || '').trim()}\nنام و نام خانوادگی: ${String(data.name || '').trim()}\nشماره تماس: ${phone}\nتعداد تقریبی: ${data.quantity}\n\nتوضیحات درخواست:\n${data.message || ''}\n\nاین فایل به‌صورت محلی ساخته شده و هنوز برای تسکو ارسال نشده است. برای ارسال و پیگیری از مسیر رسمی https://tsco.ir/organizational-sales/ استفاده کنید.`);
    const success = $('#request-success'); if (success) {success.textContent = 'فایل درخواست آماده شد. اطلاعات هنوز برای تسکو ارسال نشده است؛ فایل را از مسیر ارتباطی سایت رسمی ارسال کنید.';success.hidden = false;success.setAttribute('tabindex', '-1');success.focus({ preventScroll:true });}
    toast('فایل درخواست آماده شد؛ برای پیگیری از مسیر رسمی تسکو ارسال کنید.');
  });
  $('#download-catalog')?.addEventListener('click', () => {
    download('TSCO-gift-guide.html', `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>راهنمای پیشنهادی هدیه سازمانی تسکو</title><style>body{font-family:Tahoma,sans-serif;max-width:850px;margin:50px auto;padding:25px;line-height:2;color:#222}h1{color:#e31c34}article{padding:20px 0;border-bottom:1px solid #ddd}small{color:#777}button{padding:12px 25px;cursor:pointer}@media print{button{display:none}}</style><h1>هدیه‌ای برای ارتباط‌های ماندگار</h1><p>راهنمای پیشنهادی باکس‌های سازمانی تسکو</p><p><strong>این سند کاتالوگ رسمی نیست.</strong> ترکیب‌ها و قیمت‌ها صرفاً برای نمایش ایده طراحی شده‌اند. مدل دقیق، موجودی، قیمت، چاپ لوگو، هزینه بسته‌بندی و ضمانت نیاز به تأیید تسکو دارند.</p>${bundles.map(bundle => `<article><small>${bundle.kicker}</small><h2>${bundle.name}</h2><p>${bundle.description}</p><p>محتویات پیشنهادی: ${bundle.items.map(id => products.find(product => product.id === id).name).join('، ')}</p><strong>برآورد نمونه: ${money(bundle.price)}</strong></article>`).join('')}<p>مسیر رسمی فروش سازمانی: <a href="https://tsco.ir/organizational-sales/">tsco.ir/organizational-sales</a></p><button onclick="window.print()">چاپ یا ذخیره PDF</button></html>`, 'text/html;charset=utf-8');
    toast('راهنمای پیشنهادی دریافت شد؛ این فایل کاتالوگ رسمی تسکو نیست.');
  });
  $('#menu-toggle')?.addEventListener('click', () => {
    const open = $('#main-nav')?.classList.toggle('is-open');
    $('#menu-toggle').setAttribute('aria-expanded', String(Boolean(open)));
    $('#menu-toggle').setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  });
  $$('#main-nav a').forEach(link => link.addEventListener('click', () => { $('#main-nav')?.classList.remove('is-open'); $('#menu-toggle')?.setAttribute('aria-expanded', 'false'); }));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }));
  window.addEventListener('scroll', () => $('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 20), { passive:true });
  window.addEventListener('beforeunload', () => { if (logoURL) URL.revokeObjectURL(logoURL); });
  if ($('#copyright-year')) $('#copyright-year').textContent = fa(1405);
  renderBundles(activeFilter);
  renderBuilder();
  renderReviews();
})();
