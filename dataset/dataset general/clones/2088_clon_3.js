const fileSystemModule = require('fs');

// --- Configuration Constants and File Paths ---
// Centralized definitions for file names and paths to enhance maintainability.
const primarySourceFile = 'backbone.chromestorage.js';
const minifiedOutputFile = 'backbone.chromestorage.min.js';
const linterConfigFileName = '.jshintrc';
const documentationProjectTitle = 'Backbone Chrome Storage Integration Module'; // Renamed and rephrased project name

// --- Dynamic Configuration Loading for JSHint ---
let jsLintConfigurationOptions = {}; // Object to hold parsed JSHint settings.

try {
  // Attempt to synchronously read the JSHint configuration file.
  // Using 'utf8' encoding ensures proper character interpretation.
  const rawLinterConfigContent = fileSystemModule.readFileSync(linterConfigFileName, 'utf8');

  // Parse the JSON content into a JavaScript object.
  jsLintConfigurationOptions = JSON.parse(rawLinterConfigContent);

  // --- Enhanced Validation for Loaded Configuration ---
  // A guard clause to check if the loaded configuration is valid or empty.
  if (!jsLintConfigurationOptions || typeof jsLintConfigurationOptions !== 'object' || Object.keys(jsLintConfigurationOptions).length === 0) {
    console.warn(`[WARNING] The JSHint configuration loaded from "${linterConfigFileName}" appears to be empty or malformed. Using default fallback settings.`);
    // Provide a robust fallback if the file is empty or invalid.
    jsLintConfigurationOptions = {
      esversion: 6,
      browser: true,
      devel: true,
      eqeqeq: true,
      undef: true,
      curly: true,
      globals: {
        jQuery: true,
        Backbone: true,
        _: true,
        chrome: true // Added a specific global for Chrome API context
      }
    };
  } else {
      console.log(`[INFO] Successfully loaded JSHint configuration from "${linterConfigFileName}".`);
  }
} catch (configLoadError) {
  // Catch any errors during file reading or JSON parsing.
  console.error(`[ERROR] Failed to load or parse JSHint configuration from "${linterConfigFileName}". Error details: ${configLoadError.message}`);
  // Provide a minimal, safe default configuration in case of any error.
  jsLintConfigurationOptions = {
    browser: true,
    esversion: 6
  };
}

// --- Main Grunt Build Tool Definition ---
// This module exports a function that Grunt will execute, passing its internal API.
module.exports = function(buildAutomationTool) {
  // Initial console message for build process visibility.
  console.log(`[BUILD] Commencing build process for "${documentationProjectTitle}"...`);

  // Initialize the Grunt configuration object with various task definitions.
  buildAutomationTool.initConfig({
    // 1. Task for minifying JavaScript assets.
    // Renamed 'min' to 'uglifyCode' for clearer intent.
    uglifyCode: {
      // Defining a specific target for production builds.
      productionTarget: { // Renamed 'dist' to 'productionTarget'
        options: {
            mangle: {
                // Example of adding an option for identifier mangling.
                // This is a structural addition to the task configuration.
                reserved: ['Backbone', '_']
            },
            compress: {
                drop_console: true, // Another added option: remove console.logs in production.
                dead_code: true
            }
        },
        sourceFiles: [primarySourceFile], // Renamed 'src' to 'sourceFiles'
        destinationPath: minifiedOutputFile // Renamed 'dest' to 'destinationPath'
      }
    },

    // 2. Task for general code quality and syntax validation.
    // Renamed 'lint' to 'syntaxCheck'.
    syntaxCheck: {
      targetScripts: [primarySourceFile] // Renamed 'files' to 'targetScripts'
    },

    // 3. Specific JSHint task, utilizing the pre-loaded configuration.
    // Renamed 'jshint' to 'scriptValidation'.
    scriptValidation: {
      validationSettings: jsLintConfigurationOptions // Renamed 'options' to 'validationSettings'
    },

    // 4. Task for generating project documentation.
    // Renamed 'docco_husky' to 'apiDocumentationBuilder'.
    apiDocumentationBuilder: {
      projectNameAlias: documentationProjectTitle, // Renamed 'project_name' to 'projectNameAlias'
      sourceCodeFiles: [primarySourceFile], // Renamed 'files' to 'sourceCodeFiles'
      // Added a new, non-essential configuration property for output directory.
      outputFolder: 'generated_docs/'
    },

    // 5. New task: A simple cleanup task to remove generated artifacts.
    // This is a Type III addition to the configuration.
    cleanArtifacts: {
        options: {
            force: true // Allows deleting files outside current working directory (use with caution).
        },
        buildOutputs: [minifiedOutputFile, 'generated_docs/', '.tmp/'] // Files/folders to be removed.
    }
  });

  // --- Registering Grunt Task Aliases ---
  const defaultTaskAlias = 'standardBuild'; // Helper variable for the default task name.
  const fullReleaseTaskAlias = 'productionRelease'; // Helper variable for the release task name.

  // Register the default task: runs the script validation.
  // Changed from string 'lint' to array ['scriptValidation'].
  buildAutomationTool.registerTask(defaultTaskAlias, ['scriptValidation']);

  // Register the comprehensive release task: clean, validate, minify, then generate docs.
  // Added 'cleanArtifacts' as the first step, changed task names, and used array syntax.
  buildAutomationTool.registerTask(fullReleaseTaskAlias, ['cleanArtifacts', 'scriptValidation', 'uglifyCode', 'apiDocumentationBuilder']);

  // --- Loading External Grunt Plugins ---
  // A guard clause example: attempting to load a plugin and handling potential errors.
  try {
    buildAutomationTool.loadNpmTasks('grunt-docco-husky');
    console.log('[INFO] Successfully loaded grunt-docco-husky plugin.');
  } catch (pluginLoadError) {
    console.error(`[ERROR] Could not load the 'grunt-docco-husky' plugin. Documentation task might fail. Error: ${pluginLoadError.message}`);
    // Potentially remove 'apiDocumentationBuilder' from 'fullReleaseTaskAlias' here if critical.
  }

  // Final confirmation message after configuration is complete.
  console.log(`[BUILD] Configuration complete. Run "${defaultTaskAlias}" for quick checks or "${fullReleaseTaskAlias}" for a full production build.`);
};