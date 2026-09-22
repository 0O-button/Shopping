const img = (seed, w = 200, h = 200) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const ORDER_STATUS = {
  UNPAID: { key: 'UNPAID', label: '待付款', color: '#ff9800' },
  UNSHIPPED: { key: 'UNSHIPPED', label: '待发货', color: '#2196f3' },
  SHIPPED: { key: 'SHIPPED', label: '待收货', color: '#00bcd4' },
  FINISHED: { key: 'FINISHED', label: '已完成', color: '#4caf50' },
  CANCELED: { key: 'CANCELED', label: '已取消', color: '#999' }
}

function makeOrder(i, status) {
  const goodsCount = Math.floor(Math.random() * 3) + 1
  const goods = Array.from({ length: goodsCount }, (_, j) => {
    const price = +(Math.random() * 3000 + 99).toFixed(2)
    return {
      id: 1000 + i * 10 + j,
      name: `示例商品 ${i * 10 + j}`,
      price,
      num: Math.floor(Math.random() * 3) + 1,
      image: img(`order${i}${j}`, 200, 200),
      spec: '颜色：经典黑 / 版本：标准版'
    }
  })
  const total = goods.reduce((s, g) => s + g.price * g.num, 0)
  return {
    id: `NO${202400000000 + i}`,
    status,
    statusLabel: ORDER_STATUS[status].label,
    statusColor: ORDER_STATUS[status].color,
    createTime: `2024-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, '0')} 12:30:45`,
    goods,
    total: +total.toFixed(2),
    receiver: {
      name: '张三',
      phone: '138****8888',
      address: '江苏省 南京市 栖霞区 某某街道 88 号 优选大厦 1201 室'
    }
  }
}

const statuses = [
  'FINISHED',   // 1
  'FINISHED',   // 2
  'SHIPPED',    // 3
  'SHIPPED',    // 4
  'UNSHIPPED',  // 5
  'FINISHED',   // 6
  'CANCELED',   // 7  ← 取消
  'SHIPPED',    // 8
  'FINISHED',   // 9
  'UNSHIPPED',  // 10
  'CANCELED',   // 11 ← 取消
  'FINISHED'    // 12
]

export const mockOrders = Array.from({ length: 12 }, (_, i) =>
  makeOrder(i + 1, statuses[i])
)