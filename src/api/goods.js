import request from './request'
import { allGoods, makeDetail, filterOptions } from '@/mock/goods'
import { getRealStock } from '@/mock/goods'


const USE_MOCK = true

/**
 * 商品列表（支持关键词、分类、品牌、价格区间、排序、分页）
 * params: { keyword, category, brand, minPrice, maxPrice, sort, page, pageSize }
 */
export const getGoodsList = (params = {}) => {
  if (!USE_MOCK) return request.get('/goods/list', { params })

  const {
    keyword = '',
    category = '',
    brand = '',
    minPrice,
    maxPrice,
    sort = 'default',
    page = 1,
    pageSize = 20
  } = params

  let list = allGoods.map((g) => ({
  ...g,
  stock: getRealStock(g.id)
}))

  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(
      (g) => g.name.toLowerCase().includes(kw) || g.brand.toLowerCase().includes(kw)
    )
  }
  if (category) list = list.filter((g) => g.category === category)
  if (brand) list = list.filter((g) => g.brand === brand)
  if (minPrice !== undefined) list = list.filter((g) => g.price >= minPrice)
  if (maxPrice !== undefined) list = list.filter((g) => g.price <= maxPrice)

  if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
  else if (sort === 'sales_desc') list.sort((a, b) => b.sales - a.sales)

  const total = list.length
  const start = (page - 1) * pageSize
  const records = list.slice(start, start + pageSize)

  return Promise.resolve({ total, records, page, pageSize })
}

/** 商品详情 */
export const getGoodsDetail = (id) => {
  if (!USE_MOCK) return request.get(`/goods/${id}`)
  const data = makeDetail(id)
  // 用实际库存覆盖
  data.stock = getRealStock(id)
  return Promise.resolve(data)
}

/** 筛选选项（品牌、分类、价格区间） */
export const getFilterOptions = () => {
  if (!USE_MOCK) return request.get('/goods/filters')
  return Promise.resolve(filterOptions)
}