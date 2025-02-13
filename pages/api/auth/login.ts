import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, always use environment variable

interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    type: 'individual' | 'team';
    role: string;
  };
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | { message: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teamMembers: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Determine if user is part of a team
    const isTeamMember = user.teamMembers.length > 0;
    const isTeamLeader = false; 
    const type = isTeamLeader || isTeamMember ? 'team' : 'individual';

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type,
        role: user.role,
        teamIds: user.teamMembers.map(membership => membership.team.id)
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user info and token (excluding password)
    const userResponse = {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      type,
      role: user.role
    };

    res.status(200).json({
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
