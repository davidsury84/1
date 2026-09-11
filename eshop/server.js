/**
 * Drátový model e-shopu ELKOPLAST — Express server (stejný vzor jako digitální dvojče třídicí linky)
 *
 * Servíruje jednosouborovou HTML aplikaci + endpointy pro sdílené modely, na kterých
 * spolupracuje více lidí (každý model má id, jméno, autora, poslední úpravu; ukládá se přepisem).
 *
 * Environment:
 *   PORT                        — nastaven automaticky (Railway)
 *   RAILWAY_VOLUME_MOUNT_PATH   — pokud je přidán Volume, sdílené modely se uloží tam (jinak ./shared.json)
 *   INTRANET_SSO_SECRET         — sdílené tajemství s intranetem (= SSO_SHARED_SECRET intranetu);
 *                                 když je nastavené, aplikace vyžaduje přihlášení z intranetu
 *                                 (modul „Model e-shopu" → /eshop-model-app → redirect sem s ?sso=token)
 *   INTRANET_URL                — adresa intranetu pro odkaz „přihlásit se" (výchozí https://intranet.elkoplast.cz)
 */
const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const HTML = path.join(PUBLIC_DIR, 'eshop_model.html');

// ==========================================================================
//  SSO z intranetu (vzor tridici-linka-dvojce / Kalkulace-lisy): intranet přesměruje s ?sso=<token>,
//  token = b64url(JSON{email,name,exp}) + "." + HMAC-SHA256("sso:"+data)[0..32].
//  Server token ověří, nastaví vlastní session cookie a dál pouští jen přihlášené.
//  Bez INTRANET_SSO_SECRET běží aplikace otevřeně (lokální vývoj).
// ==========================================================================
const SSO_SECRET = (process.env.INTRANET_SSO_SECRET || '').trim();
const INTRANET_URL = (process.env.INTRANET_URL || 'https://intranet.elkoplast.cz').replace(/\/$/, '');
const SESSION_MS = 12 * 3600 * 1000;

function b64urlDecode(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Buffer.from(s, 'base64').toString('utf8'); }
function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function hmac(prefix, data) { return crypto.createHmac('sha256', SSO_SECRET).update(prefix + data).digest('hex').slice(0, 32); }
function verify(str, prefix) {
  if (!str) return null;
  const i = str.lastIndexOf('.'); if (i < 0) return null;
  const data = str.slice(0, i), sig = str.slice(i + 1);
  let ok = false;
  try { ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hmac(prefix, data))); } catch (_) { return null; }
  if (!ok) return null;
  try { const p = JSON.parse(b64urlDecode(data)); return (p && p.email && (!p.exp || Date.now() < p.exp)) ? p : null; } catch (_) { return null; }
}
function sessionSign(emp) { const data = b64url(JSON.stringify({ email: emp.email, name: emp.name || emp.email, exp: Date.now() + SESSION_MS })); return data + '.' + hmac('emp:', data); }
function cookieVal(req, name) { const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? decodeURIComponent(m[1]) : ''; }

function loginPage() {
  return '<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Model e-shopu — přihlášení</title><style>body{margin:0;font-family:system-ui,sans-serif;background:#eef1ec;color:#0f1512;display:grid;place-items:center;min-height:100vh}'
    + '.c{max-width:460px;text-align:center;background:#fff;border:1px solid #e3e7e0;border-radius:16px;padding:34px 30px;box-shadow:0 10px 30px rgba(15,21,18,.07)}'
    + 'h1{font-size:20px;margin:0 0 8px}p{color:#5b635c;margin:0 0 18px;line-height:1.55}'
    + 'a{display:inline-block;background:linear-gradient(135deg,#15ab57,#0a6b34);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600}</style></head>'
    + '<body><div class="c"><h1>🧩 Model e-shopu</h1><p>Aplikace je dostupná zaměstnancům ELKOPLAST přes intranet.</p>'
    + '<a href="' + INTRANET_URL + '/eshop-model-app" target="_top">Přihlásit se přes intranet →</a></div></body></html>';
}

app.use((req, res, next) => {
  if (!SSO_SECRET) return next();
  if (req.path === '/health') return next();
  const tok = verify(String(req.query.sso || ''), 'sso:');
  if (tok) {
    // SameSite=None kvůli iframu v intranetu (cross-site); vyžaduje Secure (Railway běží na HTTPS).
    res.setHeader('Set-Cookie', 'em_emp=' + encodeURIComponent(sessionSign(tok)) + '; HttpOnly; Path=/; Max-Age=' + Math.floor(SESSION_MS / 1000) + '; SameSite=None; Secure');
    req.emp = { email: tok.email, name: tok.name || tok.email };
    return next();
  }
  const sess = verify(cookieVal(req, 'em_emp'), 'emp:');
  if (sess) { req.emp = { email: sess.email, name: sess.name }; return next(); }
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Nepřihlášeno — otevřete aplikaci přes intranet.' });
  return res.status(401).send(loginPage());
});

app.get('/api/me', (req, res) => res.json({ sso: !!SSO_SECRET, employee: req.emp || null }));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(PUBLIC_DIR, { maxAge: '5m', etag: true, lastModified: true }));
app.get('/', (req, res) => res.sendFile(HTML));

// ==========================================================================
//  Sdílené modely — společná práce více lidí.
//  POST   /api/share        → nový model {id}
//  PUT    /api/share/:id    → přepíše model (poslední zápis vyhrává; klient posílá updatedAt, které viděl,
//                             a při konfliktu dostane 409 s aktuální verzí)
//  GET    /api/share/:id    → načte model
//  GET    /api/shared-list  → seznam
//  DELETE /api/share/:id    → smaže
// ==========================================================================
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const SHARED_FILE = path.join(DATA_DIR, 'shared.json');
let shared = {};
try { if (fs.existsSync(SHARED_FILE)) shared = JSON.parse(fs.readFileSync(SHARED_FILE, 'utf8')); console.log('[share] načteno ' + Object.keys(shared).length + ' modelů z ' + SHARED_FILE); } catch (e) { shared = {}; }
function save() { try { fs.writeFileSync(SHARED_FILE, JSON.stringify(shared, null, 2)); } catch (e) { console.warn('[share] uložení selhalo:', e.message); } }
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
function who(req, b) { return req.emp ? (req.emp.name || req.emp.email) : String((b && b.author) || 'anonym').slice(0, 100); }
function fromBody(req, b, prev) {
  return {
    name: String(b.name || (prev && prev.name) || 'Bezejmenný model').slice(0, 100),
    author: prev ? prev.author : who(req, b),
    updatedBy: who(req, b),
    nodes: Array.isArray(b.nodes) ? b.nodes : [],
    edges: Array.isArray(b.edges) ? b.edges : [],
    metadata: b.metadata || {},
    createdAt: prev ? prev.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
function summary(id, p) {
  const st = p.metadata && p.metadata.state;
  const L = st && st.diagrams && st.diagrams.logic;
  return { id, name: p.name, author: p.author, updatedBy: p.updatedBy || p.author, createdAt: p.createdAt, updatedAt: p.updatedAt || p.createdAt,
    nodeCount: L ? L.nodes.length : (p.nodes || []).length, edgeCount: L ? L.edges.length : (p.edges || []).length };
}

app.get('/health', (req, res) => res.json({
  status: 'ok', service: 'eshop-wireframe-model', version: require('./package.json').version,
  timestamp: new Date().toISOString(), uptime: process.uptime(), shared: Object.keys(shared).length,
  hasVolume: !!process.env.RAILWAY_VOLUME_MOUNT_PATH, sso: !!SSO_SECRET
}));

app.post('/api/share', (req, res) => {
  const id = genId();
  shared[id] = fromBody(req, req.body || {}, null);
  save();
  console.log('[share] nový: "' + shared[id].name + '" od ' + shared[id].author + ' → ' + id);
  res.json({ id, url: '/?shared=' + id, updatedAt: shared[id].updatedAt, ...summary(id, shared[id]) });
});
app.put('/api/share/:id', (req, res) => {
  const prev = shared[req.params.id];
  if (!prev) return res.status(404).json({ error: 'Model nenalezen' });
  const b = req.body || {};
  // ochrana před přepsáním cizí novější verze: klient pošle baseUpdatedAt, které načetl
  if (b.baseUpdatedAt && prev.updatedAt && b.baseUpdatedAt !== prev.updatedAt) {
    return res.status(409).json({ error: 'Model mezitím upravil ' + (prev.updatedBy || prev.author) + ' (' + prev.updatedAt + '). Načti aktuální verzi a ulož znovu.', current: summary(req.params.id, prev) });
  }
  shared[req.params.id] = fromBody(req, b, prev);
  save();
  res.json({ id: req.params.id, ...summary(req.params.id, shared[req.params.id]) });
});
app.get('/api/share/:id', (req, res) => {
  const p = shared[req.params.id];
  if (!p) return res.status(404).json({ error: 'Model nenalezen' });
  res.json({ id: req.params.id, ...p });
});
app.get('/api/shared-list', (req, res) => {
  const list = Object.entries(shared).map(([id, p]) => summary(id, p)).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  res.json({ count: list.length, projects: list });
});
app.delete('/api/share/:id', (req, res) => {
  if (!shared[req.params.id]) return res.status(404).json({ error: 'Model nenalezen' });
  delete shared[req.params.id]; save();
  res.json({ deleted: req.params.id });
});

app.get('*', (req, res) => res.sendFile(HTML));

app.listen(PORT, '0.0.0.0', () => {
  console.log('Drátový model e-shopu — port ' + PORT + ', data ' + DATA_DIR + ', SSO ' + (SSO_SECRET ? 'zapnuto' : 'vypnuto'));
});
process.on('SIGTERM', () => { save(); process.exit(0); });
