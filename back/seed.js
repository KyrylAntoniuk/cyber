import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB connected'))
  .catch((err) => console.log('❌ DB error', err));

const products = [
  {
    img: "https://content2.rozetka.com.ua/goods/images/big/468887081.jpg",
    productName: "Apple iPhone 16 Pro 128GB Black Titanium",
    price: 72999,
    brand: "Apple",
    screenType: "OLED",
    characteristics: {
      "Screen size": "6.3",
      "CPU": "Apple A18 Pro",
      "Number of Cores": "6",
      "Main camera": "48+48+12 MP",
      "Front-camera": "12 MP",
      "Battery capacity": "3582 mAh"
    },
    options: {
      color: ["#000000", "#C0C0C0"],
      builtInMemory: ["128GB", "256GB", "512GB"]
    },
    description: "Флагман 2024 года с титановым корпусом и новой кнопкой Camera Control.",
    details: [
      {
        screen: [
          { screenDiagonal: "6.3", theScreenResolution: "2622x1206" }
        ],
        CPU: [
          { CPU: "Apple A18 Pro" }
        ]
      }
    ]
  },
  {
    img: "https://content.rozetka.com.ua/goods/images/big/364833671.jpg",
    productName: "Samsung Galaxy S24 Ultra 512GB",
    price: 64999,
    brand: "Samsung",
    screenType: "Dynamic AMOLED 2X",
    characteristics: {
      "Screen size": "6.8",
      "CPU": "Snapdragon 8 Gen 3",
      "Number of Cores": "8",
      "Main camera": "200+50+12+10 MP",
      "Front-camera": "12 MP",
      "Battery capacity": "5000 mAh"
    },
    options: {
      color: ["#FFFF00", "#808080", "#000000"],
      builtInMemory: ["256GB", "512GB", "1TB"]
    },
    description: "Топовый Android-смартфон со стилусом S-Pen и функциями Galaxy AI.",
    details: [
      {
        screen: [
          { screenDiagonal: "6.8", theScreenResolution: "3120x1440" }
        ],
        CPU: [
          { CPU: "Snapdragon 8 Gen 3" }
        ]
      }
    ]
  }
];

const seedData = async () => {
  try {
    await Product.deleteMany({});
    console.log('🧹 Old products removed');

    await Product.insertMany(products);
    console.log('🌱 New products structure added!');
    
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();