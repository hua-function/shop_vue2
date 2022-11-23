import Vue from 'vue'
import Router from 'vue-router'
const Login = () => import('@/components/Login.vue')
const Home = () => import('@/components/Home.vue')
const Welcome = () => import('@/components/Welcome.vue')
const Users = () => import('@/components/users/Users.vue')
const Rights = () => import('@/components/power/Rights.vue')
const Roles = () => import('@/components/power/Roles.vue')
const Cate = () => import('@/components/goods/Cate.vue')
const Params = () => import('@/components/goods/Params.vue')
const GoodsList = () => import('@/components/goods/List.vue')
const AddGoods = () => import('@/components/goods/AddGoods.vue')
const Order = () => import('@/components/order/Order.vue')
const Report = () => import('@/components/report/Report.vue')
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: AddGoods },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ] }
  ]
})

// 定义全局前置守卫，判断用户是否有权限访问login之后的页面
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 拿到sessionStorage保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next({ path: '/login' })
  next()
})

export default router
