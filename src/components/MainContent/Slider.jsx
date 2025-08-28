import { useState, useEffect } from "react";

export default function Slider() {
    const images = [
        "/assets/slider/galaxy-z-7-home-0825-v3.webp",
        "/assets/slider/home-oppoencobuds3.jpg"
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        }, 3000); // đổi ảnh mỗi 3 giây
        return () => clearInterval(timer);
    }, [images.length]);
    return (
        <div className="flex-1 h-[455px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-center">
            <img
                src={images[current]}
                alt="slider"
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
            />
            {/* Có thể thêm nút chuyển ảnh hoặc chấm tròn ở đây */}
        </div>
    );
}