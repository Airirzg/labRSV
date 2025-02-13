import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const { name, description } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Category name is required' });
        }

        // Check for existing category with same name (excluding current category)
        const existing = await prisma.category.findFirst({
          where: {
            name: { equals: name, mode: 'insensitive' },
            id: { not: String(id) },
            isDeleted: false,
          },
        });

        if (existing) {
          return res.status(400).json({ error: 'Category name already exists' });
        }

        const category = await prisma.category.update({
          where: { id: String(id) },
          data: { name, description },
        });

        return res.json(category);
      } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({ error: 'Failed to update category' });
      }

    case 'DELETE':
      try {
        // Check if category is in use
        const equipmentCount = await prisma.equipment.count({
          where: { 
            categoryId: String(id),
            isDeleted: false,
          },
        });

        if (equipmentCount > 0) {
          return res.status(400).json({
            error: 'Cannot delete category: It is being used by equipment items',
          });
        }

        // Soft delete the category
        await prisma.category.update({
          where: { id: String(id) },
          data: { isDeleted: true },
        });

        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Failed to delete category' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
