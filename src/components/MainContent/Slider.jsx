import { useState, useEffect } from "react";
import api from "../../api";

export default function Slider() {
    const [banners, setBanners] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await api.get("/api/v1/banners");
            setBanners(response.data.data || []);
        } catch (error) {
            console.error("Error fetching banners:", error);
        }
    };

    useEffect(() => {
        if (banners.length === 0) return;
        
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 3000); // đổi ảnh mỗi 3 giây
        
        return () => clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) {
        return (
            <div className="flex-1 h-[455px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Đang tải banner...</div>
            </div>
        );
    }

    const currentBanner = banners[current];

    return (
        <div className="flex-1 h-[455px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-center group">
            <a
                href={currentBanner.link || "#"}
                target={currentBanner.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="absolute inset-0 w-full h-full"
            >
                <img
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                />
            </a>

            {/* Navigation Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === current
                                    ? "bg-white w-8"
                                    : "bg-white/50 hover:bg-white/75"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Banner Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-lg font-semibold">{currentBanner.title}</h3>
                {currentBanner.description && (
                    <p className="text-sm text-gray-200">{currentBanner.description}</p>
                )}
            </div>
        </div>
    );
}