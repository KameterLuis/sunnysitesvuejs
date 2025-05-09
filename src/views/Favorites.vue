<template>
  <div class="px-8 pt-12">
    <p class="text-2xl py-4">Favorites</p>
    <div class="overflow-scroll scroll-container h-screen">
      <div class="pb-44">
        <div v-for="favorite in favorites" class="mt-4 flex min-w-full">
          <button
            class="text-left p-4 rounded-lg -text--sunny-gray bg-gray-100 min-w-full shadow-lg"
            @click="openFavorite(favorite.id)"
          >
            <p class="text-xl mb-2 underline">{{ favorite.name }}</p>
            <p>{{ favorite.address }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
p {
  color: var(--sunny-gray);
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
import { onMounted, ref } from "vue";
import { getAllItems } from "@/utils/storage";

const emit = defineEmits(["openFav"]);
const favorites = ref([]);

const openFavorite = (id) => {
  emit("openFav", id);
};

onMounted(async () => {
  const items = await getAllItems();
  for (let item in items) {
    favorites.value.push({
      id: item,
      name: items[item]["name"],
      address: items[item]["address"],
    });
  }
});
</script>
