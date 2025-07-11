/**
 * 주어진 경도, 위도, 거리, 방위각을 기반으로 새로운 지점의 경도와 위도를 계산하는 헬퍼 함수.
 * @param {number} lon - 시작 지점의 경도
 * @param {number} lat - 시작 지점의 위도
 * @param {number} distance - 이동할 거리 (미터)
 * @param {number} bearing - 이동할 방위각 (도, 북쪽 0도, 시계 방향)
 * @returns {number[]} - 새로운 지점의 [경도, 위도]
 */
export function movePoint(lon, lat, distance, bearing) {
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
