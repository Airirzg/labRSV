import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, phoneNumber, type } = req.body;

    if (!email || !password || !firstName || !lastName || !type) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (type === 'individual') {
      // Create individual user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          createdAt: true
        }
      });

      return res.status(201).json({
        message: 'Registration successful',
        user
      });
    } else if (type === 'team') {
      const { teamName, memberEmails } = req.body;

      if (!teamName || !memberEmails || !Array.isArray(memberEmails) || memberEmails.length === 0) {
        return res.status(400).json({ message: 'Team name and members are required for team registration' });
      }

      // Create the team leader first
      const leader = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber
        }
      });

      // Create the team
      const team = await prisma.team.create({
        data: {
          teamName,
          leaderId: leader.id
        }
      });

      // Create team members
      const memberPromises = memberEmails.map(async (memberEmail: string) => {
        const member = await prisma.user.create({
          data: {
            firstName: 'Team',
            lastName: 'Member',
            email: memberEmail,
            password: hashedPassword, // In production, you should send invitations to members
            teams: {
              create: {
                teamId: team.id
              }
            }
          }
        });
        return member;
      });

      await Promise.all(memberPromises);

      const createdTeam = await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          leader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return res.status(201).json({
        message: 'Team registration successful',
        team: createdTeam
      });
    }

    return res.status(400).json({ message: 'Invalid registration type' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
