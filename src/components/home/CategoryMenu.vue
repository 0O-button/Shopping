<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  categories: { type: Array, default: () => [] }
})

function goSearch(name) {
  router.push({ path: '/search', query: { keyword: name } })
}
</script>

<template>
  <div class="category-menu">
    <ul class="category-menu__list">
      <li
        v-for="item in categories"
        :key="item.id"
        class="category-menu__item"
      >
        <span class="name" @click="goSearch(item.name)">{{ item.name }}</span>
        <span class="arrow"><el-icon><ArrowRight /></el-icon></span>

        <!-- 二级悬浮面板 -->
        <div v-if="item.children && item.children.length" class="sub-panel">
          <div class="sub-panel__inner">
            <dl v-for="group in item.children" :key="group.name">
              <dt>{{ group.name }}：</dt>
              <dd>
                <a
                  v-for="sub in group.items"
                  :key="sub"
                  href="javascript:;"
                  @click="goSearch(sub)"
                >{{ sub }}</a>
              </dd>
            </dl>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.category-menu {
  position: relative;
  width: 210px;
  height: 480px;
  background: rgba(0, 0, 0, 0.6);
  color: $white;
  z-index: 10;

  &__item {
    position: relative;
    height: 48px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    cursor: pointer;

    .name {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .arrow {
      font-size: 12px;
      opacity: 0.7;
    }

    &:hover {
      background: $primary-color;

      .sub-panel { display: block; }
    }
  }

  .sub-panel {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    width: 700px;
    min-height: 480px;
    background: $white;
    color: $text-color;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    padding: 20px 24px;
    z-index: 20;

    &__inner dl {
      display: flex;
      margin-bottom: 16px;
      font-size: 13px;

      dt {
        flex-shrink: 0;
        width: 90px;
        font-weight: 700;
        color: $text-color;
      }

      dd a {
        color: $text-normal;
        margin-right: 16px;
        display: inline-block;
        &:hover { color: $primary-color; }
      }
    }
  }
}
</style>