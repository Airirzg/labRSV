import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Received request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);

    if (!session || !session.user?.role || session.user.role !== 'ADMIN') {
      console.log('Unauthorized access attempt:', { session });
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
        try {
          console.log('Creating category with data:', req.body);
          const { name, description } = req.body;

          if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
          }

          // Check for existing category with same name
          const existing = await prisma.category.findFirst({
            where: {
              name: { equals: name, mode: 'insensitive' },
              isDeleted: false,
            },
          });

          if (existing) {
            return res.status(400).json({ error: 'Category name already exists' });
          }

          const category = await prisma.category.create({
            data: {
              name,
              description,
              isDeleted: false,
            },
          });
          console.log('Category created:', category);
          return res.status(201).json(category);
        } catch (error) {
          console.error('Error creating category:', error);
          return res.status(500).json({ error: 'Failed to create category' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in categories API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
