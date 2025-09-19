import React, { useState, useEffect, useRef } from 'react';

export default function DualRangePriceSlider ({ 
  minPrice = 0, 
  maxPrice = 50000000, 
  step = 100000, 
  onPriceChange,
  currentMin = 0,
  currentMax = 50000000 
}) {
  const [minValue, setMinValue] = useState(currentMin);
  const [maxValue, setMaxValue] = useState(currentMax);
  const minRef = useRef(null);
  const maxRef = useRef(null);
  const rangeRef = useRef(null);

  // Format giá thành VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Parse price từ string input
  const parsePrice = (priceStr) => {
    return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
  };

  // Update range fill
  useEffect(() => {
    if (rangeRef.current) {
      const percent1 = ((minValue - minPrice) / (maxPrice - minPrice)) * 100;
      const percent2 = ((maxValue - minPrice) / (maxPrice - minPrice)) * 100;
      rangeRef.current.style.left = percent1 + '%';
      rangeRef.current.style.width = (percent2 - percent1) + '%';
    }
  }, [minValue, maxValue, minPrice, maxPrice]);

  // Handle min slider change
  const handleMinChange = (e) => {
    const value = Math.min(parseInt(e.target.value), maxValue - step);
    setMinValue(value);
    if (onPriceChange) {
      onPriceChange({ min: value, max: maxValue });
    }
  };

  // Handle max slider change
  const handleMaxChange = (e) => {
    const value = Math.max(parseInt(e.target.value), minValue + step);
    setMaxValue(value);
    if (onPriceChange) {
      onPriceChange({ min: minValue, max: value });
    }
  };

  // Handle min input change
  const handleMinInputChange = (e) => {
    const value = Math.min(parsePrice(e.target.value), maxValue - step);
    setMinValue(value);
    if (onPriceChange) {
      onPriceChange({ min: value, max: maxValue });
    }
  };

  // Handle max input change
  const handleMaxInputChange = (e) => {
    const value = Math.max(parsePrice(e.target.value), minValue + step);
    setMaxValue(value);
    if (onPriceChange) {
      onPriceChange({ min: minValue, max: value });
    }
  };

return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Khoảng giá</h3>
      
      {/* Price Range Display */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>Từ: {formatPrice(minValue)}</span>
          <span>Đến: {formatPrice(maxValue)}</span>
        </div>
      </div>

      {/* Dual Range Slider */}
      <div className="relative mb-6">
        <div className="relative h-2 bg-gray-200 rounded-lg">
          <div
            ref={rangeRef}
            className="absolute h-full bg-blue-500 rounded-lg"
          />
        </div>
        
        <input
          ref={minRef}
          type="range"
          min={minPrice}
          max={maxPrice}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '8px',
            background: 'transparent',
            outline: 'none',
            position: 'absolute',
            width: '100%',
            pointerEvents: 'none',
            zIndex: minValue > maxValue - step ? 5 : 2,
          }}
          className="[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
        />
        
        <input
          ref={maxRef}
          type="range"
          min={minPrice}
          max={maxPrice}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '8px',
            background: 'transparent',
            outline: 'none',
            position: 'absolute',
            width: '100%',
            pointerEvents: 'none',
            zIndex: maxValue < minValue + step ? 5 : 2,
          }}
          className="[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
        />
      </div>

      {/* Min Max Input Fields */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Giá tối thiểu
          </label>
          <input
            type="text"
            value={formatPrice(minValue)}
            onChange={handleMinInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="0 ₫"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Giá tối đa
          </label>
          <input
            type="text"
            value={formatPrice(maxValue)}
            onChange={handleMaxInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="50,000,000 ₫"
          />
        </div>
      </div>

      {/* Quick Price Selection */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Chọn nhanh:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Dưới 5tr', min: 0, max: 5000000 },
            { label: '5tr - 10tr', min: 5000000, max: 10000000 },
            { label: '10tr - 20tr', min: 10000000, max: 20000000 },
            { label: '20tr - 30tr', min: 20000000, max: 30000000 },
            { label: 'Trên 30tr', min: 30000000, max: 50000000 },
          ].map((range, index) => (
            <button
              key={index}
              onClick={() => {
                setMinValue(range.min);
                setMaxValue(range.max);
                if (onPriceChange) {
                  onPriceChange({ min: range.min, max: range.max }, false); // false để không đóng dropdown
                }
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors duration-200"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => {
          if (onPriceChange) {
            onPriceChange({ min: minValue, max: maxValue }, true); // true để đóng dropdown
          }
        }}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        Áp dụng khoảng giá
      </button>
    </div>
  );
};