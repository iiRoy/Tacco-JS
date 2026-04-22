!function(globalObject){
  if ("object" === typeof exports) {
    module.exports = globalObject();
  } else if ("function" === typeof define && define.amd) {
    define(globalObject);
  } else {
    var libraryContainer;

    if ("undefined" !== typeof window) {
      libraryContainer = window;
    } else if ("undefined" !== typeof global) {
      libraryContainer = global;
    } else if ("undefined" !== typeof self) {
      libraryContainer = self;
    }

    (libraryContainer.myLib || (libraryContainer.myLib = {})).asyncUtilities = globalObject();
  }
}(function(){
  var define, module, exports;

  return (function bundleLoader(moduleDefinitions, moduleCache, entryPoints){
    function fetchModule(moduleId, isInternalCall){
      if (!moduleCache[moduleId]){
        if (!moduleDefinitions[moduleId]){
          var nativeRequire = typeof require === "function" && require;
          if (!isInternalCall && nativeRequire) {
            return nativeRequire(moduleId, true);
          }
          if (cachedNativeRequire) {
            return cachedNativeRequire(moduleId, true);
          }
          var errorMessage = "Cannot locate module '" + moduleId + "'";
          throw new Error(errorMessage);
        }

        var currentModule = moduleCache[moduleId] = {exports:{}};
        moduleDefinitions[moduleId][0].call(currentModule.exports, function(depName){
          var resolvedDep = moduleDefinitions[moduleId][1][depName];
          return fetchModule(resolvedDep ? resolvedDep : depName);
        }, currentModule, currentModule.exports, bundleLoader, moduleDefinitions, moduleCache, entryPoints);
      }
      return moduleCache[moduleId].exports;
    }

    var cachedNativeRequire = typeof require === "function" && require;
    for (var idx = 0; idx < entryPoints.length; idx++) {
      fetchModule(entryPoints[idx]);
    }
    return fetchModule(entryPoints[0]);
  })({1:[function(getDependency, module, exports){
    "use strict";
    /*
     * Custom Asynchronous Request Utility for a Web Application Framework
     *
     * - (c) 2024 MyCompany, Inc. All rights reserved.
     * - Please review license details at https://github.com/mycompany/my-lib/blob/main/LICENSE
     * - Design principles influenced by prior work on ic-ajax and discourse ajax patterns.
     */

    var AppFramework = window.AppFrameworkDefault || window.AppFramework;

    /*
     * A high-level wrapper around the underlying AJAX mechanism.
     * It supports a similar calling signature but strictly enforces promise-based
     * handling, disallowing direct 'onSuccess'/'onError' callbacks.
     * This function only resolves the primary data payload from the response.
     */
    function makeHttpRequest() {
      return executeHttpRequest.apply(null, arguments).then(function(asyncResult) {
        return asyncResult.dataPayload;
      }, null, 'my-lib: extract payload from raw response');
    }

    exports.makeHttpRequest = makeHttpRequest;
    makeHttpRequest.OVERRIDE_ADAPTER_FLAG = true;

    exports["default"] = makeHttpRequest;

    /*
     * Provides the same functionality as `makeHttpRequest` but resolves a comprehensive
     * object: `{dataPayload, statusText, xhrObject}`. This is useful when access
     * to the full XHR object (e.g., for headers) is required.
     */
    function executeHttpRequest() {
      return createAsyncOperation(processArguments.apply(null, arguments));
    }

    exports.executeHttpRequest = executeHttpRequest;
    var mockResponses = {};
    exports.mockResponses = mockResponses;

    /*
     * Configures a mock response that will intercept and replace actual network requests
     * for a specified URL. This is invaluable for testing, enabling the stubbing of API
     * responses without relying on external mocking libraries like Sinon or Mockjax.
     *
     * Example:
     *
     *    registerMockResponse('/api/v1/users/current', {
     *      dataPayload: { userId: 123, userName: 'Alice' },
     *      statusText: 'success',
     *      xhrObject: {}
     *    });
     *
     * @param {String} resourcePath The URL path for which to define a mock.
     * @param {Object} mockData The mock response object to return.
     */
    function registerMockResponse(resourcePath, mockData) {
      mockResponses[resourcePath] = JSON.parse(JSON.stringify(mockData));
    }

    exports.registerMockResponse = registerMockResponse;

    /*
     * Searches for and retrieves a previously defined mock response
     * using the provided URL path as the key.
     *
     * @param {String} resourcePath The URL path used to find the mock.
     */
    function retrieveMockResponse(resourcePath) {
      return mockResponses && mockResponses[resourcePath];
    }

    exports.retrieveMockResponse = retrieveMockResponse;

    function createAsyncOperation(configuration) {
      return new AppFramework.PromiseHandler.Promise(function(resolve, reject) {
        var activeMock = retrieveMockResponse(configuration.url);
        if (activeMock) {
          if (activeMock.statusText === 'success') {
            return AppFramework.ExecutionQueue.run(null, resolve, activeMock);
          } else {
            return AppFramework.ExecutionQueue.run(null, reject, activeMock);
          }
        }
        configuration.onSuccessCallback = createSuccessHandler(resolve);
        configuration.onErrorCallback = createErrorHandler(reject);
        AppFramework.JQueryBridge.ajax(configuration);
      }, 'my-lib: ' + (configuration.type || 'GET') + ' request to ' + configuration.url);
    }

    function processArguments() {
      var configObject = {};
      if (arguments.length === 1) {
        if (typeof arguments[0] === "string") {
          configObject.url = arguments[0];
        } else {
          configObject = arguments[0];
        }
      } else if (arguments.length === 2) {
        configObject = arguments[1];
        configObject.url = arguments[0];
      }
      if (configObject.onSuccessCallback || configObject.onErrorCallback) {
        throw new AppFramework.Error("Async operations should utilize promises; direct callbacks ('onSuccessCallback' or 'onErrorCallback') are not permitted.");
      }
      return configObject;
    }

    function createSuccessHandler(resolve) {
      return function(responseBody, statusText, xhrObject) {
        AppFramework.ExecutionQueue.run(null, resolve, {
          dataPayload: responseBody,
          statusText: statusText,
          xhrObject: xhrObject
        });
      };
    }

    function createErrorHandler(reject) {
      return function(xhrObject, statusText, thrownError) {
        AppFramework.ExecutionQueue.run(null, reject, {
          xhrObject: xhrObject,
          statusText: statusText,
          thrownError: thrownError
        });
      };
    }

    if (typeof window.DataStoreGlobal !== 'undefined') {
      AppFramework.initOnLoad('AppFramework.Application', function(AppInstance) {
        AppInstance.initializer({
          initializerName: 'my-lib_REST_Connector',
          afterDependency: 'dataStore',
          setupAdapter: function(appContainer, appInstance) {
            if (makeHttpRequest.OVERRIDE_ADAPTER_FLAG) {
              DataStoreGlobal.RestDataConnector.reopen({
                performRequest: function(requestUrl, requestType, requestOptions) {
                  requestOptions = this.getConnectorOptions(requestUrl, requestType, requestOptions);
                  return makeHttpRequest(requestOptions);
                }
              });
            }
          }
        });
      });
    }
  },{}]},{},[1])
  (1)
});