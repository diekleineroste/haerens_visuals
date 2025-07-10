<script setup lang="ts">
import AtomLogo from "@/components/AtomLogo.vue";
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { Data } from "@/types";
import PortfolioSection from "@/components/OrganismPortfolio.vue";
import ClientsSection from "@/components/OrganismClients.vue";
import ConnectSection from "@/components/OrganismConnect.vue";
import MoleculeLoading from "@/components/MoleculeLoading.vue";

const data = ref<Data>(null);

const heroBackgroundStyle = computed(() => ({
  backgroundImage: data.value?.header.fileName ? `url('./assets/${data.value.header.fileName}')` : 'none'
}));

const getData = async () => {
  try {
    const res = await fetch('/data.json');
    data.value = await res.json();
  } catch (error) {
    console.error("Haerens Visuals did so good the website couldn't handle it:", error);
  }
};

onMounted(async () => {
  await getData();
});
</script>

<template>
  <header>
    <MoleculeLoading></MoleculeLoading>

    <div class="hero" :style="heroBackgroundStyle">
      <div>
        <h1 class="display playfair">Gallery</h1>
        <AtomLogo :border="true" class="logo"/>
      </div>
      <p class="introductory-text">
        i craft striking <span class="montserrat montserrat-s16 montserrat-s16-i800">VISUALS</span><br>
        and powerful <span class="montserrat montserrat-s16 montserrat-s16-i800">CONTENT</span><br>
        for <span class="montserrat montserrat-s16 montserrat-s16-i800">TEAMS</span>, <span class="montserrat montserrat-s16 montserrat-s16-i800">ATHLETES</span> and <span class="montserrat montserrat-s16 montserrat-s16-i800">BRANDS</span><br>
        who move fast, push limits, and demand excellence.<br>
        every frame, every story, every moment<br>
        - built to <span class="montserrat montserrat-s16 montserrat-s16-i800">inspire</span>.<br>
        based in ghent, creating for the world.<br>
      </p>
      <p class="display-left montserrat-s16-U700">
        EST. 2022
      </p>
      <p class="display-right montserrat-s16-U700">
        scroll down
      </p>
    </div>
  </header>

  <main>
    <PortfolioSection v-if="data?.portfolioCards" :data="data.portfolioCards"/>

    <ClientsSection v-if="data?.clients" :data="data.clients"/>

    <ConnectSection v-if="data?.connect" :data="data.connect"/>
  </main>

  <footer>
    <div>
      <p>© 2025</p>
      <p>website by <a target="_blank" href="https://laurensrousseau.com">rouxdesign</a></p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
header {
  height: calc(95vh - 1.6rem);
  display: flex;
  align-items: start;
  justify-content: center;
  padding: .8rem;
  background: var(--black);

  .hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 90vh;
    background-position: center;
    background-size: cover;
    border-radius: 1rem;

    &::after {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.3);
    }

    div {
      z-index: 1;

      .display {
        font-size: 22vw;
        font-weight: 500;
        font-style: italic;
        text-transform: none;
      }

      .logo {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 78%;
        height: 54rem;
        fill: var(--primary);
        transform: translate(-50%, -50%);
        z-index: -1;
        pointer-events: none;
      }
    }

    p {
      margin: 0;
      z-index: 1;
    }

    .introductory-text {
      display: none;
      position: absolute;
      bottom: 0;
      right: 2%;
      max-width: 25rem;
      transform: translateY(70%);
    }

    .display-left {
      position: absolute;
      bottom: 1rem;
      left: 1.3rem;
    }

    .display-right {
      position: absolute;
      bottom: 1rem;
      right: 1.3rem;
    }
  }
}

main {
  background: var(--black);
}

footer {
  height: 8rem;
  background: var(--black);

  div {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 2rem;
    padding: 0 .8rem;
    background: var(--white);
    z-index: -999;
    box-sizing: border-box;

    p, a {
      color: var(--black);
    }
  }
}

@media screen and (width >= 55rem) {
  header {
    height: calc(100vh - 4rem);
    padding: 2rem;

    .hero {
      height: 80vh;

      div {
        .display {
          font-size: 16rem;
        }

        .logo {
          max-width: 54rem;
        }
      }

      .introductory-text {
        display: block;
        right: 17rem;
        transform: translateY(55%);
      }

      .display-left, .display-right {
        top: unset;
        bottom: 1rem;
      }
    }
  }

  main {
    section {
      padding: 0 2rem;
      margin-bottom: 8rem;
    }
  }
}
</style>