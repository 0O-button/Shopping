<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderList, cancelOrder, confirmReceive, payOrder } from '@/api/order'
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

async function loadList() {
  loading.value = true
  try {
    const res = await getOrderList({ ...query })
    list.value = res.records
    total.value = res.total
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

// 高亮刚提交的订单
const highlightId = computed(() => route.query.orderId || '')

onMounted(loadList)
</script>

<template>
  <div class="order-page container">
    <h2 class="page-title">我的订单</h2>

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
        :class="['order-card', { 'is-new': order.id === highlightId }]"
      >
        <!-- 订单头 -->
        <div class="order-card__head">
          <div class="left">
            <span class="time">{{ order.createTime }}</span>
            <span class="no">订单号：{{ order.id }}</span>
          </div>
          <div class="status" :style="{ color: order.statusColor }">
            {{ order.statusLabel }}
          </div>
        </div>

        <!-- 商品明细 -->
        <div class="order-card__body">
          <div
            v-for="g in order.goods"
            :key="g.id"
            class="goods-row"
          >
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
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
  color: $text-color;
}

.tabs {
  display: flex;
  background: $white;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid $border-color;
  padding: 0 20px;

  .tab {
    padding: 14px 4px;
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
      gap: 20px;
    }

    .status {
      font-weight: 600;
      font-size: 14px;
    }
  }

  &__body {
    padding: 8px 20px;
  }

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
      max-width: 60%;

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

      .btns {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.pager {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>