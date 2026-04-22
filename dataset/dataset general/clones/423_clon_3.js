'use strict';

// This core utility module, originally known as Faye, has been refactored and renamed to ChannelBus.
// It provides foundational functionalities for building real-time communication systems,
// including object manipulation, unique identifier generation, event emission,
// error handling, scheduled task management, and structured logging.
var ChannelBus = {
  // Current version of this library.
  LIB_VERSION: '0.8.9',

  // The Bayeux protocol version supported by this implementation.
  PROTOCOL_VERSION: '1.0',

  // The default number of bits used for generating unique identifiers.
  IDENTIFIER_BITS: 160,

  // The default name used for JSONP callback functions.
  JSONP_HANDLER_NAME: 'jsonp_callback_func',

  // An array listing all connection transport types that are supported.
  SUPPORTED_TRANSPORTS: [
    'long-polling',
    'cross-origin-long-polling',
    'callback-polling',
    'websocket',
    'eventsource',
    'in-process'
  ],

  // A subset of connection types that are considered mandatory for basic operation.
  REQUIRED_TRANSPORTS: ['long-polling', 'callback-polling', 'in-process'],

  // Determines the current global execution context, prioritizing `globalThis` for universal access.
  EXEC_ENVIRONMENT: typeof globalThis === 'object' ? globalThis : window,

  /**
   * Extends a target object with properties from a source object.
   * Properties are only copied if they don't already exist or if overwriting is explicitly allowed.
   * @param {object} destinationObject - The object to which properties will be added.
   * @param {object} sourceObject - The object from which properties will be copied.
   * @param {boolean} [allowOverwrite=true] - If false, existing properties in destinationObject will not be updated.
   * @returns {object} The modified destinationObject.
   */
  mergeObjects: function(destinationObject, sourceObject, allowOverwrite = true) {
    // If no source object is provided, there's nothing to merge.
    if (!sourceObject) {
      return destinationObject;
    }

    // Iterate over all enumerable properties of the source object.
    for (const propertyName in sourceObject) {
      // Ensure the property is directly owned by the source object, not inherited.
      if (Object.prototype.hasOwnProperty.call(sourceObject, propertyName)) {
        // Skip if the destination already has this property and overwriting is disallowed.
        if (Object.prototype.hasOwnProperty.call(destinationObject, propertyName) && !allowOverwrite) {
          continue;
        }
        // Only assign if the value is different to avoid unnecessary updates.
        if (destinationObject[propertyName] !== sourceObject[propertyName]) {
          destinationObject[propertyName] = sourceObject[propertyName];
        }
      }
    }
    return destinationObject;
  },

  /**
   * Generates a cryptographically-weak pseudo-random alphanumeric string.
   * The string's length is determined by the specified bit length.
   * @param {number} [bitLength=IDENTIFIER_BITS] - The target bit length for the identifier.
   * @returns {string} A new pseudo-random alphanumeric identifier.
   */
  generateRandomId: function(bitLength) {
    // Use the default identifier bit length if none is provided.
    const actualBitLength = bitLength || this.IDENTIFIER_BITS;

    // For larger bit lengths (e.g., > 32), generate multiple 32-bit chunks and concatenate.
    // This helps circumvent JavaScript's 32-bit integer limits for Math.random calculations.
    if (actualBitLength > 32) {
      const numberOfChunks = Math.ceil(actualBitLength / 32);
      let combinedString = '';
      for (let i = 0; i < numberOfChunks; i++) {
        combinedString += this.generateRandomId(32); // Recursive call for 32-bit segments.
      }
      // Introduce an additional transformation: reverse the string.
      return combinedString.split('').reverse().join('');
    }

    // For bit lengths up to 32, directly calculate and convert to base 36.
    const upperLimit = Math.pow(2, actualBitLength) - 1;
    const minimumCharLength = upperLimit.toString(36).length; // Determine required char length for base 36.
    let randomOutput = Math.floor(Math.random() * upperLimit).toString(36);

    // Pad the string with leading zeros if it's shorter than the minimum required length.
    while (randomOutput.length < minimumCharLength) {
      randomOutput = '0' + randomOutput;
    }
    return randomOutput;
  },

  /**
   * Safely extracts the client identifier from the first message in a collection.
   * @param {Array<object>} messageCollection - An array of message objects, each potentially having a `clientId`.
   * @returns {string|undefined} The `clientId` from the first message, or `undefined` if the collection is empty/invalid.
   */
  getClientIdFromPayload: function(messageCollection) {
    // Validate input: ensure it's an array and not empty.
    if (!Array.isArray(messageCollection) || messageCollection.length === 0) {
      return undefined;
    }
    // Use the spread operator to safely access the first element, ensuring array-like behavior.
    const firstPayload = [...messageCollection][0];
    return firstPayload?.clientId; // Utilize optional chaining for robust property access.
  },

  /**
   * Creates a deep copy of an object or array, ensuring no shared references with the original.
   * @param {any} sourceItem - The item (object, array, or primitive) to be cloned.
   * @returns {any} A new, deeply cloned instance of the source item.
   */
  deepClone: function(sourceItem) {
    // Handle arrays: create a new array and deep clone each element.
    if (Array.isArray(sourceItem)) {
      const clonedArray = [];
      for (let i = 0; i < sourceItem.length; i++) {
        clonedArray[i] = ChannelBus.deepClone(sourceItem[i]);
      }
      return clonedArray;
    }
    // Handle plain objects: create a new object and deep clone each property value.
    else if (typeof sourceItem === 'object' && sourceItem !== null) {
      const clonedObject = {};
      // Iterate over own enumerable properties to avoid cloning prototype chain properties.
      for (const keyName in sourceItem) {
        if (Object.prototype.hasOwnProperty.call(sourceItem, keyName)) {
          clonedObject[keyName] = ChannelBus.deepClone(sourceItem[keyName]);
        }
      }
      return clonedObject;
    }
    // For primitive types (numbers, strings, booleans, null, undefined) or functions, return as is.
    else {
      return sourceItem;
    }
  },

  /**
   * Identifies the first element that is common to both provided lists.
   * @param {Array<any>} listOne - The first array to compare.
   * @param {Array<any>} listTwo - The second array to compare against.
   * @returns {any|null} The first common element found, or `null` if no common elements exist.
   */
  findFirstCommon: function(listOne, listTwo) {
    // For efficient lookups, convert the second list into a Set.
    // Set lookups (Set.has) are generally O(1) on average, improving performance for larger lists.
    const setOfListTwo = new Set(listTwo);

    // Iterate through the first list and check for presence in the Set of the second list.
    for (const itemFromListOne of listOne) {
      if (setOfListTwo.has(itemFromListOne)) {
        return itemFromListOne; // Return the first match found.
      }
    }
    return null; // No common element was found.
  },

  /**
   * Returns the first index at which a given element can be found in an array.
   * Utilizes the native `indexOf` method if available; otherwise, provides a manual fallback.
   * @param {Array<any>} searchArray - The array to search within.
   * @param {any} targetElement - The element to locate.
   * @returns {number} The index of the first occurrence of the element, or -1 if not found.
   */
  findItemIndex: function(searchArray, targetElement) {
    // Prefer the native Array.prototype.indexOf for performance and robustness.
    if (searchArray.indexOf) {
      return searchArray.indexOf(targetElement);
    }

    // Manual fallback for environments that might not have native indexOf (e.g., very old JS engines).
    for (let currentIdx = 0; currentIdx < searchArray.length; currentIdx++) {
      if (searchArray[currentIdx] === targetElement) {
        return currentIdx;
      }
    }
    return -1; // Element not found in the array.
  },

  /**
   * Transforms elements of an array or properties of an object using a provided callback function.
   * Returns a new array containing the results of each transformation.
   * @param {Array<any>|object} sourceCollection - The array or object to iterate and transform.
   * @param {function} transformationCallback - The function to apply to each element/property.
   *   For arrays: (element, index). For objects: (key, value).
   * @param {object} [contextObject] - The `this` context for the transformationCallback.
   * @returns {Array<any>} An array of transformed results.
   */
  transformCollection: function(sourceCollection, transformationCallback, contextObject) {
    // If it's an array and `map` is available, leverage the native method.
    if (Array.isArray(sourceCollection) && typeof sourceCollection.map === 'function') {
      return sourceCollection.map(transformationCallback, contextObject);
    }

    const transformedResults = [];
    const currentContext = contextObject || null; // Default context to null if not provided.

    // Handle array iteration manually.
    if (Array.isArray(sourceCollection)) {
      for (let i = 0; i < sourceCollection.length; i++) {
        transformedResults.push(transformationCallback.call(currentContext, sourceCollection[i], i));
      }
    }
    // Handle object iteration for its own enumerable properties.
    else if (typeof sourceCollection === 'object' && sourceCollection !== null) {
      for (const propertyKey in sourceCollection) {
        if (Object.prototype.hasOwnProperty.call(sourceCollection, propertyKey)) {
          transformedResults.push(transformationCallback.call(currentContext, propertyKey, sourceCollection[propertyKey]));
        }
      }
    }
    return transformedResults;
  },

  /**
   * Filters elements from an array based on a predicate function.
   * Returns a new array containing only the elements for which the predicate returns `true`.
   * @param {Array<any>} inputArray - The array to be filtered.
   * @param {function} predicateFunction - A function that tests each element. It receives (element, index).
   * @param {object} [contextObject] - The `this` context for the predicateFunction.
   * @returns {Array<any>} A new array with elements that passed the filter.
   */
  filterArray: function(inputArray, predicateFunction, contextObject) {
    const filteredElements = [];
    const currentContext = contextObject || null;

    for (let i = 0; i < inputArray.length; i++) {
      // If the predicate function returns true, include the element in the result.
      if (predicateFunction.call(currentContext, inputArray[i], i)) {
        filteredElements.push(inputArray[i]);
      }
    }
    return filteredElements;
  },

  /**
   * Asynchronously iterates over a list, executing a provided iterator function for each item.
   * A final completion callback is invoked once all items have been processed.
   * This implementation uses a non-blocking, recursive-like approach for async flow control.
   * @param {Array<any>} itemsList - The list of items to iterate over.
   * @param {function} itemIterator - The function to call for each item. It receives (item, resumeCallback).
   * @param {function} [completionCallback] - An optional function to call after all items are processed.
   * @param {object} [contextObject] - The `this` context for all callbacks.
   */
  asyncProcessEach: function(itemsList, itemIterator, completionCallback, contextObject) {
    const totalItems = itemsList.length;
    let currentItemIndex = -1;
    let pendingIterations = 0; // Counts how many iterations are ready to be processed.
    let isProcessingLoopActive = false; // Flag to prevent multiple simultaneous processing loops.

    // `advanceIterator` processes the next available item.
    const advanceIterator = () => {
      pendingIterations--; // One iteration is now being handled.
      currentItemIndex++; // Move to the next item in the list.

      // If all items have been processed, trigger the final completion callback.
      if (currentItemIndex === totalItems) {
        completionCallback?.call(contextObject); // Use optional chaining for the callback.
        return;
      }
      // Execute the provided iterator for the current item, passing `continueProcessing` to resume.
      itemIterator(itemsList[currentItemIndex], continueProcessing);
    };

    // `runProcessingLoop` manages the execution of `advanceIterator` in a loop.
    const runProcessingLoop = () => {
      // If the loop is already active, prevent re-entry.
      if (isProcessingLoopActive) {
        return;
      }
      isProcessingLoopActive = true;
      // Continue processing items as long as there are pending iterations.
      while (pendingIterations > 0) {
        advanceIterator();
      }
      isProcessingLoopActive = false;
    };

    // `continueProcessing` is passed to the `itemIterator` to signal completion of an item's processing.
    const continueProcessing = () => {
      pendingIterations++; // Increment count, indicating readiness for next item.
      runProcessingLoop(); // Attempt to run or continue the processing loop.
    };

    // Initialize the process by signaling the first iteration is ready.
    continueProcessing();
  },

  /**
   * Converts a JavaScript value into a JSON string.
   * This function allows for a custom stringifier to be used if available,
   * otherwise it defaults to the native `JSON.stringify`.
   * @param {any} valueToSerialize - The JavaScript value to convert.
   * @returns {string} A JSON formatted string.
   */
  serializeToJSON: function(valueToSerialize) {
    // If a custom stringifier method is defined on `this` object, use it.
    // This allows for custom serialization logic, e.g., handling circular references.
    if (typeof this.customStringifier === 'function') {
      return this.customStringifier(valueToSerialize);
    }
    // Fallback to the standard JSON.stringify for general serialization.
    return JSON.stringify(valueToSerialize);
  },

  /**
   * Outputs a message to the console, if the console object and its `log` method are available.
   * This acts as a basic wrapper for console logging, preventing errors in environments without a console.
   * @param {string} messageContent - The string message to be logged.
   */
  outputToConsole: function(messageContent) {
    // Check for the existence of `console` and its `log` method before attempting to log.
    if (typeof console !== 'undefined' && typeof console.log === 'function') {
      console.log(messageContent);
    }
  },

  /**
   * Generates a timestamp string formatted as 'YYYY-MM-DD HH:MM:SS'.
   * @returns {string} The formatted timestamp string.
   */
  getFormattedTimestamp: function() {
    const currentDateTime = new Date();

    // Helper function to ensure numbers are padded with a leading zero if less than 10.
    const padWithZero = (number) => String(number).padStart(2, '0');

    const yearSegment = currentDateTime.getFullYear();
    const monthSegment = padWithZero(currentDateTime.getMonth() + 1); // getMonth() is 0-indexed.
    const daySegment = padWithZero(currentDateTime.getDate());
    const hourSegment = padWithZero(currentDateTime.getHours());
    const minuteSegment = padWithZero(currentDateTime.getMinutes());
    const secondSegment = padWithZero(currentDateTime.getSeconds());

    // Construct the final timestamp string using template literals for readability.
    return `${yearSegment}-${monthSegment}-${daySegment} ${hourSegment}:${minuteSegment}:${secondSegment}`;
  }
};

// If running in a browser environment, expose `ChannelBus` globally on the `window` object.
if (typeof window !== 'undefined') {
  window.ChannelBus = ChannelBus;
}

/**
 * A factory function that creates new inheritable JavaScript classes.
 * It supports single inheritance and an `initialize` method as a constructor.
 * @param {function} [parentConstructor=Object] - The base class constructor to inherit from. Defaults to `Object`.
 * @param {object} prototypeMethods - An object containing methods and properties to add to the new class's prototype.
 * @returns {function} The newly created class constructor.
 */
ChannelBus.BaseClass = function(parentConstructor, prototypeMethods) {
  // If the first argument is not a function, it implies it's the `prototypeMethods` and the parent is `Object`.
  if (typeof parentConstructor !== 'function') {
    prototypeMethods = parentConstructor;
    parentConstructor = Object;
  }

  // Define the constructor function for the new class.
  const NewClassConstructor = function(...constructorArgs) {
    // If an `initialize` method is defined on the instance, call it as the actual constructor.
    if (typeof this.initialize === 'function') {
      // The original design allowed `initialize` to return a different object or `undefined`.
      // If `initialize` returns `undefined`, `this` is returned; otherwise, its return value is used.
      const initializationResult = this.initialize.apply(this, constructorArgs);
      return initializationResult === undefined ? this : initializationResult;
    }
    return this; // If no `initialize` method, just return the instance.
  };

  // Create an intermediate constructor to establish the prototype chain.
  // This avoids calling the parent constructor directly when setting up inheritance.
  const PrototypeLinker = function() {};
  PrototypeLinker.prototype = parentConstructor.prototype;

  // Set the new class's prototype to an instance of the linker, inheriting from the parent.
  NewClassConstructor.prototype = new PrototypeLinker();
  // Correctly set the `constructor` property on the prototype to point back to the new class.
  NewClassConstructor.prototype.constructor = NewClassConstructor;

  // Merge the provided `prototypeMethods` into the new class's prototype.
  ChannelBus.mergeObjects(NewClassConstructor.prototype, prototypeMethods);

  return NewClassConstructor;
};

/**
 * Manages the generation, tracking, and release of unique identifiers within the system.
 * Ensures that generated IDs are unique within its active scope.
 * @class
 */
ChannelBus.IdManager = ChannelBus.BaseClass({
  /**
   * Initializes the ID manager, setting up an internal registry for currently active identifiers.
   */
  initialize: function() {
    /**
     * @private
     * @type {object<string, string>} A hash map storing currently active identifiers for quick lookup.
     */
    this._activeIdentifiers = {};
  },

  /**
   * Checks if a given identifier is currently registered as active.
   * @param {string} identifierKey - The identifier string to check.
   * @returns {boolean} `true` if the ID is active, `false` otherwise.
   */
  isActive: function(identifierKey) {
    return Object.prototype.hasOwnProperty.call(this._activeIdentifiers, identifierKey);
  },

  /**
   * Generates a new unique identifier. It repeatedly attempts to generate IDs until a unique one is found.
   * Includes a safeguard against excessive collision retries to prevent infinite loops.
   * @returns {string} A newly minted, unique identifier.
   */
  mintUniqueId: function() {
    let newIdentifier;
    let collisionAttempts = 0;
    const MAX_GENERATION_RETRIES = 100; // Maximum attempts before falling back or warning.

    do {
      newIdentifier = ChannelBus.generateRandomId();
      collisionAttempts++;
      // If too many collisions occur, it might indicate a problem with the random generator
      // or an extremely high number of active IDs.
      if (collisionAttempts > MAX_GENERATION_RETRIES) {
        ChannelBus.SystemLogger.warn("IdManager: Excessive ID collision retries detected. Generating fallback ID.");
        // Fallback to a timestamp-based ID to ensure progress, though uniqueness might be less guaranteed.
        newIdentifier = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        break; // Exit the loop, use the fallback ID.
      }
    } while (this.isActive(newIdentifier)); // Continue until a truly unique ID is generated.

    // Register the new unique ID and return it.
    return (this._activeIdentifiers[newIdentifier] = newIdentifier);
  },

  /**
   * Releases an identifier, marking it as no longer active and removing it from the registry.
   * @param {string} identifierToRelease - The identifier string to remove.
   */
  releaseIdentifier: function(identifierToRelease) {
    if (this.isActive(identifierToRelease)) {
      delete this._activeIdentifiers[identifierToRelease];
    } else {
      ChannelBus.SystemLogger.debug(`IdManager: Attempted to release unknown ID '${identifierToRelease}'.`);
    }
  }
});

/**
 * Represents a protocol-specific error, encapsulating an error code,
 * associated parameters, and a descriptive message.
 * @class
 */
ChannelBus.ProtocolError = ChannelBus.BaseClass({
  /**
   * Initializes a new ProtocolError instance.
   * @param {number|null} code - The numeric error code. Can be `null` for generic errors.
   * @param {Array<any>} parameters - An array of contextual parameters related to the error.
   * @param {string} description - A human-readable message explaining the error.
   */
  initialize: function(code, parameters, description) {
    this.errorCode = code;
    // Ensure `parameters` is always an array; convert array-like objects if necessary.
    this.errorParams = Array.isArray(parameters) ? parameters : Array.from(parameters || []);
    this.errorMessage = description;
  },

  /**
   * Returns a standardized string representation of the error, following the format:
   * "CODE:PARAM1,PARAM2,...:MESSAGE".
   * @returns {string} The formatted error string.
   */
  toString: function() {
    // Safely join parameters, handling cases where `errorParams` might be null or empty.
    const paramsString = this.errorParams?.join(',') || '';
    return `${this.errorCode}:${paramsString}:${this.errorMessage}`;
  }
});

/**
 * Static method for `ProtocolError` to parse a formatted error string back into a `ProtocolError` object.
 * @param {string} rawErrorString - The error string to parse, typically in "CODE:PARAMS:MESSAGE" format.
 * @returns {ChannelBus.ProtocolError} A new `ProtocolError` instance populated from the string.
 */
ChannelBus.ProtocolError.parseErrorString = function(rawErrorString) {
  const inputMessage = rawErrorString || '';
  // Use a validation pattern to check if the string matches the expected error format.
  // Assuming `ChannelBus.ValidationPatterns.ERROR_MESSAGE_FORMAT` is defined.
  if (!ChannelBus.ValidationPatterns?.ERROR_MESSAGE_FORMAT?.test(inputMessage)) {
    // If the format is invalid, return a generic error with the original string as the message.
    ChannelBus.SystemLogger.warn("ProtocolError.parseErrorString: Input string does not match expected format. Returning generic error.");
    return new this(null, [], inputMessage);
  }

  const parts = inputMessage.split(':');
  // Further validation: ensure there are at least three parts (code, params, message).
  if (parts.length < 3) {
    ChannelBus.SystemLogger.warn(`ProtocolError.parseErrorString: Malformed error string encountered: "${inputMessage}"`);
    return new this(null, [], inputMessage);
  }

  const parsedCode = parseInt(parts[0], 10);
  const parsedParams = parts[1].split(',');
  // Re-join the remaining parts in case the error message itself contained colons.
  const parsedMessage = parts.slice(2).join(':');

  return new this(parsedCode, parsedParams, parsedMessage);
};

// Helper function to simplify the creation of common `ProtocolError` instances.
const createFormattedProtocolError = (code, args, message) => new ChannelBus.ProtocolError(code, args, message).toString();

ChannelBus.ProtocolError.versionMismatch = function() {
  return createFormattedProtocolError(300, arguments, "Client/server protocol version mismatch");
};

ChannelBus.ProtocolError.transportTypeMismatch = function() {
  return createFormattedProtocolError(301, arguments, "Connection transport type not supported");
};

ChannelBus.ProtocolError.extensionConflict = function() {
  return createFormattedProtocolError(302, arguments, "Extension configuration conflict detected");
};

ChannelBus.ProtocolError.invalidRequest = function() {
  return createFormattedProtocolError(400, arguments, "Invalid or malformed request received");
};

ChannelBus.ProtocolError.unknownClient = function() {
  return createFormattedProtocolError(401, arguments, "Client identifier is unknown or invalid");
};

ChannelBus.ProtocolError.missingParameter = function() {
  return createFormattedProtocolError(402, arguments, "A required parameter is missing from the request");
};

ChannelBus.ProtocolError.channelAccessDenied = function() {
  return createFormattedProtocolError(403, arguments, "Access to the requested channel is forbidden");
};

ChannelBus.ProtocolError.channelNotFound = function() {
  return createFormattedProtocolError(404, arguments, "The specified channel does not exist");
};

ChannelBus.ProtocolError.channelSyntaxInvalid = function() {
  return createFormattedProtocolError(405, arguments, "Invalid channel syntax or format provided");
};

ChannelBus.ProtocolError.unknownExtension = function() {
  return createFormattedProtocolError(406, arguments, "An unrecognized extension was referenced");
};

ChannelBus.ProtocolError.publicationFailure = function() {
  return createFormattedProtocolError(407, arguments, "Failed to publish message to channel");
};

ChannelBus.ProtocolError.internalServerError = function() {
  return createFormattedProtocolError(500, arguments, "An unexpected internal server error occurred");
};

/**
 * A mixin that provides basic promise-like deferred execution capabilities,
 * allowing registration of success and failure callbacks, and timeout handling.
 * @mixin
 */
ChannelBus.PromiseLikeHandler = {
  /**
   * Registers a callback function to be executed upon successful completion of an operation.
   * If the operation has already succeeded, the callback is invoked immediately.
   * @param {function} successCallback - The function to call on success.
   * @param {object} [contextObject] - The `this` context for the callback.
   */
  onSuccess: function(successCallback, contextObject) {
    if (typeof successCallback !== 'function') {
      ChannelBus.SystemLogger.warn("PromiseLikeHandler: Attempted to register a non-function as success callback.");
      return;
    }

    // If the operation has already completed successfully, execute the callback right away.
    if (this._deferredOperationStatus === 'resolved') {
      return successCallback.apply(contextObject, this._deferredOperationArgs);
    }

    // Initialize callback storage if not present and add the new callback.
    this._successCallbacks = this._successCallbacks || [];
    this._successCallbacks.push([successCallback, contextObject]);
  },

  /**
   * Sets a timeout for the deferred operation. If the timeout expires before the operation
   * is resolved or rejected, the operation will automatically fail.
   * @param {number} durationInSeconds - The timeout period in seconds.
   * @param {string} [timeoutFailureMessage] - An optional message to associate with the timeout failure.
   */
  addOperationTimeout: function(durationInSeconds, timeoutFailureMessage) {
    // Do not set a timeout if the operation has already concluded.
    if (this._deferredOperationStatus) {
      return;
    }
    // Clear any existing timeout to prevent multiple timers from running for the same operation.
    if (this._operationTimerId) {
      ChannelBus.EXEC_ENVIRONMENT.clearTimeout(this._operationTimerId);
    }

    const selfReference = this;
    // Schedule the timeout.
    this._operationTimerId = ChannelBus.EXEC_ENVIRONMENT.setTimeout(() => {
      selfReference.setOperationStatus('rejected', timeoutFailureMessage || 'Operation timed out after specified duration');
    }, durationInSeconds * 1000); // Convert seconds to milliseconds.
  },

  /**
   * Registers a callback function to be executed if the operation fails.
   * If the operation has already failed, the callback is invoked immediately.
   * @param {function} failureCallback - The function to call on failure.
   * @param {object} [contextObject] - The `this` context for the callback.
   */
  onFailure: function(failureCallback, contextObject) {
    if (typeof failureCallback !== 'function') {
      ChannelBus.SystemLogger.warn("PromiseLikeHandler: Attempted to register a non-function as failure callback.");
      return;
    }

    // If the operation has already failed, execute the callback right away.
    if (this._deferredOperationStatus === 'rejected') {
      return failureCallback.apply(contextObject, this._deferredOperationArgs);
    }

    // Initialize errback storage if not present and add the new errback.
    this._failureCallbacks = this._failureCallbacks || [];
    this._failureCallbacks.push([failureCallback, contextObject]);
  },

  /**
   * Sets the final status of the deferred operation (resolved or rejected) and triggers
   * all relevant registered callbacks (success or failure).
   * @param {'resolved'|'rejected'} status - The new status of the operation.
   * @param {...any} argumentsForCallbacks - Arguments to be passed to the invoked callbacks.
   */
  setOperationStatus: function(status, ...argumentsForCallbacks) {
    // If the operation has already been concluded, prevent further status changes.
    if (this._deferredOperationStatus) {
      ChannelBus.SystemLogger.debug(`PromiseLikeHandler: Operation already '${this._deferredOperationStatus}', ignoring new status '${status}'.`);
      return;
    }

    // Clear any pending timeout as the operation has now concluded.
    if (this._operationTimerId) {
      ChannelBus.EXEC_ENVIRONMENT.clearTimeout(this._operationTimerId);
      delete this._operationTimerId;
    }

    this._deferredOperationStatus = status;
    this._deferredOperationArgs = argumentsForCallbacks;

    let callbacksToTrigger;
    if (status === 'resolved') {
      callbacksToTrigger = this._successCallbacks;
    } else if (status === 'rejected') {
      callbacksToTrigger = this._failureCallbacks;
    } else {
      // Log an error for invalid status input.
      ChannelBus.SystemLogger.error('PromiseLikeHandler: Attempted to set an invalid operation status:', status);
      return;
    }

    // If no callbacks are registered for the current status, simply return.
    if (!callbacksToTrigger || callbacksToTrigger.length === 0) {
      return;
    }

    // Execute all registered callbacks for the determined status, then clear them.
    let currentCallbackEntry;
    while ((currentCallbackEntry = callbacksToTrigger.shift())) {
      const [callbackFunction, callbackContext] = currentCallbackEntry;
      try {
        callbackFunction.apply(callbackContext, this._deferredOperationArgs);
      } catch (error) {
        ChannelBus.SystemLogger.error(`PromiseLikeHandler: Error executing callback for status '${status}':`, error);
      }
    }
  }
};

/**
 * A mixin that provides event emission and subscription capabilities (publish/subscribe pattern).
 * Objects including this mixin can register listeners for specific event types and trigger those events.
 * @mixin
 */
ChannelBus.EventEmitter = {
  /**
   * Returns the number of active subscribers for a specified event type.
   * @param {string} eventIdentifier - The name/identifier of the event.
   * @returns {number} The count of listeners for the event, or 0 if none.
   */
  countEventSubscribers: function(eventIdentifier) {
    const subscriberList = this._eventSubscribers?.[eventIdentifier];
    return subscriberList ? subscriberList.length : 0;
  },

  /**
   * Registers a listener function to be invoked when a specific event is published.
   * @param {string} eventIdentifier - The name of the event to subscribe to.
   * @param {function} listenerFunction - The callback function that will be executed when the event occurs.
   * @param {object} [contextObject] - The `this` context for the listenerFunction when it's called.
   */
  subscribe: function(eventIdentifier, listenerFunction, contextObject) {
    if (typeof listenerFunction !== 'function') {
      ChannelBus.SystemLogger.warn("EventEmitter: Attempted to subscribe with a non-function listener for event '%s'.", eventIdentifier);
      return;
    }
    // Initialize the main subscribers object and the list for this specific event type if they don't exist.
    this._eventSubscribers = this._eventSubscribers || {};
    const eventListenerList = this._eventSubscribers[eventIdentifier] = this._eventSubscribers[eventIdentifier] || [];
    eventListenerList.push([listenerFunction, contextObject]);
  },

  /**
   * Removes one or all listener functions for a specified event type.
   * If `listenerFunction` is not provided, all listeners for `eventIdentifier` are removed.
   * @param {string} eventIdentifier - The name of the event from which to unsubscribe.
   * @param {function} [listenerFunction] - The specific listener function to remove.
   * @param {object} [contextObject] - The `this` context that was used during subscription for the listener.
   */
  unsubscribe: function(eventIdentifier, listenerFunction, contextObject) {
    if (!this._eventSubscribers || !this._eventSubscribers[eventIdentifier]) {
      return; // No subscribers for this event, so nothing to remove.
    }

    // If no specific listener is provided, remove all listeners for this event type.
    if (!listenerFunction) {
      delete this._eventSubscribers[eventIdentifier];
      ChannelBus.SystemLogger.debug("EventEmitter: All listeners removed for event '%s'.", eventIdentifier);
      return;
    }

    const currentListeners = this._eventSubscribers[eventIdentifier];
    // Iterate backwards to safely remove elements from the array while iterating.
    for (let i = currentListeners.length - 1; i >= 0; i--) {
      const [storedListener, storedContext] = currentListeners[i];
      // Match the listener function and optionally the context object.
      if (storedListener === listenerFunction && (!contextObject || storedContext === contextObject)) {
        currentListeners.splice(i, 1); // Remove the matched listener.
      }
    }

    // If no listeners remain for this event type, clean up the empty array entry.
    if (currentListeners.length === 0) {
      delete this._eventSubscribers[eventIdentifier];
      ChannelBus.SystemLogger.debug("EventEmitter: Event '%s' has no remaining listeners, entry cleaned up.", eventIdentifier);
    }
  },

  /**
   * Publishes an event, causing all registered listeners for that event type to be invoked.
   * @param {string} eventIdentifier - The name of the event to publish.
   * @param {...any} eventArguments - Any additional arguments to pass to the listener functions.
   */
  publish: function(eventIdentifier, ...eventArguments) {
    if (!this._eventSubscribers || !this._eventSubscribers[eventIdentifier]) {
      return; // No subscribers for this event, so do nothing.
    }

    // Create a shallow copy of the listeners array. This is crucial to prevent issues
    // if listeners are added or removed during the emission process (e.g., a listener unsubscribes itself).
    const activeListeners = [...this._eventSubscribers[eventIdentifier]];

    for (const [listenerFunc, listenerContext] of activeListeners) {
      try {
        listenerFunc.apply(listenerContext, eventArguments);
      } catch (error) {
        // Log errors from individual listener functions to prevent them from
        // halting the execution of other listeners or crashing the emitter.
        ChannelBus.SystemLogger.error("EventEmitter: Error in listener for event '%s': ?", eventIdentifier, error);
      }
    }
  }
};

/**
 * A mixin for managing named, scheduled tasks (timeouts).
 * Allows adding and cancelling tasks by a unique name.
 * @mixin
 */
ChannelBus.ScheduledTasks = {
  /**
   * Schedules a callback function to be executed after a specified delay.
   * Each scheduled task must have a unique name; attempting to add a task with an existing name is ignored.
   * @param {string} taskName - A unique identifier for this scheduled task.
   * @param {number} delayInSeconds - The delay in seconds before the callback is executed. Must be non-negative.
   * @param {function} taskCallback - The function to be executed after the delay.
   * @param {object} [contextObject] - The `this` context for the taskCallback.
   */
  addScheduledTask: function(taskName, delayInSeconds, taskCallback, contextObject) {
    // Pre-validation: ensure callback is a function.
    if (typeof taskCallback !== 'function') {
      ChannelBus.SystemLogger.error(`ScheduledTasks: Cannot schedule task '${taskName}': provided callback is not a function.`);
      return;
    }
    // Pre-validation: ensure delay is non-negative. Adjust to 0 if negative.
    if (delayInSeconds < 0) {
      ChannelBus.SystemLogger.warn(`ScheduledTasks: Delay for task '${taskName}' is negative (${delayInSeconds}s). Setting to 0 seconds.`);
      delayInSeconds = 0;
    }

    this._activeTimers = this._activeTimers || {};
    // Check if a task with this name is already scheduled. If so, do not re-schedule.
    if (Object.prototype.hasOwnProperty.call(this._activeTimers, taskName)) {
      ChannelBus.SystemLogger.debug(`ScheduledTasks: Task '${taskName}' is already active. Skipping re-scheduling.`);
      return;
    }

    const selfReference = this;
    // Schedule the task using the global environment's setTimeout.
    const timerHandle = ChannelBus.EXEC_ENVIRONMENT.setTimeout(() => {
      // Once the timeout fires, remove the task from the active timers registry.
      delete selfReference._activeTimers[taskName];
      taskCallback.call(contextObject); // Execute the callback.
      ChannelBus.SystemLogger.debug(`ScheduledTasks: Task '${taskName}' executed and removed.`);
    }, delayInSeconds * 1000); // Convert seconds to milliseconds for setTimeout.

    // Store the timer handle so it can be cancelled later.
    this._activeTimers[taskName] = timerHandle;
    ChannelBus.SystemLogger.debug(`ScheduledTasks: Task '${taskName}' scheduled for ${delayInSeconds} seconds.`);
  },

  /**
   * Cancels a previously scheduled task using its unique name.
   * If the task is not found or has already completed, no action is taken.
   * @param {string} taskNameToCancel - The name of the task to cancel.
   */
  cancelScheduledTask: function(taskNameToCancel) {
    this._activeTimers = this._activeTimers || {};
    const timerHandle = this._activeTimers[taskNameToCancel];

    if (timerHandle) {
      ChannelBus.EXEC_ENVIRONMENT.clearTimeout(timerHandle); // Clear the browser/Node.js timer.
      delete this._activeTimers[taskNameToCancel]; // Remove from the internal registry.
      ChannelBus.SystemLogger.debug(`ScheduledTasks: Task '${taskNameToCancel}' successfully cancelled.`);
    } else {
      ChannelBus.SystemLogger.debug(`ScheduledTasks: Attempted to cancel task '${taskNameToCancel}', but it was not found or already completed.`);
    }
  }
};

/**
 * A mixin that provides structured logging capabilities with different severity levels.
 * Allows filtering messages based on a configurable minimum log level.
 * @mixin
 */
ChannelBus.SystemLogger = {
  // Defines the numerical value for each log severity level. Higher values indicate greater severity.
  SEVERITY_LEVELS: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    off: 99 // Special level to disable all logging.
  },

  // The currently configured minimum severity level for messages to be logged.
  // Messages with a severity lower than this level will be suppressed.
  currentSeverity: 'error',

  /**
   * The core function for logging messages. It formats the message and dispatches it
   * to the `ChannelBus.outputToConsole` function, respecting the current severity level.
   * Placeholders '?' in the message template are replaced by subsequent arguments.
   * @param {Array<any>} logArguments - An array of arguments passed to the specific log level method (e.g., `logger.info(...)`).
   * @param {string} messageSeverity - The string name of the severity level (e.g., 'debug', 'info', 'error').
   */
  logMessage: function(logArguments, messageSeverity) {
    // If the global console output function is not available, logging is disabled.
    if (typeof ChannelBus.outputToConsole !== 'function') {
      return;
    }

    const definedLevels = ChannelBus.SystemLogger.SEVERITY_LEVELS;
    const configuredLevelValue = definedLevels[ChannelBus.SystemLogger.currentSeverity];
    const messageLevelValue = definedLevels[messageSeverity];

    // Check if the message's severity meets or exceeds the configured minimum severity.
    if (messageLevelValue === undefined || messageLevelValue < configuredLevelValue) {
      return; // Suppress the message if its severity is too low.
    }

    // Convert `arguments` object to a real array for easier manipulation.
    const argsArray = Array.from(logArguments);
    let logBanner = `[${messageSeverity.toUpperCase()}] [ChannelBus`;
    let contextClassName = this.constructor?.name; // Attempt to get the class name from the constructor.

    // Append the class name to the banner if available and not a generic 'Object'.
    if (contextClassName && contextClassName !== 'Object' && contextClassName !== 'Function') {
      logBanner += `.${contextClassName}`;
    } else {
      // Fallback: If `this` is a mixin object directly attached to ChannelBus, infer its name.
      // This is a heuristic and might not be perfect for all cases.
      for (const key in ChannelBus) {
        if (Object.prototype.hasOwnProperty.call(ChannelBus, key) && typeof ChannelBus[key] === 'object' && this === ChannelBus[key]) {
          logBanner += `.${key}`;
          break;
        }
      }
    }
    logBanner += ']';

    // The first argument is expected to be the primary message template.
    let mainMessageTemplate = String(argsArray.shift() || '');
    let finalFormattedMessage = mainMessageTemplate.replace(/\?/g, () => {
      // Replace '?' placeholders with stringified versions of subsequent arguments.
      const nextArg = argsArray.shift();
      try {
        return ChannelBus.serializeToJSON(nextArg);
      } catch (e) {
        return '[Unserializable Object]'; // Fallback for objects that cannot be stringified.
      }
    });

    // Append any remaining arguments that were not used as placeholders.
    if (argsArray.length > 0) {
      finalFormattedMessage += ' ' + argsArray.map(arg => {
        try {
          return ChannelBus.serializeToJSON(arg);
        } catch (e) {
          return '[Object]';
        }
      }).join(' ');
    }

    // Combine timestamp, banner, and formatted message for the final log output.
    const fullLogOutput = `${ChannelBus.getFormattedTimestamp()} ${logBanner} ${finalFormattedMessage}`;
    ChannelBus.outputToConsole(fullLogOutput);
  }
};

// Dynamically generate convenience methods (e.g., `debug()`, `info()`, `warn()`, `error()`)
// for each defined severity level, allowing for cleaner logging calls.
(() => {
  for (const levelName in ChannelBus.SystemLogger.SEVERITY_LEVELS) {
    if (Object.prototype.hasOwnProperty.call(ChannelBus.SystemLogger.SEVERITY_LEVELS, levelName) && levelName !== 'off') {
      // Create a method for each level (e.g., `SystemLogger.debug = function(...)`)
      ChannelBus.SystemLogger[levelName] = function(...methodArgs) {
        // Call the core `logMessage` function, passing the arguments and the specific level.
        this.logMessage(methodArgs, levelName);
      };
    }
  }
})();

/**
 * Defines a collection of regular expressions used for validating various
 * components and formats within the Bayeux protocol and related data structures.
 * @namespace
 */
ChannelBus.ValidationPatterns = {
  // Matches a single lowercase alphabetic character.
  LOWERCASE_ALPHA: /^[a-z]$/,

  // Matches a single uppercase alphabetic character.
  UPPERCASE_ALPHA: /^[A-Z]$/,

  // Matches any single alphabetic character (case-insensitive).
  ANY_ALPHA: /^[a-zA-Z]$/,

  // Matches a single decimal digit (0-9).
  SINGLE_DIGIT: /^[0-9]$/,

  // Matches any single alphanumeric character (letter or digit).
  ALPHA_NUMERIC: /^[a-zA-Z0-9]$/,

  // Matches specific allowed special characters used in identifiers or tokens.
  PERMITTED_MARKS: /^[\-_\!~()$@]$/,

  // Matches a general text string, including alphanumeric, permitted marks, space, forward slash, asterisk, and dot.
  GENERAL_TEXT_STRING: /^(([a-zA-Z0-9\-_!~()$@ ])|[\/\*\.])+$/,

  // Matches a protocol token, consisting of one or more alphanumeric characters or permitted marks.
  PROTOCOL_TOKEN: /^[a-zA-Z0-9\-_!~()$@]+$/,

  // Matches a string representing a positive integer (one or more digits).
  NUMERIC_INTEGER: /^[0-9]+$/,

  // Matches a single segment of a channel path, similar to a protocol token.
  CHANNEL_PATH_SEGMENT: /^[a-zA-Z0-9\-_!~()$@]+$/,

  // Matches multiple channel path segments, separated by forward slashes.
  // E.g., "foo/bar" or "segment-one/segment_two". Does not start with a slash.
  CHANNEL_PATH_SEGMENTS: /^[a-zA-Z0-9\-_!~()$@]+(\/[a-zA-Z0-9\-_!~()$@]+)*$/,

  // Matches a complete channel name, which must start with a forward slash and contain segments.
  // E.g., "/meta/connect" or "/service/chat".
  FULL_CHANNEL_NAME: /^\/[a-zA-Z0-9\-_!~()$@]+(\/[a-zA-Z0-9\-_!~()$@]+)*$/,

  // Matches Bayeux channel wildcards: '*' for a single segment, '**' for multiple segments.
  CHANNEL_WILDCARD: /^\*{1,2}$/,

  // Matches a channel subscription pattern, which can include segments followed by a wildcard.
  // E.g., "/service/*" or "/system/**".
  CHANNEL_SUBSCRIPTION_PATTERN: /^(\/[a-zA-Z0-9\-_!~()$@]+)*\/\*{1,2}$/,

  // Matches a single element within a version string (e.g., "alpha", "1", "beta-1").
  VERSION_PART_ELEMENT: /^[a-zA-Z0-9][a-zA-Z0-9\-_]*$/,

  // Matches a full semantic version string, typically "MAJOR.MINOR.PATCH" with optional pre-release/build metadata.
  // E.g., "1.0.0", "0.8.9-beta", "2.1.0_rc1".
  SEMANTIC_VERSION: /^[0-9]+(\.[a-zA-Z0-9][a-zA-Z0-9\-_]*)*$/,

  // Matches a client identifier, typically composed of alphanumeric characters.
  CLIENT_ID_FORMAT: /^[a-zA-Z0-9]+$/,

  // Matches a generic identifier, similar to client IDs, for general-purpose use.
  GENERIC_ID_FORMAT: /^[a-zA-Z0-9]+$/,

  // Added: Matches the expected format for error messages: "CODE:PARAMS:MESSAGE".
  // This helps in parsing error strings consistently.
  ERROR_MESSAGE_FORMAT: /^([0-9]+):([^:]*):(.+)$/
};