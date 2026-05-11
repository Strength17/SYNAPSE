import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 64-char hex (32 bytes)
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string');
}

/**
 * Encrypts text using AES-256-GCM.
 * @param {string} text - The plain text to encrypt.
 * @returns {Object} { iv: hex, ciphertext: hex, tag: hex }
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let ciphertext = cipher.update(text, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    ciphertext,
    tag
  };
}

/**
 * Decrypts ciphertext using AES-256-GCM.
 * @param {string} ciphertext - The encrypted hex string.
 * @param {string} iv - The initialization vector hex string.
 * @param {string} tag - The auth tag hex string.
 * @returns {string} The decrypted plain text.
 */
export function decrypt(ciphertext, iv, tag) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
