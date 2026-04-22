'use strict' ; // Enforce strict mode for cleaner code and error prevention.

// Define the default port number for the LiveReload server.
var LIVERELOAD_PORT = 35729 ;

// Initialize the connect-livereload middleware with the specified port.
var lrSnippet = require ( 'connect-livereload' ) ( { port : LIVERELOAD_PORT } ) ;

/**
 * Helper function to mount a static directory using connect.
 *
 * @param {object} connect - The connect middleware instance.
 * @param {string} dir - The directory path to serve.
 * @returns {function} A connect static middleware function.
 */
var mountFolder = function ( connect , dir ) {
  return connect . static ( require ( 'path' ) . resolve ( dir ) ) ;
} ;


// This section handles the main Grunt configuration setup.
// It's responsible for defining tasks and their options.

module . exports = function ( grunt ) {

  // Automatically load all Grunt tasks from devDependencies that start with 'grunt-'.
  require ( 'matchdep' ) . filterDev ( 'grunt-*' ) . forEach ( grunt . loadNpmTasks ) ;

  // Define configurable paths for the application and distribution directories.
  var yeomanConfig = {
    app : 'app' ,   // Source application directory.
    dist : 'dist'   // Distribution output directory.
  } ;

  // Initialize Grunt configuration for various tasks.
  grunt . initConfig ( {

    // Yeoman configuration object for path management.
    yeoman : yeomanConfig ,

    // Watch task configuration for monitoring file changes and triggering other tasks.
    watch : {
      options : {
        nospawn : true ,    // Don't spawn new processes for watched tasks.
        livereload : true   // Enable LiveReload for automatic browser refresh.
      } ,
      // Watch for changes in CoffeeScript test files.
      coffeeTest : {
        files : [ 'test/spec/{,*/}*.coffee' ] ,
        tasks : [ 'coffee:test' ]
      } ,
      // Watch for changes in Compass (Sass) files.
      compass : {
        files : [ '<%= yeoman.app %>/styles/{,*/}*.{scss,sass}' ] ,
        tasks : [ 'compass' ]
      } ,
      // LiveReload specific configuration.
      livereload : {
        options : {
          livereload : LIVERELOAD_PORT // Use the defined LiveReload port.
        } ,
        files : [
          '<%= yeoman.app %>/*.html' ,
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css' ,
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js' ,
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ]
      } ,
      // Watch for changes in JST (JavaScript Template) files.
      jst : {
        files : [
          '<%= yeoman.app %>/scripts/templates/*.ejs'
        ] ,
        tasks : [ 'jst' ]
      } ,
      // Watch for changes in files that require neutering (concatenation).
      neuter : {
        files : [ '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.{js,coffee}' ] ,
        tasks : [ 'coffee:dist' , 'neuter' ]
      }
    } ,

    // Connect task configuration for setting up a local web server.
    connect : {
      options : {
        port : 9000 ,       // Default server port.
        hostname : 'localhost' // Server hostname, '0.0.0.0' for external access.
      } ,
      // LiveReload server configuration.
      livereload : {
        options : {
          middleware : function ( connect ) {
            return [
              lrSnippet , // LiveReload snippet for browser injection.
              mountFolder ( connect , '.tmp' ) , // Serve temporary files.
              mountFolder ( connect , yeomanConfig . app ) // Serve application files.
            ] ;
          }
        }
      } ,
      // Test server configuration.
      test : {
        options : {
          middleware : function ( connect ) {
            return [
              mountFolder ( connect , '.tmp' ) , // Serve temporary files.
              mountFolder ( connect , 'test' ) , // Serve test files.
              mountFolder ( connect , yeomanConfig . app ) // Serve application files.
            ] ;
          }
        }
      } ,
      // Distribution server configuration.
      dist : {
        options : {
          middleware : function ( connect ) {
            return [
              mountFolder ( connect , yeomanConfig . dist ) // Serve distribution files.
            ] ;
          }
        }
      }
    } ,

    // Open task configuration to automatically open the browser.
    open : {
      server : {
        path : 'http://localhost:<%= connect.options.port %>' // URL to open.
      }
    } ,

    // Clean task configuration for deleting files and folders.
    clean : {
      dist : [ '.tmp' , '<%= yeoman.dist %>/*' ] , // Clean distribution and temporary files.
      server : '.tmp' // Clean temporary files used by the server.
    } ,

    // JSHint task configuration for code quality checks.
    jshint : {
      options : {
        jshintrc : '.jshintrc' // Path to JSHint configuration file.
      } ,
      all : [
        'Gruntfile.js' ,
        '<%= yeoman.app %>/scripts/{,*/}*.js' ,
        '!<%= yeoman.app %>/scripts/vendor/*' , // Exclude vendor scripts.
        'test/spec/{,*/}*.js'
      ]
    } ,

    // Mocha task configuration for running client-side tests.
    mocha : {
      all : {
        options : {
          run : true , // Run tests automatically.
          urls : [ 'http://localhost:<%= connect.options.port %>/index.html' ] // URL for tests.
        }
      }
    } ,

    // CoffeeScript task configuration for compiling CoffeeScript files to JavaScript.
    coffee : {
      dist : {
        files : [ {
          // Compile multiple CoffeeScript files from the app scripts directory.
          expand : true ,
          cwd : '<%= yeoman.app %>/scripts' ,
          src : '{,*/}*.coffee' ,
          dest : '.tmp/scripts' ,
          ext : '.js'
        } ]
      } ,
      test : {
        files : [ {
          // Compile CoffeeScript test files.
          expand : true ,
          cwd : '.tmp/spec' ,
          src : '*.coffee' ,
          dest : 'test/spec'
        } ]
      }
    } ,

    // Compass task configuration for compiling Sass files using Compass.
    compass : {
      options : {
        sassDir : '<%= yeoman.app %>/styles' ,
        cssDir : '.tmp/styles' ,
        imagesDir : '<%= yeoman.app %>/images' ,
        javascriptsDir : '<%= yeoman.app %>/scripts' ,
        fontsDir : '<%= yeoman.app %>/styles/fonts' ,
        importPath : '<%= yeoman.app %>/bower_components' ,
        relativeAssets : true // Generate relative paths for assets.
      } ,
      dist : { } , // Distribution specific options (empty for default).
      server : {
        options : {
          debugInfo : true // Enable debug information for server mode.
        }
      }
    } ,

    // UseminPrepare task for configuring concatenation, minification, and revisioning.
    useminPrepare : {
      html : '<%= yeoman.app %>/index.html' , // Source HTML file for processing.
      options : {
        dest : '<%= yeoman.dist %>' // Destination directory for processed files.
      }
    } ,

    // Usemin task for replacing references to non-optimized files with optimized ones.
    usemin : {
      html : [ '<%= yeoman.dist %>/{,*/}*.html' ] ,
      css : [ '<%= yeoman.dist %>/styles/{,*/}*.css' ] ,
      options : {
        dirs : [ '<%= yeoman.dist %>' ] // Directories to search for files.
      }
    } ,

    // Imagemin task for optimizing image files.
    imagemin : {
      dist : {
        files : [ {
          expand : true ,
          cwd : '<%= yeoman.app %>/images' ,
          src : '{,*/}*.{png,jpg,jpeg}' ,
          dest : '<%= yeoman.dist %>/images'
        } ]
      }
    } ,

    // SVGmin task for optimizing SVG files.
    svgmin : {
      dist : {
        files : [ {
          expand : true ,
          cwd : '<%= yeoman.app %>/icons' ,
          src : '{,*/}*.svg' ,
          dest : '<%= yeoman.dist %>/icons'
        } ]
      }
    } ,

    // CSSmin task for minifying CSS files.
    cssmin : {
      dist : {
        files : {
          '<%= yeoman.dist %>/styles/main.css' : [ // Output main CSS file.
            '.tmp/styles/{,*/}*.css' ,
            '<%= yeoman.app %>/styles/{,*/}*.css'
          ]
        }
      }
    } ,

    // HTMLmin task for minifying HTML files.
    htmlmin : {
      dist : {
        options : {
          // Options for HTML minification.
          // These options are commented out in the original, so we keep them as a comment block.
          /*
          removeCommentsFromCDATA: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
          */
        } ,
        files : [ {
          expand : true ,
          cwd : '<%= yeoman.app %>' ,
          src : '*.html' ,
          dest : '<%= yeoman.dist %>'
        } ]
      }
    } ,

    // Copy task for copying files and directories.
    copy : {
      dist : {
        files : [ {
          expand : true ,
          dot : true , // Include dot files.
          cwd : '<%= yeoman.app %>' ,
          dest : '<%= yeoman.dist %>' ,
          src : [
            '*.{ico,txt}' ,
            '.htaccess' ,
            'images/{,*/}*.{webp,gif}' ,
            'icons/{,*/}*.svg'
          ]
        } ]
      }
    } ,

    // Bower task configuration for managing front-end packages.
    bower : {
      all : {
        rjsConfig : '<%= yeoman.app %>/scripts/main.js' // Path to RequireJS config.
      }
    } ,

    // JST task for compiling EJS templates into JavaScript functions.
    jst : {
      compile : {
        files : {
          '.tmp/scripts/templates.js' : [ '<%= yeoman.app %>/scripts/templates/*.ejs' ] // Output file.
        }
      }
    } ,

    // Rev task for revisioning files to bust browser caches.
    rev : {
      dist : {
        files : {
          src : [
            '<%= yeoman.dist %>/scripts/{,*/}*.js' ,
            '<%= yeoman.dist %>/styles/{,*/}*.css' ,
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}' ,
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    } ,

    // Neuter task for concatenating JavaScript files in a specific order.
    neuter : {
      app : {
        src : '<%= yeoman.app %>/scripts/main.js' , // Main entry point.
        dest : '.tmp/scripts/combined-scripts.js' // Output combined script.
      }
    } ,

    // Uglify task for minifying JavaScript files.
    uglify : {
      options : {
        preserveComments : 'some' // Preserve some comments (e.g., license comments).
      }
    }
  } ) ;


  /**
   * Custom Grunt task to create a default template file for JST.
   * This ensures the JST object is initialized even if no templates are compiled.
   */
  grunt . registerTask ( 'createDefaultTemplate' , function ( ) {
    grunt . file . write ( '.tmp/scripts/templates.js' , 'this.JST = this.JST || {};' ) ;
  } ) ;


  /**
   * Custom Grunt task to generate an icon data file from SVG icons.
   * It reads SVG files from the icons directory and creates a JavaScript array.
   */
  grunt . registerTask ( 'createIconData' , function ( ) {
    var icons = [ ] , // Array to store icon paths.
        fileHeader = 'window.openSpendingIcons.Data.Icons = [' , // Header for the output file.
        fileFooter = '];' , // Footer for the output file.
        fileContents = '' ; // String to build the file content.

    // Recurse through the icons directory to find SVG files.
    grunt . file . recurse ( grunt . config ( 'yeoman.app' ) + '/icons' , function ( abspath , rootdir , subdir , filename ) {
      if ( filename . match ( /\.svg$/ ) ) { // Check if the file is an SVG.
        var path = abspath . replace ( grunt . config ( 'yeoman.app' ) + '/' , '' ) ; // Get relative path.
        icons . push ( path ) ; // Add path to the icons array.
      }
    } ) ;

    // Handle the case where there might be no icons or only one.
    var lastIcon = icons . pop ( ) ; // Get the last icon to handle comma separation.

    icons . forEach ( function ( icon ) {
      fileContents += '  \'' + icon + '\',\n' ; // Add each icon with a comma.
    } ) ;

    if ( lastIcon ) {
        fileContents += '  \'' + lastIcon + '\'' ; // Add the last icon without a trailing comma.
    }


    // Write the generated icon data to a JavaScript file.
    grunt . file . write ( grunt . config ( 'yeoman.app' ) + '/scripts/data/icons.js' ,
      fileHeader + '\n' + fileContents + '\n' + fileFooter + '\n'
    ) ;
  } ) ;


  /**
   * Register the 'server' task.
   * This task starts a development server with LiveReload.
   * If 'dist' target is specified, it serves the compiled distribution.
   */
  grunt . registerTask ( 'server' , function ( target ) {
    if ( target === 'dist' ) {
      return grunt . task . run ( [ 'build' , 'open' , 'connect:dist:keepalive' ] ) ;
    }

    grunt . task . run ( [
      'clean:server' ,           // Clean temporary server files.
      'coffee:dist' ,            // Compile CoffeeScript for distribution.
      'createDefaultTemplate' ,  // Ensure JST object exists.
      'jst' ,                    // Compile JST templates.
      'createIconData' ,         // Generate icon data file.
      'neuter:app' ,             // Concatenate application scripts.
      'compass:server' ,         // Compile Sass with debug info.
      'connect:livereload' ,     // Start the LiveReload server.
      'open' ,                   // Open browser to the server URL.
      'watch'                    // Start watching for file changes.
    ] ) ;
  } ) ;


  /**
   * Register the 'test' task.
   * This task runs client-side tests using Mocha.
   */
  grunt . registerTask ( 'test' , [
    'clean:server' ,          // Clean temporary server files.
    'coffee' ,                // Compile all CoffeeScript files.
    'createDefaultTemplate' , // Ensure JST object exists.
    'jst' ,                   // Compile JST templates.
    'createIconData' ,        // Generate icon data file.
    'neuter:app' ,            // Concatenate application scripts.
    'compass' ,               // Compile Sass files.
    'connect:test' ,          // Start the test server.
    'mocha'                   // Run Mocha tests.
  ] ) ;


  /**
   * Register the 'build' task.
   * This task compiles, optimizes, and prepares the application for distribution.
   */
  grunt . registerTask ( 'build' , [
    'clean:dist' ,           // Clean distribution directory.
    'coffee' ,               // Compile CoffeeScript.
    'createDefaultTemplate' ,// Ensure JST object exists.
    'jst' ,                  // Compile JST templates.
    'createIconData' ,       // Generate icon data file.
    'compass:dist' ,         // Compile Sass for distribution.
    'useminPrepare' ,        // Prepare files for usemin.
    'neuter:app' ,           // Concatenate application scripts.
    'imagemin' ,             // Optimize images.
    'svgmin' ,               // Optimize SVG files.
    'htmlmin' ,              // Minify HTML.
    'concat' ,               // Concatenate files (configured by useminPrepare).
    'cssmin' ,               // Minify CSS (configured by useminPrepare).
    'uglify' ,               // Minify JavaScript (configured by useminPrepare).
    'copy' ,                 // Copy remaining static files.
    'rev' ,                  // Revision files for cache busting.
    'usemin'                 // Replace file references with revised versions.
  ] ) ;


  /**
   * Register the 'default' task.
   * This task runs linting, tests, and then builds the application.
   */
  grunt . registerTask ( 'default' , [
    'jshint' , // Run JSHint for code quality.
    'test' ,   // Execute test tasks.
    'build'    // Build the application for distribution.
  ] ) ;

} ;