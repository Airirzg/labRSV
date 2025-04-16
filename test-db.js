const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test Description'
      }
    });
    console.log('Successfully connected to database and created category:', category);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
