import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import useLocalStorageListener from "./useLocalStorage";

export default function Modal({ pause_play, reset, ended, state, children }) {
  const [isOpen, setOpen] = useLocalStorageListener("pause", true);
  console.log("Is open @ modal", isOpen)
 
  // modal receioves state
  // it's job is just to create the portal and close it.
  //needs to be mobile friendly

  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(null);
  
  const onClose = () => {if (isOpen) setOpen(false); pause_play() }
 
  const handle_keydown = useCallback(
    function handle_keydown(e) {
      if (e.key === "Escape" ) setOpen(!isOpen);
    },
    [onClose]
  );
  const handle_touch_start = (e) => {
    startYRef.current = e.touches[0].clientY
     setIsDragging(true);
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    if (deltaY > 0) setTranslateY(deltaY); // only drag downward
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 100) {
      // If dragged down enough, close modal
      onClose();
    } else {
      // Reset smoothly
      setTranslateY(0);
    }
  };
  
  const handle_stop = useCallback((e) => setOpen(false), []);

  useEffect(() => {
    document.addEventListener("keydown", handle_keydown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown",handle_keydown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handle_keydown]);

  useEffect(() => {
    if (ended && !isOpen)  setOpen(!isOpen);
  }, [ended, setOpen, isOpen])
  
  
  if (!isOpen) return null;

  const class_blurred_bg ="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40";
  const class_mobile_friendly_popup ="bg-black/90 rounded-t-2xl sm:rounded-lg shadow-lg p-6 w-full sm:w-[90%] sm:max-w-md transform transition-all duration-300 animate-fadeInUp fixed bottom-0 sm:relative";
  
  
    return createPortal(  <div className={class_blurred_bg} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={handle_stop}
        className={class_mobile_friendly_popup}
        onTouchStart={handle_touch_start}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{transform: `translateY(${translateY}px)`}}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center mb-2 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="overflow-y-auto max-h-[80vh] sm:max-h-[90vh]">
          {ended ? <div className="flex flex-col gap-4 h-full">
            <h2 className=" font-display text-2xl mx-auto text-center font-italic">Ooof!</h2>
            <h3>Final score: {(81 - state.speed)} /100</h3>
            <button className="animate-pulse" onClick={() => reset()}>Restart</button>
          </div>: <div className="flex flex-col gap-4 h-full">
            <h2 className="animate-pulse font-display text-2xl mx-auto text-center font-italic">Paused</h2>
            <button onClick={(e) => {e.stopPropagation(); pause_play(); setOpen(false)}}>Play</button>
            <button onClick={() =>{reset()}}>Restart</button>
          </div>}
        </div>
      </div>
     
    </div>, document.body);
}
