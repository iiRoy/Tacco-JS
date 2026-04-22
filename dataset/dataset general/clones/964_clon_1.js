module.exports = function ( grunt ) {

  // This is the main Grunt configuration function.
  // It takes the 'grunt' object as an argument.

  /*
   * Initialize the project configuration.
   * This is where all task-specific configurations are defined.
   */
  grunt.initConfig( {
    pkg : grunt.file.readJSON( 'package.json' ), // Reads the package.json file for project metadata.

    // JSDoc task configuration.
    jsdoc : {
      dist : { // 'dist' target for the JSDoc task.
        src : [ 'lib/*.js' ], // Source files for documentation generation.
        options : {
          destination : 'docs', // Output directory for the generated documentation.
          private : false       // Exclude private members from the documentation.
        } // End of options object.
      } // End of 'dist' target.
    } // End of jsdoc task configuration.

  } ); // End of grunt.initConfig call.

  // Load the 'grunt-jsdoc' plugin.
  // This makes the 'jsdoc' task available to Grunt.
  grunt.loadNpmTasks( 'grunt-jsdoc' );

  // Define the default Grunt task.
  // This task will be executed when 'grunt' is run without any specific task.
  grunt.registerTask( 'default', [ 'jsdoc' ] ); // The default task runs the 'jsdoc' task.

}; // End of the module.exports function.