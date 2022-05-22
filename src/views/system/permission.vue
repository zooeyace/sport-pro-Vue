<template>
    <div>
        <!-- 权限管理页 -->
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
                    <el-button type="primary" @click="addShow">添加权限</el-button>
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
                <el-table-column label="权限名称" prop="name" />
                <el-table-column label="权限标识" prop="permission" />
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
        <el-dialog
            :title="title"
            v-loading="loading"
            :visible.sync="open"
            width="50%"
            @colse="dialogClosed"
        >
            <el-form :model="dataForm" :rules="rulesDataForm" ref="dataForm" label-width="100px">
                <!-- 名称 -->
                <el-form-item label="权限名称" prop="name">
                    <el-input v-model="dataForm.name" />
                </el-form-item>
                <!-- 用户名 -->
                <el-form-item label="权限标识" prop="permission">
                    <el-input
                        v-model="dataForm.permission"
                        @keyup.native="dataForm.permission = dataForm.permission.replace(/[^a-zA-Z_]/g, '')"
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
    name: 'permission',
    data() {
        return {
            queryInfo: {
                queryParam: '',
                pageNumber: 1,
                pageSize: 10
            },
            //选项卡
            activeName: 'first',
            //表格数据
            tableList: [],
            //总记录数
            total: 0,
            //对话框状态
            open: false,
            //对话框标题
            title: '',
            //表单
            dataForm: {},
            //权限列表
            permissions: [],
            //选定权限
            selectPermission: [],
            //表单加载
            loading: false,
            //表单校验
            rulesDataForm: {
                name: [
                    { required: true, message: "请输入权限名称", trigger: "blur" },
                    { min: 1, max: 20, message: "长度不合法", trigger: "blur" }
                ],
                permission: [
                    { required: true, message: "请输入权限标识，权限标识由字母+下划线组成", trigger: "blur" },
                    { min: 1, max: 20, message: "长度不合法", trigger: "blur" }
                ]
            },
            // 加载动画
            loading: false

        }
    },
    created() {
        this.findPage();
    },
    methods: {
        async findPage() {
            this.loading = true
            this.$ajax.post('/permission/page', this.queryInfo).then((res) => {
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
            this.title = '添加权限';
            this.dataForm = {};
            this.open = true;
        },
        //打开编辑对话框
        editDialog(row) {
            this.title = '编辑权限';
            this.dataForm = row;
            this.open = true;
        },
        //对话框关闭
        dialogClosed() {
            //重置表单
            this.$refs.dataForm.resetFields();
        },
        //点击取消
        clickCancel() {
            this.dataForm = {};
            this.open = false;
        },
        //点击确定
        clickOk() {
            //表单校验
            this.$refs.dataForm.validate((valid) => {
                if (!valid) return this.$message.error('表单校验不通过，请认真填写后提交！');
                //this.loading = true;
                //判断是修改还是添加
                if (this.dataForm.id === null || this.dataForm.id === undefined) {
                    //添加
                    this.$ajax.post('/permission/insert', this.dataForm).then((res) => {
                        if (res.data.code !== 200) {
                            // setTimeout(() => {
                            //     this.loading = false;
                            // }, 6000);
                            return this.$message.error(res.data.msg);
                        }
                        this.open = false;
                        //this.loading = false;
                        this.$message.success(res.data.msg);
                        this.findPage();
                    });
                } else {
                    //修改
                    this.$ajax.put('/permission/update', this.dataForm).then((res) => {
                        if (res.data.code !== 200) {
                            // setTimeout(() => {
                            //     this.loading = false;
                            // }, 6000);
                            return this.$message.error(res.data.msg);
                        }
                        this.open = false;
                        //this.loading = false;
                        this.$message.success(res.data.msg);
                        this.findPage();
                    });
                }
            });
        },
        //删除权限
        deleteById(id) {
            this.$confirm('此操作将删除该权限信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //delete请求遵循restful风格
                this.$ajax.delete(`/permission/delete/${id}`).then((res) => {
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
            this.$ajax.put('/permission/update', ele).then((res) => {
                this.$message.success('状态更新成功');
            });
        }
    }
}
</script>

<style lang="less" scoped>
.permission-btn {
    margin-top: 5px;
    margin-left: 5px;
}

.el-select {
    width: 100%;
}
</style>