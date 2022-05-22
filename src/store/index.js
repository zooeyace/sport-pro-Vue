import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: sessionStorage.getItem('token') || '',
    name: sessionStorage.getItem('name') || '',
    avatar: sessionStorage.getItem('avatar') || '',
    roles: [],
    menus: [],
    permissions: []
  },
  mutations: {
    setToken(state, data) {
      state.token = data
      sessionStorage.setItem('token', data)
    },
    setName(state, data) {
      state.name = data
      sessionStorage.setItem('name', data)
    },
    setRoles(state, data) {
      state.roles = data;
      //sessionStorage.setItem('roles', JSON.stringify(data))
    },
    setMenus(state, data) {
      state.menus = data;
      //sessionStorage.setItem('menus', JSON.stringify(data))
    },
    setPermissions(state, data) {
      state.permissions = data;
      //sessionStorage.setItem('premissions', JSON.stringify(data))
    },
    setAvatar(state, data) {
      state.avatar = data;
      sessionStorage.setItem('avatar', data);
    }
  },
  actions: {},
  modules: {}
})