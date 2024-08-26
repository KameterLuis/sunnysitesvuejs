<template>
    <div class="scroll-container w-screen mt-2">
      <div class="flex flex-col items-center space-x-4 mt-4 px-8 w-full">
        <p class="text-xl -text--sunny-gray text-center w-full">Date and Time</p>  
        <ion-datetime-button class="mt-6" datetime="datetime"></ion-datetime-button>
        <ion-modal :keep-contents-mounted="true">
          <ion-datetime @ionChange="onDateChange" locale="de-DE" :value="timelapseDateTime.toISOString()" id="datetime"></ion-datetime>
        </ion-modal>
        <div class="w-full mt-6">
          <ion-range aria-label="Time" min="36" max="276" :value="rangeValue" step="1" @ionInput="onRangeChange"></ion-range>
        </div>
        <p class="mt-2 -text--sunny-gray">{{ displayDateTime }} Uhr</p>
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
import { onMounted, ref } from 'vue';

const timelapseDateTime = ref(new Date());
const displayDateTime = ref(new Date());
const rangeValue = ref(0);

const singleNumberToDouble = (num) => {
  return num >= 10 ? num : "0" + num;
}

const formatDisplayTime = () => {
  let date = timelapseDateTime.value;
  const offset = date.getTimezoneOffset() * 60000;
  date = new Date(date.getTime() + offset);
  const currentHours = singleNumberToDouble(date.getHours());
  const currentMinutes = singleNumberToDouble(date.getMinutes());
  displayDateTime.value = `${currentHours}:${currentMinutes}`;
}

const updateRangeValue = () => {
    const hours = timelapseDateTime.value.getHours();
    const minutes = timelapseDateTime.value.getMinutes();
    rangeValue.value = Math.floor((hours * 60 + minutes) / 5);
    formatDisplayTime();
}

onMounted(updateRangeValue);

const onDateChange = (event) => {
  const newDate = new Date(event.detail.value);
  timelapseDateTime.value.setDate(newDate.getDate());
  timelapseDateTime.value.setFullYear(newDate.getFullYear());
  timelapseDateTime.value.setMonth(newDate.getMonth());
  formatDisplayTime();
}

const onRangeChange = (event) => {
    const totalMinutes = event.target.value * 5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const newTime = new Date(timelapseDateTime.value);
    newTime.setHours(hours, minutes);
    timelapseDateTime.value = newTime;
    formatDisplayTime();
}

</script>