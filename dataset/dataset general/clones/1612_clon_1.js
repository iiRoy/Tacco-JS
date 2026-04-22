/*
 * This file is part of the grunt-banner project.
 * It provides configuration for various Grunt tasks,
 * including JSHint, clean, copy, usebanner, and nodeunit.
 *
 * For more details, visit: https://github.com/mattstyles/grunt-banner
 *
 * Copyright (c) 2014 Matt Styles. All rights rights reserved.
 * Licensed under the MIT license - see project LICENSE file for full details.
 */


// Ensure strict mode for robust code execution.
'use strict';


/**
 * The main Grunt plugin entry point.
 * This function registers all necessary tasks and configurations with Grunt.
 * @param {object} grunt - The Grunt API object.
 */
module.exports = function (      grunt     ) {


    // Initialize the Grunt configuration for the project.
    // This includes various tasks and their specific settings.
    grunt.initConfig ( {


        // JSHint task configuration for code quality checks.
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>' // Include test files from Nodeunit configuration.
            ],
            options: {
                jshintrc: '.jshintrc' // Path to the JSHint configuration file.
            }
        },


        // Clean task to remove temporary files before tests or builds.
        clean: {
            tests: [ 'test/tmp' ] // Target directory for temporary test files.
        },


        // Copy task to prepare test fixtures.
        copy: {
            tests: {
                expand: true,
                cwd: 'test/fixtures/', // Source directory for files.
                src: '**', // Copy all files and subdirectories.
                dest: 'test/tmp/' // Destination for copied files.
            }
        },


        // Custom application-specific configuration.
        appConfig: {
            def: 'STRING' // A sample configuration value.
        },


        // The 'usebanner' task configuration, which is the core of this plugin.
        // It defines various scenarios for applying banners to files.
        usebanner: {


            // Configuration for placing a banner at the top of files.
            bannerTop: {
                options: {
                    position: 'top', // Position the banner at the beginning of the file.
                    banner: '// the banner' // The content of the banner.
                },
                files: {
                    src: [ 'test/tmp/some.js' ] // Files to apply the banner to.
                }
            },


            // Configuration for placing a banner at the bottom of files.
            bannerBottom: {
                options: {
                    position: 'bottom', // Position the banner at the end of the file.
                    banner: '// the banner' // The content of the banner.
                },
                files: {
                    src: [ 'test/tmp/someBottom.js' ] // Files to apply the banner to.
                }
            },


            // Configuration for a banner without an automatic line break.
            bannerNoLineBreak: {
                options: {
                    banner: 'console.log("loaded"); ', // Banner content, note the trailing space.
                    linebreak: false // Do not append a newline character after the banner.
                },
                files: {
                    src: [ 'test/tmp/someNoLineBreak.js' ] // Files for this scenario.
                }
            },


            // Configuration demonstrating banner content processing via a function.
            bannerProcess: {
                options: {
                    process: function ( filepath ) {
                        // This function dynamically generates banner content based on the file path.
                        return grunt.template.process (
                            '// banner for file: <%= filename %>',
                            {
                                data: {
                                    filename: filepath.match ( /\/([^/]*)$/ ) [ 1 ] // Extracts filename from path.
                                }
                            }
                        ) ; // End of grunt.template.process call.
                    } // End of process function definition.
                },
                files: {
                    src: [ 'test/tmp/someProcess.js' ] // Files to process.
                }
            },


            // Configuration for placing a banner at the top, but only if a pattern is matched.
            bannerMatchPatternTop: {
                options: {
                    position: 'top', // Place banner at the top.
                    banner: '// the banner', // Banner content.
                    pattern: 'var variable', // The pattern to look for in the file.
                    linebreak: true // Add a line break after the banner.
                },
                files: {
                    src: [
                        'test/tmp/someMatchingPatternTop.js', // File expected to match.
                        'test/tmp/someNotMatchingPattern.js' // File not expected to match.
                    ]
                }
            },


            // Configuration for placing a banner at the bottom, conditional on a pattern.
            bannerMatchPatternBottom: {
                options: {
                    position: 'bottom', // Place banner at the bottom.
                    banner: '// the banner', // Banner content.
                    pattern: 'var variable' // The pattern to match.
                },
                files: {
                    src: [
                        'test/tmp/someMatchingPatternBottom.js' // Files for this pattern match scenario.
                    ]
                }
            }
        },


        // Nodeunit task configuration for running unit tests.
        nodeunit: {
            tests: [ 'test/*_test.js' ] // Glob pattern for Nodeunit test files.
        }

    } ) ; // End of grunt.initConfig call.


    // Load this plugin's tasks from the 'tasks' directory.
    // This makes the 'usebanner' task available to Grunt.
    grunt.loadTasks ( 'tasks' ) ;


    // Load other necessary Grunt plugins that provide tasks used in this Gruntfile.
    // These are standard Grunt contrib plugins.
    grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-clean' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-nodeunit' ) ;
    grunt.loadNpmTasks ( 'grunt-contrib-copy' ) ;


    // Register the 'test' task.
    // This task orchestrates the entire test workflow: linting, cleanup, setup, banner application, and unit tests.
    grunt.registerTask ( 'test', [
        'jshint',      // Run JSHint for code quality.
        'clean',       // Clean temporary directories.
        'copy',        // Copy test fixtures.
        'usebanner',   // Apply banners as configured.
        'nodeunit'     // Execute unit tests.
    ] ) ;


    // Register the 'default' task.
    // This task is run when 'grunt' is executed without specifying a task.
    // By default, it will run all defined tests.
    grunt.registerTask ( 'default', [ 'test' ] ) ;


} ; // End of module.exports function.