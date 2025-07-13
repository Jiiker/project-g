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
    <div className="bg-white bg-opacity-80 rounded-lg shadow-md p-1 sm:p-2 flex items-center space-x-1 sm:space-x-2 gap-0.5 sm:gap-1">
      <FaSun className="text-yellow-500 text-xl sm:text-2xl" />
      <button onClick={handleDecrement} className="p-1 rounded-full bg-[#3182F7] hover:bg-blue-600">
        <HiMinus className="text-white text-sm sm:text-base" />
      </button>
      <span className="text-sm sm:text-lg font-semibold w-10 sm:w-16 text-center">
        {timeOffset === 0 ? '현재' : `${timeOffset > 0 ? '+' : ''}${timeOffset}h`}
      </span>
      <button onClick={handleIncrement} className="p-1 rounded-full bg-[#3182F7] hover:bg-blue-600">
        <HiPlus className="text-white text-sm sm:text-base" />
      </button>
    </div>
  );
};

export default TimeController;
