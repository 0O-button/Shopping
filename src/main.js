import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'   // ⭐ Element Plus 暗黑主题
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import '@/assets/styles/global.scss'

// ⭐ 在挂载前应用保存的主题，防止闪烁
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

const app = createApp(App)

// 全局注册 Element 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')