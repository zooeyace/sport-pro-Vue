<template>
    <div>
        <el-card>
            <div slot="header" class="clearfix">
                <span>{{ title }}</span>
                <el-button style="float: right;" size="small" @click="$emit('cancel')">返回</el-button>
            </div>
            <div>
                <el-form
                    :model="dataForm"
                    :rules="rulesDataForm"
                    ref="dataForm"
                    label-width="80px"
                >
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="用户名" prop="username">
                                <el-input v-model="dataForm.username" placeholder="请输入内容" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="手机号" prop="phoneNumber">
                                <el-input v-model="dataForm.phoneNumber" placeholder="请输入内容" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="11" v-if="this.dataForm.id == null">
                            <el-form-item label="密码" prop="password">
                                <el-input
                                    v-model="dataForm.password"
                                    type="password"
                                    placeholder="请输入内容"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="邮箱" prop="email">
                                <el-input
                                    v-model="dataForm.email"
                                    type="email"
                                    placeholder="请输入内容"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="角色" prop="roles">
                                <el-select v-model="submitRolesId" placeholder="请选择角色" multiple>
                                    <el-option
                                        v-for="(item, index) in roleList"
                                        :key="index"
                                        :label="item.remark"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="性别" prop="sex">
                                <el-select v-model="dataForm.sex" placeholder="请选择性别">
                                    <el-option :value="0" label="女" />
                                    <el-option :value="1" label="男" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="地址" prop="address">
                                <el-input
                                    v-model="dataForm.address"
                                    type="textarea"
                                    maxlength="100"
                                    :autosize="{ minRows: 3, maxRows: 5 }"
                                    placeholder="请输入内容"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="头像" prop="avatarUrl">
                                <el-upload
                                    class="avatar-uploader"
                                    :action="action"
                                    :headers="headers"
                                    :show-file-list="false"
                                    :on-success="handleAvatarSuccess"
                                    :before-upload="beforeAvatarUpload"
                                >
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                                </el-upload>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="$emit('cancel')">取 消</el-button>
                    <el-button type="primary" @click="clickOk">确 定</el-button>
                </span>
            </div>
        </el-card>
    </div>
</template>

<script>
// 父组件向子组件传值用属性监听watch，子组件往回用$emit(xxx);  xxx就是传递的东西
export default {
    // 监听前，先接收父组件传值
    props: ['title', 'dataForm'],
    // 属性监听
    watch: {
        'title': {
            handler(val, old) {
            }
        },
        'dataForm': {
            handler(val, old) {
                this.imageUrl = val.avatarUrl.startsWith('https') ? val.avatarUrl : this.$qiniu + val.avatarUrl

                // 角色回显
                this.submitRolesId = []
                if (val.roles && val.roles.length > 0) {
                    val.roles.forEach(item => {
                        this.submitRolesId.push(item.id)
                    })
                }
            }
        }
    },
    data() {
        return {
            imageUrl: null,
            action: '/tool/upload',
            headers: {
                Authorization: sessionStorage.getItem('token')
            },
            roleList: [],
            submitRolesId: [],
            rulesDataForm: {
                username: [
                    { required: true, message: "请输入用户名称", trigger: "blur" },
                    { min: 5, max: 20, message: "长度不合法", trigger: "blur" }
                ],
                password: [
                    { required: true, message: "请输入密码，由字母、数字组成", trigger: "blur" },
                    { min: 6, max: 20, message: "长度不合法", trigger: "blur" }
                ],
                phoneNumber: [
                    { required: true, message: "请输入手机号", trigger: "blur" },
                    { message: '请输入正确的手机号', trigger: 'blur', pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/ }
                ],
                sex: [
                    { required: true, message: "请选择性别", trigger: "blur" },
                ],
                avatarUrl: [
                    {
                        required: true,
                        validator: (rule, value, callback) => {
                            if (this.dataForm.avatarUrl === null || this.dataForm.avatarUrl === '' || this.dataForm.avatarUrl === undefined) {
                                callback(new Error('请上传头像'))
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    },
                ],

            },
        }
    },
    created() {
        this.$ajax.get('/role/all').then((res) => {
            this.roleList = res.data.data;
        })
    },
    methods: {
        clickOk() {
            this.$refs.dataForm.validate((valid) => {
                if (!valid) return this.$message.error('表单校验不通过，请认真填写后提交！');
                let arr = []
                this.submitRolesId.forEach(item => {
                    arr.push({ id: item })
                });
                this.dataForm.roles = arr;
                //判断是修改还是添加
                if (this.dataForm.id === null || this.dataForm.id === undefined) {
                    //添加
                    this.$ajax.post('/user/insert', this.dataForm).then((res) => {
                        this.$message.success(res.data.msg);
                        return this.$emit('cancel');
                    });
                } else {
                    //修改
                    this.$ajax.put('/user/update', this.dataForm).then((res) => {
                        this.$message.success(res.data.msg);
                        return this.$emit('cancel');
                    });
                }
            })
        },
        // 文件上传完成之后的响应
        handleAvatarSuccess(res, file) {
            this.imageUrl = this.$qiniu + res.data
            this.dataForm.avatarUrl = res.data
        },
        // 上传之前
        beforeAvatarUpload(file) {
            let idx = file.name.lastIndexOf('.');
            let suffix = file.name.substring(idx + 1);
            if (suffix !== 'jpg' && suffix !== 'png' && suffix !== 'jpeg') {
                this.$message.warning('仅支持jpg, png, jpeg 格式文件');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                // 不可超过10MB
                this.$message.warning('图片大小不可超过10MB');
                return false;
            }
        }
    }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
}
.avatar {
    width: 150px;
    height: 150px;
    display: block;
}
</style>
