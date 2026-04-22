// This module provides a basic utility for remote file operations,
// akin to a simplified WebDAV client, without external dependencies like curl.

// Core network capabilities
const netClient = require("http");
// File system interaction module for local file access
const fileSys = require("fs");
// URL parsing and manipulation utility
const resourceParser = require("url");

/**
 * Initiates a file transfer operation to a remote server using HTTP methods.
 * This function handles the low-level HTTP request construction and response processing.
 * @param {string} operationType - The HTTP method to employ (e.g., "PUT", "DELETE").
 * @param {object} remoteTargetDetails - An object containing parsed URL components of the target resource.
 * @param {Buffer | null} uploadPayload - The data buffer to transmit as the request body, or null if no body is required.
 * @param {function(Error | null): void} completionHandler - Callback function invoked upon completion, receiving an error object if the operation failed.
 */
function initiateRemoteTransfer(operationType, remoteTargetDetails, uploadPayload, completionHandler) {
  // Enforce the presence of a valid callback for asynchronous operations
  if (typeof completionHandler !== 'function') {
    console.error('CRITICAL: Remote transfer initiated without a valid completion handler. Operation aborted.');
    // Optionally, throw an error here if this is considered unrecoverable
    return;
  }

  // Extract and normalize target details, providing default port if absent
  const targetHost = remoteTargetDetails.hostname;
  const targetPort = remoteTargetDetails.port ? parseInt(remoteTargetDetails.port, 10) : (remoteTargetDetails.protocol === 'https:' ? 443 : 80);
  const targetPath = remoteTargetDetails.path;

  // Build HTTP headers, primarily for content-related information when a payload exists
  let requestHeaders = {};
  if (uploadPayload instanceof Buffer) {
    requestHeaders["Content-Length"] = uploadPayload.length;
    requestHeaders["Content-Type"] = "application/octet-stream"; // Generic binary content type
  } else if (operationType === "PUT") {
    // For PUT operations with no explicit payload (e.g., creating an empty file)
    requestHeaders["Content-Length"] = 0;
  }

  // Define the comprehensive options for the HTTP client request
  const requestConfig = {
    host: targetHost,
    port: targetPort,
    method: operationType,
    path: targetPath,
    headers: requestHeaders
  };

  // Create the actual HTTP client request object
  const clientRequest = netClient.request(requestConfig);

  // Attach event listener for the server's response
  clientRequest.on("response", (serverResponse) => {
    const responseStatus = serverResponse.statusCode;
    // Check for common success codes for resource creation/modification (201 Created, 204 No Content)
    const operationSuccessful = responseStatus === 201 || responseStatus === 204;

    if (!operationSuccessful) {
      // If the operation failed, collect any error data sent by the server
      let responseBodyAccumulator = '';
      serverResponse.on("data", (chunk) => {
        responseBodyAccumulator += chunk;
      });
      serverResponse.on("end", () => {
        const failureDetails = responseBodyAccumulator.trim() || 'No specific details provided by server.';
        const errorMessage = `Remote operation '${operationType}' to '${targetPath}' failed with HTTP status ${responseStatus}. Server details: ${failureDetails}`;
        console.warn(`WARNING: ${errorMessage}`);
        completionHandler(new Error(errorMessage));
      });
    } else {
      // If successful, simply wait for the response stream to end
      serverResponse.on("end", () => {
        console.log(`INFO: Remote operation '${operationType}' to '${targetPath}' completed successfully with status ${responseStatus}.`);
        completionHandler(null); // Indicate success by passing null for the error
      });
    }

    // Always consume the response stream to prevent potential memory leaks or hanging connections
    serverResponse.resume();
  });

  // Attach event listener for network or request-level errors
  clientRequest.on("error", (connectionError) => {
    console.error(`ERROR: A network or request error occurred during '${operationType}' to '${targetPath}':`, connectionError.message);
    completionHandler(connectionError);
  });

  // Write the payload to the request body if one exists
  if (uploadPayload instanceof Buffer && uploadPayload.length > 0) {
    clientRequest.write(uploadPayload);
    clientRequest.end(); // Signal the end of the request body
  } else {
    // For operations without a body, or an empty payload, just end the request
    clientRequest.end();
  }
}

// Exported functionality of this module
module.exports = {
  /**
   * Facilitates the upload of a local file to a specified remote URL using the PUT method.
   * @param {string} sourceFilePath - The absolute or relative path to the local file to be uploaded.
   * @param {string} targetUrlString - The full URL string of the remote destination.
   * @param {function(Error | null): void} completionHandler - Callback function (error) => void.
   */
  uploadResource: (sourceFilePath, targetUrlString, completionHandler) => {
    // Basic input validation for critical parameters
    if (typeof sourceFilePath !== 'string' || sourceFilePath.length === 0) {
      return completionHandler(new Error("Validation Error: 'sourceFilePath' must be a non-empty string."));
    }
    if (typeof targetUrlString !== 'string' || targetUrlString.length === 0) {
      return completionHandler(new Error("Validation Error: 'targetUrlString' must be a non-empty string."));
    }
    if (typeof completionHandler !== 'function') {
      console.error('CRITICAL: Upload initiated without a valid completion handler.');
      return; // Prevent further execution if no callback
    }

    // First, read the content of the local file
    fileSys.readFile(sourceFilePath, (readError, fileContentBuffer) => {
      if (readError) {
        console.error(`ERROR: Failed to read local file '${sourceFilePath}':`, readError.message);
        return completionHandler(readError);
      }

      // Ensure the buffer is not null, even for empty files
      const actualFileContent = fileContentBuffer || Buffer.from('');
      if (actualFileContent.length === 0) {
          console.log(`INFO: Local file '${sourceFilePath}' was empty. Uploading an empty resource.`);
      }

      // Parse the remote URL string into a structured object
      const parsedRemoteUrl = resourceParser.parse(targetUrlString);

      // Trigger the generic remote transfer mechanism with "PUT" method
      initiateRemoteTransfer("PUT", parsedRemoteUrl, actualFileContent, completionHandler);
    });
  }
};