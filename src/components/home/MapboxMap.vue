<template>
  <div id="map" ref="mapContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import BuildingShadows from "@/utils/BuildingShadows";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { defineEmits, onMounted, ref } from "vue";
import { waitForGoogleMaps, loadPOIsInView } from "../../utils/googleMapsUtils";
import { computeShadowQuads } from "../../utils/sunCalculator";
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

const emit = defineEmits(["hideSearchbar", "searchLocation"]);

const mapContainer = ref(null);
let map = null;
let marker = null;
let searchPreference = ref("restaurant");
let positionMarker = null;
let longitude = ref(0);
let latitude = ref(0);
let buildingShadows = null;
let placesService;
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

const initGoogle = () => {
  const dummy = document.createElement("div");
  placesService = new google.maps.places.PlacesService(dummy);
};

const updatePOIS = async () => {
  features = await loadPOIsInView(map, placesService, searchPreference.value);
  if (features) {
    getPlacesAndStreetOutline(map, features, date);
  }
};

onMounted(() => {
  waitForGoogleMaps()
    .then(initGoogle)
    .then(initMap)
    .catch((err) => {
      console.error("❌ Google Maps failed to load", err);
    });
});

function initMap() {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoic3VubnlzaXRlcyIsImEiOiJjbTQ4OGlvejcwaW1oMmpzb3h5czZuYzB5In0.quI2qPhurNfI1_j-mfuyDw";
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [longitude.value, latitude.value],
    zoom: 16,
    preserveDrawingBuffer: true,
  });

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
    console.log("[Mapbox] POI layer added");
    geolocateAndCenter();
    setTimeout(async () => {
      updatePOIS();
    }, 1000);
  });
  map.on("click", () => {
    emit("hideSearchResult");
  });
  map.on("moveend", async () => {
    //emit("hideSearchbar");
    updatePOIS();
  });
  map.on("resize", () => {
    map.removeLayer("building-shadows");
    map.addLayer(buildingShadows, "3d-buildings");
  });
}

async function geolocateAndCenter() {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    const coords = [pos.coords.longitude, pos.coords.latitude];
    latitude.value = coords[1];
    longitude.value = coords[0];
    updatePositionMarker(longitude.value, latitude.value);
    setCoordinates(longitude.value, latitude.value);
    console.log("[Mapbox] Set map to center");
  } catch (e) {
    console.warn("Geolocation failed", e);
  }
}

defineExpose({
  setCoordinates,
  setDate,
  updateMarker,
  changePreference,
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
