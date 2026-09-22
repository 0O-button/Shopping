const img = (seed, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const mockBanners = [
  { id: 1, title: '618 年中大促', image: img('banner1', 900, 480), link: '/search?keyword=618' },
  { id: 2, title: '数码新品首发', image: img('banner2', 900, 480), link: '/search?keyword=数码' },
  { id: 3, title: '家电焕新季', image: img('banner3', 900, 480), link: '/search?keyword=家电' }
]

export const mockCategories = [
  { id: 1, name: '手机 / 运营商 / 数码', children: [
      { name: '手机通讯', items: ['智能手机', '老人机', '对讲机'] },
      { name: '手机配件', items: ['充电器', '手机壳', '数据线'] },
      { name: '数码', items: ['相机', '耳机', '音箱'] }
  ]},
  { id: 2, name: '电脑 / 办公', children: [
      { name: '电脑整机', items: ['笔记本', '台式机', '平板'] },
      { name: '外设产品', items: ['鼠标', '键盘', '显示器'] }
  ]},
  { id: 3, name: '家用电器', children: [
      { name: '大家电', items: ['电视', '冰箱', '洗衣机'] },
      { name: '生活电器', items: ['电饭煲', '空气炸锅', '吸尘器'] }
  ]},
  { id: 4, name: '男装 / 女装 / 内衣', children: [] },
  { id: 5, name: '鞋靴 / 箱包 / 钟表', children: [] },
  { id: 6, name: '美妆 / 个护清洁', children: [] },
  { id: 7, name: '母婴 / 玩具乐器', children: [] },
  { id: 8, name: '食品 / 酒类 / 生鲜', children: [] },
  { id: 9, name: '图书 / 文娱 / 教育', children: [] },
  { id: 10, name: '运动 / 户外 / 骑行', children: [] }
]

const makeGoods = (prefix, names) =>
  names.map((name, i) => ({
    id: `${prefix}-${i + 1}`,
    name,
    desc: '正品保障 · 全国联保 · 极速发货',
    price: (Math.random() * 4000 + 199).toFixed(2),
    sales: Math.floor(Math.random() * 9000) + 100,
    tag: i === 0 ? '自营' : '',
    image: img(`${prefix}${i}`)
  }))

export const mockFloors = [
  {
    id: 1,
    title: '数码电器',
    subTitle: '潮酷数码 · 品质家电',
    goods: makeGoods('digital', ['智能手表 Pro', '无线降噪耳机', '4K 高清投影仪', '机械键盘 87 键', '扫地机器人'])
  },
  {
    id: 2,
    title: '服饰美妆',
    subTitle: '当季新品 · 焕新你的衣橱',
    goods: makeGoods('fashion', ['纯棉宽松卫衣', '轻薄羽绒服', '保湿精华液', '丝绒口红套装', '真皮通勤包'])
  }
]