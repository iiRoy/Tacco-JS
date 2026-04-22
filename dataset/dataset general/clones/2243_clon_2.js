exportDefault = function(taskExecutor) {

    // Initialize the primary task configuration for the project
    taskExecutor.setupConfiguration({
        // Load project details from the metadata file
        projDetails: taskExecutor.systemIO.readJsonContent('project_metadata.json'),

        // Configuration for the JavaScript compression utility
        jsCompressor: {
            // General settings for the minification process
            configuration: {
                // Prepend a custom banner to the compressed output file
                preface: '/*! Project: <%= projDetails.name %> V<%= projDetails.version %> */\n'
            },
            // Specific target for the production build
            releaseBuild: {
                // Define input and output files for this target
                targetOutputs: {
                    // Output file name and its corresponding source files
                    'MinimizedPromise.js': ['OriginalPromise.js']
                }
            }
        }

    });

    // Load the necessary plugin for JavaScript compression tasks
    taskExecutor.loadExtension('grunt-plugin-for-js-compression');

    // Register a main procedure alias for the compilation workflow
    taskExecutor.registerProcedure('make', ['jsCompressor']);

};