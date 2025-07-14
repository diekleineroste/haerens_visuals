<script setup lang="ts">
import { PortfolioCard, GalleryItem } from "@/types";
import {computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch} from "vue";

const props = defineProps<{
  data: PortfolioCard[]
}>()

const LARGE_SCREEN_BREAKPOINT = '(min-width: 55rem)';

const isLargeScreen = ref(false);
const viewportSize = computed(() => {
  return isLargeScreen.value ? 40 : 60
})
    // ref(isLargeScreen.value ? 40 : 60);
const stickyViewRef = ref<HTMLElement>();
const scrollValue = ref(0);
const galleryState = ref({
  isVisible: false,
  items: [] as GalleryItem[],
  currentIdx: 0,
  nextIdx: 0,
  prevIdx: 0
});

let mediaQuery: MediaQueryList | null = null;
let rafId: number | null = null;

onBeforeMount(() => {
  mediaQuery = window.matchMedia(LARGE_SCREEN_BREAKPOINT);
  isLargeScreen.value = mediaQuery.matches;
})

const sectionHeight = computed(() =>
    props.data.length ? `${props.data.length * viewportSize.value}vh` : '0vh'
);

const scroll = computed(() =>
    props.data.length
        ? isLargeScreen.value
            ? `calc(${props.data.length * viewportSize.value}vw - 4rem)`
            : `${props.data.length * viewportSize.value}vh`
        : '0vw'
);

const maxScrollValue = computed(() =>
    props.data.length ? (props.data.length * viewportSize.value) - 100 : 0
);

const transformStyle = computed(() => {
  const translateValue = isLargeScreen.value
      ? `translateX(${-scrollValue.value}vw)`
      : `translateY(${-scrollValue.value}%)`;

  return {
    transform: translateValue,
    [isLargeScreen.value ? 'width' : 'height']: scroll.value
  };
});

const updateScrollValue = () => {
  if (!stickyViewRef.value) return;

  const offsetTop = stickyViewRef.value.parentElement?.offsetTop || 0;
  let newScrollValue = ((window.scrollY - offsetTop) / window.innerHeight) * 100;

  newScrollValue = Math.max(0, Math.min(newScrollValue, maxScrollValue.value));
  scrollValue.value = isLargeScreen.value
      ? newScrollValue
      : (newScrollValue / maxScrollValue.value) * 100;

  rafId = null;
};

const handleScroll = () => {
  if (rafId === null) {
    rafId = requestAnimationFrame(updateScrollValue);
  }
};

const handleMediaChange = (e: MediaQueryListEvent) => {
  isLargeScreen.value = e.matches;
};

const updateGalleryIndices = (currentIdx: number) => {
  const totalItems = props.data.length;
  galleryState.value.nextIdx = currentIdx === totalItems - 1 ? 0 : currentIdx + 1;
  galleryState.value.prevIdx = currentIdx === 0 ? totalItems - 1 : currentIdx - 1;
};

const showGallery = (card: PortfolioCard, idx: number) => {
  const galleryElement = document.querySelector('.gallery-container') as HTMLElement;

  if (galleryElement && isLargeScreen.value) {
    galleryElement.scrollLeft = 0;
    galleryElement.addEventListener('wheel', transformScroll, { passive: false });
    galleryElement.addEventListener('touchmove', transformScroll, { passive: false });
  }

  if (!isLargeScreen.value) {
    const galleryImages = galleryElement.querySelector('.gallery-images');
    galleryImages.scrollTop = 0;
  }

  document.body.classList.add('no-scroll');

  galleryState.value = {
    isVisible: true,
    items: card.gallery,
    currentIdx: idx,
    nextIdx: 0,
    prevIdx: 0
  };

  updateGalleryIndices(idx);
};

const hideGallery = () => {
  document.body.classList.remove('no-scroll');

  const galleryElement = document.querySelector('.gallery-container') as HTMLElement;
  if (galleryElement) {
    galleryElement.scrollLeft = 0;
    galleryElement.scrollTop = 0;
    galleryElement.removeEventListener('wheel', transformScroll);
    galleryElement.removeEventListener('touchmove', transformScroll);
  }

  galleryState.value = {
    isVisible: false,
    items: [],
    currentIdx: 0,
    nextIdx: 0,
    prevIdx: 0
  };
};

const transformScroll = (event: WheelEvent) => {
  if (!event.deltaY) return;

  const target = event.currentTarget as HTMLElement;
  target.scrollLeft += (event.deltaY * 10) + event.deltaX;
  event.preventDefault();
};

watch(() => galleryState.value.currentIdx, (newIdx) => {
  updateGalleryIndices(newIdx);
});

onMounted(() => {
  nextTick(() => {
    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
  });
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange);
  }
  window.removeEventListener('scroll', handleScroll);

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  document.body.classList.remove('no-scroll');
});

const formatGalleryIndex = (idx: number) => String(idx + 1).padStart(2, '0') + '/';

const getAssetPath = (fileName: string) => `/assets/${fileName}`;

const navigateGallery = (direction: 'prev' | 'next') => {
  const targetIdx = direction === 'prev' ? galleryState.value.prevIdx : galleryState.value.nextIdx;
  showGallery(props.data[targetIdx], targetIdx);
};
</script>

<template>
  <section id="portfolio" class="sticky-parent" :style="{ height: sectionHeight }">
    <div ref="stickyViewRef" class="sticky-view">
      <h2 id="portfolio-top" class="montserrat-s24 montserrat-s24-U500">
        let your <span class="playfair playfair-s40 playfair-s40-i400">vision</span>
      </h2>

      <div class="hybrid-scroll-parent">
        <div id="portfolio-cards" class="hybrid-scroll" :style="[transformStyle, !isLargeScreen ? { top: scrollValue + '%' } : {}]">
          <div v-for="(card, idx) in data" :key="`card-${idx}`" class="portfolio-card" @click="showGallery(card, idx)">
            <img v-if="!card.isVideo" :src="getAssetPath(card.fileName)" :alt="card.title" class="card-img" loading="lazy">
            <video v-else :src="getAssetPath(card.fileName)" autoplay loop preload="metadata" muted class="card-img">
            </video>

            <div class="card-overlay">
              <div class="container container-label">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 16C16 7.16344 8.83656 0 0 0H16V16Z" fill="var(--black)"/>
                </svg>

                <div v-if="card?.video" class="label montserrat-s16-U400">video</div>
                <div v-if="card?.photo" class="label montserrat-s16-U400">photo</div>
                <div v-if="card?.graphic" class="label montserrat-s16-U400">graphics</div>

                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 16C16 7.16344 8.83656 0 0 0H16V16Z" fill="var(--black)"/>
                </svg>
              </div>

              <div class="container container-title">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
                </svg>

                <h3 class="montserrat-s16-U700">{{ card.title }}</h3>

                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="portfolio-bottom">
        <h2 class="montserrat-s24 montserrat-s24-U500">
          come to <span class="playfair playfair-s40 playfair-s40-i400">life</span>
        </h2>
        <p>
          I craft extraordinary experiences through visionary design and meticulous execution.
          Every project is a bespoke collaboration where your unique vision becomes reality.
          Discover the possibilities – let's create something remarkable together.
        </p>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div v-show="galleryState.isVisible" class="gallery-container">
      <div class="gallery-indicator">
        <h2 class="montserrat-s24 montserrat-s24-U500">{{ data[galleryState.currentIdx]?.title }}</h2>
      </div>

      <div class="gallery-images">
        <!-- Previous card -->
        <div class="gallery-card opacity" @click="navigateGallery('prev')">
          <img
              v-if="!data[galleryState.prevIdx]?.isVideo"
              :src="getAssetPath(data[galleryState.prevIdx]?.fileName)"
              :alt="data[galleryState.prevIdx]?.title"
              class="card-img"
          >
          <video
              v-else
              :src="getAssetPath(data[galleryState.prevIdx]?.fileName)"
              autoplay
              loop
              preload="metadata"
              muted
              class="card-img"
          >
          </video>

          <div class="card-overlay">
            <div class="container container-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
              <h3 class="montserrat-s16-U700">Prev</h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Gallery items -->
        <div v-for="(image, idx) in galleryState.items" :key="`gallery-${idx}`" class="gallery-card">
          <img
              v-if="!image.isVideo"
              :src="getAssetPath(image.fileName)"
              :alt="`gallery item ${formatGalleryIndex(idx)}`"
              class="card-img"
              loading="lazy"
          >
          <video
              v-else
              :src="getAssetPath(image.fileName)"
              autoplay
              loop
              preload="metadata"
              muted
              class="card-img"
          >
          </video>

          <div class="card-overlay">
            <div class="container container-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
              <h3 class="montserrat-s16-U700">{{ formatGalleryIndex(idx) }}</h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Next card -->
        <div class="gallery-card opacity" @click="navigateGallery('next')">
          <img
              v-if="!data[galleryState.nextIdx]?.isVideo"
              :src="getAssetPath(data[galleryState.nextIdx]?.fileName)"
              :alt="data[galleryState.nextIdx]?.title"
              class="card-img"
          >
          <video
              v-else
              :src="getAssetPath(data[galleryState.nextIdx]?.fileName)"
              autoplay
              loop
              preload="metadata"
              muted
              class="card-img"
          >
          </video>

          <div class="card-overlay">
            <div class="container container-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
              <h3 class="montserrat-s16-U700">Next</h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-0.5 -0.5C-0.5 8.83656 7.16344 16.5 16.5 16.5H-0.5V-0.5Z" fill="var(--black)"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="gallery-indicator">
        <button @click="hideGallery" class="close-btn">
          close
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.sticky-parent {
  padding: 0;
  position: relative;

  .sticky-view {
    position: sticky;
    top: .8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    height: calc(100vh - 4rem);
    padding: 0 .8rem;
    overflow: hidden;

    .hybrid-scroll-parent {
      position: relative;
      height: 100%;
      overflow: hidden;
      padding: 1rem 0;
      border-radius: 1rem;

      .hybrid-scroll {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 4rem;
        height: 100%;
        will-change: transform;

        .portfolio-card {
          position: relative;
          height: 100%;
          max-height: fit-content;
          width: 100%;
          min-width: 20rem;
          cursor: pointer;

          .card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .container {
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
              gap: .5rem;
              padding: .6rem;
              width: fit-content;
              background: var(--black);

              &-label {
                align-self: flex-end;
                border-bottom-left-radius: 1rem;

                svg {
                  position: absolute;

                  &:first-of-type {
                    left: 1px;
                    top: -1px;
                    border-top: 1px solid var(--black);
                    border-right: 1px solid var(--black);
                    transform: translateX(-100%);
                  }

                  &:last-of-type {
                    right: -1px;
                    bottom: 1px;
                    border-top: 1px solid var(--black);
                    border-right: 1px solid var(--black);
                    transform: translateY(100%);
                  }
                }
              }

              &-title {
                align-self: flex-start;
                border-top-right-radius: 1rem;

                svg {
                  position: absolute;

                  &:first-of-type {
                    left: -1px;
                    top: 1px;
                    border-bottom: 1px solid var(--black);
                    border-left: 1px solid var(--black);
                    transform: translateY(-100%);
                  }

                  &:last-of-type {
                    right: 1px;
                    bottom: -1px;
                    border-bottom: 1px solid var(--black);
                    border-left: 1px solid var(--black);
                    transform: translateX(100%);
                  }
                }
              }
            }
          }

          .card-img {
            height: 100%;
            width: 100%;
            border-radius: 1rem;
            object-fit: cover;
          }
        }
      }
    }

    #portfolio-top {
      display: flex;
      gap: .4rem;

      span {
        margin-top: -.4rem;
      }
    }

    #portfolio-bottom {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 2rem;

      h2 {
        align-self: flex-end;
      }

      p {
        align-self: center;
        text-align: center;
        max-width: 27rem;
      }
    }
  }
}

.gallery-container {
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  top: 0;
  left: 0;
  width: 100vw;
  width: 100svw;
  height: 100vh;
  height: 100svh;
  z-index: 2;
  background-color: var(--black);
  overflow-x: hidden;

  .gallery-images {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
    margin: 0 1rem;
    width: fit-content;
    border-radius: 1rem;
    overflow-y: scroll;

    .gallery-card {
      position: relative;
      height: fit-content;
      width: 100%;
      pointer-events: none;

      &.opacity {
        opacity: .3;
        height: 10rem;
        cursor: pointer;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 0.6;
        }

        .card-img {
          object-fit: cover;
        }
      }

      .card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column-reverse;
        justify-content: space-between;

        .container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: .5rem;
          padding: 1rem;
          width: fit-content;
          background: var(--black);

          &-title {
            align-self: flex-start;
            border-top-right-radius: 1rem;

            svg {
              position: absolute;

              &:first-of-type {
                left: -1px;
                top: 1px;
                border-bottom: 1px solid var(--black);
                border-left: 1px solid var(--black);
                transform: translateY(-100%);
              }

              &:last-of-type {
                right: 1px;
                bottom: -1px;
                border-bottom: 1px solid var(--black);
                border-left: 2px solid var(--black);
                transform: translateX(100%);
              }
            }
          }
        }
      }

      .card-img {
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-radius: 1rem;
      }
    }
  }

  .gallery-indicator {
    box-sizing: border-box;
    position: sticky;
    left: 0;
    width: 100%;
    height: fit-content;
    padding: 1.4rem 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .close-btn {
      background: var(--primary);
      padding: .5rem 1rem;
      border-radius: .5rem;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: transform 0.2s ease;
    }
  }
}

@media screen and (width >= 55rem) {
  .sticky-parent {
    .sticky-view {
      top: 2rem;
      gap: 4rem;
      padding: 0 2rem;

      .hybrid-scroll-parent {
        overflow: unset;

        .hybrid-scroll {
          top: 0;
          flex-direction: row;
          gap: 5vw;

          .portfolio-card {
            max-height: none;
            width: auto;

            .card-img {
              width: auto;
            }

            .card-overlay {
              .container {
                padding: 1rem;
              }
            }
          }
        }
      }

      #portfolio-bottom {
        flex-direction: row-reverse;

        h2 {
          align-self: flex-start;
        }

        p {
          align-self: unset;
          text-align: left;
        }
      }
    }
  }

  .gallery-container {
    padding: 1rem 0;
    top: 0;
    left: 0;
    overflow-x: scroll;

    .gallery-images {
      flex-direction: row;
      margin: 0;
      padding: 0 1rem;
      overflow-y: unset;

      .gallery-card {
        height: 80vh;

        &.opacity {
          height: 100%;
          width: 20rem;

          .card-img {
            height: 100%;
            width: 20rem;
          }
        }

        .card-img {
          height: 80vh;
          max-width: 90vw;
          width: fit-content;
          object-fit: cover;
        }
      }
    }

    .gallery-indicator {
      height: 100%;
      padding: 1rem 0;
    }
  }
}
</style>