import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid equipment ID' });
    }

    // For PUT and DELETE requests, verify admin authentication
    if (req.method === 'PUT' || req.method === 'DELETE') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const user = verifyToken(token);

      if (!user || user.role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Handle GET request
    if (req.method === 'GET') {
      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { category: true }
      });

      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      return res.json(equipment);
    }

    // Handle PUT request
    else if (req.method === 'PUT') {
      const { name, description, categoryId, location, status, availability, imageUrl } = req.body;

      console.log('PUT request body:', req.body); // Debug log

      // Validate required fields
      if (!name || !categoryId || !location) {
        return res.status(400).json({ error: 'Name, category, and location are required' });
      }

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      // Update equipment
      const equipment = await prisma.equipment.update({
        where: { id },
        data: {
          name,
          description,
          categoryId,
          location,
          status: status || 'AVAILABLE',
          availability: availability !== undefined ? availability : true,
          imageUrl,
        },
        include: {
          category: true
        }
      });

      console.log('Updated equipment:', equipment); // Debug log
      return res.json(equipment);
    }

    // Handle DELETE request
    else if (req.method === 'DELETE') {
      await prisma.equipment.delete({
        where: { id }
      });

      return res.status(204).end();
    }

    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in equipment API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
