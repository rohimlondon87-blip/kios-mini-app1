const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Load service account path from env or fallback
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.warn('[WARN] Service account JSON not found at', SERVICE_ACCOUNT_PATH);
  console.warn('Set SERVICE_ACCOUNT_PATH environment variable to point to your Firebase service account JSON.');
}

try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.warn('[INFO] Firebase admin not initialized. Make sure to provide service account file before running in production.');
}

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Add product
app.post('/products', async (req, res) => {
  try {
    const { barcode, name, price, stock } = req.body;
    if (!barcode || !name) return res.status(400).json({ error: 'barcode and name are required' });

    const id = uuidv4();
    const doc = { id, barcode, name, price: price || 0, stock: stock || 0, createdAt: new Date() };
    await db.collection('products').doc(id).set(doc);
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// List products
app.get('/products', async (req, res) => {
  try {
    const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
    const items = snap.docs.map(d => d.data());
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Update product
app.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('products').doc(id).update(data);
    const doc = (await db.collection('products').doc(id).get()).data();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Record sale (items: [{productId, quantity, price}])
app.post('/sales', async (req, res) => {
  const { items, total } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });

  const saleId = uuidv4();
  const sale = { id: saleId, items, total: total || 0, createdAt: new Date() };

  const batch = db.batch();

  try {
    // Decrement stock using transaction per product to avoid race
    await Promise.all(items.map(async (it) => {
      const prodRef = db.collection('products').doc(it.productId);
      await db.runTransaction(async (t) => {
        const doc = await t.get(prodRef);
        if (!doc.exists) throw new Error('product not found: ' + it.productId);
        const data = doc.data();
        const newStock = (data.stock || 0) - (it.quantity || 0);
        if (newStock < 0) throw new Error('out of stock for ' + data.name);
        t.update(prodRef, { stock: newStock });
      });
    }));

    await db.collection('sales').doc(saleId).set(sale);
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Get recent sales
app.get('/sales', async (req, res) => {
  try {
    const snap = await db.collection('sales').orderBy('createdAt', 'desc').limit(50).get();
    const items = snap.docs.map(d => d.data());
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/', (req, res) => res.send('Kios Mini Backend is running'));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
