/*
  OpenMessageBus Core v1.0 - Adapted for Avocado Framework
  This module provides a robust publish/subscribe mechanism,
  allowing components to communicate without direct dependencies.
*/

if (!window.OpenMessageBus) {
  OpenMessageBus = new (function() {
    var truthVal = true;
    var falseVal = false;
    var globalScope = window;
    var tempVarOne; /* Placeholder for future use */

    var prefixString = "org.avocado.messagebus.";
    var busInstance = {};
    this.messageBus = busInstance;

    busInstance.busCreator = "http://avocado.org";
    busInstance.creatorVersion = "1.0";
    busInstance.protocolVersion = "1.0";
    busInstance.creatorDetails = {};

    var libraryRegistry = {};
    busInstance.libraryCatalog = libraryRegistry;

    /*
     * Registers a new library with the message bus.
     * @param {string} libName - The unique name of the library.
     * @param {string} uriPath - The namespace URI for the library.
     * @param {string} libVer - The version of the library.
     * @param {Object} libData - Additional metadata for the library.
     */
    busInstance.enrollLibrary = function(libName, uriPath, libVer, libData) {
      libraryRegistry[libName] = {
        libPrefix: libName,
        uriLocation: uriPath,
        libVersion: libVer,
        additionalInfo: libData
      };
      this.broadcast(prefixString + "enrollLibrary", libraryRegistry[libName]);
    };

    /*
     * Unregisters a library from the message bus.
     * @param {string} libIdentifier - The name of the library to unregister.
     */
    busInstance.disenrollLibrary = function(libIdentifier) {
      this.broadcast(prefixString + "disenrollLibrary", libraryRegistry[libIdentifier]);
      delete libraryRegistry[libIdentifier];
    };

    busInstance._messageRoutes = {
      channelNodes: {},
      subscribers: []
    };
    busInstance._pendingRemovals = [];
    busInstance._subscriptionCounter = 0;
    busInstance._broadcastDepth = 0;

    /*
     * Subscribes a callback function to a specific topic.
     * @param {string} topicPath - The topic to subscribe to (e.g., "app.event.dataLoaded").
     * @param {Function} callbackFn - The function to call when a message is broadcast on this topic.
     * @param {Object} [scopeObj=window] - The execution context for the callback.
     * @param {*} [contextData] - Arbitrary data to pass to the callback.
     * @param {Function} [filterFn] - An optional filter function to control message delivery.
     * @returns {string} A unique handle for this subscription, used for unsubscribing.
     */
    busInstance.addSubscription = function(topicPath, callbackFn, scopeObj, contextData, filterFn) {
      if (!scopeObj) {
        scopeObj = globalScope;
      }
      var handleId = topicPath + "." + this._subscriptionCounter;
      var subscriptionObj = {
        scope: scopeObj,
        cb: callbackFn,
        fcb: filterFn,
        data: contextData,
        sid: this._subscriptionCounter++,
        hdl: handleId
      };
      var topicParts = topicPath.split(".");
      this._establishSubscription(this._messageRoutes, topicParts, 0, subscriptionObj);
      return handleId;
    };

    /*
     * Broadcasts a message on a given topic.
     * All subscribed callbacks for this topic will be invoked.
     * @param {string} topicName - The topic to broadcast on.
     * @param {*} messagePayload - The data payload to send with the message.
     */
    busInstance.broadcast = function(topicName, messagePayload) {
      var topicSegments = topicName.split(".");
      this._broadcastDepth++;
      this._dispatchMessage(this._messageRoutes, topicSegments, 0, topicName, messagePayload);
      this._broadcastDepth--;

      if ((this._pendingRemovals.length > 0) && (this._broadcastDepth == 0)) {
        for (var idx = 0; idx < this._pendingRemovals.length; idx++) {
          this.removeSubscription(this._pendingRemovals[idx].hdl);
        }
        delete (this._pendingRemovals);
        this._pendingRemovals = [];
      }
    };

    /*
     * Removes a subscription using its handle.
     * @param {string} subscriptionHandle - The handle returned by `addSubscription`.
     */
    busInstance.removeSubscription = function(subscriptionHandle) {
      var handleParts = subscriptionHandle.split(".");
      var lastPart = handleParts.pop();
      this._tearDownSubscription(this._messageRoutes, handleParts, 0, lastPart);
    };

    /*
     * Internal recursive method to establish a subscription in the topic tree.
     * @private
     */
    busInstance._establishSubscription = function(node, parts, depth, subDetails) {
      var segment = parts[depth];
      if (depth == parts.length) {
        node.subscribers.push(subDetails);
      } else {
        if (typeof node.channelNodes == "undefined") {
          node.channelNodes = {};
        }
        if (typeof node.channelNodes[segment] == "undefined") {
          node.channelNodes[segment] = {
            channelNodes: {},
            subscribers: []
          };
          this._establishSubscription(node.channelNodes[segment], parts, depth + 1, subDetails);
        } else {
          this._establishSubscription(node.channelNodes[segment], parts, depth + 1, subDetails);
        }
      }
    };

    /*
     * Internal recursive method to dispatch messages through the topic tree.
     * Handles wildcards (* and **).
     * @private
     */
    busInstance._dispatchMessage = function(currentNode, pathSegments, currentDepth, fullTopicName, dataPayload) {
      if (typeof currentNode != "undefined") {
        var targetNode;
        if (currentDepth == pathSegments.length) {
          targetNode = currentNode;
        } else {
          this._dispatchMessage(currentNode.channelNodes[pathSegments[currentDepth]], pathSegments, currentDepth + 1, fullTopicName, dataPayload);
          this._dispatchMessage(currentNode.channelNodes["*"], pathSegments, currentDepth + 1, fullTopicName, dataPayload);
          targetNode = currentNode.channelNodes["**"];
        }

        if (typeof targetNode != "undefined") {
          var activeSubscribers = targetNode.subscribers;
          var subscriberCount = activeSubscribers.length;
          for (var subIdx = 0; subIdx < subscriberCount; subIdx++) {
            if (activeSubscribers[subIdx].cb) {
              var subScope = activeSubscribers[subIdx].scope;
              var subCallback = activeSubscribers[subIdx].cb;
              var subFilter = activeSubscribers[subIdx].fcb;
              var subData = activeSubscribers[subIdx].data;

              if (typeof subCallback == "string") {
                subCallback = subScope[subCallback];
              }
              if (typeof subFilter == "string") {
                subFilter = subScope[subFilter];
              }

              if ((!subFilter) || (subFilter.call(subScope, dataPayload, fullTopicName, subData))) {
                subCallback.call(subScope, dataPayload, fullTopicName, subData);
              }
            }
          }
        }
      }
    };

    /*
     * Internal recursive method to remove a subscription from the topic tree.
     * @private
     */
    busInstance._tearDownSubscription = function(currentChannelNode, pathSegments, currentSegmentIdx, handleToMatch) {
      if (typeof currentChannelNode != "undefined") {
        if (currentSegmentIdx < pathSegments.length) {
          var childNode = currentChannelNode.channelNodes[pathSegments[currentSegmentIdx]];
          this._tearDownSubscription(childNode, pathSegments, currentSegmentIdx + 1, handleToMatch);

          if (childNode.subscribers.length == 0) {
            for (var prop in childNode.channelNodes) {
              return;
            }
            delete currentChannelNode.channelNodes[pathSegments[currentSegmentIdx]];
          }
          return;
        } else {
          var subscriberList = currentChannelNode.subscribers;
          var listLength = subscriberList.length;
          for (var listIdx = 0; listIdx < listLength; listIdx++) {
            if (handleToMatch == subscriberList[listIdx].sid) {
              if (this._broadcastDepth > 0) {
                subscriberList[listIdx].cb = null;
                this._pendingRemovals.push(subscriberList[listIdx]);
              } else {
                subscriberList.splice(listIdx, 1);
              }
              return;
            }
          }
        }
      }
    };

    OpenMessageBus.messageBus.enrollLibrary("OpenMessageBus", "http://avocado.org/bus", "1.0", {});
  });
}

/*
  Global references and utility functions for Avocado Framework.
  This section includes a custom Object.derive function for inheritance
  and the core Avocado object structure.
*/

// Polyfill for Object.create to ensure prototypical inheritance
if (typeof Object.derive !== 'function') {
  Object.derive = function(prototypeObject) {
    var ConstructorFn = function() {};
    ConstructorFn.prototype = prototypeObject;
    return new ConstructorFn();
  };
}

var Avocado = {
  models: {},
  views: {},
  controllers: {},
  helpers: {},
  settings: {
    root_url_path: 'http://' + window.location.host,
    universal_fault_handler: {
      default: function(alertMessage, faultCode, xmlHttpRequest) {}
    },
    input_form_filter: function() {
      return this;
    }
  }
};

/*
 * ServiceClient Object
 * Manages HTTP requests and interactions with backend services.
 * @param {Object} dataModel - The model associated with this connector.
 */
Avocado.ServiceClient = function(dataModel) {
  this.dataModel = dataModel;
};

Avocado.ServiceClient.prototype = {

  /*
   * Sends a GET request.
   * @param {Object} requestParams - Query parameters.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  retrieve: function(requestParams, onSuccess, onError, requestOptions) {
    return this.sendHttpRequest(null, 'get', requestParams, onSuccess, onError, requestOptions);
  },

  /*
   * Sends a POST request.
   * @param {Object} requestParams - Request body parameters.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  submit: function(requestParams, onSuccess, onError, requestOptions) {
    return this.sendHttpRequest(null, 'post', requestParams, onSuccess, onError, requestOptions);
  },

  /*
   * Sends a PUT request.
   * @param {Object} requestParams - Request body parameters.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  update: function(requestParams, onSuccess, onError, requestOptions) {
    return this.sendHttpRequest(null, 'put', requestParams, onSuccess, onError, requestOptions);
  },

  /*
   * Sends a DELETE request.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  remove: function(onSuccess, onError, requestOptions) {
    return this.sendHttpRequest(null, 'delete', {}, onSuccess, onError, requestOptions);
  },

  /*
   * Constructs the URI for the associated model.
   * @param {string} [uriSegment] - An optional segment to append to the model's URI.
   * @param {Object} [currentModel] - The model to build the URI from; defaults to `this.dataModel`.
   * @returns {string} The constructed URI.
   */
  resourceUri: function(uriSegment, currentModel) {
    if (!currentModel) {
      currentModel = this.dataModel;
    }
    return Avocado.Interpreter.resolve_recursive_uri(uriSegment, currentModel);
  },

  /*
   * Core method to send an HTTP request using jQuery AJAX.
   * @param {string} endpointUri - The target URL for the request.
   * @param {string} httpMethod - The HTTP method (e.g., 'get', 'post').
   * @param {Object} requestParams - Parameters for the request.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {Object} requestOptions - Additional jQuery AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  sendHttpRequest: function(endpointUri, httpMethod, requestParams, onSuccess, onError, requestOptions) {

    // Ensure requestParams object exists
    requestParams = requestParams || {};

    // Check if within an Avocado request context
    var activeRequest = typeof Avocado.__active_request__ == 'undefined' ? false : Avocado.__active_request__;
    if (activeRequest) {
      // Pre-process parameters and attach to the active request
      requestParams = activeRequest.queryParameters = Avocado.Interpreter.convert_to_object_params(requestParams);
      // Attempt to find an error handler if not explicitly provided
      onError = onError || activeRequest.fetch_option('on_error');
    }

    // If no error handler is found, use a no-op function
    onError = onError || function() {};

    // Initialize the server response processor
    var serverResponseProcessor = new Avocado.ServerResponseProcessor(onSuccess, onError, activeRequest);

    if (!endpointUri) {
      endpointUri = Avocado.settings.root_url_path + this.resourceUri();
    }

    // Configure and execute the AJAX call
    requestOptions = jQuery.extend({
      requestType: httpMethod,
      payloadData: Avocado.Interpreter.serialize_parameters(requestParams),
      responseDataType: 'json',
      targetUrl: endpointUri,
      useCache: false,
      onBeforeSend: function() {
        if (activeRequest) {
          activeRequest.before_http_request();
        }
      },
      onComplete: function(xmlHttpRequest) {
        if (activeRequest) {
          activeRequest.after_http_request();
        }
      },
      onSuccessCallback: function(responseData, requestStatus) {
        serverResponseProcessor.success.apply(activeRequest || this, [responseData]);
      },
      onErrorCallback: function(xmlHttpRequest, statusMsg) {
        serverResponseProcessor.processFault(xmlHttpRequest, statusMsg);
      }
    }, requestOptions || {});
    jQuery.ajax(requestOptions);
  }
};

/*
 * ServerResponseProcessor Object
 * Handles success and error callbacks for server responses,
 * including global error handling logic.
 * @param {Function} successCallback - Function to call on success.
 * @param {(Function|Object)} faultCallback - Function or map of error codes to functions for error handling.
 * @param {Object} currentRequest - The active Avocado.ActionRequest instance.
 */
Avocado.ServerResponseProcessor = function(successCallback, faultCallback, currentRequest) {
  this.success = successCallback;
  this.faultCallback = faultCallback || {};
  this.currentRequest = currentRequest;
};

Avocado.ServerResponseProcessor.prototype = {

  /*
   * Processes an error response from the server.
   * @param {jqXHR} xmlHttpRequest - The jQuery XHR object.
   * @param {string} statusDescription - The status message from the AJAX call.
   */
  processFault: function(xmlHttpRequest, statusDescription) {

    var executionScope = this.currentRequest ? this.currentRequest.viewComponent : this;

    // If the error handler is a simple function, execute it and return
    if (typeof this.faultCallback === 'function') {
      this.faultCallback.apply(window, [xmlHttpRequest, statusDescription]);
      return;
    }

    var errorMessage = "";
    // TODO: Add handling for status 0 (no connection) from local responses
    switch (xmlHttpRequest.status) {
      // If status is 0, no connection was made to server
      case 0:
        errorMessage = "Server connection failed, ensure internet connectivity.";
        break;
      case 200:
        // If 200, it's either a parser error or timeout
        errorMessage = statusDescription === 'timeout' ? "Server connection timed out." : "Issue with server response format.";
        break;
      default:
        // Attempt to parse responseText as JSON for detailed error
        errorMessage = eval("(" + (xmlHttpRequest.responseText) + ")"); // Keeping original eval for clone fidelity
    }

    var argumentArray = [errorMessage, xmlHttpRequest.status, xmlHttpRequest];

    // Call custom universal error handler if defined in the request
    if (this.faultCallback.all) {
      this.faultCallback.all.apply(executionScope, argumentArray);
      return;
    }

    // Call custom error handler specific to the HTTP status code
    if (this.faultCallback[xmlHttpRequest.status]) {
      this.faultCallback[xmlHttpRequest.status].apply(executionScope, argumentArray);
      return;
    }

    // Call global error handler specific to the HTTP status code
    if (Avocado.settings.universal_fault_handler[xmlHttpRequest.status]) {
      Avocado.settings.universal_fault_handler[xmlHttpRequest.status].apply(executionScope, argumentArray);
    }

    // Call the base global error handler as a fallback
    Avocado.settings.universal_fault_handler.default.apply(executionScope, argumentArray);
  }
};

/*
 * Interpreter Object
 * Provides parsing and serialization utilities for various data structures and strings.
 */
Avocado.Interpreter = {

  /*
   * Determines the type of a given value.
   * @param {*} inputVal - The value to check.
   * @returns {string} The type as a string (e.g., 'object', 'array', 'null').
   */
  determineType: function determineType(inputVal) {
    var typeStr = typeof inputVal;
    if (typeStr === 'object') {
      if (inputVal) {
        if (inputVal instanceof Array) {
          typeStr = 'array';
        }
      } else {
        typeStr = 'null';
      }
    }
    return typeStr;
  },

  /*
   * Extracts the event name from a string (e.g., "click .my-button" -> "click").
   * @param {string} inputString - The event string.
   * @returns {string} The event name.
   */
  extract_event_name: function(inputString) {
    return inputString.substring(inputString.lastIndexOf(" ") + 1);
  },

  /*
   * Extracts the CSS selector from an event string,
   * potentially prepending the view's selector.
   * @param {string} inputString - The event string.
   * @param {Object} viewComponent - The view component.
   * @returns {string} The resolved CSS selector.
   */
  extract_selector: function(inputString, viewComponent) {
    var cssSelector = inputString.substring(0, inputString.lastIndexOf(" "));
    if (inputString.indexOf("::") == -1) {
      cssSelector = viewComponent.domNode.cssSelector + " " + cssSelector;
    } else {
      cssSelector = cssSelector.substring(2);
    }
    return cssSelector;
  },

  /*
   * Resolves a string into a handler object (class reference, action, filter).
   * @param {string} handlerString - The string representing the handler.
   * @param {Object} contextObject - The object from which to resolve the handler.
   * @returns {Object} An object containing `classRef`, `handlerAction`, `methodIdentifier`, and `preProcessor`.
   */
  resolve_handler: function(handlerString, contextObject) {
    // If 'http://' or 'https://' is encountered, assume a redirect
    if (handlerString.indexOf("http://") != -1 || handlerString.indexOf("https://") != -1) {
      return {
        classRef: {
          handlerType: 'external'
        },
        handlerAction: function() {
          globalScope.location.href = handlerString;
        }
      };
    }

    // If a period is encountered, assume a controller and get action, otherwise assume current view or helper
    if (handlerString.indexOf(".") != -1) {
      var partsArray = handlerString.split(".");
      var controllerName = partsArray[0];
      var methodName = partsArray[1];

      // Before filter logic
      var preProcessor = function() {};
      if (Avocado.controllers[controllerName].before) {
        var filterConfig = Avocado.controllers[controllerName].before;
        if (Avocado.Interpreter.determineType(filterConfig) == 'array') {
          if (jQuery.inArray(methodName, filterConfig[0]) != -1) {
            preProcessor = Avocado.controllers[controllerName][filterConfig[1]];
          }
        } else {
          preProcessor = Avocado.controllers[controllerName][filterConfig];
        }
      }
      return {
        classRef: Avocado.controllers[controllerName],
        handlerAction: Avocado.controllers[controllerName][methodName],
        methodIdentifier: methodName,
        preProcessor: preProcessor
      };
    } else {
      methodName = handlerString;
      // If action is not found in current object, assume a helper
      if (!contextObject[methodName]) {
        contextObject = Avocado.helpers.prototype;
      }
      return {
        classRef: contextObject,
        handlerAction: contextObject[methodName],
        methodIdentifier: methodName
      };
    }
  },

  /*
   * Recursively constructs a URI based on a model's parent hierarchy.
   * @param {string} resourceIdentifier - The base URI segment.
   * @param {Object} dataModel - The model to start from.
   * @returns {string} The fully resolved URI.
   */
  resolve_recursive_uri: function(resourceIdentifier, dataModel) {
    if (!resourceIdentifier) {
      resourceIdentifier = "";
    }
    resourceIdentifier = dataModel.resourceUri() + resourceIdentifier;
    if (dataModel.parentModel) {
      resourceIdentifier = this.resolve_recursive_uri(resourceIdentifier, dataModel.parentModel);
    }
    return resourceIdentifier;
  },

  /*
   * Serializes an object into a URL-encoded query string.
   * @param {*} inputObject - The object to serialize.
   * @param {string} [paramPrefix] - The prefix for parameter names.
   * @returns {?string} The serialized string or null if empty.
   */
  object_to_string: function(inputObject, paramPrefix) {
    var resultArray = [];
    var finalResult = null;
    var paramPrefix = paramPrefix || "";

    switch (this.determineType(inputObject)) {
      case 'array':
        for (var i = 0; i < inputObject.length; i++) {
          var itemString = this.object_to_string(inputObject[i], paramPrefix + '[]');
          if (itemString !== null) {
            resultArray.push(itemString);
          }
        }
        finalResult = resultArray.length ? resultArray.join("&") : null;
        break;
      case 'object':
        for (objKey in inputObject) {
          var itemString = this.object_to_string(inputObject[objKey], paramPrefix ? paramPrefix + '[' + encodeURIComponent(objKey) + ']' : encodeURIComponent(objKey));
          if (itemString !== null) {
            resultArray.push(itemString);
          }
        }
        finalResult = resultArray.length ? resultArray.join("&") : null;
        break;
      case 'null':
        break;
      default:
        finalResult = paramPrefix + '=' + encodeURIComponent(inputObject);
    }
    return finalResult;
  },

  /*
   * Converts a jQuery form selection into a plain JavaScript object.
   * @param {jQuery} jQueryForm - A jQuery object representing the form(s).
   * @param {string} [paramPrefix] - An optional prefix for the resulting object.
   * @returns {Object} The object representation of the form data.
   */
  form_to_object: function(jQueryForm, paramPrefix) {
    var finalVal;
    var outputObject = {};

    jQueryForm.map(function() {
        return this.elements ? jQuery.fn.toArray.call(this.elements) : this;
      })
      .filter(function() {
        return this.name && !this.disabled &&
          (this.checked || /select|textarea/i.test(this.nodeName) ||
            /text|hidden|password|search/i.test(this.type));
      })
      .filter(Avocado.settings.input_form_filter)
      .each(function(i, formElement) {
        var elementValue = jQuery(this).val();
        if (elementValue !== null) {
          if (formElement.name.match(/\[\]$/)) {
            // Ignore empty strings for array fields
            if (elementValue == "") {
              return;
            }
            var arrayKey = formElement.name.slice(0, -2);
            outputObject[arrayKey] ? outputObject[arrayKey].push(elementValue) : outputObject[arrayKey] = [elementValue];
          } else {
            outputObject[formElement.name] = elementValue;
          }
        }
      });

    if (paramPrefix) {
      finalVal = {};
      finalVal[paramPrefix] = outputObject;
    } else {
      finalVal = outputObject;
    }
    return finalVal;
  },

  /*
   * Converts input parameters into a normalized object format.
   * Handles functions and jQuery objects.
   * @param {*} inputParams - The parameters to convert.
   * @returns {Object} The objectified parameters.
   */
  parameters_to_object: function(inputParams) {
    // Non-jQuery objects pass through directly
    var outputObject = inputParams;
    if (typeof inputParams === 'function') {
      outputObject = inputParams.call(Avocado.__active_request__);
    }
    if (inputParams instanceof jQuery) {
      outputObject = this.form_to_object(inputParams);
    }
    return outputObject;
  },

  /*
   * Serializes input parameters into a URL-encoded string.
   * @param {*} inputParams - The parameters to serialize.
   * @returns {string} The serialized parameter string.
   */
  parameters_to_string: function(inputParams) {
    // Strings pass through directly
    if (typeof inputParams !== 'string') {
      inputParams = this.object_to_string(this.parameters_to_object(inputParams));
    }
    return inputParams;
  },

  /*
   * Composes a broadcast topic name from a handler object.
   * @param {Object} actionHandler - The handler object.
   * @returns {string} The broadcast topic name.
   */
  compose_broadcast_name: function(actionHandler) {
    return actionHandler.classRef.name + "." + actionHandler.methodIdentifier;
  },

  /*
   * Generates a Unix timestamp (milliseconds).
   * @returns {number} The current Unix timestamp.
   */
  generate_unix_timestamp: function() {
    return parseInt(new Date().getTime().toString(), 10);
  },

  /*
   * Determines the number of properties in an object.
   * @param {Object} targetObject - The object to inspect.
   * @returns {number} The count of properties.
   */
  determine_object_length: function(targetObject) {
    var count = 0;
    jQuery.each(targetObject, function() {
      count++;
    });
    return count;
  }
};

/*
 * ActionRequest Object
 * Manages the lifecycle of an action, including event handling, AJAX calls,
 * and chaining of operations.
 * @param {jQuery} listeningElement - The DOM element that triggered the event.
 * @param {Event} triggerEvent - The original DOM event.
 * @param {Object} viewComponent - The view associated with this request.
 * @param {Object} requestOptions - Options for this specific request.
 * @param {Function} eventCallback - The original callback function for the event.
 */
Avocado.ActionRequest = function(listeningElement, triggerEvent, viewComponent, requestOptions, eventCallback) {
  var selfRef = this;
  this.triggerEvent = triggerEvent;
  this.viewComponent = viewComponent;
  this.requestOptions = requestOptions;
  this.data = {};
  this.actionHandler = Avocado.Interpreter.resolve_handler(this.requestOptions.action, this.viewComponent);
  this.pendingAjaxCalls = 0;
  this.requestId = Avocado.Interpreter.generate_unix_timestamp();
  this.eventStopper = null;
  this.eventTarget = jQuery(this.triggerEvent.target);
  this.listeningElement = jQuery(listeningElement);
  this._originalCallback = eventCallback;

  // Set up auto-id properties from the listening element's attributes
  jQuery.each(this.listeningElement.get(0).attributes, function(idx, attribute) {
    if (attribute.nodeName.indexOf("_id") !== -1) {
      selfRef[attribute.nodeName] = parseInt(attribute.nodeValue);
    }
  });
};

Avocado.ActionRequest.prototype = {

  /*
   * Returns a function that continues the action chain with a new handler.
   * @param {string} nextActionName - The name of the next action to execute.
   * @returns {Function} A callback function to be used for chaining.
   */
  proceed_with: function(nextActionName) {
    var instanceRef = this;

    return function(responseData) {
      instanceRef.data = responseData;
      instanceRef.actionHandler = Avocado.Interpreter.resolve_handler(instanceRef.actionHandler.classRef.name + '.' + nextActionName, instanceRef.actionHandler.classRef);
      Avocado.__active_request__ = instanceRef;
      instanceRef.perform_action();
      if (instanceRef.pendingAjaxCalls === 0) {
        instanceRef.finalize_request();
      }
      delete Avocado.__active_request__;
    };
  },

  /*
   * Publishes the request data to the message bus.
   * @param {*} responseData - The data to publish.
   */
  broadcast_result: function(responseData) {
    this.data = responseData;
    var messageTopic = Avocado.Interpreter.compose_broadcast_name(this.actionHandler);
    if (this.requestOptions.autoSubscribe) {
      this.viewComponent[this.requestOptions.callbackMethod].apply(this.viewComponent, [this], messageTopic);
    }
    OpenMessageBus.messageBus.broadcast(messageTopic, this);
  },

  /*
   * Retrieves parameters for the request, potentially from a form or a context object.
   * @param {string} [paramPrefix] - Optional prefix for parameters.
   * @param {Object} [lookupContext] - The context from which to retrieve parameters.
   * @returns {Object} The objectified parameters.
   */
  get_parameters: function(paramPrefix, lookupContext) {
    paramPrefix = paramPrefix || this.requestOptions.parameterPrefix;

    // The parameters object is either a jQuery object, or a property of the calling view
    if (this.requestOptions.parameterContext) {
      lookupContext = this.requestOptions.parameterContext instanceof jQuery ? this.requestOptions.parameterContext : this.fetch_option('parameterContext');
    }
    lookupContext = lookupContext || this.viewComponent.domNode;

    // Assumes only one form per view
    var requestParams = Avocado.Interpreter.form_to_object(jQuery("form", lookupContext), paramPrefix);

    // Processes the parameters object if a processor is defined
    if (this.requestOptions.parameterProcessor) {
      var processorFn = this.fetch_option('parameterProcessor');
      requestParams = processorFn(requestParams);
    }
    return requestParams;
  },

  /*
   * Fetches an option from the request options, resolving handlers if necessary.
   * @param {string} optionKey - The key of the option to fetch.
   * @returns {*} The resolved option value.
   */
  fetch_option: function(optionKey) {
    var optionValue = this.requestOptions[optionKey];
    if (!optionValue) return false;

    var typeInterpreter = Avocado.Interpreter;
    if (typeInterpreter.determineType(optionValue) === 'null') {
      return null;
    }
    if (typeInterpreter.determineType(optionValue) === 'object') {
      return optionValue;
    }
    if (typeInterpreter.determineType(optionValue) === 'string') {
      return Avocado.Interpreter.resolve_handler(optionValue, this.viewComponent).handlerAction;
    }
    return false;
  },

  /*
   * Executes the action handler associated with this request.
   * Handles views, helpers, and controller actions with before filters.
   */
  perform_action: function() {
    try {
      this.viewComponent.activeRequests[this.requestId] = this;
      if (this.actionHandler.classRef.handlerType === 'view' || this.actionHandler.classRef.handlerType === 'helper') {
        // Run view method or helper
        this.actionHandler.handlerAction.apply(this.viewComponent, [this]);
      } else {
        // Provide shortcut to controller
        // TODO: Need to provide a straightforward way for chaining controller actions without AJAX while keeping the request alive
        this.associatedController = this.actionHandler.classRef;
        // Run before filter and controller action
        this.actionHandler.preProcessor.apply(this);
        this.actionHandler.handlerAction.apply(this);
      }
    } catch (exception) {
      if (exception == 'stop') {
        return;
      }
    }
  },

  /*
   * Called before each AJAX call within this request.
   * Manages event stopping, loader display, and call counters.
   */
  before_http_request: function() {
    if (this.requestOptions.beforeEachHttpRequest) {
      Avocado.Interpreter.resolve_handler(this.requestOptions.beforeEachHttpRequest, this.viewComponent).handlerAction.apply(this.viewComponent, [this]);
    }
    this.pendingAjaxCalls++;
    if (this.requestOptions.disableEvents && this.pendingAjaxCalls === 1) {
      this.activate_event_blocker();
    }
    if (this.requestOptions.displayLoader) {
      this.viewComponent.displayLoader();
    }
  },

  /*
   * Called after each AJAX call within this request.
   * Manages event unstopping, loader hiding, and request cleanup.
   */
  after_http_request: function() {
    this.pendingAjaxCalls--;

    // Do anything that should be done after each AJAX call
    if (this.requestOptions.afterEachHttpRequest) {
      Avocado.Interpreter.resolve_handler(this.requestOptions.afterEachHttpRequest, this.viewComponent).handlerAction.apply(this.viewComponent, [this]);
    }

    // Do anything defined after all AJAX calls (on a per-view basis)
    if (this.pendingAjaxCalls === 0) {
      if (this.requestOptions.disableEvents) {
        this.deactivate_event_blocker();
      }
      if (this.viewComponent.countActiveRequests() === 1) {
        var after_callback = this.requestOptions.afterAllHttpRequests || this.viewComponent.hideLoader;
        after_callback.apply(this.viewComponent);
      }
      this.finalize_request();
    }
  },

  /*
   * Finalizes the request, performing cleanup.
   */
  finalize_request: function() {
    this.dispose_self();
  },

  /*
   * Removes this request from the view's active requests.
   */
  dispose_self: function() {
    delete this.viewComponent.activeRequests[this.requestId];
  },

  /*
   * Activates an event blocker to temporarily stop event propagation.
   */
  activate_event_blocker: function() {
    // Stops propagation temporarily so that event delegation halts
    if (this.requestOptions.isLiveEvent) {
      this.eventStopper = function(eventObj) {
        eventObj.stopImmediatePropagation();
        return false;
      };
      jQuery(this.triggerEvent.target).on(this.triggerEvent.type, this.eventStopper);
    } else {
      this.listeningElement.off(this.triggerEvent.type, this._originalCallback);
    }
  },

  /*
   * Deactivates the event blocker, allowing events to propagate again.
   */
  deactivate_event_blocker: function() {
    // Unbinds stopper, delegation works again
    if (this.requestOptions.isLiveEvent) {
      jQuery(this.triggerEvent.target).off(this.triggerEvent.type, this.eventStopper);
    } else {
      this.listeningElement.on(this.triggerEvent.type, this._originalCallback);
    }
  }
};

/*
 * Model Definition Function
 * Registers a new model with the Avocado framework.
 * @param {string} modelName - The name of the model.
 * @param {(string|Object)} argOne - Either a parent model name (string) or the model configuration (object).
 * @param {Object} [argTwo] - The model configuration if `argOne` is a parent model name.
 */
Avocado.models = function(modelName, argOne, argTwo) {
  var modelConfig;
  if (typeof argOne == 'string') {
    var inheritedRelations = Avocado.models[argOne].relationships;
    modelConfig = argTwo;
  } else {
    modelConfig = argOne;
  }

  var freshModel = Object.derive(Avocado.models.prototype);
  freshModel.modelName = modelName;
  freshModel.dataConnector = new Avocado.ServiceClient(freshModel);
  jQuery.extend(modelConfig.relationships, inheritedRelations);
  Avocado.models[modelName] = jQuery.extend(freshModel, modelConfig);
};

/*
 * Model Prototype
 * Defines common methods and properties for all Avocado models.
 */
Avocado.models.prototype = {
  modelName: null,
  modelType: 'model',
  dataConnector: null,
  relationships: {},
  isBound: false,

  /*
   * Locates model instances based on identifier or 'all'.
   * @param {(number|string)} resourceIdentifier - The ID of the resource or 'all'.
   * @param {Function} [paramA] - Success callback if resourceIdentifier is 'all' or a number.
   * @param {*} [paramB] - Error callback or parameters depending on context.
   * @param {*} [paramC] - Options or callback depending on context.
   * @param {*} [paramD] - Options depending on context.
   * @returns {(Object|jqXHR)} The model instance or jQuery XHR object.
   */
  locate: function(resourceIdentifier, paramA, paramB, paramC, paramD) {
    // If identifier is a number, interpret as ID, no additional params
    if (typeof resourceIdentifier === 'number') {
      var targetModel = this.by_id(resourceIdentifier);
      var successHandler = paramA;
      var errorHandler = paramB;
      var requestOptions = paramC;
      return successHandler ? targetModel.dataConnector.retrieve(null, successHandler, errorHandler, requestOptions) : targetModel;
    } else if (resourceIdentifier === 'all') {
      if (typeof paramA === 'function') {
        // If paramA is a function, interpret as success and assume no query parameters
        successHandler = paramA;
        errorHandler = paramB;
        requestOptions = paramC;
        return this.dataConnector.retrieve(null, successHandler, errorHandler, requestOptions);
      } else {
        var queryParameters = paramA;
        successHandler = paramB;
        errorHandler = paramC;
        requestOptions = paramD;
        return this.dataConnector.retrieve(queryParameters, successHandler, errorHandler, requestOptions);
      }
    }
  },

  /*
   * Creates a new model instance on the server.
   * @param {Object} requestParams - Parameters for creating the resource.
   * @param {Function} onSuccess - Callback for successful creation.
   * @param {Function} onError - Callback for error.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  generate: function(requestParams, onSuccess, onError, requestOptions) {
    if (!this.isBound) {
      return this.dataConnector.submit(requestParams, onSuccess, onError, requestOptions);
    }
  },

  /*
   * Updates an existing model instance on the server.
   * @param {Object} requestParams - Parameters for updating the resource.
   * @param {Function} onSuccess - Callback for successful update.
   * @param {Function} onError - Callback for error.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  modify: function(requestParams, onSuccess, onError, requestOptions) {
    if (this.isBound) {
      return this.dataConnector.update(requestParams, onSuccess, onError, requestOptions);
    }
  },

  /*
   * Deletes a model instance from the server.
   * @param {Function} onSuccess - Callback for successful deletion.
   * @param {Function} onError - Callback for error.
   * @param {Object} requestOptions - Additional AJAX options.
   * @returns {jqXHR} jQuery XHR object.
   */
  remove: function(onSuccess, onError, requestOptions) {
    if (this.isBound) {
      return this.dataConnector.remove(onSuccess, onError, requestOptions);
    }
  },

  /*
   * Gets the base URI for this model.
   * This method is intended to be overridden by specific models.
   * @returns {string} The URI segment for the model.
   */
  resourceUri: function() {
    // Implement in specific model definitions
  }
};