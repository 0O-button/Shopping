import request from './request'
import { mockBanners, mockCategories, mockFloors } from '@/mock/home'

// ⚠️ 后端联调时改成 false
const USE_MOCK = true

export const getBanners = () =>
  USE_MOCK ? Promise.resolve(mockBanners) : request.get('/home/banners')

export const getCategories = () =>
  USE_MOCK ? Promise.resolve(mockCategories) : request.get('/home/categories')

export const getFloors = () =>
  USE_MOCK ? Promise.resolve(mockFloors) : request.get('/home/floors')