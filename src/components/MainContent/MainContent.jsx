import ProductSection from "./ProductSection";
import Slider from "./Slider";

export default function MainContent() {
  return (
    <main className="container bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 mx-auto px-4 py-8 min-h-[calc(100vh-80px)]">
      {/* Top section: Slider */}
      <div className="flex gap-8 mb-8 min-h-[380px]">
        <Slider />
      </div>

      {/* Product sections */}
      <ProductSection title="Laptop nổi bật nhất" brands={["Macbook", "Dell", "HP", "Asus", "Lenovo", "Xem tất cả"]} category="Laptop"/>
      <ProductSection title="Màn hình nổi bật " brands={["LG", "Samsung", "Asus", "Viewsonic", "Acer", "Xem tất cả"]} category="Màn hình"/>
      <ProductSection title="PC nổi bật" brands={["Cấu hình sẵn", "All in one", "PC bộ", "Xem tất cả"]} category="Desktop"/>
      <ProductSection title="Ổ cứng nổi bật " brands={["Kingston", "Samsung", "Sandisk", "Seagate", "Xem tất cả"]} category="Ổ cứng"/>
      <ProductSection title="Ram nổi bật " brands={["Kingston", "Lexar", "Adata", "Pny", "Xem tất cả"]} category="Ram"/>
      <ProductSection title="Loa nổi bật " brands={["JBL", "LG", "Sony", "Marshall", "Xem tất cả"]} category="Loa"/>
      <ProductSection title="Webcam nổi bật " brands={["Logitech", "Rappo", "Xem tất cả"]} category="Webcam"/>

    </main>
  );
}