"use client";
import { useCallback, useEffect, useState } from "react";

export default function MobileController (props) {
    
    const onTilt = props.onTilt;
    const [is_allowed, set_permission] = useState(false);
    
    // You need to know how to decipher the coordinates.
    const handleOrientation = useCallback((e) => {
        const { alpha, beta, gamma } = e;
        let general = "portrait";

        // Determine general orientation
        if (Math.abs(beta) < 45 && Math.abs(gamma) > 45) {
            general = "landscape";
        } else if (Math.abs(beta) > 135) {
            general = "upside-down";
        } else if (Math.abs(beta) < 10 && Math.abs(gamma) < 10) {
            general = "flat";
        } else {
            general = "portrait";
        }
        if (props.orientation) props.orientation({general, alpha, beta, gamma})
    }, []);

    // GIVES ACCLERATION. {acceleration, accelerationIncludingGravity, rotationRate, interval}
    
    const handleMotion = useCallback (e => {
        const ROTATION_THRESHOLD = 0.1;
       if (!e.rotationRate) return; // no gyroscope available
       const { alpha, beta, gamma } = e.rotationRate;
       if (Math.abs(beta) > Math.abs(gamma)) {
            if (beta > ROTATION_THRESHOLD) {
                onTilt("down")
            } else if (beta < -ROTATION_THRESHOLD) {
                onTilt("up")
            } 
       } else {
            if (gamma > ROTATION_THRESHOLD) {
             onTilt("r")
            } else if (gamma < -ROTATION_THRESHOLD) {
                onTilt("l")
            }
       }
        
    },[])
    
    // Request IOS &/or Android permissions first. 
    const request_permission = useCallback(async () => {
        const has_orientation =  typeof DeviceOrientationEvent !== undefined && typeof DeviceOrientationEvent.request_permission === "function"
        const has_motion = typeof DeviceMotionEvent !== undefined && typeof DeviceMotionEvent.request_permission === "function"
        console.log("We have motion:", has_motion)
        if (has_motion) {
            const response = await DeviceMotionEvent.request_permission();
            if (response === "granted") {
                
                window.addEventListener("devicemotion", handleMotion);
                window.addEventListener("deviceorientation", handleOrientation);
                 set_permission(true);
            }
        } else {
             // Non-iOS browsers (Android, desktop)
                window.addEventListener("devicemotion", handleMotion);
                window.addEventListener("deviceorientation", handleOrientation);
                set_permission(true);
        }
    }, [handleOrientation, handleMotion, is_allowed, set_permission])
   
   
    useEffect (() => {
        request_permission()
        return () =>{
            window.removeEventListener("devicemotion", handleMotion);
            window.removeEventListener("deviceorientation", handleOrientation)}
    }, [request_permission, handleOrientation, handleMotion])

    if (!is_allowed) {
        
        return (
      <button
        onClick={() =>
          DeviceMotionEvent.requestPermission &&
          DeviceMotionEvent.requestPermission().then((res) => {
            if (res === "granted") {
                 window.location.reload();
                 
            }
           
          })
        }
      >
        Enable Motion Controls
      </button>
    );
    }
     return null;


}