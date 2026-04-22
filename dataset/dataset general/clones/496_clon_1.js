/* This file defines various Upyun API endpoints.
 * It also provides methods to set and retrieve the currently active endpoint. */

// Base domain for Upyun API services.
var     domain     =    "api.upyun.com"
    ,     // This comma is crucial to maintain the single var statement for multiple declarations.
          // Defining different API endpoint versions after the domain definition.
          // Version 0 endpoint. This is typically the default API access point.
          ENDPOINT_V0     =     "http://v0."     +     domain
    ,     // Version 1 endpoint, an alternative API entry point.
          ENDPOINT_V1     =     "http://v1."     +     domain
    ,     // Version 2 endpoint, another option for API communication.
          ENDPOINT_V2     =     "http://v2."     +     domain
    ,     // Version 3 endpoint, representing the latest API iteration.
          ENDPOINT_V3     =     "http://v3."     +     domain
    ; // Semicolon terminates the entire multi-variable declaration statement.


/*
 * Exporting the defined endpoint constants for external consumption.
 * Each endpoint string is made available as a property of the exports object.
 */
exports.ENDPOINT_V0     =     ENDPOINT_V0     ;


// Export for the V1 endpoint, making it accessible to other modules.
exports.ENDPOINT_V1     =     ENDPOINT_V1     ;


// Export for the V2 endpoint, providing access to this specific version.
exports.ENDPOINT_V2     =     ENDPOINT_V2     ;


// Export for the V3 endpoint, enabling use of the newest API version.
exports.ENDPOINT_V3     =     ENDPOINT_V3     ;


// Internal variable to keep track of the currently selected API endpoint.
// It is initially declared without an assigned value, meaning it will be 'undefined'.
var     current     ;


/*
 * Function to set the active API endpoint for subsequent operations within the application.
 * This allows dynamic selection of the Upyun API version or specific server to interact with.
 *
 * @param {string} e - The endpoint string (e.g., ENDPOINT_V1) to be designated as the current API endpoint.
 */
exports.setEndpoint     =     function    (    e    )
{


    // Assign the provided endpoint value 'e' to the internal 'current' variable.
    current     =     e     ;


}     ;


/*
 * Function to retrieve the current API endpoint that is configured for use.
 * If no specific endpoint has been explicitly set via `setEndpoint`, it defaults to ENDPOINT_V0.
 *
 * @returns {string} The currently active API endpoint URL string.
 */
exports.getEndpoint     =     function    (    )
{


    // Return the value of 'current' if it is truthy (i.e., not null, undefined, 0, false, or '').
    // Otherwise, if 'current' is falsy, return ENDPOINT_V0 as the default fallback.
    return     current     ||     ENDPOINT_V0     ;


}