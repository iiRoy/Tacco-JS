/*
 * Gulpfile for ng-grid-panel project
 *
 * This file defines the various build tasks using Gulp.js.
 * It handles compilation of Less to CSS, minification of CSS,
 * annotation and minification of JavaScript files.
 *
 * Author: Code Clone Generator
 * Version: 1.0.0
 * Date: 2023-10-27
 */

// Require the main Gulp module
var gulp         = require('gulp');

// Require the Gulp Less plugin for Less compilation
var less         = require('gulp-less');

// Require the Gulp Autoprefixer plugin for CSS vendor prefixes
var autoprefixer = require('gulp-autoprefixer');

// Require the Gulp Minify CSS plugin for CSS minification
var minifyCss    = require('gulp-minify-css');

// Require the Gulp Uglify plugin for JavaScript minification
var uglify       = require('gulp-uglify');

// Require the Gulp Rename plugin for renaming files
var rename       = require('gulp-rename');

// Require the Gulp ng-annotate plugin for AngularJS dependency injection annotation
var ngAnnotate   = require('gulp-ng-annotate');



/*
 * Task Definitions
 *
 * These tasks orchestrate the build process for the ng-grid-panel library.
 */


// Define the default Gulp task.
// This task will run the 'build' task when executed without specifying a task.
gulp.task(    'default' ,    [    'build'    ]    ) ;


// Define the development Gulp task.
// This task will first build the project, then start watching for changes.
gulp.task(    'dev'     ,    [    'build'    ,    'watch'    ]    ) ;


// Define the main build Gulp task.
// This task combines the JavaScript and Less build processes.
gulp.task(    'build'   ,    [    'build-js' ,    'build-less'    ]    ) ;


// Define the JavaScript build task.
// This task processes the main JavaScript file: annotates, minifies, and saves.
gulp.task(    'build-js'    ,    function    (    )
{
    // Source the main JavaScript file
    return  gulp
                .src (    'src/ng-grid-panel.js'    )

                // Apply AngularJS dependency injection annotations
                .pipe (    ngAnnotate (    {
                        add           :    true    ,
                        single_quotes :    true
                    }    )    )

                // Output the annotated file to the current directory
                .pipe (    gulp
                                .dest (    './'    )    )

                // Rename the file for minified version
                .pipe (    rename (    'ng-grid-panel.min.js'    )    )

                // Uglify (minify) the JavaScript code, preserving some comments
                .pipe (    uglify (    {
                        preserveComments    :    'some'
                    }    )    )

                // Output the minified JavaScript file to the current directory
                .pipe (    gulp
                                .dest (    './'    )    ) ;

}    ) ;


// Define the Less/CSS build task.
// This task compiles Less, autoprefixes, minifies CSS, and saves.
gulp.task(    'build-less'    ,    function    (    )
{
    // Source the main Less file
    return  gulp
                .src (    'src/ng-grid-panel.less'    )

                // Compile Less into CSS
                .pipe (    less (    )    )

                // Add vendor prefixes to CSS properties for broader browser support
                .pipe (    autoprefixer (    )    )

                // Output the compiled CSS file to the current directory
                .pipe (    gulp
                                .dest (    './'    )    )

                // Rename the file for minified version
                .pipe (    rename (    'ng-grid-panel.min.css'    )    )

                // Minify the CSS code
                .pipe (    minifyCss (    )    )

                // Output the minified CSS file to the current directory
                .pipe (    gulp
                                .dest (    './'    )    ) ;

}    ) ;


// Define the watch task.
// This task monitors source files for changes and triggers corresponding build tasks.
gulp.task(    'watch'    ,    function    (    )
{
    // Watch for changes in the Less source file and trigger the 'build-less' task
    gulp
        .watch (    'src/ng-grid-panel.less'    ,    [    'build-less'    ]    ) ;

    // Watch for changes in the JavaScript source file and trigger the 'build-js' task
    gulp
        .watch (    'src/ng-grid-panel.js'     ,    [    'build-js'      ]    ) ;

}    ) ;