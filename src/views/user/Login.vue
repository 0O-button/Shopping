<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3-20 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度 6-20 位', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return

  loading.value = true
  try {
    const data = await login({ ...form })
    userStore.setLogin(data)
    ElMessage.success('登录成功')

    const redirect = route.query.redirect || '/home'
    router.replace(redirect)
  } catch (e) {
    ElMessage.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}

function fillDemo() {
  form.username = 'admin'
  form.password = '123456'
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-box__head">
        <h2>欢迎回来</h2>
        <p>登录 优选商城，继续你的购物</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          >
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >登 录</el-button>
        </el-form-item>
      </el-form>

      <div class="login-box__foot">
        <a @click="fillDemo">填入演示账号</a>
        <span class="divider">|</span>
        <router-link to="/register">没有账号？立即注册</router-link>
        <span class="divider">|</span>
        <router-link to="/home">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-box {
  width: 420px;
  background: $white;
  border-radius: 8px;
  padding: 36px 36px 24px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);

  &__head {
    text-align: center;
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      color: $text-color;
      font-weight: 700;
    }
    p {
      margin-top: 8px;
      font-size: 13px;
      color: $text-light;
    }
  }

  &__foot {
    text-align: center;
    font-size: 13px;
    color: $text-light;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px dashed $border-color;

    a {
      cursor: pointer;
      color: $text-normal;
      &:hover { color: $primary-color; }
    }
    .divider {
      margin: 0 10px;
      color: $border-color;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style>