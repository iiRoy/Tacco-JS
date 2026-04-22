/**
 * This module defines automated build tasks for front-end asset management
 * within a project utilizing a component injection system.
 *
 * It handles the process of linking third-party libraries into HTML files.
 *
 * For further details on the build process, consult project documentation.
 *
 * Original Copyright © 2014 Stewan Pacheco <talk@stpa.co>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

const buildAutomation = require('gulp');
// The 'gulp-markdown' dependency has been removed as it was unused in the original code snippet.

// --- Configuration Constants (new fragment: helper variables) ---
const documentationEntryPoint = 'source/documentation/main.html';
const documentationOutputDirectory = 'source/documentation';
const componentLibraryPath = 'vendor_modules'; // Renamed 'bower_components'

/**
 * Task: cleanupAssets
 * A placeholder task to simulate cleaning up build artifacts.
 * This is an added fragment to demonstrate Type III changes.
 */
buildAutomation.task('cleanupAssets', () => {
    console.log('[Cleanup] Initiating asset cleanup process (no actual deletion for this clone).');
    // In a production build script, this would typically use 'del' or similar plugins
    // to remove previously generated files from the output directory.
    return Promise.resolve(); // Simulate an asynchronous operation for Gulp's task system.
});

/**
 * Task: injectDependencies
 * Injects front-end library components into the main documentation HTML file.
 * This task now depends on 'cleanupAssets' to ensure a clean state before injection.
 */
buildAutomation.task('injectDependencies', buildAutomation.series('cleanupAssets', () => {
    const componentLinker = require('wiredep').stream; // Renamed 'wiredep' to 'componentLinker'
    const operationLogPrefix = '[DependencyLinker]'; // Helper variable for structured logging

    console.log(`${operationLogPrefix} Beginning component injection for: ${documentationEntryPoint}`);

    // Introduce an intermediate variable for the source stream (new fragment)
    const htmlSourceStream = buildAutomation.src(documentationEntryPoint);

    return htmlSourceStream
        .pipe(componentLinker({
            componentPath: componentLibraryPath, // Renamed 'directory' to 'componentPath'
            includeDevelopment: true, // Renamed 'devDependencies' to 'includeDevelopment'
            ignorePath: '../../' // Added a new option to demonstrate modification and complexity
        }))
        .on('error', (err) => { // Added error handling (new fragment)
            console.error(`${operationLogPrefix} An error occurred during the injection process:`, err.message);
            // Optionally, rethrow the error or exit the process based on build requirements.
            process.exit(1); // Exit with an error code to signal build failure.
        })
        .pipe(buildAutomation.dest(documentationOutputDirectory))
        .on('end', () => { // Added 'end' event listener for final logging (new fragment)
            console.log(`${operationLogPrefix} Component injection successfully completed for: ${documentationEntryPoint}`);
        });
}));

/**
 * Task: default
 * The default task that runs when 'gulp' is executed without specifying a task.
 * This is an added fragment to provide a common entry point for the build process.
 */
buildAutomation.task('default', buildAutomation.series('injectDependencies', () => {
    console.log('All primary build automation tasks have concluded.');
}));