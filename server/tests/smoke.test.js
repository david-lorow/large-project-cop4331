/**
 * Post-deploy smoke tests
 *
 * These tests run after every deploy to verify the API is still reachable
 * and returning expected responses. A failure here means the deploy broke
 * the site and the Discord notification will reflect that.
 *
 * Set BASE_URL to the production URL, e.g.:
 *   BASE_URL=https://resumereaper.com npm test
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:6767';

// Use native fetch (Node 18+); fall back to node-fetch if needed
const fetchFn = typeof fetch !== 'undefined' ? fetch : (() => { throw new Error('fetch not available — use Node 18+'); })();

const get = (path) => fetchFn(`${BASE_URL}${path}`);
const post = (path, body) =>
  fetchFn(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ─── Health / reachability ────────────────────────────────────────────────────

describe('API health', () => {
  test('GET /api/test returns 200 with expected message', async () => {
    const res = await get('/api/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: 'API is working' });
  });

  test('server does not return a connection-refused error', async () => {
    // If the server is down, fetch throws a TypeError; we want it to succeed.
    await expect(get('/api/test')).resolves.toBeDefined();
  });
});

// ─── Auth endpoints reachable ─────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 400 when body is empty (not 500 or network error)', async () => {
    const res = await post('/api/auth/login', {});
    // 400 = validation error = server is up and handling requests
    expect(res.status).toBe(400);
  });

  test('returns 401 for clearly wrong credentials (not 500 or network error)', async () => {
    const res = await post('/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });
    // 401 = server reached MongoDB and found no user
    expect(res.status).toBe(401);
  });

  test('response is JSON', async () => {
    const res = await post('/api/auth/login', { email: 'x@x.com', password: 'bad' });
    const contentType = res.headers.get('content-type') || '';
    expect(contentType).toMatch(/application\/json/);
  });
});

describe('POST /api/auth/register', () => {
  test('returns 400 when required fields are missing', async () => {
    const res = await post('/api/auth/register', {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('All fields are required.');
  });

  test('returns 400 for password shorter than 8 characters', async () => {
    const res = await post('/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'smoke-test-unique@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Password must be at least 8 characters.');
  });
});

// ─── Frontend is being served ─────────────────────────────────────────────────

describe('Frontend SPA', () => {
  test('GET / serves HTML (Vite build is present)', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/<html/i);
  });

  test('GET /nonexistent-route returns the SPA index (client-side routing)', async () => {
    const res = await get('/this-route-does-not-exist-on-the-server');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/<html/i);
  });
});
