const browserEventsSystem = chrome.webRequest;
const browserTabHandler = chrome.tabs;

const targetErrorLogHeaders = Object.freeze([
    'X-Nette-Error-Log',
    'X-Tracy-Error-Log'
]);

browserEventsSystem.onCompleted.addListener(
    /**
     * Processes information about a completed network request.
     * This function is triggered whenever a web request finishes.
     *
     * @param {object} completedRequestPayload - The data package containing request specifics,
     *                                           including response headers.
     */
    function handleRequestCompletion(completedRequestPayload) {
        // Pre-check: Ensure the payload is valid and contains retrievable response headers.
        // This acts as a guard clause to prevent errors with malformed or incomplete data.
        if (!completedRequestPayload ||
            !Array.isArray(completedRequestPayload.responseHeaders) ||
            completedRequestPayload.responseHeaders.length === 0) {
            // If essential data is missing, we simply cease processing for this request.
            return;
        }

        let wasErrorTabInitiated = false; // Flag to track if a new error tab was opened during this request's processing.

        // Iterate through each individual header within the response header collection.
        // Using `for...of` provides a cleaner syntax for array iteration compared to traditional `for` loops.
        for (const currentResponseHeader of completedRequestPayload.responseHeaders) {
            // Validate the structure of the current header entry.
            // Ensure both 'name' and 'value' properties exist and are strings.
            if (!currentResponseHeader ||
                typeof currentResponseHeader.name !== 'string' ||
                typeof currentResponseHeader.value !== 'string') {
                // Skip malformed headers to prevent runtime errors and continue with the next header.
                continue;
            }

            const headerKeyIdentifier = currentResponseHeader.name; // Extract the header's key for easier reference.

            // Determine if the extracted header key matches any of our predefined error log indicators.
            // Using `Array.prototype.includes()` offers a concise way to check against multiple values.
            if (targetErrorLogHeaders.includes(headerKeyIdentifier)) {
                const potentialLogLocation = currentResponseHeader.value; // Retrieve the header's value.

                // Perform a basic validation on the potential log location string.
                // Ensure it's not null, undefined, or an empty string after trimming whitespace.
                if (potentialLogLocation && potentialLogLocation.trim().length > 0) {
                    // Construct the full, absolute file URL using a template literal for clarity.
                    const constructedFileUrl = `file://${potentialLogLocation}`;

                    // Command the browser to open a new tab with the determined URL.
                    // The 'active: true' option ensures the newly opened tab is immediately visible to the user.
                    browserTabHandler.create({
                        url: constructedFileUrl,
                        active: true
                    });

                    wasErrorTabInitiated = true; // Mark that an action was taken for this request.
                    // Since we've found and processed a relevant header, there's no need to check further headers.
                    // This optimizes performance by exiting the loop early.
                    break;
                }
            }
        }

        // Additional optional logic could be placed here, for example, to log a message
        // if no error tab was opened after examining all headers.
        // if (!wasErrorTabInitiated) {
        //     console.info("No relevant error log header found for this completed request.");
        // }
    },
    // Configuration object specifying which requests the listener should observe.
    {
        urls: ['<all_urls>'], // Apply this listener to all network requests, regardless of their URL.
        // Explicitly list all relevant request types to ensure comprehensive monitoring.
        // 'script' type has been added for broader coverage.
        types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'other', 'script']
    },
    // Array of optional information to include in the 'details' object passed to the listener.
    // 'responseHeaders' is crucial for this logic, as it contains the headers we need to inspect.
    ['responseHeaders']
);