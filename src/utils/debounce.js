/**
 * 함수를 디바운스하여 지정된 시간(delay) 동안 호출되지 않으면 마지막 호출만 실행합니다.
 * @param {Function} func - 디바운스할 함수.
 * @param {number} delay - 함수 호출을 지연시킬 시간 (밀리초).
 * @returns {Function} 디바운스된 함수.
 */
export function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
}
