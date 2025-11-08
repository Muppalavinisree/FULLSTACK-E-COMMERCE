require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibecommerce';

const products = [
  {
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear, ANC, 30h battery',
    price: 3499,
    category: 'Audio',
    image: 'https://tse1.mm.bing.net/th/id/OIP.xnv7XQBqwIZcdOsI2LyNEQHaIX?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    name: 'Nimbus Smartwatch',
    description: 'Health tracking, 7-day battery',
    price: 4999,
    category: 'Wearables',
    image: 'https://img.freepik.com/premium-photo/black-smartwatch-with-analog-clock-display-black-background-3d-illustration_1046390-25056.jpg'
  },
  {
    name: 'Pulse Bluetooth Speaker',
    description: 'Portable, stereo sound',
    price: 1999,
    category: 'Audio',
    image: 'https://images.kabum.com.br/produtos/fotos/sync_mirakl/192566/Bluetooth-Speaker-Splash-Pulse-SP354_1670868515_gg.jpg'
  },
  {
    name: 'Zenphone XR',
    description: '6.5" display, 128GB',
    price: 15999,
    category: 'Phones',
    image: 'https://th.bing.com/th/id/OIP.Aoa0ccQs_1Dev8k1YH6r0QHaE-?o=7&cb=ucfimgc2rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    name: 'Orbit Laptop Stand',
    description: 'Ergonomic aluminum stand',
    price: 899,
    category: 'Accessories',
    image: 'https://tse2.mm.bing.net/th/id/OIP.r2ZgdSEKMfp4hqhtUA9cHAHaHa?cb=ucfimgc2&w=1400&h=1400&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    name: 'Lumen Desk Lamp',
    description: 'Dimmable LED lamp with USB',
    price: 1299,
    category: 'Home',
    image: 'https://m.media-amazon.com/images/I/5194mBw5LAL.jpg'
  }
];


async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('✅ Seeded products');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
