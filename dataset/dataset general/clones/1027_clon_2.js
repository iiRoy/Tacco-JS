'use strict';

// This file defines the build automation tasks for the project.
module.exports = function ( taskRunner ) {

    // Load necessary Grunt plugins automatically from package.json
    require( 'load-grunt-tasks' )( taskRunner );

    // Configure all the tasks for the build process
    taskRunner.setupConfiguration( {

        /*
         * Task to duplicate project assets.
         * Moves files from development locations to the release directory.
         */
        duplicateFiles: {
            release: {
                assets: [ {
                    // Process files individually
                    unroll: true,
                    // Ignore directory structure in source paths
                    squash: true,
                    // Current working directory for source files
                    baseDir: '',
                    // Target directory for JavaScript files
                    destination: 'release/scripts',
                    // Source files for JavaScript libraries
                    source: [
                        'bower_components/jquery/jquery.min.js',
                        'bower_components/jquery-ui/jquery-ui.min.js'
                    ]
                },
                {
                    unroll: true,
                    squash: true,
                    baseDir: '',
                    // Target directory for image assets
                    destination: 'release/pictures',
                    // Source image files
                    source: [
                        'images/accept.png',
                        'images/asterisk_yellow.png',
                        'images/cross.png',
                        'images/delete.png'
                    ]
                }
                ]
            }
        },

        // JavaScript minification task
        minifyJs: {
            preferences: {
                // Prevent mangling of specific identifiers
                obfuscate: {
                    exclude: [ 'jQuery', '$' ]
                }
            },
            release: {
                outputFiles: {
                    // Minify the main plugin script
                    'release/scripts/jquery.mark.min.js': [ 'scripts/jquery.mark.js' ]
                }
            }
        },

        // Task to combine multiple JavaScript files into one
        bundleScripts: {
            // No specific options needed for this task
            preferences: {},
            release: {
                // List of source JavaScript files to concatenate
                sourceFiles: [
                    'release/scripts/jquery.min.js',
                    'release/scripts/jquery-ui.min.js',
                    'release/scripts/jquery.mark.min.js'
                ],
                // Output file for the combined script
                destinationFile: 'release/scripts/jquery.mark.combined.min.js',
            },
        },

        // CSS minification task
        minifyCss: {
            release: {
                outputFiles: {
                    // Minify the main stylesheet
                    'release/styles/marker.min.css': [ 'styles/marking.css' ]
                }
            }
        },

        // Task to remove build artifacts
        purgeOutput: [ 'release' ]

    } );

    // Define the default task sequence for the build
    taskRunner.defineTask( 'default', [
        'duplicateFiles', // First, copy all required assets
        'minifyJs',       // Then, minify JavaScript files
        'bundleScripts',  // Combine all JavaScript into a single file
        'minifyCss'       // Finally, minify CSS files
    ] );

};