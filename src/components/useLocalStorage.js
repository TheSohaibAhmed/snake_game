import { useEffect, useState, useCallback } from "react";

export default function useLocalStorageListener(key, defaultValue) {
    // read localstorage.
    const readValue = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      // if (item === null && defaultValue !== undefined) {
        
      //   localStorage.setItem(key, defaultValue);
      //   return defaultValue
      // }
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  // Sync state w/ local storage.
  const [value, setValue] = useState(readValue);

  // On change: update local storage.
    useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, defaultValue]);

  // sync localStorage & state
  const setAndStore = useCallback((new_value) => {
   
    function setter (prev_value) {
          const value = typeof new_value === "function"? new_value(prev):new_value;
          try {localStorage.setItem(key, JSON.stringify(value))}
          catch {}
          return value;
    }
    setValue(setter)
    }, [key])

    return [value, setAndStore];
}