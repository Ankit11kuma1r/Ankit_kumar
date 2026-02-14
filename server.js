const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 3000);
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'ankit11kuma1r@gmail.com';

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const ordersPath = path.join(dataDir, 'orders.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(ordersPath)) fs.writeFileSync(ordersPath, '[]');

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
}

function sendJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function sendOwnerEmail(order) {
  return new Promise((resolve) => {
    const sendmailPath = '/usr/sbin/sendmail';

    if (!fs.existsSync(sendmailPath)) {
      console.log('sendmail not available. Skipping owner email notification.');
      return resolve();
    }

    const message = [
      `To: ${OWNER_EMAIL}`,
      'Subject: New milk order received',
      'Content-Type: text/plain; charset=utf-8',
      '',
      `New milk order from ${order.customerName}`,
      `Email: ${order.email}`,
      `Phone: ${order.phone}`,
      `Address: ${order.address}`,
      `Daily quantity (L): ${order.quantityLiters}`,
      `Delivery time: ${order.deliveryTime}`,
      `Milk type: ${order.milkType}`,
      `Discount won: ${order.discountPercent}%`,
      `Notes: ${order.notes || 'N/A'}`,
      `Created at: ${order.createdAt}`
    ].join('\n');

    const proc = spawn(sendmailPath, ['-t']);
    proc.stdin.write(message);
    proc.stdin.end();
    proc.on('close', () => resolve());
    proc.on('error', () => resolve());
  });
}

const mimeMap = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

function serveStatic(res, filePath) {
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    try {
      const body = await parseBody(req);
      const requiredFields = [
        'customerName',
        'email',
        'phone',
        'address',
        'quantityLiters',
        'deliveryTime',
        'milkType',
        'discountPercent'
      ];

      const missing = requiredFields.some((field) => !String(body[field] ?? '').trim());
      if (missing) return sendJson(res, 400, { message: 'Please complete all required fields.' });

      const orders = readOrders();
      const order = {
        id: orders.length ? orders[0].id + 1 : 1,
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        quantityLiters: body.quantityLiters,
        deliveryTime: body.deliveryTime,
        milkType: body.milkType,
        notes: body.notes || '',
        discountPercent: Number(body.discountPercent),
        createdAt: new Date().toISOString()
      };

      orders.unshift(order);
      writeOrders(orders);
      await sendOwnerEmail(order);

      return sendJson(res, 201, { message: 'Order placed successfully!', orderId: order.id });
    } catch (error) {
      return sendJson(res, 500, { message: error.message || 'Could not save order.' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/orders') {
    return sendJson(res, 200, readOrders());
  }

  if (req.method === 'GET') {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return serveStatic(res, path.join(publicDir, 'index.html'));
    }
    if (url.pathname === '/dashboard') {
      return serveStatic(res, path.join(publicDir, 'dashboard.html'));
    }

    const staticPath = path.join(publicDir, decodeURIComponent(url.pathname));
    return serveStatic(res, staticPath);
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`Premium milk website running on http://localhost:${PORT}`);
});
