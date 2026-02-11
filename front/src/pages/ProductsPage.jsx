import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";

import ProductCard from "./components/ProductCard";
import Filters from "./components/Filters";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";

import "../SCSS/pages/productsPage.scss";

const LIMIT = 8;

function ProductPage() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  // Получаем данные из Redux
  const { items, status, totalPages } = useSelector((state) => state.product); // Или state.products (проверьте store.js!)
  const { selectedFilters, searchValue } = useSelector((state) => state.filter);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, searchValue]);

  // --- ГЛАВНЫЙ ЗАПРОС ---
  useEffect(() => {
    const getProducts = async () => {
      // 1. Базовые параметры
      const params = {
        page: currentPage,
        limit: LIMIT,
        search: searchValue,
      };

      // 2. Добавляем фильтры
      // selectedFilters выглядит так: { brand: ["Apple", "Samsung"], builtInMemory: ["64GB"] }
      Object.entries(selectedFilters).forEach(([key, values]) => {
        // Проверяем, что values - это массив и он не пустой
        if (Array.isArray(values) && values.length > 0) {
            // Превращаем в строку: params.brand = "Apple,Samsung"
            params[key] = values.join(",");
        }
      });

      console.log("🚀 ОТПРАВКА ЗАПРОСА С ПАРАМЕТРАМИ:", params); // <--- СМОТРИ СЮДА В КОНСОЛЬ

      dispatch(fetchProducts(params));
      dispatch(fetchWishlistItems());
    };

    getProducts();
    window.scrollTo(0, 0);
  }, [currentPage, selectedFilters, searchValue, dispatch]); // Важно: selectedFilters в зависимостях

  // ... (остальной код: wishlistSet, return JSX)
  const wishlistSet = new Set(wishlistItems.map((i) => (i.product ? i.product._id : i.itemId)));

  return (
    <div className="container">
      {/* ... Верхняя часть ... */}
      <div className="products-container">
        <div className="Filters">
           <Filters />
        </div>
        <div className="items-contener">
            <div className="items-wrapper">
               <div className="items">
                 {status === "loading" ? <h2>Loading...</h2> : 
                  items.map(obj => <ProductCard key={obj._id} {...obj} isInWishlist={wishlistSet.has(obj._id)} />)
                 }
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
             // ... ваши классы ...
           />
        </div>
      )}
    </div>
  );
}

export default ProductPage;