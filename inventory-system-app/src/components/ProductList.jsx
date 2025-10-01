import React from 'react';
import './ProductList.css';

function ProductList({ products, onEditProduct }) {
  if (products.length === 0) {
    return (
      <div className="product-list-empty">
        <p>No products in inventory. Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h3>Product List</h3>
      </div>
      <div className="product-table">
        <div className="table-header">
          <div className="header-cell">Product Name</div>
          <div className="header-cell">Category</div>
          <div className="header-cell">Quantity</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {products.map((product) => (
            <div key={product.id} className="table-row">
              <div className="table-cell product-name">
                {product.name}
              </div>
              
              <div className="table-cell category">
                <span className="category-text">
                  {product.category}
                </span>
              </div>
              
              <div className="table-cell quantity">
                <span>{product.quantity} {product.unit}</span>
              </div>

              <div className="table-cell actions">
                <button 
                  className="action-btn update-btn"
                  onClick={() => onEditProduct(product)}
                  title="Update product"
                >
                  Update →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;