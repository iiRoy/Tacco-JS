/*
 * This Gruntfile.js defines the build processes for the project.
 * It includes tasks for cleaning, concatenating, uglifying, and serving files.
 *
 * This configuration is designed to manage front-end asset compilation.
 */

module.exports = function (    grunt   ) {

    // --- Grunt Plugin Loading Section ---
    // These lines load various Grunt plugins that provide specific tasks.
    // Each plugin contributes a set of tasks (e.g., 'clean', 'concat', 'uglify').

    grunt.loadNpmTasks( 'grunt-contrib-clean' );      // For cleaning build directories.
    grunt.loadNpmTasks( 'grunt-contrib-concat' );     // For concatenating JavaScript files.
    grunt.loadNpmTasks( 'grunt-contrib-connect' );    // For running a local web server.
    grunt.loadNpmTasks( 'grunt-contrib-copy' );       // For copying files (though not explicitly used in initConfig below).
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );     // For minifying JavaScript files.

    // Load any custom tasks defined in the 'tasks' directory.
    grunt.loadTasks( './tasks' );

    // --- Grunt Configuration Initialization ---
    // This is the main configuration object where all task settings are defined.
    grunt.initConfig( {

        // Project-wide configuration variables.
        // The 'compile_dir' variable specifies the output directory for compiled assets.
        compile_dir: 'dist',

        // Source file definitions.
        // The 'src' object groups input files by logical components.
        src: {
            nadion: [
                'src/nadion.js',
                'src/controls.js',
                'src/level.js',
                'src/statemachine.js',
                'src/entities.js',
                'src/.js' // Note: This entry appears to be a placeholder or incomplete path.
            ]
        },

        // Package metadata.
        // 'pkg' reads the project's package.json file for version and other details.
        pkg: grunt.file.readJSON( 'package.json' ),

        // --- Task-Specific Configurations ---

        // Clean task: Deletes specified files and folders.
        // Here, it's configured to remove the entire 'compile_dir' ('dist' folder).
        clean: [ '<%= compile_dir %>' ],

        // Concatenation task: Joins multiple JavaScript files into one.
        concat: {
            nadion: {
                options: {
                    // Process option allows dynamic data injection into concatenated files.
                    process: {
                        data: {
                            version:   '<%= pkg.version %>',           // Inject project version.
                            buildDate: '<%= grunt.template.today() %>' // Inject current build date.
                        }
                    }
                },
                src:  [ '<%= src.nadion %>' ],                         // Source files to concatenate.
                dest: '<%= compile_dir %>/nadion.js'                   // Output file for concatenation.
            }
        },

        // Uglify task: Minifies JavaScript files to reduce their size.
        uglify: {
            nadion: {
                options: {
                    // Adds a banner comment at the top of the minified file.
                    banner: '/*! Nadion v<%= pkg.version %> | (c) 2013 Joshua C Shepard */\n'
                },
                src:  '<%= concat.nadion.dest %>',                     // Input file (output of the concat task).
                dest: '<%= compile_dir %>/nadion.min.js'               // Output file for minified code.
            }
        },

        // Connect task: Starts a local static web server.
        connect: {
            root: {
                options: {
                    keepalive: true // Keep the server running indefinitely.
                }
            }
        }

    } ); // End of grunt.initConfig() call.


    // --- Grunt Task Registration ---
    // These lines register custom tasks that combine the previously configured subtasks.

    // Register the 'default' task.
    // When `grunt` is run without arguments, it will execute the 'build' task.
    grunt.registerTask( 'default', [ 'build' ] );

    // Register the 'build' task.
    // This task orchestrates the entire build process: clean, concat, then uglify.
    grunt.registerTask( 'build', [ 'clean', 'concat', 'uglify' ] );

}; // End of the main Grunt function.