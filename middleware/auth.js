import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

/**
 * Authentication middleware.
 * Verifies the JWT in the 'synapse_token' cookie.
 * Checks the session_blacklist for invalidated tokens.
 */
export async function authenticate(req, res, next) {
  const token = req.cookies.synapse_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token (jti) is blacklisted (logout support)
    const { data: blacklisted, error: blError } = await supabase
      .from('session_blacklist')
      .select('jti')
      .eq('jti', decoded.jti)
      .single();

    if (blacklisted) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      provider: decoded.provider,
      jti: decoded.jti
    };

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
