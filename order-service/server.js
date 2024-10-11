require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib/callback_api');

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

// RabbitMQ Setup
let channel = null;
amqp.connect('amqp://rabbitmq', (err, connection) => {
    if (err) {
        console.error('Error connecting to RabbitMQ:', err);
        return;
    }
    connection.createChannel((err, ch) => {
        if (err) {
            console.error('Error creating RabbitMQ channel:', err);
            return;
        }
        channel = ch;
        const queue = 'order_created';
        channel.assertQueue(queue, { durable: false });
        console.log('Connected to RabbitMQ and queue setup complete');
    });
});

// API Endpoints

// Create a new order
app.post('/', async (req, res) => { // Updated to root level
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        // Publish the order creation event to RabbitMQ if the channel is available
        if (channel) {
            const orderData = JSON.stringify(newOrder);
            channel.sendToQueue('order_created', Buffer.from(orderData));
            console.log(`Order event sent to queue: ${orderData}`);
        } else {
            console.error('RabbitMQ channel is not available');
        }

        res.status(201).send(newOrder);
    } catch (error) {
        res.status(400).send({ message: 'Error creating order', error });
    }
});

// Get all orders
app.get('/', async (req, res) => { // Updated to root level
    try {
        const orders = await Order.find();
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching orders', error });
    }
});

// Get order by ID
app.get('/:orderId', async (req, res) => { // Updated to root level
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
app.put('/:orderId', async (req, res) => { // Updated to root level
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
