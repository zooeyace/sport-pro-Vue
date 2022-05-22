<template>
    <div>
        <el-card class="main-card">
            <el-row :gutter="25">
                <el-col :span="10">
                    <!-- 搜索添加 -->
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model="queryInfo.queryParam"
                        clearable
                        @clear="findPage"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="addShow">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table
                :data="tableList"
                border
                stripe
                v-loading="loading"
                element-loading-text="加载中..."
                element-loading-spinner="el-icon-loading"
            >
                <el-table-column type="index" label="序号" />
                <!-- 前端生成的序号 -->
                <el-table-column label="角色名称" prop="name" />
                <el-table-column label="角色标识" prop="remark" />
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改 -->
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="editDialog(scope.row)"
                        />
                        <!-- 删除 -->
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            size="mini"
                            @click="deleteById(scope.row.id)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="启用/禁用">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.status" @change="statusChange(scope.row)" />
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pageNumber"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="50%" @colse="dialogClosed">
            <el-form :model="dataForm" :rules="rulesDataForm" ref="dataForm" label-width="100px">
                <!-- 名称 -->
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="dataForm.name" />
                </el-form-item>
                <!-- 用户名 -->
                <el-form-item label="角色标识" prop="remark">
                    <el-input v-model="dataForm.remark" />
                </el-form-item>
                <el-form-item label="权限" prop="permissions">
                    <el-checkbox-group v-model="checkedPermissions">
                        <el-checkbox
                            v-for="(item, index) in permissionsList"
                            :label="item.name"
                            :key="index"
                            :disabled="!item.status"
                            @change="permissionChange(item)"
                        />
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="菜单" prop="menus">
                    <el-tree
                        ref="tree"
                        check-strictly
                        highlight-current
                        :data="menuList"
                        show-checkbox
                        node-key="id"
                        :props="{ label: 'title', children: 'children' }"
                        @check-change="treeNodeChange"
                    />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="clickCancel">取 消</el-button>
                <el-button type="primary" @click="clickOk">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Role',
    data() {
        return {
            queryInfo: {
                queryParam: '',
                pageNumber: 1,
                pageSize: 5
            },
            //表格数据
            tableList: [],
            menuList: [],
            checkedMenuList: [],
            //总记录数
            total: 0,
            //对话框状态
            open: false,
            //对话框标题
            title: '',
            loading: false,
            //表单
            dataForm: {},
            //表单校验
            rulesDataForm: {
                name: [
                    { required: true, message: "请输入角色名称", trigger: "blur" },
                    { min: 1, max: 20, message: "长度不合法", trigger: "blur" }
                ],
                remark: [
                    { required: true, message: "请输入角色标识，角色标识由字母+下划线组成", trigger: "blur" },
                    { min: 1, max: 20, message: "长度不合法", trigger: "blur" }
                ]
            },
            // 权限表单
            permissionsList: [],
            checkedPermissions: [],
            // 传向后端的权限对象
            permissionsToBeSubmitted: []
        }
    }, created() {
        this.findPage();
        this.findRelatedInfo();
    },
    methods: {
        async findPage() {
            this.loading = true
            this.$ajax.post('/role/page', this.queryInfo).then((res) => {
                this.loading = false
                if (res.data.code !== 200) return this.$message.error(res.data.msg);
                this.tableList = res.data.data.rows;
                this.total = res.data.data.total;
            });
        },
        //页数变化查询
        handleCurrentChange(newPageNumber) {
            this.queryInfo.pageNumber = newPageNumber;
            this.findPage();
        },
        //页码变化查询
        handleSizeChange(newPageSize) {
            this.queryInfo.pageSize = newPageSize;
            this.findPage();
        },
        //添加对话框
        addShow() {
            this.title = '添加角色';
            this.dataForm = {};
            this.open = true;
        },
        //打开编辑对话框
        editDialog(row) {
            this.checkedMenuList = [];
            this.checkedPermissions = [];
            row.menus.forEach(element => {
                this.checkedMenuList.push(element)
                if (element.children && element.children.length > 0) {
                    element.children.forEach(i => {
                        this.checkedMenuList.push(i);
                    });
                }
            });
            row.permissions.forEach(element => {
                this.checkedPermissions.push(element.name);
            });
            // 异步 this.$nextTick()  无效果，使用定时器替代
            setTimeout(() => {
                this.$refs.tree.setCheckedNodes(this.checkedMenuList)  // 设置目前勾选的节点，使用此方法必须设置 node-key 属性
            }, 20);
            this.title = '编辑角色';
            this.dataForm = row;
            this.open = true;
        },
        //对话框关闭
        dialogClosed() {
            //重置表单
            this.$refs.dataForm.resetFields();
            this.checkedPermissions = []
            this.$refs.tree.setCheckedKeys([])
            this.checkedMenuList = [];
        },
        //点击取消
        clickCancel() {
            this.checkedPermissions = []
            this.checkedMenuList = [];
            this.$refs.tree.setCheckedKeys([])
            this.dataForm = {};
            this.open = false;
        },
        //点击确定
        clickOk() {
            //表单校验
            this.$refs.dataForm.validate((valid) => {
                if (!valid) return this.$message.error('表单校验不通过，请认真填写后提交！');
                // 将菜单和权限赋给表单
                this.dataForm.menus = this.checkedMenuList;
                this.dataForm.permissions = this.permissionsToBeSubmitted;
                //判断是修改还是添加
                if (this.dataForm.id === null || this.dataForm.id === undefined) {
                    //添加
                    this.$ajax.post('/role/insert', this.dataForm).then((res) => {
                        if (res.data.code !== 200) {
                            return this.$message.error(res.data.msg);
                        }
                        this.open = false;
                        this.$message.success(res.data.msg);
                        this.findPage();
                    });
                } else {
                    //修改
                    this.$ajax.put('/role/update', this.dataForm).then((res) => {
                        if (res.data.code !== 200) {
                            return this.$message.error(res.data.msg);
                        }
                        this.open = false;
                        this.$message.success(res.data.msg);
                        this.findPage();
                    });
                }
            });
        },
        //删除角色
        deleteById(id) {
            this.$confirm('将删除该角色信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //delete请求遵循restful风格
                this.$ajax.delete(`/role/delete/${id}`).then((res) => {
                    if (res.data.code !== 200) return this.$message.error(res.data.msg);
                    this.$message.success(res.data.msg);
                    this.findPage();
                });
            }).catch(() => {
                // 成功删除为confirm 取消为 cancel
                return this.$message.info("操作已取消");
            });
        },
        statusChange(ele) {
            this.$ajax.put('/role/update', ele).then((res) => {
                this.$message.success('状态更新成功');
            });
        },
        findRelatedInfo() {
            this.$ajax.get('/menu/parentMenu').then((res) => {
                this.menuList = res.data.data;
            })

            this.$ajax.get('/permission/all').then((res) => {
                this.permissionsList = res.data.data;
            })
        },
        // 树形菜单获取选中值  
        //接收两个 boolean 类型的参数，1. 是否只是叶子节点，默认值为 false 2. 是否包含半选节点，默认值为 false
        treeNodeChange() {
            this.checkedMenuList = [];
            const checked = this.$refs.tree.getCheckedNodes(false, true)
            checked.forEach(e => {
                this.checkedMenuList.push(e);
            });
        },
        // 选中的permission加入集合
        permissionChange(item) {
            this.permissionsToBeSubmitted.push(item);
        }
    }
}
</script>

<style scoped>
</style>