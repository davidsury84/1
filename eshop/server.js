/**
 * Drátový model e-shopu ELKOPLAST — Express server (stejný vzor jako digitální dvojče třídicí linky)
 *
 * Servíruje jednosouborovou HTML aplikaci + jednoduché endpointy pro sdílení modelu.
 *
 * Environment:
 *   PORT                        — nastaven automaticky (Railway)
 *   RAILWAY_VOLUME_MOUNT_PATH   — pokud je přidán Volume, sdílené modely se uloží tam
 */
const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const HTML = path.join(PUBLIC_DIR, 'eshop_model.html');

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(PUBLIC_DIR, { maxAge: '5m', etag: true, lastModified: true }));

app.get('/', (req, res) => res.sendFile(HTML));

// Persistence sdílených modelů: Railway Volume nebo lokální soubor
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const SHARED_FILE = path.join(DATA_DIR, 'shared.json');
let shared = {};
try { if (fs.existsSync(SHARED_FILE)) shared = JSON.parse(fs.readFileSync(SHARED_FILE, 'utf8')); } catch (e) { shared = {}; }
function save() { try { fs.writeFileSync(SHARED_FILE, JSON.stringify(shared, null, 2)); } catch (e) { console.warn('[share] uložení selhalo:', e.message); } }
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

app.get('/health', (req, res) => res.json({
  status: 'ok', service: 'eshop-wireframe-model', version: require('./package.json').version,
  timestamp: new Date().toISOString(), uptime: process.uptime(), shared: Object.keys(shared).length,
  hasVolume: !!process.env.RAILWAY_VOLUME_MOUNT_PATH
}));

app.post('/api/share', (req, res) => {
  const b = req.body || {};
  const id = genId();
  shared[id] = {
    name: String(b.name || 'Bezejmenný model').slice(0, 100),
    author: String(b.author || 'anonym').slice(0, 100),
    nodes: Array.isArray(b.nodes) ? b.nodes : [],
    edges: Array.isArray(b.edges) ? b.edges : [],
    metadata: b.metadata || {},
    createdAt: new Date().toISOString()
  };
  save();
  res.json({ id, url: `/?shared=${id}`, createdAt: shared[id].createdAt });
});
app.get('/api/share/:id', (req, res) => {
  const p = shared[req.params.id];
  if (!p) return res.status(404).json({ error: 'Model nenalezen' });
  res.json(p);
});
app.get('/api/shared-list', (req, res) => {
  const list = Object.entries(shared).map(([id, p]) => ({
    id, name: p.name, author: p.author, createdAt: p.createdAt,
    nodeCount: (p.nodes || []).length, edgeCount: (p.edges || []).length
  })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ count: list.length, projects: list });
});
app.delete('/api/share/:id', (req, res) => {
  if (!shared[req.params.id]) return res.status(404).json({ error: 'Model nenalezen' });
  delete shared[req.params.id]; save();
  res.json({ deleted: req.params.id });
});

app.get('*', (req, res) => res.sendFile(HTML));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Drátový model e-shopu — port ${PORT}, data ${DATA_DIR}`);
});
process.on('SIGTERM', () => { save(); process.exit(0); });
