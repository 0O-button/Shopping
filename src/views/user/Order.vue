<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getOrderList,
  cancelOrder,
  confirmReceive,
  payOrder,
  deleteOrder,
  batchDeleteOrders
} from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  status: '',
  page: 1,
  pageSize: 5
})

const tabs = [
  { key: '', label: '全部订单' },
  { key: 'UNPAID', label: '待付款' },
  { key: 'UNSHIPPED', label: '待发货' },
  { key: 'SHIPPED', label: '待收货' },
  { key: 'FINISHED', label: '已完成' },
  { key: 'CANCELED', label: '已取消' }
]

// ============ 选中管理 ============
const selectedIds = ref([])

const isAllChecked = computed(() => {
  if (!list.value.length) return false
  return list.value.every((o) => selectedIds.value.includes(o.id))
})

const isIndeterminate = computed(() => {
  if (!list.value.length) return false
  const n = list.value.filter((o) => selectedIds.value.includes(o.id)).length
  return n > 0 && n < list.value.length
})

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function toggleAll(val) {
  if (val) {
    const set = new Set([...selectedIds.value, ...list.value.map((o) => o.id)])
    selectedIds.value = [...set]
  } else {
    const pageIds = list.value.map((o) => o.id)
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  }
}

// ============ 数据加载 ============
async function loadList() {
  loading.value = true
  try {
    const res = await getOrderList({ ...query })
    list.value = res.records
    total.value = res.total
    selectedIds.value = []
  } catch (e) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function changeTab(key) {
  query.status = key
  query.page = 1
  loadList()
}

function changePage(p) {
  query.page = p
  loadList()
}

// ============ 订单操作 ============
async function handlePay(order) {
  try {
    await ElMessageBox.confirm(
      `确认支付 ¥${order.total.toFixed(2)} 吗？`,
      '支付确认',
      { type: 'info', confirmButtonText: '确认支付' }
    )
    await payOrder(order.id)
    ElMessage.success('支付成功')
    loadList()
  } catch (e) {}
}

async function handleCancel(order) {
  try {
    await ElMessageBox.confirm('确定取消该订单吗？', '提示', { type: 'warning' })
    await cancelOrder(order.id)
    ElMessage.success('订单已取消')
    loadList()
  } catch (e) {}
}

async function handleConfirm(order) {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', { type: 'warning' })
    await confirmReceive(order.id)
    ElMessage.success('已确认收货')
    loadList()
  } catch (e) {}
}

// ============ 单条删除 ============
async function handleDelete(order) {
  try {
    await ElMessageBox.confirm(
      `确定删除订单 ${order.id} 吗？删除后不可恢复。`,
      '删除订单',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deleteOrder(order.id)
    ElMessage.success('删除成功')

    // 如果删的是当前页最后一条，回退一页
    if (list.value.length === 1 && query.page > 1) {
      query.page -= 1
    }
    loadList()
  } catch (e) {}
}

// ============ 批量删除 ============
async function handleBatchDelete() {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }

  const count = selectedIds.value.length
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${count} 条订单吗？删除后不可恢复。`,
      '批量删除',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await batchDeleteOrders([...selectedIds.value])
    ElMessage.success(`已删除 ${count} 条订单`)

    const remain = total.value - count
    const maxPage = Math.max(1, Math.ceil(remain / query.pageSize))
    if (query.page > maxPage) query.page = maxPage

    selectedIds.value = []
    loadList()
  } catch (e) {}
}

// 提交订单后高亮
const highlightId = computed(() => route.query.orderId || '')

watch(
  () => route.query.orderId,
  (id) => {
    if (id) {
      query.status = ''
      query.page = 1
      loadList()
    }
  }
)

onMounted(loadList)
</script>

<template>
  <div class="order-page">
    <!-- 头部 -->
    <div class="page-head">
      <h2 class="page-title">我的订单</h2>

      <div class="batch-actions">
        <el-checkbox
          :model-value="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="toggleAll"
        >全选本页</el-checkbox>

        <el-button
          type="danger"
          plain
          size="small"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          删除选中（{{ selectedIds.length }}）
        </el-button>
      </div>
    </div>

    <!-- Tab -->
    <div class="tabs">
      <span
        v-for="t in tabs"
        :key="t.key"
        :class="['tab', { active: query.status === t.key }]"
        @click="changeTab(t.key)"
      >{{ t.label }}</span>
    </div>

    <!-- 列表 -->
    <el-skeleton v-if="loading" :rows="6" animated />

    <template v-else>
      <div
        v-for="order in list"
        :key="order.id"
        :class="[
          'order-card',
          { 'is-new': order.id === highlightId },
          { 'is-selected': selectedIds.includes(order.id) }
        ]"
      >
        <!-- 订单头 -->
        <div class="order-card__head">
          <div class="left">
            <el-checkbox
              :model-value="selectedIds.includes(order.id)"
              @change="toggleSelect(order.id)"
            />
            <span class="time">{{ order.createTime }}</span>
            <span class="no">订单号：{{ order.id }}</span>
          </div>
          <div class="status" :style="{ color: order.statusColor }">
            {{ order.statusLabel }}
          </div>
        </div>

        <!-- 商品明细 -->
        <div class="order-card__body">
          <div v-for="g in order.goods" :key="g.id" class="goods-row">
            <img class="thumb" :src="g.image" :alt="g.name" />
            <div class="info">
              <p class="name ellipsis-2">{{ g.name }}</p>
              <p class="spec">{{ g.spec }}</p>
            </div>
            <div class="price">¥{{ g.price }}</div>
            <div class="num">×{{ g.num }}</div>
          </div>
        </div>

        <!-- 订单尾 -->
        <div class="order-card__foot">
          <div class="receiver">
            <span>收货人：{{ order.receiver.name }}</span>
            <span>{{ order.receiver.phone }}</span>
            <span class="addr ellipsis">{{ order.receiver.address }}</span>
          </div>

          <div class="right">
            <div class="total">
              实付款：<em>¥{{ order.total.toFixed(2) }}</em>
            </div>

            <div class="btns">
              <el-button
                v-if="order.status === 'UNPAID'"
                type="danger"
                size="small"
                @click="handlePay(order)"
              >立即付款</el-button>

              <el-button
                v-if="order.status === 'UNPAID'"
                size="small"
                @click="handleCancel(order)"
              >取消订单</el-button>

              <el-button
                v-if="order.status === 'SHIPPED'"
                type="primary"
                size="small"
                @click="handleConfirm(order)"
              >确认收货</el-button>

              <el-button size="small" plain @click="router.push('/home')">
                再次购买
              </el-button>

              <el-button
                size="small"
                type="danger"
                plain
                @click="handleDelete(order)"
              >
                <el-icon><Delete /></el-icon> 删除订单
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!list.length" description="暂无订单" />

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
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;

  .page-title { font-size: 18px; color: $text-color; }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    :deep(.el-checkbox__label) { font-size: 13px; color: $text-normal; }
  }
}

.tabs {
  display: flex;
  border-bottom: 1px solid $border-color;
  padding: 0 4px;
  margin-bottom: 4px;

  .tab {
    padding: 12px 4px;
    margin-right: 30px;
    font-size: 14px;
    color: $text-normal;
    cursor: pointer;
    position: relative;

    &.active {
      color: $primary-color;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: -1px;
        height: 2px;
        background: $primary-color;
      }
    }

    &:hover { color: $primary-color; }
  }
}

.order-card {
  background: $white;
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: all 0.25s;

  &.is-new {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba(225, 37, 27, 0.1);
  }

  &.is-selected {
    border-color: $primary-color;
    background: #fffafa;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: $bg-gray;
    font-size: 13px;
    color: $text-light;

    .left {
      display: flex;
      align-items: center;
      gap: 14px;
      :deep(.el-checkbox) { margin-right: 0; }
    }

    .status { font-weight: 600; font-size: 14px; }
  }

  &__body { padding: 8px 20px; }

  .goods-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed $border-color;

    &:last-child { border-bottom: none; }

    .thumb {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      min-width: 0;
      margin-left: 12px;

      .name { font-size: 14px; color: $text-color; }
      .spec { margin-top: 6px; font-size: 12px; color: $text-light; }
    }

    .price { width: 100px; text-align: right; color: $text-color; }
    .num { width: 70px; text-align: right; color: $text-light; }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    background: #fafafa;
    border-top: 1px solid $border-color;

    .receiver {
      font-size: 12px;
      color: $text-light;
      display: flex;
      gap: 14px;
      max-width: 50%;

      .addr { max-width: 240px; }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 20px;

      .total {
        font-size: 13px;
        color: $text-normal;

        em {
          color: $primary-color;
          font-size: 18px;
          font-weight: 700;
          font-style: normal;
        }
      }

      .btns { display: flex; gap: 8px; }
    }
  }
}

.pager {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>