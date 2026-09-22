const img = (seed, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

// ---------- 生成一批商品（供搜索页用） ----------
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

export const allGoods = Array.from({ length: 60 }, (_, i) => {
  const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` 第${Math.floor(i / NAMES.length) + 1}代` : '')
  return {
    id: 1000 + i,
    name,
    desc: '正品保障 · 全国联保 · 极速发货 · 七天无理由',
    price: +(Math.random() * 6000 + 99).toFixed(2),
    originPrice: +(Math.random() * 3000 + 6000).toFixed(2),
    sales: Math.floor(Math.random() * 20000) + 100,
    stock: Math.floor(Math.random() * 500) + 20,
    brand: randomOf(BRANDS),
    category: randomOf(CATS),
    tag: i % 5 === 0 ? '自营' : '',
    image: img(`goods${i}`, 500, 500)
  }
})

// ---------- 分类筛选选项 ----------
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

// ---------- 商品详情 ----------
export function makeDetail(id) {
  const base = allGoods.find((g) => g.id === Number(id)) || allGoods[0]
  return {
    ...base,
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
      { key: '库存', value: `${base.stock} 件` },
      { key: '发货地', value: '江苏 南京' }
    ]
  }
}