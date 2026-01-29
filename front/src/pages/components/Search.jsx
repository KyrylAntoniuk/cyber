import { setSerchValue } from "../../redux/slices/filterSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { useLocation, useNavigate } from "react-router-dom";
import "../../SCSS/components/search.scss";

console.log(window.location.href);
export default function Search() {
  const { serchValue } = useSelector((state) => state.filter);
  const [fetchedProducts, setFetchedProducts] = React.useState([]);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  async function fetchProducts(value) {
    try {
      const { data } = await axios.get(
        `https://67950720aad755a134eb0661.mockapi.io/items?productName=${value}`
      );
      setFetchedProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  const SearchMenu = useMemo(
    () =>
      debounce((value) => {
        if (location.pathname !== "/products") {
          setFetchedProducts([]);
          fetchProducts(value);
        }
      }, 300),
    [location.pathname]
  );

  console.log(fetchedProducts);
  return (
    <div className="search-conrainer">
      <input
        className="search"
        type="text"
        placeholder="Search..."
        onChange={(e) => {
          dispatch(setSerchValue(e.target.value.toLowerCase()));
          SearchMenu(e.target.value);
        }}
      />
      <div className="preview-products">
        {serchValue === ""
          ? null
          : fetchedProducts.map((item) => {
              return (
                <div
                  className="preview-item"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img src={item.img} alt={item.productName || 'Product image'} />
                  <div>
                    <span>{item.productName}</span>
                    <p>{item.price}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
