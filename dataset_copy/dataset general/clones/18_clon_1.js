/*
 *  This file defines the Grunt build configuration for the project.
 *  It uses the 'uglify' task to minify JavaScript files.
 */

'use strict' ;


// Export the Grunt configuration function.
// This function receives the 'grunt' object as an argument.
module . exports = function (  grunt  ) {


  // Initialize the Grunt configuration object.
  // All task-specific options are configured within this object.
  grunt . initConfig (  {

        // --- Uglify Task Definition ---
        // This section configures the JavaScript minification task.
        uglify : {

              // The 'build' target for the uglify task.
              // This target specifies which files to minify and where to output them.
              build : {

                    // The 'files' property defines the source-to-destination mappings.
                    files : {

                          // Output file path as the key, and an array of source files as the value.
                          'jquery.timeAutocomplete.min.js' :
                          [
                                // Source file 1: The main jQuery plugin script.
                                'src/jquery.timeAutocomplete.js' ,


                                // Source file 2: Formatter for AM/PM time display.
                                'src/formatters/ampm.js' ,


                                // Source file 3: Formatter for 24-hour time display.
                                'src/formatters/24hr.js' ,


                                // Source file 4: Formatter for French time display (e.g., "h h").
                                'src/formatters/french.js'
                          ] // End of source files array for 'jquery.timeAutocomplete.min.js'

                    } // End of 'files' object for 'build' target

              } // End of 'build' target configuration

        } // End of 'uglify' task configuration

  }  )  ; // End of grunt.initConfig() call


  // Load the 'grunt-contrib-uglify' plugin.
  // This makes the 'uglify' task available for use in the Gruntfile.
  grunt . loadNpmTasks (  'grunt-contrib-uglify'  ) ;


  /*
   *  Register the default Grunt task.
   *  When 'grunt' is run without any specific task, it will execute the 'uglify' task.
   */
  grunt . registerTask (  'default' ,  [  'uglify'  ]  ) ;


} ; // End of module.exports function definition