import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.reservation.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.category.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Laboratory',
        description: 'General laboratory equipment'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Research',
        description: 'Specialized research equipment'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Medical',
        description: 'Medical and diagnostic equipment'
      }
    })
  ]);

  // Create equipment
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: 'Microscope XR-500',
        description: 'High-precision digital microscope with 500x magnification and digital imaging capabilities.',
        categoryId: categories[0].id,
        status: 'AVAILABLE',
        location: 'Lab Room A',
        availability: true
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Centrifuge Pro',
        description: 'Advanced centrifuge system for sample preparation and analysis.',
        categoryId: categories[0].id,
        status: 'AVAILABLE',
        location: 'Lab Room B',
        availability: true
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Spectrophotometer',
        description: 'UV-Visible spectrophotometer for chemical analysis and research.',
        categoryId: categories[1].id,
        status: 'AVAILABLE',
        location: 'Research Lab 1',
        availability: true
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'PCR Thermal Cycler',
        description: 'High-throughput PCR system for DNA amplification with real-time monitoring.',
        categoryId: categories[1].id,
        status: 'MAINTENANCE',
        location: 'Research Lab 2',
        availability: false
      }
    }),
    prisma.equipment.create({
      data: {
        name: 'Flow Cytometer',
        description: 'Advanced cell analysis system with multi-parameter detection capabilities.',
        categoryId: categories[2].id,
        status: 'AVAILABLE',
        location: 'Medical Lab',
        availability: true
      }
    })
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      phoneNumber: '+1234567890',
      role: 'ADMIN'
    }
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: userPassword,
      phoneNumber: '+1987654321'
    }
  });

  // Create team leader
  const leaderPassword = await bcrypt.hash('leader123', 10);
  const teamLeader = await prisma.user.create({
    data: {
      firstName: 'Team',
      lastName: 'Leader',
      email: 'leader@example.com',
      password: leaderPassword,
      phoneNumber: '+1122334455'
    }
  });

  // Create team
  const team = await prisma.team.create({
    data: {
      teamName: 'Research Team Alpha',
      leaderId: teamLeader.id
    }
  });

  // Create team members
  const memberPassword = await bcrypt.hash('member123', 10);
  const teamMembers = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Team',
        lastName: 'Member 1',
        email: 'member1@example.com',
        password: memberPassword,
        phoneNumber: '+1234567891'
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'Team',
        lastName: 'Member 2',
        email: 'member2@example.com',
        password: memberPassword,
        phoneNumber: '+1234567892'
      }
    })
  ]);

  // Add members to team
  await Promise.all(teamMembers.map(member =>
    prisma.teamMember.create({
      data: {
        userId: member.id,
        teamId: team.id
      }
    })
  ));

  // Create some reservations
  const now = new Date();
  await Promise.all([
    // Individual reservation
    prisma.reservation.create({
      data: {
        userId: user.id,
        equipmentId: equipment[0].id,
        startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'APPROVED'
      }
    }),
    // Team reservation
    prisma.reservation.create({
      data: {
        teamId: team.id,
        equipmentId: equipment[2].id,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'PENDING'
      }
    })
  ]);

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
