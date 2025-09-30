import React, { useState, useEffect } from 'react';
import InventoryDashboard from './components/InventoryDashboard.jsx';
import './App.css';

// Note: In a real app, Prisma Client would be used on the backend
// For this demo, we'll simulate API calls
function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data (in real app, this would be API calls)
  useEffect(() => {
    // For now, we'll use mock data that matches our seeded data
    // In a real app, you'd fetch this from your backend API
    setCategories([
      { id: 1, name: 'Vegetables', color: '#4CAF50' },
      { id: 2, name: 'Fruits', color: '#FF9800' }
    ]);

    setProducts([
      { id: 1, name: 'Tomatoes', categoryId: 1, category: 'Vegetables', quantity: 150, unit: 'kg' },
      { id: 2, name: 'Carrots', categoryId: 1, category: 'Vegetables', quantity: 80, unit: 'kg' },
      { id: 3, name: 'Onions', categoryId: 1, category: 'Vegetables', quantity: 120, unit: 'kg' },
      { id: 4, name: 'Apples', categoryId: 2, category: 'Fruits', quantity: 200, unit: 'kg' },
      { id: 5, name: 'Bananas', categoryId: 2, category: 'Fruits', quantity: 100, unit: 'kg' },
      { id: 6, name: 'Oranges', categoryId: 2, category: 'Fruits', quantity: 150, unit: 'kg' }
    ]);

    setLoading(false);
  }, []);

  const addProduct = (newProduct) => {
    let category;
    let categoryId;
    
    if (newProduct.categoryId === 'custom') {
      // Handle custom category
      category = newProduct.customCategory;
      categoryId = 'custom';
    } else {
      // Handle existing category
      const existingCategory = categories.find(c => c.id === parseInt(newProduct.categoryId));
      category = existingCategory ? existingCategory.name : 'Unknown';
      categoryId = parseInt(newProduct.categoryId);
    }

    const product = {
      id: products.length + 1,
      name: newProduct.name,
      description: newProduct.description,
      quantity: newProduct.quantity,
      unit: newProduct.unit,
      categoryId: categoryId,
      category: category
    };
    
    setProducts([...products, product]);
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, ...updatedData } : p
    ));
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="app">
      <InventoryDashboard 
        products={products}
        categories={categories}
        onAddProduct={addProduct}
      />
    </div>
  );
}

export default App;
