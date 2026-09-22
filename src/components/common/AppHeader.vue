<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import LocationPicker from './LocationPicker.vue'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const keyword = ref('')
const hotWords = ['手机', '笔记本电脑', '空气炸锅', '运动鞋', '口红']

// 搜索栏右侧 4 个快捷入口
const quickLinks = [
  { icon: 'Ticket', label: '优惠券', path: '#' },
  { icon: 'Present', label: '新人礼', path: '#' },
  { icon: 'Van', label: '查订单', path: '/user/order' },
  { icon: 'Service', label: '客服', path: '#' }
]

function handleSearch() {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  router.push({ path: '/search', query: { keyword: keyword.value.trim() } })
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
    userStore.logout()
    cartStore.clear()
    ElMessage.success('已退出登录')
    router.push('/home')
  } catch (e) {}
}

function handleCommand(cmd) {
  if (cmd === 'logout') handleLogout()
  else if (typeof cmd === 'string' && cmd.startsWith('/')) router.push(cmd)
}

function handleQuickLink(path) {
  if (path === '#') {
    ElMessage.info('该功能演示中')
    return
  }
  router.push(path)
}
</script>




<template>
  <header class="app-header">
    <!-- ① 顶部工具条 -->
    <div class="top-bar">
      <div class="container top-bar__inner">
        <!-- 左：定位 -->
        <div class="left">
          <LocationPicker class="item" />
        </div>

        <!-- 右：头像下拉 + 快捷菜单 -->
        <div class="right">
  <!-- 快捷菜单 -->
  <router-link class="item" to="/user/order">我的订单</router-link>
  <span class="divider">|</span>
  <router-link class="item" to="/user">会员中心</router-link>
  <span class="divider">|</span>
  <router-link class="item" to="/cart">购物车</router-link>
  <span class="divider">|</span>
  <a class="item" href="#">客户服务</a>
  <span class="divider">|</span>
  <a class="item" href="#">网站导航</a>

  <!-- 最右：头像 / 登录注册 -->
  <span class="divider">|</span>

  <!-- 已登录 -->
  <el-dropdown
    v-if="userStore.isLogin"
    trigger="hover"
    placement="bottom-end"
    @command="handleCommand"
  >
    <div class="avatar-entry">
      <el-avatar :size="22" :src="userStore.userInfo.avatar" />
      <el-icon class="arrow"><ArrowDown /></el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <div class="hello-tip">
          你好，{{ userStore.userInfo.nickname || '用户' }}
        </div>
        <el-dropdown-item command="/user">
          <el-icon><User /></el-icon> 个人中心
        </el-dropdown-item>
        <el-dropdown-item command="/user/order">
          <el-icon><List /></el-icon> 我的订单
        </el-dropdown-item>
        <el-dropdown-item command="/user/address">
          <el-icon><Location /></el-icon> 收货地址
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon> 退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 未登录 -->
  <template v-else>
    <router-link class="item link" to="/login">请登录</router-link>
    <span class="divider">|</span>
    <router-link class="item link" to="/register">免费注册</router-link>
  </template>
</div>
</div>
    </div>

    <!-- ② 搜索区 -->
    <div class="search-bar">
      <div class="container search-bar__inner">
        <router-link to="/home" class="logo">
          <span class="logo__text">优选商城</span>
        </router-link>

        <div class="search-box">
          <div class="search-box__input">
            <el-input
              v-model="keyword"
              placeholder="搜索商品，共 10 万+ 好物"
              size="large"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="danger" size="large" @click="handleSearch">搜索</el-button>
          </div>
          <div class="search-box__hot">
            <span
              v-for="(w, i) in hotWords"
              :key="w"
              :class="['hot-item', { 'is-first': i === 0 }]"
              @click="keyword = w; handleSearch()"
            >{{ w }}</span>
          </div>
        </div>

        <!-- 快捷入口 + 购物车 -->
        <div class="search-bar__right">
          <div class="quick-links">
            <div
              v-for="q in quickLinks"
              :key="q.label"
              class="quick-link"
              @click="handleQuickLink(q.path)"
            >
              <el-icon><component :is="q.icon" /></el-icon>
              <span>{{ q.label }}</span>
            </div>
          </div>

          <router-link to="/cart" class="cart-entry">
            <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0">
              <el-button size="large">
                <el-icon><ShoppingCart /></el-icon>
                我的购物车
              </el-button>
            </el-badge>
          </router-link>
        </div>
      </div>
    </div>

    <!-- ③ 主导航 -->
    <nav class="main-nav">
      <div class="container main-nav__inner">
        <a href="#" class="all-category">
          <el-icon><Menu /></el-icon> 全部商品分类
        </a>
        <router-link to="/home" class="nav-item">首页</router-link>
        <a href="#" class="nav-item">秒杀</a>
        <a href="#" class="nav-item">优惠券</a>
        <a href="#" class="nav-item">品牌闪购</a>
        <a href="#" class="nav-item">PLUS会员</a>
        <a href="#" class="nav-item">企业采购</a>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
/* ========== 顶部工具条 ========== */
.top-bar {
  height: 32px;
  line-height: 32px;
  background: $bg-gray;
  border-bottom: 1px solid $border-color;
  font-size: 12px;
  color: $text-normal;

  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left { display: flex; align-items: center; }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;

    .item {
      color: $text-normal;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      &:hover { color: $primary-color; }
    }

    .divider {
      color: #ddd;
      font-size: 11px;
      user-select: none;
    }

    /* 头像入口 */
    .avatar-entry {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 0 4px;
      height: 32px;
      outline: none;

      .arrow {
        font-size: 10px;
        color: $text-light;
        transition: transform 0.2s;
      }

      &:hover {
        .arrow { color: $primary-color; }
      }
    }
  }
}

/* 下拉里的"你好 xxx" */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

:deep(.hello-tip) {
  padding: 6px 20px 4px;
  font-size: 12px;
  color: $text-light;
  border-bottom: 1px dashed $border-color;
  margin-bottom: 4px;
}

/* ========== 搜索区 ========== */
.search-bar {
  background: $white;
  padding: 22px 0;

  &__inner {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .logo {
    flex-shrink: 0;
    &__text {
      font-size: 30px;
      font-weight: 800;
      color: $primary-color;
      letter-spacing: 2px;
    }
  }

  .search-box {
    flex: 1;
    max-width: 560px;

    &__input {
      display: flex;
      :deep(.el-input__wrapper) { border-radius: 4px 0 0 4px; }
      :deep(.el-button) {
        border-radius: 0 4px 4px 0;
        padding: 0 28px;
      }
    }

    &__hot {
      margin-top: 8px;
      font-size: 12px;
      color: $text-light;
      display: flex;
      gap: 14px;

      .hot-item {
        cursor: pointer;
        &:hover { color: $primary-color; }
        &.is-first { color: $primary-color; }
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* 4 个快捷入口 */
  .quick-links {
    display: flex;
    gap: 16px;

    .quick-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: $text-normal;
      cursor: pointer;
      padding: 0 4px;
      transition: color 0.15s;

      .el-icon {
        font-size: 20px;
        color: $primary-color;
      }

      &:hover { color: $primary-color; }
    }
  }

  .cart-entry { flex-shrink: 0; }
}

/* ========== 主导航 ========== */
.main-nav {
  background: $white;
  border-bottom: 2px solid $primary-color;

  &__inner {
    display: flex;
    align-items: center;
    height: 42px;
  }

  .all-category {
    width: 210px;
    height: 42px;
    line-height: 42px;
    background: $primary-color;
    color: $white;
    font-size: 15px;
    font-weight: 600;
    padding-left: 16px;
    display: flex;
    align-items: center;
    gap: 8px;   
  }

  .nav-item {
    padding: 0 24px;
    font-size: 15px;
    font-weight: 600;
    color: $text-color;
    line-height: 42px;

    &:hover { color: $primary-color; }
  }
}
</style>