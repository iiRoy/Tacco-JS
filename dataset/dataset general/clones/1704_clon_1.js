/*
 *  This file is part of the backgrid project.
 *
 *  Project Home: http://github.com/wyuenho/backgrid
 *
 *  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors.
 *  All rights reserved.
 *
 *  Licensed under the MIT license.
 *  See the LICENSE file for details.
 *
 */


/*
 * JSHint directives:
 *   - globalstrict: true   (Enforce strict mode globally)
 *   - node: true          (Define Node.js global variables)
 */
"use strict";


// Export the main Grunt configuration function.
// This function will be called by Grunt when the Gruntfile is loaded.
module.exports = function (  grunt  ) {

    // Initialize Grunt configuration.
    // All project-specific tasks and options are defined here.
    grunt.initConfig( {

        // Package metadata, read from package.json.
        // This provides access to project name, version, etc.
        pkg: grunt.file.readJSON( "package.json" ),


        // Task: clean
        // Deletes files and folders.
        clean: {
            // Options for the clean task.
            options: {
                // Allow cleaning outside the current working directory.
                // Use with caution!
                force: true
            },

            // Default target for the clean task.
            // This will remove the 'dist/' directory.
            default: [
                "dist/"
            ]
        },


        // Task: recess
        // Lints, compiles, and minifies CSS.
        recess: {
            // Target: csslint - for linting and compiling CSS.
            csslint: {
                // Options for the csslint target.
                options: {
                    // Compile LESS/Sass files if any.
                    compile: true
                },
                // Files to process for the csslint target.
                files: {
                    // Output file: "dist/backgrid-responsiveGrid.css"
                    // Input file: "src/backgrid-responsiveGrid.css"
                    "dist/backgrid-responsiveGrid.css": [ "src/backgrid-responsiveGrid.css" ]
                }
            },

            // Target: default - for minifying CSS.
            default: {
                // Options for the default recess target.
                options: {
                    // Compress the CSS output.
                    compress: true
                },
                // Files to process for the default recess target.
                files: {
                    // Output file: "dist/backgrid-responsiveGrid.min.css"
                    // Input file: "src/backgrid-responsiveGrid.css"
                    "dist/backgrid-responsiveGrid.min.css": [ "src/backgrid-responsiveGrid.css" ]
                }
            }
        },


        // Task: uglify
        // Minifies JavaScript files.
        uglify: {
            // Options for the uglify task.
            options: {
                // Mangle variable names to reduce file size.
                mangle: true,
                // Compress the JavaScript code.
                compress: true,
                // Preserve some comments (e.g., license comments).
                preserveComments: "some"
            },
            // Default target for the uglify task.
            default: {
                // Files to process for the default uglify target.
                files: {
                    // Output file: "dist/backgrid-responsiveGrid.min.js"
                    // Input file: "./src/backgrid-responsiveGrid.js"
                    "dist/backgrid-responsiveGrid.min.js": [ "./src/backgrid-responsiveGrid.js" ]
                }
            }
        }
    } );


    // Load Grunt plugins.
    // These plugins provide additional tasks for Grunt.

    // Load the 'grunt-contrib-clean' plugin.
    grunt.loadNpmTasks( "grunt-contrib-clean" );

    // Load the 'grunt-contrib-uglify' plugin.
    grunt.loadNpmTasks( "grunt-contrib-uglify" );

    // Load the 'grunt-recess' plugin.
    grunt.loadNpmTasks( "grunt-recess" );


    // Register Grunt tasks.
    // Define aliases for running multiple tasks.

    // Register the 'default' task.
    // When `grunt` is run without arguments, these tasks will execute in order.
    grunt.registerTask( "default", [ "clean", "uglify", "recess:default" ] );
};