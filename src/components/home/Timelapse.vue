<template>
  <div class="scroll-container w-screen mt-2">
    <div class="flex flex-col items-center space-x-4 px-8 w-full">
      <div class="flex items-center mt-2">
        <ion-datetime-button datetime="datetime"></ion-datetime-button>
        <p
          class="text-black text-base bg-[rgba(0,0,0,0.07)] px-2 py-[5px] rounded-lg"
        >
          {{ displayTime }}
        </p>
      </div>
      <ion-modal :keep-contents-mounted="true">
        <ion-datetime
          ref="datetime"
          presentation="date"
          @ionChange="onDateChange"
          locale="de-DE"
          :value="timelapseDateTime.toISOString()"
          v-model="dateValue"
          :show-default-buttons="true"
          id="datetime"
        >
          <!--ion-buttons slot="buttons">
            <ion-button color="danger" @click="reset()">Reset</ion-button>
            <ion-button color="primary" @click="confirm()">Confirm</ion-button>
          </ion-buttons-->
        </ion-datetime>
      </ion-modal>
      <div class="w-full mt-6">
        <ion-range
          aria-label="Time"
          min="36"
          max="276"
          step="1"
          v-model="rangeValue"
        ></ion-range>
      </div>
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
import { defineEmits, onMounted, ref, watch } from "vue";

const timelapseDateTime = ref(new Date());
const displayTime = ref(new Date());
const rangeValue = ref(36);
const dateValue = ref(null);
const datetime = ref();

const singleNumberToDouble = (num) => {
  return num >= 10 ? num : "0" + num;
};

const formatDisplayTime = () => {
  let date = timelapseDateTime.value;
  const currentHours = singleNumberToDouble(date.getHours());
  const currentMinutes = singleNumberToDouble(date.getMinutes());
  displayTime.value = `${currentHours}:${currentMinutes}`;
};

const updateRangeValue = () => {
  const hours = timelapseDateTime.value.getHours();
  const minutes = timelapseDateTime.value.getMinutes();
  rangeValue.value = Math.floor((hours * 60 + minutes) / 5);
  formatDisplayTime();
};

const emit = defineEmits(["updateTime"]);

const changeTime = (dateTime) => {
  emit("updateTime", dateTime);
};

onMounted(updateRangeValue);

watch(rangeValue, (value) => {
  const totalMinutes = value * 5;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const newTime = new Date(timelapseDateTime.value);
  newTime.setHours(hours, minutes);
  timelapseDateTime.value = newTime;
  formatDisplayTime();
  changeTime(timelapseDateTime.value);
});

watch(dateValue, (value) => {
  const newDate = new Date(value);
  timelapseDateTime.value.setDate(newDate.getDate());
  timelapseDateTime.value.setFullYear(newDate.getFullYear());
  timelapseDateTime.value.setMonth(newDate.getMonth());
  formatDisplayTime();
  changeTime(timelapseDateTime.value);
});
</script>
