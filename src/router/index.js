import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login'
import Home from '@/views/home'
import store from '../store'
import ajax from '@/utils/ajax'
import {formatMenus} from '../utils/initMenus'

Vue.use(VueRouter)

//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push
//修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [{
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("token")
  if (!token) {
    if (to.path === '/login') {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
    }
  } else {
    // 判断vuex是否存在用户信息
    // 获取用户信息
    ajax.get("/user/userinfo").then((res) => {
      const userinfo = res.data.data;
      store.commit('setName', userinfo.nickname)
      store.commit('setAvatar', userinfo.avatarUrl)
      if (userinfo.roles.length > 0) {
        store.commit('setRoles', userinfo.roles)

        const menuList = formatMenus(userinfo.menus) // 格式化
        router.addRoutes(menuList)
        store.commit('setMenus', menuList)

        store.commit('setPermissions', userinfo.permissions)
      }
    })


    if (to.path === '/login') {
      next("/")
    } else {
      next()
    }
  }
})

export default router