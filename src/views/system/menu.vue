<template>
    <div>
        <!-- 菜单管理 -->
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
                        <el-button slot="append" icon="el-icon-search" @click="findPage" />
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="addShow">添加菜单</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table
                :data="tableList"
                border
                stripe
                row-key="id"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                v-loading="loading"
                element-loading-text="加载中..."
                element-loading-spinner="el-icon-loading"
            >
                <el-table-column label="菜单标题" prop="title" />
                <!-- <el-table-column label="后端路径" prop="url" /> -->
                <el-table-column label="前端路径" prop="path" />
                <el-table-column label="组件名称" prop="component" />
                <el-table-column label="菜单图标" prop="icon" />
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改 -->
                        <el-button
                            type="warning"
                            v-show="scope.row.children != null"
                            icon="el-icon-circle-plus-outline"
                            size="mini"
                            @click="addDialog(scope.row)"
                        />
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="editDialog(scope.row)"
                        />
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
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            />
        </el-card>

        <!-- 对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="50%" @colse="dialogClosed">
            <el-form :model="dataForm" :rules="rulesDataForm" ref="dataForm" label-width="100px">
                <el-form-item label="是否为子菜单" v-if="!menuFlag && !disableFlag">
                    <el-checkbox v-model="menuFlag"></el-checkbox>
                </el-form-item>
                <el-form-item label="父级菜单" prop="parentId" v-if="menuFlag">
                    <el-select v-model="dataForm.parentId" placeholder="请选择">
                        <el-option
                            v-for="(item, index) in parentMenu"
                            :key="index"
                            :label="item.title"
                            :value="item.id"
                            :disabled="!item.status"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="菜单标题" prop="title">
                    <el-input v-model="dataForm.title" />
                </el-form-item>
                <!-- <el-form-item label="后端路径" prop="url">
                    <el-input
                        v-model="dataForm.url"
                        @keyup.native="dataForm.url = dataForm.url.replace(/[^a-zA-Z/*]/g, '')"
                    />
                </el-form-item>-->
                <el-form-item label="前端路径" prop="path">
                    <el-input
                        v-model="dataForm.path"
                        
                    />
                </el-form-item>
                <el-form-item label="组件名称" prop="component">
                    <el-input
                        v-model="dataForm.component"
                        
                    />
                </el-form-item>
                <el-form-item label="菜单图标" prop="icon">
                    <el-select
                        v-model="dataForm.icon"
                        clearable
                        filterable
                        :popper-append-to-body="false"
                        placeholder="请选择菜单图标"
                    >
                        <el-option
                            v-for="(item, index) in icons"
                            :key="index"
                            :value="item.value"
                            style="font-size: 18px"
                            :class="item.value"
                        >
                            <span class="option-lable">{{ item.value }}</span>
                        </el-option>
                    </el-select>
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
//图标列表
import iconList from '../../utils/iconList.json';
export default {
    name: 'Menu',
    data() {
        return {
            queryInfo: {
                queryParam: '',
                pageNumber: 1,
                pageSize: 5
            },
            //表格数据
            tableList: [],
            //总记录数
            total: 0,
            //图标
            icons: iconList,
            //对话框状态
            open: false,
            //对话框标题
            title: '',
            //父标题
            parentName: '',
            //表单
            dataForm: {},
            // 父级菜单
            parentMenu: [],
            // 是否子菜单
            menuFlag: false,
            disableFlag: false,
            //表单校验
            rulesDataForm: {
                parentId: [
                    {
                        required: true,
                        trigger: "change",
                        validator: (rule, value, callback) => {
                            if (this.dataForm.parentId === null || this.dataForm.parentId === undefined) {
                                callback(new Error('请选择父级菜单'))
                            } else {
                                callback()
                            }
                        }
                    },
                ],
                path: [
                    { required: true, message: "请输入菜单路径", trigger: "blur" },
                    { min: 1, max: 20, message: "请输入合法的长度", trigger: "blur" },
                ],
                title: [
                    { required: true, message: "请输入菜单标题", trigger: "blur" },
                    { min: 3, max: 20, message: "请输入合法的长度", trigger: "change" },
                ],
                component: [
                    { required: false, message: "请输入菜单组件路径", trigger: "blur" },
                    { min: 0, max: 20, message: "请输入合法的长度", trigger: "change" },
                ],
                icon: [
                    { required: true, message: "请选择图标", trigger: "blur" }
                ],
            },
            loading: false

        }
    },
    created() {
        this.findPage();
        this.findParent()
        this.icons = iconList.icon;
    },
    methods: {
        async findPage() {
            this.loading = true
            this.$ajax.post('/menu/page', this.queryInfo).then((res) => {
                this.loading = false
                if (res.data.code !== 200) return this.$message.error(res.data.msg);
                this.tableList = res.data.data.rows;
                this.total = res.data.data.total;
            });
        },
        findParent() {
            this.$ajax.get('/menu/parentMenu').then((res) => {
                this.parentMenu = res.data.data;
            })
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
            this.title = '添加菜单';
            this.disableFlag = false;
            this.dataForm = {};
            this.open = true;
        },
        //添加子菜单
        addDialog(row) {
            this.title = '添加子菜单';
            if (row && row.path !== '/home') return this.$message.warning('系统目前只支持二级菜单！');
            this.dataForm.parentId = row.id;
            this.parentName = row.title;
            this.open = true;
        },
        //修改
        editDialog(row) {
            this.title = '修改菜单';
            this.disableFlag = true;
            this.dataForm = row;
            this.open = true;
        },
        //删除
        deleteById(row) {
            if (row.children && row.children.length > 0) return this.$message.warning('请删除其下的子菜单后删除！');
            this.$confirm('此操作将永久删除该菜单信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //delete请求遵循restful风格
                this.$ajax.delete(`/menu/delete/${row.id}`).then((res) => {
                    if (res.data.code !== 200) return this.$message.error(res.data.msg);
                    this.$message.success(res.data.msg);
                    this.findPage();
                });
            }).catch(() => {
                // 成功删除为confirm 取消为 cancel
                return this.$message.info("操作已取消");
            });
        },
        dialogClosed() {
            this.menuFlag = false;
            //this.$refs.dataForm.resetFields();
        },
        //取消
        clickCancel() {
            this.menuFlag = false;
            //this.$refs.dataForm.resetFields();
            this.open = false;
        },
        //确定
        clickOk() {
            this.$refs.dataForm.validate((valid) => {
                if (!valid) return this.$message.error('表单校验失败，请仔细填写后提交！');
                //判断是添加还是修改
                if (this.dataForm.id === null || this.dataForm.id === undefined) {
                    this.$ajax.post('/menu/insert', this.dataForm).then((res) => {
                        if (res.data.code !== 200) return this.$message.error(res.data.msg);
                        this.$message.success(res.data.msg);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.put('/menu/update', this.dataForm).then((res) => {
                        if (res.data.code !== 200) return this.$message.error(res.data.msg);
                        this.$message.success(res.data.msg);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
    }
}
</script>

<style lang="less" scoped>
.option-lable {
    margin-left: 5px;
}

.el-select {
    width: 100%;
}
</style>