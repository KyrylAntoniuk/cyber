export const cartTotalPrice = (items) => {
  const cartPrice = items.reduce((sum, obj) => {
    return sum + obj.price * obj.count;
  }, 0);
  const cartCount = items.reduce((sum, obj) => {
    return sum + obj.count;
  }, 0);

  const cartTax = cartPrice * 0.02;
  const totalPrice = cartPrice + cartTax;

  return {
    cartPrice: parseFloat(cartPrice.toFixed(2)),
    cartTax: parseFloat(cartTax.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    totalCount: cartCount,
  };
};
