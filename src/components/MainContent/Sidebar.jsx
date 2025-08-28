export default function Sidebar() {
  const categories = ["Laptop", "Desktop", "Ổ cứng", "Ram", "Loa", "Micro", "Webcam", "Màn hình"];
  return (
    <aside className="w-56 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 h-full h-[455px]">
      <h3 className="font-bold text-lg text-blue-600 mb-2">Danh mục</h3>
      <ul className="space-y-1">
        {categories.map((cat, i) => (
          <li
            key={i}
            className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
          >
            <span className="group-hover:text-blue-600 font-medium">{cat}</span>
            <span className="text-gray-300 group-hover:text-blue-400 text-lg">&gt;</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
