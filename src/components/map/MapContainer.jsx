import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import SunCalc from "suncalc";
import * as turf from "@turf/turf";
import MapDebugInfo from "./MapDebugInfo";
import MoveCurrentLocationButton from "./MoveCurrentLocationButton";
import ScaleController from "./ScaleController";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper function to move a point by a given distance and bearing
function movePoint(lon, lat, distance, bearing) {
  const R = 6378137; // Earth's radius in meters
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

function MapContainer() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(126.978); // Seoul longitude
  const [lat, setLat] = useState(37.5665); // Seoul latitude
  const [zoom, setZoom] = useState(14);
  const [userLocation, setUserLocation] = useState(null); // New state for user's location

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // Optionally, center the map on the user's location
          map.current.flyTo({ center: [longitude, latitude], zoom: 14 });

          // Add a marker for the user's location
          new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Handle error (e.g., show a message to the user)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

    map.current.on("load", () => {
      // Add 3D buildings layer
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

      // Add shadow source and layer
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
          minzoom: 16,
        },
        "3d-buildings"
      ); // Place shadow layer below 3d-buildings

      // Function to update shadows
      const updateShadows = () => {
        const center = map.current.getCenter();
        const now = new Date();
        const sunPos = SunCalc.getPosition(now, center.lat, center.lng);

        // Sun altitude and azimuth in radians
        const sunAltitude = sunPos.altitude;
        const sunAzimuth = sunPos.azimuth;

        // Only draw shadows if sun is above horizon
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
              const shadowBearing = ((sunAzimuth * 180) / Math.PI + 180) % 360;

              const originalCoords = feature.geometry.coordinates[0];

              const allPoints = [];

              originalCoords.forEach((coord) => {
                allPoints.push(turf.point(coord));
                const projectedCoord = movePoint(
                  coord[0],
                  coord[1],
                  shadowLength,
                  shadowBearing
                );
                allPoints.push(turf.point(projectedCoord));
              });

              const pointsFeatureCollection = turf.featureCollection(allPoints);
              const convexHull = turf.convex(pointsFeatureCollection);

              if (convexHull) {
                shadowFeatures.push(convexHull);
              }
            }
          });

          map.current.getSource("shadows").setData({
            type: "FeatureCollection",
            features: shadowFeatures,
          });
        } else {
          // If sun is below horizon, clear shadows
          map.current.getSource("shadows").setData({
            type: "FeatureCollection",
            features: [],
          });
        }
      };

      // Initial shadow update
      updateShadows();

      // Update shadows on map move and periodically
      map.current.on("moveend", updateShadows);
      const intervalId = setInterval(updateShadows, 60 * 1000); // Update every minute

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
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
