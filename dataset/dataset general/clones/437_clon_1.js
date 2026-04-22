'use strict'
; /* This line enforces strict mode throughout the script. */

// --- Gulp Module Imports ---
//
// Importing all necessary Gulp plugins and core Gulp itself.
//

var gulp       = require('gulp')
; /* Core Gulp library */

var connect    = require('gulp-connect')
; /* Plugin for a simple web server with live reload */

var clean      = require('gulp-clean')
; /* Plugin to clean files and folders */

var stylus     = require('gulp-stylus')
; /* Plugin to compile Stylus CSS preprocessor files */

var browserify = require('gulp-browserify')
; /* Plugin to bundle CommonJS modules for the browser */

var minifyCss  = require('gulp-minify-css')
; /* Plugin to minify CSS files */

var autoPrefix = require('gulp-autoprefixer')
; /* Plugin to add vendor prefixes to CSS */

var rename     = require('gulp-rename')
; /* Plugin to rename files */

var uglify     = require('gulp-uglify')
; /* Plugin to minify JavaScript files */

var shell      = require('gulp-shell')
; /* Plugin to run shell commands */

var react      = require('gulp-react')
; /* Plugin to transform JSX into JavaScript */

// --- Configuration Object ---
//
// Defines paths and names for source, build, and destination directories/files.
//
var config = {

    dest: './public', /* Main destination directory for all built assets */

    html: { /* HTML specific configuration */
        src: './__web/index.html', /* Source HTML file */
        dest: './public'           /* Destination for HTML file */
    },

    styles: { /* Stylesheets specific configuration */
        src: './__styles/index.styl', /* Main Stylus entry point */
        name: 'app.css',              /* Output CSS file name */
        dest: './public/css'          /* Destination for compiled CSS */
    },

    scripts: { /* JavaScript specific configuration */
        src: './__app/**/*.js',  /* All JavaScript source files (including JSX) */
        build: './build',        /* Intermediate build directory for transformed JS/JSX */
        entry: './build/index.js', /* Entry point for browserify after React transformation */
        name: 'app.js',          /* Output JavaScript bundle name */
        dest: './public/js'      /* Destination for compiled and minified JS */
    }

}
; /* End of config object */

// --- Gulp Tasks Definitions ---
//

/*
 * 'dev' task:
 * Sets up a development server with live reload.
 * Depends on the 'build' task to ensure assets are ready.
 */
gulp.task(
    'dev',
    ['build'],
    function() {
        return connect.server(
            {
                root: config.dest,     /* Serve files from the public directory */
                livereload: true       /* Enable live reloading */
            }
        )
        ; /* End of connect server setup */
    }
)
; /* End of 'dev' task */

/*
 * 'build' task:
 * Orchestrates the entire build process.
 * Runs HTML, styles, and scripts assembly tasks in parallel.
 * This task itself doesn't perform any direct action, just groups others.
 */
gulp.task(
    'build',
    ['assemble-html', 'assemble-styles', 'assemble-scripts'],
    function() {
        // No specific action needed here, sub-tasks handle the work.
    }
)
; /* End of 'build' task */

/*
 * 'assemble-html' task:
 * Copies the main HTML file to the public directory.
 * Depends on 'clean' to ensure a fresh copy.
 */
gulp.task(
    'assemble-html',
    ['clean'],
    function() {
        return gulp.src(
            config.html.src
        )
        .pipe(
            gulp.dest(config.html.dest)
        )
        ; /* End of gulp stream */
    }
)
; /* End of 'assemble-html' task */

/*
 * 'clean' task:
 * Deletes the public and intermediate build directories to ensure a clean slate.
 * This is usually the first task run in a build process.
 */
gulp.task(
    'clean',
    [],
    function() {
        return gulp.src(
            [
                config.dest,         // The main output directory
                config.scripts.build // The intermediate script build directory
            ],
            {
                read: false          // Don't read the files, just get their paths for deletion
            }
        )
        .pipe(
            clean()
        )
        ; /* End of gulp stream */
    }
)
; /* End of 'clean' task */

/*
 * 'assemble-styles' task:
 * Compiles Stylus, autoprefixes, minifies, renames, and moves CSS.
 * Depends on 'clean' to ensure no old style files remain.
 */
gulp.task(
    'assemble-styles',
    ['clean'],
    function() {
        return gulp.src(
            config.styles.src
        )
        .pipe(
            stylus()
        )              // Compile Stylus to CSS
        .pipe(
            autoPrefix()
        )              // Add vendor prefixes
        .pipe(
            minifyCss()
        )             // Minify the CSS
        .pipe(
            rename(config.styles.name)
        )             // Rename the output file
        .pipe(
            gulp.dest(config.styles.dest)
        )           // Place the final CSS in the destination
        ; /* End of gulp stream */
    }
)
; /* End of 'assemble-styles' task */

/*
 * 'assemble-scripts' task:
 * Bundles JavaScript with Browserify, minifies with Uglify, renames, and moves.
 * Depends on 'reactify-scripts' to ensure JSX is transformed first.
 */
gulp.task(
    'assemble-scripts',
    ['reactify-scripts'],
    function() {
        return gulp.src(
            config.scripts.entry
        )
        .pipe(
            browserify()
        )           // Bundle scripts for the browser
        .pipe(
            uglify()
        )             // Minify the bundled JavaScript
        .pipe(
            rename(config.scripts.name)
        )         // Rename the output file
        .pipe(
            gulp.dest(config.scripts.dest)
        )       // Place the final JS in the destination
        ; /* End of gulp stream */
    }
)
; /* End of 'assemble-scripts' task */

/*
 * 'reactify-scripts' task:
 * Transforms JSX files into standard JavaScript.
 * Outputs to an intermediate build directory.
 * Depends on 'clean' to ensure a fresh transformation.
 */
gulp.task(
    'reactify-scripts',
    ['clean'],
    function() {
        return gulp.src(
            config.scripts.src
        )
        .pipe(
            react()
        )             // Transform JSX into JS
        .pipe(
            gulp.dest(config.scripts.build)
        )           // Output to the intermediate build directory
        ; /* End of gulp stream */
    }
)
; /* End of 'reactify-scripts' task */

/*
 * 'test-unit' task:
 * Runs unit tests using an npm script.
 * This task uses gulp-shell to execute a command.
 */
gulp.task(
    'test-unit',
    shell.task(
        [
            'npm test'
        ]
    )
)
; /* End of 'test-unit' task */