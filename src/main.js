import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/global.css' // 全局样式
import '@/assets/icon/iconfont.css'
import '@/utils/ajax'
import '@/utils/elementui'
import '@/utils/permission' // 自定义指令

Vue.prototype.$qiniu = 'http://rc4jwe4j1.hd-bkt.clouddn.com/'; // 挂载七牛云地址

Vue.config.productionTip = false
Vue.config.devtools = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
