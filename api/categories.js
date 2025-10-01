import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { id } = req.query;

    switch (method) {
      case 'GET':
        if (id) {
          // Get specific category
          const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
              products: {
                where: {
                  isActive: true
                },
                orderBy: {
                  name: 'asc'
                }
              },
              _count: {
                select: {
                  products: {
                    where: {
                      isActive: true
                    }
                  }
                }
              }
            }
          });

          if (!category) {
            return res.status(404).json({ error: 'Category not found' });
          }

          const transformedCategory = {
            id: category.id,
            name: category.name,
            description: category.description,
            color: category.color || '#6B7280',
            productCount: category._count.products,
            products: category.products.map(product => ({
              id: product.id,
              name: product.name,
              quantity: product.quantity,
              unit: product.unit,
              price: product.price ? parseFloat(product.price) : null
            })),
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          };

          res.json({
            success: true,
            data: transformedCategory
          });
        } else {
          // Get all categories
          const categories = await prisma.category.findMany({
            include: {
              _count: {
                select: {
                  products: {
                    where: {
                      isActive: true
                    }
                  }
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          });

          const transformedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            color: category.color || '#6B7280',
            productCount: category._count.products,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          }));

          res.json({
            success: true,
            data: transformedCategories,
            count: transformedCategories.length
          });
        }
        break;

      case 'POST':
        // Create new category
        const { name, description, color } = req.body;

        if (!name) {
          return res.status(400).json({
            error: 'Validation failed',
            details: [{ msg: 'Category name is required' }]
          });
        }

        // Check if category name already exists
        const existingCategory = await prisma.category.findUnique({
          where: { name: name.trim() }
        });

        if (existingCategory) {
          return res.status(400).json({
            error: 'Category name already exists'
          });
        }

        const category = await prisma.category.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            color: color || '#6B7280'
          }
        });

        res.status(201).json({
          success: true,
          message: 'Category created successfully',
          data: {
            id: category.id,
            name: category.name,
            description: category.description,
            color: category.color,
            productCount: 0,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          }
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}