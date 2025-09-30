import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and querying users...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log('📊 Users in database:');
    console.table(users);

    // Test specific queries
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
    });

    console.log(`\n📈 Statistics:`);
    console.log(`- Total users: ${users.length}`);
    console.log(`- Admin users: ${adminUsers.length}`);
    console.log(`- Active users: ${activeUsers.length}`);

    console.log('\n✅ Database connection and queries working successfully!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();