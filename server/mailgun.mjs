import { createHmac, timingSafeEqual } from 'node:crypto';
import { digest, MAX_MESSAGE, MAX_ATTACHMENT, MailError } from './core.mjs';
export const MAX_WEBHOOK = 4 * 1024 * 1024;
export function verifyMailgun(raw, headers, key, now = Date.now()) {
 const timestamp = String(headers['x-mailgun-timestamp'] || '');
 const signature = String(headers['x-mailgun-signature'] || '');
 if (!key || !/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
 if (Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
 // Mailgun's JSON route format signs timestamp + exact UTF-8 HTTP body.
 const expected = createHmac('sha256', key).update(timestamp).update(raw).digest();
 return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export function parseMailgun(raw, domain) {
 let payload;
 try { payload = JSON.parse(raw.toString('utf8')); } catch { throw new MailError(406, 'Niepoprawny JSON.'); }
 if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new MailError(406, 'Niepoprawne dane.');
 const recipient = typeof payload.recipient === 'string' ? payload.recipient.toLowerCase() : '';
 if (!new RegExp('^[a-f0-9]{24}@'+domain.replaceAll('.', '\\.')+'$').test(recipient)) throw new MailError(406, 'Nieprawidłowy odbiorca.');
 const text = typeof payload['body-plain'] === 'string' ? payload['body-plain'] : '';
 const html = Array.isArray(payload['body-html']) ? payload['body-html'].filter(v => typeof v === 'string').join('\n') : (typeof payload['body-html'] === 'string' ? payload['body-html'] : '');
 if (payload.attachments !== undefined && !Array.isArray(payload.attachments)) throw new MailError(406, 'Niepoprawne załączniki.');
 const sourceAttachments = payload.attachments || [];
 if (sourceAttachments.length > 10) throw new MailError(406, 'Za dużo załączników.');
 let size = Buffer.byteLength(text) + Buffer.byteLength(html);
 const attachments = sourceAttachments.map(a => {
  if (!a || typeof a.content !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(a.content)) throw new MailError(406, 'Niepoprawny załącznik.');
  const bytes = Buffer.byteLength(a.content, 'base64');
  if (bytes > MAX_ATTACHMENT) throw new MailError(406, 'Załącznik przekracza limit.');
  size += bytes;
  return { filename: typeof a.filename === 'string' ? a.filename : 'załącznik', size: bytes };
 });
 if (size > MAX_MESSAGE) throw new MailError(406, 'Wiadomość przekracza 2 MB.');
 const headers = Array.isArray(payload['message-headers']) ? payload['message-headers'] : [];
 const messageId = headers.find(h => Array.isArray(h) && String(h[0]).toLowerCase() === 'message-id')?.[1];
 // Message-ID is sender-controlled. Include body digest to avoid dropping two
 // different emails sharing an ID. Retries with a new signature remain identical.
 const eventKey = digest(`${recipient}\n${String(messageId || '')}\n${digest(raw)}`);
 return { recipient, eventKey, size, mail: { from: {text: typeof payload.from === 'string' ? payload.from : String(payload.sender || '')}, subject: typeof payload.subject === 'string' ? payload.subject : '', text, html, attachments } };
}
