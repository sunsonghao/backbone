// https://github.com/Seasons123/ADReact/issues/32
// https://github.com/mqyqingfeng/Blog/issues/108

/* 模块化：解决某一复杂问题时，依照分类思维把问题系统性的分解以处理之。
  模块化系统必须的能力：1：定义封装的模块。2：定义新模块对其他模块的依赖。3：可以对其他模块的引入支持。

*/

/* 
  AMD,异步加载技术定义模块和依赖，按需加载文件。提供define和require 2个方法定义和加载模块
  define(ID, [deps, ...], function factory(deps, ...) {module code return {API:API}})
  通过函数和回调从网络异步加载的，回调把API暴露到对应的参数上

  require([deps, ...], function cb(deps, ...) { })
*/


/* 
  commonjs: 原理是 事先编译代码，创建一个比原来更大的代码包，其中包括所有应用运行所需的代码。缺点：不能按需加载。
  同步加载：require语句有阻塞，直到模块加载完成：不是通过网络加载而是从内存或者文件系统加载。
  不适合浏览器，浏览器不支持同步加载。以插入script标签的形式加载资源（ajax不行，跨域），唯一的方法browserify，把所有的模块打包成一个js文件。
*/

/* 
  CMD, 依赖就近。推崇一个文件一个模块。
  requireJS和SeaJS都支持对方的写法。
  define(function(require, exports, module){})
  加载模块：seajs.use([module.js], function(module){})
*/
/* 
  AMD,CMD最大的区别：对依赖模块 /执行/ 时机的处理方式不同，注意不是加载的时机或者方式不同。
  都是异步加载模块，只是名字叫的不一样。
  AMD:依赖前置，js很方便知道依赖谁，立即加载。
      加载完一个模块就执行，所有加载执行完进入require中的回调执行主逻辑。书写顺序与执行顺序不一致，谁先下载谁执行，主逻辑在所有加载完才执行。
  CMD：依赖就近，需要把模块变为字符串解析一遍才知道依赖了谁。
      加载不执行，就是简单的下载。所有依赖加载完进入主逻辑，遇到require才执行。执行和书写顺序一致。
*/



// 直接使用全局命名空间


/*
  UMD, 整合amd,commonjs规范的方法。
  原理: 用一个工厂函数统一不同的模块定义规范。原则：所有 /定义/ 模块的方法需单独传入依赖、需返回一个对象供其他模块使用。
  void 对给定的表达式求值，并返回undefined
*/
(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== void(0)) { // commonjs
    module.exports = factory(require('jquery'));
  } else if (typeof define === 'function' && define.amd) { // AMD
    define('moduleName', ['jQuery'], factory);
  } else {
    global.moduleName = factory(global.jQuery);
  }

})(this, function factory($) { // window或者global
  function api() {}
  
  return {api: api}
})

/* rollup可以把es2015编译成amd,commonjs, umd */


/* 
commonjs（类似seajs执行结果，require时加载模块，加载完执行）与es6（类似requirejs结果：加载所有-》执行）差异：
  1：CommonJS 模块是运行时加载，ES6 模块是编译时输出接口
    commonjs加载的是一个对象（module.exports), 该对象只有在脚本执行完才会产生。
    es6模块不是对象，对外接口只是一种静态定义，在代码静态解析阶段就会产生。
  2：CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用
    输出值拷贝一旦输出模块内部变化不会影响该值（对象除外：地址的拷贝），会缓存变量值。
    es6: JS 引擎对脚本静态分析的时候，遇到模块加载命令 import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块
*/


/* webpack */
// babel 与 webpack(browserify往全局注入require和module.exports，还把引用的模块进行打包，浏览器加载完就能用)
// es6经babel编译后变成类似commonjs规范代码，所以要在浏览器模拟module,exports,require。
// webpack会把模块包一层

// 直接执行查看结果：异步组件使用jsonp原理动态插入script标签，查看webpack编译后的源码
void function(modules){ // 加void把后面函数声明识别为一个表达式

  var installedModules = {}; // 缓存已经加载的模块
  function require(moduleName) {
    if (installedModules[moduleName]) {
      return installedModules[moduleName].exports;
    }

    var module = installedModules[moduleName] = {
      exports: {}
    }

    modules[moduleName](module, module.exports, require); // exports = module.exports

    return module.exports;
  }

  return require('main'); // 加载主模块
}({
  "main": function(module, exports, require) {

      var addModule = require("./add");
      console.log(addModule.add(1, 1))

      var squareModule = require("./square");
      console.log(squareModule.square(3));

  },
  "./add": function(module, exports, require) {
      console.log('加载了 add 模块');

      module.exports = {
          add: function(x, y) {
              return x + y;
          }
      };
  },
  "./square": function(module, exports, require) {
      console.log('加载了 square 模块');

      var multiply = require("./multiply");
      module.exports = {
          square: function(num) {
              return multiply.multiply(num, num);
          }
      };
  },

  "./multiply": function(module, exports, require) {
      console.log('加载了 multiply 模块');

      module.exports = {
          multiply: function(x, y) {
              return x * y;
          }
      };
  }
})