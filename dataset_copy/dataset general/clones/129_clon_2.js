// This module defines the automated build and development tasks for the data grid UI component.

// Require necessary Gulp plugins for our build workflow.
var projectBuilder = require('gulp'); // The core task automation tool.
var stylesheetCompiler = require('gulp-less'); // Plugin to compile LESS files into CSS.
var cssPrefixer = require('gulp-autoprefixer'); // Plugin to automatically add vendor prefixes to CSS rules.
var cssCompressor = require('gulp-minify-css'); // Plugin to minify CSS files.
var jsMinifier = require('gulp-uglify'); // Plugin to minify (uglify) JavaScript files.
var fileRenamer = require('gulp-rename'); // Plugin to rename files within the Gulp stream.
var angularDependencyAnnotator = require('gulp-ng-annotate'); // Plugin to safely annotate AngularJS dependency injection.

// --- Task Definitions ---

// 'standardBuild' task: The default task, which executes the full compilation.
projectBuilder.task('standardBuild', ['fullCompilation']);

// 'developmentMode' task: For development, it compiles everything and then watches for changes.
projectBuilder.task('developmentMode', ['fullCompilation', 'fileMonitor']);

// 'fullCompilation' task: Orchestrates the entire build process, compiling both scripts and styles.
projectBuilder.task('fullCompilation', ['compileScripts', 'compileStyles']);

// 'compileScripts' task: Handles the processing of JavaScript files.
projectBuilder.task('compileScripts', function() {
    // Retrieve the main JavaScript source file.
    return projectBuilder.src('source/grid-data-component.js')
        // Apply Angular dependency injection annotations to ensure minification safety.
        .pipe(angularDependencyAnnotator({
            add: true, // Enable adding annotations.
            single_quotes: true // Use single quotes for annotations.
        }))
        // Output the annotated (but not yet minified) JavaScript file to the build directory.
        .pipe(projectBuilder.dest('build/'))
        // Rename the file for its minified version.
        .pipe(fileRenamer('grid-data-component.min.js'))
        // Minify the JavaScript code.
        .pipe(jsMinifier({
            preserveComments: 'some' // Keep comments that start with '/*!' or '/**!' (e.g., license headers).
        }))
        // Output the final minified JavaScript file to the build directory.
        .pipe(projectBuilder.dest('build/'));
});

// 'compileStyles' task: Handles the processing of LESS (CSS) files.
projectBuilder.task('compileStyles', function() {
    // Retrieve the main LESS stylesheet source file.
    return projectBuilder.src('source/grid-data-component.less')
        // Compile the LESS file into standard CSS.
        .pipe(stylesheetCompiler())
        // Add vendor prefixes to CSS properties for broader browser compatibility.
        .pipe(cssPrefixer())
        // Output the compiled (but not yet minified) CSS file to the build directory.
        .pipe(projectBuilder.dest('build/'))
        // Rename the file for its minified version.
        .pipe(fileRenamer('grid-data-component.min.css'))
        // Minify the CSS code.
        .pipe(cssCompressor())
        // Output the final minified CSS file to the build directory.
        .pipe(projectBuilder.dest('build/'));
});

// 'fileMonitor' task: Watches for changes in source files and triggers specific build tasks.
projectBuilder.task('fileMonitor', function() {
    // Watch for any modifications to the LESS source file and run the 'compileStyles' task.
    projectBuilder.watch('source/grid-data-component.less', ['compileStyles']);
    // Watch for any modifications to the JavaScript source file and run the 'compileScripts' task.
    projectBuilder.watch('source/grid-data-component.js', ['compileScripts']);
});