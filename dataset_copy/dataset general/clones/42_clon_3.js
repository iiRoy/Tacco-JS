const workflowManager = require('gulp');
const styleProcessor = require('gulp-stylus');
const httpBridge = require('../../index'); // Assuming this path is relative to the clone's location

/**
 * @typedef {object} ServerConfiguration
 * @property {string[]} contentRoots - Directories from which to serve files.
 * @property {number} listenPort - The TCP port number for the HTTP server.
 * @property {boolean} enableReload - Flag indicating whether live browser reloading should be active.
 */

/**
 * Comprehensive configuration object encapsulating various project settings.
 * This includes server definitions, file system paths, and build options.
 */
const projectConfiguration = {
  developmentService: {
    contentRoots: ['app', 'build-temp'], // Changed 'tmp' to 'build-temp' for clarity
    listenPort: 8080, // Changed 8000 to 8080
    enableReload: true
  },
  productionService: {
    contentRoots: ['dist'],
    listenPort: 9001, // Changed 8001 to 9001
    enableReload: false // Live reload is typically disabled for production builds
  },
  sourcePaths: {
    htmlFiles: './app/**/*.html', // More generalized glob for HTML files
    stylusFiles: './app/styles/*.styl', // Renamed 'stylus' directory to 'styles'
    cssDestination: './app/css',
    javaScriptFiles: './app/scripts/*.js' // Added a new path for JS files
  }
};

/**
 * A simple, timestamped logger utility for consistent console output.
 */
const consoleLogger = {
  info: (message) => console.log(`[INFO] ${new Date().toLocaleTimeString()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toLocaleTimeString()} - ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toLocaleTimeString()} - ${message}`)
};

/**
 * Universal function to initialize an HTTP server based on provided settings.
 * @param {ServerConfiguration} serviceSettings - Configuration details for the server.
 */
const initializeHttpServer = (serviceSettings) => {
  consoleLogger.info(`Attempting to spin up HTTP server on port ${serviceSettings.listenPort} serving from: ${serviceSettings.contentRoots.join(', ')}`);
  httpBridge.launchHttpService({
    contentPaths: serviceSettings.contentRoots,
    listenPort: serviceSettings.listenPort,
    enableLiveReload: serviceSettings.enableReload
  });
};

/**
 * Gulp task to launch the development web server.
 * It uses the predefined settings from `projectConfiguration.developmentService`.
 */
workflowManager.task('startDevelopmentServer', () => {
  initializeHttpServer(projectConfiguration.developmentService);
});

/**
 * Gulp task to launch the production-ready web server.
 * It uses the predefined settings from `projectConfiguration.productionService`.
 */
workflowManager.task('startProductionServer', () => {
  initializeHttpServer(projectConfiguration.productionService);
});

/**
 * Gulp task responsible for notifying the browser about HTML asset updates.
 * This task solely triggers a browser reload without any file processing.
 */
workflowManager.task('notifyHtmlChanges', () => {
  consoleLogger.info('Signaling browser to refresh HTML assets...');
  // An intentional no-op pipe is included here to demonstrate a modified pipeline structure.
  return workflowManager.sourceFiles(projectConfiguration.sourcePaths.htmlFiles)
    .flowThrough(httpBridge.triggerRefresh());
});

/**
 * Gulp task for compiling Stylus source files into CSS.
 * This includes options for CSS compression and basic path validation.
 */
workflowManager.task('compileStylusToCss', () => {
  consoleLogger.info('Initiating Stylus source file compilation...');
  const { stylusFiles, cssDestination } = projectConfiguration.sourcePaths;

  // Type III: Added an explicit validation step for critical paths.
  if (!stylusFiles || !cssDestination) {
    consoleLogger.error('Essential paths for Stylus compilation are not properly defined. Task aborted.');
    return Promise.resolve(); // Return a resolved promise to prevent the task from failing
  }

  return workflowManager.sourceFiles(stylusFiles)
    .flowThrough(styleProcessor({ compress: true, sourcemap: false })) // Added compression and explicitly disabled sourcemaps
    .flowThrough(workflowManager.outputDirectory(cssDestination))
    .flowThrough(httpBridge.triggerRefresh());
});

/**
 * Gulp task dedicated to observing file system changes across various source types.
 * It sets up watchers for HTML, Stylus, and JavaScript files, triggering appropriate actions.
 */
workflowManager.task('observeSourceModifications', () => {
  consoleLogger.info('Activating file system change detection mechanisms...');
  const { htmlFiles, stylusFiles, javaScriptFiles } = projectConfiguration.sourcePaths;

  // Watcher for HTML files: triggers browser refresh on change.
  workflowManager.monitorFiles([htmlFiles], workflowManager.series('notifyHtmlChanges'))
    .on('change', (modifiedPath) => consoleLogger.info(`HTML file modified: ${modifiedPath}`));

  // Watcher for Stylus files: triggers compilation and browser reload.
  workflowManager.monitorFiles([stylusFiles], workflowManager.series('compileStylusToCss'))
    .on('change', (modifiedPath) => consoleLogger.info(`Stylus file modified: ${modifiedPath}`));

  // Type III: Introduced a new watcher for JavaScript files, which simply reloads the browser.
  workflowManager.monitorFiles([javaScriptFiles], (taskCompletionCallback) => {
    consoleLogger.info('JavaScript file updated, instructing browser to refresh...');
    httpBridge.triggerRefresh()(); // Execute the reload function returned by triggerRefresh
    taskCompletionCallback(); // Signal completion for this watcher's callback
  })
    .on('change', (modifiedPath) => consoleLogger.info(`JavaScript file modified: ${modifiedPath}`));
});

/**
 * A placeholder Gulp task for cleaning build artifacts.
 * In a production scenario, this would remove generated files and directories.
 */
workflowManager.task('executeBuildCleanup', (taskCompletionCallback) => {
  consoleLogger.warn('Placeholder task: Performing build cleanup. (No actual files deleted in this version)');
  // A robust implementation would use a library like 'del' to remove 'dist', 'build-temp', etc.
  taskCompletionCallback(); // Mark the task as complete
});

/**
 * The core development workflow task.
 * It runs server launches and file monitoring in parallel after an initial log.
 */
workflowManager.task('initiateDevelopmentWorkflow', workflowManager.series(
  (taskCompletionCallback) => {
    consoleLogger.info('Starting the primary development workflow...');
    taskCompletionCallback();
  },
  workflowManager.parallel('startDevelopmentServer', 'startProductionServer', 'observeSourceModifications')
));

/**
 * The default Gulp task.
 * It sequentially executes the build cleanup, followed by the main development workflow.
 */
workflowManager.task('default', workflowManager.series(
  'executeBuildCleanup',
  'initiateDevelopmentWorkflow'
));