/*
 * This module provides a client for interacting with a remote notification service API.
 * It encapsulates various operations like sending different types of notifications,
 * managing devices and contacts, and fetching user information.
 *
 * This version includes enhanced error handling, input validation, and a more
 * structured approach to API interactions compared to previous iterations.
 */
var NotificationClient = (function() {
    // Core object that will expose all public API methods.
    const serviceCore = {};

    // Base URL for the external API endpoints.
    const primaryApiBase = "https://api.pushbullet.com/v2/";

    // Specific resource paths derived from the base URL.
    const notificationResource = primaryApiBase + "pushes";
    const contactResource = primaryApiBase + "contacts";
    const deviceResource = primaryApiBase + "devices";
    const userProfileResource = primaryApiBase + "users/me";
    const fileUploadPreparationResource = primaryApiBase + "upload-request";

    // Standard HTTP XHR ready states and status codes.
    const xhrRequestComplete = 4;
    const httpSuccessCode = 200;
    const httpNoContentCode = 204;

    // The security token for authenticating with the API.
    // This token must be configured by the user of this module.
    let authenticationToken = null;

    // Expose a property for setting and retrieving the authentication token.
    // Includes basic validation for the token's type and content.
    Object.defineProperty(serviceCore, 'AUTH_TOKEN', {
        set: function(value) {
            if (typeof value !== 'string' || value.trim().length === 0) {
                console.error("Invalid authentication token provided. Token must be a non-empty string.");
                authenticationToken = null; // Clear any previously set invalid token.
                return;
            }
            authenticationToken = value;
            console.info("Notification service authentication token updated.");
        },
        get: function() {
            return authenticationToken;
        },
        enumerable: true, // Allow enumeration
        configurable: false // Prevent re-defining this property
    });

    /**
     * Standardized error handling mechanism for asynchronous operations.
     * This function either invokes the provided callback with an error, or throws it.
     * @param {Error} encounteredError - The error object to handle.
     * @param {Function|null} responseCallback - The user-provided callback function.
     * @returns {void|*} Returns the result of the callback, or throws the error.
     */
    const handleOperationError = (encounteredError, responseCallback) => {
        if (typeof responseCallback === 'function') {
            // If a callback is provided, invoke it with the error.
            return responseCallback(encounteredError);
        } else {
            // Otherwise, throw the error for synchronous handling.
            throw encounteredError;
        }
    };

    /**
     * Validates and constructs targeting parameters for notifications (device or email).
     * @param {string|null} targetRecipientEmail - Email address for the recipient.
     * @param {string|null} targetDeviceIdentifier - Device ID for the recipient.
     * @param {Function|null} completionCallback - Callback for error handling.
     * @returns {object|null} An object containing `email` or `device_iden`, or `null` if validation fails (error handled internally).
     */
    const determineNotificationTarget = (targetRecipientEmail, targetDeviceIdentifier, completionCallback) => {
        const targetConfiguration = {};
        if (targetRecipientEmail && targetDeviceIdentifier) {
            // Error: Cannot target both email and device simultaneously.
            return handleOperationError(new Error("A notification cannot be sent to both a specific email and a device simultaneously."), completionCallback);
        } else if (targetRecipientEmail) {
            targetConfiguration.email = targetRecipientEmail;
        } else if (targetDeviceIdentifier) {
            targetConfiguration.device_iden = targetDeviceIdentifier;
        }
        // If neither is specified, targetConfiguration remains empty. This might be valid for some API calls.
        // For scenarios where a target is mandatory (e.g., file pushes), this will be checked later.
        return targetConfiguration;
    };

    /**
     * Core utility function for dispatching HTTP requests to the API.
     * @param {string} endpointUrl - The complete URL for the API request.
     * @param {string} httpMethod - The HTTP verb (e.g., "GET", "POST", "DELETE").
     * @param {object|FormData|null} requestBodyData - The payload for the request.
     * @param {boolean} isMultipartFormData - True if the payload is FormData (e.g., for file uploads).
     * @param {Function|null} requestCompletionCallback - Optional callback for asynchronous requests.
     * @returns {object|null} Parsed response for synchronous calls, or null for asynchronous.
     */
    const dispatchHttpRequest = (endpointUrl, httpMethod, requestBodyData, isMultipartFormData, requestCompletionCallback) => {
        // Pre-check for authentication token.
        if (!authenticationToken) {
            return handleOperationError(new Error("Authentication token is not set for the NotificationClient."), requestCompletionCallback);
        }

        const httpRequest = new XMLHttpRequest();
        let isAsyncOperation = false;

        // Configure for asynchronous behavior if a callback is provided.
        if (typeof requestCompletionCallback === 'function') {
            isAsyncOperation = true;
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === xhrRequestComplete) {
                    let processedOutput = null;
                    try {
                        processedOutput = interpretHttpResponse(httpRequest);
                    } catch (processingErr) {
                        return requestCompletionCallback(processingErr);
                    }
                    return requestCompletionCallback(null, processedOutput);
                }
            };
        }

        let finalUrl = endpointUrl;
        let serializedBody = requestBodyData;

        // For GET requests, parameters are encoded into the URL query string.
        if (httpMethod === "GET" && requestBodyData && typeof requestBodyData === 'object') {
            const queryComponents = [];
            for (const keyName in requestBodyData) {
                if (Object.prototype.hasOwnProperty.call(requestBodyData, keyName)) {
                    queryComponents.push(`${encodeURIComponent(keyName)}=${encodeURIComponent(requestBodyData[keyName])}`);
                }
            }
            if (queryComponents.length > 0) {
                finalUrl += `?${queryComponents.join("&")}`;
            }
            serializedBody = null; // GET requests generally do not have a body.
        }

        httpRequest.open(httpMethod, finalUrl, isAsyncOperation);

        // Set request headers, skipping Content-Type for FormData uploads.
        if (!isMultipartFormData) {
            // Basic authentication using the API token.
            httpRequest.setRequestHeader("Authorization", `Basic ${btoa(authenticationToken + ":")}`);
            httpRequest.setRequestHeader("Content-Type", "application/json");
            // Convert body data to JSON string for non-file requests.
            if (serializedBody !== null && typeof serializedBody === 'object') {
                serializedBody = JSON.stringify(serializedBody);
            }
        }

        // Send the request.
        if (serializedBody) {
            httpRequest.send(serializedBody);
        } else {
            httpRequest.send();
        }

        // For synchronous requests, return the parsed response directly.
        if (!isAsyncOperation) {
            return interpretHttpResponse(httpRequest);
        }
        // For asynchronous requests, results are handled by the callback.
        return null;
    };

    /**
     * Interprets the HTTP response from an XMLHttpRequest object.
     * @param {XMLHttpRequest} completedRequest - The XMLHttpRequest instance after completion.
     * @returns {object|string} The parsed JSON response or the raw response text.
     * @throws {Error} If the HTTP status code indicates an error.
     */
    const interpretHttpResponse = (completedRequest) => {
        // Check for successful HTTP status codes.
        if (completedRequest.status !== httpSuccessCode && completedRequest.status !== httpNoContentCode) {
            let detailedErrorMessage = `HTTP Request Failed: Status ${completedRequest.status}`;
            if (completedRequest.response) {
                try {
                    // Attempt to parse response as JSON to get more specific error details.
                    const errorResponseObj = JSON.parse(completedRequest.response);
                    detailedErrorMessage += `: ${errorResponseObj.error.message || completedRequest.response}`;
                } catch (jsonParseError) {
                    // If JSON parsing fails, just append the raw response.
                    detailedErrorMessage += `: ${completedRequest.response}`;
                }
            }
            throw new Error(detailedErrorMessage);
        }

        // Attempt to parse the response as JSON.
        try {
            return JSON.parse(completedRequest.response);
        } catch (parsingException) {
            // If JSON parsing fails, log a warning and return the raw text.
            console.warn("Could not parse JSON response, returning raw text. Error:", parsingException);
            return completedRequest.response;
        }
    };

    /**
     * Dispatches a general notification (push) of a specified type.
     * Supports "note", "link", "address", and "list" notification types.
     * @param {string} notificationKind - The type of notification to send.
     * @param {string|null} recipientDeviceId - Optional device identifier.
     * @param {string|null} recipientEmail - Optional email address.
     * @param {object} notificationDetails - An object containing data specific to the notification type.
     * @param {Function|null} outcomeCallback - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.sendNotification = (notificationKind, recipientDeviceId, recipientEmail, notificationDetails, outcomeCallback) => {
        const pushRequestParams = { type: notificationKind.toLowerCase() };

        // Determine the target for the notification.
        const targetConfig = determineNotificationTarget(recipientEmail, recipientDeviceId, outcomeCallback);
        if (targetConfig === null && (recipientEmail || recipientDeviceId)) {
             // An error was handled by determineNotificationTarget if a target was specified but invalid.
            return null;
        }
        Object.assign(pushRequestParams, targetConfig);

        // Validate the notification payload.
        if (!notificationDetails || typeof notificationDetails !== 'object' || Object.keys(notificationDetails).length === 0) {
            return handleOperationError(new Error("Notification details payload is required and must be a non-empty object."), outcomeCallback);
        }

        // Populate parameters based on the notification kind.
        switch (notificationKind.toLowerCase()) {
            case "note":
                if (!notificationDetails.title) {
                    return handleOperationError(new Error("Note notification requires a 'title' property."), outcomeCallback);
                }
                pushRequestParams.title = notificationDetails.title;
                if (notificationDetails.body) {
                    pushRequestParams.body = notificationDetails.body;
                }
                break;
            case "link":
                if (!notificationDetails.title || !notificationDetails.url) {
                    return handleOperationError(new Error("Link notification requires 'title' and 'url' properties."), outcomeCallback);
                }
                pushRequestParams.title = notificationDetails.title;
                pushRequestParams.url = notificationDetails.url;
                if (notificationDetails.body) {
                    pushRequestParams.body = notificationDetails.body;
                }
                break;
            case "address":
                if (!notificationDetails.name || !notificationDetails.address) {
                    return handleOperationError(new Error("Address notification requires 'name' and 'address' properties."), outcomeCallback);
                }
                pushRequestParams.name = notificationDetails.name;
                pushRequestParams.address = notificationDetails.address;
                break;
            case "list":
                if (!notificationDetails.title || !Array.isArray(notificationDetails.items) || notificationDetails.items.length === 0) {
                    return handleOperationError(new Error("List notification requires a 'title' and a non-empty array 'items'."), outcomeCallback);
                }
                pushRequestParams.title = notificationDetails.title;
                pushRequestParams.items = notificationDetails.items;
                break;
            default:
                return handleOperationError(new Error(`Unsupported notification kind specified: '${notificationKind}'.`), outcomeCallback);
        }

        // Dispatch the HTTP request.
        const serviceResponse = dispatchHttpRequest(notificationResource, "POST", pushRequestParams, false, outcomeCallback);
        // Return synchronous response or null for async.
        return (typeof outcomeCallback !== 'function') ? serviceResponse : null;
    };

    /**
     * Manages the process of uploading a file and sending a file notification.
     * This involves two steps: requesting an upload URL, then performing the upload and push.
     * @param {string|null} targetDeviceId - Optional device identifier.
     * @param {string|null} targetEmail - Optional email address.
     * @param {File} fileToUpload - The File object to be uploaded.
     * @param {string|null} optionalBodyText - Additional text to accompany the file notification.
     * @param {Function|null} finalResultCallback - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.uploadAndSendFile = (targetDeviceId, targetEmail, fileToUpload, optionalBodyText, finalResultCallback) => {
        // Validate the File object.
        if (!(fileToUpload instanceof File)) {
            return handleOperationError(new Error("The provided fileToUpload argument is not a valid File object."), finalResultCallback);
        }

        // Construct the URL for the file upload request.
        const encodedFileTypeParam = `file_type=${encodeURIComponent(fileToUpload.type)}`;
        const encodedFileNameParam = `file_name=${encodeURIComponent(fileToUpload.name)}`;
        const uploadRequestUri = `${fileUploadPreparationResource}?${encodedFileTypeParam}&${encodedFileNameParam}`;

        // Intermediate callback to handle the result of the initial upload request.
        const processUploadRequestResult = (requestError, uploadMetaInfo) => {
            if (requestError) {
                return handleOperationError(requestError, finalResultCallback);
            } else {
                try {
                    // Proceed to execute the actual file notification.
                    return performFileNotification(uploadMetaInfo, targetDeviceId, targetEmail, fileToUpload, optionalBodyText, finalResultCallback);
                } catch (executionError) {
                    return handleOperationError(executionError, finalResultCallback);
                }
            }
        };

        // Dispatch the initial request to get upload metadata.
        const initialResponse = dispatchHttpRequest(uploadRequestUri, "GET", null, false, finalResultCallback ? processUploadRequestResult : null);

        // If synchronous, immediately process the result.
        if (typeof finalResultCallback !== 'function') {
            return performFileNotification(initialResponse, targetDeviceId, targetEmail, fileToUpload, optionalBodyText);
        }
        return null; // Asynchronous flow, result via callbacks.
    };

    /**
     * Internal helper to finalize a file notification after upload details are received.
     * This involves uploading the file to a temporary storage (e.g., S3) and then
     * notifying the main service about the file.
     * @param {object} uploadMetadata - Metadata obtained from the initial upload request.
     * @param {string|null} targetDeviceId - Optional device identifier.
     * @param {string|null} targetEmail - Optional email address.
     * @param {File} fileDataHandle - The actual File object.
     * @param {string|null} accompanyingBodyText - Optional text for the notification.
     * @param {Function|null} finalCompletionCallback - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    const performFileNotification = (uploadMetadata, targetDeviceId, targetEmail, fileDataHandle, accompanyingBodyText, finalCompletionCallback) => {
        // Construct FormData for the actual file upload to the cloud storage (e.g., AWS S3).
        const cloudUploadForm = new FormData();
        const s3Details = uploadMetadata.data; // Assuming 'data' contains AWS-specific fields.

        // Append all required fields for the cloud upload.
        cloudUploadForm.append("awsaccesskeyid", s3Details.awsaccesskeyid);
        cloudUploadForm.append("acl", s3Details.acl);
        cloudUploadForm.append("key", s3Details.key);
        cloudUploadForm.append("signature", s3Details.signature);
        cloudUploadForm.append("policy", s3Details.policy);
        cloudUploadForm.append("content-type", fileDataHandle.type);
        cloudUploadForm.append("file", fileDataHandle); // The actual file content.

        // Execute the file upload to the designated cloud storage URL.
        // This is typically an asynchronous operation that doesn't directly return a value
        // to the main flow, so we provide a no-op callback if none is specified.
        dispatchHttpRequest(uploadMetadata.upload_url, "POST", cloudUploadForm, true, () => { /* File upload to cloud storage completed. */ });

        // Prepare the parameters for the final notification to the main service.
        const fileNotificationParameters = {
            file_name: fileDataHandle.name,
            file_type: fileDataHandle.type,
            file_url: uploadMetadata.file_url,
            type: "file" // Indicate this is a file notification.
        };

        if (accompanyingBodyText) {
            fileNotificationParameters.body = accompanyingBodyText;
        }

        // Determine and assign the target for the file notification.
        const notificationTarget = determineNotificationTarget(targetEmail, targetDeviceId, finalCompletionCallback);
        if (Object.keys(notificationTarget).length === 0) {
            // A file push *must* have a target, unlike some general pushes.
            return handleOperationError(new Error("File notifications require either a specific device ID or an email address to be specified."), finalCompletionCallback);
        }
        Object.assign(fileNotificationParameters, notificationTarget);

        // Dispatch the final request to register the file notification.
        const finalResponse = dispatchHttpRequest(notificationResource, "POST", fileNotificationParameters, false, finalCompletionCallback);
        return (typeof finalCompletionCallback !== 'function') ? finalResponse : null;
    };

    /**
     * Deletes a specific notification entry.
     * @param {string} notificationId - The unique identifier of the notification to delete.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.removePushEntry = (notificationId, completionHandler) => {
        if (!notificationId || typeof notificationId !== 'string') {
            return handleOperationError(new Error("A valid notification ID (string) is required for deletion."), completionHandler);
        }
        const deleteTargetUrl = `${notificationResource}/${encodeURIComponent(notificationId)}`;
        const operationResponse = dispatchHttpRequest(deleteTargetUrl, "DELETE", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    /**
     * Retrieves the history of push notifications, with optional filtering and pagination.
     * @param {number|null} [lastModificationTimestamp] - Optional: UNIX timestamp to retrieve pushes modified after this time.
     * @param {string|null} [paginationToken] - Optional: Cursor for pagination to fetch next set of results.
     * @param {Function|null} [resultHandler] - Optional: Callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.getPushHistory = (lastModificationTimestamp, paginationToken, resultHandler) => {
        // Normalize arguments to handle optional parameters and callback shifting.
        let actualTimestamp = null;
        let actualToken = null;
        let actualCallback = resultHandler;

        if (typeof lastModificationTimestamp === 'function') {
            // Case: getPushHistory(callback)
            actualCallback = lastModificationTimestamp;
        } else if (typeof paginationToken === 'function') {
            // Case: getPushHistory(timestamp, callback)
            actualCallback = paginationToken;
            actualTimestamp = lastModificationTimestamp;
        } else {
            // Case: getPushHistory(timestamp, token, callback) or getPushHistory(timestamp, token)
            actualTimestamp = lastModificationTimestamp;
            actualToken = paginationToken;
        }

        const queryParameters = {};
        if (actualTimestamp !== null) {
            queryParameters.modified_after = actualTimestamp;
        }
        if (actualToken !== null) {
            queryParameters.cursor = actualToken;
        }

        const operationResponse = dispatchHttpRequest(notificationResource, "GET", queryParameters, false, actualCallback);
        return (typeof actualCallback !== 'function') ? operationResponse : null;
    };

    /**
     * Fetches a list of devices registered with the service.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.retrieveDevices = (completionHandler) => {
        const operationResponse = dispatchHttpRequest(deviceResource, "GET", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    /**
     * Removes a specific device from the registered list.
     * @param {string} deviceIdToDelete - The identifier of the device to remove.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.removeDevice = (deviceIdToDelete, completionHandler) => {
        if (!deviceIdToDelete || typeof deviceIdToDelete !== 'string') {
            return handleOperationError(new Error("A valid device ID (string) is required for removal."), completionHandler);
        }
        const deleteUrl = `${deviceResource}/${encodeURIComponent(deviceIdToDelete)}`;
        const operationResponse = dispatchHttpRequest(deleteUrl, "DELETE", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    /**
     * Fetches a list of contacts registered with the service.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.retrieveContacts = (completionHandler) => {
        const operationResponse = dispatchHttpRequest(contactResource, "GET", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    /**
     * Removes a specific contact from the registered list.
     * @param {string} contactIdToDelete - The identifier of the contact to remove.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.removeContact = (contactIdToDelete, completionHandler) => {
        if (!contactIdToDelete || typeof contactIdToDelete !== 'string') {
            return handleOperationError(new Error("A valid contact ID (string) is required for removal."), completionHandler);
        }
        const deleteUrl = `${contactResource}/${encodeURIComponent(contactIdToDelete)}`;
        // Corrected: The original code had 'null' for the HTTP method here. It should be 'DELETE'.
        const operationResponse = dispatchHttpRequest(deleteUrl, "DELETE", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    /**
     * Retrieves the profile information for the currently authenticated user.
     * @param {Function|null} completionHandler - Optional callback for async operations.
     * @returns {object|null} Response for synchronous requests, null for asynchronous.
     */
    serviceCore.getCurrentUser = (completionHandler) => {
        const operationResponse = dispatchHttpRequest(userProfileResource, "GET", null, false, completionHandler);
        return (typeof completionHandler !== 'function') ? operationResponse : null;
    };

    // Return the public interface of the module.
    return serviceCore;
}());