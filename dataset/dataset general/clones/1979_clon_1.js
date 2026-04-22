/*
 * This is a Gruntfile.js - a configuration file for Grunt.js.
 * It defines various automated tasks for the project.
 *
 * This file configures tasks such as:
 * - Uglifying (minifying) JavaScript code.
 * - Copying files from source to distribution.
 * - Managing releases.
 * - Watching for file changes to trigger tasks.
 */
module.exports = function (  grunt ) {


    // Initialize Grunt configuration.
    // All task configurations go within this object.
    grunt.initConfig ( {


        // Uglify task: minifies JavaScript files for production.
        uglify : {


            // Options for the uglify task.
            options : {


                // Add a banner comment to the top of the minified file.
                // It includes the project name and current date.
                banner : '/*! janimate <%= grunt.template.today("dd-mm-yyyy") %> */\n'

            } , // End of uglify options


            // 'dist' target for the uglify task.
            dist : {


                // Define the files to be uglified.
                files : {


                    // Output minified file: 'dist/janimate.min.js'
                    // Input source file: 'src/janimate.js'
                    'dist/janimate.min.js' : 'src/janimate.js'

                } // End of files configuration for 'dist'

            } // End of uglify 'dist' target

        } , // End of uglify task configuration


        // Copy task: copies files from one location to another.
        copy : {


            // 'dist' target for the copy task.
            dist : {


                // Source file to copy.
                src : 'src/janimate.js' ,


                // Destination path for the copied file.
                dest : 'dist/janimate.js' ,

            } // End of copy 'dist' target

        } , // End of copy task configuration


        // Release task: helps in automating the release process.
        release : {


            // Options for the release task.
            options : {


                // Specify additional files to be included
                // or considered during the release process.
                additionalFiles : [ 'bower.json' ]

            } // End of release options

        } , // End of release task configuration


        // Watch task: monitors specified files for changes
        // and runs defined tasks when changes are detected.
        watch : {


            // Files to watch for changes.
            files : [ 'src/janimate.js' ] ,


            // Tasks to run when changes are detected in the watched files.
            tasks : [ 'uglify:dist' , 'copy:dist' ]

        } // End of watch task configuration


    } ) ; // End of grunt.initConfig call


    // Load Grunt plugins that provide the tasks.
    // These plugins are typically installed via npm.
    grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ;


    grunt.loadNpmTasks ( 'grunt-contrib-copy' ) ;


    grunt.loadNpmTasks ( 'grunt-release' ) ;


    grunt.loadNpmTasks ( 'grunt-contrib-watch' ) ;


    // Register custom Grunt tasks.
    // These allow running multiple tasks with a single command.

    // Register the 'default' task, which runs the 'watch' task.
    grunt.registerTask ( 'default' , [ 'watch' ] ) ;


    // Register the 'build' task, which runs uglify and copy for distribution.
    grunt.registerTask ( 'build' , [ 'uglify:dist' , 'copy:dist' ] ) ;


} ; // End of module.exports function definition