const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '256kb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// In-memory store of last known location by courierId
// Replace with a persistent datastore in production
const courierLastLocation = new Map();

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateLocationPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return ['Invalid JSON body'];
  }
  const { courierId, lat, lng, speed, heading, jobId, battery, timestamp } = payload;
  if (!courierId || typeof courierId !== 'string') errors.push('courierId must be a non-empty string');
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) errors.push('lat must be a number in [-90, 90]');
  if (!isFiniteNumber(lng) || lng < -180 || lng > 180) errors.push('lng must be a number in [-180, 180]');
  if (speed !== undefined && !isFiniteNumber(speed)) errors.push('speed must be a number if provided');
  if (heading !== undefined && !isFiniteNumber(heading)) errors.push('heading must be a number if provided');
  if (battery !== undefined && !isFiniteNumber(battery)) errors.push('battery must be a number (0..1) if provided');
  if (timestamp !== undefined && !isFiniteNumber(timestamp)) errors.push('timestamp must be a number (ms since epoch) if provided');
  if (jobId !== undefined && typeof jobId !== 'string') errors.push('jobId must be a string if provided');
  return errors;
}

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true, service: 'courier-tracking-server' });
});

app.post('/v1/locations', (req, res) => {
  const errors = validateLocationPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const {
    courierId,
    lat,
    lng,
    speed = null,
    heading = null,
    jobId = null,
    battery = null,
  } = req.body;
  const timestamp = isFiniteNumber(req.body.timestamp) ? req.body.timestamp : Date.now();

  const location = {
    courierId,
    lat,
    lng,
    speed,
    heading,
    jobId,
    battery,
    timestamp,
  };
  courierLastLocation.set(courierId, location);

  // Broadcast to all dashboards
  io.emit('location', location);

  // 202 Accepted signals async processing in real systems
  return res.status(202).json({ status: 'accepted' });
});

app.get('/v1/couriers', (_req, res) => {
  const couriers = Array.from(courierLastLocation.values());
  res.json({ couriers });
});

app.get('/v1/couriers/:id/last-location', (req, res) => {
  const { id } = req.params;
  const last = courierLastLocation.get(id);
  if (!last) return res.status(404).json({ error: 'not_found' });
  res.json(last);
});

// Static dashboard
const publicDir = path.join(__dirname, 'public');
app.use('/public', express.static(publicDir));
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

io.on('connection', (socket) => {
  // Send current snapshot on connect
  const couriers = Array.from(courierLastLocation.values());
  socket.emit('snapshot', { couriers });
});

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Courier tracking server listening on http://localhost:${PORT}`);
});



