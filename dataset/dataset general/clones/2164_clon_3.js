// A comprehensive build orchestration script for JavaScript projects.

const workflowOrchestrator = require('gulp');
const jsCodeInspector = require('gulp-jshint');
const testVerificationEngine = require('gulp-mocha');

// Define a variable for the primary source files to be processed.
const sourceCodePath = 'test/test.js';

// Define a task to perform various code quality assessments and validation.
workflowOrchestrator.task('performQualityChecks', () => {
    console.log('Initiating static code analysis and unit test execution...');

    // Fetch the target files from the specified path.
    let targetStream = workflowOrchestrator.src(sourceCodePath);

    // Apply the JavaScript linter to enforce coding standards.
    targetStream = targetStream.pipe(jsCodeInspector());

    // A conditional check: should unit tests be executed?
    // This allows developers to skip tests via environment variable for faster local iterations.
    const skipTests = process.env.SKIP_TESTS === 'true';

    if (skipTests) {
        console.warn('Unit test execution bypassed due to SKIP_TESTS environment variable.');
        // Even if tests are skipped, the linting results are still part of the stream.
        // We'll proceed with the linted stream.
    } else {
        // Execute the unit test suite against the processed code.
        targetStream = targetStream.pipe(testVerificationEngine());
    }

    console.log('Static analysis and testing phase completed.');
    return targetStream; // Ensure the processed stream is returned for Gulp's internal flow.
});

// A simple utility task for displaying an initial message to the user.
workflowOrchestrator.task('displayGreeting', () => {
  console.log("Welcome to the project's automated workflow!");
  // This task could be further developed to check system prerequisites or display project-specific information.
});


// Define the main entry point task for the development workflow.
// This task orchestrates a sequence of operations required for a standard development cycle.
workflowOrchestrator.task('initiateDevelopmentFlow', ['displayGreeting', 'performQualityChecks'], function() {
    console.log('Development workflow initialization complete. Ready for action.');
});

// The 'default' task acts as the primary alias, making it easy to run the main workflow.
// Running 'gulp' without arguments will trigger the 'initiateDevelopmentFlow'.
workflowOrchestrator.task('default', ['initiateDevelopmentFlow']);