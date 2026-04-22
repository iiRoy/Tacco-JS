/*
 * Gruntfile for grunt-responsive-images plugin
 * This file configures various tasks for the project.
 *
 * Project: grunt-responsive-images
 * Repository: https://github.com/andismith/grunt-responsive-images
 *
 * Author: andismith
 * License: MIT License (see project repository for full details)
 *
 * This is a Type I code clone generated with extensive whitespace and comment modifications.
 * All identifiers, variable names, function names, operators, and expressions are preserved exactly.
 */


'use strict'; // Enforce strict mode for cleaner code and fewer errors.


module.exports = function ( grunt ) { // Export a function that accepts the Grunt object.

    // === Project Configuration ===
    // This section defines the configuration for various Grunt tasks.
    grunt.initConfig( { // Initialize the configuration object for Grunt.

        jshint: { // JSHint task configuration.
            // Checks JavaScript code for potential errors and style issues.
            all: [ // Files to be linted.
                'Gruntfile.js',          // The Gruntfile itself.
                'tasks/*.js',            // All JavaScript files in the 'tasks' directory.
                '<%= nodeunit.tests %>'  // Dynamically includes test files defined in nodeunit.
            ],
            options: { // JSHint options.
                jshintrc: '.jshintrc' // Use the .jshintrc file for configuration.
            }
        },


        // === Clean Task ===
        // Removes temporary files and directories before running tests.
        clean: {
            tests: [ // Target for cleaning test-related files.
                'tmp', // The main temporary directory.
                '!tmp/new_files_only/magikarp-200.png', // Exclude specific files from deletion.
                '!tmp/new_files_only/magikarp-300.png'  // These files are expected to exist for 'new_files_only' test.
            ]
        },


        // === Responsive Images Task Configuration ===
        // This is the core task for generating responsive images.
        responsive_images: {

            options: { // Global options for the responsive_images task.
                engine: 'im' // Use ImageMagick (im) as the processing engine.
            },


            default_options: { // Configuration for the default options test case.
                options: { // Task-specific options (empty here, relying on global).
                },
                files: { // Files to process.
                    'tmp/default_options/minions.jpg': 'test/assets/default_options/minions.jpg' // Output file mapping to source file.
                }
            },


            no_files: { // Test case for when no files are matched.
                options: {
                    sizes: [ { // Define a single size.
                        width: 320 // Output image width.
                    } ]
                },
                files: [ { // File processing configuration.
                    expand: true, // Enable dynamic expansion of src-dest file mappings.
                    src: [ 'no_files/**/*.{jpg,gif,png}' ], // Source pattern (should match no files).
                    cwd: 'test/assets/', // Current working directory for source files.
                    dest: 'tmp/' // Destination directory for generated images.
                } ]
            },


            file_wildcard_options: { // Test case using file wildcards and multiple sizes.
                options: {
                    sizes: [ // Array of different image sizes to generate.
                        {
                            aspectRatio: false, // Do not maintain aspect ratio.
                            height: 240,        // Specify fixed height.
                            name: 'small',      // Custom name for the size.
                            width: 320          // Specify fixed width.
                        },
                        {
                            aspectRatio: false, // Override aspect ratio setting.
                            height: 480,
                            name: 'medium',
                            width: 640
                        },
                        {
                            aspectRatio: false,
                            height: 768,
                            name: 'large',
                            width: 1024
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'file_wildcard_options/**.{jpg,gif,png}' ], // Wildcard pattern for source files.
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            custom_options: { // Test case with custom quality settings and names.
                options: {
                    sizes: [
                        {
                            width: 110,
                            name: "small",
                            quality: 40 // Custom quality for this size.
                        },
                        {
                            width: 220,
                            quality: 100
                        },
                        {
                            width: 330,
                            name: "large",
                            quality: 80
                        },
                        {
                            width: 660,
                            name: "large",
                            suffix: "_x2",  // Custom suffix for retina graphics.
                            quality: 50
                        },
                        {
                            createNoScaledImage: true, // Option to create an original size copy.
                            width: 1660,
                            name: "largest",
                            quality: 50
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'custom_options/**.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            pixel_sizes: { // Test case for sizes specified in pixels.
                options: {
                    sizes: [
                        {
                            aspectRatio: false,
                            width: '10px' // Width specified with 'px' unit.
                        },
                        {
                            aspectRatio: false,
                            height: '50px',
                            width: '50px'
                        },
                        {
                            aspectRatio: false,
                            height: '500px',
                            width: '200px'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'pixel_sizes/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            pixel_sizes_custom_unit: { // Test case for custom pixel unit names.
                options: {
                    units: { // Custom unit definitions.
                        pixel: 'abc123' // Renames the 'px' unit to 'abc123'.
                    },
                    sizes: [
                        {
                            aspectRatio: false,
                            width: '20px',
                        },
                        {
                            aspectRatio: false,
                            height: '50px',
                            width: '80px',
                        },
                        {
                            aspectRatio: false,
                            height: '500px',
                            width: '500px'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'pixel_sizes_custom_unit/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            percentage_sizes: { // Test case for sizes specified in percentages.
                options: {
                    sizes: [
                        {
                            width: '10%', // Width specified as a percentage of original.
                        },
                        {
                            height: '50%',
                            width: '50%',
                        },
                        {
                            height: '80%',
                            width: '200%'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'percentage_sizes/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            percentage_sizes_custom_unit: { // Test case for custom percentage unit names.
                options: {
                    units: {
                        percentage: 'abc123' // Custom unit for percentage.
                    },
                    sizes: [
                        {
                            width: '10%',
                        },
                        {
                            height: '50%',
                            width: '50%',
                        },
                        {
                            height: '80%',
                            width: '200%'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'percentage_sizes_custom_unit/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            custom_multiply_unit: { // Test case for custom multiply unit.
                options: {
                    units: {
                        multiply: 'abc123' // Custom unit for multiplication factor.
                    },
                    sizes: [
                        {
                            width: '10%',
                        },
                        {
                            height: '50%',
                            width: '50%',
                        },
                        {
                            height: '450px',
                            width: '800px'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'custom_multiply_unit/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            custom_dest_width: { // Test case for custom destination paths based on width.
                options: {
                    sizes: [
                        {
                            aspectRatio: false,
                            upscale: true, // Allow upscaling images.
                            width: 320
                        },
                        {
                            aspectRatio: false,
                            upscale: true,
                            width: 640
                        },
                        {
                            aspectRatio: false,
                            upscale: true,
                            width: 1024
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ '**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/custom_dest_width/',
                    custom_dest: 'tmp/custom_dest_width/{%= width %}/' // Dynamic destination using width.
                } ]
            },


            custom_dest_name: { // Test case for custom destination paths based on size name.
                options: {
                    sizes: [
                        {
                            width: 100,
                            name: "leo" // Custom name for this size.
                        },
                        {
                            width: 200,
                            name: "donnie"
                        },
                        {
                            width: 400,
                            name: "raph"
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ '**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/custom_dest_name/',
                    custom_dest: 'tmp/custom_dest_name/{%= name %}/' // Dynamic destination using name.
                } ]
            },


            custom_dest_path: { // Test case for custom destination paths incorporating original path.
                options: {
                    sizes: [
                        {
                            width: 320
                        },
                        {
                            width: 640
                        },
                        {
                            width: 1024
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ '**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/custom_dest_path/',
                    custom_dest: 'tmp/custom_dest_path/{%= width %}/{%= path %}' // Dynamic destination using width and original path.
                } ]
            },


            rename: { // Test case for the `rename` option.
                options: {
                    sizes: [
                        {
                            width: "100%",
                            name: "unchanged",
                            rename: false // Do not rename this size.
                        },
                        {
                            width: "50%",
                            name: "half"
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'rename/**.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            filters: { // Test case for applying different resizing filters.
                options: {
                    sizes: [
                        {
                            filter: 'Point', // Use 'Point' filter for resizing.
                            upscale: true,
                            width: 320
                        },
                        {
                            filter: 'Point',
                            upscale: true,
                            width: 640
                        },
                        {
                            filter: 'Point',
                            upscale: true,
                            width: 1024
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'filters/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            global_quality: { // Test case for global quality setting.
                options: {
                    tryAnimated: true, // Attempt to process animated images.
                    quality: 80,       // Global quality setting for all sizes.
                    sizes: [
                        {
                            width: 320
                        },
                        {
                            width: 640
                        },
                        {
                            width: 1024
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'global_quality/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            animated: { // Test case for processing animated GIFs.
                options: {
                    tryAnimated: true, // Explicitly enable animated image processing.
                    quality: 80,
                    sizes: [
                        {
                            width: 320
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'animated/**/*.gif' ], // Target only GIF files.
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            new_files_only_prep: { // Preparation step for 'new_files_only' test.
                options: {
                    sizes: [
                        {
                            aspectRatio: false,
                            width: '200px'
                        },
                        {
                            aspectRatio: false,
                            width: '300px'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'new_files_only/gummi-bears.jpg' ], // Process a specific image.
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            },


            new_files_only: { // Test case for only processing new or updated files.
                options: {
                    newFilesOnly: true, // Only process files that are new or have changed since last run.
                    sizes: [
                        {
                            aspectRatio: false,
                            width: '100px'
                        },
                        {
                            aspectRatio: false,
                            width: '200px'
                        },
                        {
                            aspectRatio: false,
                            width: '300px'
                        }
                    ]
                },
                files: [ {
                    expand: true,
                    src: [ 'new_files_only/**/*.{jpg,gif,png}' ],
                    cwd: 'test/assets/',
                    dest: 'tmp/'
                } ]
            }

        }, // End of responsive_images task configuration.


        // === Unit Tests Configuration ===
        nodeunit: { // Nodeunit task configuration for running unit tests.
            tests: [ 'test/**/*_test.js' ] // Pattern to find all test files.
        }

    } ); // End of grunt.initConfig.


    // === Load Grunt Tasks ===
    // Actually load this plugin's task(s) from the 'tasks' directory.
    grunt.loadTasks( 'tasks' );


    // These plugins provide necessary tasks, loaded from npm.
    // They are external Grunt plugins used for development and testing.
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );     // Plugin for JSHint.
    grunt.loadNpmTasks( 'grunt-contrib-clean' );      // Plugin for cleaning files.
    grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );   // Plugin for Nodeunit testing framework.


    // === Register Custom Grunt Tasks ===

    // The 'test' task:
    // First, clean the temporary directory.
    // Then, run the responsive_images task to generate images.
    // Finally, execute the Nodeunit tests to verify the output.
    grunt.registerTask( 'test', [ 'clean', 'responsive_images', 'nodeunit' ] );


    // The 'default' task:
    // This is the task that runs when 'grunt' is executed without any arguments.
    // It first lints all JavaScript files with JSHint.
    // Then, it runs the 'test' task, which includes cleaning, image generation, and unit tests.
    grunt.registerTask( 'default', [ 'jshint', 'test' ] );

}; // End of module.exports function.