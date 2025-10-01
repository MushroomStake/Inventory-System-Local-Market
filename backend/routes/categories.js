import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateCategory = [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('description').optional().trim(),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
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

    // Transform data to include product count
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
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// GET /api/categories/:id - Get specific category with products
router.get('/:id',
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
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
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      // Transform data
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
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        error: 'Failed to fetch category',
        message: error.message
      });
    }
  }
);

// POST /api/categories - Create new category
router.post('/',
  validateCategory,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, description, color } = req.body;

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
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        error: 'Failed to create category',
        message: error.message
      });
    }
  }
);

// PUT /api/categories/:id - Update category
router.put('/:id',
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  validateCategory,
  handleValidationErrors,
  async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, color } = req.body;

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!existingCategory) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      // Check if name already exists (excluding current category)
      const nameExists = await prisma.category.findFirst({
        where: { 
          name: name.trim(),
          id: { not: categoryId }
        }
      });

      if (nameExists) {
        return res.status(400).json({
          error: 'Category name already exists'
        });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          color: color || existingCategory.color
        },
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
        }
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: {
          id: updatedCategory.id,
          name: updatedCategory.name,
          description: updatedCategory.description,
          color: updatedCategory.color,
          productCount: updatedCategory._count.products,
          createdAt: updatedCategory.createdAt,
          updatedAt: updatedCategory.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        error: 'Failed to update category',
        message: error.message
      });
    }
  }
);

// DELETE /api/categories/:id - Delete category (only if no products)
router.delete('/:id',
  param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
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
        }
      });

      if (!existingCategory) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      // Check if category has active products
      if (existingCategory._count.products > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with active products',
          message: `This category has ${existingCategory._count.products} active product(s). Please move or delete the products first.`
        });
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        error: 'Failed to delete category',
        message: error.message
      });
    }
  }
);

export default router;