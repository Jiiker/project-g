import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import SunCalc from "suncalc";
import * as turf from "@turf/turf";
import MapDebugInfo from "./MapDebugInfo";
import MoveCurrentLocationButton from "./MoveCurrentLocationButton";
import ScaleController from "./ScaleController";
import PitchController from "./PitchController";
import TimeController from "./TimeController";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

import { movePoint } from "../../utils/mapUtils";

function MapContainer() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(126.978);
  const [lat, setLat] = useState(37.5665);
  const [zoom, setZoom] = useState(18);
  const [pitch, setPitch] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);

  const updateShadows = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const center = map.current.getCenter();
    const now = new Date();
    now.setHours(now.getHours() + timeOffset);

    const sunPos = SunCalc.getPosition(now, center.lat, center.lng);
    const sunAltitude = sunPos.altitude;
    const sunAzimuth = sunPos.azimuth;

    if (sunAltitude > 0) {
      const buildingFeatures = map.current.querySourceFeatures("composite", {
        sourceLayer: "building",
        filter: ["==", "extrude", "true"],
      });

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
          const sunDirectionBearing = ((sunAzimuth * 180) / Math.PI + 180) % 360;
          const shadowBearing = (sunDirectionBearing + 180) % 360;

          const originalCoords = feature.geometry.coordinates[0];

          for (let i = 0; i < originalCoords.length; i++) {
            const p1 = originalCoords[i];
            const p2 = originalCoords[(i + 1) % originalCoords.length];
            const p1_proj = movePoint(p1[0], p1[1], shadowLength, shadowBearing);
            const p2_proj = movePoint(p2[0], p2[1], shadowLength, shadowBearing);
            const verticalFaceShadow = turf.polygon([
              [p1, p2, p2_proj, p1_proj, p1],
            ]);
            if (verticalFaceShadow && verticalFaceShadow.geometry && verticalFaceShadow.geometry.type === 'Polygon' && turf.area(verticalFaceShadow) > 0) {
                shadowFeatures.push(verticalFaceShadow);
            }
          }

          const projectedOriginalCoords = originalCoords.map((coord) =>
            movePoint(coord[0], coord[1], shadowLength, shadowBearing)
          );
          const topFaceShadow = turf.polygon([projectedOriginalCoords]);
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
  }, [timeOffset]);

  useEffect(() => {
    if (map.current) {
      updateShadows();
    }
  }, [timeOffset, updateShadows]);


  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
      pitch: 0,
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 18,
            duration: 1000,
          });
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

    map.current.on("load", () => {
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

      map.current.addSource("shadows", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current.addLayer(
        {
          id: "shadow-layer",
          type: "fill",
          source: "shadows",
          paint: {
            "fill-color": "#000",
            "fill-opacity": 0.4,
          },
          minzoom: 15,
        },
        "3d-buildings"
      );

      updateShadows();

      map.current.on("moveend", updateShadows);
      const intervalId = setInterval(() => {
        if (timeOffset === 0) {
          updateShadows();
        }
      }, 60 * 1000);

      return () => clearInterval(intervalId);
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom());
      setPitch(map.current.getPitch());
    });
  }, []);

  const handlePitchChange = (newPitch) => {
    if (map.current) {
      map.current.setPitch(newPitch);
    }
  };

  return (
    <div className='w-full h-full relative'>
      <div ref={mapContainer} className='w-full h-full' />
      <MapDebugInfo
        longitude={parseFloat(lng)}
        latitude={parseFloat(lat)}
        zoom={parseFloat(zoom)}
        pitch={pitch}
        userLocation={userLocation}
      />
      <TimeController timeOffset={timeOffset} onTimeOffsetChange={setTimeOffset} />
      {map.current && (
        <ScaleController map={map.current} zoom={parseFloat(zoom)} />
      )}
      {map.current && userLocation && (
        <MoveCurrentLocationButton
          map={map.current}
          userLocation={userLocation}
        />
      )}
      {map.current && (
        <PitchController pitch={pitch} onPitchChange={handlePitchChange} />
      )}
    </div>
  );
}

export default MapContainer;
