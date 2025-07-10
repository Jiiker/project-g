
import React from 'react';

const MapDebugInfo = ({ longitude, latitude, zoom, userLocation }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '14px',
      zIndex: 1000,
    }}>
      <div>Longitude: {longitude ? longitude.toFixed(4) : 'N/A'}</div>
      <div>Latitude: {latitude ? latitude.toFixed(4) : 'N/A'}</div>
      <div>Zoom: {zoom ? zoom.toFixed(2) : 'N/A'}</div>
      <div>User Location: {userLocation && userLocation.lat !== undefined && userLocation.lng !== undefined ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'N/A'}</div>
    </div>
  );
};

export default MapDebugInfo;
