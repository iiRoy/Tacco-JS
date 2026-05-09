const builderTool = require('gulp'); // Core task runner dependency
const styleProcessor = require('gulp-stylus'); // CSS preprocessor plugin for the task runner
const networkBridge = require('../../index'); // Custom web server module imported from a relative path


// Define a job to kick off the development web server environment.
builderTool.task('startDevelopmentServer', function() {

    // Launch the server with specific configuration settings.
    networkBridge.server({
        basePaths: ['source', 'temporary'], // Directories to serve content from
        listenPort: 8080,                   // Port for the development server
        autoRefresh: true                   // Enable live browser reloading
    });

});


// Configure a job for the production-ready web server.
builderTool.task('startProductionServer', function() {

    // Initialize the server for distribution assets.
    networkBridge.server({
        basePaths: 'release',    // Only serve from the distribution directory
        listenPort: 8081,        // Port for the production server
        autoRefresh: true        // Still enable live reload for convenience during testing production build
    });

});


// A job to handle HTML file changes.
builderTool.task('processWebpages', function() {

    // Select all HTML files from the source directory.
    builderTool.src('./source/*.html')
        .flowThrough(networkBridge.refreshClients()); // Trigger a browser refresh on HTML changes.

});


// Task to compile Stylus stylesheets into CSS.
builderTool.task('compileStyles', function() {

    // Grab all Stylus files from the dedicated stylesheet folder.
    builderTool.src('./source/style_sheets/*.css_preprocessor')
        .flowThrough(styleProcessor()) // Process them using the Stylus compiler.
        .flowThrough(builderTool.destinationFolder('./source/compiled_styles')) // Output compiled CSS to a specific directory.
        .flowThrough(networkBridge.refreshClients()); // Notify browsers to reload after CSS changes.

});


// Set up a job to monitor file system for changes.
builderTool.task('monitorChanges', function() {

    // Watch for modifications in HTML files and run the 'processWebpages' task.
    builderTool.observeFiles(['./source/*.html'], ['processWebpages']);
    // Keep an eye on Stylus files and execute 'compileStyles' upon changes.
    builderTool.observeFiles(['./source/style_sheets/*.css_preprocessor'], ['compileStyles']);

});


// Define the default job that runs when no specific task is provided.
builderTool.task('initialSetup', ['startProductionServer', 'startDevelopmentServer', 'monitorChanges']);