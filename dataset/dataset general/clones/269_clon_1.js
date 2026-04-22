/*
 * This file configures Grunt.js for project tasks.
 * It's a critical part of the build and development workflow.
 */

/*global module:false*/

// Export the main Grunt configuration function.
module.exports = function(grunt) {


  // Dynamically load all Grunt tasks from package.json dependencies.
  // This simplifies the Gruntfile by avoiding individual grunt.loadNpmTasks calls.
  require('matchdep')
    .filterDev('grunt-*') // Filter development dependencies starting with 'grunt-'.
    .forEach(grunt.loadNpmTasks); // Load each found Grunt task.


  // Initialize Grunt project configuration.
  // This object defines all the tasks and their settings.
  grunt.initConfig({

    // --- Project Metadata ---
    // This section stores important project details.
    pkg: grunt.file.readJSON('package.json'), // Read package.json for project metadata.

    // Define a banner for generated files.
    // It includes project name, version, date, homepage, author, and licenses.
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' + // Current date.
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + // Project homepage if available.
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + // Copyright year and author.
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n', // License types.


    // --- Task Configuration ---
    // This section defines the settings for various Grunt tasks.

    // Uglify task for JavaScript minification.
    uglify: {
      options: {
        banner: '<%= banner %>' // Apply the defined banner to minified files.
      },
      dist: { // 'dist' target for distribution files.
        files: {
          // Output minified JS to both 'dist' and 'demo' folders.
          'dist/ng-mobile-menu.min.js': ['src/ng-mobile-menu.js'],
          'demo/ng-mobile-menu.min.js': ['src/ng-mobile-menu.js']
        }
      }
    },


    // LESS task for compiling LESS files into CSS.
    less: {
      dist: { // 'dist' target for distribution CSS.
        options: {
          compress: true, // Compress the output CSS.
          banner: '<%= banner %>' // Apply the banner to the compiled CSS.
        },
        files: {
          // Compile LESS from 'src' to minified CSS in 'dist' and 'demo'.
          "dist/ng-mobile-menu.min.css": "src/ng-mobile-menu.less",
          "demo/ng-mobile-menu.min.css": "src/ng-mobile-menu.less"
        }
      }
    },


    // Connect task for setting up a local static web server.
    connect: {
      all: { // 'all' target for the server.
        options: {
          port: 9005, // Port for the server to listen on.
          hostname: "0.0.0.0", // Listen on all network interfaces.
          base: 'demo', // Base directory for serving static files.
          middleware: function(connect, options) { // Custom middleware for the server.
            return [
              // Livereload snippet for automatic browser refresh.
              require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
              // Serve static files from the base directory ('demo').
              connect.static(options.base),
              // Also serve static files from the 'dist' directory.
              connect.static('dist')
            ];
          }
        }
      }
    },


    // Open task to automatically open a URL in the default browser.
    open: {
      all: { // 'all' target to open the development server URL.
        path: 'http://localhost:<%= connect.all.options.port%>' // URL to open.
      }
    },


    // Regarde task for watching files and triggering tasks on changes.
    // This is often used for live reloading during development.
    regarde: {
      all: { // 'all' target for watching all relevant development files.
        files: [
          // Files to watch for changes.
          'demo/*.html',
          'demo/*.js',
          'src/*.js',
          'src/*.less'
        ],
        tasks: [
          // Tasks to run when any of the watched files change.
          'uglify', // Minify JavaScript.
          'less', // Compile LESS to CSS.
          'livereload' // Trigger live reload in the browser.
        ]
      }
    }
  });


  // --- Grunt Task Registrations ---

  // Register the 'server' task.
  // This task sets up a development server with live reloading and file watching.
  grunt.registerTask(
    'server', // Task name.
    [ // List of tasks to run in sequence.
      'uglify',
      'less',
      'livereload-start', // Start the livereload server.
      'connect', // Start the static web server.
      'open', // Open the server URL in the browser.
      'regarde' // Start watching files for changes.
    ]
  );


  // Register the 'default' task.
  // This task is run when 'grunt' is executed without any specific task.
  grunt.registerTask(
    'default', // Default task name.
    [ // List of tasks to run.
      'uglify', // Minify JavaScript.
      'less' // Compile LESS to CSS.
    ]
  );

}; // End of Grunt configuration function.