import React, { useState, useEffect } from 'react';
import InventoryDashboard from './components/InventoryDashboard.jsx';
import ApiService from './services/api.js';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load categories and products from API
      const [categoriesData, productsData] = await Promise.all([
        ApiService.getCategories(),
        ApiService.getProducts()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load inventory data. Please check if the server is running.');
      
      // Fallback to default data if API fails
      setCategories([
        { id: 1, name: 'Vegetables', color: '#4CAF50' },
        { id: 2, name: 'Fruits', color: '#FF9800' }
      ]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      console.log('Adding product with data:', newProduct); // Debug log
      
      let categoryId;
      
      if (newProduct.categoryId === 'custom') {
        // Create new category if custom category is provided
        const newCategory = await ApiService.createCategory({
          name: newProduct.customCategory,
          color: '#6B7280'
        });
        categoryId = newCategory.id;
        
        // Update local categories state
        setCategories(prev => [...prev, newCategory]);
      } else {
        categoryId = parseInt(newProduct.categoryId);
      }

      // Validate categoryId is a valid number
      if (!categoryId || isNaN(categoryId)) {
        throw new Error('Invalid category selection');
      }

      // Create product with API
      const productData = {
        name: newProduct.name,
        description: newProduct.description || '',
        quantity: parseInt(newProduct.quantity),
        unit: newProduct.unit,
        categoryId: categoryId
      };

      // Only include price if it has a value
      if (newProduct.price && parseFloat(newProduct.price) > 0) {
        productData.price = parseFloat(newProduct.price);
      }

      console.log('Sending product data to API:', productData); // Debug log

      const createdProduct = await ApiService.createProduct(productData);
      
      // Update local state
      setProducts(prev => [...prev, createdProduct]);
      
      return createdProduct;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw new Error('Failed to add product. Please try again.');
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      console.log('App.jsx - Updating product:', productId, updatedData); // Debug log
      
      // Prepare data for API
      const updateData = {
        name: updatedData.name,
        description: updatedData.description || '',
        quantity: parseInt(updatedData.quantity),
        unit: updatedData.unit,
        categoryId: parseInt(updatedData.categoryId)
      };

      // Only include price if it has a value
      if (updatedData.price && parseFloat(updatedData.price) > 0) {
        updateData.price = parseFloat(updatedData.price);
      }

      console.log('App.jsx - Prepared data:', updateData); // Debug log

      const updatedProduct = await ApiService.updateProduct(productId, updateData);
      
      // Update local state
      setProducts(prev => 
        prev.map(p => p.id === productId ? updatedProduct : p)
      );
      
      return updatedProduct;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new Error('Failed to update product. Please try again.');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await ApiService.deleteProduct(productId);
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw new Error('Failed to delete product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading inventory...</div>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}
      <InventoryDashboard 
        products={products}
        categories={categories}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
      />
    </div>
  );
}

export default App;
