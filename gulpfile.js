/**
 *@author hitjoshi@deloitte.com
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var ngHtml2Js = require("gulp-ng-html2js");
var ngAnnotate = require('gulp-ng-annotate');
var mainBowerFiles = require('gulp-main-bower-files');
var gulpFilter = require('gulp-filter');



// minifies vendor JS files
gulp.task('main-bower-files', function() {
    var filterJS = gulpFilter('**/*.js', {
        restore: true
    });

    return gulp.src('./bower.json')
        .pipe(mainBowerFiles({
            overrides: {
                'bootstrap': {
                    main: [
                        './dist/js/bootstrap.js'
                    ]
                },
                'angularjs-datepicker': {
                    main: [
                        './dist/angular-datepicker.js'
                    ]
                }
            }
        }))
        .pipe(filterJS)
        .pipe(concat('app.vendor.js'))
        .pipe(ngAnnotate())
        .pipe(uglify({
            mangle: true
        }))
        .pipe(filterJS.restore)
        .pipe(gulp.dest('client'));
});


// minifies our JS
gulp.task('scripts-ui', function() {
    gulp.src(['./client/js/**/*.js', '!./client/**/*.test.js', '!./client/app.min.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        // .pipe(uglify({
        //     mangle: true
        // }))
        .on('error', function(e) {
            console.log(e);
        })
        .pipe(gulp.dest('client'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client'));
});




gulp.task('watch', function() {
    watch(['./client/js/**/*.js', '!./client/**/*.test.js', '!./client/app.min.js'], function() {
        gulp.start('scripts-ui');
    });
});

gulp.task('default', ['main-bower-files', 'scripts-ui', 'watch']);
