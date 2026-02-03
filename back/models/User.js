import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    // Список адресов
    addressList: [
      {
        addressName: String, // Например: "Дом", "Работа"
        tag: String,
        address: String,
        postCode: String,
        phoneNumber: String,
      },
    ],
    // Список карт (храним только безопасные данные для примера!)
    paymentList: [
      {
        cardName: String,    // Название карты (My Visa)
        cardNumber: String,  // Только последние 4 цифры (безопасность!)
        fullCardNumber: String, // (ТОЛЬКО ДЛЯ ТЕСТА! В реальном проде хранить нельзя)
        expDate: String,
        cvv: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);