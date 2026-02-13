import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    img: String,
    category: String,
    brand: String,
    screenType: String,
    
    // Эти поля мы будем обновлять автоматически при добавлении отзыва
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    // УДАЛИЛИ: reviews: [reviewSchema], <--- Больше не нужно
    
    text: String,
    characteristics: Object,
    options: Object,
    details: Array,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", ProductSchema);