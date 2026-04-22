/**
 * Configuration settings for project build and compilation processes.
 * These paths define where source files are located and where output files should be generated.
 */
const projectPaths = {
  // Build-time output locations (for development/staging)
  outputAssets: 'dist/public/assets/',
  outputVendorAssets: 'dist/public/assets/vendor-libs/',
  outputHtmlPages: 'dist/public/',
  outputPublicRoot: 'dist/public/',
  outputSourceFiles: 'dist/public/src-dev/',
  outputDemoSourceFiles: 'dist/public/demo-app/',
  temporaryBuildArea: 'dist/temp/',
  outputVendorLibs: 'dist/public/vendor-libs/',

  // Main script name for compilation
  mainScriptOutputName: 'app-bundle.js',

  // Compile-time output locations (for production)
  finalAssets: 'release/public/assets/',
  finalVendorAssets: 'release/public/assets/vendor-libs/',
  finalHtmlPages: 'release/public/',
  finalPublicRoot: 'release/public/',
  finalSourceFiles: 'release/public/source-prod/',

  // Temporary directory for Mithril-Bootstrap processing
  mbTemporaryFolder: 'dist/mb-temp/',
  // Root-level files to copy
  topLevelFiles: ['public/**/*.*']
};

/**
 * Defines various source file globs for different application components.
 */
const sourceFiles = {
  staticContent: ['demo/assets/**/*.*'],
  markupPages: ['demo/index.html'],
  componentSources: ['demo/src/**/*.jsx'],
};

/**
 * Source files for the Mithril-Bootstrap library.
 */
const librarySources = {
  componentJsx: ['src/*.jsx', 'src/*/*.jsx'],
};

/**
 * Source files for documentation.
 */
const documentationSources = {
  markdownDocs: ['src/*/docs/*.md'],
  jsxDocs: ['src/*/docs/*.jsx']
};

/**
 * Third-party vendor library files.
 */
const thirdPartyDependencies = {
  vendorStaticAssets: [
    'vendor/bootstrap/fonts/*.*',
  ],
  vendorScripts: [
    'vendor/mithril/mithril.js',
    'vendor/min-require/min-require.js'
  ],
};

/**
 * Global application constants and settings.
 */
const globalSettings = {
  liveReloadPortNumber: 35729,
};

/* -------------------------------------------------------------------------- */
// Core Build System Utilities

const fileSystem = require('fs'); // Standard Node.js file system module
const buildTool = require('gulp'); // Gulp build system
const pathUtil = require('path'); // Node.js path utility module
const gulpExtensions = require('gulp-load-plugins')(); // Loads Gulp plugins dynamically
const taskRunner = require('run-sequence'); // Runs Gulp tasks in sequence

const consoleColors = gulpExtensions.util.colors; // Console coloring utility
const outputMessage = gulpExtensions.util.log; // Logging utility

/**
 * Cleans specified files or directories.
 * @param {string|string[]} targetPaths - Path(s) to clean.
 * @param {Function} [completionCallback] - Callback function to execute on completion.
 */
function purgeDirectoryContents(targetPaths, completionCallback) {
  if (!targetPaths || (Array.isArray(targetPaths) && targetPaths.length === 0)) {
    outputMessage(consoleColors.yellow('Warning: No paths provided for cleaning. Skipping.'));
    return completionCallback && completionCallback();
  }

  const pathsToClean = Array.isArray(targetPaths) ? targetPaths.map(p => consoleColors.magenta(p)) : consoleColors.magenta(targetPaths);
  outputMessage('Initiating cleanup for:', pathsToClean);

  buildTool.src(targetPaths, {read: false, allowEmpty: true})
    .pipe(gulpExtensions.clean({force: true})) // Force deletion of files outside CWD is allowed
    .on('end', completionCallback || (() => {}))
    .on('error', (err) => {
      outputMessage(consoleColors.red('Cleanup failed:'), err.message);
      if (completionCallback) completionCallback(err);
    });
}

/**
 * Generates a versioned file name suitable for cache busting.
 * @param {string} originalFileName - The original file name (e.g., 'main.js').
 * @returns {string} A glob pattern for the versioned file name (e.g., 'main-*.js').
 */
function generateVersionedFileName(originalFileName) {
  const lastDotIndex = originalFileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return originalFileName + '-*'; // No extension, append directly
  }
  return originalFileName.substring(0, lastDotIndex) + '-*' + originalFileName.substring(lastDotIndex);
}

// Ensure the temporary build area exists before some operations
buildTool.task('ensureTemporaryDirs', (done) => {
  if (!fileSystem.existsSync(projectPaths.temporaryBuildArea)) {
    fileSystem.mkdirSync(projectPaths.temporaryBuildArea, { recursive: true });
    outputMessage(consoleColors.green('Created temporary directory:'), consoleColors.magenta(projectPaths.temporaryBuildArea));
  }
  if (!fileSystem.existsSync(projectPaths.mbTemporaryFolder)) {
    fileSystem.mkdirSync(projectPaths.mbTemporaryFolder, { recursive: true });
    outputMessage(consoleColors.green('Created temporary directory:'), consoleColors.magenta(projectPaths.mbTemporaryFolder));
  }
  done();
});

// Task to replicate documentation source files
buildTool.task('replicateDocumentationAssets', (done) => {
  buildTool.src(documentationSources.jsx, {base: 'src'})
    .pipe(gulpExtensions.changed(projectPaths.outputDemoSourceFiles))
    .pipe(buildTool.dest(projectPaths.temporaryBuildArea))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in replicateDocumentationAssets:'), err.message); done(err); });
});

// Task to process Markdown documentation into JSX
buildTool.task('processMarkdownDocs', (done) => {
  buildTool.src(documentationSources.markdownDocs, {base:'src'})
    .pipe(gulpExtensions.plumber({
      errorHandler: function (err) {
        outputMessage(consoleColors.red('Markdown processing error:'), err.message);
        this.emit('end');
      }
    }))
    .pipe(gulpExtensions.changed(projectPaths.temporaryBuildArea, {extension: '.jsx'}))
    .pipe(gulpExtensions.markdown())
    .pipe(gulpExtensions.insert.wrap('<div>\n', '\n</div>')) // Wrap content with a div
    .pipe(gulpExtensions.rename({
      prefix: 'doc_', // Differentiate from other JSX
      extname: '.jsx'
    }))
    .pipe(buildTool.dest(projectPaths.temporaryBuildArea))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in processMarkdownDocs:'), err.message); done(err); });
});

// Task to convert documentation JSX files using MSX
buildTool.task('transpileDocsMsx', (done) => {
  buildTool.src(pathUtil.join(projectPaths.temporaryBuildArea, '**/docs/*.jsx'), {base: projectPaths.temporaryBuildArea})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.changed(projectPaths.temporaryBuildArea, {extension: '.js'}))
    .pipe(gulpExtensions.msx())
    .pipe(buildTool.dest(projectPaths.temporaryBuildArea))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in transpileDocsMsx:'), err.message); done(err); });
});

// Task to convert demo application JSX files using MSX
buildTool.task('transpileDemoMsx', (done) => {
  buildTool.src(documentationSources.jsx, {base:'src'})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.changed(projectPaths.temporaryBuildArea, {extension: '.js'}))
    .pipe(gulpExtensions.msx())
    .pipe(buildTool.dest(projectPaths.temporaryBuildArea))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in transpileDemoMsx:'), err.message); done(err); });
});

// Combines JSX-converted files, wraps them, and stores in the demo output directory
buildTool.task('assembleAppScripts', (done) => {
  buildTool.src(pathUtil.join(projectPaths.temporaryBuildArea, '**/*.js'), {base: projectPaths.temporaryBuildArea})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.includeJs({ext:'js', cache:true, showFiles:'Building'}))
    .pipe(gulpExtensions.includeJs({exactName: true, cache:'jsx', keyword: 'CONTENT', recursive: false, transform: (s) => JSON.stringify(s) }))
    .pipe(gulpExtensions.jsPrettify({indent_size:2,max_preserve_newlines:2}))
    .pipe(gulpExtensions.wrapRequire())
    .pipe(buildTool.dest(projectPaths.outputDemoSourceFiles))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in assembleAppScripts:'), err.message); done(err); });
});

// Converts application JSX files to JS
buildTool.task('transpileAppJsx', (done) => {
  buildTool.src(sourceFiles.componentSources, {base: 'demo/src'})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.changed(projectPaths.temporaryBuildArea, {extension: '.js'}))
    .pipe(gulpExtensions.msx())
    .pipe(buildTool.dest(projectPaths.temporaryBuildArea))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in transpileAppJsx:'), err.message); done(err); });
});

// Orchestrates the conversion and assembly of all application scripts
buildTool.task('buildApplicationScripts', (done) => {
  taskRunner(
    'ensureTemporaryDirs',
    'processMarkdownDocs',
    'transpileDocsMsx',
    'transpileDemoMsx',
    'transpileAppJsx',
    'assembleAppScripts',
    done
  );
});

// Copies vendor scripts to the development build directory
buildTool.task('copyVendorScriptsToBuild', (done) => {
  buildTool.src(thirdPartyDependencies.vendorScripts, {base: 'vendor'})
    .pipe(buildTool.dest(projectPaths.outputVendorLibs))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in copyVendorScriptsToBuild:'), err.message); done(err); });
});

// Concatenates and minifies all scripts for production compilation
buildTool.task('bundleAndMinifyScripts', (done) => {
  const mainBundlePath = pathUtil.join(projectPaths.finalAssets, generateVersionedFileName(projectPaths.mainScriptOutputName));
  const _performBundling = () => {
    const scriptGlobs = [
      pathUtil.join(projectPaths.outputPublicRoot, 'vendor-libs/min-require/min-require.js'),
      pathUtil.join(projectPaths.outputDemoSourceFiles, '**/*.js'),
      pathUtil.join('!' + projectPaths.outputDemoSourceFiles, '**/_*.js') // Exclude partials
    ];

    buildTool.src(scriptGlobs, { allowEmpty: false })
      .pipe(gulpExtensions.plumber())
      .pipe(gulpExtensions.concat(projectPaths.mainScriptOutputName))
      .pipe(gulpExtensions.insert.append('\n\nrequire(\'main\');\n')) // Ensure main module is loaded
      .pipe(gulpExtensions.stripDebug()) // Remove console.log and debugger statements
      .pipe(gulpExtensions.uglify({mangle: true, compress: { drop_console: true }})) // Minify and mangle
      .pipe(gulpExtensions.rev()) // Add revision hash for cache busting
      .pipe(gulpExtensions.size({showFiles: true, title: 'Final Script Bundle'}))
      .pipe(buildTool.dest(projectPaths.finalAssets))
      .on('end', done)
      .on('error', (err) => { outputMessage(consoleColors.red('Error in bundleAndMinifyScripts:'), err.message); done(err); });
  };

  // Clean previous versioned bundles before creating new ones
  purgeDirectoryContents(mainBundlePath, _performBundling);
});

// Copies application static assets to the development build directory
buildTool.task('copyApplicationStaticAssets', (done) => {
  buildTool.src(sourceFiles.staticContent, {base: 'demo/assets'})
    .pipe(gulpExtensions.changed(projectPaths.outputAssets))
    .pipe(buildTool.dest(projectPaths.outputAssets))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in copyApplicationStaticAssets:'), err.message); done(err); });
});

// Copies vendor static assets to the development build directory
buildTool.task('copyVendorStaticAssets', (done) => {
  buildTool.src(thirdPartyDependencies.vendorStaticAssets)
    .pipe(buildTool.dest(projectPaths.outputVendorAssets))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in copyVendorStaticAssets:'), err.message); done(err); });
});

// Copies all built assets from development to the final compilation directory
buildTool.task('replicateFinalAssets', (done) => {
  buildTool.src(pathUtil.join(projectPaths.outputAssets, '**/*.*'), {base: projectPaths.outputAssets})
    .pipe(buildTool.dest(projectPaths.finalAssets))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in replicateFinalAssets:'), err.message); done(err); });
});

/**
 * Injects HTML fragments (scripts, stylesheets) into a template.
 * @param {string} injectionTag - The tag name for injection (e.g., 'vendor').
 * @param {string} ignoreBasePath - Base path to ignore when generating injected paths.
 * @param {string[]} fileGlobs - Globs for files to inject.
 * @returns {Stream} Gulp stream for injection.
 */
function insertHtmlFragments(injectionTag, ignoreBasePath, fileGlobs) {
  return gulpExtensions.inject(
    buildTool.src(fileGlobs, {read:false, allowEmpty: true}), {
      starttag: `<!-- ${injectionTag}.{{ext}} -->`,
      endtag: '<!-- /end -->', // Slightly different end tag
      addRootSlash: false,
      ignorePath: ignoreBasePath,
      sort: (fileA, fileB) => fileA.path.localeCompare(fileB.path) // Use localeCompare for consistent sorting
    }
  );
}

// Builds the main index.html page for development
buildTool.task('constructDevIndexHtml', (done) => {
  const demoRootPath = projectPaths.outputPublicRoot; // Alias for clarity
  const livereloadScript = `<script src="//localhost:${globalSettings.liveReloadPortNumber}/livereload.js"></script>`;

  buildTool.src(sourceFiles.markupPages)
    .pipe(gulpExtensions.plumber())
    .pipe(insertHtmlFragments('vendor-scripts', demoRootPath,
      [
        pathUtil.join(projectPaths.outputVendorAssets, '**/*.css'),
        pathUtil.join(projectPaths.outputVendorLibs, '**/*.js'),
        pathUtil.join(projectPaths.outputPublicRoot, 'assets/mithril-bootstrap.js') // Example specific asset
      ]
    ))
    .pipe(insertHtmlFragments('app-modules', demoRootPath,
      [
        pathUtil.join(projectPaths.outputPublicRoot, 'assets/demo.css'),
        pathUtil.join(projectPaths.outputDemoSourceFiles, '**/*.js'),
        pathUtil.join('!' + projectPaths.outputDemoSourceFiles, '**/_*.js')
      ]
    ))
    .pipe(gulpExtensions.insert.append('<script>require(\'main\');</script>\n'))
    .pipe(gulpExtensions.insert.append(livereloadScript))
    .pipe(buildTool.dest(projectPaths.outputHtmlPages))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in constructDevIndexHtml:'), err.message); done(err); });
});

// Compiles the main index.html page for production
buildTool.task('constructProdIndexHtml', (done) => {
  const releaseRootPath = projectPaths.finalPublicRoot; // Alias for clarity
  const mainScriptGlob = pathUtil.join(projectPaths.finalAssets, generateVersionedFileName(projectPaths.mainScriptOutputName));

  buildTool.src(sourceFiles.markupPages)
    .pipe(gulpExtensions.plumber())
    .pipe(insertHtmlFragments('production-assets', releaseRootPath,
    [
      pathUtil.join(projectPaths.finalAssets, 'vendor/bootstrap.css'),
      pathUtil.join(projectPaths.finalAssets, 'demo.css'),
      pathUtil.join(projectPaths.finalAssets, 'vendor/mithril.js'),
      pathUtil.join(projectPaths.finalAssets, 'mithril-bootstrap.js'),
      mainScriptGlob
    ]))
    .pipe(gulpExtensions.minifyHtml({ empty: true, cdata: true, comments: true, spare: true, conditionals: true })) // Minify HTML
    .pipe(gulpExtensions.size({showFiles:true, title: 'Final HTML'}))
    .pipe(buildTool.dest(projectPaths.finalHtmlPages))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in constructProdIndexHtml:'), err.message); done(err); });
});

// Copies root-level files to the development build directory
buildTool.task('copyRootFilesToBuild', (done) => {
  buildTool.src(projectPaths.topLevelFiles, {base:'.'})
    .pipe(gulpExtensions.changed('dist'))
    .pipe(buildTool.dest('dist'))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in copyRootFilesToBuild:'), err.message); done(err); });
});

// Copies root-level files to the final compilation directory
buildTool.task('copyRootFilesToRelease', (done) => {
  buildTool.src(projectPaths.topLevelFiles, {base:'.'})
    .pipe(buildTool.dest('release'))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in copyRootFilesToRelease:'), err.message); done(err); });
});

// Converts Mithril-Bootstrap JSX files to JS
buildTool.task('transpileMithrilBootstrapJsx', (done) => {
  buildTool.src(librarySources.componentJsx, {base: 'src'})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.changed(projectPaths.mbTemporaryFolder, {extension: '.js'}))
    .pipe(gulpExtensions.msx())
    .pipe(buildTool.dest(projectPaths.mbTemporaryFolder))
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in transpileMithrilBootstrapJsx:'), err.message); done(err); });
});

// Includes and bundles Mithril-Bootstrap scripts
buildTool.task('bundleMithrilBootstrap', (done) => {
  buildTool.src(pathUtil.join(projectPaths.mbTemporaryFolder, '**/*.js'), {base:projectPaths.mbTemporaryFolder})
    .pipe(gulpExtensions.plumber())
    .pipe(gulpExtensions.includeJs({ext:'js', cache:true, showFiles:'Bundling Mithril-Bootstrap'}))
    .pipe(gulpExtensions.uglify({mangle: true, compress: { drop_console: true }})) // Minify the bundle
    .pipe(gulpExtensions.rename('mithril-bootstrap.js')) // Ensure consistent output name
    .pipe(buildTool.dest('dist')) // Output to a temporary dist for inclusion
    .pipe(buildTool.dest(projectPaths.outputAssets)) // Also copy to main assets for dev
    .on('end', done)
    .on('error', (err) => { outputMessage(consoleColors.red('Error in bundleMithrilBootstrap:'), err.message); done(err); });
});

// Orchestrates the build of Mithril-Bootstrap
buildTool.task('buildMithrilBootstrapLibrary', (done) => {
  taskRunner('ensureTemporaryDirs', 'transpileMithrilBootstrapJsx', 'bundleMithrilBootstrap', done);
});

/* -------------------------------------------------------------------------- */
// Major Workflow Tasks

// Cleans all build and release directories
buildTool.task('cleanAllArtifacts', (done) => {
  purgeDirectoryContents(['dist', 'release'], done);
});

// Main development build task
buildTool.task('developmentBuild', (done) => {
  taskRunner('cleanAllArtifacts',
    [
      'replicateDocumentationAssets',
      'buildApplicationScripts',
      'copyVendorScriptsToBuild',
      'copyApplicationStaticAssets',
      'copyVendorStaticAssets',
      'copyRootFilesToBuild',
      'buildMithrilBootstrapLibrary'
    ],
    'constructDevIndexHtml',
    done);
});

// Main production compilation task
buildTool.task('productionCompile', (done) => {
  taskRunner('developmentBuild', // First perform a full dev build
    [
      'bundleAndMinifyScripts',
      'replicateFinalAssets',
      'copyRootFilesToRelease'
    ],
    'constructProdIndexHtml',
    done);
});

// Default task runs production compilation
buildTool.task('default', ['productionCompile']);

// Watch task for development, triggers rebuilds and live reload
buildTool.task('watchForChanges', (done) => {

  const eventColorMap = {
    added: consoleColors.green,
    changed: consoleColors.magenta,
    deleted: consoleColors.red,
    renamed: consoleColors.cyan
  };

  /**
   * Logs file system events with colored output.
   * @param {object} event - The Gulp watch event object.
   */
  function logFileSystemEvent(event) {
    const colorFn = eventColorMap[event.type] || consoleColors.white;
    outputMessage(`[${colorFn(event.type)}]`, consoleColors.magenta(pathUtil.relative(process.cwd(), event.path)));
  }

  const liveReloader = gulpExtensions.livereload(globalSettings.liveReloadPortNumber);

  /**
   * Creates a debounced function to run Gulp tasks sequentially.
   * @param {...string} tasks - Task names to run.
   * @returns {Function} A function that executes the tasks.
   */
  function executeSequentialTasks(...tasks) {
    let timeoutId;
    return (event) => {
      logFileSystemEvent(event);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        taskRunner(...tasks, (err) => {
          if (err) outputMessage(consoleColors.red('Watch task failed:'), err.message);
        });
      }, 300); // Debounce to prevent rapid multiple runs
    };
  }

  /**
   * Triggers a live reload for a specific file or the entire page.
   * @param {string} filePath - The path to trigger reload for.
   * @returns {Function} A function that triggers live reload.
   */
  function triggerLiveReload(filePath) {
    return (completionCb) => {
      liveReloader.changed(filePath);
      completionCb();
    };
  }

  const mainPageIndex = 'index.html'; // Common path for HTML reload

  buildTool.watch(sourceFiles.staticContent, executeSequentialTasks('copyApplicationStaticAssets', triggerLiveReload('assets/demo.css')));
  buildTool.watch(sourceFiles.markupPages, executeSequentialTasks('constructDevIndexHtml', triggerLiveReload(mainPageIndex)));
  buildTool.watch(projectPaths.topLevelFiles, executeSequentialTasks('copyRootFilesToBuild'));

  // Watch for changes in application JSX, documentation JSX/MD
  buildTool.watch([sourceFiles.componentSources, documentationSources.jsx, documentationSources.markdownDocs],
    executeSequentialTasks('buildApplicationScripts', 'constructDevIndexHtml', triggerLiveReload(mainPageIndex))
  );

  // Watch for changes in Mithril-Bootstrap JSX
  buildTool.watch(librarySources.componentJsx,
    executeSequentialTasks('buildMithrilBootstrapLibrary', triggerLiveReload(mainPageIndex))
  );

  outputMessage(consoleColors.green('Watching for file changes... Press Ctrl+C to stop.'));
  done();
});