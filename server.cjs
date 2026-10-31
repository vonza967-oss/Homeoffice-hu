// Zero-dependency local preview server. No orders or customer data are transmitted.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };
const port = Number(process.env.PORT) || 3000;
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname)); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.writeHead(200); res.end(content);
  });
}).listen(port, '127.0.0.1', () => console.log(`Homeoffice.hu demo: http://127.0.0.1:${port}`));
