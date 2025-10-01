// API service for communicating with Supabase
const SUPABASE_URL = 'https://oqzayxgmcxrtocpuhqji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xemF5eGdtY3hydG9jcHVocWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjQzODEsImV4cCI6MjA3NDkwMDM4MX0.c9P7KYDYuGcUYiQzJ7YdWAmO-VZRPmqBtXv9Z6ZjxSo';

class ApiService {
  // Helper method for making Supabase API requests
  async request(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const config = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorData}`);
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    const products = await this.request('/products?select=*,category:categories(id,name,color)&is_active=eq.true&order=created_at.desc');
    
    // Transform to match frontend expectations
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      categoryId: product.category_id,
      category: product.category?.name || 'Unknown',
      categoryColor: product.category?.color || '#6B7280',
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  async getProduct(id) {
    const products = await this.request(`/products?id=eq.${id}&select=*,category:categories(id,name,color)&is_active=eq.true`);
    
    if (products.length === 0) {
      throw new Error('Product not found');
    }

    const product = products[0];
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      categoryId: product.category_id,
      category: product.category?.name || 'Unknown',
      categoryColor: product.category?.color || '#6B7280',
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  async createProduct(productData) {
    const supabaseData = {
      name: productData.name,
      description: productData.description || null,
      quantity: productData.quantity,
      unit: productData.unit,
      price: productData.price || null,
      category_id: productData.categoryId,
      is_active: true
    };

    const products = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(supabaseData),
    });

    const product = products[0];
    
    // Get the full product with category info
    return await this.getProduct(product.id);
  }

  async updateProduct(id, productData) {
    const supabaseData = {
      name: productData.name,
      description: productData.description || null,
      quantity: productData.quantity,
      unit: productData.unit,
      category_id: productData.categoryId
    };

    if (productData.price !== undefined) {
      supabaseData.price = productData.price;
    }

    await this.request(`/products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(supabaseData),
    });

    // Get the updated product with category info
    return await this.getProduct(id);
  }

  async deleteProduct(id) {
    await this.request(`/products?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    });

    return { success: true };
  }

  // Categories API
  async getCategories() {
    const categories = await this.request('/categories?select=*&order=name.asc');
    
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color || '#6B7280',
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }));
  }

  async getCategory(id) {
    const categories = await this.request(`/categories?id=eq.${id}&select=*`);
    
    if (categories.length === 0) {
      throw new Error('Category not found');
    }

    const category = categories[0];
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color || '#6B7280',
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }

  async createCategory(categoryData) {
    const supabaseData = {
      name: categoryData.name,
      description: categoryData.description || null,
      color: categoryData.color || '#6B7280'
    };

    const categories = await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(supabaseData),
    });

    const category = categories[0];
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }

  // Health check
  async healthCheck() {
    try {
      await this.request('/categories?limit=1');
      return {
        status: 'OK',
        message: 'Supabase API is working',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Supabase API connection failed');
    }
  }
}

export default new ApiService();