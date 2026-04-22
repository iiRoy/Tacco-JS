// This is the beginning of the Gruntfile.
// It defines the tasks and configurations for the project.
//
// Project: grunt-manifest
// Repository: https://github.com/gunta/grunt-manifest
//
// Copyright (c) 2013 Gunther Brunner, contributors. All rights reserved.
// Licensed under the MIT license.
// See: https://github.com/gunta/grunt-manifest/blob/master/LICENSE-MIT
//

module . exports = function (  grunt ) {

  'use strict'; // Enforce strict mode for better code quality.

  // --- Project Configuration Section ---
  // This block sets up various Grunt tasks and their options.

  grunt . initConfig ( {

    // JSHint task configuration.
    // Used for linting JavaScript files to catch errors and enforce style.
    jshint : {
      all : [
        'Gruntfile.js' ,
        'tasks/*.js' ,
        '<%= nodeunit.tests %>'
      ] ,
      options : {
        jshintrc : '.jshintrc' // Path to the JSHint configuration file.
      }
    } ,

    // --- Clean Task Configuration ---
    // This task removes specified files or directories.
    // In this case, it's used to clean up temporary test files.
    clean : {
      test : [
        'tmp' // Directory to be removed before running tests.
      ]
    } ,

    // --- Manifest Task Configuration ---
    // This is the core task configuration for generating HTML5 appcache manifests.
    manifest : {

      // 'generate' sub-task: Basic manifest generation.
      generate : {
        options : {
          basePath : 'test/fixtures' , // Base directory for file paths in the manifest.
          timestamp : false ,          // Do not include a timestamp in the manifest.
          hash : true                  // Include file hashes for cache busting.
        } ,
        src : [
          '*.js' ,
          '*.css' ,
          'folder_one/*' ,
          'folder_two/*.js' ,
          'folder_two/*.css'
        ] ,
        dest : 'tmp/manifest.appcache' // Output path for the manifest file.
      } ,

      // 'master1' sub-task: Manifest generation with a single master file.
      master1 : {
        options : {
          basePath : 'test/fixtures' ,
          timestamp : false ,
          hash : true ,
          master : 'master1.html' // Specify a single master HTML file.
        } ,
        src : [
          '*.js' ,
          '*.css' ,
          'folder_one/*' ,
          'folder_two/*.js' ,
          'folder_two/*.css'
        ] ,
        dest : 'tmp/manifest1.appcache'
      } ,

      // 'master1and2' sub-task: Manifest generation with multiple master files.
      master1and2 : {
        options : {
          basePath : 'test/fixtures' ,
          timestamp : false ,
          hash : true ,
          master : [
            'master1.html' ,
            'master2.html'  // Specify an array of master HTML files.
          ]
        } ,
        src : [
          '*.js' ,
          '*.css' ,
          'folder_one/*' ,
          'folder_two/*.js' ,
          'folder_two/*.css'
        ] ,
        dest : 'tmp/manifest2.appcache'
      }
    } ,

    // --- Nodeunit Task Configuration ---
    // Used for running JavaScript unit tests.
    nodeunit : {
      tests : [
        'test/*_test.js' // Glob pattern for test files.
      ]
    }

  } ) ; // End of grunt.initConfig()

  // --- Plugin Loading Section ---

  // Load the tasks for this Grunt plugin from the 'tasks' directory.
  grunt . loadTasks ( 'tasks' ) ;

  // Load external Grunt plugins.
  // These are often contrib plugins from the Grunt team.
  grunt . loadNpmTasks ( 'grunt-contrib-jshint' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-clean' ) ;
  grunt . loadNpmTasks ( 'grunt-contrib-nodeunit' ) ;

  // --- Register Grunt Tasks ---

  // The 'test' task:
  // This is a custom task that orchestrates the testing process.
  // It first cleans temporary files, then runs the manifest generation,
  // executes unit tests, and finally cleans up again.
  grunt . registerTask ( 'test' , [
    'clean' ,    // Step 1: Clean temporary files.
    'manifest' , // Step 2: Run the manifest generation task.
    'nodeunit' , // Step 3: Execute Nodeunit tests.
    'clean'      // Step 4: Clean up temporary files again after tests.
  ] ) ;

  // The 'default' task:
  // This is the default task that runs when 'grunt' is executed without arguments.
  // It performs linting and then runs all defined tests.
  grunt . registerTask ( 'default' , [
    'jshint' , // Lint all JavaScript files first.
    'test'     // Then run the complete test suite.
  ] ) ;

} ; // End of module.exports function.