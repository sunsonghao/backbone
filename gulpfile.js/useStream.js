const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint'); // 需要安装jshint
const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del'); // 接口兼容gulp, 不是gulp的插件, 返回promise
const merge = require('merge2')

// 插入流，不会覆盖之前的流而是添加到新的流里面：仅仅添加新文件时可以使用，更复杂的需求使用合并流。
gulp.task('script', function () {
  return gulp.src('**/*.coffee')
          .pipe(coffee())
          .pipe(gulp.src('**/*.js', {passthrough: true})) // 插入流
          .pipe(concat(main.js))
          .pipe(uglify())
          .pipe((gulp.dest('dist/scripts')))
})

// 合并流，使用merge2包
gulp.task('mergeStream', function () {
  var stream1 = gulp.src('**/*.coffee')
                // others
                .pipe(coffee());
  var stream2 = gulp.src('**/*.js')
                // others
  return merge(stream1, stream2).pipe('...')
});

// 根据参数创建流。风格检查、编译代码、合并代码、压缩代码： 前2步不同，需要提取
function compileScripts(param) {
  var transpileStream = gulp.src(param.directory + '**/*.' + param.type)
                        .pipe(param.lintTask())
                        .pipe(param.fail)
                        .pipe(param.compileTask());

  var jsStream = gulp.src('**/*.js')
                // others
  return merge(transpileStream, jsStream).pipe('...');
}

  // 重复的是同一个流
gulp.task('core1', function () {
  return compileScripts({
    directory: '',
    type: 'ts',
    lintTask: 'tslint',
    compileTask: 'tscompile'
  })
})
gulp.task('core2', function () {
  return compileScripts({
    directory: '',
    type: 'ts',
    lintTask: 'tslint2',
    compileTask: 'tscompile2' // 需要自己定义编译过程
  })
})

// 流数组， 运用[].map把一组配置对象转换成一组流， 最后merge合并成一个流。
var configs = [{}, {}, {}]
gulp.task('cores', function () {
  var streams = configs.map(function(config){
    return compileScripts(config);
  });

  return merge(streams);
});

// 使用snippet避免重复代码， 用起来和插件类似，但是snippet执行的是一系列的插件而不是函数。
// 创建snippet需要使用stream-combiner2
const combiner = require('stream-combiner2');
function combine(outFile) {
  return combine.obj(
    uglify(),
    concat(outFile)
  )
}

gulp.task('vendor', function() {
  return gulp.src('vendor/**/*.js')
        .pipe(combine('vendor.js')) // 使用定义好的snippet
        .pipe(gulp.dest('dist'));
})

// 使用流队列管理顺序：merge2能保持gulp的异步并并行执行任务，无法保持顺序（如css文件需要按顺序）
// streamqueue, 使用对象模式
const queue = require('streamqueue');
const cssimport = require('gulp-cssimport');
const mainBowerFiles = require('main-bower-files');
gulp.task('style', function(){
  return queue(gulp.src(mainBowerFiles('*.css')), 
              gulp.src('lib/lib.css').pipe(cssimport()), // 用内容替换掉@import
              gulp.src('styles/main.less').pipe(less()))
          .pipe(autoprefixer())
          .pipe(concat('main.css'))
          .pipe(dest('dist'));
})

// 使用gulp filter修改流的内容， 可以先筛选出一部分文件对象传递给下一个task,后续还可以恢复被过滤掉的元素。
// 最好选文件的时候就过滤掉不需要的