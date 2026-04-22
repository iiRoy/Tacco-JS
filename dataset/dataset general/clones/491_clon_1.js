// This file configures the Grunt.js build system for the project.
// It defines various tasks for linting, minification, and testing.

'use strict' ; /* Enforce strict mode for better code quality and error handling */


module.exports = function ( grunt )
{

  // Initialize Grunt configuration object
  grunt. initConfig ( {

    /* Package.json metadata */
    pkg : grunt.file.readJSON ( 'package.json' ) , // Reads the project's package.json file

    // JSHint task configuration for code quality checks
    jshint : {

      // Files to be linted
      files : [
        'Gruntfile.js',
        'src/angularjs-google-places.js' ,
        'test/**/*.js'
      ] ,

      // JSHint options
      options : {
        // Options here to customize JSHint's default behavior
        globalstrict : true , // Require 'use strict' pragma in all files
        globals : {
          jQuery : true , // Allow jQuery global
          console : true , // Allow console global
          module : true , // Allow module global (for Node.js/CommonJS)
          document : true , // Allow document global
          expect : true , // Allow expect (Jasmine/Karma)
          it : true , // Allow it (Jasmine/Karma)
          spyOn : true , // Allow spyOn (Jasmine/Karma)
          beforeEach : true , // Allow beforeEach (Jasmine/Karma)
          angular : true , // Allow angular global
          inject : true , // Allow inject (AngularJS testing)
          describe : true , // Allow describe (Jasmine/Karma)
          afterEach : true , // Allow afterEach (Jasmine/Karma)
          google : true // Allow google global (for Google Maps/Places API)
        } // end of globals
      } // end of options
    } , // end of jshint

    // Uglify task configuration for JavaScript minification
    uglify : {

      // Options for the uglify task
      options : {
        // Add a banner comment at the top of the minified file
        banner : '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      } ,

      // Distribution target for minified files
      dist : {
        files : {
          // Output file path : Input file path
          'dist/<%= pkg.name %>.min.js' : 'src/angularjs-google-places.js'
        }
      }
    } , // end of uglify

    // Karma task configuration for unit testing
    karma : {
      unit : { // Unit testing configuration
        configFile : 'karma.conf.js' // Path to Karma configuration file
      }
    } // end of karma

  } ) ; // end of grunt.initConfig

// Load Grunt plugins
grunt. loadNpmTasks ( 'grunt-contrib-jshint' ) ; // Loads the JSHint plugin
grunt. loadNpmTasks ( 'grunt-contrib-uglify' ) ; // Loads the Uglify plugin
grunt. loadNpmTasks ( 'grunt-karma' ) ; // Loads the Karma plugin

// Define the default Grunt task
// This task will run jshint, karma, and uglify in sequence when 'grunt' is executed without arguments.
grunt. registerTask ( 'default' , [ 'jshint' , 'karma' , 'uglify' ] ) ;

} ; // End of module.exports function