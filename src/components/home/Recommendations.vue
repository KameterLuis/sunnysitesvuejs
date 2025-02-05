<template>
    <div class="scroll-container w-screen pb-32">
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="storefront-outline" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Restaurants</p>
        </div>
        <div v-if="(filteredSunnyRestaurants && filteredSunnyRestaurants.length) || (filteredRestaurants && filteredRestaurants.length)" class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="flex space-x-6">
                <div v-for="restaurant in filteredSunnyRestaurants" :key="restaurant.id" class="mt-4 flex space-x-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="restaurant" sunny="very sunny" iconName="sunny" />
                </div>
                <div v-for="restaurant in filteredRestaurants" :key="restaurant.id" class="mt-4 flex space-x-6 pr-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="restaurant" sunny="less sunny" iconName="cloudy-night" />
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="cafe-outline" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Cafés</p>
        </div>
        <div v-if="(filteredSunnyCafes && filteredSunnyCafes.length) || (filteredCafes && filteredCafes.length)" class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="flex space-x-6">
                <div v-for="cafe in filteredSunnyCafes" :key="cafe.id" class="mt-4 flex space-x-6">
                    <LocationCard @goToLocation1="goToLocation1" :recommendation="cafe" sunny="very sunny" iconName="sunny" />
                </div>
                <div v-for="cafe in filteredCafes" :key="cafe.id" class="mt-4 flex space-x-6 pr-6">
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
import { Geolocation } from '@capacitor/geolocation';
import { collection } from 'firebase/firestore';
import { computed, defineEmits, onMounted, ref } from 'vue';
import { useCollection } from 'vuefire';
import { db } from '../../firebaseConfig';
import LocationCard from './LocationCard.vue';

let placesService;

const currentLocation = ref({ lat: null, lon: null })

const restaurantsRef = collection(db, 'Restaurants');
const restaurants = useCollection(restaurantsRef);

const sunnyRestaurantsRef = collection(db, 'Sunny Restaurants');
const sunnyRestaurants = useCollection(sunnyRestaurantsRef);

const cafesRef = collection(db, 'Cafes');
const cafes = useCollection(cafesRef);

const sunnyCafesRef = collection(db, 'Sunny Cafes');
const sunnyCafes = useCollection(sunnyCafesRef);

const emit = defineEmits(['goToLocation2']);

onMounted(() => {
    const dummy = document.createElement('div');
    placesService = new google.maps.places.PlacesService(dummy);
    getLocation();
})

const goToLocation1 = (location) => {
    emit('goToLocation2', location);
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getLocation = async () => {
try {
    const position = await Geolocation.getCurrentPosition();
    currentLocation.value = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };
  } catch (error) {
    console.error('Error fetching location:', error);
  }
};

function filterByDistance(recommendations, maxDistance) {
    recommendations = recommendations.filter(recommendation => {
      const request = {
      placeId: recommendation.place_id,
      fields: ['reviews', 'rating']
    }
    placesService.getDetails(request, (result, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        recommendation.rating = result.rating;
        recommendation.reviews = result.reviews;
        //console.log(result.rating, result.reviews);
      }
    });
    const distance = calculateDistance(
      currentLocation.value.lat,
      currentLocation.value.lon,
      recommendation.location._lat,
      recommendation.location._long
    );
    recommendation.distance = distance;
    return distance <= maxDistance;
  });
  return recommendations.sort((a,b) => a.distance - b.distance);
}

const filteredCafes = computed(() => {
  return currentLocation.value.lat ? filterByDistance(cafes.value, 20) : cafes;
});

const filteredSunnyCafes = computed(() => {
  return currentLocation.value.lat ? filterByDistance(sunnyCafes.value, 20) : sunnyCafes;
});

const filteredRestaurants = computed(() => {
  return currentLocation.value.lat ? filterByDistance(restaurants.value, 20) : restaurants;
});

const filteredSunnyRestaurants = computed(() => {
  return currentLocation.value.lat ? filterByDistance(sunnyRestaurants.value, 20) : sunnyRestaurants;
});

</script>