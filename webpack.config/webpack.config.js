const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");


// Create multiple instances
const extractCSS = new ExtractTextPlugin('stylesheets/[name]-one.css');
const extractLESS = new ExtractTextPlugin('stylesheets/[name]-two.css');

var I18nPlugin = require("i18n-webpack-plugin");
var languages = {
	"en": null,
	"de": require("./de.json")
};

//字符替换
//new webpack.NormalModuleReplacementPlugin(resourceRegExp, newResource);

module.exports = {

	target: 'web',//指定环境

	entry: {
		'app': 'index.js',
		'main': 'main.js'
	},

	output: {
		'path': path.resolve('dist'),//绝对路径
		'publicPath': 'http://www.baidu.com/',//以/结束
		//模板可用值：
		// name：模块名
		// hash：模块id的hash值
		// chunkhash：模块内容hash值
		// id：模块id
		// contenthash: 内容hash值
		// file：模块文件名，带全路径
		// filebase：模块文件名
		// query: 模块查询参数，即?号后面的字符
		'filename': '[name].[contentHash:7].js',
		'chunkFilename': '[id].js',//运行时名称
		'hashDigest': 'hex',//hash算法
		'hashDigestLength': 20,//hash长度
		// 'hashSalt': ,//
		'library': 'libraryName'//库名，类似import * as libraryName from 'library'
		'libraryTarget': 'var',//指定目标使用形式：amd, commonjs, commonjs2, commonjs-module, this, var

	},
	resolve:{
		'alias': {
			//import util from 'utils'
			'utils': path.resolve('../utils'),
			'testLib': path.resolve('../test')
		},
		'cachePredicate': function(file) { 
			//file有path和request属性，指示是否缓存
			return true 
		},
		'modules': ['node_modules'],//指定require或者import的目录
		'extensions': ['.js', '.jsx', '.vue', '.json'],
		'unsafeCache': true,//指定缓存，默认所有
	},
	resolveLoader: {//只解决loader模块
		'moduleExtensions': ['-loader'],//后缀
		'modules': ["node_modules"],//模块加载目录
	    'extensions': [".js", ".json"],//模块扩展名
	    'mainFields': ["loader", "main"],//模块加载package.json的字段
	    'alias': {
	    	'txt': 'raw-loader'//txt作为raw-loader的别名
	    }
	},
	externals: {
		//指定import $ from jquery//这个jquery不从node_modules中引用，而是来自外链script标签
		jquery: 'jQuery',
	},
	module:{
		'noParse': /RegExp()/,//不解析匹配内容
		'rules':[{
			'test': /\.js$/,//匹配
			// 'loaders':['babel-loader'],//同use
			// 'use':['babel-loader'],//同{loader: 'babel-loader'}
			'use': [{
				'loader': 'babel-loader',
				//post, inline, normal, pre
				//post:加载后做处理
				//pre: 加载前
				//normal：正常加载
				//inline: 预置到require/import时
				'enforce': 'pre',//默认normal。
				'include': [],//包含路径
				'exclude': [],//去除路径
				'options':{
					'preset':[['react']]
				}
			},{
				//配合ExtractTextPlugin使用
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader"
				})
			},
			{
				test: /\.less$/i,
				use: extractLESS.extract([ 'css-loader', 'less-loader' ])
			}]
		}]
	},
	//生产模式：
	// source-map：完整map
	// hidden-source-map：浏览器隐藏，不添加map链接到浏览器，用于线上调试代码
	// cheap-source-map：简单的，没有列映射，忽略加载源文件
	// cheap-module-source-map：简单，简单映射每行源文件
	// nosources-source-map：不包含源文件映射
	devtool: 'eval-source-map',//dev模式eval-source-map，可以查看详细

	devServer: {
		contentBase: path.join(__dirname, "dist"),//静态文件目录，可指定数组
		hot: true,//开启热更新
		compress: true,//开启gzip
		//为所有请求添加头部
		headers: {
		  "X-Custom-Foo": "bar"
		},
		port: 8080,
		overlay: true,//全屏显示错误
		//配置警告
		overlay: {
			warnings: true,
			errors: true
		},
		//未匹配url全部返回index.html
		historyApiFallback: true,
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				pathRewrite: {"^/api" : ""}
			}
		},
		setup(app){
			//app是express实例
			app.get('/some/path', function(req, res) {
				res.json({ custom: 'response' });
			});
		}
	},
	plugins: [
		//针对html处理插件
		new HtmlWebpackPlugin({
			//可以使用<%%>进行模板插值，跟underscore模板一样使用
			//变量名：htmlWebpackPlugin
			title: 'index',//html title
			//https://github.com/kangax/html-minifier#options-quick-reference
			minify:{
				minifyURLs:true,
				minifyCss: true,
				minifyJs: true

			},//压缩
			inject: 'body',//注入位置：true|body、head、false
			favicon: '../src/favicon.ico',//指定ico路径
			hash:true,//将所有的外链都加上hash
			showErrors: true,//错误信息是否写入html文件
			chunks:[],//指定chunk被插入，chunk是入口定义的chunk名
			excludeChunks:[],//不包含的chunk
			//chunk的排序，插入顺序：'none' | 'auto' | 'dependency' | {function} - default: 'auto'
			chunksSortMode:'auto',
			template: '../src/index.html',
			filename: '../dist/index.html'//同output配置可选模板参数
		}),
		//压缩js插件
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				drop_console: false,
			}
		}),
		//公共模块抽取插件
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common',//公共chunk名
			async: true,//异步加载
			filename: 'common.js',//chunk的名字，抽取公共模块
			children: true,//抽取公共模块
			//最小包含的chunk数，如果是数字，应该大于等于2
			minChunks: 5,//number|Infinity|function(module, count) -> boolean,
			chunks:['app']//选择指定chunk
		}),
		//定义变量插件
		new webpack.DefinePlugin({
			//由于是直接字符替换，需要加引号，也可以使用//JSON.stringify('production')的方式
			NODE_ENV: '"production"',
		}),
		//定义全局变量，自动加载
		new webpack.ProvidePlugin({
            Mock: "mockjs",
            $: 'jquery',
            jQuery: 'jquery'
        }),
		//压缩assets插件
		new CompressionPlugin({
			//指定匹配的assets名。
			test:/.*/,
			//单个asset的名称，file、path、query可用
			asset: "[path].gz[query]",
			algorithm:'gzip',//算法，来自zlib或者zopfli ，默认gzip
			filename:false,//压缩后的名字，可使用(asset)=>{return newAssetName}
			threshold:0,//阈值，当asset的大小超过这个值才压缩
			minRatio:0.8,//最小压缩率
			deleteOriginalAssets:false//是否删除源文件
		}),
		new ExtractTextPlugin({
			// id: ,//唯一id，默认自动生成
			//name、id、contenthash可用于模板
			filename: '[id].[name].[contenthash:5].css',
			allChunks: true,//所有chunks
			disable:false,//禁用插件
			ignoreOrder: false//忽略顺序
		}),
		//配合多个extract使用
		extractLESS,

		new I18nPlugin(
		    languages['en'], //语言配置
		    {
			functionName: '__',//替换名，对__(...)进行替换
		}),
		//替换，resourceRegExp：正则匹配或者字符，newResource字符或者函数
		new webpack.NormalModuleReplacementPlugin(/^test\/a\.js/, function(resource){
			var appTarget = 'sadas';
			resource.request = resource.request.replace(/-a/, `-${appTarget}`);
		}),
		//开发热更新，匹配devServer
		new webpack.HotModuleReplacementPlugin()
	]


}