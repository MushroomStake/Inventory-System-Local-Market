import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create example users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        username: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashed_password_123', // In real app, this should be properly hashed
        role: 'ADMIN',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        email: 'manager@example.com',
        username: 'manager',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'hashed_password_456',
        role: 'MANAGER',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        username: 'testuser',
        firstName: 'Bob',
        lastName: 'Johnson',
        password: 'hashed_password_789',
        role: 'USER',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });