import { useState, useEffect } from "react";
export default function useScreenOrientation() {
  const [orientation, setOrientation] = useState(
    window.screen.orientation?.type || "unknown"
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.screen.orientation?.type || "unknown");
    };

    const orientationObj = window.screen.orientation;

    if (orientationObj) {
      orientationObj.addEventListener("change", handleOrientationChange);
    } else {
      // Fallback for browsers that don't support the Screen Orientation API
      window.addEventListener("orientationchange", handleOrientationChange);
    }

    return () => {
      if (orientationObj) {
        orientationObj.removeEventListener("change", handleOrientationChange);
      } else {
        window.removeEventListener("orientationchange", handleOrientationChange);
      }
    };
  }, []);

  return orientation;
}