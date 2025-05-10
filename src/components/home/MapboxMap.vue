<template>
  <div id="map" ref="mapContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import BuildingShadows from "@/utils/BuildingShadows";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Geolocation } from "@capacitor/geolocation";

import { defineEmits, onMounted, ref } from "vue";

const emit = defineEmits(["hideSearchbar"]);

const mapContainer = ref(null);
let map = null;
let marker = null;
let positionMarker = null;
let longitude = ref(0);
let latitude = ref(0);
let buildingShadows = null;
let placesService;

const setCoordinates = (newLongitude, newLatitude) => {
  longitude.value = newLongitude;
  latitude.value = newLatitude;
  if (map) {
    map.easeTo({
      center: [longitude.value, latitude.value],
      zoom: 16,
      duration: 1500,
      bearing: 0,
    });
  }
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

const setDate = (date) => {
  buildingShadows.setDate(date);
  map.triggerRepaint();
  updatePOIShading();
};

const initGoogle = () => {
  const dummy = document.createElement("div");
  placesService = new google.maps.places.PlacesService(dummy);
};

const textSearch = (request) => {
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
};

function updatePOIShading() {
  // 1) Hide POIs so we sample only shadows
  map.setLayoutProperty("pois-symbols", "visibility", "none");

  // 2) Once everything’s drawn…
  map.once("render", () => {
    const gl = map.painter.context.gl;
    const dpr = window.devicePixelRatio;
    const dbw = gl.drawingBufferWidth;
    const dbh = gl.drawingBufferHeight;
    const cssW = map.getContainer().clientWidth;
    const cssH = map.getContainer().clientHeight;
    const src = map.getSource("pois");
    const features = src._data.features;

    features.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates;
      // 3) Only bother if it’s in the viewport
      if (!map.getBounds().contains([lng, lat])) {
        feat.properties.inShade = false;
        return;
      }
      // 4) Project to CSS-pixel coords
      const p = map.project([lng, lat]);
      let cssX = Math.floor(p.x);
      let cssY = Math.floor(p.y);
      // clamp CSS coords
      cssX = Math.min(Math.max(cssX, 0), cssW - 1);
      cssY = Math.min(Math.max(cssY, 0), cssH - 1);

      // 5) Convert to WebGL backbuffer coords
      let x = Math.floor(cssX * dpr);
      let y = Math.floor(dbh - cssY * dpr);

      // clamp backbuffer coords
      x = Math.min(Math.max(x, 0), dbw - 1);
      y = Math.min(Math.max(y, 0), dbh - 1);

      // DEBUG: inspect a few to verify mapping
      console.log(
        `POI '${feat.properties.name}' → CSS(${cssX},${cssY}) → GL(${x},${y})`
      );

      // 6) read the pixel under it
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

      // 7) set inShade based on the shadow-alpha
      feat.properties.inShade = pixel[3] > 128;
      console.debug(
        `  RGBA: [${pixel.join(", ")}], inShade=${feat.properties.inShade}`
      );
    });

    // 8) write the updated flags back
    src.setData({ type: "FeatureCollection", features });

    // 9) show the POIs again
    map.setLayoutProperty("pois-symbols", "visibility", "visible");
  });

  // 10) force a redraw so the render event fires
  map.triggerRepaint();
}

const loadPOIsInView = async () => {
  console.log("LOADING POIS IN VIEW");
  const mbBounds = map.getBounds();
  const sw = mbBounds.getSouthWest();
  const ne = mbBounds.getNorthEast();
  const gBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(sw.lat, sw.lng),
    new google.maps.LatLng(ne.lat, ne.lng)
  );

  try {
    const [cafes, restaurants] = await Promise.all([
      textSearch({ bounds: gBounds, query: "cafe" }),
      textSearch({ bounds: gBounds, query: "restaurant" }),
    ]);

    const places = [...cafes, ...restaurants].reduce((acc, p) => {
      if (!acc.some((el) => el.place_id === p.place_id)) acc.push(p);
      return acc;
    }, []);

    const features = places.slice(0, 20).map((p) => ({
      // cap to 20
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.geometry.location.lng(), p.geometry.location.lat()],
      },
      properties: {
        place_id: p.place_id,
        name: p.name,
        inShade: false,
      },
    }));

    map.getSource("pois").setData({
      type: "FeatureCollection",
      features,
    });

    updatePOIShading();
  } catch (e) {
    console.error("Places textSearch failed:", e);
  }
};

onMounted(() => {
  try {
    if (window.google && window.google.maps) {
      initGoogle();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initGoogle();
        }
      }, 500);
    }
  } catch (error) {
    console.error("❌ Error loading Google Maps API", error);
  }

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

  map.on("moveend", () => {
    emit("hideSearchbar");
    loadPOIsInView();
  });

  /*map.on("wheel", () => {
    emit("hideSearchbar");
    loadPOIsInView();
  })
  
  map.on("boxzoomstart", () => {
    emit("hideSearchbar");
    loadPOIsInView();
  });
  ;*/

  map.on("click", () => {
    emit("hideSearchbar");
  });

  map.on("load", async () => {
    if (map.getLayer("building")) {
      map.removeLayer("building");
    }
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#ddd",
          "fill-extrusion-height": ["number", ["get", "height"], 5],
          "fill-extrusion-base": ["number", ["get", "min_height"], 0],
          "fill-extrusion-opacity": 1,
        },
      },
      "road-label"
    );
    map.addLayer(buildingShadows, "3d-buildings");
    map.addSource("pois", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    map.loadImage("/map/sonnig.png", (err, img) => {
      if (!err && !map.hasImage("sun-icon")) map.addImage("sun-icon", img);
    });
    map.loadImage("/map/schattig.png", (err, img) => {
      if (!err && !map.hasImage("shade-icon")) map.addImage("shade-icon", img);
    });

    map.addLayer({
      id: "pois-symbols",
      type: "symbol",
      source: "pois",
      layout: {
        "icon-image": ["case", ["get", "inShade"], "shade-icon", "sun-icon"],
        "icon-allow-overlap": true,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 12, 0.05, 16, 0.2],
      },
    });
    map.resize();

    const position = await Geolocation.getCurrentPosition();
    latitude.value = position.coords.latitude;
    longitude.value = position.coords.longitude;
    updatePositionMarker(longitude.value, latitude.value);
    setTimeout(() => {
      setCoordinates(longitude.value, latitude.value);
      setTimeout(() => {
        loadPOIsInView();
      }, 3000);
    }, 1000);
  });

  map.on("resize", () => {
    map.removeLayer("building-shadows");
    map.addLayer(buildingShadows, "3d-buildings");
  });

  map.on("click", "pois-symbols", (e) => {
    const feat = e.features[0];
    const coords = feat.geometry.coordinates;
    const { name, place_id, inShade } = feat.properties;

    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(
        `
      <strong>${name}</strong><br/>
      ID: ${place_id}<br/>
      ${inShade ? "In the shade" : "In the sun"}
    `
      )
      .addTo(map);
  });
});

defineExpose({
  setCoordinates,
  setDate,
  updateMarker,
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
