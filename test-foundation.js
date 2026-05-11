import { encrypt, decrypt } from './services/crypto.js';
import { supabase } from './services/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('--- Synapse Foundation Test ---');

  // 1. Test Crypto
  try {
    const secret = 'super-secret-token-123';
    const { iv, ciphertext, tag } = encrypt(secret);
    const decrypted = decrypt(ciphertext, iv, tag);
    
    if (secret === decrypted) {
      console.log('✅ Crypto: Encryption/Decryption successful');
    } else {
      console.error('❌ Crypto: Decryption failed');
    }
  } catch (err) {
    console.error('❌ Crypto Error:', err.message);
  }

  // 2. Test Supabase Connection (Read profiles table)
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
    if (error) throw error;
    console.log(`✅ Supabase: Connection successful (Found ${data.length} profiles)`);
  } catch (err) {
    console.error('❌ Supabase Error:', err.message);
  }

  console.log('--- Test Complete ---');
  process.exit(0);
}

runTests();
