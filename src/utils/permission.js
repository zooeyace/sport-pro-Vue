import Vue from "vue";
import store from "../store";

/**
 *  自定义指令 v-hasRole
 */
Vue.directive('hasRole', {
    inserted(el, binding) {
        // 获取指令传递过来的数据
        const {value} = binding // { xxx } 能拿到后面的对象的xxx属性 ==> 拿到 binding.value
        // vuex
        const roles = store.state.roles;
        // 定义管理员
        const admin = 'ROLE_SUPERADMIN';
        if (value && value instanceof Array && value.length > 0) {
            // some() 用于判断数组中元素是否满足条件 返回布尔值
            const flag = roles.some(item => {
                return item.name === admin || value.includes(item.name);
            });
            // 不是管理员角色
            if (!flag) el.parentNode.removeChild(el)
        } else {
            throw new Error(`请设置${value}角色标签`);
        }
    }
})


Vue.directive('hasPermission', {
    inserted(el, binding) {
        const {value} = binding
        const permissions = store.state.permissions;
        const roles = store.state.roles;
        const admin = 'ROLE_SUPERADMIN';
        if (value && value instanceof Array && value.length > 0) {
            const permissionFlag = permissions.some(item => {
                return value.includes(item.name);
            })
            const roleFlag = roles.some(item => {
                return item.name === admin
            })
            if (!permissionFlag && !roleFlag) el.parentNode.removeChild(el)
        } else {
            throw new Error(`请设置${value}权限标签`);
        }
    }
})