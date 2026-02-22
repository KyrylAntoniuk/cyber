import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Импортируем модель (обратите внимание на .js в конце)
import FilterModel from './models/Filter.js';

dotenv.config();

// Подключение к БД
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB Connection Success'))
  .catch((err) => console.log('DB Connection Error', err));

const createFilters = async () => {
  try {
    console.log("Очистка старых фильтров...");
    // 1. Очищаем старые фильтры
    await FilterModel.deleteMany({});

    // 2. Создаем новые (Настройте под свои товары!)
    const filters = [
      {
        name: "Brand",
        queryKey: "brand",
        dbKey: "brand", 
        options: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Sony", "Canon", "GoPro", "Dell", "Asus"],
        categories: ["smartphone", "laptop", "camera"] 
      },
      {
        name: "Screen Type",
        queryKey: "screenType",
        dbKey: "facets.screenType",
        options: ["AMOLED", "IPS", "OLED", "LCD"],
        categories: ["smartphone", "laptop"]
      },
      {
        name: "Storage",
        queryKey: "storage",
        dbKey: "facets.storage", 
        options: ["128", "256", "512", "1024"],
        categories: ["smartphone", "laptop"]
      },
      {
        name: "RAM",
        queryKey: "ram",
        dbKey: "facets.ram",
        options: ["8", "12", "16", "32"],
        categories: ["smartphone", "laptop"]
      },
      {
        name: "Resolution",
        queryKey: "resolution",
        dbKey: "facets.resolution",
        options: ["4K", "Full HD", "33MP", "24MP", "27MP"],
        categories: ["camera"]
      }
    ];

    console.log("Создание новых фильтров...");
    await FilterModel.insertMany(filters);
    
    console.log("Фильтры успешно созданы!");
    process.exit();
  } catch (err) {
    console.error("Ошибка при создании фильтров:", err);
    process.exit(1);
  }
};

createFilters();