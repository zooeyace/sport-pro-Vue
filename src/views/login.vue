<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <!--头像-->
                <img src="../assets/logo.png" alt />
            </div>
            <!--添加表单-->
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login_form"
                label-width="0px"
            >
                <div v-if="switchFlag">
                    <div v-show="loginForm.type == '1'">
                        <el-form-item prop="username">
                            <el-input
                                v-model="loginForm.username"
                                class="login-madia"
                                prefix-icon="iconfont icon-user"
                            />
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input
                                v-model="loginForm.password"
                                class="login-madia"
                                prefix-icon="iconfont icon-zi"
                                type="password"
                            />
                        </el-form-item>
                    </div>

                    <div v-if="loginForm.type == '2'">
                        <el-form-item prop="phoneNumber">
                            <el-input
                                v-model="loginForm.phoneNumber"
                                class="login-madia"
                                prefix-icon="iconfont icon-user"
                                placeholder="请输入手机号.."
                            />
                        </el-form-item>
                        <el-form-item prop="smsCode">
                            <el-input
                                v-model="loginForm.smsCode"
                                class="login-madia"
                                prefix-icon="iconfont icon-zi"
                                type="password"
                            >
                                <el-button
                                    slot="append"
                                    @click="sendMsg"
                                    :disabled="codeDisabled"
                                >{{ codeText }}</el-button>
                            </el-input>
                        </el-form-item>
                    </div>

                    <el-form-item class="btns">
                        <el-button
                            type="primary"
                            :loading="loadFlag"
                            @click="login"
                        >{{ loadingText }}</el-button>
                        <el-button type="text" @click="resetPassword">忘记密码?</el-button>
                        <el-button type="text" @click="getSmsCode">获取验证码</el-button>
                    </el-form-item>
                </div>
                <div v-else="!switchFlag">
                    <el-form-item prop="email">
                        <el-input
                            v-model="loginForm.email"
                            class="login-madia"
                            prefix-icon="iconfont icon-user"
                            placeholder="请输入邮箱.."
                        />
                    </el-form-item>
                    <el-form-item class="btns">
                        <el-button type="primary" :loading="loadFlag" @click="sendEmail">点击发送</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
//初始化菜单
import store from '@/store';

export default {
    name: 'Login',
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
                // 默认账号密码登录
                type: '1',
                smsCode: '',
                phoneNumber: ''
            },
            loginRules: {
                username: [
                    { message: "请输入用户名", trigger: "blur" },
                    { min: 5, max: 8, message: "长度在 5 到 8 个字符", trigger: "blur" }
                ],
                password: [
                    { message: "请输入密码", trigger: "blur" },
                    { min: 6, max: 15, message: "密码为 6~15 位", trigger: "blur" }
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: 'email', message: '请输入正确的格式', trigger: ['blur', 'change'] }
                ],
                phoneNumber: [
                    { required: true, message: "请输入手机号", trigger: "blur" },
                    { message: '请输入正确的手机号', trigger: 'blur', pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/ }
                ],
                smsCode: [
                    { required: true, message: "请输入验证码", trigger: "blur" },
                ],
            },
            loadingText: '登录',
            codeText: '发送',
            loadFlag: false,
            switchFlag: true,
            codeDisabled: false
        }
    },
    methods: {
        login() {
            //表单验证
            this.$refs.loginFormRef.validate((valid) => {
                if (!valid) {
                    return this.$message.error('数据校验未通过，请仔细填写信息！');
                }
                this.loadFlag = true
                this.loadingText = '登录中..'
                //发送ajax请求，向后台访问数据  ?username=' + this.loginForm.username + '&password=' + this.loginForm.password
                this.$ajax.post('/user/login', this.loginForm).then((res) => {
                    const token = res.data.data.tokenHead + res.data.data.token; // 拼接token
                    this.$store.commit('setToken', token)
                    //页面跳转
                    this.$router.push({ path: '/' });
                }).catch((err) => {
                    this.loadFlag = false;
                    this.loadingText = '登录';
                    if (err.msg === 'Network Error') {
                        this.$message.warning('网络错误，请稍后尝试！');
                    }
                });
            });
        },
        resetPassword() {
            this.switchFlag = false
        },
        sendEmail() {
            this.$refs.loginFormRef.validate((valid) => {
                if (!valid) {
                    return this.$message.error('数据校验未通过，请仔细填写信息！');
                }
                this.$ajax.post('/tool/retrieve/password', { receivers: [this.loginForm.email] }).then((res) => {
                    if (res.data.code === 200) {
                        this.$message.success(res.data.msg);
                        this.switchFlag = true
                    }
                })
            })
        },
        // 获取验证码按钮变化
        getSmsCode() {
            if (this.loginForm.type === '1') {
                this.loginForm.type = '2'
            } else {
                this.loginForm.type = '1'
            }
            this.$refs.loginFormRef.clearValidate();
        },
        // 获取验证码接口
        sendMsg() {
            const regexp = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
            if (!this.loginForm.phoneNumber) return this.$message.error("请输入手机号");
            if (!regexp.test(this.loginForm.phoneNumber)) return this.$message.error("请输入正确的手机号");
            this.$ajax.post(`/tool/sms?phoneNumber=${this.loginForm.phoneNumber}`).then((res) => {
                if (res.data.code === 200) {
                    // setInterval每隔多少秒执行一次，setTimeOut只执行一次
                    let time = 60;
                    const x = setInterval(() => {
                        this.codeDisabled = true
                        time--;
                        if (time) {
                            this.codeText = '(' + time + '秒)后重新发送';
                        } else {
                            clearInterval(x);
                            this.codeText = '重新发送';
                            this.codeDisabled = false;
                        }
                    }, 1000)
                }
            })
        }
    }
}
</script>

<!-- 加上 "scoped" 该样式只在当前组件有效 -->
<style lang="less" scoped>
// 跟节点样式
.login_container {
    height: 100%;
}
// 登录框
.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px; // 圆角
    position: absolute; // 绝对定位
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%); // 根据自己位置 以自己为长度位移
    // 头像框
    .avatar_box {
        width: 130px;
        height: 130px;
        box-shadow: 0 0 2px #ddd; // 盒子阴影
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            width: 100%;
            height: 100%;
            background-color: white;
        }
    }
    .btns {
        display: flex; // 弹性布局
        justify-content: flex-end; // 尾部对齐
    }
    .login_form {
        position: absolute;
        bottom: 0%;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box; // 设置边框
    }
}
@media screen and (max-width: 500px) {
    .login_box {
        width: 100%;
    }
    .login_form {
        width: 80% !important;
        margin-left: 12% !important;
    }
    .avatar_box {
        width: 90px !important;
        height: 90px !important;
        margin-top: 50px !important;
    }
}
</style>
