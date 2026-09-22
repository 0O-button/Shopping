<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getProfile, updateProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  nickname: '',
  phone: '',
  email: '',
  gender: '',
  birthday: ''
})

async function load() {
  loading.value = true
  try {
    const data = await getProfile()
    Object.assign(form, {
      nickname: data.nickname || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || '',
      birthday: data.birthday || ''
    })
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await updateProfile({ ...form })
    // 同步 store
    userStore.userInfo = { ...userStore.userInfo, ...form }
    localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="profile-page">
    <h2 class="page-title">个人资料</h2>

    <el-skeleton v-if="loading" :rows="5" animated />

    <el-form
      v-else
      :model="form"
      label-width="100px"
      style="max-width: 560px; margin-top: 20px"
    >
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio value="男">男</el-radio>
          <el-radio value="女">女</el-radio>
          <el-radio value="保密">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="生日">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="danger" :loading="saving" @click="handleSave">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.page-title {
  font-size: 18px;
  color: $text-color;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;
}
</style>