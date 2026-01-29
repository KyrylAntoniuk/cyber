import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarUrl: String,
  // Ваши адреса из Redux
 addressList: {
    type: Array, // Говорим базе, что здесь будет список
    default: [], // По умолчанию пустой
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);