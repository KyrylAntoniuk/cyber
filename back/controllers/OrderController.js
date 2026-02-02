import OrderModel from '../models/Order.js';

// Создание нового заказа
export const createOrder = async (req, res) => {
  try {
    const doc = new OrderModel({
      user: req.userId, // ID пользователя из middleware авторизации (checkAuth)
      items: req.body.items, // Массив товаров с selectedOptions
      totalAmount: req.body.totalAmount, // Общая сумма заказа
      address: req.body.address, // Объект адреса доставки
    });

    const order = await doc.save();

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать заказ',
    });
  }
};

// Получение всех заказов текущего пользователя (История заказов)
export const getMyOrders = async (req, res) => {
  try {
    // Ищем заказы, где user совпадает с id из токена
    // .populate('items.product') подтянет данные о товарах (картинку, название) из коллекции products
    const orders = await OrderModel.find({ user: req.userId })
      .populate('items.product')
      .sort({ createdAt: -1 }); // Сортировка: сначала новые

    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить заказы',
    });
  }
};

// Получение одного конкретного заказа по ID
export const getOneOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await OrderModel.findOne({
      _id: orderId,
      user: req.userId, // Проверяем, что заказ принадлежит именно этому пользователю
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        message: 'Заказ не найден',
      });
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить заказ',
    });
  }
};