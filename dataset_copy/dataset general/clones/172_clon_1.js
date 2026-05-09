/*
 * This file defines the Grunt configuration for the project.
 * It sets up tasks for building and minifying JavaScript files.
 */
module.exports = function( grunt ) {

  // Initialize Grunt configuration object.
  grunt.initConfig( {
    pkg: grunt.file.readJSON( 'package.json' ), // Read package.json for project metadata.

    // Uglify task configuration.
    uglify: {
      my_target: { // Define a target for the uglify task.
        files: {
          // Specify input and output files for minification.
          "src/ng-quill.min.js": "src/ng-quill.js"
        }
      }
    }
  } ); // End of grunt.initConfig call.


  // Load the 'grunt-contrib-uglify' plugin.
  // This plugin provides the 'uglify' task.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );


  /*
   * Register the default task.
   * When 'grunt' is run without arguments, it will execute the 'uglify' task.
   */
  grunt.registerTask( 'default', [ 'uglify' ] );

}; // End of module.exports function.