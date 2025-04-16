import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SSEManager } from '@/utils/sse';
import { sendEmail } from '@/utils/email';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ONGOING', 'FINISHED']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const validation = statusSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { status } = validation.data;

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: String(id) },
      data: { status },
      include: {
        user: true,
        equipment: true,
      },
    });

    // Broadcast update via SSE
    const sseManager = SSEManager.getInstance();
    sseManager.broadcast({
      type: 'reservationUpdate',
      reservation: updatedReservation,
    });

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: updatedReservation.userId!,
        title: 'Reservation Update',
        message: `Your reservation for ${updatedReservation.equipment.name} has been ${status.toLowerCase()}`,
        type: 'RESERVATION_UPDATE',
      },
    });

    // Send email notification
    if (updatedReservation.user?.email) {
      await sendEmail({
        to: updatedReservation.user.email,
        subject: `Reservation ${status}`,
        text: `Your reservation for ${updatedReservation.equipment.name} has been ${status.toLowerCase()}.`,
      });
    }

    return res.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
