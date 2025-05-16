export function waitForGoogleMaps() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject("timeout"), 10000);
    const handle = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(handle);
        clearTimeout(timeout);
        resolve();
      }
    }, 300);
  });
}

export function closeBySearch(request, placesService) {
  if (!placesService) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}

export function textSearch(request, placesService) {
  if (!placesService) return;
  return new Promise((resolve, reject) => {
    placesService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}

export async function loadPOIsInView(
  map,
  placesService,
  searchPreference = "restaurant"
) {
  const mb = map.getBounds();
  const sw = mb.getSouthWest();
  const ne = mb.getNorthEast();
  const center = mb.getCenter();
  /*const gBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(sw.lat, sw.lng),
    new google.maps.LatLng(ne.lat, ne.lng)
  );*/
  const diagonal = google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(sw.lat, sw.lng),
    new google.maps.LatLng(ne.lat, ne.lng)
  );
  const radius = Math.min(diagonal / 2, 5000);

  let rawPlaces = [];
  try {
    /*const [cafes, restaurants] = await Promise.all([
      textSearch({ bounds: gBounds, query: "restaurant" }, placesService),
      textSearch({ bounds: gBounds, query: "cafe" }, placesService),
    ]);
    rawPlaces = [...cafes, ...restaurants];
    const [searchPlaces] = await Promise.all([
      textSearch({ bounds: gBounds, query: searchPreference }, placesService),
    ]);*/
    const [searchPlaces] = await Promise.all([
      closeBySearch(
        {
          location: new google.maps.LatLng(center.lat, center.lng),
          radius, // metres
          type: searchPreference, // “cafe” | “restaurant” | “bar”
        },
        placesService
      ),
    ]);
    rawPlaces = [...searchPlaces];
  } catch (err) {
    console.error("❌ Places textSearch failed", err);
    return;
  }

  if (!rawPlaces.length) {
    console.warn("No POIs found in view");
    map.getSource("pois")?.setData({ type: "FeatureCollection", features: [] });
    return;
  }

  console.log("Raw places: ", rawPlaces.length);

  const inViewPlaces = rawPlaces.filter((p) => {
    const lat = p.geometry.location.lat();
    const lng = p.geometry.location.lng();
    return mb.contains({ lat, lng });
  });

  console.log("Places in bounds: ", inViewPlaces);

  const unique = new Map();
  for (const p of inViewPlaces) {
    if (!unique.has(p.place_id)) unique.set(p.place_id, p);
  }

  console.log("Unique places: ", unique);

  const places = Array.from(unique.values()).slice(0, 20);

  const features = places.map((p) => ({
    type: "Feature",
    id: p.place_id,
    geometry: {
      type: "Point",
      coordinates: [p.geometry.location.lng(), p.geometry.location.lat()],
    },
    properties: {
      place_id: p.place_id,
      name: p.name,
      inShade: false,
      placeType: searchPreference,
      /*placeType: p.types.includes("bar")
        ? "bar"
        : p.types.includes("cafe")
        ? "cafe"
        : "restaurant",*/
    },
  }));

  const fc = {
    type: "FeatureCollection",
    features,
  };

  const poisSource = map.getSource("pois");
  if (!poisSource) {
    console.warn("Source pois not found, skipping POI load");
    return;
  }
  poisSource.setData(fc);

  //console.log(`[Mapbox] Fetched ${places.length} places`);

  map.getSource("pois").setData({
    type: "FeatureCollection",
    features,
  });

  return features;
}
