// This Gulpfile is responsible for automating various build tasks for the project's frontend assets.
// It includes steps for cleaning, JavaScript optimization, and optional development watches.

// Import core Gulp library for task definition and execution.
const buildTool = require('gulp');
// Import a plugin for minifying JavaScript code.
const codeCompressor = require('gulp-uglify');
// Import a utility for renaming files within the Gulp stream.
const fileRenamer = require('gulp-rename');
// Import 'del' for robust deletion of files and directories, used for cleaning the build output.
const cleanupUtility = require('del');

// Centralized configuration object for all build-related paths and options.
const projectConfiguration = {
    // Defines the base directory for source files.
    sourceBaseDirectory: './',
    // Specifies the main JavaScript file to be processed.
    entryScriptFileName: 'limits.js',

    // Defines the base directory for all build outputs.
    outputRootDirectory: 'dist/',
    // Specifies a subdirectory within the output root for processed scripts.
    scriptOutputSubfolder: 'assets/',
    // The final name for the minified and bundled JavaScript file.
    optimizedBundleName: 'application.optimized.min.js',

    // Detailed options for the JavaScript minification process.
    uglifySettings: {
        // Configuration for the compression step.
        compress: {
            dead_code: true,      // Remove unreachable code.
            drop_console: true,   // Eliminate console.log statements.
            drop_debugger: true,  // Remove debugger statements.
            passes: 3,            // Run compression multiple times for optimal results.
            unused: true,         // Remove unused variables/functions.
            arguments: true       // Optimize arguments access.
        },
        // Configuration for the mangling (renaming) step.
        mangle: {
            toplevel: true,       // Mangle variable names at the top-level scope.
            reserved: ['window', 'document', 'jQuery', '$'] // Prevent mangling of these specific names.
        },
        // Configuration for the output format.
        output: {
            comments: false,      // Remove all comments from the final output.
            preamble: '/* Project Application Bundle | Minified by Custom Build */' // Add a custom header.
        }
    },
    // A flag to determine if the build is for a production environment.
    // This can influence logging verbosity or optimization levels.
    isProductionEnvironment: process.env.NODE_ENV === 'production'
};

/**
 * Custom logging utility for build processes.
 * Provides more context and can be conditionally verbose.
 * @param {string} logMessage - The message to display in the build log.
 * @param {boolean} [isError=false] - Flag to indicate if the message is an error.
 */
const buildLog = (logMessage, isError = false) => {
    const prefix = isError ? '[BUILD-ERROR]' : '[BUILD-INFO]';
    // Only show detailed messages in development or if a debug flag is present.
    if (!projectConfiguration.isProductionEnvironment || process.env.VERBOSE_BUILD_LOGS) {
        console.log(`${prefix}: ${logMessage}`);
    } else if (isError) {
        console.error(`${prefix}: ${logMessage.split('\n')[0]}`); // Simpler error for production.
    } else {
        console.log(`${prefix}: ${logMessage.split(':')[0]}`); // Simpler info for production.
    }
};

/**
 * Gulp task to clean the designated output directory.
 * This ensures a fresh build environment by removing old artifacts.
 * @param {function} done - Callback to signal Gulp task completion.
 */
function cleanOutputFolder(done) {
    const targetPathForCleanup = projectConfiguration.outputRootDirectory;
    buildLog(`Starting cleanup of: "${targetPathForCleanup}"`);

    // 'del' returns a Promise, so we can use .then() for handling completion.
    cleanupUtility([targetPathForCleanup + '**/*'], { force: true })
        .then(deletedPaths => {
            if (deletedPaths.length > 0) {
                buildLog(`Successfully removed:\n- ${deletedPaths.join('\n- ')}`);
            } else {
                buildLog('No old build artifacts found to clean.');
            }
            done(); // Signal successful completion.
        })
        .catch(error => {
            buildLog(`Failed to clean output folder: ${error.message}`, true);
            done(error); // Signal error completion.
        });
}

/**
 * Gulp task to optimize the main application JavaScript script.
 * This involves minifying, mangling, and renaming the script.
 */
function optimizeApplicationScript() {
    const sourceFilePath = projectConfiguration.sourceBaseDirectory + projectConfiguration.entryScriptFileName;
    const destinationPath = projectConfiguration.outputRootDirectory + projectConfiguration.scriptOutputSubfolder;

    buildLog(`Initiating JavaScript optimization for: "${sourceFilePath}"`);

    // Adjust uglify settings based on the environment.
    // In development, less aggressive minification leads to faster builds and easier debugging.
    const activeUglifySettings = projectConfiguration.isProductionEnvironment
        ? projectConfiguration.uglifySettings
        : { compress: false, mangle: false, output: { comments: 'all', beautify: true } }; // Keep comments, pretty print for dev.

    return buildTool.src(sourceFilePath, { allowEmpty: false }) // 'allowEmpty: false' will error if the source file doesn't exist.
        .pipe(codeCompressor(activeUglifySettings)) // Apply the configured JavaScript compression.
        .on('error', (uglifyError) => {
            buildLog(`An error occurred during script compression: ${uglifyError.message}`, true);
            buildLog(`Stack trace:\n${uglifyError.stack}`, true);
            // This ensures the Gulp stream doesn't break entirely on an error, allowing other tasks to potentially run.
            this.emit('end');
        })
        .pipe(fileRenamer(projectConfiguration.optimizedBundleName)) // Rename the file to the desired bundle name.
        .pipe(buildTool.dest(destinationPath)) // Output the processed file to the specified destination.
        .on('end', () => {
            buildLog(`Finished processing and outputting: "${projectConfiguration.optimizedBundleName}" to "${destinationPath}"`);
        });
}

/**
 * Gulp task to watch for changes in source files and trigger re-builds.
 * This is primarily used in development workflows for live reloading or fast feedback.
 */
function watchSourceChanges() {
    const watchTarget = projectConfiguration.sourceBaseDirectory + projectConfiguration.entryScriptFileName;
    buildLog(`Activating file watch for changes in: "${watchTarget}"`);

    // When the primary script changes, run the optimization task again.
    buildTool.watch(
        watchTarget,
        buildTool.series(optimizeApplicationScript) // Use series to ensure tasks run sequentially.
    );
    // Future expansion: could add more watch tasks for CSS, images, etc.
}

// Define the main build pipeline: first clean, then optimize the script.
const primaryBuildProcess = buildTool.series(
    cleanOutputFolder,           // Step 1: Ensure a clean slate.
    optimizeApplicationScript    // Step 2: Process and optimize the JavaScript.
);

// Export tasks to make them accessible via the Gulp CLI.
// For example: `gulp clean`, `gulp build`, `gulp watch`.
exports.clean = cleanOutputFolder;
exports.build = primaryBuildProcess;
exports.watch = watchSourceChanges;
// Set the 'build' task as the default task that runs when 'gulp' is executed without arguments.
exports.default = primaryBuildProcess;