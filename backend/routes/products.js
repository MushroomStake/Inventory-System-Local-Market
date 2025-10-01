import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unit').trim().isLength({ min: 1 }).withMessage('Unit is required'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim()
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

// GET /api/products - Get all products with category information
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price ? parseFloat(product.price) : null,
      categoryId: product.categoryId,
      category: product.category.name,
      categoryColor: product.category.color,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    res.json({
      success: true,
      data: transformedProducts,
      count: transformedProducts.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /api/products/:id - Get specific product
router.get('/:id', 
  param('id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      const product = await prisma.product.findUnique({
        where: { 
          id: productId,
          isActive: true 
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      // Transform data
      const transformedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price ? parseFloat(product.price) : null,
        categoryId: product.categoryId,
        category: product.category.name,
        categoryColor: product.category.color,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };

      res.json({
        success: true,
        data: transformedProduct
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  }
);

// POST /api/products - Create new product
router.post('/', 
  validateProduct,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, description, quantity, unit, price, categoryId } = req.body;

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({
          error: 'Invalid category ID'
        });
      }

      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          quantity: parseInt(quantity),
          unit: unit.trim(),
          price: price ? parseFloat(price) : null,
          categoryId: categoryId
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      // Transform data
      const transformedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price ? parseFloat(product.price) : null,
        categoryId: product.categoryId,
        category: product.category.name,
        categoryColor: product.category.color,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: transformedProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        error: 'Failed to create product',
        message: error.message
      });
    }
  }
);

// PUT /api/products/:id - Update product
router.put('/:id',
  param('id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  validateProduct,
  handleValidationErrors,
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, quantity, unit, price, categoryId } = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { 
          id: productId,
          isActive: true 
        }
      });

      if (!existingProduct) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({
          error: 'Invalid category ID'
        });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          quantity: parseInt(quantity),
          unit: unit.trim(),
          price: price ? parseFloat(price) : null,
          categoryId: categoryId
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      // Transform data
      const transformedProduct = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        quantity: updatedProduct.quantity,
        unit: updatedProduct.unit,
        price: updatedProduct.price ? parseFloat(updatedProduct.price) : null,
        categoryId: updatedProduct.categoryId,
        category: updatedProduct.category.name,
        categoryColor: updatedProduct.category.color,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt
      };

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: transformedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        error: 'Failed to update product',
        message: error.message
      });
    }
  }
);

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id',
  param('id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id);

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { 
          id: productId,
          isActive: true 
        }
      });

      if (!existingProduct) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      // Soft delete by setting isActive to false
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }
);

export default router;