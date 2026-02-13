import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreateReview, fetchProductReviews, fetchOneProduct } from "../../redux/slices/productSlice";
// import "../../SCSS/components/reviews.scss";

const Reviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { data: user } = useSelector((state) => state.auth);
  
  // Берем отзывы из Redux
  const { currentReviews, reviewsStatus } = useSelector((state) => state.products || state.product);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Загружаем отзывы при монтировании компонента (или смене товара)
  useEffect(() => {
    if (productId) {
        dispatch(fetchProductReviews(productId));
    }
  }, [dispatch, productId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment) return alert("Напишите комментарий!");
    
    try {
        const result = await dispatch(fetchCreateReview({ 
            id: productId, 
            rating, 
            comment,
            fullName: user.fullName 
        }));

        if (result.meta.requestStatus === 'fulfilled') {
            alert("Отзыв успешно добавлен!");
            setComment("");
            setRating(5);
            // Перезагружаем список отзывов и сам товар (чтобы обновился общий рейтинг)
            dispatch(fetchProductReviews(productId));
            dispatch(fetchOneProduct(productId));
        } else {
            alert("Ошибка: Возможно, вы уже оставили отзыв.");
        }
    } catch (err) {
        alert("Ошибка сервера");
    }
  };

  return (
    <div className="reviews-container">
      <h2>Отзывы ({currentReviews.length})</h2>
      
      {reviewsStatus === 'loading' ? (
          <p>Загрузка отзывов...</p>
      ) : (
          <div className="reviews-list">
            {currentReviews.length === 0 && <p>Отзывов пока нет. Будьте первым!</p>}
            {currentReviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                    <strong>{review.fullName}</strong>
                    <div className="review-rating">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                    </div>
                </div>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
      )}

      <div className="review-form-wrapper">
        <h3>Оставить отзыв</h3>
        {user ? (
          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label>Оценка:</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5 - Отлично</option>
                <option value="4">4 - Хорошо</option>
                <option value="3">3 - Нормально</option>
                <option value="2">2 - Плохо</option>
                <option value="1">1 - Очень плохо</option>
              </select>
            </div>
            <div className="form-group">
              <label>Комментарий:</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о впечатлениях..."
              ></textarea>
            </div>
            <button type="submit" className="button">Отправить</button>
          </form>
        ) : (
          <p>Пожалуйста, <a href="/login">авторизуйтесь</a>, чтобы оставить отзыв.</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;