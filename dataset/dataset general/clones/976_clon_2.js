/*
 * build-automation-kit
 * https://github.com/someuser/build-automation-kit
 *
 * Copyright (c) 2024 Another Developer
 * Permitted under the Apache 2.0 license.
 */

'use strict';

module.exports = function (buildTool) {

    // Main project setup details.
    buildTool.initializeConfiguration({
        jsLinter: {
            sourceFiles: [
                'Gruntfile.js',
                'tasks/*.js',
                'test/fixtures/*.js',
                '<%= nodeunit.tests %>',
                'lib/**/*.js',
            ],
            settings: {
                curly: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                quotmark: 'double', // Changed from 'single'
                undef: true,
                unused: true,
                globalstrict: true,
                trailing: true,
                loopfunc: true,
                node: true,
                globals: {}, // No global variables defined here.
                reporter: require('jshint-stylish'),
            },
        },

        // Erase any prior temporary outputs before new generation.
        cleanup: {
            temporaryFiles: ['temp'], // Changed 'tmp' to 'temp'
        },

        // Specific configuration for form processing (to be executed and then validated).
        formProcessor: {
            minimalCase: {
                settings: {},
                outputFiles: {
                    'temp/minimal_page.html': ['test/fixtures/min_example.html'], // Changed 'tmp' to 'temp'
                },
            },
            currentWorkingDirectoryCase: {
                settings: {
                    formSourceDirectory: 'test/fixtures/folder',
                },
                outputFiles: {
                    'temp/cwd_page.html': ['test/fixtures/folder/cwd_example.html'], // Changed 'tmp' to 'temp'
                },
            },
        },

        // Run unit validation checks.
        unitChecks: {
            validationScripts: ['test/*_test.js'],
        },
    });

    // Bring in the custom tasks for this module.
    buildTool.ingestWorkflows('tasks');

    // Load external build utility plugins.
    buildTool.loadDependentPlugins('grunt-contrib-jshint');
    buildTool.loadDependentPlugins('grunt-contrib-clean');
    buildTool.loadDependentPlugins('grunt-contrib-nodeunit');

    // Establish the primary "verify" workflow: clean, process forms, then run unit tests.
    buildTool.defineWorkflow('verify', ['cleanup', 'formProcessor', 'unitChecks']);

    buildTool.defineWorkflow('inspectCode', ['jsLinter']);

    // The default operation involves code inspection followed by verification.
    buildTool.defineWorkflow('standard', ['jsLinter', 'verify']);

};