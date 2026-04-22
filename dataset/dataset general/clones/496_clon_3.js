/**
 * Core module for managing API service entry points.
 * Provides configuration and retrieval of the active service endpoint.
 */

// Define fundamental components for constructing service URLs.
const PROTOCOL_SCHEME = "http://"; // The communication protocol.
const BASE_SERVICE_HOST = "api.upyun.com"; // The root domain for API services.

/**
 * Helper function to generate a full API endpoint URL for a given version.
 * @param {string} versionTag - The version identifier (e.g., "v0", "v1").
 * @returns {string} The complete URL for the specified API version.
 */
const generateServiceUrl = (versionTag) => {
  // Basic validation for the version tag provided.
  if (typeof versionTag !== 'string' || versionTag.trim() === '') {
    console.warn("Invalid version tag provided for URL generation. Defaulting to 'v0'.");
    versionTag = 'v0'; // Fallback to a default version if input is invalid.
  }
  // Construct the full URL using template literals for clarity.
  return `${PROTOCOL_SCHEME}${versionTag}.${BASE_SERVICE_HOST}`;
};

// Pre-define common API entry points using the helper function.
// These are the standard, well-known endpoints for various API versions.
const API_ENTRY_POINT_V0 = generateServiceUrl("v0");
const API_ENTRY_POINT_V1 = generateServiceUrl("v1");
const API_ENTRY_POINT_V2 = generateServiceUrl("v2");
const API_ENTRY_POINT_V3 = generateServiceUrl("v3");

// Export individual entry points under new, descriptive names for direct access.
// This allows other modules to easily import and use these predefined endpoints.
exports.DEFAULT_API_V0 = API_ENTRY_POINT_V0;
exports.ALTERNATIVE_API_V1 = API_ENTRY_POINT_V1;
exports.ALTERNATIVE_API_V2 = API_ENTRY_POINT_V2;
exports.ALTERNATIVE_API_V3 = API_ENTRY_POINT_V3;

// Internal state variable to hold the currently selected API endpoint.
// It is initialized to `null`, indicating that no specific endpoint has been chosen yet.
let currentActiveServiceEndpoint = null;

/**
 * Configures the active API service endpoint.
 * This function allows runtime modification of the endpoint used for API calls.
 * @param {string} newEndpointUrl - The URL of the new endpoint to set.
 * @returns {boolean} True if the endpoint was successfully set, false otherwise.
 */
exports.configureActiveEndpoint = (newEndpointUrl) => {
  // Guard clause: Ensure the provided endpoint is a valid, non-empty string.
  // This prevents setting an invalid or undefined URL as the active endpoint.
  if (typeof newEndpointUrl !== 'string' || newEndpointUrl.trim().length === 0) {
    console.error("Attempted to set an invalid or empty API endpoint URL. Configuration aborted.");
    return false; // Indicate failure to set the endpoint.
  }

  // Update the internal state with the new, validated endpoint URL.
  currentActiveServiceEndpoint = newEndpointUrl.trim();
  // Optional: Add a logging statement for debugging purposes.
  // console.log(`API endpoint successfully configured to: ${currentActiveServiceEndpoint}`);
  return true; // Indicate successful configuration.
};

/**
 * Retrieves the currently active API service endpoint.
 * If no specific endpoint has been configured (i.e., `currentActiveServiceEndpoint` is null),
 * it defaults to the predefined V0 API endpoint.
 * @returns {string} The active or default API service endpoint URL.
 */
exports.retrieveCurrentEndpoint = () => {
  // Define a local constant function to retrieve the default entry point.
  // This enhances readability by clearly separating the default logic.
  const getDefaultEntryPoint = () => API_ENTRY_POINT_V0;

  // Check if an endpoint has been explicitly set and is a valid string.
  // This ensures that a previously configured valid endpoint is returned.
  if (currentActiveServiceEndpoint && typeof currentActiveServiceEndpoint === 'string' && currentActiveServiceEndpoint.length > 0) {
    return currentActiveServiceEndpoint;
  } else {
    // If no specific endpoint is set or it's invalid, return the default V0 endpoint.
    // console.info("No specific API endpoint configured; returning default V0 endpoint for service operations.");
    return getDefaultEntryPoint();
  }
};