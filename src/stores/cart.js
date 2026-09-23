import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 载入并做旧数据兼容（补 key 字段）
  const raw = JSON.parse(localStorage.getItem('cart') || '[]')
  raw.forEach((item) => {
    if (!item.key) {
      item.key = `${item.id}__${item.spec || ''}__${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    }
  })
  const items = ref(raw)

  const totalCount = computed(() => items.value.length)
  const checkedItems = computed(() => items.value.filter((i) => i.checked))
  const totalNum = computed(() =>
    checkedItems.value.reduce((sum, i) => sum + i.num, 0)
  )
  const totalPrice = computed(() =>
    checkedItems.value.reduce((sum, i) => sum + i.price * i.num, 0)
  )
  const isAllChecked = computed(
    () => items.value.length > 0 && items.value.every((i) => i.checked)
  )

  /** ⭐ 加入购物车：每次都作为独立新行，不累加 */
  function addItem(goods, num = 1) {
    const key = `${goods.id}__${goods.spec || ''}__${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    items.value.push({
      ...goods,
      num,
      checked: true,
      key
    })
    persist()
  }

  /** ⭐ 所有操作都改用 key */
  function removeItem(key) {
    items.value = items.value.filter((i) => i.key !== key)
    persist()
  }

  function removeChecked() {
    items.value = items.value.filter((i) => !i.checked)
    persist()
  }

  function updateNum(key, num) {
    const item = items.value.find((i) => i.key === key)
    if (item) item.num = num
    persist()
  }

  function toggleCheck(key) {
    const item = items.value.find((i) => i.key === key)
    if (item) item.checked = !item.checked
    persist()
  }

  function toggleAll(checked) {
    items.value.forEach((i) => (i.checked = checked))
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  function clearChecked() {
    items.value = items.value.filter((i) => !i.checked)
    persist()
  }

  function persist() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  return {
    items,
    totalCount,
    checkedItems,
    totalNum,
    totalPrice,
    isAllChecked,
    addItem,
    removeItem,
    removeChecked,
    updateNum,
    toggleCheck,
    toggleAll,
    clear,
    clearChecked
  }
})