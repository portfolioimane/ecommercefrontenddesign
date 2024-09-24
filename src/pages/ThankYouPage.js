import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ThankYouPage.css';
import { FaCheckCircle } from 'react-icons/fa'; // Optional: Add an icon for success

const ThankYouPage = () => {
    const [recentOrder, setRecentOrder] = useState(null);

    useEffect(() => {
        // Retrieve the most recent order from local storage
        const storedOrder = localStorage.getItem('recentOrder');
        if (storedOrder) {
            setRecentOrder(JSON.parse(storedOrder));
        }
    }, []);

    return (
        <div className="thank-you-container">
            <div className="thank-you-header">
                <FaCheckCircle className="success-icon" />
                <h2>Thank You for Your Order!</h2>
            </div>
            <p>Your order has been successfully placed.</p>

            {recentOrder ? (
                <div className="order-details">
                    <h3>Order Summary</h3>
                    <div className="order-info">
                        <p><strong>Order ID:</strong> #{recentOrder.id}</p>
                        <p><strong>Total Price:</strong> {recentOrder.total_price} MAD</p>
                        <p><strong>Payment Method:</strong> {recentOrder.payment_method}</p>
                    </div>
                    <h4>Items in Your Order:</h4>
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Price (MAD)</th>
                                <th>Subtotal (MAD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrder.items.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.product ? item.product.name : 'Loading...'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price} MAD</td>
                                    <td>{(item.price * item.quantity).toFixed(2)} MAD</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No order details available.</p>
            )}

            <Link to="/" className="back-home-button">Back to Home</Link>
        </div>
    );
};

export default ThankYouPage;
