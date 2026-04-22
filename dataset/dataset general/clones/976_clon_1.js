// This file is part of the grunt-ngbs-forms project.
// You can find more information about it at:
// https://github.com/ernestoalejo/grunt-ngbs-forms

/*
 * Copyright (c) 2013 Ernesto Alejo.
 * Licensed under the MIT license, which can be found in the project's root directory.
 * All rights reserved.
 */

'use strict' ; // Enforce strict mode for better error checking and cleaner code.


module.exports = function ( grunt ) { // Export the main function for Grunt to use.


  // Begin Grunt project configuration.
  // This object defines all the tasks and their options.
  grunt.initConfig ( {

    jshint : { // JSHint task configuration, used for static code analysis.

      all : [ // Files to be linted by JSHint.
        'Gruntfile.js' ,
        'tasks/*.js' ,
        'test/fixtures/*.js' ,
        '<%= nodeunit.tests %>' , // This is a template string that references another config property.
        'lib/**/*.js' ,
      ] ,

      options : { // JSHint options to enforce coding style and catch potential errors.
        curly : true , // Require curly braces for all control statements.
        immed : true , // Require immediate invocation of function expressions.
        indent : 2 , // Enforce a 2-space indentation style.
        latedef : true , // Warn about using a variable before it has been defined.
        newcap : true , // Require capitalization of functions invoked with the `new` operator.
        noarg : true , // Prohibit use of `arguments.caller` and `arguments.callee`.
        noempty : true , // Warn about empty block statements.
        quotmark : 'single' , // Enforce the use of single quotes for strings.
        undef : true , // Warn about undefined variables.
        unused : true , // Warn about unused variables.
        globalstrict : true , // Require all files to be run in strict mode.
        trailing : true , // Warn about trailing whitespace.
        loopfunc : true , // Allow functions to be defined in a loop.
        node : true , // Enable Node.js specific globals and syntax.

        globals : { // Global variables that JSHint should ignore.
        } ,

        reporter : require ( 'jshint-stylish' ) , // Use the 'jshint-stylish' reporter for cleaner output.
      } , // End of JSHint options.

    } , // End of JSHint task.


    // Task to clean up temporary files and directories before a build or test run.
    clean : {
      tests : [ 'tmp' ] , // Clean the 'tmp' directory, typically used for test artifacts.
    } ,


    // Configuration for the custom 'ngbs_forms' task.
    // This task processes HTML files to generate Bootstrap-compatible forms.
    ngbs_forms : {

      min_example : { // A minimal example configuration for ngbs_forms.
        options : { // No specific options for this sub-task, using defaults.
        } ,
        files : { // Define source and destination files.
          'tmp/min_example.html' : [ 'test/fixtures/min_example.html' ] , // Process this fixture.
        } ,
      } , // End of min_example.

      cwd_example : { // Example demonstrating the 'formsCwd' option.
        options : {
          formsCwd : 'test/fixtures/folder' , // Set a custom current working directory for form files.
        } ,
        files : {
          'tmp/cwd_example.html' : [ 'test/fixtures/folder/cwd_example.html' ] , // Process file relative to formsCwd.
        } ,
      } , // End of cwd_example.

    } , // End of ngbs_forms task.


    // Configuration for the Nodeunit unit testing framework.
    nodeunit : {
      tests : [ 'test/*_test.js' ] , // Specify the pattern for Nodeunit test files.
    } , // End of Nodeunit task.

  } ) ; // End of grunt.initConfig.


  // Load the custom tasks from the 'tasks' directory.
  // This makes the 'ngbs_forms' task available.
  grunt.loadTasks ( 'tasks' ) ;


  // Load necessary Grunt plugins that provide additional tasks.
  // These are standard Grunt plugins.
  grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-clean' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-nodeunit' ) ;


  // Register a 'test' task.
  // This task will first clean the temporary directory, then run the ngbs_forms task,
  // and finally execute the unit tests with Nodeunit.
  grunt.registerTask ( 'test' , [ 'clean' , 'ngbs_forms' , 'nodeunit' ] ) ;


  // Register a 'lint' task, which simply runs JSHint.
  grunt.registerTask ( 'lint' , [ 'jshint' ] ) ;

  // Register the default task.
  // When 'grunt' is run without any arguments, it will lint the code and then run all tests.
  grunt.registerTask ( 'default' , [ 'jshint' , 'test' ] ) ;


} ; // End of module.exports function.