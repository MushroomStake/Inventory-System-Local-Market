import React, { useState } from 'react';
import ProductList from './ProductList.jsx';
import AddProductForm from './AddProductForm.jsx';
import EditProductForm from './EditProductForm.jsx';
import './InventoryDashboard.css';

// Import custom icons
import boxIcon from '../assets/icons/box.png';
import inStockIcon from '../assets/icons/in-stock.png';
import categoriesIcon from '../assets/icons/categories.png';
import searchIcon from '../assets/icons/search-interface-symbol.png';

function InventoryDashboard({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Calculate stats
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const categoriesCount = [...new Set(products.map(p => p.category))].length;

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleCloseEditForm = () => {
    setEditingProduct(null);
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-content">
        {/* Inventory Overview */}
        <section className="inventory-overview">
          <h2>Inventory Overview</h2>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-number">{totalProducts}</div>
                <div className="stat-label">Total Products</div>
              </div>
              <div className="stat-icon">
                <img src={boxIcon} alt="Total Products" />
              </div>
            </div>
            <div className="stat-card secondary">
              <div className="stat-content">
                <div className="stat-number">{totalQuantity}</div>
                <div className="stat-label">Products in Stock</div>
              </div>
              <div className="stat-icon">
                <img src={inStockIcon} alt="Products in Stock" />
              </div>
            </div>
            <div className="stat-card tertiary">
              <div className="stat-content">
                <div className="stat-number">{categoriesCount}</div>
                <div className="stat-label">Product Categories</div>
              </div>
              <div className="stat-icon">
                <img src={categoriesIcon} alt="Product Categories" />
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input force-light-input"
            />
            <span className="search-icon">
              <img src={searchIcon} alt="Search" />
            </span>
          </div>
          
          <div className="filter-box">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Filter by Category</option>
              {[...new Set(products.map(p => p.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="add-product-btn-secondary"
            onClick={() => setShowAddForm(true)}
          >
            + Add New Product
          </button>
        </section>

        {/* Product List */}
        <section className="product-list-section">
          <ProductList 
            products={filteredProducts} 
            onEditProduct={handleEditProduct}
          />
        </section>
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

      {editingProduct && (
        <EditProductForm 
          product={editingProduct}
          categories={categories}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onClose={handleCloseEditForm}
        />
      )}
    </div>
  );
}

export default InventoryDashboard;