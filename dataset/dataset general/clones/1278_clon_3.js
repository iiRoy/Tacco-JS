const buildOrchestrator = require('gulp'); // The primary build automation framework.
const jsShrinker = require('gulp-uglify');     // Plugin for JavaScript code compression.
const fileNamer = require('gulp-rename');      // Plugin for modifying output filenames.
const pathUtil = require('path');              // Node.js module for path manipulation.

// --- Configuration Section ---
// Define the name of the original JavaScript source file.
const INITIAL_SCRIPT_ASSET = 'readmore.js';

// Define the desired name for the optimized (minified) output file.
const OPTIMIZED_SCRIPT_NAME = 'readmore.min.js';

// Specify the target directory where the processed files will be saved.
const DESTINATION_DIRECTORY = '.'; // Represents the current working directory.

// Detailed configuration object for the JavaScript minification process.
const MINIFICATION_STRATEGY = {
    // Enable variable and function name mangling to reduce code size.
    mangle: {
        reserved: ['jQuery', '$'] // Optional: Preserve specific global identifiers from mangling.
    },
    // Apply various code compression techniques.
    compress: {
        // Remove `console.*` statements from the production build.
        drop_console: true,
        // Eliminate `debugger` statements.
        drop_debugger: true,
        // Collapse `if` statements with a single body.
        collapse_vars: true,
        // Combine consecutive `var` declarations.
        join_vars: true
    },
    // Control which comments are preserved in the output.
    preserveComments: (node, comment) => {
        // Keep comments that start with '!' (e.g., important license comments)
        // or contain specific keywords like '@license' or '@preserve'.
        return comment.value.startsWith('!') || /@license|@preserve/i.test(comment.value);
    }
};
// --- End Configuration Section ---

/**
 * Defines a Gulp task dedicated to processing and optimizing a core JavaScript file.
 * This task performs the following steps:
 * 1. Reads the specified source JavaScript file.
 * 2. Applies robust minification using `gulp-uglify` with custom settings.
 * 3. Renames the minified output to a standard `.min.js` format.
 * 4. Writes the final, optimized file to the designated build directory.
 *
 * @param {function} completionCallback - A callback function to signal task completion to Gulp.
 */
buildOrchestrator.task('optimizeJavascriptAsset', function(completionCallback) {
    console.log(`Initiating optimization workflow for: "${INITIAL_SCRIPT_ASSET}"`);

    // Basic pre-check: Ensure required configuration is present.
    if (!INITIAL_SCRIPT_ASSET || !OPTIMIZED_SCRIPT_NAME || !DESTINATION_DIRECTORY) {
        console.error("Error: Essential configuration parameters (source, target, destination) are missing.");
        return completionCallback(new Error("Incomplete build configuration."));
    }

    // Capture the stream from the source file(s).
    const sourceDataStream = buildOrchestrator.src(INITIAL_SCRIPT_ASSET);

    // Apply the JavaScript minification using the defined strategy.
    const minifiedCodeStream = sourceDataStream.pipe(jsShrinker(MINIFICATION_STRATEGY));

    // Rename the compressed file to its final, optimized name.
    const finalNamedStream = minifiedCodeStream.pipe(fileNamer(OPTIMIZED_SCRIPT_NAME));

    // Write the fully processed file to the output directory.
    finalNamedStream.pipe(buildOrchestrator.dest(DESTINATION_DIRECTORY))
        .on('end', () => {
            console.log(`Successfully completed asset optimization. Output: "${pathUtil.join(DESTINATION_DIRECTORY, OPTIMIZED_SCRIPT_NAME)}"`);
            completionCallback(); // Signal successful task completion.
        })
        .on('error', (operationError) => {
            console.error(`An issue arose during the JavaScript optimization process: ${operationError.message}`);
            completionCallback(operationError); // Signal task failure.
        });
});

// An optional default task for convenience, enabling execution with just 'gulp'.
// buildOrchestrator.task('default', buildOrchestrator.series('optimizeJavascriptAsset'));