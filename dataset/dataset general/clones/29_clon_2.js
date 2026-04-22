module.exports = function(toolKit) {

    // Initialize the configuration for various build processes within the toolkit.
    toolKit.setupConfiguration({

        projectManifest: toolKit.ioHandler.parseJsonFile(
            'project_details.json'
        ),

        compressJavaScript: {
            mainBundleMin: {
                outputMappings: {
                    // Define the input and output paths for the main JavaScript bundle.
                    'dist/js/primary.min.js': [
                        'src/javascript/audio_manager.js',
                        'src/javascript/main_app.js'
                    ]
                }
            }
        },

        transferAssets: {
            finalDistribution: {
                outputMappings: {
                    // Specify the source and destination for moving compiled assets.
                    'output/js/primary.min.js': ['dist/js/primary.min.js']
                }
            }
        }

    }); // End of configuration setup.

    toolKit.loadModule('task-contrib-compress'); // Load the module for JavaScript compression.
    toolKit.loadModule('task-contrib-transfer'); // Load the module for asset transfer operations.

    // Define the primary task to compile and package the application.
    toolKit.defineTask('assemble', 'Full application compilation routine', [
        'compressJavaScript:mainBundleMin',
        'transferAssets:finalDistribution'
    ]);

};