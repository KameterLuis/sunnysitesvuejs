<template>
    <div class="shadow-sunny rounded-xl w-[200px] bg-white p-[15px] border-[1px]">
        <p class="-text--sunny-gray">{{ title }}</p>
        <div class="w-[170px] mt-3">
            <img :src="imageUrl || getImageUrl()" :alt="title">
        </div>
        <p class="-text--sunny-gray mt-3">{{ description }}</p>
        <ion-button class="mt-4" color="dark" @click="openWebsite">more</ion-button>
    </div>
</template>

<script setup>
import { Browser } from '@capacitor/browser';

const openWebsite = async () => {
    await Browser.open({ url: props.locationUrl });
};

const props = defineProps({
    title: String,
    filename: String,
    description: String,
    locationUrl: String,
    imageUrl: String
})

function getImageUrl() {
    return `/src/assets/menu/${props.filename}`;
}
</script>