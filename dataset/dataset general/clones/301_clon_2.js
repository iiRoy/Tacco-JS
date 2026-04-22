(function(globalObject) {
// Check if the cross-domain messenger is already initialized
if (globalObject.crossDomainMessenger) return;

// Stores message handlers by a unique identifier
var messageProcessors = {};
// Queue for actions to perform once the environment is ready
var environmentLoadCallbacks = [];
// Encapsulates environment-specific settings and utilities
var executionEnvironment = {};

// Function to produce a unique session identifier
function generateSessionKey()
{
  var uniqueId = '';  // Initialize a string for the unique ID
  for (var index = 0; index < 5; index++) { // Iterate a fixed number of times
    uniqueId += Math.ceil(Math.random() * 15).toString(16); // Append a random hex digit
  }
  return uniqueId; // Return the generated ID string
}

// Delays execution until a specific property is available on an object
function awaitPropertyAvailability(targetObject, propertyName, actionFunction, contextObject, retryCount)
{
  if (targetObject[propertyName]) { // Check if the desired property exists
    actionFunction.apply(contextObject); // Execute the function with the given context
  }
  else
  {
    retryCount = retryCount || 0; // Initialize retry counter if not provided
    if (retryCount < 1000) // Prevent infinite loops
    {
      setTimeout(function() { // Schedule a retry after a short delay
        awaitPropertyAvailability(targetObject, propertyName, actionFunction, contextObject, retryCount + 1);
      }, 0);
    }
  }
}

// Dynamically injects a JavaScript file into the document
function injectScriptResource(scriptSourceUrl)
{
  setTimeout(function() { // Defer script injection
    var scriptElement = document.createElement('script'); // Create a new script DOM element
    scriptElement.type = 'text/javascript'; // Specify script type
    scriptElement.src = scriptSourceUrl || globalObject.crossDomainMessenger.auxiliaryScriptPath; // Set the source URL
    awaitPropertyAvailability(document, 'body', function() { // Wait for the document body to be ready
      document.getElementsByTagName('HEAD')[0].appendChild(scriptElement); // Append the script to the head
    });
  }, 0);
}

// Environment management routines
// Retrieves the current environment or queues a callback if not yet loaded
function fetchExecutionEnvironment(responseCallback, callingContext)
{
  if (executionEnvironment.isReady) { // Check if environment is already initialized
    responseCallback.apply(callingContext, [executionEnvironment]); // Execute callback immediately
  }
  else
  {
    environmentLoadCallbacks.push([callingContext, responseCallback]); // Queue callback for later execution
  }
}

// Marks the environment as loaded and processes any pending callbacks
function notifyEnvironmentReady()
{
  executionEnvironment.isReady = true; // Set environment status to ready
  if (environmentLoadCallbacks.length > 0) { // If there are pending callbacks
    for (var callbackIndex in environmentLoadCallbacks) { // Iterate through queued callbacks
        environmentLoadCallbacks[callbackIndex][1].apply(environmentLoadCallbacks[callbackIndex][0], [executionEnvironment]);
    }
  }
}

// Processes incoming serialized data and executes the corresponding method
function processIncomingInvocation(serializedPayload, currentInstance)
{
  fetchExecutionEnvironment(function(currentEnvironment) { // Ensure environment is ready
    var parsedPayload = currentEnvironment.jsonProcessor.decode(serializedPayload); // Parse the JSON string
    if (parsedPayload[0]) { // Check if a method name is provided
      if (!parsedPayload[1]) parsedPayload[1] = []; // Ensure arguments array exists
      for (var argIndex in parsedPayload[1]) { // Iterate through arguments
        if (parsedPayload[1][argIndex]._functionReference) { // Check for function placeholders
          var functionIdentifier = parsedPayload[1][argIndex]._functionReference; // Extract function ID
          parsedPayload[1][argIndex] = function() { // Replace placeholder with a proxy function
            var proxyArguments = Array.prototype.slice.call(arguments); // Capture arguments for the proxy
            proxyArguments.unshift('_functionRef'+functionIdentifier); // Prepend the function ID
            currentInstance.invokeRemoteMethod.apply(currentInstance, proxyArguments); // Call the remote method
          };
        }
      }
      setTimeout(function() { // Schedule method execution
        if (!currentInstance.registeredMethods[parsedPayload[0]]) { // Validate method existence
          throw Error('CrossDomainMessenger: Remote method "' + parsedPayload[0] + '" is not defined.');
        }
        currentInstance.registeredMethods[parsedPayload[0]].apply(currentInstance, parsedPayload[1]); // Execute the method
      }, 0);
    }
  });
}

// Main cross-domain communication object
globalObject.crossDomainMessenger = {
  _nextInstanceId: 0, // Counter for unique instance identifiers
  auxiliaryScriptPath: 'http://example.com/js/api/xdmBridge.js', // URL for the helper script

  CommServer: function(methodImplementations, originValidator) {
    this.registeredMethods = methodImplementations || {}; // Store methods provided by the server
    this.instanceId = globalObject.crossDomainMessenger._nextInstanceId++; // Assign a unique ID
    this.originFilter = originValidator; // Function to validate message origin
    this.connectionKey = generateSessionKey(); // Generate a unique key for this connection
    this.registeredMethods['%initialize%'] = this.registeredMethods['__xdm_init'] = function() {
      globalObject.crossDomainMessenger.triggerQueue(this.instanceId); // Activate pending actions for this instance
      if (this.registeredMethods['onInitialized']) this.registeredMethods['onInitialized'](); // Call custom init handler
    };
    this.iframeIdentifier = 'XDM_IFR'+this.connectionKey; // Name for the communication iframe
    this.isServerRole = true; // Mark this instance as a server
    messageProcessors[this.connectionKey] = [processIncomingInvocation, this]; // Register handler for this key
  },
  
  CommClient: function(methodImplementations) {
    this.registeredMethods = methodImplementations || {}; // Store methods provided by the client
    this.instanceId = globalObject.crossDomainMessenger._nextInstanceId++; // Assign a unique ID
    globalObject.crossDomainMessenger.triggerQueue(this.instanceId); // Activate pending actions for this instance
    if (window.name.indexOf('XDM_IFR') === 0) { // Check if client is running in a named iframe
      this.connectionKey = window.name.substring(7); // Extract key from iframe name
    } else {
      throw Error('CrossDomainMessenger: Incorrect window.name property for client initialization.');
    }
    this.remoteCaller = window.parent; // Reference to the parent window
    messageProcessors[this.connectionKey] = [processIncomingInvocation, this]; // Register handler for this key
    this.isClientRole = true; // Mark this instance as a client
    
    globalObject.crossDomainMessenger.addEventHandler('bridgeLoaded', function() {
      globalObject.crossDomainMessenger.onClientReady(this); // Notify when the bridge script is loaded
    }, this);
    
    fetchExecutionEnvironment(function(currentEnvironment) { // Get environment details
      if (globalObject.location.toString().indexOf('example.com') !== -1) { // Example-specific condition
        currentEnvironment.dataSender(this, currentEnvironment.jsonProcessor.encode(['__xdm_init'])); // Send init message
      } else {
        currentEnvironment.dataSender(this, currentEnvironment.jsonProcessor.encode(['%initialize%'])); // Send init message
      }
      var currentMethods = this.registeredMethods; // Capture methods for the timeout scope
      setTimeout(function() {
        if (currentMethods['onInitialized']) currentMethods['onInitialized'](); // Call custom init handler
      }, 0);
    }, this);
  },
  
  handleIncomingMessage: function(messageEvent) {
    if (!messageEvent.data) return false; // Ignore messages without data
    var messageKey = messageEvent.data.substring(0, 5); // Extract the key from the message
    if (messageProcessors[messageKey]) { // Check if a handler exists for this key
      var processingInstance = messageProcessors[messageKey][1]; // Get the associated instance
      if (processingInstance && (!processingInstance.originFilter || processingInstance.originFilter(messageEvent.origin))) {
        messageProcessors[messageKey][0](messageEvent.data.substring(6), processingInstance); // Process the message payload
      }
    }
  },
  
  setJsonHandler: function(jsonParserAndStringifier) {
    executionEnvironment.jsonProcessor = jsonParserAndStringifier; // Set the JSON utility object
  },
  
  getJsonHandler: function(resultCallback) {
    if (!resultCallback) return executionEnvironment.jsonProcessor; // Return directly if no callback
    fetchExecutionEnvironment(function(currentEnvironment) {
      resultCallback(currentEnvironment.jsonProcessor); // Pass JSON handler to callback
    });
  },
  
  setCustomEnvironment: function(externalEnvironmentConfig) {
    for (var configProperty in externalEnvironmentConfig) { // Iterate over provided config properties
      executionEnvironment[configProperty] = externalEnvironmentConfig[configProperty]; // Merge into current environment
    }
    notifyEnvironmentReady(); // Mark environment as ready
  },
  
  _eventQueue: {}, // Internal storage for event queues
  
  addEventHandler: function(eventName, handlerFunction, handlerContext) {
    if (!this._eventQueue[eventName]) this._eventQueue[eventName] = []; // Initialize queue if not present
    if (this._eventQueue[eventName] === -1) { // If event has already fired
      handlerFunction.apply(handlerContext); // Execute immediately
    } else {
      this._eventQueue[eventName].push([handlerFunction, handlerContext]); // Add to queue
    }
  },
  
  triggerQueue: function(eventName) {
    if (this._eventQueue[eventName] && this._eventQueue[eventName].length > 0) { // If queue exists and has items
      for (var queueIndex = 0; queueIndex < this._eventQueue[eventName].length; queueIndex++) {
          this._eventQueue[eventName][queueIndex][0].apply(this._eventQueue[eventName][queueIndex][1]);
      }
    }
    this._eventQueue[eventName] = -1; // Mark event as fired
  },
  
  awaitProperty: awaitPropertyAvailability // Expose the utility function
};


globalObject.crossDomainMessenger.CommServer.prototype.initializeConnection = function(targetFrame, repetitionCount) {
  if (targetFrame.contentWindow) { // Check if the iframe is fully loaded and accessible
    this.remoteCaller = targetFrame.contentWindow; // Store reference to the iframe's window
    this.communicationFrame = targetFrame; // Store reference to the iframe element
    
    globalObject.crossDomainMessenger.addEventHandler('bridgeLoaded', function() {
      globalObject.crossDomainMessenger.onServerReady(this); // Notify when the bridge script is loaded
    }, this);

  } else { // Handle older browser versions (e.g., Opera)
    var currentServerInstance = this; // Capture 'this' for the timeout scope
    repetitionCount = repetitionCount || 0; // Initialize retry counter
    if (repetitionCount < 50) setTimeout(function() { // Schedule retry
      currentServerInstance.initializeConnection.apply(currentServerInstance, [targetFrame, repetitionCount + 1]);
    }, 100);
  }
};

globalObject.crossDomainMessenger.CommServer.prototype.terminateConnection = function() {
  // Remove the handler associated with this server instance
  delete messageProcessors[this.connectionKey];
};

// Utility function to merge properties from a source object into a target object
function mergeProperties(destinationObject, sourceObject) {
  for (var propertyName in sourceObject) { // Iterate over properties in the source
    if (destinationObject[propertyName] && typeof(destinationObject[propertyName]) == 'object') { // Deep merge for objects
      mergeProperties(destinationObject[propertyName], sourceObject[propertyName]);
    } else {
      destinationObject[propertyName] = sourceObject[propertyName]; // Assign or overwrite property
    }
  }
}

globalObject.crossDomainMessenger.CommServer.prototype.embedIframe = function(parentElement, iframeOptions) {
  var containerDiv = document.createElement('DIV'); // Create a temporary container
  containerDiv.innerHTML = '<iframe name="'+this.iframeIdentifier+'" />'; // Set iframe HTML with unique name
  var embeddedFrame = containerDiv.firstChild; // Get the iframe element
  var serverInstanceRef = this; // Capture 'this' for the timeout scope
  setTimeout(function() { // Defer iframe setup
    embeddedFrame.frameBorder = '0'; // Remove iframe border
    if (iframeOptions) mergeProperties(embeddedFrame, iframeOptions); // Apply custom options
    parentElement.insertBefore(embeddedFrame, parentElement.firstChild); // Insert iframe into parent
    serverInstanceRef.initializeConnection(embeddedFrame); // Initialize connection with the new iframe
  }, 0);
  return embeddedFrame; // Return the created iframe element
};

globalObject.crossDomainMessenger.CommClient.prototype.invokeRemoteMethod = globalObject.crossDomainMessenger.CommServer.prototype.invokeRemoteMethod = function() {
  var invocationArguments = Array.prototype.slice.call(arguments); // Convert arguments to a real array
  var targetMethodName = invocationArguments.shift(); // Extract the method name from the arguments
  for (var argumentIndex in invocationArguments) { // Iterate through remaining arguments
    if (typeof(invocationArguments[argumentIndex]) == 'function') { // If an argument is a function
      this.functionCallbacksCount = (this.functionCallbacksCount || 0) + 1; // Increment function counter
      var originalFunction = invocationArguments[argumentIndex]; // Store the original function
      var callbackKey = '_callback' + this.functionCallbacksCount; // Create a unique key for the callback
      this.registeredMethods[callbackKey] = function() { // Register a temporary method for the callback
        originalFunction.apply(this, arguments); // Execute the original function
        delete this.registeredMethods[callbackKey]; // Remove the temporary method after use
      };
      invocationArguments[argumentIndex] = {_functionReference: this.functionCallbacksCount}; // Replace function with a reference object
    }
  }
  awaitPropertyAvailability(this, 'remoteCaller', function() { // Wait until the remote caller is available
    globalObject.crossDomainMessenger.addEventHandler(this.instanceId, function() { // Attach a handler for this instance's event
      fetchExecutionEnvironment(function(currentEnvironment) { // Get environment details
        currentEnvironment.dataSender(this, currentEnvironment.jsonProcessor.encode([targetMethodName, invocationArguments])); // Send the method invocation
      }, this);
    }, this);
  }, this);
};

// Initialize JSON handler if native JSON object is available and works as expected
if (globalObject.JSON && typeof(globalObject.JSON) == 'object' && globalObject.JSON.parse && globalObject.JSON.stringify && globalObject.JSON.stringify({propertyA:[1,2,3]}).replace(/\s/g, '') == '{"propertyA":[1,2,3]}') {
  executionEnvironment.jsonProcessor = {decode: globalObject.JSON.parse, encode: globalObject.JSON.stringify}; // Use native JSON
} else {
  globalObject.crossDomainMessenger._requiresJsonPolyfill = true; // Flag for needing a JSON polyfill
}

// Implementation for postMessage-based communication
if (globalObject.postMessage) {
  executionEnvironment.communicationProtocol = 'pm'; // Indicate postMessage protocol
  executionEnvironment.dataSender = function(messengerInstance, serializedData) {
    // console.log("Sending message: " + messengerInstance.connectionKey + ':' + serializedData);
    messengerInstance.remoteCaller.postMessage(messengerInstance.connectionKey + ':' + serializedData, "*"); // Send message to remote window
  };
  if (globalObject.addEventListener) {
    globalObject.addEventListener("message", globalObject.crossDomainMessenger.handleIncomingMessage, false); // Register event listener
  } else {
    globalObject.attachEvent("onmessage", globalObject.crossDomainMessenger.handleIncomingMessage); // Fallback for IE
  }
  
  if (globalObject.crossDomainMessenger._requiresJsonPolyfill) {
    globalObject.crossDomainMessenger._jsonOnlyMode = true; // Flag that only JSON communication is expected
    injectScriptResource(); // Load the helper script
  } else {
    notifyEnvironmentReady(); // Mark environment as ready
  }
} else {
  injectScriptResource(); // Fallback to helper script for older browsers
}

})(window);