import React, { useState } from 'react';
import ProductList from './ProductList.jsx';
import AddProductForm from './AddProductForm.jsx';
import './InventoryDashboard.css';

function InventoryDashboard({ products, categories, onAddProduct }) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate stats
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const categoriesCount = [...new Set(products.map(p => p.category))].length;

  return (
    <div className="inventory-dashboard">
      <header className="dashboard-header">
        <h1>Local Farm Market Inventory Dashboard</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add New Product
        </button>
      </header>

      <div className="dashboard-layout">
        {/* Stats Sidebar */}
        <div className="dashboard-sidebar">
          <div className="stats-card">
            <div className="stat-item">
              <div className="stat-number">{totalProducts}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{categoriesCount}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{totalQuantity}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <ProductList products={products} />
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddProductForm 
              categories={categories}
              onAddProduct={(product) => {
                onAddProduct(product);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryDashboard;