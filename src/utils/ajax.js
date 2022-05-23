import Vue from "vue";
import axios from "axios";
import { Message } from "element-ui"; // 在js得这么引用
import router from "../router";

const ajax = axios.create({
    baseURL: '/',
    timeout: 1000000
})

// 请求拦截器
ajax.interceptors.request.use((config) => {
    //console.log("请求参数", config);
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = token;
    }

    return config;
}, (err) => {
    console.log("请求异常", err);
})

// 响应拦截器
ajax.interceptors.response.use((res) => {
    if (res.data.code !== 200) Message.error(res.data.msg)
    return res;
}, (err) => {
    console.log("异常:", err.response);
    if (err.response.status === 400) {
        Message.error(err.response.data.msg)
    } else if (err.response.status === 401) {
        Message.error("账号信息已过期，请重新登录...")
        sessionStorage.clear()
        router.replace('/login')
    } else if (err.response.status === 403) {
        Message.error(err.response.data.msg)
    } else if (err.response.status === 404) {
        Message.error("接口不存在...")
    } else if (err.response.status === 405) {
        Message.warning("接口请求方式有误, 后端需要" + err.response.headers.allow + "请求方式")
    } else if (err.response.status === 500) {
        Message.error("服务器发生故障..." + err.response.data.msg === undefined ? '' : err.response.data.msg)
    } else Message.error("未知错误...")
})

Vue.prototype.$ajax = ajax;

export default ajax 