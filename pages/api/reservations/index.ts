import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: string;
        email: string;
        role: string;
      };

      const reservations = await prisma.reservation.findMany({
        where: {
          userId: decoded.id
        },
        include: {
          equipment: {
            include: {
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      const { equipmentId, startDate, endDate, notes } = req.body;
      
      if (!equipmentId || !startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Equipment ID, start date, and end date are required' 
        });
      }

      // Check if equipment exists
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      // Check if equipment is available
      if (!equipment.availability || equipment.status !== 'AVAILABLE') {
        return res.status(400).json({ message: 'Equipment is not available for reservation' });
      }

      // Check for conflicting reservations
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          equipmentId,
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            }
          ]
        }
      });

      if (conflictingReservation) {
        return res.status(400).json({ 
          message: 'Equipment is already reserved for these dates' 
        });
      }

      // Create the reservation
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId,
          userId: decoded.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'PENDING',
          notes: notes || undefined
        },
        include: {
          equipment: {
            include: {
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
