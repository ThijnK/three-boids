import { useEffect, useState } from "react";

type MousePosition = {
  x: number;
  y: number;
};

const useMousePosition = () => {
  const [pos, setPos] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [windowVisible, setWindowVisible] = useState<boolean>(true);

  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      setPos({
        x: ev.clientX,
        y: ev.clientY,
      });
    };

    const handleVisibilityChange = () => {
      setWindowVisible(!document.hidden);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { ...pos, windowVisible };
};

export default useMousePosition;
