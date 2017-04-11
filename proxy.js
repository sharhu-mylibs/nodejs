/**

	基本依赖：
		var bodyParser = require('body-parser');
		var cookieParser = require('cookie-parser');

		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(cookieParser());

	暂不支持https
	文件上传需要依赖multer插件。
	multer示例：
	var multer = require('multer');
	//上传缓存路径
	const uploadPath = path.join(__dirname, '/tmp/upload/');
	//上传记录
	const uploadFileRecord = path.join(__dirname, '/tmp/upload/upload');

	var storage = multer.diskStorage({
	  //file对象的属性
	  // Key Description Note
	  // fieldname Field name 由表单指定  
	  // originalname  用户计算机上的文件的名称  
	  // encoding  文件编码  
	  // mimetype  文件的 Mime 类型 
	  // size  文件大小（字节单位）  
	  // destination 保存路径  DiskStorage
	  // filename  保存在destination中的文件名 DiskStorage
	  // path  已上传文件的完整路径  DiskStorage
	  // buffer  一个存放了整个文件的 Buffer MemoryStorage

	  destination: function (req, file, cb) {
	    cb(null, uploadPath)
	  },
	  filename: function (req, file, cb) {
	    var fileName = Date.now() +'-'+ file.originalname;
	    cb(null,  fileName)
	    fs.appendFile(uploadFileRecord, fileName+'\r\n');
	  }
	});

	var upload = multer({ 
	  storage: storage,
	  limits: {
	    //单位是字节（bytes）
	    // fieldNameSize: 100,// field 名字最大长度  default:100 bytes
	    fieldSize: 1024*1024*1024,// field 值的最大长度  default:1MB
	    // fields: '',//  非文件 field 的最大数量 default:无限
	    // fileSize: '',//  在multipart表单中, 文件最大长度 (字节单位)  default:无限
	    // files: '',// 在multipart表单中, 文件最大数量 default:无限
	    // parts: '',// 在multipart表单中, part传输的最大数量(fields + files)  default:无限
	    // headerPairs: '',// For multipart forms, the max number of header key=>value pairs to parse default:2000
	  },
	  //文件类型拦截器
	  fileFilter: function(req, file, cb) {

	  // 这个函数应该调用 `cb` 用boolean值来
	  // 指示是否应接受该文件

	  // 拒绝这个文件，使用`false`, 像这样:
	  // cb(null, false)

	  // 接受这个文件，使用`true`, 像这样:
	  cb(null, true)

	  // 如果有问题，你可以总是这样发送一个错误:
	  // cb(new Error('I don\'t have a clue!'))
	  }
	});

	//支持文件上传,.any()接受一切，建议使用这种方式，或者指定fieldname，
	//这里的代理不支持单文件.single(fieldname)模式
	//只支持多文件模式：.array(fieldname[, maxCount])、.fields(fields)、.any()
	app.use(upload.any());

	https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
	使用：
		var Proxy = require('proxy');
		var mProxy = new Proxy('http://172.28.10.30');
		app.use(mProxy.proxy);
	或者：
		app.use('/proxy', mProxy.proxy);


	request options：

	refer： https://www.npmjs.com/package/request#requestoptions-callback

	uri || url - fully qualified uri or a parsed url object from url.parse()
	baseUrl - fully qualified uri string used as the base url. Most useful with request.defaults, for example when you want to do many requests to the same domain. If baseUrl is https://example.com/api/, then requesting /end/point?test=true will fetch https://example.com/api/end/point?test=true. When baseUrl is given, uri must also be a string.
	method - http method (default: "GET")
	headers - http headers (default: {})
	qs - object containing querystring values to be appended to the uri
	qsParseOptions - object containing options to pass to the qs.parse method. Alternatively pass options to the querystring.parse method using this format {sep:';', eq:':', options:{}}
	qsStringifyOptions - object containing options to pass to the qs.stringify method. Alternatively pass options to the querystring.stringify method using this format {sep:';', eq:':', options:{}}. For example, to change the way arrays are converted to query strings using the qs module pass the arrayFormat option with one of indices|brackets|repeat
	useQuerystring - If true, use querystring to stringify and parse querystrings, otherwise use qs (default: false). Set this option to true if you need arrays to be serialized as foo=bar&foo=baz instead of the default foo[0]=bar&foo[1]=baz.
	body - entity body for PATCH, POST and PUT requests. Must be a Buffer, String or ReadStream. If json is true, then body must be a JSON-serializable object.
	form - when passed an object or a querystring, this sets body to a querystring representation of value, and adds Content-type: application/x-www-form-urlencoded header. When passed no options, a FormData instance is returned (and is piped to request). See "Forms" section above.
	formData - Data to pass for a multipart/form-data request. See Forms section above.
	multipart - array of objects which contain their own headers and body attributes. Sends a multipart/related request. See Forms section above.
	Alternatively you can pass in an object {chunked: false, data: []} where chunked is used to specify whether the request is sent in chunked transfer encoding In non-chunked requests, data items with body streams are not allowed.
	preambleCRLF - append a newline/CRLF before the boundary of your multipart/form-data request.
	postambleCRLF - append a newline/CRLF at the end of the boundary of your multipart/form-data request.
	json - sets body to JSON representation of value and adds Content-type: application/json header. Additionally, parses the response body as JSON.
	jsonReviver - a reviver function that will be passed to JSON.parse() when parsing a JSON response body.
	jsonReplacer - a replacer function that will be passed to JSON.stringify() when stringifying a JSON request body.
	auth - A hash containing values user || username, pass || password, and sendImmediately (optional). See documentation above.
	oauth - Options for OAuth HMAC-SHA1 signing. See documentation above.
	hawk - Options for Hawk signing. The credentials key must contain the necessary signing info, see hawk docs for details.
	aws - object containing AWS signing information. Should have the properties key, secret, and optionally session (note that this only works for services that require session as part of the canonical string). Also requires the property bucket, unless you’re specifying your bucket as part of the path, or the request doesn’t use a bucket (i.e. GET Services). If you want to use AWS sign version 4 use the parameter sign_version with value 4 otherwise the default is version 2. Note: you need to npm install aws4 first.
	httpSignature - Options for the HTTP Signature Scheme using Joyent's library. The keyId and key properties must be specified. See the docs for other options.
	followRedirect - follow HTTP 3xx responses as redirects (default: true). This property can also be implemented as function which gets response object as a single argument and should return true if redirects should continue or false otherwise.
	followAllRedirects - follow non-GET HTTP 3xx responses as redirects (default: false)
	followOriginalHttpMethod - by default we redirect to HTTP method GET. you can enable this property to redirect to the original HTTP method (default: false)
	maxRedirects - the maximum number of redirects to follow (default: 10)
	removeRefererHeader - removes the referer header when a redirect happens (default: false). Note: if true, referer header set in the initial request is preserved during redirect chain.
	encoding - Encoding to be used on setEncoding of response data. If null, the body is returned as a Buffer. Anything else (including the default value of undefined) will be passed as the encoding parameter to toString() (meaning this is effectively utf8 by default). (Note: if you expect binary data, you should set encoding: null.)
	gzip - If true, add an Accept-Encoding header to request compressed content encodings from the server (if not already present) and decode supported content encodings in the response. Note: Automatic decoding of the response content is performed on the body data returned through request (both through the request stream and passed to the callback function) but is not performed on the response stream (available from the response event) which is the unmodified http.IncomingMessage object which may contain compressed data. See example below.
	jar - If true, remember cookies for future use (or define your custom cookie jar; see examples section)
	agent - http(s).Agent instance to use
	agentClass - alternatively specify your agent's class name
	agentOptions - and pass its options. Note: for HTTPS see tls API doc for TLS/SSL options and the documentation above.
	forever - set to true to use the forever-agent Note: Defaults to http(s).Agent({keepAlive:true}) in node 0.12+
	pool - An object describing which agents to use for the request. If this option is omitted the request will use the global agent (as long as your options allow for it). Otherwise, request will search the pool for your custom agent. If no custom agent is found, a new agent will be created and added to the pool. Note: pool is used only when the agent option is not specified.
	A maxSockets property can also be provided on the pool object to set the max number of sockets for all agents created (ex: pool: {maxSockets: Infinity}).
	Note that if you are sending multiple requests in a loop and creating multiple new pool objects, maxSockets will not work as intended. To work around this, either use request.defaults with your pool options or create the pool object with the maxSockets property outside of the loop.
	timeout - Integer containing the number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request. Note that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout will overrule the timeout option (the default in Linux can be anywhere from 20-120 seconds).
	localAddress - Local interface to bind for network connections.
	proxy - An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for the url parameter (by embedding the auth info in the uri)
	strictSSL - If true, requires SSL certificates be valid. Note: to use your own certificate authority, you need to specify an agent that was created with that CA as an option.
	tunnel - controls the behavior of HTTP CONNECT tunneling as follows:
	undefined (default) - true if the destination is https, false otherwise
	true - always tunnel to the destination by making a CONNECT request to the proxy
	false - request the destination as a GET request.
	proxyHeaderWhiteList - A whitelist of headers to send to a tunneling proxy.
	proxyHeaderExclusiveList - A whitelist of headers to send exclusively to a tunneling proxy and not to destination.
	time - If true, the request-response cycle (including all redirects) is timed at millisecond resolution. When set, the following properties are added to the response object:

	elapsedTime Duration of the entire request/response in milliseconds (deprecated).
	responseStartTime Timestamp when the response began (in Unix Epoch milliseconds) (deprecated).
	timingStart Timestamp of the start of the request (in Unix Epoch milliseconds).
	timings Contains event timestamps in millisecond resolution relative to timingStart. If there were redirects, the properties reflect the timings of the final request in the redirect chain:
	socket Relative timestamp when the http module's socket event fires. This happens when the socket is assigned to the request.
	lookup Relative timestamp when the net module's lookup event fires. This happens when the DNS has been resolved.
	connect: Relative timestamp when the net module's connect event fires. This happens when the server acknowledges the TCP connection.
	response: Relative timestamp when the http module's response event fires. This happens when the first bytes are received from the server.
	end: Relative timestamp when the last bytes of the response are received.
	timingPhases Contains the durations of each request phase. If there were redirects, the properties reflect the timings of the final request in the redirect chain:
	wait: Duration of socket initialization (timings.socket)
	dns: Duration of DNS lookup (timings.lookup - timings.socket)
	tcp: Duration of TCP connection (timings.connect - timings.socket)
	firstByte: Duration of HTTP server response (timings.response - timings.connect)
	download: Duration of HTTP download (timings.end - timings.response)
	total: Duration entire HTTP round-trip (timings.end)
	har - A HAR 1.2 Request Object, will be processed from HAR format into options overwriting matching values (see the HAR 1.2 section for details)

	callback - alternatively pass the request's callback in the options object
*/
//启用cookie
var request = require('request').defaults({jar: true});

var fs = require('fs');
var proxyUrl = 'http://localhost';
var env = process.env.NODE_ENV;

const shouldLog = env === 'production' ? false : true;

function Proxy(url){
	proxyUrl = url;
}

Proxy.prototype.proxy = function proxy(req, res, next){
	if(shouldLog){
		console.log('=====proxy start===')
		console.log(req.query);
		console.log(req.headers);
		console.log(req.body);
		console.log(req.files)
		console.log('==========proxy end============')
	}
	//设置请求参数
	var param = {
		url: proxyUrl,
		method: req.method,
		//代理请求，跟随代理的redirect
		followAllRedirects: true,
		followRedirect: true,
		qs: req.query,
		//将客服端的cookie存下来
		headers: {
			'cookie': req.headers['cookie']
		},
		//先设置，看效果
		pool:{
			maxSockets: 100
		},
		useQuerystring: true
	}
	//对非get请求进行body设置
	if(!/get/i.test(req.method)){
		var obj = {};
		//是否包含文件上传，使用multer中间件进行文件处理。
		if(req.files && req.files.length){
			for(let i of req.files){
				obj[i.fieldname] = {
					//request需要这样设置文件的值
					value:  fs.createReadStream(i.path),
					//文件的其他选项
					options: {
						filename: i.originalname,
						contentType: i.mimetype,
						encoding: i.encoding,
						size: i.size
					}
				}
			}
			//multipart/form-data
			//如果是有文件的话，把body也放到formData中
			param.formData = Object.assign(obj, req.body);
		}else{
			// application/x-www-form-urlencoded
			//如果没有文件，将body设置为req.body，启用json进行编码。
			param.body = req.body;
			param.json = true;
		}
	}
	if(shouldLog){

		console.log(`========param start=====`)
		console.log(param);
		console.log(`========param end=====`)
	}
	//发送请求
	request(param, function(err, response,body){
		if(err){
			//发生错误统一处理
			if(shouldLog){
				console.error('proxy errr');
				console.error(err);
			}
			return next(err);
		}
		if(shouldLog){
			console.log(`========proxy headers start2=====`);
			console.log(response.headers);
			console.log(`========proxy headers end=====`);
			console.log(`========body start=====`);
			console.log(body);
			console.log(`========body end=====`);
		}
		res.send(body);
	});
}


module.exports = Proxy;