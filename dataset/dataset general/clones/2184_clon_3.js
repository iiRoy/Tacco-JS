/**
 * CloudClient v1.0 - A utility for interacting with cloud storage services (e.g., AWS S3).
 *
 * This package facilitates common operations like object retrieval, storage, and container management.
 *
 * Original source: http://decafbad.com/trac/wiki/S3Ajax
 * Author: L.M. Orchard
 *
 * Dependencies:
 *  - A SHA-1 HMAC implementation (e.g., from pajhome.org.uk/crypt/md5/sha1.js)
 */

// Consideration: Modern browsers typically support PUT/DELETE; older ones (like some Safari versions) might need workarounds.

var AWSClientUtil = {

  // Configuration settings for the client.

  // Should a unique timestamp be added to GET/HEAD requests to prevent browser caching?
  cacheBusterEnabled: false,

  // Default access control list (ACL) for new objects.
  defaultAccessPolicy: 'public-read',

  // Default MIME type for objects when not explicitly specified.
  defaultMediaType: 'text/html; charset=UTF-8',

  /**
   * IMPORTANT: Client credentials should be handled securely. Avoid hardcoding `accessKeyId`
   * and `secretAccessKey` directly in client-side code. It's recommended to fetch these
   * dynamically from secure sources or user input.
   *
   * Example:
   *   AWSClientUtil.accessKeyId = document.getElementById('aws_key_input').value;
   *   AWSClientUtil.secretAccessKey = document.getElementById('aws_secret_input').value;
   */
  serviceEndpoint: 'https://s3.amazonaws.com', // Use HTTPS for enhanced security.
  accessKeyId: '',
  secretAccessKey: '',

  // Set to true for detailed console output and debugging variables (e.g., `window.lastRequest`, `window.lastResponseObject`).
  verboseLogging: false,

  /**
   * Initializes the client with credentials.
   * @param {string} keyId - The AWS Access Key ID.
   * @param {string} secretKey - The AWS Secret Access Key.
   */
  initialize: function(keyId, secretKey) {
    this.accessKeyId = keyId;
    this.secretAccessKey = secretKey;
    if (this.verboseLogging) {
      console.log("AWSClientUtil initialized with provided credentials.");
    }
  },

  /**
   * Retrieves the content of an object from a specified container.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {string} objectKey - The key (path) of the object.
   * @param {function(XMLHttpRequest, string)} successCallback - Callback for successful retrieval.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  retrieveObject: function(containerName, objectKey, successCallback, errorCallback) {
    return this.performRequest({
      method: 'GET',
      resourcePath: '/' + containerName + '/' + objectKey,
      onSuccess: function(xhr, responseData) {
        if (successCallback) return successCallback(xhr, xhr.responseText);
      },
      onError: function(xhr, errorObj) {
        if (errorCallback) return errorCallback(xhr, errorObj);
        if (successCallback) return successCallback(xhr, xhr.responseText); // Fallback to success cb for error too
      }
    });
  },

  /**
   * Fetches metadata for an object without retrieving its content.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {string} objectKey - The key (path) of the object.
   * @param {function(XMLHttpRequest, string)} successCallback - Callback for successful metadata retrieval.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  probeObjectMetadata: function(containerName, objectKey, successCallback, errorCallback) {
    return this.performRequest({
      method: 'HEAD',
      resourcePath: '/' + containerName + '/' + objectKey,
      onSuccess: function(xhr, responseData) {
        if (successCallback) return successCallback(xhr, xhr.responseText);
      },
      onError: function(xhr, errorObj) {
        if (errorCallback) return errorCallback(xhr, errorObj);
        if (successCallback) return successCallback(xhr, xhr.responseText); // Fallback
      }
    });
  },

  /**
   * Stores (uploads) content to an object in a container.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {string} objectKey - The key (path) of the object.
   * @param {string|Blob|File} objectContent - The data to upload.
   * @param {object} [options] - Optional parameters like `contentType`, `acl`, `metadata`.
   * @param {function(XMLHttpRequest)} [successCallback] - Callback for successful upload.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  storeObject: function(containerName, objectKey, objectContent, options, successCallback, errorCallback) {

    var currentIdx = 3;
    var uploadParams = {};

    // Handle optional `options` argument.
    if (typeof arguments[currentIdx] === 'object' && arguments[currentIdx] !== null) {
      uploadParams = arguments[currentIdx++];
    }

    // Extract callbacks, adjusting for the optional 'options'.
    var finalSuccessCb = arguments[currentIdx++];
    var finalErrorCb = arguments[currentIdx++];

    // Ensure content type and ACL are set, falling back to defaults.
    if (!uploadParams.contentType) {
      uploadParams.contentType = this.defaultMediaType;
    }
    if (!uploadParams.acl) {
      uploadParams.acl = this.defaultAccessPolicy;
    }

    return this.performRequest({
      method: 'PUT',
      resourcePath: '/' + containerName + '/' + objectKey,
      payload: objectContent,
      requestContentType: uploadParams.contentType,
      customMetadata: uploadParams.metadata,
      accessControlList: uploadParams.acl,
      onSuccess: function(xhr) {
        if (finalSuccessCb) return finalSuccessCb(xhr);
      },
      onError: function(xhr, errorObj) {
        if (finalErrorCb) return finalErrorCb(xhr, errorObj);
        if (finalSuccessCb) return finalSuccessCb(xhr, errorObj); // Fallback
      }
    });
  },

  /**
   * Lists all containers (buckets) belonging to the authenticated account.
   * @param {function(XMLHttpRequest, object)} successCallback - Callback for successful listing.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  enumerateContainers: function(successCallback, errorCallback) {
    return this.performRequest({
      method: 'GET',
      resourcePath: '/',
      forceArrayPaths: ['ListAllMyBucketsResult.Buckets.Bucket'],
      onSuccess: successCallback,
      onError: errorCallback
    });
  },

  /**
   * Creates a new container (bucket) for the account.
   * @param {string} containerName - The name of the bucket to create.
   * @param {function(XMLHttpRequest)} successCallback - Callback for successful creation.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  provisionContainer: function(containerName, successCallback, errorCallback) {
    return this.performRequest({
      method: 'PUT',
      resourcePath: '/' + containerName,
      onSuccess: successCallback,
      onError: errorCallback
    });
  },

  /**
   * Deletes an empty container (bucket).
   * @param {string} containerName - The name of the bucket to delete.
   * @param {function(XMLHttpRequest)} successCallback - Callback for successful deletion.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  deprovisionContainer: function(containerName, successCallback, errorCallback) {
    return this.performRequest({
      method: 'DELETE',
      resourcePath: '/' + containerName,
      onSuccess: successCallback,
      onError: errorCallback
    });
  },

  /**
   * Lists objects within a specified container.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {object} queryParameters - Parameters for listing (e.g., `prefix`, `marker`, `max-keys`).
   * @param {function(XMLHttpRequest, object)} successCallback - Callback for successful listing.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  listContainerContents: function(containerName, queryParameters, successCallback, errorCallback) {
    return this.performRequest({
      method: 'GET',
      resourcePath: '/' + containerName,
      forceArrayPaths: ['ListBucketResult.Contents'],
      requestParams: queryParameters,
      onSuccess: successCallback,
      onError: errorCallback
    });
  },

  /**
   * Deletes a single object from a container.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {string} objectKey - The key (path) of the object to delete.
   * @param {function(XMLHttpRequest)} successCallback - Callback for successful deletion.
   * @param {function(XMLHttpRequest, object)} [errorCallback] - Optional callback for errors.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  removeObject: function(containerName, objectKey, successCallback, errorCallback) {
    return this.performRequest({
      method: 'DELETE',
      resourcePath: '/' + containerName + '/' + objectKey,
      onSuccess: successCallback,
      onError: errorCallback
    });
  },

  /**
   * Deletes a list of objects from a container sequentially.
   * @param {string} containerName - The name of the S3 bucket.
   * @param {Array<string>} objectKeyList - An array of object keys to delete.
   * @param {function(string)} [itemRemovedCallback] - Optional callback for each deleted object.
   * @param {function()} [allRemovedCallback] - Optional callback when all objects in the list are processed.
   */
  batchRemoveObjects: function(containerName, objectKeyList, itemRemovedCallback, allRemovedCallback) {
    var selfRef = this; // Capture 'this' for the recursive call context.

    // If the list is empty or invalid, trigger the final callback if provided.
    if (!Array.isArray(objectKeyList) || objectKeyList.length === 0) {
      if (allRemovedCallback) {
        allRemovedCallback();
      }
      return;
    }

    var currentKey = objectKeyList.shift(); // Get the next key and remove it from the list.

    this.removeObject(containerName, currentKey, function() {
      if (itemRemovedCallback) {
        itemRemovedCallback(currentKey);
      }
      // Recursively call itself to process the next item in the list.
      selfRef.batchRemoveObjects(containerName, objectKeyList, itemRemovedCallback, allRemovedCallback);
    }, function(xhr, errorObj) {
      // Handle error for a single deletion, but continue with the batch if desired.
      if (selfRef.verboseLogging) {
        console.error("Error deleting object '" + currentKey + "':", xhr.status, errorObj);
      }
      selfRef.batchRemoveObjects(containerName, objectKeyList, itemRemovedCallback, allRemovedCallback); // Continue anyway
    });
  },

  /**
   * Core HTTP client for making authenticated S3 requests.
   * @param {object} requestOptions - Configuration object for the request.
   *   @param {string} method - HTTP method (e.g., 'GET', 'PUT', 'DELETE').
   *   @param {string} resourcePath - The S3 resource path (e.g., '/bucket/key').
   *   @param {object} [requestParams] - Query string parameters.
   *   @param {string|Blob|File} [payload] - Request body content for PUT/POST.
   *   @param {string} [requestContentType] - Content-Type header.
   *   @param {object} [customMetadata] - Custom x-amz-meta-* headers.
   *   @param {string} [accessControlList] - x-amz-acl header.
   *   @param {Array<string>} [forceArrayPaths] - XML paths to always parse as arrays.
   *   @param {boolean} [anonymousRequest] - True to skip authentication.
   *   @param {function(XMLHttpRequest, object)} onSuccess - Success callback.
   *   @param {function(XMLHttpRequest, object)} onError - Error callback.
   * @returns {XMLHttpRequest} The XMLHttpRequest object.
   */
  performRequest: function(requestOptions) {
    var self = this;

    // Validate credentials if not an anonymous request.
    if (!requestOptions.anonymousRequest && (!self.accessKeyId || !self.secretAccessKey)) {
      console.error("AWSClientUtil: Missing accessKeyId or secretAccessKey for authenticated request.");
      if (requestOptions.onError) {
        requestOptions.onError(null, {
          Code: "MissingCredentials",
          Message: "Authentication credentials are required but not set."
        });
      }
      return null;
    }

    // Add a cache-busting parameter for GET/HEAD requests if enabled.
    if (this.cacheBusterEnabled && (requestOptions.method === "GET" || requestOptions.method === "HEAD")) {
      requestOptions.requestParams = requestOptions.requestParams || {};
      requestOptions.requestParams["_cb"] = new Date().getTime();
    }

    var queryString = requestOptions.requestParams ? serializeQueryParams(requestOptions.requestParams) : '';
    var fullUrl = this.serviceEndpoint + requestOptions.resourcePath + (queryString ? '?' + queryString : '');
    var requestHeaders = {};

    // Determine Content-Type.
    var effectiveContentType = requestOptions.requestContentType || '';
    if (requestOptions.method === 'PUT' && !effectiveContentType) {
      effectiveContentType = 'application/octet-stream'; // Default for PUT if not specified
    }
    if (effectiveContentType) {
      requestHeaders['Content-Type'] = effectiveContentType;
    }

    var currentHttpTimestamp = this.formatHttpTimestamp();
    var contentMd5Hash = ''; // S3 often doesn't require Content-MD5 unless specific scenarios

    // Handle x-amz-acl header.
    var aclHeaderForSignature = '';
    if (requestOptions.accessControlList) {
      requestHeaders['x-amz-acl'] = requestOptions.accessControlList;
      aclHeaderForSignature = "x-amz-acl:" + requestOptions.accessControlList + "\n";
    }

    // x-amz-date header is crucial for signature v2 and v4 (though v4 is more complex)
    requestHeaders['x-amz-date'] = currentHttpTimestamp;
    var dateHeaderForSignature = "x-amz-date:" + currentHttpTimestamp + "\n";

    // Handle custom metadata headers.
    var metaHeadersForSignature = '';
    if (requestOptions.customMetadata) {
      for (var metaKey in requestOptions.customMetadata) {
        if (requestOptions.customMetadata.hasOwnProperty(metaKey)) {
          var headerName = 'x-amz-meta-' + metaKey.toLowerCase(); // S3 meta keys are lowercase
          requestHeaders[headerName] = requestOptions.customMetadata[metaKey];
          metaHeadersForSignature += headerName + ":" + requestOptions.customMetadata[metaKey] + "\n";
        }
      }
    }

    // Generate signature if credentials are available and not anonymous.
    if (!requestOptions.anonymousRequest && self.accessKeyId && self.secretAccessKey) {
      var signatureComponents = [
        requestOptions.method,
        contentMd5Hash, // Empty for now, as per original code's comment
        effectiveContentType,
        '', // Date header (empty as x-amz-date is used)
        aclHeaderForSignature,
        dateHeaderForSignature,
        metaHeadersForSignature,
        requestOptions.resourcePath // Canonicalized resource
      ];
      var stringToSign = signatureComponents.join('');

      if (self.verboseLogging) {
        console.log("String to sign:", stringToSign.replace(/\n/g, '\\n'));
      }

      var computedSignature = this.generateSignature(stringToSign, self.secretAccessKey);
      requestHeaders['Authorization'] = "AWS " + self.accessKeyId + ":" + computedSignature;
    }

    var httpRequest = obtainXmlHttpRequest();
    if (!httpRequest) {
      console.error("AWSClientUtil: Failed to obtain XMLHttpRequest object.");
      if (requestOptions.onError) {
        requestOptions.onError(null, {
          Code: "XMLHttpRequestFailed",
          Message: "Could not create an XMLHttpRequest object."
        });
      }
      return null;
    }

    httpRequest.open(requestOptions.method, fullUrl, true);
    for (var headerKey in requestHeaders) {
      if (requestHeaders.hasOwnProperty(headerKey)) {
        httpRequest.setRequestHeader(headerKey, requestHeaders[headerKey]);
      }
    }

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) { // Request complete
        var parsedResponseObject = null;
        if (httpRequest.responseXML && requestOptions.parseXmlResponse !== false) {
          try {
            parsedResponseObject = self.parseXmlResponse(httpRequest.responseXML, requestOptions.forceArrayPaths);
          } catch (e) {
            console.warn("AWSClientUtil: Error parsing XML response:", e);
          }
        }

        if (self.verboseLogging) {
          window.lastRequest = httpRequest;
          window.lastResponseObject = parsedResponseObject;
          console.log("Request finished. Status:", httpRequest.status, "Response:", parsedResponseObject || httpRequest.responseText);
        }

        // Check for HTTP error status codes or explicit S3 error objects.
        var isError = (httpRequest.status >= 400 || (parsedResponseObject && parsedResponseObject.Error));
        if (isError && requestOptions.onError) {
          requestOptions.onError(httpRequest, parsedResponseObject);
        } else if (requestOptions.onSuccess) {
          requestOptions.onSuccess(httpRequest, parsedResponseObject);
        } else {
          // If no specific handlers, log unhandled status.
          if (self.verboseLogging) {
            console.warn("AWSClientUtil: No handler for request status:", httpRequest.status);
          }
        }
      }
    };

    httpRequest.send(requestOptions.payload || null);
    return httpRequest;
  },

  /**
   * Converts a simple XML DOM structure into a JavaScript object.
   * Handles nested elements and aggregates multiple elements of the same name into arrays.
   * @param {Element} xmlNode - The XML DOM node to process.
   * @param {Array<string>} [arrayPaths] - A list of dot-separated paths (e.g., "Parent.Child.Grandchild")
   *                                      that should always be treated as arrays, even if only one item exists.
   * @param {string} [currentPath] - Internal parameter for tracking the current path during recursion.
   * @returns {object|string} The resulting JavaScript object or string (for text nodes).
   */
  parseXmlResponse: function(xmlNode, arrayPaths, currentPath) {
    var resultObject = {};
    var textContent = '';
    var hasChildElements = false;

    // Iterate through child nodes.
    for (var i = 0, childNode; childNode = xmlNode.childNodes[i]; i++) {
      if (childNode.nodeType === 3 || childNode.nodeType === 4) { // Text or CDATA node
        textContent += childNode.nodeValue.trim();
      } else if (childNode.nodeType === 1) { // Element node
        hasChildElements = true;
        var nodeName = childNode.nodeName;
        var fullChildPath = currentPath ? currentPath + '.' + nodeName : nodeName;

        // Recursively parse the child node.
        var childValue = this.parseXmlResponse(childNode, arrayPaths, fullChildPath);

        // Check if this path needs to be forced into an array.
        var forceToArray = false;
        if (arrayPaths && arrayPaths.length > 0) {
          for (var j = 0; j < arrayPaths.length; j++) {
            if (arrayPaths[j] === fullChildPath) {
              forceToArray = true;
              break;
            }
          }
        }

        if (!resultObject[nodeName]) {
          // First occurrence of this node name.
          resultObject[nodeName] = forceToArray ? [childValue] : childValue;
        } else if (Array.isArray(resultObject[nodeName])) {
          // Already an array, append the new value.
          resultObject[nodeName].push(childValue);
        } else {
          // Convert existing single value to an array and append.
          resultObject[nodeName] = [resultObject[nodeName], childValue];
        }
      }
    }

    // If child elements were found, return the structured object.
    // Otherwise, return the aggregated text content.
    return hasChildElements ? resultObject : textContent;
  },

  /**
   * Computes an HMAC-SHA1 signature.
   * This relies on a globally available `b64_hmac_sha1` function
   * (e.g., from sha1.js).
   * @param {string} dataString - The string to sign.
   * @param {string} secretKey - The secret access key.
   * @returns {string} The Base64-encoded HMAC-SHA1 signature, with a trailing '='.
   */
  generateSignature: function(dataString, secretKey) {
    if (typeof b64_hmac_sha1 === 'function') {
      return b64_hmac_sha1(secretKey, dataString) + '=';
    } else {
      console.error("AWSClientUtil: b64_hmac_sha1 function not found. Please include sha1.js.");
      throw new Error("Missing HMAC-SHA1 library.");
    }
  },

  /**
   * Formats a Date object into an HTTP-compliant timestamp string (RFC 1123 / RFC 822).
   * Example: "Tue, 29 Feb 2024 12:30:00 +0000"
   * @param {Date} [dateObj] - The Date object to format; defaults to current UTC time.
   * @returns {string} The formatted date string.
   */
  formatHttpTimestamp: function(dateObj) {
    var d = dateObj || new Date();

    // Helper to pad numbers with leading zeros.
    function padNumber(num, length) {
      return num.toString().padStart(length, '0');
    }

    var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Use UTC methods for consistency with S3 requirements.
    var dayOfWeek = weekDays[d.getUTCDay()];
    var dayOfMonth = padNumber(d.getUTCDate(), 2);
    var month = monthNames[d.getUTCMonth()];
    var year = d.getUTCFullYear();
    var hours = padNumber(d.getUTCHours(), 2);
    var minutes = padNumber(d.getUTCMinutes(), 2);
    var seconds = padNumber(d.getUTCSeconds(), 2);

    // RFC 1123 format: "Weekday, DD Mon YYYY HH:MM:SS GMT"
    // S3 sometimes expects "x-amz-date: Wed, 01 Jan 2020 00:00:00 GMT"
    // For Authorization header, it's often the raw string without GMT for the string to sign, but the header includes it.
    // Let's stick to the original's behavior of formatting a specific way, which might not be strictly RFC1123 but works for S3.
    // The original's `gmtTZ` function is a bit unusual, calculating offset and formatting it.
    // For S3 x-amz-date, it's usually just GMT. Let's simplify to GMT.

    return dayOfWeek + ", " + dayOfMonth + " " + month + " " + year + " " +
           hours + ":" + minutes + ":" + seconds + " GMT";
  }
};

// Global helper functions, if not already defined elsewhere.

/**
 * Converts a JavaScript object into a URL-encoded query string.
 * @param {object} params - The object containing key-value pairs.
 * @returns {string} The URL-encoded query string.
 */
function serializeQueryParams(params) {
  var parts = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return parts.join('&');
}

/**
 * Obtains an XMLHttpRequest object compatible with various browsers.
 * Caches the constructor for subsequent calls.
 * @returns {XMLHttpRequest|null} The XMLHttpRequest object, or null if not supported.
 */
function obtainXmlHttpRequest() {
  // Use a local static variable to cache the factory function.
  if (!obtainXmlHttpRequest.cachedFactory) {
    var potentialFactories = [
      function() {
        return new XMLHttpRequest();
      },
      function() {
        return new ActiveXObject('Msxml2.XMLHTTP');
      },
      function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      },
      function() {
        return new ActiveXObject('Msxml2.XMLHTTP.4.0');
      }
    ];

    for (var i = 0; i < potentialFactories.length; i++) {
      try {
        var factory = potentialFactories[i];
        if (factory()) { // Test if it can create an instance
          obtainXmlHttpRequest.cachedFactory = factory;
          break;
        }
      } catch (e) {
        // Continue to the next factory if one fails.
      }
    }

    if (!obtainXmlHttpRequest.cachedFactory) {
      console.warn("obtainXmlHttpRequest: No compatible XMLHttpRequest factory found.");
      obtainXmlHttpRequest.cachedFactory = function() {
        return null;
      }; // Cache a null-returning function
    }
  }
  return obtainXmlHttpRequest.cachedFactory();
}