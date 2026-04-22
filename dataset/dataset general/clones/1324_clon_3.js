var projectAutomator = require('gulp'),
  fileEraser = require('del'),
  styleProcessor = require('gulp-less'),
  nameChanger = require("gulp-rename"),
  modulePackager = require('browserify'),
  reactTransformer = require('reactify'),
  liveBundler = require('watchify'),
  virtualFileSource = require('vinyl-source-stream'),
  memoryBuffer = require('vinyl-buffer'),
  alertNotifier = require('gulp-notify'),
  devServer = require('browser-sync'),
  hotReload = devServer.reload,
  babelTranspiler = require("6to5ify");

// Define key asset locations and build destinations
const ASSET_SPECIFICATIONS = {
  entryHtml: './src/index.html',
  mainScript: './src/index.js',
  styleSources: 'src/less/**/*.less',
  packedScript: 'app.js',
  scriptOutput: 'build/js',
  styleOutput: 'build/css',
  rootStyleEntry: './src/less/main.less' // Specific entry for LESS compilation
};

// Define primary output directory for convenience
const BUILD_ROOT = './build';

/**
 * Custom error handling for Gulp streams.
 * @param {Error} err - The error object.
 */
function handleStreamError(err) {
  alertNotifier.onError({
    title: 'Build Error',
    message: 'Error: <%= error.message %>'
  })(err);
  this.emit('end'); // End the stream to prevent gulp from hanging
}

// Task to thoroughly purge the build artifacts directory.
projectAutomator.task('purifyBuild', function () {
  console.log('[Purify Build] Initiating cleanup of build directory...');
  // Use fileEraser with a promise for Gulp 4 compatibility
  return fileEraser([BUILD_ROOT], {
    force: true
  }).then(paths => {
    console.log('[Purify Build] Removed build files and directories:\n', paths.join('\n'));
  }).catch(err => {
    console.error('[Purify Build] Error during cleanup:', err);
    throw err; // Re-throw to indicate task failure
  });
});

// Task to duplicate the main HTML entry point to the build folder.
projectAutomator.task('replicateHtml', function () {
  console.log(`[Replicate HTML] Copying ${ASSET_SPECIFICATIONS.entryHtml} to ${BUILD_ROOT}...`);
  const destinationPath = BUILD_ROOT; // Intermediate variable
  return projectAutomator.src(ASSET_SPECIFICATIONS.entryHtml)
    .pipe(projectAutomator.dest(destinationPath))
    .pipe(hotReload({
      stream: true
    }))
    .on('end', () => console.log('[Replicate HTML] HTML replication complete.'));
});

// Task to bundle and transpile JavaScript modules using Browserify.
projectAutomator.task('bundleScripts', function () {
  const sourceScriptPath = ASSET_SPECIFICATIONS.mainScript;
  const targetBundleName = ASSET_SPECIFICATIONS.packedScript;
  const outputDirectory = ASSET_SPECIFICATIONS.scriptOutput;

  if (typeof sourceScriptPath !== 'string' || !sourceScriptPath) {
    console.error('[Bundle Scripts] Main script path is invalid or not defined.');
    return Promise.reject(new Error('Invalid script path.'));
  }

  console.log(`[Bundle Scripts] Starting JavaScript bundling from ${sourceScriptPath}...`);

  // Define transformers in a clear array for readability
  const jsTransformers = [babelTranspiler, reactTransformer];

  let initialBundler = modulePackager(sourceScriptPath);
  jsTransformers.forEach(transformer => initialBundler.transform(transformer));

  return initialBundler
    .bundle()
    .on('error', handleStreamError) // Use custom error handler
    .pipe(virtualFileSource(targetBundleName))
    .pipe(memoryBuffer()) // Convert streaming vinyl file to buffered vinyl file
    .pipe(projectAutomator.dest(outputDirectory))
    .on('end', () => console.log('[Bundle Scripts] JavaScript bundling finished.'));
});

// Task for live-reloading JavaScript bundles during development.
projectAutomator.task('monitorScripts', function () {
  const mainEntry = ASSET_SPECIFICATIONS.mainScript;
  const bundleOutput = ASSET_SPECIFICATIONS.packedScript;
  const scriptDestination = ASSET_SPECIFICATIONS.scriptOutput;

  // Configure watchify with arguments for caching and polling
  let dynamicBundler = liveBundler(modulePackager([mainEntry], {
    cache: {},
    packageCache: {},
    fullPaths: true
  }));

  // Apply necessary transformations
  dynamicBundler
    .transform(babelTranspiler)
    .transform(reactTransformer);

  function rebuildBundle() {
    console.log('[Monitor Scripts] Rebuilding JavaScript bundle...');
    if (!dynamicBundler) {
      console.warn('[Monitor Scripts] Bundler not initialized. Skipping rebuild.');
      return Promise.resolve();
    }
    return dynamicBundler
      .bundle()
      .on('error', handleStreamError)
      .pipe(virtualFileSource(bundleOutput))
      .pipe(projectAutomator.dest(scriptDestination))
      .pipe(hotReload({
        stream: true
      }))
      .on('end', () => console.log('[Monitor Scripts] JavaScript bundle rebuild complete.'));
  }

  dynamicBundler.on('update', function (ids) {
    console.log('[Monitor Scripts] Detected file changes:', ids);
    rebuildBundle();
  });
  dynamicBundler.on('log', msg => console.log('[Monitor Scripts] Watchify log:', msg));

  return rebuildBundle(); // Perform initial bundle
});

// Task to compile LESS stylesheets into CSS.
projectAutomator.task('compileStyles', function () {
  const lessEntryFile = ASSET_SPECIFICATIONS.rootStyleEntry;
  const cssOutputName = 'app.css'; // Renamed from original
  const cssDestinationPath = ASSET_SPECIFICATIONS.styleOutput;

  console.log(`[Compile Styles] Starting LESS compilation from ${lessEntryFile}...`);

  const lessOptions = {
    // compile: true, // This is often default, can be omitted for brevity
    compress: false, // Keep uncompressed for dev, or true for production build
    paths: ['./src/less'] // Add paths for @import directives
  };

  return projectAutomator.src(lessEntryFile)
    .pipe(styleProcessor(lessOptions))
    .on('error', handleStreamError)
    .pipe(nameChanger(cssOutputName))
    .pipe(projectAutomator.dest(cssDestinationPath))
    .pipe(hotReload({
      stream: true
    }))
    .on('end', () => console.log('[Compile Styles] LESS compilation finished.'));
});

// Task to initialize the development server using BrowserSync.
projectAutomator.task('initDevServer', function (completionCallback) {
  console.log('[Init Dev Server] Starting BrowserSync server...');
  devServer.init({
    server: {
      baseDir: BUILD_ROOT,
      index: "index.html", // Explicitly set default file
      directory: true // Allow directory listing if no index.html
    },
    port: 3000, // Custom port
    ui: {
      port: 3001
    },
    open: false, // Don't automatically open browser
    notify: false // Suppress browser notifications
  }, completionCallback);
});

// Task to set up file watchers for various asset types.
projectAutomator.task('observeAssets', function () {
  console.log('[Observe Assets] Setting up file watchers...');

  // Watch LESS files and trigger style compilation
  const lessWatcher = projectAutomator.watch(ASSET_SPECIFICATIONS.styleSources, projectAutomator.series('compileStyles'));
  lessWatcher.on('change', path => console.log(`[Observe Assets] LESS file changed: ${path}`));

  // Watch HTML file and trigger index replication
  const htmlWatcher = projectAutomator.watch(ASSET_SPECIFICATIONS.entryHtml, projectAutomator.series('replicateHtml'));
  htmlWatcher.on('change', path => console.log(`[Observe Assets] HTML file changed: ${path}`));

  console.log('[Observe Assets] All watchers are active.');
});

// Main development task: cleans, sets up server, watches files, and monitors scripts.
projectAutomator.task('startDevelopment',
  projectAutomator.series(
    'purifyBuild', // Ensure a clean slate
    projectAutomator.parallel(
      'replicateHtml',
      'initDevServer',
      'observeAssets',
      'monitorScripts',
      'compileStyles'
    ),
    function (completionCallback) {
      console.log('[Start Development] Development environment is fully operational.');
      completionCallback();
    }
  )
);

// Default build task: cleans, copies HTML, and bundles JavaScript.
projectAutomator.task('buildProject',
  projectAutomator.series(
    'purifyBuild',
    'replicateHtml',
    'bundleScripts',
    'compileStyles', // Also compile styles for a static build
    function (completionCallback) {
      console.log('[Build Project] All build tasks completed successfully.');
      completionCallback();
    }
  )
);

// Set 'buildProject' as the default task if no other is specified.
projectAutomator.task('default', projectAutomator.series('buildProject'));