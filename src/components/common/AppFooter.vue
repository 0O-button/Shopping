<script setup>
const links = [
  { title: '购物指南', items: ['购物流程', '会员介绍', '常见问题', '联系客服'] },
  { title: '配送方式', items: ['上门自提', '211限时达', '配送服务查询', '配送费收取标准'] },
  { title: '支付方式', items: ['货到付款', '在线支付', '分期付款', '公司转账'] },
  { title: '售后服务', items: ['售后政策', '价格保护', '退款说明', '取消订单'] }
]
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-links">
        <dl v-for="group in links" :key="group.title">
          <dt>{{ group.title }}</dt>
          <dd v-for="item in group.items" :key="item"><a href="#">{{ item }}</a></dd>
        </dl>
      </div>
      <div class="copyright">
        <p>优选商城 · 毕业设计演示项目</p>
        <p>Vue3 + Vite + Pinia + Element Plus &nbsp;|&nbsp; Spring Boot 后端</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  margin-top: 40px;
  background: $white;
  border-top: 1px solid $border-color;
  padding: 30px 0 20px;
}

.footer-links {
  display: flex;
  justify-content: space-around;
  padding-bottom: 24px;
  border-bottom: 1px solid $border-color;

  dt {
    font-weight: 700;
    margin-bottom: 12px;
    color: $text-color;
  }
  dd {
    margin-bottom: 8px;
    a {
      font-size: 13px;
      color: $text-light;
      &:hover { color: $primary-color; }
    }
  }
}

.copyright {
  padding-top: 18px;
  text-align: center;
  font-size: 12px;
  color: $text-light;
  line-height: 22px;
}
</style>