// This file orchestrates various development and build tasks for the project.
// It leverages Gulp.js for automation, ensuring consistent workflows.

// Essential build tool and task runner for managing project operations
const buildTool = require('gulp');

// Linting utility for JavaScript code quality analysis and style enforcement
const codeLinter = require('gulp-jshint');

// Test runner framework for executing unit and integration tests across the codebase
const testRunner = require('gulp-mocha');

// Documentation generation tool, transforming source comments into readable documentation
const documentationGenerator = require('gulp-docco');

// File and directory deletion utility, used for cleaning build artifacts
const directoryCleaner = require('del');

// --- Configuration Constants ---
// Define key paths and file names using constants for better maintainability and readability.
const sourceCodeDirectory = './lib'; // Directory containing application's primary source code
const testCasesDirectory = './test'; // Directory containing all test scripts
const outputDocumentationDirectory = './docs'; // Target directory for generated project documentation
const primaryApplicationModule = 'telegram.link.js'; // The main JavaScript module file
const unitTestScript = 'telegram.link.test.js'; // The main unit test suite file

// Reporter configuration for test execution, allowing easy switching between different output formats.
const standardTestReporter = 'spec'; // A concise, human-readable reporter for console output
const coverageTestReporter = 'mocha-lcov-reporter'; // Reporter specifically for generating LCOV coverage data for CI systems

// --- Utility Functions ---
/**
 * Logs a message to the console with a distinct prefix to easily identify build task outputs.
 * @param {string} message The message string to be logged.
 */
function logTaskMessage(message) {
    console.log(`[PROJECT-BUILD] ${message}`);
}

// --- Task Definitions ---

// Task 1: purgeDocs - Responsible for cleaning up the generated documentation directory.
// This ensures a clean slate before new documentation is built.
buildTool.task('purgeDocs', function(done) {
    logTaskMessage(`Initiating cleanup of existing documentation at '${outputDocumentationDirectory}'...`);
    // 'del' returns a Promise, which is used here for asynchronous operation handling.
    return directoryCleaner(outputDocumentationDirectory)
        .then(paths => {
            // Check if any files/folders were actually deleted and log accordingly.
            if (paths.length > 0) {
                logTaskMessage(`Successfully removed old documentation files/folders: ${paths.join(', ')}`);
            } else {
                logTaskMessage(`No old documentation found at '${outputDocumentationDirectory}' to remove.`);
            }
            done(); // Signal Gulp that the asynchronous task has completed successfully.
        })
        .catch(err => {
            logTaskMessage(`Error during documentation cleanup: ${err.message}`);
            done(err); // Signal Gulp that the asynchronous task failed.
        });
});

// Task 2: compileDocs - Generates project documentation from source files using Docco.
// This task is dependent on 'purgeDocs' to ensure a clean build.
buildTool.task('compileDocs', buildTool.series('purgeDocs', function() {
    logTaskMessage(`Starting documentation generation from '${sourceCodeDirectory}/${primaryApplicationModule}'...`);
    return buildTool.src(`${sourceCodeDirectory}/${primaryApplicationModule}`)
        .pipe(documentationGenerator({
            layout: 'linear', // Configures Docco to use a linear layout for the generated documents.
            css: './doc_assets/custom_doc_styles.css' // Example: Link a custom CSS file for unique styling.
        }))
        .pipe(buildTool.dest(outputDocumentationDirectory))
        .on('end', () => logTaskMessage('Documentation compilation complete.')); // Log completion after the stream ends.
}));

// Task 3: inspectCode - Performs static analysis on the source code using JSHint for quality checks.
// This helps maintain code standards and identify potential issues early.
buildTool.task('inspectCode', function() {
    logTaskMessage(`Running code quality inspection on JavaScript files in '${sourceCodeDirectory}'...`);
    // The task must return the stream for Gulp to correctly identify its completion.
    return buildTool.src(`${sourceCodeDirectory}/**/*.js`) // Target all JS files within the source directory.
        .pipe(codeLinter()) // Apply JSHint linting.
        .pipe(codeLinter.reporter('stylish', {
            verbose: true // Use the 'stylish' reporter for readable output and make it verbose.
        }))
        .pipe(codeLinter.reporter('fail')); // Fail the Gulp task if any linting errors are detected.
});

// Task 4: runUnitTests - Executes the primary suite of unit tests using Mocha.
// This task verifies the correctness of the application logic.
buildTool.task('runUnitTests', function() {
    logTaskMessage(`Executing unit tests from '${testCasesDirectory}/${unitTestScript}'...`);
    return buildTool.src(`${testCasesDirectory}/${unitTestScript}`, { read: false }) // 'read: false' optimizes performance for Mocha.
        .pipe(testRunner({
            reporter: standardTestReporter, // Use the human-readable 'spec' reporter.
            timeout: '30s', // Increased timeout for potentially slower test environments.
            bail: true // Exit the test run after the first test failure.
        }))
        .on('error', (err) => {
            logTaskMessage(`Unit tests failed with an error: ${err.message}`);
            // Optionally, exit the process with a non-zero code to indicate failure in CI environments.
            process.exit(1);
        })
        .on('end', () => logTaskMessage('Unit test execution finished.')); // Log completion after all tests have run.
});

// Task 5: generateCoverage - Generates a code coverage report for the test suite.
// This is crucial for understanding test effectiveness, especially in CI/CD pipelines.
buildTool.task('generateCoverage', function() {
    logTaskMessage(`Generating code coverage report for '${testCasesDirectory}/${unitTestScript}'...`);
    return buildTool.src(`${testCasesDirectory}/${unitTestScript}`, { read: false })
        .pipe(testRunner({
            reporter: coverageTestReporter, // Use the 'mocha-lcov-reporter' for LCOV output.
            timeout: '180s' // A longer timeout to accommodate potentially time-consuming coverage instrumentation.
        }))
        .on('error', (err) => {
            logTaskMessage(`Coverage report generation failed: ${err.message}`);
            process.exit(1);
        })
        .on('end', () => logTaskMessage('Code coverage report generated.'));
});

// Task 6: watchFiles - A composite task for continuous development, watching for file changes.
// Automatically re-runs relevant tasks when source or test files are modified.
buildTool.task('watchFiles', function() {
    logTaskMessage('Watching source and test files for changes... (Ctrl+C to stop)');
    // Watch all JavaScript files in the source directory and run linting and tests on change.
    buildTool.watch(`${sourceCodeDirectory}/**/*.js`, buildTool.series('inspectCode', 'runUnitTests'));
    // Watch all JavaScript files in the test directory and re-run tests on change.
    buildTool.watch(`${testCasesDirectory}/**/*.js`, buildTool.series('runUnitTests'));
});

// Main development workflow task.
// This task sequentially runs code quality checks and then executes tests.
buildTool.task('devWorkflow', buildTool.series('inspectCode', 'runUnitTests', function(done) {
    logTaskMessage('Development workflow (lint & test) completed.');
    done();
}));

// The default task, executed when 'gulp' is run without any specific arguments.
// It sets up the development environment by running the dev workflow and then starts watching for changes.
buildTool.task('default', buildTool.series('devWorkflow', 'watchFiles', function(done) {
    logTaskMessage('Default development workflow initialized. Watching for changes...');
    done();
}));

// Additional helper task for CI/CD environments.
// This task runs a full build process including documentation, linting, testing, and coverage.
buildTool.task('ciBuild', buildTool.series('purgeDocs', 'inspectCode', 'runUnitTests', 'generateCoverage', 'compileDocs', function(done) {
    logTaskMessage('CI/CD build process completed successfully. All checks passed.');
    done();
}));