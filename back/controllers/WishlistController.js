import WishlistItem from '../models/WishlistItem.js';

export const addToWishlist = async (req, res) => {
  try {
    // Проверяем, есть ли уже товар в избранном
    const existing = await WishlistItem.findOne({ 
      user: req.userId, 
      product: req.body.productId 
    });

    if (existing) {
      return res.json(existing);
    }

    const doc = new WishlistItem({
      user: req.userId,
      product: req.body.productId
    });
    const item = await doc.save();
    
    // Возвращаем товар с данными (populate)
    await item.populate('product');
    res.json(item);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось добавить в избранное' });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await WishlistItem.find({ user: req.userId }).populate('product');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Не удалось получить избранное' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await WishlistItem.findOneAndDelete({ 
      user: req.userId, 
      product: req.params.productId 
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Не удалось удалить' });
  }
};