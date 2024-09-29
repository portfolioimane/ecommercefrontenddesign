import React, { useEffect, useState } from 'react';
import axios from '../../../axios';
import { useNavigate } from 'react-router-dom';

const VariantList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductsWithVariants = async () => {
            try {
                const response = await axios.get('/api/admin/variants');
                setProducts(response.data);
            } catch (err) {
                setError(err.response?.data?.errors || 'An error occurred while fetching products.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductsWithVariants();
    }, []);

    const handleDeleteAllVariants = async (productId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete all variants for this product?');
        if (confirmDelete) {
            try {
                await axios.delete(`/api/admin/variants/${productId}`); // Endpoint to delete all variants for a product
                setProducts((prevProducts) => prevProducts.filter(product => product.id !== productId));
            } catch (err) {
                setError(err.response?.data?.errors || 'An error occurred while deleting the variants.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div>
            <h2>Variant List</h2>
            {products.length === 0 ? (
                <div>No products with variants available.</div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Variant Type</th>
                            <th>Values</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            product.variants.map((variant, variantIndex) => (
                                <tr key={variant.id}>
                                    {variantIndex === 0 ? (
                                        <td rowSpan={product.variants.length}>{product.name}</td>
                                    ) : null}
                                    <td>{variant.type}</td>
                                    <td>
                                        <ul>
                                            {variant.variant_values.map(value => (
                                                <li key={value.id}>
                                                     {value.value && value.value.startsWith("Color: ") && (
  <div
    className="color-circle"
    style={{
      backgroundColor: value.value.split(": ")[1], // Extract the color code
      width: '20px', // Width of the circle
      height: '20px', // Height of the circle
      borderRadius: '50%', // Makes it a circle
      display: 'inline-block', // Allows it to sit next to text
      marginLeft: '8px', // Space between text and circle
    }}
  ></div>
)}

                                                    {value.value} - Price: {value.price ? `$${parseFloat(value.price).toFixed(2)}` : 'N/A'} 
                                                    {value.stock !== undefined ? ` - Stock: ${value.stock}` : ''} {/* Show stock for each variant value */}
                                                    {value.image && (
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}/storage/${value.image}`}
                                                            alt={value.value}
                                                            width="50"
                                                        />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                
                                    {variantIndex === 0 ? (
                                        <td rowSpan={product.variants.length}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate(`/admin/variants/edit/${product.id}`)} // Navigate to edit all variants for this product
                                            >
                                                Edit All
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDeleteAllVariants(product.id)} // Delete all variants for this product
                                            >
                                                Delete All
                                            </button>
                                        </td>
                                    ) : null}
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VariantList;
