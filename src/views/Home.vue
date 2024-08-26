<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="relative w-full h-full">
        <div class="absolute z-50 right-6 top-6">
          <div v-if="showSearchBar" class="fixed w-full left-0 px-8">
            <ion-searchbar @ionInput="onSearch" color="light" placeholder="Location"></ion-searchbar>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="showSearchBar = !showSearchBar" size="large" color="light" shape="round">
                <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="search-outline"></ion-icon>
            </ion-button>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="showSettings = true" size="large" color="light" shape="round">
                <ion-icon class="icon-sidebar-gray" slot="icon-only" size="small" name="settings-outline"></ion-icon>
            </ion-button>
          </div>
        </div>
        <div class="fixed z-50 bottom-0 w-full">
          <Menu />
        </div>
        <div class="relative w-full h-screen overflow-hidden">
          <div class="w-full h-screen -z-50">
            <!--MapboxMap ref="mapboxMap" /-->
          </div>
        </div>
      </div>
      <div v-if="showSettings" class="fixed left-0 top-0 w-full h-full bg-white z-[50]">
        <Settings />
        <div class="absolute right-6 top-6 drop-shadow-lg">
          <ion-button @click="showSettings = false" size="large" color="light" shape="round">
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
//import MapboxMap from '@/components/home/MapboxMap.vue';
import Menu from '@/components/home/Menu.vue';
import { onMounted, ref } from 'vue';
import Settings from './Settings.vue';

const showSearchBar = ref(false);
const showSettings = ref(false);
const mapboxMap = ref(null);

onMounted(() => {
  if (mapboxMap.value) {
    mapboxMap.value.setCoordinates(11.5, 48.1);
  }
  /*getLocation('munich').then((result) => {
    console.log(result);
  });*/
});

const onSearch = (event) => {
  if(!event || !event.value) return;
  mapboxMap.value.setCoordinates();
};
</script>