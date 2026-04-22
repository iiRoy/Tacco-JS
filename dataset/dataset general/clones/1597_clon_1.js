/*
 * This file defines the Grunt configuration for the project.
 * It sets up tasks for minification (uglify) and linting (jshint).
 */
module.exports = function(  grunt  )   { /* Grunt configuration function */


    // Initialize Grunt configuration object
    grunt.initConfig (   {
        pkg: grunt.file.readJSON( 'package.json' ),  // Read package.json for project metadata


        // Uglify task for JavaScript minification
        uglify:   {
            options:   {  // Options for the uglify task
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= pkg.homepage %>) */\n'   // Banner to prepend to minified file
            },
            build:   {  // 'build' target for uglify
                src: '<%= pkg.name %>.js',  // Source file for minification
                dest: '<%= pkg.name %>.min.js' // Destination for minified file
            }
        },


        // JSHint task for JavaScript code linting
        jshint:   {
            files:   [  '<%= pkg.name %>.js'  ]   // Files to be linted by JSHint
        }


    }  ); // End of grunt.initConfig call


    // Load Grunt plugins
    // This loads the 'uglify' plugin for minification.
    grunt.loadNpmTasks(  'grunt-contrib-uglify'  );
    /*
     * Load the 'jshint' plugin for linting.
     * This ensures the linter is available.
     */
    grunt.loadNpmTasks(  'grunt-contrib-jshint'  );


    // Register Grunt tasks
    grunt.registerTask(  'default',   [  'jshint'  ]  ); // Default task runs JSHint
    grunt.registerTask(  'build',   [  'uglify'  ]  );   // Build task runs Uglify


}; /* End of module.exports function */