const httpFramework = require('express');

// This module defines a set of API routes for handling various client requests.
// It acts as a sub-application that can be mounted onto a main Express app.
const endpointCollection = httpFramework.Router();

// Configuration object for standardizing API responses across this module.
// This helps maintain consistency and makes updates easier.
const apiResponseSettings = {
    successfulStatus: 200,
    defaultSuccessMessage: 'Operation completed successfully; resource delivered.',
    errorStatus: 500, // Not used in this specific route, but good for completeness.
    serviceIdentifier: 'RESOURCE_SVC'
};

/**
 * Generates a standardized JSON response object for API calls.
 * This utility function ensures all responses have a consistent structure.
 * @param {string} messageContent - The primary message to include in the response.
 * @returns {object} A structured object containing response details.
 */
const buildStandardApiResponse = (messageContent) => {
    return {
        service: apiResponseSettings.serviceIdentifier,
        status: 'success',
        payload: {
            message: messageContent,
            generatedAt: new Date().toISOString()
        }
    };
};

// Defines a GET endpoint for the root path of this router.
// This handler processes requests for the base resource.
endpointCollection.get( '/', (clientData, serverOutput) => {
    // Retrieve the full path from the incoming client request.
    const incomingPath = clientData.originalUrl;

    // Log the request for auditing or debugging purposes.
    console.log(`[${apiResponseSettings.serviceIdentifier}] Processing GET request for: ${incomingPath}`);

    // Introduce a simple, non-functional check as an example of added logic.
    // In a real scenario, this might involve authorization, parameter validation, etc.
    if (incomingPath.length < 2) { // Checks if the path is essentially '/'
        console.info(`[${apiResponseSettings.serviceIdentifier}] Detected base path access.`);
    } else {
        console.warn(`[${apiResponseSettings.serviceIdentifier}] Accessing a deeper path within the root. (${incomingPath})`);
    }

    // Construct the response using the standardized builder function.
    const finalOutcome = buildStandardApiResponse(apiResponseSettings.defaultSuccessMessage);

    // Send the HTTP response back to the client.
    // The status code is explicitly set, and the body is sent as JSON.
    serverOutput.status(apiResponseSettings.successfulStatus).json(finalOutcome);
});

// Export the configured collection of endpoints.
// This makes the router available for integration into the main application.
module.exports = endpointCollection;