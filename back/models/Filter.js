import mongoose from "mongoose";

const FilterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },      // Отображаемое имя (напр. "Built-in Memory")
    queryKey: { type: String, required: true, unique: true }, // Ключ в URL (напр. "builtInMemory")
    dbKey: { type: String, required: true },     // Путь в БД (напр. "options.builtInMemory")
    type: { type: String, default: "checkbox" }, // Тип фильтра
    options: [{ type: String }],                 // Список доступных значений
  },
  { timestamps: true }
);

// ВАЖНО: Вот эта строка экспортирует модель по умолчанию
export default mongoose.model("Filter", FilterSchema);