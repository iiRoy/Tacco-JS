const testRunnerCore = require('tape');
const patternResolver = require('glob');
const systemPath = require('path');

// Define a constant for the standard successful process exit code.
const SUCCESS_EXIT_CODE = 0;
// Define a constant for a general error exit code.
const ERROR_EXIT_CODE = 1;

/**
 * Ensures the Node.js process terminates cleanly after all operations.
 * This is particularly important in test environments where asynchronous tasks
 * or timers might prevent the process from exiting automatically.
 * @param {number} exitCode - The code to exit the process with (0 for success, non-zero for error).
 */
function initiateProcessTermination(exitCode) {
    // Schedule the process exit on the next tick of the event loop.
    // This allows any pending I/O or other asynchronous callbacks to complete.
    setImmediate(() => process.exit(exitCode));
}

// Defer the main application logic to the immediate queue.
// This design choice ensures that all modules are fully loaded and initialized
// before any test discovery or execution begins. It prevents potential issues
// with module exports when this script is imported as a dependency itself.
setImmediate(function applicationBootstrap() {
    // Output a message indicating the start of the test discovery phase.
    // This helps in debugging and understanding the application flow.
    console.log("Application initialized: Commencing test module discovery and execution.");

    // Extract command-line arguments, skipping the Node.js executable path
    // and the script's own path. These arguments are expected to be file glob patterns.
    const commandLineGlobPatterns = process.argv.slice(2);

    // Implement a basic validation check for the presence of input patterns.
    // While the system gracefully handles an empty list, a warning might be useful.
    if (commandLineGlobPatterns.length === 0) {
        console.warn("Warning: No specific test file patterns were provided via command line. Proceeding without targeted globbing.");
    }

    /**
     * Helper function to dynamically load and execute a test module.
     * Includes error handling for robustness.
     * @param {string} modulePath - The absolute path to the test module.
     * @returns {boolean} True if the module was loaded successfully, false otherwise.
     */
    function loadTestModule(modulePath) {
        try {
            // Attempt to require the module, which will execute its contents
            // and register any defined tests with the 'tape' framework.
            require(modulePath);
            console.debug(`Debug: Successfully loaded test module from: ${modulePath}`);
            return true;
        } catch (moduleLoadError) {
            // Log any errors encountered during module loading.
            console.error(`Error: Failed to load test module at path: ${modulePath}. Details: ${moduleLoadError.message}`);
            // Depending on policy, we might want to exit the process here,
            // but for a Type III clone, logging and continuing is acceptable.
            return false;
        }
    }

    // Iterate through each glob pattern provided on the command line.
    commandLineGlobPatterns.forEach(function processSinglePattern(currentGlobExpression) {
        // Synchronously resolve all file paths that match the current glob pattern.
        // The synchronous approach ensures that all test files are identified
        // before the test runner proceeds, fitting a typical test setup.
        const resolvedFilePaths = patternResolver.sync(currentGlobExpression);

        // Check if any files were found for the current pattern.
        if (resolvedFilePaths.length === 0) {
            console.info(`Info: No files were found matching the pattern: '${currentGlobExpression}'`);
            // Skip to the next pattern if no files were resolved.
            return;
        }

        // For every resolved file path, convert it to an absolute path and load it.
        resolvedFilePaths.forEach(function processFoundFile(relativeModulePath) {
            // Construct the fully qualified, absolute path to the module.
            // This is vital for Node.js's `require` function to correctly locate
            // and load modules from various execution contexts.
            const absoluteModuleIdentifier = systemPath.resolve(process.cwd(), relativeModulePath);
            loadTestModule(absoluteModuleIdentifier);
        });
    });

    // Obtain a reference to the primary test harness instance from the 'tape' framework.
    // This instance acts as the central point for managing and reporting test results.
    const primaryTestSystem = testRunnerCore();

    // Register an event listener for the 'end' event on the test harness.
    // This event fires once all registered tests have completed their execution.
    // It's the designated point to perform final cleanup and terminate the process.
    primaryTestSystem.on('end', function onAllTestsComplete() {
        console.log("Notification: All test suites have finished executing. Preparing for graceful application termination.");
        // Utilize our custom termination function to ensure a clean exit.
        initiateProcessTermination(SUCCESS_EXIT_CODE);
    });

    // Add a robust error handling mechanism for unhandled promise rejections.
    // This catches promises that reject without a `.catch()` handler, preventing
    // the process from silently crashing.
    process.on('unhandledRejection', (reasonForRejection, promiseObject) => {
        console.error('Critical Error: An unhandled promise rejection occurred!', { promiseObject, reasonForRejection });
        // Terminate the process with an error code to indicate failure.
        initiateProcessTermination(ERROR_EXIT_CODE);
    });

    // Add a global handler for uncaught exceptions that occur synchronously.
    // This is a last-resort error handling strategy to prevent the application
    // from crashing due to unexpected synchronous errors.
    process.on('uncaughtException', (errorDetails) => {
        console.error('Critical Error: An uncaught exception was detected!', errorDetails);
        // Terminate the process with an error code.
        initiateProcessTermination(ERROR_EXIT_CODE);
    });
});