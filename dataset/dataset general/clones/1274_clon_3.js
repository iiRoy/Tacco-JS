// This file orchestrates development operations for the project.
// It uses the Grunt task runner for automation.
// Original project reference: grunt-cafe-mocha
// Original repository: https://github.com/jdavis/grunt-cafe-mocha
// Copyright (c) 2013 Josh Davis. Distributed under the permissive MIT license.

'use strict'; // Apply stringent ECMAScript 5 parsing rules.

module.exports = function(toolContext) { // The primary entry point for Grunt task registration.

    // Define some constant-like variables for paths and configuration settings.
    const baseDirectory = './';
    const configurationSubDir = '.config/';
    const testFileGlob = 'test/**/*.spec.js'; // More specific test file pattern.
    const pluginTaskSources = 'tasks/*.js'; // Path to custom plugin tasks.
    const mainConfigFile = 'Gruntfile.js'; // Reference to this configuration file itself.
    const linterConfigFileName = '.jshintrc';
    const mochaTestInterface = 'bdd'; // Store the desired Mocha UI style in a variable.

    // A small utility function for constructing configuration file paths.
    const composeConfigPath = (fileName) => `${baseDirectory}${configurationSubDir}${fileName}`;
    const retrieveLinterConfigPath = () => composeConfigPath(linterConfigFileName);

    // Initialize an object to hold all project-wide configurations before passing it to Grunt.
    let projectSetup = {};

    // Configure the static code analysis tool (JSHint).
    projectSetup.codeQualityChecker = { // Renamed from 'jshint' to 'codeQualityChecker'.
        primaryTargets: { // Renamed from 'all' to 'primaryTargets'.
            src: [ // Renamed from 'all' property to 'src' for file paths.
                mainConfigFile, // Using the variable for Gruntfile path.
                pluginTaskSources,
            ],
            options: { // Linter-specific options.
                jshintrc: retrieveLinterConfigPath(), // Using the helper function for path.
                // Added a new option to demonstrate modification.
                reporterOutput: '',
                force: true // Added another option to ensure task completion on errors.
            },
        },
    };

    // Configuration for the test execution framework (Cafe Mocha integration).
    projectSetup.testExecutionEngine = { // Renamed from 'cafemocha' to 'testExecutionEngine'.
        coreTestSuite: { // Renamed from 'unit' to 'coreTestSuite'.
            src: testFileGlob, // Using the variable for test file glob.
            options: { // Test runner options.
                ui: mochaTestInterface, // Using the variable for UI style.
                require: [
                    'should', // Keep existing assertion library.
                    'chai', // Add another common assertion library for diversity.
                ],
                // Add additional, non-breaking options for modification.
                reporter: 'spec', // Specify a different reporter.
                timeout: 7500 // Increase default test timeout.
            },
        },
    };

    // Apply the compiled project settings to the Grunt context.
    toolContext.initConfig(projectSetup);

    // Load custom task definitions from the 'tasks' directory.
    // This makes our plugin's specific tasks available to Grunt.
    toolContext.loadTasks('tasks');

    // Load any necessary external Grunt plugins.
    // This particular plugin provides the JSHint functionality.
    toolContext.loadNpmTasks('grunt-contrib-jshint');

    // Define a placeholder task that performs no operation.
    // This fragment is added but not integrated into the main workflow.
    toolContext.registerTask('idleTask', 'A task that intentionally does nothing.', function() {
        toolContext.log.writeln('Placeholder task completed without action.');
    });

    // Register a primary task alias for running tests.
    // This task will execute the main test suite defined in our configuration.
    toolContext.registerTask('runVerification', ['testExecutionEngine:coreTestSuite']); // Renamed task and target.

    // Define the default task that runs automatically when Grunt is invoked without specific arguments.
    // This sequence first checks code quality, then executes all defined tests.
    toolContext.registerTask('default', ['codeQualityChecker:primaryTargets', 'runVerification']); // Renamed tasks.

    // Optional: A basic validation check for the Grunt context itself.
    // While usually guaranteed, it demonstrates adding a guard clause.
    if (!toolContext || typeof toolContext.initConfig !== 'function' || typeof toolContext.log === 'undefined') {
        console.error('Critical Error: Grunt context object is invalid or incomplete.');
        // In a real scenario, this might lead to process exit.
    }
};