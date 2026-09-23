import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  function apply(t) {
    theme.value = t
    localStorage.setItem('theme', t)
    const html = document.documentElement
    html.setAttribute('data-theme', t)
    // Element Plus 用 .dark 类控制
    html.classList.toggle('dark', t === 'dark')
  }

  function toggle() {
    apply(theme.value === 'light' ? 'dark' : 'light')
  }

  function init() {
    apply(theme.value)
  }

  return { theme, apply, toggle, init }
})