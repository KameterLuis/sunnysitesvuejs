<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="relative w-full h-full">
        <div class="absolute z-50 right-4 top-10">
          <div v-if="showSearchBar" class="fixed w-full left-0 px-8">
            <ion-searchbar
              :debounce="1000"
              v-model="searchTerm"
              class="custom"
              placeholder="Location"
            ></ion-searchbar>
            <div
              v-for="(place, index) in searchResults"
              :key="searchResults.id"
              class="px-3"
            >
              <div
                :id="index"
                @click="goToSuggestedLocation"
                class="bg-gray-100 px-4 py-4 rounded-lg mb-4 shadow-lg"
              >
                <p class="text-lg">
                  {{ place.name }}
                </p>
                <p class="text-xs">
                  {{ place.address }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="
              !showResult &&
              showSearchHere &&
              (showSearchBar ? !searchResults : true)
            "
            :class="
              showSearchBar
                ? 'fixed mt-16 left-0 w-full px-8 flex justify-center'
                : 'fixed left-0 w-full px-8 flex justify-center'
            "
          >
            <button
              class="bg-white -text--sunny-orange rounded-full px-4 py-2 text-xs shadow-lg"
              @click="searchHere"
            >
              search here
            </button>
          </div>
          <div v-if="showResult" class="fixed w-full left-0 px-8 md:px-14">
            <div
              class="bg-gray-100 opacity-85 px-4 py-4 rounded-lg mb-4 shadow-lg"
            >
              <div class="flex">
                <div>
                  <p class="text-lg">{{ resultObject.name }}</p>
                  <p class="text-xs">
                    {{ resultObject.address }}
                  </p>
                  <p class="text-xs">
                    {{ resultObject.type }}
                    <!--/*  -
                    {{
                      resultObject.open_now == true
                        ? "open now"
                        : resultObject.open_now == false
                        ? "closed now"
                        : "unknown opening hours"
                    }}
                    */-->
                  </p>
                </div>
                <div class="mr-10">
                  <ion-button
                    @click="updateFavorite"
                    class="ml-4"
                    shape="round"
                  >
                    <ion-icon
                      class="icon-sidebar-gray"
                      slot="icon-only"
                      size="small"
                      :name="
                        resultObject.favorite ? `bookmark` : `bookmark-outline`
                      "
                    ></ion-icon>
                  </ion-button>
                </div>
              </div>
              <!--div class="flex items-center space-x-2 mt-2">
                <ion-icon name="star" size="small"></ion-icon>
                <p class="text-xs">
                  {{ resultObject.rating }} / 5 ({{
                    resultObject.ratings_total
                  }}
                  ratings)
                </p>
              </div-->
              <div class="flex gap-x-2 mt-4"></div>
              <!--button
                class="-bg--sunny-orange text-white rounded-lg px-4 py-2 text-base"
                @click="openWebsite"
              >
                website
              </button-->
              <button
                class="-bg--sunny-orange text-white ml-2 rounded-lg px-4 py-2 text-base"
                @click="getRoute"
              >
                route
              </button>
            </div>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="triggerSearch" size="large" shape="round">
              <ion-icon
                class="icon-sidebar-gray"
                slot="icon-only"
                size="small"
                name="search-outline"
              ></ion-icon>
            </ion-button>
          </div>
          <div class="drop-shadow-lg">
            <ion-button @click="showSettings = true" size="large" shape="round">
              <ion-icon
                class="icon-sidebar-gray"
                slot="icon-only"
                size="small"
                name="settings-outline"
              ></ion-icon>
            </ion-button>
          </div>
          <div class="drop-shadow-lg">
            <ion-button
              @click="showFavorites = true"
              size="large"
              shape="round"
            >
              <ion-icon
                class="icon-sidebar-gray"
                slot="icon-only"
                size="small"
                name="bookmark-outline"
              ></ion-icon>
            </ion-button>
          </div>
          <div class="drop-shadow-lg">
            <ion-button
              type="button"
              @click.stop.prevent="switchSearchPreference"
              size="large"
              shape="round"
            >
              <ion-icon
                class="icon-sidebar-gray"
                slot="icon-only"
                size="small"
                :name="searchPreference + `-outline`"
              ></ion-icon>
            </ion-button>
          </div>
        </div>
        <div class="fixed z-50 bottom-0 w-full">
          <Menu
            @hideSearchbar="hideSearchbar"
            @goToLocation3="goToLocation3"
            @updateDate="handleDateChange"
          />
        </div>
        <div class="relative w-full h-screen overflow-hidden">
          <div class="w-full h-screen -z-50">
            <MapboxMap
              @hideSearchbar="hideSearchbar"
              @searchLocation="goToLocationWithData"
              @hideSearchResult="hideSearchResult"
              @searchHereNow="updateSearchHere"
              ref="mapboxMap"
            />
          </div>
        </div>
      </div>
      <div
        v-if="showSettings"
        class="fixed left-0 top-0 w-full h-full bg-white z-[50]"
      >
        <Settings />
        <div class="absolute right-6 top-10 drop-shadow-lg">
          <ion-button @click="showSettings = false" size="large" shape="round">
            <ion-icon
              class="icon-sidebar-gray"
              slot="icon-only"
              size="small"
              name="close-outline"
            ></ion-icon>
          </ion-button>
        </div>
      </div>
      <div
        v-if="showFavorites"
        class="fixed left-0 top-0 w-full h-full bg-white z-[50]"
      >
        <Favorites @openFav="openFavorite" />
        <div class="absolute right-6 top-10 drop-shadow-lg">
          <ion-button @click="showFavorites = false" size="large" shape="round">
            <ion-icon
              class="icon-sidebar-gray"
              slot="icon-only"
              size="small"
              name="close-outline"
            ></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style>
.icon-sidebar-gray {
  color: black;
}
</style>

<script setup>
import MapboxMap from "@/components/home/MapboxMap.vue";
import Menu from "@/components/home/Menu.vue";
import { Browser } from "@capacitor/browser";
import { Geolocation } from "@capacitor/geolocation";
import { onMounted, ref, watch } from "vue";
import Settings from "./Settings.vue";
import Favorites from "./Favorites.vue";
import { removeItem, setItem, exists } from "@/utils/storage";
import { Toast } from "@capacitor/toast";
import { v4 as uuidv4 } from "uuid";
import { getFeatureById } from "@/utils/mapboxAPI";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_MAPS_API_KEY;

const showSearchBar = ref(false);
const showSettings = ref(false);
const showFavorites = ref(false);
const mapboxMap = ref(null);
const askPermission = ref(false);
const showResult = ref(false);
const resultObject = ref(null);
const searchPreference = ref("restaurant");
const showSearchHere = ref(false);

const searchTerm = ref("");
const searchResults = ref([]);

let sessionToken = null;
let activeAbort = null;
let debounceTimer = null;

function resetSession() {
  sessionToken = uuidv4();
}

watch(searchTerm, (val) => {
  clearTimeout(debounceTimer);

  if (!val) {
    searchResults.value = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    if (activeAbort) activeAbort.abort();
    activeAbort = new AbortController();

    const qs = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      session_token: sessionToken,
      q: val,
      limit: "5",
    });

    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${qs}`;

    try {
      const res = await fetch(url, { signal: activeAbort.signal });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      searchResults.value = (json.suggestions || []).map((s) => {
        return {
          name: s.name,
          place_id: s.mapbox_id,
          address: s.full_address,
        };
      });
    } catch (err) {
      if (err.name !== "AbortError") console.error("suggest error", err);
    } finally {
      activeAbort = null;
    }
  }, 300);
});

async function showNativeToast(message, duration = "short") {
  await Toast.show({ text: message, duration, position: "center" });
}

const switchSearchPreference = () => {
  switch (searchPreference.value) {
    case "restaurant":
      searchPreference.value = "beer";
      mapboxMap.value.changePreference("bar");
      showNativeToast("Showing nearby bars", "long");
      break;
    case "beer":
      searchPreference.value = "cafe";
      mapboxMap.value.changePreference("cafe");
      showNativeToast("Showing nearby cafes", "long");
      break;
    case "cafe":
    default:
      searchPreference.value = "restaurant";
      mapboxMap.value.changePreference("restaurant");
      showNativeToast("Showing nearby restaurants", "long");
  }
};

const searchHere = () => {
  mapboxMap.value.changePreference(searchPreference.value);
  showSearchHere.value = false;
};

const updateSearchHere = () => {
  showSearchHere.value = true;
};

const openFavorite = async (id) => {
  resetSession();
  const feature = await getFeatureById(
    id,
    import.meta.env.VITE_MAPBOX_MAPS_API_KEY,
    sessionToken
  );
  const lng = feature.properties.coordinates.longitude;
  const lat = feature.properties.coordinates.latitude;
  const isFav = true;
  resultObject.value = {
    name: feature.properties.name,
    type: feature.properties.maki,
    lat: lat,
    lng: lng,
    favorite: isFav,
    id: feature.properties.mapbox_id,
    address: feature.properties.full_address,
  };
  showResult.value = true;
  mapboxMap.value.setCoordinates(lng, lat, false);
  mapboxMap.value.updateMarker(lng, lat);
  showFavorites.value = false;
};

const updateFavorite = async () => {
  const id = resultObject.value.id;
  const name = resultObject.value.name;
  const address = resultObject.value.address;
  const exist = await exists(id);
  if (exist) {
    removeItem(id);
    resultObject.value.favorite = false;
  } else {
    setItem(id, {
      name: name,
      address: address,
    });
    resultObject.value.favorite = true;
  }
};

const getRoute = async () => {
  const end = [resultObject.value.lng, resultObject.value.lat];
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    const start = [position.coords.longitude, position.coords.latitude];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}`;
    await Browser.open({ url: url });
  } catch (error) {
    console.error("Error fetching location:", error);
  }
};

const openWebsite = async () => {
  await Browser.open({ url: resultObject.value.website });
};

const handleDateChange = (newDate) => {
  mapboxMap.value.setDate(newDate);
};

const triggerSearch = () => {
  showSearchBar.value = !showSearchBar.value;
  showResult.value = false;
  if (showSearchBar.value == true) {
    resetSession();
  }
};

onMounted(async () => {
  Geolocation.checkPermissions().then((permission) => {
    if (permission.location == "denied") {
      askPermission.value = true;
      console.log("Location permission denied");
    }
  });
});

const goToLocationWithData = async (place, zoom = true) => {
  const isFav = await exists(place.place_id);
  const lng = Number(place.lng);
  const lat = Number(place.lat);
  resultObject.value = {
    name: place.name,
    type: place.placeType,
    lat: lat,
    lng: lng,
    favorite: isFav,
    id: place.place_id,
    address: place.address,
  };
  showResult.value = true;
  mapboxMap.value.setCoordinates(lng, lat, zoom);
};

const goToSuggestedLocation = async (event) => {
  if (!event || !event.target) return;
  let elm = event.target;
  if (elm.nodeName == "P") elm = elm.parentNode;
  showSearchBar.value = false;
  const id = searchResults.value[elm.id].place_id;
  const feature = await getFeatureById(
    id,
    import.meta.env.VITE_MAPBOX_MAPS_API_KEY,
    sessionToken
  );
  const lng = feature.properties.coordinates.longitude;
  const lat = feature.properties.coordinates.latitude;
  const isFav = await exists(feature.properties.mapbox_id);
  resultObject.value = {
    name: feature.properties.name,
    type: feature.properties.maki,
    lat: lat,
    lng: lng,
    favorite: isFav,
    id: feature.properties.mapbox_id,
    address: feature.properties.full_address,
  };
  showResult.value = true;
  resetSession();
  mapboxMap.value.setCoordinates(lng, lat, false);
  mapboxMap.value.updateMarker(lng, lat);
};

const hideSearchResult = () => {
  showResult.value = false;
};

const hideSearchbar = () => {
  showSearchBar.value = false;
};

const goToLocation3 = (location) => {
  mapboxMap.value.setCoordinates(location._long, location._lat);
};
</script>
