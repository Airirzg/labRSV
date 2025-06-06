import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      try {
        console.log('Fetching equipment...');
        
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
        
        const [equipment, total] = await Promise.all([
          prisma.equipment.findMany({
            where,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
            skip: skip,
            take: limitNum,
          }),
          prisma.equipment.count({ where }),
        ]);

        console.log(`Found ${equipment.length} equipment items out of ${total} total`);
        return res.status(200).json({
          items: equipment,
          total,
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
        });
      } catch (error) {
        console.error('Error fetching equipment:', error);
        return res.status(500).json({ message: 'Error fetching equipment' });
      }
    }

    if (req.method === 'POST') {
      try {
        const { name, description, imageUrl, imageUrls, location, categoryId, status, availability } = req.body;

        console.log('Received equipment data:', req.body);

        if (!name || !categoryId) {
          return res.status(400).json({ message: 'Name and category are required' });
        }

        // Create the equipment data object without imageUrls
        const equipmentData: any = {
          name,
          description,
          imageUrl,
          location,
          categoryId,
          status: status || 'AVAILABLE',
          availability: availability !== undefined ? availability : true,
        };

        // Don't try to add imageUrls directly to avoid Prisma issues
        console.log('Processing equipment data:', equipmentData);

        try {
          // First create the equipment without imageUrls
          const newEquipment = await prisma.equipment.create({
            data: equipmentData,
          });
          
          console.log('Equipment created successfully:', newEquipment);
          
          // If we have imageUrls, update the equipment to add them
          if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
            console.log('Updating with imageUrls:', imageUrls);
            
            // Update the equipment with raw SQL to add imageUrls
            await prisma.$executeRaw`UPDATE "Equipment" SET "imageUrls" = ${imageUrls} WHERE id = ${newEquipment.id}`;
            
            // Fetch the updated equipment
            const updatedEquipment = await prisma.equipment.findUnique({
              where: { id: newEquipment.id }
            });
            
            console.log('Equipment updated with imageUrls:', updatedEquipment);
            return res.status(201).json(updatedEquipment);
          }
          
          return res.status(201).json(newEquipment);
        } catch (prismaError) {
          console.error('Prisma error creating equipment:', prismaError);
          return res.status(500).json({ 
            message: 'Error creating equipment in database', 
            error: prismaError instanceof Error ? prismaError.message : 'Unknown error' 
          });
        }
      } catch (error) {
        console.error('Error creating equipment:', error);
        return res.status(500).json({ 
          message: 'Error creating equipment', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
