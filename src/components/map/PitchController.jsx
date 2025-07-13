import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaEye } from "react-icons/fa";

const PitchController = ({ pitch, onPitchChange }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Icon dimensions (assuming sm:w-8 sm:h-8 is the max size)
  const ICON_HEIGHT = 32; // sm:h-8 is 32px
  const ICON_HALF_HEIGHT = ICON_HEIGHT / 2; // 16px

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMove = useCallback(
    (offsetY) => {
      if (sliderRef.current) {
        const sliderHeight = sliderRef.current.getBoundingClientRect().height;

        // Calculate the effective range for the icon's center within the slider
        const minCenter = ICON_HALF_HEIGHT;
        const maxCenter = sliderHeight - ICON_HALF_HEIGHT;
        const usableSliderRange = maxCenter - minCenter;

        // Adjust offsetY to be relative to the usable range for the icon's center
        const effectiveOffsetY = offsetY - ICON_HALF_HEIGHT;

        // Map effectiveOffsetY (0 to usableSliderRange) to pitch (0 to 85)
        let newPitch = 85 * (effectiveOffsetY / usableSliderRange);

        if (newPitch < 0) newPitch = 0;
        if (newPitch > 85) newPitch = 85;

        onPitchChange(newPitch);
      }
    },
    [onPitchChange, ICON_HALF_HEIGHT]
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (isDragging && sliderRef.current) {
        const { top } = sliderRef.current.getBoundingClientRect();
        const offsetY = event.clientY - top;
        handleMove(offsetY);
      }
    },
    [isDragging, handleMove]
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
        const { top } = sliderRef.current.getBoundingClientRect();
        const offsetY = event.touches[0].clientY - top;
        handleMove(offsetY);
      }
    },
    [isDragging, handleMove]
  );

  // Calculate icon position for rendering
  const [iconTopStyle, setIconTopStyle] = useState(0);

  useEffect(() => {
    if (sliderRef.current) {
      const sliderHeight = sliderRef.current.getBoundingClientRect().height;
      const minCenter = ICON_HALF_HEIGHT;
      const maxCenter = sliderHeight - ICON_HALF_HEIGHT;
      const usableSliderRange = maxCenter - minCenter;

      const iconCenterPosition = (pitch / 85) * usableSliderRange + minCenter;
      setIconTopStyle(iconCenterPosition - ICON_HALF_HEIGHT);
    }
  }, [pitch, ICON_HALF_HEIGHT]); // Recalculate when pitch or icon height changes

  return (
    <div className='bg-white bg-opacity-80 p-1 sm:p-2 rounded-full shadow-md'>
      <div
        ref={sliderRef}
        className='relative w-2 h-24 sm:w-2.5 sm:h-[120px] bg-gray-300 rounded-full cursor-pointer'
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className='absolute left-1/2 transform -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#3182F7] rounded-full shadow-lg flex items-center justify-center'
          style={{ top: `${iconTopStyle}px` }}
        >
          <FaEye className='text-white text-base sm:text-lg' />
        </div>
      </div>
    </div>
  );
};

export default PitchController;