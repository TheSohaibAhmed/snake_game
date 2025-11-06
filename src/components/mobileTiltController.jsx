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
       
        const ROTATION_THRESHOLD = 40;
       if (!e.rotationRate) {
        alert("none") 
        return; // no gyroscope available
        }
        console.log(e.rotationRate)
       const { alpha, beta, gamma } = e.rotationRate;
       if (Math.abs(beta) > Math.abs(gamma)) {
            if (beta > ROTATION_THRESHOLD) {
                onTilt({...e, dir: "d"})
            } else if (beta < -ROTATION_THRESHOLD) {
                onTilt({...e, dir: "u"})
            } 
       } else {
            if (gamma > ROTATION_THRESHOLD) {
             onTilt({...e, dir: "r"})
            } else if (gamma < -ROTATION_THRESHOLD) {
                 onTilt({...e, dir: "l"})
            }
       }
        
    },[])
    
    // Request IOS &/or Android permissions first. 
    const request_permission = useCallback(async () => {
        const has_orientation =  typeof DeviceOrientationEvent !== undefined && typeof DeviceOrientationEvent.request_permission === "function"
        const has_motion = typeof DeviceMotionEvent !== undefined && typeof DeviceMotionEvent.request_permission === "function"
        console.log("We have motion:", has_motion)
        if (!has_motion) {
             DeviceMotionEvent.requestPermission().then((res) => {
                console.log("Requested res: ", res);
                set_permission(true);
                window.addEventListener("devicemotion", handleMotion);
                window.addEventListener("deviceorientation", handleOrientation)
             })
        }
        
    }, [handleOrientation, handleMotion, is_allowed, set_permission])
   
   
    useEffect (() => {
        if (!is_allowed) request_permission()
        return () =>{
            window.removeEventListener("devicemotion", handleMotion);
            window.removeEventListener("deviceorientation", handleOrientation)}
    }, [request_permission, handleOrientation, handleMotion, is_allowed])

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
     return <div><button
        onClick={() => {request_permission()}}
        onTouchStart={request_permission}
      >
        Enable Motion Controls
      </button></div>


}