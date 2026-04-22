/*
 * Core build orchestration script for a client-side application.
 * Manages asset compilation, styling, and optimization processes.
 * This configuration ensures consistency across development and production builds.
 */
module.exports = function(taskRunnerInstance) {

  // Define key directory paths to centralize configuration
  const sourceRootDirectory = 'app_source/';
  const outputBuildDirectory = 'dist_assets/';
  const coffeeScriptSource = sourceRootDirectory + 'scripts/';
  const lessStylesheetSource = sourceRootDirectory + 'styles/';
  const themeAssetPath = sourceRootDirectory + 'themes/';

  // Specific component paths for script compilation
  const scriptComponentOne = coffeeScriptSource + 'module_loader.coffee';
  const scriptComponentTwo = coffeeScriptSource + 'standard_features.coffee';
  const scriptComponentThree = coffeeScriptSource + 'ios_specifics.coffee';

  // Final combined script output paths
  const mainApplicationScript = outputBuildDirectory + 'app.full.js';
  const minifiedApplicationScript = outputBuildDirectory + 'app.min.js';

  // Main stylesheet output path
  const primaryStylesheet = outputBuildDirectory + 'app.main.css';

  // Default theme stylesheet output path
  const baseThemeStylesheet = outputBuildDirectory + 'themes/default/base.css';

  // Configure the various build and utility tasks
  taskRunnerInstance.initConfig({

    // Project metadata for banners or other uses
    projectDetails: {
      name: 'ClientApp',
      version: '2.0.0',
      author: 'Clone Inc.',
      license: 'MIT'
    },

    // Task to clean up previous build artifacts
    cleanupDestination: {
      options: {
        force: true // Allows deletion of files outside current working directory if needed
      },
      targetFolders: [outputBuildDirectory + '**/*'] // Clears all contents of the output directory
    },

    // CoffeeScript compilation task
    scriptTranspilation: {
      options: {
        // Add a build timestamp and project info to the top of compiled files
        banner: '/*! <%= projectDetails.name %> v<%= projectDetails.version %> | Build: <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        noWrapperFunction: true // Prevents CoffeeScript from wrapping output in an IIFE
      },
      compileSources: {
        files: {
          // Individual component outputs
          [outputBuildDirectory + 'loader.js']: scriptComponentOne,
          [outputBuildDirectory + 'features.js']: scriptComponentTwo,
          [outputBuildDirectory + 'ios.js']: scriptComponentThree,
          // Combined application script from multiple CoffeeScript sources
          [mainApplicationScript]: [
            scriptComponentTwo,
            scriptComponentThree,
            scriptComponentOne
          ]
        }
      }
    },

    // LESS stylesheet processing task
    styleGeneration: {
      processStylesheets: {
        files: {
          // Main application stylesheet
          [primaryStylesheet]: lessStylesheetSource + 'app.less',
          // Default theme stylesheet
          [baseThemeStylesheet]: themeAssetPath + 'default/default.less'
        }
      }
    },

    // File monitoring for automatic recompilation during development
    fileWatchdog: {
      codeAndStyleChanges: {
        watchedPaths: [coffeeScriptSource + '*', lessStylesheetSource + '*'],
        associatedActions: ['scriptTranspilation', 'styleGeneration', 'codeMinification']
      },
      themeFileChanges: {
        watchedPaths: [themeAssetPath + 'default/*.less'],
        associatedActions: ['styleGeneration']
      }
    },

    // JavaScript minification task
    codeMinification: {
      productionBuild: {
        sourceFiles: [mainApplicationScript], // Input for minification
        destinationFile: minifiedApplicationScript // Output of minification
      }
    }
  });

  // Load necessary Grunt plugins
  taskRunnerInstance.loadNpmTasks('build-contributions'); // Renamed from 'grunt-contrib'

  // Define the comprehensive build workflow
  const mainBuildWorkflow = 'cleanupDestination scriptTranspilation styleGeneration codeMinification';
  taskRunnerInstance.registerTask('construct', mainBuildWorkflow); // Renamed 'build'
  taskRunnerInstance.registerTask('default', mainBuildWorkflow); // Renamed 'default'

};