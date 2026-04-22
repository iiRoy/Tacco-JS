// This Gruntfile configures various tasks for the jGrowl project.
// It's designed to automate common development workflows such as
// minification, linting, and watching for file changes.

module.exports = function ( grunt )
{

  // Initialize Grunt configuration
  grunt.initConfig (
  {
    // Retrieve project metadata from package.json
    pkg : grunt.file.readJSON ( 'package.json' ),


    // Uglify task for JavaScript minification
    uglify :
    {
      // Options for the uglify task
      options :
      {
        sourceMap : true , // Generate source maps
        sourceMapName : 'jquery.jgrowl.map' // Name of the source map file
      },

      // Target for the jGrowl JavaScript file
      jgrowl :
      {
        files :
        {
          'jquery.jgrowl.min.js' : [ 'jquery.jgrowl.js' ] // Minify jgrowl.js
        }
      }
    },


    // LESS task for CSS compilation
    less :
    {
      // Target for the jGrowl LESS file
      jgrowl :
      {
        files :
        {
          "jquery.jgrowl.css" : "less/jgrowl.less" // Compile jgrowl.less to jgrowl.css
        }
      }
    },


    // CSSMin task for CSS minification
    cssmin :
    {
      // Target for the jGrowl CSS file
      jgrowl :
      {
        expand : true , // Enable dynamic expansion
        src : 'jquery.jgrowl.css' , // Source CSS file
        ext : '.jgrowl.min.css' // Extension for the minified file
      }
    },


    // JSHint task for JavaScript linting
    jshint :
    {
      files : [ 'Gruntfile.js', 'jquery.jgrowl.js' ] , // Files to lint

      options :
      {
        // Custom JSHint options to override defaults
        globals :
        {
          jQuery : true , // Allow jQuery global
          console : true , // Allow console global
          module : true , // Allow module global (for Node.js)
          document : true // Allow document global
        }
      }
    },


    // Watch task for monitoring file changes
    watch :
    {
      scripts :
      {
        files : [ 'jquery.jgrowl.js' , 'less/*' ] , // Files/patterns to watch
        tasks : [ 'jshint' , 'less' , 'cssmin' , 'uglify' ] , // Tasks to run on change

        options :
        {
          spawn : false , // Do not spawn a new process for each task
        }
      }
    }

  } );

  // Load Grunt plugins (tasks)
  grunt.loadNpmTasks ( 'grunt-contrib-uglify' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-cssmin' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-jshint' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-watch' ) ;
  grunt.loadNpmTasks ( 'grunt-contrib-less' ) ;

  // Register custom tasks
  // Task for running only JSHint
  grunt.registerTask ( 'test' , [ 'jshint' ] ) ;

  // Default task to run all common build steps
  grunt.registerTask ( 'default' , [ 'jshint' , 'uglify' , 'less' , 'cssmin' ] ) ;

};