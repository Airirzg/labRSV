import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

// Store connected clients
const clients = new Set<NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add client to the set
    clients.add(res);

    // Remove client when connection is closed
    req.on('close', () => {
      clients.delete(res);
    });

    // Send initial data
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
        equipment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    sendEventToClient(res, 'initial', reservations);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 30000);

    // Clean up on close
    req.on('close', () => {
      clearInterval(keepAlive);
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Helper function to send events to a specific client
function sendEventToClient(client: NextApiResponse, event: string, data: any) {
  client.write(`event: ${event}\n`);
  client.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Export function to broadcast events to all clients
export function broadcastEvent(event: string, data: any) {
  clients.forEach(client => {
    sendEventToClient(client, event, data);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
