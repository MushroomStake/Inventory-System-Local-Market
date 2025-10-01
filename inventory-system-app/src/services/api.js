// API service for communicating with the backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: same domain
  : 'http://localhost:3001/api'; // Development: local backend

console.log('API_BASE_URL:', API_BASE_URL); // Debug log

class ApiService {
  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Log detailed error information
        console.error('API Error Details:', data);
        const errorMessage = data.details ? 
          data.details.map(d => d.msg).join(', ') : 
          (data.error || data.message || 'API request failed');
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    const response = await this.request('/products');
    return response.data || [];
  }

  async getProduct(id) {
    const response = await this.request(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData) {
    console.log('API createProduct called with:', productData); // Debug log
    const response = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async updateProduct(id, productData) {
    console.log('Updating product:', id, productData); // Debug log
    const response = await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async deleteProduct(id) {
    const response = await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Categories API
  async getCategories() {
    const response = await this.request('/categories');
    return response.data || [];
  }

  async getCategory(id) {
    const response = await this.request(`/categories/${id}`);
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return response.data;
  }

  async updateCategory(id, categoryData) {
    const response = await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return response.data;
  }

  async deleteCategory(id) {
    const response = await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Health check
  async healthCheck() {
    const response = await this.request('/health');
    return response;
  }
}

export default new ApiService();