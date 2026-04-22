/*
 * This module orchestrates build processes for the application.
 * It configures a task management system to handle compilation and optimization steps.
 */
module.exports = (taskOrchestrator) => {

    // Define critical path constants for clarity and maintainability.
    const applicationManifestPath = 'package.json';
    const originalLibrarySource = 'Promise.js';
    const optimizedLibraryTarget = 'dist/promise.optimized.min.js'; // Changed target path and name

    /**
     * Safely extracts project metadata from the application manifest.
     * Includes error handling and provides fallback values.
     * @param {object} orchestrator The task orchestrator instance.
     * @returns {object} An object containing project name and version.
     */
    const obtainProjectDetails = (orchestrator) => {
        try {
            const manifestData = orchestrator.file.readJSON(applicationManifestPath);
            // Guard clause: Ensure essential properties exist
            if (!manifestData || !manifestData.name || !manifestData.version) {
                orchestrator.log.warn(`Warning: Incomplete project details in ${applicationManifestPath}. Using defaults.`);
                return { appName: 'unnamed-application', appVersion: '0.0.0-dev' };
            }
            return {
                appName: manifestData.name,
                appVersion: manifestData.version
            };
        } catch (err) {
            orchestrator.log.error(`Failed to load project manifest at ${applicationManifestPath}: ${err.message}`);
            return { appName: 'error-application', appVersion: 'error' };
        }
    };

    const currentApplicationInfo = obtainProjectDetails(taskOrchestrator);
    // Introduce an intermediate variable for version string formatting
    const appVersionString = `v${currentApplicationInfo.appVersion}`;

    // Initialize the build system's configuration.
    taskOrchestrator.initConfig({
        // Store the retrieved application metadata directly in the config.
        applicationMetadata: currentApplicationInfo,

        // Configuration for the JavaScript minification utility.
        jsMinifier: {
            // Removed the 'banner' option entirely as a non-essential statement.
            // pluginSettings: {
            //     headerComment: `/*! ${currentApplicationInfo.appName} ${appVersionString} | Minified on ${new Date().toISOString().slice(0, 10)} */\n`
            // },
            releaseBuild: {
                // Using a computed property name for the output file
                buildTargets: {
                    [optimizedLibraryTarget]: [originalLibrarySource]
                }
            }
        },

        // Adding a new, simple cleanup task for build artifacts (Type III addition).
        assetCleaner: {
            options: {
                force: true // Allows deletion of files outside current working directory
            },
            temporaryFiles: {
                src: ['temp/', 'build/*.tmp', 'dist/*.map']
            }
        },

        // Adding a new dummy task for logging (Type III addition)
        logStatus: {
            buildStart: {
                message: `Starting build for ${currentApplicationInfo.appName} ${appVersionString}...`
            }
        }
    });

    // Load necessary external plugins for the build tasks.
    taskOrchestrator.loadNpmTasks('grunt-contrib-uglify'); // Original plugin name
    taskOrchestrator.loadNpmTasks('grunt-contrib-clean');  // Added new plugin for cleanup
    // Simulate loading another custom plugin (e.g., if 'logStatus' was an external one)
    taskOrchestrator.loadNpmTasks('grunt-newer'); // Dummy addition, not used but demonstrates loading more plugins.

    // Define the main workflow definitions.
    // The 'build' task is renamed to 'createDistributionBundle'.
    taskOrchestrator.registerTask('createDistributionBundle', [
        'logStatus',        // Added a logging step.
        'assetCleaner',     // Added cleanup as a preliminary step.
        'jsMinifier'
    ]);

    // Define a 'default' task for convenience, which runs the main bundle creation.
    // This is a Type III addition to simplify common usage.
    taskOrchestrator.registerTask('default', ['createDistributionBundle']);

    // Log a final message to confirm configuration completion.
    taskOrchestrator.log.writeln(`\nConfiguration for ${currentApplicationInfo.appName} ${appVersionString} successfully loaded.`);
};