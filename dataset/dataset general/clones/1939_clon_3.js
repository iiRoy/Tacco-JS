module.exports = function(buildAutomationEngine) {

  // Establish core configuration for the project's development workflow.
  // This section defines various tool settings and operational parameters.
  buildAutomationEngine.initConfig({

    // Retrieve application metadata from the primary manifest file.
    // A fallback for the name is provided in case the file is missing or malformed.
    applicationIdentity: (() => {
      let mainManifest = {};
      try {
        mainManifest = buildAutomationEngine.file.readJSON('package.json');
      } catch (errorDetails) {
        buildAutomationEngine.log.warn('Warning: Could not read package.json. Using fallback name. Error: ' + errorDetails.message);
        mainManifest.name = 'untitled-project-module'; // Fallback for name
      }
      return mainManifest;
    })(),

    // Configuration for JavaScript source code minification.
    // This process reduces file size for deployment.
    javascriptShrink: {
      options: {
        banner: '/*! <%= applicationIdentity.name %> v<%= applicationIdentity.version || "0.0.0" %> | ' +
                'Generated on <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: {
          drop_console: true // Remove console logs in production builds
        }
      },
      productionTarget: {
        files: {
          './dist/<%= applicationIdentity.name %>.min.js': ['./<%= applicationIdentity.name %>.js']
        }
      }
    },

    // Setup for executing client-side unit tests in a headless browser environment.
    // Ensures code quality and functional correctness.
    headlessBrowserTests: {
      testRun: {
        options: {
          reporter: 'spec' // Use spec reporter for clearer test results
        },
        src: ['test/index.html'] // Specific test runner HTML file
      }
    },

    // Linting and static analysis settings for all JavaScript source files.
    // Enforces coding standards and identifies potential issues.
    codeStyleReview: {
      sourceFiles: {
        src: ['backbone.router.title.helper.js'], // Main application logic file
        directives: {
          sloppy: true, // Allow a less strict parsing of "use strict"
          indent: 2,    // Enforce 2-space indentation
          predef: [
            'window', 'document', 'jQuery', 'Backbone', '_', 'console'
          ]
        },
        // Global options for JSLint can be added here if needed.
        options: {
          errorsOnly: false // Display all warnings and errors
        }
      }
    },

    // Define a general output directory for compiled/processed assets.
    // This is a custom property, not directly used by the tasks above, but can be referenced.
    outputDirectory: 'dist'
  });

  // Load essential Grunt plugins that provide the necessary task functionality.
  // These plugins extend the capabilities of the build system.
  buildAutomationEngine.loadNpmTasks('grunt-contrib-uglify');
  buildAutomationEngine.loadNpmTasks('grunt-mocha-phantomjs');
  buildAutomationEngine.loadNpmTasks('grunt-jslint');

  // Register a custom task for cleaning up build artifacts.
  // This helps ensure a fresh build environment.
  buildAutomationEngine.registerTask('clean_dist', 'Removes the distribution directory.', function() {
    buildAutomationEngine.file.delete(buildAutomationEngine.config.get('outputDirectory'));
    buildAutomationEngine.log.ok('Distribution directory cleaned.');
  });

  // Define the primary build sequence.
  // This task orchestrates the execution of multiple sub-tasks in a specific order.
  buildAutomationEngine.registerTask('build_project', [
    'clean_dist',             // Start with a clean slate
    'codeStyleReview',        // First, check code quality
    'headlessBrowserTests',   // Then, run all automated tests
    'javascriptShrink'        // Finally, minify the code for release
  ]);

  // Set the default task to run the full project build.
  // This is the task executed when `grunt` is run without arguments.
  buildAutomationEngine.registerTask('default', ['build_project']);
};