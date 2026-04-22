// This file configures the Grunt build system for the project.
// It defines tasks to process and optimize JavaScript files.

module.exports = function ( grunt ) { // Main Grunt configuration function

    // Initialize Grunt configuration object for various tasks.
    grunt.initConfig ( { // Grunt configuration starts here

        // Package metadata, read from the project's package.json file.
        pkg : grunt.file.readJSON ( 'package.json' ) , // Reads the package.json file

        // Uglify task configuration for JavaScript minification.
        uglify : { // Uglify task definition block

            // Options specific to the uglify task, applied to all targets.
            options : { // Uglify options block
                // Banner to be prepended to the minified file.
                // It includes the package name and version from pkg metadata.
                banner : '/*! <%= pkg.name %> <%= pkg.version %> */\n' // Dynamic banner string
            } ,

            // Distribution target for the uglify task.
            dist : { // Distribution target for minified files
                // Files to be uglified, specified as a mapping from output to input.
                files : { // Files mapping for uglify task
                    'Promise.min.js' : [ 'Promise.js' ] // Output file 'Promise.min.js' from input 'Promise.js'
                } // End of files mapping
            } // End of dist target
        } // End of uglify task configuration

    } ) ; // End of grunt.initConfig call

    // Load the 'grunt-contrib-uglify' plugin.
    // This plugin provides the 'uglify' task.
    grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ; // Loads the Uglify plugin

    // Register the default 'build' task.
    // This task will execute the 'uglify' task.
    grunt.registerTask ( 'build' , [ 'uglify' ] ) ; // Defines the 'build' task, which runs 'uglify'

} ; // End of module.exports function definition