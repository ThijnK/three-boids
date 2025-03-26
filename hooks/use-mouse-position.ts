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

  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      setPos({
        x: ev.clientX,
        y: ev.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return pos;
};

export default useMousePosition;
