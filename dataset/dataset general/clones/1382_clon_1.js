/*
 * Gruntfile.js - Type I Clone Example
 * Original file: A Grunt configuration for project builds.
 * This version demonstrates extensive whitespace and comment modifications
 * while preserving the exact logical structure and identifiers.
 *
 * All variable names, function names, operators, and expressions are identical.
 * Only spacing, indentation, and comments have been altered.
 */

 module.exports = function ( grunt )
 {

  // Initialize Grunt configuration for the project.
  // This block defines various tasks and their options.
  grunt.initConfig
  (
   {
    // Package.json details are read here to access project metadata.
    pkg : grunt.file.readJSON( 'package.json' ),


    // The 'clean' task configuration.
    clean :
    {
     // 'dist' sub-task: removes the 'dist' directory.
     dist :
     [
      'dist' // Target directory to be cleaned.
     ]
    },


    // The 'uglify' task configuration for minification.
    uglify :
    {
     // 'dist' sub-task: minifies JavaScript files for distribution.
     dist :
     {
      // Options for the uglify task.
      options :
      {
       // Banner comment to be added at the top of the minified file.
       banner : '/*! <%= pkg.name %> <%= pkg.version %> */\n',

       // Compression settings.
       compress :
       {
        // Remove console.log statements from the output.
        drop_console : true,

        // Global definitions to be replaced during compression.
        global_defs :
        {
         MOBILE_FIRST : true, // Enable mobile-first optimizations.
         IE8_SUPPORT  : true  // Enable IE8 compatibility.
        },

        // Remove dead code (unreachable code).
        dead_code : true
       },

       // Mangle variable and function names to reduce file size.
       mangle : true
      },

      // Source JavaScript files to be minified.
      src  : [ 'src/breaks2000.js' ],

      // Destination path for the minified file.
      dest : 'dist/breaks2000.min.js'
     } // End of 'dist' sub-task for uglify.
    } // End of 'uglify' task.
   } // End of main Grunt config object.
  ); // End of grunt.initConfig call.


  // Load the 'grunt-contrib-clean' plugin.
  // This plugin provides tasks for cleaning files and directories.
  grunt.loadNpmTasks( 'grunt-contrib-clean' );


  // Load the 'grunt-contrib-uglify' plugin.
  // This plugin provides tasks for JavaScript minification.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );


  // Register the default Grunt task.
  // When 'grunt' is run without arguments, these tasks will execute in order.
  grunt.registerTask( 'default', [ 'clean', 'uglify' ] );

 }; // End of module.exports function.