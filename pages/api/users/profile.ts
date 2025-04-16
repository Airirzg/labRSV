import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/middleware/api-auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        reservations: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Only get the 5 most recent reservations
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
      reservations: user.reservations.map(reservation => ({
        id: reservation.id,
        equipment: {
          id: reservation.equipment.id,
          name: reservation.equipment.name,
          category: reservation.equipment.category.name
        },
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status
      }))
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
