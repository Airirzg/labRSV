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
      case 'GET':
        return getReservation(req, res, id);
      case 'PATCH':
        return updateReservation(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getReservation(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        equipment: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({ message: 'Error fetching reservation' });
  }
}

async function updateReservation(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { status } = req.body;
    
    if (!status || !Object.values(ReservationStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Use a transaction to update both reservation and equipment
    const result = await prisma.$transaction(async (tx) => {
      // First update the reservation
      const updatedReservation = await tx.reservation.update({
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
          equipment: true,
        },
      });

      // If status is APPROVED, update equipment status to IN_USE
      if (status === 'APPROVED' && updatedReservation.equipment) {
        await tx.equipment.update({
          where: { id: updatedReservation.equipment.id },
          data: { status: 'IN_USE' },
        });
      }

      // If status is COMPLETED or CANCELLED, update equipment status back to AVAILABLE
      if ((status === 'COMPLETED' || status === 'CANCELLED') && updatedReservation.equipment) {
        await tx.equipment.update({
          where: { id: updatedReservation.equipment.id },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedReservation;
    });

    // Create notification for status update
    await prisma.notification.create({
      data: {
        userId: result.user.id,
        title: 'Reservation Status Update',
        message: `Your reservation for ${result.equipment?.name} has been ${status.toLowerCase()}.`,
        type: 'RESERVATION_UPDATE',
      },
    });

    // Notify all clients about the update via SSE
    const sseManager = SSEManager.getInstance();
    sseManager.broadcast({
      type: 'reservationUpdate',
      reservation: result,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({ message: 'Error updating reservation' });
  }
}
