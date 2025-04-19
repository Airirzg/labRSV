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
      
      console.log('Received reservation request:', {
        equipmentId,
        startDate,
        endDate,
        notes,
        userId: decoded.id
      });

      // Validate required fields
      if (!equipmentId || !startDate || !endDate) {
        console.error('Missing required fields:', { equipmentId, startDate, endDate });
        return res.status(400).json({ 
          message: 'Equipment ID, start date, and end date are required',
          received: { equipmentId, startDate, endDate }
        });
      }

      // Validate date formats
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        console.error('Invalid date format:', { startDate, endDate });
        return res.status(400).json({ 
          message: 'Invalid date format',
          received: { startDate, endDate }
        });
      }

      if (parsedStartDate > parsedEndDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      try {
        // Check if equipment exists
        const equipment = await prisma.equipment.findUnique({
          where: { id: equipmentId }
        });

        console.log('Found equipment:', equipment);

        if (!equipment) {
          return res.status(404).json({ 
            message: 'Equipment not found',
            equipmentId 
          });
        }

        // Check if equipment is available
        if (equipment.status !== 'AVAILABLE') {
          return res.status(400).json({ 
            message: 'Equipment is not available for reservation',
            currentStatus: equipment.status
          });
        }

        // Check for conflicting reservations
        const conflictingReservation = await prisma.reservation.findFirst({
          where: {
            equipmentId,
            status: {
              in: ['PENDING', 'APPROVED']
            },
            OR: [
              {
                AND: [
                  { startDate: { lte: parsedStartDate } },
                  { endDate: { gte: parsedStartDate } }
                ]
              },
              {
                AND: [
                  { startDate: { lte: parsedEndDate } },
                  { endDate: { gte: parsedEndDate } }
                ]
              }
            ]
          }
        });

        if (conflictingReservation) {
          return res.status(400).json({ 
            message: 'This equipment is already reserved for the selected time period',
            conflictingReservation
          });
        }

        console.log('Creating reservation with data:', {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          status: 'PENDING',
          notes: notes || '',
          userId: decoded.id,
          equipmentId,
        });

        // Create the reservation
        const reservation = await prisma.reservation.create({
          data: {
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            status: 'PENDING',
            notes: notes || '',
            userId: decoded.id,
            equipmentId,
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

        console.log('Created reservation:', reservation);

        // Create notification for admin
        await prisma.notification.create({
          data: {
            userId: decoded.id,
            title: 'New Reservation Request',
            message: `New reservation request for ${equipment.name}`,
            type: 'SYSTEM',
          }
        });

        // Create a message for admin
        await prisma.message.create({
          data: {
            subject: 'New Reservation Request',
            content: `A new reservation request has been submitted for ${equipment.name}.\nDates: ${parsedStartDate.toLocaleDateString()} - ${parsedEndDate.toLocaleDateString()}\nNotes: ${notes || 'No notes provided'}`,
            senderName: `${reservation.user?.firstName} ${reservation.user?.lastName}`,
            senderEmail: reservation.user?.email || '',
            status: 'UNREAD'
          }
        });

        return res.status(201).json(reservation);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error instanceof Error) {
        return res.status(500).json({ 
          message: `Failed to create reservation: ${error.message}`,
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'Failed to create reservation' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
