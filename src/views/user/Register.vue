<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: ''
})

// 自定义校验：两次密码一致
function validateConfirm(rule, value, callback) {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义校验：手机号
function validatePhone(rule, value, callback) {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3-20 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }]
}

async function handleRegister() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    await register({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      phone: form.phone
    })
    ElMessage.success('注册成功，请登录')
    router.replace('/login')
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-box">
      <div class="register-box__head">
        <h2>创建账号</h2>
        <p>注册 优选商城，开启你的购物之旅</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        label-width="88px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="3-20 位字符" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="6-20 位字符"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="给自己起个昵称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="选填" />
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >注 册</el-button>
        </el-form-item>
      </el-form>

      <div class="register-box__foot">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.register-box {
  width: 520px;
  background: $white;
  border-radius: 8px;
  padding: 36px 40px 24px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);

  &__head {
    text-align: center;
    margin-bottom: 24px;

    h2 { font-size: 24px; color: $text-color; font-weight: 700; }
    p { margin-top: 8px; font-size: 13px; color: $text-light; }
  }

  &__foot {
    text-align: center;
    font-size: 13px;
    color: $text-light;
    padding-top: 16px;
    border-top: 1px dashed $border-color;

    a {
      color: $primary-color;
      &:hover { text-decoration: underline; }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>