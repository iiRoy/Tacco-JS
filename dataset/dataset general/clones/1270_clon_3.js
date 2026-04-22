/**
 * This module provides a simplified interface for interacting with
 * a hypothetical domain management API. It specifically focuses on
 * updating the IP address of a domain's A record.
 * This service extends the Node.js EventEmitter for asynchronous event handling.
 *
 * Note: This implementation is a minimal wrapper. For full API coverage,
 * consider using more comprehensive libraries.
 */

const netClient = require("https"); // Renamed 'https' to 'netClient' for network requests
const eventing = require("events"); // Renamed 'events' to 'eventing' for event management

/**
 * Initializes a new DomainService instance.
 * @param {object} clientConfig - Configuration options for the service.
 *   Expected properties:
 *   - username: API username (required)
 *   - authToken: API authentication token (required)
 *   - domainName: The domain to manage (e.g., "example.com")
 *   - recordIdentifier: The ID of the specific A record to update
 *   - apiHost: (Optional) The API hostname, defaults to "api.dnsimple.com"
 *   - defaultTtl: (Optional) Default Time-To-Live for records, defaults to 86400 seconds
 */
const DomainService = function(clientConfig) {
  // Validate initial configuration
  if (!clientConfig || typeof clientConfig !== 'object' || Object.keys(clientConfig).length === 0) {
    console.error("Critical: Initial configuration options are mandatory for the DomainService.");
    throw new Error("Configuration options missing.");
  }

  // Merge provided configuration with default values, ensuring essential properties
  this.serviceConfig = {
    apiHost: "api.dnsimple.com", // Updated default host to a more common API endpoint pattern
    defaultTtl: 86400, // Default Time-To-Live for DNS records
    ...clientConfig // Overwrite defaults with user-provided settings
  };

  // Additional checks for critical configuration pieces
  if (!this.serviceConfig.username || typeof this.serviceConfig.username !== 'string' || this.serviceConfig.username.trim() === '') {
    console.warn("Warning: 'username' is missing or invalid in the service configuration.");
  }
  if (!this.serviceConfig.authToken || typeof this.serviceConfig.authToken !== 'string' || this.serviceConfig.authToken.trim() === '') {
    console.warn("Warning: 'authToken' is missing or invalid in the service configuration.");
  }
};

// Inherit from EventEmitter to allow emitting custom events
DomainService.prototype = new eventing.EventEmitter();

/**
 * Generates the authentication string required for API requests.
 * @returns {string} The formatted authentication string (username:token) or an empty string if credentials are incomplete.
 */
DomainService.prototype.fetchAuthCredentials = function() {
  const currentConfig = this.serviceConfig; // Reference configuration for clarity

  // Early exit if authentication details are not fully provided
  if (!currentConfig.username || !currentConfig.authToken) {
    console.error("Authentication credentials (username and token) are incomplete. Cannot generate auth string.");
    return "";
  }
  // Use template literals for cleaner string concatenation
  return `${currentConfig.username}:${currentConfig.authToken}`;
};

/**
 * Initiates an update for a domain's A record IP address.
 * Emits an 'updated' event on success or an 'error' event on failure.
 * @param {string} newAddressValue - The new IP address (e.g., "192.168.1.1").
 */
DomainService.prototype.refreshDomainIpAddress = function(newAddressValue) {
  const serviceContext = this; // Maintain 'this' context for callbacks
  const currentConfig = serviceContext.serviceConfig; // Access configuration

  // --- Input Validation (Type III addition) ---
  if (!newAddressValue || typeof newAddressValue !== 'string' || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(newAddressValue)) {
    const validationError = new Error(`Invalid or malformed IP address provided: '${newAddressValue}'.`);
    serviceContext.emit("error", validationError);
    return; // Stop execution on invalid input
  }
  if (!currentConfig.domainName || !currentConfig.recordIdentifier) {
    const configError = new Error("Domain name or record identifier is missing from service configuration. Cannot proceed with update.");
    serviceContext.emit("error", configError);
    return; // Stop execution on missing configuration
  }

  // Construct the API resource path using template literals
  const apiResourcePath = `/domains/${currentConfig.domainName}/records/${currentConfig.recordIdentifier}`;

  // Build the JSON payload for the PUT request
  const updatePayloadData = JSON.stringify({
    record: {
      content: newAddressValue,
      // Use configured TTL or fallback to a default constant
      time_to_live: currentConfig.defaultTtl || 3600 // Changed key name for JSON (Type III update)
    }
  });

  // Delegate the actual HTTP request to a dedicated method
  serviceContext.executePutRequest(apiResourcePath, updatePayloadData);
};

/**
 * Performs an HTTP PUT request to the specified API path with the given data.
 * This is a private helper method for sending data to the API.
 * Emits 'updated' on successful response (2xx) or 'error' on HTTP error/failure.
 * @param {string} targetPath - The API endpoint path (e.g., "/domains/example.com/records/123").
 * @param {string} requestBody - The stringified JSON data to send in the request body.
 */
DomainService.prototype.executePutRequest = function(targetPath, requestBody) {
  const serviceContext = this; // Store 'this' context
  const currentConfig = serviceContext.serviceConfig;

  // --- Pre-request Validation (Type III addition) ---
  if (!targetPath || typeof targetPath !== 'string') {
    serviceContext.emit("error", new Error("Target API path is invalid or missing for PUT operation."));
    return;
  }
  if (!requestBody || typeof requestBody !== 'string') {
    console.warn("Warning: Request body for PUT operation is not a string. Ensure JSON.stringify() was used.");
    // Could attempt to stringify here, but original assumed string.
  }

  const authenticationToken = serviceContext.fetchAuthCredentials();
  if (!authenticationToken) {
    serviceContext.emit("error", new Error("Authentication token is empty. Cannot perform PUT request without credentials."));
    return;
  }

  // Configure the HTTP request options
  const requestConfiguration = {
    hostname: currentConfig.apiHost,
    path: targetPath,
    method: "PUT",
    headers: {
      "Accept": "application/json", // Indicates expected response format
      "Content-Type": "application/json", // Declares request body format
      "X-DNSimple-Token": authenticationToken, // Authentication header
      "Content-Length": Buffer.byteLength(requestBody, 'utf8') // Accurate byte length for UTF-8 string (Type III update)
    },
    timeout: 7000 // Set a request timeout of 7 seconds (Type III addition)
  };

  const outgoingRequest = netClient.request(requestConfiguration, (incomingResponse) => {
    let responseDataBuffers = []; // Use an array to collect binary data chunks

    incomingResponse.on("data", (chunk) => {
      responseDataBuffers.push(chunk); // Accumulate all incoming data
    });

    incomingResponse.on("end", () => {
      const fullResponseContent = Buffer.concat(responseDataBuffers).toString('utf8'); // Concatenate and decode
      const httpStatusCode = incomingResponse.statusCode; // Get the HTTP status code

      // Check for successful status codes (2xx range) (Type III update)
      if (httpStatusCode >= 200 && httpStatusCode < 300) {
        serviceContext.emit("updated", fullResponseContent);
      } else {
        // Emit a more structured error object for better debugging (Type III update)
        const detailedError = {
          statusCode: httpStatusCode,
          message: `API request failed with status code ${httpStatusCode}`,
          responseBody: fullResponseContent || "No response body received."
        };
        serviceContext.emit("error", detailedError);
      }
    });
  });

  // Handle network-related errors during the request
  outgoingRequest.on("error", (connectionError) => {
    serviceContext.emit("error", connectionError);
  });

  // Handle request timeout specifically (Type III addition)
  outgoingRequest.on('timeout', () => {
      outgoingRequest.destroy(new Error(`Request timed out after ${requestConfiguration.timeout}ms.`));
  });

  // Send the request body and finalize the request
  outgoingRequest.write(requestBody);
  outgoingRequest.end();
};

// Export the DomainService class for external use
module.exports = DomainService;