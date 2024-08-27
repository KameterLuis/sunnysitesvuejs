<template>
    <div class="scroll-container w-screen pb-32">
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="storefront-outline" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Restaurants</p>
        </div>
        <div v-if="sunnyRestaurants && sunnyRestaurants.length" class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="flex space-x-6">
                <div v-for="restaurant in sunnyRestaurants" :key="restaurant.id" class="mt-4 flex space-x-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="restaurant" sunny="very sunny" iconName="sunny" />
                </div>
                <div v-for="restaurant in restaurants" :key="restaurant.id" class="mt-4 flex space-x-6 pr-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="restaurant" sunny="less sunny" iconName="cloudy-night" />
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="cafe-outline" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Cafés</p>
        </div>
        <div v-if="sunnyCafes && sunnyCafes.length" class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="flex space-x-6">
                <div v-for="cafe in sunnyCafes" :key="cafe.id" class="mt-4 flex space-x-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="cafe" sunny="very sunny" iconName="sunny" />
                </div>
                <div v-for="cafe in cafes" :key="cafe.id" class="mt-4 flex space-x-6 pr-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="cafe" sunny="less sunny" iconName="cloudy-night" />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
ion-icon {
    color: var(--sunny-orange)
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup>
import { collection } from 'firebase/firestore';
import { defineEmits } from 'vue';
import { useCollection } from 'vuefire';
import { db } from '../../firebaseConfig';
import LocationCard from './LocationCard.vue';

const restaurantsRef = collection(db, 'Restaurants');
const restaurants = useCollection(restaurantsRef);

const sunnyRestaurantsRef = collection(db, 'Sunny Restaurants');
const sunnyRestaurants = useCollection(sunnyRestaurantsRef);

const cafesRef = collection(db, 'Cafes');
const cafes = useCollection(cafesRef);

const sunnyCafesRef = collection(db, 'Sunny Cafes');
const sunnyCafes = useCollection(sunnyCafesRef);

const emit = defineEmits(['goToLocation2']);

const goToLocation1 = (location) => {
    emit('goToLocation2', location);
}
</script>