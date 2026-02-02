import ProductModel from '../models/Product.js';

// Получение всех товаров (с фильтрацией, сортировкой и пагинацией)
export const getAll = async (req, res) => {
  try {
    const { search, category, sortBy, limit, page } = req.query;

    // 1. Формируем фильтр
    let filter = {};
    
    // Поиск по названию (case-insensitive)
    if (search) {
      filter.productName = { $regex: search, $options: 'i' };
    }
    
    // Фильтр по категории (если передан)
    if (category) {
      filter.category = category;
    }

    // 2. Инициализируем запрос
    let query = ProductModel.find(filter);

    // 3. Сортировка
    if (sortBy === 'price_asc') query = query.sort({ price: 1 });
    else if (sortBy === 'price_desc') query = query.sort({ price: -1 });
    else if (sortBy === 'rating') query = query.sort({ rating: -1 });
    else if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ createdAt: -1 }); // Сортировка по умолчанию (новые сверху)

    // 4. Пагинация
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8; // По умолчанию 8 товаров
    const skip = (pageNumber - 1) * limitNumber;

    // Применяем пагинацию к запросу
    query = query.skip(skip).limit(limitNumber);

    // 5. Выполняем запросы (получение товаров и подсчет общего кол-ва)
    const products = await query.exec();
    const totalDocs = await ProductModel.countDocuments(filter);

    // 6. Возвращаем ответ в формате, который ждет наш Redux (productSlice)
    res.json({
      items: products, // Важно: Redux ждет поле 'items'
      totalItems: totalDocs,
      totalPages: Math.ceil(totalDocs / limitNumber), // Считаем кол-во страниц
      currentPage: pageNumber,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить товары' });
  }
};

// Получение одного товара по ID
export const getOne = async (req, res) => {
  try {
    const productId = req.params.id;
    // .findOneAndUpdate с инкрементом viewsCount — если нужно считать просмотры
    // Либо просто .findById(productId)
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};

// Создание товара (для админки или скриптов)
export const create = async (req, res) => {
  try {
    const doc = new ProductModel({
      productName: req.body.productName,
      price: req.body.price,
      img: req.body.img,
      category: req.body.category,
      rating: req.body.rating,
      text: req.body.text, // Описание
      // Остальные поля из модели...
      brand: req.body.brand,
      screenType: req.body.screenType,
      characteristics: req.body.characteristics,
      options: req.body.options,
      details: req.body.details,
    });

    const product = await doc.save();

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать товар' });
  }
};

// Удаление товара
export const remove = async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await ProductModel.findOneAndDelete({ _id: productId });

    if (!result) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json({
      success: true,
      message: "Товар удален"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить товар' });
  }
};

// Обновление товара
export const update = async (req, res) => {
  try {
    const productId = req.params.id;

    await ProductModel.updateOne(
      { _id: productId },
      {
        $set: {
            productName: req.body.productName,
            price: req.body.price,
            img: req.body.img,
            text: req.body.text,
            // Добавьте остальные поля, которые разрешено обновлять
        },
      }
    );

    res.json({
      success: true,
      message: "Товар обновлен"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить товар' });
  }
};