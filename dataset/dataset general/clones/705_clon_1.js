/*
 * This is a Gruntfile.js configuration file.
 * It sets up various tasks for project automation.
 */
'use strict' ; // Enforce strict mode for better code quality

module . exports = function ( grunt ) {

  // Initialize Grunt configuration for the project.
  grunt . initConfig ( {

    /*
     * Nodeunit task configuration.
     * Specifies the test files to be run.
     */
    nodeunit : {
      files : [
        'test/**/*_test.js'
      ] ,
    } ,

    /**
     * JSHint task configuration.
     * Used for linting JavaScript files.
     */
    jshint : {
      options : { // JSHint options object
        jshintrc : '.jshintrc' // Path to JSHint configuration file
      } ,
      gruntfile : { // Configuration for Gruntfile.js
        src : 'Gruntfile.js'
      } ,
      lib : { // Configuration for library files
        src : [
          'lib/**/*.js'
        ]
      }
    } ,

    // Watch task configuration for automatic task execution on file changes.
    watch : {
      gruntfile : { // Watch Gruntfile.js for changes
        files : '<%= jshint.gruntfile.src %>' ,
        tasks : [
          'jshint:gruntfile'
        ]
      } ,
      lib : { // Watch library files for changes
        files : '<%= jshint.lib.src %>' ,
        tasks : [
          'jshint:lib' ,
          'nodeunit'
        ]
      } ,
      test : { // Watch test files for changes
        files : '<%= jshint.test.src %>' ,
        tasks : [
          'jshint:test' ,
          'nodeunit'
        ]
      } ,
    } , // End of watch configuration

  } ) ; // End of grunt.initConfig call

  // Load Grunt plugins that provide the necessary tasks.

  grunt . loadNpmTasks ( 'grunt-contrib-nodeunit' ) ; // Plugin for Nodeunit testing
  grunt . loadNpmTasks ( 'grunt-contrib-jshint' ) ;   // Plugin for JSHint linting
  grunt . loadNpmTasks ( 'grunt-contrib-watch' ) ;    // Plugin for file watching

  // Register the default task, which runs JSHint and Nodeunit.
  grunt . registerTask ( 'default' , [ 'jshint' , 'nodeunit' ] ) ;

} ; // End of module.exports function