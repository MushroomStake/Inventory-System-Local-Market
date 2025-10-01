import React, { useState, useEffect } from 'react';
import './EditProductForm.css';

function EditProductForm({ product, categories, onUpdateProduct, onDeleteProduct, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    categoryId: '',
    customCategory: ''
  });

  // Populate form with product data when component mounts
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        quantity: product.quantity || '',
        unit: product.unit || 'kg',
        categoryId: product.categoryId === 'custom' ? 'custom' : product.categoryId.toString(),
        customCategory: product.categoryId === 'custom' ? product.category : ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.categoryId === 'custom' && !formData.customCategory.trim()) {
      alert('Please enter a custom category name');
      return;
    }

    try {
      const updatedProduct = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        categoryId: formData.categoryId === 'custom' ? 'custom' : parseInt(formData.categoryId),
        category: formData.categoryId === 'custom' ? formData.customCategory.trim() : 
                  categories.find(c => c.id === parseInt(formData.categoryId))?.name || 'Unknown'
      };

      await onUpdateProduct(product.id, updatedProduct);
      onClose();
    } catch (error) {
      alert('Failed to update product: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await onDeleteProduct(product.id);
        onClose();
      } catch (error) {
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-header">
            <h2>Edit Product</h2>
            <p>Update the product information below</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes</option>
                <option value="liters">Liters</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="custom">+ Add Custom Category</option>
              </select>
            </div>
          </div>

          {formData.categoryId === 'custom' && (
            <div className="form-group">
              <label htmlFor="customCategory">Custom Category Name *</label>
              <input
                type="text"
                id="customCategory"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional product description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete Product
            </button>
            <div className="action-group">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Update Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductForm;