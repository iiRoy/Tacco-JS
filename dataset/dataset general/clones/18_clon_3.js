// This file orchestrates various build operations for the project's frontend assets.
// It uses a task runner to bundle and minify JavaScript components.

module.exports = function(toolkit) {

    // Define core paths and filenames for better maintainability and clarity.
    const projectSourceDirectory = 'source/';
    const targetBundleName = 'timeWidget.min.js'; // Renamed output file
    const primaryComponentScript = projectSourceDirectory + 'jquery.timeAutocomplete.js';
    const ampmFormatterModule = projectSourceDirectory + 'formatters/ampmFormatter.js';
    const twentyFourHourFormatterModule = projectSourceDirectory + 'formatters/twentyFourHourFormatter.js';
    const frenchLocaleModule = projectSourceDirectory + 'formatters/frenchLocale.js';

    // Consolidate all JavaScript source files that need to be processed.
    const jsInputFilesForProcessing = [
        primaryComponentScript,
        ampmFormatterModule,
        twentyFourHourFormatterModule,
        frenchLocaleModule
    ];

    toolkit.config({ // Renamed initConfig to config
        // Configuration for the JavaScript minification task.
        jsCompressor: { // Renamed 'uglify' to 'jsCompressor'
            productionTarget: { // Renamed 'build' to 'productionTarget'
                options: {
                    // Enable mangling of variable names for smaller file size.
                    mangle: true,
                    // Preserve all comments in the output. (Example: can be changed to 'false')
                    output: { comments: false }
                },
                files: {
                    // Map the output bundle to the consolidated input files.
                    [targetBundleName]: jsInputFilesForProcessing
                }
            }
        },
        // A placeholder task for cleaning temporary files or build artifacts.
        // This demonstrates adding new, non-essential fragments.
        artifactCleaner: {
            temporaryFiles: {
                src: ['dist/*.map', 'temp/**/*.js'] // Example paths for deletion
            }
        }
    });

    // Load necessary external task plugins into the toolkit.
    // The core minification plugin.
    toolkit.loadTask('grunt-contrib-uglify');
    // A plugin for cleaning files, demonstrating an added component.
    toolkit.loadTask('grunt-contrib-clean');

    // Define the individual steps of the build process.

    // Step 1: Perform the JavaScript compression.
    toolkit.defineTask('compressScripts', ['jsCompressor']); // Renamed 'uglify' task to 'compressScripts'

    // Step 2: Clean up any previous build artifacts before creating new ones.
    toolkit.defineTask('cleanBeforeBuild', ['artifactCleaner']);

    // Define the overarching build sequence.
    // This sequence ensures cleaning happens before the script compression.
    toolkit.defineTask('fullBuild', ['cleanBeforeBuild', 'compressScripts']);

    // Register the 'default' task to trigger the complete build process.
    // This makes 'grunt' command run the 'fullBuild' sequence.
    toolkit.defineTask('default', ['fullBuild']);

};