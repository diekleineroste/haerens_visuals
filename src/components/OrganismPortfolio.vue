<script setup lang="ts">
import { PortfolioCard } from "@/types";
import {computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref} from "vue";

const props = defineProps<{
  data: PortfolioCard[]
}>()

const isLargeScreen = ref(false)
let mediaQuery = null

const handleMediaChange = (e) => {
  isLargeScreen.value = e.matches
}

const stickyViewRef = ref<HTMLElement>();

const scrollValue = ref(0);

const sectionHeight = computed(() =>
    props.data.length ? `${props.data.length * 50}vh` : '0vh'
);

const scroll = computed(() =>
    props.data.length ? isLargeScreen.value ? `calc(${props.data.length * 50}vw - 4rem)` : `${props.data.length * 50}vh` : '0vw'
);

const maxValue = computed(() =>
    props.data.length ? (props.data.length * 50) - 100 : 0
);

const transformStyleLarge = computed(() => ({
  transform: `translateX(${-scrollValue.value}vw)`,
  width: scroll.value
}));

const transformStyleSmall = computed(() => ({
  transform: `translateY(${-scrollValue.value}%)`,
  height: scroll.value
}));

let ticking = false;

const updateScrollValue = () => {
  if (!stickyViewRef.value) return;

  const offsetTop = stickyViewRef.value.parentElement?.offsetTop || 0;
  let newScrollValue = ((window.scrollY - offsetTop) / window.innerHeight) * 100;

  newScrollValue = Math.max(0, Math.min(newScrollValue, maxValue.value));
  scrollValue.value = isLargeScreen.value ? newScrollValue : (newScrollValue / maxValue.value) * 100;
  ticking = false;
};

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollValue);
    ticking = true;
  }
};

onMounted(() => {
  nextTick();
  mediaQuery = window.matchMedia('(min-width: 55rem)')
  isLargeScreen.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <section id="portfolio" class="sticky-parent" :style="{ height: sectionHeight }">
    <div ref="stickyViewRef" class="sticky-view">
      <h2 id="portfolio-top" class="montserrat-s24 montserrat-s24-U500">
        let your <span class="playfair playfair-s40 playfair-s40-i400">vision</span>
      </h2>

      <div class="hybrid-scroll-parent">
        <div id="portfolio-cards" ref="scrollSectionRef" class="hybrid-scroll" :style="[(isLargeScreen ? transformStyleLarge : transformStyleSmall), isLargeScreen ? '' : 'top:' + scrollValue + '%;']" >

        <div v-for="(card, idx) in data" :key="idx" class="portfolio-card">
          <img :src="`/assets/${card.fileName}`" :alt="card.title">
          <div class="card-overlay">
            <div class="container container-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 16C16 7.16344 8.83656 0 0 0H16V16Z" fill="var(--black)"/>
              </svg>

              <div class="label montserrat-s16-U400" v-if="card?.video">video</div>
              <div class="label montserrat-s16-U400" v-if="card?.photo">photo</div>
              <div class="label montserrat-s16-U400" v-if="card?.graphic">graphic</div>

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 16C16 7.16344 8.83656 0 0 0H16V16Z" fill="var(--black)"/>
              </svg>
            </div>
            <div class="container container-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0C0 8.83656 7.16344 16 16 16H0V0Z" fill="var(--black)"/>
              </svg>

              <h3 class="montserrat-s16-U700">{{ card.title }}</h3>

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0C0 8.83656 7.16344 16 16 16H0V0Z" fill="var(--black)"/>
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
          min-width: 20rem;

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

          img {
            height: 100%;
            width: 100%;
            border-radius: 1rem;
            object-fit: cover;
          }
        }
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
          gap: 8rem;

          .portfolio-card {
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
}
</style>