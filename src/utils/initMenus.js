import Home from '../views/home.vue'

export const formatMenus = (menus) => {
    const route = menus.filter(item => {
        item.component = (item.component === 'Home') ? Home : loadView(item.component)
        item.icon = 'iconfont ' + item.icon;
        item.meta = {
            title: item.title
        }
        if (item.children && item.children.length > 0) {
            formatMenus(item.children)
        }
        return true
    })
    return route
}

// 路由懒加载
const loadView = (view) => {
    return (resolve) => require([`../views/${view}.vue`], resolve)
}