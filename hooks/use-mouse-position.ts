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
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;

      setPos({
        x: ev.clientX - width / 2,
        y: ev.clientY - height / 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return pos;
};

export default useMousePosition;
