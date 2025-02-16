import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Simple query first to test database connection
    try {
      const messages = await prisma.message.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        items: messages,
        totalPages: 1,
        currentPage: 0,
        totalItems: messages.length
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        message: 'Database error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
