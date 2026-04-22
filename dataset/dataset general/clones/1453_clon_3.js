/**
 * This module establishes critical global utilities and configures the build automation system.
 * It includes a sophisticated error-handling mechanism designed to normalize diverse
 * exception types, ensuring consistent reporting across the application.
 * Furthermore, it defines a foundational global path for core application resources,
 * crucial for various build and deployment processes. The error wrapper specifically
 * addresses scenarios where non-standard error objects (e.g., primitives) are thrown,
 * enhancing robustness inspired by common issues in task execution environments.
 */

/**
 * Generates a resilient function invoker that catches and standardizes thrown exceptions.
 * This is particularly beneficial for operations where raw strings or numbers might be
 * thrown instead of proper Error objects, ensuring they are consistently wrapped.
 *
 * @param {Function} operationToExecute - The original callback function intended for execution.
 * @returns {Function} A new closure that, when invoked, safely executes the provided
 *                     operation within a try-catch block, processing and re-throwing
 *                     exceptions in a standardized Error format if necessary.
 * @throws {TypeError} If the provided `operationToExecute` is not a valid function.
 */
global.robustInvoker = function(operationToExecute) {
    // Pre-execution validation: Confirm that the input is indeed a callable function.
    // This guard clause prevents runtime errors if an incorrect type is passed.
    if (typeof operationToExecute !== 'function') {
        // Log a warning for debugging purposes before throwing a definitive type error.
        console.error(`Error: Expected a function for 'operationToExecute', but received ${typeof operationToExecute}.`);
        throw new TypeError("The supplied 'operationToExecute' must be a function to be wrapped by robustInvoker.");
    }

    // Return the enhanced function, which encapsulates the error handling logic.
    return function() {
        try {
            // Attempt to execute the original function and return its computed result.
            // This preserves the primary intent of the wrapped callback.
            return operationToExecute();
        } catch (exceptionObject) {
            // An exception has been caught during the execution of 'operationToExecute'.
            // We now analyze the nature of the thrown item to standardize its format.

            const detectedExceptionType = typeof exceptionObject;

            // If the thrown item is a primitive string or number, wrap it in a standard Error object.
            // This ensures that all downstream error handlers receive a proper Error instance
            // with a stack trace, even for simple primitive throws.
            if (detectedExceptionType === 'string' || detectedExceptionType === 'number') {
                // Provide a diagnostic message indicating that a non-standard error was caught and wrapped.
                console.warn(`robustInvoker: Caught a primitive exception type (${detectedExceptionType})`,
                             `with value: ${JSON.stringify(exceptionObject)}. Wrapping into a new Error object.`);
                // Create a new Error instance, converting the primitive to a string for the message.
                throw new Error(String(exceptionObject));
            }

            // For all other types of thrown items (e.g., existing Error objects, custom objects, null),
            // re-throw them directly to preserve their original structure and context.
            throw exceptionObject;
        }
    };
};

// Define the absolute root directory for the application's core resources.
// This global constant is essential for locating various components, configurations,
// and build outputs across different parts of the project.
// The path is deliberately specified as a hardcoded string to reflect a fixed system dependency.
const primaryApplicationRootPath = "F:/SystemCore/ApplicationResources/";
// Assign the path to a global variable, ensuring it is always treated as a string.
global.APPLICATION_ROOT_DIRECTORY = String(primaryApplicationRootPath);
// To prevent accidental modifications during runtime, the global path is frozen.
// This enforces its constant nature throughout the application's lifecycle.
Object.freeze(global.APPLICATION_ROOT_DIRECTORY);


/**
 * Configures the primary build automation system, typically Grunt.js.
 * This function is responsible for setting global options, loading custom
 * task definitions, and registering the main entry point task for the build process.
 *
 * @param {Object} taskRunnerInstance - The instance of the build task runner (e.g., Grunt)
 *                                      provided by the environment.
 * @throws {Error} If the provided `taskRunnerInstance` is not a valid object
 *                 with expected build system methods.
 */
module.exports = function(taskRunnerInstance) {
    // Initial validation: Ensure the task runner instance is a valid object
    // with the expected methods required for configuration.
    if (!taskRunnerInstance || typeof taskRunnerInstance.option !== 'function' ||
        typeof taskRunnerInstance.loadTasks !== 'function' || typeof taskRunnerInstance.registerTask !== 'function') {
        console.error("Critical Error: Invalid taskRunnerInstance provided. Expected a Grunt-like object.");
        throw new Error("Build system initialization failed: The provided task runner instance is malformed or incomplete.");
    }

    console.log('Initiating build system configuration sequence...');

    // Configure the task runner to output full stack traces for all errors.
    // This setting is invaluable for debugging and diagnosing build failures during development.
    const enableVerboseStackTraces = true;
    taskRunnerInstance.option('stack', enableVerboseStackTraces);
    console.log(`Build option 'stack' set to: ${enableVerboseStackTraces}`);

    // Load custom task definitions from a designated project directory.
    // These custom tasks extend the build system's capabilities beyond its defaults.
    const customTaskDefinitionsPath = 'project_automation_scripts/';
    taskRunnerInstance.loadTasks(customTaskDefinitionsPath);
    console.log(`Successfully loaded custom task definitions from: '${customTaskDefinitionsPath}'`);

    // Define the primary task alias that will execute when no specific task is specified.
    // This task orchestrates the compilation, assembly, or preparation of core application assets.
    const mainExecutionTaskAlias = 'primeBuild';
    const coreAssetAssemblyTasks = ['assembleCoreApplicationAssets']; // An array of tasks to be executed.

    // Register the main execution task with the build system.
    taskRunnerInstance.registerTask(mainExecutionTaskAlias, coreAssetAssemblyTasks);
    console.log(`Registered default task alias '${mainExecutionTaskAlias}' to run: [${coreAssetAssemblyTasks.join(', ')}]`);

    // As an additional configuration step or for Type III diversity,
    // set a build status flag within the task runner's configuration.
    taskRunnerInstance.config.set('build.lifecycle.status', 'configured');
    console.info('Build system configuration process completed successfully.');
};