const crypto = require('crypto');

const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

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
