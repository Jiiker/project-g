import React from "react";
import { FaSun } from "react-icons/fa";
import { HiMinus, HiPlus } from "react-icons/hi";

const TimeController = ({ timeOffset, onTimeOffsetChange }) => {
  const handleDecrement = () => {
    onTimeOffsetChange(Math.max(-12, timeOffset - 1));
  };

  const handleIncrement = () => {
    onTimeOffsetChange(Math.min(12, timeOffset + 1));
  };

  return (
    <div className='absolute top-4 right-4 bg-white bg-opacity-80 rounded-lg shadow-md p-2 flex items-center space-x-2 gap-1'>
      <FaSun className='text-yellow-500' size={24} />
      <button
        onClick={handleDecrement}
        className='p-1 rounded-full bg-[#3182F7] hover:bg-blue-600'
      >
        <HiMinus className='text-white' />
      </button>
      <span className='text-md font-semibold w-10 text-center'>
        {timeOffset === 0
          ? "현재"
          : `${timeOffset > 0 ? "+" : ""}${timeOffset}h`}
      </span>
      <button
        onClick={handleIncrement}
        className='p-1 rounded-full bg-[#3182F7] hover:bg-blue-600'
      >
        <HiPlus className='text-white' />
      </button>
    </div>
  );
};

export default TimeController;
