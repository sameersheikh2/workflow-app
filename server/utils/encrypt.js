const crypto = require('crypto');

if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not set in .env');
}

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a valid 64-character hex string (producing exactly 32 bytes). Please check your environment variables.');
}

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(data) {
  if (!data) return data;
  const [ivHex, encHex] = data.split(':');
  if (!ivHex || !encHex) return data;
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = { encrypt, decrypt };
