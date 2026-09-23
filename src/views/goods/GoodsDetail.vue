<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGoodsDetail } from '@/api/goods'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const detail = ref(null)

// 当前选中的主图
const currentImg = ref('')
// 选中的规格
const selectedSpecs = reactive({})
// 购买数量
const num = ref(1)
// Tab 切换：detail=详情 / params=参数
const activeTab = ref('detail')

// 选中的 SKU 组合文字
const specText = computed(() => {
  const parts = []
  Object.entries(selectedSpecs).forEach(([k, v]) => {
    if (v) parts.push(`${k}：${v}`)
  })
  return parts.join(' / ')
})

async function loadDetail(id) {
  loading.value = true
  try {
    const data = await getGoodsDetail(id)
    detail.value = data
    currentImg.value = data.images[0]
    // 重置规格选择
    Object.keys(selectedSpecs).forEach((k) => delete selectedSpecs[k])
    data.specs.forEach((s) => {
      selectedSpecs[s.name] = s.values[0]
    })
    num.value = 1
    activeTab.value = 'detail'
  } finally {
    loading.value = false
  }
}

function changeNum(delta) {
  const next = num.value + delta
  if (next < 1) return
  if (next > detail.value.stock) {
    ElMessage.warning('超过库存数量')
    return
  }
  num.value = next
}

function handleAddCart() {
  if (!detail.value) return
  const missing = detail.value.specs.find((s) => !selectedSpecs[s.name])
  if (missing) {
    ElMessage.warning(`请选择${missing.name}`)
    return
  }

  const addNum = num.value

  cartStore.addItem(
    {
      id: detail.value.id,
      name: detail.value.name,
      price: detail.value.price,
      image: detail.value.image,
      spec: specText.value
    },
    addNum
  )

  ElMessage.success(`已加入购物车 × ${addNum}`)

  // ⭐ 加完后重置为 1
  num.value = 1
}

function handleBuyNow() {
  if (!detail.value) return
  handleAddCart()
  router.push('/cart')
}

onMounted(() => loadDetail(route.params.id))

// 从详情页再点另一个商品时，路由参数变了要重新加载
watch(
  () => route.params.id,
  (id) => { if (id) loadDetail(id) }
)
</script>

<template>
  <div class="goods-detail container">
    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="detail">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ detail.category }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ detail.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 主体：左图 + 右信息 -->
      <div class="main">
        <!-- 左：图片区 -->
        <div class="gallery">
          <div class="gallery__main">
            <img :src="currentImg" :alt="detail.name" />
          </div>
          <div class="gallery__thumbs">
            <div
              v-for="(img, i) in detail.images"
              :key="i"
              :class="['thumb', { active: currentImg === img }]"
              @mouseenter="currentImg = img"
            >
              <img :src="img" :alt="`${detail.name}-${i}`" />
            </div>
          </div>
        </div>

        <!-- 右：信息区 -->
        <div class="info">
          <h1 class="info__title">{{ detail.name }}</h1>
          <p class="info__desc">{{ detail.desc }}</p>

          <div class="info__price-box">
            <div class="price-row">
              <span class="label">秒杀价</span>
              <span class="price"><em>¥</em>{{ detail.price }}</span>
              <span class="origin">¥{{ detail.originPrice }}</span>
            </div>
            <div class="sales-row">
              <span>累计销量 <em>{{ detail.sales }}</em> 件</span>
              <span class="divider">|</span>
              <span>库存 <em>{{ detail.stock }}</em> 件</span>
            </div>
          </div>

          <!-- 规格选择 -->
          <div class="info__specs">
            <div v-for="spec in detail.specs" :key="spec.name" class="spec-row">
              <span class="spec-label">{{ spec.name }}</span>
              <div class="spec-values">
                <span
                  v-for="v in spec.values"
                  :key="v"
                  :class="['spec-opt', { active: selectedSpecs[spec.name] === v }]"
                  @click="selectedSpecs[spec.name] = v"
                >{{ v }}</span>
              </div>
            </div>

            <div class="spec-row">
              <span class="spec-label">数量</span>
              <div class="num-picker">
                <button :disabled="num <= 1" @click="changeNum(-1)">−</button>
                <input v-model.number="num" type="text" readonly />
                <button :disabled="num >= detail.stock" @click="changeNum(1)">+</button>
                <span class="stock-tip">库存 {{ detail.stock }} 件</span>
              </div>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="info__actions">
            <el-button type="danger" size="large" @click="handleBuyNow">立即购买</el-button>
            <el-button type="warning" size="large" @click="handleAddCart">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
          </div>
        </div>
      </div>

      <!-- Tabs 详情/参数 -->
      <div class="tabs">
        <div class="tabs__head">
          <span
            :class="['tab', { active: activeTab === 'detail' }]"
            @click="activeTab = 'detail'"
          >商品详情</span>
          <span
            :class="['tab', { active: activeTab === 'params' }]"
            @click="activeTab = 'params'"
          >规格参数</span>
        </div>

        <div class="tabs__body">
          <div v-if="activeTab === 'detail'" class="detail-html" v-html="detail.detailHtml" />

          <table v-else class="params-table">
            <tbody>
              <tr v-for="p in detail.params" :key="p.key">
                <td class="k">{{ p.key }}</td>
                <td class="v">{{ p.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <el-empty v-else description="商品不存在" />
  </div>
</template>

<style scoped lang="scss">
.goods-detail {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.main {
  display: flex;
  gap: 30px;
  background: $white;
  padding: 24px;
  border-radius: 4px;
}

/* ---------- 左侧图片 ---------- */
.gallery {
  flex-shrink: 0;
  width: 440px;

  &__main {
    width: 440px;
    height: 440px;
    border: 1px solid $border-color;
    overflow: hidden;
    border-radius: 4px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__thumbs {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .thumb {
    width: 78px;
    height: 78px;
    border: 1px solid $border-color;
    border-radius: 3px;
    overflow: hidden;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.active,
    &:hover {
      border-color: $primary-color;
    }
  }
}

/* ---------- 右侧信息 ---------- */
.info {
  flex: 1;
  min-width: 0;

  &__title {
    font-size: 22px;
    line-height: 32px;
    color: $text-color;
    font-weight: 700;
  }

  &__desc {
    margin-top: 8px;
    font-size: 13px;
    color: $primary-color;
  }

  &__price-box {
    margin-top: 18px;
    background: #fff7f6;
    padding: 16px 20px;
    border-radius: 4px;

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .label {
      color: $text-light;
      font-size: 13px;
    }
    .price {
      color: $primary-color;
      font-size: 32px;
      font-weight: 700;
      em { font-size: 16px; font-style: normal; }
    }
    .origin {
      color: $text-light;
      text-decoration: line-through;
      font-size: 14px;
    }

    .sales-row {
      margin-top: 10px;
      font-size: 13px;
      color: $text-normal;
      display: flex;
      gap: 12px;

      em { color: $primary-color; font-style: normal; }
      .divider { color: $border-color; }
    }
  }

  &__specs {
    margin-top: 20px;
    border-top: 1px dashed $border-color;
    padding-top: 16px;
  }

  .spec-row {
    display: flex;
    align-items: center;
    margin-bottom: 14px;

    .spec-label {
      flex-shrink: 0;
      width: 60px;
      color: $text-light;
      font-size: 13px;
    }

    .spec-values {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .spec-opt {
      padding: 6px 16px;
      font-size: 13px;
      color: $text-normal;
      border: 1px solid $border-color;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s;
      background: $white;

      &:hover { border-color: $primary-color; color: $primary-color; }

      &.active {
        border-color: $primary-color;
        color: $primary-color;
        background: #fff5f5;
        font-weight: 600;
      }
    }

    .num-picker {
      display: flex;
      align-items: center;
      border: 1px solid $border-color;
      border-radius: 3px;
      overflow: hidden;

      button {
        width: 32px;
        height: 32px;
        border: none;
        background: $bg-gray;
        cursor: pointer;
        font-size: 16px;
        color: $text-color;

        &:disabled {
          color: #ccc;
          cursor: not-allowed;
        }
      }

      input {
        width: 50px;
        height: 32px;
        text-align: center;
        border: none;
        outline: none;
        font-size: 13px;
      }

      .stock-tip {
        margin-left: 12px;
        color: $text-light;
        font-size: 12px;
      }
    }
  }

  &__actions {
    margin-top: 20px;
    display: flex;
    gap: 12px;

    :deep(.el-button) {
      min-width: 160px;
      height: 46px;
      font-size: 16px;
    }
  }
}

/* ---------- Tabs ---------- */
.tabs {
  margin-top: 24px;
  background: $white;
  border-radius: 4px;

  &__head {
    display: flex;
    border-bottom: 1px solid $border-color;
  }

  .tab {
    padding: 14px 28px;
    cursor: pointer;
    font-size: 15px;
    color: $text-normal;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;

    &.active {
      color: $primary-color;
      border-color: $primary-color;
      font-weight: 600;
    }

    &:hover { color: $primary-color; }
  }

  &__body {
    padding: 24px;
    min-height: 200px;
  }
}

.detail-html {
  line-height: 2;
  color: $text-normal;
  font-size: 14px;

  :deep(p) { margin-bottom: 8px; }
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  tr { border-bottom: 1px solid $border-color; }
  td { padding: 12px 16px; }
  .k { width: 160px; color: $text-light; background: $bg-gray; }
  .v { color: $text-color; }
}
</style>