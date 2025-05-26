<template>
  <div class="scroll-container w-screen pb-32">
    <div class="flex items-center space-x-4 mt-6 px-8">
      <ion-icon name="storefront-outline" size="large"></ion-icon>
      <p class="text-xl -text--sunny-gray">Restaurants</p>
    </div>
    <div
      v-if="
        (restaurants && restaurants.length) ||
        (sunnyRestaurants && sunnyRestaurants.length)
      "
      class="scroll-container w-screen overflow-x-scroll px-8 pb-4"
    >
      <div class="flex space-x-6">
        <div
          v-for="restaurant in sunnyRestaurants"
          :key="restaurant.id"
          class="mt-4 flex space-x-6"
        >
          <LocationCard
            @goToLocation1="goToLocation1"
            :recommendation="restaurant"
            sunny="very sunny"
            iconName="sunny"
          />
        </div>
        <div
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          class="mt-4 flex space-x-6 pr-6"
        >
          <LocationCard
            @goToLocation1="goToLocation1"
            :recommendation="restaurant"
            sunny="less sunny"
            iconName="cloudy-night"
          />
        </div>
      </div>
    </div>
    <div v-else class="px-8 mt-4">
      <p class="text-black">Aktuell noch keine Restaurants in deiner Nähe</p>
    </div>
    <div class="flex items-center space-x-4 mt-6 px-8">
      <ion-icon name="cafe-outline" size="large"></ion-icon>
      <p class="text-xl -text--sunny-gray">Cafés</p>
    </div>
    <div
      v-if="(cafes && cafes.length) || (sunnyCafes && sunnyCafes.length)"
      class="scroll-container w-screen overflow-x-scroll px-8 pb-4"
    >
      <div class="flex space-x-6">
        <div
          v-for="cafe in sunnyCafes"
          :key="cafe.id"
          class="mt-4 flex space-x-6"
        >
          <LocationCard
            @goToLocation1="goToLocation1"
            :recommendation="cafe"
            sunny="very sunny"
            iconName="sunny"
          />
        </div>
        <div
          v-for="cafe in cafes"
          :key="cafe.id"
          class="mt-4 flex space-x-6 pr-6"
        >
          <LocationCard
            @goToLocation1="goToLocation1"
            :recommendation="cafe"
            sunny="less sunny"
            iconName="cloudy-night"
          />
        </div>
      </div>
    </div>
    <div v-else class="px-8 mt-4">
      <p class="text-black">Aktuell noch keine Cafes in deiner Nähe</p>
    </div>
  </div>
</template>

<style>
ion-icon {
  color: var(--sunny-orange);
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
import { Geolocation } from "@capacitor/geolocation";
import { collection, getDocs } from "firebase/firestore";
import { defineEmits, onMounted, ref } from "vue";
import { db } from "../../firebaseConfig";
import LocationCard from "./LocationCard.vue";

let placesService;

const currentLocation = ref({ lat: null, lon: null });

const restaurants = ref([]);
const cafes = ref([]);
const sunnyRestaurants = ref([]);
const sunnyCafes = ref([]);

const emit = defineEmits(["goToLocation2"]);

const maxDistance = 20;

const getData = async (collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  const list = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return await filterByDistance(list, maxDistance);
};

const loadRecommendations = async () => {
  try {
    restaurants.value = await getData("Restaurants");
    cafes.value = await getData("Cafes");
    sunnyRestaurants.value = await getData("Sunny Restaurants");
    sunnyCafes.value = await getData("Sunny Cafes");
  } catch (e) {
    console.error("Failed to load restaurants:", e);
  }
};

onMounted(async () => {
  //getLocation();
});

const goToLocation1 = (location) => {
  emit("goToLocation2", location);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getLocation = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    currentLocation.value = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
  } catch (error) {
    console.error("Error fetching location:", error);
  }
};

async function filterByDistance(recommendations, maxDistance) {
  const filtered = [];

  for (const rec of recommendations) {
    try {
      //TODO
      console.log(rec);

      rec.rating = detail.rating;
      rec.reviews = detail.reviews;
      rec.name = detail.name;
      rec.url = detail.url;
      rec.website = detail.website;
      rec.image = detail.photos?.[0]?.getUrl();
      rec.location = detail.geometry.location;
      const distance = calculateDistance(
        currentLocation.value.lat,
        currentLocation.value.lon,
        rec.location.lat(),
        rec.location.lng()
      );
      rec.distance = distance;

      if (distance <= maxDistance) {
        filtered.push(rec);
      }
    } catch (err) {
      console.error("PlacesService failed for", rec.place_id, err);
    }
  }
  return filtered;
}
</script>
