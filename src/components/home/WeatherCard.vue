<template>
    <div class="rounded-lg shadow-lg border-[1px] flex space-x-2 justify-center items-center px-4 py-2">
        <div class="w-[40px] h-[40px] -ml-4">
            <img :src="getWeatherImageUrl(weather.weather[0].icon, '2x')" class="drop-shadow-sunny" alt="Weather" />
        </div>
        <p class="drop-shadow-lg text-base">
            {{ getDateDay(weather.dt) }}
        </p>
        <p class="drop-shadow-lg">
            {{ weather.main.temp }} °C
        </p>
    </div>
</template>

<script setup>

import { useWeather } from '@/utils/weather.service';
const {getWeatherImageUrl} = useWeather();

const getDateDay = (date) => {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const day = (new Date(date * 1000)).getDay(); 
  return days[day];
}

const props = defineProps({
    weather: Object
})
</script>