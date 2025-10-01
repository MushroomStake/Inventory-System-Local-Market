import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const vegetablesCategory = await prisma.category.create({
    data: {
      name: 'Vegetables',
      description: 'Fresh vegetables and greens',
      color: '#4CAF50'
    }
  });

  const fruitsCategory = await prisma.category.create({
    data: {
      name: 'Fruits',
      description: 'Fresh fruits and berries',
      color: '#FF9800'
    }
  });

  // Create products
  const products = [
    {
      name: 'Tomatoes',
      description: 'Fresh red tomatoes',
      quantity: 150,
      unit: 'kg',
      price: 2.50,
      categoryId: vegetablesCategory.id
    },
    {
      name: 'Carrots',
      description: 'Organic carrots',
      quantity: 80,
      unit: 'kg',
      price: 1.80,
      categoryId: vegetablesCategory.id
    },
    {
      name: 'Onions',
      description: 'Yellow onions',
      quantity: 120,
      unit: 'kg',
      price: 1.20,
      categoryId: vegetablesCategory.id
    },
    {
      name: 'Apples',
      description: 'Red apples',
      quantity: 200,
      unit: 'kg',
      price: 3.00,
      categoryId: fruitsCategory.id
    },
    {
      name: 'Bananas',
      description: 'Fresh bananas',
      quantity: 100,
      unit: 'kg',
      price: 2.20,
      categoryId: fruitsCategory.id
    },
    {
      name: 'Oranges',
      description: 'Valencia oranges',
      quantity: 150,
      unit: 'kg',
      price: 2.80,
      categoryId: fruitsCategory.id
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Created ${products.length} products in 2 categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });