<template>
    <div class="w-screen h-[1000px]">
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="sunny" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Sunny Restaurants</p>
        </div>
        <div class="w-screen overflow-x-scroll px-8 pb-4">
            <div class="mt-4 flex space-x-6 w-[425px]">
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen." />
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
            </div>
        </div>
    </div>
</template>

<style>
ion-icon {
    color: var(--sunny-orange)
}
</style>

<script setup>
import LocationCard from './LocationCard.vue';
</script>