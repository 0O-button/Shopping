import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProfile } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const isLogin = computed(() => !!token.value)

  function setLogin(data) {
    token.value = data.token
    userInfo.value = data.userInfo || {}
    localStorage.setItem('token', data.token)
    if (data.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /** 从后端/本地恢复用户信息（刷新页面时用） */
  async function restore() {
    if (!token.value) return
    // 先看本地缓存的
    const cache = localStorage.getItem('userInfo')
    if (cache) {
      try { userInfo.value = JSON.parse(cache) } catch (e) {}
    }
    // 再拉一次最新
    try {
      const info = await getProfile()
      userInfo.value = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    } catch (e) {
      // token 无效则登出
      logout()
    }
  }

  return { token, userInfo, isLogin, setLogin, logout, restore }
})