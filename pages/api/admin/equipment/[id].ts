import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'IN_USE']),
  location: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  availability: z.boolean(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid equipment ID' });
  }

  switch (req.method) {
    case 'GET':
      return getEquipment(id, res);
    case 'PUT':
      return updateEquipment(id, req, res);
    case 'DELETE':
      return deleteEquipment(id, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getEquipment(id: string, res: NextApiResponse) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        reservations: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    return res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return res.status(500).json({ message: 'Error fetching equipment' });
  }
}

async function updateEquipment(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = equipmentSchema.parse(req.body);

    const equipment = await prisma.equipment.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
      },
    });

    // Create a notification for equipment update
    await prisma.notification.create({
      data: {
        userId: req.body.userId, // Assuming you have the admin's user ID
        title: 'Equipment Updated',
        message: `Equipment "${equipment.name}" has been updated.`,
        type: 'EQUIPMENT_UPDATE',
      },
    });

    return res.status(200).json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating equipment:', error);
    return res.status(500).json({ message: 'Error updating equipment' });
  }
}

async function deleteEquipment(id: string, res: NextApiResponse) {
  try {
    // Check for existing reservations
    const existingReservations = await prisma.reservation.findMany({
      where: {
        equipmentId: id,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete equipment with active or future reservations',
      });
    }

    // Delete the equipment
    await prisma.equipment.delete({
      where: { id },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return res.status(500).json({ message: 'Error deleting equipment' });
  }
}
