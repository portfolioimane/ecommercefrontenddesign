import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import './VariantEdit.css'; // Customize your styling as needed
import axios from '../../../axios';
import { useParams, useNavigate } from 'react-router-dom';

const VariantEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/admin/products');
        setProducts(response.data);
      } catch (error) {
        setError('Failed to load products. Please try again later.');
      }
    };

    const fetchVariant = async () => {
      try {
        const response = await axios.get(`/api/admin/variants/${id}`);
        const fetchedData = response.data;
        setSelectedProduct(fetchedData.id || '');
        if (fetchedData.variants && fetchedData.variants.length > 0) {
          setVariants(fetchedData.variants.map(variant => ({
            id: variant.id, // Add this line to capture variant id
            type: variant.type,
            values: variant.variant_values.map(v => ({
              id: v.id, // Assuming you have an id for each variant value
              value: v.value,
              price: parseFloat(v.price) || 0,
              stock: v.stock || 0,
              image: v.image || '',
              color: v.color || '',
              isNew: false,
            })),
          })));
        }
      } catch (error) {
        setError('Failed to load variant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchVariant();
  }, [id]);

  const handleValueChange = (variantIndex, valueIndex, value) => {
    setVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].values[valueIndex].value = value;
      return updatedVariants;
    });
  };

  const handleColorChange = (variantIndex, valueIndex, color) => {
    setVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].values[valueIndex].color = color.hex;
      updatedVariants[variantIndex].values[valueIndex].value = `Color: ${color.hex}`;
      updatedVariants[variantIndex].values[valueIndex].isNew = true;
      return updatedVariants;
    });
  };

  const handleImageChange = (variantIndex, valueIndex, event) => {
    const file = event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVariants(prevVariants => {
        const updatedVariants = [...prevVariants];
        updatedVariants[variantIndex].values[valueIndex].image = reader.result;
        return updatedVariants;
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleAddValue = (variantIndex) => {
    setVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].values.push({
        value: '',
        price: 0,
        stock: 0,
        image: '',
        color: '',
        isNew: true,
      });
      return updatedVariants;
    });
  };

  const handleRemoveValue = async (variantIndex, valueIndex) => {
    const variantId = variants[variantIndex].id; // Ensure to access the correct variant ID
    const valueId = variants[variantIndex].values[valueIndex]?.id;

    // Check if the valueId exists; if it does not, just remove from the UI without making a delete request
    if (!valueId) {
        // If there's no valueId, we simply remove it from the UI
        setVariants(prevVariants => {
            const updatedVariants = [...prevVariants];
            updatedVariants[variantIndex].values.splice(valueIndex, 1);
            return updatedVariants;
        });
        alert('Variant value removed successfully from the UI!');
        return;
    }

    try {
        // Proceed with deletion from the database
        await axios.delete(`/api/admin/variants/${variantId}/values/${valueId}`);
        setVariants(prevVariants => {
            const updatedVariants = [...prevVariants];
            updatedVariants[variantIndex].values.splice(valueIndex, 1);
            return updatedVariants;
        });
        alert('Variant value deleted successfully from the database!');
    } catch (error) {
        console.error('Error deleting variant value:', error);
        alert('Failed to delete variant value from the database. Please try again.');
    }
};

  // New function to remove the entire variant
  const handleRemoveVariant = async (variantIndex) => {
    const variantId = variants[variantIndex].id; // Ensure to access the correct variant ID

    if (!variantId) {
      alert('Variant ID not found. Cannot delete.');
      return;
    }

    try {
      await axios.delete(`/api/admin/variants/${id}/variant/${variantId}`);
      setVariants(prevVariants => {
        const updatedVariants = [...prevVariants];
        updatedVariants.splice(variantIndex, 1);
        return updatedVariants;
      });
      alert('Variant deleted successfully!');
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Failed to delete variant. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.length === 0) {
      alert('Please add at least one variant.');
      return;
    }

    const formData = new FormData();
    formData.append('_method', 'PUT');

    variants.forEach((variant, variantIndex) => {
      formData.append(`variants[${variantIndex}][type]`, variant.type);
      variant.values.forEach((value, valueIndex) => {
        formData.append(`variants[${variantIndex}][values][${valueIndex}][value]`, value.value);
        formData.append(`variants[${variantIndex}][values][${valueIndex}][price]`, value.price);
        formData.append(`variants[${variantIndex}][values][${valueIndex}][stock]`, value.stock);
        formData.append(`variants[${variantIndex}][values][${valueIndex}][color]`, value.color);
        if (value.image) {
          const file = dataURLtoFile(value.image, `${value.value}.png`);
          if (file) {
            formData.append(`variants[${variantIndex}][values][${valueIndex}][image]`, file);
          }
        }
      });
    });

    try {
      setLoading(true);
      const response = await axios.post(`/api/admin/variants/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.success || 'Variants updated successfully!');
      navigate('/admin/variants');
    } catch (error) {
      setError('Failed to update variants. Please try again.');
      console.error('Error updating variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoFile = (dataURL, filename) => {
    if (!dataURL) return null;
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/);
    if (!mime) return null;
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime[1] });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="variant-edit">
      <h2>Edit Product Variants</h2>
      <form onSubmit={handleSubmit} className="variant-form">
        <div className="product-display">
          <strong>Selected Product:</strong> {selectedProduct ? products.find(product => product.id === selectedProduct)?.name : 'None'}
        </div>

        {variants.map((variant, variantIndex) => (
          <div key={variantIndex} className="variant-card">
            <h3>{variant.type.charAt(0).toUpperCase() + variant.type.slice(1)} Variant</h3>
            {variant.values.map((value, valueIndex) => (
              <div key={valueIndex} className="variant-value-group">
                {variant.type === 'color' ? (
                  <>
                    {value.isNew ? (
                      <label className="color-label">
                        Color:
                        <SketchPicker
                          color={value.color}
                          onChangeComplete={(color) => handleColorChange(variantIndex, valueIndex, color)}
                          className="color-picker"
                        />
                      </label>
                    ) : (
                      <div
  className="color-circle"
  style={{
    backgroundColor: value.value.split(': ')[1], // Extract color code
    border: '1px solid #000',
    width: '50px',  // Set width to 50px
    height: '50px', // Set height to 50px
    borderRadius: '50%', // Make it circular
  }}
></div>

                    )}
                  </>
                ) : (
                  <label className="value-label">
                    Value:
                    <input
                      type="text"
                      value={value.value}
                      onChange={(e) => handleValueChange(variantIndex, valueIndex, e.target.value)}
                    />
                  </label>
                )}
                <label className="price-label">
                  Price:
                  <input
                    type="number"
                    value={value.price}
                    onChange={(e) => {
                      setVariants(prevVariants => {
                        const updatedVariants = [...prevVariants];
                        updatedVariants[variantIndex].values[valueIndex].price = parseFloat(e.target.value) || 0;
                        return updatedVariants;
                      });
                    }}
                  />
                </label>
                <label className="stock-label">
                  Stock:
                  <input
                    type="number"
                    value={value.stock}
                    onChange={(e) => {
                      setVariants(prevVariants => {
                        const updatedVariants = [...prevVariants];
                        updatedVariants[variantIndex].values[valueIndex].stock = parseInt(e.target.value) || 0;
                        return updatedVariants;
                      });
                    }}
                  />
                </label>
                <label className="image-label">
                  Image:
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(variantIndex, valueIndex, e)}
                  />
                </label>
                {value.image && <img src={value.image} alt={value.image } className="image-preview" />}
                <button type="button" onClick={() => handleRemoveValue(variantIndex, valueIndex)} className="remove-button">
                  Remove Value
                </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddValue(variantIndex)} className="add-value-button">
              Add Value
            </button>
            <button type="button" onClick={() => handleRemoveVariant(variantIndex)} className="remove-variant-button">
              Remove Variant
            </button>
          </div>
        ))}

        <button type="submit" className="submit-button">Update Variants</button>
      </form>
    </div>
  );
};

export default VariantEdit;
