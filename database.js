const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDirectory() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDataDirectory();
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    throw new Error(`Could not save database file "${path.basename(filePath)}": ${error.message}`);
  }
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read database file "${path.basename(filePath)}": ${error.message}`);
  }
}

function getProducts(defaultProducts) {
  ensureDataDirectory();
  const products = readJson(PRODUCTS_FILE, defaultProducts());
  if (!Array.isArray(products)) {
    throw new Error('The products database must contain a JSON array.');
  }
  if (!products.length) {
    const defaults = defaultProducts();
    saveProducts(defaults);
    return defaults;
  }
  return products;
}

function saveProducts(products) {
  if (!Array.isArray(products)) {
    throw new TypeError('Products must be saved as an array.');
  }
  writeJson(PRODUCTS_FILE, products);
}

function getOrders() {
  ensureDataDirectory();
  const orders = readJson(ORDERS_FILE, []);
  if (!Array.isArray(orders)) {
    throw new Error('The orders database must contain a JSON array.');
  }
  return orders;
}

function saveOrders(orders) {
  if (!Array.isArray(orders)) {
    throw new TypeError('Orders must be saved as an array.');
  }
  writeJson(ORDERS_FILE, orders);
}

module.exports = {
  getProducts,
  saveProducts,
  getOrders,
  saveOrders
};
