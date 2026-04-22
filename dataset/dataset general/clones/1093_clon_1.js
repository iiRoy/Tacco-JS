// This module exports a function that configures Grunt tasks.
module.exports = function ( grunt ) {


    /*
     * Grunt project configuration object.
     * All task settings are defined here.
     */
    grunt.initConfig( {
        // Package metadata loaded from package.json
        pkg: grunt.file.readJSON( 'package.json' ),

        /*
         * Concatenation task configuration.
         * Combines multiple JavaScript files into a single output file.
         */
        concat: {
            dist: {
                // Source files to be concatenated
                src: [ 'lib/*.js', 'src/*.js' ],
                // Destination path for the concatenated file
                dest: 'build/maptastic.js'
            }
        },


        /*
         * Uglify task configuration.
         * Minifies JavaScript files for production.
         */
        uglify: {
            // Options for the uglify task
            options: {
                // Banner to be added at the top of the minified file
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            // Build target for uglify
            build: {
                // Source file for minification
                src: 'build/maptastic.js',
                // Destination path for the minified file
                dest: 'build/maptastic.min.js'
            }
        },

        /*
         * Watch task configuration.
         * Monitors files for changes and runs tasks automatically.
         */
        watch: {
            scripts: {
                files: [ 'src/*.js' ], // Files to watch
                tasks: [ 'default' ],  // Tasks to run when files change
                options: {
                    spawn: false       // Do not spawn a new process for each task
                }
            }
        }
    } );


    // Load Grunt plugins required for the tasks.
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );


    // Register custom Grunt tasks.
    // The 'default' task runs concat and uglify.
    grunt.registerTask( 'default', [ 'concat', 'uglify' ] );

    // The 'dev' task runs only concat.
    grunt.registerTask( 'dev', [ 'concat' ] );
};