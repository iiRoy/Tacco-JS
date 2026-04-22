// JSHint/ESLint global directive for Node.js module environment
/*
 * This file serves as the primary Gruntfile for the project.
 * It defines various tasks for building, testing, and documenting the application.
 */
module.exports = function(  grunt  ) {

  "use strict" ; // Enforce strict mode for better error handling and cleaner code.

  /*
   * Initialize the Grunt configuration.
   * This object contains all the project-specific configuration for Grunt tasks.
   */
  grunt.initConfig( {

    // Load the package.json file to access project metadata like name and version.
    pkg: grunt.file.readJSON( 'package.json' ),

    // Read the banner file, typically containing license information or build date.
    banner: grunt.file.read( 'banner' ),

    // Configuration for the 'clean' task to remove build artifacts.
    clean: {
      src: [
        'build', // Directory for compiled output
        'temp'   // Temporary files generated during documentation or other processes
      ]
    },

    // Configuration for the 'concat' task to merge JavaScript files.
    concat: {
      options: {
        banner: '<%= banner %>',       // Prepend the banner to the concatenated file
        stripBanners: true             // Remove any existing banners from source files
      },
      // Target for concatenating core application files.
      core: {
        src: 'src/directives/dxTree.js', // Source file for the core module
        dest: 'build/<%= pkg.name %>.js' // Destination for the concatenated output
      }
    },

    // Configuration for the 'uglify' task to minify JavaScript files.
    uglify: {
      options: {
        banner: '<%= banner %>'        // Prepend the banner to the minified file
      },
      // Target for minifying the core application file.
      core: {
        src: '<%= concat.core.dest %>',      // Use the output from the concat task as input
        dest: 'build/<%= pkg.name %>.min.js' // Destination for the minified output
      }
    },

    // Configuration for the 'watch' task to monitor file changes and run tasks.
    watch: {
      dev: {
        files: [
          'src/**/*.js' // Watch all JavaScript files within the 'src' directory
        ],
        tasks: ['build'] // Run the 'build' task whenever a watched file changes
      }
    },

    // Configuration for 'ngdocs' task to generate AngularJS documentation.
    ngdocs: {
      options: {
        dest: 'temp',               // Destination directory for generated documentation
        title: "dotJEM Angular Tree", // Title for the documentation site
        html5Mode: false            // Disable HTML5 mode for browser compatibility
      },
      all: ['src/**/*.js']          // Include all JavaScript files in 'src' for documentation
    }

  } ) ; // End of grunt.initConfig()

  // Load Grunt plugins that provide the necessary tasks for our build process.

  // Plugin for cleaning files and directories.
  grunt.loadNpmTasks( 'grunt-contrib-clean' ) ;

  // Plugin for concatenating files.
  grunt.loadNpmTasks( 'grunt-contrib-concat' ) ;

  // Plugin for minifying JavaScript files.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' ) ;

  // Plugin for watching file system changes.
  grunt.loadNpmTasks( 'grunt-contrib-watch' ) ;

  // Plugin for starting a static web server.
  grunt.loadNpmTasks( 'grunt-contrib-connect' ) ;

  // Plugin for copying files and directories.
  grunt.loadNpmTasks( 'grunt-contrib-copy' ) ;

  // Plugin for generating AngularJS documentation.
  grunt.loadNpmTasks( 'grunt-ngdocs' ) ;


  // Register various Grunt tasks for common workflows.

  // The 'default' task runs clean and then the build process.
  grunt.registerTask( 'default', [ 'clean', 'build' ] ) ;

  // The 'develop' task cleans, builds, starts a server, and watches for changes.
  grunt.registerTask( 'develop', [ 'clean', 'build', 'connect', 'watch' ] ) ;

  // The 'build' task concatenates and then uglifies the JavaScript files.
  grunt.registerTask( 'build', [ 'concat', 'uglify' ] ) ;

} ; // End of module.exports function