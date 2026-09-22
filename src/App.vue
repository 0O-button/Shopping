<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const route = useRoute()
const userStore = useUserStore()
const isFullScreen = computed(() => route.meta.fullScreen)

onMounted(() => {
  userStore.restore()
})
</script>

<template>
  <div class="app">
    <AppHeader v-if="!isFullScreen" />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
    <AppFooter v-if="!isFullScreen" />
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  flex: 1;
}
</style>