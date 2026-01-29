import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const doc = new Order({
      user: req.userId, // ID берем из токена авторизации
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      address: req.body.address,
    });

    const order = await doc.save();
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать заказ' });
  }
};

// (Бонус) Получить все заказы пользователя
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate('items.product');
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};