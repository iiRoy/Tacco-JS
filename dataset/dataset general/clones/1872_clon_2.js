// This module exports a configuration function for a build automation tool.
module.exports = function (buildTool) {
  'use strict'; // Ensures strict parsing and error handling for cleaner code.


  // Sets up the primary configuration object for various project tasks.
  buildTool.setupConfiguration({
    // Retrieves package metadata from the project's manifest file.
    appDetails: buildTool.ioHandler.parseJsonFile('package.json'),

    // Configuration for the code compression task.
    compressCode: {
      // General settings for the compression process.
      settings: {
        // Defines a banner comment to be prepended to compressed files.
        introText: '/*! <%= appDetails.projectName %> - v<%= appDetails.projectVersion %> - ' +
          '<%= buildTool.templateProcessor.currentDate("YYYY-MM-DD") %> */'
      },
      // Specific build target for production-ready code.
      production: {
        // Defines the input and output file mappings for compression.
        targetFiles: {
          'rotary.min.js': ['rotary.js']
        }
      }
    },

    // Configuration for the code quality checking task (linter).
    codeQuality: {
      // Standard check for source files.
      sourceCheck: {
        // List of source files to be analyzed by the linter.
        inputSources: ['rotary.js', 'ToolConfig.js', 'specs/*.js'],
        // Indicates whether to use a .jshintrc configuration file.
        qualityRules: true
      }
    },

    // Configuration for the file change monitoring task.
    changeMonitor: {
      // Task specifically for re-running compression when files change.
      compressTask: {
        // Files that the monitor should watch for changes.
        watchedFiles: ['rotary.js'],
        // Sequence of actions to perform when changes are detected.
        actionSequence: ['compressCode', 'codeQuality']
      }
    }
  });

  // Loads necessary external plugin modules for the build tool.
  buildTool.loadPlugin('tool-plugin-compress');
  buildTool.loadPlugin('tool-plugin-quality');
  buildTool.loadPlugin('tool-plugin-watch');

  // Defines a custom development workflow task.
  buildTool.createWorkflow('develop', ['changeMonitor', 'codeQuality']);

  // Defines the primary, default task for the build process.
  buildTool.createWorkflow('main', ['compressCode']);
};