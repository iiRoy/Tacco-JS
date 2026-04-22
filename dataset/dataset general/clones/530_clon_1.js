/* This module exports a Grunt configuration function.
 * It sets up various tasks for project automation. */
module.exports = function( grunt ) {

  // Initialize Grunt project configuration.
  grunt.initConfig( {
    /* Package metadata is read from package.json. */
    pkg: grunt.file.readJSON( 'package.json' ),


    /* Uglify task configuration for JavaScript minification. */
    uglify: {
      options: {
        // Banner to be prepended to the minified file.
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },

      /* Build target: minifies the main script into the Scripts directory. */
      build: {
        src:  'Scripts/jquery.battatech.excelexport.js',
        dest: 'Scripts/jquery.battatech.excelexport.min.js'
      },

      /* Distribution target: minifies the main script into the dist directory. */
      dist: {
        src:  'Scripts/jquery.battatech.excelexport.js',
        dest: '../dist/jquery.battatech.excelexport.min.js'
      }
    },


    /* Copy task configuration for moving files. */
    copy: {
      /* Main copy operation: copies the original script to the dist directory. */
      main: {
        src:  'Scripts/jquery.battatech.excelexport.js',
        dest: '../dist/jquery.battatech.excelexport.js'
      }
    },


    /* Watch task configuration for monitoring file changes. */
    watch: {
      /* Files to watch for changes. */
      files: 'Scripts/jquery.battatech.excelexport.js',
      /* Tasks to run when watched files change. */
      tasks: ['uglify']
    }

  } ); // End of grunt.initConfig call.


  // Load the Grunt plugin responsible for JavaScript minification.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );


  // Load the Grunt plugin responsible for file copying.
  grunt.loadNpmTasks( 'grunt-contrib-copy' );


  /* Register the default Grunt task.
   * This task will run 'uglify' and then 'copy' in sequence. */
  grunt.registerTask( 'default', [ 'uglify', 'copy' ] );

}; // End of module.exports function.