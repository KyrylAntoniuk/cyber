import ReviewModel from "../models/Review.js";
import ProductModel from "../models/Product.js";

// Получить все отзывы для конкретного товара
export const getByProduct = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ product: req.params.productId })
      .sort({ createdAt: -1 }); // Сначала новые
      
    res.json(reviews);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось получить отзывы" });
  }
};

// Создать отзыв
export const create = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { rating, comment, fullName } = req.body;

    // 1. Проверяем, существует ли товар
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    // 2. Проверяем, оставлял ли пользователь уже отзыв
    const existingReview = await ReviewModel.findOne({
      product: productId,
      user: req.userId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "Вы уже оставили отзыв к этому товару" });
    }

    // 3. Создаем отзыв
    const doc = new ReviewModel({
      user: req.userId,
      product: productId,
      fullName: fullName || "Anonymous",
      rating: Number(rating),
      comment,
    });

    const savedReview = await doc.save();

    // 4. ПЕРЕСЧЕТ РЕЙТИНГА ТОВАРА
    // Получаем все отзывы этого товара
    const allReviews = await ReviewModel.find({ product: productId });
    
    const newNumReviews = allReviews.length;
    
    // Защита от деления на 0 на всякий случай
    const newRating = newNumReviews > 0 
      ? allReviews.reduce((acc, item) => item.rating + acc, 0) / newNumReviews
      : 0;

    // Обновляем товар (при желании можно округлить рейтинг: Math.round(newRating * 10) / 10)
    product.numReviews = newNumReviews;
    product.rating = newRating;
    await product.save();

    // ВАЖНО: Возвращаем сам отзыв на фронтенд, чтобы сразу отрендерить его в списке!
    res.status(201).json(savedReview);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось добавить отзыв" });
  }
};

export const update = async (req, res) => {
  try {
    const reviewId = req.params.id; // ID самого отзыва
    const { rating, comment } = req.body;

    // 1. Находим отзыв в БД
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Отзыв не найден" });
    }

    // 2. Проверяем, что текущий пользователь — автор отзыва
    // req.userId берется из твоего checkAuth мидлвара
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: "У вас нет прав для изменения этого отзыва" });
    }

    // 3. Обновляем данные
    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    
    const updatedReview = await review.save();

    // 4. ПЕРЕСЧЕТ РЕЙТИНГА ТОВАРА (т.к. оценка могла измениться)
    const allReviews = await ReviewModel.find({ product: review.product });
    const product = await ProductModel.findById(review.product);
    
    if (product) {
      const newNumReviews = allReviews.length;
      const newRating = newNumReviews > 0 
        ? allReviews.reduce((acc, item) => item.rating + acc, 0) / newNumReviews
        : 0;

      product.rating = newRating;
      await product.save();
    }

    // Возвращаем обновленный отзыв
    res.status(200).json(updatedReview);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось обновить отзыв" });
  }
};