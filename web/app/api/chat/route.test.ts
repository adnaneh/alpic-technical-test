import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const originalEnv = { ...process.env };
const originalFetch: typeof fetch = globalThis.fetch;

describe('app/api/chat/route POST', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(globalThis, 'fetch', { value: originalFetch, configurable: true });
  });

  it('returns 503 when BACKEND_URL is missing', async () => {
    delete process.env.BACKEND_URL;

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: new Headers(),
      body: JSON.stringify({ body: 'x' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: 'Backend service is not configured' });
  });

  it('forwards to backend and strips hop-by-hop headers', async () => {
    process.env.BACKEND_URL = 'http://upstream:3001';

    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const h = new Headers(init?.headers);
      expect(h.has('connection')).toBe(false);
      expect(h.get('content-type')).toBe('application/json');
      expect(h.get('accept')).toMatch(/text\/event-stream|\*\/*/);

      return new Response('ok', {
        status: 201,
        statusText: 'Created',
        headers: {
          'connection': 'close',
          'content-length': '2',
          'x-other': '1',
        },
      });
    });
    Object.defineProperty(globalThis, 'fetch', { value: fetchMock, configurable: true });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: new Headers({ connection: 'keep-alive' }),
      body: JSON.stringify({ msg: 'hello' }),
    });

    const res = await POST(req);
    expect(fetchMock).toHaveBeenCalled();
    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall[0]).toBe('http://upstream:3001/api/chat');
    expect(res.status).toBe(201);
    expect(res.statusText).toBe('Created');
    const hdrs = res.headers;
    expect(hdrs.has('connection')).toBe(false);
    expect(hdrs.has('content-length')).toBe(false);
    expect(hdrs.get('x-accel-buffering')).toBe('no');
    expect(hdrs.get('cache-control')).toBe('no-cache, no-transform');
    await expect(res.text()).resolves.toBe('ok');
  });
});
