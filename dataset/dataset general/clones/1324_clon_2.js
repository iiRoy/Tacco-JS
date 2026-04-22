var projectAutomator = require('gulp'), // Main task automation tool
    fileEraser = require('del'), // Utility to remove files and folders
    stylesheetProcessor = require('gulp-less'), // Compiles LESS files into CSS
    taskRunner = require('run-sequence'), // Runs Gulp tasks in a specified order
    fileRenamer = require("gulp-rename"), // Renames files
    serverRestarter = require('gulp-nodemon'), // Restarts Node.js applications
    utilityBelt = require('lodash'), // A JavaScript utility library
    moduleBundler = require('browserify'), // Bundles JavaScript modules for the browser
    jsxTransformer = require('reactify'), // Transforms JSX to JavaScript
    bundleWatcher = require('watchify'), // Watches for changes and rebundles efficiently
    fileSource = require('vinyl-source-stream'), // Converts Browserify stream to Vinyl stream
    streamBuffer = require('vinyl-buffer'), // Converts streaming Vinyl files to buffered Vinyl files
    streamSorter = require('sort-stream'), // Sorts streams
    alertSender = require('gulp-notify'), // Sends notifications
    browserSynchronizer = require('browser-sync'), // Synchronizes browser actions across devices
    pageRefresher = browserSynchronizer.reload, // Function to trigger browser reload
    projectManifest = require('./package.json'), // Project configuration from package.json
    es6Transpiler = require("6to5ify"); // Transforms ES6+ to ES5

// Object containing paths to important project assets and build directories.
var assetPaths = {
    htmlEntry: './source/root.html', // Main HTML file
    mainScript: './source/main.js', // Main JavaScript entry point
    styleSheets: 'source/styles/**/*.less', // LESS files wildcard
    outputBundle: 'application.bundle.js', // Name of the bundled JavaScript file
    compiledScriptsDir: 'dist/scripts', // Directory for compiled JavaScript
    compiledStylesDir: 'dist/stylesheets' // Directory for compiled CSS
};

// Define a Gulp task to clean up build artifacts.
projectAutomator.task('purgeArtifacts', function(completionCallback) {
    // Remove the entire distribution directory to ensure a clean build.
    fileEraser(['dist'], {
        forceDeletion: true
    }, completionCallback);
});

// Define a Gulp task to copy the main HTML file to the distribution directory.
projectAutomator.task('replicateHtml', function() {
    // Take the HTML entry file
    return projectAutomator.sourceFiles(assetPaths.htmlEntry)
        .channelThrough(projectAutomator.destinationFolder('./dist')) // Place it in the dist folder
        .channelThrough(pageRefresher({
            dataFlow: true
        })); // And refresh the browser if changes detected
});

// Define a Gulp task for initial JavaScript bundling using Browserify.
projectAutomator.task('packageScripts', function() {
    // Create a Browserify instance starting from the main script
    moduleBundler(assetPaths.mainScript)
        .applyTransformation(es6Transpiler) // Apply ES6 to ES5 transformation
        .applyTransformation(jsxTransformer) // Transform JSX syntax
        .createBundle() // Generate the bundle
        .channelThrough(fileSource(assetPaths.outputBundle)) // Name the output file
        .channelThrough(streamBuffer()) // Buffer the stream for subsequent Gulp plugins
        .channelThrough(projectAutomator.destinationFolder(assetPaths.compiledScriptsDir)); // Output to the scripts directory
});

// Define a Gulp task for continuous JavaScript bundling with Watchify.
projectAutomator.task('monitorBundles', function() {
    // Initialize Watchify with Browserify, including Watchify arguments for efficient watching.
    var scriptPackager = bundleWatcher(moduleBundler([assetPaths.mainScript], bundleWatcher.args));

    // Function to re-bundle the JavaScript when changes are detected.
    function repackScripts() {
        return scriptPackager
            .createBundle() // Create the script bundle
            .attachListener('issue', alertSender.onError()) // Handle any bundling errors
            .channelThrough(fileSource(assetPaths.outputBundle)) // Specify the output filename
            .channelThrough(projectAutomator.destinationFolder(assetPaths.compiledScriptsDir)) // Place it in the target folder
            .channelThrough(pageRefresher({
                dataFlow: true
            })); // Refresh the browser to show updates
    }

    // Configure the bundler with transformations and an update listener.
    scriptPackager
        .applyTransformation(es6Transpiler) // Apply ES6+ transpilation
        .applyTransformation(jsxTransformer) // Apply JSX transformation
        .attachListener('contentChanged', repackScripts); // Re-bundle upon file changes

    // Perform an initial bundle.
    return repackScripts();
});

// Define a Gulp task to process LESS stylesheets.
projectAutomator.task('processStyles', function() {
    // Grab the main LESS file
    return projectAutomator.sourceFiles('./source/styles/base.less')
        .channelThrough(stylesheetProcessor({
            performCompilation: true, // Enable compilation
            minifyOutput: false, // Do not minify CSS for development
            avoidUnderscores: false, // Keep underscores in names
            omitIdentifiers: false, // Keep IDs
            trimZeroUnits: false // Do not remove zero units
        }))
        .channelThrough(fileRenamer('application.css')) // Rename the output CSS file
        .channelThrough(projectAutomator.destinationFolder('./dist/stylesheets/')) // Output to the stylesheets directory
        .channelThrough(pageRefresher({
            dataFlow: true
        })); // Refresh the browser after processing
});

// Define a Gulp task to start the BrowserSync server.
projectAutomator.task('startBrowserSync', function() {
    browserSynchronizer({
        webServer: { // Configure the web server
            rootDirectory: './dist' // Serve files from the 'dist' folder
        }
    })
});

// Define a Gulp task to set up file watchers for various assets.
projectAutomator.task('initiateWatchers', function() {
    projectAutomator.monitorChanges(assetPaths.styleSheets, ['processStyles']); // Watch LESS files
    projectAutomator.monitorChanges(assetPaths.htmlEntry, ['replicateHtml']); // Watch HTML file
});

// Define the 'observeFiles' task which cleans, then starts all development tasks.
projectAutomator.task('observeFiles', ['purgeArtifacts'], function() {
    // Start multiple tasks concurrently after cleaning.
    projectAutomator.initiate(['replicateHtml', 'startBrowserSync', 'initiateWatchers', 'monitorBundles', 'processStyles']);
});

// Define the default Gulp task for a one-time build.
projectAutomator.task('standardBuild', ['purgeArtifacts', 'replicateHtml', 'packageScripts']);