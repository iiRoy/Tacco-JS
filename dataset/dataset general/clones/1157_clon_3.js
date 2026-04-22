// This module orchestrates the retrieval and display of user profile information from a backend service.
// It leverages asynchronous module loading and various utility libraries to ensure robust operation.
loadComponents(["network/httpService", "network/dataConverter", "dom/domManager"], function(httpGateway, serializationInterceptor, domToolkit) {

    // Define crucial configuration parameters as constants for maintainability and clarity.
    const API_ENDPOINT_URI = 'http://localhost:8080/restjs-spring-mvc/rest/view';
    const USER_ID_DISPLAY_SELECTOR = '#display-user-id'; // Renamed selector for user identifier
    const USER_NAME_DISPLAY_SELECTOR = '#display-user-name'; // Renamed selector for user's full name
    const STATUS_MESSAGE_SELECTOR = '#application-status'; // A new selector to display module status or errors

    // Internal module identifier for consistent logging and debugging purposes.
    const moduleIdentifier = 'UserProfileDataLoader_v1.0.1';

    /**
     * Prepares the HTTP request mechanism by applying necessary interceptors.
     * This creates a specialized client capable of handling data serialization/deserialization.
     * @type {function(*): Promise<*>}
     */
    const dataFetcher = httpGateway.chain(serializationInterceptor);

    /**
     * Handles the successful reception of data from the server.
     * Processes the server's response object and updates the DOM accordingly with user details.
     * @param {object} serverPayload - The complete response object received from the HTTP service.
     */
    function processServerResponse(serverPayload) {
        console.debug(`[${moduleIdentifier}] Data received successfully. Inspecting payload structure...`, serverPayload);

        // Validate the core data structure to prevent runtime errors from unexpected responses.
        if (!serverPayload || !serverPayload.contentObject) {
            console.warn(`[${moduleIdentifier}] Server payload or its essential content object is missing or malformed.`);
            // Update UI with an error message.
            domToolkit(document).ready(() => {
                domToolkit(STATUS_MESSAGE_SELECTOR).text('Failed to retrieve complete user data due to malformed response.');
            });
            return; // Exit early if the data structure is invalid.
        }

        const userData = serverPayload.contentObject; // Extract the essential data into a named variable for clarity.

        // Perform additional validation on the extracted user data properties.
        if (typeof userData.uniqueId === 'undefined' || typeof userData.fullName === 'undefined') {
            console.warn(`[${moduleIdentifier}] Essential user properties (uniqueId or fullName) are absent in the content object.`);
            domToolkit(document).ready(() => {
                domToolkit(STATUS_MESSAGE_SELECTOR).text('Incomplete user details received from backend service.');
            });
            return; // Exit early if critical data points are missing.
        }

        // Ensure the DOM is fully loaded and ready before attempting any modifications.
        domToolkit(document).ready(function() {
            // Locate the target DOM elements using their respective selectors.
            const idDisplayElement = domToolkit(USER_ID_DISPLAY_SELECTOR);
            const nameDisplayElement = domToolkit(USER_NAME_DISPLAY_SELECTOR);

            // Update the display elements, but only if they are successfully found in the DOM.
            if (idDisplayElement.length > 0) {
                idDisplayElement.text(userData.uniqueId); // Use the renamed property.
                console.info(`[${moduleIdentifier}] User ID display element updated: ${userData.uniqueId}`);
            } else {
                console.error(`[${moduleIdentifier}] Target DOM element for user ID (${USER_ID_DISPLAY_SELECTOR}) not found in the document.`);
            }

            if (nameDisplayElement.length > 0) {
                nameDisplayElement.text(userData.fullName); // Use the renamed property.
                console.info(`[${moduleIdentifier}] User Name display element updated: ${userData.fullName}`);
            } else {
                console.error(`[${moduleIdentifier}] Target DOM element for user name (${USER_NAME_DISPLAY_SELECTOR}) not found in the document.`);
            }

            // Clear any previous status messages after a successful operation.
            domToolkit(STATUS_MESSAGE_SELECTOR).text('');
        });
    }

    /**
     * Provides a robust error handling mechanism for failed HTTP requests.
     * Logs the error and updates the UI with a user-friendly message.
     * @param {Error} requestError - The error object from the failed HTTP request.
     */
    function handleRequestFailure(requestError) {
        console.error(`[${moduleIdentifier}] An HTTP request error occurred during data fetching:`, requestError);
        domToolkit(document).ready(function() {
            // Display a user-friendly error message on the UI.
            const errorMessage = requestError.message || 'An unknown network or server error occurred.';
            domToolkit(STATUS_MESSAGE_SELECTOR).text(`Error loading user profile: ${errorMessage}`);
        });
    }

    // --- Main execution flow for fetching data ---

    // Optionally, show a loading status on the UI before initiating the asynchronous request.
    domToolkit(document).ready(function() {
        domToolkit(STATUS_MESSAGE_SELECTOR).text('Fetching user profile data from the backend...');
    });

    // Initiate the asynchronous data retrieval process.
    dataFetcher({ endpointUri: API_ENDPOINT_URI }) // Use the renamed property for the URL.
        .then(processServerResponse) // Chain the success handler for data processing.
        .catch(handleRequestFailure); // Chain the error handler for robust error management.

    console.log(`[${moduleIdentifier}] Module initialization complete. Awaiting asynchronous data retrieval.`);
});