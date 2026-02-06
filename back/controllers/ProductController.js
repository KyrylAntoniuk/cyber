import ProductModel from '../models/Product.js';
import FilterModel from '../models/Filter.js'; // Не забудьте, что модель Filter должна существовать!

// 1. Получение фильтров (теперь берем из таблицы Filter)
export const getFilters = async (req, res) => {
  try {
    const filters = await FilterModel.find();

    // Преобразуем массив объектов в удобный объект:
    // { brand: ["Apple", ...], screenType: ["AMOLED", ...] }
    const response = {};
    
    filters.forEach(f => {
      // Если нужно сортировать опции (например, числа 64GB, 128GB), 
      // это лучше делать либо при создании (seed), либо здесь кастомной функцией.
      // Пока отдаем как есть в базе.
      response[f.queryKey] = f.options; 
    });

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить фильтры' });
  }
};

// 2. Получение всех товаров (Динамическая фильтрация)
export const getAll = async (req, res) => {
  try {
    // Отделяем служебные параметры от параметров фильтрации
    const { search, limit, page, sortBy, ...queryParams } = req.query;

    // Настройки пагинации
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    // --- ДИНАМИЧЕСКОЕ ПОСТРОЕНИЕ ЗАПРОСА ---
    
    // 1. Загружаем список доступных фильтров, чтобы знать правильные ключи БД
    const availableFilters = await FilterModel.find();
    
    // Создаем карту: queryKey (URL) -> dbKey (MongoDB Path)
    // Пример: { builtInMemory: 'options.builtInMemory', brand: 'brand' }
    const fieldMap = {};
    availableFilters.forEach(f => {
      fieldMap[f.queryKey] = f.dbKey;
    });

    let dbQuery = {};

    // 2. Поиск по тексту (если есть)
    if (search) {
      dbQuery.productName = { $regex: search, $options: 'i' };
    }

    // 3. Проходимся по всем параметрам, пришедшим с фронтенда
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      
      // Проверяем, является ли этот параметр известным фильтром
      if (fieldMap[key] && value) {
        // Фронт шлет массив через запятую: "Apple,Samsung"
        const valuesArray = value.split(','); 
        
        if (valuesArray.length > 0) {
          // Добавляем условие: поле в БД должно быть ОДНИМ ИЗ значений (оператор $in)
          dbQuery[fieldMap[key]] = { $in: valuesArray };
        }
      }
    });

    // Логирование запроса для отладки (видно в терминале сервера)
    console.log("MongoDB Query:", JSON.stringify(dbQuery, null, 2));

    // 4. Сортировка
    let sortOptions = { createdAt: -1 }; // По умолчанию: новые сверху
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    else if (sortBy === 'price_desc') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { rating: -1 };
    else if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    // 5. Выполнение запросов
    const products = await ProductModel.find(dbQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const totalDocs = await ProductModel.countDocuments(dbQuery);

    res.json({
      items: products,
      totalItems: totalDocs,
      totalPages: Math.ceil(totalDocs / limitNumber),
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

// Создание товара
export const create = async (req, res) => {
  try {
    const doc = new ProductModel({
      productName: req.body.productName,
      price: req.body.price,
      img: req.body.img,
      category: req.body.category,
      rating: req.body.rating,
      text: req.body.text,
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
            brand: req.body.brand,
            category: req.body.category,
            // Добавьте остальные поля при необходимости
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