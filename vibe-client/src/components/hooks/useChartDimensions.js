import { useState, useEffect, useRef } from 'react';

export const useChartDimensions = (defaultWidth = 400, defaultHeight = 300) => {
  const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const computedStyle = window.getComputedStyle(containerRef.current);
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        
        const availableWidth = Math.max(offsetWidth - paddingX, defaultWidth);
        const availableHeight = Math.max(offsetHeight - paddingY, defaultHeight);
        
        if (availableWidth > 0 && availableHeight > 0) {
          setDimensions({
            width: availableWidth,
            height: availableHeight
          });
          setIsReady(true);
        }
      }
    };

    // Multiple attempts to get dimensions
    const timers = [
      setTimeout(updateDimensions, 100),
      setTimeout(updateDimensions, 300),
      setTimeout(updateDimensions, 500)
    ];

    // Add resize listener
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      resizeObserver.disconnect();
    };
  }, [defaultWidth, defaultHeight]);

  return { dimensions, isReady, containerRef };
};