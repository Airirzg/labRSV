import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: number;
      type: 'individual' | 'team';
      teamIds: number[];
    };
    
    if (req.method === 'GET') {
      // Get user's reservations including team reservations
      const reservations = await prisma.reservation.findMany({
        where: {
          OR: [
            { userId: decoded.id },
            { teamId: { in: decoded.teamIds } }
          ]
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
          },
          team: {
            include: {
              leader: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      // Transform the data to match frontend expectations
      const transformedReservations = reservations.map(reservation => ({
        id: reservation.id,
        equipment: {
          id: reservation.equipment.id,
          name: reservation.equipment.name,
          category: reservation.equipment.category.name
        },
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status,
        user: reservation.user ? {
          id: reservation.user.id,
          name: `${reservation.user.firstName} ${reservation.user.lastName}`,
          email: reservation.user.email
        } : null,
        team: reservation.team ? {
          id: reservation.team.id,
          name: reservation.team.teamName,
          leader: {
            id: reservation.team.leader.id,
            name: `${reservation.team.leader.firstName} ${reservation.team.leader.lastName}`,
            email: reservation.team.leader.email
          }
        } : null
      }));

      res.status(200).json(transformedReservations);
    } else if (req.method === 'POST') {
      const { equipmentId, startDate, endDate, notes } = req.body;
      
      if (!equipmentId || !startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Equipment ID, start date, and end date are required' 
        });
      }

      // Check if equipment exists
      const equipment = await prisma.equipment.findUnique({
        where: { id: parseInt(equipmentId) }
      });

      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      // Check if equipment is available
      if (!equipment.availability) {
        return res.status(400).json({ message: 'Equipment is not available for reservation' });
      }

      // Check for conflicting reservations
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          equipmentId: parseInt(equipmentId),
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
          equipmentId: parseInt(equipmentId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'pending',
          ...(decoded.type === 'individual' 
            ? { userId: decoded.id }
            : { teamId: decoded.teamIds[0] }
          )
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
          },
          team: {
            include: {
              leader: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      res.status(201).json(reservation);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Reservations API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
