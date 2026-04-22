/*
 * This file is a Gruntfile.js configuration for a JavaScript project.
 * It defines various tasks for building, testing, and maintaining the project.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code, identifiers, and expressions remain precisely as in the original.
 */
module.exports = function( grunt ) {

  // Enforce strict mode for better code quality and error prevention.
  'use strict';


  /*
   * Initialize Grunt configuration.
   * This object contains all the task configurations for the project.
   */
  grunt.initConfig( {

    // Package.json data, read for versioning and metadata.
    pkg: grunt.file.readJSON( 'package.json' ),


    /*
     * Banner for the distribution files, including project details.
     * This will be prepended to the concatenated JavaScript file.
     */
    banner: '/* <%= pkg.title || pkg.name %> jQuery plugin\n' +
            ' * <%= pkg.homepage %>\n' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %> \n' +
            ' * Released under the <%= _.pluck(pkg.licenses, "type").join(", ") %> licence \n' +
            ' *\n' +
            ' * version: <%= pkg.version %> \n' +
            ' * <%= grunt.template.today("yyyy/mm/dd") %>\n' +
            ' */\n',


    /*
     * Minified banner for the minified distribution files.
     * A more compact version of the full banner.
     */
    bannermin: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> | ' + '<%= pkg.homepage %> | ' +
               '(c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' + ' | ' +
               'License <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',


    // The base filename for generated assets.
    filename: 'jquery.rcrumbs',


    /*
     * Clean task configuration.
     * Deletes specified files and folders.
     */
    clean: {
      files: [ 'dist' ]
    },


    /*
     * Connect task configuration.
     * Starts a static web server for testing.
     */
    connect: {
      server: {
        options: {
          port: 8075
        }
      }
    },


    /*
     * Concat task configuration.
     * Concatenates source files into a single file.
     */
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>' // Use the full banner.
      },
      dist: {
        src: 'src/<%= filename %>.js', // Source JavaScript file.
        dest: 'dist/<%= filename %>.js' // Destination for the concatenated file.
      }
    },


    /*
     * Replace task configuration.
     * Replaces placeholders in files with dynamic content.
     */
    replace: {
      dist: {
        options: {
          variables: {
            version: '<%= pkg.version %>' // Replace 'version' with package.json version.
          }
        },
        files: {
          'dist/<%= filename %>.js': 'dist/<%= filename %>.js' // Target the concatenated file.
        }
      }
    },


    /*
     * LESS task configuration.
     * Compiles LESS files into CSS.
     */
    less: {
      dev: { // Development LESS compilation.
        files: {
          'dist/<%= filename %>.css': 'src/less/<%= filename %>.less'
        }
      },
      prod: { // Production LESS compilation (minified).
        options: {
          yuicompress: true // Use YUI Compressor for minification.
        },
        files: {
          'dist/<%= filename %>.min.css': 'src/less/<%= filename %>.less'
        }
      }
    },


    /*
     * Uglify task configuration.
     * Minifies JavaScript files.
     */
    uglify: {
      options: {
        banner: '<%= bannermin %>' // Use the minified banner.
      },
      dist: {
        src: 'src/<%= filename %>.js', // Source JavaScript file for minification.
        dest: 'dist/<%= filename %>.min.js' // Destination for the minified file.
      }
    },


    /*
     * JSHint task configuration.
     * Lints JavaScript files for potential errors and style issues.
     */
    jshint: {
      options: {
        jshintrc: true // Use .jshintrc file for configuration.
      },
      gruntfile: { // Lint Gruntfile.js.
        files: {
          src: [ 'Gruntfile.js' ]
        }
      },
      src: { // Lint source JavaScript files.
        files: {
          src: [ 'src/**/*.js' ]
        }
      },
      test: { // Lint test JavaScript files.
        files: {
          src: [ 'test/**/*.js' ]
        }
      }
    },


    /*
     * QUnit task configuration.
     * Runs QUnit tests in a browser environment.
     */
    qunit: {
      all: { // Run tests against all specified jQuery versions.
        options: {
          urls: [ '1.7.0', '1.8.0', '1.8.3', '1.9.1', '1.11.0', '2.0.0', '2.1.0' ].map( function ( version ) {
            return 'http://localhost:<%= connect.server.options.port %>/test/test.html?jquery=' + version;
          } )
        }
      },
      last: { // Run tests against only the latest jQuery versions.
        options: {
          urls: [ '1.11.0', '2.1.0' ].map( function ( version ) {
            return 'http://localhost:<%= connect.server.options.port %>/test/test.html?jquery=' + version;
          } )
        }
      },
      local: [ 'test/**/!(window-resize).html' ] // Run tests against local HTML files.
    },


    /*
     * Watch task configuration.
     * Monitors files for changes and runs specified tasks.
     */
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile', 'qunit:local' ]
      },
      js: {
        files: 'src/**/*.js',
        tasks: [ 'jshint:src', 'qunit:local' ]
      },
      test: {
        files: [ 'test/**/*.js', 'test/**/!(window-resize).html' ],
        tasks: [ 'jshint:test', 'qunit:local' ]
      },
      less: {
        files: 'src/**/*.less',
        tasks: [ 'less:dev' ]
      }
    },


    /*
     * Bump task configuration.
     * Updates version numbers in package files.
     */
    bump: {
      options: {
        tabSize: 2
      },
      files: [ 'package.json', 'rcrumbs.jquery.json' ]
    }

  } );


  // Load Grunt plugins for each task.

  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-qunit' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-replace' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-bumpx' );


  // Register Grunt tasks.

  // Default task: cleans, lints, compiles, concatenates, replaces, minifies, and tests.
  grunt.registerTask( 'default', [ 'connect', 'clean', 'jshint', 'less', 'concat', 'replace', 'uglify', 'qunit:last' ] );

  // Test task: runs JSHint and QUnit tests.
  grunt.registerTask( 'test', [ 'connect', 'jshint', 'qunit:last' ] );

  // Test-all task: runs JSHint and QUnit tests against all jQuery versions.
  grunt.registerTask( 'test-all', [ 'connect', 'jshint', 'qunit:all' ] );

};

/*
 * End of Gruntfile.js configuration.
 * This file is crucial for automating development workflows.
 */