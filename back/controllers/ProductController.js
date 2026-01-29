import Product from '../models/Product.js';

export const getAll = async (req, res) => {
  try {
    const { search, category, sortBy, limit, page } = req.query;

    let filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' }; // Поиск без учета регистра
    }
    if (category) {
      filter.category = category;
    }

    let query = Product.find(filter);

    // Сортировка
    if (sortBy === 'price_asc') query = query.sort({ price: 1 });
    if (sortBy === 'price_desc') query = query.sort({ price: -1 });
    if (sortBy === 'rating') query = query.sort({ rating: -1 });
    if (sortBy === 'newest') query = query.sort({ createdAt: -1 });

    // Пагинация (если нужна)
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 20;
    const skip = (pageNumber - 1) * limitNumber;
    
    query = query.skip(skip).limit(limitNumber);

    const products = await query.exec();
    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: pageNumber });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить товары' });
  }
};

export const getOne = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};