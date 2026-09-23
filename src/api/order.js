import request from './request'
import { mockOrders, ORDER_STATUS } from '@/mock/order'
import { reduceStock, restoreStock } from '@/mock/goods'

const USE_MOCK = true

const STORAGE_KEY = 'mock_orders'

function loadOrders() {
  try {
    const cache = localStorage.getItem(STORAGE_KEY)
    if (cache) return JSON.parse(cache)
  } catch (e) {}
  const init = JSON.parse(JSON.stringify(mockOrders))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(init))
  return init
}

function saveOrders(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/** 订单列表 */
export const getOrderList = (params = {}) => {
  if (!USE_MOCK) return request.get('/order/list', { params })

  const { status = '', page = 1, pageSize = 5 } = params
  const all = loadOrders()
  let list = [...all]
  if (status) list = list.filter((o) => o.status === status)

  const total = list.length
  const start = (page - 1) * pageSize
  return Promise.resolve({
    total,
    records: list.slice(start, start + pageSize)
  })
}

/** 提交订单 */
export const submitOrder = (data) => {
  if (!USE_MOCK) return request.post('/order/submit', data)

  const orderId = `NO${Date.now()}`
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} `
    + `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  const status = data.payType === 'cod' ? 'UNSHIPPED' : 'UNPAID'
  const meta = ORDER_STATUS[status]

  const goods = (data.goods || []).map((g) => ({
  key: g.key,                    // ⭐ 保留 key
  id: g.id,
  name: g.name,
  price: Number(g.price),
  num: g.num,
  image: g.image,
  spec: g.spec || ''
}))

  const newOrder = {
    id: orderId,
    status,
    statusLabel: meta.label,
    statusColor: meta.color,
    createTime,
    goods,
    total: Number(data.total) || 0,
    receiver: {
      name: data.address?.name || '',
      phone: data.address?.phone || '',
      address: data.address?.fullAddress || ''
    },
    payType: data.payType || 'alipay',
    remark: data.remark || ''
  }

  reduceStock(goods.map((g) => ({ id: g.id, num: g.num })))

  const list = loadOrders()
  list.unshift(newOrder)
  saveOrders(list)

  return Promise.resolve({ orderId })
}

/** 取消订单 */
export const cancelOrder = (orderId) => {
  if (!USE_MOCK) return request.post(`/order/${orderId}/cancel`)

  const list = loadOrders()
  const idx = list.findIndex((o) => o.id === orderId)
  if (idx > -1) {
    const order = list[idx]
    if (order.status !== 'CANCELED') {
      restoreStock(order.goods.map((g) => ({ id: g.id, num: g.num })))
    }
    list[idx].status = 'CANCELED'
    list[idx].statusLabel = ORDER_STATUS.CANCELED.label
    list[idx].statusColor = ORDER_STATUS.CANCELED.color
    saveOrders(list)
  }
  return Promise.resolve(true)
}

/** 确认收货 */
export const confirmReceive = (orderId) => {
  if (!USE_MOCK) return request.post(`/order/${orderId}/confirm`)

  const list = loadOrders()
  const idx = list.findIndex((o) => o.id === orderId)
  if (idx > -1) {
    list[idx].status = 'FINISHED'
    list[idx].statusLabel = ORDER_STATUS.FINISHED.label
    list[idx].statusColor = ORDER_STATUS.FINISHED.color
    saveOrders(list)
  }
  return Promise.resolve(true)
}

/** 支付订单 */
export const payOrder = (orderId) => {
  if (!USE_MOCK) return request.post(`/order/${orderId}/pay`)

  const list = loadOrders()
  const idx = list.findIndex((o) => o.id === orderId)
  if (idx > -1) {
    list[idx].status = 'UNSHIPPED'
    list[idx].statusLabel = ORDER_STATUS.UNSHIPPED.label
    list[idx].statusColor = ORDER_STATUS.UNSHIPPED.color
    saveOrders(list)
  }
  return Promise.resolve(true)
}

/** 删除单个订单 */
export const deleteOrder = (orderId) => {
  if (!USE_MOCK) return request.delete(`/order/${orderId}`)

  const list = loadOrders()
  const next = list.filter((o) => o.id !== orderId)
  saveOrders(next)
  return Promise.resolve(true)
}

/** 批量删除订单 */
export const batchDeleteOrders = (orderIds) => {
  if (!USE_MOCK) return request.post('/order/batch-delete', { orderIds })

  const ids = new Set(orderIds)
  const list = loadOrders()
  const next = list.filter((o) => !ids.has(o.id))
  saveOrders(next)
  return Promise.resolve(true)
}