const buildTool = require('gulp');
const pluginLoader = require('gulp-load-plugins')();
const fileEraser = require('del');

// Definition of source code patterns to include and exclude from processing
const sourceCodeGlobs = [
  '**/*.js',                       // Include all JavaScript files
  '!test/**/*.js',                // Exclude test files
  '!node_modules/**/*.js',        // Exclude third-party modules
  '!coverage/**/*.js',            // Exclude coverage output
  '!dist/**/*.js',                // Exclude compiled distribution files
  '!gulpfile.js'                  // Exclude the build script itself
];

// Specific glob pattern for locating unit test files
const testFilePattern = 'test/**/*_test.js';

// Directories and files to be removed during cleanup operations
const buildArtifactPaths = [
  'coverage/**',                  // All coverage reports
  'dist/**',                      // Compiled distribution output
  'tmp/'                          // Temporary build files
];

// --- Auxiliary Functions for Task Logic ---

/**
 * Creates a Gulp source stream for application files based on predefined globs.
 * @returns {NodeJS.ReadWriteStream} A Gulp stream of relevant source files.
 */
function acquireApplicationSourceStream() {
  // A brief log to indicate the beginning of source acquisition
  console.log('Fetching application source files for subsequent processing...');
  return buildTool.src(sourceCodeGlobs);
}

/**
 * Configures and returns a Gulp stream for executing unit tests.
 * This function centralizes test runner setup.
 * @param {object} [runnerOptions={}] - Custom options to pass to the Mocha test runner.
 * @returns {NodeJS.ReadWriteStream} A Gulp stream that runs Mocha tests.
 */
function initializeTestExecutionStream(runnerOptions = {}) {
  // Allow reporter to be overridden via environment variable for flexibility
  const selectedReporter = process.env.TEST_REPORT_FORMAT || 'spec';
  const effectiveMochaOptions = {
    reporter: selectedReporter,
    ui: 'bdd',                        // Using BDD interface for tests
    timeout: 7000,                    // Set a default timeout for tests
    require: ['source-map-support/register'], // Added source map support
    ...runnerOptions                  // Merge with any provided custom options
  };

  console.log(`Preparing to run tests using "${selectedReporter}" reporter.`);
  // We use {read: false} as Gulp only needs to know about the files, not their content,
  // since Mocha will load them directly.
  return buildTool.src(testFilePattern, { read: false })
    .pipe(pluginLoader.mocha(effectiveMochaOptions));
}

// --- Gulp Task Definitions ---

/**
 * Task: Cleans up all generated artifacts from previous builds and test runs.
 * This ensures a fresh environment for new operations.
 */
buildTool.task('removeGeneratedFiles', function(completionSignal) {
  console.log('Commencing removal of old build outputs and temporary data...');
  fileEraser(buildArtifactPaths)
    .then(removedPaths => {
      console.log('Successfully removed the following items:\n', removedPaths.join('\n'));
      completionSignal(); // Indicate successful completion
    })
    .catch(error => {
      console.error('An error occurred during file cleanup:', error);
      completionSignal(error); // Indicate task failure
    });
});

/**
 * Task: Instruments the application's JavaScript code for coverage analysis.
 * This step must precede any test execution if code coverage is to be measured.
 */
buildTool.task('prepCodeForCoverage', ['removeGeneratedFiles'], function() {
  // A safety check to ensure the istanbul plugin is available
  if (!pluginLoader.istanbul) {
    console.warn('Gulp-Istanbul plugin is not loaded. Code coverage will be skipped.');
    return Promise.resolve(); // Allow the build process to continue
  }
  console.log('Instrumenting source code for comprehensive coverage tracking...');
  return acquireApplicationSourceStream()
    .pipe(pluginLoader.istanbul({
      includeUntested: true,      // Also include files that have no test coverage
      coverageVariable: '__COVERAGE_INFO__' // Custom global coverage variable name
    }))
    .pipe(pluginLoader.istanbul.hookRequire()); // Hook into Node's require mechanism
});

/**
 * Task: Performs static analysis (linting) on all JavaScript source files.
 * This helps enforce coding standards and identify potential issues early.
 */
buildTool.task('analyzeCodeQuality', function() {
  console.log('Initiating static code analysis using JSHint...');
  const jshintReporters = {
    standard: 'jshint-stylish',   // Human-readable output
    failure: 'fail'               // Fail the Gulp task on any linting errors
  };

  return acquireApplicationSourceStream()
    .pipe(pluginLoader.jshint())
    .pipe(pluginLoader.jshint.reporter(jshintReporters.standard))
    .pipe(pluginLoader.jshint.reporter(jshintReporters.failure));
});

/**
 * Task: Executes unit tests and generates detailed code coverage reports.
 * This task depends on the code having been instrumented for coverage.
 */
buildTool.task('runFullTestSuite', ['prepCodeForCoverage'], function() {
  console.log('Executing unit tests and compiling coverage reports...');
  return initializeTestExecutionStream()
    .pipe(pluginLoader.istanbul.writeReports({
      dir: './coverage',              // Output directory for coverage reports
      reporters: ['html', 'lcovonly', 'text-summary'], // Multiple report formats
      reportOpts: { html: { dir: './coverage/html' } } // Specific options for HTML report
    }));
});

/**
 * Task: Executes unit tests without the overhead of code coverage instrumentation.
 * Ideal for rapid development cycles where quick feedback is prioritized.
 */
buildTool.task('runFastTestSuite', function() {
  console.log('Launching unit tests without coverage instrumentation...');
  // Override the default timeout for a potentially faster test run
  return initializeTestExecutionStream({ timeout: 12000 });
});

/**
 * The primary default task, orchestrating a sequence of quality checks and tests.
 * This task is executed when 'gulp' is run without specifying a task name.
 */
buildTool.task('performAllDevelopmentChecks', ['runFullTestSuite', 'analyzeCodeQuality'], function() {
  console.log('All configured development checks have been successfully completed!');
});

// Create an alias for the main development checks task
buildTool.task('default', ['performAllDevelopmentChecks']);