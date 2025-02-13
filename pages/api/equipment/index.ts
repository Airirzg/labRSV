import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get query parameters for filtering
      const { category, available } = req.query;
      
      // Build the where clause based on filters
      const where: any = {};
      
      if (category) {
        where.category = {
          name: category as string
        };
      }
      
      if (available !== undefined) {
        where.availability = available === 'true';
      }

      // Get equipment with their categories and current reservations
      const equipment = await prisma.equipment.findMany({
        where,
        include: {
          category: true,
          reservations: {
            where: {
              endDate: {
                gte: new Date()
              }
            },
            orderBy: {
              startDate: 'asc'
            },
            take: 1
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Transform the data to match the frontend expectations
      const transformedEquipment = equipment.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category.name,
        available: item.availability && item.reservations.length === 0,
        status: item.status,
        location: item.location,
        nextAvailable: item.reservations[0]?.endDate
      }));

      res.status(200).json(transformedEquipment);
    } else if (req.method === 'POST') {
      // Check if user is admin (implement proper auth check)
      const { name, description, categoryId, location } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({ message: 'Name and category are required' });
      }

      const equipment = await prisma.equipment.create({
        data: {
          name,
          description,
          categoryId,
          location,
          status: 'AVAILABLE',
          availability: true
        },
        include: {
          category: true
        }
      });

      res.status(201).json(equipment);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Equipment API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
