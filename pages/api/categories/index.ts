import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Received request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    switch (req.method) {
      case 'GET':
        try {
          console.log('Fetching categories...');
          const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            where: { isDeleted: false },
          });
          console.log('Categories fetched:', categories);
          return res.json(categories);
        } catch (error) {
          console.error('Error fetching categories:', error);
          return res.status(500).json({ error: 'Failed to fetch categories' });
        }

      case 'POST':
      case 'PUT':
      case 'DELETE':
        // For write operations, require authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.log('Unauthorized access attempt:', { authHeader });
          return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const user = verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
          console.log('Unauthorized access attempt:', { user });
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // Handle POST request (create category)
        if (req.method === 'POST') {
          try {
            console.log('Creating category with data:', req.body);
            const { name, description } = req.body;

            if (!name) {
              return res.status(400).json({ error: 'Category name is required' });
            }

            const existingCategory = await prisma.category.findFirst({
              where: { name, isDeleted: false },
            });

            if (existingCategory) {
              return res.status(400).json({ error: 'Category with this name already exists' });
            }

            const newCategory = await prisma.category.create({
              data: {
                name,
                description: description || '',
              },
            });

            console.log('Category created:', newCategory);
            return res.status(201).json(newCategory);
          } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ error: 'Failed to create category' });
          }
        }
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in categories handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
