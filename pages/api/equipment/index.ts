import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // For POST and PUT requests, verify admin authentication
    if (req.method === 'POST' || req.method === 'PUT') {
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

    if (req.method === 'GET') {
      // Get query parameters for filtering
      const { category, status, search, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;
      
      console.log('GET request params:', { category, status, search, page, limit }); // Debug log
      
      // Build the where clause based on filters
      const where: any = {
        isDeleted: false // Only show non-deleted equipment
      };
      
      if (category) {
        where.categoryId = category as string;
      }
      
      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { location: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      console.log('Prisma where clause:', where); // Debug log

      // Get equipment with their categories
      const [items, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limitNum,
        }),
        prisma.equipment.count({ where }),
      ]);

      console.log(`Found ${items.length} items out of ${total} total`); // Debug log

      const response = {
        items,
        total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
      };

      console.log('Sending response:', response); // Debug log
      return res.json(response);
    } 
    
    else if (req.method === 'POST') {
      const { name, description, categoryId, location, status, availability, imageUrl } = req.body;

      console.log('POST request body:', req.body); // Debug log

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

      // Create equipment
      const equipment = await prisma.equipment.create({
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

      console.log('Created equipment:', equipment); // Debug log
      return res.status(201).json(equipment);
    }

    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in equipment API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
