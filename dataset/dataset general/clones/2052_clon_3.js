/*
  Module: CdnAccessProvider
  Description: Facilitates interaction with the CloudFront API from a browser context.
               Note: This implementation requires cross-origin XHR capabilities.
               It is primarily designed for use within environments like Chrome extensions,
               not standard web pages due to browser security restrictions.

  Dependencies:
  - An XML-to-JSON conversion utility (e.g., `xmlToJson` from davidwalsh.name).
  - A cryptographic library for SHA1 HMAC (e.g., `Crypto` from java2s.com).

  Usage Example:
    const myCdnService = new CdnAccessProvider("YOUR_AWS_ACCESS_KEY", "YOUR_AWS_SECRET_KEY");
    myCdnService.relyOnLocalClock = false; // Configure if system clock is unreliable
    const displayResult = (data) => console.log("Operation Result:", data);
    const handleError = (err) => console.error("Operation Failed:", err);

    myCdnService.retrieveAllDistributions(displayResult, handleError);
    myCdnService.queryInvalidationList("DISTRIBUTION_ID_EXAMPLE", displayResult, handleError);
    myCdnService.fetchPendingInvalidations("DISTRIBUTION_ID_EXAMPLE", displayResult);
    myCdnService.submitPurgeRequest("DISTRIBUTION_ID_EXAMPLE", "/path/to/file1.txt,/path/to/folder/*", displayResult, handleError);
*/

const CdnAccessProvider = function(accessKeyId, secretAccessKey) {
  // Validate essential credentials upon instantiation
  if (!accessKeyId || typeof accessKeyId !== 'string' || accessKeyId.trim() === '') {
    throw new Error("Initialization Error: AWS Access Key ID must be a non-empty string.");
  }
  if (!secretAccessKey || typeof secretAccessKey !== 'string' || secretAccessKey.trim() === '') {
    throw new Error("Initialization Error: AWS Secret Access Key must be a non-empty string.");
  }

  this.accessKeyId = accessKeyId;
  this.secretAccessKey = secretAccessKey;
  this.relyOnLocalClock = true; // Flag to indicate whether to trust the client's system clock
  this.serviceHost = "cloudfront.amazonaws.com";

  /**
   * Fetches the current GMT date string directly from the AWS CloudFront service.
   * This is a synchronous XHR call, intended for initial time synchronization.
   * @returns {string} The GMT date string from AWS.
   */
  this.fetchRemoteTime = function() {
    const xhrRequest = new XMLHttpRequest();
    try {
      xhrRequest.open("GET", `https://${this.serviceHost}/date`, false); // Synchronous request
      xhrRequest.send(null);
      return xhrRequest.getResponseHeader("Date");
    } catch (e) {
      console.warn("Failed to fetch remote time, falling back to local system time if allowed.", e);
      return (new Date()).toGMTString(); // Fallback in case of network error on sync request
    }
  };

  /**
   * Determines the timestamp string to be used in AWS request headers.
   * Prioritizes local system time unless `relyOnLocalClock` is set to false.
   * @returns {string} The GMT date string for the request.
   */
  this.determineRequestTimestamp = function() {
    if (this.relyOnLocalClock) {
      return (new Date()).toGMTString();
    } else {
      // If local clock is not trusted, attempt to synchronize with AWS time.
      return this.fetchRemoteTime();
    }
  };

  /**
   * Generates the necessary AWS authorization headers for a request.
   * @returns {object} An object containing the timestamp string and the authorization header value.
   */
  this.generateAuthHeaders = function() {
    const timestampString = this.determineRequestTimestamp();
    // Assuming Crypto.HMAC and Crypto.SHA1 are globally available from a dependency.
    const computedSignature = Crypto.util.bytesToBase64(
      Crypto.HMAC(Crypto.SHA1, timestampString, this.secretAccessKey, { asBytes: true })
    );
    const authHeaderValue = `AWS ${this.accessKeyId}:${computedSignature}`;
    return {
      timestamp: timestampString,
      authorization: authHeaderValue
    };
  };

  /**
   * Extracts the text content of the first element matching a tag name within a given XML node.
   * @param {Element} xmlElement - The parent XML DOM element.
   * @param {string} targetTag - The tag name of the child element to find.
   * @returns {string|null} The text content or null if not found.
   */
  this.extractXmlNodeText = function(xmlElement, targetTag) {
    if (!xmlElement || typeof xmlElement.getElementsByTagName !== 'function') {
      return null;
    }
    const foundElement = xmlElement.getElementsByTagName(targetTag)[0];
    return foundElement ? foundElement.textContent : null;
  };

  /**
   * Centralized handler for XMLHttpRequest responses.
   * @param {XMLHttpRequest} xhrRequest - The completed XHR object.
   * @param {function} successCallback - Callback for successful responses.
   * @param {function} failureCallback - Callback for error responses.
   */
  const _handleXhrResponse = (xhrRequest, successCallback, failureCallback) => {
    let operationError = null;
    // AWS API typically returns 200 for success, 201 for resource creation.
    const isSuccess = (xhrRequest.status >= 200 && xhrRequest.status < 300);

    if (!isSuccess) {
      let errorMessage = "Unknown API Error";
      let errorCode = "UNKNOWN";
      try {
        // Attempt to parse AWS error XML response
        const errorDoc = xhrRequest.responseXML;
        if (errorDoc) {
          errorMessage = this.extractXmlNodeText(errorDoc, "Message") || errorMessage;
          errorCode = this.extractXmlNodeText(errorDoc, "Code") || errorCode;
        } else if (xhrRequest.responseText) {
          // Fallback for non-XML error responses
          errorMessage = xhrRequest.responseText.substring(0, 200); // Truncate long messages
        }
      } catch (e) {
        console.error("Error parsing AWS error response:", e);
        errorMessage = `Failed to parse error message: ${xhrRequest.responseText}`;
      }

      operationError = {
        statusCode: xhrRequest.status,
        errorCode: errorCode,
        message: errorMessage,
        rawResponse: xhrRequest.responseText
      };
    }

    if (operationError) {
      if (typeof failureCallback === 'function') {
        failureCallback(operationError);
      } else {
        console.error("API Request Failed with no error handler:", operationError);
      }
    } else {
      if (typeof successCallback === 'function') {
        successCallback(xhrRequest);
      }
    }
  };


  /**
   * Executes a generic HTTP request to the CloudFront API.
   * @param {string} resourcePath - The API endpoint path (e.g., "/2010-11-01/distribution").
   * @param {function} successCallback - Callback function to handle successful responses (receives XHR object).
   * @param {string|null} payloadContent - Optional request body content (e.g., XML for POST).
   * @param {function} [failureCallback] - Optional callback for error handling (receives error object).
   */
  this.executeHttpRequest = function(resourcePath, successCallback, payloadContent = null, failureCallback = null) {
    if (!resourcePath || typeof resourcePath !== 'string') {
      throw new Error("API Request Error: Resource path must be a valid string.");
    }
    if (typeof successCallback !== 'function') {
      throw new Error("API Request Error: A success callback function is required.");
    }

    const xhrRequest = new XMLHttpRequest();
    const authDetails = this.generateAuthHeaders();
    const httpMethod = payloadContent ? "POST" : "GET";

    xhrRequest.open(httpMethod, `https://${this.serviceHost}${resourcePath}`, true); // Asynchronous request

    xhrRequest.setRequestHeader("Authorization", authDetails.authorization);
    xhrRequest.setRequestHeader("x-amz-date", authDetails.timestamp);

    if (httpMethod === "POST") {
      xhrRequest.setRequestHeader("Content-Type", "text/xml");
    }

    xhrRequest.onload = () => _handleXhrResponse(xhrRequest, successCallback, failureCallback);
    xhrRequest.onerror = () => _handleXhrResponse(xhrRequest, successCallback, failureCallback || ((err) => console.error("Network Error for API request:", err)));
    xhrRequest.onabort = () => _handleXhrResponse(xhrRequest, successCallback, failureCallback || ((err) => console.warn("API request aborted:", err)));

    xhrRequest.send(payloadContent);
  };

  /**
   * Retrieves a list of all CloudFront distributions associated with the account.
   * @param {function} successCallback - Called with an array of distribution summary objects.
   * @param {function} [failureCallback] - Called if the API request fails.
   */
  this.retrieveAllDistributions = function(successCallback, failureCallback = null) {
    if (typeof successCallback !== 'function') {
      console.error("Missing success callback for retrieveAllDistributions.");
      return;
    }

    const processDistributionResponse = (xhrResponse) => {
      let distributionsData = [];
      try {
        // Assume xmlToJson is a globally available utility function
        const jsonData = xmlToJson(xhrResponse.responseXML);
        const distributionList = jsonData?.DistributionList?.DistributionSummary;

        if (distributionList) {
          // Ensure it's always an array, even for a single item
          distributionsData = Array.isArray(distributionList) ? distributionList : [distributionList];
        }
        successCallback(distributionsData);
      } catch (e) {
        if (typeof failureCallback === 'function') {
          failureCallback({ statusCode: 0, errorCode: "CLIENT_PARSE_ERROR", message: `Failed to parse distribution XML: ${e.message}` });
        } else {
          console.error("Error parsing distribution list response:", e);
        }
      }
    };

    this.executeHttpRequest("/2010-11-01/distribution", processDistributionResponse, null, failureCallback);
  };

  /**
   * Queries the list of invalidation requests for a specific distribution.
   * @param {string} distributionId - The ID of the CloudFront distribution.
   * @param {function} successCallback - Called with an array of invalidation summary objects.
   * @param {function} [failureCallback] - Called if the API request fails.
   */
  this.queryInvalidationList = function(distributionId, successCallback, failureCallback = null) {
    if (!distributionId || typeof distributionId !== 'string') {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "Distribution ID is required." };
      if (typeof failureCallback === 'function') failureCallback(error);
      else console.error(error);
      return;
    }
    if (typeof successCallback !== 'function') {
      console.error("Missing success callback for queryInvalidationList.");
      return;
    }

    const processInvalidationResults = (xhrResponse) => {
      let invalidationItems = [];
      try {
        const jsonData = xmlToJson(xhrResponse.responseXML);
        const invList = jsonData?.InvalidationList?.InvalidationSummary;

        if (invList) {
          invalidationItems = Array.isArray(invList) ? invList : [invList];
        }
        successCallback(invalidationItems);
      } catch (e) {
        if (typeof failureCallback === 'function') {
          failureCallback({ statusCode: 0, errorCode: "CLIENT_PARSE_ERROR", message: `Failed to parse invalidation XML: ${e.message}` });
        } else {
          console.error("Error parsing invalidation list response:", e);
        }
      }
    };

    this.executeHttpRequest(
      `/2010-11-01/distribution/${distributionId}/invalidation?MaxItems=20`,
      processInvalidationResults,
      null,
      failureCallback
    );
  };

  /**
   * Fetches only the pending invalidation requests for a given distribution.
   * @param {string} distributionId - The ID of the CloudFront distribution.
   * @param {function} successCallback - Called with an array of pending invalidation summary objects.
   * @param {function} [failureCallback] - Called if the underlying `queryInvalidationList` fails.
   */
  this.fetchPendingInvalidations = function(distributionId, successCallback, failureCallback = null) {
    if (!distributionId || typeof distributionId !== 'string') {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "Distribution ID is required." };
      if (typeof failureCallback === 'function') failureCallback(error);
      else console.error(error);
      return;
    }
    if (typeof successCallback !== 'function') {
      console.error("Missing success callback for fetchPendingInvalidations.");
      return;
    }

    const filterPending = (allRequests) => {
      const pendingItems = allRequests.filter(item => item.Status?.["#text"] !== 'Completed');
      successCallback(pendingItems);
    };

    this.queryInvalidationList(distributionId, filterPending, failureCallback);
  };

  /**
   * Submits a new invalidation (purge) request for specified paths in a distribution.
   * @param {string} distributionId - The ID of the CloudFront distribution.
   * @param {string} pathsToInvalidate - A comma-separated string of paths to purge (e.g., "/image.jpg,/css/*").
   * @param {function} completionHandler - Called upon successful submission of the purge request.
   * @param {function} [errorHandler] - Called if the API request fails.
   */
  this.submitPurgeRequest = function(distributionId, pathsToInvalidate, completionHandler, errorHandler = null) {
    if (!distributionId || typeof distributionId !== 'string') {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "Distribution ID is required." };
      if (typeof errorHandler === 'function') errorHandler(error);
      else console.error(error);
      return;
    }
    if (!pathsToInvalidate || typeof pathsToInvalidate !== 'string' || pathsToInvalidate.trim() === '') {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "Paths to invalidate must be a non-empty string." };
      if (typeof errorHandler === 'function') errorHandler(error);
      else console.error(error);
      return;
    }
    if (typeof completionHandler !== 'function') {
      console.error("Missing completion handler for submitPurgeRequest.");
      return;
    }

    const handlePurgeResponse = (xhrResponse) => {
      try {
        // Optionally parse the response XML if needed, otherwise just confirm success.
        completionHandler(xmlToJson(xhrResponse.responseXML));
      } catch (e) {
        if (typeof errorHandler === 'function') {
          errorHandler({ statusCode: 0, errorCode: "CLIENT_PARSE_ERROR", message: `Failed to parse purge response XML: ${e.message}` });
        } else {
          console.error("Error parsing purge request response:", e);
        }
      }
    };

    const pathArray = pathsToInvalidate.split(',').map(path => path.trim()).filter(path => path !== '');
    if (pathArray.length === 0) {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "No valid paths provided for invalidation." };
      if (typeof errorHandler === 'function') errorHandler(error);
      else console.error(error);
      return;
    }

    const invalidationPathsXml = pathArray.map(path => `<Path>${path}</Path>`).join('');
    const batchReference = `batch-${(new Date()).getTime()}-${Math.random().toString(36).substring(2, 8)}`; // More robust unique ref

    const requestBodyXml = `
      <InvalidationBatch>
        ${invalidationPathsXml}
        <CallerReference>${batchReference}</CallerReference>
      </InvalidationBatch>
    `.replace(/\s+/g, ' ').trim(); // Minify XML for sending

    const apiPath = `/2010-11-01/distribution/${distributionId}/invalidation`;
    this.executeHttpRequest(apiPath, handlePurgeResponse, requestBodyXml, errorHandler);
  };

  /**
   * Retrieves detailed information for a specific invalidation request.
   * @param {string} distributionId - The ID of the CloudFront distribution.
   * @param {string} invalidationId - The ID of the specific invalidation request.
   * @param {function} successCallback - Called with the detailed invalidation object.
   * @param {function} [failureCallback] - Called if the API request fails.
   */
  this.getSpecificInvalidationDetails = function(distributionId, invalidationId, successCallback, failureCallback = null) {
    if (!distributionId || typeof distributionId !== 'string' || !invalidationId || typeof invalidationId !== 'string') {
      const error = { statusCode: 400, errorCode: "INVALID_INPUT", message: "Both Distribution ID and Invalidation ID are required." };
      if (typeof failureCallback === 'function') failureCallback(error);
      else console.error(error);
      return;
    }
    if (typeof successCallback !== 'function') {
      console.error("Missing success callback for getSpecificInvalidationDetails.");
      return;
    }

    const processDetailsResponse = (xhrResponse) => {
      try {
        successCallback(xmlToJson(xhrResponse.responseXML));
      } catch (e) {
        if (typeof failureCallback === 'function') {
          failureCallback({ statusCode: 0, errorCode: "CLIENT_PARSE_ERROR", message: `Failed to parse invalidation details XML: ${e.message}` });
        } else {
          console.error("Error parsing invalidation details response:", e);
        }
      }
    };

    const apiPath = `/2010-11-01/distribution/${distributionId}/invalidation/${invalidationId}`;
    this.executeHttpRequest(apiPath, processDetailsResponse, null, failureCallback);
  };
};