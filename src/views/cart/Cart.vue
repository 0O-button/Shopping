<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

function goCheckout() {
  if (cartStore.checkedItems.length === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  router.push('/checkout')
}

async function handleRemoveAll() {
  try {
    await ElMessageBox.confirm('确定删除选中的商品吗？', '提示', {
      type: 'warning'
    })
    cartStore.removeChecked()
    ElMessage.success('删除成功')
  } catch (e) {}
}

function changeNum(item, delta) {
  const next = item.num + delta
  if (next < 1) return
  if (next > 99) {
    ElMessage.warning('单次最多购买 99 件')
    return
  }
  cartStore.updateNum(item.key, next)
}
</script>

<template>
  <div class="cart-page container">
    <h2 class="page-title">我的购物车</h2>

    <template v-if="cartStore.items.length">
      <div class="cart-head">
        <div class="col col--check">
          <el-checkbox
            :model-value="cartStore.isAllChecked"
            @change="cartStore.toggleAll($event)"
          >全选</el-checkbox>
        </div>
        <div class="col col--goods">商品信息</div>
        <div class="col col--price">单价</div>
        <div class="col col--num">数量</div>
        <div class="col col--sub">小计</div>
        <div class="col col--op">操作</div>
      </div>

      <!-- ⭐ key 用 item.key -->
      <div
        v-for="item in cartStore.items"
        :key="item.key"
        class="cart-row"
      >
        <div class="col col--check">
          <el-checkbox
            :model-value="item.checked"
            @change="cartStore.toggleCheck(item.key)"
          />
        </div>

        <div class="col col--goods">
          <img class="thumb" :src="item.image" :alt="item.name" />
          <div class="goods-info">
            <p class="name ellipsis-2">{{ item.name }}</p>
            <p v-if="item.spec" class="spec">{{ item.spec }}</p>
          </div>
        </div>

        <div class="col col--price">¥{{ item.price }}</div>

        <div class="col col--num">
          <div class="num-picker">
            <button :disabled="item.num <= 1" @click="changeNum(item, -1)">−</button>
            <input :value="item.num" readonly />
            <button :disabled="item.num >= 99" @click="changeNum(item, 1)">+</button>
          </div>
        </div>

        <div class="col col--sub">
          <em>¥{{ (item.price * item.num).toFixed(2) }}</em>
        </div>

        <div class="col col--op">
          <a @click="cartStore.removeItem(item.key)">删除</a>
        </div>
      </div>

      <div class="cart-bar">
        <div class="left">
          <el-checkbox
            :model-value="cartStore.isAllChecked"
            @change="cartStore.toggleAll($event)"
          >全选</el-checkbox>
          <a class="link" @click="handleRemoveAll">删除选中</a>
          <a class="link" @click="cartStore.clear()">清空购物车</a>
        </div>

        <div class="right">
          <span class="tip">
            已选 <em>{{ cartStore.totalNum }}</em> 件商品
          </span>
          <span class="total">
            合计（不含运费）：<em>¥{{ cartStore.totalPrice.toFixed(2) }}</em>
          </span>
          <el-button
            type="danger"
            size="large"
            :disabled="cartStore.checkedItems.length === 0"
            @click="goCheckout"
          >去结算</el-button>
        </div>
      </div>
    </template>

    <el-empty v-else description="购物车还是空的，快去逛逛吧">
      <el-button type="danger" @click="router.push('/home')">去首页</el-button>
    </el-empty>
  </div>
</template>

<style scoped lang="scss">
.cart-page {
  padding: 20px 0 40px;
}

.page-title {
  font-size: 20px;
  margin-bottom: 16px;
  color: $text-color;
}

.cart-head,
.cart-row {
  display: flex;
  align-items: center;
  background: $white;
  border-radius: 4px;
  padding: 16px 20px;
}

.cart-head {
  font-size: 13px;
  color: $text-light;
  margin-bottom: 10px;
  border-bottom: 1px solid $border-color;
}

.cart-row {
  margin-bottom: 10px;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06); }
}

.col {
  &--check { width: 60px; }
  &--goods { flex: 1; display: flex; gap: 12px; align-items: center; min-width: 0; }
  &--price { width: 120px; text-align: center; color: $text-color; }
  &--num { width: 140px; display: flex; justify-content: center; }
  &--sub { width: 140px; text-align: center;
    em { color: $primary-color; font-style: normal; font-weight: 700; }
  }
  &--op { width: 80px; text-align: center;
    a { color: $text-light; cursor: pointer; font-size: 13px;
      &:hover { color: $primary-color; }
    }
  }
}

.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.goods-info {
  min-width: 0;
  flex: 1;

  .name { font-size: 14px; color: $text-color; line-height: 20px; }
  .spec { margin-top: 6px; font-size: 12px; color: $text-light; }
}

.num-picker {
  display: flex;
  border: 1px solid $border-color;
  border-radius: 3px;
  overflow: hidden;

  button {
    width: 30px;
    height: 30px;
    border: none;
    background: $bg-gray;
    cursor: pointer;
    font-size: 14px;

    &:disabled { color: #ccc; cursor: not-allowed; }
  }
  input {
    width: 44px;
    height: 30px;
    text-align: center;
    border: none;
    outline: none;
    font-size: 13px;
  }
}

.cart-bar {
  position: sticky;
  bottom: 0;
  margin-top: 20px;
  background: $white;
  padding: 16px 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);

  .left {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 13px;

    .link {
      color: $text-light;
      cursor: pointer;
      &:hover { color: $primary-color; }
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 20px;

    .tip {
      font-size: 13px;
      color: $text-normal;
      em { color: $primary-color; font-style: normal; font-weight: 700; }
    }

    .total {
      font-size: 13px;
      color: $text-normal;

      em {
        color: $primary-color;
        font-size: 22px;
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