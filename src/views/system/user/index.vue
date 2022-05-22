<template>
    <div>
        <!-- 卡片视图区 -->
        <el-card class="main-card">
            <div v-show="!open">
                <el-row :gutter="25">
                    <el-col :span="10">
                        <!-- 搜索添加 -->
                        <el-input
                            placeholder="请输入搜索内容"
                            v-model="queryInfo.queryParam"
                            clearable
                            @clear="findPage"
                        >
                            <el-button slot="append" icon="el-icon-search" @click="findPage" />
                        </el-input>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" @click="insert">添加用户</el-button>
                    </el-col>
                </el-row>
                <!-- 用户列表 -->
                <el-table
                    :data="userList"
                    border
                    stripe
                    v-loading="loading"
                    element-loading-text="加载中..."
                    element-loading-spinner="el-icon-loading"
                >
                    <el-table-column type="index" label="序号" />
                    <el-table-column label="用户名" prop="username" />
                    <el-table-column label="性别" prop="sex" :formatter="sexFormat" />
                    <el-table-column label="邮箱" prop="email" show-overflow-tooltip />
                    <!-- <el-table-column label="管理员" prop="admin">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.admin"
                            @change="adminChanged($event, scope.row)"
                            @click.stop.native
                        />
                    </template>
                    </el-table-column>-->
                    <el-table-column label="状态" prop="status">
                        <template slot-scope="scope">
                            <el-switch
                                v-model="scope.row.status"
                                @change="statusChange(scope.row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-tooltip
                                class="item"
                                effect="dark"
                                content="重置密码(123456)"
                                placement="top"
                            >
                                <!-- 重置密码 -->
                                <el-button
                                    type="info"
                                    icon="el-icon-unlock"
                                    size="mini"
                                    @click="resetPassword(scope.row)"
                                />
                            </el-tooltip>
                            <!-- 修改 -->
                            <el-button
                                type="primary"
                                icon="el-icon-edit"
                                size="mini"
                                @click="update(scope.row)"
                            />
                            <!-- 删除 -->
                            <el-button
                                type="danger"
                                icon="el-icon-delete"
                                size="mini"
                                @click="deleteById(scope.row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页 -->
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pageNumber"
                    :page-sizes="[20, 50, 80, 120]"
                    :page-size="queryInfo.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                />
            </div>

            <!-- 子组件 点击新增跳往子组件 -->
            <handler v-show="open" :title="title" @cancel="cancel" :dataForm="dataForm"/>
        </el-card>

        
    </div>
</template>

<script>
// 注册子组件，引入handler页面
import handler from './handler.vue'
export default {
    name: 'User',
    components: {
        handler
    },
    data() {
        return {
            // 请求参数(查询参数，页码，每页大小)
            queryInfo: {
                queryParam: "",
                pageNumber: 1,
                pageSize: 20
            },
            userList: [],// 用户列表
            total: 0,
            dialogVisible: false,// 对话框显示
            // 添加用户表单项
            dataForm: {},
            title: '',
            //角色列表
            roles: [],
            // 验证规则
            rules: {
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { min: 3, max: 8, message: "长度在 5 到 8 个字符", trigger: "blur" },
                    { validator: this.checkData, trigger: ['blur', 'change'] }
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { min: 6, max: 8, message: "长度在 6 到 8 个字符", trigger: "blur" }
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: 'email', message: "请输入正确邮箱地址", trigger: ['blur', 'change'] }
                ],
                roles: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.roles.length < 1) {
                                callback(new Error('请选择角色'));
                            } else {
                                callback();
                            }
                        },
                        trigger: "change"
                    },
                ]
            },
            //角色列表
            roleList: [],
            loading: false,
            open: false
        }
    },
    //钩子函数
    created() {
        this.findPage();
    },
    methods: {
        async findPage() {
            this.loading = true
            this.$ajax.post('/user/page', this.queryInfo).then((res) => {
                this.loading = false
                if (res.data.code !== 200) return this.$message.error(res.data.msg);
                this.userList = res.data.data.rows;
                this.total = res.data.data.total;
            });
        },
        // 监听pageSize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pageSize = newSize;
            this.findPage();
        },
        // 监听pageNum改变的事件
        handleCurrentChange(newNumber) {
            this.queryInfo.pageNumber = newNumber;
            this.findPage();
        },
        statusChange(row) {
            this.$ajax.put('/user/update', row).then((res) => {
                this.$message.success('状态更新成功');
            });
        },
        //添加用户 跳往子组件
        insert() {
            this.dataForm = {}
            this.open = true
            this.title = '添加用户'
        },
        // 修改
        update(row) {
            console.log(row);
            this.dataForm = row;
            this.title = '修改用户';
            this.open = true;
        },        
        // 重置密码
        resetPassword(row) {
            // 弹框
            this.$confirm('此操作将重置该用户的密码为123456, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //获取管理员编号
                const adminId = JSON.parse(sessionStorage.getItem('user')).id;
                this.$ajax.post('/user/resetPassword', { adminId, userId: row.id }).then((res) => {
                    if (res.data.code !== 200) {
                        row.status = false;
                        if (res.data.data === 403) {
                            this.$message.error(res.data.msg);
                            this.$router.push({ path: '/login' });
                        }
                        return this.$message.error(res.data.msg);
                    }
                    this.$message.success(res.data.msg);
                });
            }).catch(() => {
                return this.$message.info("操作已取消");
            });
        },
        //自定义表单验证
        checkData(rule, value, callback) {
            if (value) {
                if (/[\u4E00-\u9FA5]/g.test(value)) {
                    callback(new Error('用户名不能存在中文！'));
                } else {
                    callback();
                }
            }
            callback();
        },
        sexFormat(row) {
            let sex = row.sex;
            if (sex === 1) {
                return '男';
            } else if (sex === 2) {
                return '女';
            } else {
                return '未知';
            }
        },
        //删除用户
        deleteById(row) {
            if (row.admin) return this.$message.warning('管理员角色不可操作');
            this.$confirm('将删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.delete(`/user/delete/${row.id}`).then((res) => {
                    if (res.data.code !== 200) return this.$message.error(res.data.msg);
                    this.$message.success(res.data.msg);
                    this.pageNumber = 1;
                    this.findPage();
                });
            }).catch(() => {
                return this.$message.info("操作已取消");
            });
        },
        // 子组件 取消按钮
        cancel() {
            this.open = false;
            this.findPage();
        }
    }
}
</script>

<style lang="less" scoped>
</style>