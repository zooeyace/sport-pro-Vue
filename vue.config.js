let proxyObj = {};

proxyObj['/'] = {
    //websocket
    ws: false,
    //目标地址 后端地址
    target: 'http://localhost:9000',
    //发送请求头host会被设置target
    changeOrigin: true,
    //不重写请求地址
    pathRewrite: {
        '^/': '/'
    }
}

module.exports = {
    //代理配置
    devServer: {
        host: 'localhost',
        port: 8080,
        proxy: proxyObj
    },
    //打包配置
    publicPath: "./", // 公共路径(必须有的)
    outputDir: "dist", // 输出文件目录
    assetsDir: "static", //静态资源文件名称
    lintOnSave: false,
    productionSourceMap: false, //去除打包后js的map文件
    //去掉console
    configureWebpack: (config) => {
        // 判断为生产模式下，因为开发模式我们是想保存console的
        if (process.env.NODE_ENV === "production") {
            config.optimization.minimizer.map((arg) => {
                const option = arg.options.terserOptions.compress;
                option.drop_console = true; // 打开开关
                return arg;
            });
        }
    },
    configureWebpack: {
        // 关闭 webpack 的性能提示
        // performance: {
        //   hints:false
        // }

        // //或者

        // 警告 webpack 的性能提示
        performance: {
            hints: 'warning',
            // 入口起点的最大体积
            maxEntrypointSize: 50000000,
            // 生成文件的最大体积
            maxAssetSize: 30000000,
            // 只给出 js 文件的性能提示
            assetFilter: function (assetFilename) {
                return assetFilename.endsWith('.js');
            }
        }
    },
};