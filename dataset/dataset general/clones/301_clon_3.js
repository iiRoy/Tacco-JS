(function (globalScope) {
  // A robust cross-domain messaging framework v2.1.0
  // This module facilitates secure communication between different origins.

  // Prevent re-initialization if the library is already loaded
  if (globalScope.interFrame) {
    return;
  }

  // --- Internal State Variables ---
  // Stores active communication channel handlers keyed by session token.
  // Each entry is an array: [messageProcessorFunction, contextInstance]
  const activeChannels = {};
  // Queue for callbacks waiting for the runtime context (environment) to be ready.
  // Each entry is an array: [contextInstance, callbackFunction]
  const pendingContextCallbacks = [];
  // The shared runtime environment for communication, including JSON utilities.
  const runtimeContext = {};

  // --- Utility Functions ---

  /**
   * Generates a unique, short alphanumeric session token.
   * @returns {string} A 5-character hexadecimal token.
   */
  function generateSessionToken() {
    let currentToken = '';
    const tokenLength = 5; // A short token for efficiency, might be extended for higher security
    for (let charIndex = 0; charIndex < tokenLength; charIndex++) {
      // Use Math.random() to generate a number, convert to base 16 (hexadecimal).
      // Adding a timestamp component for slightly improved uniqueness, though not strictly random.
      currentToken += Math.floor(Math.random() * 16).toString(16);
    }
    // Truncate or pad to ensure exact length if the above logic doesn't guarantee it.
    // For 5 chars, Math.floor(Math.random() * 16) is fine.
    return currentToken.substring(0, tokenLength);
  }

  /**
   * Asynchronously waits for a specific property to become available on an object, then executes a callback.
   * Uses setTimeout for non-blocking polling.
   * @param {object} targetObject The object to monitor.
   * @param {string} propertyName The name of the property to wait for.
   * @param {Function} completionCallback The function to call once the property is available.
   * @param {object} contextInstance The 'this' context for the completionCallback.
   * @param {number} [attemptCount=0] Internal counter for retry attempts.
   */
  function awaitProperty(targetObject, propertyName, completionCallback, contextInstance, attemptCount = 0) {
    if (targetObject && targetObject[propertyName]) {
      completionCallback.apply(contextInstance);
    } else {
      const maxRetries = 1000; // Define a maximum number of retries to prevent infinite loops
      if (attemptCount < maxRetries) {
        // Defer the check to the next event loop cycle.
        setTimeout(() => {
          awaitProperty(targetObject, propertyName, completionCallback, contextInstance, attemptCount + 1);
        }, 5); // Increased timeout slightly for less aggressive polling
      } else {
        // Optionally, log an error or call a fallback if max retries reached
        console.warn(`InterFrame: Max retries (${maxRetries}) reached for property '${propertyName}' on target object.`);
      }
    }
  }

  /**
   * Dynamically injects a script tag into the document head.
   * @param {string} [scriptSourceUrl] The URL of the script to load. Defaults to interFrame.auxiliaryScriptUrl.
   */
  function injectExternalScript(scriptSourceUrl) {
    // Defer script injection to avoid blocking initial rendering.
    setTimeout(() => {
      const dynamicScriptElement = globalScope.document.createElement('script');
      dynamicScriptElement.type = 'text/javascript';
      dynamicScriptElement.src = scriptSourceUrl || globalScope.interFrame.auxiliaryScriptUrl;
      dynamicScriptElement.async = true; // Add async attribute for non-blocking load

      // Ensure the 'body' element is available before appending the script.
      awaitProperty(globalScope.document, 'body', () => {
        const headElement = globalScope.document.getElementsByTagName('HEAD')[0];
        if (headElement) {
          headElement.appendChild(dynamicScriptElement);
        } else {
          globalScope.document.body.appendChild(dynamicScriptElement); // Fallback if HEAD is somehow missing
        }
      });
    }, 10); // A small delay to ensure DOM is ready for script insertion
  }

  // --- Runtime Context Management ---

  /**
   * Retrieves the current runtime context, executing a callback when it's ready.
   * @param {Function} operationHandler The function to call with the runtime context.
   * @param {object} contextInstance The 'this' context for the operationHandler.
   */
  function retrieveRuntimeContext(operationHandler, contextInstance) {
    if (runtimeContext.isReady) {
      operationHandler.apply(contextInstance, [runtimeContext]);
    } else {
      pendingContextCallbacks.push([contextInstance, operationHandler]);
    }
  }

  /**
   * Marks the runtime context as loaded and executes all pending callbacks.
   */
  function markContextReady() {
    runtimeContext.isReady = true;
    if (pendingContextCallbacks.length > 0) {
      // Process callbacks in the order they were added.
      for (let i = 0; i < pendingContextCallbacks.length; i++) {
        const [instance, handler] = pendingContextCallbacks[i];
        handler.apply(instance, [runtimeContext]);
      }
      // Clear the queue after processing.
      pendingContextCallbacks.length = 0;
    }
  }

  // --- Remote Method Invocation Logic ---

  /**
   * Processes an incoming serialized method call payload.
   * @param {string} serializedPayload The stringified data representing the method call.
   * @param {object} contextInstance The specific HostGateway or GuestConnector instance.
   */
  function processRemoteCall(serializedPayload, contextInstance) {
    retrieveRuntimeContext(function (currentEnv) {
      let deserializedData;
      try {
        deserializedData = currentEnv.json.parse(serializedPayload);
      } catch (parseError) {
        console.error("InterFrame: Failed to parse remote call payload:", parseError, serializedPayload);
        return; // Abort if parsing fails
      }

      // Ensure deserializedData is an array with at least the method name.
      if (!Array.isArray(deserializedData) || deserializedData.length === 0) {
        console.error("InterFrame: Invalid remote call format. Expected array.", deserializedData);
        return;
      }

      const [actionName, invocationArguments = []] = deserializedData;

      // Process any function placeholders within the arguments.
      // This allows remote callbacks to be invoked.
      for (let argIndex = 0; argIndex < invocationArguments.length; argIndex++) {
        const arg = invocationArguments[argIndex];
        if (typeof arg === 'object' && arg !== null && arg._remoteCbId) {
          const remoteCallbackId = arg._remoteCbId;
          invocationArguments[argIndex] = function () {
            const callbackArgs = Array.from(arguments);
            // Prepend the special identifier for remote callback invocation.
            callbackArgs.unshift('_remoteCb' + remoteCallbackId);
            contextInstance.invokeRemoteAction.apply(contextInstance, callbackArgs);
          };
        }
      }

      // Defer the method execution to avoid blocking the message handler.
      setTimeout(() => {
        const targetMethod = contextInstance.registeredActions[actionName];
        if (typeof targetMethod !== 'function') {
          console.error(`InterFrame: Remote method '${actionName}' is not defined or is not a function on this instance.`);
          // Optionally, throw an error or send a negative acknowledgment back.
          return;
        }
        try {
          targetMethod.apply(contextInstance, invocationArguments);
        } catch (methodError) {
          console.error(`InterFrame: Error executing remote method '${actionName}':`, methodError);
        }
      }, 0);
    }, contextInstance);
  }

  // --- Main InterFrame API Object ---
  const interFrame = {
    // Internal counter for unique instance IDs.
    _instanceCounter: 0,
    // Default URL for the auxiliary script (e.g., JSON polyfill, PostMessage fallback).
    auxiliaryScriptUrl: 'http://example.com/js/interFrameHelper.js',

    // --- Host Gateway (Server) Constructor ---
    /**
     * Creates a new Host Gateway instance to serve methods to guest frames.
     * @param {object} methods A collection of functions exposed to the guest.
     * @param {Function} [originValidator] An optional function to validate the origin of incoming messages.
     */
    HostGateway: function (methods, originValidator) {
      // Ensure methods is an object.
      this.registeredActions = methods || {};
      this.instanceId = interFrame._instanceCounter++;
      this.originValidator = originValidator;
      this.sessionToken = generateSessionToken();
      this.isHost = true; // Flag to identify this instance as a host.

      // Register an internal initialization method.
      this.registeredActions['%init%'] = function () {
        interFrame.executeEventHooks(this.instanceId);
        if (typeof this.registeredActions['onInitialized'] === 'function') {
          this.registeredActions['onInitialized']();
        }
      };
      // For backward compatibility or alternative init names, keep the original '__fxdm_i' mapping.
      this.registeredActions['__fxdm_i'] = this.registeredActions['%init%'];


      this.gatewayFrameName = `iFm${this.sessionToken}`; // Name for the iframe.
      activeChannels[this.sessionToken] = [processRemoteCall, this];
    },

    // --- Guest Connector (Client) Constructor ---
    /**
     * Creates a new Guest Connector instance to interact with a host frame.
     * @param {object} methods A collection of functions exposed to the host (for callbacks).
     */
    GuestConnector: function (methods) {
      this.registeredActions = methods || {};
      this.instanceId = interFrame._instanceCounter++;
      this.isGuest = true; // Flag to identify this instance as a guest.

      interFrame.executeEventHooks(this.instanceId);

      // Extract session token from the window name.
      if (globalScope.name && globalScope.name.startsWith('iFm')) {
        this.sessionToken = globalScope.name.substring(3);
      } else {
        throw new Error('InterFrame: Guest connector must be initialized within a named iframe (e.g., name="iFm<token>").');
      }
      this.parentWindowRef = globalScope.parent; // Reference to the parent window.
      activeChannels[this.sessionToken] = [processRemoteCall, this];

      // Hook into the 'helper' event to perform client-side initialization.
      interFrame.registerEventHook('helperReady', () => {
        interFrame.onClientStartup(this);
      }, this);

      retrieveRuntimeContext((currentEnv) => {
        let initAction = '%init%';
        // Example: Conditional initialization based on domain.
        // This specific condition is for demonstration and would typically be configured or removed.
        if (globalScope.location.hostname === 'example.special.domain') {
          initAction = '__fxdm_i'; // Use alternative init for specific domains.
        }

        // Send initial handshake message to the host.
        currentEnv.sendMessage(this, currentEnv.json.stringify([initAction]));

        // Defer onInitialized callback to ensure initial message is sent.
        setTimeout(() => {
          if (typeof this.registeredActions['onInitialized'] === 'function') {
            this.registeredActions['onInitialized']();
          }
        }, 0);
      }, this);
    },

    // --- Message Handling ---
    /**
     * Global message handler for incoming postMessage events.
     * @param {MessageEvent} messageEvent The incoming message event object.
     */
    handleIncomingMessage: function (messageEvent) {
      // Basic validation: ensure data exists and is a string.
      if (!messageEvent.data || typeof messageEvent.data !== 'string') {
        return false;
      }

      // The first 5 characters of the data are expected to be the session token.
      const incomingToken = messageEvent.data.substring(0, 5);
      const channelHandler = activeChannels[incomingToken];

      if (channelHandler) {
        const [processorFunc, contextInstance] = channelHandler;
        // Apply origin validation if a validator function is provided.
        if (contextInstance && (!contextInstance.originValidator || contextInstance.originValidator(messageEvent.origin))) {
          processorFunc(messageEvent.data.substring(6), contextInstance); // Skip token and separator.
        } else {
          console.warn(`InterFrame: Message from untrusted origin '${messageEvent.origin}' blocked for token '${incomingToken}'.`);
        }
      }
    },

    // --- JSON Serialization/Deserialization ---
    /**
     * Sets the JSON utility object for serialization/deserialization.
     * @param {object} jsonUtility An object with 'parse' and 'stringify' methods.
     */
    setJsonProcessor: function (jsonUtility) {
      runtimeContext.json = jsonUtility;
    },

    /**
     * Retrieves the current JSON utility object.
     * @param {Function} [operationHandler] Optional callback to receive the JSON utility asynchronously.
     * @returns {object|void} The JSON utility if no callback is provided.
     */
    getJsonProcessor: function (operationHandler) {
      if (!operationHandler) {
        return runtimeContext.json;
      }
      retrieveRuntimeContext((currentEnv) => {
        operationHandler(currentEnv.json);
      });
    },

    /**
     * Updates the shared runtime context with additional environment properties.
     * @param {object} externalEnvProperties An object containing properties to add to the runtime context.
     */
    updateRuntimeContext: function (externalEnvProperties) {
      if (typeof externalEnvProperties !== 'object' || externalEnvProperties === null) {
        console.warn("InterFrame: Attempted to set invalid external environment properties.");
        return;
      }
      for (const propName in externalEnvProperties) {
        if (Object.prototype.hasOwnProperty.call(externalEnvProperties, propName)) {
          runtimeContext[propName] = externalEnvProperties[propName];
        }
      }
      markContextReady(); // Mark context as ready after update.
    },

    // --- Event Queue System ---
    // Stores deferred events and their handlers.
    deferredEvents: {},

    /**
     * Registers a handler for a specific event key.
     * If the event has already "run", the handler is executed immediately.
     * @param {string} eventKey The unique key for the event.
     * @param {Function} actionHandler The function to execute when the event occurs.
     * @param {object} contextInstance The 'this' context for the actionHandler.
     */
    registerEventHook: function (eventKey, actionHandler, contextInstance) {
      if (!this.deferredEvents[eventKey]) {
        this.deferredEvents[eventKey] = [];
      }

      // If the event has already been triggered (-1 signifies triggered)
      if (this.deferredEvents[eventKey] === -1) {
        actionHandler.apply(contextInstance);
      } else {
        this.deferredEvents[eventKey].push([actionHandler, contextInstance]);
      }
    },

    /**
     * Triggers all registered handlers for a given event key and marks the event as "run".
     * @param {string} eventKey The unique key for the event to trigger.
     */
    executeEventHooks: function (eventKey) {
      const eventHandlers = this.deferredEvents[eventKey];
      if (Array.isArray(eventHandlers) && eventHandlers.length > 0) {
        for (let i = 0; i < eventHandlers.length; i++) {
          const [handler, instance] = eventHandlers[i];
          handler.apply(instance);
        }
      }
      this.deferredEvents[eventKey] = -1; // Mark as executed.
    },

    // Expose the internal awaitProperty utility.
    awaitProperty: awaitProperty
  };

  globalScope.interFrame = interFrame;

  // --- Host Gateway Prototype Methods ---
  interFrame.HostGateway.prototype.initiateConnection = function (iframeElement, attemptCount = 0) {
    if (iframeElement && iframeElement.contentWindow) {
      this.parentWindowRef = iframeElement.contentWindow; // Renamed for consistency.
      this.frameElement = iframeElement;

      interFrame.registerEventHook('helperReady', () => {
        interFrame.onHostStartup(this);
      }, this);

    } else {
      // Handle cases where contentWindow might not be immediately available (e.g., Opera old versions).
      // This part is a direct translation of the original's polling logic.
      const self = this; // Capture 'this' for the setTimeout callback.
      const maxAttempts = 50;
      if (attemptCount < maxAttempts) {
        setTimeout(() => {
          self.initiateConnection(iframeElement, attemptCount + 1);
        }, 100);
      } else {
        console.error(`InterFrame: Failed to get contentWindow for iframe after ${maxAttempts} attempts.`);
      }
    }
  };

  interFrame.HostGateway.prototype.terminateConnection = function () {
    // Correctly remove the handler from the activeChannels object.
    if (this.sessionToken && activeChannels[this.sessionToken]) {
      delete activeChannels[this.sessionToken];
      // Optionally, clear other references like this.parentWindowRef, this.frameElement.
      this.parentWindowRef = null;
      this.frameElement = null;
      console.log(`InterFrame: Host gateway with token ${this.sessionToken} terminated.`);
    }
  };

  /**
   * Merges properties from a source object into a target object recursively.
   * @param {object} targetObj The object to extend.
   * @param {object} sourceObj The object whose properties will be copied.
   */
  function deepMerge(targetObj, sourceObj) {
    if (typeof targetObj !== 'object' || targetObj === null || typeof sourceObj !== 'object' || sourceObj === null) {
      return; // Only merge objects.
    }
    for (const prop in sourceObj) {
      if (Object.prototype.hasOwnProperty.call(sourceObj, prop)) {
        if (targetObj[prop] && typeof targetObj[prop] === 'object' && typeof sourceObj[prop] === 'object' && !Array.isArray(targetObj[prop]) && !Array.isArray(sourceObj[prop])) {
          deepMerge(targetObj[prop], sourceObj[prop]);
        } else {
          targetObj[prop] = sourceObj[prop];
        }
      }
    }
  }

  interFrame.HostGateway.prototype.embedGatewayFrame = function (parentElement, frameOptions) {
    const containerDiv = globalScope.document.createElement('DIV');
    // Sanitize frame name to prevent XSS if it were user-controlled (here it's internal).
    const frameNameSanitized = this.gatewayFrameName.replace(/"/g, '&quot;');
    containerDiv.innerHTML = `<iframe name="${frameNameSanitized}" title="InterFrame Communication Gateway" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
    const iframeRef = containerDiv.firstChild;

    // Defer frame setup to ensure DOM is ready and to prevent blocking.
    setTimeout(() => {
      iframeRef.frameBorder = '0';
      iframeRef.allowTransparency = 'true'; // Add a common iframe attribute.
      if (frameOptions) {
        deepMerge(iframeRef, frameOptions); // Apply custom options.
      }
      if (parentElement && parentElement.insertBefore) {
        parentElement.insertBefore(iframeRef, parentElement.firstChild);
      } else {
        // Fallback or error if parentElement is invalid.
        console.error("InterFrame: Invalid parent element provided for embedding gateway frame.");
        return;
      }
      this.initiateConnection(iframeRef);
    }, 0);
    return iframeRef;
  };

  // --- Common Method for Remote Invocation ---
  interFrame.GuestConnector.prototype.invokeRemoteAction = interFrame.HostGateway.prototype.invokeRemoteAction = function () {
    const invocationArguments = Array.from(arguments); // Modern way to convert arguments to array.
    const actionName = invocationArguments.shift(); // The first argument is the method name.

    // Process arguments to replace functions with placeholders for remote callbacks.
    for (let i = 0; i < invocationArguments.length; i++) {
      if (typeof invocationArguments[i] === 'function') {
        this.remoteCallbackCounter = (this.remoteCallbackCounter || 0) + 1;
        const originalCallback = invocationArguments[i];
        const callbackRefName = '_remoteCb' + this.remoteCallbackCounter;

        // Register a temporary method on this instance to handle the remote callback.
        this.registeredActions[callbackRefName] = function () {
          originalCallback.apply(this, arguments);
          // Clean up the temporary callback after it's used (assuming one-time use).
          delete this.registeredActions[callbackRefName];
        };
        // Replace the function in the arguments with a placeholder object.
        invocationArguments[i] = { _remoteCbId: this.remoteCallbackCounter };
      }
    }

    // Ensure the `parentWindowRef` (caller) is available before attempting to send.
    awaitProperty(this, 'parentWindowRef', () => {
      interFrame.registerEventHook(this.instanceId, () => {
        retrieveRuntimeContext((currentEnv) => {
          try {
            const serializedPayload = currentEnv.json.stringify([actionName, invocationArguments]);
            currentEnv.sendMessage(this, serializedPayload);
          } catch (serializeError) {
            console.error("InterFrame: Failed to serialize remote action payload:", serializeError, [actionName, invocationArguments]);
          }
        }, this);
      }, this);
    }, this);
  };

  // --- Initial JSON Processor Setup ---
  // Check for native JSON support.
  if (globalScope.JSON && typeof globalScope.JSON === 'object' &&
    typeof globalScope.JSON.parse === 'function' &&
    typeof globalScope.JSON.stringify === 'function') {
    // Basic test to ensure stringify works as expected (handles arrays, no extra spaces).
    try {
      if (globalScope.JSON.stringify({ a: [1, 2, 3] }).replace(/ /g, '') === '{"a":[1,2,3]}') {
        runtimeContext.json = { parse: globalScope.JSON.parse, stringify: globalScope.JSON.stringify };
      } else {
        // Fallback if stringify behaves unexpectedly, though rare.
        interFrame._needsJsonPolyfill = true;
      }
    } catch (e) {
      interFrame._needsJsonPolyfill = true; // If JSON.stringify fails on a basic object.
    }
  } else {
    interFrame._needsJsonPolyfill = true;
  }

  // --- PostMessage Implementation or Fallback ---
  if (globalScope.postMessage) {
    runtimeContext.communicationProtocol = 'postMessage';
    runtimeContext.sendMessage = function (commInstance, serializedData) {
      // The targetOrigin is important for security. Using "*" for broadest compatibility,
      // but in production, a specific origin should be used if known.
      commInstance.parentWindowRef.postMessage(commInstance.sessionToken + ':' + serializedData, "*");
    };

    // Attach message event listener.
    if (globalScope.addEventListener) {
      globalScope.addEventListener("message", interFrame.handleIncomingMessage, false);
    } else if (globalScope.attachEvent) { // IE < 9
      globalScope.attachEvent("onmessage", interFrame.handleIncomingMessage);
    } else {
      // Fallback for extremely old browsers, though postMessage likely won't exist.
      console.warn("InterFrame: No suitable event listener mechanism found for 'message' events.");
    }

    if (interFrame._needsJsonPolyfill) {
      interFrame._postMessageRequiresJsonPolyfill = true;
      injectExternalScript(); // Load helper script for JSON polyfill.
    } else {
      markContextReady(); // If JSON is ready, the environment is good to go.
    }
  } else {
    // Fallback to iframe/script based communication if postMessage is not available.
    // This typically involves loading a helper script that implements alternative communication.
    injectExternalScript();
    // In this fallback scenario, the helper script itself would call updateRuntimeContext and markContextReady.
    interFrame._usingLegacyComm = true;
  }

  // Define onHostStartup and onClientStartup methods for the interFrame object,
  // which can be overridden or used by the helper script.
  interFrame.onHostStartup = function (hostInstance) {
    // This method can be implemented by the helper script or external code.
    // For now, it just triggers the instance's event hooks.
    interFrame.executeEventHooks(hostInstance.instanceId);
  };

  interFrame.onClientStartup = function (clientInstance) {
    // Similar to onHostStartup, for client-side initialization after helper is ready.
    interFrame.executeEventHooks(clientInstance.instanceId);
  };

})(window);