<template>
  <div
    class="loader absolute flex justify-center items-center bg-black w-full h-full left-0 top-0 z-[9999]"
  >
    <div class="loader-img px-4">
      <img src="@/assets/splash/LogoSplash.jpg" alt="Logo" />
    </div>
  </div>
  <router-view />
</template>

<style>
@import "@/style/SplashScreen.css";
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { loadGoogleMaps } from "@/utils/loadGoogleMaps";

const googleMapsReady = ref(false);

onMounted(async () => {
  try {
    await loadGoogleMaps();
    googleMapsReady.value = true;
    console.log("✅ Google Maps API is fully loaded!");
  } catch (error) {
    console.error("❌ Error loading Google Maps API", error);
  }
});
</script>
