import request from './request'
import { mockUsers, makeToken, userFromToken, mockAddresses } from '@/mock/user'

const USE_MOCK = true

/** 登录 */
export const login = (data) => {
  if (!USE_MOCK) return request.post('/user/login', data)

  const user = mockUsers.find(
    (u) => u.username === data.username && u.password === data.password
  )
  if (!user) return Promise.reject(new Error('用户名或密码错误'))

  return Promise.resolve({
    token: makeToken(user),
    userInfo: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      email: user.email
    }
  })
}

/** 注册 */
export const register = (data) => {
  if (!USE_MOCK) return request.post('/user/register', data)

  if (mockUsers.some((u) => u.username === data.username)) {
    return Promise.reject(new Error('用户名已存在'))
  }
  const newUser = {
    id: mockUsers.length + 1,
    username: data.username,
    password: data.password,
    nickname: data.nickname || data.username,
    avatar: `https://picsum.photos/seed/user${Date.now()}/100/100`,
    phone: data.phone || '',
    email: data.email || ''
  }
  mockUsers.push(newUser)
  return Promise.resolve({ id: newUser.id })
}

/** 获取当前用户信息 */
export const getProfile = () => {
  if (!USE_MOCK) return request.get('/user/profile')
  const token = localStorage.getItem('token')
  const user = userFromToken(token)
  if (!user) return Promise.reject(new Error('未登录'))
  return Promise.resolve({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    birthday: user.birthday
  })
}

/** 更新用户信息 */
export const updateProfile = (data) => {
  if (!USE_MOCK) return request.put('/user/profile', data)
  const token = localStorage.getItem('token')
  const user = userFromToken(token)
  if (user) Object.assign(user, data)
  return Promise.resolve(true)
}

/** 收货地址列表 */
export const getAddressList = () => {
  if (!USE_MOCK) return request.get('/user/address')
  return Promise.resolve([...mockAddresses])
}

/** 新增地址 */
export const addAddress = (data) => {
  if (!USE_MOCK) return request.post('/user/address', data)
  const item = { ...data, id: Date.now() }
  mockAddresses.push(item)
  return Promise.resolve(item)
}

/** 更新地址 */
export const updateAddress = (id, data) => {
  if (!USE_MOCK) return request.put(`/user/address/${id}`, data)
  const idx = mockAddresses.findIndex((a) => a.id === id)
  if (idx > -1) mockAddresses[idx] = { ...mockAddresses[idx], ...data }
  return Promise.resolve(true)
}

/** 删除地址 */
export const deleteAddress = (id) => {
  if (!USE_MOCK) return request.delete(`/user/address/${id}`)
  const idx = mockAddresses.findIndex((a) => a.id === id)
  if (idx > -1) mockAddresses.splice(idx, 1)
  return Promise.resolve(true)
}