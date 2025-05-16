export function addPOILayer(map, emit) {
  map.addSource("pois", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.loadImage("/map/cafe-sun.png", (_, img) =>
    map.addImage("cafe-sun-icon", img)
  );
  map.loadImage("/map/cafe-shade.png", (_, img) =>
    map.addImage("cafe-shade-icon", img)
  );
  map.loadImage("/map/rest-sun.png", (_, img) =>
    map.addImage("restaurant-sun-icon", img)
  );
  map.loadImage("/map/rest-shade.png", (_, img) =>
    map.addImage("restaurant-shade-icon", img)
  );
  map.loadImage("/map/bar-sun.png", (_, img) =>
    map.addImage("bar-sun-icon", img)
  );
  map.loadImage("/map/bar-shade.png", (_, img) =>
    map.addImage("bar-shade-icon", img)
  );

  map.addLayer({
    id: "pois-symbols",
    type: "symbol",
    source: "pois",
    layout: {
      //"icon-image": ["case", ["get", "inShade"], "shade-icon", "sun-icon"],
      "icon-image": [
        "concat",
        ["get", "placeType"],
        ["case", ["get", "inShade"], "-shade-icon", "-sun-icon"],
      ],
      "icon-allow-overlap": true,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 12, 0.05, 16, 0.2],
    },
  });

  map.on("click", "pois-symbols", (e) => {
    const pid = e.features[0].properties.place_id;
    emit("hideSearchbar");
    setTimeout(() => {
      emit("searchLocation", pid, false);
    }, 100);

    /*const f = e.features[0];
    new mapboxgl.Popup()
      .setLngLat(f.geometry.coordinates)
      .setHTML(
        `<strong>${f.properties.name}</strong><br>
                  ${f.properties.inShade ? "Shade" : "Sun"}`
      )
      .addTo(map);*/
  });
}

export function addDebugLayer(map, sourceId, type, url) {
  map.addSource(sourceId, { type, url });
  map.addLayer({
    id: "hidden-building-layer",
    type: "line",
    source: "streets-debug",
    "source-layer": "building",
    filter: ["==", ["get", "extrude"], "true"],
    paint: {
      "line-color": "#000",
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "hidden-road-layer",
    type: "line",
    source: "streets-debug",
    "source-layer": "road",
    paint: {
      "line-color": "#000",
      "line-opacity": 0,
    },
  });
}

export function add3DBuildingsLayer(map) {
  if (map.getLayer("3d-buildings")) map.removeLayer("3d-buildings");
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
}
