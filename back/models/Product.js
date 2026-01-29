import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true }, // Например "Apple", "Samsung"
  screenType: { type: String }, // "AMOLED", "IPS"
  
  // Характеристики (ключи могут быть любыми, поэтому используем гибкий тип)
  characteristics: {
    type: Map,
    of: String
    // Это позволит сохранять "Screen size", "CPU" и любые другие поля
  },

  // Опции для выбора (цвета, память)
  options: {
    color: [String],
    builtInMemory: [String]
  },

  description: String,

  // Детальные характеристики (сложная вложенность из твоего JSON)
  details: [mongoose.Schema.Types.Mixed] 

}, { timestamps: true });

// Виртуальное поле id (чтобы на фронте можно было писать .id вместо ._id)
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

export default mongoose.model('Product', ProductSchema);