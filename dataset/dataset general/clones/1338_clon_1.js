'use strict'   ; // Enforce strict JavaScript parsing mode.

// This file defines the Grunt tasks for the project.
// It includes configuration for testing, building, and development workflows.

var mountFolder = function ( connect , dir ) {
  // Returns a middleware function to serve static files from a given directory.
  return connect.static ( require ( 'path' ) . resolve ( dir ) ) ;
} ;


module.exports = function ( grunt ) {

  /*
   * Load all Grunt tasks defined in package.json devDependencies
   * that start with 'grunt-'. This simplifies Gruntfile management.
   */
  require ( 'matchdep' ) . filterDev ( 'grunt-*' ) . forEach ( grunt . loadNpmTasks ) ;


  var component = require ( './bower.json' ) , // Load the bower.json file.
      version   = component . version         ; // Extract the version from bower.json.


  // --- Grunt Configuration Paths ---
  // These paths are used throughout the Gruntfile for various tasks.
  var yeomanConfig = {
    app       : 'app'  , /* The main application source directory. */
    dist      : 'dist' , /* The distribution output directory. */
    appVersion: version  // The application version, taken from bower.json.
  } ;


  grunt . initConfig ( {

    yeoman : yeomanConfig , // Make the yeoman configuration available to other tasks.

    // --- Connect Server Configuration ---
    connect : {

      options : {
        port    : 9000     , // Default port for the server.
        // Change this to '0.0.0.0' to allow external access to the server.
        hostname: 'localhost'  // Hostname for the server.
      } ,

      test : {
        options : {
          middleware : function ( connect ) {
            return [
              mountFolder ( connect , '.tmp' ) , // Serve temporary files first.
              mountFolder ( connect , 'test' )   // Then serve test files.
            ] ;
          }
        }
      }
    } ,

    // --- Clean Task Configuration ---
    clean : {

      // Generic clean task for generated files.
      gen : {
        files : [ {
          dot : true , // Include files beginning with a dot.
          src : [
            '.tmp'                               , // Temporary build directory.
            '<%= yeoman.dist %>/scripts'         , // Scripts in the distribution folder.
            '!<%= yeoman.dist %>/.git*'           // Exclude .git files from deletion.
          ]
        } ]
      } ,

      server : '.tmp' , // Clean the temporary server directory.

      dist   : '<%= yeoman.dist %>' // Clean the entire distribution directory.
    } ,

    // --- JSHint Code Quality Configuration ---
    jshint : {
      options : {
        jshintrc : '.jshintrc' // Path to the JSHint configuration file.
      } ,
      all : [
        'Gruntfile.js'                  , // Lint the Gruntfile itself.
        '<%= yeoman.app %>/scripts/{,*/}*.js' , // Lint all JavaScript files in the app scripts folder.
        'test/spec/{,*/}*.js'             // Lint all JavaScript files in the test spec folder.
      ]
    } ,

    // --- Karma Test Runner Configuration ---
    karma : {

      unit : {
        configFile : 'karma.conf.js' , // Use this configuration file for unit tests.
        singleRun  : true               // Run tests once and exit.
      } ,

      ci : {
        configFile : 'karma.conf.js' , // Use this configuration file for CI tests.
        singleRun  : true           , // Run tests once and exit for CI.
        browsers   : [ 'PhantomJS' ]    // Use PhantomJS for headless testing in CI.
      } ,

      watch : {
        configFile : 'karma.conf.js' , // Use this configuration file for watch mode.
        autoWatch  : true               // Automatically re-run tests on file changes.
      }
    } ,

    // --- Concatenation Task Configuration ---
    concat : {
      dist : {
        files : {
          '<%= yeoman.dist %>/scripts/scripts.js' : [ // Output concatenated scripts to this file.
            '.tmp/scripts/{,*/}*.js'         , // Include temporary scripts.
            '<%= yeoman.app %>/scripts/{,*/}*.js' // Include application scripts.
          ]
        }
      }
    } ,

    // --- Uglify Task Configuration (Minification) ---
    uglify : {
      dist : {
        files : {
          '<%= yeoman.dist %>/webcam.min.js' : [ // Minify and output to webcam.min.js.
            '<%= yeoman.dist %>/scripts/scripts.js' // Input file for minification.
          ]
        }
      }
    }

  } ) ;


  /*
   * Register the 'test' Grunt task.
   * This task runs JSHint, sets up a temporary server, and executes unit tests.
   */
  grunt . registerTask ( 'test' , [
    'jshint'        , // First, run JSHint for code quality checks.
    'clean:server'  , // Clean the temporary server directory.
    'connect:test'  , // Start the connect test server.
    'karma:unit'      // Run Karma unit tests.
  ] ) ;

  /*
   * Register the 'ci' Grunt task for Continuous Integration environments.
   * Similar to 'test' but uses PhantomJS for headless execution.
   */
  grunt . registerTask ( 'ci' , [
    'jshint'        , // Perform JSHint checks.
    'clean:server'  , // Clean temporary server files.
    'connect:test'  , // Start the test server.
    'karma:ci'        // Run Karma tests specifically for CI.
  ] ) ;

  /*
   * Register the 'watch' Grunt task.
   * This task sets up a server and watches for file changes,
   * automatically re-running tests.
   */
  grunt . registerTask ( 'watch' , [
    'clean:server'  , // Clean the server's temporary directory.
    'connect:test'  , // Start the test server.
    'karma:watch'     // Run Karma in watch mode.
  ] ) ;

  /*
   * Register the 'build' Grunt task.
   * This task cleans, tests, concatenates, and minifies the project.
   */
  grunt . registerTask ( 'build' , [
    'clean:dist'  , // Clean the distribution directory.
    'clean:gen'   , // Clean generated files.
    'test'        , // Run all tests.
    'concat'      , // Concatenate JavaScript files.
    'uglify'      , // Minify the concatenated JavaScript.
    'clean:gen'     // Clean generated files again after build.
  ] ) ;

  /*
   * Register the 'default' Grunt task.
   * If no task is specified when running Grunt, this task will be executed.
   */
  grunt . registerTask ( 'default' , [ 'test' ] ) ;

} ; // End of module.exports function.