'use strict'; /* This directive enforces strict parsing and error handling rules in JavaScript. */

// Grunt LiveReload utility snippet loader.
var lrSnippet = require( 'grunt-contrib-livereload/lib/utils' ).livereloadSnippet;

// Helper function to create a static server middleware using Connect.
var mountFolder = function ( connect, dir ) {
 return connect.static( require( 'path' ).resolve( dir ) );
};


module.exports = function ( grunt ) {

  // Load all Grunt tasks automatically from dependencies listed in package.json.
  require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

  // Define configurable paths for the application source and distribution directories.
  var yeomanConfig = {
    app : 'app', /* The primary application source folder. */
    dist: 'dist' // The target directory for built distribution files.
  };


  // Attempt to override the 'app' path from a 'component.json' file if it exists.
  try {
    yeomanConfig.app = require( './component.json' ).appPath || yeomanConfig.app;
  }
  catch ( e ) {
    /* If component.json is not found or has an error, simply ignore it and use the default path. */
  }


  // Initialize Grunt configuration.
  grunt.initConfig( {

    yeoman: yeomanConfig, // Pass the custom Yeoman configuration paths.


    watch: { /* Task to monitor file system changes and trigger specified tasks. */

      coffee: {
        files: [ '<%= yeoman.app %>/scripts/{,*/}*.coffee' ], // Watch all CoffeeScript files in the app's scripts directory.
        tasks: [ 'coffee:dist' ] // Run the 'coffee:dist' task upon changes.
      },

      coffeeTest: {
        files: [ 'test/spec/{,*/}*.coffee' ], // Watch CoffeeScript files dedicated to testing.
        tasks: [ 'coffee:test' ] // Compile test CoffeeScript files.
      },

      compass: {
        files: [ '<%= yeoman.app %>/styles/{,*/}*.{scss,sass}' ], // Monitor Sass/SCSS files for changes.
        tasks: [ 'compass' ] // Recompile Compass styles.
      },

      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html', // Any HTML file in the application root.
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css', // CSS files in temporary or app styles directories.
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js', // JavaScript files in temporary or app scripts directories.
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}' // Various image formats.
        ],
        tasks: [ 'livereload' ] // Trigger a browser reload via LiveReload.
      }
    },


    connect: { /* Task to set up a static web server. */

      options: {
        port: 9000, // The default port for the local development server.
        // Important: To allow external access, change 'localhost' to '0.0.0.0'.
        hostname: 'localhost' // The hostname where the server will be accessible.
      },

      livereload: {
        options: {
          middleware: function ( connect ) { // Custom middleware setup for LiveReload.
            return [
              lrSnippet, // Inject the LiveReload script into served HTML.
              mountFolder( connect, '.tmp' ), // Serve files from the temporary directory.
              mountFolder( connect, yeomanConfig.app ) // Serve files directly from the application source.
            ];
          }
        }
      },

      test: {
        options: {
          middleware: function ( connect ) { // Middleware for the test server environment.
            return [
              mountFolder( connect, '.tmp' ), // Serve temporary build artifacts for tests.
              mountFolder( connect, 'test' ) // Serve test specific files.
            ];
          }
        }
      }
    },


    open: { /* Task to automatically open the development server URL in a web browser. */

      server: {
        url: 'http://localhost:<%= connect.options.port %>' // Constructs the URL using the configured port.
      }
    },


    clean: { /* Task to remove files and folders. */

      dist: { // Clean the distribution directory.
        files: [ {
          dot: true, // Include dot files (e.g., .htaccess) in the cleanup.
          src: [
            '.tmp', // Remove the temporary build directory.
            '<%= yeoman.dist %>/*', // Remove all contents of the distribution directory.
            '!<%= yeoman.dist %>/.git*' // Explicitly exclude .git related files from deletion.
          ]
        } ]
      },

      server: '.tmp' // Clean only the temporary directory for the server task.
    },


    jshint: { /* Task to lint JavaScript files for potential errors and style issues. */

      options: {
        jshintrc: '.jshintrc' // Path to the JSHint configuration file.
      },

      all: [
        'Gruntfile.js', // Lint the Gruntfile itself.
        '<%= yeoman.app %>/scripts/{,*/}*.js' // Lint all JavaScript files within the application's scripts directory.
      ]
    },


    karma: { /* Task to run unit tests using Karma. */

      unit: {
        configFile: 'karma.conf.js', // Path to the Karma configuration file.
        singleRun: true // Run tests once and then exit the process.
      }
    },


    coffee: { /* Task to compile CoffeeScript files into JavaScript. */

      dist: {
        files: [ {
          expand: true, // Enable dynamic file mapping.
          cwd: '<%= yeoman.app %>/scripts', // Current working directory for source CoffeeScript.
          src: '{,*/}*.coffee', // Source pattern for CoffeeScript files.
          dest: '.tmp/scripts', // Destination directory for compiled JavaScript.
          ext: '.js' // Change the file extension from .coffee to .js.
        } ]
      },

      test: {
        files: [ {
          expand: true,
          cwd: 'test/spec', // Source directory for CoffeeScript test files.
          src: '{,*/}*.coffee',
          dest: '.tmp/spec', // Destination for compiled test JavaScript.
          ext: '.js'
        } ]
      }
    },


    compass: { /* Task to compile Sass/SCSS files using Compass. */

      options: {
        sassDir: '<%= yeoman.app %>/styles', // Directory containing Sass source files.
        cssDir: '.tmp/styles', // Output directory for compiled CSS.
        imagesDir: '<%= yeoman.app %>/images', // Directory for images, used for image-url() helper.
        javascriptsDir: '<%= yeoman.app %>/scripts', // Directory for JavaScript, used for javascript-url() helper.
        fontsDir: '<%= yeoman.app %>/styles/fonts', // Directory for fonts.
        importPath: '<%= yeoman.app %>/components', // Path where Compass can find additional components.
        relativeAssets: true // Use relative paths for assets in compiled CSS.
      },

      dist: {}, // No specific overrides for the distribution build.

      server: {
        options: {
          debugInfo: true // Enable debug information in CSS for server development.
        }
      }
    },


    concat: { /* Task to concatenate multiple files into a single file. */

      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [ // Destination for the combined JavaScript file.
            '.tmp/scripts/{,*/}*.js', // Include temporary compiled JavaScript files.
            '<%= yeoman.app %>/scripts/{,*/}*.js' // Include original application JavaScript files.
          ]
        }
      }
    },


    useminPrepare: { /* Task to prepare blocks of HTML for minification and concatenation. */

      html: '<%= yeoman.app %>/index.html', // The main HTML file to scan for build blocks.

      options: {
        dest: '<%= yeoman.dist %>' // The base destination directory for optimized files.
      }
    },


    usemin: { /* Task to replace references to unoptimized files with optimized ones in HTML and CSS. */

      html: [ '<%= yeoman.dist %>/{,*/}*.html' ], // HTML files in the distribution directory to process.
      css: [ '<%= yeoman.dist %>/styles/{,*/}*.css' ], // CSS files in the distribution directory to process.

      options: {
        dirs: [ '<%= yeoman.dist %>' ] // Base directories for resolving relative paths within `usemin`.
      }
    },


    imagemin: { /* Task to optimize image files for web performance. */

      dist: {
        files: [ {
          expand: true,
          cwd: '<%= yeoman.app %>/images', // Source directory for images.
          src: '{,*/}*.{png,jpg,jpeg}', // Image file types to be optimized.
          dest: '<%= yeoman.dist %>/images' // Destination directory for optimized images.
        } ]
      }
    },


    cssmin: { /* Task to minify CSS files. */

      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [ // Destination for the minified CSS file.
            '.tmp/styles/{,*/}*.css', // Include temporary compiled CSS files.
            '<%= yeoman.app %>/styles/{,*/}*.css' // Include original application CSS files.
          ]
        }
      }
    },


    htmlmin: { /* Task to minify HTML files. */

      dist: {
        options: { /* HTML minification options, some commented out for flexibility. */
          /*
           * removeCommentsFromCDATA: true,
           * This option is related to handling CDATA sections in HTML.
           *
           * Reference issue for Grunt Usemin:
           * https://github.com/yeoman/grunt-usemin/issues/44
           *
           * collapseWhitespace: true,  // Uncomment to remove all whitespace.
           * collapseBooleanAttributes: true,
           * removeAttributeQuotes: true,
           * removeRedundantAttributes: true,
           * useShortDoctype: true,
           * removeEmptyAttributes: true,
           * removeOptionalTags: true
           */
        },
        files: [ {
          expand: true,
          cwd: '<%= yeoman.app %>', // Source directory for HTML files.
          src: [ '*.html', 'views/*.html' ], // HTML files to minify, including those in a 'views' subdirectory.
          dest: '<%= yeoman.dist %>' // Destination for minified HTML files.
        } ]
      }
    },


    cdnify: { /* Task to replace local asset URLs with CDN URLs. */

      dist: {
        html: [ '<%= yeoman.dist %>/*.html' ] // HTML files in the distribution directory to process for CDN links.
      }
    },


    ngmin: { /* Task to prepare AngularJS files for minification-safe dependency injection. */

      dist: {
        files: [ {
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts', // Source directory for JavaScript files to process.
          src: '*.js', // All JavaScript files.
          dest: '<%= yeoman.dist %>/scripts' // Destination for processed JavaScript files.
        } ]
      }
    },


    uglify: { /* Task to minify (uglify) JavaScript files. */

      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [ // Destination for the minified JavaScript file.
            '<%= yeoman.dist %>/scripts/scripts.js' // The JavaScript file to be minified.
          ],
        }
      }
    },


    rev: { /* Task to revision (add a hash to filenames) files for cache busting. */

      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js', // All JavaScript files in the dist scripts folder.
            '<%= yeoman.dist %>/styles/{,*/}*.css', // All CSS files in the dist styles folder.
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}', // Various image files.
            '<%= yeoman.dist %>/styles/fonts/*' // All font files.
          ]
        }
      }
    },


    copy: { /* Task to copy files and directories. */

      dist: {
        files: [ {
          expand: true,
          dot: true, // Include dot files when copying.
          cwd: '<%= yeoman.app %>', // Source directory for files to copy.
          dest: '<%= yeoman.dist %>', // Destination directory for copied files.
          src: [
            '*.{ico,txt}', // Copy icon and text files.
            '.htaccess', // Copy .htaccess configuration file.
            'components/**/*', // Copy all files and subdirectories within 'components'.
            'images/{,*/}*.{gif,webp}' // Copy specific GIF and WebP image formats.
          ]
        } ]
      }
    }
  } );


  // Rename the 'regarde' task to 'watch' for consistency and better naming.
  grunt.renameTask( 'regarde', 'watch' );


  // Register the 'server' task for local development.
  grunt.registerTask( 'server', [
    'clean:server',       // 1. Clear temporary server files.
    'coffee:dist',        // 2. Compile CoffeeScript for distribution.
    'compass:server',     // 3. Compile Compass styles for the server with debug info.
    'livereload-start',   // 4. Start the LiveReload server.
    'connect:livereload', // 5. Start the Connect static server with LiveReload middleware.
    'open',               // 6. Open the server URL in a web browser.
    'watch'               // 7. Begin watching files for changes.
  ] );


  // Register the 'test' task to execute unit tests.
  grunt.registerTask( 'test', [
    'clean:server', // 1. Clean temporary server files.
    'coffee',       // 2. Compile all CoffeeScript files.
    'compass',      // 3. Compile all Compass styles.
    'connect:test', // 4. Start the Connect server for testing.
    'karma'         // 5. Run Karma unit tests.
  ] );


  // Register the 'build' task for creating optimized production-ready files.
  grunt.registerTask( 'build', [
    'clean:dist',       // 1. Clean the distribution directory.
    'jshint',           // 2. Lint all JavaScript files.
    'test',             // 3. Run all unit tests.
    'coffee',           // 4. Compile CoffeeScript.
    'compass:dist',     // 5. Compile Compass styles for distribution.
    'useminPrepare',    // 6. Prepare HTML blocks for optimization.
    'imagemin',         // 7. Optimize images.
    'cssmin',           // 8. Minify CSS files.
    'htmlmin',          // 9. Minify HTML files.
    'concat',           // 10. Concatenate files as per useminPrepare.
    'copy',             // 11. Copy static assets.
    /* 'cdnify', */      // 12. (Optional) Replace local asset URLs with CDN paths.
    'ngmin',            // 13. Prepare AngularJS files for minification.
    'uglify',           // 14. Minify JavaScript files.
    'rev',              // 15. Revision files for cache busting.
    'usemin'            // 16. Update references in HTML/CSS to revised files.
  ] );


  // Set the 'build' task as the default task to run when Grunt is executed without arguments.
  grunt.registerTask( 'default', [ 'build' ] );
};