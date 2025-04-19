import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    switch (req.method) {
      case 'PUT':
        try {
          const { name, description } = req.body;

          if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
          }

          // Check for existing category with same name, excluding current category
          const existing = await prisma.category.findFirst({
            where: {
              name: { equals: name, mode: 'insensitive' },
              isDeleted: false,
              NOT: { id },
            },
          });

          if (existing) {
            return res.status(400).json({ error: 'Category name already exists' });
          }

          const category = await prisma.category.update({
            where: { id },
            data: { name, description },
          });

          return res.json(category);
        } catch (error) {
          console.error('Error updating category:', error);
          return res.status(500).json({ error: 'Failed to update category' });
        }

      case 'DELETE':
        try {
          // Check if category has any equipment
          const equipmentCount = await prisma.equipment.count({
            where: {
              categoryId: id,
              isDeleted: false,
            },
          });

          if (equipmentCount > 0) {
            return res.status(400).json({
              error: 'Cannot delete category with existing equipment',
            });
          }

          // Soft delete the category
          await prisma.category.update({
            where: { id },
            data: { isDeleted: true },
          });

          return res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
          console.error('Error deleting category:', error);
          return res.status(500).json({ error: 'Failed to delete category' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in categories API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
