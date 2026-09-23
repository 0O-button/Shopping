<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.theme === 'dark')

function handleToggle() {
  themeStore.toggle()
  ElMessage.success(isDark.value ? '已切换到暗色模式' : '已切换到亮色模式')
}
</script>

<template>
  <div class="theme-switch" @click="handleToggle" :title="isDark ? '切换到亮色' : '切换到暗色'">
    <el-icon v-if="isDark"><Sunny /></el-icon>
    <el-icon v-else><Moon /></el-icon>
  </div>
</template>

<style scoped lang="scss">
.theme-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  color: $text-normal;
  transition: all 0.2s;

  &:hover {
    background: $bg-gray;
    color: $primary-color;
    transform: rotate(20deg);
  }

  .el-icon {
    font-size: 16px;
  }
}
</style>