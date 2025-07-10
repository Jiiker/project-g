
import React from 'react';

const MapDebugInfo = ({ longitude, latitude, zoom, userLocation }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute bottom-2.5 left-2.5 bg-black bg-opacity-70 text-white p-2.5 rounded text-sm z-1000">
      <div>Longitude: {longitude ? longitude.toFixed(4) : 'N/A'}</div>
      <div>Latitude: {latitude ? latitude.toFixed(4) : 'N/A'}</div>
      <div>Zoom: {zoom ? zoom.toFixed(2) : 'N/A'}</div>
      <div>User Location: {userLocation && userLocation.lat !== undefined && userLocation.lng !== undefined ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'N/A'}</div>
    </div>
  );
};

export default MapDebugInfo;
