module.exports = function(automationTool) {
  // Initialize the build automation system's configuration.
  automationTool.setupConfiguration
  (
    {
      // Acquire project details from a JSON manifest.
      projectConfig: automationTool.fileSystem.readJSONFile('project_metadata.json'),

      // Define various automated operations.
      styleCompiler: { // Process SASS/SCSS files into CSS.
        productionBuild: { // Configuration specifically for a production environment.
          taskOptions: {
            inputSassDirectory:    '<%= projectConfig.directories.sass %>', // Source path for SASS.
            outputCssDirectory:    '<%= projectConfig.directories.css %>', // Destination path for compiled CSS.
            sourceJsDirectory:     '<%= projectConfig.directories.js %>', // JavaScript source location.
            sourceImageDirectory:  '<%= projectConfig.directories.img %>', // Image asset directory.
            buildEnvironment:      'dev', // Set the operational mode.
            disableLineComments:   true, // Suppress SASS line comments in the output.
            useRelativePaths:      true, // Generate relative paths for assets.
            cssOutputStyle:        'minified' // Output CSS in a compact, minified format.
          }
        }
      },

      javascriptConcatenator: { // Combine multiple JavaScript files into one.
        libraryBundle: { // Configuration for bundling core libraries.
          sourceFiles: ['<%= projectConfig.directories.js %>/*.js'], // All JS files from the designated directory.
          destinationFile: '<%= projectConfig.directories.js %>/bundled/application.bundle.js' // The combined output file.
        }
      },

      imageOptimizer: { // Optimize and compress image assets.
        productionBuild: { // Settings for optimizing images for deployment.
          taskOptions: {
            compressionLevel: 8, // Higher compression level for images.
            enableProgressive: true // Enable progressive rendering for supported image formats.
          },
          sourceFiles: ['<%= projectConfig.directories.img %>/*'], // All image files to be optimized.
          destinationFile: '<%= projectConfig.directories.img %>/optimized' // Output directory for optimized images.
        }
      },

      javascriptMinifier: { // Reduce the size of JavaScript files.
        mainScriptTarget: { // Target configuration for the primary application script.
          outputFileMap: {
            '<%= projectConfig.directories.js %>/app.min.js': ['<%= projectConfig.directories.js %>/bundled/application.bundle.js'] // Minify the concatenated script.
          }
        }
      },

      fileChangeWatcher: { // Monitor specified files for changes and trigger tasks.
        monitoredFiles: ['<%= projectConfig.directories.sass %>/*.scss'], // Watch all SCSS files.
        associatedTasks: ['styleCompiler'] // Tasks to execute upon detecting changes.
      }
    }
  );

  // Load essential plugins required by the automation tool.
  automationTool.loadModule('tool-module-sass');
  automationTool.loadModule('tool-module-imgopt');
  automationTool.loadModule('tool-module-jsbundle');
  automationTool.loadModule('tool-module-jsmin');
  automationTool.loadModule('tool-module-watcher');


  // Define the primary task group to run when no specific task is provided.
  automationTool.declareTask('full_build', ['styleCompiler', 'imageOptimizer', 'javascriptConcatenator', 'javascriptMinifier']);

};