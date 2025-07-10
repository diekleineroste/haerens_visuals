<script setup lang="ts">
import { Client } from "@/types.js";
import {ref, onMounted, onBeforeUnmount} from "vue";

const props = defineProps<{
  data: Client[]
}>()
const date = ref<Date | null>(null);
const clientContainerRef = ref<HTMLElement>();
const targetImages = ref<Client[]>([]);

const isLargeScreen = ref(false)
let mediaQuery = null

const handleMediaChange = (e) => {
  isLargeScreen.value = e.matches
}

const showImage = (idx: number) => {
  targetImages.value.unshift(props.data[idx])
  date.value = new Date();
}

const removeImage = () => {
  targetImages.value.pop()
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 55rem)')
  isLargeScreen.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)
  if (isLargeScreen.value) {
    for (let i = 0; i < clientContainerRef.value.children.length; i++) {
      clientContainerRef.value.children[i].addEventListener('mouseover', () => showImage(i))
      clientContainerRef.value.children[i].addEventListener('mouseleave', removeImage)
    }
  }
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange);
  }
  if (isLargeScreen.value) {
    for (let i = 0; i < clientContainerRef.value.children.length; i++) {
      clientContainerRef.value.children[i].removeEventListener('mouseover', () => showImage(i));
      clientContainerRef.value.children[i].removeEventListener('mouseleave', removeImage);
    }
  }
})
</script>

<template>
  <section id="clients">
    <h2 class="montserrat-s24 montserrat-s24-U500">
      past & present<br>
      clients
    </h2>
    <div ref="clientContainerRef" class="container">
      <img v-for="(client, idx) in data" :key="idx" :src="`./assets/${client.fileLogo}`" :alt="client.name">
    </div>
  </section>
  <Teleport to="body">
    <transition-group v-if="isLargeScreen" name="show" tag="div" class="image-container">
      <div v-for="(img, idx) in targetImages" :key="idx + img.name + date + date.getMilliseconds()" :style="{zIndex: -idx}">
        <img :src="`./assets/${img.fileName}`" :alt="img.name">
      </div>
    </transition-group>
  </Teleport>
</template>

<style scoped lang="scss">
section#clients {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;

  h2 {
    align-self: flex-start;
  }

  .container {
    display: flex;
    flex-wrap: wrap;
    row-gap: 1rem;
    column-gap: 2rem;
    justify-content: flex-end;
    width: 85%;

    img {
      height: 3rem;
      border-radius: .2rem;
    }
  }
}

@media screen and (width >= 55rem) {
  section#clients {
    flex-direction: row;
    align-items: center;
    gap: 0;

    h2 {
      align-self: unset;
    }

    .container {
      flex-wrap: wrap-reverse;
      row-gap: 2rem;
      column-gap: 4rem;
      width: 50vw;

      img {
        height: 4rem;
      }
    }
  }

  .image-container {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    transform: translate(-50%, -50%);
    overflow: hidden;
    z-index: 1;

    div {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50vw;
      height: 50vh;
      margin-top: 30vh;
      margin-left: 25%;

      img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        border-radius: .8rem;
      }
    }
  }
}

.show-enter-active {
  transition: all 0.5s ease-out;
}
.show-leave-active {
  transition: all 0.5s ease-in;
}
.show-enter-from {
  opacity: 0;
  transform: translateX(-4rem) translateY(50vh) rotate(-10deg);
}
.show-leave-to {
  opacity: 0;
  transform: translateX(4rem) translateY(50vh) rotate(10deg);
}
</style>