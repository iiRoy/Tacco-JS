/**
 * Minimalist data store interaction module for Node.js
 * Leverages an underlying HTTP client for communication.
 *
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var httpRequest = require('request')
  , paramSerializer = require('querystring')
  , errorUtil = require('errs')
  , uriHelper = require('url');

module.exports = dataStoreClient = function (configSettings) {
  // Check if configuration is a string type
  if (typeof configSettings === "string") {
    // If it's a URL-like string
    if (/^https?:/.test(configSettings)) {
      configSettings = { baseAddress: configSettings }; // Convert to object
    } else {
      // Assume it's a file path
      try {
        configSettings = require(configSettings); // Load config from file
      } catch (loadingError) {
        // Handle file loading failure
        loadingError.message = "Could not load configuration file " +
          (configSettings ? configSettings.toString() : '');
        throw errorUtil.init(loadingError, "invalidConfigFile");
      }
    }
  }

  // Initialize internal configuration parameters
  var _dataStoreName = configSettings && configSettings.collection || "default";
  var _baseEndpoint = configSettings && configSettings.baseAddress || "http://127.0.0.1:8092";

  // Helper function to determine if an object has no own properties
  function isObjectEmpty(targetObject) {
    for (var keyName in targetObject) {
      if (targetObject.hasOwnProperty(keyName)) return false;
    }
    return true;
  }

  // Core function for making HTTP requests to the data store
  function performOperation(operationParams, completionCallback) {
    // If only one argument is provided and it's a function, assume it's the callback
    if (typeof operationParams === "function") {
      completionCallback = operationParams;
      operationParams = { resourcePath: "" }; // Default to root path
    }

    // If options is a string, treat it as a simple GET request to that path
    if (typeof operationParams === 'string') {
      operationParams = { resourcePath: operationParams };
    }

    // If no options are provided, default to root path and no callback for streaming
    if (!operationParams) {
      operationParams = { resourcePath: "" };
      completionCallback = null;
    }

    var requestParameters = operationParams.queryArguments
      , requestHeaders = { "content-type": "application/json"
                         , "accept"      : "application/json"
                       }
      , outgoingRequest = { method  : (operationParams.httpMethod || "GET")
                        , headers : requestHeaders
                        , uri     : configSettings.baseAddress }
      , responseStatusCode
      , parsedResponse
      , responseHeaderInfo;

    // Merge custom headers into the request
    if (operationParams.customHeaders) {
      for (var headerKey in operationParams.customHeaders) {
        outgoingRequest.headers[headerKey] = operationParams.customHeaders[headerKey];
      }
    }

    // Append resource path or document ID to the URI
    if (operationParams.resourcePath) {
      outgoingRequest.uri += "/" + operationParams.resourcePath;
    } else if (operationParams.documentId) {
      // For non-design documents
      if (!/^_design/.test(operationParams.documentId)) {
        try {
          outgoingRequest.uri += "/" + encodeURIComponent(operationParams.documentId);
        } catch (encodingError) {
          // Handle URI encoding errors
          return errorUtil.process(errorUtil.combine(encodingError,
            { "message": "Failed to encode document ID: " + (operationParams && operationParams.documentId)
            , "scope"  : "client"
            , "code"   : "uri_encode_failure"
            }), completionCallback);
        }
      } else {
        // For design documents, append directly
        outgoingRequest.uri += "/" + operationParams.documentId;
      }

      // Append attachment ID if present
      if (operationParams.attachmentId) {
        outgoingRequest.uri += "/" + operationParams.attachmentId;
      }
    }

    // Handle specific encoding requirements for raw data
    if (operationParams.dataEncoding !== undefined && completionCallback) {
      outgoingRequest.encoding = operationParams.dataEncoding;
      delete outgoingRequest.headers["content-type"];
      delete outgoingRequest.headers.accept;
    }

    // Override content type if specified
    if (operationParams.contentTypeOverride) {
      outgoingRequest.headers["content-type"] = operationParams.contentTypeOverride;
      delete outgoingRequest.headers.accept; // Remove default accept header
    }

    // Process and encode query parameters
    if (!isObjectEmpty(requestParameters)) {
      try {
        ['startkey', 'endkey', 'key', 'keys'].forEach(function (paramKey) {
          if (paramKey in requestParameters) {
            try {
              requestParameters[paramKey] = JSON.stringify(requestParameters[paramKey]);
            } catch (serializationError) {
              return errorUtil.process(errorUtil.combine(serializationError,
                { "message": "Invalid parameter for serialization: " + paramKey + " = " + requestParameters[paramKey]
                , "scope"  : "client"
                , "code"   : "param_serialization_error"
                }), completionCallback);
            }
          }
        });
      } catch (paramsTypeError) {
        return errorUtil.process(errorUtil.combine(paramsTypeError,
          { "message": "Query parameters must be an object"
          , "scope"   : "client"
          , "code"    : "invalid_query_params_type"
          }), completionCallback);
      }

      try {
        outgoingRequest.uri += "?" + paramSerializer.stringify(requestParameters);
      } catch (paramEncodingError) {
        return errorUtil.process(errorUtil.combine(paramEncodingError,
           { "message": "Failed to encode query parameters: " + requestParameters.toString()
           , "scope"  : "client"
           , "code"   : "param_encoding_failure"
           }), completionCallback);
      }
    }

    // Handle request body content
    if (operationParams.requestBody) {
      if (Buffer.isBuffer(operationParams.requestBody)) {
        outgoingRequest.body = operationParams.requestBody; // Raw buffer data
      } else {
        try {
          outgoingRequest.body = JSON.stringify(operationParams.requestBody, function (jsonKey, jsonValue) {
            // Do not encode functions; allow them to be passed as-is (converted to string)
            if (typeof (jsonValue) === 'function') {
              return jsonValue.toString();
            } else {
              return jsonValue;
            }
          });
        } catch (bodySerializationError) {
          return errorUtil.process(errorUtil.combine(bodySerializationError,
             { "message": "Request body appears to be invalid JSON"
             , "scope"  : "client"
             , "code"   : "body_serialization_failure"
             }), completionCallback);
        }
      }
    }

    // Handle form-urlencoded data
    if (operationParams.formData) {
      outgoingRequest.headers['content-type'] =
        'application/x-www-form-urlencoded; charset=utf-8';
      outgoingRequest.body = paramSerializer.stringify(operationParams.formData).toString('utf8');
    }

    // If no callback is provided, return a stream directly
    if (!completionCallback) {
      try {
        return httpRequest(outgoingRequest);
      } catch (streamInitError) {
        return errorUtil.process(errorUtil.combine(streamInitError,
           { "message": "HTTP client threw an error during stream initialization"
           , "scope"  : "httpClient"
           , "code"   : "stream_init_error"
           }), completionCallback);
      }
    }

    // Execute the request with a callback
    try {
      var responseStream = httpRequest(outgoingRequest, function (connectionError, httpResponse, responseBody) {
        // Ensure headers object exists
        responseHeaderInfo = (httpResponse && httpResponse.headers || {});
        responseHeaderInfo['status-code'] = responseStatusCode = (httpResponse && httpResponse.statusCode || 500);
        responseHeaderInfo.uri = outgoingRequest.uri;

        if (connectionError) {
          // Handle network or connection errors
          errorUtil.process(errorUtil.combine(connectionError,
            {   "message": "An error occurred during the network connection"
              , "scope"  : "network"
              , "code"   : "connection_error"
            }), completionCallback);
          return responseStream;
        }

        // Clean up response headers for consistency
        delete responseHeaderInfo.server;
        delete responseHeaderInfo['content-length'];

        // Attempt to parse the response body as JSON
        try { parsedResponse = JSON.parse(responseBody); } catch (jsonParseError) { parsedResponse = responseBody; }

        // Check HTTP status code for success or error
        if (responseStatusCode >= 200 && responseStatusCode < 400) {
          completionCallback(null, parsedResponse, responseHeaderInfo);
          return responseStream;
        } else {
          // Proxy error information directly from the data store
          if (!parsedResponse) { parsedResponse = {}; }
          if (!parsedResponse.message && (parsedResponse.reason || parsedResponse.error)) {
            parsedResponse.message = (parsedResponse.reason || parsedResponse.error);
          }
          errorUtil.process(errorUtil.combine(errorUtil.construct(parsedResponse),
             { "scope"       : "dataStore"
             , "status_code" : responseStatusCode
             , "status-code" : responseStatusCode
             , "request"     : outgoingRequest
             , "headers"     : responseHeaderInfo
             , "code"        : "non_2xx_status"
             , "message"     : parsedResponse.reason || "Data store returned status " + responseStatusCode
             }), completionCallback);
          return responseStream;
        }
      });
      return responseStream;
    } catch (requestSetupError) {
      // Handle errors that occur during the initial setup of the request object
      return errorUtil.combine(requestSetupError,
         { "message": "HTTP client threw an error while creating the request object"
         , "scope"  : "httpClient"
         , "code"   : "request_object_creation_failure"
         });
    }
  }

  // Retrieves documents from a specified design view
  function queryDocuments(designDocumentName, viewIdentifier, queryOptions, completionHandler) {
    if (typeof queryOptions === "function") {
      completionHandler = queryOptions;
      queryOptions = {};
    }
    var documentViewPath = _dataStoreName + '/_design/' + designDocumentName + '/_view/' + viewIdentifier;
    if (queryOptions.keys) {
      var requestBody = { keys: queryOptions.keys };
      delete queryOptions.keys;
      return performOperation({ resourcePath: documentViewPath, httpMethod: "POST", queryArguments: queryOptions, requestBody: requestBody }, completionHandler);
    } else {
      return performOperation({ resourcePath: documentViewPath, httpMethod: "GET", queryArguments: queryOptions }, completionHandler);
    }
  }

  // Retrieves spatial data from a specified design view
  function querySpatialData(geoDesignName, spatialViewName, spatialQueryOptions, geoCompletionHandler) {
    if (typeof spatialQueryOptions === "function") {
      geoCompletionHandler = spatialQueryOptions;
      spatialQueryOptions = {};
    }
    var spatialViewPath = _dataStoreName + '/_design/' + geoDesignName + '/_spatial/' + spatialViewName;
    if (spatialQueryOptions.keys) {
      var spatialRequestBody = { keys: spatialQueryOptions.keys };
      delete spatialQueryOptions.keys;
      return performOperation({ resourcePath: spatialViewPath, httpMethod: "POST", queryArguments: spatialQueryOptions, requestBody: spatialRequestBody }, geoCompletionHandler);
    } else {
      return performOperation({ resourcePath: spatialViewPath, httpMethod: "GET", queryArguments: spatialQueryOptions }, geoCompletionHandler);
    }
  }

  // Sets or updates a design document's views
  function defineDesignLayout(layoutName, viewDefinitions, layoutCompletion) {
    var layoutApiPath = _dataStoreName + '/_design/' + layoutName;
    return performOperation({ resourcePath: layoutApiPath, httpMethod: "PUT", requestBody: { views: viewDefinitions } }, layoutCompletion);
  }

  // Sets or updates a design document's spatial views
  function defineSpatialLayout(geoLayoutName, spatialDefinitions, geoLayoutCompletion) {
    var geoLayoutApiPath = _dataStoreName + '/_design/' + geoLayoutName;
    return performOperation({ resourcePath: geoLayoutApiPath, httpMethod: "PUT", requestBody: { views: {}, spatial: spatialDefinitions } }, geoLayoutCompletion);
  }

  // Fetches a design document
  function fetchDesignLayout(layoutName, fetchCompletion) {
    var layoutApiPath = _dataStoreName + '/_design/' + layoutName;
    return performOperation({ resourcePath: layoutApiPath, httpMethod: "GET" }, fetchCompletion);
  }

  // Deletes a design document
  function removeDesignLayout(layoutName, deleteCompletion) {
    var layoutApiPath = _dataStoreName + '/_design/' + layoutName;
    return performOperation({ resourcePath: layoutApiPath, httpMethod: "DELETE" }, deleteCompletion);
  }

  // Public interface for the data store client
  return {
    documentQuery: queryDocuments,
    spatialQuery: querySpatialData,
    setupSpatialDefinition: defineSpatialLayout,
    setupDocumentDefinition: defineDesignLayout,
    retrieveDocumentDefinition: fetchDesignLayout,
    removeDocumentDefinition: removeDesignLayout
  };
};