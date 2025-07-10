import React from "react";
import { RiFocus3Line } from "react-icons/ri";

/**
 * 현재 위치로 지도를 이동시키는 버튼 컴포넌트.
 *
 * @param {object} props - 컴포넌트 props
 * @param {object} props.map - Mapbox GL JS 지도 인스턴스
 * @param {object} props.userLocation - 사용자의 현재 위치 (lat, lng 속성을 포함)
 */
const MoveCurrentLocationButton = ({ map, userLocation }) => {
  const focusOnUserLocation = () => {
    if (map && userLocation) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 18,
        duration: 1500,
      });
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
