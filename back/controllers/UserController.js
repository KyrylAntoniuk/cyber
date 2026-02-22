import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const updateMe = async (req, res) => {
  try {
    // req.userId мы получаем из checkAuth (расшифрованного токена)
    const userId = req.userId;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        addressList: req.body.addressList, // Обновляем весь список адресов
        paymentList: req.body.paymentList, // Обновляем весь список карт
      },
      { new: true } // Вернуть уже обновленный документ
    );

    if (!updatedUser) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { passwordHash, ...userData } = updatedUser._doc;
    res.json(userData);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить профиль',
    });
  }
};

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new User({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      addressList: [] // Инициализируем пустой массив адресов
    });

    const user = await doc.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось зарегистрироваться' });
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(400).json({ message: 'Неверный логин или пароль' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось авторизоваться' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: 'Нет доступа' });
  }
};

// --- НОВАЯ ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ АДРЕСА ---
export const addAddress = async (req, res) => {
  try {
    // Находим пользователя по ID (из токена)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Добавляем пришедшие данные в массив addressList
    // MongoDB автоматически создаст уникальный _id для этого под-объекта
    user.addressList.push(req.body);
    
    // Сохраняем изменения в базе
    await user.save();

    // Возвращаем обновленные данные пользователя (без пароля)
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось добавить адрес' });
  }
};