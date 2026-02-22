import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  productId: { type: String, unique: true, sparse: true }, // Человеко-читаемый ID
  slug: { type: String, unique: true, sparse: true }, // URL-friendly имя
  productName: { type: String }, // Для совместимости со старым JSON
  price: { type: Number, required: true },
  productType: { type: String, required: true }, // Категория (smartphone, laptop...)
  categoryId: { type: mongoose.Schema.Types.ObjectId }, // ID категории
  categoryPath: { type: String }, // Полный путь категории
  brand: { type: String },
  images: [{ type: String }],
  img: { type: String }, // Для совместимости
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  description: { type: String },
  shortDescription: { type: String },
  
  // Опции (цвета, память) и Варианты
  options: { type: mongoose.Schema.Types.Mixed },
  variants: { type: mongoose.Schema.Types.Mixed },

  // Характеристики для отображения (Таблица: Экран - 6.1")
  specifications: [{
    key: String,
    value: String,
    _id: false
  }],

  // Фасеты для фильтрации (Технические данные: screen: 6.1, ram: 8)
  facets: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Разрешаем числа и булевы значения
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);