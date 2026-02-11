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
      // Если параметр есть в нашей карте фильтров и он не пустой
      if (fieldMap[key] && value) {
        const valuesArray = value.split(','); // "Apple,Samsung" -> ["Apple", "Samsung"]
        if (valuesArray.length > 0) {
          dbQuery[fieldMap[key]] = { $in: valuesArray };
        }
      }
    });

    // 4. Сортировка
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    else if (sortBy === 'price_desc') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { rating: -1 };

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