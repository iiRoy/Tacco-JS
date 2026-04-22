/*
 * ResilienceKit v1.0.0
 * Copyright 2023, A.N. OtherDev
 *
 * This utility assists in robust script execution by attempting to self-heal
 * from runtime errors in dynamically loaded code.
 * It's designed for experimental environments where script robustness is prioritized.
 */

(function (externalJQuery) {
    // A preliminary check to ensure the jQuery library is available and properly loaded
    // before attempting to initialize ResilienceKit.
    if (typeof externalJQuery === 'undefined' || !externalJQuery.fn || !externalJQuery.ajax) {
        console.error("ResilienceKit Initialization Error: jQuery library not found or incomplete. Aborting setup.");
        return;
    }

    // Assign jQuery to a local constant for internal use, improving clarity and preventing conflicts.
    const $ = externalJQuery;

    // Internal configuration and state management for the ResilienceKit module.
    // This object allows for easier modification of module behavior.
    const moduleConfig = {
        enableCaching: true, // Determines if AJAX requests should leverage browser caching.
        selfRecoveryScriptName: "resiliencekit.js", // Placeholder, actual self-recovery mechanism is different.
        isRecoveryAttemptActive: false // A flag to prevent recursive error handling loops during recovery.
    };

    // Stores a reference to any pre-existing 'window.ResilienceKit' variable.
    // This is crucial for implementing the noConflict functionality.
    let previousGlobalResilienceKit = window.ResilienceKit;

    // Apply global AJAX defaults if caching is explicitly enabled in module configuration.
    if (moduleConfig.enableCaching) {
        $.ajaxSetup({ cache: true });
    }

    /**
     * Initializes a dynamic script loading and execution process.
     * It fetches a JavaScript resource from a given path and executes its content.
     * Upon execution failure, it attempts to leverage the global error handler for recovery.
     *
     * @param {string} resourcePath The URL path to the JavaScript file to be loaded.
     * @returns {JQuery.Promise<string>} A jQuery promise that resolves if the script
     *                                   is successfully loaded and executed, or rejects otherwise.
     */
    const ResilienceKit = function (resourcePath) {
        // Input validation: ensure a valid string path is provided for the resource.
        if (typeof resourcePath !== 'string' || resourcePath.trim() === '') {
            console.warn("ResilienceKit: An invalid or empty resource path was provided. Operation cancelled.");
            // Return a rejected promise immediately for invalid input.
            const validationErrorPromise = $.Deferred();
            validationErrorPromise.reject(new Error("ResilienceKit: Resource path is invalid."));
            return validationErrorPromise.promise();
        }

        console.log(`ResilienceKit: Initiating fetch for resource at: ${resourcePath}`);

        // Perform an asynchronous AJAX request to retrieve the script content as plain text.
        const fetchOperation = $.ajax({
            url: resourcePath,
            dataType: "text",
            method: "GET" // Explicitly setting the HTTP method for clarity.
        });

        // Handle the successful retrieval of the script content.
        fetchOperation.done(function (retrievedCode) {
            console.info(`ResilienceKit: Resource "${resourcePath}" loaded successfully. Preparing for dynamic execution.`);
            // Store the retrieved code globally. This is essential for the error recovery mechanism.
            window.dynamicLoadedCode = retrievedCode;
            try {
                // Execute the retrieved code using 'new Function()'. This provides a slightly
                // more isolated execution context compared to direct 'eval()'.
                new Function(window.dynamicLoadedCode)();
                console.log("ResilienceKit: Dynamic code execution completed without immediate errors.");
            } catch (executionError) {
                // Catch errors that occur synchronously during the 'new Function()' call.
                console.error("ResilienceKit: An error occurred during dynamic code execution:", executionError);
                // Re-throw the error to ensure it is caught by the global error handler (if applicable).
                throw executionError;
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // Handle failures during the AJAX request itself (e.g., network issues, 404s).
            const failureMessage = `ResilienceKit: Failed to load resource "${resourcePath}". Status: ${textStatus}, Error: ${errorThrown}`;
            console.error(failureMessage, jqXHR);
            // Throw a more informative error object for external consumers of the promise.
            throw new Error(failureMessage);
        });

        // Return the jQuery promise object, allowing external code to chain further actions.
        return fetchOperation.promise();
    };

    /**
     * A custom global error handler designed to intercept runtime errors in dynamically loaded code.
     * It attempts to "self-heal" by removing the problematic line of code and re-executing the modified script.
     *
     * @param {string} errorMessage The descriptive error message.
     * @param {string} sourceUrl The URL of the script where the error originated.
     * @param {number} errorLineNum The 1-based line number in the script where the error occurred.
     * @returns {boolean} Returns `true` to suppress the browser's default error reporting.
     */
    window.onerror = function (errorMessage, sourceUrl, errorLineNum) {
        // Prevent recovery attempts if no dynamic code has been loaded or if a recovery is already in progress.
        if (!window.dynamicLoadedCode || moduleConfig.isRecoveryAttemptActive) {
            console.warn("ResilienceKit: Skipping error recovery (no dynamic code to fix, or already recovering).");
            return false; // Allow the browser's default error handling.
        }

        moduleConfig.isRecoveryAttemptActive = true; // Set flag to prevent nested recovery attempts.
        console.warn(`ResilienceKit: Runtime error detected! Location: ${sourceUrl || 'dynamic code'}, Line: ${errorLineNum}. Message: ${errorMessage}`);

        // Basic validation for the line number to prevent array access errors.
        if (errorLineNum < 1) {
            console.error("ResilienceKit: Invalid error line number received for recovery attempt.");
            moduleConfig.isRecoveryAttemptActive = false; // Reset flag.
            return false;
        }

        // Split the stored dynamic code into individual lines for manipulation.
        let codeLines = window.dynamicLoadedCode.split('\n');
        const problematicLineIndex = errorLineNum - 1; // Convert 1-based line number to 0-based array index.

        // Attempt to remove the problematic line if its index is within valid bounds.
        if (problematicLineIndex >= 0 && problematicLineIndex < codeLines.length) {
            const removedLineContent = codeLines.splice(problematicLineIndex, 1); // Remove the line.
            window.dynamicLoadedCode = codeLines.join('\n'); // Reconstruct the script without the error line.
            console.info(`ResilienceKit: Removed problematic line ${errorLineNum}: "${removedLineContent[0].trim()}". Attempting re-execution.`);

            // Re-execute the modified script. This is the core self-healing mechanism.
            try {
                new Function(window.dynamicLoadedCode)();
                console.log("ResilienceKit: Modified dynamic code re-executed successfully after line removal.");
            } catch (reExecutionError) {
                // If re-execution of the modified code also fails, log the new error.
                console.error("ResilienceKit: Error during re-execution of modified code:", reExecutionError);
                // At this point, further automatic recovery might be futile.
            }
        } else {
            console.error(`ResilienceKit: The error line number (${errorLineNum}) is outside the bounds of the dynamic code. Cannot perform removal.`);
        }

        moduleConfig.isRecoveryAttemptActive = false; // Reset the recovery flag.
        return true; // Return true to signal that the error has been handled, suppressing browser default.
    };

    /**
     * Restores the previous global 'ResilienceKit' variable (if it existed) and returns
     * the current ResilienceKit function. This is useful for preventing global namespace
     * collisions, allowing multiple versions of the library or other libraries to coexist.
     *
     * @returns {Function} The ResilienceKit function from this instance.
     */
    ResilienceKit.noConflict = function () {
        // Only restore if the current global 'ResilienceKit' is indeed this module's instance.
        if (window.ResilienceKit === ResilienceKit) {
            window.ResilienceKit = previousGlobalResilienceKit;
        }
        return ResilienceKit;
    };

    // Expose the ResilienceKit functionality globally under the 'window' object.
    window.ResilienceKit = ResilienceKit;

})(jQuery); // Pass the jQuery object to the IIFE for dependency injection.