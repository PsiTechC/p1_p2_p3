// services/pdfText.js
const axios = require('axios');
const dns = require('dns');
const https = require('https');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

dns.setDefaultResultOrder?.('ipv4first');
const agent = new https.Agent({ keepAlive: true, family: 4, lookup: dns.lookup });

function normalizeUrl(u) {
  try {
    const url = new URL(u);
    url.pathname = url.pathname
      .split('/')
      .map((p) => encodeURIComponent(decodeURIComponent(p)))
      .join('/');
    return url.toString();
  } catch {
    return encodeURI(u);
  }
}

async function fetchBinary(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    httpsAgent: agent,
    maxRedirects: 3,
    validateStatus: (s) => s >= 200 && s < 400,
  });
  // Axios returns a Node Buffer here. We must hand pdf.js an ArrayBuffer or a fresh Uint8Array
  const buf = Buffer.from(res.data); // ensure Buffer
  // Create a clean ArrayBuffer slice with the exact bounds of the data
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return ab; // <- return ArrayBuffer (not Buffer/Uint8Array)
}

/**
 * Extracts text page-by-page to keep memory low.
 * @param {string} fileUrl
 * @param {{maxPages?: number}} options
 * @returns {Promise<string>}
 */
async function extractTextPageByPage(fileUrl, { maxPages } = {}) {
  const safe = normalizeUrl(fileUrl);
  console.log('🧷 pdfText.extract: GET', safe);

  const ab = await fetchBinary(safe);
  console.log('🧷 pdfText.extract: bytes', ab.byteLength, 'type', Object.prototype.toString.call(ab)); // [object ArrayBuffer]

  // Build a fresh Uint8Array from the *sliced* ArrayBuffer to avoid Buffer-backed views.
  const u8 = new Uint8Array(ab);

  const loadingTask = pdfjsLib.getDocument({
    data: u8,               // clean Uint8Array view (not Buffer)
    disableFontFace: true,  // we only need text, saves memory
    useSystemFonts: false,
    isEvalSupported: false,
    // extra safety for Node environments:
    nativeImageDecoderSupport: 'none',
  });

  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const limit = Math.min(total, maxPages || total);
  console.log(`🧷 pdfText.extract: pages ${total}, processing ${limit}`);

  const parts = [];
  for (let p = 1; p <= limit; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent({ disableCombineTextItems: false });
    const txt = content.items.map((i) => i.str || '').join(' ');
    parts.push(txt);
    page.cleanup();
    if (p % 10 === 0 || p === limit) console.log(`🧷 pdfText.extract: page ${p}/${limit}`);
  }
  try { pdf.cleanup(); } catch {}

  const text = parts.join('\n\n');
  console.log('🧷 pdfText.extract: chars', text.length);
  return text;
}

module.exports = { extractTextPageByPage, normalizeUrl };
