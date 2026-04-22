module.exports = function(grunt) {

  'use strict' ; // Enables strict mode for the entire file.

  /*
   * This initial configuration block sets up fundamental paths and file groups
   * for various build and test tasks. It's the foundation of our Grunt setup.
   */
  grunt.initConfig( {

    src_dir : 'src' , // Defines the base directory for source code files.
    dist_dir : 'dist' , // Specifies the output directory for built distribution files.
    test_dir : 'tests' , // Sets the directory where all test files are located.

    files : {
      js : [ '<%= src_dir %>/**/*.js' , // All JavaScript files within the source directory.
             '!<%= src_dir %>/**/*.spec.js' ] , // Excludes JavaScript spec (test) files from the main source group.
      jsunit : [ '<%= test_dir %>/**/*.unit.spec.js' ] , // Specifically targets unit test files.
      config : [ 'Gruntfile.js' , 'karma-conf.js' ] // Grouping configuration files for linting.
    }
  } ) ;


  /*
   * LINTERS CONFIGURATION SECTION
   * This part loads and configures plugins responsible for code quality and style enforcement.
   */
  grunt.loadNpmTasks( 'grunt-contrib-jshint' ) ; // Loads the JSHint plugin for JavaScript linting.
  grunt.loadNpmTasks( 'grunt-jscs' ) ; // Loads the JSCS plugin for code style checking.

  grunt.config.merge( {

    /**
     * The 'jshint' task defines rules and targets for static code analysis.
     * It helps identify potential issues and enforce best practices in JavaScript.
     * All JS files (source, tests, config) are checked against `.jshintrc` policies.
     */
    jshint: {
      src: [ '<%= files.js %>' ] , // Apply JSHint to application source files.
      test_unit: [ '<%= files.jsunit %>' ] , // Apply JSHint to unit test files.
      gruntfile: [ '<%= files.config %>' ] , // Apply JSHint to Gruntfile and Karma config.
      options: {
        jshintrc: '.jshintrc' // Path to the JSHint configuration file.
      }
    } ,


    /**
     * 'jscs' (JavaScript Code Style) is a tool for enforcing strict code style guidelines.
     * It ensures consistency across the codebase, complementing JSHint's error checking.
     * For a comprehensive list of rules, see: https://github.com/jscs-dev/node-jscs#rules
     */
    jscs: {
      src: [ '<%= files.js %>' ] , // Apply JSCS to application source files for style checks.
      test_unit: [ '<%= files.jsunit %>' ] , // Apply JSCS to unit test files for style checks.
      gruntfile: [ '<%= files.config %>' ] // Apply JSCS to configuration files.
    }
  } ) ;

  // Registers a custom Grunt task that runs both JSHint and JSCS.
  grunt.registerTask( 'linters' , [ 'jshint' , 'jscs' ] ) ;


  /*
   * TESTS CONFIGURATION SECTION
   * This block sets up Karma, our chosen test runner, for executing unit tests.
   */
  grunt.loadNpmTasks( 'grunt-karma' ) ; // Loads the Grunt plugin for Karma.

  grunt.config.merge( {

    // Karma acts as our test runner, launching browsers and automatically executing unit tests.
    karma: {
      options: {
        configFile: 'karma-conf.js' // Specifies the path to Karma's main configuration file.
      } ,
      // 'unit' target: Used during active development with file watching enabled.
      unit: {
        options: {
          singleRun: false , // Keeps the browser open and watches for file changes.
          autoWatch: true // Automatically re-runs tests when relevant files change.
        }
      } ,
      // 'unit_dist' target: Runs tests against the concatenated (non-minified) distribution build.
      unit_dist: {
        files: {
          src: [
            'bower_components/angular/angular.js' , // Include Angular framework.
            'bower_components/angular-mocks/angular-mocks.js' , // Include Angular mocks for testing.
            '<%= files.jsunit %>' , // Include project-specific unit test files.
            '<%= dist_dir %>/<%= pkg.name %>.js' // Include the non-minified distribution file.
          ]
        }
      } ,
      // 'unit_dist_min' target: Executes tests against the minified distribution build.
      unit_dist_min: {
        files: {
          src: [
            'bower_components/angular/angular.js' , // Angular framework dependency.
            'bower_components/angular-mocks/angular-mocks.js' , // Angular mocks for testing.
            '<%= files.jsunit %>' , // Project's unit test files.
            '<%= dist_dir %>/<%= pkg.name %>.min.js' // The minified distribution file.
          ]
        }
      }
    }
  } ) ;

  /*
   * DISTRIBUTION CONFIGURATION SECTION
   * This part defines tasks for preparing the final distribution files,
   * including concatenation, minification, and cleaning up the build directory.
   */
  grunt.loadNpmTasks( 'grunt-contrib-concat' ) ; // Loads the plugin for concatenating files.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' ) ; // Loads the plugin for minifying JavaScript.
  grunt.loadNpmTasks( 'grunt-contrib-clean' ) ; // Loads the plugin for cleaning directories.

  grunt.config.merge( {
    // 'pkg' property: Reads metadata from `package.json` for use in build tasks (e.g., banners).
    pkg: grunt.file.readJSON( "package.json" ) ,

    // 'banner' string: A comment block prepended to the top of all distribution files.
    banner:
      '/**!\n' +
      ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' *\n' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
      ' * Distributed under the MIT licence\n' +
      ' */\n' ,

    // 'clean' task: Responsible for removing previously generated build artifacts.
    clean: {
      dist: [ '<%= dist_dir %>' ] // Specifies the distribution directory to be cleaned.
    } ,

    // 'concat' task: Combines all individual JavaScript source files into a single file.
    concat: {
      options: {
        banner: '<%= banner %>' // Applies the defined banner to the concatenated output.
      } ,
      dist: {
        src: [ '<%= files.js %>' ] , // Specifies the input JavaScript files for concatenation.
        dest: '<%= dist_dir %>/<%= pkg.name %>.js' // Defines the output path for the concatenated file.
      }
    } ,

    // 'uglify' task: Minifies the concatenated JavaScript file, reducing its size.
    uglify: {
      options: {
        banner: '<%= banner %>' // Applies the same banner to the minified output.
      } ,
      dist: {
        src: [ '<%= files.js %>' ] , // Specifies the input JavaScript files for minification.
        dest: '<%= dist_dir %>/<%= pkg.name %>.min.js' // Defines the output path for the minified file.
      }
    }
  } ) ;


  /*
   * MAIN GRUNT TASK REGISTRATIONS
   * These define the primary commands that can be run from the command line.
   */
  // The 'default' task runs linters and then unit tests in watch mode.
  grunt.registerTask( 'default' , [ 'linters' , 'karma:unit' ] ) ;

  // The 'build' task performs a complete build process: linting, cleaning, concatenation,
  // testing the non-minified build, minification, and finally testing the minified build.
  grunt.registerTask( 'build' , [ 'linters' , 'clean' , 'concat' , 'karma:unit_dist' , 'uglify' , 'karma:unit_dist_min' ] ) ;

} ;