<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  goods: { type: Object, required: true }
})

const router = useRouter()

function goDetail() {
  router.push(`/goods/${props.goods.id}`)
}
</script>

<template>
  <div class="goods-card" @click="goDetail">
    <div class="goods-card__img">
      <img :src="goods.image" :alt="goods.name" loading="lazy" />
      <span v-if="goods.tag" class="tag">{{ goods.tag }}</span>
    </div>

    <div class="goods-card__info">
      <p class="price">
        <em>¥</em>{{ goods.price }}
      </p>
      <p class="name ellipsis-2">{{ goods.name }}</p>
      <p class="desc ellipsis">{{ goods.desc }}</p>
      <p class="sales">已售 {{ goods.sales }} 件</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.goods-card {
  width: 100%;
  background: $white;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    border-color: $primary-color;
  }

  &__img {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: $bg-gray;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .tag {
      position: absolute;
      left: 0;
      top: 0;
      background: $primary-color;
      color: $white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 0 0 6px 0;
    }
  }

  &:hover &__img img {
    transform: scale(1.06);
  }

  &__info {
    padding: 10px 12px 14px;

    .price {
      color: $primary-color;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;

      em {
        font-size: 13px;
        font-style: normal;
        margin-right: 1px;
      }
    }

    .name {
      margin-top: 6px;
      font-size: 13px;
      line-height: 20px;
      height: 40px;
      color: $text-color;
    }

    .desc {
      margin-top: 4px;
      font-size: 12px;
      color: $text-light;
    }

    .sales {
      margin-top: 6px;
      font-size: 12px;
      color: $text-light;
    }
  }
}
</style>