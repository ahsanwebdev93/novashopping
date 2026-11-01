const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('./database');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '';

function normalizeAdminIdentifier(value) {
  const identifier = String(value || '').trim();
  return identifier.includes('@')
    ? identifier.toLowerCase()
    : identifier.replace(/[^\d+]/g, '');
}

const CATS = {
  shoes: { name: 'Dress Shoes', icon: '👞', g: ['#2b2118', '#6b4a2c'] },
  bags: { name: 'Bags', icon: '👜', g: ['#1e1b2e', '#4a3b6b'] },
  pants: { name: 'Pants', icon: '👖', g: ['#152230', '#2f5a7a'] },
  suits: { name: 'Suits', icon: '🤵', g: ['#1a1a22', '#3d3d52'] },
  watches: { name: 'Watches', icon: '⌚', g: ['#2a1f14', '#8a6a2f'] }
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
  Object.keys(SEED).forEach((cat) => {
    const cfg = RANGE[cat];
    SEED[cat].forEach((name, i) => {
      const r1 = rnd(id * 3.13);
      const r2 = rnd(id * 7.77);
      const r3 = rnd(id * 11.31);
      const price = cfg.min + Math.round(r1 * 24) * cfg.step;
      const oldPrice = Math.round(price * (1.2 + r2 * 0.3) / 10) * 10;
      let badge = '';
      if (r3 > 0.88) badge = 'New';
      else if (r3 > 0.76) badge = 'Bestseller';
      else if (r3 > 0.66) badge = 'Limited';

      out.push({
        id,
        name,
        cat,
        price,
        oldPrice: oldPrice > price ? oldPrice : null,
        stock: 2 + Math.floor(r2 * 46),
        rating: Number((4 + r1 * 1).toFixed(1)),
        reviews: 12 + Math.floor(r3 * 320),
        badge,
        desc: DESCS[cat][i % DESCS[cat].length]
      });
      id += 1;
    });
  });
  return out;
}

function normalizeProduct(item) {
  if (!item || typeof item.name !== 'string' || !item.cat || !CATS[item.cat]) {
    throw new Error('Invalid product payload.');
  }
  const price = Number(item.price);
  const stock = Number(item.stock);
  const rating = Number(item.rating) || 4.8;
  const reviews = Number(item.reviews) || 42;
  const oldPrice = item.oldPrice === null || item.oldPrice === undefined || item.oldPrice === '' ? null : Number(item.oldPrice);
  return {
    id: Number(item.id) || Date.now(),
    name: item.name.trim(),
    cat: item.cat,
    price: Number.isFinite(price) && price > 0 ? Math.round(price) : 199,
    oldPrice: oldPrice && oldPrice > 0 ? Math.round(oldPrice) : null,
    stock: Number.isFinite(stock) && stock >= 0 ? Math.max(0, Math.round(stock)) : 10,
    badge: item.badge || '',
    desc: String(item.desc || '').trim() || DESCS[item.cat][0],
    image: typeof item.image === 'string' ? item.image : '',
    rating: Number.isFinite(rating) ? rating : 4.8,
    reviews: Number.isFinite(reviews) ? reviews : 42
  };
}

let products = Database.getProducts(buildDefaultProducts).map(normalizeProduct);
let orders = Database.getOrders();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
    });
    request.on('error', () => reject(new Error('Request body could not be read.')));
  });
}

function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/api/health') {
    sendJson(response, 200, { ok: true, time: new Date().toISOString() });
    return;
  }

  if (pathname === '/api/admin/login' && request.method === 'POST') {
    parseJsonBody(request)
      .then((payload) => {
        const identifier = normalizeAdminIdentifier(payload.identifier);
        const allowedIdentifiers = [ADMIN_EMAIL, ADMIN_PHONE]
          .filter(Boolean)
          .map(normalizeAdminIdentifier);
        const password = String(payload.password || '').trim();
        if (!allowedIdentifiers.includes(identifier) || password !== ADMIN_PASSWORD) {
          throw new Error('Incorrect password. Try again.');
        }
        sendJson(response, 200, { ok: true, message: 'Admin authenticated.' });
      })
      .catch((error) => sendJson(response, 401, { error: error.message || 'Unauthorized.' }));
    return;
  }

  if (pathname === '/api/products' && request.method === 'GET') {
    sendJson(response, 200, products);
    return;
  }

  if (pathname === '/api/products' && request.method === 'POST') {
    parseJsonBody(request)
      .then((payload) => {
        const created = normalizeProduct(payload);
        products.push(created);
        products.sort((a, b) => a.id - b.id);
        Database.saveProducts(products);
        sendJson(response, 201, created);
      })
      .catch((error) => sendJson(response, 400, { error: error.message }));
    return;
  }

  if (pathname === '/api/products/reset' && request.method === 'POST') {
    products = buildDefaultProducts();
    Database.saveProducts(products);
    sendJson(response, 200, products);
    return;
  }

  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    const id = Number(productMatch[1]);
    parseJsonBody(request)
      .then((payload) => {
        const index = products.findIndex((item) => item.id === id);
        if (index < 0) throw new Error('Product not found.');
        const updated = normalizeProduct({ ...products[index], ...payload, id });
        products[index] = updated;
        Database.saveProducts(products);
        sendJson(response, 200, updated);
      })
      .catch((error) => sendJson(response, 400, { error: error.message }));
    return;
  }

  if (productMatch && request.method === 'DELETE') {
    const id = Number(productMatch[1]);
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) {
      sendJson(response, 404, { error: 'Product not found.' });
      return;
    }
    products.splice(index, 1);
    Database.saveProducts(products);
    sendJson(response, 200, { ok: true, deletedId: id });
    return;
  }

  if (pathname === '/api/orders' && request.method === 'GET') {
    sendJson(response, 200, orders);
    return;
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    parseJsonBody(request)
      .then((payload) => {
        const name = String(payload.name || '').trim();
        const phone = String(payload.phone || '').trim();
        const address = String(payload.address || '').trim();
        const items = Array.isArray(payload.items) ? payload.items : [];

        if (!name || !phone || !address || !items.length) {
          throw new Error('Please complete your name, phone number, address, and cart.');
        }
        if (!/^[+0-9() .-]{7,20}$/.test(phone)) {
          throw new Error('Enter a valid phone number.');
        }

        const quantities = new Map();
        for (const item of items) {
          const productId = Number(item.id);
          const quantity = Number(item.quantity);
          const product = products.find((candidate) => candidate.id === productId);
          if (!product || !Number.isSafeInteger(productId) || productId < 1) {
            throw new Error('One of the items in your cart is invalid.');
          }
          if (!Number.isSafeInteger(quantity) || quantity < 1) {
            throw new Error(`The quantity for ${product.name} is invalid.`);
          }
          quantities.set(productId, (quantities.get(productId) || 0) + quantity);
          if (quantities.get(productId) > product.stock) {
            throw new Error(`${product.name} no longer has enough stock for your cart.`);
          }
        }

        const subtotal = items.reduce((sum, item) => {
          const product = products.find((candidate) => candidate.id === Number(item.id));
          return sum + (product ? product.price * Number(item.quantity || 0) : 0);
        }, 0);
        const shipping = subtotal >= 200 ? 0 : 15;
        const total = subtotal + shipping;

        const order = {
          id: `NV-${Date.now()}`,
          placedAt: new Date().toISOString(),
          total: Math.round(total),
          name,
          phone,
          address,
          items: items.map((item) => {
            const product = products.find((candidate) => candidate.id === Number(item.id));
            return {
              name: product ? product.name : 'Product',
              price: product ? product.price : 0,
              size: String(item.size || 'One Size'),
              quantity: Number(item.quantity) || 1
            };
          })
        };

        for (const item of items) {
          const product = products.find((candidate) => candidate.id === Number(item.id));
          if (!product) continue;
          product.stock = Math.max(0, product.stock - Number(item.quantity || 0));
        }

        orders.unshift(order);
        Database.saveProducts(products);
        Database.saveOrders(orders);
        sendJson(response, 201, order);
      })
      .catch((error) => sendJson(response, 400, { error: error.message }));
    return;
  }

  sendJson(response, 404, { error: 'Not found.' });
}

function serveStaticFile(request, response, pathname) {
  let safePath = pathname === '/' ? '/nova.html' : pathname;
  let filePath = path.join(ROOT, safePath.replace(/^\//, ''));

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'nova.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(response, 500, { error: 'Failed to read static asset.' });
      return;
    }
    response.writeHead(200, { 'Content-Type': typeMap[ext] || 'application/octet-stream' });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    handleApi(request, response);
    return;
  }

  serveStaticFile(request, response, pathname);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`NOVA API ready at http://localhost:${PORT}`);
  });
}

module.exports = { server, buildDefaultProducts, ADMIN_PASSWORD };
