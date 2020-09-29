// https://github.com/Seasons123/ADReact/issues/32
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