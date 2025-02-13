import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { User } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

// Mock database - In production, use a real database
const users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    type: 'individual'
  },
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    type: 'individual'
  },
  {
    id: 'team-1',
    name: 'Research Team Alpha',
    email: 'team.alpha@example.com',
    role: 'user',
    type: 'team',
    teamMembers: ['researcher1@example.com', 'researcher2@example.com']
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.method === 'GET') {
      // Return user profile with all necessary fields
      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        teamMembers: user.teamMembers
      };
      res.status(200).json(profile);
    } else if (req.method === 'PUT') {
      const { name, members } = req.body;

      // Update user information
      user.name = name;
      
      if (user.type === 'team' && members) {
        user.teamMembers = members;
      }

      // Return updated profile
      const updatedProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        teamMembers: user.teamMembers
      };

      res.status(200).json(updatedProfile);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
