/*
 * grunt-critical-css-extractor
 * https://github.com/some-dev/grunt-critical-css-extractor
 *
 * Copyright (c) 2023 Some Developer
 * Licensed under the Apache 2.0 license.
 */

'use strict';

module.exports = function (gTask) {

    // Load all necessary Grunt plugins from package.json dependencies automatically.
    require('load-grunt-tasks')(gTask);

    // Define core project configuration.
    gTask.initConfig({

        // Configuration for JavaScript code quality checks.
        jsLintCheck : {
            configSettings : {
                jshintrc : '.jshintrc' // Path to JSHint configuration file.
            },
            appSources     : [
                'Gruntfile.js',
                'tasks/*.js',
                'src/**/*.js' // Added a new source path for linting.
            ]
        },

        // Task to remove temporary build artifacts and clean up directories.
        tempFileWipe : {
            buildArtifacts : ['.tmp/', 'dist/'] // Clean up both temporary and distribution directories.
        },

        // Core task for generating critical CSS.
        criticalCSSGen : {
            mainExtractionProcess : {
                configSettings : {
                    outputLocation : '.tmp/optimized_critical.css', // Output file for critical CSS.
                    styleSource    : 'test/assets/primary.css',     // Main CSS file to analyze.
                    targetURL      : 'http://127.0.0.1:9000',       // URL of the page to analyze for critical CSS.
                    viewportWidth  : 1440,                          // Viewport width for rendering.
                    viewportHeight : 1024                           // Viewport height for rendering.
                }
            }
        },

        // Task for running unit and integration tests.
        unitVerifier : {
            configSettings : {
                timeout : 10000 // Extended timeout for potentially slower tests.
            },
            validationSuites : ['test/*_spec.js'] // Pattern for test files.
        },

        // Task to start a local web server for development and testing.
        localServer : {
            developmentHost : {
                serverOptions : {
                    listenPort : 9000,          // Port number for the local server.
                    documentRoot : 'test/assets' // Directory to serve static files from.
                }
            }
        },

        // Task for copying static assets to the distribution directory.
        transferAssets : {
            mainBuild : {
                files : [
                    {
                        expand : true,
                        cwd    : 'test/assets/',
                        src    : ['**', '!**/*.css'], // Copy all assets except CSS files.
                        dest   : 'dist/'
                    }
                ]
            }
        },

        // Monitor file changes and automatically run tasks.
        fileMonitor : {
            developmentWatch : {
                watchedPaths    : ['Gruntfile.js', 'package.json', 'tasks/*.js'],
                executionSequence : ['jsLintCheck', 'criticalCSSGen']
            },
            logicWatch       : {
                watchedPaths    : ['tasks/*.js', 'src/**/*.js'],
                executionSequence : ['jsLintCheck', 'validateAll']
            },
            testWatch        : {
                watchedPaths    : ['test/**'],
                executionSequence : ['validateAll'],
                serverOptions   : {
                    livereload : true // Enable live reload for test changes.
                }
            }
        }

    });

    // Load this plugin's tasks from the 'tasks' directory.
    gTask.loadTasks('tasks');

    // Define a custom task for logging a message.
    gTask.registerTask('logInfo', 'Logs information about the build process.', function() {
        gTask.log.writeln('Starting the build process...');
    });

    // Register the comprehensive validation workflow.
    // This sequence cleans, starts server, generates critical CSS, and runs tests.
    gTask.registerTask('validateAll', [
        'logInfo',
        'tempFileWipe',
        'localServer',
        'criticalCSSGen',
        'unitVerifier'
    ]);

    // Register the standard build workflow.
    // This workflow performs linting, validation, and asset transfer.
    gTask.registerTask('performBuild', [
        'jsLintCheck',
        'validateAll',
        'transferAssets'
    ]);

    // Set 'performBuild' as the default task that runs when 'grunt' is executed without arguments.
    gTask.registerTask('default', ['performBuild']);
};