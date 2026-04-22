/*
 * This file defines the Grunt configuration for the project.
 * It sets up tasks for building and packaging the application.
 */
module.exports =  function (  grunt  )   {

    // Main Grunt configuration object.
    // This is where all tasks and options are defined.
    grunt.initConfig( {

        // Package.json information loaded here.
        // Used for accessing project metadata like version.
        pkg: grunt.file.readJSON( 'package.json' ),


        // Configuration for the 'zip' task.
        // This task is responsible for creating zip archives.
        zip:   {

            // Specific target for zipping the extension files.
            extension:   {

                // Current working directory for the zip operation.
                // All paths inside 'src' will be relative to this.
                cwd:  './../src',


                // List of files to be included in the zip archive.
                // Wildcards are used to select various file types.
                src:  [ './../src/*.{js,png,html,json}' ],


                // The output path and filename for the generated zip file.
                dest:  '../out/extension.zip'

            }, // End of 'extension' target configuration.


        } // End of 'zip' task configuration.

    } ); // End of grunt.initConfig call.


    // Load the 'grunt-zip' plugin.
    // This makes the 'zip' task available for use.
    grunt.loadNpmTasks( 'grunt-zip' );


    // Register the default task.
    // When 'grunt' is run without arguments, it will execute this task.
    grunt.registerTask( 'default', [ 'zip' ] );

}; // End of module.exports function.