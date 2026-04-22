/*
 * This file configures Grunt.js tasks for the project.
 * It defines various build processes like minification, copying, and watching files.
 */
module . exports = function ( grunt )
{
  // Enforce strict mode for better code quality and error handling.
  'use strict';

  // Initialize Grunt configuration object.
  grunt . initConfig ( {
    // Package.json file is read to get project metadata.
    pkg :         grunt . file . readJSON ( 'package.json' ),


    // Uglify task configuration for JavaScript minification.
    uglify :
    {
      // Build target for the main JavaScript file.
      build :
      {
        src  : 'src/gumi.js', // Source file path.
        dest : 'dist/gumi.min.js' // Destination for the minified file.
      },

      // Options for the Uglify task.
      options :
      {
        // Compression options.
        compress :
        {
          hoist_funs : false, // Do not hoist function declarations.
          join_vars  : false, // Do not join consecutive var statements.
          loops      : false, // Do not optimize loops.
          unused     : false  // Do not remove unused variables/functions.
        },

        // Beautification options.
        beautify :
        {
          ascii_only : true // Output only ASCII characters.
        }
      }
    },


    // CSS minification task configuration.
    cssmin :
    {
      minify :
      {
        expand :  true, // Enable dynamic expansion.
        cwd    : 'src/', // Current working directory for src.
        src    : [ '*.css', '!*.min.css' ], // Pattern to match CSS files, excluding already minified ones.
        dest   : 'dist/', // Destination directory for minified CSS.
        ext    : '.min.css' // Extension for minified files.
      }
    },


    // Copy task for moving files around.
    copy :
    {
      main : // Main copy target.
      {
        files : // Array of file objects to copy.
        [
          {
            expand  : true, // Enable dynamic expansion.
            src     : [ 'src/*' ], // Source files from the 'src' directory.
            dest    : 'dist/', // Destination directory.
            flatten : true // Flatten the directory structure.
          },
          {
            expand  : true, // Another dynamic expansion.
            src     : [ 'dist/*.min.*' ], // Minified files from 'dist'.
            dest    : 'example/', // Destination for example usage.
            flatten : true // Flatten the directory structure.
          }
        ]
      }
    },


    // Watch task for monitoring file changes.
    watch :
    {
      scripts : // Watch script files.
      {
        files : [ 'src/*' ], // Files to watch for changes.
        tasks : [ 'default' ], // Tasks to run when files change.
        options :
        {
          spawn : false, // Do not spawn a new process for each task.
        },
      },
    },
  } );

  // Load Grunt plugins required by this configuration.
  grunt . loadNpmTasks ( 'grunt-contrib-watch' );
  grunt . loadNpmTasks ( 'grunt-contrib-cssmin' );
  grunt . loadNpmTasks ( 'grunt-contrib-uglify' );
  grunt . loadNpmTasks ( 'grunt-contrib-copy' );

  // Register the 'default' task, which runs a sequence of other tasks.
  grunt . registerTask ( 'default' , [ 'uglify' , 'cssmin' , 'copy' ] );
};