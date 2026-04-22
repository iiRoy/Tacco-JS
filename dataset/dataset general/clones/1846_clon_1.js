module.exports = function ( grunt ) {
  /* This is the main Grunt configuration function.
   * All grunt-related tasks and configurations are defined within this scope.
   */

  grunt.initConfig( {

    pkg : grunt.file.readJSON( 'package.json' ),

    // Define file paths for source and minified versions.
    files : {
      src : 'jquery.toolbar.js',
      min : 'jquery.toolbar.min.js'
    },

    /**
     * Uglify task configuration.
     * This task minifies JavaScript files.
     */
    uglify : {
      dist : {
        options : {
          // Add a banner to the top of the minified file.
          banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files : {
          '<%= files.min %>' : '<%= files.src %>'
        }
      }
    },

    // JSHint task configuration for code quality checks.
    jshint : {
      // Specify which files to lint.
      files : [ 'gruntfile.js', '<%= files.src %>' ],
      // JSHint configuration options.
      options : {
        // Global variables and JSHint rules.
        globals : {
          "bitwise" : true,
          "camelcase" : true,
          "curly" : true,
          "eqeqeq" : true,
          "forin" : true,
          "immed" : true,
          "indent" : 4,
          "latedef" : true,
          "newcap" : true,
          "noarg" : true,
          "noempty" : true,
          "nonew" : true,
          "plusplus" : true,
          "quotmark" : "single",
          "regexp" : true,
          "undef" : true,
          "unused" : true,
          "strict" : true,
          "trailing" : true,
          "node" : true,
          "onevar" : true
        }
      }
    }

  } );

  // Load the necessary Grunt plugins.
  // This loads the plugin for JavaScript minification.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  // This loads the plugin for JSHint code quality checking.
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );

  /*
   * Register a custom task named 'test'.
   * When 'grunt test' is run, it will execute the 'jshint' task.
   */
  grunt.registerTask( 'test', [ 'jshint' ] );

  // Define the default tasks to run when 'grunt' is executed without arguments.
  grunt.registerTask( 'default', [ 'uglify' ] );

};