// Module for handling asynchronous resource fetching and collection management.

/**
 * Asynchronously retrieves textual content from a specified web resource.
 * This function utilizes the modern Fetch API for network requests.
 *
 * @param {string} resourcePath - The URL or path to the resource to be fetched.
 * @param {function(string|null, Error|null): void} completionHandler - A callback function invoked upon completion.
 *        It receives the retrieved text content (or null on error) and an Error object (or null on success).
 * @param {object} [fetchConfiguration={}] - Optional configuration object for the fetch request,
 *        e.g., { method: 'POST', headers: { 'Content-Type': 'application/json' } }.
 * @returns {Promise<void>} - A Promise that resolves when the completionHandler has been called.
 */
const fetchResourceContent = async (resourcePath, completionHandler, fetchConfiguration = {}) => {
    // Define default fetch options, allowing overrides from fetchConfiguration.
    const requestOptions = {
        method: fetchConfiguration.method || 'GET', // Default to GET method.
        ...fetchConfiguration.extraOptions // Allow additional fetch options (e.g., cache, mode).
    };

    try {
        // Execute the network request using the Fetch API.
        const networkResponse = await fetch(resourcePath, requestOptions);

        // Validate the HTTP response status.
        if (!networkResponse.ok) {
            const statusMessage = `HTTP request failed for ${resourcePath} with status: ${networkResponse.status} (${networkResponse.statusText})`;
            console.error(statusMessage);
            // Invoke the handler with null content and an appropriate error.
            return completionHandler(null, new Error(statusMessage));
        }

        // Parse the response body as plain text.
        const retrievedTextualData = await networkResponse.text();

        // On successful retrieval, pass the content to the completion handler.
        completionHandler(retrievedTextualData, null);

    } catch (operationError) {
        // Catch and handle any network errors or issues during response parsing.
        console.error(`An exception occurred during resource fetch for ${resourcePath}:`, operationError);
        // Invoke the handler with null content and the caught error.
        completionHandler(null, operationError);
    }
};

/**
 * Coordinates the fetching of multiple resources defined in a manifest, storing their content.
 * This function orchestrates individual `fetchResourceContent` calls.
 *
 * @param {object.<string, string>} resourceManifest - An object where keys are identifiers
 *        and values are the URLs/paths of the resources to load.
 * @param {object.<string, string|null>} contentDestinationStore - An object where loaded content
 *        will be stored, keyed by the identifiers from the resourceManifest.
 * @param {function(Error|null): void} overallCompletionCallback - A callback invoked once
 *        all resources have been attempted to load (either successfully or with error).
 *        It receives an Error object if any fetch operation failed, otherwise null.
 */
const initiateContentRetrieval = (resourceManifest, contentDestinationStore, overallCompletionCallback) => {
    // Early exit if the manifest is invalid or empty.
    if (!resourceManifest || typeof resourceManifest !== 'object' || Object.keys(resourceManifest).length === 0) {
        console.warn("Resource manifest is empty or invalid; no content retrieval initiated.");
        return overallCompletionCallback(new Error("Invalid or empty resource manifest provided."));
    }

    let pendingOperations = Object.keys(resourceManifest).length;
    const encounteredErrors = []; // Collects details of any failed individual loads.

    // Iterate through each resource entry using modern object iteration.
    for (const [resourceKey, resourceUrl] of Object.entries(resourceManifest)) {
        // Dispatch an individual asynchronous fetch operation for each resource.
        fetchResourceContent(resourceUrl, (contentPayload, fetchIssue) => {
            // Decrement the count of outstanding operations.
            pendingOperations--;

            if (fetchIssue) {
                // If an error occurred during fetching, record it.
                console.error(`Failed to retrieve content for key '${resourceKey}' from ${resourceUrl}:`, fetchIssue);
                encounteredErrors.push({ key: resourceKey, url: resourceUrl, error: fetchIssue.message });
                // Store null or an error indicator in the destination store for this key.
                contentDestinationStore[resourceKey] = null;
            } else {
                // On successful retrieval, store the content in the designated cache.
                contentDestinationStore[resourceKey] = contentPayload;
            }

            // Check if all individual fetch operations have completed their processing.
            if (pendingOperations === 0) {
                if (encounteredErrors.length > 0) {
                    // If any errors were encountered, signal a failure to the overall callback.
                    overallCompletionCallback(new Error(`Some resources failed to load. Details: ${JSON.stringify(encounteredErrors)}`));
                } else {
                    // If all operations were successful, signal overall success.
                    overallCompletionCallback(null);
                }
            }
        });
    }
};

/**
 * Creates and returns a manager object for overseeing a collection of resource loads.
 * This manager provides methods to start the loading process, check its status, and
 * obtain a Promise that resolves upon overall completion.
 *
 * @param {object.<string, string>} resourceManifest - The definitive list of resources to load,
 *        mapping internal keys to their respective URLs.
 * @param {object.<string, string|null>} contentCache - The object where fetched resource
 *        content will be stored.
 * @returns {object} An object containing methods to control and query the loading state:
 *          `start()`: Initiates loading and returns a Promise for overall completion.
 *          `checkStatus()`: Synchronously checks if all resources have been processed (attempted).
 *          `getLoadPromise()`: Returns the Promise associated with the loading process.
 */
const prepareResourceLoader = (resourceManifest, contentCache) => {
    // Internal state variables to manage the loading process.
    let loadingProcessInitiated = false;
    let completionPromise = null; // Stores the Promise returned by the start method.

    /**
     * Commences the loading procedure for all resources specified in the manifest.
     * This method ensures loading is only initiated once.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if all resources
     *          were successfully processed, or rejects with an Error if any failed.
     */
    const commenceLoading = () => {
        // Prevent re-initiation of the loading process.
        if (loadingProcessInitiated) {
            console.info("Resource loading has already been initiated. Returning the existing completion promise.");
            return completionPromise;
        }

        loadingProcessInitiated = true; // Mark loading as started.

        // Create a new Promise to track the overall loading state.
        completionPromise = new Promise((resolve, reject) => {
            // Delegate the actual content retrieval to the helper function.
            initiateContentRetrieval(resourceManifest, contentCache, (loadingError) => {
                if (loadingError) {
                    // If `initiateContentRetrieval` reported any errors, reject the Promise.
                    console.error("Overall resource collection loading failed:", loadingError.message);
                    reject(loadingError);
                } else {
                    // If all resources were processed without overall error, resolve the Promise.
                    console.log("All resources in the manifest have been processed successfully.");
                    resolve(true); // Indicate successful completion.
                }
            });
        });

        return completionPromise;
    };

    /**
     * Provides a synchronous check to determine if all resources in the manifest
     * have had their loading process initiated and completed (either successfully or with error).
     * This does not guarantee successful content retrieval for all items.
     * @returns {boolean} True if all resources have been processed; false otherwise.
     */
    const areAllResourcesProcessed = () => {
        // If the loading process hasn't even begun, nothing is "processed".
        if (!loadingProcessInitiated) {
            return false;
        }

        const expectedResourceKeys = Object.keys(resourceManifest);
        const processedResourceKeys = Object.keys(contentCache);

        // A simple count check. This assumes that `initiateContentRetrieval`
        // will place an entry (even null) for every key it processes.
        const allKeysAccountedFor = expectedResourceKeys.length === processedResourceKeys.length;

        // Also ensure there are resources to begin with, to avoid false positives for empty manifests.
        return expectedResourceKeys.length > 0 && allKeysAccountedFor;
    };

    // Return an interface object to interact with the resource loading mechanism.
    return {
        start: commenceLoading,
        checkStatus: areAllResourcesProcessed,
        getLoadPromise: () => completionPromise // Allows external code to await completion.
    };
};