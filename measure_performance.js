const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

const API_BASE = 'http://localhost:5000/api';
const RUNS = 10;

function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const end = performance.now();
        const duration = end - start;
        resolve({ duration, statusCode: res.statusCode, body });
      });
    });
    req.on('error', (err) => reject(err));
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runBenchmarks() {
  console.log('====================================================');
  console.log('  FOODBRIDGE AI - EMPIRICAL PERFORMANCE BENCHMARK');
  console.log('====================================================\n');

  const results = {};

  // 1. API Response Time (Health Check endpoint)
  console.log('--> Measuring Health API Response Time...');
  let healthTimes = [];
  for (let i = 0; i < RUNS; i++) {
    const res = await makeRequest(`${API_BASE}/health`);
    healthTimes.push(res.duration);
  }
  const avgHealth = healthTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['API response'] = `${avgHealth.toFixed(2)} ms`;

  // 2. Login Response Time (Authentication POST /api/auth/login)
  console.log('--> Measuring Login Response Time...');
  let loginTimes = [];
  let authToken = '';
  for (let i = 0; i < RUNS; i++) {
    const loginData = {
      email: 'donor@grandpalace.com',
      password: 'password123'
    };
    const res = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, loginData);

    loginTimes.push(res.duration);
    if (i === 0 && res.body) {
      try {
        const parsed = JSON.parse(res.body);
        authToken = parsed.token || '';
      } catch (e) {}
    }
  }
  const avgLogin = loginTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['Login response time'] = `${avgLogin.toFixed(2)} ms`;

  // 3. Donation Creation Time (POST /api/donations)
  console.log('--> Measuring Donation Creation Time...');
  let donationTimes = [];
  for (let i = 0; i < RUNS; i++) {
    const donationData = {
      title: `Benchmark Test Feast #${i + 1}`,
      foodType: 'Cooked Meals',
      quantity: 50,
      servings: 50,
      donorName: 'Benchmark Grand Hotel',
      donorPhone: '9876543210',
      location: {
        address: '123 Test St, Chennai',
        city: 'Chennai',
        lat: 13.0827,
        lng: 80.2707
      },
      expiryHours: 6
    };
    const res = await makeRequest(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, donationData);
    donationTimes.push(res.duration);
  }
  const avgDonation = donationTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['Donation creation'] = `${avgDonation.toFixed(2)} ms`;

  // 4. Dashboard Loading Time (Fetching Donations + Impact stats)
  console.log('--> Measuring Dashboard Loading Time...');
  let dashboardTimes = [];
  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    await Promise.all([
      makeRequest(`${API_BASE}/donations`),
      makeRequest(`${API_BASE}/impact`)
    ]);
    const end = performance.now();
    dashboardTimes.push(end - start);
  }
  const avgDashboard = dashboardTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['Dashboard loading'] = `${avgDashboard.toFixed(2)} ms`;

  // 5. Database Query Latency (Read query across full dataset)
  console.log('--> Measuring Database Query Time...');
  let dbTimes = [];
  for (let i = 0; i < RUNS; i++) {
    const res = await makeRequest(`${API_BASE}/donations?city=Chennai`);
    dbTimes.push(res.duration);
  }
  const avgDb = dbTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['Database query'] = `${avgDb.toFixed(2)} ms`;

  // 6. Map Tile Loading Time (Fetching OpenStreetMap CDN Tile)
  console.log('--> Measuring Map Loading Time...');
  let mapTimes = [];
  for (let i = 0; i < RUNS; i++) {
    const res = await makeRequest('https://tile.openstreetmap.org/13/4688/3012.png', {
      headers: { 'User-Agent': 'FoodBridge-AI-Benchmark/1.0' }
    });
    mapTimes.push(res.duration);
  }
  const avgMap = mapTimes.reduce((a, b) => a + b, 0) / RUNS;
  results['Map loading'] = `${avgMap.toFixed(2)} ms`;

  console.log('\n====================================================');
  console.log('  FINAL MEASURED PERFORMANCE RESULTS');
  console.log('====================================================\n');

  console.table(Object.entries(results).map(([Parameter, MeasuredResult]) => ({
    Parameter,
    'Measured Result': MeasuredResult
  })));

  console.log('\nJSON Output:');
  console.log(JSON.stringify(results, null, 2));
}

runBenchmarks().catch(console.error);
