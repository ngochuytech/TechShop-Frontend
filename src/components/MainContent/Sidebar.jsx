import { useState } from 'react';

export default function Sidebar() {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categoryData = {
    "Laptop": {
      title: "Laptop",
      sections: [
        {
          title: "Hãng laptop",
          items: ["MacBook", "Dell", "HP", "Asus", "Lenovo", "Acer", "MSI", "LG", "Surface"]
        },
        {
          title: "Mức giá laptop",
          items: ["Dưới 10 triệu", "Từ 10 - 15 triệu", "Từ 15 - 20 triệu", "Từ 20 - 30 triệu", "Trên 30 triệu"]
        },
        {
          title: "Laptop theo nhu cầu",
          items: ["Laptop gaming", "Laptop văn phòng", "Laptop đồ họa", "Laptop mỏng nhẹ", "Laptop 2 trong 1"]
        }
      ]
    },
    "Desktop": {
      title: "PC, Màn hình, Máy in",
      sections: [
        {
          title: "Loại PC",
          items: ["PC Gaming", "PC Văn phòng", "All in One", "Mini PC", "Workstation"]
        },
        {
          title: "Thương hiệu",
          items: ["Dell", "HP", "Asus", "Lenovo", "MSI", "Intel", "AMD"]
        }
      ]
    },
    "Ổ cứng": {
      title: "Ổ cứng, Camera",
      sections: [
        {
          title: "Loại ổ cứng",
          items: ["SSD", "HDD", "USB", "Thẻ nhớ"]
        },
        {
          title: "Thương hiệu",
          items: ["Kingston", "Samsung", "WD", "Seagate", "Crucial"]
        }
      ]
    },
    "Ram": {
      title: "Phụ kiện",
      sections: [
        {
          title: "Loại RAM",
          items: ["DDR4", "DDR5", "Laptop RAM", "Desktop RAM"]
        },
        {
          title: "Thương hiệu",
          items: ["Kingston", "Samsung", "Corsair", "G.Skill", "Crucial"]
        }
      ]
    },
    "Loa": {
      title: "Âm thanh, Mic thu âm",
      sections: [
        {
          title: "Loại loa",
          items: ["Loa Bluetooth", "Loa gaming", "Loa vi tính", "Soundbar"]
        },
        {
          title: "Thương hiệu",
          items: ["JBL", "Sony", "Marshall", "Harman Kardon", "Logitech"]
        }
      ]
    },
    "Micro": {
      title: "Micro",
      sections: [
        {
          title: "Loại micro",
          items: ["Micro thu âm", "Micro karaoke", "Micro gaming", "Micro conference"]
        },
        {
          title: "Thương hiệu",
          items: ["Saramonic", "Boya", "Rode", "Audio-Technica", "Shure"]
        }
      ]
    },
    "Webcam": {
      title: "Webcam",
      sections: [
        {
          title: "Loại webcam",
          items: ["Webcam Full HD", "Webcam 4K", "Webcam chuyên dụng"]
        },
        {
          title: "Thương hiệu",
          items: ["Logitech", "Microsoft", "Razer", "AverMedia", "Xiaomi"]
        }
      ]
    },
    "Màn hình": {
      title: "Màn hình",
      sections: [
        {
          title: "Kích thước màn hình",
          items: ["21-24 inch", "25-27 inch", "28-32 inch", "Trên 32 inch"]
        },
        {
          title: "Thương hiệu",
          items: ["LG", "Samsung", "Asus", "Dell", "Acer", "ViewSonic"]
        }
      ]
    }
  };

  const categories = ["Laptop", "Desktop", "Ổ cứng", "Ram", "Loa", "Micro", "Webcam","Màn hình"];

  return (
    <div className="relative" onMouseLeave={() => setHoveredCategory(null)}>
      <aside className="w-56 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 h-[455px]">
        <h3 className="font-bold text-lg text-blue-600 mb-2">Danh mục</h3>
        <ul className="space-y-1">
          {categories.map((cat, i) => (
            <li
              key={i}
              className="relative flex justify-between items-center px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
              onMouseEnter={() => setHoveredCategory(cat)}
            >
              <span className="group-hover:text-blue-600 font-medium">{cat}</span>
              <span className="text-gray-300 group-hover:text-blue-400 text-lg">&gt;</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Dropdown Menu */}
      {hoveredCategory && categoryData[hoveredCategory] && (
        <div 
          className="absolute left-[230px] top-0 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50 w-[800px] h-[455px] overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            {categoryData[hoveredCategory].title}
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {categoryData[hoveredCategory].sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-200 pb-2">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li 
                      key={itemIdx}
                      className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-1 hover:bg-blue-50 px-2 rounded"
                    >
                      {item}
                      {item.includes("HOT") && (
                        <span className="ml-2 text-xs bg-red-500 text-white px-1 py-0.5 rounded">🔥</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}