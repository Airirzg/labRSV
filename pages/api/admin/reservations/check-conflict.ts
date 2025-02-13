import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const conflictCheckSchema = z.object({
  equipmentId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  excludeId: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = conflictCheckSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { equipmentId, startDate, endDate, excludeId } = validation.data;

    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        equipmentId,
        id: { not: excludeId },
        status: { in: ['APPROVED', 'ONGOING'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } },
            ],
          },
        ],
      },
    });

    return res.json({ hasConflict: !!conflictingReservation });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
