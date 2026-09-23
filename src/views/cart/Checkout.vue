<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getAddressList } from '@/api/user'
import { submitOrder } from '@/api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

const STORAGE_KEY = 'checkout_address_id'

const submitting = ref(false)
const loadingAddr = ref(true)
const addresses = ref([])
const selectedAddressId = ref(null)

const payType = ref('alipay')
const remark = ref('')

// ---------- 已选商品 ----------
const goodsList = computed(() => cartStore.checkedItems)
const goodsTotal = computed(() => cartStore.totalPrice)
const freight = computed(() => (goodsTotal.value >= 99 ? 0 : 10))
const payTotal = computed(() => goodsTotal.value + freight.value)

// 当前选中的地址对象
const selectedAddress = computed(() =>
  addresses.value.find((a) => a.id === selectedAddressId.value) || null
)

// ---------- 加载地址 ----------
async function loadAddresses() {
  loadingAddr.value = true
  try {
    const list = await getAddressList()
    addresses.value = list

    // 优先恢复上次选中的（从地址编辑页返回时能续上）
    const savedId = Number(localStorage.getItem(STORAGE_KEY) || 0)
    if (savedId && list.some((a) => a.id === savedId)) {
      selectedAddressId.value = savedId
    } else {
      // 否则选默认地址，没有默认选第一条
      const def = list.find((a) => a.isDefault) || list[0]
      selectedAddressId.value = def ? def.id : null
    }
  } finally {
    loadingAddr.value = false
  }
}

function selectAddress(id) {
  selectedAddressId.value = id
  localStorage.setItem(STORAGE_KEY, String(id))
}

// ---------- 跳转地址编辑页 ----------
function goAddAddress() {
  router.push({ path: '/address/edit', query: { from: 'checkout' } })
}

// ---------- 提交订单 ----------
function validate() {
  if (!selectedAddress.value) return '请先选择收货地址'
  if (goodsList.value.length === 0) return '没有可结算的商品'
  return ''
}

async function handleSubmit() {
  const err = validate()
  if (err) {
    ElMessage.warning(err)
    return
  }

  submitting.value = true
  try {
    const addr = selectedAddress.value
    const res = await submitOrder({
  goods: goodsList.value.map((g) => ({
    key: g.key,
    id: g.id,
    name: g.name,
    price: g.price,
    num: g.num,
    image: g.image,
    spec: g.spec || ''
  })),
      address: {
        name: addr.name,
        phone: addr.phone,
        fullAddress: `${addr.province} ${addr.city} ${addr.district} ${addr.detail}`,
        zipCode: addr.zipCode || ''
      },
      payType: payType.value,
      remark: remark.value,
      total: payTotal.value
    })

    // 结算成功后清空已结算商品 + 清掉缓存的地址 id
    cartStore.removeChecked()
    localStorage.removeItem(STORAGE_KEY)

    ElMessage.success('订单提交成功！')
    router.replace({ path: '/user/order', query: { orderId: res.orderId } })
  } catch (e) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (goodsList.value.length === 0) {
    ElMessage.warning('请先选择要结算的商品')
    router.replace('/cart')
    return
  }
  loadAddresses()
})
</script>

<template>
  <div class="checkout container">
    <h2 class="page-title">确认订单</h2>

    <!-- ========== 收货地址 ========== -->
    <section class="section">
      <div class="section__head">
        <span>收货地址</span>
        <el-button
          v-if="addresses.length"
          link
          type="danger"
          @click="goAddAddress"
        >
          <el-icon><Plus /></el-icon> 新增地址
        </el-button>
      </div>

      <div class="section__body">
        <!-- 加载中 -->
        <el-skeleton v-if="loadingAddr" :rows="2" animated />

        <!-- 无地址：空状态 -->
        <div v-else-if="!addresses.length" class="empty-address">
          <el-icon class="empty-address__icon"><Location /></el-icon>
          <p class="empty-address__tip">你还没有添加收货地址</p>
          <el-button type="danger" @click="goAddAddress">
            + 添加收货地址
          </el-button>
        </div>

        <!-- 有地址：卡片选择 -->
        <div v-else class="addr-picker">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            :class="['addr-item', { active: selectedAddressId === addr.id }]"
            @click="selectAddress(addr.id)"
          >
            <div class="addr-item__check">
              <el-icon v-if="selectedAddressId === addr.id"><CircleCheckFilled /></el-icon>
              <span v-else class="circle"></span>
            </div>

            <div class="addr-item__main">
              <div class="line1">
                <span class="name">{{ addr.name }}</span>
                <span class="phone">{{ addr.phone }}</span>
                <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
                <el-tag v-if="addr.tag" size="small" effect="plain">{{ addr.tag }}</el-tag>
              </div>
              <div class="line2">
                {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 商品清单 ========== -->
    <section class="section">
      <div class="section__head">商品清单</div>
      <div class="section__body">
        <div class="goods-head">
          <div class="col col--goods">商品信息</div>
          <div class="col col--price">单价</div>
          <div class="col col--num">数量</div>
          <div class="col col--sub">小计</div>
        </div>

        <div
  v-for="item in goodsList"
  :key="item.key"
  class="goods-row"
       >
          <div class="col col--goods">
            <img class="thumb" :src="item.image" :alt="item.name" />
            <div class="info">
              <p class="name ellipsis-2">{{ item.name }}</p>
              <p v-if="item.spec" class="spec">{{ item.spec }}</p>
            </div>
          </div>
          <div class="col col--price">¥{{ item.price }}</div>
          <div class="col col--num">×{{ item.num }}</div>
          <div class="col col--sub">
            <em>¥{{ (item.price * item.num).toFixed(2) }}</em>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 支付方式 + 备注 ========== -->
    <section class="section">
      <div class="section__head">支付方式</div>
      <div class="section__body">
        <el-radio-group v-model="payType">
          <el-radio value="alipay">支付宝</el-radio>
          <el-radio value="wechat">微信支付</el-radio>
          <el-radio value="card">银行卡</el-radio>
          <el-radio value="cod">货到付款</el-radio>
        </el-radio-group>

        <div class="remark">
          <span class="label">订单备注：</span>
          <el-input
            v-model="remark"
            placeholder="选填，如对发货时间有要求可备注"
            style="width: 420px"
          />
        </div>
      </div>
    </section>

    <!-- ========== 底部支付栏 ========== -->
    <div class="pay-bar">
      <div class="left">
        <div class="row">
          <span>商品金额：</span>
          <em>¥{{ goodsTotal.toFixed(2) }}</em>
        </div>
        <div class="row">
          <span>运费：</span>
          <em>{{ freight === 0 ? '免运费' : `¥${freight.toFixed(2)}` }}</em>
        </div>
      </div>

      <div class="right">
        <div class="addr-preview" v-if="selectedAddress">
          <span class="tip">寄送至：</span>
          <span>{{ selectedAddress.province }} {{ selectedAddress.city }}
            {{ selectedAddress.district }} {{ selectedAddress.detail }}</span>
        </div>

        <span class="total">
          应付总额：<em>¥{{ payTotal.toFixed(2) }}</em>
        </span>
        <el-button
          type="danger"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >提交订单</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout {
  padding: 20px 0 40px;
}

.page-title {
  font-size: 20px;
  margin-bottom: 16px;
  color: $text-color;
}

.section {
  background: $white;
  border-radius: 4px;
  margin-bottom: 16px;

  &__head {
    padding: 14px 20px;
    border-bottom: 1px solid $border-color;
    font-weight: 600;
    font-size: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__body {
    padding: 20px;
  }
}

/* ---------- 空地址状态 ---------- */
.empty-address {
  text-align: center;
  padding: 20px 0;

  &__icon {
    font-size: 48px;
    color: #d0d0d0;
  }
  &__tip {
    margin: 12px 0 18px;
    color: $text-light;
    font-size: 14px;
  }
}

/* ---------- 地址选择卡片 ---------- */
.addr-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.addr-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid $border-color;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: $primary-color;
  }

  &.active {
    border-color: $primary-color;
    background: #fff9f9;
    box-shadow: 0 0 0 2px rgba(225, 37, 27, 0.08);
  }

  &__check {
    flex-shrink: 0;
    padding-top: 2px;

    .el-icon {
      color: $primary-color;
      font-size: 20px;
    }
    .circle {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 1px solid #ccc;
      border-radius: 50%;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;

    .line1 {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .name { font-weight: 600; color: $text-color; }
      .phone { color: $text-normal; }
    }

    .line2 {
      margin-top: 8px;
      color: $text-normal;
      font-size: 13px;
      line-height: 20px;
    }
  }
}

/* ---------- 商品清单 ---------- */
.goods-head,
.goods-row {
  display: flex;
  align-items: center;
  padding: 12px 0;

  .col {
    &--goods { flex: 1; display: flex; gap: 12px; align-items: center; min-width: 0; }
    &--price { width: 120px; text-align: center; }
    &--num { width: 100px; text-align: center; }
    &--sub { width: 130px; text-align: right;
      em { color: $primary-color; font-style: normal; font-weight: 700; }
    }
  }
}

.goods-head {
  font-size: 13px;
  color: $text-light;
  border-bottom: 1px solid $border-color;
}

.goods-row {
  border-bottom: 1px dashed $border-color;
  &:last-child { border-bottom: none; }
}

.thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.info {
  min-width: 0;
  flex: 1;

  .name { font-size: 14px; color: $text-color; line-height: 20px; }
  .spec { margin-top: 6px; font-size: 12px; color: $text-light; }
}

.remark {
  margin-top: 16px;
  display: flex;
  align-items: center;

  .label { color: $text-light; font-size: 13px; }
}

/* ---------- 底部支付栏 ---------- */
.pay-bar {
  background: $white;
  padding: 16px 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);

  .left .row {
    display: flex;
    gap: 10px;
    font-size: 13px;
    color: $text-normal;
    em { color: $text-color; font-style: normal; font-weight: 600; }
    & + .row { margin-top: 6px; }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 20px;

    .addr-preview {
      font-size: 12px;
      color: $text-light;
      max-width: 320px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .tip { color: $text-light; }
    }

    .total {
      font-size: 14px;
      color: $text-normal;

      em {
        color: $primary-color;
        font-size: 24px;
        font-weight: 700;
        font-style: normal;
        margin-left: 4px;
      }
    }

    :deep(.el-button) {
      min-width: 140px;
      height: 44px;
      font-size: 16px;
    }
  }
}
</style>