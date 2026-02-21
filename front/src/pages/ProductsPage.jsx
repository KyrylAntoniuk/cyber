import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { useLocation } from "react-router-dom";

import ProductCard from "./components/ProductCard";
import Filters from "./components/Filters";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";

import "../SCSS/pages/productsPage.scss";
import "../SCSS/components/pagination.scss";

const LIMIT = 8;

function ProductPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Добавляем состояние для сортировки (по умолчанию 'rating' или то, что нравится)
  const [sortBy, setSortBy] = useState("rating");

  // Получаем данные из Redux
  const { items, status, totalPages } = useSelector((state) => state.product); 
  const { selectedFilters, searchValue } = useSelector((state) => state.filter);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Сброс страницы при изменении фильтров, поиска ИЛИ СОРТИРОВКИ
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, searchValue, sortBy, location.search]);

  // --- ГЛАВНЫЙ ЗАПРОС ---
  useEffect(() => {
    const getProducts = async () => {
      // Получаем категорию из URL
      const searchParams = new URLSearchParams(location.search);
      const category = searchParams.get('category');

      // 1. Базовые параметры + СОРТИРОВКА
      const params = {
        page: currentPage,
        limit: LIMIT,
        search: searchValue,
        sortBy: sortBy, // <--- Передаем выбранную сортировку на бэкенд
        category: category, // Добавляем категорию в запрос
      };

      // 2. Добавляем фильтры
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
            params[key] = values.join(",");
        }
      });

      // console.log("🚀 ОТПРАВКА ЗАПРОСА С ПАРАМЕТРАМИ:", params);

      dispatch(fetchProducts(params));
      dispatch(fetchWishlistItems());
    };

    getProducts();
    window.scrollTo(0, 0);
  }, [currentPage, selectedFilters, searchValue, sortBy, dispatch, location.search]); // Добавили location.search в зависимости

  // Создаем Set для быстрой проверки избранного
  const wishlistSet = new Set(wishlistItems.map((i) => (i.product ? i.product._id : i.itemId)));

  return (
    <div className="container">
      {/* Верхняя часть (если есть) */}
      
      <div className="products-container">
        <div className="Filters">
           <Filters />
        </div>

        <div className="items-contener">
            {/* БЛОК СОРТИРОВКИ */}
            <div className="sort-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '15px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Сортировать:</span>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}
                >
                    <option value="rating">По рейтингу</option>
                    <option value="price_asc">Сначала дешевые</option>
                    <option value="price_desc">Сначала дорогие</option>
                    <option value="reviews">По популярности</option>
                    <option value="title">По названию (А-Я)</option>
                </select>
            </div>

            <div className="items-wrapper">
               <div className="items">
                 {status === "loading" ? (
                    <h2>Loading...</h2> 
                 ) : (
                    items.length > 0 ? (
                        items.map(obj => (
                            <ProductCard 
                                key={obj._id} 
                                {...obj} 
                                isInWishlist={wishlistSet.has(obj._id)} 
                            />
                        ))
                    ) : (
                        <h2>Товары не найдены</h2>
                    )
                 )}
               </div>
            </div>
        </div>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
           <ReactPaginate
             pageCount={totalPages}
             forcePage={currentPage - 1}
             onPageChange={(e) => setCurrentPage(e.selected + 1)}
             containerClassName="pagination"
             activeClassName="active"
             pageClassName="page-item"
             pageLinkClassName="page-link"
             previousClassName="page-item"
             previousLinkClassName="page-link"
             nextClassName="page-item"
             nextLinkClassName="page-link"
             breakClassName="page-item"
             breakLinkClassName="page-link"
             previousLabel="<"
             nextLabel=">"
           />
        </div>
      )}
    </div>
  );
}

export default ProductPage;