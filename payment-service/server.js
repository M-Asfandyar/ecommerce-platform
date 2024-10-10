require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Stripe = require('stripe');
const amqp = require('amqplib/callback_api');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
app.use(bodyParser.json());

// MongoDB connection setup (optional, for logging payment data)
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB for Payment Service'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Payment Schema and Model (optional, if you want to store payment logs)
const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentIntentId: String,
    status: String,
    amount: Number,
    currency: String,
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Create a Payment Intent (Change the path to the root '/')
app.post('/', async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: { orderId }
        });

        // Log payment intent data (optional)
        const payment = new Payment({
            orderId,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount,
            currency
        });
        await payment.save();

        res.status(201).send({ clientSecret: paymentIntent.client_secret, paymentIntent });
    } catch (error) {
        res.status(400).send({ message: 'Error creating payment intent', error });
    }
});

// Webhook to handle payment status updates
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed: ${err.message}`);
        return res.sendStatus(400);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`Payment for ${paymentIntent.amount} was successful!`);
        // Update order status in the database or perform other business logic
    } else {
        console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
});

// Connect to RabbitMQ
amqp.connect('amqp://localhost', (err, connection) => {
    if (err) throw err;
    connection.createChannel((err, channel) => {
        if (err) throw err;

        const queue = 'order_created';

        // Ensure the queue exists
        channel.assertQueue(queue, { durable: false });

        // Consume messages from the queue
        channel.consume(queue, (msg) => {
            const orderData = JSON.parse(msg.content.toString());
            console.log(`Received order event: ${orderData.orderId}`);

            // Process the order payment logic here
            // Update the order status to 'completed' once the payment is successful
        }, { noAck: true });
    });
});

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Payment Service is running on port ${PORT}`);
});
