<template>
    <el-container class="home-container">
        <!--头部布局-->
        <el-header>
            <div>
                <el-avatar :src="avatar.startsWith('https') ? avatar : this.$qiniu + avatar" />
                <span class="admin-name">运动管理平台—— 欢迎你: {{ this.name }}</span>
            </div>
            <el-button
                icon="el-icon-menu"
                type="info"
                size="mini"
                class="open-menu"
                @click="toggleCollapase"
                circle
            />
            <el-button
                icon="el-icon-switch-button"
                type="warning"
                size="mini"
                class="phone-logout"
                @click="logout"
                circle
            />
            <el-button type="danger" class="logout" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!--侧边布局-->
            <el-aside :width="isCollapse ?'64px':'200px'">
                <!--伸缩按钮-->
                <div class="toggle-button" @click="toggleCollapase">
                    <i class="el-icon-s-fold"></i>
                </div>
                <!--侧边栏菜单区 unique-opened="true" 只保持一个菜单展开 router开启路由 active-text-color 颜色-->
                <el-menu
                    background-color="#545c64"
                    text-color="#fff"
                    active-text-color="#409eff"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    :router="true"
                    :default-active="activePath"
                >
                    <el-submenu :index="index + ''" v-for="(item, index) in menus" :key="index">
                        <template slot="title">
                            <i :class="item.icon" />
                            <span>{{ item.title }}</span>
                        </template>
                        <el-menu-item
                            :index="it.path"
                            v-for="(it, i) in item.children"
                            :key="i"
                            @click="saveNavState(it.path)"
                        >
                            <template slot="title">
                                <i :class="it.icon" />
                                <span>{{ it.title }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
                
            </el-aside>
            <!--主体布局-->
            <el-main>
                <el-breadcrumb separator-class="el-icon-arrow-right">
                    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-for="(item, index) in $router.currentRoute.matched" :key="index">{{item.meta.title}}</el-breadcrumb-item>
                </el-breadcrumb>
                <div class="welcome" v-show="this.$router.currentRoute.path === '/'">欢迎来到健康管理平台！</div>

                <!--路由占位符-->
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState(['name', 'avatar', 'menus'])
    },
    created() {
    },
    data() {
        return {
            isCollapse: false,
            activePath: sessionStorage.getItem('activePath') || '',
        }
    },
    methods: {
        logout() {
            this.$confirm('您将退出登录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.get('/user/logout').then((res) => {
                    this.$message.success(res.data.msg);
                    //清空本地缓存
                    sessionStorage.clear();
                    //跳转页面
                    this.$router.replace({ path: '/login' });
                    //刷新vuex中的数据
                    window.location.reload();
                });
            }).catch(() => {
                this.$message.info('操作已取消!');
            });
        },
        toggleCollapase() {
            this.isCollapse = !this.isCollapse;
        },
        // 保存二级菜单的路径
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath);// 存放点击的二级菜单
            this.activePath = activePath;// 给点击的菜单添加高亮
        },
    }
}
</script>

<style lang="less" scoped>
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between; // 左右贴边
    padding-left: 0%; // 左边界
    align-items: center; // 水平
    color: #fff;
    font-size: 20px;
    > div {
        //左侧div加布局
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}

.open-menu {
    display: none;
}
.phone-logout {
    display: none;
}

.admin-name {
    font-size: 30px;
    font-family: Microsoft YaHei;
}

@media screen and (max-width: 500px) {
    .logout {
        display: none !important;
    }
    .el-header {
        font-size: 1px !important;
    }
    .admin-name {
        display: none;
    }
    .open-menu {
        display: block !important;
    }
    .phone-logout {
        display: block !important;
    }
    .toggle-button {
        display: none !important;
    }
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none; // 对其右边框
    }
}
.el-main {
    background-color: #eaedf1;
}
.home-container {
    height: 100%;
}
.logo_img {
    height: 75px !important;
    width: 70px !important;
}
.iconfont {
    margin-right: 10px;
}
.toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
.el-menu :hover {
    color: yellow;
}

.el-icon-s-fold {
    margin-top: 2px;
    font-size: 20px;
}

.welcome {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 50px;
    margin: 100px 150px auto;
    color: chocolate;
}
</style>
