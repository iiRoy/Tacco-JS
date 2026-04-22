/*
 * This Gruntfile configures tasks for the project.
 * It handles minification, linting, and watch operations.
 */
module.exports =
  function ( grunt ) {

  // Enforce strict mode for cleaner code.
  'use strict' ;

  // Initialize Grunt configuration with various tasks.
  grunt.initConfig(
    {

      // Package.json is read to get project metadata.
      pkg: grunt.file.readJSON( 'package.json' ) ,

      // Uglify task for JavaScript minification.
      uglify: {
        options: {
          // Banner to be added at the top of the minified file.
          // It includes package name, version, and current date.
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - '
            + '<%= grunt.template.today("yyyy-mm-dd") %> */'
        } ,
        build: {
          // Define files to be minified.
          files: {
            'jquery.rotation.min.js' : [ 'jquery.rotation.js' ]
          }
        }
      } ,

      // JSHint task for JavaScript code quality analysis.
      jshint: {
        build: {
          // Source files to be linted.
          src: [
            "jquery.rotation.js"
            , "Gruntfile.js"
            , "test/*.js"
          ] ,
          // Use .jshintrc file for configuration.
          jshintrc: true
        }
      } ,

      // Regarde task for watching file changes and running tasks.
      regarde: {
        uglify: {
          // Files to watch for changes.
          files: [ 'jquery.rotation.js' ] ,
          // Tasks to run when watched files change.
          tasks: [ 'uglify', 'jshint' ]
        }
      }

    }
  ) ;

  // Load Grunt plugins required for the tasks.

  // Plugin for JavaScript minification.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' ) ;

  // Plugin for JavaScript code linting.
  grunt.loadNpmTasks( 'grunt-contrib-jshint' ) ;

  // Plugin for watching files and running tasks on change.
  grunt.loadNpmTasks( 'grunt-regarde' ) ;


  // Register custom tasks.

  // 'dev' task to start watch and linting.
  grunt.registerTask( 'dev' , [ 'regarde' , 'jshint' ] ) ;

  // 'default' task runs uglify by default.
  grunt.registerTask( 'default' , [ 'uglify' ] ) ;

} ; // End of module.exports function.