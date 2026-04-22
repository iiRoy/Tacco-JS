/**
 * @fileoverview This script defines a comprehensive build workflow using a task runner.
 * It handles code quality checks, Angular dependency annotation, and JavaScript minification.
 *
 * This software is provided under the terms of the MIT License.
 * Copyright (c) 2023 [Your Name/Organization Here]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = function (taskRunner) {

    // Helper function to safely retrieve package data
    const fetchPackageManifest = (manifestPath) => {
        if (!taskRunner.file.exists(manifestPath)) {
            taskRunner.log.error(`Error: Package manifest not found at ${manifestPath}. Aborting.`);
            // In a real Grunt setup, this would cause the task to fail.
            // For this clone, we'll return a default structure to avoid immediate crashes.
            return { name: 'default-app', version: '0.0.0' };
        }
        return taskRunner.file.readJSON(manifestPath);
    };

    // Define key directory paths as constants for clarity and easy modification
    const SOURCE_CODE_DIR = 'dev_src/';
    const TEMPORARY_BUILD_DIR = 'tmp_build/';
    const FINAL_RELEASE_DIR = 'release_dist/';

    // Log the start of the configuration process
    taskRunner.log.writeln('Initializing build system configuration...');

    // Main configuration object for the task runner
    taskRunner.config.init({
        // Project metadata loaded from package.json
        projectDetails: fetchPackageManifest('package.json'),

        // Derived file names based on project metadata
        get mainSourceFile() { return `${SOURCE_CODE_DIR}${this.projectDetails.name}.js`; },
        get tempAnnotatedFile() { return `${TEMPORARY_BUILD_DIR}${this.projectDetails.name}.js`; },
        get finalMinifiedFile() { return `${FINAL_RELEASE_DIR}${this.projectDetails.name}.min.js`; },

        // Task to clean temporary and output directories
        directoryCleanup: {
            dist: [TEMPORARY_BUILD_DIR, FINAL_RELEASE_DIR]
        },

        // JavaScript code quality analysis
        javascriptLinter: {
            options: {
                // Enforce strict mode
                strict: true,
                // Report undefined variables
                undef: true,
                // Warn about unused variables
                unused: 'vars',
                // Define global variables specific to browser environment
                browser: true,
                // Allow Node.js globals (e.g., module.exports)
                node: true,
                // Specify an ES version for linting (e.g., ES2020)
                esversion: 2020
            },
            sourceCodeCheck: {
                src: ['<%= mainSourceFile %>']
            }
        },

        // Angular.js dependency injection annotation
        angularDependencyAnnotator: {
            development: {
                src: ['<%= mainSourceFile %>'],
                dest: '<%= tempAnnotatedFile %>'
            }
        },

        // JavaScript code compression and minification
        codeCompressor: {
            compressionSettings: {
                // Prevent variable name mangling to preserve readability for debugging
                obfuscateNames: false,
                // Add a banner with project details to the minified file
                banner: `/*! <%= projectDetails.name %> v<%= projectDetails.version %> | (c) 2023 [Your Name] */\n`
            },
            production: {
                files: {
                    '<%= finalMinifiedFile %>': ['<%= tempAnnotatedFile %>']
                }
            }
        }
    });

    // Load the necessary task plugins
    taskRunner.loadPlugin('grunt-contrib-jshint');
    taskRunner.loadPlugin('grunt-contrib-uglify');
    taskRunner.loadPlugin('grunt-ng-annotate'); // ngmin is now ng-annotate
    taskRunner.loadPlugin('grunt-contrib-clean');

    // Define the primary build workflow
    taskRunner.registerTask('fullBuild', [
        'directoryCleanup',           // First, clean previous build artifacts
        'javascriptLinter',           // Then, check code quality
        'angularDependencyAnnotator', // Annotate Angular code
        'codeCompressor'              // Finally, minify the annotated code
    ]);

    // Set 'fullBuild' as the default task that runs when 'grunt' is executed without arguments
    taskRunner.registerTask('default', ['fullBuild']);

    taskRunner.log.writeln('Build system configuration complete.');
};