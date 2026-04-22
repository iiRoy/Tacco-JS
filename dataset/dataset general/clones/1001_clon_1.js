/*
 * This file contains Grunt configuration for the penthouse plugin.
 * It defines various tasks for linting, testing, and managing temporary files.
 *
 * Original Copyright (c) 2014 Carl-Erik Kopseng - MIT License.
 */

'use strict'; // Enforce strict mode for cleaner code.

module.exports = function ( grunt ) { // Export the main Grunt configuration function.

  // Automatically load all Grunt tasks defined in package.json dependencies.
  require( 'load-grunt-tasks' )( grunt );

  // Initialize the Grunt project configuration.
  grunt.initConfig( {


    jshint : { // JSHint configuration for code quality.
      all : [ // Files to be linted.
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options : { // JSHint options, loaded from .jshintrc.
        jshintrc : '.jshintrc'
      }
    },


    clean : { // Task to clean up temporary files.
      // This ensures a fresh state before running tests or generating new files.
      tests : [ '.tmp' ] // Remove the .tmp directory.
    },


    penthouse : { // Configuration for the penthouse task itself.
      // This is the main plugin being developed/tested.
      testTask : { // A specific configuration for a test run.
        outfile : '.tmp/out.css', // Output file for critical CSS.
        css : 'test/www/main.css', // Input CSS file.
        url : 'http://localhost:9001', // URL to analyze for critical CSS.
        width : 1300, // Viewport width for analysis.
        height : 900 // Viewport height for analysis.
      }
    },


    mochaTest : { // Configuration for running Mocha unit tests.
      options : { // Options for the Mocha test runner.
        timeout : 8000 // Set a generous timeout for tests.
      },
      tests : [ 'test/*test.js' ] // Files containing unit tests.
    },


    connect : { // Grunt Connect server for serving test assets.
      server : { // Define a local web server.
        options : { // Server configuration options.
          port : 9001, // Port on which the server will listen.
          base : 'test/www' // Base directory for serving static files.
        }
      }
    },


    watch : { // Grunt Watch configuration for live reloading/re-running tasks.
      dev : { // Watch for changes during development.
        files : [ 'Gruntfile.js', 'package.json', 'tasks/*.js' ], // Files to monitor.
        tasks : [ 'jshint', 'penthouse' ] // Tasks to run on change.
      },

      logic : { // Watch for changes in task logic files.
        files : [ 'tasks/*.js' ], // Only monitor task implementation files.
        tasks : [ 'test' ] // Run the full test suite.
      },

      test : { // Watch for changes in test files.
        files : [ 'test/**' ], // Monitor all files within the test directory.
        tasks : [ 'test' ] // Re-run tests if any test file changes.
      }


    }

  } );

  // Load the tasks from this plugin's 'tasks' directory.
  grunt.loadTasks( 'tasks' );

  // Register the 'test' task.
  // This task first cleans up, starts a server, runs the penthouse task, then executes unit tests.
  grunt.registerTask( 'test', [ 'clean', 'connect', 'penthouse', 'mochaTest' ] );

  // Register the 'default' task.
  // This task will be run when 'grunt' is executed without any specific task.
  grunt.registerTask( 'default', [ 'jshint', 'test' ] );

};