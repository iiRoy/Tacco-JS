//
// ObjectStoreUtility v1.0 - A client-side HTTP utility for cloud object storage services
//
// Project home: https://example.com/objectstoreutil
// Contact: dev.team@example.com
// All rights reserved.
//
// Dependencies:
// - https://example.com/libs/crypto/sha1-hasher.js (for HMAC-SHA1)
//

// Consideration: Is there a browser compatibility concern for PUT/DELETE requests?

ObjectStoreUtility = {

  // Option to add a unique query parameter to GET requests to prevent browser caching.
  BYPASS_CACHE: false,

  // The default access control list (ACL) to apply to newly uploaded objects.
  DEFAULT_ACCESS_POLICY: 'read-public',

  // The default MIME type to use when storing objects if not specified.
  DEFAULT_MEDIA_TYPE: 'application/octet-stream; charset=utf-8',

  /**
   * WARNING: DO NOT embed your service credentials directly into this code.
   * These sensitive keys (ACCESS_ID, SECRET_CREDENTIAL) should be provided dynamically
   * by the client-side application, for instance, retrieved from user input fields
   * or a secure token service. Storing them here exposes your account to unauthorized
   * access and potential misuse.
   *
   * Example of dynamic assignment:
   *
   * ObjectStoreUtility.ACCESS_ID       = document.getElementById('access_key_input').value;
   * ObjectStoreUtility.SECRET_CREDENTIAL = document.getElementById('secret_key_input').value;
   */
  SERVICE_ENDPOINT: 'https://storage.provider.com',
  ACCESS_ID:        '',
  SECRET_CREDENTIAL: '',

  // Set to 'true' to enable detailed console logging for debugging purposes.
  LOGGING_ENABLED: false,

  /**
   * Retrieves the content of a specific object from a container.
   *
   * @param {string} containerName The name of the storage container.
   * @param {string} objectKey The unique identifier of the object.
   * @param {function} successCallback Function to call on successful retrieval.
   * @param {function} failureCallback Function to call on error.
   * @returns {XMLHttpRequest} The XMLHttpRequest object used for the request.
   */
  retrieveObject: function(containerName, objectKey, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod:   'GET',
      resourcePath:    '/' + containerName + '/' + objectKey,
      onSuccess:       function(requestHandle, parsedResponse) {
        if (successCallback) return successCallback(requestHandle, requestHandle.responseText);
      },
      onError:         function(requestHandle, parsedResponse) {
        if (failureCallback) return failureCallback(requestHandle, parsedResponse);
        if (successCallback) return successCallback(requestHandle, requestHandle.responseText);
      }
    });
  },

  /**
   * Fetches only the metadata (headers) for an object without downloading its content.
   *
   * @param {string} containerName The name of the storage container.
   * @param {string} objectKey The unique identifier of the object.
   * @param {function} successCallback Function to call on successful metadata retrieval.
   * @param {function} failureCallback Function to call on error.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  inspectObject: function(containerName, objectKey, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod:   'HEAD',
      resourcePath:    '/' + containerName + '/' + objectKey,
      onSuccess:       function(requestHandle, parsedResponse) {
        if (successCallback) return successCallback(requestHandle, requestHandle.responseText);
      },
      onError:         function(requestHandle, parsedResponse) {
        if (failureCallback) return failureCallback(requestHandle, parsedResponse);
        if (successCallback) return successCallback(requestHandle, requestHandle.responseText);
      }
    });
  },

  /**
   * Uploads or updates an object's content within a specified container.
   *
   * @param {string} containerName The target container's name.
   * @param {string} objectKey The object's identifier.
   * @param {string|Blob} payloadData The content to upload.
   * @param {object} [uploadOptions] Optional parameters like media_type, access_policy, meta.
   * @param {function} successCallback Function to call upon successful upload.
   * @param {function} failureCallback Function to call if an error occurs.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  storeObject: function(containerName, objectKey, payloadData /*, [uploadOptions], successCallback, [failureCallback]*/) {

    // Process flexible arguments for optional configuration.
    var currentArgIndex = 3;
    var uploadOptions = {};
    if (typeof arguments[currentArgIndex] === 'object') {
      uploadOptions = arguments[currentArgIndex++];
    }
    var successCallback = arguments[currentArgIndex++];
    var failureCallback = arguments[currentArgIndex++];

    if (!uploadOptions.media_type) {
      uploadOptions.media_type = this.DEFAULT_MEDIA_TYPE;
    }
    if (!uploadOptions.access_policy) {
      uploadOptions.access_policy = this.DEFAULT_ACCESS_POLICY;
    }

    return this.httpRequestAgent({
      requestMethod:   'PUT',
      resourcePath:    '/' + containerName + '/' + objectKey,
      payload:         payloadData,
      mediaType:       uploadOptions.media_type,
      objectMetadata:  uploadOptions.meta,
      accessPolicy:    uploadOptions.access_policy,
      onSuccess:       function(requestHandle, parsedResponse) {
        if (successCallback) return successCallback(requestHandle);
      },
      onError:         function(requestHandle, parsedResponse) {
        if (failureCallback) return failureCallback(requestHandle, parsedResponse);
        if (successCallback) return successCallback(requestHandle, parsedResponse);
      }
    });
  },

  /**
   * Retrieves a list of all containers (buckets) associated with the account.
   *
   * @param {function} successCallback Callback for successful retrieval of container list.
   * @param {function} failureCallback Callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  enumerateContainers: function(successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod: 'GET',
      resourcePath:  '/',
      forcedListPaths: ['ListAllMyContainersResult.Containers.Container'],
      onSuccess:     successCallback,
      onError:       failureCallback
    });
  },

  /**
   * Initiates the creation of a new storage container.
   *
   * @param {string} containerName The name for the new container.
   * @param {function} successCallback Callback upon successful container creation.
   * @param {function} failureCallback Callback if creation fails.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  provisionContainer: function(containerName, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod: 'PUT',
      resourcePath:  '/' + containerName,
      onSuccess:     successCallback,
      onError:       failureCallback
    });
  },

  /**
   * Deletes an existing, empty storage container.
   *
   * @param {string} containerName The name of the container to delete.
   * @param {function} successCallback Callback upon successful deletion.
   * @param {function} failureCallback Callback if deletion fails.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  removeContainer: function(containerName, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod: 'DELETE',
      resourcePath:  '/' + containerName,
      onSuccess:     successCallback,
      onError:       failureCallback
    });
  },

  /**
   * Lists objects within a specified container, optionally filtered by parameters.
   *
   * @param {string} containerName The name of the container.
   * @param {object} queryOptions Filtering options (e.g., prefix, delimiter).
   * @param {function} successCallback Callback for successful object listing.
   * @param {function} failureCallback Callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  enumerateObjects: function(containerName, queryOptions, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod:   'GET',
      resourcePath:    '/' + containerName,
      forcedListPaths: ['ListContainerResult.Items'],
      requestParameters: queryOptions,
      onSuccess:       successCallback,
      onError:         failureCallback
    });
  },

  /**
   * Deletes a single object from a container.
   *
   * @param {string} containerName The container's name.
   * @param {string} objectKey The identifier of the object to delete.
   * @param {function} successCallback Callback upon successful deletion.
   * @param {function} failureCallback Callback if deletion fails.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  removeObject: function(containerName, objectKey, successCallback, failureCallback) {
    return this.httpRequestAgent({
      requestMethod: 'DELETE',
      resourcePath:  '/' + containerName + '/' + objectKey,
      onSuccess:     successCallback,
      onError:       failureCallback
    });
  },

  /**
   * Deletes multiple objects from a container sequentially.
   * Provides callbacks for each deleted item and for completion of the batch.
   *
   * @param {string} containerName The container's name.
   * @param {Array<string>} objectList An array of object keys to delete.
   * @param {function} [singleItemCallback] Callback after each object is deleted.
   * @param {function} [batchCompletionCallback] Callback once all objects in the list are processed.
   * @returns {void}
   */
  removeObjectsBatch: function(containerName, objectList, singleItemCallback, batchCompletionCallback) {
    var currentInstance = this;

    // If the provided list is empty, immediately invoke the batch completion callback.
    if (!objectList.length && batchCompletionCallback) {
      return batchCompletionCallback();
    }

    // Extract the first key and initiate its deletion.
    var currentObjectKey = objectList.shift();
    this.removeObject(containerName, currentObjectKey, function() {
      if (singleItemCallback) singleItemCallback(currentObjectKey);
      currentInstance.removeObjectsBatch(containerName, objectList, singleItemCallback, batchCompletionCallback);
    });
  },

  /**
   * Executes an authenticated HTTP request to the storage service.
   * This method handles request signing and common parameters.
   *
   * @param {object} configOptions Configuration object for the HTTP request.
   * @returns {XMLHttpRequest} The XMLHttpRequest object used for the request.
   */
  httpRequestAgent: function(configOptions) {
    var currentInstance = this;

    // Apply cache-busting parameter for GET/HEAD requests if configured.
    if (this.BYPASS_CACHE && (configOptions.requestMethod === "GET" || configOptions.requestMethod === "HEAD")) {
      if (!configOptions.requestParameters) {
        configOptions.requestParameters = {};
      }
      configOptions.requestParameters["cachebust"] = new Date().getTime();
    }

    // Construct the query string and the full target URL for this operation.
    var queryParametersString = (configOptions.requestParameters) ? '?' + buildQueryString(configOptions.requestParameters) : '';
    var targetURL = this.SERVICE_ENDPOINT + configOptions.resourcePath + queryParametersString;
    var requestHeaders = {};

    // Determine and set the Content-Type header.
    if (!configOptions.mediaType && configOptions.requestMethod === 'PUT') {
      configOptions.mediaType = 'application/x-binary';
    }
    if (configOptions.mediaType) {
      requestHeaders['Content-Type'] = configOptions.mediaType;
    } else {
      configOptions.mediaType = '';
    }

    // Generate the current timestamp in HTTP date format.
    var timestampValue = this.generateHTTPTimestamp();

    var payloadMD5Hash = '';
    /*
     * Note: MD5 hashing of content for Content-MD5 header is currently disabled.
     * Revisit implementation details for content hashing.
     *
     * if (configOptions.payload && configOptions.payload.computeMD5) {
     *   payloadMD5Hash = configOptions.payload.computeMD5();
     *   requestHeaders['Content-MD5'] = payloadMD5Hash;
     * }
     */

    // Process the custom access policy header.
    var authPolicyHeader = '';
    if (configOptions.accessPolicy) {
      requestHeaders['x-storage-acl'] = configOptions.accessPolicy;
      authPolicyHeader = "x-storage-acl:" + configOptions.accessPolicy + "\n";
    }
    requestHeaders['x-storage-date'] = timestampValue;
    var authDateHeader = "x-storage-date:" + timestampValue + "\n";

    // Handle custom metadata headers for the object.
    var metadataHeadersToSign = '';
    if (configOptions.objectMetadata) {
      for (var metadataKey in configOptions.objectMetadata) {
        requestHeaders['x-storage-meta-' + metadataKey] = configOptions.objectMetadata[metadataKey];
        metadataHeadersToSign += "x-storage-meta-" + metadataKey + ":" + configOptions.objectMetadata[metadataKey] + "\n";
      }
    }

    // Proceed with authentication only if credentials are provided and not an anonymous request.
    if (configOptions['isAnonymous'] !== true && this.ACCESS_ID && this.SECRET_CREDENTIAL) {

      // Construct the canonical string used for signature generation.
      var signatureString;
      signatureString = configOptions.requestMethod + "\n";
      signatureString += "\n"; // Content MD5 placeholder
      signatureString += configOptions.mediaType + "\n";
      signatureString += "\n"; // Date placeholder
      signatureString += authPolicyHeader;
      signatureString += authDateHeader;
      signatureString += metadataHeadersToSign;
      signatureString += configOptions.resourcePath;

      // Compute the HMAC-SHA1 signature using the secret key.
      var computedSignature = this.calculateSignatureHMAC(signatureString, this.SECRET_CREDENTIAL);
      requestHeaders['Authorization'] = "STORAGE " + this.ACCESS_ID + ":" + computedSignature;
    }

    // Initialize and send the HTTP request.
    var requestHandle = createXHRInstance();
    requestHandle.open(configOptions.requestMethod, targetURL, true);
    for (var headerKey in requestHeaders) {
      requestHandle.setRequestHeader(headerKey, requestHeaders[headerKey]);
    }
    requestHandle.onreadystatechange = function() {
      if (requestHandle.readyState === 4) {

        // Parse the XML response if available and parsing is not disabled.
        var parsedResponse = null;
        if (requestHandle.responseXML && configOptions.disableXMLParsing !== true) {
          parsedResponse = currentInstance.xmlParser(requestHandle.responseXML, configOptions.forcedListPaths);
        }

        // Store request details in global scope for debugging if enabled.
        if (currentInstance.LOGGING_ENABLED) {
          window._lastRequestDetails = requestHandle;
          window._lastParsedResponse = parsedResponse;
        }

        // Invoke the appropriate callback based on HTTP status or parsed error object.
        if ((requestHandle.status >= 400 || (parsedResponse && parsedResponse.Error) ) && configOptions.onError) {
          return configOptions.onError(requestHandle, parsedResponse);
        } else {
          return configOptions.onSuccess(requestHandle, parsedResponse);
        }

      }
    };
    requestHandle.send(configOptions.payload);
    return requestHandle;
  },

  /**
   * Converts a hierarchical XML document into a JavaScript object structure.
   *
   * To-do: Add support for XML attributes.
   *
   * @param {Node} xmlRoot The root XML node to parse.
   * @param {Array<string>} [forceToArrayPaths] An array of XPath-like strings to force elements into arrays.
   * @param {string} [currentPath] Internal parameter for tracking current XML path.
   * @returns {object|string} The resulting JavaScript object or character data.
   */
  xmlParser: function(xmlRoot, forceToArrayPaths, currentPath) {
    var resultObject = {};
    var characterData = '';
    var hasChildElements = false;

    for (var i = 0, xmlNode; xmlNode = xmlRoot.childNodes[i]; i++) {
      if (xmlNode.nodeType === 3) { // Text node
        characterData += xmlNode.nodeValue;
      } else { // Element node
        hasChildElements = true;
        var nodeTagName = xmlNode.nodeName;
        var currentNodePath = (currentPath) ? currentPath + '.' + nodeTagName : nodeTagName;
        var nodeConvertedValue = this.xmlParser(xmlNode, forceToArrayPaths, currentNodePath); // Recursive call

        if (!resultObject[nodeTagName]) {
          var shouldForceList = false;
          if (forceToArrayPaths) {
            for (var j = 0, forcedListItem; forcedListItem = forceToArrayPaths[j]; j++) {
              if (forcedListItem === currentNodePath) {
                shouldForceList = true;
                break;
              }
            }
          }
          resultObject[nodeTagName] = (shouldForceList) ? [ nodeConvertedValue ] : nodeConvertedValue;
        } else if (Array.isArray(resultObject[nodeTagName])) {
          // If already an array, append the new value.
          resultObject[nodeTagName].push(nodeConvertedValue);
        } else {
          // Convert existing single value to an array and add the new one.
          resultObject[nodeTagName] = [ resultObject[nodeTagName], nodeConvertedValue ];
        }
      }
    }

    // Return the structured object if child elements were found, otherwise return the collected text.
    return (hasChildElements) ? resultObject : characterData;
  },

  /**
   * Computes an HMAC-SHA1 signature for a given string using a secret key.
   * Requires an external b64_hmac_sha1 function.
   *
   * @param {string} dataToSign The string that needs to be signed.
   * @param {string} secretKey The secret key for signing.
   * @returns {string} The base64-encoded HMAC-SHA1 signature.
   */
  calculateSignatureHMAC: function(dataToSign, secretKey) {
    // Implementations might vary; currently relies on b64_hmac_sha1.
    return b64_hmac_sha1(secretKey, dataToSign) + '=';
  },

  /**
   * Formats a Date object into an HTTP-compliant timestamp string (RFC 1123).
   * Inspired by existing date formatting utilities.
   *
   * @param {Date} [inputDate] The date object to format. Defaults to current date/time.
   * @returns {string} The formatted HTTP date string.
   */
  generateHTTPTimestamp: function(inputDate) {
    // If no date is provided, use the current system time.
    if (!inputDate) inputDate = new Date();

    // Shortened names for days and months.
    var shortDayNames = ["Sun", "Mon", "Tue", "Wed",
      "Thu", "Fri", "Sat"];
    var shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Helper function to correctly determine the full year.
    function obtainFullYear(dateObj) {
      var yearVal = dateObj.getYear();
      var adjustedYear = yearVal % 100;
      adjustedYear += (adjustedYear < 38) ? 2000 : 1900;
      return adjustedYear;
    }

    // Utility for zero-padding numbers.
    function padWithZero(numberToPad, desiredSize) {
      return ( (desiredSize - ("" + numberToPad).length) > 0 ) ?
          padWithZero("0" + numberToPad, desiredSize) : numberToPad;
    }

    // Calculates the GMT offset string (+/-HHMM).
    function formatGMTOffset(dateObj) {
      var offsetMinutes = Math.abs(dateObj.getTimezoneOffset());
      var hoursStr = "" + Math.floor(offsetMinutes / 60);
      var minutesStr = "" + (offsetMinutes % 60);
      hoursStr.length === 1 ? hoursStr = "0" + hoursStr : 1;
      minutesStr.length === 1 ? minutesStr = "0" + minutesStr : 1;
      return dateObj.getTimezoneOffset() < 0 ? "+" + hoursStr + minutesStr : "-" + hoursStr + minutesStr;
    }

    var formattedString;
    formattedString = shortDayNames[inputDate.getDay()] + ", ";
    formattedString += inputDate.getDate() + " ";
    formattedString += shortMonthNames[inputDate.getMonth()] + " ";
    formattedString += obtainFullYear(inputDate) + " ";
    formattedString += padWithZero(inputDate.getHours(), 2) + ":";
    formattedString += padWithZero(inputDate.getMinutes(), 2) + ":";
    formattedString += padWithZero(inputDate.getSeconds(), 2) + " ";
    formattedString += formatGMTOffset(inputDate);

    return formattedString;
  },

  /* Sentinel value to prevent trailing comma issues in older browsers. */
  FINAL_MARKER: null

};

// Check for and define a global query string builder if not already present.
if (!window['buildQueryString']) {
  // Adapted from a common utility library pattern.
  function buildQueryString(parameters) {
    var partsList = [];
    for (var keyName in parameters) {
      partsList.push(keyName + '=' + encodeURIComponent(parameters[keyName]));
    }
    return partsList.join("&");
  }
}

// Check for and define an XMLHttpRequest factory if not already present.
if (!window['createXHRInstance']) {
  // Borrowed from robust cross-browser XHR implementations.
  function createXHRInstance() {
    var factoryFunction = arguments.callee;
    if (!factoryFunction.cachedXHR) {
      var xhrConstructors = [
        function() { return new XMLHttpRequest(); },
        function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
        function() { return new ActiveXObject('Microsoft.XMLHTTP'); },
        function() { return new ActiveXObject('Msxml2.XMLHTTP.4.0'); },
        function() { return null; }
      ];
      for (var i = 0; i < xhrConstructors.length; i++) {
        var attemptCreator = xhrConstructors[i];
        try {
          factoryFunction.cachedXHR = attemptCreator;
          return attemptCreator();
        } catch (exceptionError) {
          // Attempt next constructor.
        }
      }
    }
    return factoryFunction.cachedXHR();
  }
}