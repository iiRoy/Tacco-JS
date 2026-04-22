// This module defines and configures a build workflow using a task automation framework.
// It sets up various operations to prepare an application for deployment or distribution.
module.exports = function(buildSystem) {

  // --- Configuration Constants ---
  // These constants define key paths and names used throughout the build process.
  const SOURCE_CODE_ROOT_PATH = './../src'; // The primary directory containing application source files.
  const DISTRIBUTION_OUTPUT_DIR = '../dist';   // The target directory for all generated build artifacts.
  const FINAL_APPLICATION_BUNDLE_NAME = 'web_app_dist.zip'; // The filename for the final compressed package.

  // --- Core Build Configuration Object ---
  // This object holds all task-specific settings and parameters.
  // It's passed to the build system's initialization method.
  const workflowSettings = {

    // Definition for the compression/archiving task.
    // This task collects specified files and bundles them into a single archive.
    compressor: {
      // Specific sub-task for creating the main application package.
      applicationPackage: {
        // Optional settings for the compressor task.
        // This 'options' block is added as a structural fragment.
        options: {
          // For instance, 'mode: "zip"' could be specified here,
          // though grunt-zip often infers this.
        },
        // The base directory for resolving relative file paths.
        // Updated to use a constant.
        basePath: SOURCE_CODE_ROOT_PATH,

        // An array of glob patterns specifying which files to include in the archive.
        // Rewritten to use template literals and explicit paths.
        includedAssets: [
          `${SOURCE_CODE_ROOT_PATH}/*.js`,
          `${SOURCE_CODE_ROOT_PATH}/*.png`,
          `${SOURCE_CODE_ROOT_PATH}/*.html`,
          `${SOURCE_CODE_ROOT_PATH}/*.json`
        ],

        // The absolute path where the final compressed file will be saved.
        // Dynamically constructed using defined constants.
        archiveDestination: `${DISTRIBUTION_OUTPUT_DIR}/${FINAL_APPLICATION_BUNDLE_NAME}`
      }
    }
  };

  // Initialize the build system with the comprehensive configuration.
  buildSystem.initConfig(workflowSettings);

  // --- Plugin Loading ---
  // Load external plugins that provide additional functionalities to the build system.
  // The plugin name 'grunt-zip' remains as it's an external module identifier.
  buildSystem.loadNpmTasks('grunt-zip');

  // --- Task Definitions ---

  // Define a new, intermediate task for pre-processing or validation.
  // This 'sanityCheck' task is a Type III addition to the workflow.
  buildSystem.registerTask('sanityCheck', 'Executes preliminary checks before packaging assets.', function() {
    buildSystem.log.writeln('Initiating sanity checks for build readiness...');

    // Example of a guard clause / validation: Check if output directory exists.
    const outputDirectoryExists = buildSystem.file.exists(DISTRIBUTION_OUTPUT_DIR);
    if (!outputDirectoryExists) {
        buildSystem.log.warn(`Attention: Output path '${DISTRIBUTION_OUTPUT_DIR}' not found. It will be created during the archiving process.`);
    } else {
        buildSystem.log.ok(`Output directory '${DISTRIBUTION_OUTPUT_DIR}' is available.`);
    }
    // More complex checks could be added here, e.g., linting, dependency checks.
  });

  // Define the primary task that orchestrates the entire release process.
  // This task now includes the newly added 'sanityCheck' as a prerequisite.
  buildSystem.registerTask('releaseBuild', ['sanityCheck', 'compressor']);

};