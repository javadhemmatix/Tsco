'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{Allow:'GET, HEAD'}); return res.end(); }
  if (pathname === '/') pathname = '/index.html';
  if (!['/index.html','/style.css','/app.js'].includes(pathname) && !pathname.startsWith('/assets/')) { res.writeHead(404); return res.end('Not found'); }
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(target,(error,data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`TSCO development server listening on port ${process.env.PORT || 3000}`));
