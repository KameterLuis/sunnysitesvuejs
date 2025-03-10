<template>
    <div id="map" ref="mapContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import BuildingShadows from '@/utils/BuildingShadows';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { defineEmits, onMounted, ref } from 'vue';

const emit = defineEmits(['hideSearchbar']);

const mapContainer = ref(null);
let map = null;
let marker = null;
let longitude = ref(0);
let latitude = ref(0);
let currentDateTime = new Date();
let buildingShadows = null;

const setCoordinates = (newLongitude, newLatitude) => {
    longitude.value = newLongitude;
    latitude.value = newLatitude;
    if (map) {
        map.setCenter([longitude.value, latitude.value]);
        map.transform.zoom = 18;
    }
};

const updateMarker = (long, lat) => {
    if (!marker) {
        marker = new mapboxgl.Marker()
            .setLngLat([long, lat])
            .addTo(map);
    } else {
        marker.setLngLat([long, lat]);
    }
};

const setDate = (date) => {
    buildingShadows.setDate(date);
};

onMounted(() => {
    console.log('MapboxMap mounted'); // Debugging line
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3VubnlzaXRlcyIsImEiOiJjbTQ4OGlvejcwaW1oMmpzb3h5czZuYzB5In0.quI2qPhurNfI1_j-mfuyDw';
    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitude.value, latitude.value],
        zoom: 16
    });
    buildingShadows = new BuildingShadows(new Date());

    map.on('touchstart', () => {
        emit('hideSearchbar');
    })

    map.on('wheel', () => {
        emit('hideSearchbar');
    })

    map.on('click', () => {
        emit('hideSearchbar');
    })

    map.on('boxzoomstart', () => {
        emit('hideSearchbar');
    })

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

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                longitude.value = position.coords.longitude;
                latitude.value = position.coords.latitude;
                updateMarker(longitude.value, latitude.value);
            });
        }
    });

    map.on('resize', () => {
        map.removeLayer('building-shadows');
        map.addLayer(buildingShadows, '3d-buildings');
    });

});

defineExpose({
    setCoordinates,
    setDate,
    updateMarker
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
  