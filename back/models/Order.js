import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Массив товаров в заказе
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        // Опции перенесены СЮДА (внутрь items), чтобы они относились к конкретному товару
        selectedOptions: {
          color: String,
          builtInMemory: String,
        },
      },
    ],
    // Общая сумма заказа находится в корне документа
    totalAmount: {
      type: Number,
      required: true,
    },
    // Адрес доставки
    address: {
      addressName: String, // Исправлено adress -> address (правильный английский)
      tag: String,
      address: String,     // Сама строка адреса
      postCode: String,
      phoneNumber: String,
    },
    status: {
      type: String,
      default: "pending", // Возможные статусы: 'pending', 'shipped', 'delivered', 'cancelled'
    },
  },
  {
    timestamps: true, // Автоматически создает поля createdAt и updatedAt
  }
);

export default mongoose.model("Order", OrderSchema);