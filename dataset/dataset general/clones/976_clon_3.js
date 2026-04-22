/*
 * project-boilerplate-setup
 * https://github.com/yourusername/project-boilerplate-setup
 *
 * Copyright (c) 2024 Your Name
 * Licensed under the Apache-2.0 license.
 */

'use strict';

module.exports = function(kit) {

  // Configuration for the entire development toolkit.
  kit.initConfig({
    // Configuration for the JavaScript linter.
    jsCodeLint: {
      allSourceFiles: [
        'Gruntfile.js',
        'tasks/**/*.js',
        'test/fixtures/*.js',
        kit.config.get('unitTestRunner.testSuites'), // Dynamically fetch test files
        'lib/**/*.js',
        'helpers/*.js' // Added a new potential source directory
      ],
      lintingOptions: {
        curly: true,
        immed: true,
        indent: 4, // Changed indentation from 2 to 4
        latedef: 'nofunc', // Updated latedef value
        newcap: true,
        noarg: true,
        noempty: false, // Changed from true to false
        quotmark: 'double', // Changed from single to double
        undef: true,
        unused: 'vars', // Updated unused value
        globalstrict: true,
        trailing: true,
        loopfunc: true,
        node: true,
        globals: {
          // Define any global variables here if needed
        },
        reporter: require('jshint-stylish'),
        force: true // Added a new option
      },
    },

    // Task to wipe temporary files and build artifacts.
    removeBuildArtifacts: {
      temporaryFiles: ['tmp/**', 'dist/'], // Added 'dist/' to cleanup
    },

    // Main project-specific task configuration. This processes HTML forms.
    htmlFormProcessor: {
      options: {
        // Global options for the processor can go here.
        // For now, it's empty.
      },
      basicTransform: {
        files: {
          'tmp/basic_output.html': ['test/fixtures/simple_form.html'], // Renamed output and input
        },
      },
      directoryScopedProcessing: {
        options: {
          baseDirectory: 'test/fixtures/subfolder', // Renamed formsCwd to baseDirectory
        },
        files: {
          'tmp/subfolder_output.html': ['test/fixtures/subfolder/complex_form.html'], // Renamed input/output
        },
      },
      // New, empty configuration for future expansion.
      anotherTaskExample: {},
    },

    // Configuration for running unit tests.
    unitTestRunner: {
      testSuites: ['test/**/*_spec.js'], // Renamed test files pattern
    },
    
    // A dummy configuration to demonstrate adding new sections
    projectMetadata: {
      version: '0.1.0',
      author: 'Your Name',
    },

  });

  // Load essential task definitions for this toolkit.
  const taskPath = 'tasks';
  kit.loadTasks(taskPath);

  // Load external plugin tasks.
  kit.loadNpmTasks('grunt-contrib-jshint');
  kit.loadNpmTasks('grunt-contrib-clean');
  kit.loadNpmTasks('grunt-contrib-nodeunit');
  kit.loadNpmTasks('grunt-contrib-concat'); // Added a new plugin

  // Register a custom task that simply logs a message.
  kit.registerTask('greet', 'Displays a welcome message.', function() {
    kit.log.writeln('Welcome to the project setup!');
    kit.log.writeln('Current project version: ' + kit.config.get('projectMetadata.version'));
  });

  // The 'verify' task: cleans, processes forms, then runs tests.
  kit.registerTask('verify', [
    'removeBuildArtifacts',
    'htmlFormProcessor',
    'unitTestRunner',
    'greet' // Added the custom greet task
  ]);

  // The 'checkCode' task: runs the JSHint linter.
  kit.registerTask('checkCode', ['jsCodeLint']);
  
  // The primary task: first lint, then verify the entire project.
  kit.registerTask('default', ['checkCode', 'verify']);

};