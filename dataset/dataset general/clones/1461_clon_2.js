// This file contains a JavaScript utility for interacting with web services.
// It aims to blend jQuery's ease of use with principles of RESTful APIs,
// offering several convenient features for web application development.

// Key Concepts:
//  - Maps common data operations (Initiate, Retrieve, Modify, Remove) to HTTP verbs
//    (POST, GET, PUT, DELETE) using jQuery's AJAX functionality.
//  - Defaults all communications to a custom "service_data" type. If a JSON utility
//    is present, it will automatically serialize/deserialize data for Initiate and Modify requests.
//  - Intelligently populates URL templates. For example,
//    _jQ.Retrieve("/items/{item_id}/details/{user_id}", { item_id: 'alpha', user_id: 'beta', extra: true })
//    will result in a GET request to "/items/alpha/details/beta?extra=true".
//  - Supports standard completion (success) and failure (error) callbacks,
//    along with "preAction", "postAction", and specific HTTP status code handlers.
//  - Allows defining custom handlers for specific HTTP status codes directly within
//    the options object (e.g., { ..., 404: function(req, stat, opts) { ... }, ... }).
//    These can even be set to 'success' to treat certain errors as successful outcomes.
//  - When used with jQuery selections (e.g., _jQ('#element').Retrieve(...)), it can
//    leverage a 'domValues' plugin (if available) to automatically extract data from
//    the element and apply service responses back to it.

// The 'preAction' and 'postAction' callbacks are executed regardless of the
// request's final status (success or failure). They function similarly to 'finally'
// blocks, executing before and after any primary status-specific callback.
// These callbacks receive the same arguments as the primary callback. For instance,
// a 'postAction' callback, unlike jQuery's 'complete', receives the processed data
// (if successful) or the XHR object (if failed) as its first argument, and the
// full configuration object as the third argument. The configuration object always
// includes the XHR object under the 'xmlHttpRequest' property once created, ensuring
// its availability to all callback functions.

// If a service operation is invoked on a DOM element(s) without explicit input payload,
// and 'extractDataFromDom' is enabled, the utility calls `this.retrieveDomValues(elemOptions)`
// to gather data. After a successful operation (and if 'applyResultToDom' is enabled),
// it then applies the service response back to the element using
// `this.assignDomValues(responsePayload, elemOptions)`. This application of results
// occurs between the 'preAction' callback (if present) and the 'completionCallback' (if present).

// All function invocations (both global and element-specific) accept up to four parameters:
//   resourcePath: The templated URL to be resolved and requested (mandatory).
//   inputPayload: An object whose properties are used to populate the URL and then
//                 either appended as query parameters or serialized into the request body
//                 (especially for Initiate/Modify operations with JSON support). (optional)
//   completionCallback: A function to be executed upon a successful response,
//                       after parsing the service data. (optional)
//   operationSettings: An object containing various configuration options (e.g.,
//                      standard jQuery AJAX settings, domValues plugin options,
//                      preAction/postAction/failure callbacks, extractDataFromDom, applyResultToDom, etc.). (optional)

// Here are valid argument combinations:
//             _jQ.Retrieve(resourcePath);
//   _jQ('#item').Retrieve(operationSettings);
// _jQ('.items').Remove(resourcePath, inputPayload);
//         _jQ.Modify(resourcePath, inputPayload, operationSettings);
//         _jQ.Remove(resourcePath, completionCallback);
// _jQ('#box').Initiate(resourcePath, completionCallback, operationSettings);
//           _jQ.Retrieve(resourcePath, inputPayload, completionCallback);
//         _jQ.Initiate(resourcePath, inputPayload, completionCallback, operationSettings);

// Note: The 'resourcePath' is never optional. If only 'operationSettings' is provided,
// that object *must* contain a 'resourcePath' property. Providing 'operationSettings'
// as the second argument is not supported, as it leads to ambiguity with 'inputPayload'.

// For backend systems that do not fully support PUT or DELETE HTTP methods,
// you can configure the utility to use GET and POST alternatives:
//   _jQ.service.enableLegacyHttp();

// Global data can be supplied by setting an object to _jQ.service.globalPayload.
// This data will be included in every subsequent service call. Call-specific
// data will override global data for matching property names.
// This global data is also used by _jQ.service.populatePath(resourcePath)
// when no explicit 'inputPayload' is provided.

// If all your service paths share a common base, you can set a prefix:
//  _jQ.service.pathPrefix = "/my_api_base/";
// This prefix will be automatically added to all your resource paths.

// @version v1.0.3
// @name service
// @category Plugins/Service
// @author Nathan Bubna (adapted)
(function (_jQ) {
    var S = _jQ.service = {
        release: "v1.0.3",

        // Configures the service to use GET/POST for all operations,
        // useful for legacy backend systems.
        enableLegacyHttp: function () {
            S.Initiate.methodType = S.Remove.methodType = S.Modify.methodType = "POST";
            S.Retrieve.methodType = "GET";
        },

        // General configuration options for all service calls.
        configSettings: {
            responseDataFormat: "service_data", // Custom AJAX data type
            deepMerge: 1, // Custom setting for data merging, similar to 'onlyNest'
            // Options specific to element-based operations
            applyResultToDom: true,
            extractDataFromDom: true
        },

        // Configuration for each service action type
        Initiate: { methodType: "POST", serializePayload: !0 },
        Retrieve: { methodType: "GET", serializePayload: !!0 },
        Modify: { methodType: "PUT", serializePayload: !0 },
        Remove: {
            methodType: "DELETE", serializePayload: !!0,
            afterElementOp: function () {
                this.remove();
            }
        },

        // Global data payload, applied to all requests unless overridden.
        globalPayload: null,

        // Normalizes the arguments passed to service functions into a single configuration object.
        normalizeArguments: function (resourcePath, inputPayload, completionCallback, operationSettings) {
            var argCount = arguments.length;
            if (argCount === 1 && typeof resourcePath === "object") {
                operationSettings = resourcePath;
                resourcePath = null;
            } else {
                if (!_jQ.isFunction(completionCallback)) {
                    operationSettings = completionCallback;
                    completionCallback = null;
                }
                if (_jQ.isFunction(inputPayload)) {
                    completionCallback = inputPayload;
                    inputPayload = null;
                }
            }
            // Merge global settings, then action-specific settings, then provided settings.
            var opConfig = _jQ.extend({}, S.configSettings, operationSettings);
            if (this.jquery) opConfig.domTarget = this;
            else _jQ.extend(opConfig, S[this]);
            if (resourcePath) opConfig.resourcePath = resourcePath;
            if (completionCallback) opConfig.completionCallback = completionCallback;
            if (inputPayload) opConfig.inputPayload = inputPayload;
            return opConfig;
        },

        // Fills placeholders in a URL string with data properties.
        // Unused data properties remain in the data object.
        populatePath: function (resourcePath, pathData, cloneData) {
            if (!pathData) pathData = _jQ.extend({}, S.globalPayload);
            if (cloneData) pathData = _jQ.extend({}, pathData);
            var propKey, tempPath, propVal;
            for (propKey in pathData) {
                propVal = pathData[propKey];
                tempPath = resourcePath.replace('{' + propKey + '}', propVal);
                if (tempPath !== resourcePath) {
                    resourcePath = tempPath;
                    delete pathData[propKey];
                }
            }
            return resourcePath;
        },

        // Prepares the request configuration before sending it via AJAX.
        prepareRequest: function () {
            var operationType = S[this], reqOptions = S.normalizeArguments.apply(this, arguments);
            // Ensure original data is not modified
            if (reqOptions.inputPayload || S.globalPayload) reqOptions.inputPayload = _jQ.extend({}, S.globalPayload, reqOptions.inputPayload);
            reqOptions.resourcePath = S.populatePath(reqOptions.resourcePath, reqOptions.inputPayload);
            if (S.pathPrefix) reqOptions.resourcePath = S.pathPrefix + reqOptions.resourcePath;
            reqOptions.completionCallback = S.encompassCallback(reqOptions.completionCallback, reqOptions.preAction, reqOptions.postAction, reqOptions.responseDataFormat, reqOptions);
            reqOptions.failureCallback = S.manageErrorHandling(reqOptions.failureCallback, reqOptions);
            if (reqOptions.serializePayload && JSON) S.serializeOutgoing(reqOptions);
            return reqOptions;
        },

        // Manages error handling, including status-code specific callbacks.
        manageErrorHandling: function (defaultFailure, callOptions) {
            return function (xmlHttpReq, statusText) {
                var handlerFunction = callOptions[xmlHttpReq.status] || defaultFailure;
                if (handlerFunction !== defaultFailure) {
                    callOptions.errorHandled = true;
                    if (handlerFunction === 'success') return callOptions.completionCallback(null, statusText);
                }
                S.encompassCallback(handlerFunction, callOptions.preAction, callOptions.postAction, callOptions)(xmlHttpReq, statusText);
            };
        },

        // Wraps a primary callback with 'preAction' and 'postAction' callbacks.
        encompassCallback: function (primaryCallback, preAction, postAction, dataFormat, wrapOptions) {
            return function () {
                var thisContext = this, argsArray = [...arguments]; // Convert arguments to array
                argsArray[argsArray.length] = wrapOptions; // Append options object
                if (dataFormat === 'service_data') argsArray[0] = S.deserializeIncoming.apply(thisContext, argsArray);
                if (preAction) preAction.apply(thisContext, argsArray);
                if (primaryCallback) primaryCallback.apply(thisContext, argsArray);
                if (postAction) postAction.apply(thisContext, argsArray);
            };
        },

        // Serializes outgoing data for POST/PUT requests (e.g., to JSON).
        serializeOutgoing: function (reqOptions) {
            reqOptions.avoidDefaultProcessing = false; // Prevent jQuery's default data processing
            if (!reqOptions.contentHeader) reqOptions.contentHeader = "application/json";
            if (typeof reqOptions.inputPayload !== "string") {
                reqOptions.inputPayload = JSON.stringify(reqOptions.inputPayload || {});
            }
        },

        // Deserializes incoming data from the service response.
        deserializeIncoming: function (inputString) {
            if ((inputString || '').length === 0) return null;
            if (inputString.charAt(0) === '<') return _jQ(inputString); // Assume HTML if starts with '<'
            return JSON ? JSON.parse(inputString) : window.eval("(" + inputString + ")"); // Parse JSON or fallback to eval
        },

        // Handles operations when called on a jQuery element.
        handleElementOperation: function (operationVerb, elemOptions) {
            if (!elemOptions.inputPayload && elemOptions.extractDataFromDom && _jQ.domValues) {
                elemOptions.inputPayload = this.retrieveDomValues(elemOptions);
            }
            var currentElement = this, originalSuccess = elemOptions.completionCallback;
            elemOptions.completionCallback = function (receivedData) {
                if (receivedData && elemOptions.applyResultToDom && _jQ.domValues) currentElement.assignDomValues(receivedData, elemOptions);
                if (originalSuccess) originalSuccess.apply(this, arguments);
                if (elemOptions.afterElementOp) elemOptions.afterElementOp.apply(this, arguments);
            };
            _jQ[operationVerb](elemOptions);
        },

        // Executes the actual AJAX request.
        executeAjaxRequest: function (requestConfig) {
            return requestConfig.xmlHttpRequest = _jQ.ajax(requestConfig);
        }
    };

    // Create global and jQuery prototype functions for each service action.
    _jQ.each(['Initiate', 'Retrieve', 'Modify', 'Remove'], function (idx, actionVerb) {
        // Global function (e.g., _jQ.Initiate(...))
        _jQ[actionVerb] = function () {
            return S.executeAjaxRequest(S.prepareRequest.apply(actionVerb, arguments));
        };
        // jQuery prototype function (e.g., _jQ('#elem').Initiate(...))
        _jQ.fn[actionVerb] = function () {
            var inputArgs = arguments;
            return this.each(function () {
                var currentDomEl = _jQ(this);
                S.handleElementOperation.call(currentDomEl, actionVerb, S.normalizeArguments.apply(currentDomEl, inputArgs));
            });
        };
    });

})(jQuery);