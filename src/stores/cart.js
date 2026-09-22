import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

  // 商品种类数（角标用）
  const totalCount = computed(() => items.value.length)

  // 已勾选的商品
  const checkedItems = computed(() => items.value.filter((i) => i.checked))

  // 勾选数量合计
  const totalNum = computed(() =>
    checkedItems.value.reduce((sum, i) => sum + i.num, 0)
  )

  // 勾选金额合计
  const totalPrice = computed(() =>
    checkedItems.value.reduce((sum, i) => sum + i.price * i.num, 0)
  )

  // 是否全选
  const isAllChecked = computed(
    () => items.value.length > 0 && items.value.every((i) => i.checked)
  )

  function addItem(goods, num = 1) {
    const exist = items.value.find(
      (i) => i.id === goods.id && i.spec === goods.spec
    )
    if (exist) exist.num += num
    else items.value.push({ ...goods, num, checked: true })
    persist()
  }

  function removeItem(id, spec) {
    items.value = items.value.filter(
      (i) => !(i.id === id && i.spec === spec)
    )
    persist()
  }

  function removeChecked() {
    items.value = items.value.filter((i) => !i.checked)
    persist()
  }

  function updateNum(id, spec, num) {
    const item = items.value.find((i) => i.id === id && i.spec === spec)
    if (item) item.num = num
    persist()
  }

  function toggleCheck(id, spec) {
    const item = items.value.find((i) => i.id === id && i.spec === spec)
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