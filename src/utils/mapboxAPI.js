function haversineMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get one feature (coords + full props) by its mapbox_id
 * @param id            mapbox_id string (from /suggest or /category)
 * @param token         your Mapbox public access token
 * @param sessionToken  the same UUID you used for /suggest   (optional)
 */
export async function getFeatureById(id, token, sessionToken) {
  const qs = new URLSearchParams({ access_token: token });
  if (sessionToken) qs.set("session_token", sessionToken);

  const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
    id
  )}?${qs}`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Retrieve failed: ${res.status} ${await res.text()}`);

  const json = await res.json(); // GeoJSON FeatureCollection
  return json.features[0]; // the single Feature object
}

export async function loadPOIsInView(
  map,
  accessToken,
  searchPreference = "restaurant"
) {
  const b = map.getBounds();
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  const ctr = b.getCenter();

  const diagonal = haversineMetres(sw.lat, sw.lng, ne.lat, ne.lng);
  const radius = Math.min(diagonal / 2, 5_000);

  const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`; // <—
  const params = new URLSearchParams({
    access_token: accessToken,
    proximity: `${ctr.lng},${ctr.lat}`, // keeps results sorted by distance
    bbox, // hard filter = viewport
    limit: "25", // max the API will return
  });

  const url = `https://api.mapbox.com/search/searchbox/v1/category/${encodeURIComponent(
    searchPreference
  )}?${params}`;

  let resp;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    resp = await r.json();
  } catch (err) {
    console.error("❌ Mapbox category search failed", err);
    return;
  }

  const raw = resp.features ?? [];
  if (!raw.length) {
    console.warn("No POIs found in view");
    map.getSource("pois")?.setData({ type: "FeatureCollection", features: [] });
    return;
  }

  const inView = raw.filter((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return (
      haversineMetres(ctr.lat, ctr.lng, lat, lng) <= radius &&
      b.contains({ lng, lat })
    );
  });

  const unique = new Map();
  for (const f of inView)
    if (!unique.has(f.properties.mapbox_id))
      unique.set(f.properties.mapbox_id, f);

  const places = Array.from(unique.values()).slice(0, 20);

  const features = places.map((f) => {
    let website = "";
    let opening_hours = "";
    try {
      website = f.properties.metadata.website;
      opening_hours = f.properties.metadata.open_hours;
    } catch {
      console.log("No website or opening hours for " + f.properties.name);
    }
    return {
      type: "Feature",
      id: f.properties.mapbox_id,
      geometry: {
        type: "Point",
        coordinates: f.geometry.coordinates,
      },
      properties: {
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        place_id: f.properties.mapbox_id,
        name: f.properties.name,
        inShade: false,
        placeType: searchPreference,
        website: website,
        address: f.properties.full_address,
        opening_hours: opening_hours,
      },
    };
  });

  const fc = { type: "FeatureCollection", features };

  const src = map.getSource("pois");
  if (!src) {
    console.warn('Source "pois" not found, skipping POI load');
    return;
  }
  src.setData(fc);

  return features;
}
