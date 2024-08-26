<template>
    <div class="scroll-container w-screen pb-32">
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="sunny" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Sunny Restaurants</p>
        </div>
        <div v-if="recommendations && recommendations.length" class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div v-for="recommendation in recommendations" :key="recommendation.id" class="mt-4 flex space-x-6">
                <LocationCard :title="recommendation.name" :locationUrl="recommendation.url" :imageUrl="recommendation.image" :description="recommendation.description" />
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
import { useCollection } from 'vuefire';
import { db } from '../../firebaseConfig';
import LocationCard from './LocationCard.vue';

const recommendatiosRef = collection(db, 'Recommendations');
const recommendations = useCollection(recommendatiosRef);

</script>