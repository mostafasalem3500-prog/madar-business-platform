const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const publicFiles = new Set([
  'index.html', 'admin.html', 'app.js', 'admin.js', 'site-config.js', 'admin.css',
  'madar-style-00.css', 'madar-style-01.css', 'madar-style-02.css', 'madar-style-03.css',
  'favicon.ico', 'robots.txt'
]);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const securityHeaders = {
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://www.hyphenksa.com https://www.candpco.com https://images.unsplash.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'cross-origin-opener-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin'
};

function send(response, status, body, extra = {}) {
  response.writeHead(status, {...securityHeaders, 'content-type': 'text/plain; charset=utf-8', ...extra});
  response.end(body);
}

http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    send(response, 405, 'الطريقة غير مسموحة', {'allow': 'GET, HEAD'});
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    send(response, 400, 'طلب غير صالح');
    return;
  }
  if (pathname === '/health') {
    send(response, 200, 'ok', {'cache-control': 'no-store'});
    return;
  }
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (!publicFiles.has(requested)) {
    send(response, 404, 'الصفحة غير موجودة');
    return;
  }
  const filePath = path.join(root, requested);
  const relative = path.relative(root, filePath);

  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(response, 404, 'الصفحة غير موجودة');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {...securityHeaders,
    'content-type': mime[extension] || 'application/octet-stream',
    'cache-control': extension === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400'
  });
  if (request.method === 'HEAD') return response.end();
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!response.headersSent) send(response, 500, 'حدث خطأ أثناء تحميل الملف');
    else response.destroy();
  });
  stream.pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Madar is running on port ${port}`);
});
