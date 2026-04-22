/*
 *  This file was generated on 2014-06-19
 *  using generator-webapp version 0.4.9.
 */
'use strict'; // Enforce strict mode for better code quality.


// ## Globbing Patterns
// For performance considerations, we are primarily matching files
// one level deep: 'test/spec/{,*/}*.js'
// To match files recursively across all subfolders, utilize:
// 'test/spec/**/*.js'


module.exports = function( grunt )
{

  // Automatically load all required Grunt tasks.
  require( 'load-grunt-tasks' ) ( grunt ) ;


  // Measure the duration of Grunt tasks.
  // This helps in optimizing build times and identifying slow tasks.
  require( 'time-grunt' ) ( grunt ) ;



  // Define configurable paths for the application.
  var config = {
    app : 'app',
    dist: 'dist'
  };


  // Initialize Grunt configuration for all tasks.
  grunt.initConfig(
    {

    // General project settings.
    config : config ,

    /*
     *  Watches files for any changes and executes associated tasks
     *  based on the detected modifications.
     */
    watch : {
      bower : {
        files : [ 'bower.json' ] ,
        tasks : [ 'bowerInstall' ]
      } ,
      js : {
        files : [ '<%= config.app %>/scripts/{,*/}*.js' ] ,
        tasks : [ 'jshint' ] ,
        options : {
          livereload : true
        }
      } ,
      jstest : {
        files : [ 'test/spec/{,*/}*.js' ] ,
        tasks : [ 'test:watch' ]
      } ,
      gruntfile : {
        files : [ 'Gruntfile.js' ]
      } ,
      sass : {
        files : [ '<%= config.app %>/styles/{,*/}*.{scss,sass}' ] ,
        tasks : [ 'sass:server' , 'autoprefixer' ]
      } ,
      styles : {
        files : [ '<%= config.app %>/styles/{,*/}*.css' ] ,
        tasks : [ 'newer:copy:styles' , 'autoprefixer' ]
      } ,
      livereload : {
        options : {
          livereload : '<%= connect.options.livereload %>'
        } ,
        files : [
          '<%= config.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= config.app %>/images/{,*/}*'
        ]
      }
    } ,

    // Configuration for the actual Grunt server.
    connect : {
      options : {
        port : 9000,
        open : true,
        livereload : 35729,
        // Set this to '0.0.0.0' to enable external access to the server.
        hostname : 'localhost'
      } ,
      livereload : {
        options : {
          middleware : function( connect ) {
            return [
              connect.static( '.tmp' ) ,
              connect().use( '/bower_components' , connect.static( './bower_components' ) ) ,
              connect.static( config.app )
            ];
          }
        }
      } ,
      test : {
        options : {
          open : false,
          port : 9001,
          middleware : function( connect ) {
            return [
              connect.static( '.tmp' ) ,
              connect.static( 'test' ) ,
              connect().use( '/bower_components' , connect.static( './bower_components' ) ) ,
              connect.static( config.app )
            ];
          }
        }
      } ,
      dist : {
        options : {
          base : '<%= config.dist %>',
          livereload : false
        }
      }
    } ,

    // Clears specified folders to ensure a clean build environment.
    clean : {
      dist : {
        files : [ {
          dot : true,
          src : [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        } ]
      } ,
      server : '.tmp'
    } ,

    // Ensures code style consistency and identifies potential errors.
    jshint : {
      options : {
        jshintrc : '.jshintrc',
        reporter : require( 'jshint-stylish' )
      } ,
      all : [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
        '!<%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    } ,

    // Configuration options for the Mocha testing framework.
    mocha : {
      all : {
        options : {
          run : true,
          urls : [ 'http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html' ]
        }
      }
    } ,

    // Compiles Sass files into CSS and generates necessary assets.
    sass : {
      options : {
        includePaths : [
          'bower_components'
        ]
      } ,
      dist : {
        files : [ {
          expand : true,
          cwd : '<%= config.app %>/styles',
          src : [ '*.scss' ],
          dest : '.tmp/styles',
          ext : '.css'
        } ]
      } ,
      server : {
        files : [ {
          expand : true,
          cwd : '<%= config.app %>/styles',
          src : [ '*.scss' ],
          dest : '.tmp/styles',
          ext : '.css'
        } ]
      }
    } ,

    // Adds vendor prefixes to CSS properties for broader browser compatibility.
    autoprefixer : {
      options : {
        browsers : [ 'last 1 version' ]
      } ,
      dist : {
        files : [ {
          expand : true,
          cwd : '.tmp/styles/',
          src : '{,*/}*.css',
          dest : '.tmp/styles/'
        } ]
      }
    } ,

    // Automatically injects Bower components into the main HTML file.
    bowerInstall : {
      app : {
        src : [ '<%= config.app %>/index.html' ] ,
        exclude : [ 'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js' ]
      } ,
      sass : {
        src : [ '<%= config.app %>/styles/{,*/}*.{scss,sass}' ]
      }
    } ,

    // Renames files for effective browser caching.
    rev : {
      dist : {
        files : {
          src : [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.*',
            '<%= config.dist %>/styles/fonts/{,*/}*.*',
            '<%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    } ,

    /*
     *  Parses HTML for usemin blocks to enable smart builds,
     *  which automatically concatenate, minify, and revise files.
     *  Configurations are created in memory for subsequent tasks.
     */
    useminPrepare : {
      options : {
        dest : '<%= config.dist %>'
      } ,
      html : '<%= config.app %>/index.html'
    } ,

    // Performs rewrites based on 'rev' and 'useminPrepare' configurations.
    usemin : {
      options : {
        assetsDirs : [ '<%= config.dist %>' , '<%= config.dist %>/images' ]
      } ,
      html : [ '<%= config.dist %>/{,*/}*.html' ] ,
      css : [ '<%= config.dist %>/styles/{,*/}*.css' ]
    } ,

    // The following *-min tasks generate minified files in the distribution folder.
    imagemin : {
      dist : {
        files : [ {
          expand : true,
          cwd : '<%= config.app %>/images',
          src : '{,*/}*.{gif,jpeg,jpg,png}',
          dest : '<%= config.dist %>/images'
        } ]
      }
    } ,

    svgmin : {
      dist : {
        files : [ {
          expand : true,
          cwd : '<%= config.app %>/images',
          src : '{,*/}*.svg',
          dest : '<%= config.dist %>/images'
        } ]
      }
    } ,

    htmlmin : {
      dist : {
        options : {
          collapseBooleanAttributes : true,
          collapseWhitespace : true,
          removeAttributeQuotes : true,
          removeCommentsFromCDATA : true,
          removeEmptyAttributes : true,
          removeOptionalTags : true,
          removeRedundantAttributes : true,
          useShortDoctype : true
        } ,
        files : [ {
          expand : true,
          cwd : '<%= config.dist %>',
          src : '{,*/}*.html',
          dest : '<%= config.dist %>'
        } ]
      }
    } ,

    /*
     *  By default, `index.html`'s <!-- Usemin block --> handles minification.
     *  These options are pre-configured if Usemin blocks are not desired.
     */
    // cssmin: {
    //     dist: {
    //         files: {
    //             '<%= config.dist %>/styles/main.css': [
    //                 '.tmp/styles/{,*/}*.css',
    //                 '<%= config.app %>/styles/{,*/}*.css'
    //             ]
    //         }
    //     }
    // },
    // uglify: {
    //     dist: {
    //         files: {
    //             '<%= config.dist %>/scripts/scripts.js': [
    //                 '<%= config.dist %>/scripts/scripts.js'
    //             ]
    //         }
    //     }
    // },
    // concat: {
    //     dist: {}
    // },

    // Copies remaining files to their respective locations for other tasks.
    copy : {
      dist : {
        files : [ {
          expand : true,
          dot : true,
          cwd : '<%= config.app %>',
          dest : '<%= config.dist %>',
          src : [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        } ]
      } ,
      styles : {
        expand : true,
        dot : true,
        cwd : '<%= config.app %>/styles',
        dest : '.tmp/styles/',
        src : '{,*/}*.css'
      }
    } ,

    /*
     *  Generates a custom Modernizr build, including only tests
     *  referenced within the application.
     */
    modernizr : {
      dist : {
        devFile : 'bower_components/modernizr/modernizr.js',
        outputFile : '<%= config.dist %>/scripts/vendor/modernizr.js',
        files : {
          src : [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '!<%= config.dist %>/scripts/vendor/*'
          ]
        } ,
        uglify : true
      }
    } ,

    // Executes multiple tasks concurrently to accelerate the build process.
    concurrent : {
      server : [
        'sass:server',
        'copy:styles'
      ] ,
      test : [
        'copy:styles'
      ] ,
      dist : [
        'sass',
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    }
  } ) ;


  // Register the 'serve' task.
  grunt.registerTask( 'serve' , function( target ) {
    if ( target === 'dist' ) {
      return grunt.task.run( [ 'build' , 'connect:dist:keepalive' ] ) ;
    }

    grunt.task.run( [
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ] ) ;
  } ) ;


  // Register the 'server' task (deprecated).
  grunt.registerTask( 'server' , function( target ) {
    grunt.log.warn( 'The `server` task has been deprecated. Use `grunt serve` to start a server.' ) ;
    grunt.task.run( [ target ? ( 'serve:' + target ) : 'serve' ] ) ;
  } ) ;


  // Register the 'test' task.
  grunt.registerTask( 'test' , function( target ) {
    if ( target !== 'watch' ) {
      grunt.task.run( [
        'clean:server',
        'concurrent:test',
        'autoprefixer'
      ] ) ;
    }

    grunt.task.run( [
      'connect:test',
      'mocha'
    ] ) ;
  } ) ;


  // Register the 'build' task.
  grunt.registerTask( 'build' , [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'modernizr',
    'rev',
    'usemin',
    'htmlmin'
  ] ) ;


  // Register the default task.
  grunt.registerTask( 'default' , [
    'newer:jshint',
    'test',
    'build'
  ] ) ;
} ;