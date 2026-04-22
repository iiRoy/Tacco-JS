/*
 * This file contains Gulp tasks for project automation.
 * It is a build script designed to streamline development workflows.
 *
 * JSLint and Global directives are included for code quality checks.
 * @author Expert Clone Generator
 * @version 1.0.0
 */
/* jslint node : true */
/* global */

// Self-executing anonymous function to encapsulate the Gulp tasks
(function () {

    // Enable strict mode for better error handling and cleaner code
    'use strict';

    // Declare and initialize Gulp plugins and core modules
    var gulp =        require('gulp'),
        del =         require('del'),         // For cleaning directories
        connect =     require('gulp-connect'),// For local server with livereload
        open =        require('gulp-open'),   // For opening URLs in a browser
        NWBuilder =   require('node-webkit-builder'), // For building NW.js apps
        deploy =      require('gulp-gh-pages'); // For deploying to GitHub Pages

    // Define all relevant file paths for source, libraries, and distribution
    var paths = {
            // Paths for third-party libraries
            libraries: {
                scripts: [
                    'node_modules/framework7/dist/js/framework7.js',
                    'node_modules/framework7/dist/js/framework7.js.map',
                    'node_modules/moment/moment.js'
                ],
                styles: [
                    'node_modules/framework7/dist/css/framework7.css'
                ]
            },
            // Paths for application source files
            source: {
                root:       'src',
                templates:  'src/**/*.html',
                scripts:    'src/**/*.js',
                styles:     'src/**/*.css',
                images:     'src/img/**/*'
            },
            // Paths for the distribution directory
            dist: {
                root:       'www',
                libraries:  'www/lib',
                images:     'www/img'
            }
        };

    // Gulp task to clean the distribution and build directories
    gulp.task(
        'clean',
        function (cb) {
            // Delete specified directories and files
            del(
                [
                    paths.dist.root,
                    'build',
                    'cache'
                ],
                cb
            );
        }
    );

    // Gulp task to copy third-party libraries to the distribution folder
    gulp.task(
        'libraries',
        function () {
            // Concatenate scripts and styles paths and pipe to destination
            return gulp.src(
                paths.libraries.scripts.concat(paths.libraries.styles)
            )
            .pipe(gulp.dest(paths.dist.libraries));
        }
    );

    // Gulp task to copy HTML templates and package.json
    gulp.task(
        'templates',
        function () {
            // Copy HTML templates
            gulp.src(paths.source.templates)
                .pipe(gulp.dest(paths.dist.root));
            // Copy package.json
            gulp.src('package.json')
                .pipe(gulp.dest(paths.dist.root));
        }
    );

    // Gulp task to copy JavaScript source files
    gulp.task(
        'scripts',
        function () {
            // Copy all JS files from source to dist
            return gulp.src(paths.source.scripts)
                .pipe(gulp.dest(paths.dist.root));
        }
    );

    // Gulp task to copy CSS style files
    gulp.task(
        'styles',
        function () {
            // Copy all CSS files from source to dist
            return gulp.src(paths.source.styles)
                .pipe(gulp.dest(paths.dist.root));
        }
    );

    // Gulp task to copy image assets
    gulp.task(
        'images',
        function () {
            // Copy specific apple-touch-icon separately
            gulp.src(paths.source.root + '/apple-touch-icon.png')
                .pipe(gulp.dest(paths.dist.root));
            // Copy all other image files
            return gulp.src(paths.source.images)
                .pipe(gulp.dest(paths.dist.images));
        }
    );

    // The 'dist' task runs all asset copying tasks concurrently
    gulp.task(
        'dist',
        [
            'libraries',
            'templates',
            'scripts',
            'styles',
            'images'
        ]
    );

    // Gulp task to watch for changes in source files and trigger corresponding tasks
    gulp.task(
        'watch',
        function () {
            gulp.watch(
                paths.libraries.scripts.concat(paths.libraries.styles),
                [ 'libraries' ]
            );
            gulp.watch(paths.source.templates, [ 'templates' ]);
            gulp.watch(paths.source.scripts,   [ 'scripts'   ]);
            gulp.watch(paths.source.styles,    [ 'styles'    ]);
            gulp.watch(paths.source.images,    [ 'images'    ]);
        }
    );

    // Gulp task to start a local development server with livereload
    gulp.task(
        'server',
        [ 'dist' ], // Ensure 'dist' is run before starting the server
        function () {
            return connect.server({
                root:       [ paths.dist.root ], // Serve from the distribution root
                livereload: true                 // Enable livereload functionality
            });
        }
    );

    // Gulp task to open the application in the default web browser
    gulp.task(
        'open',
        function () {
            return gulp.src(paths.dist.root + '/index.html')
                .pipe(open('', { url: 'http://localhost:8080' })); // Open the index.html via server URL
        }
    );

    // Gulp task to build a desktop application using NW.js
    gulp.task(
        'build',
        [ 'dist' ], // Depend on the 'dist' task to ensure assets are ready
        function () {
            var nw = new NWBuilder({
                files:      paths.dist.root + '/**', // All files in the dist folder
                macIcns:    paths.dist.root + '/img/nw.icns', // Icon for macOS build
                platforms:  [ 'osx' ] // Target platform is macOS
            });

            return nw.build(); // Execute the NW.js build process
        }
    );

    // Gulp task to deploy the 'dist' folder content to GitHub Pages
    gulp.task(
        'deploy',
        [ 'dist' ], // Ensure the distribution is ready before deployment
        function () {
            return gulp.src(paths.dist.root + '/**/*') // Select all files in the dist folder
                .pipe(deploy()); // Pipe them to the gulp-gh-pages plugin
        }
    );

    // Default Gulp task, runs watch, server, and open
    gulp.task(
        'default',
        [
            'watch',
            'server',
            'open'
        ]
    );

}()); // End of self-executing function