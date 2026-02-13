import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    fullName: { type: String, required: true }, // Имя автора (кэшируем)
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Индекс, чтобы один юзер мог оставить только 1 отзыв на 1 товар
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);