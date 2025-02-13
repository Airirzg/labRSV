import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
import { SSEManager } from '@/utils/sse';

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

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }

    switch (req.method) {
      case 'PATCH':
        return updateReservation(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

async function updateReservation(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { status } = req.body;
    
    if (!status || !Object.values(ReservationStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update the reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    });

    // Notify all clients about the update via SSE
    const sseManager = SSEManager.getInstance();
    sseManager.broadcast({
      type: 'reservationUpdate',
      reservation: updatedReservation,
    });

    return res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({ message: 'Error updating reservation' });
  }
}
