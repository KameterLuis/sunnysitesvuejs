<template>
    <div class="my-4">
        <button class="text-left flex p-4 rounded-lg -text--sunny-gray bg-gray-100 w-full shadow-lg" @click="handleSignOut">
            <ion-icon :name="icon" class="mr-2 icon-dark"></ion-icon>
            <p>{{ props.text }}</p>
        </button>
    </div>
</template>

<style>
.icon-dark {
    color: var(--sunny-gray);
}
</style>

<script setup>
const props = defineProps({
    text: String,
    icon: String
})
</script>