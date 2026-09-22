<script setup>
import { ref, onMounted } from 'vue'
import { getBanners, getCategories, getFloors } from '@/api/home'
import CategoryMenu from '@/components/home/CategoryMenu.vue'
import HomeBanner from '@/components/home/HomeBanner.vue'
import GoodsCard from '@/components/home/GoodsCard.vue'

defineOptions({ name: 'Home' })

const loading = ref(true)
const banners = ref([])
const categories = ref([])
const floors = ref([])

async function loadData() {
  loading.value = true
  try {
    const [b, c, f] = await Promise.all([
      getBanners(),
      getCategories(),
      getFloors()
    ])
    banners.value = b
    categories.value = c
    floors.value = f
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="home">
    <!-- 首屏：分类 + 轮播 -->
    <div class="hero">
      <div class="container hero__inner">
        <CategoryMenu class="hero__cate" :categories="categories" />
        <HomeBanner class="hero__banner" :banners="banners" />
      </div>
    </div>

    <!-- 商品楼层 -->
    <div class="container">
      <el-skeleton v-if="loading" :rows="6" animated style="margin-top: 30px" />

      <section v-for="floor in floors" :key="floor.id" class="floor">
        <div class="floor__head">
          <h2 class="floor__title">{{ floor.title }}</h2>
          <span class="floor__sub">{{ floor.subTitle }}</span>
          <a class="floor__more" href="javascript:;">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </a>
        </div>

        <div class="floor__body">
          <GoodsCard
            v-for="goods in floor.goods"
            :key="goods.id"
            :goods="goods"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* ========== 首屏：分类 + 轮播 ========== */
.hero {
  background: $white;

  &__inner {
    display: grid;
    grid-template-columns: 210px 1fr;   /* 左 210，右占满剩余 */
    height: 480px;
  }

  &__cate {
    /* 左侧分类菜单 */
  }

  &__banner {
    min-width: 0;
    overflow: hidden;
  }
}

/* ========== 商品楼层 ========== */
.floor {
  margin-top: 36px;

  &__head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid $primary-color;
  }

  &__title {
    font-size: 22px;
    color: $text-color;
    font-weight: 700;
  }

  &__sub {
    font-size: 13px;
    color: $text-light;
  }

  &__more {
    margin-left: auto;
    font-size: 13px;
    color: $text-light;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover { color: $primary-color; }
  }

  &__body {
    display: grid;
    grid-template-columns: repeat(5, 1fr);   /* 一行 5 个 */
    gap: 16px;
  }
}
</style>