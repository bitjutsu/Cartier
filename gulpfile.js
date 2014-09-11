(function () {
    'use strict';

    var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        shell = require('gulp-shell'),
        connect = require('connect'),
        serveStatic = require('serve-static'),
        rimraf = require('rimraf').sync;

    gulp.task('clean', function () {
        /* Remove the coverage folder, then the instrumented cartier.js */
        rimraf('coverage');

        rimraf('test/cartier.instrumented.js');
    });

    gulp.task('test', function () {
        /* Files need to be served because using pushState from a static HTML
        page throws a SecurityError. */

        /* Start serving files: */
        var server = connect().use(serveStatic(__dirname)).listen(3000);

        var stream = gulp.start(shell.task([
            /*
                Instrument Cartier and put it in the testing folder:
            */
            'istanbul instrument cartier.js > test/cartier.instrumented.js',
            
            /*
                Run the tests in mocha-phantomjs
                (will output the coverage data - the magic happens in test/hooks):
            */
            'mocha-phantomjs -R spec -k test/hooks.js http://localhost:3000/test/runner.html',

            /*
                Generate the coverage report docs with istanbul (and mute it):
            */
            'istanbul report html'
        ]));
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
