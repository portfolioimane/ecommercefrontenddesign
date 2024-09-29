import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import './VariantCreate.css';
import axios from '../../../axios';

const VariantCreate = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([
    { type: '', values: [{ value: '', price: 0, image: '', color: '', stock: 0 }] }
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/admin/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddVariant = () => {
    setVariants([...variants, { type: '', values: [{ value: '', price: 0, image: '', color: '', stock: 0 }] }]);
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const handleVariantTypeChange = (index, type) => {
    const updatedVariants = [...variants];
    updatedVariants[index].type = type;
    updatedVariants[index].values = [{ value: '', price: 0, image: '', color: '', stock: 0 }];
    setVariants(updatedVariants);
  };

  const handleAddValue = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values.push({ value: '', price: 0, image: '', color: '', stock: 0 });
    setVariants(updatedVariants);
  };

  const handleRemoveValue = (variantIndex, valueIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values.splice(valueIndex, 1);
    setVariants(updatedVariants);
  };

  const handleValueChange = (variantIndex, valueIndex, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values[valueIndex][field] = value;
    setVariants(updatedVariants);
  };

  const handleColorChange = (variantIndex, valueIndex, color) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values[valueIndex].color = color.hex;
    updatedVariants[variantIndex].values[valueIndex].value = `Color: ${color.hex}`;
    setVariants(updatedVariants);
  };

  const handleImageChange = (variantIndex, valueIndex, event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const updatedVariants = [...variants];
      updatedVariants[variantIndex].values[valueIndex].image = reader.result;
      setVariants(updatedVariants);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product.');
      return;
    }

    const missingFields = [];

    for (const [variantIndex, variant] of variants.entries()) {
      if (!variant.type) {
        missingFields.push(`Variant Type for Variant ${variantIndex + 1}`);
      }
      for (const [valueIndex, value] of variant.values.entries()) {
        if (!value.value) {
          missingFields.push(`Value for ${variant.type} Variant ${variantIndex + 1}, Value ${valueIndex + 1}`);
        }
        if (value.price <= 0) {
          missingFields.push(`Price for ${variant.type} Variant ${variantIndex + 1}, Value ${valueIndex + 1} must be a positive number.`);
        }
        if (value.stock < 0) {
          missingFields.push(`Stock for ${variant.type} Variant ${variantIndex + 1}, Value ${valueIndex + 1} cannot be negative.`);
        }
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    const formData = new FormData();
    formData.append('product_id', selectedProduct);
    
    variants.forEach((variant, index) => {
      formData.append(`variants[${index}][type]`, variant.type);
      variant.values.forEach((value, valueIndex) => {
        formData.append(`variants[${index}][values][${valueIndex}][value]`, value.value);
        formData.append(`variants[${index}][values][${valueIndex}][price]`, value.price);
        formData.append(`variants[${index}][values][${valueIndex}][color]`, value.color);
        formData.append(`variants[${index}][values][${valueIndex}][stock]`, value.stock); // Add stock to FormData
        if (value.image) {
          const file = dataURLtoFile(value.image, `${value.value}.png`);
          formData.append(`variants[${index}][values][${valueIndex}][image]`, file);
        }
      });
    });

    try {
      const response = await axios.post('/api/admin/variants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.success);
    } catch (error) {
      console.error('Error submitting variants:', error);
      alert('Failed to save variants. Please try again.');
    }
  };

  const dataURLtoFile = (dataURL, filename) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="variant-create">
      <h2>Create Product Variants</h2>
      <form onSubmit={handleSubmit} className="variant-form">
        <label className="product-label">
          Select Product:
          <select value={selectedProduct} onChange={handleProductChange} className="product-select">
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>

        {variants.map((variant, variantIndex) => (
          <div key={variantIndex} className="variant-card">
            <div className="variant-header">
              <label className="variant-type-label">
                Variant Type:
                <select
                  value={variant.type}
                  onChange={(e) => handleVariantTypeChange(variantIndex, e.target.value)}
                  className="variant-type-select"
                >
                  <option value="">Select Variant Type</option>
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  <option value="material">Material</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <button
                type="button"
                className="remove-variant-btn"
                onClick={() => handleRemoveVariant(variantIndex)}
              >
                &times; Remove Variant
              </button>
            </div>

            {variant.values.map((value, valueIndex) => (
              <div key={valueIndex} className="variant-value-group">
                {variant.type === 'color' ? (
                  <>
                    <label className="color-label">
                      Color:
                      <SketchPicker
                        color={value.color}
                        onChangeComplete={(color) => handleColorChange(variantIndex, valueIndex, color)}
                        className="color-picker"
                      />
                    </label>
                    {value.color && (
                      <div className="selected-color" style={{ backgroundColor: value.color }}>
                        Selected Color: {value.color}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <label className="value-label">
                      Value:
                      <input
                        type="text"
                        value={value.value}
                        onChange={(e) => handleValueChange(variantIndex, valueIndex, 'value', e.target.value)}
                        placeholder={`Enter ${variant.type} value`}
                        className="value-input"
                      />
                    </label>
                  </>
                )}
                <label className="price-label">
                  Price:
                  <input
                    type="number"
                    value={value.price}
                    onChange={(e) => handleValueChange(variantIndex, valueIndex, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                    className="price-input"
                  />
                </label>
                <label className="stock-label">
                  Stock:
                  <input
                    type="number"
                    value={value.stock}
                    onChange={(e) => handleValueChange(variantIndex, valueIndex, 'stock', parseInt(e.target.value))}
                    placeholder="Stock"
                    className="stock-input"
                  />
                </label>
                <label className="image-label">
                  Image:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(variantIndex, valueIndex, e)}
                    className="image-input"
                  />
                </label>
                <button
                  type="button"
                  className="remove-value-btn"
                  onClick={() => handleRemoveValue(variantIndex, valueIndex)}
                >
                  &times; Remove Value
                </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddValue(variantIndex)} className="add-value-btn">
              + Add Value
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddVariant} className="add-variant-btn">
          + Add Variant
        </button>
        <button type="submit" className="submit-btn">Save Variants</button>
      </form>
    </div>
  );
};

export default VariantCreate;
