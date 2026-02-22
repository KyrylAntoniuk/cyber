import ProductModel from '../models/Product.js';
import FilterModel from '../models/Filter.js';

// --- HELPER FUNCTION TO UPDATE FILTERS ---
const updateFiltersFromProduct = async (product) => {
  if (!product) return;

  // Используем facets для новой структуры
  const { productType, brand, facets } = product;

  const filterMappings = {
    brand: brand,
  };

  // Если есть facets (Map или Object), добавляем их в маппинг
  if (facets) {
    const facetsObj = (facets instanceof Map) ? Object.fromEntries(facets) : facets;
    Object.assign(filterMappings, facetsObj);
  }

  for (const [key, value] of Object.entries(filterMappings)) {
    if (value == null || value === '') continue;

    // 1. Формируем читаемое имя (например "screenSize" -> "Screen Size")
    const displayName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());

    // 2. Формируем путь к полю в БД (facets.key или brand)
    const dbKey = key === 'brand' ? 'brand' : `facets.${key}`;

    // Поддержка массивов значений (если в facets передали массив, например ["Red", "Blue"])
    const valuesToAdd = Array.isArray(value) ? value.map(String) : [String(value)];

    // 3. Ищем и обновляем фильтр, либо создаем новый (upsert: true)
    await FilterModel.findOneAndUpdate(
      { queryKey: key },
      {
        $setOnInsert: { name: displayName, dbKey: dbKey },
        $addToSet: { options: { $each: valuesToAdd }, categories: productType }
      },
      { upsert: true, new: true }
    );
  }
};

// Получение списка фильтров для Фронтенда
export const getFilters = async (req, res) => {
  try {
    let { category } = req.query;
    
    // Маппинг старых категорий на новые (для надежности)
    const categoryMap = { 'phones': 'smartphone', 'laptops': 'laptop', 'cameras': 'camera' };
    if (category && categoryMap[category.toLowerCase()]) {
      category = categoryMap[category.toLowerCase()];
    }
    
    // Формируем запрос: если категория выбрана, ищем фильтры, привязанные к ней.
    // Если нет - возвращаем все (или можно возвращать только общие).
    const query = category 
      ? { categories: category } 
      : {};

    // Получаем список разрешенных фильтров для этой категории
    const filters = await FilterModel.find(query);
    
    const response = [];

    // Проходим по всем фильтрам и ищем реальные значения в товарах
    for (const f of filters) {
      const dbKey = f.dbKey || f.queryKey;
      // Ищем уникальные значения только среди товаров этой категории
      const distinctQuery = category ? { productType: category } : {};

      // Получаем уникальные значения (distinct) только для товаров выбранной категории
      const distinctValues = await ProductModel.distinct(dbKey, distinctQuery);

      // Если значения есть, добавляем их в ответ (сортируем для красоты)
      if (distinctValues.length > 0) {
        response.push({
          name: f.name, // Например: "Screen Type"
          key: f.queryKey, // Например: "screenType"
          options: distinctValues.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
        });
      }
    }

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить фильтры' });
  }
};

// Получение товаров с фильтрацией (Для каталога)
export const getAll = async (req, res) => {
  try {
    const { search, limit, page, sortBy, category, ...queryParams } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    // 1. Загружаем карту полей из БД (queryKey -> dbKey)
    const availableFilters = await FilterModel.find();
    const fieldMap = {};
    availableFilters.forEach(f => {
      fieldMap[f.queryKey] = f.dbKey;
    });

    let dbQuery = {};

    // 2. Поиск (Search)
    if (search) {
      dbQuery.title = { $regex: search, $options: 'i' };
    }

    // 2.1 Фильтрация по Категории (Phones, Laptops, etc.)
    if (category) {
      const categoryMap = { 'phones': 'smartphone', 'laptops': 'laptop', 'cameras': 'camera' };
      // Используем маппинг или оригинальное значение
      dbQuery.productType = categoryMap[category.toLowerCase()] || category;
    }

    // 3. Фильтрация
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (fieldMap[key] && value) {
        const valuesArray = value.split(',');
        // Пытаемся преобразовать значения в числа, если это возможно
        const convertedValues = valuesArray.map(v => {
          const num = Number(v);
          return isNaN(num) ? v : num;
        });

        if (convertedValues.length > 0) {
          dbQuery[fieldMap[key]] = { $in: convertedValues };
        }
      }
    });

    // 4. Сортировка
    let sortOptions = { createdAt: -1 }; 

    switch (sortBy) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'reviews':
        sortOptions = { numReviews: -1 };
        break;
      case 'title':
      case 'productName': // Поддержка старого параметра сортировки
        sortOptions = { title: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; 
    }

    // 5. Выполнение запроса
    const totalDocs = await ProductModel.countDocuments(dbQuery);
    const products = await ProductModel.find(dbQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

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

// Получить один товар (Для детальной страницы)
export const getOne = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
  } catch (err) { 
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении товара' }); 
  }
};

// --- ФУНКЦИИ ДЛЯ АДМИНА ---

// Создание одного товара
export const create = async (req, res) => {
  try {
    const productData = { ...req.body };
    // Адаптация полей для совместимости (если приходят старые данные)
    if (!productData.title && productData.productName) productData.title = productData.productName;
    if (!productData.productType && productData.category) productData.productType = productData.category;
    if ((!productData.images || productData.images.length === 0) && productData.img) {
      productData.images = [productData.img];
    }

    const doc = new ProductModel(productData);
    const product = await doc.save();

    // Автоматическое обновление фильтров
    await updateFiltersFromProduct(product);

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать товар' });
  }
};

// Массовое создание товаров из загруженного JSON
export const createBulk = async (req, res) => {
  try {
    let products = req.body; // Теперь мы ожидаем массив объектов

    // Проверяем, что пришел именно массив и он не пустой
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Ожидается непустой массив товаров в формате JSON' });
    }

    // Адаптация полей для каждого товара (на случай загрузки старого JSON)
    products = products.map(p => {
      const newData = { ...p };
      if (!newData.title && newData.productName) newData.title = newData.productName;
      if (!newData.productType && newData.category) newData.productType = newData.category;
      if ((!newData.images || newData.images.length === 0) && newData.img) {
        newData.images = [newData.img];
      }
      return newData;
    });

    // Метод insertMany за один запрос добавляет все документы в БД
    const insertedProducts = await ProductModel.insertMany(products);
    
    // Обновляем фильтры для каждого добавленного товара
    for (const product of insertedProducts) {
      await updateFiltersFromProduct(product);
    }

    // 201 статус означает "Создано"
    res.status(201).json({
      message: `Успешно добавлено ${insertedProducts.length} товаров`,
      products: insertedProducts
    });
  } catch (err) { 
    console.log(err);
    res.status(500).json({ message: 'Не удалось массово создать товары', error: err.message }); 
  }
};

// Удалить товар
export const remove = async (req, res) => {
    try { 
        const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
        
        // Если товара с таким ID не было в БД
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        res.json({ success: true, message: 'Товар успешно удален' }); 
    } catch(err) { 
        console.log(err);
        res.status(500).json({ message: 'Не удалось удалить товар' }); 
    }
};

// Обновление товара
export const update = async (req, res) => {
  try {
    const productId = req.params.id;

    const productData = { ...req.body };
    // Адаптация полей при обновлении
    if (!productData.title && productData.productName) productData.title = productData.productName;
    if (!productData.productType && productData.category) productData.productType = productData.category;
    if ((!productData.images || productData.images.length === 0) && productData.img) {
      productData.images = [productData.img];
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      productData, // Берем адаптированные данные
      { new: true }    // Возвращаем обновленный документ
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Автоматическое обновление фильтров
    await updateFiltersFromProduct(updatedProduct);

    res.json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить товар' });
  }
};