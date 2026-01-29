import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";

import ProductCard from "./components/ProductCard";
import Filters from "./components/Filters";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import "../SCSS/pages/productsPage.scss";

const pageRangeDisplayed = 8;

function ProductPage() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { items, status } = useSelector((state) => state.product);
  const { selectedFilters, serchValue } = useSelector((state) => state.filter);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  React.useEffect(() => {
    getProducts();
  }, [selectedFilters, currentPage, serchValue]);

  const getProducts = () => {
    const params = {
      page: currentPage,
      limit: pageRangeDisplayed,
      search: serchValue,
    };

    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params[key] = value.join(",");
      }
    });

    dispatch(fetchProducts(params));
    dispatch(fetchWishlistItems());
  };

  const wishlistSet = new Set(
    wishlistItems.map((item) => (item.product ? item.product._id : item.itemId))
  );

  return (
    <div>
      <p>
        Found Products: <span>{items.length}</span>
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
              ) : (
                items.map((obj) => (
                  <ProductCard
                    key={obj._id}
                    {...obj} // Передаем ВСЕ поля (img, productName, price...)
                    isInWishlist={wishlistSet.has(obj._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {items.length > 0 && (
        <div className="pagination">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={(e) => setCurrentPage(e.selected + 1)}
            pageRangeDisplayed={pageRangeDisplayed}
            pageCount={10} 
            previousLabel="<"
            renderOnZeroPageCount={null}
          />
        </div>
      )}
    </div>
  );
}

export default ProductPage;