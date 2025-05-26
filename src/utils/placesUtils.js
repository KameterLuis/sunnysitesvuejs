import centroid from "@turf/centroid";
import distance from "@turf/distance";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { point, lineString } from "@turf/helpers";
import { bearing, destination } from "@turf/turf";
import { computeShadowQuads, isSeatingInShade } from "./sunCalculator";

/**
 * @param {Object} map
 * @param {Array<GeoJSON.Feature<Point>>} places
 * @param {Object} date
 */
export function getPlacesAndStreetOutline(map, places, date) {
  const buildings = map.querySourceFeatures("streets-debug", {
    sourceLayer: "building",
    filter: ["==", ["get", "extrude"], "true"],
  });

  const roads = map.querySourceFeatures("streets-debug", {
    sourceLayer: "road",
  });

  places.forEach((place, i) => {
    const [lng, lat] = place.geometry.coordinates;
    const placePt = point([lng, lat]);
    const bestB = findClosestByCentroid(buildings, placePt);
    if (!bestB) return;
    if (!roads.length) {
      console.warn(`Place ${i}: no nearby roads—skipping shade test.`);
      return;
    }

    const bCtrPt = centroid(bestB);
    const bestR = findClosestBySnap(roads, bCtrPt);
    if (!bestR) return;

    const façadeFeat = findFacadeEdge(bestB, bestR);
    if (!façadeFeat) return;
    const seatingZone = extrudeSeatingZone(façadeFeat, bestR, 2);

    const height = bestB.properties.height;
    if (!height) return;

    const inShade = isSeatingInShade(seatingZone, bestB, height, date);

    places[i].properties.inShade = inShade;

    map.setFeatureState(
      { source: "pois", id: places[i].properties.place_id },
      { inShade }
    );

    const quads = computeShadowQuads(bestB, date);

    const srcId = `shadow-quads-src-${i}`;
    const layerId = `shadow-quads-fill-${i}`;
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(srcId)) map.removeSource(srcId);

    map.addSource(srcId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: quads },
    });

    place.bestBuilding = bestB;
    place.bestRoad = bestR;
  });
}

function findClosestByCentroid(features, pt) {
  let best = null,
    bestD = Infinity;
  for (const feat of features) {
    const ctrPt = centroid(feat);
    const d = distance(pt, ctrPt, { units: "meters" });
    if (d < bestD) {
      bestD = d;
      best = feat;
    }
  }
  return best;
}

function findClosestBySnap(features, pt) {
  let best = null,
    bestD = Infinity;

  for (const feat of features) {
    const geomType = feat.geometry.type;
    if (geomType !== "LineString" && geomType !== "MultiLineString") {
      continue;
    }

    try {
      const snap = nearestPointOnLine(feat, pt, { units: "meters" });
      const d = snap.properties.dist;
      if (d < bestD) {
        bestD = d;
        best = feat;
      }
    } catch (err) {
      console.warn("Skipping invalid road feature in snap:", err);
    }
  }
  return best;
}

/**
 * @param {Feature<Polygon|MultiPolygon>} buildingFeat
 * @param {Feature<LineString|MultiLineString>} roadFeat
 * @returns {Feature<LineString>|null}
 */
export function findFacadeEdge(buildingFeat, roadFeat) {
  let ring;
  const geom = buildingFeat.geometry;
  if (geom.type === "Polygon") {
    ring = geom.coordinates[0];
  } else if (geom.type === "MultiPolygon") {
    ring = geom.coordinates[0][0];
  } else {
    console.warn("Unsupported building geometry:", geom.type);
    return null;
  }

  let bestEdge = null;
  let minDist = Infinity;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    const mid = [(lng1 + lng2) / 2, (lat1 + lat2) / 2];

    const snapped = nearestPointOnLine(roadFeat, point(mid), {
      units: "meters",
    });
    const d = snapped.properties.dist;

    if (d < minDist) {
      minDist = d;
      bestEdge = [
        [lng1, lat1],
        [lng2, lat2],
      ];
    }
  }

  if (!bestEdge) {
    console.warn("No façade edge found (minDist stayed ∞)");
    return null;
  }

  return lineString(bestEdge);
}

/**
 * @param {Feature<LineString>} façadeFeat
 * @param {Feature<LineString|MultiLineString>} roadFeat
 * @param {number} offset
 * @returns {Feature<LineString>}
 */
export function extrudeSeatingZone(façadeFeat, roadFeat, offset = 2) {
  const [[lng1, lat1], [lng2, lat2]] = façadeFeat.geometry.coordinates;

  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const midPt = point([midLng, midLat]);

  const snapped = nearestPointOnLine(roadFeat, midPt, { units: "meters" });

  const roadBearing = bearing(midPt, snapped);

  const seatA = destination(point([lng1, lat1]), offset, roadBearing, {
    units: "meters",
  });
  const seatB = destination(point([lng2, lat2]), offset, roadBearing, {
    units: "meters",
  });

  return lineString([seatA.geometry.coordinates, seatB.geometry.coordinates]);
}
