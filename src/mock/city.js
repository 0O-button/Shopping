// 热门城市
export const hotCities = [
  { province: '北京', city: '北京' },
  { province: '上海', city: '上海' },
  { province: '广东', city: '广州' },
  { province: '广东', city: '深圳' },
  { province: '浙江', city: '杭州' },
  { province: '江苏', city: '南京' },
  { province: '四川', city: '成都' },
  { province: '湖北', city: '武汉' },
  { province: '陕西', city: '西安' },
  { province: '江苏', city: '苏州' }
]

// 按省份分组
export const cityGroups = [
  {
    province: '江苏',
    cities: ['南京', '苏州', '无锡', '常州', '南通', '徐州', '扬州', '镇江', '泰州', '盐城']
  },
  {
    province: '浙江',
    cities: ['杭州', '宁波', '温州', '嘉兴', '绍兴', '金华', '台州', '湖州']
  },
  {
    province: '广东',
    cities: ['广州', '深圳', '珠海', '佛山', '东莞', '中山', '惠州', '汕头']
  },
  {
    province: '山东',
    cities: ['济南', '青岛', '烟台', '潍坊', '淄博', '临沂', '威海']
  },
  {
    province: '四川',
    cities: ['成都', '绵阳', '德阳', '南充', '宜宾', '泸州']
  },
  {
    province: '湖北',
    cities: ['武汉', '宜昌', '襄阳', '荆州', '黄石']
  },
  {
    province: '陕西',
    cities: ['西安', '咸阳', '宝鸡', '渭南']
  },
  {
    province: '福建',
    cities: ['福州', '厦门', '泉州', '漳州', '莆田']
  }
]

// 城市 → 省份 反查
export function findProvince(city) {
  for (const g of cityGroups) {
    if (g.cities.includes(city)) return g.province
  }
  if (['北京', '上海', '天津', '重庆'].includes(city)) return city
  return ''
}