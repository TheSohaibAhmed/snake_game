"use client";
import { useCallback, useEffect, useState } from "react";

export default function MobileController (props) {
    const onTilt = props.onTilt;
    const [is_allowed, set_permission] = useState(false);
    // Callback to handle orientation coordinates
    const handleOrientation = useCallback((e) => {
        const {alpha, beta, gamma} = e;
        if (onTilt)  onTilt({ beta, gamma });
    }, []);
    
    // Request IOS &/or Android permissions first. 
    const request_permission = useCallback(async () => {
        const has_orientation =  typeof DeviceOrientationEvent !== undefined && typeof DeviceOrientationEvent.request_permission === "function"
        if (has_orientation) {
            const response = await DeviceOrientationEvent.request_permission();
            if (response === "granted") {
                window.addEventListener("deviceorientation", handleOrientation);
                 set_permission(true);
            }
        } else {
             // Non-iOS browsers (Android, desktop)
                window.addEventListener("deviceorientation", handleOrientation);
                set_permission(true);
        }
    }, [handleOrientation, is_allowed, set_permission])
   
   
    useEffect (() => {
        request_permission()
        return () => window.removeEventListener("deviceorientation", handleOrientation)
    }, [request_permission, handleOrientation])

    if (!is_allowed) {
        return (
      <button
        className="px-4 py-2 mt-4 text-white bg-blue-600 rounded"
        onClick={() =>
          DeviceOrientationEvent.requestPermission &&
          DeviceOrientationEvent.requestPermission().then((res) => {
            if (res === "granted") window.location.reload();
          })
        }
      >
        Enable Motion Controls
      </button>
    );
    }
     return null;


}