import mongoose from 'mongoose';

const FilterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Отображаемое имя (Screen Size)
  queryKey: { type: String, required: true, unique: true }, // Ключ в URL (screen)
  dbKey: { type: String, required: true }, // Путь в БД (specs.screen)
  options: [{ type: String }], // Доступные опции ["6.1", "6.7"]
  categories: [{ type: String }], // Категории, к которым относится фильтр
});

export default mongoose.model('Filter', FilterSchema);