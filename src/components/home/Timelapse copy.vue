<template>
    <div class="scroll-container w-screen mt-2">
      <div class="flex flex-col items-center space-x-4 mt-4 px-8 w-full">
        <p class="text-xl -text--sunny-gray text-center w-full">Date and Time</p>  
        <ion-datetime-button class="mt-6" datetime="datetime"></ion-datetime-button>
        <ion-modal :keep-contents-mounted="true">
          <ion-datetime locale="de-DE" :value="timelapseDateTime.toISOString()" id="datetime"></ion-datetime>
        </ion-modal>
        <div class="w-full mt-6">
          <ion-range aria-label="Time" @ionChange="changeTime"></ion-range>
        </div>
        <p class="mt-2 -text--sunny-gray">{{ setTime }} Uhr</p>
        <p>{{ timelapseDateTime }}</p>
      </div>
    </div>
</template>

<style>
.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

ion-range {
  --bar-background-active: var(--sunny-orange);
}
</style>

<script setup>
import { ref } from 'vue';

const timelapseDateTime = ref(new Date());

const singleNumberToDouble = (num) => {
  return num >= 10 ? num : "0" + num;
}

const currentHours = new Date().getHours();
const currentMinutes = new Date().getMinutes();
const setTime = ref(`${singleNumberToDouble(currentHours)}:${singleNumberToDouble(currentMinutes)}`);

const changeTime = (event) => {
  const slider = event.detail;
  const totalMinutes = slider.value * 14.4;
  const hours = singleNumberToDouble(Math.floor(totalMinutes / 60));
  const minutes = singleNumberToDouble(Math.floor(((totalMinutes / 60) - hours) * 60));
  let newDateTime = (new Date(timelapseDateTime.value));
  newDateTime.setHours(hours);
  newDateTime.setMinutes(minutes);
  console.log(newDateTime.toISOString());
  timelapseDateTime.value = newDateTime;
  setTime.value = `${hours}:${minutes}`;
}

</script>