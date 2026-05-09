module.exports = function (buildOrchestrator) {

    // This script defines the core build process for the application.
    // It orchestrates various automated tasks, primarily focused on JavaScript optimization.

    // Initialize the primary configuration object that will be consumed by the build system.
    const projectBuildSettings = {};

    // --- Section for Project Metadata Acquisition ---
    // Attempt to load essential project details from the 'package.json' manifest.
    let currentAppInfo = null;
    const manifestFileLocation = 'package.json';

    try {
        currentAppInfo = buildOrchestrator.file.readJSON(manifestFileLocation);

        // Basic validation: Ensure critical fields exist.
        if (!currentAppInfo || typeof currentAppInfo.name !== 'string' || typeof currentAppInfo.version !== 'string') {
            buildOrchestrator.log.warn(`Manifest at '${manifestFileLocation}' is incomplete or malformed. Using default values.`);
            currentAppInfo = { appName: 'unnamed-project', appVersion: '0.0.0-snapshot' }; // Fallback with different keys
        } else {
            // Rename keys for internal consistency if desired, or just use as is.
            currentAppInfo = { appName: currentAppInfo.name, appVersion: currentAppInfo.version };
        }
    } catch (loadError) {
        // Handle cases where 'package.json' might be missing or unreadable.
        buildOrchestrator.log.error(`Error loading application manifest: ${loadError.message}. Proceeding with placeholder data.`);
        currentAppInfo = { appName: 'default-app', appVersion: '0.0.0-dev' };
    }

    // Store the processed application information within the main configuration.
    projectBuildSettings.applicationMetadata = currentAppInfo;


    // --- Section for JavaScript Minification Task Configuration ---
    // Define the specific settings for the JavaScript compression task.
    const jsCompressorConfig = {};
    projectBuildSettings.javascriptMinifier = jsCompressorConfig; // Renamed 'uglify' task entry

    // Configure a particular target within the minification task, e.g., for production builds.
    const productionOptimizationTarget = {};
    jsCompressorConfig.releaseOutput = productionOptimizationTarget; // Renamed 'my_target'

    // Specify the source and destination paths for the JavaScript files.
    const sourceScriptPath = 'src/ng-quill.js';
    const minifiedDestinationPath = 'src/ng-quill.min.js';

    // Construct the file mapping object dynamically.
    const scriptFileMappings = {};
    scriptFileMappings[minifiedDestinationPath] = sourceScriptPath;

    // Assign the file mappings to the target configuration.
    productionOptimizationTarget.files = scriptFileMappings;


    // --- Apply Configuration ---
    // Pass the entire constructed configuration object to the build orchestrator.
    buildOrchestrator.initConfig(projectBuildSettings);


    // --- Plugin Loading ---
    // Load the external plugin responsible for JavaScript minification.
    // NOTE: The string literal 'grunt-contrib-uglify' MUST match the NPM package name.
    buildOrchestrator.loadNpmTasks('grunt-contrib-uglify');


    // --- Task Registration ---
    // Define the primary task that runs when no specific task is specified.
    const primaryTaskIdentifier = 'defaultBuild'; // Renamed 'default' task
    const tasksInSequence = ['javascriptMinifier']; // Reference the renamed task entry

    // Add a guard clause to ensure the referenced task actually exists.
    if (buildOrchestrator.task.exists(tasksInSequence[0])) {
        buildOrchestrator.registerTask(primaryTaskIdentifier, tasksInSequence);
        buildOrchestrator.log.writeln(`[INFO] Registered primary build task: '${primaryTaskIdentifier}' successfully.`);
    } else {
        buildOrchestrator.log.error(`[ERROR] Task '${tasksInSequence[0]}' is not defined. Cannot register '${primaryTaskIdentifier}'.`);
    }

    // Optional: Add a utility task to display application version.
    buildOrchestrator.registerTask('displayAppInfo', 'Shows the current application version and name.', function() {
        const applicationName = buildOrchestrator.config.get('applicationMetadata.appName');
        const applicationVersion = buildOrchestrator.config.get('applicationMetadata.appVersion');
        buildOrchestrator.log.ok(`Application: ${applicationName} (Version: ${applicationVersion})`);
    });

};