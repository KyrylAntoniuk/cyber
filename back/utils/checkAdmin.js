import UserModel from '../models/User.js';

export default async (req, res, next) => {
  try {
    // req.userId уже добавлен предыдущим мидлваром checkAuth
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет доступа. Требуются права администратора.' });
    }

    // Если всё ок и это админ — пропускаем дальше
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка проверки прав доступа' });
  }
};