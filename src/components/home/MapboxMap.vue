<template>
  <div id="map" ref="mapContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import BuildingShadows from "@/utils/BuildingShadows";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { defineEmits, onBeforeUnmount, onMounted, ref } from "vue";
import { loadPOIsInView } from "../../utils/mapboxAPI";
import { computeShadowQuads } from "../../utils/sunCalculator";
import { Toast } from "@capacitor/toast";
import {
  add3DBuildingsLayer,
  addDebugLayer,
  addPOILayer,
} from "../../utils/mapUtils";
import { Geolocation } from "@capacitor/geolocation";
import {
  getPlacesAndStreetOutline,
  findFacadeEdge,
  extrudeSeatingZone,
} from "../../utils/placesUtils";
import { booleanIntersects } from "@turf/turf";

const emit = defineEmits(["hideSearchbar", "searchLocation", "searchHereNow"]);

const mapContainer = ref(null);
let map = null;
let marker = null;
let searchPreference = ref("restaurant");
let positionMarker = null;
let longitude = ref(0);
let latitude = ref(0);
let buildingShadows = null;
let features = null;
let date = new Date();

const setCoordinates = (newLongitude, newLatitude, zoom = true) => {
  longitude.value = newLongitude;
  latitude.value = newLatitude;
  if (map) {
    if (zoom) {
      map.easeTo({
        center: [longitude.value, latitude.value],
        zoom: 16,
        duration: 1500,
        bearing: 0,
      });
    } else {
      map.easeTo({
        center: [longitude.value, latitude.value],
        duration: 1500,
        bearing: 0,
      });
    }
  }
};

const changePreference = (preference) => {
  searchPreference.value = preference;
  updatePOIS();
};

const updatePositionMarker = (long, lat) => {
  if (!positionMarker) {
    const el = document.createElement("div");
    el.className = "user-marker";
    positionMarker = new mapboxgl.Marker(el).setLngLat([long, lat]).addTo(map);
  } else {
    positionMarker.setLngLat([long, lat]);
  }
};

const updateMarker = (long, lat) => {
  if (!long || !lat) {
    if (marker) marker.remove();
  }
  if (!marker) {
    marker = new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
  } else {
    marker.setLngLat([long, lat]);
  }
};

function debounce(fn, wait = 100) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

const updateShadows = () => {
  if (!features || !date) return;

  features.forEach((place, i) => {
    const { bestBuilding: B, bestRoad: R } = place;
    if (!B || !R) return;

    const façade = findFacadeEdge(B, R);
    const seatingZone = extrudeSeatingZone(façade, R, 2);

    const quads = computeShadowQuads(B, date);
    map.getSource(`shadow-quads-src-${i}`).setData({
      type: "FeatureCollection",
      features: quads,
    });

    let inShade = quads.some((q) => booleanIntersects(q, seatingZone));
    if (quads.length === 0) inShade = true;
    place.properties.inShade = inShade;
  });

  map.getSource("pois").setData({
    type: "FeatureCollection",
    features: features,
  });
};

const debouncedUpdateShadows = debounce(updateShadows, 100);

const setDate = (dt) => {
  date = dt;
  if (!buildingShadows) return;
  buildingShadows.setDate(dt);
  debouncedUpdateShadows();
};

async function showNativeToast(message, duration = "short") {
  await Toast.show({ text: message, duration, position: "center" });
}

const addFeature = (feature, type) => {
  let newFeature = {
    type: "Feature",
    id: feature.id,
    geometry: {
      type: "Point",
      coordinates: [feature.lng, feature.lat],
    },
    properties: {
      lng: feature.lng,
      lat: feature.lat,
      place_id: feature.id,
      name: feature.name,
      inShade: false,
      placeType: type,
      website: "",
      address: feature.address,
      opening_hours: "",
    },
  };
  if (features && features.length) {
    features.push(newFeature);
  } else {
    features = [newFeature];
  }

  const fc = { type: "FeatureCollection", features };
  const src = map.getSource("pois");
  if (!src) {
    console.warn('Source "pois" not found, skipping POI load');
    return;
  }
  src.setData(fc);

  getPlacesAndStreetOutline(map, features, date);
  debouncedUpdateShadows();
};

const updatePOIS = async () => {
  features = await loadPOIsInView(
    map,
    import.meta.env.VITE_MAPBOX_MAPS_API_KEY,
    searchPreference.value
  );
  if (features) {
    getPlacesAndStreetOutline(map, features, date);
  } else {
    showNativeToast(`No ${searchPreference.value} nearby`, "long");
  }
  debouncedUpdateShadows();
};

onMounted(() => {
  initMap();
});

function initMap() {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_MAPS_API_KEY;
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [longitude.value, latitude.value],
    zoom: 16,
    preserveDrawingBuffer: true,
  });
  map.addControl(new mapboxgl.AttributionControl(), "top-left");

  buildingShadows = new BuildingShadows(new Date());

  map.once("load", () => {
    add3DBuildingsLayer(map);
    console.log("[Mapbox] 3D buildings layer added");
    map.addLayer(buildingShadows, "3d-buildings");
    console.log("[Mapbox] Shadow layer added");
    addDebugLayer(
      map,
      "streets-debug",
      "vector",
      "mapbox://mapbox.mapbox-streets-v8"
    );
    addPOILayer(map, emit);
    map.resize();
    console.log("[Mapbox] POI layer added");
    geolocateAndCenter();
    setTimeout(async () => {
      updatePOIS();
    }, 2000);
  });
  map.on("click", () => {
    emit("hideSearchResult");
  });
  const startUpTimer = Date.now();
  map.on("moveend", async () => {
    if (Date.now() - startUpTimer > 3000) {
      emit("searchHereNow");
    }
  });
  map.on("resize", () => {
    map.removeLayer("building-shadows");
    map.addLayer(buildingShadows, "3d-buildings");
  });
}

const watchId = ref();

const startTracking = async () => {
  watchId.value = await Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      minimumUpdateInterval: 1000,
      distanceFilter: 2,
    },
    (position, err) => {
      if (err) {
        console.error("watch error", err);
        return;
      }
      if (position) {
        latitude.value = position.coords.latitude;
        longitude.value = position.coords.longitude;
        updatePositionMarker(longitude.value, latitude.value);
      }
    }
  );
};

async function geolocateAndCenter() {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000,
    });
    const coords = [pos.coords.longitude, pos.coords.latitude];
    latitude.value = coords[1];
    longitude.value = coords[0];
    updatePositionMarker(longitude.value, latitude.value);
    setCoordinates(longitude.value, latitude.value);
    console.log("[Mapbox] Set map to center");
    startTracking();
  } catch (e) {
    console.warn("Geolocation failed", e);
  }
}

onBeforeUnmount(async () => {
  if (watchId.value) Geolocation.clearWatch({ id: watchId.value });
});

defineExpose({
  setCoordinates,
  setDate,
  updateMarker,
  changePreference,
  addFeature,
});
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>
