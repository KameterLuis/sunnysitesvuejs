<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="relative w-full h-full">
        <div class="absolute z-50 right-6 top-6">
          <SideBar />
        </div>
        <div class="fixed z-50 bottom-0 w-full">
          <Menu />
        </div>
        <div class="relative w-full h-screen overflow-hidden">
          <div class="w-full h-screen -z-50">
            <MapboxMap ref="mapboxMap" />
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import MapboxMap from '@/components/home/MapboxMap.vue';
import Menu from '@/components/home/Menu.vue';
import SideBar from '@/components/home/SideBar.vue';
import { onMounted, ref } from 'vue';
const mapboxMap = ref(null);
onMounted(() => {
  if (mapboxMap.value) {
    mapboxMap.value.setCoordinates(13, 52);
  }
});
</script>