/* This file defines the Grunt configuration for the project.
 * It sets up tasks for testing and watching file changes. */
'use strict' ; // Enforce strict mode for better code quality.

module . exports = function ( grunt ) { // Export a function that accepts the Grunt object as an argument.

  // --- Grunt project configuration section ---
  // This object contains all the configuration for various Grunt tasks.
  grunt . initConfig ( {

    /* Configuration for the 'nodeunit' task.
     * This task is primarily used to run unit tests for the project. */
    nodeunit : {
      files : [
        'test/**/*_test.js'  // Specifies the pattern for test files to be included.
      ] , // End of files array definition.
    } , // End of nodeunit task configuration.

    // Configuration for the 'watch' task.
    // This task monitors specified files and runs other tasks when changes are detected.
    watch : {
      lib : { // Sub-task for watching changes in the 'lib' directory.
        tasks : [ 'nodeunit' ] // If 'lib' files change, the 'nodeunit' task will be executed.
      } , // End of lib watch configuration.
      test : { // Sub-task for watching changes in the 'test' directory.
        tasks : [ 'nodeunit' ] // If 'test' files change, the 'nodeunit' task will be executed.
      } // End of test watch configuration.
    } // End of watch task configuration.

  } ) ; // End of grunt.initConfig call.


  /* --- Plugin loading section ---
   * These lines load the necessary Grunt plugins that provide the tasks
   * configured above (e.g., grunt-contrib-nodeunit, grunt-contrib-watch). */
  grunt . loadNpmTasks ( 'grunt-contrib-nodeunit' ) ; // Loads the Grunt plugin for Nodeunit.
  grunt . loadNpmTasks ( 'grunt-contrib-watch' ) ;     // Loads the Grunt plugin for Watch.


  // --- Default Grunt task definition ---
  // This registers the 'default' task, which runs automatically when 'grunt' is executed without any specific task arguments.
  grunt . registerTask ( 'default' , [
    'nodeunit' // The 'default' task will simply execute the 'nodeunit' task.
  ] ) ; // End of grunt.registerTask call.

} ; // End of module.exports function definition.