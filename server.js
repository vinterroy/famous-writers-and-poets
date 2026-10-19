const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const ROUTE_ALIASES = {
  'postati': 'postati-shevchenko.html',
  'postati-shevchenko': 'postati-shevchenko.html',
  'porivnyalna-analityka': 'porivnyalna-analityka.html',
  'porivnialna-analityka': 'porivnyalna-analityka.html',
  'mediateka-ta-patenty': 'mediateka-ta-patenty.html',
  'mediateka': 'mediateka-ta-patenty.html',
  'hronolohiya-ta-epohy': 'index.html',
  'khronolohiia-ta-epokhy': 'index.html',
  'index': 'index.html'
};

const server = http.createServer((req, res) => {
  try {
    let cleanUrl = decodeURI(req.url.split('?')[0]);
    cleanUrl = cleanUrl.replace(/^\/+/, '').replace(/\/+$/, '');

    if (cleanUrl === '') {
      cleanUrl = 'index.html';
    }

    let candidate = cleanUrl;
    const lowerKey = cleanUrl.toLowerCase().replace(/\.html$/, '');
    if (ROUTE_ALIASES[lowerKey]) {
      candidate = ROUTE_ALIASES[lowerKey];
    }

    let filePath = path.resolve(ROOT, candidate);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const withHtml = path.resolve(ROOT, candidate + '.html');
      if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
        filePath = withHtml;
      }
    }

    if (!filePath.toLowerCase().startsWith(ROOT.toLowerCase())) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403 Forbidden');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      console.log(`[404] Not found: ${cleanUrl} (resolved: ${filePath})`);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<h1>404 Not Found: ${cleanUrl}</h1><p><a href="/">На головну</a></p>`);
    }

    console.log(`[200] Serving: ${cleanUrl} -> ${path.basename(filePath)}`);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Error handling request:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Bilingual Server running at http://localhost:${PORT}/`);
});
