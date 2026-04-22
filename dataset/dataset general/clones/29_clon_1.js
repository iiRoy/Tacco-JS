/*
 * This Gruntfile.js configures various build tasks for the project.
 * It's structured to manage JavaScript minification and file copying operations.
 * This particular version is a Type I clone, heavily modified with whitespace and comments.
 */
module.exports =  function  (  grunt  )   {

    // Initialize the Grunt configuration object
    grunt.initConfig (   {

        // Read the project's package.json file for metadata
        pkg :  grunt.file.readJSON (  'package.json'  )  ,

        // Configuration for the 'uglify' task
        // This task is used to minify JavaScript files
        uglify :  {
            // Define a sub-task named 'sosvjs'
            sosvjs   :   {
                files   :   {
                    // Specify the destination for the minified file
                    // And the source files to be uglified (minified)
                    'src/js/sosv.min.js'  :  [ 'src/js/howler.js'  ,  'src/js/sosv.js' ]
                }
            }
        }  , // End of uglify task definition

        // Configuration for the 'copy' task
        // This task is used to copy files from one location to another
        copy :   {
            // Define a sub-task named 'build'
            build   :   {
                files   :   {
                    // Copy the already minified 'sosv.min.js'
                    // from 'src/js' to the 'build' directory
                    'build/sosv.min.js'  :  [ 'src/js/sosv.min.js' ]
                }
            }
        }  , // End of copy task definition

    }  )  ; // End of grunt.initConfig call

    // Load the 'grunt-contrib-uglify' plugin
    // This plugin provides the 'uglify' task
    grunt.loadNpmTasks (  'grunt-contrib-uglify'  )  ;

    // Load the 'grunt-contrib-copy' plugin
    // This plugin provides the 'copy' task
    grunt.loadNpmTasks (  'grunt-contrib-copy'  )  ;

    // Register a custom task named 'build'
    // This task is described as a 'General build task'
    // It runs the 'uglify:sosvjs' and 'copy:build' tasks in sequence
    grunt.registerTask (  'build'  ,    'General build task'  ,  [ 'uglify:sosvjs'  ,  'copy:build' ]  )  ;
}  ; // End of module.exports function definition