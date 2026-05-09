const workflow = require('gulp'); // Core task automation library
const styleTranspiler = require('gulp-less'); // Converts LESS preprocessor syntax to standard CSS
const cssPrefixer = require('gulp-autoprefixer'); // Automatically adds vendor prefixes to CSS rules
const cssCompressor = require('gulp-minify-css'); // Compresses and minifies CSS files for production
const jsCompressor = require('gulp-uglify'); // Minifies JavaScript files to reduce size
const fileRenameUtility = require('gulp-rename'); // Utility for renaming files within the pipeline
const angularDependencyInjector = require('gulp-ng-annotate'); // Adds Angular.js dependency injection annotations

// --- Centralized Project Configuration ---
// This object holds all key paths and options, making the build process
// easier to configure and maintain.
const buildConfiguration = {
    source: {
        basePath: 'src/',
        mainJsFile: 'ng-grid-panel.js',
        mainLessFile: 'ng-grid-panel.less'
    },
    destination: {
        outputDirectory: './', // Root output folder for all compiled assets
        minJsFileName: 'ng-grid-panel.min.js',
        minCssFileName: 'ng-grid-panel.min.css'
    },
    pluginsOptions: {
        ngAnnotate: {
            // Options for Angular DI annotation
            add: true, // Ensure annotations are added
            single_quotes: true // Use single quotes for annotated dependencies
        },
        uglify: {
            // Options for JavaScript minification
            preserveComments: 'some' // Keep specific comments (e.g., license headers)
        },
        minifyCss: {
            // Options for CSS minification
            keepBreaks: false // Remove line breaks for maximum compression
        },
        autoprefixer: {
            // Options for CSS autoprefixer
            cascade: false // Do not cascade prefixes (cleaner output)
        }
    }
};

// --- Custom Logging Utility ---
// A small helper function to provide consistent console output for task statuses.
function emitTaskStatus(taskIdentifier, statusMsg = 'starting') {
    console.log(`[${new Date().toLocaleTimeString()}] Job '${taskIdentifier}' ${statusMsg}...`);
}

// --- Primary Build Tasks ---

/**
 * Orchestrates the full compilation process for both JavaScript and CSS assets.
 * This task runs its sub-tasks in parallel for efficiency.
 */
workflow.task('fullCompilation', workflow.parallel('processJavaScript', 'processStylesheets'));

/**
 * Sets up the development workflow, which includes a full build followed by
 * continuous monitoring for file changes.
 */
workflow.task('devEnvironment', workflow.series('fullCompilation', 'monitorSourceFiles'));

/**
 * Handles the JavaScript asset pipeline:
 * 1. Reads the main JavaScript source file.
 * 2. Applies Angular DI annotations.
 * 3. Outputs the annotated (unminified) version.
 * 4. Renames the file for minification.
 * 5. Minifies the JavaScript code.
 * 6. Outputs the minified JavaScript file.
 * @returns {Stream} A Gulp stream indicating task completion.
 */
workflow.task('processJavaScript', function scriptAssetProcessor() {
    emitTaskStatus('processJavaScript');
    const inputJsPath = buildConfiguration.source.basePath + buildConfiguration.source.mainJsFile;
    const destinationFolder = buildConfiguration.destination.outputDirectory;
    const minifiedJsName = buildConfiguration.destination.minJsFileName;

    let jsPipeline = workflow.src(inputJsPath)
        .pipe(angularDependencyInjector(buildConfiguration.pluginsOptions.ngAnnotate))
        .pipe(workflow.dest(destinationFolder)) // Output the annotated version
        .pipe(fileRenameUtility(minifiedJsName)) // Prepare for minification
        .pipe(jsCompressor(buildConfiguration.pluginsOptions.uglify))
        .pipe(workflow.dest(destinationFolder)); // Output the minified version

    emitTaskStatus('processJavaScript', 'finished');
    return jsPipeline;
});

/**
 * Manages the CSS asset pipeline (LESS to CSS):
 * 1. Reads the main LESS source file.
 * 2. Transpiles LESS into standard CSS.
 * 3. Adds vendor prefixes for browser compatibility.
 * 4. Outputs the prefixed (unminified) CSS.
 * 5. Renames the file for minification.
 * 6. Minifies the CSS code.
 * 7. Outputs the minified CSS file.
 * @returns {Stream} A Gulp stream indicating task completion.
 */
workflow.task('processStylesheets', function styleAssetProcessor() {
    emitTaskStatus('processStylesheets');
    const inputLessPath = buildConfiguration.source.basePath + buildConfiguration.source.mainLessFile;
    const destinationFolder = buildConfiguration.destination.outputDirectory;
    const minifiedCssName = buildConfiguration.destination.minCssFileName;

    let cssPipeline = workflow.src(inputLessPath)
        .pipe(styleTranspiler()) // Convert LESS to CSS
        .pipe(cssPrefixer(buildConfiguration.pluginsOptions.autoprefixer)) // Add vendor prefixes
        .pipe(workflow.dest(destinationFolder)) // Output the prefixed version
        .pipe(fileRenameUtility(minifiedCssName)) // Prepare for minification
        .pipe(cssCompressor(buildConfiguration.pluginsOptions.minifyCss))
        .pipe(workflow.dest(destinationFolder)); // Output the minified version

    emitTaskStatus('processStylesheets', 'finished');
    return cssPipeline;
});

/**
 * Monitors specified source files for changes and triggers the appropriate
 * compilation tasks when a modification is detected.
 */
workflow.task('monitorSourceFiles', function fileChangeWatcher() {
    emitTaskStatus('monitorSourceFiles', 'active');
    console.log('Initiating file monitoring for changes...');

    // Watch Less files and re-run the CSS processing task upon modification
    workflow.watch(
        buildConfiguration.source.basePath + buildConfiguration.source.mainLessFile,
        workflow.series('processStylesheets')
    );

    // Watch JavaScript files and re-run the JS processing task upon modification
    workflow.watch(
        buildConfiguration.source.basePath + buildConfiguration.source.mainJsFile,
        workflow.series('processJavaScript')
    );
});

// --- Auxiliary Tasks (Type III Additions) ---

/**
 * A placeholder task for cleaning the build output directory.
 * In a production setup, this would use a module like 'del' or 'rimraf'.
 */
workflow.task('eraseOutputFolder', function cleanFolder(done) {
    emitTaskStatus('eraseOutputFolder', 'simulated');
    // console.log(`Simulating deletion of files in '${buildConfiguration.destination.outputDirectory}'...`);
    // Actual file deletion logic would go here.
    done(); // Signal task completion
});

/**
 * A placeholder task for linting or other code quality checks.
 * This would typically integrate ESLint, Stylelint, etc.
 */
workflow.task('performQualityChecks', function lintCode(done) {
    emitTaskStatus('performQualityChecks', 'simulated');
    // console.log('Simulating code quality assessment...');
    // Real linting tools would be integrated here.
    done(); // Signal task completion
});

// --- Default Task Definition ---
// The 'default' task is executed when 'gulp' is run without any specific task name.
// It's configured to run a clean, then quality checks, then the full compilation.
workflow.task('default', workflow.series('eraseOutputFolder', 'performQualityChecks', 'fullCompilation'));