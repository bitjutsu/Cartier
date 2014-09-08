(function () {
    'use strict';

    var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        shell = require('gulp-shell'),
        connect = require('connect'),
        serveStatic = require('serve-static');

    gulp.task('test', function () {
        /* Files need to be served because using pushState from a static HTML
        page throws a SecurityError. */

        /* Start serving files: */
        var server = connect().use(serveStatic(__dirname)).listen(3000);

        var stream = gulp.start(shell.task([
            'mocha-phantomjs -R spec http://localhost:3000/test/runner.html'
        ]));

        /* TODO: close server after shell command finished execution. */
        /* server.close(); */
    });

    gulp.task('build', function () {
        /* Uglify: */
        gulp.src('cartier.js')
            .pipe(uglify())
            .pipe(rename('cartier.min.js'))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('default', [ 'build' ]);
}());
