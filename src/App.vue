<template>
  <div class="loader absolute flex justify-center items-center bg-black w-full h-full left-0 top-0 z-[9999]">
    <div class="loader-img px-4">
      <img src="@/assets/splash/Logo.jpg" alt="Logo">
    </div>  
  </div>
  <router-view />
</template>

<style>
@import '@/style/SplashScreen.css';
</style>

<script setup lang="ts">

import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const user = ref<User | null>(null);
const router = useRouter();

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (currentUser) => {
    if(currentUser) {
      user.value = currentUser;
    } else {
      const currentRoute = router.currentRoute.value.name;
      if((currentRoute != "Login") && (currentRoute != "Register")) {
        //router.push('/login');
      }
    }
  })
})

</script>
