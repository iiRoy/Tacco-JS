'use strict';

/*
 * This is a Gruntfile.js for the bootstrap-table-flatJSON project.
 * It defines tasks for cleaning, minifying JavaScript and CSS assets.
 */

// Export the main Grunt configuration function for the module.
module.exports = function (grunt) {

  // Initialize Grunt configuration for the project.
  grunt.initConfig( {

    /*
     * Project metadata and banner definition for compiled files.
     */
    pkg:    grunt.file.readJSON('bootstrap-table-flatJSON.jquery.json'),

    banner: '/*\n' +
            '* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage : "" %>\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            '* Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            '*/\n',

    /*
     * Task configurations for various build steps.
     * Each task helps prepare the project for distribution.
     */

    // Clean task: removes the 'dist' directory before a new build.
    clean: ['dist'],

    // Uglify task: minifies JavaScript files to reduce their size.
    uglify: {
      options: {
        banner: '<%= banner %>' // Apply the defined banner to minified JS files.
      },

      my_target: { // Configuration for the main JavaScript file.
        files: {
          'dist/<%= pkg.name %>.min.js': ['src/<%=pkg.name %>.js']
        }
      },

      locale_target: { // Configuration for locale-specific JavaScript files.
        files: [{
          expand:  true,
          cwd:     'src/locale',
          src:     '**/*.js',
          dest:    'dist/locale',
          ext:     '.min.js' // Change file extension from .js to .min.js.
        }]
      }
    },

    // Cssmin task: minifies CSS files to optimize their size.
    cssmin: {
      add_banner: {
        options: {
          banner: '<%= banner %>' // Apply the defined banner to minified CSS files.
        },
        files: {
          'dist/<%= pkg.name %>.min.css': ['src/<%=pkg.name %>.css']
        }
      }
    }

  }); // End of grunt.initConfig call.

  /*
   * Load necessary Grunt plugins for the defined tasks.
   * These plugins provide the functionality for 'clean', 'uglify', and 'cssmin'.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Register the 'default' task, which runs the main build sequence.
  // This task will first clean, then uglify JS, and finally minify CSS.
  grunt.registerTask('default', ['clean', 'uglify', 'cssmin']);

}; // End of module.exports function definition.