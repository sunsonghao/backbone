// 插件，集成基于流/promise的工具：流和buffer的区别见index.js首。
// 插件标准：
//  1：不转换文件（路径或者内容），可以用别的东西替代；2：不止做了一件事，应该用多个插件替代。3：工具基于流或者返回promise, 直接用该工具就行不需要插件。

// 1. 流、缓冲和vinyl文件队形：
//  流式构建系统的核心理念: 通过流把把虚拟文件对象（vinyl）传递给一个个操作。
// nodejs中流就是持续的流动的数据，从某个地方输入，最后输出到某个地方。数据块可以被一块一块读取，大小取决于流。
// gulpjs流是基于对象的，每一块代表一个对象（虚拟文件对象）：base:文件名，path, content: buffer（计算机的一块内存，文件加载后可任意读取修改内容）或者nodejs流（一块数据处理好开始处理下一块数据，就不能再重新读取上一块数据了：局限）。
// uglify在处理文件的过程中，维护一个包含压缩过的变量和函数名的表格，需要同时访问文件中好几处内容。
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint'); // 需要安装jshint
const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del'); // 接口兼容gulp, 不是gulp的插件，最后返回promise
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');

// 2. 添加基于流的工具：集成browserify（vue2）：它把node.js 处理模块的方法加以修改 ，变成了浏览器也能用的方法。
// 不仅往全局空间添加require和module.exports还把引用模块打成包，浏览器加载好就能用。
// https://v3.gulpjs.com.cn/docs/recipes/browserify-with-globs/     gulp v3版本的

// browserify产生的是文本流，而gulp产生的是虚拟文件对象流：里面的content属性基本也是一个文本流;还差base属性和path属性。
// vinyl-source-stream 可以产生一个虚拟文件对象
// vinyl-buffer 把content从流转换为缓冲。
var bundle = browserify({
  entries: ['main.js'],
  debug: true // 打包完成后产生一个sourcemap
});

gulp.task('script', function() {
  return bundle.bundle() // 创建一个编译好的文件流。
        .pipe(source('main.min.js')) // 转换为虚拟文件对象
        .pipe(buffer()) // 把content从流转换为buffer
        .pipe(sourcemaps.init({loadMaps: true})) // 把产生的sourcemap作为一个属性添加到文件系统里
        .pipe(uglify())
        .pipe(gulp.dest('dest/dist'))
});


// 3. 集成基于promise的工具， 留在处理文件相关的东西时比较好，其他的就可以用promise:标准的fetch能得到一个Promise
// node-fetch, node对fetch的一个实现
var fetch = require('node-fetch');
var modules = require('../package.json');
var blackList = 'https://raw.githubusercontent.com/gulpjs/plugins/master/src/blackList.json';

function black() {
  return fetch(blackList)
        .then(function(res) {
          return res.text()
        })
        .then(function(res){
          return JSON.parse(res)
        })
        .then(function(res){
          return new Promise(function(resolve, reject) {
            ['devDependencies', 'dependencies'].forEach(function(item){
              Object.keys(modules[item]).forEach(function(key){
                if (!!res[key]) {
                  reject(`you are using ${key}, not good!`)
                }
              });
            })
            resolve('everything okay');
          })
        })
}

exports.black = black;