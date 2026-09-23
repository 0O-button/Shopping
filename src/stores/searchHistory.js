import { defineStore } from 'pinia'
import { ref } from 'vue'

const KEY = 'search_history'
const MAX = 10

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  const history = ref(JSON.parse(localStorage.getItem(KEY) || '[]'))

  /** 添加一条（去重 + 最新的放最前 + 限制条数） */
  function add(keyword) {
    const kw = (keyword || '').trim()
    if (!kw) return
    // 去重
    const list = history.value.filter((h) => h !== kw)
    // 最新的放最前
    list.unshift(kw)
    // 限制条数
    history.value = list.slice(0, MAX)
    persist()
  }

  /** 删除单条 */
  function remove(keyword) {
    history.value = history.value.filter((h) => h !== keyword)
    persist()
  }

  /** 清空 */
  function clear() {
    history.value = []
    persist()
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify(history.value))
  }

  return { history, add, remove, clear }
})