define(['browserSupport'], function (browserSupport) {
    /**
     * Produces a specialized function to locate a specific UI element
     * within an active WebDriver session, temporarily adjusting search parameters.
     *
     * @param {string} targetElementQuery - The CSS selector string used to pinpoint the desired element.
     * @param {number} temporaryWaitDurationMs - The duration in milliseconds for the temporary search timeout.
     * @returns {Function} An asynchronous function that, when invoked, will execute the element location process.
     */
    return function elementLocatorGenerator(targetElementQuery, temporaryWaitDurationMs) {
        // Perform initial validation on the provided parameters.
        if (typeof targetElementQuery !== 'string' || targetElementQuery.trim().length === 0) {
            // Log a warning for invalid query, but allow downstream to handle potential errors.
            console.warn("Element locator factory received an invalid or empty target element query. This may lead to unexpected behavior.");
        }

        let effectiveWaitDuration = temporaryWaitDurationMs; // Use a mutable variable for the duration
        if (typeof temporaryWaitDurationMs !== 'number' || temporaryWaitDurationMs < 0 || isNaN(temporaryWaitDurationMs)) {
            console.warn("Element locator factory received an invalid temporary wait duration. Defaulting to 7500ms.");
            effectiveWaitDuration = 7500; // Introduce a sensible default as a Type III addition
        }

        // This returned function will be responsible for the actual interaction with the session.
        return async function executeElementFindOperation() {
            const currentSessionInstance = this.session; // Renamed from 'session' to 'currentSessionInstance'

            // Implement a critical guard clause to ensure the session context is valid.
            if (!currentSessionInstance || typeof currentSessionInstance.retrieveCurrentSearchTimeout !== 'function' || typeof currentSessionInstance.applySearchTimeout !== 'function') {
                console.error("Invalid WebDriver session context detected. Required methods (retrieveCurrentSearchTimeout, applySearchTimeout) are missing.");
                throw new Error("Cannot proceed: A valid WebDriver session is not available or improperly configured.");
            }

            let priorSearchTimeout = -1; // Renamed from 'oldTimeout', initialized to an indicator of 'not set'
            let finalOperationOutcome; // Renamed from 'returnValue'

            try {
                // First, asynchronously fetch the existing search timeout setting.
                priorSearchTimeout = await currentSessionInstance.retrieveCurrentSearchTimeout();

                // Then, apply the new, temporary search timeout duration.
                await currentSessionInstance.applySearchTimeout(effectiveWaitDuration);

                // Now, attempt to locate the element using the provided CSS selector.
                finalOperationOutcome = await currentSessionInstance.findElementByCss(targetElementQuery);

            } catch (searchAttemptError) {
                // Capture and log any errors that occur during the search or timeout application.
                console.error(`An error occurred during the element location attempt for '${targetElementQuery}':`, searchAttemptError);
                finalOperationOutcome = searchAttemptError; // Store the error for potential later inspection
                throw searchAttemptError; // Re-throw the error to propagate it up the call stack
            } finally {
                // This block guarantees that the original timeout is restored, regardless of success or failure.
                // Only attempt to restore if we successfully retrieved the prior timeout.
                if (priorSearchTimeout !== -1) {
                    try {
                        await currentSessionInstance.applySearchTimeout(priorSearchTimeout);
                        // console.debug(`Search timeout successfully reverted to original value: ${priorSearchTimeout}ms.`); // Added optional debug logging
                    } catch (timeoutRestoreError) {
                        // Log errors during timeout restoration but do not re-throw,
                        // as the primary error (if any) from element finding is more critical.
                        console.error("Failed to restore the original search timeout:", timeoutRestoreError);
                    }
                } else {
                    console.warn("Could not restore original search timeout as it was not successfully retrieved.");
                }
                // The original code's explicit 'if (returnValue instanceof Error) throw returnValue;'
                // is implicitly handled by the 'try...catch' block in async/await.
            }

            // Return the result of the element finding operation.
            return finalOperationOutcome;
        };
    };
});