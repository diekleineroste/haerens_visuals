<script setup lang="ts">
import AtomLogo from "@/components/AtomLogo.vue"
import {ref, computed, watch, onBeforeMount, onMounted, onUnmounted} from "vue";

const coordinates = {
  longitude: { degree: 51, min: 0, sec: 57, secDec: 9 },
  latitude: { degree: 3, min: 44, sec: 1, secDec: 8 }
};

const animatedCoords = ref({
  longitude: { degree: 0, min: 0, sec: 0, secDec: 0 },
  latitude: { degree: 0, min: 0, sec: 0, secDec: 0 }
});

const locked = ref({
  longitude: { degree: false, min: false, sec: false, secDec: false },
  latitude: { degree: false, min: false, sec: false, secDec: false }
});

let animationInterval = null;

const animateCoords = () => {
  let allLocked = true;

  Object.keys(animatedCoords.value).forEach(coordType => {
    Object.keys(animatedCoords.value[coordType]).forEach(component => {
      if (!locked.value[coordType][component]) {
        allLocked = false;
        animatedCoords.value[coordType][component]++;

        if (animatedCoords.value[coordType][component] === coordinates[coordType][component]) {
          locked.value[coordType][component] = true;
        }
      }
    })
  })

  if (allLocked) {
    clearInterval(animationInterval);
  }
}

const initialzeLocked = () => {
  Object.keys(animatedCoords.value).forEach(coordType => {
    Object.keys(animatedCoords.value[coordType]).forEach(component => {
      if (animatedCoords.value[coordType][component] === coordinates[coordType][component]) {
        locked.value[coordType][component] = true;
      }
    })
  })
}

const formatCoord = (coord) => {
  const { degree, min, sec, secDec } = coord;
  return `${degree}°${min.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}.${secDec}"`;
};

const formattedTarget = computed(() => ({
  longitude: formatCoord(animatedCoords.value.longitude),
  latitude: formatCoord(animatedCoords.value.latitude),
  latitude: formatCoord(animatedCoords.value.latitude)
}));

onBeforeMount(() => {
  initialzeLocked()
})

onMounted(() => {
  animationInterval = setInterval(animateCoords, 50);
  animationTimeline();
})

const imgHeightPercentage = ref(0)
const logoTransformXPercentage = ref(120)
const coordsTransformXPercentage = ref(500)

const animationTimeline = () => {
  setTimeout(setTransformXPercentage, 50);
  setTimeout(setHeightPercentage, 2000);
}

const setHeightPercentage = () => {
  imgHeightPercentage.value = 100;
}

const setTransformXPercentage = () => {
  logoTransformXPercentage.value = 0;
  coordsTransformXPercentage.value = 0;
}

const imgStyle = computed(() => {
  const heightValue = `${imgHeightPercentage.value}%`

  return {
    height: heightValue,
  };
});

const logoStyle = computed(() => {
  const transformValue = `translateX(${-logoTransformXPercentage.value}%)`

  return {
    transform: transformValue,
  };
});

const coordStyle = computed(() => {
  const transformValue = `translateX(${coordsTransformXPercentage.value}%)`

  return {
    transform: transformValue,
  };
});
</script>

<template>
  <Teleport to="body">
    <div class="container-loading">
      <div class="container-logo" :style="logoStyle">
        <AtomLogo :border="false" class="logo"/>
      </div>
      <div class="container-img" :style="imgStyle">
        <img src="/assets/loader.webp" alt="loading image"/>
      </div>
      <div class="container-coords" :style="coordStyle">
        <h3 class="montserrat-s24 montserrat-s24-U500">{{ formattedTarget.longitude }}</h3>
        <h3 class="montserrat-s24 montserrat-s24-U500">{{ formattedTarget.latitude }}</h3>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.container {
  &-loading {
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5rem;
    padding: 2rem;
    height: 100vh;
    width: 100vw;
    background: var(--black);
    z-index: 99;
  }

  &-logo {
    transition: all 1.5s ease-in-out;

    .logo {
      width: fit-content;
      height: 15vh;
      fill: var(--white);
    }
  }

  &-img {
    transition: all 1.5s ease-in-out;
    box-sizing: border-box;
    display: block;
    width: 100%;
    border-radius: 1rem;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &-coords {
    transition: all 1.5s ease-in-out;
    align-self: flex-end;
    text-align: right;
  }
}
</style>