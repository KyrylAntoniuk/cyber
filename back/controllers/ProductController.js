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

// Получение товаров с фильтрацией
export const getAll = async (req, res) => {
  try {
    // Достаем sortBy из query
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

    // 4. СОРТИРОВКА (Обновленная часть)
    let sortOptions = { createdAt: -1 }; // По умолчанию: сначала новые

    switch (sortBy) {
      case 'price_asc':
        sortOptions = { price: 1 }; // Цена: по возрастанию
        break;
      case 'price_desc':
        sortOptions = { price: -1 }; // Цена: по убыванию
        break;
      case 'rating':
        sortOptions = { rating: -1 }; // Рейтинг: сначала высокие
        break;
      case 'reviews':
        sortOptions = { numReviews: -1 }; // Отзывы: сначала популярные
        break;
      case 'title':
        sortOptions = { productName: 1 }; // Название: А-Я
        break;
      default:
        sortOptions = { createdAt: -1 }; // Если ничего не выбрано
    }

    // 5. Выполнение запроса
    const totalDocs = await ProductModel.countDocuments(dbQuery);
    const products = await ProductModel.find(dbQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      // .populate('user'); // Если нужно получить данные создателя товара

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

export const getOne = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};

export const create = async (req, res) => {
    try {
        const doc = new ProductModel(req.body);
        const product = await doc.save();
        res.json(product);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const remove = async (req, res) => {
    try { await ProductModel.findOneAndDelete({_id: req.params.id}); res.json({success: true}); } 
    catch(err) { res.status(500).json({message: 'Error'}); }
};

export const update = async (req, res) => {
    try { await ProductModel.updateOne({_id: req.params.id}, req.body); res.json({success: true}); } 
    catch(err) { res.status(500).json({message: 'Error'}); }
};