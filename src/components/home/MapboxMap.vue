<template>
    <div id="map" ref="mapContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import BuildingShadows from '@/utils/BuildingShadows';
import mapboxgl from 'mapbox-gl';

import { onMounted, ref } from 'vue';

const mapContainer = ref(null);
let map = null;
let longitude = ref(0);
let latitude = ref(0);
let currentDateTime = new Date();
let buildingShadows = null;

const setCoordinates = (newLongitude, newLatitude) => {
    longitude.value = newLongitude;
    latitude.value = newLatitude;
    if (map) {
        map.setCenter([longitude.value, latitude.value]);
    }
};

const setDate = (date) => {
    buildingShadows.setDate(date);
};

onMounted(() => {
    console.log('MapboxMap mounted'); // Debugging line
    mapboxgl.accessToken = 'pk.eyJ1IjoibG9raTkxOSIsImEiOiJjbG1xNjF6amEwMGRzMm9ycjk4cnRiNHVrIn0.-zmJ-2xdZoqBOjAgc8taiA';
    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitude.value, latitude.value],
        zoom: 16
    });
    buildingShadows = new BuildingShadows(new Date());

    map.on('load', () => {
        map.removeLayer('building');
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#ddd',
                'fill-extrusion-height': ["number", ["get", "height"], 5],
                'fill-extrusion-base': ["number", ["get", "min_height"], 0],
                'fill-extrusion-opacity': 1
            }
        }, 'road-label');
        map.addLayer(buildingShadows, '3d-buildings');
        map.resize();
    });

    map.on('resize', () => {
        map.removeLayer('building-shadows');
        map.addLayer(buildingShadows, '3d-buildings');
    });


});

defineExpose({
    setCoordinates,
    setDate
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
  