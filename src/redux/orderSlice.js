import { createSlice } from '@reduxjs/toolkit';

// Load initial orders state from local storage
const loadOrdersFromLocalStorage = () => {
    const storedOrders = localStorage.getItem('orders');
    return storedOrders ? JSON.parse(storedOrders) : [];
};

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        items: loadOrdersFromLocalStorage(), // Load from local storage
    },
    reducers: {
        setOrders: (state, action) => {
            state.items = action.payload;
            localStorage.setItem('orders', JSON.stringify(state.items)); // Persist to local storage
        },
        addOrder: (state, action) => {
            state.items.push(action.payload);
            localStorage.setItem('orders', JSON.stringify(state.items)); // Persist to local storage
        },
    },
});

export const { setOrders, addOrder } = orderSlice.actions;
export default orderSlice.reducer;
