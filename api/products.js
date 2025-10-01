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
          // Get specific product
          const product = await prisma.product.findUnique({
            where: { 
              id: parseInt(id),
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
            return res.status(404).json({ error: 'Product not found' });
          }

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
        } else {
          // Get all products
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
        }
        break;

      case 'POST':
        // Create new product
        const { name, description, quantity, unit, price, categoryId } = req.body;

        // Validation
        if (!name || !quantity || !unit || !categoryId) {
          return res.status(400).json({
            error: 'Validation failed',
            details: [{ msg: 'Name, quantity, unit, and categoryId are required' }]
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

        const productData = {
          name: name.trim(),
          description: description?.trim() || null,
          quantity: parseInt(quantity),
          unit: unit.trim(),
          categoryId: categoryId
        };

        if (price && parseFloat(price) > 0) {
          productData.price = parseFloat(price);
        }

        const product = await prisma.product.create({
          data: productData,
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
        break;

      case 'PUT':
        // Update product
        if (!id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const updateData = req.body;
        const productId = parseInt(id);

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { 
            id: productId,
            isActive: true 
          }
        });

        if (!existingProduct) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProductData = {
          name: updateData.name.trim(),
          description: updateData.description?.trim() || null,
          quantity: parseInt(updateData.quantity),
          unit: updateData.unit.trim(),
          categoryId: parseInt(updateData.categoryId)
        };

        if (updateData.price && parseFloat(updateData.price) > 0) {
          updatedProductData.price = parseFloat(updateData.price);
        }

        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: updatedProductData,
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

        const transformedUpdatedProduct = {
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
          data: transformedUpdatedProduct
        });
        break;

      case 'DELETE':
        // Delete product
        if (!id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const deleteProductId = parseInt(id);

        const productToDelete = await prisma.product.findUnique({
          where: { 
            id: deleteProductId,
            isActive: true 
          }
        });

        if (!productToDelete) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Soft delete
        await prisma.product.update({
          where: { id: deleteProductId },
          data: { isActive: false }
        });

        res.json({
          success: true,
          message: 'Product deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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