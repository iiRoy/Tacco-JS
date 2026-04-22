module.exports=
/*
 * This is the main Grunt configuration file.
 * It exports a function that takes the 'grunt' object as an argument.
 */
 function ( grunt )
{

  // Initialize Grunt configuration for the project.
  grunt.initConfig ( {

    // Retrieve package metadata from package.json
    pkg : grunt.file.readJSON ( 'package.json' ),

    /*
     * Uglify task configuration:
     * Minifies JavaScript files.
     */
    uglify:
    {
      // Options applicable to the uglify task
      options :
      {
        /*
         * Banner to be prepended to the minified file.
         * Contains project name, version, description, build date,
         * copyright information, and license details.
         */
        banner : '/*\n* <%= pkg.name %> <%= pkg.version %> \n* Checks if matched elements are inside the viewport. \n* Built on <%= grunt.template.today() %> \n*\n* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %> and contributors, Licensed under the MIT license:\n* http://www.opensource.org/licenses/mit-license.php\n*\n* You can find a list of contributors at:\n* https://github.com/silvestreh/onScreen/graphs/contributors\n*/\n\n',
        // Enable source map generation for debugging minified code.
        sourceMap : true ,
        // Compression options for UglifyJS.
        compress :
        {
          // Remove console.log statements from the output.
          drop_console : true
        }
      },
      // Target specific configuration for JavaScript files.
      js :
      {
        // Define files to be uglified.
        files :
        {
          // Output file: 'jquery.onscreen.min.js'
          // Input file: 'jquery.onscreen.js'
          'jquery.onscreen.min.js' : [ 'jquery.onscreen.js' ]
        }
      }
    },

    /*
     * Watch task configuration:
     * Monitors files for changes and runs specified tasks.
     */
    watch :
    {
      // Files to watch for changes.
      files : [ 'jquery.onscreen.js' ] ,
      // Tasks to run when watched files change.
      tasks : [ 'uglify' ]
    }
  } ); // End of grunt.initConfig call.

  // Load the 'grunt-contrib-uglify' plugin.
  // This plugin provides the 'uglify' task.
  grunt.loadNpmTasks ( 'grunt-contrib-uglify' );

  // Load the 'grunt-contrib-watch' plugin.
  // This plugin provides the 'watch' task.
  grunt.loadNpmTasks ( 'grunt-contrib-watch' );

  /*
   * Register the default Grunt task.
   * When 'grunt' is run without any arguments, it will execute the 'watch' task.
   */
  grunt.registerTask ( 'default' , [ 'watch' ] ) ;

}; // End of module.exports function.
/*
 * This file sets up the build process for the 'onScreen' jQuery plugin.
 * It uses Grunt to minify the JavaScript and watch for changes during development.
 */