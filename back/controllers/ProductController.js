import ProductModel from '../models/Product.js';
import FilterModel from '../models/Filter.js';

// Получение списка фильтров для Фронтенда
export const getFilters = async (req, res) => {
  try {
    const filters = await FilterModel.find();
    
    // Преобразуем в объект: { brand: [...], builtInMemory: [...] }
    const response = {};
    filters.forEach(f => {
      response[f.queryKey] = f.options; 
    });

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить фильтры' });
  }
};

// Получение товаров с фильтрацией (Для каталога)
export const getAll = async (req, res) => {
  try {
    const { search, limit, page, sortBy, ...queryParams } = req.query;

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
      dbQuery.productName = { $regex: search, $options: 'i' };
    }

    // 3. Фильтрация
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (fieldMap[key] && value) {
        const valuesArray = value.split(',');
        if (valuesArray.length > 0) {
          dbQuery[fieldMap[key]] = { $in: valuesArray };
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
        sortOptions = { productName: 1 };
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

// Создать новый товар
export const create = async (req, res) => {
    try {
        const doc = new ProductModel(req.body);
        const product = await doc.save();
        
        // 201 статус означает "Создано"
        res.status(201).json(product);
    } catch (err) { 
        console.log(err);
        res.status(500).json({ message: 'Не удалось создать товар' }); 
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

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { ...req.body }, // Берем все данные из запроса
      { new: true }    // Возвращаем обновленный документ
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить товар' });
  }
};