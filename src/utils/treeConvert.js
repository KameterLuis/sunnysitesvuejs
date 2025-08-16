import { buffer, circle } from "@turf/turf";
import osmtogeojson from "osmtogeojson";

// Build a tiny bbox query around the map viewport
function overpassQLFromBounds(b) {
  const s = b.getSouth(),
    w = b.getWest(),
    n = b.getNorth(),
    e = b.getEast();
  return `
[out:json][timeout:25];
(
  node["natural"="tree"](${s},${w},${n},${e});
  way["barrier"="hedge"](${s},${w},${n},${e});
  way["landcover"="trees"](${s},${w},${n},${e});
  way["natural"="wood"](${s},${w},${n},${e});
  relation["landcover"="trees"](${s},${w},${n},${e});
  relation["natural"="wood"](${s},${w},${n},${e});
);
out body; >; out skel qt;
`;
}

export async function fetchVegetationFromOverpass(map) {
  const ql = overpassQLFromBounds(map.getBounds());
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: ql,
  });
  const json = await res.json();
  const fc = osmtogeojson(json);

  const trees = fc.features.filter(
    (f) => f.geometry.type === "Point" && f.properties?.natural === "tree"
  );

  const hedges = fc.features.filter(
    (f) =>
      (f.geometry.type === "LineString" ||
        f.geometry.type === "MultiLineString") &&
      f.properties?.barrier === "hedge"
  );

  const treePolygonsFromYourOwnTileset = fc.features
    .filter(
      (f) =>
        (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
        (f.properties?.landcover === "trees" ||
          f.properties?.natural === "wood")
    )
    .map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        height: f.properties.height ?? 10,
        min_height: 0,
        kind: "wood",
      },
    }));

  return { trees, hedges, treePolygonsFromYourOwnTileset };
}

function crownRadiusMeters(props) {
  const d = Number(props["diameter_crown"] ?? props["crown:diameter"]);
  if (d) return d / 2;
  const h = Number(props.height);
  if (h) return Math.max(2, 0.35 * h); // heuristic
  return 3.0; // fallback crown radius
}
function canopyBaseMeters(props) {
  const base = Number(props["crown:base"] ?? props["min_height"]);
  return Number.isFinite(base) ? base : 2.5; // trunk clearance
}
function canopyTopMeters(props) {
  const h = Number(props.height);
  if (Number.isFinite(h)) return h;
  return canopyBaseMeters(props) + 7; // heuristic canopy thickness
}

export function treePointToCanopyPoly(treePointFeature) {
  const r = crownRadiusMeters(treePointFeature.properties || {});
  const poly = circle(treePointFeature.geometry.coordinates, r, {
    steps: 16,
    units: "meters",
  });
  poly.properties = {
    height: canopyTopMeters(treePointFeature.properties || {}),
    min_height: canopyBaseMeters(treePointFeature.properties || {}),
    kind: "tree",
  };
  return poly;
}

export function hedgeLineToPoly(hedgeLineFeature) {
  const half = (Number(hedgeLineFeature.properties?.width) || 1.0) / 2;
  const poly = buffer(hedgeLineFeature, half, { units: "meters" });
  poly.properties = {
    height: Number(hedgeLineFeature.properties?.height) || 2.0,
    min_height: 0,
    kind: "hedge",
  };
  return poly;
}
