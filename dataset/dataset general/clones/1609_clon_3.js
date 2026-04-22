// This file orchestrates various development and build tasks for the project.
// It leverages the projectTaskRunner (formerly Gulp) to automate repetitive workflows.

const
    projectTaskRunner = require('gulp'), // The primary task runner for our project
    moduleBundler = require('gulp-browserify'), // Tool to bundle JavaScript modules for browser use
    fileRenamer = require('gulp-rename'), // Plugin for renaming files in a stream
    devServer = require('gulp-connect'), // Simple web server with livereload capabilities
    versionBumper = require('gulp-bump'); // Utility to increment version numbers in manifest files

/**
 * Monitors source files for changes and triggers recompilation for browser builds.
 * This ensures that development builds are always up-to-date.
 */
projectTaskRunner.task('monitorSourceFiles', () => {
    console.log('[Watcher] Initiating file monitoring for source code changes...');
    // Watch for any JavaScript or JSX file changes within the 'src' directory.
    projectTaskRunner.watch('./src/**/*.js', projectTaskRunner.series('compileForBrowser'));
    console.log('[Watcher] Monitoring for changes in ./src/**/*.js. Triggering "compileForBrowser" on updates.');
});

/**
 * Increments the project's version number in relevant manifest files.
 * @param {string} versionChangeType - The type of version bump: 'major', 'minor', or 'patch'.
 */
const updateProjectVersion = (versionChangeType) => {
    const projectManifests = ['./manifest.json', './component.json']; // Files where version numbers are managed

    // Validate the provided version change type.
    if (!['major', 'minor', 'patch'].includes(versionChangeType)) {
        console.error(`[Version Update] Invalid version change type: "${versionChangeType}". Must be 'major', 'minor', or 'patch'.`);
        return; // Exit if the type is not recognized
    }

    console.log(`[Version Update] Applying a '${versionChangeType}' version increment to: ${projectManifests.join(', ')}`);

    // Stream the manifest files, apply the version bump, and write them back.
    return projectTaskRunner.src(projectManifests)
        .pipe(versionBumper({ type: versionChangeType })) // Apply the specified version change
        .pipe(projectTaskRunner.dest('./')) // Write the updated files back to the current directory
        .on('end', () => console.log(`[Version Update] Version bumped successfully to '${versionChangeType}'.`));
};

// Define individual tasks for different version increments.
projectTaskRunner.task('bump:majorRelease', () => { updateProjectVersion('major'); });
projectTaskRunner.task('bump:minorFeature', () => { updateProjectVersion('minor'); });
projectTaskRunner.task('bump:patchFix', () => { updateProjectVersion('patch'); });

/**
 * Task to log a message before the browser compilation begins.
 */
projectTaskRunner.task('preBuildLog', (done) => {
    console.log('[Build Process] Starting browser module compilation...');
    done(); // Signal task completion
});

/**
 * Task to log a message after the browser compilation completes.
 */
projectTaskRunner.task('postBuildLog', (done) => {
    console.log('[Build Process] Browser module compilation finished successfully!');
    done(); // Signal task completion
});

/**
 * Compiles the main application entry point into a single browser-compatible bundle.
 * This includes setting a standalone global variable and applying transformations.
 */
projectTaskRunner.task('compileForBrowser', projectTaskRunner.series('preBuildLog', () => {
    const entryPoint = './src/main.js'; // Main JavaScript file to bundle
    const outputDirectory = './dist/bundle/'; // Destination directory for the bundled file
    const outputFileName = 'frozen-head-ui.js'; // Name of the final bundled JavaScript file

    const bundlerOptions = {
        standalone: 'FrozenHeadUI', // Global variable name for the bundled module
        transform: ['browserify-shim'] // Apply browserify-shim for dependency management
    };

    console.log(`[Browser Bundler] Processing entry point: ${entryPoint}`);
    return projectTaskRunner.src(entryPoint)
        .pipe(moduleBundler(bundlerOptions)) // Bundle the modules with specified options
        .pipe(fileRenamer(outputFileName)) // Rename the output file
        .pipe(projectTaskRunner.dest(outputDirectory)) // Place the bundled file in the distribution directory
        .on('end', () => console.log(`[Browser Bundler] Bundle created: ${outputDirectory}${outputFileName}`));
}, 'postBuildLog')); // Run 'postBuildLog' after the compilation completes.

/**
 * Launches a development server to serve static assets and enable live reloading.
 * This is primarily used for testing and development purposes.
 */
projectTaskRunner.task('launchDevServer', () => {
    const serverConfig = {
        basePath: [__dirname], // Server root directory, typically the project's root
        serverPort: 8080, // Port where the development server will run
        enableLiveReload: true, // Enable automatic browser refresh on file changes
        autoOpen: {
            startPage: 'test/index.html', // The default page to open in the browser
            targetBrowser: 'Firefox Developer Edition' // Specify the browser to open
        }
    };

    console.log(`[Dev Server] Starting development server on port ${serverConfig.serverPort}...`);
    console.log(`[Dev Server] Opening test page: ${serverConfig.autoOpen.startPage} in ${serverConfig.autoOpen.targetBrowser}.`);

    return devServer.server(serverConfig); // Start the server with the defined configuration
});

/**
 * Main task to run all tests. Currently, this involves building the browser bundle
 * and then launching a development server to serve the test page.
 */
projectTaskRunner.task('runTests', projectTaskRunner.series('compileForBrowser', 'launchDevServer', (done) => {
    console.log('[Test Suite] All test preparation tasks completed. Server is running.');
    done();
}));

/**
 * The primary build task, responsible for creating the browser-compatible distribution.
 */
projectTaskRunner.task('executeBuild', projectTaskRunner.series('compileForBrowser', (done) => {
    console.log('[Build] Distribution build process completed.');
    done();
}));

/**
 * Default task that runs when 'projectTaskRunner' is invoked without specific arguments.
 * It builds the project and then sets up a watcher for continuous development.
 */
projectTaskRunner.task('default', projectTaskRunner.series('executeBuild', 'monitorSourceFiles', (done) => {
    console.log('[Default Task] Initial build complete. Monitoring for changes...');
    done();
}));