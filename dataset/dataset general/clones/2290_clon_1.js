/* This file defines the Grunt configuration for the pjax-standalone project.
 * It handles tasks like linting, minification, and file watching.
 *
 * Grunt is a JavaScript Task Runner.
 * For more information: https://gruntjs.com/
 */
module.exports = function ( grunt ) {

    // Load Grunt plugins required for this project.
    // These are typically defined in package.json devDependencies.

    grunt.loadNpmTasks( 'grunt-contrib-uglify' );


    grunt.loadNpmTasks( 'grunt-contrib-watch' );


    grunt.loadNpmTasks( 'grunt-contrib-jshint' );


    // Initialize Grunt configuration.
    // All project configuration goes inside this object.
    grunt.initConfig( {

        // Read the package.json file for project metadata.
        pkg: grunt.file.readJSON( 'package.json' ),


        // JSHint task configuration.
        // JSHint is a community-driven tool to detect errors and potential problems in JavaScript code.
        jshint: {
            // Specific configuration for ignoring a warning.
            ignore_warning: {
                // Source files to be linted.
                src: [ 'pjax-standalone.js' ],
                // JSHint options for this target.
                options: {
                    // Suppress warning W061: eval is needed by the library's functionality.
                    '-W061': true
                }
            }
        },


        // Uglify task configuration.
        // UglifyJS is a JavaScript compressor/minifier.
        uglify: {
            // Options applicable to all uglify targets.
            options: {
                // Preserve specific comments (e.g., license comments).
                preserveComments: 'some'
            },
            // Build target for minification.
            build: {
                // Source file to be minified.
                src: 'pjax-standalone.js',
                // Destination file for the minified output.
                dest: 'pjax-standalone.min.js'
            }
        },


        // Watch task configuration.
        // The watch task runs predefined tasks whenever watched file patterns are added, changed or deleted.
        watch: {
            // Files to watch for changes.
            files: [ 'pjax-standalone.js' ],
            // Tasks to run when changes are detected.
            tasks: [ 'uglify' ]
        }

    } ); // End of grunt.initConfig()


    // Register the default Grunt task.
    // This task will be run when you type 'grunt' in the terminal without any arguments.
    grunt.registerTask( 'default', [ 'jshint', 'uglify' ] );

}; // End of module.exports function