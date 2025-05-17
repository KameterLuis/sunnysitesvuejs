import { CapacitorHttp } from "@capacitor/core";

const PLACES_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function haversine({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 }) {
  const R = 6_371_000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Nearby search (legacy) */
export async function closeBySearch(lat, lng, radius, type = "restaurant") {
  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const { data } = await CapacitorHttp.get({
    url,
    params: {
      location: `${lat},${lng}`,
      radius: Math.round(radius).toString(),
      type,
      key: PLACES_KEY,
    },
    connectTimeout: 8000,
    readTimeout: 8000,
  });
  const json = typeof data === "string" ? JSON.parse(data) : data;

  if (json.status !== "OK") {
    // Google sends HTML for many errors – catch them early
    console.error("[Places] API error", json);
    return [];
  }
  return json.results;
}

export async function textSearch(query) {
  const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
  const { data } = await CapacitorHttp.get({
    url,
    params: {
      query,
      //...(lat && lng ? { location: `${lat},${lng}`, radius: "5000" } : {}),
      key: PLACES_KEY,
    },
    connectTimeout: 8000,
    readTimeout: 8000,
  });
  const json = typeof data === "string" ? JSON.parse(data) : data;

  if (json.status !== "OK") {
    // Google sends HTML for many errors – catch them early
    console.error("[Places] API error", json);
    return [];
  }
  return json.results;
}

export async function loadPOIsInView(map, searchPreference = "restaurant") {
  const mb = map.getBounds();
  const sw = mb.getSouthWest();
  const ne = mb.getNorthEast();
  const center = mb.getCenter();

  const diagonal = haversine(sw, ne);
  const radius = diagonal / 2;

  try {
    const rawPlaces = await closeBySearch(center.lat, center.lng, radius);
    console.log(searchPlaces);
    if (!rawPlaces.length) {
      console.warn("No POIs found in view");
      map
        .getSource("pois")
        ?.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    console.log("Raw places: ", rawPlaces.length);

    const inViewPlaces = rawPlaces.filter((p) => {
      const { lat, lng } = p.geometry.location;
      return mb.contains({ lat, lng });
    });

    console.log("Places in bounds: ", inViewPlaces);

    const unique = new Map();
    for (const p of inViewPlaces) {
      if (!unique.has(p.place_id)) unique.set(p.place_id, p);
    }

    console.log("Unique places: ", unique);

    const features = inViewPlaces.slice(0, 20).map((p) => ({
      type: "Feature",
      id: p.place_id,
      geometry: {
        type: "Point",
        coordinates: [p.geometry.location.lng, p.geometry.location.lat],
      },
      properties: {
        place_id: p.place_id,
        name: p.name,
        inShade: false,
        placeType: searchPreference,
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
  } catch (err) {
    console.error("❌ Places textSearch failed", err);
    return;
  }
}
