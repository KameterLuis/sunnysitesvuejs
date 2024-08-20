<template>
    <div ref="menu" class="w-full text-sm bg-white rounded-t-3xl duration-300 ease-in-out h-[100px] overflow-hidden">
        <div class="w-full px-4 flex justify-between items-center h-[100px]">
            <button ref="locationBtn" @click="toggleButton" class="flex space-y-2 flex-col items-center">
                <ion-icon class="menu-icon" name="location" size="large"></ion-icon>
                <p class="-text--sunny-gray">Location</p>
            </button>
            <button ref="timelapseBtn" @click="toggleButton" class="flex space-y-2 flex-col items-center">
                <ion-icon class="menu-icon" name="stopwatch" size="large"></ion-icon>
                <p class="-text--sunny-gray">Time Lapse</p>
            </button>
            <button ref="weatherBtn" @click="toggleButton" class="flex space-y-2 flex-col items-center">
                <ion-icon class="menu-icon" name="cloudy-night" size="large"></ion-icon>
                <p class="-text--sunny-gray">Weather</p>
            </button>
            <button ref="recommendationBtn" @click="toggleButton" class="flex space-y-2 flex-col items-center">
                <ion-icon class="menu-icon" name="cafe" size="large"></ion-icon>
                <p class="-text--sunny-gray">Recommendations</p>
            </button>
        </div>
        <div class="overflow-y-scroll overflow-x-hidden h-full">
            <Recommendations />
        </div>
    </div>
</template>

<style>
.active p, .active ion-icon {
    color: var(--sunny-orange);
}

.menu-icon {
    color: var(--sunny-gray);
}

.menu-open {
    height: 60vh;
}
</style>

<script setup>
import { ref } from 'vue';
import Recommendations from './Recommendations.vue';

const menu = ref();
const locationBtn = ref();
const timelapseBtn = ref();
const weatherBtn = ref();
const recommendationBtn = ref();

function closeMenu() {
}

function openMenu() {
}

function toggleButton(event) {
    if(event) {
        let button = event.target;
        if(button.nodeName != 'BUTTON') {
            button = button.parentNode;
            if(button.nodeName != 'BUTTON') return;
        }
        if(button == locationBtn.value) {
            button.classList.toggle('active');
        } else if(button.classList.contains('active')) {
            button.classList.remove('active');
            menu.value.classList.remove('menu-open');
            closeMenu();
        } else {
            timelapseBtn.value.classList.remove('active');
            weatherBtn.value.classList.remove('active');
            recommendationBtn.value.classList.remove('active');
            button.classList.add('active');
            menu.value.classList.add('menu-open');
            openMenu();
        }
    }
}
</script>