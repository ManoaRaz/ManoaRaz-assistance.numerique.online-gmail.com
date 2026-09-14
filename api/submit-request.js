const fs = require('fs');
const { formidable } = require('formidable');

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const ADMIN_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER || '261325098288';

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function buildSummary(fields) {
  const ignored = new Set(['service', 'website']);
  const lines = [];
  for (const [key, raw] of Object.entries(fields)) {
    if (ignored.has(key)) continue;
    const value = first(raw);
    if (value == null || String(value).trim() === '') continue;
    lines.push(`• ${cleanLabel(key)} : ${String(value).trim()}`);
  }
  return lines.join('\n');
}

async function graph(path, options = {}) {
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Erreur WhatsApp API (${response.status})`;
    const err = new Error(message);
    err.meta = payload;
    throw err;
  }
  return payload;
}

async function sendText(body) {
  return graph(`${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: ADMIN_NUMBER,
      type: 'text',
      text: { preview_url: false, body }
    })
  });
}

async function uploadMedia(file) {
  const bytes = await fs.promises.readFile(file.filepath);
  const body = new FormData();
  body.append('messaging_product', 'whatsapp');
  body.append('file', new Blob([bytes], { type: file.mimetype || 'application/octet-stream' }), file.originalFilename || 'document');
  return graph(`${PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body
  });
}

async function sendMedia(file, mediaId, service) {
  const filename = file.originalFilename || 'document';
  const isImage = String(file.mimetype || '').startsWith('image/');
  const payload = isImage
    ? {
        messaging_product: 'whatsapp',
        to: ADMIN_NUMBER,
        type: 'image',
        image: { id: mediaId, caption: `Pièce jointe — ${service}` }
      }
    : {
        messaging_product: 'whatsapp',
        to: ADMIN_NUMBER,
        type: 'document',
        document: { id: mediaId, filename, caption: `Pièce jointe — ${service}` }
      };

  return graph(`${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    return res.status(503).json({
      success: false,
      message: 'La réception WhatsApp automatique n’est pas encore activée sur le serveur.'
    });
  }

  const form = formidable({
    multiples: true,
    maxFiles: 3,
    maxFileSize: 4 * 1024 * 1024,
    allowEmptyFiles: false
  });

  try {
    const [fields, files] = await form.parse(req);

    if (first(fields.website)) {
      return res.status(200).json({ success: true });
    }

    const service = first(fields.service) || 'Nouvelle demande depuis le site';
    const summary = buildSummary(fields);
    const text = `📩 Nouvelle demande — ${service}\n\n${summary || 'Aucune information textuelle supplémentaire.'}`;

    await sendText(text);

    const uploadedFiles = [];
    for (const value of Object.values(files || {})) {
      const list = Array.isArray(value) ? value : [value];
      for (const file of list) {
        if (!file || !file.filepath) continue;
        const media = await uploadMedia(file);
        await sendMedia(file, media.id, service);
        uploadedFiles.push(file.originalFilename || 'document');
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Demande transmise sur WhatsApp.',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('submit-request:', error);
    return res.status(500).json({
      success: false,
      message: 'La transmission WhatsApp automatique a échoué. Vérifiez la configuration WhatsApp Business Cloud API du serveur.'
    });
  }
};
