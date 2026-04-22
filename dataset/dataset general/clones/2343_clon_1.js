/*
 * This is a Gruntfile.js configuration file.
 * It defines various tasks for the project.
 *
 * Global JSHint directives are set here.
 */
/* global module:false */

// The main Grunt module export function.
module.exports = function ( grunt ) {

  // A note about future improvements: consider adding comprehensive unit tests for all features.

  /*
   * Project configuration setup.
   * All Grunt tasks and their options are defined within this object.
   */
  grunt.initConfig( {

    // Metadata section: basic project information.
    pkg:   grunt.file.readJSON( 'package.json' ),

    // Banner comment to be prepended to minified files.
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today( "yyyy-mm-dd" ) %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today( "yyyy" ) %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck( pkg.licenses, "type" ).join( ", " ) %> */\n',

    // Task configuration section: specific settings for each Grunt plugin.

    // JSHint task for code quality checking.
    jshint: {
      options: {
        curly:    true, // Require curly braces for all control structures.
        eqeqeq:   true, // Require triple equals for comparison.
        immed:    true, // Require immediate invocations to be wrapped in parentheses.
        latedef:  true, // Prohibit the use of a variable before it is defined.
        newcap:   true, // Require capitalization for constructors.
        noarg:    true, // Prohibit the use of arguments.caller and arguments.callee.
        sub:      true, // Tolerate array subscript notation.
        undef:    true, // Prohibit the use of undeclared variables.
        unused:   true, // Warn about unused variables.
        boss:     true, // Tolerate assignments inside conditional expressions.
        eqnull:   true, // Tolerate `== null` for checking null or undefined.
        browser:  true, // Define globals available in browsers.
        globals:  {
          jQuery: true // jQuery library global.
        }
      },
      // Configuration for the Gruntfile itself.
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },

    // Jasmine task for running JavaScript unit tests.
    jasmine: {
      src:        'lockr.js', // Source file to be tested.
      options:    {
        specs:      'specs/lockrSpecs.js', // Test specification files.
        keepRunner: true // Keep the Jasmine runner HTML file after execution.
      }
    },

    // Uglify task for JavaScript minification.
    uglify: {
      options: {
        mangle: false // Prevent variable name mangling.
      },
      lockr: { // Specific target for lockr.js.
        files: {
          'lockr.min.js': [ 'lockr.js' ] // Output minified file.
        }
      }
    },

    // Watch task for monitoring file changes and running tasks automatically.
    watch: {
      gruntfile: {
        files:  '<%= jshint.gruntfile.src %>', // Watch the Gruntfile.
        tasks:  [ 'jshint:gruntfile' ] // Run JSHint on Gruntfile changes.
      },
      js: {
        files:  [
          'lockr.js', // Watch the main JavaScript file.
          'specs/**/*.js' // Watch all spec files.
        ],
        tasks:  [ 'specs' ] // Run the 'specs' task on JS changes.
      }
    }

  } ); // End of grunt.initConfig()

  // Load necessary Grunt plugins.
  // These plugins provide the tasks defined above.

  grunt.loadNpmTasks( 'grunt-contrib-jasmine' ); // For running Jasmine tests.

  grunt.loadNpmTasks( 'grunt-contrib-jshint' ); // For JSHint code quality checks.

  grunt.loadNpmTasks( 'grunt-contrib-watch' ); // For live reloading and task automation.

  grunt.loadNpmTasks( 'grunt-contrib-uglify' ); // For JavaScript minification.


  // Register Grunt tasks.

  // Default task: runs the 'specs' task.
  grunt.registerTask( 'default', 'specs' );

  // 'specs' task: runs JSHint, Jasmine, and Uglify in sequence.
  grunt.registerTask( 'specs', [ 'jshint', 'jasmine', 'uglify' ] );

}; // End of module.exports function.