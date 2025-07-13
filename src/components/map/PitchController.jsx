import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaEye } from "react-icons/fa";

const PitchController = ({ pitch, onPitchChange }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (event) => {
      if (isDragging && sliderRef.current) {
        const { top, height } = sliderRef.current.getBoundingClientRect();
        const offsetY = event.clientY - top;
        let newPitch = 85 * (offsetY / height);

        if (newPitch < 0) newPitch = 0;
        if (newPitch > 85) newPitch = 85;

        onPitchChange(newPitch);
      }
    },
    [isDragging, onPitchChange]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = useCallback(
    (event) => {
      if (isDragging && sliderRef.current) {
        const { top, height } = sliderRef.current.getBoundingClientRect();
        const offsetY = event.touches[0].clientY - top;
        let newPitch = 85 * (offsetY / height);

        if (newPitch < 0) newPitch = 0;
        if (newPitch > 85) newPitch = 85;

        onPitchChange(newPitch);
      }
    },
    [isDragging, onPitchChange]
  );

  const sliderHeight = 120; // px, increased height
  const topPosition = (pitch / 85) * sliderHeight;

  return (
    <div className='absolute bottom-56 right-10 bg-white bg-opacity-80 p-2 rounded-full shadow-md'>
      <div
        ref={sliderRef}
        className='relative w-2.5 h-[120px] bg-gray-300 rounded-full cursor-pointer'
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className='absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#3182F7] rounded-full shadow-lg flex items-center justify-center'
          style={{ top: `${topPosition - 16}px` }}
        >
          <FaEye className='text-white' />
        </div>
      </div>
    </div>
  );
};

export default PitchController;
