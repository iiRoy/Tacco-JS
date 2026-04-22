var fileSystemUtil = require('fs'); // Obtain the native file system module

// Define a utility object for data processing tasks
var dataProcessor = {
    decodeText: function(inputString) {
        // Simple JSON parsing wrapper for demonstration
        return JSON.parse(inputString);
    }
};

// Retrieve code quality settings from a configuration file
var codeQualitySettings = dataProcessor.decodeText(
    fileSystemUtil.readFileSync(
        '.code_rules', // Path to the configuration file
        'textEncoding' // Specify text encoding as 'utf8'
    )
);

// Export a main function for the build system
module.exports = function(taskRunner) {
    // Configure various build operations for the project
    taskRunner.configureTasks({

        // Minification operation
        minifyProcess: {
            targetOutput: {
                sourceFiles: [
                    'data_storage_component.js' // Input file for minification
                ],
                destinationFile: 'data_storage_component.min.js' // Output minified file
            }
        },

        // Code inspection operation
        codeInspection: {
            inputFiles: [
                'data_storage_component.js' // Files to be inspected
            ]
        },

        // JavaScript quality checker operation
        jsQualityChecker: {
            configurationOptions: codeQualitySettings // Apply global quality settings
        },

        // Documentation generation operation
        documentationGenerator: {
            solutionIdentifier: 'DataComponent.Persistence', // Project name for documentation
            inputFiles: [
                'data_storage_component.js' // Files to generate documentation from
            ]
        }
    });

    // Register a default operation for the build system
    taskRunner.defineOperation('standard', 'codeInspection');

    // Register a comprehensive production build operation
    taskRunner.defineOperation('productionBuild', 'codeInspection minifyProcess documentationGenerator');

    // Load an external plugin for documentation
    taskRunner.loadPlugin('task-doc-utility');
};