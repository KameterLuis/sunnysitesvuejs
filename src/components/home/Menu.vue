<template>
    <div ref="menu" :style="{height: (showRecommendations || showTimelapse || showWeather) ? '60vh' : '100px'}" class="w-full text-sm bg-white rounded-t-3xl duration-300 ease-in-out overflow-hidden">
        <div class="w-full px-4 flex justify-between items-center h-[100px]">
            <button ref="locationBtn" @click="setLocation" class="flex space-y-2 flex-col items-center">
                <ion-icon class="menu-icon" name="location" size="large"></ion-icon>
                <p class="-text--sunny-gray">Location</p>
            </button>
            <button ref="timelapseBtn" @click="{
                    showTimelapse = !showTimelapse;
                    showRecommendations = false;
                    showWeather = false;
                }"
                 class="flex space-y-2 flex-col items-center">
                <ion-icon :style="{color: (showTimelapse ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="menu-icon" name="stopwatch" size="large"></ion-icon>
                <p :style="{color: (showTimelapse ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="-text--sunny-gray">Time Lapse</p>
            </button>
            <button ref="weatherBtn" @click="{
                    showWeather = !showWeather;
                    showRecommendations = false;
                    showTimelapse = false;
                }"
                class="flex space-y-2 flex-col items-center">
                <ion-icon :style="{color: (showWeather ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="menu-icon" name="cloudy-night" size="large"></ion-icon>
                <p :style="{color: (showWeather ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="-text--sunny-gray">Weather</p>
            </button>
            <button ref="recommendationBtn" @click="{
                    showRecommendations = !showRecommendations;
                    showTimelapse = false;
                    showWeather = false;
                }"
                class="flex space-y-2 flex-col items-center">
                <ion-icon :style="{color: (showRecommendations ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="menu-icon" name="cafe" size="large"></ion-icon>
                <p :style="{color: (showRecommendations ? 'var(--sunny-orange)' : 'var(--sunny-gray)')}" class="-text--sunny-gray">Recommendations</p>
            </button>
        </div>
        <div class="overflow-y-scroll overflow-x-hidden h-full">
            <Recommendations @goToLocation2="goToLocation2" v-if="showRecommendations" />
            <Weather v-if="showWeather" />
            <Timelapse v-if="showTimelapse" @updateTime="handleDateChange" />
        </div>
    </div>
</template>

<style>
.icon-sunny {
    color: var(--sunny-orange);
}
</style>

<script setup>
import { Geolocation } from '@capacitor/geolocation';
import { defineEmits, ref } from 'vue';
import Recommendations from './Recommendations.vue';
import Timelapse from './Timelapse.vue';
import Weather from './Weather.vue';

const emit = defineEmits(['goToLocation3', 'updateDate']);

const handleDateChange = (newDate) => {
    emit('updateDate', newDate);
};

const goToLocation2 = (location) => {
    emit('goToLocation3', location);
}

const setLocation = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    const long = coordinates.coords.longitude;
    const lat = coordinates.coords.latitude;
    emit('goToLocation3', {
        _long: long,
        _lat: lat
    });
    showTimelapse.value = false;
    showWeather.value = false;
    showRecommendations.value = false;
}

const menu = ref();
const locationBtn = ref();
const timelapseBtn = ref();
const weatherBtn = ref();
const recommendationBtn = ref();

const showTimelapse = ref(false);
const showWeather = ref(false);
const showRecommendations = ref(false);
</script>