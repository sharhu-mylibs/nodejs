/**
	授权过程：
		拦截器，检查是否登录，通过passport登录，登录后会在req上默认会有个user对象
		未登录----->跳转到登陆页面
		已登录----->放行

		登陆授权：
			strategy: 授权策略
			done: 授权回调函数

			或者指定回调重定向
			{ 
				successRedirect: '/',
	            failureRedirect: '/login',
	            failureFlash: 'error'
            }
		调用passport.authenticate(strategy, function done);
		passport.authenticate(strategy, options)调用后会执行相应注册的策略。
		注册的策略是使用passport.use(Strategy)进行注册的。
		如：passport.use(new LocalStrategy(options, callback))；


		如果使用的是授权回调函数，则需要自己进行login操作，即主动调用req.logIn。

		否则，每个根据每个授权策略的不同，在passport.use策略中的回调函数中，如果：
		第一个参数（发生错误，运行时错误）存在，那么自动授权失败，

		第二个参数（授权状态），如果是false，则授权失败，登陆失败。
		如果不为false则授权成功，登陆成功。


		第三个参数（flash信息），可忽略，表示flash信息，用于显示跳转的提示信息。
		================举例开始====================
		如下面使用的是本地授权策略：

		passport.use(new LocalStrategy({
			passReqToCallback: true
		}, function(req,username, password, done) {
			done(new Error('授权错误测试！')) //直接抛出错误
			done(null, false) //授权失败，跳转到/login页面
			done(null, !false) //授权成功，跳转到/
		}));
		passport.authenticate('local', { 
			successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: 'error'
        });
		================举例结束====================

		

		1、授权成功后会回调authenticate提供的successRedirect或者回调函数。
		

		2、由req.logIn发起，调用序列化回调函数，passport.serializeUser的回调callback，
		用来将授权信息序列化到req.session上。
		//user是授权策略函数的第二个参数。
		passport.serializeUser(function callback(user, done){
			done(new Error('序列化错误！'), info);//报运行时错误，授权不通过，序列化错误
			done(null, false);//序列化错误，授权不通过
			done(null, info);//序列化成功，进行下一步，req.logIn
		});
		这个回调函数callback需要执行他的回调done，表示序列化通过。
		如果不调用done函数，接口将在此卡住。

		3、如果在使用授权策略的时候提供的是手动函数调用，则进行手动授权登陆，执行
		req.logIn(user,callback)，即：
		=======================手动授权示例 开始======================
		passport.use(new LocalStrategy({
			passReqToCallback: true
		}, function(req,username, password, done) {
			done(new Error('授权错误测试！')) //直接抛出错误
			done(null, false) //授权失败，跳转到/login页面
			done(null, !false) //授权成功，跳转到/
		}));
		passport.authenticate('local', function(err, user) {
			if(err){
				//执行错误处理
				return next(err);
			}
			req.logIn(user, function(err) {
				if(err){
					//执行错误处理
					return next(err);
				}
				//登录成功！
			})
			
		})(req, res, next);
		=======================手动授权示例 结束======================


		
		4、调用反序列化回调函数，passport.deserializeUser。这步应该是校验序列化结果。
		passport.deserializeUser(function(user, done) {
			done(new Error('序列化错误！'), info);//报运行时错误，授权不通过，反序列化错误
			done(null, false);//反序列化错误，设置req.user失败，授权不通过
			done(null, info);//序列化成功，授权成功
		})

		5、授权成功后在req上存在一个属性，user，这个属性是最后passport.deserializeUser的done第二个参数。


	总结：
	授权信息(req.user)经历的过程：

	1、passport.use回调函数done(null, user)，user是最初的user，不能为false

	2、passport.authenticate回调函数，req.logIn(user,callback)，即：
	passport.authenticate('local', function(err, user) {
		if(err){
			//执行错误处理
			return next(err);
		}
		//req.logIn会调用passport.serializeUser
		//在此可以更改user信息。在此更改的user信息将同步到passport.serializeUser的user中
		req.logIn(user, function callback(err) {
			if(err){
				//执行错误处理
				return next(err);
			}
			//登录成功！
		})
		
	})(req, res, next);

	3、passport.serializeUser：
	passport.serializeUser(function(user, done) {
		//user来自req.logIn(user, callback)所注册的user。
		done(null, suser);//suer的值会影响到passport.deserializeUser
	});
	
	4、passport.deserializeUser：
	passport.deserializeUser(function(user, done) {
		//user来自passport.serializeUser中done函数的第二个参数。
		done(null, duser);//影响最终的req.user值
	});

	5.req.user//对这个req.user赋值不生效！

*/


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

//假数据
var testData = [{
	id: 1,
	name: '20248871',
	pass: '20248871'
},{
	id: 2,
	name: 'bb',
	pass: '123456'
}]

//使用本地策略，第一次登陆授权调用此函数
passport.use(new LocalStrategy({
	passReqToCallback: true
}, function(req,username, password, done) {
	//本地策略封装，username和password是来自客服端传输过来的用户名密码
	//字段必须是这样或者通过passport设置字段名。
	//合法：done(null, user);
	//不合法：done(null, false)
	//发生错误：done(err);
	done(null, {
		name: username,
		pass: password
	});
	// var isLogin = testData.some((item)=>{
	// 	return item.name == username && item.pass == password;
	// })
	// console.log(username, password, isLogin, 'use')
	// if(isLogin){
	// 	done(null, {
	// 		name: username,
	// 		pass: password
	// 	});
	// }else{
	// 	done(null, false, { message: 'Incorrect password.' });
	// }
}));

//序列化用户，第一次登陆授权会调用此函数
passport.serializeUser(function(user, done) {
  console.log(user, 'serializeUser')
  done(null, user);
});
//反序列化，对用户进行校验，每次校验都会经过这个函数。
//user来自passport.serializeUser中的done设定的user对象。
passport.deserializeUser(function(user, done) {
  console.log(user,'deserializeUser')
  var users = testData.filter((item)=>{
      return item.name == user.name && item.pass == user.pass;
    })
  	done(null, users && users[0]);
});

//需要session支持
app.use(session({ secret: 'passport' }));
//初始化
app.use(passport.initialize());
//基于express-session
app.use(passport.session());

//拦截器，中间件校验是否登录，未登陆跳转到登陆界面
app.use(function(req, res, next){

  if(req.user || req.path === '/login'){
    res.user = req.user
    next();
  }else{
    res.redirect('/login');
  }
})
//授权登陆
router.post('/login', function(req, res, next) {
	//本地授权，调用passport.use进行授权。授权成功会执行done函数，done函数就是这里的回调函数
	//授权策略是根据authenticate('local')来决定的。上面我们使用了passport.use(LocalStrategy)，即本地策略
	//user是来自passport.use回调done函数返回的结果。
	passport.authenticate('local', function done(err, user, info) {
		//检查是否授权成功
		if (err||!user) { 
			return res.redirect('/login');
		}
		//对用户进行校验
		// request.post(test_url,{
		// 	form: {
		// 		userName: 'admin',
		// 		password: 'admin2'
		// 	}
		// }, function(err2, response, body){
		// 	// console.log(err2, "response", body)
		// })
		//授权成功后进行登陆，
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			//将登陆成功的用户保存到session上面，默认passport会在req上设置一个user对象
			//此user对象是在passport.serializeUser时设置。
			req.session.user = user;
			// console.log(req.session.id, 'logIn');
			return res.redirect('http://172.28.10.30:3000/test.html');
		});
	})(req, res, next);
});