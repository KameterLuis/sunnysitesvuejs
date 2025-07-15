import axios from "axios";
import rbush from "rbush";

function norm(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ß]/g, "ss")
    .replace(/[’'`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mbName(feature) {
  return norm(
    feature.properties?.name ??
      feature.text ??
      feature.place_name?.split(",")[0] ??
      ""
  );
}

function dice(a, b) {
  if (!a || !b) return 0;
  const bigrams = (s) =>
    new Set([...Array(s.length - 1)].map((_, i) => s.slice(i, i + 2)));
  const A = bigrams(a);
  const B = bigrams(b);
  const overlap = [...A].filter((x) => B.has(x)).length;
  return (2 * overlap) / (A.size + B.size);
}

function buildIndex(osmElems) {
  const items = osmElems.flatMap((el) => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) return []; // skip invalid
    return [
      {
        minX: lon,
        minY: lat,
        maxX: lon,
        maxY: lat,
        lat,
        lon,
        tags: el.tags,
        id: el.id,
      },
    ];
  });
  return new rbush().load(items);
}

function distM(lat1, lon1, lat2, lon2) {
  const R = 6371000; // earth radius
  const φ1 = (lat1 * Math.PI) / 180,
    φ2 = (lat2 * Math.PI) / 180;
  const dφ = ((lat2 - lat1) * Math.PI) / 180;
  const dλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pickBestMatch(feature, idx) {
  const [lon, lat] = feature.geometry.coordinates;
  //const nameMb = norm(feature.text);
  const nameMb = mbName(feature);

  const delta = 0.0015;

  const near = idx.search({
    minX: lon - delta,
    minY: lat - delta,
    maxX: lon + delta,
    maxY: lat + delta,
  });

  let best;
  let bestScore = -Infinity;

  for (const c of near) {
    const metres = distM(lat, lon, c.lat, c.lon);
    if (!c.tags) continue;
    const sim = dice(nameMb, norm(c.tags.name));
    const dScore = Math.max(0, 1 - metres / 130);
    const score = sim * 0.7 + dScore * 0.3;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best && bestScore >= 0.55
    ? { best, confidence: bestScore } // ← remove .toFixed(2)
    : null;
}

async function fetchDiningObjects(s, w, n, e) {
  /*const q = `
  [out:json][timeout:60];
  (
    node["outdoor_seating"="yes"](${s},${w},${n},${e});
    way ["outdoor_seating"="yes"](${s},${w},${n},${e});
    node["leisure"="outdoor_seating"](${s},${w},${n},${e});
    way ["leisure"="outdoor_seating"](${s},${w},${n},${e});
  );
  out center tags;
`;*/

  const q = `
  [out:json][timeout:60];
  (
    node["outdoor_seating"!="no"](${s},${w},${n},${e});
    way["outdoor_seating"!="no"](${s},${w},${n},${e});
    relation["outdoor_seating"!="no"](${s},${w},${n},${e});
  );
  out center tags;`;

  const response = await axios.get("https://overpass-api.de/api/interpreter", {
    params: { data: q },
  });
  const { data } = response;
  return data.elements;
}

export async function addSeating(features, bbox) {
  const s = bbox.getSouth();
  const w = bbox.getWest();
  const n = bbox.getNorth();
  const e = bbox.getEast();

  const osm = await fetchDiningObjects(s, w, n, e);
  const idx = buildIndex(osm);

  const [lon0, lat0] = features[0].geometry.coordinates;
  const nearby = idx
    .search({
      minX: lon0 - 0.002,
      minY: lat0 - 0.002,
      maxX: lon0 + 0.002,
      maxY: lat0 + 0.002,
    })
    .slice(0, 5);

  for (const f of features) {
    if (f.properties.name == "il Concetto") {
      //console.log(f);
    }
    const match = pickBestMatch(f, idx);
    if (match) {
      const { best } = match;
      const hasOutdoor =
        best.tags.outdoor_seating !== "no" ||
        best.tags.leisure === "outdoor_seating";
      f.properties.outdoor_seating = hasOutdoor;
      f.properties.osm_id = best.id;
      f.properties.match_conf = match.confidence.toFixed(2);
      if (f.properties.name == "il Concetto") {
        //console.log(f);
      }
    } else {
      f.properties.outdoor_seating = null;
    }
  }
  return features;
}

export async function addSeatingSingle(feature) {
  const coords = feature.geometry.coordinates;
  const long = coords[0];
  const lat = coords[1];

  const delta = 0.002;

  const s = lat - delta;
  const w = long - delta;
  const n = lat + delta;
  const e = long + delta;

  const osm = await fetchDiningObjects(s, w, n, e);
  const idx = buildIndex(osm);

  const [lon0, lat0] = feature.geometry.coordinates;
  const nearby = idx
    .search({
      minX: lon0 - delta,
      minY: lat0 - delta,
      maxX: lon0 + delta,
      maxY: lat0 + delta,
    })
    .slice(0, 5);

  const match = pickBestMatch(feature, idx);

  if (match) {
    const { best } = match;
    const hasOutdoor =
      best.tags.outdoor_seating !== "no" ||
      best.tags.leisure === "outdoor_seating";
    feature.properties.outdoor_seating = hasOutdoor;
    feature.properties.osm_id = best.id;
    feature.properties.match_conf = match.confidence.toFixed(2);
  } else {
    feature.properties.outdoor_seating = null;
  }

  return feature;
}
