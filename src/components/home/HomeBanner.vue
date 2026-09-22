<script setup>
defineProps({
  banners: { type: Array, default: () => [] }
})
</script>

<template>
  <div class="home-banner">
    <el-carousel height="480px" :interval="4000" arrow="hover">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img class="banner-img" :src="item.image" :alt="item.title" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss">
.home-banner {
  width: 100%;
  height: 480px;

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.el-carousel__indicators) {
    bottom: 16px;
  }
  :deep(.el-carousel__indicator button) {
    width: 24px;
    height: 4px;
    border-radius: 2px;
  }
}
</style>