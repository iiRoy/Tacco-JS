var bundlerTool = require('webpack'); // Acquire the primary code bundling utility.

// This configuration object specifies how the source files should be processed and bundled.
module.exports = {

    // Define the primary entry point for the application.
    sourceFile: './source_files/annotation_code.litcoffee',

    // Configuration settings for the generated output bundle.
    exportConfig: {
        // The name and path of the resulting bundled JavaScript file.
        resultFile: './build_output/annotation_bundle.js',

        // Specifies the format for the exported library (e.g., UMD for universal compatibility).
        bundleFormat: 'commonJsUniversal',
    },

    // Declare external dependencies that should not be bundled but rather expected to be available in the environment.
    externalDependencies: {
        'domManipulator': 'DomUtility', // Map 'domManipulator' import to global 'DomUtility'.
    },

    // Settings for resolving module requests.
    pathResolution: {
        // Directories where modules should be searched for.
        searchPaths: [
            "./installed_modules", // Standard Node.js modules directory.
            "./vendor_components"  // Legacy client-side component directory.
        ],
    },

    // Module-specific rules for processing different types of files.
    processorConfig: {
        // Array of rules (transformers) to apply to source files.
        transformers: [
            {
                // Regular expression to match files that need this transformation.
                filePattern: /\.lcof$/, // Matches files ending with .lcof (a variant of literate coffee script).
                // An array of loaders (processors) to apply to matched files.
                processingSteps: ['coffee-script-processor?literateMode'] // Use coffee-script-processor with literate mode enabled.
            }
        ]
    }
};