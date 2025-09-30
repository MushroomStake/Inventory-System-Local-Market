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

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Vegetables' },
      update: {},
      create: {
        name: 'Vegetables',
        description: 'Fresh vegetables and greens',
        color: '#4CAF50', // Green
      },
    }),
    prisma.category.upsert({
      where: { name: 'Fruits' },
      update: {},
      create: {
        name: 'Fruits',
        description: 'Fresh fruits',
        color: '#FF9800', // Orange
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.map(c => ({ id: c.id, name: c.name, color: c.color })));

  // Create sample products - only fruits and vegetables
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Tomatoes',
        description: 'Fresh organic tomatoes',
        quantity: 150,
        unit: 'kg',
        price: 5.99,
        categoryId: categories.find(c => c.name === 'Vegetables').id,
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Carrots',
        description: 'Fresh organic carrots',
        quantity: 80,
        unit: 'kg',
        price: 3.50,
        categoryId: categories.find(c => c.name === 'Vegetables').id,
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Onions',
        description: 'Fresh white onions',
        quantity: 120,
        unit: 'kg',
        price: 2.25,
        categoryId: categories.find(c => c.name === 'Vegetables').id,
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Apples',
        description: 'Fresh red apples',
        quantity: 200,
        unit: 'kg',
        price: 4.99,
        categoryId: categories.find(c => c.name === 'Fruits').id,
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Bananas',
        description: 'Fresh yellow bananas',
        quantity: 100,
        unit: 'kg',
        price: 2.99,
        categoryId: categories.find(c => c.name === 'Fruits').id,
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: 'Oranges',
        description: 'Fresh citrus oranges',
        quantity: 150,
        unit: 'kg',
        price: 3.75,
        categoryId: categories.find(c => c.name === 'Fruits').id,
      },
    }),
  ]);

  console.log('✅ Created products:', products.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, unit: p.unit })));
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });