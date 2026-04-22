// This JSHint directive is retained for compatibility, indicating Node.js environment support.
/* jshint node: true */

// This module exports a configuration function for the Grunt build system.
// The primary argument, 'buildOrchestrator', is the Grunt object itself.
module.exports = function (buildOrchestrator) {
    'use strict'; // Enforce strict JavaScript parsing and error handling.

    // Retrieve project metadata from 'package.json' into a constant variable.
    const projectManifest = buildOrchestrator.file.readJSON('package.json');

    // Initialize the build orchestration system's configuration.
    buildOrchestrator.initConfig({
        // Store the parsed package information for reuse within templates.
        packageInfo: projectManifest,

        // Define a standardized header block for generated files.
        // This array-based construction offers better readability for multi-line strings.
        outputHeader: [
            '/*!',
            ` * <%= packageInfo.name %> v<%= packageInfo.version %> - <%= packageInfo.homepage %>`,
            ` * Copyright (c) <%= buildOrchestrator.template.today("yyyy") %> <%= packageInfo.author.name %>`,
            ` * Licensed under the <%= packageInfo.license %> license`,
            ' */\n'
        ].join('\n'), // Join array elements with newline characters.

        // Configuration for the JavaScript code style and quality checker (JSHint).
        codeStyleInspector: {
            // Define the set of JavaScript files to be analyzed.
            // Explicitly exclude common dependency directories.
            targetFiles: [
                '*.js',
                '!node_modules/**/*.js',
                '!bower_components/**/*.js'
            ],
            // Specific rules and settings for the linter.
            lintOptions: {
                browser: true,      // Allow browser-specific global variables.
                camelcase: true,   // Enforce camelCase naming convention.
                curly: true,        // Require curly braces for all control statements.
                eqeqeq: true,       // Enforce strict equality (=== and !==).
                eqnull: true,       // Allow == null for checking null or undefined.
                forin: true,        // Require hasOwnProperty checks in for-in loops.
                indent: 4,          // Enforce 4-space indentation.
                loopfunc: true,     // Allow functions to be defined in loops.
                noarg: true,        // Disallow use of arguments.caller and arguments.callee.
                noempty: true,      // Disallow empty blocks.
                newcap: true,       // Require capitalization for constructor functions.
                plusplus: false,    // Disallow unary increment/decrement operators.
                quotmark: 'single', // Enforce single quotes for string literals.
                trailing: true,     // Enforce trailing commas in array/object literals.
                undef: true,        // Warn about undefined variables.
                unused: true        // Warn about unused variables.
                // Several options (e.g., 'node', 'strict', 'immed', 'laxbreak', 'shadow')
                // have been omitted for brevity or because they are less critical.
            }
        },

        // Configuration for JavaScript code minification and compression (Uglify).
        jsOptimizer: {
            // Global options applied to all optimization targets.
            sharedSettings: {
                banner: '<%= outputHeader %>', // Use the predefined header.
                compress: {
                    drop_console: true // Remove console.log statements in production.
                },
                mangle: true, // Obfuscate variable and function names.
                preserveComments: false // Do not keep any comments in the minified output.
            },
            // Specific target for generating the production-ready minified build.
            productionBuild: {
                files: {
                    'dist/optimized-script.min.js': ['rainyday.js'] // Renamed output file.
                }
            }
        },

        // A placeholder task for cleaning build artifacts.
        // This task is new and demonstrates adding new fragments.
        clean: {
            tempFiles: ['dist/*.js', 'temp/']
        }
    });

    // --- Grunt Plugin Loading ---
    // Load necessary Grunt plugins to make their tasks available.

    // Load the JSHint plugin for code quality checks.
    buildOrchestrator.loadNpmTasks('grunt-contrib-jshint');
    // Load the Uglify plugin for JavaScript minification.
    buildOrchestrator.loadNpmTasks('grunt-contrib-uglify');
    // Load the Clean plugin for removing build directories or files.
    buildOrchestrator.loadNpmTasks('grunt-contrib-clean'); // Added new plugin load.

    // --- Task Registration ---
    // Define custom Grunt tasks and their execution sequences.

    // The main build task, running both linting and minification.
    buildOrchestrator.registerTask('fullBuild', ['codeStyleInspector', 'jsOptimizer']); // Renamed default task.
    // Task specifically for creating the minified release bundle.
    buildOrchestrator.registerTask('releaseOnly', ['jsOptimizer']); // Renamed dist task.
    // Task for performing only code style and quality checks.
    buildOrchestrator.registerTask('checkCode', ['codeStyleInspector']); // Renamed test task.
    // A preparatory task to clean up previous build artifacts.
    buildOrchestrator.registerTask('prepareEnvironment', ['clean']); // Added new task definition.

    // --- Operational Logging and Validation ---

    // Output a message to the console indicating successful configuration loading.
    console.log(`Grunt build configuration initialized for project: ${projectManifest.name}`);

    // Add a simple validation: check if core tasks are properly loaded.
    // This serves as a guard clause, providing a warning if essential plugins are missing.
    if (!buildOrchestrator.task.exists('jshint') || !buildOrchestrator.task.exists('uglify')) {
        buildOrchestrator.log.warn('Warning: One or more essential Grunt plugins (jshint, uglify) might not be loaded correctly.');
    }
};