import { Geolocation } from '@capacitor/geolocation';
import { ref } from 'vue';
import { OneWeather } from './weather.model';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=f74de1584a0fd4074b6e26aaee24aae0'
//&exclude=minutely,hourly
const weather = ref<OneWeather>();

export function useWeather() {
    return {
        weather,
        fetchWeather,
        getWeatherImageUrl
    }
}

async function fetchWeather() {
    const coordinates = await Geolocation.getCurrentPosition();
    const response = await fetch(`${weatherUrl}&lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`)
    weather.value = await response.json();
}

function getWeatherImageUrl(iconName: string, size: '2x' | '4x') {
    return `http://openweathermap.org/img/wn/${iconName}@${size}.png`;
}