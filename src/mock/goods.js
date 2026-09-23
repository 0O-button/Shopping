const img = (seed, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

// ============ 商品基础数据 ============
const GOODS_STORAGE_KEY = 'mock_goods_base'

// ⭐ 数据版本号：改了商品结构/库存规则，就把这个数字 +1
// 加 1 后会自动重建所有商品数据，不用手动清 localStorage
const GOODS_VERSION = 3

const NAMES = [
  '智能手表 Pro 运动版', '无线降噪耳机 蓝牙5.3', '4K 高清投影仪 家用',
  '机械键盘 87 键 白光', '扫地机器人 自动集尘', '纯棉宽松卫衣 男女同款',
  '轻薄羽绒服 90 白鸭绒', '保湿精华液 30ml', '丝绒口红套装 6 支装',
  '真皮通勤包 大容量', '小米空气净化器 4', '戴森吹风机 HD15',
  'iPad Pro 12.9 英寸', 'MacBook Air M3', '华为 MateBook X Pro',
  '索尼 WH-1000XM5', 'Bose QC45 降噪', 'Kindle Paperwhite 5',
  '罗技 MX Master 3S', '膳魔师保温杯 500ml'
]

const BRANDS = ['优选自营', 'Apple', '华为', '小米', '戴森', '索尼', '罗技', '膳魔师']
const CATS = ['数码', '家电', '服饰', '美妆', '家居', '运动']

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function buildGoods() {
  return Array.from({ length: 60 }, (_, i) => {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` 第${Math.floor(i / NAMES.length) + 1}代` : '')
    return {
      id: 1000 + i,
      name,
      desc: '正品保障 · 全国联保 · 极速发货 · 七天无理由',
      price: +(Math.random() * 6000 + 99).toFixed(2),
      originPrice: +(Math.random() * 3000 + 6000).toFixed(2),
      sales: Math.floor(Math.random() * 20000) + 100,
      stock: Math.floor(Math.random() * 500) + 100,   // ⭐ 随机 100 ~ 600
      brand: randomOf(BRANDS),
      category: randomOf(CATS),
      tag: i % 5 === 0 ? '自营' : '',
      image: img(`goods${i}`, 500, 500)
    }
  })
}

function loadGoodsBase() {
  try {
    const cache = localStorage.getItem(GOODS_STORAGE_KEY)
    if (cache) {
      const parsed = JSON.parse(cache)
      // ⭐ 只有版本号一致 + 数据有效，才用缓存
      if (
        parsed &&
        parsed.version === GOODS_VERSION &&
        Array.isArray(parsed.list) &&
        parsed.list.length === 60
      ) {
        return parsed.list
      }
    }
  } catch (e) {}

  // 版本不一致 / 没缓存 / 数据坏了 → 重建
  const list = buildGoods()
  localStorage.setItem(GOODS_STORAGE_KEY, JSON.stringify({
    version: GOODS_VERSION,
    list
  }))
  // 顺便把扣减记录也清掉，避免旧 delta 扣在新数据上
  localStorage.removeItem('mock_stock_delta')
  return list
}

export const allGoods = loadGoodsBase()

// ============ 库存扣减管理 ============
const STOCK_KEY = 'mock_stock_delta'

function loadStockDelta() {
  try {
    return JSON.parse(localStorage.getItem(STOCK_KEY) || '{}')
  } catch (e) {
    return {}
  }
}

function saveStockDelta(delta) {
  localStorage.setItem(STOCK_KEY, JSON.stringify(delta))
}

/** 获取实际库存 = 原库存 - 已扣减 */
export function getRealStock(goodsId) {
  const base = allGoods.find((g) => g.id === Number(goodsId))
  if (!base) return 0
  const delta = loadStockDelta()
  const used = delta[goodsId] || 0
  return Math.max(0, base.stock - used)
}

/** 扣减库存 */
export function reduceStock(items) {
  const delta = loadStockDelta()
  items.forEach((item) => {
    delta[item.id] = (delta[item.id] || 0) + item.num
  })
  saveStockDelta(delta)
}

/** 回滚库存 */
export function restoreStock(items) {
  const delta = loadStockDelta()
  items.forEach((item) => {
    delta[item.id] = Math.max(0, (delta[item.id] || 0) - item.num)
  })
  saveStockDelta(delta)
}

// ============ 筛选选项 ============
export const filterOptions = {
  brands: BRANDS,
  categories: CATS,
  priceRanges: [
    { label: '0-500', min: 0, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000-3000', min: 1000, max: 3000 },
    { label: '3000-6000', min: 3000, max: 6000 },
    { label: '6000 以上', min: 6000, max: Infinity }
  ]
}

// ============ 商品详情 ============
export function makeDetail(id) {
  const base = allGoods.find((g) => g.id === Number(id)) || allGoods[0]
  return {
    ...base,
    stock: getRealStock(base.id),
    images: [
      img(`d${base.id}-1`, 600, 600),
      img(`d${base.id}-2`, 600, 600),
      img(`d${base.id}-3`, 600, 600),
      img(`d${base.id}-4`, 600, 600)
    ],
    specs: [
      { name: '颜色', values: ['经典黑', '星光白', '午夜蓝'] },
      { name: '版本', values: ['标准版', '高配版', '尊享版'] }
    ],
    detailHtml: `
      <p>【产品名称】${base.name}</p>
      <p>【品牌】${base.brand}</p>
      <p>【质保】全国联保，一年质保</p>
      <p>【发货】现货速发，48 小时内发货</p>
      <p style="margin-top: 20px; color: #999;">（此处为商品图文详情，正式项目由后端返回富文本）</p>
    `,
    params: [
      { key: '商品编号', value: base.id },
      { key: '品牌', value: base.brand },
      { key: '分类', value: base.category },
      { key: '库存', value: `${getRealStock(base.id)} 件` },
      { key: '发货地', value: '江苏 南京' }
    ]
  }
}
// ========== 临时诊断（问题解决后删掉） ==========
console.log('=== goods.js 已加载 ===')
console.log('GOODS_VERSION:', GOODS_VERSION)
console.log('allGoods 数量:', allGoods.length)
console.log('allGoods[0]:', allGoods[0])
console.log('getRealStock(1000):', getRealStock(1000))
console.log('localStorage 结构:', JSON.parse(localStorage.getItem('mock_goods_base') || 'null'))