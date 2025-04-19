import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional().nullable(),
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
    console.log('Updating equipment with data:', validatedData);

    // Create the equipment data object without imageUrls
    const equipmentData: any = { ...validatedData };
    
    // Remove imageUrls if it exists to handle it separately
    let imageUrls;
    if ('imageUrls' in equipmentData) {
      imageUrls = equipmentData.imageUrls;
      delete equipmentData.imageUrls;
    }
    
    console.log('Equipment data for update:', equipmentData);

    // First update the equipment without imageUrls
    const equipment = await prisma.equipment.update({
      where: { id },
      data: equipmentData,
      include: {
        category: true,
      },
    });
    
    // If we have imageUrls, update the equipment to add them
    if (imageUrls && Array.isArray(imageUrls)) {
      console.log('Updating equipment with imageUrls:', imageUrls);
      
      // Update the equipment with raw SQL to add imageUrls
      await prisma.$executeRaw`UPDATE "Equipment" SET "imageUrls" = ${imageUrls} WHERE id = ${id}`;
      
      // Fetch the updated equipment
      const updatedEquipment = await prisma.equipment.findUnique({
        where: { id },
        include: {
          category: true,
        }
      });
      
      console.log('Equipment updated with imageUrls:', updatedEquipment);
      
      // Create a notification for equipment update - skip if no valid userId
      try {
        // Only create notification if we have a valid user ID
        if (req.body.userId && req.body.userId !== 'system') {
          await prisma.notification.create({
            data: {
              userId: req.body.userId,
              title: 'Equipment Updated',
              message: `Equipment "${updatedEquipment?.name}" has been updated.`,
              type: 'EQUIPMENT_UPDATE',
            },
          });
        }
      } catch (notificationError) {
        // Log but don't fail the request if notification creation fails
        console.error('Error creating notification:', notificationError);
      }
      
      return res.status(200).json(updatedEquipment);
    }

    // Create a notification for equipment update - skip if no valid userId
    try {
      // Only create notification if we have a valid user ID
      if (req.body.userId && req.body.userId !== 'system') {
        await prisma.notification.create({
          data: {
            userId: req.body.userId,
            title: 'Equipment Updated',
            message: `Equipment "${equipment.name}" has been updated.`,
            type: 'EQUIPMENT_UPDATE',
          },
        });
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error('Error creating notification:', notificationError);
    }

    return res.status(200).json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating equipment:', error);
    return res.status(500).json({ 
      message: 'Error updating equipment', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function deleteEquipment(id: string, res: NextApiResponse) {
  try {
    // First, check if the equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check for existing reservations
    if (equipment.reservations.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete equipment with active or future reservations',
        reservations: equipment.reservations.length
      });
    }

    try {
      // Instead of deleting, mark as deleted and update status
      await prisma.equipment.update({
        where: { id },
        data: {
          isDeleted: true,
          status: 'MAINTENANCE', // Change status to prevent new reservations
          name: `[DELETED] ${equipment.name}`, // Mark name as deleted for clarity
        },
      });
      
      return res.status(200).json({ message: 'Equipment deleted successfully' });
    } catch (deleteError) {
      console.error('Database error deleting equipment:', deleteError);
      return res.status(500).json({ 
        message: 'Error deleting equipment from database', 
        error: deleteError instanceof Error ? deleteError.message : 'Unknown database error' 
      });
    }
  } catch (error) {
    console.error('Error in deleteEquipment function:', error);
    return res.status(500).json({ 
      message: 'Error processing delete request', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
