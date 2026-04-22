// This file orchestrates the development and build processes for the project.

var bundler         = require('browserify'),     // Tool for bundling JavaScript modules
    syncTool        = require('browser-sync'),   // Live reload server and synchronizer
    fileData        = require('gulp-data'),      // Gulp plugin to inject data into files
    builder         = require('gulp'),           // The main Gulp task runner
    imgOptimizer    = require('gulp-imagemin'),  // Gulp plugin for image optimization
    templateEngine  = require('gulp-jade'),      // Gulp plugin for Jade/Pug template compilation
    jsLinter        = require('gulp-jshint'),    // Gulp plugin for JavaScript linting
    stylusPlugin    = require('nib'),            // Stylus plugin for CSS pre-processor
    errorGuard      = require('gulp-plumber'),   // Gulp plugin to prevent pipe breaking on errors
    linterReporter  = require('jshint-stylish'), // Stylish reporter for JSHint
    styleProcessor  = require('gulp-stylus'),    // Gulp plugin for Stylus compilation
    streamConverter = require('vinyl-transform'),// Gulp plugin to transform vinyl streams
    jsMinifier      = require('gulp-uglify'),    // Gulp plugin for JavaScript minification
    projectContent  = require('./content.json'), // Project-specific content data
    assetLocations  = {},                        // Object to store all dynamic path configurations
    isDevelopmentMode;                           // Flag to determine development or production mode

// Function to establish and update all critical file paths
function configureAssetPaths() {
    assetLocations = {
        sourceDir   : __dirname + '/src/',  // Root directory for source files
        stagingDir  : __dirname + '/build/',// Directory for development builds
        releaseDir  : __dirname + '/dist/'  // Directory for production builds
    };

    // Determine the target output directory based on the current mode
    assetLocations.targetDir = (isDevelopmentMode) ? assetLocations.stagingDir : assetLocations.releaseDir;

    // Define paths for JavaScript assets
    assetLocations.scriptAssets = {
        watchGlob   : assetLocations.sourceDir + 'js/**/*.js', // Pattern to watch all JS files
        mainSource  : assetLocations.sourceDir + 'js/**/app.js',// Main entry point for JS bundling
        outputDir   : assetLocations.targetDir + 'js/'      // Destination for processed JS files
    };

    // Define paths for CSS/Stylus assets
    assetLocations.styleAssets = {
        watchGlob   : assetLocations.sourceDir + 'css/**/*.styl', // Pattern to watch all Stylus files
        mainSource  : assetLocations.sourceDir + 'css/style.styl',// Main entry point for Stylus compilation
        outputDir   : assetLocations.targetDir + 'css/'      // Destination for processed CSS files
    };

    // Define paths for HTML/Jade assets
    assetLocations.markupAssets = {
        watchGlob   : assetLocations.sourceDir + 'html/**/*.jade', // Pattern to watch all Jade files
        mainSource  : assetLocations.sourceDir + 'html/*.jade',    // Main entry point for Jade compilation
        outputDir   : assetLocations.targetDir                   // Destination for compiled HTML files
    };

    // Define paths for Image assets
    assetLocations.imageAssets = {
        watchGlob   : assetLocations.sourceDir + 'img/**/*',    // Pattern to watch all image files
        mainSource  : assetLocations.sourceDir + 'img/**/*',    // Source for image optimization
        outputDir   : assetLocations.targetDir + 'img/'      // Destination for optimized images
    };
}


// Gulp task to compile HTML templates
builder.task('compileMarkup', function () {
    return builder.src(assetLocations.markupAssets.mainSource)
        .pipe(errorGuard()) // Handle errors gracefully without stopping the watch task
        .pipe(fileData(function (currentFile) {
            // Inject global content data into the Jade templates
            return projectContent;
        }))
        .pipe(templateEngine({
            pretty: isDevelopmentMode // Format HTML output for readability in dev mode
        }))
        .pipe(builder.dest(assetLocations.markupAssets.outputDir)); // Output compiled HTML
});

// Gulp task to process and compile CSS styles
builder.task('processStyles', function () {
    return builder.src(assetLocations.styleAssets.mainSource)
        .pipe(errorGuard()) // Prevent pipeline breaks from Stylus errors
        .pipe(styleProcessor({
            use: [stylusPlugin()], // Integrate Nib for vendor prefixing and other features
            compress: (!isDevelopmentMode), // Compress CSS in production mode
            linenos: isDevelopmentMode,    // Include line numbers in dev mode for debugging
            errors: true,                  // Display errors
            sourcemap: {
                inline     : isDevelopmentMode, // Embed sourcemaps directly in dev mode
                sourceRoot : '../',             // Adjust source root for sourcemaps
                basePath   : 'css'              // Base path for sourcemaps
            }
        }))
        .pipe(builder.dest(assetLocations.styleAssets.outputDir)) // Output compiled CSS
        .pipe(syncTool.reload({stream: true})); // Inject CSS changes without full page reload
});

// Gulp task to bundle and process JavaScript files
builder.task('bundleScripts', function () {
    if (isDevelopmentMode) {
        // In development mode, perform linting and then bundle without minification
        builder.src(assetLocations.scriptAssets.watchGlob)
            .pipe(jsLinter())                      // Run JSHint for code quality checks
            .pipe(jsLinter.reporter(linterReporter)); // Report linting issues using stylish reporter

        return builder.src(assetLocations.scriptAssets.mainSource)
            .pipe(errorGuard()) // Protect the stream from JS errors
            .pipe(streamConverter(function(inputFileName) {
                return bundler(inputFileName).bundle(); // Use Browserify to bundle modules
            }))
            .pipe(builder.dest(assetLocations.scriptAssets.outputDir)); // Output bundled JS
    } else {
        // In production mode, bundle and then minify JavaScript
        return builder.src(assetLocations.scriptAssets.mainSource)
            .pipe(streamConverter(function(inputFileName) {
                return bundler(inputFileName).bundle(); // Bundle JavaScript
            }))
            .pipe(jsMinifier({
                preserveComments: 'some' // Keep specific comments (e.g., license comments)
            }))
            .pipe(builder.dest(assetLocations.scriptAssets.outputDir)); // Output minified JS
    }
});

// Gulp task to optimize image assets
builder.task('optimizeImages', function () {
    return builder.src(assetLocations.imageAssets.mainSource)
        .pipe(errorGuard()) // Ensure image processing errors don't stop the build
        .pipe(imgOptimizer({
            progressive       : true, // Optimize JPGs for progressive rendering
            interlaced        : true, // Optimize GIFs for interlaced rendering
            optimizationLevel : 6     // Set optimization level for PNGs (0-7)
        }))
        .pipe(builder.dest(assetLocations.imageAssets.outputDir)); // Output optimized images
});

// Gulp task to copy static assets that don't require processing
builder.task('transferStaticAssets', function () {
    var staticFiles = [
        assetLocations.sourceDir + '*',          // Root level files
        assetLocations.sourceDir + 'img/**',    // Images (already handled by optimizeImages, but good for other asset types)
        assetLocations.sourceDir + 'font/**',   // Fonts
        assetLocations.sourceDir + 'dependencies/**', // Third-party dependencies
        '!' + assetLocations.sourceDir + 'html', // Exclude HTML source directory
        '!' + assetLocations.sourceDir + 'css',  // Exclude CSS source directory
        '!' + assetLocations.sourceDir + 'js'    // Exclude JS source directory
    ];

    return builder.src(staticFiles, {
        base: assetLocations.sourceDir // Maintain folder structure relative to sourceDir
    })
    .pipe(builder.dest(assetLocations.targetDir)); // Copy to the build/dist directory
});

// Gulp task to initialize the BrowserSync server for live development
builder.task('startLiveReload', function () {
    syncTool.init([
        assetLocations.markupAssets.outputDir + '*.html',  // Watch compiled HTML files
        assetLocations.styleAssets.outputDir  + '*.css',   // Watch compiled CSS files
        assetLocations.scriptAssets.outputDir   + '*.js',    // Watch bundled JS files
        assetLocations.imageAssets.outputDir  + '**/*'     // Watch all image files
    ], {
        server: {
            baseDir: assetLocations.targetDir // Serve files from the target build directory
        }
    });
});

// Gulp task to monitor source files for changes and re-run relevant tasks
builder.task('monitorChanges', function () {
    builder.watch([assetLocations.markupAssets.watchGlob] , ['compileMarkup'   , syncTool.reload]); // Recompile HTML and reload browser
    builder.watch([assetLocations.styleAssets.watchGlob]  , ['processStyles']);                     // Recompile CSS and inject changes
    builder.watch([assetLocations.scriptAssets.watchGlob] , ['bundleScripts'   , syncTool.reload]); // Rebundle JS and reload browser
    builder.watch([assetLocations.imageAssets.watchGlob]  , ['optimizeImages'  , syncTool.reload]); // Reoptimize images and reload browser
});

// Gulp task to set the build mode to development
builder.task('enableDevelopment', function () {
    isDevelopmentMode = true; // Set flag for development environment
    configureAssetPaths();    // Reconfigure paths for development output
});

// Gulp task to set the build mode to production
builder.task('enableProduction', function () {
    isDevelopmentMode = false; // Set flag for production environment
    configureAssetPaths();     // Reconfigure paths for production output
});

// Group task for all core build operations
builder.task('performBuildTasks'     , ['compileMarkup', 'processStyles', 'bundleScripts', 'optimizeImages' , 'transferStaticAssets']);
// Group task to initiate a development build
builder.task('initiateDevelopmentBuild'   , ['enableDevelopment', 'performBuildTasks']);
// Group task to initiate a production build
builder.task('initiateProductionBuild'    , ['enableProduction', 'performBuildTasks']);
// Default task: development build with live reload and watch
builder.task('defaultWorkflow' , ['initiateDevelopmentBuild', 'startLiveReload' , 'monitorChanges']);