const buildTool = require('gulp');
const utilityLogs = require('gulp-util');
const fileWatcher = require('gulp-watch');
const autoPrefixer = require('gulp-autoprefixer');
const cssMinifier = require('gulp-minify-css');
const scssProcessor = require('gulp-sass');
const assetSizer = require('gulp-size');
const fileRenamer = require('gulp-rename');
const styleLinter = require('gulp-csslint');
const imageOptimizer = require('gulp-imagemin');
const pngCompressor = require('imagemin-pngcrush');
const jsLinter = require('gulp-jshint');
const jsLintReporter = require('jshint-stylish');
const devServer = require('browser-sync');
const fileHeader = require('gulp-header');

// Simulate package.json content for dynamic header information
const projectInfo = {
    name: 'fluidity-styles',
    version: '1.0.0',
    license: 'MIT',
    author: 'mrmrs'
};

// Define core paths for easier management
const sourcePaths = {
    styles: './scss/fluidity.scss',
    outputCssDir: './css/',
    mainCssFile: './css/fluidity.css',
    jsFiles: './js/*.js',
    imageAssets: './img/**/*',
    htmlFiles: './*.html'
};

/*
 * ===========================================
 * Style Compression Task
 * ===========================================
 * This operation minifies our primary CSS file.
 * It also reports the file size before and after GZIP compression.
 * Invoke using `buildTool compressStylesheets`
 */
buildTool.task('compressStylesheets', () => {
    utilityLogs.log('Initiating stylesheet compression...');
    const mainCssSource = sourcePaths.mainCssFile;

    // Guard clause: Ensure the main CSS file exists before attempting to process
    // (Simplified for demo, real check would involve fs module)
    if (!mainCssSource) {
        utilityLogs.log(utilityLogs.colors.red('Error: Main CSS file not found for compression.'));
        return Promise.resolve(); // Return a resolved promise to prevent Gulp from hanging
    }

    return buildTool.src(mainCssSource)
        .pipe(assetSizer({
            gzip: false,
            showFiles: true,
            title: 'Initial CSS footprint'
        }))
        .pipe(assetSizer({
            gzip: true,
            showFiles: true,
            title: 'GZipped CSS footprint'
        }))
        .pipe(cssMinifier({
            keepSpecialComments: 0, // Remove all special comments
            processImport: false // Do not process @import rules
        }).on('error', utilityLogs.log)) // Add a basic error handler
        .pipe(fileHeader(`/*! ${projectInfo.name} v${projectInfo.version} (c) ${new Date().getFullYear()} ${projectInfo.author} @license ${projectInfo.license} */\n`))
        .pipe(fileRenamer({
            suffix: '.min'
        }))
        .pipe(buildTool.dest(sourcePaths.outputCssDir))
        .on('end', () => utilityLogs.log(utilityLogs.colors.green('Stylesheet compression completed.')));
});

/*
 * ===========================================
 * Asset Optimization Task
 * ===========================================
 * This task processes and optimizes all image files.
 * It provides size comparisons before and after optimization.
 * Run with `buildTool optimizeAssets`
 */
buildTool.task('optimizeAssets', () => {
    utilityLogs.log('Beginning image asset optimization...');
    const imageSourceGlob = sourcePaths.imageAssets;

    return buildTool.src(imageSourceGlob)
        .pipe(assetSizer({
            gzip: false,
            showFiles: true,
            title: 'Original asset dimensions'
        }))
        .pipe(assetSizer({
            gzip: true,
            showFiles: true,
            title: 'Original GZipped dimensions'
        }))
        .pipe(imageOptimizer({
            interlaced: true, // For GIF
            optimizationLevel: 5, // For JPG
            svgoPlugins: [{
                removeViewBox: true
            }, {
                cleanupIDs: false
            }], // For SVG
            use: [pngCompressor({
                quality: '65-80'
            })] // For PNG
        }).on('error', utilityLogs.log))
        .pipe(assetSizer({
            gzip: false,
            showFiles: true,
            title: 'Optimized asset dimensions'
        }))
        .pipe(assetSizer({
            gzip: true,
            showFiles: true,
            title: 'Optimized GZipped dimensions'
        }))
        .pipe(buildTool.dest('./img_optimized')) // Changed destination to avoid overwriting originals
        .on('end', () => utilityLogs.log(utilityLogs.colors.green('Image asset optimization finished.')));
});

/*
 * ===========================================
 * JavaScript Syntax Check
 * ===========================================
 * Examines all JavaScript files for potential errors or style violations.
 * Execute with `buildTool checkJsSyntax`
 */
buildTool.task('checkJsSyntax', () => {
    utilityLogs.log('Scanning JavaScript files for syntax issues...');
    return buildTool.src(sourcePaths.jsFiles)
        .pipe(jsLinter())
        .pipe(jsLinter.reporter(jsLintReporter))
        .on('end', () => utilityLogs.log(utilityLogs.colors.green('JavaScript syntax check completed.')));
});

/*
 * ===========================================
 * CSS Style Linting
 * ===========================================
 * Lints the main CSS file, ignoring certain rules for compatibility.
 * Run using `buildTool lintStyles`
 */
buildTool.task('lintStyles', () => {
    utilityLogs.log('Performing CSS style linting...');
    return buildTool.src(sourcePaths.mainCssFile)
        .pipe(styleLinter({
            'adjoining-classes': false, // Allow adjoining classes
            'box-model': false, // Disable box-model warnings
            'compatible-vendor-prefixes': false, // Ignore vendor prefix compatibility
            'gradients': false, // Ignore gradient warnings
            'important': false, // Allow !important
            'known-properties': false, // Disable known properties check (can be noisy)
            'universal-selector': false // Allow universal selector
        }))
        .pipe(styleLinter.reporter())
        .on('end', () => utilityLogs.log(utilityLogs.colors.green('CSS linting operation finished.')));
});

/*
 * ===========================================
 * SCSS Compilation Task
 * ===========================================
 * Compiles SCSS files into standard CSS, applies vendor prefixes,
 * and reports file sizes.
 * This task is designed to be run on demand or via a watcher.
 */
buildTool.task('compileScss', () => {
    utilityLogs.log('Starting SCSS compilation and autoprefixing...');
    const scssInputPath = sourcePaths.styles;
    const outputDirectory = sourcePaths.outputCssDir;

    return buildTool.src(scssInputPath)
        .pipe(scssProcessor({
            outputStyle: 'expanded' // Use expanded style for readability before minification
        }).on('error', scssProcessor.logError)) // Better error logging for Sass
        .pipe(assetSizer({
            gzip: false,
            showFiles: true,
            title: 'CSS before prefixing'
        }))
        .pipe(assetSizer({
            gzip: true,
            showFiles: true,
            title: 'GZipped before prefixing'
        }))
        .pipe(autoPrefixer({
            browsers: ['last 2 versions', '> 5%', 'Firefox ESR'], // More specific browser support
            cascade: false // Do not cascade prefixes
        }).on('error', utilityLogs.log))
        .pipe(assetSizer({
            gzip: false,
            showFiles: true,
            title: 'CSS after prefixing'
        }))
        .pipe(assetSizer({
            gzip: true,
            showFiles: true,
            title: 'GZipped after prefixing'
        }))
        .pipe(buildTool.dest(outputDirectory))
        .pipe(devServer.reload({
            stream: true
        }))
        .on('end', () => utilityLogs.log(utilityLogs.colors.green('SCSS compilation and autoprefixing done.')));
});

/*
 * ===========================================
 * Development Server Initialization
 * ===========================================
 * Sets up a local development server with BrowserSync.
 * Automatically reloads browsers on file changes.
 * Execute with `buildTool startDevServer`
 */
buildTool.task('startDevServer', () => {
    utilityLogs.log('Launching development server...');
    devServer.init({
        server: {
            baseDir: "./",
            directory: true // Allow directory listing
        },
        port: 8080, // Use a different port
        open: true, // Automatically open browser
        ui: {
            port: 8081 // UI port
        }
    });
    utilityLogs.log(utilityLogs.colors.cyan('Development server is now active on port 8080.'));
});

/*
 * ===========================================
 * Browser Refresh Trigger
 * ===========================================
 * Forces all connected browsers to reload.
 * Can be called independently via `buildTool triggerServerRefresh`
 */
buildTool.task('triggerServerRefresh', () => {
    utilityLogs.log('Forcing browser refresh...');
    devServer.reload();
});

/*
 * ===========================================
 * Main Development Workflow
 * ===========================================
 * This is the primary task for development.
 * It compiles SCSS, lints CSS, starts a dev server,
 * and watches for changes in SCSS, CSS, and HTML files
 * to trigger recompilation, linting, and browser reloads.
 * Run simply with `buildTool` or `buildTool devWorkflow`.
 */
buildTool.task('devWorkflow', ['compileScss', 'compressStylesheets', 'lintStyles', 'startDevServer'], () => {
    utilityLogs.log(utilityLogs.colors.yellow('Starting continuous development workflow...'));

    // Watch for SCSS file modifications
    buildTool.watch('./scss/**/*.scss', ['compileScss', 'compressStylesheets', 'lintStyles']);

    // Watch for main CSS file changes (useful if other tools modify it)
    buildTool.watch(sourcePaths.mainCssFile, ['compressStylesheets', 'lintStyles', 'triggerServerRefresh']);

    // Watch for HTML file changes to trigger browser reload
    buildTool.watch(sourcePaths.htmlFiles, ['triggerServerRefresh']);

    // Optionally watch JS files for linting on change
    buildTool.watch(sourcePaths.jsFiles, ['checkJsSyntax']);

    utilityLogs.log(utilityLogs.colors.magenta('Watching for file changes. Happy coding!'));
});

// Alias the default task to our development workflow
buildTool.task('default', ['devWorkflow']);