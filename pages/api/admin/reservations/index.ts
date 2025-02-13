import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

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
      try {
        console.log('Fetching reservations...');
        const reservations = await prisma.reservation.findMany({
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
          orderBy: [
            { status: 'asc' },
            { startDate: 'asc' },
          ],
        });

        console.log(`Found ${reservations.length} reservations`);
        return res.status(200).json({
          items: reservations,
          total: reservations.length,
        });
      } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ message: 'Error fetching reservations' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
