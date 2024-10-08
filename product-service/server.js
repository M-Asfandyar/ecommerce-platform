require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
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
app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).send(newProduct);
});

app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.status(200).send(products);
});

app.put('/products/:id', async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updatedProduct);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Product Service is running on port ${PORT}`);
});
