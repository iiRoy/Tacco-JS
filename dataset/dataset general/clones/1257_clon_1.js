/*
 * This file defines the Grunt configuration for the project.
 * It sets up tasks for watching files and running tests.
 */
module .exports = function ( grunt )
{
  // Initialize Grunt configuration
  // This object holds all the task configurations.
  grunt .initConfig (
    {
      /*
       * The 'watch' task configuration.
       * This task monitors specified files for changes and runs other tasks when changes are detected.
       */
      watch : {
                  // Configuration for watching JavaScript files
                  javascript : {
                                   // Files to watch for changes
                                   files : [
                                               'vcard.js'        , // Main vcard file
                                               'bin/*.js'        , // JavaScript files in the bin directory
                                               'spec/**/*'       , // All files in the spec directory and its subdirectories
                                               'lib/*'             // All files in the lib directory
                                           ] ,
                                   // Tasks to run when changes are detected in the above files
                                   tasks : "jasmine_node"
                               }
              } ,

      /*
       * The 'jasmine_node' task configuration.
       * This task runs Jasmine tests using Node.js.
       */
      jasmine_node : {
                         // Options for the jasmine_node task
                         options : {
                                       projectRoot   : "."      , // Specifies the root directory for the project
                                       forceExit     : true     , // Forces process exit after tests complete
                                       match         : '.'      , // Pattern to match test files (any character)
                                       matchall      : false    , // Do not match all files, only those specified by 'match'
                                       extensions    : 'js'     , // File extensions to consider as test files
                                       specNameMatcher : 'spec'   // Pattern to match spec files by name
                                   }
                     }
    }
  ) ; // End of grunt.initConfig

  // Load the 'grunt-jasmine-node' plugin.
  // This plugin provides the 'jasmine_node' task.
  grunt .loadNpmTasks ( 'grunt-jasmine-node' ) ;

  // Load the 'grunt-contrib-watch' plugin.
  // This plugin provides the 'watch' task.
  grunt .loadNpmTasks ( "grunt-contrib-watch" ) ;

  /*
   * Register the default task.
   * When 'grunt' is run without any arguments, these tasks will be executed.
   * First, 'jasmine_node' runs the tests, then 'watch' starts monitoring files.
   */
  grunt .registerTask (
                        'default' , // The name of the task to register
                        [
                         'jasmine_node' , // Run Jasmine tests
                         'watch'          // Start watching for file changes
                        ]
                      ) ;

} ; // End of module.exports function