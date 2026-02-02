import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";

import ProductCard from "./components/ProductCard";
import Filters from "./components/Filters";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";

import "../SCSS/pages/productsPage.scss";

const LIMIT = 8; // Must match or be close to what backend expects

function ProductPage() {
  const dispatch = useDispatch();
  
  // Use local state for immediate UI response, or rely on Redux state
  const [currentPage, setCurrentPage] = useState(1);

  // Get data from Redux
  const { items, status, totalPages } = useSelector((state) => state.product);
  const { selectedFilters, serchValue } = useSelector((state) => state.filter);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // 1. Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, serchValue]);

  // 2. Fetch products whenever page, filters, or search changes
  useEffect(() => {
    const getProducts = async () => {
      const params = {
        page: currentPage,
        limit: LIMIT,
        search: serchValue,
      };

      // Convert filter arrays to strings if needed
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params[key] = value.join(",");
        }
      });

      dispatch(fetchProducts(params));
      dispatch(fetchWishlistItems());
    };

    getProducts();
    window.scrollTo(0, 0);
  }, [currentPage, selectedFilters, serchValue, dispatch]);

  // Wishlist check set
  const wishlistSet = new Set(
    wishlistItems.map((item) => (item.product ? item.product._id : item.itemId))
  );

  return (
    <div className="container">
      <p>
        Found Products: <span>{items ? items.length : 0}</span>
      </p>

      <div className="products-container">
        <div className="Filters">
          <Filters />
        </div>

        <div className="items-contener">
          <div className="items-wrapper">
            <div className="items">
              {status === "loading" ? (
                <h2>Loading...</h2>
              ) : status === "error" ? (
                <h2>Error loading products 😕</h2>
              ) : (!Array.isArray(items) || items.length === 0) ? (
                <h2>Ничего не найдено 😕</h2>
              ) : (
                // Safety check: Ensure items is an array before mapping
                items.map((obj) => (
                  <ProductCard
                    key={obj._id}
                    {...obj}
                    isInWishlist={wishlistSet.has(obj._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Show Pagination only if we have pages */}
      {status === 'success' && totalPages > 1 && (
        <div className="pagination-wrapper">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            previousLabel="<"
            onPageChange={(e) => setCurrentPage(e.selected + 1)}
            pageRangeDisplayed={3}
            pageCount={totalPages} 
            forcePage={currentPage - 1} 
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            activeClassName="active"
            disabledClassName="disabled"
          />
        </div>
      )}
    </div>
  );
}

export default ProductPage;