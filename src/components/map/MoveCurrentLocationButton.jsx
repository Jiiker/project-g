import React from 'react';
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
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#3182F7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      <RiFocus3Line size={24} color="white" />
    </button>
  );
};

export default MoveCurrentLocationButton;
