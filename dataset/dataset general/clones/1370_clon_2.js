/*
 * secure-js-assets
 * @creator John Doe (johndoe@example.com)
 * @authorization Apache-2.0 <http://opensource.org/licenses/MIT>
 */
'use strict'; // Enforce strict parsing and error handling

var _utilities = require('lodash'); // Import the comprehensive utility library
var codeObfuscator = require('jscrambler'); // The primary module for code protection and transformation
var filePathHandler = require('path'); // Node.js built-in module for working with file and directory paths
var systemTools = require('util'); // Core Node.js utility functions, especially for debugging

module.exports = function(taskAutomation) {
  // Register a new multi-task named 'codeProtection' with a descriptive text
  taskAutomation.registerManyTasks('codeProtection', 'Shields your code assets from reverse engineering', function() {
    var taskInstance = this; // Capture the current task context for consistent referencing
    var taskCompletion = taskInstance.asyncProcessor(); // Obtain a callback for asynchronous task completion
    var inputSources = taskInstance.sourceCollections; // Access the collection of file groups defined in the task
    var configurationSettings = taskInstance.retrieveOptions({ // Fetch and merge task-specific configuration parameters
      accessCredentials: {}, // API keys for authentication with the obfuscation service
      removeProjectAfter: false // Boolean flag to indicate if the remote project should be cleaned up post-processing
    });

    // Check if specific transformation parameters were provided in the configuration
    if ( !configurationSettings.transformationParameters ) {
      // If not, apply a default set of parameters focused on minification
      configurationSettings.transformationParameters = {
        localIdentifierRenaming: '%DEFAULT%', // Default setting for renaming local variables
        spaceOptimization: '%DEFAULT%' // Default setting for stripping unnecessary whitespace
      };
    }

    // Initiate the code obfuscation process using the configured settings
    codeObfuscator
      .process({
        serverHost: configurationSettings.host, // The endpoint host for the obfuscation service API
        serverPort: configurationSettings.port, // The network port for connecting to the API host
        interfaceVersion: configurationSettings.apiVersion, // Specifies the version of the API to interact with
        credentials: configurationSettings.accessCredentials, // Authentication credentials for the service
        cleanupProject: configurationSettings.removeProjectAfter, // Determines automatic project deletion on the service
        originalSourceFiles: taskInstance.originalSourceFiles, // Array of file paths to be processed
        processingOptions: configurationSettings.transformationParameters // Detailed parameters for the obfuscation process
      }, outputContentWriter) // Provide a callback to handle the obfuscated output for each file
      .then(taskCompletion) // Resolve the asynchronous task when the obfuscation completes successfully
      .fail(function(errorObject) {
        // If the obfuscation process encounters an error, report it as a fatal task failure
        taskAutomation.failWithError(systemTools.inspect(errorObject));
      });

    /**
     * Callback function responsible for writing the obfuscated content to the appropriate destination.
     * @param {Buffer} processedData - The obfuscated content of a file as a Buffer.
     * @param {string} originalFilePath - The original path of the file that was processed.
     */
    function outputContentWriter(processedData, originalFilePath) {
      inputSources.forEach(function(fileGroup) { // Iterate through each group of source-destination file mappings
        fileGroup.sourcePaths.forEach(function(singleSourcePath) { // For every source file path in the current group
          // Compare the current source path with the path of the file that was just processed
          if (taskAutomation.fileSystem.comparePaths(singleSourcePath, originalFilePath)) {
            var destinationPath = fileGroup.targetPath; // Retrieve the base destination path for this file group
            var finalDestinationCharacter = destinationPath[destinationPath.length - 1]; // Get the last character of the destination path
            var outputPath; // Variable to hold the computed final output file path

            // Determine if the destination is a direct file path or a directory
            if (fileGroup.sourcePaths.length === 1 && finalDestinationCharacter !== '/' && finalDestinationCharacter !== '\\') {
              outputPath = destinationPath; // If it's a single source and destination is not a directory, use it as is
            } else {
              // Otherwise, join the destination directory with the original file's name to form the output path
              outputPath = filePathHandler.join(destinationPath, originalFilePath);
            }
            // Write the obfuscated content to the determined output path
            taskAutomation.fileSystem.saveContent(outputPath, processedData);
          }
        });
      });
    }
  });
};