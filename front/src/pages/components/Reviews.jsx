import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreateReview, fetchProductReviews, fetchOneProduct } from "../../redux/slices/productSlice";
import axios from "../../axios"; // Импортируем твой настроенный axios

const Reviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { data: user } = useSelector((state) => state.auth);
  
  // Берем отзывы из Redux
  const { currentReviews, reviewsStatus } = useSelector((state) => state.products || state.product);

  // Стейт для создания нового отзыва
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Стейт для редактирования существующего отзыва
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // Загружаем отзывы при монтировании компонента
  useEffect(() => {
    if (productId) {
        dispatch(fetchProductReviews(productId));
    }
  }, [dispatch, productId]);

  // Отправка НОВОГО отзыва
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
            // Обновляем список и рейтинг товара
            dispatch(fetchProductReviews(productId));
            dispatch(fetchOneProduct(productId));
        } else {
            alert("Ошибка: Возможно, вы уже оставили отзыв.");
        }
    } catch (err) {
        alert("Ошибка сервера");
    }
  };

  // Начало редактирования (заполняем форму текущими данными)
  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  // Сохранение отредактированного отзыва
  const handleSaveEdit = async () => {
    try {
      await axios.patch(`/reviews/${editingReviewId}`, {
        rating: editRating,
        comment: editComment
      });

      alert("Отзыв обновлен!");
      setEditingReviewId(null);
      
      // Обновляем данные на странице
      dispatch(fetchProductReviews(productId));
      dispatch(fetchOneProduct(productId));
    } catch (err) {
      console.error(err);
      alert("Не удалось обновить отзыв");
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
                {/* Если ID отзыва совпадает с тем, что мы редактируем - показываем форму */}
                {editingReviewId === review._id ? (
                  <div className="edit-review-form">
                    <div className="form-group">
                        <label>Изменить оценку:</label>
                        <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))}>
                            <option value="5">5 - Отлично</option>
                            <option value="4">4 - Хорошо</option>
                            <option value="3">3 - Нормально</option>
                            <option value="2">2 - Плохо</option>
                            <option value="1">1 - Очень плохо</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <textarea 
                            value={editComment} 
                            onChange={(e) => setEditComment(e.target.value)} 
                            rows="3"
                        />
                    </div>
                    <div className="edit-buttons">
                        <button onClick={handleSaveEdit} className="button save-btn">Сохранить</button>
                        <button onClick={handleCancelEdit} className="button cancel-btn" style={{backgroundColor: '#ccc', marginLeft: '10px'}}>Отмена</button>
                    </div>
                  </div>
                ) : (
                  // Обычное отображение отзыва
                  <>
                    <div className="review-header">
                        <strong>{review.fullName}</strong>
                        <div className="review-rating">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                        </div>
                    </div>
                    <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <p className="review-comment">{review.comment}</p>

                    {/* Кнопка "Изменить" видна только автору отзыва */}
                    {user && user._id === review.user && (
                        <button 
                            onClick={() => handleStartEdit(review)} 
                            className="edit-btn"
                            style={{ fontSize: '12px', color: 'blue', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Изменить отзыв
                        </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
      )}

      {/* Форма создания нового отзыва (скрываем, если пользователь уже редактирует что-то, чтобы не путать) */}
      {!editingReviewId && (
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
      )}
    </div>
  );
};

export default Reviews;