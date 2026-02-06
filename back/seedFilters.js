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
        options: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus"]
      },
      {
        name: "Screen Type",
        queryKey: "screenType",
        dbKey: "screenType",
        options: ["AMOLED", "IPS", "OLED", "LCD"]
      },
      {
        name: "Built-in Memory",
        queryKey: "builtInMemory",
        dbKey: "options.builtInMemory", // Путь к вложенному объекту options
        options: ["64GB", "128GB", "256GB", "512GB", "1TB"]
      },
      {
        name: "Battery Capacity",
        queryKey: "batteryCapacity",
        dbKey: "characteristics.Battery capacity", // Путь к характеристикам с пробелом
        options: ["3000 mAh", "4000 mAh", "5000 mAh", "6000 mAh"]
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