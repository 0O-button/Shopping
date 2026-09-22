<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGoodsList, getFilterOptions } from '@/api/goods'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import GoodsCard from '@/components/home/GoodsCard.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const list = ref([])
const total = ref(0)
const filters = ref({ brands: [], categories: [], priceRanges: [] })

// 筛选条件
const query = reactive({
  keyword: route.query.keyword || '',
  category: '',
  brand: '',
  minPrice: undefined,
  maxPrice: undefined,
  sort: 'default',
  page: 1,
  pageSize: 20
})

// 排序选项
const sortTabs = [
  { key: 'default', label: '综合' },
  { key: 'sales_desc', label: '销量' },
  { key: 'price_asc', label: '价格 ↑' },
  { key: 'price_desc', label: '价格 ↓' }
]

async function loadFilters() {
  filters.value = await getFilterOptions()
}

async function loadList() {
  loading.value = true
  try {
    const res = await getGoodsList({ ...query })
    list.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 切换筛选条件
function setCategory(c) {
  query.category = query.category === c ? '' : c
  query.page = 1
  loadList()
}
function setBrand(b) {
  query.brand = query.brand === b ? '' : b
  query.page = 1
  loadList()
}
function setPrice(range) {
  const isSame = query.minPrice === range.min && query.maxPrice === range.max
  if (isSame) {
    query.minPrice = undefined
    query.maxPrice = undefined
  } else {
    query.minPrice = range.min
    query.maxPrice = range.max === Infinity ? 9999999 : range.max
  }
  query.page = 1
  loadList()
}
function setSort(key) {
  query.sort = key
  query.page = 1
  loadList()
}
function changePage(p) {
  query.page = p
  loadList()
}

// 搜索框变化时（比如从 header 再搜），同步 keyword
watch(
  () => route.query.keyword,
  (kw) => {
    query.keyword = kw || ''
    query.page = 1
    loadList()
  }
)

onMounted(async () => {
  await loadFilters()
  await loadList()
})
</script>

<template>
  <div class="search-page container">
    <!-- 筛选区 -->
    <div class="filter-panel">
      <div class="filter-row">
        <span class="label">分类：</span>
        <div class="options">
          <span
            v-for="c in filters.categories"
            :key="c"
            :class="['opt', { active: query.category === c }]"
            @click="setCategory(c)"
          >{{ c }}</span>
        </div>
      </div>

      <div class="filter-row">
        <span class="label">品牌：</span>
        <div class="options">
          <span
            v-for="b in filters.brands"
            :key="b"
            :class="['opt', { active: query.brand === b }]"
            @click="setBrand(b)"
          >{{ b }}</span>
        </div>
      </div>

      <div class="filter-row">
        <span class="label">价格：</span>
        <div class="options">
          <span
            v-for="p in filters.priceRanges"
            :key="p.label"
            :class="['opt', {
              active: query.minPrice === p.min &&
                      query.maxPrice === (p.max === Infinity ? 9999999 : p.max)
            }]"
            @click="setPrice(p)"
          >{{ p.label }}</span>
        </div>
      </div>

      <div class="filter-row">
        <span class="label">排序：</span>
        <div class="options">
          <span
            v-for="s in sortTabs"
            :key="s.key"
            :class="['opt', { active: query.sort === s.key }]"
            @click="setSort(s.key)"
          >{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="result-bar">
      <span v-if="query.keyword">
        搜索「<em>{{ query.keyword }}</em>」，共找到 <em>{{ total }}</em> 件商品
      </span>
      <span v-else>共 <em>{{ total }}</em> 件商品</span>
    </div>

    <!-- 商品列表 -->
    <el-skeleton v-if="loading" :rows="6" animated />

    <template v-else>
      <div v-if="list.length" class="goods-grid">
        <GoodsCard v-for="g in list" :key="g.id" :goods="g" />
      </div>

      <el-empty v-else description="没有找到相关商品" />

      <div v-if="total > query.pageSize" class="pager">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="query.pageSize"
          :current-page="query.page"
          @current-change="changePage"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.search-page {
  padding: 20px 0 40px;
}

.filter-panel {
  background: $white;
  padding: 10px 20px;
  border: 1px solid $border-color;
  border-radius: 4px;

  .filter-row {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px dashed $border-color;

    &:last-child { border-bottom: none; }
  }

  .label {
    flex-shrink: 0;
    width: 60px;
    line-height: 26px;
    color: $text-light;
    font-size: 13px;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .opt {
    display: inline-block;
    padding: 3px 12px;
    font-size: 13px;
    color: $text-normal;
    border: 1px solid transparent;
    border-radius: 3px;
    cursor: pointer;

    &:hover { color: $primary-color; }

    &.active {
      color: $white;
      background: $primary-color;
      border-color: $primary-color;
    }
  }
}

.result-bar {
  margin: 16px 0;
  font-size: 13px;
  color: $text-normal;

  em {
    color: $primary-color;
    font-style: normal;
    font-weight: 700;
    padding: 0 2px;
  }
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.pager {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>