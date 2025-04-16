import { NextApiResponse, NextApiRequest } from 'next';
import { verifyToken } from '@/utils/auth';
import { initSSE, SSEManager } from '@/utils/sse';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from query parameter
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Allow all origins for SSE
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const sendEvent = initSSE(res);
    const sseManager = SSEManager.getInstance();
    
    // Add client to manager
    const clientId = user.id;
    sseManager.addClient(clientId, sendEvent);

    // Send initial connection success event
    sendEvent({ 
      type: 'connected', 
      message: 'SSE connection established',
      userId: clientId 
    });

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      sendEvent({ 
        type: 'heartbeat', 
        timestamp: new Date().toISOString() 
      });
    }, 15000);

    // Clean up on connection close
    req.on('close', () => {
      clearInterval(heartbeat);
      sseManager.removeClient(clientId);
      res.end();
    });

  } catch (error) {
    console.error('SSE Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default handler;
