import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/goods/:id',
    name: 'GoodsDetail',
    component: () => import('@/views/goods/GoodsDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/goods/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/Cart.vue'),
    meta: { title: '购物车', auth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/cart/Checkout.vue'),
    meta: { title: '确认订单', auth: true }
  },
  {
    path: '/address/edit/:id?',
    name: 'AddressEdit',
    component: () => import('@/views/user/AddressEdit.vue'),
    meta: { title: '编辑收货地址', auth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/user',
    component: () => import('@/views/user/Layout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人资料' }
      },
      {
        path: 'order',
        name: 'UserOrder',
        component: () => import('@/views/user/Order.vue'),
        meta: { title: '我的订单' }
      },
      {
        path: 'address',
        name: 'UserAddress',
        component: () => import('@/views/user/Address.vue'),
        meta: { title: '收货地址' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 优选商城` : '优选商城'
  const needAuth = to.matched.some((r) => r.meta.auth)
  if (needAuth && !localStorage.getItem('token')) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router