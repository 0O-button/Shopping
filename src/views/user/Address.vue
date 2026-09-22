<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAddressList, deleteAddress, updateAddress } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const list = ref([])

async function load() {
  loading.value = true
  try {
    list.value = await getAddressList()
  } finally {
    loading.value = false
  }
}

function goAdd() {
  router.push({ path: '/address/edit', query: { from: 'user' } })
}
function goEdit(item) {
  router.push({ path: `/address/edit/${item.id}`, query: { from: 'user' } })
}

async function handleDelete(item) {
  try {
    await ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' })
    await deleteAddress(item.id)
    ElMessage.success('已删除')
    load()
  } catch (e) {}
}

function setDefault(item) {
  if (item.isDefault) return
  list.value.forEach((a) => (a.isDefault = a.id === item.id))
  updateAddress(item.id, { isDefault: true })
  list.value
    .filter((a) => a.id !== item.id)
    .forEach((a) => updateAddress(a.id, { isDefault: false }))
  ElMessage.success('已设为默认地址')
}

onMounted(load)
</script>

<template>
  <div class="address-page">
    <div class="head">
      <h2 class="page-title">收货地址</h2>
      <el-button type="danger" @click="goAdd">
        <el-icon><Plus /></el-icon> 新增地址
      </el-button>
    </div>

    <el-skeleton v-if="loading" :rows="4" animated />

    <template v-else>
      <div v-if="list.length" class="addr-list">
        <div
          v-for="item in list"
          :key="item.id"
          :class="['addr-card', { 'is-default': item.isDefault }]"
        >
          <div class="addr-card__main">
            <div class="line1">
              <span class="name">{{ item.name }}</span>
              <span class="phone">{{ item.phone }}</span>
              <el-tag v-if="item.isDefault" type="danger" size="small">默认</el-tag>
              <el-tag v-if="item.tag" size="small" effect="plain">{{ item.tag }}</el-tag>
            </div>
            <div class="line2">
              {{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}
            </div>
            <div v-if="item.zipCode" class="line3">邮编：{{ item.zipCode }}</div>
          </div>

          <div class="addr-card__ops">
            <a v-if="!item.isDefault" @click="setDefault(item)">设为默认</a>
            <a @click="goEdit(item)">编辑</a>
            <a class="danger" @click="handleDelete(item)">删除</a>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无收货地址">
        <el-button type="danger" @click="goAdd">新增收货地址</el-button>
      </el-empty>
    </template>
  </div>
</template>

<style scoped lang="scss">
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;

  .page-title { font-size: 18px; color: $text-color; }
}

.addr-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addr-card {
  border: 1px solid $border-color;
  border-radius: 4px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: $primary-color;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  &.is-default {
    border-color: $primary-color;
    background: #fff9f9;
  }

  &__main {
    flex: 1;
    min-width: 0;

    .line1 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;

      .name { font-weight: 600; color: $text-color; }
      .phone { color: $text-normal; }
    }

    .line2 {
      margin-top: 8px;
      color: $text-normal;
      font-size: 13px;
    }

    .line3 {
      margin-top: 4px;
      color: $text-light;
      font-size: 12px;
    }
  }

  &__ops {
    display: flex;
    gap: 16px;
    font-size: 13px;
    flex-shrink: 0;
    margin-left: 20px;

    a {
      color: $text-normal;
      cursor: pointer;
      &:hover { color: $primary-color; }

      &.danger:hover { color: #f56c6c; }
    }
  }
}
</style>