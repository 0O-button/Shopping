<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const menus = [
  { path: '/user', label: '个人资料', icon: 'User' },
  { path: '/user/order', label: '我的订单', icon: 'List' },
  { path: '/user/address', label: '收货地址', icon: 'Location' }
]

const activePath = computed(() => route.path)
</script>

<template>
  <div class="user-layout container">
    <aside class="user-layout__aside">
      <div class="user-card">
        <el-avatar :size="60" :src="userStore.userInfo.avatar" />
        <p class="nickname">{{ userStore.userInfo.nickname || '未登录' }}</p>
        <p class="username">@{{ userStore.userInfo.username || '-' }}</p>
      </div>

      <ul class="menu">
        <li
          v-for="m in menus"
          :key="m.path"
          :class="['menu__item', { active: activePath === m.path }]"
          @click="$router.push(m.path)"
        >
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.label }}</span>
        </li>
      </ul>
    </aside>

    <main class="user-layout__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.user-layout {
  display: flex;
  gap: 20px;
  padding: 20px 0 40px;

  &__aside {
    flex-shrink: 0;
    width: 220px;
  }

  &__main {
    flex: 1;
    min-width: 0;
    background: $white;
    border-radius: 4px;
    padding: 24px;
    min-height: 500px;
  }
}

.user-card {
  background: $white;
  border-radius: 4px;
  padding: 24px 16px;
  text-align: center;
  margin-bottom: 16px;

  .nickname {
    margin-top: 12px;
    font-size: 15px;
    color: $text-color;
    font-weight: 600;
  }
  .username {
    margin-top: 4px;
    font-size: 12px;
    color: $text-light;
  }
}

.menu {
  background: $white;
  border-radius: 4px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    font-size: 14px;
    color: $text-normal;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.2s;

    &:hover {
      background: #fff5f5;
      color: $primary-color;
    }

    &.active {
      background: #fff5f5;
      color: $primary-color;
      border-left-color: $primary-color;
      font-weight: 600;
    }
  }
}
</style>