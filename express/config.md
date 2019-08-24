# 视图设置

### 1、设置`views`目录，使用绝对路径

```
app.set('views', path.join(__dirname, 'views'));

```

### 2、设置`默认`引擎

> 设置默认引擎可以省略渲染视图时的后缀名，以及不需要设置`app.engine`

```
app.set('view engine', 'pug');
```

下面是在`express/libs/application.js`中，创建view的过程，`defaultEngine`即来自`this.get('view engine')`，这里的`this.get`就是`app.set`设置的值

```javascript
if (!view) {
    var View = this.get('view');

    view = new View(name, {
      defaultEngine: this.get('view engine'),
      root: this.get('views'),
      engines: engines
    });

    if (!view.path) {
      var dirs = Array.isArray(view.root) && view.root.length > 1
        ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"'
        : 'directory "' + view.root + '"'
      var err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
      err.view = view;
      return done(err);
    }

    // prime the cache
    if (renderOptions.cache) {
      cache[name] = view;
    }
  }
```

再来看`view`的定义

```javascript
function View(name, options) {
  var opts = options || {};

  this.defaultEngine = opts.defaultEngine;
  this.ext = extname(name);
  this.name = name;
  this.root = opts.root;

  if (!this.ext && !this.defaultEngine) {
    throw new Error('No default engine was specified and no extension was provided.');
  }

  var fileName = name;
  // 扩展名，没有的话就使用默认引擎的扩展名，以`app.set('view engine', 'pug');`的值做后缀
  if (!this.ext) {
    // get extension from default engine name
    this.ext = this.defaultEngine[0] !== '.'
      ? '.' + this.defaultEngine
      : this.defaultEngine;

    fileName += this.ext;
  }
  // 如果扩展名存在，就直接读取指定的view引擎，并直接require，
  // 这也是为什么，我们只是设置view引擎app.set('view engine', 'pug');，
  // 但是并没有调用app.engine('pug', fn)，即在下面自动帮我们注册了。
  if (!opts.engines[this.ext]) {
    // load engine
    var mod = this.ext.substr(1)
    debug('require "%s"', mod)

    // default engine export
    var fn = require(mod).__express

    if (typeof fn !== 'function') {
      throw new Error('Module "' + mod + '" does not provide a view engine.')
    }

    opts.engines[this.ext] = fn
  }

  // store loaded engine
  this.engine = opts.engines[this.ext];

  // lookup path
  this.path = this.lookup(fileName);
}

```

### 添加view引擎`app.engine(ext, fn)`，`ext`可以省略`.`，为扩展名视图提供渲染引擎支持。

> 但是在使用`res.render('filename', params, fn)`时，需要提供扩展名。**否则，如上面的`view`创建的时候会使用`defaultEngine`作为后缀名。**

```
app.engine = function engine(ext, fn) {
  if (typeof fn !== 'function') {
    throw new Error('callback function required');
  }

  // get file extension
  var extension = ext[0] !== '.'
    ? '.' + ext
    : ext;

  // store engine
  this.engines[extension] = fn;

  return this;
};
```


### `app.set('view cache', true)`，设置视图缓存。默认是关闭的


### 添加多个view引擎

`npm install consolidate`

```javascript
var express = require('express')
  , cons = require('consolidate')
  , app = express();

// assign the swig engine to .html files.    npm i swig --save
app.engine('html', cons.swig);

app.engine('html', cons.ejs); //             npm i ejs --save

````
