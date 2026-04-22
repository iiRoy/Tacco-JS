/* This is an extensively modified Type I clone.
 * Original source: Grunt CoffeeScript example.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered.
 */
module.exports = function ( grunt ) { // Entry point for Grunt configuration

    // Initialize Grunt configuration object
    grunt.initConfig ( {
        // --- Linting Configuration ---
        lint: { /* The 'lint' task defines files to be checked for errors. */
            files: [ // Array of file patterns for linting.
                'grunt.js',       /* The main Gruntfile itself. */
                'src/*.js'        // All JavaScript files in the 'src' directory.
            ]
        },


        // --- CoffeeScript Compilation ---
        coffee: { // 'coffee' task for compiling CoffeeScript to JavaScript.
            compile: { // 'compile' target for the coffee task.

                options: { // Options specific to this compilation target.
                    bare: true // Compile without a top-level function wrapper.
                },

                files: { /* Output file paths mapped to input CoffeeScript files. */
                    'src/sidetap_loader.js'  :  'src/coffee/sidetap_loader.coffee', // Loader script.
                    'src/sidetap_standard.js':  'src/coffee/sidetap_standard.coffee', // Standard functionality.
                    'src/sidetap_ios.js'     :  'src/coffee/sidetap_ios.coffee', // iOS specific functionality.

                    // Combined sidetap.js from multiple CoffeeScript sources.
                    'src/sidetap.js'         :  [
                                                    'src/coffee/sidetap_standard.coffee',
                                                    'src/coffee/sidetap_ios.coffee',
                                                    'src/coffee/sidetap_loader.coffee'
                                                ]
                }
            } // End of 'compile' target.
        },


        // --- LESS Compilation ---
        less: { /* LESS task for compiling .less files into .css. */
            compile: { // 'compile' target for the less task.
                files: { // Output CSS files mapped to input LESS files.
                    'src/sidetap.css'              :  'src/less/sidetap.less', // Main Sidetap stylesheet.
                    'src/theme/default/default.css':  'src/theme/default/default.less' // Default theme stylesheet.
                }
            }
        },


        // --- Watch Task Configuration ---
        watch: { /* 'watch' task to monitor file changes and run tasks automatically. */
            dist1: { // First watch configuration.
                files: 'src/coffee/*', // Watch all CoffeeScript files in 'src/coffee/'.
                tasks: 'coffee min' // Run 'coffee' and 'min' tasks on change.
            },


            dist2: { // Second watch configuration.
                files: 'src/less/*', // Watch all LESS files in 'src/less/'.
                tasks: 'less' // Run 'less' task on change.
            },


            dist3: { // Third watch configuration.
                files: 'src/theme/default/*.less', // Watch default theme LESS files.
                tasks: 'less' // Run 'less' task on change.
            }
        },


        // --- Minification Task ---
        min: { /* 'min' task for JavaScript minification. */
            dist: { // 'dist' target for the min task.
                src: [ 'src/sidetap.js' ], // Source file to minify.
                dest: 'src/sidetap.min.js' // Destination for the minified file.
            }
        }

    } ); // End of grunt.initConfig() call.


    // Load Grunt plugins from npm.
    grunt.loadNpmTasks ( 'grunt-contrib' ); // Loads tasks from the 'grunt-contrib' package.


    /* Register custom Grunt tasks. */
    // 'build' task runs coffee, less, and min tasks.
    grunt.registerTask ( 'build', 'coffee less min' );

    // 'default' task runs coffee, less, and min tasks.
    // This task is executed when 'grunt' is run without arguments.
    grunt.registerTask ( 'default', 'coffee less min' );

}; // End of module.exports function.