import app from '../server/index.js';

/**
 * Vercel hanya mendukung satu segmen path untuk file api/[...slug].js,
 * sehingga rute bersarang seperti /api/auth/login tidak pernah masuk ke Express.
 *
 * vercel.json menulis ulang /api/<path> menjadi /api?path=<path>.
 * Handler ini mengembalikan URL aslinya sebelum diteruskan ke Express.
 */
export default function handler(req, res) {
  const raw = req.url || '/';
  const separator = raw.indexOf('?');
  const pathname = separator === -1 ? raw : raw.slice(0, separator);
  const params = new URLSearchParams(separator === -1 ? '' : raw.slice(separator + 1));
  const forwarded = params.get('path');

  if (typeof forwarded === 'string') {
    const rest = forwarded.replace(/^\/+/, '');
    params.delete('path');
    const query = params.toString();
    req.url = `/api/${rest}${query ? `?${query}` : ''}`;
  } else {
    req.url = pathname;
  }

  return app(req, res);
}
