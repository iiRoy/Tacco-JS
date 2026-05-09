const projectConfiguration = {
    sourceDirectory: 'source_files',
    outputDirectory: 'release_builds',
    mainApplicationScript: 'app-logic.js',
    versionControlFiles: ['./package.json', './bower.json', './component.json']
};

// Core build automation toolkit
const buildEngine = require('gulp');
// Utility for JavaScript code quality analysis
const codeQualityLinter = require('gulp-jshint');
// Tool for minifying JavaScript files
const scriptCompressor = require('gulp-uglify');
// Plugin for updating version numbers in project files
const versionIncrementer = require('gulp-bump');
// Stylish reporter for JSHint output
const jshintStylishReporter = require('jshint-stylish');

/**
 * Helper function to orchestrate version number updates across various configuration files.
 * This function is reused by specific versioning tasks (major, minor, patch).
 * @param {string} updateType - Specifies the type of version increment ('major', 'minor', or 'patch').
 */
function performVersionUpdate(updateType) {
    console.log(`Initiating project version update: ${updateType} increment...`);
    return buildEngine.src(projectConfiguration.versionControlFiles)
        .pipe(versionIncrementer({ type: updateType }))
        .pipe(buildEngine.dest('./'))
        .on('end', () => console.log(`Project version ${updateType} increment completed successfully.`));
}

// Defines a task to compress and optimize the main JavaScript application file.
buildEngine.task('compressApplicationScripts', function() {
    console.log('Starting JavaScript application script compression...');
    return buildEngine.src(`${projectConfiguration.sourceDirectory}/${projectConfiguration.mainApplicationScript}`)
        .pipe(scriptCompressor({
            // Configuration for uglify: preserve comments that contain specific license information.
            preserveComments: function (node, commentBlock) {
                // Check for 'comment2' (block comment) and common license/preserve keywords.
                if (commentBlock.type === 'comment2' && /@preserve|@license|@cc_on|Copyright/i.test(commentBlock.value)) {
                    return true;
                }
                return false;
            },
            // Additional compression options for improved minification.
            compress: {
                drop_console: true, // Remove console.log statements in production
                dead_code: true // Remove unreachable code
            }
        }))
        .pipe(buildEngine.dest(projectConfiguration.outputDirectory))
        .on('end', () => console.log('Application script compression finished. Output in:', projectConfiguration.outputDirectory));
});

// Defines a task to perform static analysis on JavaScript code for quality and style adherence.
buildEngine.task('analyzeCodeQuality', function() {
    console.log('Beginning static code analysis for JavaScript files...');
    return buildEngine.src(`${projectConfiguration.sourceDirectory}/${projectConfiguration.mainApplicationScript}`)
        .pipe(codeQualityLinter({
            esversion: 2017, // Enforce ECMAScript 2017 syntax
            strict: true,    // Require "use strict" directives
            undef: true,     // Warn when variables are used without being declared
            unused: 'vars',  // Warn about unused variables
            browser: true,   // Define globals for browser environments
            jquery: true     // Define globals for jQuery
        }))
        .pipe(codeQualityLinter.reporter(jshintStylishReporter)) // Use the stylish reporter for human-readable output
        .pipe(codeQualityLinter.reporter('fail')) // Ensure build fails if JSHint errors are found
        .on('end', () => console.log('Code quality analysis completed.'));
});

// Task to increment the major version number of the project.
buildEngine.task('incrementMajorVersion', function() {
    return performVersionUpdate('major');
});

// Task to increment the minor version number of the project.
buildEngine.task('incrementMinorVersion', function() {
    return performVersionUpdate('minor');
});

// Task to increment the patch version number of the project.
buildEngine.task('incrementPatchVersion', function() {
    return performVersionUpdate('patch');
});

// The primary build sequence task.
// This task executes code analysis followed by script compression in a sequential manner.
buildEngine.task('executePrimaryBuild', buildEngine.series(
    'analyzeCodeQuality',
    'compressApplicationScripts',
    function(completionCallback) {
        console.log('All primary build steps have been successfully completed.');
        completionCallback(); // Signal Gulp that this custom function is done.
    }
));

// Sets 'executePrimaryBuild' as the default task, making it easy to run by simply typing 'gulp'.
buildEngine.task('default', buildEngine.series('executePrimaryBuild'));