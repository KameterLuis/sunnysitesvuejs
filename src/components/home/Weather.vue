<template>
    <div class="scroll-container w-screen mt-2">
        <div v-if="weather?.list" class="space-x-4 px-8 -text--sunny-gray">
          <div class="flex items-center rounded-xl shadow-lg border-[1px] px-4">
            <!--ion-icon name="sunny" size="large"></ion-icon-->
            <div class="-ml-4">
              <img class="drop-shadow-lg" alt="Weather" :src="getWeatherImageUrl(weather.list[0].weather[0].icon, '2x')"/>
            </div>
            <div>
              <p class="drop-shadow-lg text-xl">Weather</p>
              <p class="drop-shadow-lg">in {{ weather.city.name }}</p>
              <div class="flex justify-between md:justify-start md:space-x-2">
                <p class="text-xs">Windspeed: {{ weather.list[0].wind.speed }} m/s</p>
                <p class="text-xs">Humidity: {{ weather.list[0].main.humidity }} %</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="weather?.list" class="flex items-center px-8 mt-4">
          <div class="-text--sunny-gray w-full">
            <div class="flex justify-between w-full md:justify-start md:space-x-4">
              <div class="flex items-center rounded-lg shadow-lg border-[1px] p-5 py-6">
                <p class="text-2xl drop-shadow-lg">{{ weather.list[0].main.temp }} °C</p>
              </div>
              <div class="flex flex-col text-base items-center rounded-xl shadow-lg border-[1px] p-5 py-6">
                <div>
                  <div class="flex items-center space-x-2">
                    <ion-icon class="icon-gray" name="sunny" size="small"></ion-icon>
                    <p>Sunrise: {{ formatTime(weather.city.sunrise * 1000) }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <ion-icon class="icon-gray" name="cloudy-night" size="small"></ion-icon>
                    <p>Sunset: {{ formatTime(weather.city.sunset * 1000) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="weather?.list" class="-text--sunny-gray space-y-4 px-8 mt-4 pb-32">
          <WeatherCard :weather="getWeatherInDays(weather.list, 4)[0]" />
          <WeatherCard :weather="getWeatherInDays(weather.list, 4)[1]" />
          <WeatherCard :weather="getWeatherInDays(weather.list, 4)[2]" />
          <WeatherCard :weather="getWeatherInDays(weather.list, 4)[3]" />
        </div>
    </div>
</template>

<style>
.icon-gray {
    color: var(--sunny-gray)
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
import { useWeather } from '@/utils/weather.service';
import { onMounted } from 'vue';
import WeatherCard from './WeatherCard.vue';

const formatTime = (time) => {
  const date = new Date(time);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours >= 10 ? hours : "0" + hours;
  minutes = minutes >= 10 ? minutes : "0" + minutes;
  return hours + ":" + minutes
}

const getWeatherInDays = (weather, days) => {
  if(!weather) return;
  let today = (new Date()).getDay();
  let forecast = [];
  for(let i = 0; i < weather.length; i++) {
    if(today == 6) today = -1;
    let forecastDay = (new Date(weather[i].dt * 1000)).getDay();
    if(forecastDay > today) {
      today = forecastDay;
      forecast.push(weather[i + 4]);
      days--;
      if(days == 0) return forecast;
    }
  }
  return forecast;
}

const {weather, fetchWeather, getWeatherImageUrl} = useWeather();
onMounted(fetchWeather);
//f74de1584a0fd4074b6e26aaee24aae0 for openweather.org
</script>