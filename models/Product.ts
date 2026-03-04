import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
    },
    nameEn: {
        type: String,
        required: [true, 'Please provide an English name'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
    },
    categoryEn: {
        type: String,
        required: [true, 'Please provide an English category'],
    },
    images: [{
        type: String,
        required: [true, 'Please provide at least one image'],
    }],
    stock: {
        type: Number,
        default: 0,
    },
    isOnSale: {
        type: Boolean,
        default: false,
    },
    salePrice: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);