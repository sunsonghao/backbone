/**
 * gulp V4.0  */

//  流式构建系统的核心理念: 通过流把把虚拟文件对象（vinyl）传递给一个个操作。
// nodejs中流就是持续的流动的数据，从某个地方输入，最后输出到某个地方。数据块可以被一块一块读取，大小取决于流。
// gulpjs流是基于对象的，每一块代表一个对象（虚拟文件对象）：base:文件名，path, content: buffer（计算机的一块内存，文件加载后可任意读取修改内容）或者nodejs流（一块数据处理好开始处理下一块数据，就不能再重新读取上一块数据了：局限）。

const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint'); // 需要安装jshint
const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del'); // 接口兼容gulp, 不是gulp的插件

const bsync = require('browser-sync');
const wiredep = require('wiredep').stream; // 需要在html中插入标记，标记文件的插入位置
const mainBowerFiles = require('main-bower-files');

const cached = require('gulp-cached');
const remember = require('gulp-remember');

const slash = require('slash')
const sourcemaps = require('gulp-sourcemaps');

const through = require('through2');
// const arguments = require('yargs').argv; // node > 10, http://www.ruanyifeng.com/blog/2015/05/command-line-with-node.html

// var isprod = (arguments.env === 'prod'); // 区分生产和开发环境
var isprod = false; // 区分生产和开发环境

function noop() { // 把虚拟文件对象传递给下一步的插件
  return through.obj();
}

function dev(task) {
  return isprod ? noop() : task;
}

function clean() {
  return del(['dist']);
}
function test() {
  // 增量构建；构建缓存：
  // since过滤从上次执行test任务后变动的文件（根据时间戳），但是构建过程不太合适：合并最后会用到所有文件不是只用到变动的文件
  // gulp-cache提供构建缓存功能，但还是要通过gulp.src读取文件所以并不会减少读取操作。文件在缓存中检查是否最新，不在缓存中就添加到缓存中。
  // 可以把2者结合使用。
  // gulp-remember把之前 构建好的 缓存的文件重新添加到文件流中。(包括删除的文件)
  return src(['js/**/*.js', '!lib/**/*.js'], {since: lastRun('test')})
          .pipe(jshint())
          .pipe(jshint.reporter('default'))
          .pipe(jshint.reporter('fail'));
}

// scripts依赖test, 依赖链
function scripts() {
  var glob = mainBowerFiles('**/*.js');
  glob.push('js/**/*.js'); // 把自己的代码匹配规则添加到数组中
  return src(glob, { since: lastRun('scripts')}) // 生产环境中不需要sourcemaps
  // return src(['lib/**/*.js', 'js/**/*.js'])
          .pipe(dev(sourcemaps.init()))
          .pipe(cached('uglify')) // 更新缓存
          .pipe(uglify())
          .pipe(remember('uglify')) // 取回缓存中构建的文件+新文件
          .pipe(concat('main.min.js'))
          .pipe(dev(sourcemaps.write('.', { // . 和源文件一个目录
            sourceRoot: 'js-source' // 在浏览器开发工具中看到source的root path
          })))
          .pipe(dest('dist/scripts'))
}


function styles() {
  return src('css/**/*.less')
          .pipe(less())
          .pipe(cssnano())
          .pipe(autoprefixer())
          .pipe(dest('dist/styles'))
}

exports.copy = function () {
  return src('js/**/*.js')
          // 转换数据
          .pipe(concat('bundle.js')) // 结构改变
          .pipe(uglify()) // 内容改变
          .pipe(dest('dist'));
}

function server(done) {
  if (!isprod) {
    bsync({
      server: {
        baseDir: ['dist'] // 收到请求，首先在dist目录下查找。http://browsersync.io上查找配置选项
      }
    }); // 启动一个新的进程
  }
  done();
}

function watchs(done) {
  if (!isprod) {
    var watcher = watch(['js/**/*.js', '!lib/**/*.js'], parallel(scripts));
    watcher.on('unlink', function(filePath) { // 从缓存中移除被源中删除的文件
      delete cached.caches('uglify')[slash(path.join(__dirname, filePath))];
      remember.forget('uglify', slash(path.join(__dirname, filePath)));
    }); 
    watch('css/**/*.less', parallel(styles));
    watch('dist/**/*.js', bsync.reload);
  }
  done();
}

// 用gulp把依赖集成到应用中，使用wiredep的api访问bower文件
function deps() {
  return src('*.html')
          .pipe(wiredep())
          .pipe(dest('dist'));
}

exports.server = server;
exports.clean = clean;
exports.test = test;
exports.scripts = scripts;
exports.styles = styles;
// 任何导出（export）的函数都将注册到 gulp 的任务（task）系统中
exports.default = series(clean, parallel(styles, series(/* test, */ scripts), deps), server, watchs); // 初次构建
// 可以使用ts或者babel编写该文件，需要安装对应模块转译。
// 可以将task拆分到不同文件，通过import导入。

// 任务：公有（通过export导出），私有（内部使用，作为series或parallel组成部分）。
// 			export不可用时，使用task()API注册任务

// gulp不再支持同步任务(4.0)

// 异步任务： task中没有返回时需要显式调用cb();

// 处理文件：src()接受glob参数：普通字符串和/或通配符组成的字符串,：创建一个可读流，通过pipe管道处理，最后保存到 dest(): 创建一个可写流。