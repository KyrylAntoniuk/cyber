import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      price: Number, // Сохраняем цену на момент покупки
      options: Object // Выбранные цвета, память
    }
  ],
  totalAmount: { type: Number, required: true },
  address: { type: Object, required: true }, // Весь объект адреса
  status: { type: String, default: 'pending' }, // pending, shipped, etc.
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);