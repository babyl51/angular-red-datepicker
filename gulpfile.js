var fs = require('fs');
var connect = require('gulp-connect');
var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var header = require('gulp-header');
var rename = require('gulp-rename');
var es = require('event-stream');
var del = require('del');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var templateCache = require('gulp-angular-templatecache');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var open = require('gulp-open');
var less = require('gulp-less');
var order = require("gulp-order");

var wiredep = require('wiredep').stream;
var inject = require('gulp-inject');


gulp.task('build', ['scripts', 'inject']);
gulp.task('serve', ['build', 'connect', 'watch', 'open']);
gulp.task('default', ['build', 'test']);
gulp.task('test', ['build', 'jshint-test', 'karma']);
gulp.task('serve-test', ['build', 'watch', 'jshint-test', 'karma-serve']);


gulp.task('connect', function () {
    connect.server({
        root: [__dirname],
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src(['./demo/*.html', '.src/*.html'])
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./demo/**/*.html'], ['html']);
    gulp.watch(['./**/*.less'], ['styles']);
    gulp.watch(['./src/**/*.js', './demo/**/*.js', './**/*.html'], ['scripts']);
});

gulp.task('clean', function (cb) {
    del(['dist/**/*'], cb);
});

gulp.task('scripts', ['clean'], function () {

    function buildTemplates() {
        return gulp.src('src/**/*.html')
            .pipe(minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            }))
            .pipe(templateCache({module: 'angularRedDatepicker'}));
    }

    function buildDistJS() {
        return gulp.src('src/angular-red-datepicker.js')
            .pipe(plumber({
                errorHandler: handleError
            }))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'));
    }

    gulp.src('src/angular-red-datepicker.less')
        .pipe(less())
        .pipe(header(config.banner, {
            timestamp: (new Date()).toISOString(), pkg: config.pkg
        }))
        .pipe(gulp.dest('dist'))
        .pipe(minifyCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());

    es.merge(buildDistJS(), buildTemplates())
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(order([
            'angular-red-datepicker.js'
        ]))
        .pipe(concat('angular-red-datepicker.js'))
        .pipe(header(config.banner, {
            timestamp: (new Date()).toISOString(), pkg: config.pkg
        }))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('open', function () {
    gulp.src('./demo/demo.html')
        .pipe(open('', {url: 'http://localhost:8080/demo/demo.html'}));
});

gulp.task('jshint-test', function () {
    return gulp.src('./test/**/*.js').pipe(jshint());
});

gulp.task('karma', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('karma-serve', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});


gulp.task('wiredep', function () {
    var options = config.getWiredepDefaultOptions();

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(gulp.dest(config.final));

});

gulp.task('inject', ['wiredep'], function () {
    return gulp
        .src(config.index)
        .pipe(inject(gulp.src(config.jsInject, {read: false})))
        .pipe(inject(gulp.src(config.cssInject, {read: false})))
        .pipe(gulp.dest(config.final));
});


var config = {
    pkg: JSON.parse(fs.readFileSync('./package.json')),
    banner: '/*!\n' +
    ' * <%= pkg.name %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' * <%= pkg.author %>\n' +
    ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
    ' * License: <%= pkg.license %>\n' +
    ' */\n\n\n',
    bower: {
        json: require('./bower.json'),
        directory: './bower_components/'
        // ignorePath: './'
    },
    index: './demo/demo.html',
    final: './demo/',

    jsInject: [
        './dist/*.js',
        './demo/*.js'
    ],
    cssInject: [
        './dist/*.css',
        './demo/*.css'
    ],
    getWiredepDefaultOptions: function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory
            // ignorePath: config.bower.ignorePath
        };
        return options;
    }
};


function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}