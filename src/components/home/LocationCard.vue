<template>
    <div @click="goToLocation" class="shadow-lg rounded-xl w-[210px] bg-white p-[15px] border-[1px] border-gray-300">
        <p class="-text--sunny-gray underline text-lg">{{ recommendation.name }}</p>
        <div class="flex items-center space-x-2 mt-2">
            <ion-icon :name="iconName" size="small"></ion-icon>
            <p class="text-xs">{{ sunny }}</p>
        </div>
        <div class="flex items-center space-x-2 mt-2">
            <ion-icon name="star" size="small"></ion-icon>
            <p class="text-xs">{{ recommendation.rating }} / 5</p>
        </div>
        <div class="w-[180px] max-h-[150px] mt-3 overflow-hidden">
            <img :src="recommendation.image" :alt="recommendation.name">
        </div>
        <p class="-text--sunny-gray mt-3 text-xs">{{ recommendation.description }}</p>
        <div class="flex gap-x-2">
            <button class="-bg--sunny-orange mt-4 text-white rounded-lg px-4 py-2 text-base" @click="openWebsite">more</button>
            <button class="-bg--sunny-orange mt-4 text-white rounded-lg px-4 py-2 text-base" @click="getRoute">route</button>
        </div>
    </div>
</template>

<script setup>
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import { defineEmits } from 'vue';

const emit = defineEmits(['goToLocation1']);

const goToLocation = () => {
    emit('goToLocation1', props.recommendation.location);
}

const openWebsite = async () => {
    await Browser.open({ url: props.recommendation.url });
};

const getRoute = async () => {
    const loc = props.recommendation.location
    const end = [loc._long, loc._lat]
    try {
        const position = await Geolocation.getCurrentPosition();
        const start = [position.coords.longitude, position.coords.latitude];
        const url = `https://www.google.com/maps/dir/?api=1&origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}`;
        await Browser.open({ url: url });
    } catch (error) {
        console.error('Error fetching location:', error);
    }
};

const props = defineProps({
    recommendation: Object,
    sunny: String,
    iconName: String
})
</script>