// 演示账号
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    avatar: 'https://picsum.photos/seed/avatar1/100/100',
    phone: '13800138000',
    email: 'admin@example.com',
    gender: '男',
    birthday: '1995-06-15'
  }
]

export function makeToken(user) {
  return `mock-token-${user.id}-${Date.now()}`
}

export function userFromToken(token) {
  const m = /^mock-token-(\d+)-/.exec(token || '')
  if (!m) return null
  return mockUsers.find((u) => u.id === Number(m[1])) || null
}

// 收货地址（字段：姓名 / 手机 / 省 / 市 / 区 / 详细 / 邮编 / 标签 / 是否默认）
export const mockAddresses = [
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '江苏省',
    city: '南京市',
    district: '栖霞区',
    detail: '某某街道 88 号 优选大厦 1201 室',
    zipCode: '210000',
    tag: '家',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    detail: '中关村大街 1 号 科技大厦 A 座 806',
    zipCode: '100080',
    tag: '公司',
    isDefault: false
  }
]

export const ADDRESS_TAGS = ['家', '公司', '学校', '其他']