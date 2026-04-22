module.exports = function( grunt ) {

  // This line automatically loads all Grunt tasks from package.json.
  // It's a convenient way to avoid manually listing all grunt.loadNpmTasks calls.
  require( 'load-grunt-tasks' )( grunt );

  // Initialize the Grunt configuration object.
  // All task-specific configurations go inside this object.
  grunt.initConfig( {

    // Grunt 'less' task configuration.
    // This task compiles LESS files into CSS.
    less: {

      // 'min' sub-task: Compiles and minifies LESS into a compressed CSS file.
      min: {
        options: {
          compress:    true,    // Enable CSS compression.
          yuicompress: true,    // Use YUI compressor for further optimization.
          optimization: 2      // Set the optimization level for LESS compilation.
        },
        files: {
          // Defines the output file and its corresponding input LESS file(s).
          "dist/autocomplete.min.css": [
            "src/autocomplete.less" // Source LESS file for minified output.
          ]
        }
      },

      // 'nomin' sub-task: Compiles LESS into a standard (non-minified) CSS file.
      nomin: {
        files: {
          // Output file and input LESS file mapping.
          "dist/autocomplete.css": [
            "src/autocomplete.less" // Source LESS file for non-minified output.
          ]
        }
      }
    },

    // Grunt 'uglify' task configuration.
    // This task minifies JavaScript files.
    uglify: {
      options: {
        mangle:         true,      // Enable mangling of variable names to reduce file size.
        sourceMap:      true,      // Generate a source map file for debugging.
        compress:       true,      // Enable JavaScript compression.
        preserveComments: false    // Do not preserve any comments in the minified output.
      },
      dist: {
        files: {
          // Output file for minified JavaScript and its source file(s).
          'dist/autocomplete.min.js': [
            'src/autocomplete.js', // Main JavaScript source file to be uglified.
          ]
        }
      }
    },

    // Grunt 'jshint' task configuration.
    // This task performs static analysis on JavaScript files to detect errors and potential problems.
    jshint: {
      source: [
        'src/autocomplete.js' // Specifies the JavaScript files to be linted.
      ]
    }

  } ); // End of grunt.initConfig() call.


  // Register Grunt tasks.
  // The 'default' task is run when 'grunt' is executed without any specific task name.
  grunt.registerTask( 'default', [ "uglify", "less" ] ); // Runs 'uglify' then 'less'.

}; // End of the module.exports function.