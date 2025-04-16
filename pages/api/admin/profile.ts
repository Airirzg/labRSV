import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        try {
          const profile = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          });

          if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
          }

          return res.status(200).json(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          return res.status(500).json({ error: 'Failed to fetch profile' });
        }

      case 'PUT':
        try {
          const { name, email, firstName, lastName } = req.body;

          if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
          }

          const updatedProfile = await prisma.user.update({
            where: { id: session.user.id },
            data: {
              name,
              email,
              firstName,
              lastName,
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          });

          return res.status(200).json(updatedProfile);
        } catch (error) {
          console.error('Error updating profile:', error);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in profile handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
