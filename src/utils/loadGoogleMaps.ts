let googleMapsLoaded = false;

export function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

/*export function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      console.log("✅ Google Maps API already loaded");
      resolve();
      return;
    }

    if (googleMapsLoaded) {
      console.log("🔄 Google Maps script is already being loaded");
      return;
    }

    googleMapsLoaded = true;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject("❌ Google Maps API Key is missing!");
      return;
    }

    // Attach callback function
    (window as any).initGoogleMaps = () => {
      console.log("✅ Google Maps API is now fully loaded!");
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = (e: any) => {
      console.error("Google Maps load failed:", e?.message || e);
      reject(e);
    };
    /*script.onerror = (error) => {
      googleMapsLoaded = false;
      reject(error);
    };

    document.head.appendChild(script);
  });
}*/
