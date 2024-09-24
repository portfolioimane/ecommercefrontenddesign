import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../../axios';
import { setOrders } from '../../../redux/admin/orderSlice';
import { Button, Table, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
    const dispatch = useDispatch();
    const orders = useSelector(state => state.orders.items);
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/admin/orders');
                dispatch(setOrders(response.data));
            } catch (error) {
                setError('Error fetching orders. Please try again later.');
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await axios.delete(`/api/admin/orders/${id}`);
                const response = await axios.get('/api/admin/orders');
                dispatch(setOrders(response.data));
            } catch (error) {
                setError('Error deleting order. Please try again later.');
                console.error('Error deleting order:', error);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`/api/admin/orders/${id}`, { status: newStatus });
            alert('Order status updated successfully!'); // Notify the user of success
            // Optionally, you can update the local state if needed
            const response = await axios.get('/api/admin/orders');
            dispatch(setOrders(response.data)); // Refresh orders after update
        } catch (error) {
            setError('Error updating order status. Please try again later.');
            console.error('Error updating order status:', error);
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!orders || orders.length === 0) return <div>No orders found.</div>;

    return (
        <div>
            <h1 className="text-center my-4">Order List</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Total Price</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.name}</td>
                            <td>{order.email}</td>
                            <td>{order.phone}</td>
                            <td>{order.address}</td>
                            <td>${order.total_price}</td>
                            <td>{order.payment_method}</td>
                            <td>
                                <Form.Select 
                                    value={order.status} 
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)} 
                                    style={{ width: '150px' }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                            </td>
                            <td>
                                <Button 
                                    variant="info" 
                                    onClick={() => navigate(`/admin/orders/${order.id}`)} 
                                >
                                    View Details
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleDelete(order.id)} 
                                    style={{ marginLeft: '10px' }}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default OrderList;
