const { put } = require('@vercel/blob');
const { isAuthenticated } = require('../lib/auth');

const MAX_FILE_BYTES = 3 * 1024 * 1024;

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(payload));
}

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function safeFileName(name = 'media-edukatif') {
  return String(name).replace(/[^a-zA-Z0-9._ -]/g, '-').replace(/\s+/g, '-').slice(0, 160) || 'media-edukatif';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method tidak didukung.' });
  }
  if (!isAuthenticated(req)) return json(res, 401, { error: 'Login editor diperlukan.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(res, 500, { error: 'BLOB_READ_WRITE_TOKEN belum dikonfigurasi di Vercel.' });
  }

  try {
    const { fileName, contentType, data } = bodyOf(req);
    if (!fileName || !data) return json(res, 400, { error: 'Data file tidak lengkap.' });

    const buffer = Buffer.from(data, 'base64');
    if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
      return json(res, 413, { error: 'Ukuran file maksimal 3 MB untuk upload melalui form ini.' });
    }

    const blob = await put(`media/${Date.now()}-${safeFileName(fileName)}`, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: true
    });

    return json(res, 201, { url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || 'Upload file gagal.' });
  }
};
