import React, { useEffect } from "react";

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;

      setMousePosition({
        x: ev.clientX - width / 2,
        y: ev.clientY - height / 2,
      });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return { ...mousePosition };
};

export default useMousePosition;
