import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import SunCalc from "suncalc";
import * as turf from "@turf/turf";
import MapDebugInfo from "./MapDebugInfo";
import MoveCurrentLocationButton from "./MoveCurrentLocationButton";
import ScaleController from "./ScaleController";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/**
 * 주어진 경도, 위도, 거리, 방위각을 기반으로 새로운 지점의 경도와 위도를 계산하는 헬퍼 함수.
 * @param {number} lon - 시작 지점의 경도
 * @param {number} lat - 시작 지점의 위도
 * @param {number} distance - 이동할 거리 (미터)
 * @param {number} bearing - 이동할 방위각 (도, 북쪽 0도, 시계 방향)
 * @returns {number[]} - 새로운 지점의 [경도, 위도]
 */
function movePoint(lon, lat, distance, bearing) {
  const R = 6378137; // 지구 반지름
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const bearingRad = (bearing * Math.PI) / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
      Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
  );
  const newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
      Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLatRad)
    );

  return [(newLonRad * 180) / Math.PI, (newLatRad * 180) / Math.PI];
}

/**
 * Mapbox GL JS 지도를 렌더링하고 그림자 및 사용자 인터랙션을 관리하는 메인 컴포넌트.
 * @returns {JSX.Element} 지도 컨테이너 및 관련 UI 요소
 */
function MapContainer() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(126.978);
  const [lat, setLat] = useState(37.5665);
  const [zoom, setZoom] = useState(18);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (map.current) return;

    // Mapbox 지도 인스턴스 초기화
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // 브라우저 지리 위치 API를 사용하여 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // 지도를 사용자 현재 위치로 이동
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 18,
            duration: 1000,
          });

          // 사용자 위치에 마커 추가
          new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

    // 지도 로드 완료 시 이벤트 리스너
    map.current.on("load", () => {
      // 3D 건물 레이어 추가
      const layers = map.current.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.current.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 1,
          },
        },
        labelLayerId
      );

      // 그림자 소스 추가
      map.current.addSource("shadows", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // 그림자 레이어 추가
      map.current.addLayer(
        {
          id: "shadow-layer",
          type: "fill",
          source: "shadows",
          paint: {
            "fill-color": "#000",
            "fill-opacity": 0.4,
          },
          minzoom: 15, // 줌 레벨 15 이상에서 그림자 렌더링
        },
        "3d-buildings" // 3D 건물 레이어 아래에 그림자 레이어 배치
      );

      const updateShadows = () => {
        const center = map.current.getCenter();
        const now = new Date();
        const sunPos = SunCalc.getPosition(now, center.lat, center.lng);

        const sunAltitude = sunPos.altitude;
        const sunAzimuth = sunPos.azimuth;

        if (sunAltitude > 0) {
          const buildingFeatures = map.current.querySourceFeatures(
            "composite",
            {
              sourceLayer: "building",
              filter: ["==", "extrude", "true"],
            }
          );

          const shadowFeatures = [];

          buildingFeatures.forEach((feature) => {
            const height = feature.properties.height || 0;
            const minHeight = feature.properties.min_height || 0;
            const effectiveHeight = height - minHeight;

            if (
              effectiveHeight > 0 &&
              feature.geometry &&
              feature.geometry.type === "Polygon"
            ) {
              const shadowLength = effectiveHeight / Math.tan(sunAltitude);
              const sunDirectionBearing =
                ((sunAzimuth * 180) / Math.PI + 180) % 360;
              const shadowBearing = (sunDirectionBearing + 180) % 360;

              const originalCoords = feature.geometry.coordinates[0]; // Assuming single outer ring

              // 1. Shadow of vertical faces
              for (let i = 0; i < originalCoords.length; i++) {
                const p1 = originalCoords[i];
                const p2 = originalCoords[(i + 1) % originalCoords.length];

                const p1_proj = movePoint(
                  p1[0],
                  p1[1],
                  shadowLength,
                  shadowBearing
                );
                const p2_proj = movePoint(
                  p2[0],
                  p2[1],
                  shadowLength,
                  shadowBearing
                );

                // Create a quadrilateral for the vertical face shadow
                const verticalFaceShadow = turf.polygon([
                  [p1, p2, p2_proj, p1_proj, p1],
                ]);
                // Only add if it's a valid polygon with area
                if (verticalFaceShadow && verticalFaceShadow.geometry && verticalFaceShadow.geometry.type === 'Polygon' && turf.area(verticalFaceShadow) > 0) {
                    shadowFeatures.push(verticalFaceShadow);
                }
              }

              // 2. Shadow of the top face (projected base polygon)
              const projectedOriginalCoords = originalCoords.map((coord) =>
                movePoint(coord[0], coord[1], shadowLength, shadowBearing)
              );
              const topFaceShadow = turf.polygon([projectedOriginalCoords]);
              // Only add if it's a valid polygon with area
              if (topFaceShadow && topFaceShadow.geometry && topFaceShadow.geometry.type === 'Polygon' && turf.area(topFaceShadow) > 0) {
                  shadowFeatures.push(topFaceShadow);
              }
            }
          });

          map.current.getSource("shadows").setData({
            type: "FeatureCollection",
            features: shadowFeatures,
          });
        } else {
          map.current.getSource("shadows").setData({
            type: "FeatureCollection",
            features: [],
          });
        }
      };

      updateShadows();

      map.current.on("moveend", updateShadows);
      const intervalId = setInterval(updateShadows, 60 * 1000);

      return () => clearInterval(intervalId);
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom());
    });
  }, [lng, lat, zoom]);

  return (
    <div className='w-full h-full relative'>
      <div ref={mapContainer} className='w-full h-full' />
      <MapDebugInfo
        longitude={parseFloat(lng)}
        latitude={parseFloat(lat)}
        zoom={parseFloat(zoom)}
        userLocation={userLocation}
      />
      {map.current && (
        <ScaleController map={map.current} zoom={parseFloat(zoom)} />
      )}
      {map.current && userLocation && (
        <MoveCurrentLocationButton
          map={map.current}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}

export default MapContainer;
