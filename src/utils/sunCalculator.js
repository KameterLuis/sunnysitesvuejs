import SunCalc from "suncalc";
import booleanIntersects from "@turf/boolean-intersects";
import { polygon, point } from "@turf/helpers";
import { destination } from "@turf/turf";

export function isSeatingInShade(seatingZone, buildingFeat, height, dateTime) {
  const quads = computeShadowQuads(buildingFeat, dateTime);
  if (quads.length === 0) {
    return true;
  }
  return quads.some((quad) => booleanIntersects(quad, seatingZone));
}

export function computeShadowQuads(buildingFeat, dateTime) {
  const props = buildingFeat.properties || {};
  const top = Number(props.height || props["height"] || 10);
  const base = Number(props.min_height || props["min_height"] || 0);
  const h = top - base;
  if (h <= 0) return [];
  let ring;
  if (buildingFeat.geometry.type === "Polygon") {
    ring = buildingFeat.geometry.coordinates[0];
  } else if (buildingFeat.geometry.type === "MultiPolygon") {
    ring = buildingFeat.geometry.coordinates[0][0];
  } else {
    return [];
  }

  const centroidPt = ring
    .reduce(
      (acc, [lng, lat]) => {
        acc[0] += lng;
        acc[1] += lat;
        return acc;
      },
      [0, 0]
    )
    .map((c) => c / ring.length);
  const [centLng, centLat] = centroidPt;
  const sun = SunCalc.getPosition(dateTime, centLat, centLng);
  if (sun.altitude <= 0) return [];

  const sunDeg = (sun.altitude * 180) / Math.PI;
  if (sunDeg < 3) return [];

  const L = h / Math.tan(sun.altitude);
  const az = ((sun.azimuth * 180) / Math.PI + 360) % 360;

  const quads = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const A = ring[i],
      B = ring[i + 1];
    const sA = destination(point(A), L, az, { units: "meters" });
    const sB = destination(point(B), L, az, { units: "meters" });
    quads.push(
      polygon([[A, B, sB.geometry.coordinates, sA.geometry.coordinates, A]])
    );
  }
  return quads;
}
