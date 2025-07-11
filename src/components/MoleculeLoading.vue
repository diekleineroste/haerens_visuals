<script setup lang="ts">
import AtomLogo from "@/components/AtomLogo.vue"
import { ref, computed, onMounted, watch } from "vue";

// Minimal state - let CSS handle the timing
const animatedCoords = ref({
  longitude: { degree: 0, min: 0, sec: 0, secDec: 0 },
  latitude: { degree: 0, min: 0, sec: 0, secDec: 0 }
});

const started = ref(false);
const visible = ref(true);
const animationComplete = ref(false);

// Target coordinates
const TARGET_COORDINATES = {
  longitude: { degree: 51, min: 0, sec: 57, secDec: 9 },
  latitude: { degree: 3, min: 44, sec: 1, secDec: 8 }
};

// Simple counter animation using RAF
let animationFrame: number | null = null;

const animateCoords = () => {
  let allComplete = true;

  (['longitude', 'latitude']).forEach(coordType => {
    (['degree', 'min', 'sec', 'secDec']).forEach(component => {
      if (animatedCoords.value[coordType][component] < TARGET_COORDINATES[coordType][component]) {
        animatedCoords.value[coordType][component]++;
        allComplete = false;
      }
    });
  });

  if (!allComplete) {
    animationFrame = requestAnimationFrame(() => {
      setTimeout(animateCoords, 32);
    });
  }
};

const formatCoord = (coord: typeof animatedCoords.value.longitude) => {
  const { degree, min, sec, secDec } = coord;
  return `${degree}°${min.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}.${secDec}"`;
};

const formattedTarget = computed(() => ({
  longitude: formatCoord(animatedCoords.value.longitude),
  latitude: formatCoord(animatedCoords.value.latitude)
}));

onMounted(() => {
  // Prevent body scroll and start animations
  document.body.classList.add('no-scroll');

  // Start coordinate animation
  animateCoords();

  // Trigger CSS animations
  requestAnimationFrame(() => {
    started.value = true;
  });
});

// Watch for animation completion via CSS custom property
watch(animationComplete, (isComplete) => {
  if (isComplete) {
    document.body.classList.remove('no-scroll');
    visible.value = false;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }
});

// Check animation state periodically
const checkAnimationState = () => {
  if (!visible.value || !started.value) return;

  const element = document.querySelector('.container-loading');
  if (element) {
    const computedStyle = getComputedStyle(element);
    const progress = computedStyle.getPropertyValue('--animation-progress').trim();

    if (progress === '1') {
      animationComplete.value = true;
      return;
    }
  }

  requestAnimationFrame(checkAnimationState);
};

// Start checking animation state after animations begin
watch(started, (hasStarted) => {
  if (hasStarted) {
    requestAnimationFrame(checkAnimationState);
  }
});
</script>

<template>
  <Teleport to="body">
    <div
        v-if="visible"
        class="container-loading"
        :class="{ started }"
    >
      <div class="container-logo">
        <AtomLogo :border="false" class="logo"/>
      </div>

      <div class="container-img">
        <img
            src="/assets/loader.webp"
            alt="loading image"
            loading="eager"
            decoding="async"
        />
      </div>

      <div class="container-coords">
        <h3 class="montserrat-s24 montserrat-s24-U500">{{ formattedTarget.longitude }}</h3>
        <h3 class="montserrat-s24 montserrat-s24-U500">{{ formattedTarget.latitude }}</h3>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.container-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--black);
  z-index: 99;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.2rem;
  padding: .8rem;
  box-sizing: border-box;

  --animation-progress: 0;

  transform: translateZ(0);
  backface-visibility: hidden;
}

.container-logo {
  transform: translateX(-120%);

  .logo {
    width: 80vw;
    max-width: 30rem;
    height: fit-content;
    fill: var(--white);
  }
}

.container-img {
  position: relative;
  width: 100%;
  height: 0%;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translate(-50%, -50%);
    border-radius: 1rem;
    backface-visibility: hidden;
  }
}

.container-coords {
  align-self: flex-end;
  text-align: right;
  transform: translateX(180%);
}

@media screen and (width >= 55rem) {
  .container-loading {
    gap: 5rem;
    padding: 2rem;
  }

  .container-logo {
    transform: translateX(-50%);

    .logo {
      width: fit-content;
      max-width: unset;
      height: 15vh;
    }
  }
}

/* ANIMATIONS */
.container-loading.started {
  .container-logo {
    animation: slideInLeft 1.5s ease-in-out forwards;
  }

  .container-img {
    animation: expandHeight 1.5s ease-in-out 1.5s forwards;

    img {
      animation: expandToFullscreen 1.5s ease-in-out 3s forwards;
    }
  }

  .container-coords {
    animation: slideInRight 1.5s ease-in-out forwards;
  }

  animation: masterTimeline 5s ease-in-out forwards;
}

@keyframes slideInLeft {
  to {
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  to {
    transform: translateX(0);
  }
}

@keyframes expandHeight {
  to {
    height: 100%;
  }
}

@keyframes expandToFullscreen {
  to {
    width: 100vw;
    height: 110vh;
    border-radius: 0;
  }
}

@keyframes masterTimeline {
  0% {
    --animation-progress: 0;
    opacity: 1;
  }
  60% {
    --animation-progress: 0;
    opacity: 1;
  }
  99% {
    --animation-progress: 0;
    opacity: 0;
  }
  100% {
    --animation-progress: 1;
    opacity: 0;
  }
}

:global(body.no-scroll) {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
</style>