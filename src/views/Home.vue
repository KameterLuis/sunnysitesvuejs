<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="relative w-full h-full">
        <div class="absolute z-50 right-6 top-6">
          <div v-if="showSearchBar" class="fixed w-full left-0 px-8">
            <ion-searchbar class="custom" @ionInput="onSearch" placeholder="Location"></ion-searchbar>
            <div v-for="(place, index) in searchResults" :key="searchResults.id" class="px-3">
              <div :id="index" @click="searchLocation" class="bg-gray-100 px-4 py-4 rounded-lg mb-4 shadow-lg">
                <p class="text-lg">{{ place.text }}</p>
                <p class="text-xs">{{ place.place_name }}</p>
              </div>
            </div>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="showSearchBar = !showSearchBar" size="large" shape="round">
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
          <Menu @goToLocation3="goToLocation3" @updateDate="handleDateChange" />
        </div>
        <div class="relative w-full h-screen overflow-hidden">
          <div class="w-full h-screen -z-50">
            <MapboxMap ref="mapboxMap"/>
          </div>
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
import { getLocation } from '@/utils/geolocation.service';
import { onMounted, ref } from 'vue';
import Settings from './Settings.vue';

const showSearchBar = ref(false);
const showSettings = ref(false);
const mapboxMap = ref(null);
const searchResults = ref(null);

const handleDateChange = (newDate) => {
    mapboxMap.value.setDate(newDate);
};

onMounted(() => {
  if (mapboxMap.value) {
    mapboxMap.value.setCoordinates(11.5, 48.1);
  }
});

const searchLocation = (event) => {
  if(!event || !event.target) return;
  let elm = event.target;
  if(elm.nodeName == 'P') elm = elm.parentNode;
  showSearchBar.value = false;
  const coords = searchResults.value[elm.id].center;
  mapboxMap.value.setCoordinates(coords[0], coords[1]);
}

const onSearch = (event) => {
  if(!event || !event.detail) return;
  getLocation(event.detail.value).then((result) => {
    if(!result) return;
    searchResults.value = result.features;
  });
};

const goToLocation3 = (location) => {
  mapboxMap.value.setCoordinates(location._long, location._lat);
}
</script>