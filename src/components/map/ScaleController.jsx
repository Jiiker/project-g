import React, { useState, useEffect } from "react";

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
    <div className='absolute bottom-[70px] right-5 flex flex-col rounded-md overflow-hidden shadow-md z-1000'>
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
