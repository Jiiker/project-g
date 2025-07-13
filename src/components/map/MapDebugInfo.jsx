import React from "react";

/**
 * @typedef {object} UserLocation
 * @property {number} lat - 사용자의 위도
 * @property {number} lng - 사용자의 경도
 */

/**
 * 지도 디버그 정보를 표시하는 컴포넌트.
 * 개발 모드에서만 렌더링됩니다.
 *
 * @param {object} props - 컴포넌트 props
 * @param {number} props.longitude - 지도의 현재 경도
 * @param {number} props.latitude - 지도의 현재 위도
 * @param {number} props.zoom - 지도의 현재 줌 레벨
 * @param {number} props.pitch - 지도의 현재 각도
 * @param {UserLocation} props.userLocation - 사용자의 현재 위치 (위도, 경도)
 */
const MapDebugInfo = ({ longitude, latitude, zoom, pitch, userLocation }) => {
  // 개발 모드가 아니면 컴포넌트를 렌더링하지 않음
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className='absolute bottom-2.5 left-2.5 bg-black bg-opacity-70 text-white p-2.5 rounded text-sm z-1000'>
      <div>Longitude: {longitude ? longitude.toFixed(4) : "N/A"}</div>
      <div>Latitude: {latitude ? latitude.toFixed(4) : "N/A"}</div>
      <div>Zoom: {zoom ? zoom.toFixed(2) : "N/A"}</div>
      <div>Pitch: {pitch ? pitch.toFixed(2) : "N/A"}</div>
      <div>
        User Location:{" "}
        {userLocation &&
        userLocation.lat !== undefined &&
        userLocation.lng !== undefined
          ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
          : "N/A"}
      </div>
    </div>
  );
};

export default MapDebugInfo;
