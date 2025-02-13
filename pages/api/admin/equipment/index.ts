import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const validateEquipment = (data: any) => {
  const errors = [];
  if (!data.name) errors.push('Name is required');
  if (!data.categoryId) errors.push('Category is required');
  if (!data.location) errors.push('Location is required');
  if (!Object.values(Status).includes(data.status)) {
    errors.push('Invalid status');
  }
  return errors;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          const search = req.query.search as string || '';
          const status = req.query.status as string || '';

          const skip = (page - 1) * limit;

          const where: any = {
            isDeleted: false,
          };

          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ];
          }

          if (status && status !== 'ALL') {
            where.status = status;
          }

          const [items, total] = await Promise.all([
            prisma.equipment.findMany({
              where,
              skip,
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                category: true,
              },
            }),
            prisma.equipment.count({ where }),
          ]);

          return res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
          });
        } catch (error) {
          console.error('Error fetching equipment:', error);
          return res.status(500).json({ error: 'Failed to fetch equipment' });
        }

      case 'POST':
        try {
          const data = req.body;
          const validationErrors = validateEquipment(data);

          if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
          }

          const equipment = await prisma.equipment.create({
            data: {
              name: data.name,
              description: data.description,
              location: data.location,
              imageUrl: data.imageUrl,
              status: data.status,
              availability: data.availability,
              categoryId: data.categoryId,
              isDeleted: false,
            },
            include: {
              category: true,
            },
          });

          return res.status(201).json(equipment);
        } catch (error) {
          console.error('Error creating equipment:', error);
          return res.status(500).json({ error: 'Failed to create equipment' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in equipment API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
