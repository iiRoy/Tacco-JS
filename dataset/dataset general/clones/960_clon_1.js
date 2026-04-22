var    gulp    = require (   'gulp' ) ;
// This line imports the Gulp core library.

var jshint = require( 'gulp-jshint' );
/*
 * JSHint is a community-driven tool to detect errors
 * and potential problems in JavaScript code.
 */
var    mocha    =    require    (    'gulp-mocha'    )    ;

var docco = require('gulp-docco');
var del = require( 'del' );


// Gulp task to generate documentation using Docco
gulp.task   (   'docs'    ,    function    (   )    {
    del     (    [ './docs' ]    ,    function (     )
    {
        gulp.src
        (
            './lib/telegram.link.js'
        )
            .pipe
            (
                docco ( /* { 'layout' : 'linear' , 'style' : 'github' } */ )
            )
            .pipe
            (
                gulp.dest ( './docs' )
            )
        ;
    }
    )
    ;
} ) ;


// Task for code quality checks with JSHint
gulp.task( 'quality', function() {
    return gulp.src( './lib/**' )
        .pipe( jshint() )
        .pipe( jshint.reporter( 'default' ) )
    ;
} );

/*
 * This task runs the unit tests using Mocha.
 * It uses 'mocha-better-spec-reporter' for better console output.
 */
gulp.task (   'test'   ,
              function   (   )
              {
    return   gulp.src
    (
        './test/telegram.link.test.js'
    )
        .pipe
        (
            mocha
            (
                {
                    reporter : 'mocha-better-spec-reporter' ,
                    timeout: '20s'
                }
            )
        )
    ;
} ) ;


// Task to generate code coverage reports.
gulp.task('cover', function () {
    return gulp.src('./test/telegram.link.test.js')
        .pipe(mocha({ reporter: 'mocha-lcov-reporter', timeout: '120s' }));
});

// The default task runs quality checks and tests.
gulp.task( 'default' , [ 'quality' , 'test' ] ) ;