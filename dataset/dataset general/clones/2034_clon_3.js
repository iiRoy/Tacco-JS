// A more robust object creation utility, if not natively present.
if (typeof Object.create !== 'function') {
  Object.create = function (proto_obj) {
    if (typeof proto_obj !== 'object' && proto_obj !== null) {
      throw new TypeError('Prototype must be an object or null.');
    }
    const TempConstructor = function () {};
    TempConstructor.prototype = proto_obj;
    return new TempConstructor();
  };
}

// Global Core Framework Initialization
if (!window.CoreJS) {
  window.CoreJS = new (function () {
    // Internal flags and references
    const isDebugging = true; // Renamed 'b'
    const isInactive = false; // Renamed 'i'
    const globalContext = window; // Renamed 'd'
    let tempVar; // Renamed 'e'
    const coreNamespace = 'corejs.eventbus.'; // Renamed 'a'
    const eventBusRegistry = {}; // Renamed 'c'

    // Expose the central event bus
    this.eventBus = eventBusRegistry;
    eventBusRegistry.provider = 'https://corejs.org';
    eventBusRegistry.providerVersion = '1.1'; // Updated version
    eventBusRegistry.specificationVersion = '1.0';
    eventBusRegistry.additionalInfo = {
      description: 'A lightweight event aggregation and dispatch system.',
    }; // Renamed 'implExtraData'

    let registeredModules = {}; // Renamed 'e' for libraries
    eventBusRegistry.modules = registeredModules;

    // Method to register a new module with the event bus
    eventBusRegistry.registerModule = function (
      moduleKey,
      moduleUri,
      moduleVersion,
      moduleExtraData
    ) {
      if (!moduleKey || !moduleUri) {
        console.warn('Cannot register module without key and URI.');
        return;
      }
      registeredModules[moduleKey] = {
        key: moduleKey,
        namespaceURI: moduleUri,
        version: moduleVersion,
        metadata: moduleExtraData || {},
      };
      this.signal(coreNamespace + 'moduleRegistered', registeredModules[moduleKey]);
    };

    // Method to unregister a module
    eventBusRegistry.unregisterModule = function (moduleKey) {
      if (!registeredModules[moduleKey]) {
        console.warn(`Attempted to unregister unknown module: ${moduleKey}`);
        return;
      }
      this.signal(coreNamespace + 'moduleUnregistered', registeredModules[moduleKey]);
      delete registeredModules[moduleKey];
    };

    // Internal data structures for subscriptions
    eventBusRegistry._subscriptionTree = { branches: {}, subscribers: [] }; // Renamed '_subscriptions' to '_subscriptionTree', 'c' to 'branches', 's' to 'subscribers'
    eventBusRegistry._deferredCleanups = []; // Renamed '_cleanup'
    eventBusRegistry._nextSubscriptionId = 0; // Renamed '_subIndex'
    eventBusRegistry._dispatchDepth = 0; // Renamed '_pubDepth'

    /**
     * Subscribes a callback to a specific event topic.
     * @param {string} topicPath The event topic (e.g., "module.subtopic.event").
     * @param {function} callbackFn The function to call when the event is signaled.
     * @param {object} [contextObj=window] The 'this' context for the callback.
     * @param {*} [userData] Additional data to pass to the callback.
     * @param {function} [preconditionFn] A function that must return true for the callback to execute.
     * @returns {string} A unique subscription handle.
     */
    eventBusRegistry.subscribeToTopic = function (
      topicPath,
      callbackFn,
      contextObj,
      userData,
      preconditionFn
    ) {
      const execContext = contextObj || globalContext; // Renamed 'k'
      const subscriptionIdentifier = topicPath + '.' + this._nextSubscriptionId; // Renamed 'l'
      const newSubscription = {
        scope: execContext,
        callback: callbackFn,
        filterCallback: preconditionFn,
        payloadData: userData,
        subId: this._nextSubscriptionId++,
        handle: subscriptionIdentifier,
      }; // Renamed 'g'

      const pathSegments = topicPath.split('.'); // Renamed 'm'
      this._addSubscriptionToTree(this._subscriptionTree, pathSegments, 0, newSubscription);
      return subscriptionIdentifier;
    };

    /**
     * Signals an event, dispatching it to all relevant subscribers.
     * @param {string} topicPath The event topic to signal.
     * @param {*} eventPayload The data payload for the event.
     */
    eventBusRegistry.signal = function (topicPath, eventPayload) {
      const pathSegments = topicPath.split('.'); // Renamed 'j'
      this._dispatchDepth++;
      this._traverseAndDispatch(this._subscriptionTree, pathSegments, 0, topicPath, eventPayload);
      this._dispatchDepth--;

      // Perform deferred cleanup if no dispatches are pending
      if (this._deferredCleanups.length > 0 && this._dispatchDepth === 0) {
        for (let idx = 0; idx < this._deferredCleanups.length; idx++) {
          this.unsubscribeFromTopic(this._deferredCleanups[idx].handle);
        }
        this._deferredCleanups.length = 0; // Clear the array
      }
    };

    /**
     * Unsubscribes a callback using its handle.
     * @param {string} subscriptionHandle The handle returned by subscribeToTopic.
     */
    eventBusRegistry.unsubscribeFromTopic = function (subscriptionHandle) {
      const handleParts = subscriptionHandle.split('.'); // Renamed 'h'
      const subIdToRemove = parseInt(handleParts.pop(), 10); // Renamed 'f' (was original 'f' but now integer)
      this._removeSubscriptionFromTree(this._subscriptionTree, handleParts, 0, subIdToRemove);
    };

    /**
     * Recursively adds a subscription to the topic tree.
     * @private
     */
    eventBusRegistry._addSubscriptionToTree = function (
      currentBranch,
      pathSegments,
      segmentIndex,
      subscriptionItem
    ) {
      const currentSegment = pathSegments[segmentIndex]; // Renamed 'h'
      if (segmentIndex === pathSegments.length) {
        currentBranch.subscribers.push(subscriptionItem);
      } else {
        if (typeof currentBranch.branches === 'undefined') {
          currentBranch.branches = {};
        }
        if (typeof currentBranch.branches[currentSegment] === 'undefined') {
          currentBranch.branches[currentSegment] = { branches: {}, subscribers: [] };
        }
        this._addSubscriptionToTree(
          currentBranch.branches[currentSegment],
          pathSegments,
          segmentIndex + 1,
          subscriptionItem
        );
      }
    };

    /**
     * Recursively dispatches events through the topic tree.
     * @private
     */
    eventBusRegistry._traverseAndDispatch = function (
      currentBranch,
      pathSegments,
      segmentIndex,
      fullTopic,
      eventPayload
    ) {
      if (currentBranch) {
        let targetNode; // Renamed 'h'

        // Check for exact matches and wildcards
        if (segmentIndex === pathSegments.length) {
          targetNode = currentBranch;
        } else {
          // Dispatch to specific child branches
          if (currentBranch.branches[pathSegments[segmentIndex]]) {
            this._traverseAndDispatch(
              currentBranch.branches[pathSegments[segmentIndex]],
              pathSegments,
              segmentIndex + 1,
              fullTopic,
              eventPayload
            );
          }
          // Dispatch to single-level wildcard '*'
          if (currentBranch.branches['*']) {
            this._traverseAndDispatch(
              currentBranch.branches['*'],
              pathSegments,
              segmentIndex + 1,
              fullTopic,
              eventPayload
            );
          }
          // Target node for multi-level wildcard '**'
          targetNode = currentBranch.branches['**'];
        }

        // Execute callbacks for the target node
        if (targetNode && targetNode.subscribers) {
          const activeSubscribers = targetNode.subscribers; // Renamed 'n'
          const subscriberCount = activeSubscribers.length; // Renamed 'q'
          for (let k = 0; k < subscriberCount; k++) {
            const currentSub = activeSubscribers[k]; // Renamed 'k' (loop var) to currentSub, 'p'
            if (currentSub.callback) {
              const subScope = currentSub.scope; // Renamed 'p'
              let subCallback = currentSub.callback; // Renamed 'j'
              let subFilter = currentSub.filterCallback; // Renamed 'l'
              const subData = currentSub.payloadData; // Renamed 'o'

              // Resolve string callbacks/filters to actual functions
              if (typeof subCallback === 'string') {
                subCallback = subScope[subCallback];
              }
              if (typeof subFilter === 'string') {
                subFilter = subScope[subFilter];
              }

              // Execute if no filter or filter returns true
              if (!subFilter || subFilter.call(subScope, eventPayload, fullTopic, subData)) {
                try {
                  subCallback.call(subScope, eventPayload, fullTopic, subData);
                } catch (error) {
                  if (isDebugging) {
                    console.error(
                      `Error in event bus callback for topic "${fullTopic}":`,
                      error
                    );
                  }
                }
              }
            }
          }
        }
      }
    };

    /**
     * Recursively removes a subscription from the topic tree.
     * @private
     */
    eventBusRegistry._removeSubscriptionFromTree = function (
      currentBranch,
      pathSegments,
      segmentIndex,
      targetSubId
    ) {
      if (!currentBranch) return; // Guard for undefined branches

      if (segmentIndex < pathSegments.length) {
        const nextSegment = pathSegments[segmentIndex]; // Renamed 'f'
        const childBranch = currentBranch.branches[nextSegment]; // Renamed 'f'
        this._removeSubscriptionFromTree(
          childBranch,
          pathSegments,
          segmentIndex + 1,
          targetSubId
        );

        // After recursive call, check if child branch is empty and can be pruned
        if (
          childBranch &&
          childBranch.subscribers.length === 0 &&
          Object.keys(childBranch.branches).length === 0
        ) {
          delete currentBranch.branches[nextSegment];
        }
      } else {
        // We've reached the target node for the subscription
        const subscriberList = currentBranch.subscribers; // Renamed 'k'
        for (let h = 0; h < subscriberList.length; h++) {
          if (targetSubId === subscriberList[h].subId) {
            if (this._dispatchDepth > 0) {
              // If currently dispatching, nullify callback and add to deferred cleanup
              subscriberList[h].callback = null;
              this._deferredCleanups.push(subscriberList[h]);
            } else {
              // Otherwise, remove immediately
              subscriberList.splice(h, 1);
            }
            return; // Subscription found and handled
          }
        }
      }
    };

    // Register the CoreJS module itself
    CoreJS.eventBus.registerModule('CoreJS', 'https://corejs.org/hub', '1.0', {
      initializationTime: new Date().toISOString(),
    });
  })();
}

/*global CoreJS, $, window*/

// Prototypical inheritance utility (modernized)
// This polyfill is less common in modern apps but maintained for Type III
if (!Object.create) {
  Object.create = function (proto) {
    if (typeof proto !== 'object' && proto !== null) {
      throw new TypeError('Object prototype may only be an Object or null.');
    }
    const F = function () {};
    F.prototype = proto;
    return new F();
  };
}

// Main application namespace
const BerryJS = {
  dataModels: {}, // Renamed 'm'
  viewComponents: {}, // Renamed 'v'
  controllers: {}, // Renamed 'c'
  utilities: {}, // Renamed 'h'
  appSettings: {
    baseUrl: window.location.protocol + '//' + window.location.host, // Renamed 'base_url', more explicit protocol
    globalErrorHandler: {
      default: function (msg, errCode, rawXHR) {
        console.error(`Global Error (${errCode}): ${msg}`, rawXHR);
      },
    }, // Renamed 'global_error_handler', 'base' to 'default'
    formInputFilter: function (element) {
      return this;
    }, // Renamed 'form_filter', added 'element' param for clarity
  },
};

// Data Interaction Layer (Connector Object)
BerryJS.DataLink = function (associatedModel) {
  this.model = associatedModel;
};

BerryJS.DataLink.prototype = {
  // Retrieves data from the server
  fetch: function (queryParameters, successCallback, errorCallback, requestOptions) {
    return this.sendHttpRequest(
      null,
      'GET',
      queryParameters,
      successCallback,
      errorCallback,
      requestOptions
    );
  },

  // Sends data to create a new resource
  create: function (payloadData, successCallback, errorCallback, requestOptions) {
    return this.sendHttpRequest(
      null,
      'POST',
      payloadData,
      successCallback,
      errorCallback,
      requestOptions
    );
  },

  // Sends data to update an existing resource
  update: function (payloadData, successCallback, errorCallback, requestOptions) {
    return this.sendHttpRequest(
      null,
      'PUT',
      payloadData,
      successCallback,
      errorCallback,
      requestOptions
    );
  },

  // Deletes a resource
  remove: function (successCallback, errorCallback, requestOptions) {
    return this.sendHttpRequest(
      null,
      'DELETE',
      {},
      successCallback,
      errorCallback,
      requestOptions
    );
  },

  // Constructs the URI for a model resource
  resolveUri: function (pathSegment, targetModel) {
    const currentModel = targetModel || this.model;
    if (!currentModel) {
      console.warn('Cannot resolve URI without a model context.');
      return '';
    }
    return BerryJS.SyntaxAnalyzer.buildRecursiveUri(pathSegment, currentModel);
  },

  // Core HTTP request sender
  sendHttpRequest: function (
    resourceUri,
    httpMethod,
    requestParams,
    onSuccess,
    onError,
    ajaxOptions
  ) {
    // Ensure parameters object exists
    let processedParams = requestParams || {};

    // Check if within an active BerryJS request context
    const currentRequestCtx = BerryJS._activeRequest || null;

    if (currentRequestCtx) {
      // Pre-process and store parameters on the request context
      processedParams = currentRequestCtx.queryParams =
        BerryJS.SyntaxAnalyzer.normalizeParameters(processedParams);
      // Attempt to retrieve an error handler from the request context if not provided
      onError = onError || currentRequestCtx.getOption('onFail');
    }

    // Default error handler if none is supplied
    const finalErrorHandler = onError || (() => {});

    // Manages success/error callbacks
    const responseProcessor = new BerryJS.BackendResponse(
      onSuccess,
      finalErrorHandler,
      currentRequestCtx
    );

    // If URI is not provided, construct it using the base URL and model's URI
    if (!resourceUri) {
      resourceUri = BerryJS.appSettings.baseUrl + this.resolveUri();
    }

    // Configure and execute the AJAX call
    const ajaxSettings = $.extend(
      true, // Deep merge
      {
        type: httpMethod,
        data: BerryJS.SyntaxAnalyzer.serializeParameters(processedParams),
        dataType: 'json',
        url: resourceUri,
        cache: false, // Prevents IE caching of GET requests
        beforeSend: function (xhr, settings) {
          if (currentRequestCtx) {
            currentRequestCtx.beforeAjaxCall();
          }
          // Optionally add an Authorization header or other custom headers
          // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
        complete: function (xhr, statusText) {
          if (currentRequestCtx) {
            currentRequestCtx.afterAjaxCall();
          }
        },
        success: function (dataResponse, textStatus, xhr) {
          responseProcessor.onSuccess.apply(currentRequestCtx || this, [dataResponse]);
        },
        error: function (xhr, textStatus, errorThrown) {
          responseProcessor.onError(xhr, textStatus);
        },
      },
      ajaxOptions || {}
    );
    $.ajax(ajaxSettings);
  },
};

// Server Response Handler Object
BerryJS.BackendResponse = function (successProcessor, errorProcessor, activeRequest) {
  this.onSuccess = successProcessor;
  this.onError = errorProcessor || {}; // Can be a function or an object mapping HTTP codes to functions
  this.requestContext = activeRequest;
};

BerryJS.BackendResponse.prototype = {
  onError: function (xhrObject, statusMessage) {
    const handlerContext = this.requestContext ? this.requestContext.viewComponent : this;

    // If the error processor is a direct function, execute it and return
    if (typeof this.onError === 'function') {
      this.onError.apply(window, [xhrObject, statusMessage]);
      return;
    }

    let errorMessage = '';
    const httpStatus = xhrObject.status;

    // Determine error message based on HTTP status
    switch (httpStatus) {
      case 0:
        errorMessage =
          'Connection failed. Please verify your network connection and try again.';
        break;
      case 200: // Although a 200, it might be a parser error or timeout for AJAX
        errorMessage =
          statusMessage === 'timeout'
            ? 'The server did not respond in time.'
            : 'There was an issue processing the server response (e.g., malformed JSON).';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 500:
        errorMessage = 'An internal server error occurred.';
        break;
      default:
        try {
          const responseJson = JSON.parse(xhrObject.responseText);
          errorMessage = responseJson.message || 'An unexpected server error occurred.';
        } catch (e) {
          errorMessage =
            xhrObject.responseText || `Server responded with status ${httpStatus}.`;
        }
    }

    const errorArguments = [errorMessage, httpStatus, xhrObject];

    // Attempt to call a custom universal error handler defined in the request context
    if (this.onError.all) {
      this.onError.all.apply(handlerContext, errorArguments);
      return;
    }

    // Call a custom error handler specific to the HTTP status code in the request context
    if (this.onError[httpStatus]) {
      this.onError[httpStatus].apply(handlerContext, errorArguments);
      return;
    }

    // Fallback to global error handlers defined in BerryJS settings
    if (BerryJS.appSettings.globalErrorHandler[httpStatus]) {
      BerryJS.appSettings.globalErrorHandler[httpStatus].apply(
        handlerContext,
        errorArguments
      );
      return;
    }

    // Finally, call the default global error handler
    BerryJS.appSettings.globalErrorHandler.default.apply(handlerContext, errorArguments);
  },
};

// Syntax and Data Parsing Utility
BerryJS.SyntaxAnalyzer = {
  // Improved type checking, including Array recognition
  getType: function (value) {
    if (value === null) return 'null';
    const baseType = typeof value;
    if (baseType === 'object') {
      if (Array.isArray(value)) return 'array';
      return 'object';
    }
    return baseType;
  },

  // Extracts the event name from a combined event string (e.g., "click .my-button")
  extractEventName: function (eventString) {
    const lastSpaceIndex = eventString.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? eventString : eventString.substring(lastSpaceIndex + 1);
  },

  // Determines the effective selector for an event listener
  resolveSelector: function (eventString, viewInstance) {
    const selectorPart = eventString.substring(0, eventString.lastIndexOf(' '));
    // If the selector doesn't start with '::', it's relative to the view's root node
    if (!selectorPart.startsWith('::')) {
      return `${viewInstance.node.selector} ${selectorPart}`;
    }
    // Otherwise, it's an absolute selector (remove '::' prefix)
    return selectorPart.substring(2);
  },

  // Resolves a string action path to a callable function
  resolveActionHandler: function (actionPath, contextObject) {
    // Handle external redirects
    if (actionPath.startsWith('http://') || actionPath.startsWith('https://')) {
      return {
        type: 'externalRedirect',
        execute: () => {
          window.location.href = actionPath;
        },
      };
    }

    let resolvedHandler = {};
    const pathParts = actionPath.split('.');

    if (pathParts.length > 1) {
      // Controller action
      const controllerName = pathParts[0];
      const actionName = pathParts[1];
      const controllerRef = BerryJS.controllers[controllerName];

      if (!controllerRef) {
        console.error(`Controller "${controllerName}" not found.`);
        return null;
      }
      if (typeof controllerRef[actionName] !== 'function') {
        console.error(
          `Action "${actionName}" not found in controller "${controllerName}".`
        );
        return null;
      }

      resolvedHandler = {
        scope: controllerRef,
        method: controllerRef[actionName],
        methodName: actionName,
        isControllerAction: true,
      };

      // Apply before filters if defined
      const beforeFilterConfig = controllerRef.before;
      if (beforeFilterConfig) {
        let filterFn = () => {};
        if (this.getType(beforeFilterConfig) === 'array') {
          const [actionsToFilter, filterMethodName] = beforeFilterConfig;
          if (actionsToFilter.includes(actionName)) {
            filterFn = controllerRef[filterMethodName];
          }
        } else if (typeof controllerRef[beforeFilterConfig] === 'function') {
          filterFn = controllerRef[beforeFilterConfig];
        }
        resolvedHandler.beforeFilter = filterFn;
      } else {
        resolvedHandler.beforeFilter = () => {}; // Default empty filter
      }
    } else {
      // View method or utility helper
      const methodName = actionPath;
      let targetScope = contextObject;

      if (!targetScope[methodName] && BerryJS.utilities.prototype) {
        targetScope = BerryJS.utilities.prototype; // Fallback to global utilities
      }

      if (typeof targetScope[methodName] !== 'function') {
        console.error(`Method "${methodName}" not found in context or utilities.`);
        return null;
      }

      resolvedHandler = {
        scope: targetScope,
        method: targetScope[methodName],
        methodName: methodName,
        isViewOrUtility: true,
      };
    }
    return resolvedHandler;
  },

  // Recursively builds a full URI path for nested models
  buildRecursiveUri: function (initialPath, currentEntity) {
    let finalPath = initialPath || '';
    if (currentEntity && typeof currentEntity.getUri === 'function') {
      finalPath = currentEntity.getUri() + finalPath;
    }
    if (currentEntity && currentEntity.parentEntity) {
      finalPath = this.buildRecursiveUri(finalPath, currentEntity.parentEntity);
    }
    return finalPath;
  },

  // Serializes an object into a URL-encoded string
  serializeObjectToUrl: function (dataValue, keyPrefix) {
    const resultParts = [];
    const currentPrefix = keyPrefix || '';

    switch (this.getType(dataValue)) {
      case 'array':
        for (let i = 0; i < dataValue.length; i++) {
          const elementSerialized = this.serializeObjectToUrl(
            dataValue[i],
            currentPrefix + '[]'
          );
          if (elementSerialized !== null) {
            resultParts.push(elementSerialized);
          }
        }
        return resultParts.length ? resultParts.join('&') : null;
      case 'object':
        for (const key in dataValue) {
          if (Object.prototype.hasOwnProperty.call(dataValue, key)) {
            const elementSerialized = this.serializeObjectToUrl(
              dataValue[key],
              currentPrefix ? `${currentPrefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key)
            );
            if (elementSerialized !== null) {
              resultParts.push(elementSerialized);
            }
          }
        }
        return resultParts.length ? resultParts.join('&') : null;
      case 'null':
      case 'undefined':
        return null; // Don't serialize null/undefined values
      default:
        return `${currentPrefix}=${encodeURIComponent(dataValue)}`;
    }
  },

  // Converts a jQuery form selection into a plain JavaScript object
  extractFormData: function (jQueryFormElement, rootPrefix) {
    const formData = {};
    jQueryFormElement.map(function () {
        return this.elements ? $.makeArray(this.elements) : this;
      })
      .filter(function () {
        // Filter for elements with a name, not disabled, and relevant types
        const tagName = this.nodeName.toLowerCase();
        const inputType = this.type ? this.type.toLowerCase() : '';
        const isSelectOrTextarea = tagName === 'select' || tagName === 'textarea';
        const isTextInput =
          inputType === 'text' ||
          inputType === 'hidden' ||
          inputType === 'password' ||
          inputType === 'search';

        return this.name && !this.disabled && (this.checked || isSelectOrTextarea || isTextInput);
      })
      .filter(BerryJS.appSettings.formInputFilter) // Apply custom filter
      .each(function (index, element) {
        const value = $(this).val();
        if (value !== null) {
          // Handle array-like names (e.g., "items[]")
          if (element.name.endsWith('[]')) {
            const arrayKey = element.name.slice(0, -2);
            // Ignore empty strings for array elements unless explicitly needed
            if (value === '') return;
            if (!formData[arrayKey]) {
              formData[arrayKey] = [];
            }
            formData[arrayKey].push(value);
          } else {
            formData[element.name] = value;
          }
        }
      });

    // Wrap in a root prefix object if specified
    return rootPrefix ? { [rootPrefix]: formData } : formData;
  },

  // Normalizes various parameter inputs (jQuery object, function, plain object) into a simple object
  normalizeParameters: function (inputParams) {
    if (typeof inputParams === 'function') {
      return inputParams.call(BerryJS._activeRequest); // Execute function in request context
    }
    if (inputParams instanceof $) {
      return this.extractFormData(inputParams);
    }
    return inputParams; // Assume it's already a plain object or string
  },

  // Serializes parameters into a URL-encoded string
  serializeParameters: function (inputParams) {
    if (typeof inputParams === 'string') {
      return inputParams; // Already serialized
    }
    const normalized = this.normalizeParameters(inputParams);
    return this.serializeObjectToUrl(normalized);
  },

  // Generates a broadcast name for the event bus from a handler object
  generateBroadcastName: function (handlerObj) {
    if (handlerObj.isControllerAction) {
      return `${handlerObj.scope.name}.${handlerObj.methodName}`;
    }
    // For view/utility methods, use view name if available, otherwise just method name
    return `${handlerObj.scope.name || 'View'}.${handlerObj.methodName}`;
  },

  // Gets the current Unix timestamp in milliseconds
  getCurrentTimestamp: function () {
    return Date.now();
  },

  // Counts enumerable properties of an object
  countObjectProperties: function (obj) {
    return Object.keys(obj).length;
  },
};

// Represents an active user interaction flow or request
BerryJS.InteractionFlow = function (
  eventSourceElement,
  domEvent,
  viewContext,
  actionOptions,
  originalCallback
) {
  const self = this; // Capture 'this' for closures
  this.domEvent = domEvent;
  this.viewComponent = viewContext;
  this.flowOptions = actionOptions;
  this.flowData = {}; // Data passed between chainable actions
  this.actionHandler = BerryJS.SyntaxAnalyzer.resolveActionHandler(
    this.flowOptions.action,
    this.viewComponent
  );
  this.pendingAjaxCalls = 0;
  this.flowId = BerryJS.SyntaxAnalyzer.getCurrentTimestamp();
  this.eventBlocker = null; // Used to temporarily stop event propagation
  this.triggerElement = $(this.domEvent.target);
  this.sourceElement = $(eventSourceElement);
  this._originalEventCallback = originalCallback; // Store original callback for re-binding

  // Auto-extract IDs from the source element's attributes
  $.each(this.sourceElement.get(0).attributes, function () {
    if (this.nodeName.endsWith('_id')) {
      self[this.nodeName] = parseInt(this.nodeValue, 10);
    }
  });
};

BerryJS.InteractionFlow.prototype = {
  // Allows chaining actions by returning a function that updates the request context
  continueWith: function (nextActionName) {
    return (responseData) => {
      this.flowData = responseData; // Update flow data with previous action's result
      this.actionHandler = BerryJS.SyntaxAnalyzer.resolveActionHandler(
        `${this.actionHandler.scope.name}.${nextActionName}`,
        this.actionHandler.scope // Preserve original scope for chained controller actions
      );
      BerryJS._activeRequest = this; // Set global active request context
      this.executeCurrentAction();
      // Clean up if all AJAX calls are done after this action
      if (this.pendingAjaxCalls === 0) {
        this.finalizeFlow();
      }
      delete BerryJS._activeRequest; // Clear global context
    };
  },

  // Publishes the current flow data to the event bus
  broadcastResult: function (payloadOverride) {
    const finalPayload = payloadOverride || this.flowData;
    const broadcastTopic = BerryJS.SyntaxAnalyzer.generateBroadcastName(this.actionHandler);

    if (this.flowOptions.subscribe) {
      // If a specific callback is defined on the view, invoke it
      const viewCallback = this.viewComponent[this.flowOptions.callback];
      if (typeof viewCallback === 'function') {
        viewCallback.apply(this.viewComponent, [this, broadcastTopic]);
      } else {
        console.warn(
          `View callback "${this.flowOptions.callback}" not found for subscription.`
        );
      }
    }
    CoreJS.eventBus.signal(broadcastTopic, this); // Use the renamed event bus
  },

  // Retrieves an option, resolving string paths to functions if necessary
  getOption: function (optionKey) {
    const optionValue = this.flowOptions[optionKey];
    if (optionValue === undefined || optionValue === null) {
      return null;
    }
    // If it's an object, return it directly (e.g., config objects)
    if (BerryJS.SyntaxAnalyzer.getType(optionValue) === 'object') {
      return optionValue;
    }
    // If it's a string, try to resolve it as a handler function
    if (typeof optionValue === 'string') {
      const resolved = BerryJS.SyntaxAnalyzer.resolveActionHandler(optionValue, this.viewComponent);
      return resolved ? resolved.method : null;
    }
    // Otherwise, return the value as is (e.g., boolean, number, direct function)
    return optionValue;
  },

  // Extracts parameters from the view's context, optionally filtered
  getParameters: function (rootPrefix, specificContext) {
    const paramPrefix = rootPrefix || this.flowOptions.paramsPrefix;
    const contextNode = specificContext || this.viewComponent.node;

    // Use the context specified in options, or the view's root node
    let sourceForParams = this.flowOptions.paramsContext;
    if (sourceForParams instanceof $) {
      // If it's a jQuery object, use it directly
    } else if (typeof sourceForParams === 'string') {
      // If it's a string, attempt to resolve it relative to the view
      sourceForParams = $(sourceForParams, this.viewComponent.node);
    } else {
      // Default to finding a form within the view's context
      sourceForParams = $('form', contextNode);
    }

    let extractedParams = BerryJS.SyntaxAnalyzer.extractFormData(sourceForParams, paramPrefix);

    // Apply a custom processor if defined in options
    const paramProcessor = this.getOption('paramsProcessor');
    if (typeof paramProcessor === 'function') {
      extractedParams = paramProcessor(extractedParams);
    }
    return extractedParams;
  },

  // Executes the action associated with this flow
  executeCurrentAction: function () {
    if (!this.actionHandler || !this.actionHandler.method) {
      console.error('Invalid action handler for flow ID:', this.flowId);
      return;
    }

    try {
      this.viewComponent.activeRequests[this.flowId] = this; // Register this flow with the view
      if (this.actionHandler.isViewOrUtility) {
        // Direct method call on view or utility
        this.actionHandler.method.apply(this.viewComponent, [this]);
      } else if (this.actionHandler.isControllerAction) {
        // Controller action with before filter
        this.currentController = this.actionHandler.scope; // Provide shortcut
        if (this.actionHandler.beforeFilter) {
          this.actionHandler.beforeFilter.apply(this); // Execute before filter
        }
        this.actionHandler.method.apply(this); // Execute controller action
      }
    } catch (flowError) {
      if (flowError === 'FLOW_HALT') {
        return; // Custom exception to stop flow execution
      }
      console.error('Error during action execution for flow ID', this.flowId, ':', flowError);
      throw flowError; // Re-throw if not a recognized halt
    }
  },

  // Called before each AJAX request initiated by this flow
  beforeAjaxCall: function () {
    const beforeHook = this.getOption('beforeEachAjax');
    if (typeof beforeHook === 'function') {
      beforeHook.apply(this.viewComponent, [this]);
    }
    this.pendingAjaxCalls++;
    if (this.flowOptions.disableEvents && this.pendingAjaxCalls === 1) {
      this.blockEventPropagation();
    }
    if (this.flowOptions.showLoader) {
      this.viewComponent.showLoadingIndicator();
    }
  },

  // Called after each AJAX request completes
  afterAjaxCall: function () {
    this.pendingAjaxCalls--;
    const afterHook = this.getOption('afterEachAjax');
    if (typeof afterHook === 'function') {
      afterHook.apply(this.viewComponent, [this]);
    }

    // If all AJAX calls for this flow are complete
    if (this.pendingAjaxCalls === 0) {
      if (this.flowOptions.disableEvents) {
        this.unblockEventPropagation();
      }
      // If this is the *only* active request for the view, handle global cleanup
      if (this.viewComponent.countActiveRequests() === 1) {
        const afterAllHook = this.getOption('afterAllAjax') || this.viewComponent.hideLoadingIndicator;
        if (typeof afterAllHook === 'function') {
          afterAllHook.apply(this.viewComponent);
        }
      }
      this.finalizeFlow();
    }
  },

  // Cleans up the request context
  finalizeFlow: function () {
    this.destroyFlowInstance();
  },

  // Removes this flow instance from the view's active requests
  destroyFlowInstance: function () {
    delete this.viewComponent.activeRequests[this.flowId];
  },

  // Temporarily stops event propagation for the trigger element
  blockEventPropagation: function () {
    if (this.flowOptions.useLiveDelegation) {
      this.eventBlocker = (e) => {
        e.stopImmediatePropagation();
        return false;
      };
      this.triggerElement.on(this.domEvent.type, this.eventBlocker); // Use .on() for modern jQuery
    } else {
      // For direct event handlers, unbind and re-bind later
      this.sourceElement.off(this.domEvent.type, this._originalEventCallback);
    }
  },

  // Re-enables event propagation
  unblockEventPropagation: function () {
    if (this.flowOptions.useLiveDelegation) {
      this.triggerElement.off(this.domEvent.type, this.eventBlocker);
      this.eventBlocker = null;
    } else {
      this.sourceElement.on(this.domEvent.type, this._originalEventCallback);
    }
  },
};

// Data Model Definition Utility
BerryJS.dataModels = function (modelName, configA, configB) {
  let modelDefinition;
  let inheritedAssociations = {};

  // Handle inheritance: BerryJS.dataModels('Child', 'Parent', { ... })
  if (typeof configA === 'string') {
    const parentModel = BerryJS.dataModels[configA];
    if (parentModel && parentModel.associations) { // Renamed 'has' to 'associations'
      inheritedAssociations = parentModel.associations;
    } else if (!parentModel) {
      console.warn(`Parent model "${configA}" not found for "${modelName}".`);
    }
    modelDefinition = configB;
  } else {
    modelDefinition = configA;
  }

  // Create a new model instance inheriting from BerryJS.dataModels.prototype
  const newModelInstance = Object.create(BerryJS.dataModels.prototype);
  newModelInstance.modelName = modelName;
  newModelInstance.dataLink = new BerryJS.DataLink(newModelInstance);

  // Merge inherited and current model associations
  modelDefinition.associations = Object.assign({}, inheritedAssociations, modelDefinition.associations); // Renamed 'has'

  // Extend the new instance with the model definition
  BerryJS.dataModels[modelName] = Object.assign(newModelInstance, modelDefinition);
};

// Base methods for all BerryJS data models
BerryJS.dataModels.prototype = {
  modelName: null,
  entityType: 'dataModel', // Renamed 'type'
  dataLink: null, // Renamed 'connector'
  associations: {}, // Renamed 'has'
  isBoundToInstance: false, // Renamed 'bound' - indicates if it's an instance or static model

  /**
   * Finds data for the model.
   * Can be:
   * - find(id, success, error, options)
   * - find('all', success, error, options)
   * - find('all', params, success, error, options)
   */
  find: function (queryIdentifier, arg1, arg2, arg3, arg4) {
    if (typeof queryIdentifier === 'number' || typeof queryIdentifier === 'string') {
      let instanceModel;
      let successCb, errorCb, reqOpts;

      if (typeof queryIdentifier === 'number') {
        // Case: find(id, success, error, options)
        instanceModel = this.byId(queryIdentifier);
        successCb = arg1;
        errorCb = arg2;
        reqOpts = arg3;
      } else if (queryIdentifier === 'all') {
        if (typeof arg1 === 'function') {
          // Case: find('all', success, error, options) - no params
          successCb = arg1;
          errorCb = arg2;
          reqOpts = arg3;
        } else {
          // Case: find('all', params, success, error, options)
          successCb = arg2;
          errorCb = arg3;
          reqOpts = arg4;
          instanceModel = { queryParams: arg1 }; // Temporary object to hold params for connector
        }
      } else {
        console.warn(`Unsupported query identifier for find: ${queryIdentifier}`);
        return;
      }

      // If an instance model (with an ID) was created or implied, use its connector
      const targetConnector = instanceModel ? instanceModel.dataLink : this.dataLink;
      const paramsToSend = instanceModel && instanceModel.queryParams ? instanceModel.queryParams : null;

      if (successCb) {
        return targetConnector.fetch(paramsToSend, successCb, errorCb, reqOpts);
      } else if (instanceModel) {
        return instanceModel; // Return the model instance if no callback for direct use
      }
    } else {
      console.error(`Invalid first argument for find method: ${queryIdentifier}`);
    }
  },

  // Creates a new model instance on the server
  createRecord: function (payload, successCb, errorCb, requestOpts) {
    if (this.isBoundToInstance) {
      console.warn('Cannot call createRecord on an already bound model instance. Use updateRecord instead.');
      return;
    }
    return this.dataLink.create(payload, successCb, errorCb, requestOpts);
  },

  // Updates an existing model instance on the server
  updateRecord: function (payload, successCb, errorCb, requestOpts) {
    if (!this.isBoundToInstance) {
      console.warn('Cannot call updateRecord on an unbound model. Use createRecord or find/byId first.');
      return;
    }
    return this.dataLink.update(payload, successCb, errorCb, requestOpts);
  },

  // Deletes an existing model instance from the server
  deleteRecord: function (successCb, errorCb, requestOpts) {
    if (!this.isBoundToInstance) {
      console.warn('Cannot delete an unbound model. Ensure the model is bound to an instance (e.g., via byId).');
      return;
    }
    return this.dataLink.remove(successCb, errorCb, requestOpts);
  },

  // Generates a URI segment for this specific model instance
  getUri: function () {
    // This method is intended to be overridden by specific models to provide their URI logic.
    // For example: return `/api/${this.modelName.toLowerCase()}/${this.id}`;
    console.warn(`getUri method not implemented for model "${this.modelName}".`);
    return '';
  },
  
  // Helper to get a model instance by ID (for internal use, e.g., by find method)
  byId: function(instanceId) {
    if (typeof instanceId === 'number' || typeof instanceId === 'string') {
      const instance = Object.create(this); // Create a new instance inheriting from the static model
      instance.id = instanceId;
      instance.isBoundToInstance = true;
      instance.dataLink = new BerryJS.DataLink(instance); // Re-bind dataLink to the instance
      return instance;
    }
    console.error('Invalid ID provided for byId method.');
    return null;
  }
};