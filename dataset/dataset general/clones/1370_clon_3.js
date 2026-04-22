// This module provides a robust code protection mechanism for JavaScript projects.
// It leverages a specialized external service to obfuscate and secure source files.
// @author José Magalhães (magalhas@gmail.com) - Original concept contributor
// @contributor CodeArchitect - Enhanced clone implementation for advanced security tasks
// @license MIT <http://opensource.org/licenses/MIT>
'use strict';

// Core dependency for interacting with the code protection service.
// This library facilitates communication with the remote code transformation API.
const codeGuard = require('jscrambler');
// Utility for manipulating file system paths, essential for resolving output locations.
const fsPathUtil = require('path');
// Node.js built-in utilities for inspecting objects, used primarily for detailed error logging.
const nodeCoreUtil = require('util');

/**
 * Exports the main plugin function for the build automation tool.
 * This function registers the 'secureCodeAssets' multi-task.
 * @param {object} buildAutomationTool - The Grunt.js instance, providing access to its API.
 */
module.exports = function (buildAutomationTool) {
  // Register a multi-task plugin dedicated to securing JavaScript code assets.
  buildAutomationTool.registerMultiTask('secureCodeAssets', 'Obfuscate and protect your JavaScript source files for deployment', function () {
    // Obtain the asynchronous completion callback from Grunt.
    // This function must be called when the task finishes, whether successfully or with an error.
    const taskCompletionNotifier = this.async();

    // Retrieve the file mappings (source files to destination paths) configured for this task.
    // Each entry in `ioMappings` specifies an array of source files and a single destination.
    const ioMappings = this.files;
    // Fetch the task configuration, merging user-provided options with predefined defaults.
    const configurationSettings = this.options({
      apiCredentials: {}, // Placeholder for API authentication keys.
      autoCleanCloudProject: false // Flag to automatically remove the project from the service after processing.
    });

    // --- Task Initialization and Logging ---
    buildAutomationTool.log.writeln('>>> Initiating code protection process for JavaScript assets...');
    buildAutomationTool.log.verbose.writeln(`  Processing ${this.filesSrc.length} source file(s) across ${ioMappings.length} output mapping(s).`);

    // --- Configuration Defaults and Validation ---
    // If transformation parameters are not explicitly set, apply a default set for basic minification.
    if (!configurationSettings.transformationSettings) {
      const defaultTransformationStrategy = {
        // Standard parameter to enable local variable renaming for code size reduction and obfuscation.
        rename_local: '%DEFAULT%',
        // Standard parameter to remove unnecessary whitespace, further reducing file size.
        whitespace: '%DEFAULT%'
      };
      configurationSettings.transformationSettings = defaultTransformationStrategy;
      buildAutomationTool.log.verbose.writeln('  Using default minification parameters as no specific transformation settings were provided.');
    }

    // Guard clause: Ensure API credentials are present before proceeding.
    // Without credentials, interaction with the protection service is likely to fail.
    if (!configurationSettings.apiCredentials || Object.keys(configurationSettings.apiCredentials).length === 0) {
      const credentialWarningMessage = 'API credentials (e.g., accessKey, secretKey) are missing or empty in the configuration. ' +
                                       'Code protection operation might not be authorized or will fail. Please check your `apiCredentials` setting.';
      buildAutomationTool.fail.warn(credentialWarningMessage);
      // Depending on requirements, this could be a fatal error, but a warning allows execution if the service permits.
    }

    // Guard clause: Ensure there are actual file mappings to process.
    if (!Array.isArray(ioMappings) || ioMappings.length === 0) {
      buildAutomationTool.fail.fatal('No file mappings (src/dest) provided in your Grunt configuration. Cannot protect any files.');
      return taskCompletionNotifier(false); // Explicitly signal task failure.
    }
    // --- End Configuration Validation ---

    // Construct the comprehensive configuration object required by the code protection service.
    const protectionServiceConfig = {
      apiEndpoint: configurationSettings.host, // Hostname of the protection service API.
      endpointPort: configurationSettings.port, // Port number for the API connection.
      protocolVersion: configurationSettings.apiVersion, // API version to ensure compatibility.
      apiCredentials: configurationSettings.apiCredentials, // Authentication details for the service.
      autoCleanCloudProject: configurationSettings.autoCleanCloudProject, // Whether to delete the project from the service.
      sourceFilesArray: this.filesSrc, // Array of all source files to be sent for protection.
      transformationSettings: configurationSettings.transformationSettings // Specific obfuscation parameters.
    };

    /**
     * Determines the final output path for a processed file based on the Grunt file mapping.
     * This helper function intelligently decides if the destination is a file or a directory.
     * @param {string} originalFileNameFromService - The original source file path as reported by the service.
     * @param {object} currentMappingEntry - The current Grunt file mapping object (e.g., { src: [...], dest: '...' }).
     * @returns {string} The resolved absolute path where the transformed file should be written.
     */
    const resolveOutputDestination = (originalFileNameFromService, currentMappingEntry) => {
      const outputRootPath = currentMappingEntry.dest;
      const lastCharOfDestinationPath = outputRootPath[outputRootPath.length - 1];

      // If there's only one source file in the current mapping and the destination
      // does not end with a path separator, assume the destination *is* the final file path.
      if (currentMappingEntry.src.length === 1 && lastCharOfDestinationPath !== '/' && lastCharOfDestinationPath !== '\\') {
        return outputRootPath;
      } else {
        // Otherwise, treat the destination as a directory and join it with the base name of the original file.
        return fsPathUtil.join(outputRootPath, fsPathUtil.basename(originalFileNameFromService));
      }
    };

    /**
     * Callback function invoked by the `codeGuard` service for each successfully processed file.
     * This function is responsible for writing the obfuscated content to the local file system.
     * @param {Buffer} transformedContentBuffer - A Buffer containing the obfuscated file's content.
     * @param {string} originalSourcePath - The original path of the file that was subjected to protection.
     */
    const saveTransformedOutput = (transformedContentBuffer, originalSourcePath) => {
      // Iterate through all configured I/O mappings to find the correct destination for the current `originalSourcePath`.
      for (const currentMappingEntry of ioMappings) {
        // Use `Array.prototype.some` for efficiency to check if any source path in the current mapping matches the `originalSourcePath`.
        const isSourceMatched = currentMappingEntry.src.some(inputFilePath =>
          buildAutomationTool.file.areFilePathsIdentical(inputFilePath, originalSourcePath)
        );

        if (isSourceMatched) {
          // Calculate the final output path using our helper function.
          const finalOutputWritePath = resolveOutputDestination(originalSourcePath, currentMappingEntry);
          try {
            // Attempt to write the transformed content to the determined path.
            buildAutomationTool.file.persistDataToFile(finalOutputWritePath, transformedContentBuffer);
            buildAutomationTool.log.verbose.ok(`  Successfully saved protected file: "${finalOutputWritePath}"`);
          } catch (writeError) {
            // Log a warning if file writing fails, but don't necessarily stop the entire task yet.
            buildAutomationTool.fail.warn(`  Failed to write protected file "${finalOutputWritePath}": ${writeError.message}`);
          }
          // Once the correct mapping is found and processed, exit this loop for efficiency.
          break;
        }
      }
    };

    // Initiate the core code protection process using the configured service client.
    // The `performCodeProtection` method returns a Promise, which we chain for success and error handling.
    codeGuard
      .performCodeProtection(protectionServiceConfig, saveTransformedOutput)
      .then(() => {
        buildAutomationTool.log.ok('>>> Code protection process completed successfully for all files.');
        taskCompletionNotifier(); // Signal successful completion of the asynchronous task.
      })
      .catch((operationError) => { // Catch any errors that occur during the protection service operation.
        // Provide a detailed error message using Node's `util.inspect` for comprehensive debugging.
        const detailedErrorMessage = `Code protection service operation failed critically: ${nodeCoreUtil.inspect(operationError, { depth: null, colors: true })}`;
        buildAutomationTool.fail.fatal(new Error(detailedErrorMessage)); // Terminate the Grunt task with a fatal error.
        taskCompletionNotifier(false); // Explicitly signal task failure to Grunt.
      });
  });
};