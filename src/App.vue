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

<script setup lang="ts"></script>
