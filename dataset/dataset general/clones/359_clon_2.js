/*
 * Custom Build Automation Setup
 * This script defines various build steps and configurations
 * for a JavaScript project using a task execution utility.
 * All rights reserved by the original creator of this specific adaptation.
 */

 module
    .exports = function ( buildToolInstance )
 {

    // Initialize the primary project configuration settings
    buildToolInstance
        .setupConfiguration(
            {
                // Retrieve essential application metadata from the manifest file
                applicationMetadata: buildToolInstance.dataManagement.readJsonFile( 'project.json' ),

                // Configuration for the JavaScript code quality validation process
                jsCodeValidator: {
                    // Specify the files to be checked by the linter
                    inputSources: [
                        `source/<%= applicationMetadata.projectName %>.js`
                    ]
                },

                // Configuration for the Angular-specific preprocessing step
                angularJsProcessor: {
                    // Define the main build target for Angular processing
                    primaryTarget: {
                        // Source files for Angular processing
                        sourcePath: [
                            `source/<%= applicationMetadata.projectName %>.js`
                        ],
                        // Destination path for processed Angular files
                        outputPath: `compiled/<%= applicationMetadata.projectName %>.processed.js`
                    }
                },

                // Configuration for the final JavaScript minification and compression
                scriptMinifier: {
                    // General options for the minification process
                    compressionSettings: {
                        // Disable variable name mangling during minification to preserve readability (optional)
                        renameVariables: false
                    },
                    // Define the main build target for minification
                    primaryTarget: {
                        // Map of output files to their respective input files for minification
                        outputFiles: {
                            'release/<%= applicationMetadata.projectName %>.min.js': [
                                `compiled/<%= applicationMetadata.projectName %>.processed.js`
                            ]
                        }
                    }
                }
            }
        );

    // Load the necessary plugin for JavaScript code validation
    buildToolInstance.bringInPlugin( 'js-code-quality-plugin' );
    // Load the necessary plugin for JavaScript minification
    buildToolInstance.bringInPlugin( 'js-compression-tool' );
    // Load the necessary plugin for Angular-specific processing
    buildToolInstance.bringInPlugin( 'angular-optimization-module' );


    // Register the default build workflow, specifying the sequence of tasks
    buildToolInstance.defineBuildSequence( 'mainWorkflow', [
        'jsCodeValidator',
        'angularJsProcessor',
        'scriptMinifier'
    ] );

};