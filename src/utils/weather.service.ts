import { Geolocation } from "@capacitor/geolocation";
import { ref } from "vue";

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface FeelsLike {
  day: number;
  evening: number;
  morning: number;
  night: number;
}

interface Temperature extends FeelsLike {
  max: number;
  min: number;
}

interface CurrentWeather {
  feels_like: number;
  humidity: number;
  sunrise: number;
  sunset: number;
  temperature: number;
  weather: Weather[];
  wind_speed: number;
}

interface DailyWeather {
  feels_like: FeelsLike;
  humidity: number;
  sunrise: number;
  sunset: number;
  temp: Temperature;
  weather: Weather[];
  wind_speed: number;
}

export interface OneWeather {
  current: CurrentWeather;
  daily: DailyWeather[];
}

const weatherUrl =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" +
  import.meta.env.VITE_OPENWEATHER_APP_ID;
//&exclude=minutely,hourly
const weather = ref<OneWeather>();

export function useWeather() {
  return {
    weather,
    fetchWeather,
    getWeatherImageUrl,
  };
}

async function fetchWeather() {
  const coordinates = await Geolocation.getCurrentPosition();
  const response = await fetch(
    `${weatherUrl}&lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`
  );
  weather.value = await response.json();
}

function getWeatherImageUrl(iconName: string, size: "2x" | "4x") {
  if (!iconName || iconName == null) {
    iconName = "02d";
  }
  return `https://openweathermap.org/img/wn/${iconName}@${size}.png`;
}
