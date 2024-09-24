import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../axios'; // Make sure the path is correct
import { addOrder } from '../redux/orderSlice';
import { clearCart } from '../redux/cartSlice';

import './CheckoutPage.css';
import { FaCreditCard, FaPaypal, FaTruck } from 'react-icons/fa';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items || []);
  const guestItems = useSelector(state => state.cart.guestItems || []);
  const isLoggedIn = useSelector(state => !!state.auth.token);
  const userEmail = useSelector(state => state.auth.user?.email);

  const itemsToDisplay = isLoggedIn ? cartItems : guestItems;
  const totalPrice = itemsToDisplay.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const orderData = {
      name: event.target.name.value,
      email: isLoggedIn ? userEmail : event.target.email.value,
      phone: event.target.phone.value,
      address: event.target.address.value,
      total_price: totalPrice,
      payment_method: event.target.payment.value,
      items: itemsToDisplay.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };
    console.log(orderData);

    try {
      const response = await axios.post('/api/orders', orderData);

      // Dispatch the order to the Redux store
      dispatch(addOrder(response.data.order));
      dispatch(clearCart());

      // Store order details in local storage or pass via state
      localStorage.setItem('recentOrder', JSON.stringify(response.data.order));

      // Navigate to thank you page
      navigate('/thank-you');
    } catch (error) {
      console.error('Error placing order:', error.response?.data || error.message);
      // Handle the error (e.g., show an error message)
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <div className="checkout-form">
          <h3>Billing Information</h3>
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" required />
            </div>

            {/* Email Field */}
            {isLoggedIn && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={userEmail} readOnly />
              </div>
            )}

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" required />
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" required />
            </div>

            {/* Payment Method with Icons */}
            <h4>Payment Method</h4>
            <div className="payment-methods">
              <div className="payment-option">
                <input type="radio" id="credit-card" name="payment" value="credit-card" required />
                <label htmlFor="credit-card">
                  <FaCreditCard className="payment-icon" /> Credit Card
                </label>
              </div>
              <div className="payment-option">
                <input type="radio" id="paypal" name="payment" value="paypal" required />
                <label htmlFor="paypal">
                  <FaPaypal className="payment-icon" /> PayPal
                </label>
              </div>
              <div className="payment-option">
                <input type="radio" id="cash-on-delivery" name="payment" value="cash-on-delivery" required />
                <label htmlFor="cash-on-delivery">
                  <FaTruck className="payment-icon" /> Cash on Delivery
                </label>
              </div>
            </div>

            <button type="submit" className="order-button">Place Order</button>
          </form>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3>Cart Summary</h3>
          <ul>
            {itemsToDisplay.map(item => (
              <li key={item.id} className="cart-item">
                <img 
                  src={`${process.env.REACT_APP_API_URL}/storage/${item.image}`} 
                 alt={isLoggedIn ? item.product.name : item.name} 
                className="item-image" />
                <div className="item-details">
                  <p className="item-name">{isLoggedIn ? item.product.name : item.name}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-price">{Number(item.price).toFixed(2)} MAD</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h4>Total: {totalPrice} MAD</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
