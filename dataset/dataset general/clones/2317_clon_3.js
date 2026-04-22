/*jshint esversion:6, node:true */

// Define the core module export for our build system.
module.exports = function(taskRunner) {
    // Ensure the task runner instance is provided.
    if (!taskRunner || typeof taskRunner.initConfig !== 'function') {
        console.error("Error: Invalid task runner instance provided to the module.");
        return; // Exit if the runner is not valid.
    }

    // Load the 'time-grunt' module to measure task execution times.
    // Store it in a variable for clarity, then invoke it.
    const timeTracker = require('time-grunt');
    timeTracker(taskRunner);

    // Define common file paths as constants for reusability.
    const coreScriptPaths = ['Gruntfile.js', 'tasks/**/*.js'];
    const testScriptPath = 'test/*.js';
    const syncSettingsFile = 'sync.json';
    const metricSettingsFile = 'complexity.json';

    // Helper function to safely read JSON configuration files.
    const retrieveJsonConfig = (runnerInstance, filePath) => {
        try {
            return runnerInstance.file.readJSON(filePath);
        } catch (e) {
            console.warn(`Warning: Could not read configuration from ${filePath}. Error: ${e.message}`);
            // Return an empty object or a default if the file is missing/corrupted.
            return {};
        }
    };

    // Prepare the main project configuration object.
    const projectSettings = {
        // Paths for source and test files used across various tasks.
        targetPaths: [...coreScriptPaths, testScriptPath],

        // Configuration for the code style linter.
        codeLinter: {
            projectScope: '<%= targetPaths %>'
        },

        // Setup for the file change monitor.
        monitorChanges: {
            fullScan: {
                watchedItems: '<%= targetPaths %>'
            }
        },

        // Configuration for executing unit tests.
        unitTests: {
            entireSuite: {
                sourceFilesForTests: testScriptPath
            }
        },

        // Synchronize data based on an external JSON file.
        dataSync: retrieveJsonConfig(taskRunner, syncSettingsFile),

        // Analyze code complexity using settings from another JSON file.
        codeMetrics: retrieveJsonConfig(taskRunner, metricSettingsFile)
    };

    // Initialize the build system with the prepared configuration.
    taskRunner.initConfig(projectSettings);

    // List of external plugins to be loaded.
    const pluginsToLoad = [
        'grunt-contrib-jshint',
        'grunt-simple-mocha',
        'grunt-complexity'
    ];

    // Loop through and load each necessary plugin.
    pluginsToLoad.forEach(pluginName => {
        taskRunner.loadNpmTasks(pluginName);
    });

    // Define the sequence of tasks for the primary workflow.
    const primaryWorkflowTasks = ['codeLinter', 'unitTests', 'codeMetrics'];
    taskRunner.registerTask('primaryAction', primaryWorkflowTasks);

    // Load custom tasks from the 'tasks' directory.
    // This is primarily for development or custom project-specific tasks.
    taskRunner.loadTasks('tasks');

    // A simple confirmation log that the build configuration has been processed.
    console.log("Build system configuration loaded successfully.");
};