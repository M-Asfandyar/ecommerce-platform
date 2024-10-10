require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection setup 
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Product Schema and Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    stock: Number,
});

const Product = mongoose.model('Product', productSchema);

// API Endpoints

// Create a new product
app.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).send(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send({ message: 'Error creating product', error });
    }
});

// Get all products (keeping the /products route for compatibility)
app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send({ message: 'Error retrieving products', error });
    }
});

// Update a product by ID
app.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).send(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({ message: 'Error updating product', error });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Product Service is running on port ${PORT}`);
});
