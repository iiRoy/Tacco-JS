/*
 *  A specialized client for interacting with Couchbase view endpoints in Node.js.
 *  Loosely inspired by the `nano` library's request handling patterns.
 *
 *  (C) 2023 Advanced Data Solutions Inc.
 *  All rights reserved under the Apache License, Version 2.0.
 *  You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const httpRequestClient = require('request');
const queryParamEncoder = require('querystring');
const errorProcessor = require('errs');
const urlPathUtil = require('url');

module.exports = function createViewManager(initialConfiguration) {
  let activeConfiguration = initialConfiguration;

  if (typeof activeConfiguration === "string") {
    if (activeConfiguration.startsWith('http://') || activeConfiguration.startsWith('https://')) {
      activeConfiguration = { serviceUrl: activeConfiguration };
    } else {
      try {
        activeConfiguration = require(activeConfiguration);
      } catch (fileError) {
        fileError.message = `Failed to load configuration from file: ${activeConfiguration || 'undefined'}.`;
        throw errorProcessor.init(fileError, "CONFIGURATION_FILE_ERROR");
      }
    }
  } else if (!activeConfiguration || typeof activeConfiguration !== 'object') {
    activeConfiguration = {}; // Ensure it's an object for defaults
  }

  const defaultBucketName = activeConfiguration.dataBucket || "default";
  const serviceEndpoint = activeConfiguration.serviceUrl || "http://127.0.0.1:8092";

  // Helper to check if an object has no own enumerable properties
  function checkEmptyObject(candidateObject) {
    if (typeof candidateObject !== 'object' || candidateObject === null) {
      return true;
    }
    return Object.keys(candidateObject).length === 0;
  }

  // Core function to dispatch HTTP requests
  function dispatchHttpRequest(operationOptions, responseHandler) {
    // Re-evaluate options based on type if first argument is a function or string
    if (typeof operationOptions === "function") {
      responseHandler = operationOptions;
      operationOptions = { pathSegment: "" };
    } else if (typeof operationOptions === 'string') {
      operationOptions = { pathSegment: operationOptions };
    }

    // Default to root path if no options are provided or invalid
    if (!operationOptions || typeof operationOptions !== 'object') {
      operationOptions = { pathSegment: "" };
      responseHandler = null; // No explicit handler means streaming
    }

    const requestQueryParams = operationOptions.queryParameters || {};
    const requestHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const httpRequestSettings = {
      method: operationOptions.httpMethod || "GET",
      headers: requestHeaders,
      uri: serviceEndpoint,
      timeout: operationOptions.timeoutMs || 15000 // Default timeout of 15 seconds
    };

    // Merge custom headers
    if (operationOptions.additionalHeaders) {
      Object.assign(httpRequestSettings.headers, operationOptions.additionalHeaders);
    }

    // Construct the URI based on pathSegment, documentId, or attachmentId
    if (operationOptions.pathSegment) {
      httpRequestSettings.uri += "/" + operationOptions.pathSegment;
    } else if (operationOptions.documentId) {
      // Handle design documents separately to avoid encoding leading underscore
      if (!operationOptions.documentId.startsWith('_design/')) {
        try {
          httpRequestSettings.uri += "/" + encodeURIComponent(operationOptions.documentId);
        } catch (encodingErr) {
          return errorProcessor.handle(errorProcessor.merge(encodingErr, {
            message: `Could not URI encode document ID: ${operationOptions.documentId}.`,
            component: "viewClient",
            errorCode: "DOC_ID_ENCODING_FAILURE"
          }), responseHandler);
        }
      } else {
        httpRequestSettings.uri += "/" + operationOptions.documentId;
      }

      if (operationOptions.attachmentId) {
        httpRequestSettings.uri += "/" + operationOptions.attachmentId;
      }
    }

    // Adjust encoding and content type if specified
    if (operationOptions.responseEncoding !== undefined && responseHandler) {
      httpRequestSettings.encoding = operationOptions.responseEncoding;
      delete httpRequestSettings.headers["Content-Type"];
      delete httpRequestSettings.headers.Accept;
    }

    if (operationOptions.specificContentType) {
      httpRequestSettings.headers["Content-Type"] = operationOptions.specificContentType;
      delete httpRequestSettings.headers.Accept; // Override Accept header
    }

    // Process and encode query parameters
    if (!checkEmptyObject(requestQueryParams)) {
      try {
        ['startkey', 'endkey', 'key', 'keys'].forEach(paramKey => {
          if (paramKey in requestQueryParams) {
            try {
              requestQueryParams[paramKey] = JSON.stringify(requestQueryParams[paramKey]);
            } catch (jsonErr) {
              return errorProcessor.handle(errorProcessor.merge(jsonErr, {
                message: `Failed to JSON.stringify query parameter '${paramKey}': ${requestQueryParams[paramKey]}.`,
                component: "viewClient",
                errorCode: "QUERY_PARAM_JSON_ERROR"
              }), responseHandler);
            }
          }
        });
      } catch (paramIterError) {
        return errorProcessor.handle(errorProcessor.merge(paramIterError, {
          message: "Query parameters object is malformed.",
          component: "viewClient",
          errorCode: "MALFORMED_QUERY_PARAMS"
        }), responseHandler);
      }

      try {
        httpRequestSettings.uri += "?" + queryParamEncoder.stringify(requestQueryParams);
      } catch (uriEncodingErr) {
        return errorProcessor.handle(errorProcessor.merge(uriEncodingErr, {
          message: `Failed to encode query string from: ${JSON.stringify(requestQueryParams)}.`,
          component: "viewClient",
          errorCode: "QUERY_STRING_ENCODING_FAILURE"
        }), responseHandler);
      }
    }

    // Handle request body
    if (operationOptions.requestBody !== undefined && operationOptions.requestBody !== null) {
      if (Buffer.isBuffer(operationOptions.requestBody)) {
        httpRequestSettings.body = operationOptions.requestBody; // Raw buffer
      } else {
        try {
          httpRequestSettings.body = JSON.stringify(operationOptions.requestBody, (key, value) => {
            // Special handling: functions are serialized to their string representation
            return typeof value === 'function' ? value.toString() : value;
          });
        } catch (bodyJsonErr) {
          return errorProcessor.handle(errorProcessor.merge(bodyJsonErr, {
            message: "Request body could not be JSON serialized.",
            component: "viewClient",
            errorCode: "BODY_JSON_SERIALIZATION_FAILURE"
          }), responseHandler);
        }
      }
    }

    // Handle form data
    if (operationOptions.formData) {
      httpRequestSettings.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
      httpRequestSettings.body = queryParamEncoder.stringify(operationOptions.formData).toString('utf8');
    }

    // If no callback, return a stream
    if (!responseHandler) {
      try {
        return httpRequestClient(httpRequestSettings);
      } catch (streamInitErr) {
        return errorProcessor.handle(errorProcessor.merge(streamInitErr, {
          message: "Error initiating streaming request.",
          component: "httpClient",
          errorCode: "STREAM_INITIALIZATION_ERROR"
        }), responseHandler);
      }
    }

    // Standard callback-based request
    let currentResponseStatusCode;
    let parsedServerResponse;
    let effectiveResponseHeaders;

    try {
      const responseStream = httpRequestClient(httpRequestSettings, (reqErr, httpResponse, rawBody) => {
        effectiveResponseHeaders = (httpResponse && httpResponse.headers) || {};
        effectiveResponseHeaders['x-status-code'] = currentResponseStatusCode = (httpResponse && httpResponse.statusCode) || 500;
        effectiveResponseHeaders['x-request-uri'] = httpRequestSettings.uri;

        if (reqErr) {
          errorProcessor.handle(errorProcessor.merge(reqErr, {
            message: "Network or connection error during HTTP request.",
            component: "network",
            errorCode: "HTTP_CONNECTION_ERROR"
          }), responseHandler);
          return; // Early exit on connection error
        }

        // Clean up some standard headers before passing them
        delete effectiveResponseHeaders.server;
        delete effectiveResponseHeaders['content-length'];

        try {
          parsedServerResponse = JSON.parse(rawBody);
        } catch (parseErr) {
          parsedServerResponse = rawBody; // If JSON parsing fails, use raw body
        }

        if (currentResponseStatusCode >= 200 && currentResponseStatusCode < 400) {
          responseHandler(null, parsedServerResponse, effectiveResponseHeaders);
        } else {
          // Proxy server-side errors
          if (typeof parsedServerResponse !== 'object' || parsedServerResponse === null) {
            parsedServerResponse = {};
          }
          const errorMessage = parsedServerResponse.reason || parsedServerResponse.error || `Server responded with status ${currentResponseStatusCode}.`;
          errorProcessor.handle(errorProcessor.merge(errorProcessor.create(parsedServerResponse), {
            component: "couchbase",
            statusCode: currentResponseStatusCode,
            requestDetails: httpRequestSettings,
            responseHeaders: effectiveResponseHeaders,
            errorCode: "SERVER_ERROR_RESPONSE",
            message: errorMessage
          }), responseHandler);
        }
      });
      return responseStream;
    } catch (requestCreationErr) {
      // This catch block handles errors thrown *during the setup* of the request, not async errors
      return errorProcessor.merge(requestCreationErr, {
        message: "Error creating HTTP request object.",
        component: "httpClient",
        errorCode: "REQUEST_OBJECT_CREATION_FAILURE"
      });
    }
  }

  // --- API Functions for View Management ---

  function retrieveDocumentViews(designDocumentName, viewName, queryParameters, completionHandler) {
    if (typeof queryParameters === "function") {
      completionHandler = queryParameters;
      queryParameters = {};
    }
    if (!designDocumentName || !viewName) {
      return completionHandler(errorProcessor.create({ message: "Design document name and view name are required.", errorCode: "INVALID_VIEW_PARAMS" }));
    }

    const fullViewPath = `${defaultBucketName}/_design/${designDocumentName}/_view/${viewName}`;
    let requestMethod = "GET";
    let requestPayload = null;

    if (queryParameters && queryParameters.keys) {
      requestMethod = "POST";
      requestPayload = { keys: queryParameters.keys };
      const modifiedQueryParams = { ...queryParameters }; // Clone to avoid modifying original
      delete modifiedQueryParams.keys;
      queryParameters = modifiedQueryParams;
    }

    return dispatchHttpRequest({
      pathSegment: fullViewPath,
      httpMethod: requestMethod,
      queryParameters: queryParameters,
      requestBody: requestPayload
    }, completionHandler);
  }

  function querySpatialViews(designDocumentName, spatialViewName, queryParameters, completionHandler) {
    if (typeof queryParameters === "function") {
      completionHandler = queryParameters;
      queryParameters = {};
    }
    if (!designDocumentName || !spatialViewName) {
      return completionHandler(errorProcessor.create({ message: "Design document name and spatial view name are required.", errorCode: "INVALID_SPATIAL_PARAMS" }));
    }

    const fullSpatialPath = `${defaultBucketName}/_design/${designDocumentName}/_spatial/${spatialViewName}`;
    let requestMethod = "GET";
    let requestPayload = null;

    if (queryParameters && queryParameters.keys) {
      requestMethod = "POST";
      requestPayload = { keys: queryParameters.keys };
      const modifiedQueryParams = { ...queryParameters };
      delete modifiedQueryParams.keys;
      queryParameters = modifiedQueryParams;
    }

    return dispatchHttpRequest({
      pathSegment: fullSpatialPath,
      httpMethod: requestMethod,
      queryParameters: queryParameters,
      requestBody: requestPayload
    }, completionHandler);
  }

  function defineDesignDocument(designDocumentName, viewsObject, completionHandler) {
    if (!designDocumentName || !viewsObject) {
      return completionHandler(errorProcessor.create({ message: "Design document name and views object are required.", errorCode: "INVALID_DESIGN_DEFINITION" }));
    }
    const designPath = `${defaultBucketName}/_design/${designDocumentName}`;
    return dispatchHttpRequest({
      pathSegment: designPath,
      httpMethod: "PUT",
      requestBody: { views: viewsObject }
    }, completionHandler);
  }

  function configureSpatialDesign(designDocumentName, geoViewsObject, completionHandler) {
    if (!designDocumentName || !geoViewsObject) {
      return completionHandler(errorProcessor.create({ message: "Design document name and geo views object are required.", errorCode: "INVALID_SPATIAL_DEFINITION" }));
    }
    const designPath = `${defaultBucketName}/_design/${designDocumentName}`;
    return dispatchHttpRequest({
      pathSegment: designPath,
      httpMethod: "PUT",
      requestBody: { views: {}, spatial: geoViewsObject } // Merge with an empty views object to ensure structure
    }, completionHandler);
  }

  function fetchDesignDocument(designDocumentName, completionHandler) {
    if (!designDocumentName) {
      return completionHandler(errorProcessor.create({ message: "Design document name is required.", errorCode: "MISSING_DESIGN_NAME" }));
    }
    const designPath = `${defaultBucketName}/_design/${designDocumentName}`;
    return dispatchHttpRequest({
      pathSegment: designPath,
      httpMethod: "GET"
    }, completionHandler);
  }

  function removeDesignDocument(designDocumentName, completionHandler) {
    if (!designDocumentName) {
      return completionHandler(errorProcessor.create({ message: "Design document name is required.", errorCode: "MISSING_DESIGN_NAME_FOR_DELETE" }));
    }
    const designPath = `${defaultBucketName}/_design/${designDocumentName}`;
    return dispatchHttpRequest({
      pathSegment: designPath,
      httpMethod: "DELETE"
    }, completionHandler);
  }

  return {
    queryView: retrieveDocumentViews,
    querySpatial: querySpatialViews,
    setupSpatialDesign: configureSpatialDesign,
    setupDesign: defineDesignDocument,
    getDesign: fetchDesignDocument,
    deleteDesign: removeDesignDocument
  };
};