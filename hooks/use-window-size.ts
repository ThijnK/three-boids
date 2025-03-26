import { useLayoutEffect, useState } from "react";

type WindowSize = {
  width: number | null;
  height: number | null;
};

const useWindowSize = () => {
  const [size, setSize] = useState<WindowSize>({
    width: null,
    height: null,
  });

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
};

export default useWindowSize;
