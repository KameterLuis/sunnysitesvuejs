<template>
    <div class="scroll-container w-screen">
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="sunny" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Sunny Restaurants</p>
        </div>
        <div class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="mt-4 flex space-x-6">
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen." />
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                <div class="pr-6">
                    <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4 mt-6 px-8">
            <ion-icon name="sunny" size="large"></ion-icon>
            <p class="text-xl -text--sunny-gray">Sunny Cafes</p>
        </div>
        <div class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="mt-4 flex space-x-6">
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen." />
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                <div class="pr-6">
                    <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4 mt-6 px-8">
            <p class="text-xl -text--sunny-gray">Restaurants</p>
        </div>
        <div class="scroll-container w-screen overflow-x-scroll px-8 pb-4">
            <div class="mt-4 flex space-x-6">
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen." />
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                <div class="pr-6">
                    <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4 mt-6 px-8">
            <p class="text-xl -text--sunny-gray">Cafes</p>
        </div>
        <div class="scroll-container w-screen overflow-x-scroll px-8 pb-4 mb-32">
            <div class="mt-4 flex space-x-6">
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen." />
                <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                <div class="pr-6">
                    <LocationCard title="Example Restaurant" filename="Restaurant.jpg" description="Alle lieben Tapas - und alle lieben das Tío! Zurecht, sagen wir, denn in dem farbenfrohen Laden in der Theresienstraße kann man sich nur wohlfühlen."/>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
ion-icon {
    color: var(--sunny-orange)
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup>
import LocationCard from './LocationCard.vue';
</script>