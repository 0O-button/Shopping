<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAddressList,
  addAddress,
  updateAddress
} from '@/api/user'
import { ADDRESS_TAGS } from '@/mock/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const saving = ref(false)

// 编辑模式下 id 存在
const isEdit = computed(() => !!route.params.id)
const editId = computed(() => Number(route.params.id))

// 从哪来的（checkout / user），保存后决定回哪里
const from = computed(() => route.query.from || 'user')

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  zipCode: '',
  tag: '家',
  isDefault: false
})

const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度 2-20 位', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度 5-100 位', trigger: 'blur' }
  ],
  zipCode: [
    { pattern: /^\d{6}$/, message: '邮编为 6 位数字', trigger: 'blur' }
  ]
}

// 编辑模式：先把数据读出来填进表单
async function loadForEdit() {
  const list = await getAddressList()
  const item = list.find((a) => a.id === editId.value)
  if (!item) {
    ElMessage.error('地址不存在')
    router.replace(from.value === 'checkout' ? '/checkout' : '/user/address')
    return
  }
  Object.assign(form, {
    name: item.name,
    phone: item.phone,
    province: item.province || '',
    city: item.city || '',
    district: item.district || '',
    detail: item.detail,
    zipCode: item.zipCode || '',
    tag: item.tag || '家',
    isDefault: !!item.isDefault
  })
}

async function handleSave() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return

  saving.value = true
  try {
    if (isEdit.value) {
      await updateAddress(editId.value, { ...form })
      ElMessage.success('保存成功')
    } else {
      await addAddress({ ...form })
      ElMessage.success('添加成功')
    }
    goBack()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  if (from.value === 'checkout') {
    router.replace('/checkout')
  } else {
    router.replace('/user/address')
  }
}

function handleCancel() {
  goBack()
}

onMounted(() => {
  if (isEdit.value) loadForEdit()
})
</script>

<template>
  <div class="address-edit container">
    <div class="card">
      <div class="card__head">
        <h2>{{ isEdit ? '编辑收货地址' : '新增收货地址' }}</h2>
        <a class="back" @click="handleCancel">← 返回</a>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="card__body"
      >
        <el-form-item label="收货人" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入收货人姓名"
            maxlength="20"
            style="width: 320px"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入 11 位手机号"
            maxlength="11"
            style="width: 320px"
          />
        </el-form-item>

        <el-form-item label="所在地区" required>
          <div class="region-row">
            <el-form-item prop="province" class="region-item">
              <el-input v-model="form.province" placeholder="省份" />
            </el-form-item>
            <el-form-item prop="city" class="region-item">
              <el-input v-model="form.city" placeholder="城市" />
            </el-form-item>
            <el-form-item prop="district" class="region-item">
              <el-input v-model="form.district" placeholder="区 / 县" />
            </el-form-item>
          </div>
        </el-form-item>

        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
            placeholder="街道、门牌号、楼层、房间号等"
            style="width: 520px"
          />
        </el-form-item>

        <el-form-item label="邮编" prop="zipCode">
          <el-input
            v-model="form.zipCode"
            placeholder="选填，6 位数字"
            maxlength="6"
            style="width: 320px"
          />
        </el-form-item>

        <el-form-item label="地址标签">
          <div class="tag-list">
            <span
              v-for="t in ADDRESS_TAGS"
              :key="t"
              :class="['tag-item', { active: form.tag === t }]"
              @click="form.tag = t"
            >{{ t }}</span>
          </div>
        </el-form-item>

        <el-form-item label="">
          <el-checkbox v-model="form.isDefault">设为默认收货地址</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="danger" size="large" :loading="saving" @click="handleSave">
            保存地址
          </el-button>
          <el-button size="large" @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.address-edit {
  padding: 20px 0 40px;
}

.card {
  background: $white;
  border-radius: 6px;
  overflow: hidden;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    border-bottom: 1px solid $border-color;

    h2 { font-size: 18px; color: $text-color; }
    .back {
      font-size: 13px;
      color: $text-light;
      cursor: pointer;
      &:hover { color: $primary-color; }
    }
  }

  &__body {
    padding: 24px 40px 40px;
  }
}

.region-row {
  display: flex;
  gap: 10px;
  width: 520px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
  .region-item { flex: 1; }
}

.tag-list {
  display: flex;
  gap: 10px;

  .tag-item {
    padding: 5px 18px;
    font-size: 13px;
    border: 1px solid $border-color;
    border-radius: 3px;
    color: $text-normal;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { border-color: $primary-color; color: $primary-color; }

    &.active {
      border-color: $primary-color;
      color: $primary-color;
      background: #fff5f5;
      font-weight: 600;
    }
  }
}
</style>