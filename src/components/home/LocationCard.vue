<template>
    <div class="shadow-sunny rounded-xl w-[200px] bg-white p-[15px]">
        <p class="-text--sunny-gray">{{ title }}</p>
        <div class="w-[170px] mt-3">
            <img :src="getImageUrl()" :alt="title">
        </div>
        <p class="-text--sunny-gray mt-3">{{ description }}</p>
    </div>
</template>

<style>
ion-icon {
    color: var(--sunny-orange)
}
</style>

<script setup>
const props = defineProps({
    title: String,
    filename: String,
    description: String,
    locationUrl: String
})

function getImageUrl() {
    return `/src/assets/menu/${props.filename}`;
}
</script>