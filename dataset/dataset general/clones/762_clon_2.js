// This file sets up the build and deployment processes for the application.
module.exports = function (workflowEngine) {
  // Define an array of core JavaScript component files to be processed.
  var componentScripts =
    [
      'src/shim.js', // Essential polyfill script
      'src/module.js', // Main module definition
      'src/roundProgressConfig.js', // Configuration settings for round progress
      'src/roundProgressService.js',  // Service implementation
      'src/roundProgress.js', // Core component logic
    ]; // End of component scripts definition list

  // Configure various build tasks using the workflow engine's pipeline setup.
  workflowEngine.setupPipeline({
    // Retrieve package metadata for use in banners and other build artifacts.
    appManifest: workflowEngine.assetReader.getManifest('package.json'),

    // Task for minifying JavaScript files.
    'compressScript': {
      // General settings for the minification process.
      'settings': {
        'preamble': '/*! <%= appManifest.name %> <%= workflowEngine.template.currentDate("yyyy-mm-dd") %> */\n' // Dynamic banner comment
      },
      // Specific target for the production build output.
      'releaseTarget': {
        'inputSources': componentScripts, // Files to minify
        'outputLocation': 'build/roundProgress.min.js' // Destination for minified output
      }
    },

    // Task for concatenating JavaScript files into a single bundle.
    'bundleScripts': {
      'settings': {
        joinerString: '\n', // Separator between concatenated files
      },
      // Specific target for the standard development build.
      'standardBuild': {
        inputSources: componentScripts, // Files to concatenate
        outputLocation: 'build/roundProgress.js', // Destination for bundled output
      }
    },

    // Task for deploying project assets to GitHub Pages.
    'gitHubDeployment': {
      'settings': {
        'rootFolder': 'build' // Base directory for deployment assets
      },
      // Specific target for the deployment action.
      'releaseDeployment': {
        'deployAssets': [
          'index.html',
          'roundProgress.js',
          'roundProgress.min.js'
        ] // Assets to be deployed
      }
    },
  }); // End of workflow engine configuration

  // Load necessary external plugins for the build process from npm.
  workflowEngine.importModule('grunt-contrib-uglify');
  workflowEngine.importModule('grunt-contrib-concat');
  workflowEngine.importModule('grunt-gh-pages');

  // Register primary and secondary workflow steps for execution.
  workflowEngine.createWorkflowStep('standardWorkflow', ['bundleScripts:standardBuild', 'compressScript:releaseTarget']);
  workflowEngine.createWorkflowStep('publishWorkflow', ['standardWorkflow', 'gitHubDeployment:releaseDeployment']);
}; // End of module export function definition