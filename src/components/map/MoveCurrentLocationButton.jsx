import React from "react";
import { RiFocus3Line } from "react-icons/ri";

const MoveCurrentLocationButton = ({ map, userLocation }) => {
  const focusOnUserLocation = () => {
    if (map && userLocation) {
      map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
    }
  };

  return (
    <button
      onClick={focusOnUserLocation}
      className='absolute bottom-8 right-8 w-10 h-10 rounded-full bg-[#3182F7] flex justify-center items-center border-none cursor-pointer z-1000'
    >
      <RiFocus3Line size={24} color='white' />
    </button>
  );
};

export default MoveCurrentLocationButton;
