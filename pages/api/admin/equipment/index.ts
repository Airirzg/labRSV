import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Equipment } from '@prisma/client';
import { z } from 'zod';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
  imageUrl: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string || '';
      const type = req.query.type as string || '';
      const status = req.query.status as string || '';

      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (type) {
        where.type = type;
      }
      if (status) {
        where.status = status;
      }

      const [equipment, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.equipment.count({ where }),
      ]);

      res.status(200).json({
        items: equipment,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({ error: 'Error fetching equipment' });
    }
  } else if (req.method === 'POST') {
    try {
      const validatedData = equipmentSchema.parse(req.body);
      const equipment = await prisma.equipment.create({
        data: validatedData,
      });

      // Create a notification for the new equipment
      await prisma.notification.create({
        data: {
          userId: req.body.userId, // Assuming you have the admin's user ID
          title: 'New Equipment Added',
          message: `New equipment "${equipment.name}" has been added to the system.`,
          type: 'EQUIPMENT_UPDATE',
        },
      });

      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error('Error creating equipment:', error);
        res.status(500).json({ error: 'Error creating equipment' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
