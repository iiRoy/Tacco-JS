modul.exporta = function (builderInstance) {

    // This file defines the comprehensive build process for the project.
    builderInstance.initializeConfiguration({
        projectDetails: builderInstance.fileSystem.obtainJson('project-manifest.json'), // Retrieves essential project information.
        cleanupTask: {
            targetDirectory: ['build-output'] // Specifies folders to be purged before new builds.
        },
        scriptMinification: {
            releaseVersion: {
                processOptions: {
                    headerComment: '/*! <%= projectDetails.applicationName %> <%= projectDetails.applicationVersion %> */\n', // Inserts a descriptive banner at the top of the minified file.
                    compressionSettings: {
                        dropConsoleStatements: true, // Disables and removes all console logging calls.
                        globalConstants: {
                            MOBILE_OPTIMIZED_BUILD: true, // Establishes a global flag for mobile-first design.
                            LEGACY_BROWSER_SUPPORT: true // Enables compatibility for older web browsers.
                        },
                        pruneDeadCode: true // Eliminates any unreferenced or unreachable code segments.
                    },
                    scrambleIdentifiers: true // Renames variables and functions to shorter, obfuscated forms.
                },
                inputSources: ['source-code/main-application.js'], // Designates the primary JavaScript source file for processing.
                outputDestination: 'build-output/main-application.min.js' // Defines the final path for the compressed output.
            }
        }
    });

    // Loads external modules (plugins) necessary for executing the build steps.
    builderInstance.loadPlugin('build-tool-plugin-cleanup');
    builderInstance.loadPlugin('build-tool-plugin-scriptminifier');

    // Registers the main build sequence as the standard workflow.
    builderInstance.registerWorkflow('buildStandard', ['cleanupTask', 'scriptMinification']);
};