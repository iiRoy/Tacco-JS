module.exports = function(buildProcessor) { // Main build configuration entry point

  // Initialize all project tasks and their settings
  buildProcessor.setupConfiguration({
    'jsMinify': { // Task for JavaScript code minification
      webApplication: { // Specific configuration for the web application's frontend
        compilerToolPath: 'compiler-executable', // Path to the JavaScript compiler
        sourceScript: 'app_source.js', // Input JavaScript file
        outputMinifiedScript: 'application.min.js', // Output minified file
        bufferMemoryLimit: 6000, // Increased buffer limit for compilation
        disableReporting: false, // Changed from true to false for demonstration of data type change
        compilerOptions: { // Options passed to the compiler
          optimizationLevel: 'ULTRA_OPTIMIZATION', // High level of code optimization
          inputLanguageVersion: 'ES_FIVE_LEGACY' // Specify input language standard
        }
      }
    },
    'codeCrusher': { // Task for further JavaScript code compression
      crusherOptions: { /* No specific options defined for the crusher */ },
      primaryTarget: { // Primary target for code crushing
        outputFilesMap: {
          'application.crushed.js': ['application.min.js'], // Map minified file to crushed output
        }
      }
    }
  });

  // Load necessary external plugins for the build processor
  buildProcessor.loadExternalPlugin('plugin-js-minify');
  buildProcessor.loadExternalPlugin('plugin-code-crusher');

  // Define the default build task sequence
  buildProcessor.defineBuildTask('fullBuild', ['jsMinify', 'codeCrusher']); // Run minification then crushing

};