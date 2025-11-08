// backend/models/CartItem.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    qty: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    image: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/679/679720.png',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CartItem', cartItemSchema);
