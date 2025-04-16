import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// Store connected clients
const clients = new Set<NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          equipment: {
            select: {
              id: true,
              name: true,
              description: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('Sending initial reservations:', reservations.length);
      sendEventToClient(res, 'initial', reservations);

      // Keep connection alive
      const keepAlive = setInterval(() => {
        if (res.closed) {
          clearInterval(keepAlive);
          return;
        }
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
  } catch (error) {
    console.error('Error in SSE handler:', error);
    res.status(500).end();
  }
}

// Helper function to send events to a specific client
function sendEventToClient(client: NextApiResponse, event: string, data: any) {
  if (!client.closed) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

// Export function to broadcast events to all clients
export function broadcastEvent(event: string, data: any) {
  clients.forEach(client => {
    if (!client.closed) {
      sendEventToClient(client, event, data);
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
