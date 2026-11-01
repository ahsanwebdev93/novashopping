/* ============================================================
   0. UTILITIES
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = n => 'PKR ' + Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DB = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { console.error(`Unable to save ${k} to browser storage.`, e); return false; }
  }
};

const THEME_KEY = 'nova_theme_v1';
function applyTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  const toggle = $('#themeToggle');
  if (toggle) {
    const nextMode = isLight ? 'dark' : 'light';
    toggle.setAttribute('aria-label', `Switch to ${nextMode} mode`);
    toggle.setAttribute('title', `Switch to ${nextMode} mode`);
    toggle.setAttribute('aria-pressed', String(isLight));
  }
  const themeColor = $('meta[name="theme-color"]');
  if (themeColor) themeColor.content = isLight ? '#f6f5f1' : '#08080b';
}

let toastTimer;
function toast(msg, isError) {
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  t.classList.toggle('error', !!isError);
  t.querySelector('i').textContent = isError ? '⚠' : '✦';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ============================================================
   1. CATALOGUE DATA
   ============================================================ */
const CATS = {
  shoes: { name: 'Dress Shoes', icon: '👞', g: ['#2b2118', '#6b4a2c'] },
  bags: { name: 'Bags', icon: '👜', g: ['#1e1b2e', '#4a3b6b'] },
  pants: { name: 'Pants', icon: '👖', g: ['#152230', '#2f5a7a'] },
  suits: { name: 'Suits', icon: '🤵', g: ['#1a1a22', '#3d3d52'] },
  watches: { name: 'Watches', icon: '⌚', g: ['#2a1f14', '#8a6a2f'] }
};

const SIZES = {
  shoes: ['7', '8', '9', '10', '11', '12'],
  pants: ['38', '40', '42', '44', '46'],
  suits: ['38', '40', '42', '44', '46'],
  bags: ['One Size'],
  watches: ['One Size']
};

const SEED = {
  shoes: [
    'Oxford Classic Black', 'Derby Cognac Leather', 'Double Monk Strap',
    'Wholecut Oxford Ebony', 'Chelsea Boot Suede', 'Penny Loafer Tan',
    'Wingtip Brogue Walnut', 'Cap-Toe Oxford Midnight', 'Tassel Loafer Burgundy',
    'Chukka Boot Sand', 'Patent Evening Shoe', 'Slip-On Suede Navy'
  ],
  bags: [
    'Leather Briefcase Tan', 'Messenger Satchel Brown', 'Weekender Duffle Black',
    'Slim Portfolio Case', 'Executive Backpack', 'Laptop Sleeve Charcoal',
    'Document Holder Cognac', 'Travel Holdall Olive', 'Crossbody Bag Black',
    'Business Tote Navy', 'Canvas Weekender', 'Attaché Case Silver'
  ],
  pants: [
    'Wool Dress Trouser Grey', 'Slim Chino Charcoal', 'Pleated Flannel Trouser',
    'Tuxedo Stripe Trouser', 'Linen Summer Pant', 'High-Twist Wool Navy',
    'Double-Pleat Grey', 'Tailored Navy Trouser', 'Herringbone Tweed Pant',
    'Cotton Twill Beige', 'Velvet Evening Trouser', 'Cropped Formal Black'
  ],
  suits: [
    'Two-Piece Navy Suit', 'Charcoal Three-Piece', 'Black Tie Tuxedo',
    'Prince of Wales Check', 'Slim Fit Blue Suit', 'Double-Breasted Pinstripe',
    'Linen Summer Suit', 'Velvet Dinner Jacket', 'Herringbone Tweed Suit',
    'Italian Wool Charcoal', 'Ivory Wedding Suit', 'Windowpane Check Suit'
  ],
  watches: [
    'Automatic Dress Watch', 'Chronograph Steel', 'Rose Gold Classic',
    'Moonphase Silver', 'Skeleton Dial Openwork', 'Minimalist Quartz',
    'Diver Black Dial', 'Slim Dress Gold', 'Roman Numeral Ivory',
    'Sapphire Blue Dial', 'Vintage Leather Strap', 'Perpetual Calendar'
  ]
};

const RANGE = {
  shoes: { min: 149, step: 10, span: 24 },
  bags: { min: 129, step: 10, span: 33 },
  pants: { min: 79, step: 10, span: 14 },
  suits: { min: 299, step: 20, span: 30 },
  watches: { min: 149, step: 25, span: 46 }
};

const DESCS = {
  shoes: [
    'Hand-finished full-grain leather upper with a Blake-stitched leather sole. Built for long days and late nights.',
    'Goodyear-welted construction, calfskin lining and a subtly tapered last for an impeccable silhouette.',
    'Soft brushed leather with a cushioned insole and a durable rubber outsole. Elegance that survives the commute.'
  ],
  bags: [
    'Vegetable-tanned full-grain leather with solid brass hardware and a cotton-lined interior. Ages beautifully.',
    'Structured, lightweight and built around a padded laptop sleeve. The everyday carry, refined.',
    'Water-resistant waxed canvas paired with leather trim and YKK zips. Made to travel hard.'
  ],
  pants: [
    'Super 120s wool with a clean flat front and a tailored taper. Crease retention that lasts the full day.',
    'Breathable wool-linen blend with a comfort waistband. Cut slim through the thigh and straight to the hem.',
    'Italian milled fabric with a subtle texture and a hidden extendable waistband for all-day comfort.'
  ],
  suits: [
    'Half-canvassed construction in Super 130s wool. Natural shoulders, soft drape, and a modern slim lapel.',
    'Cut from Italian wool with a full lining and functional cuffs. Tailored, not tight — built to move.',
    'Peak or notch lapel in a breathable blend. Fully lined with a bemberg interior and hand-finished details.'
  ],
  watches: [
    'Swiss automatic movement, sapphire crystal and a 42-hour power reserve. Water resistant to 50m.',
    'Surgical-grade stainless steel case with an anti-reflective sapphire dial and a genuine leather strap.',
    'Precision quartz movement in a slim 8mm case. Understated, accurate and endlessly wearable.'
  ]
};

function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildDefaultProducts() {
  const out = [];
  let id = 1;
  Object.keys(SEED).forEach(cat => {
    const cfg = RANGE[cat];
    SEED[cat].forEach((name, i) => {
      const r1 = rnd(id * 3.13), r2 = rnd(id * 7.77), r3 = rnd(id * 11.31);
      const price = cfg.min + Math.round(r1 * cfg.span) * cfg.step;
      const oldPrice = Math.round(price * (1.2 + r2 * 0.3) / 10) * 10;

      let badge = '';
      if (r3 > 0.88) badge = 'New';
      else if (r3 > 0.76) badge = 'Bestseller';
      else if (r3 > 0.66) badge = 'Limited';

      out.push({
        id: id,
        name: name,
        cat: cat,
        price: price,
        oldPrice: oldPrice > price ? oldPrice : null,
        stock: 2 + Math.floor(r2 * 46),
        rating: Number((4 + r1 * 1).toFixed(1)),
        reviews: 12 + Math.floor(r3 * 320),
        badge: badge,
        desc: DESCS[cat][i % DESCS[cat].length]
      });
      id++;
    });
  });
  return out;
}

/* ============================================================
   2. STATE
   ============================================================ */
const PKEY = 'nova_products_v1';
const CKEY = 'nova_cart_v1';
const OKEY = 'nova_order_history_v1';
let products = [];
let cart = DB.get(CKEY, []);
let orderHistory = DB.get(OKEY, []);
if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(orderHistory)) orderHistory = [];
orderHistory = orderHistory.filter(order =>
  order && (typeof order.id === 'string' || Number.isSafeInteger(order.id)) &&
  typeof order.placedAt === 'string' && Number.isFinite(Date.parse(order.placedAt)) &&
  Number.isFinite(order.total) && order.total >= 0 &&
  Array.isArray(order.items) && order.items.length > 0 &&
  order.items.every(item => item && typeof item.name === 'string' &&
    typeof item.size === 'string' && Number.isFinite(item.price) &&
    Number.isSafeInteger(item.quantity) && item.quantity > 0));
cart = cart.filter(item => item && Number.isSafeInteger(item.id) &&
  typeof item.size === 'string' && Number.isSafeInteger(item.qty) && item.qty > 0);
cart.forEach(item => { item.key = `${item.id}|${item.size}`; });

const state = { cat: 'all', q: '', sort: 'featured' };
const adminState = { q: '', cat: 'all' };
let editingId = null;
let imagePreviewUrl = null;
let adminAuthenticated = false;
let orderSubmitting = false;

function saveCart() { DB.set(CKEY, cart); }

async function apiRequest(path, options = {}) {
  const settings = {
    headers: { 'Accept': 'application/json' },
    ...options
  };
  if (options.body && !settings.headers['Content-Type']) {
    settings.headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(path, settings);
  const contentType = response.headers.get('content-type') || '';
  let payload = null;
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else if (response.status !== 204) {
    payload = await response.text();
  }
  if (!response.ok) {
    const message = payload && (payload.error || payload.message) ? (payload.error || payload.message) : 'Request failed';
    throw new Error(message);
  }
  return payload;
}

function reconcileCart() {
  const quantities = new Map();
  cart = cart.filter(item => {
    const product = products.find(candidate => candidate.id === item.id);
    if (!product || !SIZES[product.cat] || !SIZES[product.cat].includes(item.size) ||
      !Number.isSafeInteger(item.qty) || item.qty < 1) return false;
    const available = product.stock - (quantities.get(item.id) || 0);
    if (available <= 0) return false;
    item.qty = Math.min(item.qty, available, 20);
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.qty);
    item.key = `${item.id}|${item.size}`;
    return true;
  });
  saveCart();
}

function persistProducts() {
  DB.set(PKEY, products);
}

async function loadProducts() {
  try {
    const nextProducts = await apiRequest('/api/products');
    if (Array.isArray(nextProducts) && nextProducts.length) {
      products = nextProducts.filter(product => product && typeof product.name === 'string' && product.cat && CATS[product.cat]);
      if (!products.length) products = buildDefaultProducts();
      persistProducts();
      reconcileCart();
      return;
    }
  } catch (error) {
    console.warn('Falling back to local product cache:', error.message);
  }

  const savedProducts = DB.get(PKEY, null);
  const nextProducts = Array.isArray(savedProducts) && savedProducts.length ? savedProducts : buildDefaultProducts();
  products = nextProducts.filter(product => product && typeof product.name === 'string' && product.cat && CATS[product.cat]);
  if (!products.length) products = buildDefaultProducts();
  persistProducts();
  reconcileCart();
}

async function initializeProductsIfNeeded() {
  if (!products.length) {
    products = buildDefaultProducts();
    persistProducts();
    try {
      await apiRequest('/api/products/reset', { method: 'POST' });
    } catch (error) {
      console.warn('Could not reset server catalog:', error.message);
    }
  }
}

function imageMarkup(product, className) {
  return product.image ? `<img class="${className}" src="${esc(product.image)}" alt="${esc(product.name)}">` : '';
}

function readProductImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected file is not a usable image.'));
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) { reject(new Error('Image processing is unavailable in this browser.')); return; }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function isSupportedProductImage(file) {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
}

/* ============================================================
   3. STORE RENDERING
   ============================================================ */
function renderChips() {
  const items = [['all', 'All Products'], ...Object.keys(CATS).map(k => [k, CATS[k].name])];
  $('#chips').innerHTML = items.map(([k, label]) =>
    `<button class="chip ${state.cat === k ? 'active' : ''}" data-chip="${k}">${label}</button>`
  ).join('');
}

function filteredProducts() {
  let list = products.filter(p => state.cat === 'all' || p.cat === state.cat);
  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      CATS[p.cat].name.toLowerCase().includes(q)
    );
  }
  switch (state.sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: list.sort((a, b) => a.id - b.id);
  }
  return list;
}

function renderGrid() {
  const list = filteredProducts();
  $('#resultCount').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;

  if (!list.length) {
    $('#grid').innerHTML = `<div class="empty-state">
      <b>${products.length ? 'No products found' : 'Catalogue setup required'}</b>
      ${products.length ? 'Try a different search term or category.' : 'Sign in through Admin to initialize the catalogue.'}
    </div>`;
    return;
  }

  $('#grid').innerHTML = list.map((p, i) => {
    const c = CATS[p.cat];
    return `<article class="card" style="animation-delay:${Math.min(i * 22, 400)}ms">
      <div class="card-media" data-open="${p.id}" style="background:linear-gradient(145deg,${c.g[0]},${c.g[1]})">
        ${imageMarkup(p, 'card-photo')}
        ${p.image ? '' : `<span class="emoji">${c.icon}</span>`}
        ${p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-cat">${c.name}</div>
        <h3 class="card-title">${esc(p.name)}</h3>
        <div class="card-rating"><span class="star">★</span> ${p.rating.toFixed(1)}
          <span style="color:#5f5f70">(${p.reviews})</span></div>
        <div class="card-foot">
          <div class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</div>
            <button class="add-btn" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart"
              ${p.stock < 1 ? 'disabled title="Out of stock"' : ''}>+</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

function setCat(cat) {
  $('#storeView').hidden = false;
  $('#orderHistoryView').hidden = true;
  $('#adminView').hidden = true;
  $('.footer').hidden = false;
  state.cat = cat;
  renderChips();
  renderGrid();
  $$('.nav a[data-cat]').forEach(a => a.classList.toggle('active', a.dataset.cat === cat));
  $('[data-view="orders"]').classList.remove('active');
  scrollToShop();
  closeNav();
}

function scrollToShop() {
  const el = $('#shopSection');
  if (el) {
    const headerHeight = $('.header').getBoundingClientRect().height;
    window.scrollTo({ top: el.offsetTop - headerHeight - 16, behavior: 'smooth' });
  }
}

/* ============================================================
   4. CART
   ============================================================ */
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function updateCartBadge() {
  const n = cartCount();
  const el = $('#cartCount');
  el.textContent = n;
  el.style.display = n ? 'grid' : 'none';
}

function addToCart(id, size, qty = 1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const sz = size || SIZES[p.cat][0];
  const key = `${id}|${sz}`;
  const existing = cart.find(i => i.key === key);
  const otherQty = cart.reduce((total, item) =>
    total + (item.id === id && item.key !== key ? item.qty : 0), 0);
  const available = Math.min(20, p.stock - otherQty);
  if (available <= 0 || (existing && existing.qty >= available)) {
    toast(p.stock > 0 ? 'Maximum available quantity is already in your cart' : 'This product is out of stock', true);
    return;
  }
  if (existing) existing.qty = Math.min(existing.qty + qty, available);
  else cart.push({ key, id, size: sz, qty: Math.min(qty, available) });
  saveCart();
  updateCartBadge();
  renderCart();
  toast(`${p.name} added to cart`);
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  const product = products.find(candidate => candidate.id === item.id);
  if (!product) {
    cart = cart.filter(candidate => candidate.key !== key);
    saveCart();
    updateCartBadge();
    renderCart();
    return;
  }
  if (delta > 0) {
    const otherQty = cart.reduce((total, candidate) =>
      total + (candidate.id === item.id && candidate.key !== key ? candidate.qty : 0), 0);
    if (item.qty >= Math.min(20, product.stock - otherQty)) {
      toast('Maximum available quantity is already in your cart', true);
      return;
    }
  }
  item.qty = Math.min(20, item.qty + delta);
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartBadge();
  renderCart();
}

function removeItem(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const body = $('#cartBody');
  const summaryElement = $('#cartSummary');
  const checkoutFields = $('#checkoutFields');
  const items = cart
    .map(i => ({ ...i, p: products.find(x => x.id === i.id) }))
    .filter(i => i.p);

  $('#cartItemsLabel').textContent = `(${cartCount()} item${cartCount() === 1 ? '' : 's'})`;

  if (!items.length) {
    body.innerHTML = `<div class="cart-empty">
      <div class="big">🛍</div>
      <b>Your cart is empty</b>
      <p style="font-size:13px">Add something exceptional.</p>
    </div>`;
    checkoutFields.hidden = true;
    summaryElement.innerHTML = '';
    return;
  }

  checkoutFields.hidden = false;
  body.innerHTML = items.map(i => {
    const c = CATS[i.p.cat];
    return `<div class="cart-item">
      <div class="cart-thumb" style="background:linear-gradient(145deg,${c.g[0]},${c.g[1]})">${imageMarkup(i.p, 'cart-photo')}${i.p.image ? '' : c.icon}</div>
      <div class="cart-info">
        <h4>${esc(i.p.name)}</h4>
        <small>${c.name} · Size ${esc(i.size)}</small>
        <div class="cart-row">
          <div class="qty">
            <button data-dec="${i.key}" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.key}" aria-label="Increase">+</button>
          </div>
          <span class="cart-price">${money(i.p.price * i.qty)}</span>
        </div>
        <button class="remove-btn" data-remove="${i.key}">Remove</button>
      </div>
    </div>`;
  }).join('');

  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  summaryElement.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span>
      <span>${shipping === 0 ? '<span class="free">Free</span>' : money(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
    <button type="submit" class="btn btn-primary btn-block" id="checkoutBtn">Place Order — ${money(total)}</button>
  `;
}

function renderOrderHistory() {
  const list = $('#orderHistoryList');
  if (!orderHistory.length) {
    list.innerHTML = `<div class="empty-state">
      <b>No orders yet</b>
      Your completed orders will appear here.
    </div>`;
    return;
  }

  list.innerHTML = orderHistory.map(order => `
    <article class="order-card">
      <div class="order-card-head">
        <div>
          <h3>Order #${esc(order.id)}</h3>
          <small>${esc(new Date(order.placedAt).toLocaleString())}</small>
        </div>
        <strong>${money(order.total)}</strong>
      </div>
      <ul>
        ${order.items.map(item => `<li>
          <span>${esc(item.name)} <small>· Size ${esc(item.size)} · Qty ${item.quantity}</small></span>
          <span>${money(item.price * item.quantity)}</span>
        </li>`).join('')}
      </ul>
    </article>
  `).join('');
}

async function submitOrder(e) {
  e.preventDefault();
  if (!cart.length || orderSubmitting) return;
  orderSubmitting = true;
  const form = new FormData($('#checkoutForm'));
  const order = {
    name: String(form.get('name') || '').trim(),
    phone: String(form.get('tel') || '').trim(),
    address: String(form.get('street-address') || '').trim(),
    items: cart.map(item => ({ id: item.id, size: item.size, quantity: item.qty }))
  };

  if (!order.name || !order.phone || !order.address) {
    toast('Please complete your name, phone number, and address.', true);
    orderSubmitting = false;
    return;
  }

  if (!/^[+0-9() .-]{7,20}$/.test(order.phone)) {
    toast('Enter a valid phone number.', true);
    orderSubmitting = false;
    return;
  }

  try {
    const result = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
    if (!result || !result.id) {
      throw new Error('The order could not be created.');
    }

    orderHistory.unshift(result);
    DB.set(OKEY, orderHistory);
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
    renderGrid();
    updateHeroCount();
    $('#checkoutForm').reset();
    closeCart();
    toast(`Order #${result.id} placed — thank you!`);
    await loadProducts();
  } catch (error) {
    toast(error.message || 'Could not place the order.', true);
  } finally {
    orderSubmitting = false;
  }
}

/* ============================================================
   5. PRODUCT MODAL
   ============================================================ */
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const c = CATS[p.cat];
  const sizes = SIZES[p.cat];
  if (!c || !sizes) return;
  const alreadyInCart = cart.reduce((total, item) => total + (item.id === id ? item.qty : 0), 0);
  const remaining = Math.max(0, p.stock - alreadyInCart);
  let selectedSize = sizes[0];
  let qty = Math.min(1, remaining);

  $('#pmBody').innerHTML = `
    <div class="pm-media" style="background:linear-gradient(145deg,${c.g[0]},${c.g[1]})">
      ${imageMarkup(p, 'pm-photo')}
      ${p.image ? '' : `<span>${c.icon}</span>`}
    </div>
    <div class="pm-info">
      <div class="card-cat">${c.name}</div>
      <h2>${esc(p.name)}</h2>
      <div class="pm-price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</div>
      <p class="pm-desc">${esc(p.desc)}</p>
      <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;
                  color:var(--muted);font-weight:700;margin-bottom:9px">
        ${sizes.length > 1 ? 'Select Size' : 'Size'}
      </div>
      <div class="pm-sizes" id="pmSizes">
        ${sizes.map((s, i) => `<button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>
      <div class="pm-actions">
        <div class="qty">
          <button id="pmMinus" aria-label="Decrease">−</button>
          <span id="pmQty">${qty}</span>
          <button id="pmPlus" aria-label="Increase">+</button>
        </div>
        <button class="btn btn-primary" id="pmAdd" style="flex:1" ${remaining < 1 ? 'disabled' : ''}>
          ${remaining < 1 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;

  $$('#pmSizes .size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#pmSizes .size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  $('#pmMinus').addEventListener('click', () => {
    qty = Math.max(remaining > 0 ? 1 : 0, qty - 1); $('#pmQty').textContent = qty;
  });
  $('#pmPlus').addEventListener('click', () => {
    qty = Math.min(20, remaining, qty + 1); $('#pmQty').textContent = qty;
  });
  $('#pmAdd').addEventListener('click', () => {
    addToCart(p.id, selectedSize, qty);
    closeProduct();
    openCart();
  });

  $('#productModal').classList.add('open');
  document.body.classList.add('lock');
}

function closeProduct() {
  $('#productModal').classList.remove('open');
  if (!$('#cartDrawer').classList.contains('open')) document.body.classList.remove('lock');
}

/* ============================================================
   6. DRAWER / OVERLAY HELPERS
   ============================================================ */
function openCart() {
  renderCart();
  $('#cartDrawer').classList.add('open');
  $('#overlay').classList.add('show');
  document.body.classList.add('lock');
}
function closeCart() {
  $('#cartDrawer').classList.remove('open');
  if (!$('#productModal').classList.contains('open') && !$('#editorModal').classList.contains('open')) {
    $('#overlay').classList.remove('show');
    document.body.classList.remove('lock');
  }
}
function closeNav() { $('#nav').classList.remove('open'); }

function openOrderHistory() {
  $('#storeView').hidden = true;
  $('#adminView').hidden = true;
  $('.footer').hidden = true;
  $('#orderHistoryView').hidden = false;
  closeNav();
  renderOrderHistory();
  $$('.nav a[data-cat]').forEach(a => a.classList.remove('active'));
  $('[data-view="orders"]').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   7. ADMIN
   ============================================================ */
const ADMIN_PASSWORD = '123456';
const ADMIN_SESSION_KEY = 'nova_admin_session_v1';

function isAdminSessionActive() {
  return DB.get(ADMIN_SESSION_KEY, false) === true;
}

function setAdminSession(isActive) {
  adminAuthenticated = !!isActive;
  DB.set(ADMIN_SESSION_KEY, adminAuthenticated);
}

function openAdmin() {
  $('#storeView').hidden = true;
  $('#orderHistoryView').hidden = true;
  $('.footer').hidden = true;
  $('#adminView').hidden = false;
  $('[data-view="orders"]').classList.remove('active');
  closeNav();
  window.scrollTo({ top: 0 });
  adminAuthenticated = isAdminSessionActive();
  if (adminAuthenticated) {
    initializeProductsIfNeeded();
    showPanel();
  } else {
    showAdminLogin();
  }
}

function showAdminLogin() {
  $('#adminLogin').hidden = false;
  $('#adminPanel').hidden = true;
  setTimeout(() => $('#pwInput').focus(), 100);
}

function goStore() {
  $('#adminView').hidden = true;
  $('#orderHistoryView').hidden = true;
  $('#storeView').hidden = false;
  $('.footer').hidden = false;
  $('[data-view="orders"]').classList.remove('active');
  $$('.nav a[data-cat]').forEach(a => a.classList.toggle('active', a.dataset.cat === state.cat));
  closeNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPanel() {
  $('#adminLogin').hidden = true;
  $('#adminPanel').hidden = false;
  renderAdmin();
}

async function tryLogin() {
  const identifier = $('#adminIdentifier').value.trim();
  const val = $('#pwInput').value;
  try {
    await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password: val })
    });
    setAdminSession(true);
    $('#loginErr').classList.remove('show');
    $('#adminIdentifier').value = '';
    $('#pwInput').value = '';
    await initializeProductsIfNeeded();
    showPanel();
  } catch (error) {
    $('#loginErr').classList.add('show');
    $('#pwInput').value = '';
    $('#pwInput').focus();
    toast(error.message || 'Incorrect password. Try again.', true);
  }
}

function adminFiltered() {
  let list = products.filter(p => adminState.cat === 'all' || p.cat === adminState.cat);
  if (adminState.q) {
    const q = adminState.q.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || CATS[p.cat].name.toLowerCase().includes(q));
  }
  return list;
}

function renderAdmin() {
  // stats
  const value = products.reduce((s, p) => s + p.price * p.stock, 0);
  const low = products.filter(p => p.stock <= 5).length;
  $('#stProducts').textContent = products.length;
  $('#stValue').textContent = money(value);
  $('#stCats').textContent = Object.keys(CATS).length;
  $('#stLow').textContent = low;

  const list = adminFiltered();
  $('#tblCount').textContent = `(${list.length})`;

  if (!list.length) {
    $('#adminTbody').innerHTML = `<tr><td colspan="6"
      style="text-align:center;padding:44px;color:var(--muted)">No products match your filters.</td></tr>`;
    return;
  }

  $('#adminTbody').innerHTML = list.map(p => {
    const c = CATS[p.cat];
    const stockCls = p.stock <= 5 ? 'low' : 'ok';
    return `<tr>
      <td>
        <div class="cell-prod">
          <div class="cell-thumb" style="background:linear-gradient(145deg,${c.g[0]},${c.g[1]})">${imageMarkup(p, 'cell-photo')}${p.image ? '' : c.icon}</div>
          <div>
            <b>${esc(p.name)}</b>
            <small>ID #${p.id}${p.badge ? ' · ' + esc(p.badge) : ''}</small>
          </div>
        </div>
      </td>
      <td><span class="pill">${c.name}</span></td>
      <td><b style="letter-spacing:-.02em">${money(p.price)}</b></td>
      <td><span class="pill ${stockCls}">${p.stock} left</span></td>
      <td style="color:var(--muted)">★ ${p.rating.toFixed(1)}</td>
      <td>
        <div class="row-actions">
          <button class="mini-btn" data-edit="${p.id}" title="Edit">✎</button>
          <button class="mini-btn del" data-del="${p.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openEditor(id) {
  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  imagePreviewUrl = null;
  editingId = id || null;
  const p = id ? products.find(x => x.id === id) : null;
  $('#editorTitle').textContent = p ? 'Edit Product' : 'Add Product';
  $('#saveBtn').textContent = p ? 'Save Changes' : 'Create Product';

  $('#fName').value = p ? p.name : '';
  $('#fCat').value = p ? p.cat : 'shoes';
  $('#fStock').value = p ? p.stock : 10;
  $('#fPrice').value = p ? p.price : 199;
  $('#fOld').value = p && p.oldPrice ? p.oldPrice : '';
  $('#fBadge').value = p ? (p.badge || '') : '';
  $('#fDesc').value = p ? p.desc : '';
  $('#fImage').value = '';
  const preview = $('#fImagePreview');
  preview.innerHTML = p && p.image ? imageMarkup(p, 'preview-photo') : '';
  preview.hidden = !(p && p.image);

  $('#editorModal').classList.add('open');
  $('#overlay').classList.add('show');
  document.body.classList.add('lock');
  setTimeout(() => $('#fName').focus(), 120);
}

function closeEditor() {
  $('#editorModal').classList.remove('open');
  if (!$('#cartDrawer').classList.contains('open') && !$('#productModal').classList.contains('open')) {
    $('#overlay').classList.remove('show');
    document.body.classList.remove('lock');
  }
}

async function saveEditor(e) {
  e.preventDefault();
  const saveButton = $('#saveBtn');
  if (saveButton.disabled) return;
  const name = $('#fName').value.trim();
  const price = Number($('#fPrice').value);
  if (!name) { toast('Product name is required', true); $('#fName').focus(); return; }
  if (!price || price <= 0) { toast('Enter a valid price', true); $('#fPrice').focus(); return; }

  const imageFile = $('#fImage').files[0];
  if (imageFile && (!isSupportedProductImage(imageFile) || imageFile.size > 5 * 1024 * 1024)) {
    toast('Choose a valid image smaller than 5 MB', true);
    $('#fImage').focus();
    return;
  }
  const existingProduct = editingId ? products.find(x => x.id === editingId) : null;
  let image = existingProduct ? existingProduct.image : '';
  if (imageFile) {
    saveButton.disabled = true;
    try {
      image = await readProductImage(imageFile);
    } catch (error) {
      toast(error.message, true);
      saveButton.disabled = false;
      return;
    }
    saveButton.disabled = false;
  }

  const cat = $('#fCat').value;
  const oldVal = Number($('#fOld').value);
  const nextId = existingProduct ? existingProduct.id : Math.max(0, ...products.map(product => product.id)) + 1;
  const nextProduct = {
    id: nextId,
    name,
    cat,
    price: Math.round(price),
    oldPrice: oldVal > price ? Math.round(oldVal) : null,
    stock: Math.max(0, parseInt($('#fStock').value, 10) || 0),
    badge: $('#fBadge').value,
    desc: $('#fDesc').value.trim() || DESCS[cat][0],
    image,
    rating: existingProduct ? existingProduct.rating : 4.8,
    reviews: existingProduct ? existingProduct.reviews : 42
  };

  saveButton.disabled = true;
  try {
    if (editingId) {
      await apiRequest(`/api/products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(nextProduct)
      });
    } else {
      await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(nextProduct)
      });
    }
    await loadProducts();
    reconcileCart();
    renderCart();
    toast(editingId ? 'Product updated' : 'Product created');
    renderAdmin();
    renderGrid();
    updateHeroCount();
    closeEditor();
  } catch (error) {
    toast(error.message || 'Could not save the product.', true);
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
  try {
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    await loadProducts();
    reconcileCart();
    renderCart();
    renderAdmin();
    renderGrid();
    updateHeroCount();
    toast('Product deleted');
  } catch (error) {
    toast(error.message || 'Could not delete the product.', true);
  }
}

async function resetDemo() {
  if (!confirm('Reset all products to the original demo catalogue? Your custom products will be lost.')) return;
  try {
    await apiRequest('/api/products/reset', { method: 'POST' });
    await loadProducts();
    reconcileCart();
    renderCart();
    renderAdmin();
    renderGrid();
    updateHeroCount();
    toast('Demo catalogue restored');
  } catch (error) {
    toast(error.message || 'Could not reset the demo catalogue.', true);
  }
}

function updateHeroCount() {
  const el = $('#heroProducts');
  if (el) el.textContent = products.length + '+';
}

/* ============================================================
   8. EVENT WIRING
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  $('#themeToggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    DB.set(THEME_KEY, nextTheme);
  });

  /* ---- initial render ---- */
  try {
    await loadProducts();
  } catch (error) {
    $('#grid').innerHTML = `<div class="empty-state">${esc(error.message)} Open the page in a browser or serve this folder with a static web server.</div>`;
    toast('Could not connect to the database server', true);
  }
  renderChips();
  renderGrid();
  updateCartBadge();
  renderCart();
  updateHeroCount();

  /* ---- nav / category links ---- */
  document.addEventListener('click', e => {
    const catLink = e.target.closest('[data-cat]');
    if (catLink && catLink.tagName === 'A') {
      e.preventDefault();
      setCat(catLink.dataset.cat);
    }
    const viewLink = e.target.closest('[data-view="orders"]');
    if (viewLink) {
      e.preventDefault();
      openOrderHistory();
    }
  });

  /* ---- chips ---- */
  $('#chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    state.cat = chip.dataset.chip;
    renderChips();
    renderGrid();
    $$('.nav a[data-cat]').forEach(a => a.classList.toggle('active', a.dataset.cat === state.cat));
  });

  /* ---- search & sort ---- */
  let searchTimer;
  $('#searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => { state.q = v.trim(); renderGrid(); }, 180);
  });
  $('#sortSelect').addEventListener('change', e => {
    state.sort = e.target.value;
    renderGrid();
  });

  /* ---- grid actions ---- */
  $('#grid').addEventListener('click', e => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { addToCart(Number(addBtn.dataset.add)); return; }
    const media = e.target.closest('[data-open]');
    if (media) openProduct(Number(media.dataset.open));
  });

  /* ---- header buttons ---- */
  $('#cartBtn').addEventListener('click', openCart);
  $('#adminBtn').addEventListener('click', openAdmin);
  $('#searchBtn').addEventListener('click', () => {
    if ($('#adminView').hidden === false) { goStore(); }
    scrollToShop();
    setTimeout(() => $('#searchInput').focus(), 400);
  });
  $('#hamburger').addEventListener('click', () => $('#nav').classList.toggle('open'));

  /* ---- cart drawer ---- */
  $('#checkoutForm').addEventListener('submit', submitOrder);
  $('#cartBody').addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rem = e.target.closest('[data-remove]');
    if (inc) changeQty(inc.dataset.inc, 1);
    else if (dec) changeQty(dec.dataset.dec, -1);
    else if (rem) removeItem(rem.dataset.remove);
  });
  $$('[data-close-cart]').forEach(b => b.addEventListener('click', closeCart));

  /* ---- overlay ---- */
  $('#overlay').addEventListener('click', () => {
    closeCart();
    closeProduct();
    closeEditor();
    closeNav();
  });

  /* ---- modals ---- */
  $$('[data-close-modal]').forEach(b => b.addEventListener('click', closeProduct));
  $$('[data-close-editor]').forEach(b => b.addEventListener('click', closeEditor));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart(); closeProduct(); closeEditor(); closeNav();
    }
  });

  /* ---- admin login ---- */
  $('#adminLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    tryLogin();
  });
  $('#passwordToggle').addEventListener('click', e => {
    const input = $('#pwInput');
    const isVisible = input.type === 'text';
    input.type = isVisible ? 'password' : 'text';
    e.currentTarget.textContent = isVisible ? 'Show' : 'Hide';
    e.currentTarget.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    e.currentTarget.setAttribute('aria-pressed', String(!isVisible));
    input.focus();
  });

  /* ---- admin logout ---- */
  $('#logoutBtn').addEventListener('click', () => {
    setAdminSession(false);
    $('#adminPanel').hidden = true;
    showAdminLogin();
    toast('Logged out');
  });

  /* ---- admin toolbar ---- */
  $('#addProductBtn').addEventListener('click', () => openEditor(null));
  $('#resetBtn').addEventListener('click', resetDemo);

  let adminTimer;
  $('#adminSearch').addEventListener('input', e => {
    clearTimeout(adminTimer);
    const v = e.target.value;
    adminTimer = setTimeout(() => { adminState.q = v.trim(); renderAdmin(); }, 160);
  });
  $('#adminCatFilter').addEventListener('change', e => {
    adminState.cat = e.target.value;
    renderAdmin();
  });

  /* ---- admin table actions ---- */
  $('#adminTbody').addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (edit) openEditor(Number(edit.dataset.edit));
    else if (del) deleteProduct(Number(del.dataset.del));
  });

  /* ---- editor form ---- */
  $('#editorForm').addEventListener('submit', saveEditor);
  $('#fImage').addEventListener('change', () => {
    const file = $('#fImage').files[0];
    const preview = $('#fImagePreview');
    if (!file) return;
    if (!isSupportedProductImage(file) || file.size > 5 * 1024 * 1024) {
      $('#fImage').value = '';
      toast('Choose a valid image smaller than 5 MB', true);
      return;
    }
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    preview.innerHTML = `<img class="preview-photo" alt="Selected product picture">`;
    imagePreviewUrl = URL.createObjectURL(file);
    preview.querySelector('img').src = imagePreviewUrl;
    preview.hidden = false;
  });
});
