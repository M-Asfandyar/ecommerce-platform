require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Order Schema and Model
const orderSchema = new mongoose.Schema({
    orderId: { type: String, default: () => uuidv4() },
    userId: String,
    productId: String,
    quantity: Number,
    totalAmount: Number,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// API Endpoints

// Create a new order
app.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).send(newOrder);
    } catch (error) {
        res.status(400).send({ message: 'Error creating order', error });
    }
});

// Get all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching orders', error });
    }
});

// Get order by ID
app.get('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (order) {
            res.status(200).send(order);
        } else {
            res.status(404).send({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching order', error });
    }
});

// Update order status
app.put('/orders/:orderId', async (req, res) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status: req.body.status, updatedAt: Date.now() },
            { new: true }
        );
        if (updatedOrder) {
            res.status(200).send(updatedOrder);
        } else {
            res.status(404).send({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).send({ message: 'Error updating order', error });
    }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Order Service is running on port ${PORT}`);
});
