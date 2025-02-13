import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';
import { sendEmail } from '@/utils/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getReservations(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getReservations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = Number(req.query.page) || 0;
    const limit = Number(req.query.limit) || 10;
    const filter = req.query.filter as ReservationStatus | undefined;
    const search = req.query.search as string | undefined;

    // Build where clause
    const where: any = {};
    if (filter) {
      where.status = filter;
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
          team: {
            teamName: { contains: search, mode: 'insensitive' },
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

    // Get paginated reservations
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          select: {
            teamName: true,
          },
        },
        equipment: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: page * limit,
      take: limit,
    });

    return res.status(200).json({
      reservations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({ message: 'Error fetching reservations' });
  }
}
