import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { broadcastEvent } from '../../admin/events';
import { sendEmail, getReservationStatusEmailContent } from '@/utils/email';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ONGOING', 'FINISHED'])
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = statusSchema.parse(req.body);
    
    const updatedReservation = await prisma.reservation.update({
      where: { id: String(id) },
      data: { status: validatedData.status },
      include: {
        user: true,
        equipment: true,
      },
    });

    // Send email notification
    if (updatedReservation.user.email) {
      const { subject, text } = getReservationStatusEmailContent(
        validatedData.status,
        updatedReservation.equipment.name
      );
      
      await sendEmail({
        to: updatedReservation.user.email,
        subject,
        text,
      });
    }

    // Broadcast the update to all connected clients
    broadcastEvent('update', updatedReservation);

    res.json(updatedReservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
}
