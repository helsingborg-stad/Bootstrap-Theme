//
//  GULPFILE.JS
//  Author: Nikolas Ramstedt (nikolas.ramstedt@helsingborg.se)
//
//  CHEATSHEET:
//  "gulp"                  -   Build and watch combined
//  "gulp watch"            -   Watch for file changes and compile changed files
//  "gulp build"            -   Re-build dist folder and build assets
//
//
// => ATTENTION: use "npm install" before first build!

/* ==========================================================================
   Dependencies
   ========================================================================== */

    var gulp        =   require('gulp'),
    rename          =   require('gulp-rename'),
    sass            =   require('gulp-sass'),
    concat          =   require('gulp-concat'),
    autoprefixer    =   require('gulp-autoprefixer'),
    sourcemaps      =   require('gulp-sourcemaps'),
    uglify          =   require('gulp-uglify'),
    rev             =   require('gulp-rev'),
    revDel          =   require('rev-del'),
    revReplaceCSS   =   require('gulp-rev-css-url'),
    fs              =   require('fs'),
    del             =   require('del'),
    runSequence     =   require('run-sequence'),
    plumber         =   require('gulp-plumber'),
    jshint          =   require("gulp-jshint"),
    cleanCSS        =   require('gulp-clean-css'),
    image           =   require('gulp-image'),
    node_modules    =   'node_modules/';

/* ==========================================================================
   Load configuration file
   ========================================================================== */

    var config = fs.existsSync('./config.json')
        ? JSON.parse(fs.readFileSync('./config.json'))
        : {};

/* ==========================================================================
   Default task
   ========================================================================== */

    gulp.task('default', function(callback) {
        runSequence('build', 'watch', callback);
    });

/* ==========================================================================
   Build tasks
   ========================================================================== */

    gulp.task('build', function(callback) {
        runSequence('clean', 'lint', 'sass', 'scripts', 'image', 'rev', callback);
    });

    gulp.task('build:sass', function(callback) {
        runSequence('sass', 'rev', callback);
    });

    gulp.task('build:scripts', function(callback) {
        runSequence('lint:scripts', 'scripts', 'rev', callback);
    });

/* ==========================================================================
   Watch task
   ========================================================================== */

    gulp.task('watch', function() {
        gulp.watch('./assets/source/sass/**/*.scss', ['build:sass']);
        gulp.watch('./assets/source/js/**/*.js', ['build:scripts']);
    });

/* ==========================================================================
   Rev task
   ========================================================================== */

    gulp.task("rev", function(){
        return gulp.src(["./assets/tmp/**/*"])
          .pipe(rev())
          .pipe(revReplaceCSS())
          .pipe(gulp.dest('./assets/dist'))
          .pipe(rev.manifest())
          .pipe(revDel({dest: './assets/dist'}))
          .pipe(gulp.dest('./assets/dist'));
    });

/* ==========================================================================
   SASS Task
   ========================================================================== */

    gulp.task('sass:app', function () {
        return gulp.src('assets/source/sass/app.scss')
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1']
                }))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('./assets/dist/css'))
                .pipe(cleanCSS({debug: true}))
                .pipe(gulp.dest('./assets/tmp/css'));
    });

    gulp.task('sass:admin', function () {
        return gulp.src('assets/source/sass/admin.scss')
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1']
                }))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('./assets/dist/css'))
                .pipe(cleanCSS({debug: true}))
                .pipe(gulp.dest('./assets/tmp/css'));
    });

    gulp.task('sass:customizer', function () {
        return gulp.src('assets/source/sass/customizer.scss')
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1']
                }))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('./assets/dist/css'))
                .pipe(cleanCSS({debug: true}))
                .pipe(gulp.dest('./assets/tmp/css'));
    });

    gulp.task('sass', function(callback) {
        runSequence('sass:app', 'sass:admin', 'sass:customizer', callback);
    });

/* ==========================================================================
   Linter tasks
   ========================================================================== */

    gulp.task('lint:scripts', function() {
        return gulp.src([
                'assets/source/js/*.js',
                'assets/source/js/**/*.js',
                '!assets/source/js/font.js',
            ])
            .pipe(jshint({ multistr: true }))
            .pipe(jshint.reporter('default'));
    });

    gulp.task('lint', function(callback) {
        runSequence('lint:scripts', callback);
    });

/* ==========================================================================
   Scripts task
   ========================================================================== */

    gulp.task('scripts:app', function() {
        return gulp.src([
                'assets/source/js/*.js',
                'assets/source/js/*/*.js',
                '!assets/source/js/Admin/*.js',
                '!assets/source/js/Admin/*/*.js',
            ])
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat('app.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./assets/dist/js'))
            .pipe(uglify())
            .pipe(gulp.dest('./assets/tmp/js'));
    });

    gulp.task('scripts:admin', function() {
        return gulp.src([
                'assets/source/js/Admin/*.js',
                'assets/source/js/Admin/*/*.js',
            ])
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat('admin.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./assets/dist/js'))
            .pipe(uglify())
            .pipe(gulp.dest('./assets/tmp/js'));
    });

    gulp.task('scripts:mce', function() {
        return gulp.src([
                'assets/source/mce-js/*.js'
            ])
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./assets/dist/js'))
            .pipe(uglify())
            .pipe(gulp.dest('./assets/tmp/js'));
    });

    gulp.task('scripts', function(callback) {
        runSequence('scripts:app', 'scripts:admin', 'scripts:mce', callback);
    });

/* ==========================================================================
   Image optimization tasks
   ========================================================================== */

    gulp.task('image', function () {
        return gulp.src('assets/source/images/**/*',)
            .pipe(image())
            .pipe(gulp.dest('./assets/dist/images'));
    });

/* ==========================================================================
   Clean tasks
   ========================================================================== */

    gulp.task('clean:dist', function() {
        return del.sync('./assets/dist');
    });

    gulp.task('clean:tmp', function() {
        return del.sync('./assets/tmp');
    });

    gulp.task('clean', function(callback) {
        runSequence('clean:dist', 'clean:tmp', callback);
    });
