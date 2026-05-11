import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { startSyncLoop, stopSyncLoop } from '../services/sync.js';

const router = express.Router();

// Store active SSE connections by userId
const clients = new Map();

/**
 * GET /api/stream
 * Authenticated SSE endpoint.
 */
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Add client to the map
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
    // Start background sync loop for this user (Phase 5)
    startSyncLoop(userId);
  }
  clients.get(userId).add(res);

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        clients.delete(userId);
        // Stop background sync when no clients are connected
        stopSyncLoop(userId);
      }
    }
  });
});

/**
 * Broadcasts an event to all active connections for a user.
 */
export function broadcast(userId, type, data) {
  const userClients = clients.get(userId);
  if (userClients) {
    const event = `data: ${JSON.stringify({ type, data })}\n\n`;
    userClients.forEach(client => client.write(event));
  }
}

export default router;
