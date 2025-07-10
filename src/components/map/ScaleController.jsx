import React, { useState, useEffect } from "react";

/**
 * 지도 스케일(줌 레벨)을 조절하고 표시하는 컴포넌트.
 * + / - 버튼을 통해 줌 레벨을 정수 단위로 조절할 수 있습니다.
 *
 * @param {object} props - 컴포넌트 props
 * @param {object} props.map - Mapbox GL JS 지도 인스턴스
 * @param {number} props.zoom - 지도의 현재 줌 레벨
 */
const ScaleController = ({ map, zoom }) => {
  const [inputValue, setInputValue] = useState(zoom ? zoom.toFixed(0) : "");

  useEffect(() => {
    setInputValue(zoom ? zoom.toFixed(0) : "");
  }, [zoom]);

  const handleZoomIn = () => {
    if (map) {
      const newZoom = Math.ceil(zoom) + 1;
      map.setZoom(newZoom);
      setInputValue(newZoom.toFixed(0));
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const newZoom = Math.floor(zoom) - 1;
      map.setZoom(newZoom);
      setInputValue(newZoom.toFixed(0));
    }
  };

  return (
    <div className='absolute bottom-22 right-8 flex flex-col rounded-md overflow-hidden shadow-md z-1000'>
      <button
        onClick={handleZoomIn}
        className='w-10 h-10 bg-[#3182F7] text-white text-2xl flex justify-center items-center border-none cursor-pointer font-bold'
      >
        +
      </button>
      <input
        type='text'
        value={inputValue}
        readOnly
        className='w-10 h-10 bg-white text-black text-sm text-center border-none outline-none font-bold box-border p-0 leading-10 appearance-none'
      />
      <button
        onClick={handleZoomOut}
        className='w-10 h-10 bg-[#3182F7] text-white text-2xl flex justify-center items-center border-none cursor-pointer font-bold'
      >
        -
      </button>
    </div>
  );
};

export default ScaleController;
