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

    switch (req.method) {
      case 'GET':
        return getReservations(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

async function getReservations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as ReservationStatus | 'ALL';
    const search = req.query.search as string | undefined;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          equipment: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.reservation.count({ where });

    // Get paginated reservations with full details
    const items = await prisma.reservation.findMany({
      where,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({ message: 'Error fetching reservations' });
  }
}
