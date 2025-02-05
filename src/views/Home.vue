<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="relative w-full h-full">
        <div class="absolute z-50 right-6 top-6">
          <div v-if="showSearchBar" class="fixed w-full left-0 px-8">
            <ion-searchbar class="custom" @ionInput="onSearch" placeholder="Location"></ion-searchbar>
            <div v-for="(place, index) in searchResults" :key="searchResults.id" class="px-3">
              <div :id="index" @click="searchLocation" class="bg-gray-100 px-4 py-4 rounded-lg mb-4 shadow-lg">
                <p class="text-lg">{{ place.structured_formatting.main_text }}</p>
                <p class="text-xs">{{ place.structured_formatting.secondary_text }}</p>
              </div>
            </div>
          </div>
          <div v-if="showResult" class="fixed w-full left-0 px-14">
            <div class="bg-gray-100 opacity-85 px-4 py-4 rounded-lg mb-4 shadow-lg">
              <p class="text-lg">{{ resultObject.name }}</p>
              <p class="text-xs">{{ resultObject.type }} - {{ resultObject.open_now ? "open now" : "closed now"}}</p>
              <div class="flex items-center space-x-2 mt-2">
                <ion-icon name="star" size="small"></ion-icon>
                <p class="text-xs">{{ resultObject.rating }}/ 5 ({{ resultObject.ratings_total }} ratings)</p>
              </div>
              <div class="flex gap-x-2 mt-4"></div>
                <button class="-bg--sunny-orange text-white rounded-lg px-4 py-2 text-base" @click="openWebsite">website</button>
                <button class="-bg--sunny-orange text-white ml-2 rounded-lg px-4 py-2 text-base" @click="getRoute">route</button>
              </div>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="triggerSearch" size="large" shape="round">
                <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="search-outline"></ion-icon>
            </ion-button>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="showSettings = true" size="large" shape="round">
                <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="settings-outline"></ion-icon>
            </ion-button>
          </div>
        </div>
        <div class="fixed z-50 bottom-0 w-full">
          <Menu @hideSearchbar="hideSearchbar" @goToLocation3="goToLocation3" @updateDate="handleDateChange" />
        </div>
        <div class="relative w-full h-screen overflow-hidden">
          <div class="w-full h-screen -z-50">
            <MapboxMap @hideSearchbar="hideSearchbar" ref="mapboxMap"/>
          </div>
        </div>
      </div>
      <div v-if="askPermission" class="fixed flex justify-center items-center left-0 top-0 w-full h-full z-[50]">
        <div class="p-8 bg-white rounded-xl">
          <p>Please enable location permission in the apps settings</p>
          <!--div class="w-full mt-2 flex justify-center items-center">
            <ion-button @click="askPermission = false" size="large" shape="round">
                <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="close-outline"></ion-icon>
            </ion-button>
          </div-->
        </div>
      </div>
      <div v-if="showSettings" class="fixed left-0 top-0 w-full h-full bg-white z-[50]">
        <Settings />
        <div class="absolute right-6 top-6 drop-shadow-lg">
          <ion-button @click="showSettings = false" size="large" shape="round">
              <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="close-outline"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style>
.icon-sidebar-gray {
    color: black;
}
</style>

<script setup>
import MapboxMap from '@/components/home/MapboxMap.vue';
import Menu from '@/components/home/Menu.vue';
//import { getLocation } from '@/utils/geolocation.service';
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import { onMounted, ref } from 'vue';
import Settings from './Settings.vue';

let autocompleteService, placesService, map;

const showSearchBar = ref(false);
const showSettings = ref(false);
const mapboxMap = ref(null);
const searchResults = ref(null);
const askPermission = ref(false);
const showResult = ref(false);
const resultObject = ref(null);

const getRoute = async () => {
    const end = [resultObject.value.lng, resultObject.value.lat]
    console.log(end);
    try {
        const position = await Geolocation.getCurrentPosition();
        const start = [position.coords.longitude, position.coords.latitude];
        const url = `https://www.google.com/maps/dir/?api=1&origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}`;
        await Browser.open({ url: url });
    } catch (error) {
        console.error('Error fetching location:', error);
    }
};

const openWebsite = async () => {
    await Browser.open({ url: resultObject.value.website });
};

const handleDateChange = (newDate) => {
    mapboxMap.value.setDate(newDate);
};

const triggerSearch = () => {
  showSearchBar.value = !showSearchBar.value;
  showResult.value = false;
}

onMounted(async () => {
  Geolocation.checkPermissions().then(permission => {
      if(permission.location == 'denied') {
        askPermission.value = true;
      }
  });
  if (mapboxMap.value) {
    mapboxMap.value.setCoordinates(11.5, 48.1);
  }
  autocompleteService = new google.maps.places.AutocompleteService();
  const dummy = document.createElement('div');
  placesService = new google.maps.places.PlacesService(dummy);
  //apiKey: 'AIzaSyBOQTDR0PUStWQDPXzrfRtX-ubFLQU6_8I',
});

const searchLocation = (event) => {
  if(!event || !event.target) return;
  let elm = event.target;
  if(elm.nodeName == 'P') elm = elm.parentNode;
  showSearchBar.value = false;
  const request = {
    placeId: searchResults.value[elm.id].place_id,
    fields: ['name', 'geometry', 'user_ratings_total', 'rating', 'opening_hours', 'website', 'types']
  }
  placesService.getDetails(request, (result, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const lat = result.geometry.location.lat();
      const lng = result.geometry.location.lng();
      console.log(result.geometry)
      showResult.value = true;
      resultObject.value = {
        'name': result.name,
        'ratings_total': result.user_ratings_total,
        'rating': result.rating,
        'open_now': result.opening_hours.open_now,
        'website': result.website,
        'type': result.types[0],
        'lat': lat,
        'lng': lng
      }
      mapboxMap.value.setCoordinates(lng, lat);
      mapboxMap.value.updateMarker(lng, lat);
    }
  });
}

let rateLimiter = Date.now();

const onSearch = (event) => {
  if(Date.now() - rateLimiter < 1000) return;
  rateLimiter = Date.now();
  if(!event || !event.detail) return;
  autocompleteService.getPlacePredictions({ input: event.detail.value }, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      searchResults.value = predictions
    }
  });
};

const hideSearchbar = () => {
  showSearchBar.value = false;
}

const goToLocation3 = (location) => {
  mapboxMap.value.setCoordinates(location._long, location._lat);
}
</script>